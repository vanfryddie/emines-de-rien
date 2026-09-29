'use strict';
/**
 * Renders the remaining bespoke imagery: three parallax layers cut from the
 * same scene as the hero, the Open Graph card, and the icon set.
 */
const fs = require('fs');
const path = require('path');
const { GlobalFonts } = require('@napi-rs/canvas');
const S = require('./scene');
const { createCanvas, buildAssets, drawFrame, drawSky, drawGrass, treeAt } = S;

GlobalFonts.registerFromPath(path.join(__dirname, 'Fraunces.ttf'), 'Fraunces');
GlobalFonts.registerFromPath(path.join(__dirname, 'InstrumentSans.ttf'), 'InstrumentSans');

const OUT = path.join(__dirname, '..', 'site', 'assets');
fs.mkdirSync(OUT, { recursive: true });
const out = (n) => path.join(OUT, n);

/* ------------------------------------------------------- parallax layers -- */
// Three depths, all cut from the hero's own scene so the page reads as one
// world: sky drifts slowest, hedgerow mid, grass fastest and nearest.

const LW = 1920;
const A = buildAssets(LW, 1080);

// 1 — sky plate
{
  const H = 820;
  const c = createCanvas(LW, H);
  const ctx = c.getContext('2d');
  drawSky(ctx, LW, H, H * 1.06, 0.18, A, 0);
  // Settle it down so page text stays legible on top.
  ctx.fillStyle = 'rgba(6,11,22,0.30)';
  ctx.fillRect(0, 0, LW, H);
  fs.writeFileSync(out('layer-sky.jpg'), c.encodeSync('jpeg', 78));
}

// 2 — hedgerow silhouette (transparent above the line)
{
  const H = 300;
  const c = createCanvas(LW, H);
  const ctx = c.getContext('2d');

  // The hero draws this profile only ~56px tall, so its narrow poplars read
  // as fine texture. Blown up to a full band they'd be spikes — low-pass the
  // profile first so it reads as a hedgerow at this scale.
  const P = A.treeProfile, n = P.length, k = 16;
  const sm = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = -k; j <= k; j++) s += P[(i + j + n) % n];
    sm[i] = s / (2 * k + 1);
  }

  const line = (yBase, amp, span, phase, fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let i = 0; i <= 1100; i++) {
      const t = i / 1100;
      ctx.lineTo(t * LW, yBase - treeAt(sm, t * span + phase) * amp);
    }
    ctx.lineTo(LW, H);
    ctx.closePath();
    ctx.fill();
  };

  // Far hedge, then near hedge — two reads of depth inside one layer.
  line(H - 96, 78, 0.62, 0.41, '#16242f');
  line(H - 40, 108, 0.44, 0.0, '#0b1620');

  fs.writeFileSync(out('layer-hedge.png'), c.encodeSync('png'));
}

// 3 — foreground grass
{
  const H = 420;
  const c = createCanvas(LW, H);
  const ctx = c.getContext('2d');
  drawGrass(ctx, LW, H, A.grassNear, H, 0.0, 0, 'rgba(4,10,14,0.97)', 1);
  drawGrass(ctx, LW, H, A.grassFar, H, 0.5, 0, 'rgba(7,16,20,0.9)', 0.85);
  fs.writeFileSync(out('layer-grass.png'), c.encodeSync('png'));
}

/* ------------------------------------------------------------- logo mark -- */
/**
 * The mark: a mirror-clad volume above a horizon with its own reflection
 * below, and one warm lit window. Reads at 16px.
 */
function drawMark(ctx, s, withPlate) {
  const u = (v) => v * s;
  if (withPlate) {
    const r = u(0.22);
    ctx.fillStyle = '#0a1320';
    ctx.beginPath();
    ctx.roundRect(0, 0, s, s, r);
    ctx.fill();
  }
  const cream = '#ece1d0', warm = '#f2a75e';

  // roof bar + volume
  ctx.fillStyle = cream;
  ctx.fillRect(u(0.155), u(0.315), u(0.69), u(0.05));
  ctx.fillRect(u(0.20), u(0.365), u(0.60), u(0.255));
  // lit window
  ctx.fillStyle = warm;
  ctx.fillRect(u(0.595), u(0.425), u(0.145), u(0.14));

  // reflection
  ctx.save();
  ctx.globalAlpha = 0.30;
  ctx.fillStyle = cream;
  ctx.fillRect(u(0.20), u(0.645), u(0.60), u(0.175));
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = warm;
  ctx.fillRect(u(0.595), u(0.70), u(0.145), u(0.095));
  ctx.restore();

  // horizon
  ctx.fillStyle = 'rgba(236,225,208,0.55)';
  ctx.fillRect(u(0.10), u(0.626), u(0.80), u(0.014));
}

for (const size of [512, 180, 32]) {
  const c = createCanvas(size, size);
  drawMark(c.getContext('2d'), size, true);
  fs.writeFileSync(out(`icon-${size}.png`), c.encodeSync('png'));
}

/* -------------------------------------------------------------- OG card -- */
{
  const W = 1200, H = 630;
  const OA = buildAssets(W, H);
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  drawFrame(ctx, W, H, 0.0, OA, { upper: createCanvas(W, H), sky: createCanvas(W, H) });

  // Legibility scrim, weighted to the left where the type sits.
  const g = ctx.createLinearGradient(0, 0, W * 0.92, 0);
  g.addColorStop(0, 'rgba(4,9,16,0.88)');
  g.addColorStop(0.55, 'rgba(4,9,16,0.55)');
  g.addColorStop(1, 'rgba(4,9,16,0.10)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const M = 74;
  const mark = createCanvas(56, 56);
  drawMark(mark.getContext('2d'), 56, false);
  ctx.drawImage(mark, M, M - 6);

  ctx.fillStyle = 'rgba(242,167,94,0.95)';
  ctx.font = '500 21px InstrumentSans';
  ctx.letterSpacing = '3px';
  ctx.fillText('LA BRUYÈRE · WALLONIA', M + 76, M + 28);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#f5efe6';
  ctx.font = '400 92px Fraunces';
  ctx.fillText('Émines de Rien', M, H * 0.52);

  ctx.fillStyle = 'rgba(232,224,212,0.82)';
  ctx.font = '400 31px InstrumentSans';
  ctx.fillText('A mirror-clad tiny house for two,', M, H * 0.52 + 58);
  ctx.fillText('with a whirlpool bath and a private cinema.', M, H * 0.52 + 100);

  // Star drawn as a path — neither brand face carries U+2605.
  ctx.fillStyle = 'rgba(242,167,94,0.92)';
  ctx.beginPath();
  const sx = M + 9, sy = H - 70, sr = 11;
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? sr * 0.44 : sr;
    ctx[i ? 'lineTo' : 'moveTo'](sx + Math.cos(a) * r, sy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();

  ctx.font = '500 25px InstrumentSans';
  ctx.fillText('5.0  ·  Guest favourite on Airbnb', M + 28, H - 62);

  fs.writeFileSync(out('og.jpg'), c.encodeSync('jpeg', 88));
}

console.log('assets written:',
  fs.readdirSync(OUT).filter((f) => !f.startsWith('hero')).join(', '));
