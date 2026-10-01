# Implementation plan

Mapped to the brief's phases. Each phase ends with the existing site verified
un-regressed: rebuild, all 7 locales 200, visual diff clean.

| | Phase | Depends on | Est. |
|---|---|---|---|
| ✅ | **1. Audit** — repo, hosting, Beds24, multilingual | — | done |
| 🔒 | **2. Config + content extraction** — three-way split, `.env.example`, settings out of the 7 catalogues | Q2 (stack) | ~1 session |
| 🔒 | **3. PHP port + provider abstraction** — page render to PHP, `BookingProvider` + Mock adapter, output diffed against current HTML | 2 | ~2 sessions |
| 🔒 | **4. Beds24 adapter** — availability, offers/quote, stay rules, caching, failure handling | 3 + **credentials** | ~1–2 |
| 🔒 | **5. Booking UI** — calendar, price breakdown, extras, all 7 locales | 4 | ~2 |
| 🔒 | **6. Checkout** — handoff or custom per Decision 2, confirmation screen | 5 + Stripe | ~1 |
| 🔒 | **7. Admin CMS** — auth, content, photo upload/reorder, extras, experiences, reviews | 2, 3 | ~2 |
| 🔒 | **8. Experiences + social + SEO** — section, OG, breadcrumbs, GA4 slot, 404 | 7 | ~1 |
| 🔒 | **9. Privacy / security / a11y** — policy pages, consent, CSRF, rate limit, headers, WCAG pass | 8 | ~1 |
| 🔒 | **10. Testing + OVH deploy + handover** — full matrix, deployment docs, runbook | all | ~1–2 |

🔒 = blocked or not started.

## Blocked on you

| # | Needed | Blocks |
|---|---|---|
| 1 | Beds24 API v2 invite code + property/room IDs | Phases 4–6 live. Architecture and mock proceed without it. |
| 2 | Which OVH plan (PHP version, SSH, MySQL) | Phase 2–3 — confirms PHP 8.4 and whether `mod_headers` works |
| 3 | Booking model: Option A or B (`docs/02-ARCHITECTURE.md`) | Phase 6 |
| 4 | Stripe connected in Beds24 via the *Connect* button? | Phase 6 — API-key connections cannot auto-charge |
| 5 | The real domain | canonical, hreflang, OG, sitemap |
| 6 | Legal/business details for the required Belgian pages | Phase 9 — will not be invented |
| 7 | Instagram / Facebook URLs | Phase 8 — platform stays hidden until supplied |

## Rules held throughout

- **No faked functionality.** The mock adapter is loudly labelled and refuses to
  run when `APP_ENV=production`. No fake calendar, no fake payment, no claimed
  sync that did not happen (§21).
- **Production fails loudly** on missing configuration rather than degrading.
- **French is primary.** Missing translations fall back to French, never English.
- **No secrets in git or in frontend JS**, ever.
- **The design is not up for redesign.** Booking UI is built from the existing
  tokens in `styles.css` — gold, Fraunces, the dark palette, the same motion
  grammar and `prefers-reduced-motion` behaviour.
- **Testing means behaviour, not rendering** (§22). A UI that draws a calendar
  is not a working calendar.
