'use strict';
/**
 * One-shot migration: replace business facts duplicated across the seven
 * catalogues with {placeholders} resolved from var/settings.json.
 *
 * Idempotent — safe to re-run. Verifies by rebuilding and diffing.
 */
const fs = require('fs');
const path = require('path');

// Per-locale clock format. The TIME is a setting; the FORMAT is a UI concern.
const TIME_FMT = {
  en: '{h}:{m}', fr: '{h}h{m}', de: '{h}:{m} Uhr', nl: '{h}.{m} uur',
  pl: '{h}:{m}', es: '{h}:{m}', it: '{h}:{m}',
};

// Literal → placeholder, per locale. Only unambiguous, whole-value matches.
const RULES = {
  en: [
    ["'17:00 – 20:00'", "'{checkinWindow}'"],
    ["'Before 11:00'", "'Before {checkoutBy}'"],
    ["'2 maximum'", "'{maxGuests} maximum'"],
    ['An 8 × 4 m heated', 'An {poolSize} m heated'],
    ["'{v} from 6 guest reviews'", "'{v} from {reviewCount} guest reviews'"],
    ['Arrival between 17:00 and 20:00', 'Arrival between {checkinFrom} and {checkinUntil}'],
    ["['Reviews', '6']", "['Reviews', '{reviewCount}']"],
    ["['Hosting since', '3 yrs']", "['Hosting since', '{hostingYears} yrs']"],
  ],
  fr: [
    ["'17h00 – 20h00'", "'{checkinWindow}'"],
    ["'Avant 11h00'", "'Avant {checkoutBy}'"],
    ["'2 maximum'", "'{maxGuests} maximum'"],
    ['piscine extérieure chauffée de 8 × 4 m', 'piscine extérieure chauffée de {poolSize} m'],
    ["'{v} sur 6 avis de voyageurs'", "'{v} sur {reviewCount} avis de voyageurs'"],
    ['Arrivée entre 17h00 et 20h00', 'Arrivée entre {checkinFrom} et {checkinUntil}'],
    ["['Avis', '6']", "['Avis', '{reviewCount}']"],
    ["['Hôtes depuis', '3 ans']", "['Hôtes depuis', '{hostingYears} ans']"],
  ],
  de: [
    ["'17:00 – 20:00 Uhr'", "'{checkinWindow}'"],
    ["'Vor 11:00 Uhr'", "'Vor {checkoutBy}'"],
    ["'Maximal 2'", "'Maximal {maxGuests}'"],
    ['Außenpool von 8 × 4 m', 'Außenpool von {poolSize} m'],
    ["'{v} aus 6 Gästebewertungen'", "'{v} aus {reviewCount} Gästebewertungen'"],
    ['Anreise zwischen 17:00 und 20:00 Uhr', 'Anreise zwischen {checkinFrom} und {checkinUntil}'],
    ["['Bewertungen', '6']", "['Bewertungen', '{reviewCount}']"],
    ["['Gastgeber seit', '3 J.']", "['Gastgeber seit', '{hostingYears} J.']"],
  ],
  nl: [
    ["'17.00 – 20.00 uur'", "'{checkinWindow}'"],
    ["'Vóór 11.00 uur'", "'Vóór {checkoutBy}'"],
    ["'Maximaal 2'", "'Maximaal {maxGuests}'"],
    ['buitenzwembad van 8 × 4 m', 'buitenzwembad van {poolSize} m'],
    ["'{v} uit 6 gastenbeoordelingen'", "'{v} uit {reviewCount} gastenbeoordelingen'"],
    ['Aankomst tussen 17.00 en 20.00 uur', 'Aankomst tussen {checkinFrom} en {checkinUntil}'],
    ["['Beoordelingen', '6']", "['Beoordelingen', '{reviewCount}']"],
    ["['Gastheer sinds', '3 jaar']", "['Gastheer sinds', '{hostingYears} jaar']"],
  ],
  pl: [
    ["'17:00 – 20:00'", "'{checkinWindow}'"],
    ["'Do 11:00'", "'Do {checkoutBy}'"],
    ["'Maksymalnie 2'", "'Maksymalnie {maxGuests}'"],
    ['basen zewnętrzny 8 × 4 m', 'basen zewnętrzny {poolSize} m'],
    ["'{v} z 6 opinii gości'", "'{v} z {reviewCount} opinii gości'"],
    ['Przyjazd między 17:00 a 20:00', 'Przyjazd między {checkinFrom} a {checkinUntil}'],
    ["['Opinie', '6']", "['Opinie', '{reviewCount}']"],
    ["['Gospodarze od', '3 lat']", "['Gospodarze od', '{hostingYears} lat']"],
  ],
  es: [
    ["'17:00 – 20:00'", "'{checkinWindow}'"],
    ["'Antes de las 11:00'", "'Antes de las {checkoutBy}'"],
    ["'2 máximo'", "'{maxGuests} máximo'"],
    ['climatizada de 8 × 4 m', 'climatizada de {poolSize} m'],
    ["'{v} sobre 6 opiniones'", "'{v} sobre {reviewCount} opiniones'"],
    ['Llegada entre las 17:00 y las 20:00', 'Llegada entre las {checkinFrom} y las {checkinUntil}'],
    ["['Opiniones', '6']", "['Opiniones', '{reviewCount}']"],
    ["['Anfitriones desde', '3 años']", "['Anfitriones desde', '{hostingYears} años']"],
  ],
  it: [
    ["'17:00 – 20:00'", "'{checkinWindow}'"],
    ["'Entro le 11:00'", "'Entro le {checkoutBy}'"],
    ["'Massimo 2'", "'Massimo {maxGuests}'"],
    ['riscaldata di 8 × 4 m', 'riscaldata di {poolSize} m'],
    ["'{v} su 6 recensioni'", "'{v} su {reviewCount} recensioni'"],
    ['Arrivo tra le 17:00 e le 20:00', 'Arrivo tra le {checkinFrom} e le {checkinUntil}'],
    ["['Recensioni', '6']", "['Recensioni', '{reviewCount}']"],
    ["['Host da', '3 anni']", "['Host da', '{hostingYears} anni']"],
  ],
};

// Sub-scores are already {5.0}-style placeholders; name them instead.
const SCORE_KEYS = ['cleanliness', 'checkin', 'communication', 'accuracy', 'value', 'location'];

let changed = 0, skipped = 0;
for (const [code, rules] of Object.entries(RULES)) {
  const p = path.join(__dirname, 'i18n', `${code}.js`);
  let s = fs.readFileSync(p, 'utf8');
  const before = s;

  for (const [from, to] of rules) {
    if (s.includes(to)) { skipped++; continue; }      // already migrated
    if (!s.includes(from)) { console.error(`  ! ${code}: no match for ${from}`); continue; }
    s = s.split(from).join(to);
    changed++;
  }

  // scores: ['{5.0}', 'Cleanliness'] → ['{cleanliness}', 'Cleanliness']
  const scoreLine = s.match(/scores: \[[\s\S]*?\],\n/);
  if (scoreLine && /\{[45]\.\d\}/.test(scoreLine[0])) {
    let i = 0;
    const next = scoreLine[0].replace(/\{[45]\.\d\}/g, () => `{${SCORE_KEYS[i++]}}`);
    s = s.replace(scoreLine[0], next);
    changed++;
  }

  // record the locale's clock format alongside its other UI concerns
  if (!s.includes('timeFmt')) {
    s = s.replace(/(\n  dec: '[.,]',)/, `$1\n  timeFmt: '${TIME_FMT[code]}',`);
    changed++;
  }

  if (s !== before) fs.writeFileSync(p, s);
}
console.log(`migrate-settings: ${changed} replacements, ${skipped} already done`);
