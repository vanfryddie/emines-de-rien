'use strict';
/* Français — la langue des hôtes. */
module.exports = {
  code: 'fr', name: 'Français', locale: 'fr-BE', dir: 'fr', dec: ',',
  timeFmt: '{h}h{m}',

  meta: {
    title: 'Émines de Rien — hébergement insolite pour deux · La Bruyère, Belgique',
    desc: 'Écrin miroir · Balnéo · Cinéma privé. Un hébergement insolite à l’architecture miroir pour deux, à La Bruyère en Wallonie : baignoire balnéo, cinéma privé, terrasse couverte sur les champs et piscine chauffée en saison. Réservez vos dates en direct.',
    ogTitle: 'Émines de Rien — un écrin miroir pour deux',
    ogDesc: 'Écrin miroir · Balnéo · Cinéma privé. Baignoire balnéo, cinéma privé et terrasse couverte sur les champs, aux portes de Namur.',
    ogAlt: 'La maison à l’architecture miroir et sa terrasse couverte, reflétant les champs.',
    schemaDesc: 'Un hébergement insolite à l’architecture miroir pour deux, à La Bruyère en Wallonie, avec baignoire balnéo, espace cinéma privé, terrasse couverte et piscine extérieure chauffée en saison.',
    region: 'Wallonie', country: 'Belgique',
  },

  nav: {
    skip: 'Aller au contenu', house: 'La maison', inside: 'À l’intérieur',
    gallery: 'Galerie', guests: 'Avis', visiting: 'Infos pratiques',
    cta: 'Demander des dates', lang: 'Langue', sections: 'Sections',
  },

  hero: {
    lede: 'Un écrin miroir pour deux, au milieu des champs de Hesbaye, aux portes de Namur. Le bardage happe le ciel, et la soirée n’appartient qu’à vous.',
    facts: ['2 voyageurs', '1 chambre', '1 lit queen size', '1 salle de bain', 'Logement entier'],
    ctaBook: 'Demander vos dates', ctaSee: 'Découvrir la maison',
    rating: '{v} sur {reviewCount} avis de voyageurs',
    cue: 'Faire défiler vers la maison',
    videoAlt: 'La maison miroir au crépuscule, sa fenêtre éclairée se reflétant dans la piscine, les herbes ondulant au premier plan.',
  },

  about: {
    eyebrow: 'La maison',
    h2: 'Une pièce qui emprunte<br>tout le ciel',
    p: [
      'Émines de Rien est un hébergement insolite, pensé pour deux. Son bardage miroir recueille les haies et le temps qu’il fait : la maison disparaît à moitié dans les terres qui l’entourent.',
      'À l’intérieur, une seule pièce contemporaine en espace ouvert : un lit queen size, une baignoire balnéo, une grande douche à l’italienne et une cuisine équipée — et, à une extrémité, un véritable coin cinéma, grand écran et son immersif.',
      'Le gîte est entièrement à vous, en toute intimité, avec une terrasse couverte ouverte sur les champs et un petit jardin privatif sans vis-à-vis.',
    ],
    stats: [
      ['Note', '{rating}'], ['Avis', '{reviewCount}'],
      ['Hôtes depuis', '{hostingYears} ans'], ['Réponse', '&lt;1 h'],
    ],
  },

  inside: {
    eyebrow: 'À l’intérieur', h2: 'Tout, dans une seule pièce',
    cards: [
      ['Baignoire balnéo', 'Une baignoire balnéo intégrée à l’espace ouvert, avec une grande douche à l’italienne juste à côté.'],
      ['Cinéma privé', 'Un vrai coin cinéma : grand écran et son immersif, rien que pour vous deux.'],
      ['Piscine chauffée, en saison', 'Une piscine extérieure chauffée de {poolSize} m avec bâche et jeux de piscine — celle des propriétaires, partagée et accessible à certaines heures.'],
      ['Terrasse couverte', 'Une terrasse couverte privative ouverte sur les champs, et un petit jardin sans vis-à-vis.'],
      ['Cuisine équipée', 'Une cuisine équipée, pour ne sortir que si l’envie vous prend.'],
      ['Architecture miroir', 'Un bardage miroir qui vous rend les champs, les haies et le ciel tels quels.'],
    ],
  },

  gallery: { eyebrow: 'Galerie', h2: 'Faites le tour', open: 'Ouvrir la photo : {x}' },

  photos: [
    'La façade miroir et la terrasse couverte',
    'Les champs ouverts reflétés dans le bardage',
    'La maison et la piscine au crépuscule',
    'Le jardin, au-delà de la piscine',
    'La piscine extérieure chauffée, ouverte en saison',
    'Les murs miroir face au jardin',
    'Le salon sur la terrasse couverte',
    'La terrasse à la nuit tombée',
    'Le coin nuit',
    'Le lit queen size',
    'La baignoire balnéo',
    'La baignoire balnéo près des baies vitrées',
    'Vasque et miroir rétroéclairé',
    'Le miroir rétroéclairé, la nuit',
    'La cuisine équipée',
    'Le comptoir repas',
    'L’écran de cinéma privé',
  ],

  para: {
    quote: '« Je le recommande aux couples qui veulent déconnecter et se retrouver. »',
    by: 'Anthony · voyageur', label: 'Un moment calme dans les champs',
  },

  reviews: {
    eyebrow: 'Avis', h2: 'Six séjours, six avis cinq étoiles',
    scores: [['{cleanliness}', 'Propreté'], ['{checkin}', 'Arrivée'], ['{communication}', 'Communication'],
             ['{accuracy}', 'Exactitude'], ['{value}', 'Rapport qualité-prix'], ['{location}', 'Emplacement']],
    starsLabel: 'Noté 5 sur 5',
    quotes: [
      ['« C’était absolument parfait. Les hôtes ont été incroyablement gentils et accueillants, ils nous ont vraiment mis à l’aise. Le lieu lui-même est magnifique et si paisible, niché dans un joli petit village juste à côté de Namur. L’un de nos moments préférés a été de nous réveiller le matin et de voir les chevaux venir nous rendre visite — on aurait vraiment dit un rêve. »', 'Raees'],
      ['« Nous avons passé un excellent séjour ! Tout était impeccable, chaleureux et élégant. Nous nous sommes sentis les bienvenus immédiatement et avons vraiment pu en profiter et nous détendre. La communication avec l’hôte a également été très agréable et amicale. Vivement recommandé, et nous reviendrons avec plaisir ! »', 'Enes'],
      ['« Tout est très beau et de qualité. La literie est incroyable. Nous avons été bien accueillis »', 'Stephanie'],
    ],
    fine: 'Avis laissés par des voyageurs ayant séjourné sur place ; certains ont été traduits automatiquement.',
  },

  book: {
    eyebrow: 'Réservation directe', h2: 'Demandez vos dates',
    intro: 'Indiquez à Céline &amp; Stéphane quand vous souhaitez venir : ils confirmeront la disponibilité et le prix pour vos nuits. Ils répondent à chaque demande, en général dans l’heure.',
    ticks: ['Toute la maison, rien que pour vous deux', 'Arrivée entre {checkinFrom} et {checkinUntil}', 'Parking gratuit sur place'],
    lIn: 'Arrivée', lOut: 'Départ', lGuests: 'Voyageurs',
    g1: '1 voyageur', g2: '2 voyageurs', hint: 'La maison accueille deux personnes.',
    lName: 'Votre nom', lEmail: 'E-mail', lPhone: 'Téléphone', opt: '(facultatif)',
    lMsg: 'Quelque chose à nous signaler ?', submit: 'Envoyer la demande',
    nights: { one: '{n} nuit', other: '{n} nuits' },
    arrive: 'arrivée à partir de 17h00, départ avant 11h00',
    errIn: 'Veuillez choisir votre date d’arrivée.',
    errOut: 'Veuillez choisir votre date de départ.',
    errOrder: 'Le départ doit être après l’arrivée.',
    errName: 'Veuillez indiquer votre nom.',
    errEmail: 'Veuillez vérifier votre adresse e-mail.',
    sending: 'Envoi de votre demande…',
    sent: 'Merci — votre demande est partie. Céline & Stéphane répondent en général dans l’heure.',
    failed: 'L’envoi n’a pas abouti. Merci de réessayer dans un instant.',
    ready: 'Votre demande est prête — copiez-la et nous confirmerons vos dates.',
    mailHint: 'Votre messagerie devrait s’ouvrir avec la demande pré-remplie. Si rien ne se passe, copiez-la ci-dessous.',
    copy: 'Copier la demande', copied: 'Copié ✓', copyLabel: 'Votre demande de réservation',
    subject: 'Demande de réservation — du {a} au {b} ({g} voyageurs)',
    c: { head: 'Demande de réservation — Émines de Rien', in: 'Arrivée', out: 'Départ',
         nights: 'Nuits', guests: 'Voyageurs', name: 'Nom', email: 'E-mail',
         phone: 'Téléphone', msg: 'Message', from: 'à partir de 17h00', by: 'avant 11h00' },
  },

  visit: {
    eyebrow: 'Infos pratiques', h2: 'Arrivée &amp; horaires',
    rows: [['Arrivée', '{checkinWindow}'], ['Départ', 'Avant {checkoutBy}'],
           ['Voyageurs', '{maxGuests} maximum'], ['Piscine', 'En saison, à certaines heures']],
    note: 'Bon à savoir : un détecteur de fumée est installé. Il n’y a pas de détecteur de monoxyde de carbone, et la piscine et le jacuzzi ne sont ni clôturés ni verrouillés.',
    whereEyebrow: 'Où', whereH2: 'La Bruyère,<br>aux portes de Namur',
    whereP: 'La pleine campagne du plateau hesbignon, à quelques minutes de Namur — les voyageurs le décrivent comme niché dans un petit village tranquille. Parking gratuit sur place. L’adresse exacte vous est envoyée une fois le séjour confirmé.',
    maps: 'Itinéraire sur Google Maps',
  },

  foot: {
    hosts: 'Vos hôtes',
    hostsP: 'Céline &amp; Stéphane reçoivent ici depuis trois ans. Ils parlent français, répondent à chaque demande et le font généralement dans l’heure.',
    touch: 'Restons en contact', touchP: 'Envoyez vos dates, ils reviendront vers vous sans tarder.',
    cta: 'Demander vos dates', where: 'La Bruyère · Wallonie · Belgique',
  },

  lb: { dialog: 'Visionneuse de photos', close: 'Fermer', prev: 'Photo précédente', next: 'Photo suivante', of: '{i} sur {n}' },
};
