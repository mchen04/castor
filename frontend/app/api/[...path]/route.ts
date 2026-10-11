import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { profileSchema, updateInput, workspaceSchema, intents, Intent, url } from '@/lib/model';
import { AppError, mutateWorkspace, readWorkspace, requireItem } from '@/lib/store';
import { capturePublicPage } from '@/lib/capture';
import { brief, renderCapture, renderPage, structuredData } from '@/lib/templates';
import { chat, difyAvailable, difyUser } from '@/lib/assistant';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const textResponse=(text:string,type:string,name?:string)=>new Response(text,{headers:{'Content-Type':type,'Cache-Control':'no-store',...(name?{'Content-Disposition':`attachment; filename="${name}"`}:{}),...(type.startsWith('text/html')?{'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; sandbox allow-popups allow-popups-to-escape-sandbox",'X-Content-Type-Options':'nosniff'}:{})}});
async function body(request:Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new AppError('Send application/json.',415);
  const reader=request.body?.getReader(); if(!reader) throw new AppError('Request body required.');
  const chunks:Uint8Array[]=[]; let size=0;
  while(true) { const {value,done}=await reader.read(); if(done) break; size+=value.length; if(size>16*1024*1024) { await reader.cancel(); throw new AppError('Request exceeds 16 MiB.',413); } chunks.push(value); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new AppError('Invalid JSON.'); }
}
async function route(request:Request,{params}:{params:Promise<{path:string[]}>}) {
  try {
    const {path}=await params; const route=path.join('/'); const method=request.method;
    const w=await readWorkspace();
    if(method==='GET') {
      if(route==='health') return reply({ok:true,app:'castor-local',version:1,revision:w.revision,dify:difyAvailable(),google:'inactive'});
      if(route==='workspace') return reply({workspace:w,dify:difyAvailable()});
      if(route==='export/workspace') return textResponse(JSON.stringify(w,null,2),'application/json','castor-workspace.json');
      if(route==='export/schema') return textResponse(JSON.stringify(structuredData(w),null,2),'application/ld+json','business-schema.json');
      if(route==='brief' || route==='export/brief') return textResponse(brief(w),'text/plain; charset=utf-8',route.startsWith('export')?'castor-brief.txt':undefined);
      if(path[0]==='pages' && path[1] in intents) {
        if(!w.profile.name.trim()) throw new AppError('Save a business name before rendering reference pages.',422);
        return textResponse(renderPage(w,path[1] as Intent),'text/html; charset=utf-8',new URL(request.url).searchParams.has('download')?`castor-${path[1]}.html`:undefined);
      }
      if(path[0]==='sources' && path[1]) { const c=requireItem(w.captures,path[1]); return textResponse(renderCapture(c),'text/html; charset=utf-8',new URL(request.url).searchParams.has('download')?'captured-reference.html':undefined); }
      throw new AppError('Endpoint not found.',404);
    }
    const data=await body(request);
    if(method==='PUT' && route==='profile') {
      const parsed=z.object({revision:z.number().int(),profile:profileSchema}).strict().parse(data);
      return reply({workspace:await mutateWorkspace(w=>{w.profile=parsed.profile;},parsed.revision)});
    }
    if(route==='updates' && method==='POST') {
      const parsed=z.object({revision:z.number().int(),update:updateInput}).strict().parse(data);
      return reply({workspace:await mutateWorkspace(w=>{w.updates.unshift({...parsed.update,id:randomUUID(),createdAt:new Date().toISOString()});},parsed.revision)});
    }
    if(path[0]==='updates' && path[1] && ['PUT','DELETE'].includes(method)) {
      const revision=z.number().int().parse(data.revision);
      const update=method==='PUT'?updateInput.parse(data.update):null;
      return reply({workspace:await mutateWorkspace(w=>{const item=requireItem(w.updates,path[1]); if(update) Object.assign(item,update); else w.updates=w.updates.filter(u=>u.id!==item.id);},revision)});
    }
    if(route==='capture' && method==='POST') {
      const sourceUrl=new URL(url.parse(data.url));sourceUrl.hash='';const source=sourceUrl.href;
      let capture;
      try { capture=await capturePublicPage(source); }
      catch(e) {
        const message=e instanceof AppError?e.message:'Public fetch failed (DNS, connection, TLS or timeout).';
        await mutateWorkspace(w=>{w.attempts.unshift({url:source,at:new Date().toISOString(),ok:false,message});w.attempts=w.attempts.slice(0,20);});
        throw new AppError(message,e instanceof AppError?e.status:422);
      }
      let message='Captured. Review before approving.';
      const workspace=await mutateWorkspace(w=>{
        const previous=w.captures.find(c=>c.sourceUrl===source && ['pending','approved'].includes(c.status));
        if(previous?.sha256===capture.sha256) message=`Source unchanged; ${previous.status} version retained.`;
        else { if(w.captures.length>=100) throw new AppError('Capture history is full. Export a backup and remove old versions.'); w.captures.unshift(capture); }
        w.attempts.unshift({url:source,at:capture.fetchedAt,ok:true,message});w.attempts=w.attempts.slice(0,20);
      });
      return reply({workspace,message,captureReceipt:{sourceUrl:capture.sourceUrl,finalUrl:capture.finalUrl,statusCode:capture.statusCode,bytes:capture.bytes,sha256:capture.sha256,fetchedAt:capture.fetchedAt}});
    }
    if(path[0]==='decisions' && path[1] && method==='POST') {
      const action=z.enum(['approve','reject']).parse(data.action); const revision=z.number().int().parse(data.revision);
      return reply({workspace:await mutateWorkspace(w=>{
        const c=requireItem(w.captures,path[1]); if(c.status!=='pending') throw new AppError('This capture has already been reviewed.',409);
        if(action==='approve') for(const prior of w.captures) if(prior.sourceUrl===c.sourceUrl && prior.status==='approved') prior.status='superseded';
        c.status=action==='approve'?'approved':'rejected';c.decidedAt=new Date().toISOString();
      },revision)});
    }
    if(path[0]==='sources' && path[1] && method==='DELETE') {
      return reply({workspace:await mutateWorkspace(w=>{requireItem(w.captures,path[1]);w.captures=w.captures.filter(c=>c.id!==path[1]);},z.number().int().parse(data.revision))});
    }
    if(route==='restore' && method==='POST') {
      const restored=workspaceSchema.parse(data.workspace);
      // The UI makes the user download their current backup before restore.
      return reply({workspace:await mutateWorkspace(w=>{w.profile=restored.profile;w.updates=restored.updates;w.captures=restored.captures;w.attempts=restored.attempts;w.conversations=restored.conversations;},z.number().int().parse(data.revision))});
    }
    if(route==='conversations' && method==='POST') return reply({workspace:await mutateWorkspace(w=>{w.conversations.unshift({id:randomUUID(),name:'New conversation',messages:[]});},z.number().int().parse(data.revision))});
    if(path[0]==='conversations' && path[1] && ['PUT','DELETE'].includes(method)) return reply({workspace:await mutateWorkspace(w=>{
      const c=requireItem(w.conversations,path[1]); if(method==='PUT') c.name=z.string().trim().min(1).max(500).parse(data.name); else w.conversations=w.conversations.filter(c=>c.id!==path[1]);
    },z.number().int().parse(data.revision))});
    if(route==='chat' && method==='POST') return await chat(z.string().uuid().parse(data.id),z.string().trim().min(1).max(10000).parse(data.question),request.signal);
    if(route==='stop' && method==='POST') {
      if(!difyAvailable()) throw new AppError('Dify is unavailable.',503);
      const task=z.string().uuid().parse(data.taskId);
      const response=await fetch(`https://api.dify.ai/v1/chat-messages/${task}/stop`,{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.DIFY_API_KEY}`},body:JSON.stringify({user:difyUser})});
      if(!response.ok) throw new AppError(`Dify stop returned HTTP ${response.status}.`,502);
      return reply({ok:true});
    }
    if(path[0]==='google-business') throw new AppError('Google integration is inactive. Legacy OAuth connects accounts only; GBP management was not implemented. No Google requests are made.',501);
    throw new AppError('Endpoint not found.',404);
  } catch(e) {
    if(e instanceof z.ZodError) return reply({error:'Invalid input: '+e.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')},400);
    if(e instanceof AppError) return reply({error:e.message},e.status);
    return reply({error:'Operation failed. No successful result is being claimed.'},500);
  }
}
export {route as GET,route as POST,route as PUT,route as DELETE};
