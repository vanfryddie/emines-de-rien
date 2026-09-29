const fs = require('fs');
const { buildAssets, drawFrame, createCanvas } = require('./scene');
const W = 1920, H = 1080;
const A = buildAssets(W, H);
const scratch = { upper: createCanvas(W, H), sky: createCanvas(W, H) };
const c = createCanvas(W, H); const ctx = c.getContext('2d');
drawFrame(ctx, W, H, 0.5, A, scratch);
fs.writeFileSync('render/lossless.png', c.encodeSync('png'));
// Crop the suspect sky region and blow it up to inspect for seams.
const cc = createCanvas(900, 500); const cx2 = cc.getContext('2d');
cx2.imageSmoothingEnabled = false;
cx2.drawImage(c, 1200, 60, 450, 250, 0, 0, 900, 500);
fs.writeFileSync('render/crop.png', cc.encodeSync('png'));
console.log('ok');
