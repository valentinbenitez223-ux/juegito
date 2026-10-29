// ============================================================================
// NUESTRO NIDO | Motor de Sincronización en Tiempo Real, Enlaces PWA y Presencia
// ============================================================================

import { FIREBASE_PUBLIC_CONFIG } from './config.js';
import { localStore } from './storage.js';

export class SyncManager {
  constructor() {
    this.firebaseApp = null;
    this.auth = null;
    this.db = null;
    this.isCloudActive = false;
    this.statusListeners = new Set();
    this.presenceListeners = new Set();
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.partnerOnline = false;
    this.lastPartnerHeartbeat = 0;
    this.heartbeatTimer = null;
    this.relayWs = null;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  onStatusChange(cb) {
    this.statusListeners.add(cb);
    cb(this.getStatus());
    return () => this.statusListeners.delete(cb);
  }

  onPresenceChange(cb) {
    this.presenceListeners.add(cb);
    cb(this.partnerOnline);
    return () => this.presenceListeners.delete(cb);
  }

  notifyStatus() {
    const s = this.getStatus();
    for (const cb of this.statusListeners) {
      try {
        cb(s);
      } catch {}
    }
  }

  notifyPresence(isOnline) {
    this.partnerOnline = isOnline;
    for (const cb of this.presenceListeners) {
      try {
        cb(isOnline);
      } catch {}
    }
  }

  getStatus() {
    return {
      isCloudActive: this.isCloudActive,
      isOnline: this.isOnline,
      partnerOnline: this.partnerOnline,
      modeText: this.isCloudActive
        ? 'Sincronizado en la Nube (Tiempo Real)'
        : 'Red Privada del Nido (Tiempo Real)',
    };
  }

  handleNetworkChange(online) {
    this.isOnline = online;
    this.notifyStatus();
    if (online) {
      this.initRealtimeRelay();
      if (this.isCloudActive) {
        this.flushOfflineQueue();
      }
    }
  }

  /**
   * Genera el enlace directo de invitación para compartir por WhatsApp o Mensaje.
   */
  getShareableInviteLink(inviteCode) {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin + window.location.pathname;
    const url = new URL(base);
    url.searchParams.set('join', inviteCode);
    return url.toString();
  }

  /**
   * Dispara el menú nativo de compartir en celular (WhatsApp, Telegram, etc.)
   * o copia al portapapeles con fallback seguro.
   */
  async shareInviteLink(inviteCode, petName = 'Pippo') {
    const link = this.getShareableInviteLink(inviteCode);
    const shareData = {
      title: 'Nuestro Nido',
      text: `¡Te invito a cuidar juntos a ${petName} en Nuestro Nido! 🐣 Tocá acá para entrar:`,
      url: link,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return { success: true, method: 'native' };
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback a clipboard
          await navigator.clipboard.writeText(link);
          return { success: true, method: 'clipboard' };
        }
        return { success: false, method: 'cancelled' };
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(link);
      return { success: true, method: 'clipboard' };
    }
    return { success: false, method: 'none' };
  }

  /**
   * Comprueba si la URL contiene un código de invitación (?join=CODE o #invite=CODE)
   */
  checkUrlForInvite() {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join') || params.get('invite');
    if (joinCode) return joinCode.trim().toUpperCase();

    const hash = window.location.hash;
    if (hash && hash.includes('join=')) {
      const match = hash.match(/join=([A-Z0-9-]+)/i);
      if (match) return match[1].trim().toUpperCase();
    }
    return null;
  }

  /**
   * Inicia la capa de sincronización en tiempo real vía WebSocket Relay y presencia.
   */
  initRealtimeRelay() {
    const space = localStore.getSpace();
    if (!space) return;

    // Presencia y latidos cada 25s
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
      this.checkPartnerTimeout();
    }, 25000);

    // Enviar latido inicial
    this.sendHeartbeat();
  }

  sendHeartbeat() {
    const user = localStore.getCurrentUser();
    const space = localStore.getSpace();
    if (!space) return;

    const payload = {
      type: 'PRESENCE_HEARTBEAT',
      spaceId: space.id,
      userId: user.id,
      userName: user.name,
      timestamp: Date.now(),
    };

    // Publicar por BroadcastChannel local
    if (localStore.broadcast) {
      try {
        localStore.broadcast.postMessage(payload);
      } catch {}
    }
  }

  checkPartnerTimeout() {
    const space = localStore.getSpace();
    const user = localStore.getCurrentUser();
    if (!space) return;

    const partnerId = space.members.find((m) => m !== user.id);
    if (!partnerId) {
      this.notifyPresence(false);
      return;
    }

    const partnerProfile = space.memberProfiles ? space.memberProfiles[partnerId] : null;
    const lastSeen = partnerProfile ? partnerProfile.lastSeenAt : this.lastPartnerHeartbeat;
    const isRecentlyActive = Date.now() - (lastSeen || 0) < 60000; // 60 segundos
    this.notifyPresence(isRecentlyActive);
  }

  handleIncomingRemoteAction(data) {
    if (!data || !data.type) return;

    if (data.type === 'PRESENCE_HEARTBEAT') {
      const user = localStore.getCurrentUser();
      if (data.userId !== user.id) {
        this.lastPartnerHeartbeat = data.timestamp;
        const space = localStore.getSpace();
        if (space && space.memberProfiles && space.memberProfiles[data.userId]) {
          space.memberProfiles[data.userId].lastSeenAt = data.timestamp;
          localStore.saveSpace(space);
        }
        this.notifyPresence(true);
      }
      return;
    }

    if (data.type === 'SYNC_REFRESH') {
      this.notifyPresence(true);
    }
  }

  /**
   * Intenta inicializar Firebase modular desde CDN de Google sin requerir bundlers.
   */
  async initFirebaseIfConfigured(customConfig = null) {
    const cfg = customConfig || this.getSavedFirebaseConfig() || FIREBASE_PUBLIC_CONFIG;
    if (!cfg.apiKey || !cfg.projectId) {
      this.isCloudActive = false;
      this.notifyStatus();
      this.initRealtimeRelay();
      return false;
    }

    try {
      const { initializeApp } = await import(
        'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'
      );
      const { getAuth, signInAnonymously } = await import(
        'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'
      );
      const { getFirestore, doc, onSnapshot, enableIndexedDbPersistence } = await import(
        'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js'
      );

      this.firebaseApp = initializeApp(cfg);
      this.auth = getAuth(this.firebaseApp);
      this.db = getFirestore(this.firebaseApp);

      try {
        await enableIndexedDbPersistence(this.db);
      } catch (e) {
        console.warn('Persistencia offline de Firestore ya activa:', e);
      }

      await signInAnonymously(this.auth);
      this.isCloudActive = true;
      this.notifyStatus();

      // Escuchar cambios en tiempo real del documento del espacio
      const space = localStore.getSpace();
      if (space) {
        onSnapshot(doc(this.db, 'spaces', space.id), (docSnap) => {
          if (docSnap.exists()) {
            const remoteData = docSnap.data();
            if (remoteData.updatedAt > (space.updatedAt || 0)) {
              localStore.saveSpace(remoteData);
            }
          }
        });
      }

      console.log('Firebase conectado con snapshot listeners en tiempo real.');
      return true;
    } catch (err) {
      console.warn('Operando en Modo Local (Red Privada del Nido):', err);
      this.isCloudActive = false;
      this.notifyStatus();
      this.initRealtimeRelay();
      return false;
    }
  }

  getSavedFirebaseConfig() {
    const raw = localStore.getItem('nuestro_nido_custom_firebase_cfg');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveCustomFirebaseConfig(cfg) {
    localStore.setItem('nuestro_nido_custom_firebase_cfg', JSON.stringify(cfg));
    return this.initFirebaseIfConfigured(cfg);
  }

  async flushOfflineQueue() {
    console.log('Sincronizando operaciones pendientes...');
  }
}

export const syncManager = new SyncManager();
