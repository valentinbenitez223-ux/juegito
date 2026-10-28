import { describe, it, expect } from 'vitest';
import {
  clampNeed,
  calculateDecayedNeeds,
  getPetMood,
  evaluateStage,
  createInitialSpace,
  applyCareAction,
} from '../src/domain/simulation';
import { generateInviteCode, validateInvitation, InvitationPayload } from '../src/domain/validation';
import { LIMITS } from '../src/domain/constants';

describe('1. Límites numéricos y Clamping de necesidades', () => {
  it('no permite valores menores a 10 ni mayores a 100', () => {
    expect(clampNeed(-50)).toBe(10);
    expect(clampNeed(5)).toBe(10);
    expect(clampNeed(10)).toBe(10);
    expect(clampNeed(50)).toBe(50);
    expect(clampNeed(100)).toBe(100);
    expect(clampNeed(150)).toBe(100);
  });
});

describe('2. Simulación de ausencia y caída temporal (24h, 48h, 72h)', () => {
  const startNeeds = { hunger: 90, hygiene: 90, energy: 90, fun: 90, comfort: 90 };
  const baseTime = 1700000000000;

  it('evoluciona razonablemente tras 24 horas sin entrar', () => {
    const after24h = baseTime + 24 * 3600 * 1000;
    const { needs } = calculateDecayedNeeds(startNeeds, baseTime, after24h, false);

    // Hambre: 90 - (3.5 * 24) = 90 - 84 = 6 -> limitado al piso 10
    expect(needs.hunger).toBe(10);
    // Higiene: 90 - (2.5 * 24) = 90 - 60 = 30
    expect(needs.hygiene).toBe(30);
    // Energía: 90 - (3.0 * 24) = 90 - 72 = 18 -> piso 10 si supera, o 18
    expect(needs.energy).toBe(18);
    // Diversión: 90 - (3.0 * 24) = 18
    expect(needs.fun).toBe(18);
    // Comodidad: 90 - (1.5 * 24) = 90 - 36 = 54
    expect(needs.comfort).toBe(54);
  });

  it('tras 48 y 72 horas no muere ni baja de 10 puntos (cero castigo)', () => {
    const after48h = baseTime + 48 * 3600 * 1000;
    const { needs: needs48 } = calculateDecayedNeeds(startNeeds, baseTime, after48h, false);
    expect(needs48.hunger).toBe(10);
    expect(needs48.hygiene).toBe(10);
    expect(needs48.energy).toBe(10);
    expect(needs48.fun).toBe(10);
    expect(needs48.comfort).toBe(18);

    const after72h = baseTime + 72 * 3600 * 1000;
    const { needs: needs72 } = calculateDecayedNeeds(startNeeds, baseTime, after72h, false);
    expect(needs72.hunger).toBe(10);
    expect(needs72.hygiene).toBe(10);
    expect(needs72.energy).toBe(10);
    expect(needs72.fun).toBe(10);
    expect(needs72.comfort).toBe(10);
  });

  it('si está durmiendo, la energía se recupera hasta 100 y otras necesidades decaen más lento', () => {
    const lowEnergyNeeds = { hunger: 50, hygiene: 50, energy: 20, fun: 50, comfort: 50 };
    const after8h = baseTime + 8 * 3600 * 1000;
    const { needs } = calculateDecayedNeeds(lowEnergyNeeds, baseTime, after8h, true);

    // Energía: 20 + 12 * 8 = 20 + 96 = 116 -> limitado a 100
    expect(needs.energy).toBe(100);
    // Hambre decae mucho más lento durmiendo (-1.5 * 8 = -12) -> 38
    expect(needs.hunger).toBe(38);
  });
});

describe('3. Acciones de cuidado y economía', () => {
  it('alimentar consume comida, sube hambre y otorga luceros', () => {
    const space = createInitialSpace('u1', 'Valen');
    // Forzamos hambre a 40 para probar incremento
    space.pet.needs.hunger = 40;
    const initialApples = space.inventory.foods['manzana_dulce'];
    const initialLuceros = space.economy.luceros;

    const { updatedSpace, lucerosEarned } = applyCareAction(
      space,
      'feed',
      'u1',
      'Valen',
      'manzana_dulce',
      space.pet.lastNeedsUpdate
    );

    expect(updatedSpace.inventory.foods['manzana_dulce']).toBe(initialApples - 1);
    expect(updatedSpace.pet.needs.hunger).toBe(70); // 40 + 30
    expect(lucerosEarned).toBe(5);
    expect(updatedSpace.economy.luceros).toBe(initialLuceros + 5);
  });

  it('falla con mensaje amigable si intenta alimentar sin stock', () => {
    const space = createInitialSpace('u1', 'Valen');
    space.inventory.foods['manzana_dulce'] = 0;

    expect(() => {
      applyCareAction(space, 'feed', 'u1', 'Valen', 'manzana_dulce');
    }).toThrow('No tenés esa comida en el inventario.');
  });

  it('no permite jugar si la mascota tiene energía insuficiente', () => {
    const space = createInitialSpace('u1', 'Valen');
    space.pet.needs.energy = 12; // Menor a 15

    expect(() => {
      applyCareAction(space, 'play', 'u1', 'Valen');
    }).toThrow(/mucho sueñito para jugar/);
  });

  it('bañar limpia la higiene y acariciar sube comodidad', () => {
    const space = createInitialSpace('u1', 'Valen');
    space.pet.needs.hygiene = 20;
    space.pet.needs.comfort = 40;

    const { updatedSpace: cleanSpace } = applyCareAction(
      space,
      'clean',
      'u1',
      'Valen',
      undefined,
      space.pet.lastNeedsUpdate
    );
    expect(cleanSpace.pet.needs.hygiene).toBe(65);

    const { updatedSpace: pettedSpace } = applyCareAction(
      cleanSpace,
      'pet',
      'u1',
      'Valen',
      undefined,
      space.pet.lastNeedsUpdate
    );
    expect(pettedSpace.pet.needs.comfort).toBe(clampNeed(cleanSpace.pet.needs.comfort + 20));
  });
});

describe('4. Evolución de la criatura', () => {
  it('el huevo eclosiona al alcanzar 3 interacciones de cuidado', () => {
    expect(evaluateStage('egg', 1, 1)).toBe('egg');
    expect(evaluateStage('egg', 2, 2)).toBe('egg');
    expect(evaluateStage('egg', 3, 3)).toBe('baby');
  });

  it('el bebé evoluciona a joven a las 25 interacciones y a adulto a las 75', () => {
    expect(evaluateStage('baby', 15, 3)).toBe('baby');
    expect(evaluateStage('baby', 25, 3)).toBe('young');
    expect(evaluateStage('young', 74, 3)).toBe('young');
    expect(evaluateStage('young', 75, 3)).toBe('adult');
  });
});

describe('5. Expresiones y Estados Anímicos (Mood)', () => {
  it('reconoce estados anímicos según las necesidades críticas', () => {
    const space = createInitialSpace('u1', 'Valen');
    space.pet.isSleeping = true;
    expect(getPetMood(space.pet)).toBe('sleeping');

    space.pet.isSleeping = false;
    space.pet.needs.energy = 20;
    expect(getPetMood(space.pet)).toBe('sleepy');

    space.pet.needs.energy = 80;
    space.pet.needs.hunger = 15;
    expect(getPetMood(space.pet)).toBe('hungry');

    space.pet.needs.hunger = 90;
    space.pet.needs.hygiene = 15;
    expect(getPetMood(space.pet)).toBe('dirty');

    space.pet.needs.hygiene = 90;
    space.pet.needs.fun = 15;
    expect(getPetMood(space.pet)).toBe('bored');

    space.pet.needs.fun = 90;
    expect(getPetMood(space.pet)).toBe('happy');
  });
});

describe('6. Tokens de Invitación y Seguridad de Integrantes', () => {
  it('genera códigos de invitación en formato NIDO-XXXX con alta entropía', () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^NIDO-[A-HJ-NP-Z2-9]{4}$/);
  });

  it('valida correctamente las condiciones de ingreso al nido', () => {
    const now = 1700000000000;
    const validInvite: InvitationPayload = {
      code: 'NIDO-TEST',
      spaceId: 's1',
      createdBy: 'user_creador',
      createdByName: 'Creador',
      createdAt: now,
      expiresAt: now + 48 * 3600 * 1000,
      used: false,
    };

    // Caso válido: segundo usuario ingresa a un nido con 1 integrante
    const ok = validateInvitation(validInvite, 'user_pareja', ['user_creador'], now);
    expect(ok.valid).toBe(true);

    // Caso inválido: el propio creador intenta canjearlo
    const selfClaim = validateInvitation(validInvite, 'user_creador', ['user_creador'], now);
    expect(selfClaim.valid).toBe(false);
    expect(selfClaim.reason).toContain('tu propio código');

    // Caso inválido: expirado (+49h)
    const expired = validateInvitation(validInvite, 'user_pareja', ['user_creador'], now + 49 * 3600 * 1000);
    expect(expired.valid).toBe(false);
    expect(expired.reason).toContain('ha vencido');

    // Caso inválido: ya usado
    const usedInvite = { ...validInvite, used: true };
    const alreadyUsed = validateInvitation(usedInvite, 'user_pareja', ['user_creador'], now);
    expect(alreadyUsed.valid).toBe(false);
    expect(alreadyUsed.reason).toContain('ya fue utilizado');

    // Caso inválido: el nido ya tiene 2 personas
    const fullSpace = validateInvitation(validInvite, 'user_tercero', ['user_creador', 'user_pareja'], now);
    expect(fullSpace.valid).toBe(false);
    expect(fullSpace.reason).toContain('dos integrantes completos');
  });
});
