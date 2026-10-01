# Phase 2 — Proposed architecture

Decisions and rationale. **Not yet implemented** — this document exists to be
argued with before any architectural change is made (brief §Phase 1).

---

## Decision 1 — Runtime stack: PHP 8.4 on the owner's OVH hosting

**Forced by the hosting.** OVH shared hosting runs PHP and does not run Node.js.
The brief requires the frontend to stay deployable to OVH (§18) and forbids
developer-owned services the owner cannot control (§19).

```
OVH shared hosting  (owner's domain, owner's account, owner's Stripe)
├── /                     static assets: css, js, fonts, images, video
├── *.php                 page rendering (7 locales)
├── /api/*.php            booking proxy — holds the Beds24 secret
├── /admin/*.php          owner CMS, session-authenticated
├── /var/  (outside webroot)
│     config.php          secrets — never in git, never served
│     content/*.json      owner-edited content
│     uploads/            owner-uploaded photography
└── MySQL                 bookings log, admin users, sessions
```

Nothing here requires a vendor the owner does not already pay for. No Vercel,
no Netlify, no developer-hosted anything.

**Cost:** the Node build pipeline becomes developer-time only. Page rendering is
ported from `render/page.js` to PHP templates.

**What that port does and does not touch.** It changes the templating language
only. `styles.css`, `main.js`, the fonts, the hero video, the parallax plates,
the image pipeline output and the procedural scene are all untouched. The
rendered HTML stays structurally identical — which is testable: the port is
correct when the PHP output diffs clean against the current generated HTML.
That is the acceptance criterion, and it is how the visual identity is
protected through the migration.

`render/` is kept. It still generates the video, the parallax layers, the
responsive image derivatives, the OG card and the icons. Those are build
artefacts, not runtime.

---

## Decision 2 — Booking transaction model

This is the decision with real money attached, and it needs your call.

Beds24 API v2 documents **no hold, no lock, and no idempotency key**. Two
concurrent `POST /bookings` for the last unit have undocumented behaviour.
Beds24's own booking page solves this with a blocking "Request" status that the
API does not expose an equivalent for.

### Option A — fully custom funnel

Custom calendar → custom extras → `POST /bookings` → `POST /channels/stripe` →
Stripe Checkout rendered on our domain → confirmation page.

- Guest never leaves the brand.
- We own the double-booking risk, with no primitive to manage it.
- We must send `price` ourselves (Beds24 does not price API bookings), so a
  quote/charge mismatch becomes our bug.
- Needs a reconciliation job — but OVH cron is hourly at best.

### Option B — branded funnel, Beds24-hosted checkout *(recommended)*

Custom calendar, live availability, authoritative price and extras selection all
on our site and fully branded. The final step — guest details and payment —
deep-links into Beds24's own booking page, prefilled, styled with its custom CSS
and colour settings to match.

- Beds24 owns the hold, the payment, the confirmation email, the channel sync
  and double-booking prevention. These are the parts that must not be wrong.
- No PCI-DSS exposure; funds go straight to the owner's Stripe.
- Guest leaves the domain for the last step only. The brief says "without
  leaving the branded experience **unnecessarily**" — given there is no hold
  primitive, this leaving is necessary rather than lazy.
- Deep-link format is documented: `booking2.php?propid=…&checkin_hide=…&numnight=…&br{offer}-{roomid}=Book`.

**Recommendation: ship B, behind the provider abstraction, and keep A as a
later swap.** B is the responsible way to take real money against an API with
no locking. The abstraction means moving to A later touches one adapter, not
the frontend.

I will build whichever you choose — but I am not willing to ship A while
describing it as safe, because the double-booking question is genuinely
unresolved in Beds24's documentation.

---

## Decision 3 — Provider abstraction

The frontend and the booking UI talk to **our** API, never to Beds24.

```
site/js/booking.js
        │  fetch('/api/availability?from=…&to=…&guests=2')
        ▼
/api/*.php  ── BookingProvider (interface)
                 ├── Beds24Provider   live
                 └── MockProvider     development only, loudly labelled
```

```php
interface BookingProvider {
    public function availability(DateRange $r): AvailabilityCalendar;
    public function quote(DateRange $r, int $guests, array $extras): Quote;
    public function rules(DateRange $r): StayRules;      // min stay, CTA, CTD
    public function checkoutHandoff(Quote $q, array $extras): CheckoutIntent;
    public function booking(string $ref): ?Booking;
}
```

Our API returns our own normalised shapes. Swapping channel manager later means
writing one class.

**Caching is mandatory, not an optimisation.** Beds24 bills requests in credits
(100 per 5 minutes by default) and returns `x-request-cost`. A public calendar
without caching will exhaust the budget and the site will appear broken. Plan:
cache availability/calendar per property-month, short TTL, invalidated by the
booking webhook; never call Beds24 from a page render.

---

## Decision 4 — Content model (three-way split)

From the audit: the 1,239 strings are not one thing.

| Layer | Size | Who edits | Stored |
|---|---|---|---|
| **Settings** — times, occupancy, pool size, social URLs, maps destination, GA4 ID, currency | ~12 values, locale-independent | owner, admin UI | `settings.json` |
| **Content** — hero lede, About paragraphs, practical info, host blurb, photo captions, reviews, experiences | ~40 fields × 7 locales | owner, admin UI | `content/{locale}.json` |
| **UI strings** — buttons, form labels, validation, aria-labels, plurals | ~137 × 7 | developer, in git | `render/i18n/*.js` → PHP |

The owner cannot reach the UI-string layer. He cannot break the booking form's
validation messages by editing website copy. That separation is deliberate.

**Translation workflow.** When the owner edits French content, the other six
locales must not silently fall back to English (brief §10). The admin marks
them stale and shows the owner exactly which languages need attention, with the
French text alongside. Untranslated content falls back to **French**, the
primary language — never English.

---

## Decision 5 — Extras

Beds24 has native Upsell Items (max 20/property, configurable Per
booking/room/person, one-time or daily, with their own VAT), readable via
`GET /properties`. But **no documented API attaches a configured upsell item to
a booking** — only `invoiceItems` and a control-panel selector.

So: **Beds24 is the source of truth for extras that affect the invoice**; our
admin manages the presentation layer (image, long description, sort order,
locale text) keyed to the Beds24 item. That satisfies "integrate rather than
duplicate" without inventing an API that is not documented.

Extras that are really *experiences* with their own availability (e-bike,
horse riding) are a separate content type, not Beds24 upsells — they can start
as enquiry-only and become bookable later.

Early check-in / late checkout at €15/hour is **configuration**, not code.

---

## Open questions I could not resolve from documentation

These need either the Beds24 Swagger UI behind a login, or Beds24 support. They
are listed so they are not forgotten, not as blockers for planning.

1. Exact field list for `POST /bookings` — the public wiki never states it.
2. Literal query-parameter names for `/inventory/rooms/offers`.
3. Enum spellings for the calendar `override` field (blackout / no check in / …).
4. **Race behaviour on two concurrent bookings for the last unit.** The one that
   matters most for Option A.
5. Webhook signing / retry policy — undocumented, so webhooks will be treated as
   a hint to re-fetch, never as trusted payload.
6. Whether `mod_headers` works on the owner's OVH plan (security headers).

---

## Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Double booking | **high** | Option B pushes this to Beds24. Option A needs a documented answer to Q4 first. |
| Beds24 credit exhaustion | **high** | Server-side cache; never call per page render; monitor `x-five-min-limit-remaining`. |
| No sandbox — testing hits production | **high** | Test against a dedicated unlisted test property/room; never against the live room. |
| Secrets on shared hosting | medium | Config outside web root, `.htaccess` deny, never in git, `.env.example` only. |
| Owner edits break layout | medium | Length limits and preview in admin; structural markup not editable. |
| Visual regression during PHP port | medium | Diff PHP output against current generated HTML until clean. |
| OVH hourly cron | medium | Avoid designs needing sub-hourly jobs; webhook-driven instead. |
