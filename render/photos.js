'use strict';
/**
 * Turns the property photographs into responsive web assets, and lifts the
 * hosts' own gold wordmark off its black plate into a transparent PNG.
 */
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const SRC = path.join(__dirname, 'photos');
const OUT = path.join(__dirname, '..', 'site', 'assets', 'img');
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).sort();
const byIndex = (n) => files.find((f) => f.startsWith(String(n).padStart(2, '0') + '-'));

// Curated order + captions. Each describes only what is visible in the frame.
const PICKS = [
  [13, 'The mirrored facade and covered terrace'],
  [14, 'Open fields reflected in the cladding'],
  [0,  'The house and the pool at dusk'],
  [17, 'The garden, seen past the pool'],
  [16, 'The heated outdoor pool, open in season'],
  [15, 'Mirror walls against the garden'],
  [12, 'Seating on the covered terrace'],
  [11, 'The terrace after dark'],
  [3,  'The sleeping area'],
  [5,  'The queen bed'],
  [18, 'The whirlpool bath'],
  [4,  'The whirlpool bath beside the glazing'],
  [1,  'Washbasin and backlit mirror'],
  [10, 'The backlit mirror at night'],
  [9,  'The equipped kitchen'],
  [8,  'The dining counter'],
  [21, 'The private cinema screen'],
];

const WIDTHS = [480, 960, 1600];

function fit(im, w) {
  const scale = Math.min(1, w / im.width);
  return [Math.round(im.width * scale), Math.round(im.height * scale)];
}

(async () => {
  const manifest = [];

  for (let i = 0; i < PICKS.length; i++) {
    const [idx, alt] = PICKS[i];
    const f = byIndex(idx);
    if (!f) { console.log('missing', idx); continue; }
    const im = await loadImage(path.join(SRC, f));
    const name = 'p' + String(i).padStart(2, '0');
    const entry = { name, alt, w: im.width, h: im.height, widths: [] };

    for (const w of WIDTHS) {
      const [dw, dh] = fit(im, w);
      if (dw < w && w !== WIDTHS[0] && entry.widths.includes(dw)) continue;
      const c = createCanvas(dw, dh);
      const ctx = c.getContext('2d');
      ctx.drawImage(im, 0, 0, dw, dh);
      fs.writeFileSync(path.join(OUT, `${name}-${w}.webp`), c.encodeSync('webp', 76));
      fs.writeFileSync(path.join(OUT, `${name}-${w}.jpg`), c.encodeSync('jpeg', 74));
      entry.widths.push(w);
      if (dw < w) break;                       // never upscale past the source
    }

    // Tiny inline placeholder so cards never flash empty.
    const [bw, bh] = fit(im, 20);
    const bc = createCanvas(bw, bh);
    bc.getContext('2d').drawImage(im, 0, 0, bw, bh);
    entry.lqip = 'data:image/webp;base64,' + bc.encodeSync('webp', 50).toString('base64');

    manifest.push(entry);
    console.log(name, `${im.width}x${im.height}`, entry.widths.join('/'));
  }

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));

  /* ── the hosts' wordmark, keyed off its black plate ──────────────── */
  const logo = await loadImage(path.join(SRC, byIndex(22)));
  const L = createCanvas(logo.width, logo.height);
  const lx = L.getContext('2d');
  lx.drawImage(logo, 0, 0);
  const d = lx.getImageData(0, 0, L.width, L.height);
  const px = d.data;
  let minX = L.width, minY = L.height, maxX = 0, maxY = 0;

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    // The plate is pure black and the mark is gold: luminance is the alpha.
    const lum = Math.max(r, g, b);
    const a = lum < 18 ? 0 : Math.min(255, Math.round((lum - 18) * 1.35));
    px[i + 3] = a;
    if (a > 40) {
      // Re-saturate: dividing out the alpha undoes the black it was matted on.
      const k = 255 / lum;
      px[i] = Math.min(255, r * k);
      px[i + 1] = Math.min(255, g * k);
      px[i + 2] = Math.min(255, b * k);
      const p = (i / 4) | 0, y = (p / L.width) | 0, x = p % L.width;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  lx.putImageData(d, 0, 0);

  const pad = 6;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(L.width - 1, maxX + pad); maxY = Math.min(L.height - 1, maxY + pad);
  const cw = maxX - minX + 1, ch = maxY - minY + 1;

  const target = 900;
  const s = Math.min(1, target / cw);
  const W2 = Math.round(cw * s), H2 = Math.round(ch * s);
  const C = createCanvas(W2, H2);
  C.getContext('2d').drawImage(L, minX, minY, cw, ch, 0, 0, W2, H2);
  fs.writeFileSync(path.join(OUT, 'wordmark.png'), C.encodeSync('png'));
  console.log('wordmark', `${W2}x${H2}`, 'from', `${cw}x${ch}`);
})();
