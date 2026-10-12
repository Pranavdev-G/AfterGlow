import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';
const frontendPort = process.env.PORT || process.env.VITE_PORT || '5173';
const apiPort = process.env.API_PORT || '5000';
const common = { cwd: root, stdio: 'inherit', shell: isWindows, env: { ...process.env, API_PORT: apiPort } };
const children = [
  spawn(npm, ['--workspace', 'backend', 'run', 'dev'], common),
  spawn(npm, ['--workspace', 'frontend', 'run', 'dev', '--', '--host', '0.0.0.0', '--port', frontendPort], common),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 250).unref();
}
for (const child of children) child.on('exit', (code) => {
  if (!stopping && code !== 0) stop(code ?? 1);
});
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
console.log(`\n  Afterglow local services: UI starting at ${frontendPort} (Vite selects the next free port if needed; use its printed URL); API ${apiPort}; MongoDB ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/afterglow_cinema'}\n`);
