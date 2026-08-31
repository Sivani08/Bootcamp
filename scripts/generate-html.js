import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

// Sync dist/client contents into dist if present
const clientDir = path.join(distDir, 'client');
if (fs.existsSync(clientDir)) {
  fs.cpSync(clientDir, distDir, { recursive: true, force: true });
}

const assetsDir = path.join(distDir, 'assets');
let cssFile = '';
let jsFile = '';

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  cssFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css')) || files.find(f => f.endsWith('.css')) || '';
  jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js')) || files.find(f => f.endsWith('.js')) || '';
}

const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BootMind — Turning Learner Progress into Meaningful Insights</title>
    <link rel="icon" href="/favicon.ico" />
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ''}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" />
  </head>
  <body class="bg-background text-foreground">
    <div id="root"></div>
    ${jsFile ? `<script type="module" src="/assets/${jsFile}"></script>` : ''}
  </body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
console.log('[generate-html] Generated dist/index.html with CSS:', cssFile, 'and JS:', jsFile);
