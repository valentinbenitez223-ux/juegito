// ============================================================================
// NUESTRO NIDO | Configuración y Constantes del Sistema
// ============================================================================

export const APP_CONFIG = {
  appName: 'Nuestro Nido',
  defaultPetName: 'Pippo',
  version: '2.0.0',
};

// Paleta de diseño suave (Cozy Pastel Theme)
export const PALETTE = {
  creamBg: '#F7F3EC',
  sageGreen: '#A9C7B1',
  deepGreen: '#4E7664',
  dustyPink: '#EFB7B5',
  softLavender: '#C8B9E8',
  butterYellow: '#F3D88B',
  mistBlue: '#B9D5E8',
  mainText: '#343746',
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
    energy: 14.0, // Recupera mientras duerme plácidamente
    fun: 0.0,
    comfort: -0.5,
  },
};

// Límites y reglas de evolución y bienestar
export const LIMITS = {
  minNeed: 15, // PISO SEGURO: la mascota nunca muere ni baja del 15%
  maxNeed: 100,
  criticalThreshold: 25,
  hatchingInteractionsRequired: 3,
  youngStageInteractions: 25,
  adultStageInteractions: 75,
  absenceBonusThresholdMs: 24 * 60 * 60 * 1000, // 24 horas
  absenceBonusLuceros: 15,
};

// Catálogo de comidas para la criatura
export const FOOD_CATALOG = {
  manzana_dulce: {
    id: 'manzana_dulce',
    name: 'Manzanita dulce',
    description: 'Una manzana crocante recién cosechada del huerto.',
    hungerGain: 30,
    energyGain: 5,
    comfortGain: 5,
    price: 5,
    icon: '🍎',
  },
  bayas_bosque: {
    id: 'bayas_bosque',
    name: 'Bayas del bosque',
    description: 'Un puñadito de moras y arándanos frescos y jugosos.',
    hungerGain: 35,
    energyGain: 8,
    comfortGain: 10,
    price: 8,
    icon: '🫐',
  },
  panqueque_miel: {
    id: 'panqueque_miel',
    name: 'Panqueque con miel',
    description: 'Dorado, tibio y con un toque de manteca suave.',
    hungerGain: 50,
    energyGain: 15,
    comfortGain: 20,
    price: 15,
    icon: '🥞',
  },
  te_manzanilla: {
    id: 'te_manzanilla',
    name: 'Té de manzanilla',
    description: 'Una infusión relajante que calma la pancita y da sueño.',
    hungerGain: 20,
    energyGain: 25,
    comfortGain: 30,
    price: 12,
    icon: '🍵',
  },
};

// Catálogo de decoraciones para la habitación
export const DECOR_CATALOG = {
  alfombra_lana: {
    id: 'alfombra_lana',
    name: 'Alfombra tejida',
    slot: 'rug',
    description: 'Hecha a mano, mullida y calentita para pisar descalzo.',
    price: 35,
    icon: '🧶',
  },
  alfombra_margarita: {
    id: 'alfombra_margarita',
    name: 'Alfombra flor',
    slot: 'rug',
    description: 'Con forma de margarita para iluminar el centro del nido.',
    price: 50,
    icon: '🌼',
  },
  monstera_maceta: {
    id: 'monstera_maceta',
    name: 'Monstera en maceta',
    slot: 'plant',
    description: 'Hojas verdes amplias que purifican el aire del rincón.',
    price: 45,
    icon: '🪴',
  },
  helecho_colgante: {
    id: 'helecho_colgante',
    name: 'Helecho colgante',
    slot: 'plant',
    description: 'Cae suavemente con hojas delicadas desde el techo.',
    price: 55,
    icon: '🌿',
  },
  lampara_hongo: {
    id: 'lampara_hongo',
    name: 'Lámpara hongo',
    slot: 'lamp',
    description: 'Emite una luz tenue y dorada para las noches de descanso.',
    price: 50,
    icon: '🍄',
  },
  guirnalda_luces: {
    id: 'guirnalda_luces',
    name: 'Guirnalda de luces',
    slot: 'lamp',
    description: 'Pequeñas estrellitas titilantes colgadas en la pared.',
    price: 60,
    icon: '✨',
  },
  peluche_nube: {
    id: 'peluche_nube',
    name: 'Peluche de nube',
    slot: 'toy',
    description: 'Suavecito como el algodón de azúcar para abrazar.',
    price: 40,
    icon: '☁️',
  },
  cuadro_estrellas: {
    id: 'cuadro_estrellas',
    name: 'Cuadro estelar',
    slot: 'wallArt',
    description: 'Una pintura íntima del cielo nocturno sobre el nido.',
    price: 65,
    icon: '🖼️',
  },
};

// Catálogo de accesorios para Pippo
export const ACCESSORY_CATALOG = {
  sombrerito_hoja: {
    id: 'sombrerito_hoja',
    name: 'Sombrerito de hoja',
    description: 'Una hojita fresca que protege del sol y queda adorable.',
    price: 40,
    icon: '🍃',
  },
  mono_rosa: {
    id: 'mono_rosa',
    name: 'Moño rosa',
    description: 'Un moñito elegante para ocasiones especiales de dos.',
    price: 40,
    icon: '🎀',
  },
  bufanda_lana: {
    id: 'bufanda_lana',
    name: 'Bufanda abrigada',
    description: 'Un tejido suave para los días de viento fresco.',
    price: 50,
    icon: '🧣',
  },
  corona_flores: {
    id: 'corona_flores',
    name: 'Corona silvestre',
    description: 'Trenza de margaritas y jazmines aromáticos.',
    price: 65,
    icon: '👑',
  },
};

// Banco de preguntas diarias en español rioplatense íntimo y relajado
export const DAILY_PROMPTS = [
  '¿Qué pequeño momento de hoy te sacó una sonrisa o te dio paz?',
  'Si pudieras teletransportarnos a merendar juntos ahora mismo, ¿qué comeríamos?',
  '¿Qué canción escuchaste últimamente que te hizo pensar en nosotros?',
  '¿Cuál es un recuerdo de nosotros dos que siempre te hace sentir en casa?',
  '¿Qué rincón de la casa o lugar en el mundo te parece el más acogedor?',
  'Si nuestra mascota pudiera hablar por 10 segundos, ¿qué creés que diría?',
  '¿Qué detalle simple de tu día de hoy querés que yo conozca?',
  '¿Cuál es tu plan ideal para un domingo lluvioso de descanso compartido?',
];

// Configuración opcional de Firebase para sincronización remota en la nube.
// Por defecto se encuentra en blanco para permitir ejecución 100% estática local.
export const FIREBASE_PUBLIC_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};
