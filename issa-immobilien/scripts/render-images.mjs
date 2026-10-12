/**
 * Rendert die Architekturstudien der Website (src/assets/studies/*.jpg).
 *
 * Die Bilder sind bewusst als Visualisierungen gekennzeichnet und zeigen
 * keine realen Objekte. Sie lassen sich jederzeit durch echte Fotografie
 * ersetzen (siehe docs/BILDER.md).
 *
 * Aufruf: npm run render:images [-- szenenname]
 * Voraussetzung: lokal installiertes Chromium (Playwright) mit WebGL.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outDir = join(root, 'src/assets/studies');
const only = process.argv[2];

const types = { '.js': 'text/javascript', '.html': 'text/html' };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.startsWith('/three/')
    ? join(root, 'node_modules/three', path.slice('/three/'.length))
    : join(root, 'scripts/render', path === '/' ? 'index.html' : path);
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const { port } = server.address();

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

try {
  const page = await browser.newPage();
  page.on('console', (m) => console.log('[browser]', m.text()));
  page.on('pageerror', (e) => console.error('[browser error]', e));
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForFunction(() => window.__ready === true);
  const scenes = await page.evaluate(() => window.listScenes());
  await mkdir(outDir, { recursive: true });

  for (const name of scenes) {
    if (only && only !== name) continue;
    const t = Date.now();
    const { dataUrl, width, height } = await page.evaluate((n) => window.renderScene(n), name);
    const png = Buffer.from(dataUrl.split(',')[1], 'base64');
    // Supersampling: Rendering in doppelter Auflösung, hier herunterskaliert.
    await sharp(png)
      .resize(Math.round(width / 2), Math.round(height / 2), { kernel: 'lanczos3' })
      // Zurückhaltende Farbigkeit, passend zur Palette der Website
      .modulate({ saturation: name === 'horizon' ? 0.72 : 0.86 })
      .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(join(outDir, `${name}.jpg`));
    console.log(`✓ ${name} (${width / 2}×${height / 2}) in ${((Date.now() - t) / 1000).toFixed(1)}s`);
  }
} finally {
  await browser.close();
  server.close();
}
