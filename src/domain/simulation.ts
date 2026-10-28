import { PetState, PetNeeds, PetMood, SpaceState, ActionType, PetStage } from './types';
import { DECAY_RATES, LIMITS, APP_CONFIG, FOOD_CATALOG } from './constants';

/**
 * Limita un valor numérico entre los rangos permitidos del juego (10 y 100).
 */
export function clampNeed(val: number): number {
  return Math.max(LIMITS.minNeed, Math.min(LIMITS.maxNeed, Math.round(val)));
}

/**
 * Simula el paso del tiempo de forma asíncrona sobre las necesidades de la mascota.
 * No depende de ticks en segundo plano: calcula la diferencia entre marcas temporales.
 */
export function calculateDecayedNeeds(
  currentNeeds: PetNeeds,
  lastUpdate: number,
  now: number,
  isSleeping: boolean
): { needs: PetNeeds; elapsedHours: number } {
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
 * Determina el estado anímico y expresión de la mascota según sus necesidades.
 */
export function getPetMood(pet: PetState): PetMood {
  if (pet.isSleeping) return 'sleeping';

  // Si alguna necesidad está por debajo del umbral crítico (25)
  if (pet.needs.energy <= LIMITS.criticalThreshold) return 'sleepy';
  if (pet.needs.hunger <= LIMITS.criticalThreshold) return 'hungry';
  if (pet.needs.hygiene <= LIMITS.criticalThreshold) return 'dirty';
  if (pet.needs.fun <= LIMITS.criticalThreshold) return 'bored';

  // Si todas las necesidades están en buen nivel
  const avg = (pet.needs.hunger + pet.needs.hygiene + pet.needs.energy + pet.needs.fun + pet.needs.comfort) / 5;
  if (avg >= 70) return 'happy';

  return 'idle';
}

/**
 * Evalúa si la mascota puede evolucionar según las interacciones conjuntas.
 */
export function evaluateStage(currentStage: PetStage, totalInteractions: number, hatchingProgress: number): PetStage {
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
 * Crea un estado inicial limpio para un nuevo nido compartido.
 */
export function createInitialSpace(creatorUid: string, creatorName: string, petName: string = APP_CONFIG.defaultPetName): SpaceState {
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
        avatarColor: '#A9C7B1',
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
      luceros: 50, // Pequeño fondo inicial de bienvenida
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
      },
      unlockedAccessories: [],
    },
  };
}

/**
 * Ejecuta una acción de cuidado en el estado del espacio.
 * Garantiza consistencia atómica, límites numéricos y registro de recompensas.
 */
export function applyCareAction(
  space: SpaceState,
  action: ActionType,
  userId: string,
  userName: string,
  foodId?: string,
  now: number = Date.now()
): { updatedSpace: SpaceState; detail: string; lucerosEarned: number } {
  // Primero sincronizamos la degradación hasta el instante actual
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
  let newHatchingProgress = space.pet.hatchingProgress;

  // Si es un huevo, cualquier cuidado aumenta el progreso de eclosión
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
      detail = `${userName} le dio un baño tibio con burbujas a ${space.pet.name}`;
      break;
    }
    case 'play': {
      if (newNeeds.energy <= 15) {
        throw new Error(`${space.pet.name} tiene mucho sueñito para jugar ahora. Dejalo descansar un ratito.`);
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

  const totalInteractions = space.pet.totalCareInteractions + 1;
  const newStage = evaluateStage(space.pet.stage, totalInteractions, newHatchingProgress);

  const updatedSpace: SpaceState = {
    ...space,
    updatedAt: now,
    pet: {
      ...space.pet,
      stage: newStage,
      needs: newNeeds,
      isSleeping: newSleeping,
      sleepStartedAt: newSleeping ? (space.pet.sleepStartedAt || now) : undefined,
      lastNeedsUpdate: now,
      totalCareInteractions: totalInteractions,
      hatchingProgress: newHatchingProgress,
    },
    inventory: newInventory,
    economy: {
      luceros: space.economy.luceros + lucerosEarned,
      lifetimeLucerosEarned: space.economy.lifetimeLucerosEarned + lucerosEarned,
    },
  };

  return { updatedSpace, detail, lucerosEarned };
}
