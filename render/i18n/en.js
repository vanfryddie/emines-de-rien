'use strict';
/* English — the reference catalogue. Every other locale mirrors these keys.
   The brand name and the hosts' tagline (Écrin miroir · Balnéo · Cinéma privé)
   stay in French everywhere: they are on the logo. */
module.exports = {
  code: 'en', name: 'English', locale: 'en-GB', dir: '', dec: '.',

  meta: {
    title: 'Émines de Rien — Mirror-clad tiny house for two · La Bruyère, Belgium',
    desc: 'Écrin miroir · Balnéo · Cinéma privé. A mirror-clad tiny house for two in La Bruyère, Wallonia: whirlpool bath, private cinema, covered terrace over the fields and a heated pool in season. Book your dates direct.',
    ogTitle: 'Émines de Rien — a mirror-clad tiny house for two',
    ogDesc: 'Écrin miroir · Balnéo · Cinéma privé. Whirlpool bath, private cinema and a covered terrace over the fields, outside Namur.',
    ogAlt: 'The mirror-clad house and its covered terrace, reflecting the fields.',
    schemaDesc: 'A mirror-clad tiny house for two in La Bruyère, Wallonia, with a whirlpool bath, a private cinema area, a covered terrace and a seasonal heated outdoor pool.',
    region: 'Wallonia', country: 'Belgium',
  },

  nav: {
    skip: 'Skip to content', house: 'The house', inside: 'Inside',
    gallery: 'Gallery', guests: 'Guests', visiting: 'Visiting',
    cta: 'Request dates', lang: 'Language', sections: 'Sections',
  },

  hero: {
    lede: 'A mirror-clad tiny house for two in the Hesbaye fields outside Namur. The cladding takes in the sky, and the evening is entirely your own.',
    facts: ['2 guests', '1 bedroom', '1 queen bed', '1 bath', 'Entire tiny home'],
    ctaBook: 'Request your dates', ctaSee: 'See the house',
    rating: '{v} from 6 guest reviews',
    cue: 'Scroll to the house',
    videoAlt: 'The mirror-clad house at dusk, its lit window reflected in the pool as grasses drift in the foreground.',
  },

  about: {
    eyebrow: 'The house',
    h2: 'A room that borrows<br>the whole sky',
    p: [
      'Émines de Rien is an unusual place to stay, built for two. Its mirrored cladding gathers up the hedgerows and the weather, so the house half vanishes into the farmland it stands in.',
      'Inside is a single open-plan contemporary room: a queen bed, a whirlpool bath, a large walk-in shower and an equipped kitchen — and, at one end, a genuine cinema corner with a big screen and immersive sound.',
      'The whole gîte is yours in complete privacy, along with a covered terrace looking over the fields and a small private garden that nothing overlooks.',
    ],
    stats: [
      ['Rating', '{rating}'], ['Reviews', '6'],
      ['Hosting since', '3 yrs'], ['Reply time', '&lt;1 hr'],
    ],
  },

  inside: {
    eyebrow: 'Inside', h2: 'Everything, in one room',
    cards: [
      ['Whirlpool bath', 'A whirlpool bath set into the open plan, with a large walk-in shower alongside.'],
      ['Private cinema', 'A real cinema corner: a big screen and immersive sound, for the two of you.'],
      ['Heated pool, in season', 'An 8 × 4 m heated outdoor pool with a cover and pool toys — the owners’ pool, shared and open at set hours.'],
      ['Covered terrace', 'A private covered terrace over the fields, and a small garden with nothing facing it.'],
      ['Equipped kitchen', 'A fitted kitchen, so you needn’t leave unless you feel like it.'],
      ['Mirror architecture', 'Mirrored cladding that hands the fields, the hedgerows and the weather straight back to you.'],
    ],
  },

  gallery: { eyebrow: 'Gallery', h2: 'Have a look around', open: 'Open photo: {x}' },

  photos: [
    'The mirrored facade and covered terrace',
    'Open fields reflected in the cladding',
    'The house and the pool at dusk',
    'The garden, seen past the pool',
    'The heated outdoor pool, open in season',
    'Mirror walls against the garden',
    'Seating on the covered terrace',
    'The terrace after dark',
    'The sleeping area',
    'The queen bed',
    'The whirlpool bath',
    'The whirlpool bath beside the glazing',
    'Washbasin and backlit mirror',
    'The backlit mirror at night',
    'The equipped kitchen',
    'The dining counter',
    'The private cinema screen',
  ],

  para: {
    quote: '“I recommend it to couples who want to disconnect and reconnect with one another.”',
    by: 'Anthony · guest', label: 'A quiet moment in the fields',
  },

  reviews: {
    eyebrow: 'Guests', h2: 'Six stays, six five-star reviews',
    scores: [['{5.0}', 'Cleanliness'], ['{5.0}', 'Check-in'], ['{5.0}', 'Communication'],
             ['{4.8}', 'Accuracy'], ['{4.8}', 'Value'], ['{4.7}', 'Location']],
    starsLabel: 'Rated 5 out of 5',
    quotes: [
      ['“It was absolutely perfect. The hosts were incredibly kind, welcoming, and made us feel right at home. The place itself is beautiful and so peaceful, tucked away in a lovely little town just outside Namur. One of our favorite moments was waking up in the morning and having the horses come by to visit us — it honestly felt like a dream.”', 'Raees'],
      ['“We had a lovely stay! Everything was neat, cozy and stylish. We immediately felt welcome and were really able to enjoy ourselves and unwind here. Communication with the host was also very pleasant and friendly. Highly recommended and we\'d love to come back!”', 'Enes'],
      ['“Everything is very beautiful and of quality. The bedding is amazing. We were well received”', 'Stephanie'],
    ],
    fine: 'Reviews left by guests who stayed; some were automatically translated.',
  },

  book: {
    eyebrow: 'Book direct', h2: 'Request your dates',
    intro: 'Tell Céline &amp; Stéphane when you\'d like to come and they\'ll confirm availability and the price for your nights. They answer every enquiry, usually within the hour.',
    ticks: ['The whole house, just for the two of you', 'Arrival between 17:00 and 20:00', 'Free parking on the property'],
    lIn: 'Check-in', lOut: 'Check-out', lGuests: 'Guests',
    g1: '1 guest', g2: '2 guests', hint: 'The house sleeps two.',
    lName: 'Your name', lEmail: 'Email', lPhone: 'Phone', opt: '(optional)',
    lMsg: 'Anything we should know?', submit: 'Send booking request',
    nights: { one: '{n} night', other: '{n} nights' },
    arrive: 'arrive from 17:00, leave by 11:00',
    errIn: 'Please choose your arrival date.',
    errOut: 'Please choose your departure date.',
    errOrder: 'Check-out needs to be after check-in.',
    errName: 'Please add your name.',
    errEmail: 'Please check your email address.',
    sending: 'Sending your request…',
    sent: 'Thank you — your request is on its way. Céline & Stéphane usually reply within the hour.',
    failed: 'That didn’t go through. Please try again in a moment.',
    ready: 'Your request is ready to send — copy it across and we’ll confirm your dates.',
    mailHint: 'Your mail app should be opening with the request filled in. If nothing happens, copy it below.',
    copy: 'Copy request', copied: 'Copied ✓', copyLabel: 'Your booking request',
    subject: 'Booking request — {a} to {b} ({g} guests)',
    c: { head: 'Booking request — Émines de Rien', in: 'Check-in', out: 'Check-out',
         nights: 'Nights', guests: 'Guests', name: 'Name', email: 'Email',
         phone: 'Phone', msg: 'Message', from: 'from 17:00', by: 'by 11:00' },
  },

  visit: {
    eyebrow: 'Visiting', h2: 'Arrival &amp; hours',
    rows: [['Check-in', '17:00 – 20:00'], ['Check-out', 'Before 11:00'],
           ['Guests', '2 maximum'], ['Pool', 'Seasonal, at set hours']],
    note: 'Good to know: a smoke alarm is fitted. There is no carbon monoxide alarm, and the pool and whirlpool have no gate or lock.',
    whereEyebrow: 'Where', whereH2: 'La Bruyère,<br>outside Namur',
    whereP: 'Open countryside on the Hesbaye plateau, a short drive from Namur — guests describe it as tucked away in a quiet little town. Free parking on the property. The exact address is sent once your stay is confirmed.',
    maps: 'Directions in Google Maps',
  },

  foot: {
    hosts: 'Your hosts',
    hostsP: 'Céline &amp; Stéphane have hosted here for three years. They speak French, answer every enquiry, and typically reply within an hour.',
    touch: 'Stay in touch', touchP: 'Send your dates and they’ll come straight back to you.',
    cta: 'Request your dates', where: 'La Bruyère · Wallonia · Belgium',
  },

  lb: { dialog: 'Photo viewer', close: 'Close', prev: 'Previous photo', next: 'Next photo', of: '{i} of {n}' },
};
