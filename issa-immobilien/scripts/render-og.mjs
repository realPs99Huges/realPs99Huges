/**
 * Erzeugt das Social-Media-Vorschaubild (public/og/issa-immobilien.jpg)
 * und das Apple-Touch-Icon aus HTML – mit den lokal installierten Schriften.
 * Aufruf: node scripts/render-og.mjs  (nach npm run render:images)
 */
import { readFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const b64 = async (p) => (await readFile(join(root, p))).toString('base64');

const serif = await b64('node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2');
const serifItalic = await b64('node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2');
const sans = await b64('node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2');
const photo = (await sharp(join(root, 'src/assets/studies/residence.jpg')).resize(560, 630, { fit: 'cover', position: 'right' }).jpeg({ quality: 90 }).toBuffer()).toString('base64');

const fonts = `
@font-face{font-family:S;src:url(data:font/woff2;base64,${serif}) format('woff2');font-weight:200 800}
@font-face{font-family:S;font-style:italic;src:url(data:font/woff2;base64,${serifItalic}) format('woff2');font-weight:200 800}
@font-face{font-family:A;src:url(data:font/woff2;base64,${sans}) format('woff2');font-weight:400 700}
*{margin:0;box-sizing:border-box}`;

const og = `<!doctype html><html><head><style>${fonts}
body{width:1200px;height:630px;display:flex;background:#f3efe8;color:#22211f;font-family:A}
.l{flex:1;padding:64px 56px 56px 72px;display:flex;flex-direction:column;justify-content:space-between}
.wm{display:flex;align-items:center;gap:18px}
.n{font-family:S;font-size:34px;letter-spacing:.2em;font-weight:420}
.r{width:1px;height:32px;background:#22211f;opacity:.45}
.k{font-size:15px;letter-spacing:.34em;font-weight:560}
h1{font-family:S;font-weight:370;font-size:58px;line-height:1.06;letter-spacing:-.02em;max-width:560px}
h1 em{font-weight:340}
.m{display:flex;justify-content:space-between;font-size:16px;letter-spacing:.14em;text-transform:uppercase;color:#645e55;border-top:1px solid rgba(34,33,31,.16);padding-top:18px}
img{width:560px;height:630px;object-fit:cover;display:block}
</style></head><body>
<div class="l">
 <div class="wm"><span class="n">ISSA</span><span class="r"></span><span class="k">IMMOBILIEN</span></div>
 <h1>Immobilien verdienen eine durchdachte <em>Perspektive.</em></h1>
 <div class="m"><span>Immobilienvermarktung</span><span>Lippstadt</span></div>
</div>
<img src="data:image/jpeg;base64,${photo}">
</body></html>`;

const icon = `<!doctype html><html><head><style>${fonts}
body{width:180px;height:180px;background:#22211f;color:#ede7dc;display:grid;place-items:center}
div{display:grid;justify-items:center;gap:10px}
span{font-family:S;font-size:96px;line-height:.8;font-weight:400}
i{display:block;width:56px;height:2px;background:#c4ae84}
</style></head><body><div><span>I</span><i></i></div></body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(og);
  await page.evaluate(() => document.fonts.ready);
  await mkdir(join(root, 'public/og'), { recursive: true });
  await sharp(await page.screenshot({ type: 'png' }))
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(join(root, 'public/og/issa-immobilien.jpg'));

  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(icon);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(root, 'public/apple-touch-icon.png') });
  console.log('✓ OG-Bild und Touch-Icon erstellt');
} finally {
  await browser.close();
}
