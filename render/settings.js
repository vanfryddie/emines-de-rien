'use strict';
/**
 * Loads var/settings.json and derives the values the catalogues reference as
 * {placeholders}. One edit here changes all seven languages.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'var', 'settings.json');

function load() {
  const s = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  for (const [k, req] of [['site', ['url']], ['stay', ['checkinFrom', 'checkinUntil', 'checkoutBy', 'maxGuests']],
                          ['reputation', ['rating', 'reviewCount']]]) {
    if (!s[k]) throw new Error(`settings.json: missing section "${k}"`);
    for (const f of req) {
      if (s[k][f] === undefined || s[k][f] === '') {
        throw new Error(`settings.json: ${k}.${f} is required`);
      }
    }
  }
  return s;
}

/** "17:00" rendered through a locale's clock format, e.g. fr → "17h00". */
function time(hhmm, fmt) {
  const [h, m] = String(hhmm).split(':');
  return String(fmt || '{h}:{m}').replace('{h}', h).replace('{m}', m);
}

/**
 * The placeholder table for one locale. Keys here are exactly the
 * {names} used inside render/i18n/*.js.
 */
function tokens(s, t) {
  const f = t.timeFmt;
  // Bare = no trailing unit. Used mid-sentence, where the locale's sentence
  // already carries the unit once at the end ("zwischen 17:00 und 20:00 Uhr").
  const bare = String(f || '').replace(/\{m\}.*$/, '{m}');
  const r = s.reputation;
  return {
    checkinFromBare: time(s.stay.checkinFrom, bare),
    checkinUntilBare: time(s.stay.checkinUntil, bare),
    checkoutByBare: time(s.stay.checkoutBy, bare),
    checkinFrom: time(s.stay.checkinFrom, f),
    checkinUntil: time(s.stay.checkinUntil, f),
    checkoutBy: time(s.stay.checkoutBy, f),
    // In a range the unit is written once, at the end: "17:00 – 20:00 Uhr",
    // not "17:00 Uhr – 20:00 Uhr". Strip any trailing literal for the start.
    checkinWindow: `${time(s.stay.checkinFrom, bare)} – ${time(s.stay.checkinUntil, f)}`,
    maxGuests: String(s.stay.maxGuests),
    poolSize: s.stay.poolSize,
    rating: t.dec === ',' ? String(r.rating).replace('.', ',') : String(r.rating),
    reviewCount: String(r.reviewCount),
    hostingYears: String(r.hostingYears),
    ...Object.fromEntries(Object.entries(r.scores).map(([k, v]) =>
      [k, t.dec === ',' ? String(v).replace('.', ',') : String(v)])),
  };
}

/** Recursively resolve {placeholders} through a whole catalogue. */
function resolve(node, tok) {
  if (typeof node === 'string') {
    return node.replace(/\{(\w+)\}/g, (m, k) => (k in tok ? tok[k] : m));
  }
  if (Array.isArray(node)) return node.map((v) => resolve(v, tok));
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, resolve(v, tok)]));
  }
  return node;
}

module.exports = { load, tokens, resolve, time, FILE };
