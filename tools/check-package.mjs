import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
const dir = resolve(process.env.PARTI_ROOM_BUILD_OUT_DIR || 'dist');
const manifest = JSON.parse(readFileSync(join(dir, 'parti.room.json'), 'utf8'));
for (const path of Object.values(manifest.entry))
  if (!existsSync(join(dir, path))) throw new Error(`Missing entry ${path}`);
if (!manifest.cover || /^https?:\/\//.test(manifest.cover))
  throw new Error('Marketplace cover must be a package-relative path');
const coverPath = join(dir, manifest.cover);
if (!existsSync(coverPath)) throw new Error(`Missing cover ${manifest.cover}`);
const coverBytes = statSync(coverPath).size;
if (coverBytes >= 200_000)
  throw new Error(`Cover must be under 200000 bytes (received ${coverBytes})`);
const worker = readFileSync(join(dir, manifest.entry.worker), 'utf8');
if (!/import\s*\{\s*defineRoom\s*\}\s*from\s*["']@parti\/worker-sdk["']/.test(worker))
  throw new Error('Missing canonical SDK import');
if (!/export default \w+/.test(worker)) throw new Error('Missing default export');
const imports = [...worker.matchAll(/\bfrom\s*["']([^"']+)["']/g)].map((m) => m[1]);
if (imports.some((s) => s !== '@parti/worker-sdk')) throw new Error('Unbundled worker import');
const html = readFileSync(join(dir, 'index.html'), 'utf8');
for (const [, path] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))
  if (!existsSync(join(dir, path))) throw new Error(`Missing HTML resource ${path}`);
if (!readdirSync(join(dir, 'assets')).some((f) => f.startsWith('replay.worker-')))
  throw new Error('Missing replay worker');
console.log(`Parti filesystem package contract valid (cover ${coverBytes} bytes)`);
