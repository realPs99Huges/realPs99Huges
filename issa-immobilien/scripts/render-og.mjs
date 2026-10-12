/**
 * Erzeugt das Social-Media-Vorschaubild (public/og/issa-immobilien.jpg),
 * Favicon und Apple-Touch-Icon aus dem Original-Logo – ohne neue Bildinhalte.
 * Aufruf: node scripts/render-og.mjs
 */
import { readFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const b64 = async (p) => (await readFile(join(root, p))).toString('base64');

const font = await b64('node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wdth-normal.woff2');
const logo = await b64('src/assets/brand/logo-issa-immobilien-negativ.png');

const og = `<!doctype html><html><head><style>
@font-face{font-family:I;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:400 700;font-stretch:75% 100%}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#2a2a2a;color:#fff;font-family:I;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between;position:relative}
img{height:96px;width:auto;display:block}
h1{font-weight:640;font-stretch:86%;font-size:58px;line-height:1.05;letter-spacing:-.02em;max-width:900px}
h1 span{color:#038604}
.m{display:flex;gap:28px;font-size:20px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#c8cacc}
.m b{display:inline-block;width:10px;height:10px;background:#038604;margin-right:12px}
.bar{position:absolute;left:0;bottom:0;width:100%;height:10px;background:#038604}
</style></head><body>
<img src="data:image/png;base64,${logo}">
<h1>Spezialist für Einzelhandelsimmobilien und <span>Handelsstandorte.</span></h1>
<div class="m"><span><b></b>Deutschlandweit tätig</span><span><b></b>Sitz in Lippstadt</span></div>
<div class="bar"></div>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(og);
  await page.evaluate(() => document.fonts.ready);
  await mkdir(join(root, 'public/og'), { recursive: true });
  await sharp(await page.screenshot({ type: 'png' })).jpeg({ quality: 88, mozjpeg: true }).toFile(join(root, 'public/og/issa-immobilien.jpg'));
} finally {
  await browser.close();
}

// Favicon und Touch-Icon: Bildmarke aus dem Original-Logo auf Weiß
const mark = join(root, 'src/assets/brand/bildmarke.png');
const icon = async (size, pad, out) => {
  const inner = Math.round(size * (1 - 2 * pad));
  const m = await sharp(mark).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#ffffff' } })
    .composite([{ input: m, gravity: 'center' }])
    .png()
    .toFile(join(root, out));
};
await icon(64, 0.06, 'public/favicon.png');
await icon(180, 0.14, 'public/apple-touch-icon.png');
console.log('✓ OG-Bild, Favicon und Touch-Icon erstellt');
