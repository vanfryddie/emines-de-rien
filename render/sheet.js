// Contact sheet of the promo at fixed timecodes, to judge the edit.
const { spawnSync } = require('child_process');
const fs = require('fs'); const path = require('path');
const ff = require('ffmpeg-static');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const SRC = 'site/assets/promo-vertical.mp4';
const TS = [13.5, 14.2, 25.0, 26.0];
fs.mkdirSync('render/sheet', { recursive: true });
TS.forEach((t, i) => {
  const r = spawnSync(ff, ['-y', '-ss', String(t), '-i', SRC, '-frames:v', '1',
    '-q:v', '2', `render/sheet/${i}.jpg`], { encoding: 'utf8' });
  if (r.status !== 0) console.error(r.stderr.slice(-400));
});
(async () => {
  const cols = 4, cw = 330, ch = 586;
  const c = createCanvas(cols * cw, Math.ceil(TS.length / cols) * ch);
  const x = c.getContext('2d');
  x.fillStyle = '#111'; x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < TS.length; i++) {
    const f = `render/sheet/${i}.jpg`;
    if (!fs.existsSync(f)) continue;
    const im = await loadImage(fs.readFileSync(f));
    const col = i % cols, row = Math.floor(i / cols);
    x.drawImage(im, col * cw + 2, row * ch + 2, cw - 4, ch - 4);
    x.fillStyle = '#fff'; x.font = 'bold 20px sans-serif';
    x.strokeStyle = '#000'; x.lineWidth = 4;
    x.strokeText(TS[i] + 's', col * cw + 10, row * ch + 28);
    x.fillText(TS[i] + 's', col * cw + 10, row * ch + 28);
  }
  fs.writeFileSync('render/promo-sheet.jpg', c.encodeSync('jpeg', 84));
  console.log('sheet', c.width + 'x' + c.height);
})();
