// ============================================================================
// NUESTRO NIDO | Configuración, Constantes y Catálogos de Nivel Estudio
// ============================================================================

export const APP_CONFIG = {
  appName: 'Nuestro Nido',
  defaultPetName: 'Pippo',
  version: '2.1.0',
};

// Paleta cromática cálida y orgánica (Estilo Finch / Animal Crossing)
export const PALETTE = {
  creamBg: '#F8F5EE',
  sageGreen: '#8DAF97',
  deepGreen: '#3C6252',
  dustyPink: '#E8A7A5',
  dustyRose: '#C96865',
  softLavender: '#BDB0E0',
  butterYellow: '#EAC96F',
  mistBlue: '#A7C8DE',
  woodWarm: '#D8C6AC',
  woodDark: '#8F7A62',
  mainText: '#2D303D',
  warmWhite: '#FFFDF9',
};

// Tasas de cambio de necesidades por hora (3600000 ms)
export const DECAY_RATES = {
  awake: {
    hunger: -3.2,
    hygiene: -2.4,
    energy: -3.0,
    fun: -2.8,
    comfort: -1.5,
  },
  sleeping: {
    hunger: -1.6,
    hygiene: -1.2,
    energy: 14.0, // Recuperación plácida
    fun: 0.0,
    comfort: -0.5,
  },
};

// Límites, pisos seguros e hitos de evolución
export const LIMITS = {
  minNeed: 15, // PISO SEGURO: Pippo nunca muere ni sufre abandono
  maxNeed: 100,
  criticalThreshold: 25,
  hatchingInteractionsRequired: 3,
  youngStageInteractions: 25,
  adultStageInteractions: 75,
  absenceBonusThresholdMs: 24 * 60 * 60 * 1000, // 24 horas
  absenceBonusLuceros: 15,
};

// Catálogo gourmet de comidas para Pippo
export const FOOD_CATALOG = {
  manzana_dulce: {
    id: 'manzana_dulce',
    name: 'Manzanita crocante',
    description: 'Recién cosechada, dulce y con un toque de rocío matutino.',
    hungerGain: 30,
    energyGain: 5,
    comfortGain: 8,
    price: 5,
    icon: '🍎',
  },
  bayas_bosque: {
    id: 'bayas_bosque',
    name: 'Bayas silvestres',
    description: 'Un puñado de moras y arándanos frescos, jugosos y repletos de antioxidantes.',
    hungerGain: 35,
    energyGain: 8,
    comfortGain: 12,
    price: 8,
    icon: '🫐',
  },
  panqueque_miel: {
    id: 'panqueque_miel',
    name: 'Panqueque con miel',
    description: 'Tibio, esponjoso, con una nuez de manteca dorada y miel de flores.',
    hungerGain: 50,
    energyGain: 15,
    comfortGain: 22,
    price: 15,
    icon: '🥞',
  },
  te_manzanilla: {
    id: 'te_manzanilla',
    name: 'Té de manzanilla tibio',
    description: 'Una infusión aromática en taza de cerámica que calma la pancita.',
    hungerGain: 20,
    energyGain: 25,
    comfortGain: 35,
    price: 12,
    icon: '🍵',
  },
};

// Catálogo de muebles y decoraciones interactivas
export const DECOR_CATALOG = {
  alfombra_lana: {
    id: 'alfombra_lana',
    name: 'Alfombra de lana tejida',
    slot: 'rug',
    description: 'Hecha a mano en telar, suavecita para que Pippo se acurruque.',
    price: 35,
    icon: '🧶',
  },
  alfombra_margarita: {
    id: 'alfombra_margarita',
    name: 'Alfombra flor silvestre',
    slot: 'rug',
    description: 'Con pétalos blancos y centro amarillo que ilumina el cuarto.',
    price: 50,
    icon: '🌼',
  },
  monstera_maceta: {
    id: 'monstera_maceta',
    name: 'Monstera en maceta de greda',
    slot: 'plant',
    description: 'Purifica el aire del nido. ¡Tocala para verla mecerse con la brisa!',
    price: 45,
    icon: '🪴',
  },
  helecho_colgante: {
    id: 'helecho_colgante',
    name: 'Helecho bosque colgante',
    slot: 'plant',
    description: 'Cae suavemente con hojas arqueadas y aroma a tierra fresca.',
    price: 55,
    icon: '🌿',
  },
  lampara_hongo: {
    id: 'lampara_hongo',
    name: 'Lámpara hongo cálida',
    slot: 'lamp',
    description: 'Emite un halo dorado muy tierno. ¡Tocala para encenderla o apagarla!',
    price: 50,
    icon: '🍄',
  },
  guirnalda_luces: {
    id: 'guirnalda_luces',
    name: 'Guirnalda de estrellitas',
    slot: 'lamp',
    description: 'Lucecitas titilantes que dan clima de cuento de hadas.',
    price: 60,
    icon: '✨',
  },
  peluche_nube: {
    id: 'peluche_nube',
    name: 'Almohadón nube mullido',
    slot: 'toy',
    description: 'Relleno de vellón siliconado hipoalergénico. Muy abrazable.',
    price: 40,
    icon: '☁️',
  },
  cuadro_estrellas: {
    id: 'cuadro_estrellas',
    name: 'Cuadro de constelación',
    slot: 'wallArt',
    description: 'Una pintura al óleo de las estrellas que los vieron conocerse.',
    price: 65,
    icon: '🖼️',
  },
};

// Catálogo de accesorios para vestir a Pippo
export const ACCESSORY_CATALOG = {
  sombrerito_hoja: {
    id: 'sombrerito_hoja',
    name: 'Sombrerito de hoja fresca',
    description: 'Una hoja de trébol que da sombra y lo hace ver aventurero.',
    price: 40,
    icon: '🍃',
  },
  mono_rosa: {
    id: 'mono_rosa',
    name: 'Moño de seda rosa pastel',
    description: 'Elegante y delicado para celebrar aniversarios y días especiales.',
    price: 40,
    icon: '🎀',
  },
  bufanda_lana: {
    id: 'bufanda_lana',
    name: 'Bufanda tejida a dos agujas',
    description: 'Tejida con amor para los días frescos de otoño e invierno.',
    price: 50,
    icon: '🧣',
  },
  corona_flores: {
    id: 'corona_flores',
    name: 'Corona silvestre primaveral',
    description: 'Flores de azahar, margaritas y lavanda trenzadas a mano.',
    price: 65,
    icon: '👑',
  },
};

// Banco de preguntas diarias en español rioplatense natural y cariñoso
export const DAILY_PROMPTS = [
  '¿Qué detalle simple de tu día te hizo sonreír o te trajo un poco de calma?',
  'Si nos teletransportáramos a merendar juntos ahora mismo, ¿qué pedirías?',
  '¿Cuál es un recuerdo nuestro que siempre te hace sentir en casa sin importar el lugar?',
  '¿Qué canción escuchaste últimamente que te hizo pensar en nosotros dos?',
  '¿Qué rincón de la casa te parece el más acogedor para estar abrazados?',
  'Si Pippo pudiera decir una sola frase con voz humana, ¿qué creés que diría?',
  '¿Qué pequeño logro tuyo de esta semana querés que celebremos juntos?',
  '¿Cuál es tu plan perfecto para una tarde de lluvia y descanso compartido?',
  '¿Qué es algo que aprendiste o descubriste de mí que te parece muy tierno?',
  'Si tuvieras un deseo simple para concedernos hoy a los dos, ¿cuál elegirías?',
];

// Mensajes interactivos al tocar el cuadro de pared
export const WALL_ART_QUOTES = [
  '“Hogar no es un lugar, es con quién estás.” ✨',
  '“Cuidar de a dos hace que todo florezca más lindo.” 🌸',
  '“Bajo el mismo cielo, pensando en vos siempre.” 🌌',
  '“Pippo duerme tranquilo porque sabe que nos queremos.” 💖',
];

// Configuración opcional de Firebase para persistencia cloud
export const FIREBASE_PUBLIC_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};
