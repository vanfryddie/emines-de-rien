# Émines de Rien — website

A standalone one-page site for the mirror-clad tiny house in La Bruyère, Wallonia,
in seven languages. No framework, no build step at serve time: plain HTML, one
stylesheet, one script shared by every language.

```
site/
  index.html        English (also the x-default)
  fr/ de/ nl/       French, German, Dutch
  pl/ es/ it/       Polish, Spanish, Italian
  styles.css        design system + layout
  fonts.css         self-hosted @font-face (Fraunces + Instrument Sans)
  main.js           video, parallax, lightbox, booking form
  robots.txt
  sitemap.xml       all seven URLs with hreflang alternates
  assets/
    hero-1080.mp4   12s cinematic loop, 1920×1080 (4.5 MB)
    hero-1080.webm  same loop, VP9 (1.1 MB — preferred where supported)
    hero-720.mp4    mobile variant (1.1 MB)
    poster-*.jpg    poster frame = frame 0 of the loop, so there is no jump
    layer-*.{jpg,png}  the three parallax depths
    og.jpg          1200×630 social card
    icon-*.png      favicons
    fonts/          woff2
    img/            17 photographs at 480/960/1600 in WebP + JPEG, plus
                    manifest.json and the hosts' wordmark
```

## ► Turning on the booking form

Open `main.js`. The first thing in the file is:

```js
var BOOKING = {
  endpoint: '',   // a form service URL — POSTs the request as JSON
  email:    '',   // the hosts' address — opens the guest's mail app, pre-filled
};
```

Set **one** of them and the form is live.

* `endpoint` — sign up for Formspree / Basin / Netlify Forms, paste the URL.
  Requests arrive by email; nothing else to host.
* `email` — simplest option. The guest's mail client opens with the whole
  request already written out.

With both empty the form still validates, computes nights, composes the request
and offers it for copying, so nobody reaches a dead end. No booking is ever
silently lost.

## Languages

Seven locales, each on its own URL so search engines index them separately and
the site works with JavaScript disabled:

| | | |
|---|---|---|
| `/` | English | x-default |
| `/fr/` | Français | the hosts' own language |
| `/de/` | Deutsch | guest reviews use Airbnb's own German text |
| `/nl/` | Nederlands | |
| `/pl/` | Polski | three plural forms: 1 noc / 2–4 noce / 5+ nocy |
| `/es/` | Español | |
| `/it/` | Italiano | |

Every page carries `hreflang` alternates for all seven plus `x-default`, its own
`<html lang>`, localised metadata and JSON-LD, and locale-aware number and date
formatting (`5,0` and `ven. 5 mars 2027` in French, `5.0` and `Fri, 5 March 2027`
in English).

The copy lives in `render/i18n/<code>.js` — one file per language, same keys in
each. `render/build.js` refuses to build if a catalogue is missing a key, has a
different number of photo captions or cards, or has a plural form without `{n}`,
so a half-translated language cannot ship by accident.

**To change wording**, edit the catalogue and re-run `node render/build.js`.
Never edit `site/**/index.html` directly — it is generated and will be overwritten.

**To add a language**: copy `render/i18n/en.js`, translate the values, add its
code to `CODES` in `render/build.js`, and rebuild.

## Deploying

Any static host. The page uses only relative paths, so it works from a
subdirectory as well as from a domain root.

* **GitHub Pages** — push this folder, then Settings → Pages → deploy from branch.
* **Netlify / Cloudflare Pages / Vercel** — drag the folder in; no build command.

The live origin is set in one place — `SITE` at the top of `render/page.js`.
Change it and rebuild; canonicals, `og:url`, `hreflang` and the sitemap all
follow.

## Regenerating the assets

The generators live in `../render` and need `npm i` once:

```bash
node render/video.js      # renders + encodes the hero loop and its poster
node render/transcode.js  # 720p mp4 + 1080p webm from that master
node render/assets.js     # parallax layers
node render/photos.js     # responsive images + manifest + wordmark keying
node render/og.js         # social card + favicons
node render/build.js      # renders all seven localised pages + sitemap
```

`render/serve.js` is a small static server for local preview on :4321.

## What the content is based on

Every factual claim — the room, the amenities, check-in hours, the ratings and
the guest quotes — comes from the property's own Airbnb listing. Nothing about
prices, awards or history is asserted anywhere, because the listing publishes
none. The reviews are reproduced verbatim as Airbnb renders them in English;
some were machine-translated by Airbnb from the original.
