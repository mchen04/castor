import { spawn } from 'node:child_process';
if (process.env.VERCEL) throw new Error('Castor local consolidation does not support hosted builds.');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','build'],{stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
child.on('exit',code=>process.exit(code??1));
