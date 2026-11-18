import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// Aceita --host e --hostname; ambos significam o endereço de escuta do servidor.
const source = process.argv.slice(2),
  args = [];
for (let i = 0; i < source.length; i++) {
  const arg = source[i];
  if (arg === '--strictPort') continue; // Next já respeita uma porta explicitamente informada.
  args.push(arg === '--host' ? '--hostname' : arg);
}
if (!args.includes('--hostname')) args.push('--hostname', '0.0.0.0');
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', ...args], {
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
