import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { zipSync, unzipSync } from 'fflate';
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
}
const entries = Object.fromEntries(
  files('dist').map((path) => [
    relative('dist', path).replaceAll('\\', '/'),
    new Uint8Array(readFileSync(path)),
  ]),
);
const archive = zipSync(entries, { level: 6 });
if (!unzipSync(archive)['parti.room.json']) throw new Error('ZIP root must contain manifest');
mkdirSync('artifacts', { recursive: true });
writeFileSync('artifacts/parti.room.zip', archive);
console.log(`Created artifacts/parti.room.zip (${archive.byteLength} bytes)`);
