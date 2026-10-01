'use strict';
/* Deutsch. Die Gästebewertungen stehen hier in genau der deutschen Fassung,
   die Airbnb selbst ausliefert — nicht neu übersetzt. */
module.exports = {
  code: 'de', name: 'Deutsch', locale: 'de-DE', dir: 'de', dec: ',',
  timeFmt: '{h}:{m} Uhr',

  meta: {
    title: 'Émines de Rien — ungewöhnliche Unterkunft für zwei · La Bruyère, Belgien',
    desc: 'Écrin miroir · Balnéo · Cinéma privé. Ein Tiny House mit Spiegelfassade für zwei in La Bruyère, Wallonien: Whirlpool-Badewanne, privates Kino, überdachte Terrasse über den Feldern und beheizter Pool in der Saison. Termine direkt anfragen.',
    ogTitle: 'Émines de Rien — ein Spiegelhaus für zwei',
    ogDesc: 'Écrin miroir · Balnéo · Cinéma privé. Whirlpool-Badewanne, privates Kino und eine überdachte Terrasse über den Feldern, vor den Toren Namurs.',
    ogAlt: 'Das Haus mit Spiegelfassade und seine überdachte Terrasse, in der sich die Felder spiegeln.',
    schemaDesc: 'Ein Tiny House mit Spiegelfassade für zwei in La Bruyère, Wallonien, mit Whirlpool-Badewanne, privatem Kinobereich, überdachter Terrasse und beheiztem Außenpool in der Saison.',
    region: 'Wallonien', country: 'Belgien',
  },

  nav: {
    skip: 'Zum Inhalt springen', house: 'Das Haus', inside: 'Innen',
    gallery: 'Galerie', guests: 'Gäste', visiting: 'Anreise',
    cta: 'Termine anfragen', lang: 'Sprache', sections: 'Abschnitte',
  },

  hero: {
    lede: 'Ein Tiny House mit Spiegelfassade für zwei, mitten in den Feldern der Hesbaye vor Namur. Die Verkleidung nimmt den Himmel auf — und der Abend gehört ganz Ihnen.',
    facts: ['2 Gäste', '1 Schlafzimmer', '1 Queensize-Bett', '1 Bad', 'Gesamte Unterkunft'],
    ctaBook: 'Termine anfragen', ctaSee: 'Das Haus ansehen',
    rating: '{v} aus {reviewCount} Gästebewertungen',
    cue: 'Weiter zum Haus',
    videoAlt: 'Das Spiegelhaus in der Dämmerung, sein erleuchtetes Fenster spiegelt sich im Pool, während im Vordergrund Gräser wehen.',
  },

  about: {
    eyebrow: 'Das Haus',
    h2: 'Ein Raum, der sich<br>den ganzen Himmel leiht',
    p: [
      'Émines de Rien ist eine ungewöhnliche Unterkunft, gebaut für zwei. Die Spiegelverkleidung sammelt Hecken und Wetter ein, sodass das Haus halb im Ackerland verschwindet, in dem es steht.',
      'Innen ein einziger offener, zeitgenössischer Raum: ein Queensize-Bett, eine Whirlpool-Badewanne, eine große ebenerdige Dusche und eine Einbauküche — und an einem Ende ein echter Kinobereich mit Großbildschirm und immersivem Klang.',
      'Das gesamte Ferienhaus gehört Ihnen, in völliger Privatsphäre, dazu eine überdachte Terrasse mit Blick über die Felder und ein kleiner privater Garten ohne Gegenüber.',
    ],
    stats: [
      ['Bewertung', '{rating}'], ['Bewertungen', '{reviewCount}'],
      ['Gastgeber seit', '{hostingYears} J.'], ['Antwortzeit', '&lt;1 Std.'],
    ],
  },

  inside: {
    eyebrow: 'Innen', h2: 'Alles in einem Raum',
    cards: [
      ['Whirlpool-Badewanne', 'Eine Whirlpool-Badewanne mitten im offenen Raum, daneben eine große ebenerdige Dusche.'],
      ['Privates Kino', 'Ein echter Kinobereich: Großbildschirm und immersiver Klang, nur für Sie beide.'],
      ['Beheizter Pool, in der Saison', 'Ein beheizter Außenpool von {poolSize} m mit Abdeckung und Poolspielzeug — der Pool der Eigentümer, gemeinsam genutzt und zu bestimmten Zeiten geöffnet.'],
      ['Überdachte Terrasse', 'Eine private überdachte Terrasse über den Feldern und ein kleiner Garten ohne Gegenüber.'],
      ['Einbauküche', 'Eine voll ausgestattete Küche — Sie müssen nur hinaus, wenn Ihnen danach ist.'],
      ['Spiegelarchitektur', 'Eine Spiegelfassade, die Ihnen Felder, Hecken und Wetter unverändert zurückgibt.'],
    ],
  },

  gallery: { eyebrow: 'Galerie', h2: 'Sehen Sie sich um', open: 'Foto öffnen: {x}' },

  photos: [
    'Die Spiegelfassade und die überdachte Terrasse',
    'Offene Felder, in der Verkleidung gespiegelt',
    'Das Haus und der Pool in der Dämmerung',
    'Der Garten, hinter dem Pool',
    'Der beheizte Außenpool, in der Saison geöffnet',
    'Spiegelwände vor dem Garten',
    'Sitzplätze auf der überdachten Terrasse',
    'Die Terrasse nach Einbruch der Dunkelheit',
    'Der Schlafbereich',
    'Das Queensize-Bett',
    'Die Whirlpool-Badewanne',
    'Die Whirlpool-Badewanne an der Fensterfront',
    'Waschbecken und hinterleuchteter Spiegel',
    'Der hinterleuchtete Spiegel bei Nacht',
    'Die Einbauküche',
    'Die Esstheke',
    'Die private Kinoleinwand',
  ],

  para: {
    quote: '„Ich empfehle es Paaren, die abschalten und sich wiederfinden möchten.“',
    by: 'Anthony · Gast', label: 'Ein stiller Moment in den Feldern',
  },

  reviews: {
    eyebrow: 'Gäste', h2: 'Sechs Aufenthalte, sechs Fünf-Sterne-Bewertungen',
    scores: [['{cleanliness}', 'Sauberkeit'], ['{checkin}', 'Check-in'], ['{communication}', 'Kommunikation'],
             ['{accuracy}', 'Genauigkeit'], ['{value}', 'Preis-Leistung'], ['{location}', 'Lage']],
    starsLabel: 'Mit 5 von 5 Sternen bewertet',
    quotes: [
      ['„Es war absolut perfekt. Die Gastgeber waren unglaublich freundlich und einladend und sorgten dafür, dass wir uns wie zuhause fühlten. Die Unterkunft selbst ist wunderschön und so ruhig gelegen, versteckt in einer hübschen kleinen Stadt etwas außerhalb von Namur. Einer unserer Lieblingsmomente war, als wir morgens aufwachten und die Pferde vorbeikamen, um uns zu besuchen – es fühlte sich ehrlich gesagt wie ein Traum an.“', 'Raees'],
      ['„Wir hatten einen wunderbaren Aufenthalt! Alles war sauber, gemütlich und stimmungsvoll. Wir fühlten uns sofort willkommen und konnten hier wirklich genießen und uns erholen. Auch die Kommunikation mit dem Gastgeber war sehr angenehm und freundlich. Auf jeden Fall zu empfehlen, und wir kommen gerne wieder!“', 'Enes'],
      ['„Alles ist sehr schön und hochwertig. Die Betten sind unglaublich. Wurden gut aufgenommen“', 'Stephanie'],
    ],
    fine: 'Bewertungen von Gästen, die hier übernachtet haben; einige wurden automatisch übersetzt.',
  },

  book: {
    eyebrow: 'Direkt buchen', h2: 'Termine anfragen',
    intro: 'Sagen Sie Céline &amp; Stéphane, wann Sie kommen möchten — sie bestätigen Verfügbarkeit und Preis für Ihre Nächte. Sie beantworten jede Anfrage, meist innerhalb einer Stunde.',
    ticks: ['Das ganze Haus, nur für Sie beide', 'Anreise zwischen {checkinFromBare} und {checkinUntil}', 'Kostenlose Parkplätze auf dem Grundstück'],
    lIn: 'Anreise', lOut: 'Abreise', lGuests: 'Gäste',
    g1: '1 Gast', g2: '2 Gäste', hint: 'Das Haus bietet Platz für zwei.',
    lName: 'Ihr Name', lEmail: 'E-Mail', lPhone: 'Telefon', opt: '(optional)',
    lMsg: 'Sollten wir etwas wissen?', submit: 'Anfrage senden',
    nights: { one: '{n} Nacht', other: '{n} Nächte' },
    arrive: 'Anreise ab 17:00 Uhr, Abreise bis 11:00 Uhr',
    errIn: 'Bitte wählen Sie Ihr Anreisedatum.',
    errOut: 'Bitte wählen Sie Ihr Abreisedatum.',
    errOrder: 'Die Abreise muss nach der Anreise liegen.',
    errName: 'Bitte geben Sie Ihren Namen an.',
    errEmail: 'Bitte prüfen Sie Ihre E-Mail-Adresse.',
    sending: 'Ihre Anfrage wird gesendet…',
    sent: 'Vielen Dank — Ihre Anfrage ist unterwegs. Céline & Stéphane antworten meist innerhalb einer Stunde.',
    failed: 'Das hat nicht geklappt. Bitte versuchen Sie es gleich noch einmal.',
    ready: 'Ihre Anfrage ist fertig — kopieren Sie sie, und wir bestätigen Ihre Termine.',
    mailHint: 'Ihr E-Mail-Programm sollte sich mit der ausgefüllten Anfrage öffnen. Falls nichts passiert, kopieren Sie sie unten.',
    copy: 'Anfrage kopieren', copied: 'Kopiert ✓', copyLabel: 'Ihre Buchungsanfrage',
    subject: 'Buchungsanfrage — {a} bis {b} ({g} Gäste)',
    c: { head: 'Buchungsanfrage — Émines de Rien', in: 'Anreise', out: 'Abreise',
         nights: 'Nächte', guests: 'Gäste', name: 'Name', email: 'E-Mail',
         phone: 'Telefon', msg: 'Nachricht', from: 'ab 17:00 Uhr', by: 'bis 11:00 Uhr' },
  },

  visit: {
    eyebrow: 'Anreise', h2: 'Ankunft &amp; Zeiten',
    rows: [['Check-in', '{checkinWindow}'], ['Check-out', 'Vor {checkoutBy}'],
           ['Gäste', 'Maximal {maxGuests}'], ['Pool', 'Saisonal, zu bestimmten Zeiten']],
    note: 'Gut zu wissen: Ein Rauchmelder ist vorhanden. Es gibt keinen Kohlenmonoxidmelder, und Pool und Whirlpool sind weder umzäunt noch abschließbar.',
    whereEyebrow: 'Wo', whereH2: 'La Bruyère,<br>vor den Toren Namurs',
    whereP: 'Offenes Land auf dem Plateau der Hesbaye, wenige Minuten von Namur — Gäste beschreiben es als versteckt in einem ruhigen kleinen Ort. Kostenlose Parkplätze auf dem Grundstück. Die genaue Adresse erhalten Sie, sobald Ihr Aufenthalt bestätigt ist.',
    maps: 'Route in Google Maps',
  },

  foot: {
    hosts: 'Ihre Gastgeber',
    hostsP: 'Céline &amp; Stéphane empfangen hier seit drei Jahren Gäste. Sie sprechen Französisch, beantworten jede Anfrage und melden sich meist innerhalb einer Stunde.',
    touch: 'In Kontakt bleiben', touchP: 'Senden Sie Ihre Termine — die Antwort kommt umgehend.',
    cta: 'Termine anfragen', where: 'La Bruyère · Wallonien · Belgien',
  },

  lb: { dialog: 'Fotoansicht', close: 'Schließen', prev: 'Vorheriges Foto', next: 'Nächstes Foto', of: '{i} von {n}' },
};
