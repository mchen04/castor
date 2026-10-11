import { z } from 'zod';
const text = z.string().max(10000);
const short = z.string().max(500);
export const url = z.string().max(2048).refine(v => {
  try { const u = new URL(v); return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
}, 'Enter an HTTP(S) URL without credentials.');
export const profileSchema = z.object({
  name: short, description: text, category: short, website: z.union([z.literal(''), url]), phone: short,
  address: short, city: short, region: short, postalCode: short, country: short, hours: short,
  services: text, specialties: text, serviceArea: short, parking: short, pricing: short,
  paymentMethods: short, languages: short, accessibility: short, establishedYear: short,
  socialLinks: z.array(url).max(20), faqs: z.array(z.object({ question: short.min(1), answer: text.min(1) })).max(50),
}).strict();
export type Profile = z.infer<typeof profileSchema>;
export const emptyProfile: Profile = { name: '', description: '', category: '', website: '', phone: '', address: '', city: '', region: '', postalCode: '', country: '', hours: '', services: '', specialties: '', serviceArea: '', parking: '', pricing: '', paymentMethods: '', languages: '', accessibility: '', establishedYear: '', socialLinks: [], faqs: [] };
export const updateInput = z.object({ title: short.min(1), content: text.min(1), category: z.enum(['general', 'offer', 'event', 'hours']), expiresAt: z.union([z.literal(''), z.string().datetime()]), specialHours: short, terms: text }).strict();
export const updateSchema = updateInput.extend({ id: z.string().uuid(), createdAt: z.string().datetime() });
export type Update = z.infer<typeof updateSchema>;
export const captureSchema = z.object({
  id: z.string().uuid(), sourceUrl: url, finalUrl: url, fetchedAt: z.string().datetime(), statusCode: z.number().int(),
  contentType: short, bytes: z.number().int().nonnegative(), sha256: z.string().length(64), title: short,
  description: text, text: z.string().max(100000), headings: z.array(short).max(100),
  links: z.array(url).max(100), schemas: z.array(z.unknown()).max(20),
  status: z.enum(['pending', 'approved', 'rejected', 'superseded']), decidedAt: z.string().datetime().optional(),
}).strict();
export type Capture = z.infer<typeof captureSchema>;
export const attemptSchema = z.object({ url: short, at: z.string().datetime(), ok: z.boolean(), message: short }).strict();
export const conversationSchema = z.object({
  id: z.string().uuid(), name: short.min(1), providerId: short.optional(),
  messages: z.array(z.object({ id: z.string().uuid(), question: text, answer: z.string().max(100000), at: z.string().datetime(), status: z.enum(['complete', 'interrupted', 'error']) }).strict()).max(100),
}).strict();
export type Conversation = z.infer<typeof conversationSchema>;
export const workspaceSchema = z.object({
  version: z.literal(1), revision: z.number().int().nonnegative(), updatedAt: z.string().datetime(),
  profile: profileSchema, updates: z.array(updateSchema).max(500), captures: z.array(captureSchema).max(100),
  attempts: z.array(attemptSchema).max(20), conversations: z.array(conversationSchema).max(100),
}).strict();
export type Workspace = z.infer<typeof workspaceSchema>;
export function freshWorkspace(): Workspace { return { version: 1, revision: 0, updatedAt: new Date().toISOString(), profile: structuredClone(emptyProfile), updates: [], captures: [], attempts: [], conversations: [] }; }
export const intents = { business: 'Business profile', direct: 'Latest updates', local: 'Location & contact', category: 'Services', 'branded-local': 'Questions & answers' } as const;
export type Intent = keyof typeof intents;
