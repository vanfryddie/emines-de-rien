'use strict';
/**
 * Injects the photography into index.html from the image manifest, so the
 * markup stays in one place and the srcsets can never drift from the files
 * on disk. Idempotent: it rewrites between the marker comments each run.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'site');
const M = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/img/manifest.json'), 'utf8'));
const by = Object.fromEntries(M.map((m) => [m.name, m]));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A <picture> with webp + jpeg, correct intrinsic size, and an LQIP. */
function pic(name, sizes, opts) {
  const m = by[name];
  if (!m) throw new Error('no image ' + name);
  const o = opts || {};
  const ws = m.widths;
  const set = (ext) => ws.map((w) => `./assets/img/${name}-${w}.${ext} ${w}w`).join(', ');
  const fall = ws[Math.min(1, ws.length - 1)];
  const eager = o.eager ? ' fetchpriority="high"' : ' loading="lazy"';
  return `<picture>
      <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
      <img src="./assets/img/${name}-${fall}.jpg" srcset="${set('jpg')}" sizes="${sizes}"
           width="${m.w}" height="${m.h}" alt="${esc(o.alt || m.alt)}"
           style="background-image:url(${m.lqip})"${eager} decoding="async">
    </picture>`;
}

/* ── the six feature cards ─────────────────────────────────────────── */
const CARDS = [
  ['p10', 'Whirlpool bath',
   'A whirlpool bath set into the open plan, with a large walk-in shower alongside.'],
  ['p16', 'Private cinema',
   'A real cinema corner: a big screen and immersive sound, for the two of you.'],
  ['p04', 'Heated pool, in season',
   'An 8 × 4 m heated outdoor pool with a cover and pool toys — the owners’ pool, shared and open at set hours.'],
  ['p07', 'Covered terrace',
   'A private covered terrace over the fields, and a small garden with nothing facing it.'],
  ['p14', 'Equipped kitchen',
   'A fitted kitchen, so you needn’t leave unless you feel like it.'],
  ['p05', 'Mirror architecture',
   'Mirrored cladding that hands the fields, the hedgerows and the weather straight back to you.'],
];

const CARD_SIZES = '(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 31vw';
const cardsHtml = CARDS.map(([n, h3, p]) => `
      <li class="card reveal">
        <div class="card__img">${pic(n, CARD_SIZES)}</div>
        <div class="card__body">
          <h3>${h3}</h3>
          <p>${p}</p>
        </div>
      </li>`).join('');

/* ── gallery ───────────────────────────────────────────────────────── */
// Portrait frames get a taller cell so the mosaic doesn't crop them to strips.
const GAL_SIZES = '(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 30vw';
const galleryHtml = M.map((m, i) => {
  const tall = m.h / m.w > 1.15;
  const wide = m.w / m.h > 1.25;
  const cls = tall ? ' grid__i--tall' : (wide && i % 5 === 0 ? ' grid__i--wide' : '');
  return `
      <li class="grid__i${cls}">
        <button class="grid__btn" type="button" data-i="${i}"
                aria-label="Open photo: ${esc(m.alt)}">
          ${pic(m.name, GAL_SIZES)}
          <span class="grid__cap">${esc(m.alt)}</span>
        </button>
      </li>`;
}).join('');

/* ── about figure ──────────────────────────────────────────────────── */
const aboutHtml = `
      ${pic('p00', '(max-width: 820px) 92vw, 46vw')}
      <figcaption>${esc(by.p00.alt)}</figcaption>`;

/* ── data the lightbox needs at runtime ────────────────────────────── */
const lbData = M.map((m) => ({
  s: `./assets/img/${m.name}-1600.jpg`,
  w: `./assets/img/${m.name}-1600.webp`,
  a: m.alt,
}));

/* ── write ─────────────────────────────────────────────────────────── */
const file = path.join(ROOT, 'index.html');
let html = fs.readFileSync(file, 'utf8');

function inject(marker, content) {
  const open = `<!--${marker}-->`;
  const close = `<!--/${marker}-->`;
  const re = new RegExp(open.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&')
    + '[\\s\\S]*?' + close.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&'));
  const block = open + content + '\n    ' + close;
  if (re.test(html)) html = html.replace(re, block);
  else if (html.includes(open)) html = html.replace(open, block);
  else throw new Error('marker not found: ' + marker);
}

inject('CARDS', cardsHtml);
inject('GALLERY', galleryHtml);
inject('ABOUT_IMG', aboutHtml);

// Hand the lightbox its list without an extra round trip.
const tag = `<script id="lbData" type="application/json">${JSON.stringify(lbData)}</script>`;
if (/<script id="lbData"[\s\S]*?<\/script>/.test(html)) {
  html = html.replace(/<script id="lbData"[\s\S]*?<\/script>/, tag);
} else {
  html = html.replace('<script src="./main.js" defer></script>',
    tag + '\n<script src="./main.js" defer></script>');
}

fs.writeFileSync(file, html);
console.log(`injected ${CARDS.length} cards, ${M.length} gallery frames`);
