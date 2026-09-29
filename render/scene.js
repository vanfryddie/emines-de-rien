'use strict';
/**
 * "Miroir, au crépuscule" — bespoke cinematic scene for Émines de Rien.
 *
 * A mirror-clad tiny house on the Hesbaye plateau at dusk: the facade
 * reflects a displaced copy of the sky, the heated pool holds a rippling
 * second reflection, and foreground grasses drift past in parallax.
 *
 * Every animated quantity is a periodic function of `phase` in [0,1),
 * so the render loops seamlessly with no crossfade.
 */

const { createCanvas } = require('@napi-rs/canvas');

const TAU = Math.PI * 2;

/* ---------------------------------------------------------------- noise -- */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tileable value-noise grid. Sampling wraps, so the field repeats exactly. */
function makeNoiseGrid(gx, gy, rand) {
  const g = new Float32Array(gx * gy);
  for (let i = 0; i < g.length; i++) g[i] = rand();
  return { gx, gy, g };
}

function smooth(t) { return t * t * (3 - 2 * t); }

function sampleNoise(n, x, y) {
  const { gx, gy, g } = n;
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = smooth(x - xi), yf = smooth(y - yi);
  const x0 = ((xi % gx) + gx) % gx, x1 = (x0 + 1) % gx;
  const y0 = ((yi % gy) + gy) % gy, y1 = (y0 + 1) % gy;
  const a = g[y0 * gx + x0], b = g[y0 * gx + x1];
  const c = g[y1 * gx + x0], d = g[y1 * gx + x1];
  const top = a + (b - a) * xf, bot = c + (d - c) * xf;
  return top + (bot - top) * yf;
}

function fbm(grids, x, y) {
  let sum = 0, amp = 0.5, norm = 0, f = 1;
  for (let i = 0; i < grids.length; i++) {
    sum += sampleNoise(grids[i], x * f, y * f) * amp;
    norm += amp; amp *= 0.5; f *= 2;
  }
  return sum / norm;
}

/* ---------------------------------------------------------------- colour -- */

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function mix(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}
function rgb(c, a) {
  const r = Math.round(clamp(c[0], 0, 255));
  const g = Math.round(clamp(c[1], 0, 255));
  const b = Math.round(clamp(c[2], 0, 255));
  return a === undefined ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
}

// Dusk palette — indigo zenith falling to a warm Hesbaye horizon.
const SKY_ZENITH = [8, 16, 38];
const SKY_HIGH = [16, 38, 68];
const SKY_MID = [30, 74, 100];
const SKY_LOW = [92, 116, 122];
const SKY_WARM = [206, 130, 84];
const SKY_HORIZON = [242, 196, 146];

const FIELD_FAR = [22, 38, 42];
const FIELD_NEAR = [9, 18, 20];
const GLOW_WARM = [255, 186, 112];
const GLOW_CORE = [255, 233, 198];
const LED_TEAL = [70, 214, 205];
// The house's real signature: RGB wash inside, gold on the terrace.
const LED_MAGENTA = [198, 88, 235];
const GOLD = [226, 178, 106];

/** Vertical sky colour ramp, t = 0 at top of sky, 1 at horizon. */
function skyColour(t) {
  if (t < 0.28) return mix(SKY_ZENITH, SKY_HIGH, t / 0.28);
  if (t < 0.56) return mix(SKY_HIGH, SKY_MID, (t - 0.28) / 0.28);
  if (t < 0.78) return mix(SKY_MID, SKY_LOW, (t - 0.56) / 0.22);
  if (t < 0.93) return mix(SKY_LOW, SKY_WARM, (t - 0.78) / 0.15);
  return mix(SKY_WARM, SKY_HORIZON, (t - 0.93) / 0.07);
}

/* ------------------------------------------------------------ pre-render -- */

/**
 * Builds the static, reusable pieces once: a horizontally tileable cloud
 * sheet, a star field, grass blades and grain tiles.
 */
function buildAssets(W, H, seed = 20260929) {
  const rand = mulberry32(seed);

  const grids = [
    makeNoiseGrid(8, 4, rand),
    makeNoiseGrid(16, 8, rand),
    makeNoiseGrid(32, 16, rand),
    makeNoiseGrid(64, 32, rand),
  ];

  // --- Tileable cloud sheet -------------------------------------------------
  // Built at exactly the size it will be drawn: scaling a tiled sheet makes
  // the edge texels resample and leaves a visible seam at the tile join.
  const CW = Math.round(W * 1.6), CH = Math.round(H * 0.60);
  const cloud = createCanvas(CW, CH);
  const cctx = cloud.getContext('2d');
  const img = cctx.createImageData(CW, CH);
  const d = img.data;
  for (let y = 0; y < CH; y++) {
    // Bands thin out toward the top of the sky.
    const vy = y / CH;
    const band = Math.pow(vy, 0.75);
    for (let x = 0; x < CW; x++) {
      const nx = (x / CW) * 8;      // 8 grid cells across -> wraps exactly
      const ny = (y / CH) * 3 + 0.5;
      let v = fbm(grids, nx, ny);
      // Stretch horizontally into cirrus-like streaks.
      const streak = fbm(grids, nx * 0.5, ny * 4.0);
      v = v * 0.65 + streak * 0.35;
      v = Math.pow(clamp((v - 0.34) / 0.5, 0, 1), 1.5) * band;
      const i = (y * CW + x) * 4;
      d[i] = 255; d[i + 1] = 255; d[i + 2] = 255;
      d[i + 3] = Math.round(v * 190);
    }
  }
  cctx.putImageData(img, 0, 0);

  // --- Mist sheet (softer, lower, tileable) --------------------------------
  const MW = Math.round(W * 1.5), MH = Math.round(H * 0.22);
  const mist = createCanvas(MW, MH);
  const mctx = mist.getContext('2d');
  const mimg = mctx.createImageData(MW, MH);
  const md = mimg.data;
  for (let y = 0; y < MH; y++) {
    const vy = y / MH;
    // Fade in at both vertical edges so the band floats.
    const env = Math.sin(vy * Math.PI);
    for (let x = 0; x < MW; x++) {
      const nx = (x / MW) * 6;
      const ny = (y / MH) * 1.5 + 3.0;
      let v = fbm(grids, nx, ny);
      v = Math.pow(clamp((v - 0.3) / 0.55, 0, 1), 1.3) * env;
      const i = (y * MW + x) * 4;
      md[i] = 196; md[i + 1] = 220; md[i + 2] = 228;
      md[i + 3] = Math.round(v * 120);
    }
  }
  mctx.putImageData(mimg, 0, 0);

  // --- Stars ---------------------------------------------------------------
  const stars = [];
  for (let i = 0; i < 260; i++) {
    const y = Math.pow(rand(), 1.7);           // crowd toward the zenith
    stars.push({
      x: rand(),
      y: y * 0.52,
      r: 0.4 + rand() * 1.3,
      a: 0.25 + rand() * 0.6,
      tw: rand() * TAU,                        // twinkle phase
      ts: 1 + Math.floor(rand() * 3),          // twinkle speed (integer -> loops)
    });
  }

  // --- Hedgerow silhouette --------------------------------------------------
  // The Hesbaye plateau is flat arable land edged with hedgerows and poplar
  // clumps, so the profile is a union of crowns, not rolling hills.
  const N = 2048;
  const treeProfile = new Float32Array(N);
  {
    const r = mulberry32(seed + 77);
    // Broad hedge clumps
    for (let c = 0; c < 110; c++) {
      const cx = r() * N;
      const w = 12 + r() * 46;
      const h = 0.30 + r() * 0.52;
      const span = Math.ceil(w * 2.6);
      for (let i = -span; i <= span; i++) {
        const idx = (((Math.round(cx) + i) % N) + N) % N;
        const t = i / w;
        const v = Math.exp(-t * t) * h;
        if (v > treeProfile[idx]) treeProfile[idx] = v;   // silhouette union
      }
    }
    // A handful of taller poplars breaking the line
    for (let c = 0; c < 14; c++) {
      const cx = r() * N;
      const w = 2.0 + r() * 3.0;
      const h = 0.72 + r() * 0.28;
      const span = Math.ceil(w * 3.2);
      for (let i = -span; i <= span; i++) {
        const idx = (((Math.round(cx) + i) % N) + N) % N;
        const t = i / w;
        const v = Math.exp(-t * t * 0.8) * h;
        if (v > treeProfile[idx]) treeProfile[idx] = v;
      }
    }
    // Fine foliage jitter + a continuous hedge base
    for (let i = 0; i < N; i++) {
      const j = Math.sin(i * 1.71) * 0.5 + Math.sin(i * 0.37 + 1.1) * 0.5;
      treeProfile[i] = Math.max(0.07, treeProfile[i] * (0.90 + 0.10 * j));
    }
  }

  // --- Foreground grass ----------------------------------------------------
  function makeBlades(count, spread, minH, maxH, seedOff) {
    const r = mulberry32(seed + seedOff);
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push({
        x: -0.15 + r() * spread,
        h: minH + r() * (maxH - minH),
        lean: (r() - 0.5) * 0.5,
        w: 0.6 + r() * 1.9,
        ph: r() * TAU,
        sp: 1 + Math.floor(r() * 2),   // integer cycles -> seamless
        amp: 0.5 + r() * 1.0,
        seg: 3 + Math.floor(r() * 3),
      });
    }
    return out;
  }
  const grassFar = makeBlades(320, 1.35, 0.030, 0.080, 11);
  const grassNear = makeBlades(130, 1.35, 0.095, 0.235, 29);

  // --- Grain tiles ---------------------------------------------------------
  const GT = 512, GRAIN_TILES = 6;
  const grain = [];
  for (let t = 0; t < GRAIN_TILES; t++) {
    const gc = createCanvas(GT, GT);
    const gx = gc.getContext('2d');
    const gi = gx.createImageData(GT, GT);
    const gd = gi.data;
    for (let i = 0; i < GT * GT; i++) {
      const v = 128 + (rand() - 0.5) * 255;
      const o = i * 4;
      gd[o] = gd[o + 1] = gd[o + 2] = clamp(v, 0, 255);
      gd[o + 3] = 255;
    }
    gx.putImageData(gi, 0, 0);
    grain.push(gc);
  }

  return { grids, cloud, mist, stars, treeProfile, grassFar, grassNear, grain };
}

/* --------------------------------------------------------------- drawing -- */

/** Treeline height at normalised x, wrapping. */
function treeAt(profile, x) {
  const n = profile.length;
  const fx = (((x % 1) + 1) % 1) * n;
  const i = Math.floor(fx) % n, f = fx - Math.floor(fx);
  return lerp(profile[i], profile[(i + 1) % n], f);
}

/**
 * Renders the sky dome (gradient + stars + clouds) into `ctx`.
 * Kept separate so the cabin facade and the pool can reflect it.
 */
function drawSky(ctx, W, H, horizon, phase, A, drift) {
  // Gradient
  const g = ctx.createLinearGradient(0, -H * 0.05, 0, horizon);
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    g.addColorStop(t, rgb(skyColour(t)));
  }
  ctx.fillStyle = g;
  ctx.fillRect(-W * 0.2, -H * 0.2, W * 1.4, horizon + H * 0.2);

  // Stars — fade out toward the bright horizon.
  for (const s of A.stars) {
    const tw = 0.62 + 0.38 * Math.sin(phase * TAU * s.ts + s.tw);
    const sy = s.y * horizon;
    const fade = clamp(1 - sy / (horizon * 0.62), 0, 1);
    if (fade <= 0.01) continue;
    ctx.globalAlpha = s.a * tw * fade;
    ctx.fillStyle = '#eaf2ff';
    ctx.beginPath();
    ctx.arc(s.x * W + drift * 0.15, sy, s.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Clouds — one full tile of travel across the loop keeps this seamless.
  // Drawn 1:1 at integer offsets so the tile join is pixel-exact.
  const dw = A.cloud.width, dh = A.cloud.height;
  const cy = Math.round(horizon - dh * 0.92);
  const off = Math.round(phase * dw) % dw;
  ctx.globalAlpha = 0.5;
  const cdrift = Math.round(drift * 0.3);
  for (let k = -1; k <= 2; k++) {
    ctx.drawImage(A.cloud, -off + k * dw + cdrift, cy);
  }
  ctx.globalAlpha = 1;

  // Warm horizon bloom
  const hg = ctx.createRadialGradient(
    W * 0.58 + drift * 0.2, horizon, 0,
    W * 0.58 + drift * 0.2, horizon, W * 0.55
  );
  hg.addColorStop(0, rgb(SKY_HORIZON, 0.42));
  hg.addColorStop(0.35, rgb(SKY_WARM, 0.18));
  hg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hg;
  ctx.fillRect(-W * 0.2, horizon - W * 0.55, W * 1.4, W * 0.55);
}

/** Treeline + far field, drawn under the cabin. */
function drawLand(ctx, W, H, horizon, A, drift) {
  const bandH = H * 0.052;

  // A far, paler hedge line first — aerial perspective gives the field depth.
  ctx.fillStyle = 'rgba(28,46,56,0.85)';
  ctx.beginPath();
  ctx.moveTo(-W * 0.2, horizon + 2);
  for (let i = 0; i <= 420; i++) {
    const t = i / 420;
    const x = -W * 0.2 + t * W * 1.4;
    const h = treeAt(A.treeProfile, t * 2.3 + 0.37 + drift * 0.00010);
    ctx.lineTo(x, horizon - h * bandH * 0.42);
  }
  ctx.lineTo(W * 1.2, horizon + 2);
  ctx.closePath();
  ctx.fill();

  // Near hedgerow
  ctx.fillStyle = rgb([9, 18, 24]);
  ctx.beginPath();
  ctx.moveTo(-W * 0.2, horizon + H * 0.02);
  for (let i = 0; i <= 620; i++) {
    const t = i / 620;
    const x = -W * 0.2 + t * W * 1.4;
    const h = treeAt(A.treeProfile, t * 1.45 + drift * 0.00018);
    ctx.lineTo(x, horizon - h * bandH);
  }
  ctx.lineTo(W * 1.2, horizon + H * 0.02);
  ctx.closePath();
  ctx.fill();
}

/**
 * The mirror-clad tiny house. `skyCanvas` is reflected in the facade.
 */
function drawCabin(ctx, W, H, horizon, phase, A, skyCanvas, geom) {
  const { cx, baseY, cw, chh } = geom;
  const left = cx - cw / 2, right = cx + cw / 2;
  const top = baseY - chh;

  ctx.save();

  // --- Mirror facade: a displaced, flipped copy of the sky ----------------
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, cw, chh);
  ctx.clip();

  // Flip vertically about the cabin's centre and scale slightly: the classic
  // mirror-cladding read, where the reflection never quite lines up.
  ctx.translate(0, top + chh);
  ctx.scale(1, -1);
  ctx.translate(0, -(top + chh));
  ctx.globalAlpha = 0.9;
  ctx.drawImage(skyCanvas, 0, top - horizon * 0.42, W, horizon * 1.05);
  ctx.restore();

  // Cool mirror tint + a vertical falloff so the base sits darker.
  ctx.save();
  ctx.beginPath(); ctx.rect(left, top, cw, chh); ctx.clip();
  const tint = ctx.createLinearGradient(0, top, 0, baseY);
  tint.addColorStop(0, 'rgba(96,140,168,0.30)');
  tint.addColorStop(0.55, 'rgba(40,70,96,0.30)');
  tint.addColorStop(1, 'rgba(10,20,32,0.66)');
  ctx.fillStyle = tint;
  ctx.fillRect(left, top, cw, chh);

  // Cladding seams
  ctx.globalAlpha = 0.30;
  ctx.strokeStyle = 'rgba(180,212,232,0.55)';
  ctx.lineWidth = Math.max(1, W * 0.00055);
  const panels = 9;
  for (let i = 1; i < panels; i++) {
    const x = left + (cw * i) / panels;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, baseY); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // --- Glazed end with warm interior --------------------------------------
  const winW = cw * 0.30, winH = chh * 0.62;
  const winX = right - winW - cw * 0.075;
  const winY = top + chh * 0.19;

  // Interior gradient: amber hearth with a teal LED wash at one edge.
  const wg = ctx.createLinearGradient(winX, winY, winX + winW, winY + winH);
  wg.addColorStop(0, rgb(mix(LED_TEAL, LED_MAGENTA, 0.45), 0.95));
  wg.addColorStop(0.34, rgb(LED_MAGENTA, 0.95));
  wg.addColorStop(0.70, rgb(mix(LED_MAGENTA, GLOW_WARM, 0.62), 0.98));
  wg.addColorStop(1, rgb(GLOW_CORE, 1));
  ctx.fillStyle = wg;
  ctx.fillRect(winX, winY, winW, winH);

  // Mullions
  ctx.strokeStyle = 'rgba(18,14,10,0.55)';
  ctx.lineWidth = Math.max(1, W * 0.0011);
  ctx.beginPath();
  ctx.moveTo(winX + winW * 0.5, winY); ctx.lineTo(winX + winW * 0.5, winY + winH);
  ctx.moveTo(winX, winY + winH * 0.52); ctx.lineTo(winX + winW, winY + winH * 0.52);
  ctx.stroke();

  // Breathing bloom around the glazing (one full cycle per loop).
  const breathe = 0.80 + 0.20 * Math.sin(phase * TAU);
  const bl = ctx.createRadialGradient(
    winX + winW / 2, winY + winH / 2, 0,
    winX + winW / 2, winY + winH / 2, winW * 3.6
  );
  bl.addColorStop(0, rgb(mix(GLOW_WARM, LED_MAGENTA, 0.30), 0.44 * breathe));
  bl.addColorStop(0.3, rgb(mix(GLOW_WARM, LED_MAGENTA, 0.52), 0.17 * breathe));
  bl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = bl;
  ctx.fillRect(winX - winW * 3.6, winY - winW * 3.6, winW * 7.2, winW * 7.2);
  ctx.globalCompositeOperation = 'source-over';

  // --- Covered terrace: a second, dimmer warm source on the left end ------
  const tW = cw * 0.155, tH = chh * 0.40;
  const tX = left + cw * 0.085, tY = top + chh * 0.34;
  ctx.fillStyle = rgb(mix(GOLD, [120, 70, 40], 0.35), 0.82);
  ctx.fillRect(tX, tY, tW, tH);

  const tb = ctx.createRadialGradient(
    tX + tW / 2, tY + tH / 2, 0, tX + tW / 2, tY + tH / 2, tW * 3.0);
  tb.addColorStop(0, rgb(GOLD, 0.22 * breathe));
  tb.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = tb;
  ctx.fillRect(tX - tW * 3, tY - tW * 3, tW * 6, tW * 6);
  ctx.globalCompositeOperation = 'source-over';

  // --- Roof line + ground shadow ------------------------------------------
  ctx.fillStyle = 'rgba(6,12,18,0.92)';
  ctx.fillRect(left - cw * 0.012, top - chh * 0.065, cw * 1.024, chh * 0.075);

  // Warm spill from the glazing onto the grass in front of the house
  const spill = ctx.createRadialGradient(
    winX + winW / 2, baseY, 0, winX + winW / 2, baseY, cw * 0.62);
  spill.addColorStop(0, rgb(GLOW_WARM, 0.22 * breathe));
  spill.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = spill;
  ctx.fillRect(winX + winW / 2 - cw * 0.62, baseY - cw * 0.1, cw * 1.24, cw * 0.62);
  ctx.globalCompositeOperation = 'source-over';

  const sh = ctx.createLinearGradient(0, baseY, 0, baseY + chh * 0.5);
  sh.addColorStop(0, 'rgba(0,0,0,0.55)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(left - cw * 0.1, baseY, cw * 1.2, chh * 0.5);

  ctx.restore();
  return { winX, winY, winW, winH, left, right, top, baseY };
}

/**
 * Reflective pool: slice-wise vertical mirror of the upper scene with a
 * travelling sine distortion. Slices are cheap and read as real water.
 */
function drawPool(ctx, W, H, poolTop, phase, upper, geom, soft) {
  const poolH = H - poolTop;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, poolTop, W, poolH);
  ctx.clip();

  // Base water colour
  const wg = ctx.createLinearGradient(0, poolTop, 0, H);
  wg.addColorStop(0, rgb([18, 44, 58]));
  wg.addColorStop(0.5, rgb([11, 28, 40]));
  wg.addColorStop(1, rgb([6, 14, 22]));
  ctx.fillStyle = wg;
  ctx.fillRect(0, poolTop, W, poolH);

  // Sliced reflection
  const slices = 150;
  const sh = poolH / slices;
  ctx.globalAlpha = 1;
  for (let i = 0; i < slices; i++) {
    const t = i / slices;                 // 0 at waterline
    const dy = i * sh;
    const srcY = poolTop - dy * 1.02;     // mirrored source row
    // Three counter-running wave trains, all integer-cycle -> seamless.
    // Amplitude grows with distance from the waterline so the reflection
    // dissolves into the water rather than reading as a hard copy.
    const s = W / 1920;
    const w1 = Math.sin(phase * TAU * 2 + t * 26) * (3 + t * 62) * s;
    const w2 = Math.sin(-phase * TAU + t * 15 + 1.7) * (2 + t * 40) * s;
    const w3 = Math.sin(phase * TAU * 3 + t * 47 + 0.9) * (1 + t * 18) * s;
    const dx = w1 + w2 + w3;
    const squash = 1 + t * 0.45;
    // Break the silhouette up so the reflection never reads as a hard copy.
    const flick = 0.82 + 0.18 * Math.sin(phase * TAU * 2 + t * 61 + 2.3);
    ctx.globalAlpha = clamp(0.30 - t * 0.27, 0, 1) * flick;
    // Sampled from the blurred plate: water carries no sharp edges.
    const k = soft.width / W;
    ctx.drawImage(
      soft,
      0, clamp((srcY - sh) * k, 0, soft.height), soft.width, sh * squash * k,
      dx, poolTop + dy, W, sh + 1.2
    );
  }
  ctx.globalAlpha = 1;

  // Warm specular path under the cabin glazing
  const spec = ctx.createLinearGradient(geom.cx, poolTop, geom.cx, H);
  spec.addColorStop(0, rgb(mix(GLOW_WARM, LED_MAGENTA, 0.38), 0.27));
  spec.addColorStop(0.55, rgb(mix(GLOW_WARM, LED_MAGENTA, 0.55), 0.08));
  spec.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = spec;
  ctx.fillRect(geom.cx - W * 0.13, poolTop, W * 0.26, poolH);
  ctx.globalCompositeOperation = 'source-over';

  // Surface glints
  for (let i = 0; i < 90; i++) {
    const t = (i * 0.0111 + 0.02);
    const y = poolTop + Math.pow(t, 1.5) * poolH;
    const baseX = ((i * 197) % 1000) / 1000;
    const x = (baseX * 1.2 - 0.1) * W
      + Math.sin(phase * TAU + i * 0.9) * (6 + t * 40);
    const len = (8 + t * 70) * (0.5 + 0.5 * Math.sin(phase * TAU * 2 + i));
    const a = clamp((0.16 - t * 0.12), 0, 1)
      * (0.45 + 0.55 * Math.sin(phase * TAU * 2 + i * 1.7));
    if (a <= 0.004) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = '#cfe6f2';
    ctx.fillRect(x, y, len, Math.max(1, H * 0.0016));
  }
  ctx.globalAlpha = 1;

  // Waterline lip
  ctx.fillStyle = 'rgba(150,190,210,0.20)';
  ctx.fillRect(0, poolTop - H * 0.0022, W, H * 0.0022);

  ctx.restore();
}

/** Silhouetted grasses with a wind sway; `depth` drives parallax + blur feel. */
function drawGrass(ctx, W, H, blades, baseY, phase, drift, colour, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colour;
  ctx.lineCap = 'round';
  for (const b of blades) {
    const x = b.x * W + drift;
    if (x < -W * 0.15 || x > W * 1.15) continue;
    const h = b.h * H;
    const sway = Math.sin(phase * TAU * b.sp + b.ph) * b.amp;
    ctx.lineWidth = b.w * (W / 1920) * 2.2;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    // Quadratic-ish chain: tip displaces most.
    let px = x, py = baseY;
    for (let s = 1; s <= b.seg; s++) {
      const t = s / b.seg;
      const bend = (b.lean + sway * 0.035) * h * t * t;
      const nx = x + bend;
      const ny = baseY - h * t;
      ctx.quadraticCurveTo(px, py, nx, ny);
      px = nx; py = ny;
    }
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------------------------------------- composite -- */

/**
 * Draws one full frame.
 * @param {CanvasRenderingContext2D} ctx destination
 * @param {number} W,H  destination size
 * @param {number} phase in [0,1)
 * @param {object} A assets from buildAssets
 * @param {object} scratch { upper, sky } offscreen canvases at W×H
 */
function drawFrame(ctx, W, H, phase, A, scratch) {
  const horizon = H * 0.585;
  const poolTop = H * 0.715;

  // Camera: a slow lateral push that returns exactly, plus a tiny breath.
  const camX = Math.sin(phase * TAU) * W * 0.014;
  const camY = Math.sin(phase * TAU * 2) * H * 0.004;

  const geom = {
    cx: W * 0.565 + camX * 0.55,
    baseY: horizon + H * 0.012 + camY,
    cw: W * 0.255,
    chh: H * 0.115,
  };

  /* --- 1. Sky into its own buffer (reused by the facade) ----------------- */
  const sctx = scratch.sky.getContext('2d');
  sctx.setTransform(1, 0, 0, 1, 0, 0);
  sctx.clearRect(0, 0, W, H);
  sctx.fillStyle = '#05080f';
  sctx.fillRect(0, 0, W, H);
  drawSky(sctx, W, H, horizon, phase, A, camX * 0.35);

  /* --- 2. Upper scene (sky + land + cabin) into a buffer for the pool ---- */
  const uctx = scratch.upper.getContext('2d');
  uctx.setTransform(1, 0, 0, 1, 0, 0);
  uctx.clearRect(0, 0, W, H);
  uctx.drawImage(scratch.sky, 0, 0);
  drawLand(uctx, W, H, horizon, A, camX * 0.5);

  // Mist band drifting across the field, behind the cabin.
  {
    const dw = A.mist.width, dh = A.mist.height;
    const off = Math.round(phase * dw) % dw;
    const my = Math.round(horizon - dh * 0.45 + camY);
    const mdrift = Math.round(camX * 0.6);
    uctx.globalAlpha = 0.5;
    for (let k = -1; k <= 2; k++) {
      uctx.drawImage(A.mist, -off + k * dw + mdrift, my);
    }
    uctx.globalAlpha = 1;
  }

  drawCabin(uctx, W, H, horizon, phase, A, scratch.sky, geom);

  // Field between hedgerow and pool
  {
    const fTop = geom.baseY, fBot = poolTop + H * 0.02;
    const fg = uctx.createLinearGradient(0, fTop, 0, fBot);
    fg.addColorStop(0, rgb(FIELD_FAR));
    fg.addColorStop(1, rgb(FIELD_NEAR));
    uctx.fillStyle = fg;
    uctx.fillRect(0, fTop, W, fBot - fTop);

    // Converging mown furrows: cheap, and they carry the eye to the cabin.
    uctx.save();
    uctx.beginPath(); uctx.rect(0, fTop, W, fBot - fTop); uctx.clip();
    const vpX = geom.cx, vpY = fTop - H * 0.02;
    for (let i = -14; i <= 14; i++) {
      const spread = i * W * 0.085;
      uctx.globalAlpha = 0.038 * (1 - Math.abs(i) / 16);
      if (uctx.globalAlpha <= 0) continue;
      uctx.strokeStyle = i % 2 ? '#8fb08a' : '#05100f';
      uctx.lineWidth = Math.max(1, W * 0.0016);
      uctx.beginPath();
      uctx.moveTo(vpX + spread * 0.06, vpY);
      uctx.lineTo(vpX + spread, fBot + H * 0.05);
      uctx.stroke();
    }
    uctx.globalAlpha = 1;
    uctx.restore();

    // Ground mist hugging the waterline
    const gm = uctx.createLinearGradient(0, poolTop - H * 0.075, 0, poolTop);
    gm.addColorStop(0, 'rgba(150,186,200,0)');
    gm.addColorStop(1, 'rgba(150,186,200,0.13)');
    uctx.fillStyle = gm;
    uctx.fillRect(0, poolTop - H * 0.075, W, H * 0.075);
  }

  /* --- 3. Compose to destination ---------------------------------------- */
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(scratch.upper, 0, 0);

  // Cheap wide blur for the water: downsample, then let drawImage resample up.
  if (!scratch.blur) {
    scratch.blur = createCanvas(
      Math.max(2, Math.round(W / 5)), Math.max(2, Math.round(H / 5)));
  }
  {
    const bw = scratch.blur.width, bh = scratch.blur.height;
    const bctx = scratch.blur.getContext('2d');
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.clearRect(0, 0, bw, bh);
    bctx.drawImage(scratch.upper, 0, 0, bw, bh);
  }

  drawPool(ctx, W, H, poolTop, phase, scratch.upper, geom, scratch.blur);

  /* --- 4. Foreground parallax grasses ----------------------------------- */
  drawGrass(ctx, W, H, A.grassFar, H * 0.995, phase,
    camX * 1.8, 'rgba(6,14,16,0.85)', 0.75);
  drawGrass(ctx, W, H, A.grassNear, H * 1.02, phase,
    camX * 3.2, 'rgba(3,8,10,0.96)', 0.92);

  /* --- 5. Grade: bloom, vignette, grain --------------------------------- */

  // Soft warm light-leak from the horizon side
  const leak = ctx.createRadialGradient(
    W * 0.60, horizon * 0.98, 0, W * 0.60, horizon * 0.98, W * 0.7);
  leak.addColorStop(0, rgb([255, 190, 130], 0.10));
  leak.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = leak;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';

  // Vignette
  const vg = ctx.createRadialGradient(
    W * 0.5, H * 0.52, Math.min(W, H) * 0.30,
    W * 0.5, H * 0.52, Math.max(W, H) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(0.65, 'rgba(0,0,0,0.30)');
  vg.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // Cool shadow lift for a filmic toe
  ctx.globalCompositeOperation = 'lighten';
  ctx.fillStyle = 'rgba(10,20,34,0.22)';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';

  // Grain — cycle tiles so it never freezes, offset per frame.
  const gt = A.grain[Math.floor(phase * A.grain.length * 4) % A.grain.length];
  ctx.globalAlpha = 0.045;
  ctx.globalCompositeOperation = 'overlay';
  const gs = gt.width;
  const ox = -Math.floor((phase * 7919) % gs);
  const oy = -Math.floor((phase * 6521) % gs);
  for (let y = oy; y < H; y += gs) {
    for (let x = ox; x < W; x += gs) ctx.drawImage(gt, x, y);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

module.exports = {
  buildAssets, drawFrame, createCanvas,
  drawSky, drawGrass, treeAt, rgb, mix,
  GLOW_WARM, LED_TEAL, LED_MAGENTA, GOLD, SKY_HORIZON, FIELD_NEAR,
};
