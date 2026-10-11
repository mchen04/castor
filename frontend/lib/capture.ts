import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { createHash, randomUUID } from 'node:crypto';
import { Agent, fetch as publicFetch } from 'undici';
import { load } from 'cheerio';
import { Capture, url } from './model';
import { AppError } from './store';
export function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a,b] = address.split('.').map(Number);
    return !([0,10,127].includes(a) || a >= 224 || (a===169 && b===254) || (a===172 && b>=16 && b<=31) || (a===192 && [0,168].includes(b)) || (a===100 && b>=64 && b<=127) || (a===198 && [18,19,51].includes(b)) || (a===203 && b===0));
  }
  // Global IPv6 unicast only; block documentation range and mapped/transition addresses.
  return isIP(address)===6 && /^[23][0-9a-f]{3}:/i.test(address) && !/^(2001:(db8|0):|2002:)/i.test(address);
}
export async function publicTarget(value: string) {
  const target = new URL(url.parse(value));
  target.hash='';
  if (target.port && !['80','443'].includes(target.port)) throw new AppError('Public capture supports ports 80 and 443 only.');
  const hostname = target.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(hostname) ? [{ address: hostname, family: isIP(hostname) }] : await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(a => !isPublicAddress(a.address))) throw new AppError('Capture requires a public site. Private, loopback and reserved addresses are blocked.');
  return { target, addresses };
}
// Adapted title/headings and version capture concepts from site-mirror-ai c6d97871.
// Static public HTTP fetch replaces rrweb/cloud capture; no recorder, scripts, cookies or customer writes.
export function extractPage(html: string, finalUrl: string) {
  const $ = load(html); const schemas: unknown[] = [];
  $('script[type="application/ld+json"]').slice(0,20).each((_, el) => { try { schemas.push(JSON.parse($(el).text())); } catch { /* Source malformed JSON-LD is excluded. */ } });
  const title = ($('title').first().text() || $('h1').first().text()).trim().slice(0,500);
  const description = ($('meta[name="description"]').attr('content') || '').slice(0,10000);
  $('script,style,noscript,iframe,form,svg,template').remove();
  const headings = $('h1,h2,h3').slice(0,100).map((_,el)=>$(el).text().replace(/\s+/g,' ').trim().slice(0,500)).get();
  const links: string[] = [];
  $('a[href]').each((_, el) => { try { const u = new URL($(el).attr('href')!,finalUrl); if (['http:','https:'].includes(u.protocol) && !u.username && !u.password && !links.includes(u.href) && links.length<100) links.push(u.href); } catch {} });
  $('p,div,section,article,li,h1,h2,h3,br,header,footer').append('\n');
  const text = $('body').text().replace(/[^\S\n]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim().slice(0,100000);
  if (!text) throw new AppError('No readable static text found. Script-rendered or protected pages are unsupported.',422);
  return { title, description, text, headings, links, schemas };
}
export async function capturePublicPage(value: string): Promise<Capture> {
  let nextUrl=value;
  const signal=AbortSignal.timeout(20000);
  for (let redirects=0; redirects<=5; redirects++) {
    const { target, addresses }=await publicTarget(nextUrl);
    const dispatcher = new Agent({ connect: { lookup: (_hostname, options, callback) => {
      const all=(options as { all?: boolean }).all;
      if (all) callback(null,addresses as never); else callback(null,addresses[0].address,addresses[0].family);
    } } });
    try {
      const response = await publicFetch(target, { dispatcher, redirect:'manual', signal, headers: { 'User-Agent': 'CastorLocal/0.2 (manual public reference capture)', Accept:'text/html,application/xhtml+xml' } });
      if ([301,302,303,307,308].includes(response.status)) {
        const location=response.headers.get('location'); await response.body?.cancel();
        if (!location) throw new AppError('Source redirect has no location.',422);
        nextUrl=new URL(location,target).href; continue;
      }
      if (!response.ok) { await response.body?.cancel(); throw new AppError(`Public source returned HTTP ${response.status}.`,422); }
      const contentType=response.headers.get('content-type') || '';
      if (!/^(text\/html|application\/xhtml\+xml)\b/i.test(contentType)) { await response.body?.cancel(); throw new AppError('Only public HTML pages are supported.',422); }
      const chunks: Uint8Array[]=[]; let bytes=0;
      for await (const chunk of response.body!) { bytes+=chunk.length; if (bytes>2*1024*1024) { await response.body?.cancel().catch(()=>{}); throw new AppError('Source exceeds the 2 MiB capture limit.',422); } chunks.push(chunk); }
      const buffer=Buffer.concat(chunks); const parsed=extractPage(buffer.toString('utf8'),target.href);
      return { id:randomUUID(),sourceUrl:value,finalUrl:target.href,fetchedAt:new Date().toISOString(),statusCode:response.status,contentType,bytes,sha256:createHash('sha256').update(buffer).digest('hex'),...parsed,status:'pending' };
    } finally { await dispatcher.close(); }
  }
  throw new AppError('Public source exceeded five redirects.',422);
}
