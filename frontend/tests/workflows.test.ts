import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { freshWorkspace, workspaceSchema } from '../lib/model';
import { mutateWorkspace, readWorkspace } from '../lib/store';
import { activeUpdates, brief, renderPage, structuredData } from '../lib/templates';
import { extractPage, isPublicAddress, publicTarget } from '../lib/capture';
import { sseEvents } from '../lib/stream';
// Isolated storage; no fixture is presented as a public capture.
test('local persistence serializes writes, rejects stale revisions, survives reload and preserves corrupt files',async()=>{
  process.env.CASTOR_DATA_DIR=await mkdtemp(path.join(tmpdir(),'castor-unit-'));
  assert.equal((await readWorkspace()).revision,0);
  await mutateWorkspace(w=>{w.profile.name='Persisted';},0);
  await Promise.all([mutateWorkspace(w=>{w.profile.city='Seattle';}),mutateWorkspace(w=>{w.profile.phone='555-0100';})]);
  const w=await readWorkspace();assert.equal(w.revision,3);assert.equal(w.profile.city,'Seattle');assert.equal(w.profile.phone,'555-0100');
  await assert.rejects(mutateWorkspace(w=>{w.profile.name='Lost';},0),/another tab/);
  assert.equal((await readWorkspace()).profile.name,'Persisted');
  const filename=path.join(process.env.CASTOR_DATA_DIR,'workspace.json');await writeFile(filename,'corrupt');
  await assert.rejects(readWorkspace(),/not been overwritten/);await assert.rejects(mutateWorkspace(()=>{}),/not been overwritten/);
  assert.equal(await readFile(filename,'utf8'),'corrupt');
});
test('reference exports escape supplied text/JSON-LD and omit expired updates or unapproved sources',()=>{
  const w=freshWorkspace();w.profile.name='A </script><img src=x onerror=alert(1)>';w.profile.description='<script>bad()</script>';
  w.profile.faqs=[{question:'Hours?',answer:'<b>Supplied</b>'}];
  for(const expiresAt of ['2000-01-01T00:00:00.000Z',''])w.updates.push({id:randomUUID(),title:expiresAt?'Expired update':'Current update',content:'Facts',category:'general',expiresAt,terms:'',specialHours:'',createdAt:new Date().toISOString()});
  const capture={id:randomUUID(),sourceUrl:'https://example.com/',finalUrl:'https://example.com/',fetchedAt:new Date().toISOString(),statusCode:200,contentType:'text/html',bytes:12,sha256:'a'.repeat(64),title:'Unapproved marker',description:'',text:'UNAPPROVED CONTENT',headings:[],links:[],schemas:[],status:'pending' as const};
  w.captures.push(capture);assert.equal(activeUpdates(w).length,1);assert.ok(!brief(w).includes('UNAPPROVED CONTENT'));
  const html=renderPage(w,'business');assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('\\u003c'));assert.ok(!html.includes('Expired update'));assert.ok(!html.includes('Unapproved marker'));
  w.captures[0].status='approved';assert.ok(brief(w).includes('UNAPPROVED CONTENT'));assert.ok(renderPage(w,'business').includes('Unapproved marker'));
  assert.equal(structuredData(w)['@graph'][0]['@type'],'LocalBusiness');
});
test('public parser removes scripts/forms and extracts actual headings, links and valid JSON-LD',()=>{
  const p=extractPage('<html><head><title>Fixture</title><script type="application/ld+json">{"@type":"Thing"}</script></head><body><h1>Real heading</h1><p>Fixture text &amp; facts</p><form>PRIVATE INPUT</form><script>BAD SCRIPT</script><a href="/about">About</a><a href="javascript:alert(1)">Unsafe</a></body></html>','https://example.com/');
  assert.equal(p.title,'Fixture');assert.ok(!p.text.includes('PRIVATE INPUT'));assert.ok(!p.text.includes('BAD SCRIPT'));assert.deepEqual(p.links,['https://example.com/about']);assert.deepEqual(p.headings,['Real heading']);assert.equal(p.schemas.length,1);
  assert.throws(()=>extractPage('<body><script>Only scripts</script></body>','https://example.com/'),/No readable/);
});
test('capture blocks private/reserved destinations, embedded credentials and unsafe ports',async()=>{
  for(const ip of ['127.0.0.1','10.1.2.3','169.254.169.254','172.18.1.1','192.168.0.1','100.64.0.1','::1','::ffff:127.0.0.1','2001:db8::1'])assert.equal(isPublicAddress(ip),false,ip);
  assert.equal(isPublicAddress('93.184.215.14'),true);
  await assert.rejects(publicTarget('http://127.0.0.1/'),/public site/);
  await assert.rejects(publicTarget('http://example.com:3210/'),/ports/);
  await assert.rejects(publicTarget('https://user:pass@example.com/'));
});
test('backup rejects unknown/sensitive fields and stream parser handles chunked UTF-8 events',async()=>{
  assert.equal(workspaceSchema.safeParse({...freshWorkspace(),apiKey:'private'}).success,false);
  const bytes=new TextEncoder().encode('data: {"event":"message","answer":"Café"}\r\n\r\ndata: {"event":"message_end"}\n\n');
  const stream=new ReadableStream<Uint8Array>({start(c){for(let i=0;i<bytes.length;i+=3)c.enqueue(bytes.slice(i,i+3));c.close();}});
  const events=[];for await(const e of sseEvents(stream))events.push(e);
  assert.equal(events[0].answer,'Café');assert.equal(events[1].event,'message_end');
});
