'use strict';
/* Polski. Uwaga na liczbę mnogą: 1 noc / 2–4 noce / 5+ nocy. */
module.exports = {
  code: 'pl', name: 'Polski', locale: 'pl-PL', dir: 'pl', dec: ',',

  meta: {
    title: 'Émines de Rien — nietypowy domek dla dwojga · La Bruyère, Belgia',
    desc: 'Écrin miroir · Balnéo · Cinéma privé. Lustrzany domek dla dwojga w La Bruyère w Walonii: wanna z hydromasażem, prywatne kino, zadaszony taras nad polami i podgrzewany basen w sezonie. Zarezerwuj termin bezpośrednio.',
    ogTitle: 'Émines de Rien — lustrzany domek dla dwojga',
    ogDesc: 'Écrin miroir · Balnéo · Cinéma privé. Wanna z hydromasażem, prywatne kino i zadaszony taras nad polami, tuż pod Namur.',
    ogAlt: 'Dom o lustrzanej elewacji i jego zadaszony taras, w którym odbijają się pola.',
    schemaDesc: 'Lustrzany domek dla dwojga w La Bruyère w Walonii, z wanną z hydromasażem, prywatnym kinem, zadaszonym tarasem i podgrzewanym basenem zewnętrznym w sezonie.',
    region: 'Walonia', country: 'Belgia',
  },

  nav: {
    skip: 'Przejdź do treści', house: 'Dom', inside: 'Wnętrze',
    gallery: 'Galeria', guests: 'Opinie', visiting: 'Przyjazd',
    cta: 'Zapytaj o termin', lang: 'Język', sections: 'Sekcje',
  },

  hero: {
    lede: 'Lustrzany domek dla dwojga pośród pól Hesbaye, tuż pod Namur. Elewacja wchłania niebo, a wieczór należy wyłącznie do Was.',
    facts: ['2 gości', '1 sypialnia', '1 łóżko queen size', '1 łazienka', 'Cały obiekt'],
    ctaBook: 'Zapytaj o termin', ctaSee: 'Zobacz dom',
    rating: '{v} z 6 opinii gości',
    cue: 'Przewiń do domu',
    videoAlt: 'Lustrzany dom o zmierzchu, jego rozświetlone okno odbija się w basenie, a na pierwszym planie kołyszą się trawy.',
  },

  about: {
    eyebrow: 'Dom',
    h2: 'Wnętrze, które pożycza<br>sobie całe niebo',
    p: [
      'Émines de Rien to nietypowe miejsce na nocleg, stworzone dla dwojga. Lustrzana elewacja zbiera żywopłoty i pogodę, przez co dom w połowie znika w otaczających go polach.',
      'W środku jedno otwarte, nowoczesne wnętrze: łóżko queen size, wanna z hydromasażem, duży prysznic bez brodzika i wyposażona kuchnia — a na jednym końcu prawdziwy kącik kinowy z dużym ekranem i dźwiękiem przestrzennym.',
      'Cały domek należy do Was, w pełnej prywatności, wraz z zadaszonym tarasem z widokiem na pola i niewielkim ogrodem bez sąsiadów naprzeciwko.',
    ],
    stats: [
      ['Ocena', '{rating}'], ['Opinie', '6'],
      ['Gospodarze od', '3 lat'], ['Odpowiedź', '&lt;1 godz.'],
    ],
  },

  inside: {
    eyebrow: 'Wnętrze', h2: 'Wszystko w jednym wnętrzu',
    cards: [
      ['Wanna z hydromasażem', 'Wanna z hydromasażem wkomponowana w otwartą przestrzeń, obok duży prysznic bez brodzika.'],
      ['Prywatne kino', 'Prawdziwy kącik kinowy: duży ekran i dźwięk przestrzenny, tylko dla Was dwojga.'],
      ['Podgrzewany basen, w sezonie', 'Podgrzewany basen zewnętrzny 8 × 4 m z pokrywą i zabawkami — basen właścicieli, współdzielony i otwarty w wyznaczonych godzinach.'],
      ['Zadaszony taras', 'Prywatny zadaszony taras nad polami i mały ogród bez sąsiadów naprzeciwko.'],
      ['Wyposażona kuchnia', 'W pełni wyposażona kuchnia — wychodzicie tylko wtedy, gdy macie ochotę.'],
      ['Architektura lustrzana', 'Lustrzana elewacja, która oddaje Wam pola, żywopłoty i pogodę bez zmian.'],
    ],
  },

  gallery: { eyebrow: 'Galeria', h2: 'Rozejrzyj się', open: 'Otwórz zdjęcie: {x}' },

  photos: [
    'Lustrzana elewacja i zadaszony taras',
    'Otwarte pola odbite w elewacji',
    'Dom i basen o zmierzchu',
    'Ogród, za basenem',
    'Podgrzewany basen zewnętrzny, otwarty w sezonie',
    'Lustrzane ściany od strony ogrodu',
    'Miejsca do siedzenia na zadaszonym tarasie',
    'Taras po zmroku',
    'Część sypialna',
    'Łóżko queen size',
    'Wanna z hydromasażem',
    'Wanna z hydromasażem przy przeszkleniu',
    'Umywalka i podświetlane lustro',
    'Podświetlane lustro nocą',
    'Wyposażona kuchnia',
    'Blat jadalny',
    'Ekran prywatnego kina',
  ],

  para: {
    quote: '„Polecam je parom, które chcą się odciąć od świata i odnaleźć siebie nawzajem.”',
    by: 'Anthony · gość', label: 'Cicha chwila pośród pól',
  },

  reviews: {
    eyebrow: 'Opinie', h2: 'Sześć pobytów, sześć ocen na pięć gwiazdek',
    scores: [['{5.0}', 'Czystość'], ['{5.0}', 'Zameldowanie'], ['{5.0}', 'Komunikacja'],
             ['{4.8}', 'Zgodność z opisem'], ['{4.8}', 'Stosunek jakości do ceny'], ['{4.7}', 'Lokalizacja']],
    starsLabel: 'Ocena 5 na 5',
    quotes: [
      ['„Było absolutnie idealnie. Gospodarze byli niezwykle mili i gościnni, sprawili, że poczuliśmy się jak u siebie. Samo miejsce jest piękne i tak spokojne, ukryte w uroczej miejscowości tuż pod Namur. Jednym z naszych ulubionych momentów był poranek, gdy obudziliśmy się, a konie przyszły nas odwiedzić — naprawdę czuliśmy się jak we śnie.”', 'Raees'],
      ['„Mieliśmy wspaniały pobyt! Wszystko było czyste, przytulne i stylowe. Od razu poczuliśmy się mile widziani i naprawdę mogliśmy tu odpocząć. Komunikacja z gospodarzem była bardzo przyjemna i życzliwa. Zdecydowanie polecamy i chętnie wrócimy!”', 'Enes'],
      ['„Wszystko jest bardzo ładne i wysokiej jakości. Pościel jest niesamowita. Zostaliśmy dobrze przyjęci”', 'Stephanie'],
    ],
    fine: 'Opinie gości, którzy tu nocowali; część została przetłumaczona automatycznie.',
  },

  book: {
    eyebrow: 'Rezerwacja bezpośrednia', h2: 'Zapytaj o termin',
    intro: 'Napiszcie Céline &amp; Stéphane, kiedy chcielibyście przyjechać — potwierdzą dostępność i cenę za Wasze noclegi. Odpowiadają na każde zapytanie, zwykle w ciągu godziny.',
    ticks: ['Cały dom, tylko dla Was dwojga', 'Przyjazd między 17:00 a 20:00', 'Bezpłatny parking na terenie obiektu'],
    lIn: 'Przyjazd', lOut: 'Wyjazd', lGuests: 'Goście',
    g1: '1 gość', g2: '2 gości', hint: 'Dom przeznaczony jest dla dwóch osób.',
    lName: 'Imię i nazwisko', lEmail: 'E-mail', lPhone: 'Telefon', opt: '(opcjonalnie)',
    lMsg: 'Coś, o czym powinniśmy wiedzieć?', submit: 'Wyślij zapytanie',
    nights: { one: '{n} noc', few: '{n} noce', many: '{n} nocy' },
    arrive: 'przyjazd od 17:00, wyjazd do 11:00',
    errIn: 'Wybierz datę przyjazdu.',
    errOut: 'Wybierz datę wyjazdu.',
    errOrder: 'Wyjazd musi nastąpić po przyjeździe.',
    errName: 'Podaj swoje imię.',
    errEmail: 'Sprawdź swój adres e-mail.',
    sending: 'Wysyłanie zapytania…',
    sent: 'Dziękujemy — zapytanie zostało wysłane. Céline & Stéphane zwykle odpowiadają w ciągu godziny.',
    failed: 'Nie udało się wysłać. Spróbuj ponownie za chwilę.',
    ready: 'Zapytanie jest gotowe — skopiuj je, a potwierdzimy Wasz termin.',
    mailHint: 'Program pocztowy powinien otworzyć się z gotowym zapytaniem. Jeśli nic się nie dzieje, skopiuj je poniżej.',
    copy: 'Kopiuj zapytanie', copied: 'Skopiowano ✓', copyLabel: 'Twoje zapytanie o rezerwację',
    subject: 'Zapytanie o rezerwację — {a} do {b} ({g} gości)',
    c: { head: 'Zapytanie o rezerwację — Émines de Rien', in: 'Przyjazd', out: 'Wyjazd',
         nights: 'Noclegi', guests: 'Goście', name: 'Imię', email: 'E-mail',
         phone: 'Telefon', msg: 'Wiadomość', from: 'od 17:00', by: 'do 11:00' },
  },

  visit: {
    eyebrow: 'Przyjazd', h2: 'Przyjazd i godziny',
    rows: [['Zameldowanie', '17:00 – 20:00'], ['Wymeldowanie', 'Do 11:00'],
           ['Goście', 'Maksymalnie 2'], ['Basen', 'Sezonowo, w wyznaczonych godzinach']],
    note: 'Warto wiedzieć: w domu jest czujnik dymu. Nie ma czujnika tlenku węgla, a basen i wanna z hydromasażem nie są ogrodzone ani zamykane.',
    whereEyebrow: 'Gdzie', whereH2: 'La Bruyère,<br>tuż pod Namur',
    whereP: 'Otwarta wieś na płaskowyżu Hesbaye, kilka minut od Namur — goście opisują to miejsce jako ukryte w spokojnej miejscowości. Bezpłatny parking na terenie obiektu. Dokładny adres otrzymacie po potwierdzeniu pobytu.',
    maps: 'Trasa w Mapach Google',
  },

  foot: {
    hosts: 'Wasi gospodarze',
    hostsP: 'Céline &amp; Stéphane goszczą tutaj od trzech lat. Mówią po francusku, odpowiadają na każde zapytanie, zwykle w ciągu godziny.',
    touch: 'Bądźmy w kontakcie', touchP: 'Prześlijcie swój termin — odpowiedź przyjdzie szybko.',
    cta: 'Zapytaj o termin', where: 'La Bruyère · Walonia · Belgia',
  },

  lb: { dialog: 'Przeglądarka zdjęć', close: 'Zamknij', prev: 'Poprzednie zdjęcie', next: 'Następne zdjęcie', of: '{i} z {n}' },
};
