const fs = require('fs'); const path = require('path');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const FD = 'site/assets/fonts'; fs.mkdirSync(FD, { recursive: true });
// Variable ranges -> Google returns ONE @font-face per subset with a weight range.
const specs = [
  ['Fraunces', 'Fraunces:opsz,wght@9..144,300..600'],
  ['InstrumentSans', 'Instrument+Sans:wght@400..600'],
];
(async () => {
  const pending = []; let css = '';
  for (const [name, q] of specs) {
    const r = await fetch(`https://fonts.googleapis.com/css2?family=${q}&display=swap`,
      { headers: { 'User-Agent': UA } });
    const t = await r.text();
    if (!r.ok) { console.error(name, r.status, t.slice(0, 300)); process.exit(1); }
    // Keep every `latin` block (not latin-ext / vietnamese) to cut bytes.
    const keep = t.split(/(?=\/\* )/).filter(b => /^\/\* latin \*\//.test(b.trim()));
    if (!keep.length) { console.error(name, 'no latin block'); process.exit(1); }
    let i = 0;
    css += keep.join('').replace(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g, (m, u) => {
      const f = `${name}-${i++}.woff2`;
      pending.push([u, path.join(FD, f)]);
      return `url(./assets/fonts/${f})`;
    });
  }
  for (const [u, dest] of pending) {
    const b = Buffer.from(await (await fetch(u, { headers: { 'User-Agent': UA } })).arrayBuffer());
    fs.writeFileSync(dest, b);
    console.log('woff2', path.basename(dest), (b.length / 1024).toFixed(1) + 'kb');
  }
  fs.writeFileSync('site/fonts.css', css);
  console.log('---'); console.log(css.replace(/unicode-range:[^;]+;/g, 'unicode-range: …;'));
})();
