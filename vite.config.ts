import { defineConfig } from 'vite';
import { build } from 'esbuild';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
}
export default defineConfig(({ mode }) => {
  const variable =
    mode === 'room-dev'
      ? 'PARTI_ROOM_DEV_OUT_DIR'
      : mode === 'room-build'
        ? 'PARTI_ROOM_BUILD_OUT_DIR'
        : null;
  if (variable && !process.env[variable]) throw new Error(`Missing ${variable}`);
  const outDir = resolve(variable ? process.env[variable]! : 'dist');
  return {
    resolve: { alias: { '@parti/worker-sdk': resolve('src/client/local-sdk.ts') } },
    base: './',
    build: {
      outDir,
      emptyOutDir: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/three/')) return 'three';
          },
        },
      },
    },
    worker: { format: 'es' },
    plugins: [
      {
        name: 'parti-authority',
        buildStart() {
          for (const file of files('src')) this.addWatchFile(resolve(file));
        },
        async closeBundle() {
          const outfile = join(outDir, 'room.worker.js');
          await build({
            entryPoints: ['src/parti/room.ts'],
            outfile,
            bundle: true,
            format: 'esm',
            target: 'es2022',
            external: ['@parti/worker-sdk'],
          });
          const source = readFileSync(outfile, 'utf8').replace(
            /export\s*\{\s*(\w+)\s+as\s+default\s*\};?/,
            'export default $1;',
          );
          writeFileSync(outfile, source);
        },
      },
    ],
  };
});
