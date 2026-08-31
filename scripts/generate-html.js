import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const distDir = path.resolve('dist');
const clientDir = path.join(distDir, 'client');

if (fs.existsSync(clientDir)) {
  fs.cpSync(clientDir, distDir, { recursive: true, force: true });
}

// Build standalone SPA client bundle from index.html into dist
try {
  await build({
    configFile: false,
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    build: {
      outDir: distDir,
      emptyOutDir: false,
      rollupOptions: {
        input: path.resolve('index.html'),
      },
    },
  });
  console.log('[generate-html] Successfully bundled index.html into dist/index.html!');
} catch (e) {
  console.error('[generate-html] Failed to build index.html bundle:', e);
}
