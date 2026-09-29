'use strict';
/**
 * Renders the hero loop and pipes raw frames straight into ffmpeg.
 * Frame 0 is also written out as the poster, so the poster→video handoff
 * has no visible jump.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const { buildAssets, drawFrame, createCanvas } = require('./scene');

const W = 1920, H = 1080;
const FPS = 30, SECONDS = 12;
const FRAMES = FPS * SECONDS;

const OUT = path.join(__dirname, '..', 'site', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const mp4 = path.join(OUT, 'hero-1080.mp4');

const args = [
  '-y',
  '-f', 'rawvideo',
  '-pixel_format', 'rgba',
  '-video_size', `${W}x${H}`,
  '-framerate', String(FPS),
  '-i', 'pipe:0',
  '-an',
  '-c:v', 'libx264',
  '-preset', 'slower',
  '-crf', '20',
  '-pix_fmt', 'yuv420p',
  '-profile:v', 'high',
  '-level', '4.0',
  // Short GOP keeps the loop point crisp when the browser restarts playback.
  '-g', String(FPS * 2),
  '-movflags', '+faststart',
  mp4,
];

const proc = spawn(ffmpeg, args, { stdio: ['pipe', 'ignore', 'pipe'] });
let ffErr = '';
proc.stderr.on('data', (d) => { ffErr += d.toString(); });

function write(buf) {
  return new Promise((res) => {
    if (proc.stdin.write(buf)) res();
    else proc.stdin.once('drain', res);
  });
}

(async () => {
  console.log('building assets…');
  const A = buildAssets(W, H);
  const scratch = { upper: createCanvas(W, H), sky: createCanvas(W, H) };
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const t0 = Date.now();
  for (let f = 0; f < FRAMES; f++) {
    const phase = f / FRAMES;              // never reaches 1 -> clean wrap
    drawFrame(ctx, W, H, phase, A, scratch);

    if (f === 0) {
      fs.writeFileSync(path.join(OUT, 'poster-1920.jpg'),
        canvas.encodeSync('jpeg', 84));
      const small = createCanvas(1280, 720);
      small.getContext('2d').drawImage(canvas, 0, 0, 1280, 720);
      fs.writeFileSync(path.join(OUT, 'poster-1280.jpg'),
        small.encodeSync('jpeg', 80));
      const tiny = createCanvas(32, 18);
      tiny.getContext('2d').drawImage(canvas, 0, 0, 32, 18);
      fs.writeFileSync(path.join(OUT, 'poster-blur.jpg'),
        tiny.encodeSync('jpeg', 60));
    }

    const data = ctx.getImageData(0, 0, W, H).data;
    await write(Buffer.from(data.buffer, data.byteOffset, data.byteLength));

    if (f % 45 === 0 || f === FRAMES - 1) {
      const pct = (((f + 1) / FRAMES) * 100).toFixed(0);
      process.stdout.write(`  frame ${f + 1}/${FRAMES} (${pct}%)\n`);
    }
  }
  proc.stdin.end();

  const code = await new Promise((res) => proc.on('close', res));
  if (code !== 0) {
    console.error(ffErr.slice(-3000));
    process.exit(1);
  }
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const mb = (fs.statSync(mp4).size / 1048576).toFixed(2);
  console.log(`\n1080p master: ${mb} MB in ${secs}s`);
})();
