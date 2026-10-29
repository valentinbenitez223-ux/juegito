// ============================================================================
// NUESTRO NIDO | Motor de Simulación Determinista y Suite QA Ampliada
// ============================================================================

import {
  LIMITS,
  DECAY_RATES,
  FOOD_CATALOG,
  DECOR_CATALOG,
  ACCESSORY_CATALOG,
  APP_CONFIG,
} from './config.js';
import { getPetMood } from './pet.js';

/**
 * Limita una necesidad entre el piso seguro (15%) y el máximo (100%).
 * Garantiza que la criatura NUNCA muera ni sea penalizada por ausencias prolongadas.
 */
export function clampNeed(val) {
  return Math.max(LIMITS.minNeed, Math.min(LIMITS.maxNeed, Math.round(val)));
}

/**
 * Simula el paso del tiempo de forma asíncrona entre marcas de tiempo.
 * No requiere procesos en segundo plano.
 */
export function calculateDecayedNeeds(currentNeeds, lastUpdate, now, isSleeping) {
  if (now <= lastUpdate) {
    return { needs: { ...currentNeeds }, elapsedHours: 0 };
  }

  const elapsedMs = now - lastUpdate;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const rates = isSleeping ? DECAY_RATES.sleeping : DECAY_RATES.awake;

  const hunger = clampNeed(currentNeeds.hunger + rates.hunger * elapsedHours);
  const hygiene = clampNeed(currentNeeds.hygiene + rates.hygiene * elapsedHours);
  const energy = clampNeed(currentNeeds.energy + rates.energy * elapsedHours);
  const fun = clampNeed(currentNeeds.fun + rates.fun * elapsedHours);
  const comfort = clampNeed(currentNeeds.comfort + rates.comfort * elapsedHours);

  return {
    needs: { hunger, hygiene, energy, fun, comfort },
    elapsedHours,
  };
}

/**
 * Evalúa si Pippo está listo para su siguiente etapa evolutiva compartida.
 */
export function evaluateStage(currentStage, totalInteractions, hatchingProgress) {
  if (currentStage === 'egg') {
    if (hatchingProgress >= LIMITS.hatchingInteractionsRequired) {
      return 'baby';
    }
    return 'egg';
  }
  if (currentStage === 'baby' && totalInteractions >= LIMITS.youngStageInteractions) {
    return 'young';
  }
  if (currentStage === 'young' && totalInteractions >= LIMITS.adultStageInteractions) {
    return 'adult';
  }
  return currentStage;
}

/**
 * Crea un estado inicial para un nuevo nido.
 */
export function createInitialSpace(creatorUid, creatorName, petName = APP_CONFIG.defaultPetName) {
  const now = Date.now();
  return {
    id: `nido_${Math.random().toString(36).substring(2, 9)}`,
    name: APP_CONFIG.appName,
    createdAt: now,
    updatedAt: now,
    members: [creatorUid],
    memberProfiles: {
      [creatorUid]: {
        displayName: creatorName,
        avatarColor: '#8DAF97',
        lastSeenAt: now,
      },
    },
    inviteCode: null,
    inviteExpiresAt: null,
    pet: {
      name: petName,
      stage: 'egg',
      personality: 'alegre',
      colorVariant: 'pastel_sage',
      accessory: null,
      needs: {
        hunger: 85,
        hygiene: 90,
        energy: 95,
        fun: 80,
        comfort: 90,
      },
      lastNeedsUpdate: now,
      isSleeping: false,
      totalCareInteractions: 0,
      hatchingProgress: 0,
    },
    economy: {
      luceros: 50, // Fondo inicial para compras
      lifetimeLucerosEarned: 50,
    },
    inventory: {
      foods: {
        manzana_dulce: 3,
        bayas_bosque: 2,
      },
      unlockedDecor: ['alfombra_lana'],
      activeDecor: {
        rug: 'alfombra_lana',
        lampLit: true,
      },
      unlockedAccessories: [],
    },
  };
}

/**
 * Aplica una acción de cuidado al nido de forma atómica y determinista.
 */
export function applyCareAction(space, action, userId, userName, foodId, now = Date.now()) {
  const { needs } = calculateDecayedNeeds(
    space.pet.needs,
    space.pet.lastNeedsUpdate,
    now,
    space.pet.isSleeping
  );

  let newNeeds = { ...needs };
  let newInventory = { ...space.inventory, foods: { ...space.inventory.foods } };
  let detail = '';
  let lucerosEarned = 0;
  let newSleeping = space.pet.isSleeping;
  let newHatchingProgress = space.pet.hatchingProgress || 0;

  if (space.pet.stage === 'egg') {
    newHatchingProgress += 1;
  }

  switch (action) {
    case 'feed': {
      if (!foodId || !newInventory.foods[foodId] || newInventory.foods[foodId] <= 0) {
        throw new Error('No tenés esa comida en el inventario.');
      }
      const foodDef = FOOD_CATALOG[foodId];
      if (!foodDef) throw new Error('Comida no reconocida.');

      newInventory.foods[foodId] -= 1;
      newNeeds.hunger = clampNeed(newNeeds.hunger + foodDef.hungerGain);
      newNeeds.energy = clampNeed(newNeeds.energy + foodDef.energyGain);
      newNeeds.comfort = clampNeed(newNeeds.comfort + foodDef.comfortGain);
      lucerosEarned = 5;
      detail = `${userName} alimentó a ${space.pet.name} con ${foodDef.name.toLowerCase()}`;
      break;
    }
    case 'pet': {
      newNeeds.comfort = clampNeed(newNeeds.comfort + 20);
      newNeeds.fun = clampNeed(newNeeds.fun + 10);
      lucerosEarned = 3;
      detail = `${userName} acarició con mucho cariño a ${space.pet.name}`;
      break;
    }
    case 'clean': {
      newNeeds.hygiene = clampNeed(newNeeds.hygiene + 45);
      newNeeds.comfort = clampNeed(newNeeds.comfort + 15);
      lucerosEarned = 5;
      detail = `${userName} le dio un baño tibio a ${space.pet.name}`;
      break;
    }
    case 'play': {
      if (newNeeds.energy <= 15) {
        throw new Error(`${space.pet.name} tiene mucho sueño para jugar ahora. Dejalo descansar un ratito.`);
      }
      newNeeds.fun = clampNeed(newNeeds.fun + 35);
      newNeeds.comfort = clampNeed(newNeeds.comfort + 10);
      newNeeds.energy = clampNeed(newNeeds.energy - 15);
      lucerosEarned = 8;
      detail = `${userName} jugó y se divirtió con ${space.pet.name}`;
      break;
    }
    case 'sleep': {
      newSleeping = true;
      lucerosEarned = 5;
      detail = `${userName} arropó a ${space.pet.name} para que duerma calentito`;
      break;
    }
    case 'wake': {
      newSleeping = false;
      detail = `${userName} despertó a ${space.pet.name} con una caricia matutina`;
      break;
    }
    case 'hatch': {
      newHatchingProgress = LIMITS.hatchingInteractionsRequired;
      lucerosEarned = 25;
      detail = `¡El cascarón se rompió y nació ${space.pet.name}!`;
      break;
    }
    default:
      detail = `${userName} interactuó con ${space.pet.name}`;
  }

  const totalInteractions = (space.pet.totalCareInteractions || 0) + 1;
  const newStage = evaluateStage(space.pet.stage, totalInteractions, newHatchingProgress);

  const updatedSpace = {
    ...space,
    updatedAt: now,
    pet: {
      ...space.pet,
      stage: newStage,
      needs: newNeeds,
      isSleeping: newSleeping,
      sleepStartedAt: newSleeping ? space.pet.sleepStartedAt || now : undefined,
      lastNeedsUpdate: now,
      totalCareInteractions: totalInteractions,
      hatchingProgress: newHatchingProgress,
    },
    inventory: newInventory,
    economy: {
      luceros: (space.economy.luceros || 0) + lucerosEarned,
      lifetimeLucerosEarned: (space.economy.lifetimeLucerosEarned || 0) + lucerosEarned,
    },
  };

  return { updatedSpace, detail, lucerosEarned };
}

/**
 * Adquiere un artículo de la tienda o despensa con Luceros.
 */
export function buyCatalogItem(space, type, itemId) {
  let itemDef = null;
  if (type === 'food') itemDef = FOOD_CATALOG[itemId];
  else if (type === 'decor') itemDef = DECOR_CATALOG[itemId];
  else if (type === 'accessory') itemDef = ACCESSORY_CATALOG[itemId];

  if (!itemDef) throw new Error('Artículo no encontrado en el catálogo.');
  if (space.economy.luceros < itemDef.price) {
    throw new Error(`Te faltan ${itemDef.price - space.economy.luceros} Luceros para comprar esto.`);
  }

  const newEconomy = {
    ...space.economy,
    luceros: space.economy.luceros - itemDef.price,
  };

  const newInventory = {
    ...space.inventory,
    foods: { ...space.inventory.foods },
    unlockedDecor: [...space.inventory.unlockedDecor],
    unlockedAccessories: [...space.inventory.unlockedAccessories],
  };

  if (type === 'food') {
    newInventory.foods[itemId] = (newInventory.foods[itemId] || 0) + 1;
  } else if (type === 'decor') {
    if (!newInventory.unlockedDecor.includes(itemId)) {
      newInventory.unlockedDecor.push(itemId);
    }
  } else if (type === 'accessory') {
    if (!newInventory.unlockedAccessories.includes(itemId)) {
      newInventory.unlockedAccessories.push(itemId);
    }
  }

  return {
    ...space,
    updatedAt: Date.now(),
    economy: newEconomy,
    inventory: newInventory,
  };
}

/**
 * Equipa o desequipa un objeto de decoración en la habitación.
 */
export function equipDecorItem(space, slot, decorId) {
  return {
    ...space,
    updatedAt: Date.now(),
    inventory: {
      ...space.inventory,
      activeDecor: {
        ...space.inventory.activeDecor,
        [slot]: decorId || undefined,
      },
    },
  };
}

/**
 * Alterna el encendido de la lámpara del cuarto.
 */
export function toggleRoomLamp(space) {
  const isLit = space.inventory?.activeDecor?.lampLit !== false;
  return {
    ...space,
    updatedAt: Date.now(),
    inventory: {
      ...space.inventory,
      activeDecor: {
        ...space.inventory.activeDecor,
        lampLit: !isLit,
      },
    },
  };
}

/**
 * Equipa o desequipa un accesorio a Pippo.
 */
export function equipAccessoryItem(space, accessoryId) {
  return {
    ...space,
    updatedAt: Date.now(),
    pet: {
      ...space.pet,
      accessory: accessoryId || null,
    },
  };
}

/**
 * Genera el enlace directo para compartir con la pareja por WhatsApp o mensaje.
 */
export function generateShareableInviteUrl(code, baseUrl = 'https://valentinbenitez223-ux.github.io/juegito/') {
  const url = new URL(baseUrl);
  url.searchParams.set('join', code);
  return url.toString();
}

/**
 * Calcula la recompensa del minijuego de luciérnagas incluyendo bonificador por combos.
 */
export function calculateFirefliesReward(score, maxCombo = 1) {
  const comboBonus = Math.min(10, Math.floor(maxCombo * 1.5));
  const baseReward = Math.round(score * 1.8);
  return Math.min(30, Math.max(3, baseReward + comboBonus));
}

/**
 * Verifica si corresponde entregar el bono de reencuentro tras una ausencia de 24 horas.
 */
export function checkWelcomeBackBonus(lastVisit, now = Date.now()) {
  if (lastVisit === undefined || lastVisit === null) return { eligible: false, bonusLuceros: 0, hoursAbsent: 0 };
  const diffMs = now - lastVisit;
  const hoursAbsent = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMs >= LIMITS.absenceBonusThresholdMs) {
    return {
      eligible: true,
      bonusLuceros: LIMITS.absenceBonusLuceros,
      hoursAbsent,
      message: `¡Qué alegría verte de nuevo! Estuviste ausente unas ${hoursAbsent} horas. Pippo te extrañaba mucho y te regala +${LIMITS.absenceBonusLuceros} Luceros de bienvenida.`,
    };
  }

  return { eligible: false, bonusLuceros: 0, hoursAbsent };
}

/**
 * Suite de pruebas automatizadas QA (28 Tests) para verificación exhaustiva.
 */
export function runAutomatedAuditTests() {
  const tests = [];
  const addTest = (id, name, runFn) => {
    try {
      runFn();
      tests.push({ id, name, passed: true });
    } catch (err) {
      tests.push({ id, name, passed: false, error: err.message });
    }
  };

  // 1. clampNeed piso seguro (15)
  addTest('TEST-01', 'clampNeed respeta piso seguro de 15%', () => {
    if (clampNeed(5) !== 15) throw new Error(`Esperaba 15 pero obtuve ${clampNeed(5)}`);
  });

  // 2. clampNeed techo (100)
  addTest('TEST-02', 'clampNeed respeta techo de 100%', () => {
    if (clampNeed(120) !== 100) throw new Error(`Esperaba 100 pero obtuve ${clampNeed(120)}`);
  });

  // 3. clampNeed valor intermedio
  addTest('TEST-03', 'clampNeed mantiene valor intermedio correcto', () => {
    if (clampNeed(72.4) !== 72) throw new Error(`Esperaba 72 pero obtuve ${clampNeed(72.4)}`);
  });

  // 4. Degradación despierto en 1 hora
  addTest('TEST-04', 'calculateDecayedNeeds calcula degradación despierto en 1h', () => {
    const base = { hunger: 80, hygiene: 80, energy: 80, fun: 80, comfort: 80 };
    const res = calculateDecayedNeeds(base, 0, 3600000, false);
    if (res.needs.hunger !== Math.round(80 + DECAY_RATES.awake.hunger)) {
      throw new Error(`Hambre incorrecto: ${res.needs.hunger}`);
    }
  });

  // 5. Recuperación durmiendo en 1 hora
  addTest('TEST-05', 'calculateDecayedNeeds recupera energía durmiendo en 1h', () => {
    const base = { hunger: 80, hygiene: 80, energy: 60, fun: 80, comfort: 80 };
    const res = calculateDecayedNeeds(base, 0, 3600000, true);
    if (res.needs.energy !== Math.round(60 + DECAY_RATES.sleeping.energy)) {
      throw new Error(`Energía incorrecta: ${res.needs.energy}`);
    }
  });

  // 6. Ausencia 24h: nunca baja de 15% y no muere
  addTest('TEST-06', 'Simulación 24h ausencia: necesidades no caen de 15%', () => {
    const base = { hunger: 50, hygiene: 50, energy: 50, fun: 50, comfort: 50 };
    const res = calculateDecayedNeeds(base, 0, 24 * 3600000, false);
    Object.entries(res.needs).forEach(([k, v]) => {
      if (v < 15) throw new Error(`${k} cayó a ${v}, violando piso de 15`);
    });
  });

  // 7. Ausencia 48h: estabilidad comprobada
  addTest('TEST-07', 'Simulación 48h ausencia: estabilidad y supervivencia', () => {
    const base = { hunger: 80, hygiene: 80, energy: 80, fun: 80, comfort: 80 };
    const res = calculateDecayedNeeds(base, 0, 48 * 3600000, false);
    if (res.needs.hunger !== 15 || res.needs.hygiene !== 15) {
      throw new Error('Las necesidades debieron estabilizarse exactamente en el piso seguro');
    }
  });

  // 8. Ausencia 72h: cero castigo permanente
  addTest('TEST-08', 'Simulación 72h ausencia: cero castigo permanente', () => {
    const base = { hunger: 80, hygiene: 80, energy: 80, fun: 80, comfort: 80 };
    const res = calculateDecayedNeeds(base, 0, 72 * 3600000, false);
    if (res.needs.energy !== 15) throw new Error('Piso violado');
  });

  // 9. Bono reencuentro tras 24h
  addTest('TEST-09', 'checkWelcomeBackBonus otorga +15 Luceros tras 24h', () => {
    const res = checkWelcomeBackBonus(0, 25 * 3600000);
    if (!res.eligible || res.bonusLuceros !== 15) throw new Error('Bono no otorgado');
  });

  // 10. Bono reencuentro denegado antes de 24h
  addTest('TEST-10', 'checkWelcomeBackBonus no premia accesos tempranos (<24h)', () => {
    const res = checkWelcomeBackBonus(0, 10 * 3600000);
    if (res.eligible || res.bonusLuceros !== 0) throw new Error('Bono otorgado erróneamente');
  });

  // 11. Ánimo 'sleeping'
  addTest('TEST-11', 'getPetMood devuelve sleeping cuando está durmiendo', () => {
    const pet = { isSleeping: true, needs: { hunger: 90, hygiene: 90, energy: 90, fun: 90, comfort: 90 } };
    if (getPetMood(pet) !== 'sleeping') throw new Error('Estado anímico incorrecto');
  });

  // 12. Ánimo 'hungry'
  addTest('TEST-12', 'getPetMood devuelve hungry si hambre <= 25', () => {
    const pet = { isSleeping: false, needs: { hunger: 20, hygiene: 90, energy: 90, fun: 90, comfort: 90 } };
    if (getPetMood(pet) !== 'hungry') throw new Error('Estado anímico incorrecto');
  });

  // 13. Ánimo 'dirty'
  addTest('TEST-13', 'getPetMood devuelve dirty si higiene <= 25', () => {
    const pet = { isSleeping: false, needs: { hunger: 90, hygiene: 22, energy: 90, fun: 90, comfort: 90 } };
    if (getPetMood(pet) !== 'dirty') throw new Error('Estado anímico incorrecto');
  });

  // 14. Ánimo 'sleepy'
  addTest('TEST-14', 'getPetMood devuelve sleepy si energía <= 25', () => {
    const pet = { isSleeping: false, needs: { hunger: 90, hygiene: 90, energy: 18, fun: 90, comfort: 90 } };
    if (getPetMood(pet) !== 'sleepy') throw new Error('Estado anímico incorrecto');
  });

  // 15. Ánimo 'bored'
  addTest('TEST-15', 'getPetMood devuelve bored si diversión <= 25', () => {
    const pet = { isSleeping: false, needs: { hunger: 90, hygiene: 90, energy: 90, fun: 20, comfort: 90 } };
    if (getPetMood(pet) !== 'bored') throw new Error('Estado anímico incorrecto');
  });

  // 16. Ánimo 'happy'
  addTest('TEST-16', 'getPetMood devuelve happy con promedio >= 68', () => {
    const pet = { isSleeping: false, needs: { hunger: 85, hygiene: 85, energy: 85, fun: 85, comfort: 85 } };
    const mood = getPetMood(pet);
    if (mood !== 'happy' && mood !== 'ecstatic') throw new Error('Estado anímico incorrecto');
  });

  // 17. Ánimo 'idle'
  addTest('TEST-17', 'getPetMood devuelve idle en rangos normales', () => {
    const pet = { isSleeping: false, needs: { hunger: 55, hygiene: 55, energy: 55, fun: 55, comfort: 55 } };
    if (getPetMood(pet) !== 'idle') throw new Error('Estado anímico incorrecto');
  });

  // 18. Evolución Huevo a Bebé
  addTest('TEST-18', 'evaluateStage eclosiona huevo con 3 interacciones', () => {
    const stage = evaluateStage('egg', 3, 3);
    if (stage !== 'baby') throw new Error(`Esperaba baby pero obtuve ${stage}`);
  });

  // 19. Evolución Bebé a Joven
  addTest('TEST-19', 'evaluateStage evoluciona a joven con 25 interacciones', () => {
    const stage = evaluateStage('baby', 25, 3);
    if (stage !== 'young') throw new Error(`Esperaba young pero obtuve ${stage}`);
  });

  // 20. Evolución Joven a Adulto
  addTest('TEST-20', 'evaluateStage evoluciona a adulto con 75 interacciones', () => {
    const stage = evaluateStage('young', 75, 3);
    if (stage !== 'adult') throw new Error(`Esperaba adult pero obtuve ${stage}`);
  });

  // 21. Cuidado: Alimentar consume inventario y otorga Luceros
  addTest('TEST-21', 'applyCareAction feed consume comida y premia Luceros', () => {
    const space = createInitialSpace('u1', 'Valen', 'Pippo');
    space.pet.stage = 'baby';
    const res = applyCareAction(space, 'feed', 'u1', 'Valen', 'manzana_dulce', 1000);
    if (res.updatedSpace.inventory.foods.manzana_dulce !== 2) throw new Error('No decrementó comida');
    if (res.lucerosEarned !== 5) throw new Error('Luceros delta incorrecto');
  });

  // 22. Cuidado: Alimentar sin comida lanza error en español rioplatense
  addTest('TEST-22', 'applyCareAction lanza error si comida se agota', () => {
    const space = createInitialSpace('u1', 'Valen', 'Pippo');
    space.inventory.foods.manzana_dulce = 0;
    try {
      applyCareAction(space, 'feed', 'u1', 'Valen', 'manzana_dulce', 1000);
      throw new Error('Debió fallar');
    } catch (err) {
      if (!err.message.includes('No tenés esa comida')) throw err;
    }
  });

  // 23. Cuidado: Caricia suma confort y diversión
  addTest('TEST-23', 'applyCareAction pet suma confort y diversión', () => {
    const space = createInitialSpace('u1', 'Valen', 'Pippo');
    space.pet.stage = 'baby';
    space.pet.needs.comfort = 50;
    const res = applyCareAction(space, 'pet', 'u1', 'Valen', undefined, 1000);
    if (res.updatedSpace.pet.needs.comfort !== 70) throw new Error('Confort no subió');
    if (res.lucerosEarned !== 3) throw new Error('Recompensa errónea');
  });

  // 24. Cuidado: Baño aumenta higiene
  addTest('TEST-24', 'applyCareAction clean aumenta higiene significativamente', () => {
    const space = createInitialSpace('u1', 'Valen', 'Pippo');
    space.pet.stage = 'baby';
    space.pet.needs.hygiene = 30;
    const res = applyCareAction(space, 'clean', 'u1', 'Valen', undefined, 1000);
    if (res.updatedSpace.pet.needs.hygiene !== 75) throw new Error('Higiene no subió a 75');
  });

  // 25. Cuidado: Jugar gasta energía y valida cansancio
  addTest('TEST-25', 'applyCareAction play gasta energía y valida cansancio', () => {
    const space = createInitialSpace('u1', 'Valen', 'Pippo');
    space.pet.stage = 'baby';
    space.pet.needs.energy = 15;
    try {
      applyCareAction(space, 'play', 'u1', 'Valen', undefined, 1000);
      throw new Error('Debió impedir jugar con baja energía');
    } catch (err) {
      if (!err.message.includes('sueño')) throw err;
    }
  });

  // 26. Enlace de invitación con 1 clic (?join=CODE)
  addTest('TEST-26', 'generateShareableInviteUrl construye link directo de invitación', () => {
    const link = generateShareableInviteUrl('NIDO-AMOR', 'https://test.app/nido/');
    if (!link.includes('?join=NIDO-AMOR')) throw new Error(`URL incorrecta: ${link}`);
  });

  // 27. Bonificador de combos en luciérnagas
  addTest('TEST-27', 'calculateFirefliesReward calcula bonificación de combo sin exceder tope', () => {
    const r1 = calculateFirefliesReward(10, 1);
    const r2 = calculateFirefliesReward(10, 4);
    if (r2 <= r1) throw new Error('El combo debía otorgar mayor recompensa');
    const rMax = calculateFirefliesReward(50, 10);
    if (rMax > 30) throw new Error('Superó el tope de 30 luceros');
  });

  // 28. Interactividad de lámpara en diorama
  addTest('TEST-28', 'toggleRoomLamp conmuta el estado de luz en inventario', () => {
    const space = createInitialSpace('u1', 'Valen', 'Pippo');
    const off = toggleRoomLamp(space);
    if (off.inventory.activeDecor.lampLit !== false) throw new Error('No apagó lámpara');
    const on = toggleRoomLamp(off);
    if (on.inventory.activeDecor.lampLit !== true) throw new Error('No encendió lámpara');
  });

  const passedCount = tests.filter((t) => t.passed).length;
  return {
    total: tests.length,
    passed: passedCount,
    failed: tests.length - passedCount,
    allPassed: passedCount === tests.length,
    tests,
  };
}
