// ============================================================================
// NUESTRO NIDO | Persistencia Local, Multiusuario y Sincronización entre Pestañas
// ============================================================================

import {
  createInitialSpace,
  applyCareAction,
  calculateDecayedNeeds,
  buyCatalogItem,
  equipDecorItem,
  equipAccessoryItem,
  checkWelcomeBackBonus,
  toggleRoomLamp,
  generateShareableInviteUrl,
} from './game.js';
import { DAILY_PROMPTS } from './config.js';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'nuestro_nido_user_id',
  CURRENT_USER_NAME: 'nuestro_nido_user_name',
  SPACE: 'nuestro_nido_space_data',
  ACTIVITIES: 'nuestro_nido_activities',
  NOTES: 'nuestro_nido_notes',
  MEMORIES: 'nuestro_nido_memories',
  RITUALS: 'nuestro_nido_rituals',
  INVITATIONS: 'nuestro_nido_invitations',
  OFFLINE_QUEUE: 'nuestro_nido_offline_queue',
  LAST_VISIT_TIME: 'nuestro_nido_last_visit',
  FIREBASE_CONFIG_CUSTOM: 'nuestro_nido_custom_firebase_cfg',
};

class LocalStore {
  constructor() {
    this.broadcast = null;
    this.subscribers = new Set();
    this.remoteActionHandler = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcast = new BroadcastChannel('nuestro_nido_channel');
        this.broadcast.onmessage = (event) => {
          if (event.data) {
            if (this.remoteActionHandler) {
              this.remoteActionHandler(event.data);
            }
            if (event.data.type === 'SYNC_REFRESH') {
              this.notifyListeners();
            }
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel no soportado:', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('nuestro_nido_')) {
          this.notifyListeners();
        }
      });
    }
  }

  setRemoteActionHandler(handler) {
    this.remoteActionHandler = handler;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifyListeners() {
    for (const sub of this.subscribers) {
      try {
        sub();
      } catch (err) {
        console.error('Error en listener de nido:', err);
      }
    }
  }

  broadcastChange() {
    if (this.broadcast) {
      try {
        this.broadcast.postMessage({ type: 'SYNC_REFRESH', timestamp: Date.now() });
      } catch {}
    }
    this.notifyListeners();
  }

  getItem(key) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {}
    }
    return null;
  }

  setItem(key, val) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, val);
      } catch {}
    }
  }

  removeItem(key) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    }
  }

  // --- Métodos de Usuario ---
  getCurrentUser() {
    let id = this.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    let name = this.getItem(STORAGE_KEYS.CURRENT_USER_NAME);

    if (!id || !name) {
      id = 'user_valen';
      name = 'Valen';
      this.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
      this.setItem(STORAGE_KEYS.CURRENT_USER_NAME, name);
    }
    return { id, name };
  }

  setCurrentUser(id, name) {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    this.setItem(STORAGE_KEYS.CURRENT_USER_NAME, name);

    const space = this.getSpace();
    if (space) {
      if (!space.members.includes(id)) {
        if (space.members.length < 2) {
          space.members.push(id);
        }
      }
      space.memberProfiles = space.memberProfiles || {};
      space.memberProfiles[id] = {
        displayName: name,
        avatarColor: id.includes('valen') ? '#8DAF97' : '#E8A7A5',
        lastSeenAt: Date.now(),
      };
      this.saveSpace(space);
    }

    this.broadcastChange();
  }

  // Alternar entre los dos integrantes de la pareja
  switchPartnerProfile() {
    const cur = this.getCurrentUser();
    if (cur.id === 'user_valen') {
      this.setCurrentUser('user_sofi', 'Sofi');
    } else {
      this.setCurrentUser('user_valen', 'Valen');
    }
  }

  // --- Métodos del Espacio (Hogar & Mascota) ---
  getSpace() {
    const raw = this.getItem(STORAGE_KEYS.SPACE);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveSpace(space) {
    space.updatedAt = Date.now();
    this.setItem(STORAGE_KEYS.SPACE, JSON.stringify(space));
    this.broadcastChange();
  }

  ensureInitialized() {
    const user = this.getCurrentUser();
    let space = this.getSpace();

    if (!space) {
      space = createInitialSpace(user.id, user.name, 'Pippo');
      this.saveSpace(space);

      // Crear recuerdos iniciales de inauguración del nido
      this.addMemory({
        title: 'Llegada del Nido',
        description: `${user.name} preparó este rincón cálido para cuidarlo juntos de a dos.`,
        icon: '🏡',
        category: 'milestone',
      });

      this.addActivity({
        userId: user.id,
        userName: user.name,
        actionType: 'hatch',
        details: 'El nido abrió sus puertas.',
        lucerosDelta: 50,
      });
    }

    // Comprobar bono de reencuentro por ausencia >= 24h
    const now = Date.now();
    const lastVisitStr = this.getItem(STORAGE_KEYS.LAST_VISIT_TIME);
    let welcomeBonus = null;

    if (lastVisitStr) {
      const lastVisit = parseInt(lastVisitStr, 10);
      const bonusCheck = checkWelcomeBackBonus(lastVisit, now);
      if (bonusCheck.eligible) {
        space.economy.luceros += bonusCheck.bonusLuceros;
        space.economy.lifetimeLucerosEarned += bonusCheck.bonusLuceros;
        this.saveSpace(space);
        welcomeBonus = bonusCheck;

        this.addActivity({
          userId: user.id,
          userName: user.name,
          actionType: 'pet',
          details: `Reencuentro tras ${bonusCheck.hoursAbsent}h (+${bonusCheck.bonusLuceros} Luceros)`,
          lucerosDelta: bonusCheck.bonusLuceros,
        });
      }
    }
    this.setItem(STORAGE_KEYS.LAST_VISIT_TIME, String(now));

    // Sincronizar degradación natural según tiempo transcurrido
    const decayed = calculateDecayedNeeds(
      space.pet.needs,
      space.pet.lastNeedsUpdate,
      now,
      space.pet.isSleeping
    );
    if (decayed.elapsedHours > 0) {
      space.pet.needs = decayed.needs;
      space.pet.lastNeedsUpdate = now;
      this.saveSpace(space);
    }

    return { space, welcomeBonus };
  }

  // Simular ausencia de X horas (para pruebas de cero castigo y estabilidad)
  simulateAbsence(hours) {
    const space = this.getSpace();
    if (!space) return;

    const msToSubtract = hours * 60 * 60 * 1000;
    const fakePastTime = Date.now() - msToSubtract;

    space.pet.lastNeedsUpdate = fakePastTime;
    this.setItem(STORAGE_KEYS.LAST_VISIT_TIME, String(fakePastTime));
    this.saveSpace(space);

    return this.ensureInitialized();
  }

  // --- Acciones de Cuidado ---
  performCare(action, foodId) {
    const space = this.getSpace();
    const user = this.getCurrentUser();
    if (!space) throw new Error('Espacio no inicializado');

    const result = applyCareAction(space, action, user.id, user.name, foodId);
    this.saveSpace(result.updatedSpace);

    this.addActivity({
      userId: user.id,
      userName: user.name,
      actionType: action,
      details: result.detail,
      lucerosDelta: result.lucerosEarned,
    });

    if (space.pet.stage === 'egg' && result.updatedSpace.pet.stage === 'baby') {
      this.addMemory({
        title: '¡Eclosionó Pippo!',
        description: `El cascarón se rompió y nació nuestro pequeño compañero.`,
        icon: '🐣',
        category: 'hatching',
      });
    }

    return result;
  }

  // --- Tienda y Accesorios ---
  buyItem(type, itemId) {
    const space = this.getSpace();
    if (!space) throw new Error('Espacio no inicializado');

    const updated = buyCatalogItem(space, type, itemId);
    this.saveSpace(updated);

    const user = this.getCurrentUser();
    this.addActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'decor_changed',
      details: `${user.name} adquirió un nuevo artículo en la tienda del nido`,
      lucerosDelta: 0,
    });
    return updated;
  }

  equipDecor(slot, decorId) {
    const space = this.getSpace();
    if (!space) throw new Error('Espacio no inicializado');
    const updated = equipDecorItem(space, slot, decorId);
    this.saveSpace(updated);
    return updated;
  }

  toggleLamp() {
    const space = this.getSpace();
    if (!space) return false;
    const updated = toggleRoomLamp(space);
    this.saveSpace(updated);
    return updated.inventory.activeDecor.lampLit !== false;
  }

  equipAccessory(accessoryId) {
    const space = this.getSpace();
    if (!space) throw new Error('Espacio no inicializado');
    const updated = equipAccessoryItem(space, accessoryId);
    this.saveSpace(updated);
    return updated;
  }

  recordGameReward(gameName, score, lucerosEarned) {
    const space = this.getSpace();
    const user = this.getCurrentUser();
    if (!space) return;

    space.economy.luceros += lucerosEarned;
    space.economy.lifetimeLucerosEarned += lucerosEarned;
    space.pet.needs.fun = Math.min(100, space.pet.needs.fun + 18);
    this.saveSpace(space);

    this.addActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'game_played',
      details: `${user.name} jugó a ${gameName} (Puntos: ${score}) y sumó +${lucerosEarned} Luceros`,
      lucerosDelta: lucerosEarned,
    });
  }

  // --- Cartitas (Notas Compartidas) con Reacciones ---
  getNotes() {
    const raw = this.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      return [
        {
          id: 'note_welcome',
          senderId: 'system',
          senderName: 'Nuestro Nido',
          message: '¡Dejale cartitas cariñosas y stickers con amor a tu pareja acá! 💌',
          sticker: '💌',
          createdAt: Date.now() - 3600000,
          read: true,
          reactions: {},
        },
      ];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  sendNote(message, sticker = '💌') {
    const user = this.getCurrentUser();
    const notes = this.getNotes();
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: user.id,
      senderName: user.name,
      message: message.trim(),
      sticker,
      createdAt: Date.now(),
      read: false,
      reactions: {},
    };
    notes.unshift(newNote);
    this.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));

    this.addActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'decor_changed',
      details: `${user.name} dejó una nueva cartita cariñosa ${sticker}`,
    });

    this.broadcastChange();
    return newNote;
  }

  addNoteReaction(noteId, emoji) {
    const user = this.getCurrentUser();
    const notes = this.getNotes();
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      note.reactions = note.reactions || {};
      note.reactions[user.id] = emoji;
      this.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      this.broadcastChange();
    }
  }

  markNoteAsRead(noteId) {
    const notes = this.getNotes();
    const note = notes.find((n) => n.id === noteId);
    if (note && !note.read) {
      note.read = true;
      note.readAt = Date.now();
      this.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      this.broadcastChange();
    }
  }

  // --- Rito Diario (Pregunta del Día) ---
  getTodayRitual() {
    const today = new Date().toISOString().split('T')[0];
    const raw = this.getItem(STORAGE_KEYS.RITUALS);
    let rituals = {};
    if (raw) {
      try {
        rituals = JSON.parse(raw);
      } catch {}
    }

    if (!rituals[today]) {
      const dayIndex =
        Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % DAILY_PROMPTS.length;
      rituals[today] = {
        id: today,
        prompt: DAILY_PROMPTS[dayIndex],
        responses: {},
        isRevealed: false,
      };
      this.setItem(STORAGE_KEYS.RITUALS, JSON.stringify(rituals));
    }
    return rituals[today];
  }

  answerTodayRitual(text) {
    const today = new Date().toISOString().split('T')[0];
    const ritual = this.getTodayRitual();
    const user = this.getCurrentUser();
    const space = this.getSpace();

    ritual.responses[user.id] = {
      text: text.trim(),
      answeredAt: Date.now(),
    };

    const partnerId = space ? space.members.find((m) => m !== user.id) : null;
    if (partnerId && ritual.responses[partnerId]) {
      ritual.isRevealed = true;
    }

    const raw = this.getItem(STORAGE_KEYS.RITUALS);
    let rituals = raw ? JSON.parse(raw) : {};
    rituals[today] = ritual;
    this.setItem(STORAGE_KEYS.RITUALS, JSON.stringify(rituals));

    if (space) {
      space.economy.luceros += 10;
      this.saveSpace(space);
    }

    this.addActivity({
      userId: user.id,
      userName: user.name,
      actionType: 'decor_changed',
      details: `${user.name} respondió el Rito Diario (+10 Luceros) ✨`,
      lucerosDelta: 10,
    });

    this.broadcastChange();
    return ritual;
  }

  // --- Recuerdos (Álbum del Nido) ---
  getMemories() {
    const raw = this.getItem(STORAGE_KEYS.MEMORIES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  addMemory(mem) {
    const memories = this.getMemories();
    const newMem = {
      id: `mem_${Date.now()}`,
      title: mem.title,
      description: mem.description,
      icon: mem.icon || '🌸',
      unlockedAt: Date.now(),
      category: mem.category || 'milestone',
    };
    memories.unshift(newMem);
    this.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    this.broadcastChange();
  }

  // --- Línea de Tiempo (Actividades) ---
  getActivities() {
    const raw = this.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  addActivity(act) {
    const activities = this.getActivities();
    const newAct = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId: act.userId,
      userName: act.userName,
      actionType: act.actionType,
      details: act.details,
      timestamp: Date.now(),
      lucerosDelta: act.lucerosDelta,
    };
    activities.unshift(newAct);
    if (activities.length > 50) activities.pop();
    this.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }

  // --- Generación y Canje de Invitaciones (Con Enlaces Directos PWA) ---
  generateInviteCode() {
    const space = this.getSpace();
    const user = this.getCurrentUser();
    if (!space) throw new Error('Espacio no inicializado');

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'NIDO-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const inviteData = {
      code,
      spaceId: space.id,
      createdBy: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 48 * 60 * 60 * 1000,
      used: false,
    };

    let invites = {};
    const raw = this.getItem(STORAGE_KEYS.INVITATIONS);
    if (raw) {
      try {
        invites = JSON.parse(raw);
      } catch {}
    }
    invites[code] = inviteData;
    this.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invites));

    space.inviteCode = code;
    space.inviteExpiresAt = inviteData.expiresAt;
    this.saveSpace(space);

    return code;
  }

  joinWithInviteCode(code, partnerName = 'Sofi') {
    const cleanCode = code.trim().toUpperCase();
    const raw = this.getItem(STORAGE_KEYS.INVITATIONS);
    let invites = {};
    if (raw) {
      try {
        invites = JSON.parse(raw);
      } catch {}
    }

    const invite = invites[cleanCode];
    if (!invite) {
      throw new Error('Código de invitación no encontrado o incorrecto.');
    }
    if (invite.used) {
      throw new Error('Este código de invitación ya fue utilizado.');
    }
    if (Date.now() > invite.expiresAt) {
      throw new Error('El código de invitación ha expirado.');
    }

    const curUser = this.getCurrentUser();
    if (invite.createdBy === curUser.id) {
      throw new Error('No podés canjear un código creado por vos mismo.');
    }

    const space = this.getSpace();
    if (!space) throw new Error('No se encontró el nido asociado.');

    if (space.members.length >= 2 && !space.members.includes(curUser.id)) {
      throw new Error('El nido ya tiene sus dos integrantes completos.');
    }

    const partnerId = `user_${partnerName.toLowerCase().replace(/\s+/g, '_')}`;
    if (!space.members.includes(partnerId)) {
      space.members.push(partnerId);
    }
    space.memberProfiles = space.memberProfiles || {};
    space.memberProfiles[partnerId] = {
      displayName: partnerName,
      avatarColor: '#E8A7A5',
      lastSeenAt: Date.now(),
    };
    space.inviteCode = null;
    space.inviteExpiresAt = null;

    invite.used = true;
    invite.usedBy = partnerId;
    invites[cleanCode] = invite;
    this.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invites));

    this.saveSpace(space);
    this.setCurrentUser(partnerId, partnerName);

    this.addMemory({
      title: '¡Nido Completo!',
      description: `${partnerName} se sumó al nido. ¡Ahora somos dos cuidando a Pippo juntos!`,
      icon: '🎉',
      category: 'milestone',
    });

    return space;
  }

  resetAllData() {
    this.removeItem(STORAGE_KEYS.SPACE);
    this.removeItem(STORAGE_KEYS.NOTES);
    this.removeItem(STORAGE_KEYS.ACTIVITIES);
    this.removeItem(STORAGE_KEYS.MEMORIES);
    this.removeItem(STORAGE_KEYS.RITUALS);
    this.removeItem(STORAGE_KEYS.INVITATIONS);
    this.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    this.removeItem(STORAGE_KEYS.LAST_VISIT_TIME);
    this.ensureInitialized();
    this.broadcastChange();
  }
}

export const localStore = new LocalStore();
