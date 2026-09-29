const fs = require('fs');
const { buildAssets, drawFrame, createCanvas } = require('./scene');
const W = 1920, H = 1080;
console.time('assets');
const A = buildAssets(W, H);
console.timeEnd('assets');
const scratch = { upper: createCanvas(W, H), sky: createCanvas(W, H) };
const c = createCanvas(W, H);
const ctx = c.getContext('2d');
const phases = [0, 0.25, 0.5];
for (const p of phases) {
  console.time('frame' + p);
  drawFrame(ctx, W, H, p, A, scratch);
  console.timeEnd('frame' + p);
  fs.writeFileSync(`render/preview_${p}.jpg`, c.encodeSync('jpeg', 88));
}
console.log('ok');
