import { spawn } from 'node:child_process';
import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
const mode = process.argv[2];
if (!['dev', 'start'].includes(mode)) throw new Error('Use npm run dev or npm start');
const port = process.env.CASTOR_PORT || '3210';
if (!/^\d+$/.test(port) || +port < 1024 || +port > 65535) throw new Error('CASTOR_PORT must be 1024–65535');
const directory=path.resolve(process.env.CASTOR_DATA_DIR || '.castor');
await mkdir(directory,{recursive:true,mode:0o700});
const lockPath=path.join(directory,'server.lock');
async function acquire() {
  try { const file=await open(lockPath,'wx',0o600);await file.writeFile(String(process.pid));await file.close(); }
  catch(error) {
    if(error.code!=='EEXIST')throw error;
    const pid=Number(await readFile(lockPath,'utf8'));
    if(!Number.isInteger(pid) || pid<=0) throw new Error('Invalid Castor server.lock. Inspect your workspace directory.');
    try {process.kill(pid,0);} catch(e) { if(e.code==='ESRCH'){await unlink(lockPath);return acquire();}throw e; }
    throw new Error(`A Castor runtime already owns this workspace (PID ${pid}). Use another CASTOR_DATA_DIR or stop that runtime.`);
  }
}
await acquire();
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', mode, '--hostname', '127.0.0.1', '--port', port], {
  stdio: 'inherit', env: { ...process.env, CASTOR_LOCAL: '1', NEXT_TELEMETRY_DISABLED: '1' },
});
console.log(`Castor loopback server PID ${child.pid}; workspace ${directory}`);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error',async error=>{console.error(error.message);await unlink(lockPath);process.exit(1);});
child.on('exit',async code=>{await unlink(lockPath);process.exit(code??1);});
