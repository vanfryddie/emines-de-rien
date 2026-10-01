'use strict';
/**
 * Builds every localised page from the catalogues in i18n/ plus the image
 * manifest, and writes a sitemap carrying the hreflang alternates.
 *
 *   node render/build.js
 */
const fs = require('fs');
const path = require('path');
const { render, SITE } = require('./page');
const settings = require('./settings');

const ROOT = path.join(__dirname, '..', 'site');
const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'assets/img/manifest.json'), 'utf8'));

// English first: it owns the root URL and is the x-default.
const CODES = ['en', 'fr', 'de', 'nl', 'pl', 'es', 'it'];
// Business facts live in var/settings.json; the catalogues reference them as
// {placeholders}. Resolve them once, here, so page.js only ever sees final text.
const SETTINGS = settings.load();
const all = CODES.map((c) => {
  const t = require(`./i18n/${c}.js`);
  return Object.assign(settings.resolve(t, settings.tokens(SETTINGS, t)),
    { code: t.code, name: t.name, locale: t.locale, dir: t.dir, dec: t.dec });
});

/* ── sanity: every catalogue must carry the same keys and counts ──── */
const ref = all[0];
const problems = [];

/** Plural sets legitimately differ by language (pl: one/few/many). */
function checkPlural(code, obj, p) {
  const ok = obj && obj.one && (obj.other || (obj.few && obj.many));
  if (!ok) problems.push(`${code}: ${p} needs one + (other | few & many)`);
  for (const [k, v] of Object.entries(obj || {})) {
    if (!/\{n\}/.test(v)) problems.push(`${code}: ${p}.${k} is missing {n}`);
  }
}

function walk(code, a, b, p) {
  for (const k of Object.keys(a)) {
    const at = `${p}${k}`;
    if (at === 'book.nights') { checkPlural(code, b[k], at); continue; }
    if (!(k in b)) { problems.push(`${code}: missing ${at}`); continue; }
    const av = a[k], bv = b[k];
    if (Array.isArray(av)) {
      if (!Array.isArray(bv)) problems.push(`${code}: ${at} is not an array`);
      else if (av.length !== bv.length) {
        problems.push(`${code}: ${at} has ${bv.length} entries, expected ${av.length}`);
      }
    } else if (av && typeof av === 'object') {
      if (bv && typeof bv === 'object') walk(code, av, bv, `${at}.`);
      else problems.push(`${code}: ${at} is not an object`);
    } else if (typeof bv !== 'string') {
      problems.push(`${code}: ${at} is not a string`);
    }
  }
}
for (const t of all) walk(t.code, ref, t, '');
if (problems.length) {
  console.error('Catalogue mismatch:\n  ' + problems.join('\n  '));
  process.exit(1);
}

/* ── write the pages ──────────────────────────────────────────────── */
let total = 0;
for (const t of all) {
  const html = render(t, all, manifest);
  const dir = t.dir ? path.join(ROOT, t.dir) : ROOT;
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, html);
  total += Buffer.byteLength(html);
  console.log(`  ${(t.dir || '/').padEnd(4)} ${t.name.padEnd(11)} ${(Buffer.byteLength(html) / 1024).toFixed(1)} kB`);
}

/* ── sitemap with hreflang alternates on every entry ──────────────── */
const urlOf = (t) => (t.dir ? SITE + t.dir + '/' : SITE);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${all.map((t) => `  <url>
    <loc>${urlOf(t)}</loc>
${all.map((o) => `    <xhtml:link rel="alternate" hreflang="${o.code}" href="${urlOf(o)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}"/>
    <changefreq>monthly</changefreq>
    <priority>${t.dir ? '0.8' : '1.0'}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

fs.writeFileSync(path.join(ROOT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

console.log(`\n${all.length} locales, ${(total / 1024).toFixed(0)} kB of HTML, sitemap + robots written.`);
