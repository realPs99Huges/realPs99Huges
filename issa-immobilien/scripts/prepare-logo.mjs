/**
 * Stellt das Original-Logo frei (Hintergrund → transparent), ohne Form oder
 * Farbe zu verändern („Color to Alpha“ gegen die bekannte Hintergrundfarbe).
 * Quellen: src/assets/brand/original-*.jpg (vom Auftraggeber geliefert).
 * Aufruf: node scripts/prepare-logo.mjs
 */
import sharp from 'sharp';

async function colorToAlpha(src, box, bg, out) {
  const { data, info } = await sharp(src)
    .extract(box)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    let a = 0;
    for (let c = 0; c < 3; c++) {
      const v = data[i + c], b = bg[c];
      const d = v > b ? (v - b) / (255 - b || 1) : (b - v) / (b || 1);
      a = Math.max(a, d);
    }
    if (a < 0.04) a = 0; // JPEG-Rauschen im Hintergrund entfernen
    for (let c = 0; c < 3; c++) {
      const v = data[i + c], b = bg[c];
      px[j + c] = a ? Math.round(Math.min(255, Math.max(0, b + (v - b) / a))) : 0;
    }
    px[j + 3] = Math.round(a * 255);
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(out);
  console.log('✓', out, info.width, '×', info.height);
}

const pad = 4;
await colorToAlpha(
  'src/assets/brand/original-logo-hell.jpg',
  { left: 324 - pad, top: 139 - pad, width: 954 - 324 + 2 * pad + 1, height: 315 - 139 + 2 * pad + 1 },
  [255, 255, 255],
  'src/assets/brand/logo-issa-immobilien.png',
);
await colorToAlpha(
  'src/assets/brand/original-visitenkarte-dunkel.jpg',
  { left: 260 - pad, top: 167 - pad, width: 1018 - 260 + 2 * pad + 1, height: 379 - 167 + 2 * pad + 1 },
  [42, 42, 42],
  'src/assets/brand/logo-issa-immobilien-negativ.png',
);
// Bildmarke (Symbol) für Favicon/Touch-Icon – Ausschnitt aus dem Original
await colorToAlpha(
  'src/assets/brand/original-logo-hell.jpg',
  { left: 324 - pad, top: 139 - pad, width: 490 - 324 + 2 * pad, height: 315 - 139 + 2 * pad + 1 },
  [255, 255, 255],
  'src/assets/brand/bildmarke.png',
);
