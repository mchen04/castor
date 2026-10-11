// Adapted from LocRaven base-template.ts (contact/details/FAQ), schema-generators.ts
// and intent-templates.ts. Source 366e35b6; see docs/CAPABILITIES.md.
import { Capture, Intent, intents, Workspace } from './model';
export const escapeHtml = (v: string) => v.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const jsonScript = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const lines = (s: string) => s.split(/\n|,/).map(s => s.trim()).filter(Boolean);
const paragraph = (label: string, v: string) => v ? `<p><strong>${label}:</strong> ${escapeHtml(v)}</p>` : '';
export function activeUpdates(w: Workspace, now = Date.now()) { return w.updates.filter(u => !u.expiresAt || Date.parse(u.expiresAt) > now); }
export function approvedSources(w: Workspace) { return w.captures.filter(c => c.status === 'approved'); }
export function structuredData(w: Workspace) {
  const p = w.profile;
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'LocalBusiness', name: p.name, ...(p.description && { description: p.description }), ...(p.website && { url: p.website }), ...(p.phone && { telephone: p.phone }),
      ...([p.address, p.city, p.region, p.postalCode, p.country].some(Boolean) && { address: { '@type': 'PostalAddress', streetAddress: p.address, addressLocality: p.city, addressRegion: p.region, postalCode: p.postalCode, addressCountry: p.country } }),
      ...(p.serviceArea && { areaServed: p.serviceArea }), ...(p.pricing && { priceRange: p.pricing }),
      ...(p.paymentMethods && { paymentAccepted: p.paymentMethods }), ...(p.languages && { knowsLanguage: lines(p.languages) }),
      ...(p.services && { hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Services', itemListElement: lines(p.services).map(name => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })) } }),
      ...(p.socialLinks.length && { sameAs: p.socialLinks }),
    },
    ...(p.faqs.length ? [{ '@type': 'FAQPage', mainEntity: p.faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }] : []),
  ] };
}
const pageStyle = 'body{font:16px/1.6 system-ui;color:#25333a;max-width:820px;margin:32px auto;padding:0 20px}h1{line-height:1.2}h2{font-size:1.2em;border-bottom:1px solid #ccd6d9;padding-bottom:6px}p{white-space:pre-wrap;overflow-wrap:anywhere}a{color:#116657}aside{color:#56656b;font-size:.9em}article{margin:20px 0}';
function shell(title: string, content: string, schema?: unknown) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>${pageStyle}</style>${schema ? `<script type="application/ld+json">${jsonScript(schema)}</script>` : ''}</head><body>${content}</body></html>`;
}
export function renderPage(w: Workspace, intent: Intent) {
  const p = w.profile; const title = `${p.name} · ${intents[intent]}`;
  const contact = `<section><h2>Location & contact</h2>${paragraph('Address', [p.address, p.city, p.region, p.postalCode, p.country].filter(Boolean).join(', '))}${paragraph('Phone', p.phone)}${p.website ? `<p><a href="${escapeHtml(p.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.website)}</a></p>` : ''}${paragraph('Hours as supplied', p.hours)}${paragraph('Special hours', activeUpdates(w).filter(u => u.specialHours).map(u => u.specialHours).join('\n'))}</section>`;
  const details = `<section><h2>Services & details</h2>${[['Category',p.category],['Services',p.services],['Specialties',p.specialties],['Service area',p.serviceArea],['Pricing',p.pricing],['Payment methods',p.paymentMethods],['Languages',p.languages],['Accessibility',p.accessibility],['Parking',p.parking],['Established',p.establishedYear]].map(([a,b]) => paragraph(a,b)).join('')}${p.socialLinks.map(s=>`<p><a href="${escapeHtml(s)}">${escapeHtml(s)}</a></p>`).join('')}</section>`;
  const faqs = `<section><h2>Questions & answers</h2>${p.faqs.length ? p.faqs.map(f => `<article><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></article>`).join('') : '<p>No answers supplied.</p>'}</section>`;
  const updates = `<section><h2>Current updates</h2>${activeUpdates(w).length ? activeUpdates(w).map(u => `<article><h3>${escapeHtml(u.title)}</h3><p>${escapeHtml(u.content)}</p>${paragraph('Terms',u.terms)}${paragraph('Special hours',u.specialHours)}<aside>Added ${escapeHtml(u.createdAt)}${u.expiresAt ? ` · Expires ${escapeHtml(u.expiresAt)}` : ''}</aside></article>`).join('') : '<p>No current updates.</p>'}</section>`;
  const sources = `<section><h2>Approved public references</h2>${approvedSources(w).map(c => `<p><a href="${escapeHtml(c.finalUrl)}">${escapeHtml(c.title || c.finalUrl)}</a><br><small>Captured ${escapeHtml(c.fetchedAt)} · SHA-256 ${c.sha256}</small></p>`).join('') || '<p>No approved sources.</p>'}</section>`;
  const sections = { business: [contact, details, faqs, updates, sources], direct: [updates, contact, sources], local: [contact, details, sources], category: [details, contact, updates], 'branded-local': [faqs, contact, sources] };
  return shell(title, `<aside>Castor · Deterministic reference page · Supplied business facts</aside><h1>${escapeHtml(title)}</h1><p>${escapeHtml(p.description)}</p>${sections[intent].join('')}`, structuredData(w));
}
export function renderCapture(c: Capture) {
  return shell(c.title || c.finalUrl, `<aside>Extracted public source · ${escapeHtml(c.status)} · Scripts and remote assets excluded</aside><h1>${escapeHtml(c.title || 'Untitled source')}</h1><p><a href="${escapeHtml(c.finalUrl)}">${escapeHtml(c.finalUrl)}</a></p><p>${escapeHtml(c.description)}</p><p>${escapeHtml(c.text)}</p><h2>Captured JSON-LD (unverified source claims)</h2><pre style="white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(JSON.stringify(c.schemas, null, 2))}</pre>`);
}
export function brief(w: Workspace) {
  const p=w.profile;
  return `CASTOR WORKSPACE BRIEF — deterministic facts, not AI advice\nBusiness: ${p.name || '(not supplied)'}\nDescription: ${p.description}\n${Object.entries(p).filter(([k,v]) => !['name','description','faqs','socialLinks'].includes(k) && v).map(([k,v])=>`${k}: ${v}`).join('\n')}\nFAQs:\n${p.faqs.map(f=>`Q: ${f.question}\nA: ${f.answer}`).join('\n')}\nCurrent updates:\n${activeUpdates(w).map(u=>`${u.title}: ${u.content}${u.terms ? '\nTerms: '+u.terms : ''}${u.specialHours ? '\nSpecial hours: '+u.specialHours : ''}`).join('\n')}\nApproved public sources (unverified source claims):\n${approvedSources(w).map(c=>`${c.title || c.finalUrl}\n${c.finalUrl} (${c.fetchedAt})\n${c.text}`).join('\n\n')}`;
}
