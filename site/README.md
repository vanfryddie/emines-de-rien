# Émines de Rien — website

A standalone one-page site for the mirror-clad tiny house in La Bruyère, Wallonia.
No framework, no build step at serve time: plain HTML, one stylesheet, one script.

```
site/
  index.html        the page
  styles.css        design system + layout
  fonts.css         self-hosted @font-face (Fraunces + Instrument Sans)
  main.js           video, parallax, lightbox, booking form
  robots.txt
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

## Deploying

Any static host. The page uses only relative paths, so it works from a
subdirectory as well as from a domain root.

* **GitHub Pages** — push this folder, then Settings → Pages → deploy from branch.
* **Netlify / Cloudflare Pages / Vercel** — drag the folder in; no build command.

Once the final domain is known, add it back in `index.html`:

```html
<link rel="canonical" href="https://your-domain/">
<meta property="og:url" content="https://your-domain/">
```

and make `og:image` absolute (`https://your-domain/assets/og.jpg`) — some
scrapers won't resolve a relative one.

## Regenerating the assets

The generators live in `../render` and need `npm i` once:

```bash
node render/video.js      # renders + encodes the hero loop and its poster
node render/transcode.js  # 720p mp4 + 1080p webm from that master
node render/assets.js     # parallax layers
node render/photos.js     # responsive images + manifest + wordmark keying
node render/og.js         # social card + favicons
node render/build.js      # injects photography into index.html (idempotent)
```

`render/serve.js` is a small static server for local preview on :4321.

## What the content is based on

Every factual claim — the room, the amenities, check-in hours, the ratings and
the guest quotes — comes from the property's own Airbnb listing. Nothing about
prices, awards or history is asserted anywhere, because the listing publishes
none. The reviews are reproduced verbatim as Airbnb renders them in English;
some were machine-translated by Airbnb from the original.
