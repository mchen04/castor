import { mkdir, readFile, rename, open, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { freshWorkspace, workspaceSchema, Workspace } from './model';
export class AppError extends Error { constructor(message: string, public status = 400) { super(message); } }
export const dataDir = () => path.resolve(process.env.CASTOR_DATA_DIR || path.join(process.cwd(), '.castor'));
export async function readWorkspace(): Promise<Workspace> {
  try { return workspaceSchema.parse(JSON.parse(await readFile(path.join(dataDir(), 'workspace.json'), 'utf8'))); }
  catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return freshWorkspace();
    throw new AppError('Workspace is unreadable or invalid. Preserve workspace.json and restore a valid backup; it has not been overwritten.', 500);
  }
}
// One runtime/writer. Serialize read-modify-write operations; rename only after flushing the temp file.
let queue: Promise<unknown> = Promise.resolve();
export function mutateWorkspace(change: (w: Workspace) => void, expected?: number): Promise<Workspace> {
  const operation = queue.then(async () => {
    const w = await readWorkspace();
    if (expected !== undefined && expected !== w.revision) throw new AppError('Workspace changed in another tab. Reload and retry.', 409);
    change(w); w.revision++; w.updatedAt = new Date().toISOString();
    workspaceSchema.parse(w);
    await mkdir(dataDir(), { recursive: true, mode: 0o700 });
    const temporary = path.join(dataDir(), `.workspace-${randomUUID()}.tmp`);
    try {
      const file = await open(temporary, 'wx', 0o600);
      try { await file.writeFile(JSON.stringify(w, null, 2)); await file.sync(); } finally { await file.close(); }
      await rename(temporary, path.join(dataDir(), 'workspace.json'));
    } finally { await unlink(temporary).catch(() => {}); }
    return w;
  });
  queue = operation.catch(() => {});
  return operation;
}
export function requireItem<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find(i => i.id === id); if (!item) throw new AppError('Item not found.', 404); return item;
}
