// Tipos y entidades del dominio para Nuestro Nido

export type PetStage = 'egg' | 'baby' | 'young' | 'adult';
export type PetPersonality = 'curioso' | 'dormilon' | 'alegre' | 'mimosa';
export type PetColorVariant = 'pastel_sage' | 'butter_cream' | 'dusty_rose' | 'lavender_sky';

export type PetMood = 
  | 'idle' 
  | 'happy' 
  | 'eating' 
  | 'sleeping' 
  | 'petted' 
  | 'bathing' 
  | 'hungry' 
  | 'sleepy' 
  | 'dirty' 
  | 'bored' 
  | 'curious';

export interface PetNeeds {
  hunger: number;    // 10 a 100
  hygiene: number;   // 10 a 100
  energy: number;    // 10 a 100
  fun: number;       // 10 a 100
  comfort: number;   // 10 a 100
}

export interface PetState {
  name: string;
  stage: PetStage;
  personality: PetPersonality;
  colorVariant: PetColorVariant;
  accessory: string | null;
  needs: PetNeeds;
  lastNeedsUpdate: number;
  isSleeping: boolean;
  sleepStartedAt?: number;
  totalCareInteractions: number;
  hatchingProgress: number; // 0..3 (con 3 eclosiona)
}

export interface MemberProfile {
  displayName: string;
  avatarColor: string;
  lastSeenAt: number;
}

export interface SpaceDecor {
  rug?: string;
  plant?: string;
  lamp?: string;
  toy?: string;
  wallArt?: string;
}

export interface InventoryState {
  foods: Record<string, number>;
  unlockedDecor: string[];
  activeDecor: SpaceDecor;
  unlockedAccessories: string[];
}

export interface EconomyState {
  luceros: number;
  lifetimeLucerosEarned: number;
}

export interface SpaceState {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  members: string[]; // Máximo 2
  memberProfiles: Record<string, MemberProfile>;
  inviteCode: string | null;
  inviteExpiresAt: number | null;
  pet: PetState;
  economy: EconomyState;
  inventory: InventoryState;
}

export type ActionType = 
  | 'feed' 
  | 'pet' 
  | 'play' 
  | 'clean' 
  | 'sleep' 
  | 'wake' 
  | 'decor_changed' 
  | 'game_played' 
  | 'hatch';

export interface ActivityLog {
  id: string;
  spaceId: string;
  userId: string;
  userName: string;
  actionType: ActionType;
  details: string;
  timestamp: number;
  lucerosDelta?: number;
}

export interface SharedNote {
  id: string;
  spaceId: string;
  senderId: string;
  senderName: string;
  message: string;
  sticker?: string;
  createdAt: number;
  readByPartner: boolean;
}

export interface NidoMemory {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number;
  category: 'hatching' | 'milestone' | 'decor' | 'game';
}

export interface DailyRitualResponse {
  text: string;
  answeredAt: number;
}

export interface DailyRitual {
  id: string; // YYYY-MM-DD
  spaceId: string;
  prompt: string;
  responses: Record<string, DailyRitualResponse>;
  isRevealed: boolean;
}

export interface FoodItemDef {
  id: string;
  name: string;
  description: string;
  hungerGain: number;
  energyGain: number;
  comfortGain: number;
  price: number;
  icon: string;
}

export interface DecorItemDef {
  id: string;
  name: string;
  slot: keyof SpaceDecor;
  description: string;
  price: number;
  icon: string;
}

export interface AccessoryDef {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}
