# Phase 1 — Audit

Written 2026-10-01. Findings only; decisions are in `02-ARCHITECTURE.md`.

## 1. What exists today

A **static site generator**, not a hand-written site. This matters: the design
is already separated from the content.

```
render/              build-time only, never shipped
  i18n/{en,fr,de,nl,pl,es,it}.js   177 strings each = 1,239 translated strings
  page.js      445 lines   HTML template — renders one locale
  build.js      89 lines   renders all 7 + sitemap + robots; validates catalogues
  scene.js     752 lines   procedural dusk scene (hero video, parallax plates)
  photos.js    120 lines   responsive image pipeline + wordmark keying
  video.js / transcode.js / assets.js / og.js / promo.js / serve.js

site/                the deployable artefact (39 MB)
  index.html + fr|de|nl|pl|es|it/index.html   GENERATED — never hand-edit
  styles.css   700 lines   the design system
  main.js      484 lines   video, parallax, lightbox, booking form
  assets/      121 files   video 6.8 MB, images 15 MB, fonts 95 kB
```

**Verified during audit**

- Rebuild is deterministic — `node render/build.js` reproduces both `index.html`
  and `fr/index.html` byte-identically. Safe to regenerate at any time.
- All 7 locales serve 200 locally and in production.
- Build already *validates* catalogues: it refuses to build on a missing key, a
  wrong caption count, or a plural form without `{n}`. This guard should be
  extended, not replaced.
- No secrets committed. No PII in `site/`. Only three outbound hosts in the
  shipped HTML (`schema.org`, the Pages origin, `google.com/maps`).

## 2. Current quality baseline

Measured, not asserted.

| | |
|---|---|
| Initial payload | html 63 kB · css 26 kB · js 17 kB · fonts 95 kB (≈ 482 kB before the deferred video) |
| Load (local) | 596 ms, 11 requests |
| Images | all have alt; responsive srcset at 480/960/1600 in WebP + JPEG; LQIP placeholders; lazy below fold |
| Landmarks | header / nav / main / footer / section present |
| Motion | `prefers-reduced-motion` honoured in both CSS and JS |
| SEO present | canonical, 22 hreflang refs, OG, Twitter card, JSON-LD `LodgingBusiness` + `AggregateRating` |

**This is a good foundation. The brief is right that it should not be redesigned.**

## 3. Gaps against the brief

| Brief | Status |
|---|---|
| §9 404 handling | ✗ no `404.html` — needed for both Pages and OVH |
| §9 BreadcrumbList / FAQPage schema | ✗ |
| §9 GA4 | ✗ (correctly absent — must be configurable, not hard-coded) |
| §8 Instagram / Facebook | ✗ nothing |
| §14 privacy / cookie / legal pages | ✗ nothing |
| §14 `.env.example` | ✗ |
| §7 local experiences | ✗ nothing |
| §2 booking | ✗ form composes an email; no availability, no price, no payment |
| §5 admin | ✗ nothing — every change needs a developer |

## 4. Hard-coded values that must become configuration

This is the single most important audit finding for maintainability.

**Duplicated across all 7 catalogues — one business change = 7 file edits:**

| Value | Where |
|---|---|
| Check-in `17:00–20:00`, check-out `11:00` | 7 × `i18n/*.js`, plus `page.js` JSON-LD |
| Pool size `8 × 4 m` | 7 × |
| Max 2 guests | 7 × |
| Ratings `5.0 / 4.8 / 4.7`, review count `6` | 7 × + JSON-LD |
| Host names "Céline & Stéphane" | 7 × |
| "3 years hosting", "<1 hr reply" | 7 × |
| 3 guest reviews (verbatim text) | 7 × |
| 17 photo captions | 7 × |

**Hard-coded in code, not editable at all:**

| Value | Location |
|---|---|
| `SITE` origin | `page.js:7` |
| Which photos appear as feature cards | `page.js:37` `CARD_IMG` |
| Which 17 photos appear at all, and their order | `photos.js:18` `PICKS` |
| Google Maps destination string | `page.js:383` |
| `checkinTime` / `checkoutTime` / rating in schema | `page.js:126–128` |
| Booking destination | `main.js:22` `BOOKING` |

### The content-model conclusion

Not all 1,239 strings are owner content. They split cleanly:

- **Owner content (~40 fields per locale)** — hero lede, the three About
  paragraphs, practical info, host blurb, captions, reviews, experiences.
  *Belongs in the CMS.*
- **UI chrome (~137 per locale)** — button labels, form labels, validation
  messages, aria-labels, plural forms.
  *Stays developer-maintained; the owner must never be able to break the
  booking form by editing a validation string.*
- **Business facts (~12 values, locale-independent)** — times, occupancy,
  pool size, social URLs, maps destination, analytics ID.
  *Belongs in settings, stored once, rendered into all 7 locales.*

That three-way split is the backbone of the CMS design.

## 5. External constraints discovered

Researched against current vendor documentation this session. Full detail and
source URLs in `03-BEDS24.md` and `04-HOSTING.md`.

### Beds24 — the five findings that drive the architecture

1. **API v1 is deprecated; v2 is current.** v2 uses a `token` header (not
   `Authorization: Bearer`), obtained invite code → refresh token → access
   token. Scopes are immutable once the invite code is created.
2. **There is a real quoted-price endpoint.** `GET /inventory/rooms/offers`
   returns *calculated* prices for an arrival/departure/occupancy — exactly what
   §3 requires. `GET /inventory/rooms/calendar` returns the raw rate table. We
   display the authoritative quote and never recompute it.
3. **No holds, no locking, no idempotency key is documented.** This is the
   biggest risk in the brief. Beds24's own booking page emulates a hold via a
   blocking "Request" status; the API documents no equivalent.
4. **Prices are not calculated for API-created bookings** — the caller must send
   `price`. So a custom funnel must quote, then write that quote back.
5. **Rate limiting is credit-based**, 100 credits / 5 min by default, with
   per-request cost returned in `x-request-cost`. A public availability calendar
   must cache aggressively or it will exhaust the budget.

Also relevant: payment runs through `POST /channels/stripe`, which returns a
**Stripe Checkout session on the owner's own Stripe account via Connect** — so
cards never touch our server and there is no PCI-DSS burden. There is **no
sandbox**.

### OVH — the constraint that decides the stack

- Shared hosting runs **PHP (8.4 / 8.5 current), and does not run Node.js.**
  No long-lived processes, no port binding.
- **No environment-variable mechanism** on shared hosting. Secrets must live in
  a PHP file outside the web root.
- Cron is **hourly at best**, 60-minute cap.
- MySQL included (30 connections, not externally reachable). Let's Encrypt free.
- `mod_headers` for security headers is **unconfirmed** on shared hosting — must
  be tested on the actual plan.
- Node.js would require a VPS.

**Consequence:** the Node build pipeline is a *developer-time* tool. It cannot
be the production runtime on the owner's hosting. Anything the owner edits
himself must be rendered by PHP.
