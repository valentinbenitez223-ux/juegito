import {
  SpaceState,
  ActivityLog,
  SharedNote,
  NidoMemory,
  DailyRitual,
  ActionType,
  SpaceDecor,
} from '../domain/types';
import {
  createInitialSpace,
  applyCareAction,
  calculateDecayedNeeds,
} from '../domain/simulation';
import {
  generateInviteCode,
  validateInvitation,
  InvitationPayload,
} from '../domain/validation';
import {
  FOOD_CATALOG,
  DECOR_CATALOG,
  ACCESSORY_CATALOG,
  DAILY_PROMPTS,
} from '../domain/constants';

// Claves de LocalStorage
const STORAGE_KEYS = {
  CURRENT_USER_ID: 'nuestro_nido_user_id',
  CURRENT_USER_NAME: 'nuestro_nido_user_name',
  SPACE: 'nuestro_nido_space_data',
  ACTIVITIES: 'nuestro_nido_activities',
  NOTES: 'nuestro_nido_notes',
  MEMORIES: 'nuestro_nido_memories',
  RITUALS: 'nuestro_nido_rituals',
  INVITATIONS: 'nuestro_nido_invitations',
  LAST_WELCOME_BONUS: 'nuestro_nido_last_welcome',
};

class StorageWrapper {
  private mem: Record<string, string> = {};

  getItem(key: string): string | null {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        return window.localStorage.getItem(key);
      } catch {}
    }
    return this.mem[key] ?? null;
  }

  setItem(key: string, val: string): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.setItem(key, val);
      } catch {}
    }
    this.mem[key] = val;
  }

  removeItem(key: string): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    }
    delete this.mem[key];
  }

  clear(): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.clear();
      } catch {}
    }
    this.mem = {};
  }
}

const storage = new StorageWrapper();

export interface SyncEngine {
  getCurrentUserId(): string;
  getCurrentUserName(): string;
  setUserInfo(id: string, name: string): void;
  getSpace(): SpaceState | null;
  subscribeToSpace(callback: (space: SpaceState) => void): () => void;
  subscribeToActivity(callback: (logs: ActivityLog[]) => void): () => void;
  subscribeToNotes(callback: (notes: SharedNote[]) => void): () => void;
  subscribeToMemories(callback: (memories: NidoMemory[]) => void): () => void;
  subscribeToDailyRitual(dateKey: string, callback: (ritual: DailyRitual) => void): () => void;
  performCare(action: ActionType, foodId?: string): Promise<{ detail: string; luceros: number }>;
  sendNote(message: string, sticker?: string): Promise<SharedNote>;
  answerDailyRitual(text: string): Promise<DailyRitual>;
  buyItem(type: 'food' | 'decor' | 'accessory', itemId: string): Promise<void>;
  equipDecor(slot: keyof SpaceDecor, decorId?: string): Promise<void>;
  equipAccessory(accessoryId?: string): Promise<void>;
  recordGameResult(gameName: string, score: number, lucerosEarned: number): Promise<void>;
  createSpace(creatorName: string, petName: string): Promise<SpaceState>;
  joinSpaceWithCode(code: string, userName: string): Promise<SpaceState>;
  generateNewInvite(): Promise<string>;
  switchLocalUser(userId: string, userName: string): void;
  resetAllData(): void;
  isFirebaseConfigured(): boolean;
}

class LocalSyncEngine implements SyncEngine {
  private spaceListeners: Set<(space: SpaceState) => void> = new Set();
  private activityListeners: Set<(logs: ActivityLog[]) => void> = new Set();
  private notesListeners: Set<(notes: SharedNote[]) => void> = new Set();
  private memoriesListeners: Set<(memories: NidoMemory[]) => void> = new Set();
  private ritualListeners: Map<string, Set<(ritual: DailyRitual) => void>> = new Map();

  constructor() {
    this.ensureInitialized();
  }

  public isFirebaseConfigured(): boolean {
    return Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
  }

  private ensureInitialized() {
    // Si no hay usuario activo, generamos uno por defecto
    let currentUserId = storage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    let currentUserName = storage.getItem(STORAGE_KEYS.CURRENT_USER_NAME);

    if (!currentUserId || !currentUserName) {
      currentUserId = 'user_valen';
      currentUserName = 'Valen';
      storage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      storage.setItem(STORAGE_KEYS.CURRENT_USER_NAME, currentUserName);
    }

    // Si no hay espacio, creamos el nido inicial
    const existingSpace = this.getSpace();
    if (!existingSpace) {
      const initialSpace = createInitialSpace(currentUserId, currentUserName, 'Pippo');
      this.saveSpace(initialSpace);

      // Crear recuerdos iniciales
      const firstMemory: NidoMemory = {
        id: 'mem_1',
        spaceId: initialSpace.id,
        title: 'Comienza nuestro nido',
        description: 'Encontramos un huevo misterioso y cálido. ¡Vamos a cuidarlo juntos!',
        icon: '🥚',
        unlockedAt: Date.now(),
        category: 'hatching',
      };
      this.saveMemories([firstMemory]);

      // Primera nota de bienvenida
      const firstNote: SharedNote = {
        id: 'note_1',
        spaceId: initialSpace.id,
        senderId: currentUserId,
        senderName: currentUserName,
        message: '¡Bienvenido a nuestro rinconcito! Ya tenemos nuestro huevo para cuidar.',
        sticker: '🌱',
        createdAt: Date.now(),
        readByPartner: false,
      };
      this.saveNotes([firstNote]);

      // Primer registro de actividad
      const firstAct: ActivityLog = {
        id: 'act_1',
        spaceId: initialSpace.id,
        userId: currentUserId,
        userName: currentUserName,
        actionType: 'pet',
        details: `${currentUserName} preparó el nido con mantas tibias`,
        timestamp: Date.now(),
      };
      this.saveActivities([firstAct]);
    } else {
      // Simular degradación pasiva al reabrir la app
      this.syncPassiveDecay();
    }
  }

  public getCurrentUserId(): string {
    return storage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user_valen';
  }

  public getCurrentUserName(): string {
    return storage.getItem(STORAGE_KEYS.CURRENT_USER_NAME) || 'Valen';
  }

  public setUserInfo(id: string, name: string): void {
    storage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    storage.setItem(STORAGE_KEYS.CURRENT_USER_NAME, name);
  }

  public switchLocalUser(userId: string, userName: string): void {
    this.setUserInfo(userId, userName);
    const space = this.getSpace();
    if (space) {
      // Si el usuario no estaba en los perfiles, lo agregamos
      if (!space.memberProfiles[userId]) {
        space.memberProfiles[userId] = {
          displayName: userName,
          avatarColor: userId === 'user_valen' ? '#A9C7B1' : '#EFB7B5',
          lastSeenAt: Date.now(),
        };
      } else {
        space.memberProfiles[userId].lastSeenAt = Date.now();
      }
      this.saveSpace(space);
    }
    this.notifyAll();
  }

  public getSpace(): SpaceState | null {
    const raw = storage.getItem(STORAGE_KEYS.SPACE);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private saveSpace(space: SpaceState) {
    storage.setItem(STORAGE_KEYS.SPACE, JSON.stringify(space));
    this.spaceListeners.forEach((listener) => listener(space));
  }

  private getActivities(): ActivityLog[] {
    const raw = storage.getItem(STORAGE_KEYS.ACTIVITIES);
    return raw ? JSON.parse(raw) : [];
  }

  private saveActivities(activities: ActivityLog[]) {
    storage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    this.activityListeners.forEach((listener) => listener(activities));
  }

  private getNotes(): SharedNote[] {
    const raw = storage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : [];
  }

  private saveNotes(notes: SharedNote[]) {
    storage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    this.notesListeners.forEach((listener) => listener(notes));
  }

  private getMemories(): NidoMemory[] {
    const raw = storage.getItem(STORAGE_KEYS.MEMORIES);
    return raw ? JSON.parse(raw) : [];
  }

  private saveMemories(memories: NidoMemory[]) {
    storage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    this.memoriesListeners.forEach((listener) => listener(memories));
  }

  private getRituals(): Record<string, DailyRitual> {
    const raw = storage.getItem(STORAGE_KEYS.RITUALS);
    return raw ? JSON.parse(raw) : {};
  }

  private saveRitual(ritual: DailyRitual) {
    const all = this.getRituals();
    all[ritual.id] = ritual;
    storage.setItem(STORAGE_KEYS.RITUALS, JSON.stringify(all));
    const listeners = this.ritualListeners.get(ritual.id);
    if (listeners) {
      listeners.forEach((listener) => listener(ritual));
    }
  }

  private getInvitations(): Record<string, InvitationPayload> {
    const raw = storage.getItem(STORAGE_KEYS.INVITATIONS);
    return raw ? JSON.parse(raw) : {};
  }

  private saveInvitation(invitation: InvitationPayload) {
    const all = this.getInvitations();
    all[invitation.code] = invitation;
    storage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(all));
  }

  // Simulación pasiva al volver a entrar
  private syncPassiveDecay() {
    const space = this.getSpace();
    if (!space) return;

    const now = Date.now();
    const { needs } = calculateDecayedNeeds(
      space.pet.needs,
      space.pet.lastNeedsUpdate,
      now,
      space.pet.isSleeping
    );

    const updatedSpace: SpaceState = {
      ...space,
      pet: {
        ...space.pet,
        needs,
        lastNeedsUpdate: now,
      },
    };
    this.saveSpace(updatedSpace);
  }

  public subscribeToSpace(callback: (space: SpaceState) => void): () => void {
    this.spaceListeners.add(callback);
    const current = this.getSpace();
    if (current) callback(current);
    return () => this.spaceListeners.delete(callback);
  }

  public subscribeToActivity(callback: (logs: ActivityLog[]) => void): () => void {
    this.activityListeners.add(callback);
    callback(this.getActivities());
    return () => this.activityListeners.delete(callback);
  }

  public subscribeToNotes(callback: (notes: SharedNote[]) => void): () => void {
    this.notesListeners.add(callback);
    callback(this.getNotes());
    return () => this.notesListeners.delete(callback);
  }

  public subscribeToMemories(callback: (memories: NidoMemory[]) => void): () => void {
    this.memoriesListeners.add(callback);
    callback(this.getMemories());
    return () => this.memoriesListeners.delete(callback);
  }

  public subscribeToDailyRitual(dateKey: string, callback: (ritual: DailyRitual) => void): () => void {
    if (!this.ritualListeners.has(dateKey)) {
      this.ritualListeners.set(dateKey, new Set());
    }
    this.ritualListeners.get(dateKey)!.add(callback);

    const rituals = this.getRituals();
    let ritual = rituals[dateKey];
    if (!ritual) {
      const promptIdx = Math.abs(dateKey.split('-').reduce((acc, c) => acc + Number(c), 0)) % DAILY_PROMPTS.length;
      ritual = {
        id: dateKey,
        spaceId: this.getSpace()?.id || 'nido_default',
        prompt: DAILY_PROMPTS[promptIdx] || DAILY_PROMPTS[0],
        responses: {},
        isRevealed: false,
      };
      this.saveRitual(ritual);
    }
    callback(ritual);

    return () => {
      this.ritualListeners.get(dateKey)?.delete(callback);
    };
  }

  public async performCare(action: ActionType, foodId?: string): Promise<{ detail: string; luceros: number }> {
    const space = this.getSpace();
    if (!space) throw new Error('No hay un nido activo.');

    const userId = this.getCurrentUserId();
    const userName = this.getCurrentUserName();
    const oldStage = space.pet.stage;

    const { updatedSpace, detail, lucerosEarned } = applyCareAction(
      space,
      action,
      userId,
      userName,
      foodId
    );

    this.saveSpace(updatedSpace);

    // Registro en la actividad
    const newActivity: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      spaceId: space.id,
      userId,
      userName,
      actionType: action,
      details: detail,
      timestamp: Date.now(),
      lucerosDelta: lucerosEarned,
    };
    const currentActs = this.getActivities();
    this.saveActivities([newActivity, ...currentActs.slice(0, 49)]); // Mantiene los últimos 50

    // Si hubo eclosión o cambio de etapa, crear recuerdo
    if (oldStage !== updatedSpace.pet.stage) {
      const memoryTitle = updatedSpace.pet.stage === 'baby'
        ? `¡Eclosionó ${updatedSpace.pet.name}!`
        : `¡${updatedSpace.pet.name} creció a etapa ${updatedSpace.pet.stage}!`;

      const newMem: NidoMemory = {
        id: `mem_${Date.now()}`,
        spaceId: space.id,
        title: memoryTitle,
        description: `Gracias a los cuidados de ${userName} y del nido, nuestra criatura dio un paso hermoso en su vida.`,
        icon: updatedSpace.pet.stage === 'baby' ? '🐣' : '✨',
        unlockedAt: Date.now(),
        category: 'hatching',
      };
      this.saveMemories([newMem, ...this.getMemories()]);
    }

    return { detail, luceros: lucerosEarned };
  }

  public async sendNote(message: string, sticker: string = '💌'): Promise<SharedNote> {
    const space = this.getSpace();
    if (!space) throw new Error('No hay un nido activo.');

    const note: SharedNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      spaceId: space.id,
      senderId: this.getCurrentUserId(),
      senderName: this.getCurrentUserName(),
      message: message.trim(),
      sticker,
      createdAt: Date.now(),
      readByPartner: false,
    };

    const notes = [note, ...this.getNotes()];
    this.saveNotes(notes);

    // Actividad en el diario
    const act: ActivityLog = {
      id: `act_${Date.now()}`,
      spaceId: space.id,
      userId: this.getCurrentUserId(),
      userName: this.getCurrentUserName(),
      actionType: 'pet',
      details: `${this.getCurrentUserName()} dejó una cartita con amor: "${message.substring(0, 25)}${message.length > 25 ? '...' : ''}"`,
      timestamp: Date.now(),
    };
    this.saveActivities([act, ...this.getActivities()]);

    return note;
  }

  public async answerDailyRitual(text: string): Promise<DailyRitual> {
    const space = this.getSpace();
    if (!space) throw new Error('No hay un nido activo.');

    const dateKey = new Date().toISOString().split('T')[0];
    const rituals = this.getRituals();
    let ritual = rituals[dateKey];
    if (!ritual) {
      const promptIdx = Math.abs(dateKey.split('-').reduce((acc, c) => acc + Number(c), 0)) % DAILY_PROMPTS.length;
      ritual = {
        id: dateKey,
        spaceId: space.id,
        prompt: DAILY_PROMPTS[promptIdx] || DAILY_PROMPTS[0],
        responses: {},
        isRevealed: false,
      };
    }

    const userId = this.getCurrentUserId();
    ritual.responses[userId] = {
      text: text.trim(),
      answeredAt: Date.now(),
    };

    // Si ambos integrantes respondieron, se revela automáticamente
    const respondentCount = Object.keys(ritual.responses).length;
    if (respondentCount >= Math.min(2, space.members.length)) {
      ritual.isRevealed = true;
    }

    this.saveRitual(ritual);

    // Otorga 20 luceros por participar en el rito
    space.economy.luceros += 20;
    space.economy.lifetimeLucerosEarned += 20;
    this.saveSpace(space);

    const act: ActivityLog = {
      id: `act_${Date.now()}`,
      spaceId: space.id,
      userId,
      userName: this.getCurrentUserName(),
      actionType: 'play',
      details: `${this.getCurrentUserName()} respondió la pregunta del día (+20 Luceros)`,
      timestamp: Date.now(),
      lucerosDelta: 20,
    };
    this.saveActivities([act, ...this.getActivities()]);

    return ritual;
  }

  public async buyItem(type: 'food' | 'decor' | 'accessory', itemId: string): Promise<void> {
    const space = this.getSpace();
    if (!space) throw new Error('No hay un nido activo.');

    let price = 0;
    let itemName = '';

    if (type === 'food') {
      const food = FOOD_CATALOG[itemId];
      if (!food) throw new Error('Comida no encontrada');
      price = food.price;
      itemName = food.name;
      if (space.economy.luceros < price) throw new Error('No alcanzan los Luceros.');

      space.economy.luceros -= price;
      space.inventory.foods[itemId] = (space.inventory.foods[itemId] || 0) + 1;
    } else if (type === 'decor') {
      const decor = DECOR_CATALOG[itemId];
      if (!decor) throw new Error('Decoración no encontrada');
      price = decor.price;
      itemName = decor.name;
      if (space.inventory.unlockedDecor.includes(itemId)) {
        throw new Error('Ya tenés esta decoración en tu colección.');
      }
      if (space.economy.luceros < price) throw new Error('No alcanzan los Luceros.');

      space.economy.luceros -= price;
      space.inventory.unlockedDecor.push(itemId);
      // Auto-equipa en su slot si está vacío
      if (!space.inventory.activeDecor[decor.slot]) {
        space.inventory.activeDecor[decor.slot] = itemId;
      }
    } else if (type === 'accessory') {
      const acc = ACCESSORY_CATALOG[itemId];
      if (!acc) throw new Error('Accesorio no encontrado');
      price = acc.price;
      itemName = acc.name;
      if (space.inventory.unlockedAccessories.includes(itemId)) {
        throw new Error('Ya tenés este accesorio.');
      }
      if (space.economy.luceros < price) throw new Error('No alcanzan los Luceros.');

      space.economy.luceros -= price;
      space.inventory.unlockedAccessories.push(itemId);
      space.pet.accessory = itemId;
    }

    this.saveSpace(space);

    const act: ActivityLog = {
      id: `act_${Date.now()}`,
      spaceId: space.id,
      userId: this.getCurrentUserId(),
      userName: this.getCurrentUserName(),
      actionType: 'decor_changed',
      details: `${this.getCurrentUserName()} compró "${itemName}" para el nido`,
      timestamp: Date.now(),
      lucerosDelta: -price,
    };
    this.saveActivities([act, ...this.getActivities()]);
  }

  public async equipDecor(slot: keyof SpaceDecor, decorId?: string): Promise<void> {
    const space = this.getSpace();
    if (!space) return;

    if (decorId) {
      space.inventory.activeDecor[slot] = decorId;
    } else {
      delete space.inventory.activeDecor[slot];
    }

    this.saveSpace(space);
  }

  public async equipAccessory(accessoryId?: string): Promise<void> {
    const space = this.getSpace();
    if (!space) return;

    space.pet.accessory = accessoryId || null;
    this.saveSpace(space);
  }

  public async recordGameResult(gameName: string, score: number, lucerosEarned: number): Promise<void> {
    const space = this.getSpace();
    if (!space) return;

    space.economy.luceros += lucerosEarned;
    space.economy.lifetimeLucerosEarned += lucerosEarned;
    // Jugar también da un toque de diversión a la mascota
    space.pet.needs.fun = Math.min(100, space.pet.needs.fun + 15);
    this.saveSpace(space);

    const act: ActivityLog = {
      id: `act_${Date.now()}`,
      spaceId: space.id,
      userId: this.getCurrentUserId(),
      userName: this.getCurrentUserName(),
      actionType: 'game_played',
      details: `${this.getCurrentUserName()} jugó a "${gameName}" (Puntaje: ${score}, +${lucerosEarned} Luceros)`,
      timestamp: Date.now(),
      lucerosDelta: lucerosEarned,
    };
    this.saveActivities([act, ...this.getActivities()]);
  }

  public async createSpace(creatorName: string, petName: string): Promise<SpaceState> {
    const userId = this.getCurrentUserId();
    const newSpace = createInitialSpace(userId, creatorName, petName);
    this.saveSpace(newSpace);
    this.saveActivities([]);
    this.saveNotes([]);
    this.saveMemories([]);
    return newSpace;
  }

  public async generateNewInvite(): Promise<string> {
    const space = this.getSpace();
    if (!space) throw new Error('No hay un nido activo.');

    const code = generateInviteCode();
    const now = Date.now();
    const invitation: InvitationPayload = {
      code,
      spaceId: space.id,
      createdBy: this.getCurrentUserId(),
      createdByName: this.getCurrentUserName(),
      createdAt: now,
      expiresAt: now + 48 * 3600 * 1000,
      used: false,
    };

    space.inviteCode = code;
    space.inviteExpiresAt = invitation.expiresAt;
    this.saveSpace(space);
    this.saveInvitation(invitation);

    return code;
  }

  public async joinSpaceWithCode(code: string, userName: string): Promise<SpaceState> {
    const invitations = this.getInvitations();
    const normalizedCode = code.trim().toUpperCase();
    const invitation = invitations[normalizedCode] || null;

    const currentUserId = this.getCurrentUserId();
    const space = this.getSpace();
    const members = space ? space.members : [];

    const validation = validateInvitation(invitation, currentUserId, members);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Código inválido');
    }

    if (!space) {
      throw new Error('El nido asociado al código no se encuentra localmente.');
    }

    // Incorporamos al nuevo miembro
    space.members.push(currentUserId);
    space.memberProfiles[currentUserId] = {
      displayName: userName,
      avatarColor: '#EFB7B5',
      lastSeenAt: Date.now(),
    };
    space.inviteCode = null;
    space.inviteExpiresAt = null;

    invitation!.used = true;
    invitation!.usedBy = currentUserId;
    this.saveInvitation(invitation!);
    this.saveSpace(space);

    const act: ActivityLog = {
      id: `act_${Date.now()}`,
      spaceId: space.id,
      userId: currentUserId,
      userName,
      actionType: 'pet',
      details: `¡${userName} se unió al nido! Ahora son dos cuidando de ${space.pet.name}`,
      timestamp: Date.now(),
    };
    this.saveActivities([act, ...this.getActivities()]);

    return space;
  }

  public resetAllData(): void {
    storage.clear();
    this.ensureInitialized();
    this.notifyAll();
  }

  private notifyAll() {
    const sp = this.getSpace();
    if (sp) this.spaceListeners.forEach((l) => l(sp));
    this.activityListeners.forEach((l) => l(this.getActivities()));
    this.notesListeners.forEach((l) => l(this.getNotes()));
    this.memoriesListeners.forEach((l) => l(this.getMemories()));
  }
}

export const syncEngine = new LocalSyncEngine();
