const { spawnSync } = require('child_process');
const ff = require('ffmpeg-static');
const A = 'site/assets';
function run(label, args) {
  process.stdout.write(label + '… ');
  const r = spawnSync(ff, ['-y', ...args], { encoding: 'utf8' });
  console.log(r.status === 0 ? 'ok' : 'FAIL\n' + r.stderr.slice(-1500));
}
run('720p mp4', ['-i', `${A}/hero-1080.mp4`, '-vf', 'scale=1280:720:flags=lanczos',
  '-c:v', 'libx264', '-preset', 'slower', '-crf', '23', '-pix_fmt', 'yuv420p',
  '-g', '60', '-movflags', '+faststart', '-an', `${A}/hero-720.mp4`]);
run('1080p webm', ['-i', `${A}/hero-1080.mp4`, '-c:v', 'libvpx-vp9',
  '-crf', '34', '-b:v', '0', '-row-mt', '1', '-g', '60', '-an',
  `${A}/hero-1080.webm`]);
