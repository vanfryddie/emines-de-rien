'use strict';
/**
 * Renders one localised page. Every locale gets its own real URL so search
 * engines can index each language and the site works with JS disabled.
 */

const SITE = 'https://vanfryddie.github.io/emines-de-rien/';

const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Strings in the catalogues already carry intentional entities and <br>.
const raw = (s) => String(s);
const attr = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;')
  .replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 5.0 -> 5,0 where the locale wants a comma. */
const num = (s, t) => (t.dec === ',' ? String(s).replace('.', ',') : String(s));

function tpl(s, vars) {
  return String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

/** Locale-aware <picture> with webp + jpeg and an inline placeholder. */
function pic(m, base, sizes, alt, opts) {
  const o = opts || {};
  const set = (ext) => m.widths.map((w) => `${base}assets/img/${m.name}-${w}.${ext} ${w}w`).join(', ');
  const fall = m.widths[Math.min(1, m.widths.length - 1)];
  const load = o.eager ? ' fetchpriority="high"' : ' loading="lazy"';
  return `<picture>
      <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
      <img src="${base}assets/img/${m.name}-${fall}.jpg" srcset="${set('jpg')}" sizes="${sizes}"
           width="${m.w}" height="${m.h}" alt="${attr(alt)}"
           style="background-image:url(${m.lqip})"${load} decoding="async">
    </picture>`;
}

const CARD_IMG = ['p10', 'p16', 'p04', 'p07', 'p14', 'p05'];
const CARD_SIZES = '(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 31vw';
const GAL_SIZES = '(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 30vw';

function render(t, all, manifest) {
  const base = t.dir ? '../' : './';
  const here = t.dir ? SITE + t.dir + '/' : SITE;
  const by = Object.fromEntries(manifest.map((m) => [m.name, m]));

  /* ── language switcher: real links, works without JS ───────────── */
  const langLinks = all.map((o) => {
    const href = o.dir ? SITE + o.dir + '/' : SITE;
    const cur = o.code === t.code;
    return `<li><a href="${href}" hreflang="${o.code}" lang="${o.code}"${
      cur ? ' aria-current="true"' : ''}>${esc(o.name)}</a></li>`;
  }).join('\n          ');

  const alternates = all.map((o) =>
    `<link rel="alternate" hreflang="${o.code}" href="${o.dir ? SITE + o.dir + '/' : SITE}">`
  ).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${SITE}">`;

  /* ── sections ───────────────────────────────────────────────────── */
  const cards = t.inside.cards.map((c, i) => {
    const m = by[CARD_IMG[i]];
    return `
      <li class="card reveal">
        <div class="card__img">${pic(m, base, CARD_SIZES, t.photos[manifest.indexOf(m)])}</div>
        <div class="card__body">
          <h3>${raw(c[0])}</h3>
          <p>${raw(c[1])}</p>
        </div>
      </li>`;
  }).join('');

  const gallery = manifest.map((m, i) => {
    const tall = m.h / m.w > 1.15;
    const wide = m.w / m.h > 1.25;
    const cls = tall ? ' grid__i--tall' : (wide && i % 5 === 0 ? ' grid__i--wide' : '');
    const cap = t.photos[i];
    return `
      <li class="grid__i${cls}">
        <button class="grid__btn" type="button" data-i="${i}"
                aria-label="${attr(tpl(t.gallery.open, { x: cap }))}">
          ${pic(m, base, GAL_SIZES, cap)}
          <span class="grid__cap">${esc(cap)}</span>
        </button>
      </li>`;
  }).join('');

  const facts = t.hero.facts.map((f) => `<li>${raw(f)}</li>`).join('');
  const stats = t.about.stats.map(([k, v]) =>
    `<div><dt>${raw(k)}</dt><dd>${raw(tpl(v, { rating: num('5.0', t) }))}</dd></div>`).join('');
  const scores = t.reviews.scores.map(([v, l]) =>
    `<li><span>${num(v.replace(/[{}]/g, ''), t)}</span> ${raw(l)}</li>`).join('\n      ');
  const quotes = t.reviews.quotes.map(([q, who], i) => `
      <li class="quote reveal"${i ? ` data-d="${i}"` : ''}>
        <p class="stars" aria-label="${attr(t.reviews.starsLabel)}">★★★★★</p>
        <blockquote><p>${esc(q)}</p></blockquote>
        <p class="quote__by">${esc(who)}</p>
      </li>`).join('');
  const ticks = t.book.ticks.map((x) => `<li>${raw(x)}</li>`).join('\n        ');
  const hours = t.visit.rows.map(([k, v]) =>
    `<div><dt>${raw(k)}</dt><dd>${raw(v)}</dd></div>`).join('\n        ');

  /* ── strings the script needs at runtime ────────────────────────── */
  const js = {
    locale: t.locale, code: t.code,
    nights: t.book.nights, arrive: t.book.arrive,
    errIn: t.book.errIn, errOut: t.book.errOut, errOrder: t.book.errOrder,
    errName: t.book.errName, errEmail: t.book.errEmail,
    sending: t.book.sending, sent: t.book.sent, failed: t.book.failed,
    ready: t.book.ready, mailHint: t.book.mailHint,
    copy: t.book.copy, copied: t.book.copied, copyLabel: t.book.copyLabel,
    subject: t.book.subject, c: t.book.c, of: t.lb.of,
  };

  const lbData = manifest.map((m, i) => ({
    s: `${base}assets/img/${m.name}-1600.jpg`, a: t.photos[i],
  }));

  const schema = {
    '@context': 'https://schema.org', '@type': 'LodgingBusiness',
    name: 'Émines de Rien', url: here,
    image: SITE + 'assets/og.jpg',
    slogan: 'Écrin miroir · Balnéo · Cinéma privé',
    description: t.meta.schemaDesc,
    address: { '@type': 'PostalAddress', addressLocality: 'La Bruyère',
               addressRegion: t.meta.region, addressCountry: 'BE' },
    numberOfRooms: 1, petsAllowed: false,
    checkinTime: '17:00', checkoutTime: '11:00',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0',
                       reviewCount: '6', bestRating: '5' },
  };

  return `<!DOCTYPE html>
<html lang="${t.code}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${attr(t.meta.desc)}">
<link rel="canonical" href="${here}">
${alternates}
<meta name="theme-color" content="#08080e">
<meta name="color-scheme" content="dark">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Émines de Rien">
<meta property="og:locale" content="${t.locale.replace('-', '_')}">
<meta property="og:url" content="${here}">
<meta property="og:title" content="${attr(t.meta.ogTitle)}">
<meta property="og:description" content="${attr(t.meta.ogDesc)}">
<meta property="og:image" content="${SITE}assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${attr(t.meta.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(t.meta.ogTitle)}">
<meta name="twitter:description" content="${attr(t.meta.ogDesc)}">
<meta name="twitter:image" content="${SITE}assets/og.jpg">

<link rel="icon" href="${base}assets/icon-32.png" sizes="32x32">
<link rel="icon" href="${base}assets/icon-512.png" sizes="512x512">
<link rel="apple-touch-icon" href="${base}assets/icon-180.png">

<link rel="preload" href="${base}assets/fonts/Fraunces-0.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${base}assets/fonts/InstrumentSans-0.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${base}assets/poster-1280.jpg" as="image" fetchpriority="high">
<link rel="stylesheet" href="${base}fonts.css">
<link rel="stylesheet" href="${base}styles.css">

<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
</head>
<body>
<a class="skip" href="#main">${esc(t.nav.skip)}</a>

<header class="nav" id="nav">
  <a class="brand" href="#top" aria-label="Émines de Rien">
    <img class="brand__mark" src="${base}assets/img/wordmark.png" width="900" height="313"
         alt="Émines de Rien — écrin miroir, balnéo, cinéma privé" fetchpriority="high" decoding="async">
  </a>

  <nav class="nav__links" aria-label="${attr(t.nav.sections)}">
    <a href="#about">${esc(t.nav.house)}</a>
    <a href="#inside">${esc(t.nav.inside)}</a>
    <a href="#gallery">${esc(t.nav.gallery)}</a>
    <a href="#reviews">${esc(t.nav.guests)}</a>
    <a href="#visit">${esc(t.nav.visiting)}</a>
  </nav>

  <details class="lang">
    <summary aria-label="${attr(t.nav.lang)}">
      <span class="lang__code">${t.code.toUpperCase()}</span>
      <svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5 11 1.5" fill="none"
        stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </summary>
    <ul class="lang__menu">
          ${langLinks}
    </ul>
  </details>

  <a class="btn btn--sm btn--primary nav__cta" href="#book">${esc(t.nav.cta)}</a>
</header>

<main id="main">

<section class="hero" id="top">
  <div class="hero__media">
    <video id="heroVideo" class="hero__video"
           poster="${base}assets/poster-1280.jpg"
           muted loop playsinline autoplay preload="none"
           aria-label="${attr(t.hero.videoAlt)}" tabindex="-1"></video>
    <div class="hero__scrim" aria-hidden="true"></div>
  </div>

  <div class="hero__body">
    <p class="eyebrow reveal">Écrin miroir · Balnéo · Cinéma privé</p>
    <h1 class="hero__title reveal" data-d="1">Émines<span class="hero__de"> de </span>Rien</h1>
    <p class="hero__lede reveal" data-d="2">${raw(t.hero.lede)}</p>

    <ul class="facts reveal" data-d="3">${facts}</ul>

    <div class="hero__cta reveal" data-d="4">
      <a class="btn btn--primary" href="#book">${esc(t.hero.ctaBook)}</a>
      <a class="btn btn--ghost" href="#gallery">${esc(t.hero.ctaSee)}</a>
    </div>

    <p class="hero__rating reveal" data-d="5">
      <span class="stars" aria-hidden="true">★★★★★</span>
      ${raw(tpl(t.hero.rating, { v: `<strong>${num('5.0', t)}</strong>` }))}
    </p>
  </div>

  <button class="scroll-cue" type="button" aria-label="${attr(t.hero.cue)}"><span></span></button>
</section>

<section class="section" id="about">
  <div class="wrap about">
    <div class="about__text reveal">
      <p class="eyebrow">${esc(t.about.eyebrow)}</p>
      <h2 class="h2">${raw(t.about.h2)}</h2>
      <div class="prose">
        ${t.about.p.map((p) => `<p>${raw(p)}</p>`).join('\n        ')}
      </div>
      <dl class="stats">${stats}</dl>
    </div>

    <figure class="about__fig reveal" data-d="1">
      ${pic(by.p00, base, '(max-width: 860px) 92vw, 46vw', t.photos[0])}
      <figcaption>${esc(t.photos[0])}</figcaption>
    </figure>
  </div>
</section>

<section class="section section--panel" id="inside">
  <div class="wrap">
    <div class="head reveal">
      <p class="eyebrow">${esc(t.inside.eyebrow)}</p>
      <h2 class="h2">${raw(t.inside.h2)}</h2>
    </div>
    <ul class="cards">${cards}
    </ul>
  </div>
</section>

<section class="section" id="gallery">
  <div class="wrap">
    <div class="head reveal">
      <p class="eyebrow">${esc(t.gallery.eyebrow)}</p>
      <h2 class="h2">${raw(t.gallery.h2)}</h2>
    </div>
  </div>
  <div class="wrap">
    <ul class="grid" id="grid">${gallery}
    </ul>
  </div>
</section>

<section class="para" id="para" aria-label="${attr(t.para.label)}">
  <div class="para__layer para__sky"   data-depth="0.12" aria-hidden="true"></div>
  <div class="para__layer para__hedge" data-depth="0.34" aria-hidden="true"></div>
  <div class="para__layer para__grass" data-depth="0.62" aria-hidden="true"></div>

  <figure class="para__quote reveal">
    <blockquote><p>${esc(t.para.quote)}</p></blockquote>
    <figcaption>${esc(t.para.by)}</figcaption>
  </figure>
</section>

<section class="section" id="reviews">
  <div class="wrap">
    <div class="head reveal">
      <p class="eyebrow">${esc(t.reviews.eyebrow)}</p>
      <h2 class="h2">${raw(t.reviews.h2)}</h2>
    </div>

    <ul class="scores reveal" data-d="1">
      ${scores}
    </ul>

    <ul class="quotes">${quotes}
    </ul>

    <p class="fineprint reveal">${raw(t.reviews.fine)}</p>
  </div>
</section>

<section class="section section--panel" id="book">
  <div class="wrap book">
    <div class="book__intro reveal">
      <p class="eyebrow">${esc(t.book.eyebrow)}</p>
      <h2 class="h2">${raw(t.book.h2)}</h2>
      <p class="prose">${raw(t.book.intro)}</p>
      <ul class="ticks">
        ${ticks}
      </ul>
    </div>

    <form class="book__form reveal" data-d="1" id="bookForm" novalidate>
      <div class="field-row">
        <p class="field">
          <label for="bkIn">${esc(t.book.lIn)}</label>
          <input type="date" id="bkIn" name="checkin" required>
        </p>
        <p class="field">
          <label for="bkOut">${esc(t.book.lOut)}</label>
          <input type="date" id="bkOut" name="checkout" required>
        </p>
      </div>

      <p class="field">
        <label for="bkGuests">${esc(t.book.lGuests)}</label>
        <select id="bkGuests" name="guests">
          <option value="1">${esc(t.book.g1)}</option>
          <option value="2" selected>${esc(t.book.g2)}</option>
        </select>
        <span class="hint">${esc(t.book.hint)}</span>
      </p>

      <p class="nights" id="bkNights" aria-live="polite"></p>

      <div class="field-row">
        <p class="field">
          <label for="bkName">${esc(t.book.lName)}</label>
          <input type="text" id="bkName" name="name" autocomplete="name" required>
        </p>
        <p class="field">
          <label for="bkEmail">${esc(t.book.lEmail)}</label>
          <input type="email" id="bkEmail" name="email" autocomplete="email" required>
        </p>
      </div>

      <p class="field">
        <label for="bkPhone">${esc(t.book.lPhone)} <span class="opt">${esc(t.book.opt)}</span></label>
        <input type="tel" id="bkPhone" name="phone" autocomplete="tel">
      </p>

      <p class="field">
        <label for="bkMsg">${esc(t.book.lMsg)} <span class="opt">${esc(t.book.opt)}</span></label>
        <textarea id="bkMsg" name="message" rows="3"></textarea>
      </p>

      <button class="btn btn--primary btn--full" type="submit" id="bkSubmit">${esc(t.book.submit)}</button>
      <p class="book__status" id="bkStatus" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>

<section class="section" id="visit">
  <div class="wrap grid-2">
    <div class="reveal">
      <p class="eyebrow">${esc(t.visit.eyebrow)}</p>
      <h2 class="h2">${raw(t.visit.h2)}</h2>
      <dl class="hours">
        ${hours}
      </dl>
      <p class="note">${raw(t.visit.note)}</p>
    </div>

    <div class="reveal" data-d="1">
      <p class="eyebrow">${esc(t.visit.whereEyebrow)}</p>
      <h2 class="h2">${raw(t.visit.whereH2)}</h2>
      <p class="prose">${raw(t.visit.whereP)}</p>
      <a class="btn btn--ghost"
         href="https://www.google.com/maps/dir/?api=1&amp;destination=La%20Bruy%C3%A8re%2C%20Namur%2C%20Belgium"
         target="_blank" rel="noopener">${esc(t.visit.maps)}</a>
    </div>
  </div>
</section>

</main>

<footer class="foot" id="contact">
  <div class="wrap foot__grid">
    <div class="reveal">
      <img class="foot__mark" src="${base}assets/img/wordmark.png" width="900" height="313"
           alt="Émines de Rien" loading="lazy" decoding="async">
      <p class="foot__where">${esc(t.foot.where)}</p>
    </div>

    <div class="reveal" data-d="1">
      <h2 class="foot__h">${esc(t.foot.hosts)}</h2>
      <p class="prose">${raw(t.foot.hostsP)}</p>
    </div>

    <div class="reveal" data-d="2">
      <h2 class="foot__h">${esc(t.foot.touch)}</h2>
      <p class="prose">${raw(t.foot.touchP)}</p>
      <div class="foot__cta"><a class="btn btn--primary" href="#book">${esc(t.foot.cta)}</a></div>
    </div>
  </div>

  <nav class="foot__langs" aria-label="${attr(t.nav.lang)}">
    <ul>
      ${all.map((o) => {
        const href = o.dir ? SITE + o.dir + '/' : SITE;
        return `<li><a href="${href}" hreflang="${o.code}" lang="${o.code}"${
          o.code === t.code ? ' aria-current="true"' : ''}>${esc(o.name)}</a></li>`;
      }).join('\n      ')}
    </ul>
  </nav>

  <div class="wrap foot__base">
    <p>© <span id="yr">2026</span> Émines de Rien</p>
    <p>Écrin miroir · Balnéo · Cinéma privé</p>
  </div>
</footer>

<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="${attr(t.lb.dialog)}">
  <button class="lb__close" id="lbClose" type="button" aria-label="${attr(t.lb.close)}">&times;</button>
  <button class="lb__nav lb__prev" id="lbPrev" type="button" aria-label="${attr(t.lb.prev)}">&#8249;</button>
  <figure class="lb__fig">
    <img class="lb__img" id="lbImg" alt="">
    <figcaption class="lb__cap" id="lbCap"></figcaption>
  </figure>
  <button class="lb__nav lb__next" id="lbNext" type="button" aria-label="${attr(t.lb.next)}">&#8250;</button>
</div>

<script id="lbData" type="application/json">${JSON.stringify(lbData)}</script>
<script id="i18n" type="application/json">${JSON.stringify(js)}</script>
<script src="${base}main.js" defer></script>
</body>
</html>
`;
}

module.exports = { render, SITE };
