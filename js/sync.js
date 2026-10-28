// ============================================================================
// NUESTRO NIDO | Motor de Sincronización en la Nube y Modo Offline
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
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

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

  notifyStatus() {
    const s = this.getStatus();
    for (const cb of this.statusListeners) {
      try {
        cb(s);
      } catch {}
    }
  }

  getStatus() {
    return {
      isCloudActive: this.isCloudActive,
      isOnline: this.isOnline,
      modeText: this.isCloudActive
        ? 'Sincronizado en la Nube'
        : 'Modo Local (PWA sin servidor)',
    };
  }

  handleNetworkChange(online) {
    this.isOnline = online;
    this.notifyStatus();
    if (online && this.isCloudActive) {
      this.flushOfflineQueue();
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
      return false;
    }

    try {
      // Importación dinámica nativa de Firebase v10 desde el CDN oficial
      const { initializeApp } = await import(
        'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'
      );
      const { getAuth, signInAnonymously } = await import(
        'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'
      );
      const { getFirestore, enableIndexedDbPersistence } = await import(
        'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js'
      );

      this.firebaseApp = initializeApp(cfg);
      this.auth = getAuth(this.firebaseApp);
      this.db = getFirestore(this.firebaseApp);

      try {
        await enableIndexedDbPersistence(this.db);
      } catch (e) {
        console.warn('Persistencia offline de Firestore ya inicializada o no soportada:', e);
      }

      await signInAnonymously(this.auth);
      this.isCloudActive = true;
      this.notifyStatus();
      console.log('Firebase conectado exitosamente con autenticación anónima.');
      return true;
    } catch (err) {
      console.warn('No se pudo conectar a Firebase Cloud (operando en Modo Local):', err);
      this.isCloudActive = false;
      this.notifyStatus();
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
    console.log('Verificando cola de operaciones offline...');
  }
}

export const syncManager = new SyncManager();
