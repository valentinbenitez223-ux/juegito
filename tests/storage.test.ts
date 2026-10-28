import { describe, it, expect, beforeEach } from 'vitest';
import { syncEngine } from '../src/services/storage';

describe('Sincronización y Motor de Persistencia Local (Nuestro Nido)', () => {
  beforeEach(() => {
    syncEngine.resetAllData();
  });

  it('inicia con un nido limpio, huevo y saldo inicial de luceros', () => {
    const space = syncEngine.getSpace();
    expect(space).not.toBeNull();
    expect(space?.pet.stage).toBe('egg');
    expect(space?.economy.luceros).toBe(50);
    expect(space?.members).toContain('user_valen');
  });

  it('realiza acciones de cuidado y registra la bitácora histórica', async () => {
    const initialLuceros = syncEngine.getSpace()!.economy.luceros;
    const res = await syncEngine.performCare('pet');

    expect(res.luceros).toBe(3);
    const spaceAfter = syncEngine.getSpace()!;
    expect(spaceAfter.economy.luceros).toBe(initialLuceros + 3);
    expect(spaceAfter.pet.totalCareInteractions).toBe(1);
  });

  it('permite enviar notas compartidas entre la pareja', async () => {
    const note = await syncEngine.sendNote('¡Que tengas un día hermoso!', '🌸');
    expect(note.message).toBe('¡Que tengas un día hermoso!');
    expect(note.sticker).toBe('🌸');
    expect(note.senderName).toBe('Valen');
  });

  it('permite responder el rito diario y otorga +20 Luceros', async () => {
    const initialLuceros = syncEngine.getSpace()!.economy.luceros;
    const ritual = await syncEngine.answerDailyRitual('Pasear juntos por el parque.');

    expect(ritual.responses['user_valen']).toBeDefined();
    expect(ritual.responses['user_valen'].text).toBe('Pasear juntos por el parque.');
    expect(syncEngine.getSpace()!.economy.luceros).toBe(initialLuceros + 20);
  });

  it('compra comida en la despensa con descuento de Luceros', async () => {
    const initialLuceros = syncEngine.getSpace()!.economy.luceros;
    const initialApples = syncEngine.getSpace()!.inventory.foods['manzana_dulce'] || 0;

    await syncEngine.buyItem('food', 'manzana_dulce');
    const spaceAfter = syncEngine.getSpace()!;

    expect(spaceAfter.economy.luceros).toBe(initialLuceros - 5);
    expect(spaceAfter.inventory.foods['manzana_dulce']).toBe(initialApples + 1);
  });

  it('equipa decoraciones en los slots de la habitación', async () => {
    await syncEngine.equipDecor('plant', 'monstera_maceta');
    const spaceAfter = syncEngine.getSpace()!;
    expect(spaceAfter.inventory.activeDecor.plant).toBe('monstera_maceta');

    // Desequipar
    await syncEngine.equipDecor('plant', undefined);
    const spaceEmpty = syncEngine.getSpace()!;
    expect(spaceEmpty.inventory.activeDecor.plant).toBeUndefined();
  });

  it('registra los resultados de los minijuegos sumando luceros y diversión', async () => {
    const initialLuceros = syncEngine.getSpace()!.economy.luceros;
    const initialFun = syncEngine.getSpace()!.pet.needs.fun;

    await syncEngine.recordGameResult('Noche de Luciérnagas', 15, 20);
    const spaceAfter = syncEngine.getSpace()!;

    expect(spaceAfter.economy.luceros).toBe(initialLuceros + 20);
    expect(spaceAfter.pet.needs.fun).toBe(Math.min(100, initialFun + 15));
  });

  it('genera códigos de invitación temporales de 48 horas', async () => {
    const code = await syncEngine.generateNewInvite();
    expect(code).toMatch(/^NIDO-[A-Z0-9]{4}$/);
    const space = syncEngine.getSpace()!;
    expect(space.inviteCode).toBe(code);
    expect(space.inviteExpiresAt).toBeGreaterThan(Date.now());
  });

  it('permite alternar el usuario local para probar la experiencia asíncrona', () => {
    syncEngine.switchLocalUser('user_sofi', 'Sofi');
    expect(syncEngine.getCurrentUserId()).toBe('user_sofi');
    expect(syncEngine.getCurrentUserName()).toBe('Sofi');

    const space = syncEngine.getSpace()!;
    expect(space.memberProfiles['user_sofi']).toBeDefined();
    expect(space.memberProfiles['user_sofi'].displayName).toBe('Sofi');
  });
});
