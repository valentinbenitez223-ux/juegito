// ============================================================================
// NUESTRO NIDO | Controlador Principal de Interfaz y Lógica de Usuario
// ============================================================================

import { localStore } from './storage.js';
import { sound, getPetMood, renderPetSVG } from './pet.js';
import { runAutomatedAuditTests } from './game.js';
import {
  FOOD_CATALOG,
  DECOR_CATALOG,
  ACCESSORY_CATALOG,
} from './config.js';
import { syncManager } from './sync.js';

class AppController {
  constructor() {
    this.currentTab = 'care';
    this.currentJournalSubtab = 'notes';
    this.currentHomeSubtab = 'room';
    this.isPettedAnimation = false;
    this.activeMinigame = null;
    this.minigameTimer = null;
  }

  init() {
    // 1. Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .then((reg) => console.log('ServiceWorker registrado:', reg.scope))
          .catch((err) => console.warn('ServiceWorker no registrado:', err));
      });
    }

    // 2. Inicializar almacenamiento y nido
    const { welcomeBonus } = localStore.ensureInitialized();
    if (welcomeBonus && welcomeBonus.eligible) {
      this.showWelcomeBanner(welcomeBonus.message);
    }

    // 3. Conectar listeners de eventos del DOM
    this.bindEvents();

    // 4. Suscribirse a cambios en localStore (reflejo reactivo entre pestañas)
    localStore.subscribe(() => {
      this.render();
    });

    // 5. Verificar si se solicitó correr los tests por URL (?test=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'true') {
      this.switchTab('settings');
      setTimeout(() => this.runQATests(), 300);
    }

    // 6. Intentar sincronización en la nube si hay config guardada
    syncManager.initFirebaseIfConfigured();

    // 7. Primer renderizado
    this.render();
  }

  showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  showWelcomeBanner(msg) {
    const bannerContainer = document.getElementById('welcome-banner-container');
    if (!bannerContainer) return;
    bannerContainer.innerHTML = `
      <div class="welcome-back-banner">
        <span>✨ ${msg}</span>
        <button id="btn-close-welcome" style="background: none; border: none; font-size: 16px; cursor: pointer; color: inherit;">✕</button>
      </div>
    `;
    const btn = document.getElementById('btn-close-welcome');
    if (btn) btn.onclick = () => (bannerContainer.innerHTML = '');
  }

  bindEvents() {
    // Sonido
    const btnSound = document.getElementById('btn-toggle-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        document.getElementById('sound-icon').textContent = isMuted ? '🔇' : '🔊';
      });
    }

    // Ajustes desde header
    const btnHeaderSettings = document.getElementById('btn-header-settings');
    if (btnHeaderSettings) {
      btnHeaderSettings.addEventListener('click', () => {
        sound.playTap();
        this.switchTab('settings');
      });
    }

    // Pestañas superiores de paneles
    document.querySelectorAll('.tab-nav-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        sound.playTap();
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Navegación móvil inferior
    document.querySelectorAll('.bottom-nav-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        sound.playTap();
        const tab = e.currentTarget.getAttribute('data-nav');
        this.switchTab(tab);
      });
    });

    // Toque interactivo directo a Pippo en el Diorama
    const petTarget = document.getElementById('pet-interactive-target');
    if (petTarget) {
      petTarget.addEventListener('click', (e) => {
        this.handlePetTouch(e);
      });
    }

    // Botones de cuidados rápidos
    const btnQuickPet = document.getElementById('btn-quick-pet');
    if (btnQuickPet) {
      btnQuickPet.addEventListener('click', (e) => this.handlePetTouch(e));
    }

    const btnQuickFeed = document.getElementById('btn-quick-feed');
    if (btnQuickFeed) {
      btnQuickFeed.addEventListener('click', () => {
        sound.playTap();
        this.switchTab('care');
      });
    }

    const btnQuickClean = document.getElementById('btn-quick-clean');
    if (btnQuickClean) {
      btnQuickClean.addEventListener('click', () => {
        try {
          sound.playBubble();
          localStore.performCare('clean');
          this.showToast('¡Bañito tibio completado! Pippo quedó reluciente ✨ (+5 Luceros)');
        } catch (err) {
          this.showToast(err.message);
        }
      });
    }

    const btnQuickSleep = document.getElementById('btn-quick-sleep');
    if (btnQuickSleep) {
      btnQuickSleep.addEventListener('click', () => {
        const space = localStore.getSpace();
        if (!space) return;
        const willSleep = !space.pet.isSleeping;
        try {
          if (willSleep) {
            sound.playLullaby();
            localStore.performCare('sleep');
            this.showToast('Arropaste a Pippo. ¡Dulces sueños! (+5 Luceros)');
          } else {
            sound.playTap();
            localStore.performCare('wake');
            this.showToast('Pippo despertó con energía y una sonrisa.');
          }
        } catch (err) {
          this.showToast(err.message);
        }
      });
    }

    // Subpestañas del Diario
    const subNotes = document.getElementById('subtab-notes');
    const subRitual = document.getElementById('subtab-ritual');
    const subMemories = document.getElementById('subtab-memories');

    if (subNotes && subRitual && subMemories) {
      subNotes.addEventListener('click', () => this.switchJournalSubtab('notes'));
      subRitual.addEventListener('click', () => this.switchJournalSubtab('ritual'));
      subMemories.addEventListener('click', () => this.switchJournalSubtab('memories'));
    }

    // Envío de Cartita
    const formSendNote = document.getElementById('form-send-note');
    if (formSendNote) {
      let selectedSticker = '💌';
      document.querySelectorAll('.sticker-opt').forEach((s) => {
        s.addEventListener('click', (e) => {
          sound.playTap();
          selectedSticker = e.currentTarget.textContent;
          document.querySelectorAll('.sticker-opt').forEach((el) => (el.style.transform = 'scale(1)'));
          e.currentTarget.style.transform = 'scale(1.3)';
        });
      });

      formSendNote.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('note-input-text');
        if (!input || !input.value.trim()) return;
        sound.playChime();
        localStore.sendNote(input.value.trim(), selectedSticker);
        input.value = '';
        this.showToast('¡Cartita enviada al buzón del nido! 💌');
      });
    }

    // Envío de Rito Diario
    const formRitual = document.getElementById('form-answer-ritual');
    if (formRitual) {
      formRitual.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('ritual-input-text');
        if (!input || !input.value.trim()) return;
        sound.playChime();
        localStore.answerTodayRitual(input.value.trim());
        input.value = '';
        this.showToast('¡Respuesta guardada con amor! (+10 Luceros) ✨');
      });
    }

    // Subpestañas de Hogar & Tienda
    const subRoom = document.getElementById('subtab-room');
    const subWardrobe = document.getElementById('subtab-wardrobe');
    const subShop = document.getElementById('subtab-shop');

    if (subRoom && subWardrobe && subShop) {
      subRoom.addEventListener('click', () => this.switchHomeSubtab('room'));
      subWardrobe.addEventListener('click', () => this.switchHomeSubtab('wardrobe'));
      subShop.addEventListener('click', () => this.switchHomeSubtab('shop'));
    }

    // Minijuegos
    const launchFireflies = document.getElementById('launch-fireflies-game');
    if (launchFireflies) {
      launchFireflies.addEventListener('click', () => this.startFirefliesGame());
    }

    const launchMemory = document.getElementById('launch-memory-game');
    if (launchMemory) {
      launchMemory.addEventListener('click', () => this.startMemoryGame());
    }

    // Código de Invitación - Copiar
    const btnCopyInvite = document.getElementById('btn-copy-invite');
    if (btnCopyInvite) {
      btnCopyInvite.addEventListener('click', () => {
        const codeElem = document.getElementById('display-invite-code');
        if (codeElem) {
          navigator.clipboard.writeText(codeElem.textContent.trim());
          sound.playTap();
          btnCopyInvite.textContent = '¡Copiado!';
          setTimeout(() => (btnCopyInvite.textContent = 'Copiar'), 2000);
        }
      });
    }

    // Unirse con código
    const btnJoinCode = document.getElementById('btn-join-code');
    if (btnJoinCode) {
      btnJoinCode.addEventListener('click', () => {
        const input = document.getElementById('input-join-code');
        if (!input || !input.value.trim()) return;
        try {
          sound.playChime();
          localStore.joinWithInviteCode(input.value.trim(), 'Sofi');
          this.showToast('¡Te uniste con éxito al nido de tu pareja! 🎉');
          input.value = '';
        } catch (err) {
          this.showToast(err.message);
        }
      });
    }

    // Alternar actor para pruebas en 1 celular
    const btnSwitchActor = document.getElementById('btn-switch-actor');
    if (btnSwitchActor) {
      btnSwitchActor.addEventListener('click', () => {
        sound.playTap();
        localStore.switchPartnerProfile();
        const user = localStore.getCurrentUser();
        this.showToast(`Ahora estás jugando como ${user.name}`);
      });
    }

    // Guardar nombre de Pippo
    const btnSavePetName = document.getElementById('btn-save-pet-name');
    if (btnSavePetName) {
      btnSavePetName.addEventListener('click', () => {
        const input = document.getElementById('input-pet-name');
        if (!input || !input.value.trim()) return;
        const space = localStore.getSpace();
        if (space) {
          space.pet.name = input.value.trim();
          localStore.saveSpace(space);
          sound.playTap();
          this.showToast(`¡Nombre actualizado a ${space.pet.name}!`);
        }
      });
    }

    // Simulaciones de Ausencia (Cero Castigo)
    document.getElementById('btn-sim-24h')?.addEventListener('click', () => {
      sound.playTap();
      localStore.simulateAbsence(24);
      this.showToast('Simulada ausencia de 24h. Piso seguro respetado (+15 Luceros).');
    });

    document.getElementById('btn-sim-48h')?.addEventListener('click', () => {
      sound.playTap();
      localStore.simulateAbsence(48);
      this.showToast('Simulada ausencia de 48h. Cero castigo verificado.');
    });

    document.getElementById('btn-sim-72h')?.addEventListener('click', () => {
      sound.playTap();
      localStore.simulateAbsence(72);
      this.showToast('Simulada ausencia de 72h. Cero castigo verificado.');
    });

    // Suite QA
    const btnRunTests = document.getElementById('btn-run-qa-tests');
    if (btnRunTests) {
      btnRunTests.addEventListener('click', () => {
        sound.playTap();
        this.runQATests();
      });
    }

    // Guardar Firebase Config
    const btnSaveFirebase = document.getElementById('btn-save-firebase-cfg');
    if (btnSaveFirebase) {
      btnSaveFirebase.addEventListener('click', () => {
        const input = document.getElementById('firebase-cfg-json');
        if (!input || !input.value.trim()) return;
        try {
          const cfg = JSON.parse(input.value.trim());
          syncManager.saveCustomFirebaseConfig(cfg);
          sound.playChime();
          this.showToast('Configuración de Firebase guardada.');
        } catch {
          this.showToast('JSON de configuración inválido.');
        }
      });
    }

    // Reiniciar Nido
    const btnResetData = document.getElementById('btn-reset-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que querés reiniciar el nido a un nuevo huevito?')) {
          sound.playTap();
          localStore.resetAllData();
          this.showToast('Nido reiniciado.');
        }
      });
    }
  }

  handlePetTouch(e) {
    const space = localStore.getSpace();
    if (!space) return;

    sound.playPurr();
    this.isPettedAnimation = true;
    setTimeout(() => {
      this.isPettedAnimation = false;
      this.renderPet();
    }, 400);

    // Crear partícula flotante
    this.spawnParticle(e, space.pet.isSleeping ? '💤' : '💖');

    try {
      localStore.performCare('pet');
    } catch (err) {
      this.showToast(err.message);
    }
  }

  spawnParticle(e, icon) {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const p = document.createElement('div');
    p.className = 'floating-particle';
    p.textContent = icon;

    let x = 110;
    let y = 140;
    if (e && e.clientX) {
      const rect = container.getBoundingClientRect();
      x = Math.max(20, Math.min(rect.width - 40, e.clientX - rect.left));
      y = Math.max(20, Math.min(rect.height - 40, e.clientY - rect.top));
    }

    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    container.appendChild(p);

    setTimeout(() => p.remove(), 1100);
  }

  switchTab(tab) {
    this.currentTab = tab;

    // Actualizar tabs superiores
    document.querySelectorAll('.tab-nav-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tab);
    });

    // Actualizar nav inferior
    document.querySelectorAll('.bottom-nav-item').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-nav') === tab);
    });

    // Mostrar panel activo
    document.querySelectorAll('.tab-content-panel').forEach((p) => {
      p.classList.toggle('active', p.id === `panel-${tab}`);
    });
  }

  switchJournalSubtab(sub) {
    this.currentJournalSubtab = sub;
    const notesSec = document.getElementById('journal-notes-section');
    const ritualSec = document.getElementById('journal-ritual-section');
    const memSec = document.getElementById('journal-memories-section');

    const btnNotes = document.getElementById('subtab-notes');
    const btnRitual = document.getElementById('subtab-ritual');
    const btnMem = document.getElementById('subtab-memories');

    if (notesSec && ritualSec && memSec) {
      notesSec.style.display = sub === 'notes' ? 'block' : 'none';
      ritualSec.style.display = sub === 'ritual' ? 'block' : 'none';
      memSec.style.display = sub === 'memories' ? 'block' : 'none';
    }

    [btnNotes, btnRitual, btnMem].forEach((b) => {
      if (b) {
        b.style.backgroundColor = 'var(--surface-white)';
        b.style.color = 'var(--text-muted)';
        b.style.border = '1.5px solid var(--border-subtle)';
      }
    });

    const activeBtn = document.getElementById(`subtab-${sub}`);
    if (activeBtn) {
      activeBtn.style.backgroundColor = 'var(--color-sage)';
      activeBtn.style.color = '#FFFFFF';
      activeBtn.style.border = 'none';
    }
  }

  switchHomeSubtab(sub) {
    this.currentHomeSubtab = sub;
    const roomSec = document.getElementById('home-room-section');
    const wardSec = document.getElementById('home-wardrobe-section');
    const shopSec = document.getElementById('home-shop-section');

    const btnRoom = document.getElementById('subtab-room');
    const btnWard = document.getElementById('subtab-wardrobe');
    const btnShop = document.getElementById('subtab-shop');

    if (roomSec && wardSec && shopSec) {
      roomSec.style.display = sub === 'room' ? 'block' : 'none';
      wardSec.style.display = sub === 'wardrobe' ? 'block' : 'none';
      shopSec.style.display = sub === 'shop' ? 'block' : 'none';
    }

    [btnRoom, btnWard, btnShop].forEach((b) => {
      if (b) {
        b.style.backgroundColor = 'var(--surface-white)';
        b.style.color = 'var(--text-muted)';
        b.style.border = '1.5px solid var(--border-subtle)';
      }
    });

    const activeBtn = document.getElementById(`subtab-${sub}`);
    if (activeBtn) {
      activeBtn.style.backgroundColor = 'var(--color-sage)';
      activeBtn.style.color = '#FFFFFF';
      activeBtn.style.border = 'none';
    }
  }

  render() {
    const space = localStore.getSpace();
    if (!space) return;

    const user = localStore.getCurrentUser();

    // Luceros en cabecera
    const lucerosVal = document.getElementById('luceros-value');
    if (lucerosVal) lucerosVal.textContent = space.economy.luceros;

    // Badge de pareja
    const badge = document.getElementById('partner-status-badge');
    if (badge) {
      const partnerId = space.members.find((m) => m !== user.id);
      const partnerProfile = partnerId ? space.memberProfiles[partnerId] : null;
      if (partnerProfile) {
        badge.textContent = `Cuidando a ${space.pet.name} con ${partnerProfile.displayName}`;
      } else {
        badge.textContent = `Esperando a tu pareja en el nido`;
      }
    }

    // Diorama (Día / Noche y Entorno)
    const dioramaStage = document.getElementById('diorama-stage');
    const windowSun = document.getElementById('window-sun');
    const windowCloud = document.getElementById('window-cloud');
    const windowMoon = document.getElementById('window-moon');

    if (dioramaStage) {
      const isNight = space.pet.isSleeping;
      dioramaStage.className = `diorama-stage ${isNight ? 'is-night' : 'is-day'}`;
      if (windowSun && windowCloud && windowMoon) {
        windowSun.style.display = isNight ? 'none' : 'block';
        windowCloud.style.display = isNight ? 'none' : 'block';
        windowMoon.style.display = isNight ? 'block' : 'none';
      }
    }

    // Decoraciones del diorama
    const decor = space.inventory.activeDecor || {};
    this.renderDecorSlot('decor-wall-art', decor.wallArt, '🌌');
    this.renderDecorSlot('decor-lamp', decor.lamp, decor.lamp === 'lampara_hongo' ? '🍄' : '✨');
    this.renderDecorSlot('decor-plant', decor.plant, decor.plant === 'monstera_maceta' ? '🪴' : '🌿');
    this.renderDecorSlot('decor-toy', decor.toy, '☁️');

    const rugElem = document.getElementById('decor-rug');
    if (rugElem) {
      if (decor.rug) {
        rugElem.style.display = 'block';
        rugElem.className = `decor-rug ${decor.rug === 'alfombra_margarita' ? 'margarita' : ''}`;
      } else {
        rugElem.style.display = 'none';
      }
    }

    // Renderizar mascota
    this.renderPet();

    // Pensamiento de Pippo
    this.renderPetThought();

    // HUD de necesidades vitales
    this.renderNeedsHUD(space.pet.needs);

    // Botón siesta
    const sleepIcon = document.getElementById('sleep-btn-icon');
    const sleepText = document.getElementById('sleep-btn-text');
    if (sleepIcon && sleepText) {
      sleepIcon.textContent = space.pet.isSleeping ? '☀️' : '🌙';
      sleepText.textContent = space.pet.isSleeping ? 'Despertar' : 'Arropar';
    }

    // Nombres en despensa y etapa
    const pName1 = document.getElementById('pet-name-display-1');
    if (pName1) pName1.textContent = space.pet.name;

    const pStage = document.getElementById('pet-stage-name');
    if (pStage) {
      const names = { egg: 'Huevo Tibio', baby: 'Bebé Pippo', young: 'Pippo Joven', adult: 'Pippo Adulto' };
      pStage.textContent = names[space.pet.stage] || 'Bebé';
    }

    const careCount = document.getElementById('care-interactions-count');
    if (careCount) careCount.textContent = space.pet.totalCareInteractions || 0;

    const hatchInfo = document.getElementById('egg-hatch-info');
    if (hatchInfo) {
      if (space.pet.stage === 'egg') {
        const remaining = Math.max(0, 3 - (space.pet.hatchingProgress || 0));
        hatchInfo.textContent = `¡Faltan ${remaining} caricias o comidas para que nazca!`;
        hatchInfo.style.display = 'block';
      } else {
        hatchInfo.style.display = 'none';
      }
    }

    // Listas de las pestañas
    this.renderFoodInventory(space.inventory.foods);
    this.renderNotes();
    this.renderRitual();
    this.renderMemories();
    this.renderDecorAndWardrobe();
    this.renderShop();

    // Ajustes
    const codeDisplay = document.getElementById('display-invite-code');
    if (codeDisplay) {
      codeDisplay.textContent = space.inviteCode || 'NIDO-AMOR';
    }

    const actorName = document.getElementById('current-actor-name');
    const btnSwitch = document.getElementById('btn-switch-actor');
    if (actorName && btnSwitch) {
      actorName.textContent = user.name;
      btnSwitch.textContent = user.id === 'user_valen' ? 'Alternar a Sofi' : 'Alternar a Valen';
    }
  }

  renderDecorSlot(elemId, activeId, icon) {
    const el = document.getElementById(elemId);
    if (!el) return;
    if (activeId) {
      el.style.display = 'flex';
      el.textContent = icon;
    } else {
      el.style.display = 'none';
    }
  }

  renderPet() {
    const space = localStore.getSpace();
    if (!space) return;
    const mood = getPetMood(space.pet);
    const container = document.getElementById('pet-svg-container');
    if (container) {
      container.innerHTML = renderPetSVG(space.pet, mood, this.isPettedAnimation);
    }
  }

  renderPetThought() {
    const space = localStore.getSpace();
    const thoughtEl = document.getElementById('pet-thought-bubble');
    if (!space || !thoughtEl) return;

    const pet = space.pet;
    const mood = getPetMood(pet);

    if (pet.isSleeping) {
      thoughtEl.textContent = 'Zzz... qué calentito está el nido...';
    } else if (pet.stage === 'egg') {
      const prog = pet.hatchingProgress || 0;
      if (prog === 0) thoughtEl.textContent = 'Se siente un latido suave dentro...';
      else if (prog === 1) thoughtEl.textContent = '¡Se escuchó un crujidito tierno!';
      else if (prog === 2) thoughtEl.textContent = '¡Se asomó una patita!';
      else thoughtEl.textContent = '¡Ya casi rompe el cascarón!';
    } else {
      switch (mood) {
        case 'hungry':
          thoughtEl.textContent = 'Tengo hambre... ¿habrá una manzanita dulce?';
          break;
        case 'dirty':
          thoughtEl.textContent = 'Un bañito tibio me vendría genial...';
          break;
        case 'sleepy':
          thoughtEl.textContent = 'Bostezo... se me cierran los ojitos...';
          break;
        case 'bored':
          thoughtEl.textContent = '¿Jugamos a algo juntos?';
          break;
        case 'happy':
          thoughtEl.textContent = '¡Qué lindo estar acá con ustedes!';
          break;
        default:
          thoughtEl.textContent = 'Mirando las plantitas del nido...';
      }
    }
  }

  renderNeedsHUD(needs) {
    const updateBar = (key, val, color) => {
      const label = document.getElementById(`val-${key}`);
      const bar = document.getElementById(`bar-${key}`);
      if (label) label.textContent = `${val}%`;
      if (bar) {
        bar.style.width = `${val}%`;
        bar.style.backgroundColor = val <= 25 ? '#E06C75' : color;
      }
    };

    updateBar('hunger', needs.hunger, 'var(--color-sage)');
    updateBar('hygiene', needs.hygiene, 'var(--color-mist-blue)');
    updateBar('fun', needs.fun, 'var(--color-dusty-pink)');
    updateBar('energy', needs.energy, 'var(--color-butter-yellow)');
    updateBar('comfort', needs.comfort, 'var(--color-soft-lavender)');
  }

  renderFoodInventory(foods) {
    const list = document.getElementById('foods-inventory-list');
    if (!list) return;

    list.innerHTML = Object.entries(FOOD_CATALOG)
      .map(([id, item]) => {
        const count = foods[id] || 0;
        return `
        <div style="background-color: var(--surface-card); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <span style="font-size: 28px;">${item.icon}</span>
          <span style="font-size: 13px; font-weight: 700; text-align: center;">${item.name}</span>
          <span style="font-size: 11px; color: var(--text-muted);">Tenés: ${count}</span>
          <button class="action-primary-btn btn-feed-action" data-food="${id}" style="width: 100%; padding: 6px 0; font-size: 12px;" ${count <= 0 ? 'disabled' : ''}>
            ${count > 0 ? 'Dar' : 'Agotado'}
          </button>
        </div>
      `;
      })
      .join('');

    list.querySelectorAll('.btn-feed-action').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const foodId = e.currentTarget.getAttribute('data-food');
        try {
          sound.playNibble();
          localStore.performCare('feed', foodId);
          this.showToast('¡A Pippo le encantó la comidita! (+5 Luceros)');
        } catch (err) {
          this.showToast(err.message);
        }
      });
    });
  }

  renderNotes() {
    const container = document.getElementById('notes-container');
    if (!container) return;

    const notes = localStore.getNotes();
    const user = localStore.getCurrentUser();

    if (notes.length === 0) {
      container.innerHTML = '<p style="font-size: 12.5px; color: var(--text-muted);">Aún no hay cartitas. ¡Dejale la primera a tu pareja!</p>';
      return;
    }

    container.innerHTML = notes
      .map((n) => {
        const isMine = n.senderId === user.id;
        return `
        <div class="note-bubble ${isMine ? 'mine' : ''}">
          <span style="font-size: 22px;">${n.sticker || '💌'}</span>
          <div style="flex: 1;">
            <div class="note-sender">${isMine ? 'Vos' : n.senderName}</div>
            <div class="note-message">${n.message}</div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  renderRitual() {
    const ritual = localStore.getTodayRitual();
    const promptText = document.getElementById('ritual-prompt-text');
    if (promptText) promptText.textContent = ritual.prompt;

    const answersDiv = document.getElementById('ritual-answers-display');
    if (!answersDiv) return;

    const user = localStore.getCurrentUser();
    const space = localStore.getSpace();
    const partnerId = space ? space.members.find((m) => m !== user.id) : null;

    const myAns = ritual.responses[user.id];
    const partnerAns = partnerId ? ritual.responses[partnerId] : null;

    let html = '';
    if (myAns) {
      html += `
        <div style="background-color: #F8F6F0; border: 1px solid #E8E2D5; padding: 10px 14px; border-radius: var(--radius-md); margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--color-sage-deep);">Tu respuesta de hoy:</div>
          <div style="font-size: 13.5px; margin-top: 2px;">${myAns.text}</div>
        </div>
      `;
    }

    if (partnerAns) {
      html += `
        <div style="background-color: #F3F8F4; border: 1px solid #D2E7D8; padding: 10px 14px; border-radius: var(--radius-md);">
          <div style="font-size: 11px; font-weight: 700; color: var(--color-sage-deep);">Respuesta de tu pareja:</div>
          <div style="font-size: 13.5px; margin-top: 2px;">${partnerAns.text}</div>
        </div>
      `;
    } else {
      html += `
        <div style="background-color: #FFFDF9; border: 1px dashed var(--border-subtle); padding: 10px; border-radius: var(--radius-md); text-align: center; font-size: 12.5px; color: var(--text-muted);">
          🔒 Tu pareja aún no respondió hoy. La respuesta se revelará cuando ambos respondan.
        </div>
      `;
    }

    answersDiv.innerHTML = html;
  }

  renderMemories() {
    const container = document.getElementById('memories-container');
    if (!container) return;

    const memories = localStore.getMemories();
    container.innerHTML = memories
      .map(
        (m) => `
      <div style="display: flex; align-items: center; gap: 12px; background-color: var(--surface-card); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px;">
        <span style="font-size: 26px;">${m.icon}</span>
        <div>
          <div style="font-size: 14px; font-weight: 800; color: var(--text-main);">${m.title}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${m.description}</div>
        </div>
      </div>
    `
      )
      .join('');
  }

  renderDecorAndWardrobe() {
    const space = localStore.getSpace();
    if (!space) return;

    // Habitación (muebles)
    const decorGrid = document.getElementById('unlocked-decor-grid');
    if (decorGrid) {
      decorGrid.innerHTML = space.inventory.unlockedDecor
        .map((id) => {
          const item = DECOR_CATALOG[id];
          if (!item) return '';
          const isEquipped = space.inventory.activeDecor[item.slot] === id;
          return `
          <div style="background-color: var(--surface-card); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
            <span style="font-size: 28px;">${item.icon}</span>
            <span style="font-size: 13px; font-weight: 700; text-align: center;">${item.name}</span>
            <button class="action-primary-btn btn-equip-decor" data-slot="${item.slot}" data-id="${id}" style="width: 100%; padding: 6px 0; font-size: 12px; background-color: ${isEquipped ? '#87AE91' : 'var(--color-sage)'};">
              ${isEquipped ? '✓ Puesto' : 'Colocar'}
            </button>
          </div>
        `;
        })
        .join('');

      decorGrid.querySelectorAll('.btn-equip-decor').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          sound.playTap();
          const slot = e.currentTarget.getAttribute('data-slot');
          const id = e.currentTarget.getAttribute('data-id');
          const isEquipped = space.inventory.activeDecor[slot] === id;
          localStore.equipDecor(slot, isEquipped ? null : id);
        });
      });
    }

    // Armario (accesorios)
    const accGrid = document.getElementById('unlocked-accessories-grid');
    if (accGrid) {
      if (space.inventory.unlockedAccessories.length === 0) {
        accGrid.innerHTML = '<p style="grid-column: span 2; font-size: 12.5px; color: var(--text-muted);">Aún no tenés accesorios comprados. ¡Visita la Tienda!</p>';
      } else {
        accGrid.innerHTML = space.inventory.unlockedAccessories
          .map((id) => {
            const item = ACCESSORY_CATALOG[id];
            if (!item) return '';
            const isEquipped = space.pet.accessory === id;
            return `
            <div style="background-color: var(--surface-card); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
              <span style="font-size: 28px;">${item.icon}</span>
              <span style="font-size: 13px; font-weight: 700; text-align: center;">${item.name}</span>
              <button class="action-primary-btn btn-equip-acc" data-id="${id}" style="width: 100%; padding: 6px 0; font-size: 12px; background-color: ${isEquipped ? '#87AE91' : 'var(--color-sage)'};">
                ${isEquipped ? '✓ Puesto' : 'Poner'}
              </button>
            </div>
          `;
          })
          .join('');

        accGrid.querySelectorAll('.btn-equip-acc').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            sound.playTap();
            const id = e.currentTarget.getAttribute('data-id');
            const isEquipped = space.pet.accessory === id;
            localStore.equipAccessory(isEquipped ? null : id);
          });
        });
      }
    }
  }

  renderShop() {
    const shopGrid = document.getElementById('shop-catalog-grid');
    if (!shopGrid) return;

    const space = localStore.getSpace();
    if (!space) return;

    const allItems = [
      ...Object.values(FOOD_CATALOG).map((i) => ({ ...i, type: 'food' })),
      ...Object.values(DECOR_CATALOG).map((i) => ({ ...i, type: 'decor' })),
      ...Object.values(ACCESSORY_CATALOG).map((i) => ({ ...i, type: 'accessory' })),
    ];

    shopGrid.innerHTML = allItems
      .map((item) => {
        let isAlreadyOwned = false;
        if (item.type === 'decor') {
          isAlreadyOwned = space.inventory.unlockedDecor.includes(item.id);
        } else if (item.type === 'accessory') {
          isAlreadyOwned = space.inventory.unlockedAccessories.includes(item.id);
        }

        return `
        <div style="background-color: var(--surface-card); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <span style="font-size: 28px;">${item.icon}</span>
          <span style="font-size: 13px; font-weight: 700; text-align: center;">${item.name}</span>
          <span style="font-size: 12px; font-weight: 700; color: #8C6A1E;">✨ ${item.price} Luceros</span>
          <button class="action-primary-btn btn-buy-catalog" data-type="${item.type}" data-id="${item.id}" data-name="${item.name}" style="width: 100%; padding: 6px 0; font-size: 12px;" ${isAlreadyOwned ? 'disabled' : ''}>
            ${isAlreadyOwned ? 'Ya adquirido' : 'Comprar'}
          </button>
        </div>
      `;
      })
      .join('');

    shopGrid.querySelectorAll('.btn-buy-catalog').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.getAttribute('data-type');
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');
        try {
          sound.playChime();
          localStore.buyItem(type, id);
          this.showToast(`¡Compraste "${name}" con Luceros! ✨`);
        } catch (err) {
          this.showToast(err.message);
        }
      });
    });
  }

  // Minijuego 1: Noche de Luciérnagas
  startFirefliesGame() {
    const container = document.getElementById('active-game-container');
    if (!container) return;

    sound.playTap();
    let score = 0;
    let timeLeft = 18;

    container.style.display = 'block';
    container.innerHTML = `
      <div style="background-color: #121826; border: 1.5px solid #2B3856; border-radius: var(--radius-lg); padding: 16px; color: #FFF; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-weight: 800;">✨ Luciérnagas atrapadas: <span id="ff-score">0</span></span>
          <span style="font-weight: 800; color: #F3D88B;">⏳ Tiempo: <span id="ff-timer">18</span>s</span>
          <button id="btn-exit-ff" style="background: none; border: none; color: #FFF; font-size: 18px; cursor: pointer;">✕</button>
        </div>
        <div id="ff-arena" style="position: relative; width: 100%; height: 260px; background: radial-gradient(circle, #1E2840 0%, #0F1420 100%); border-radius: var(--radius-md); overflow: hidden; cursor: crosshair;"></div>
      </div>
    `;

    const arena = document.getElementById('ff-arena');
    const scoreEl = document.getElementById('ff-score');
    const timerEl = document.getElementById('ff-timer');

    document.getElementById('btn-exit-ff')?.addEventListener('click', () => {
      clearInterval(this.minigameTimer);
      container.style.display = 'none';
      container.innerHTML = '';
    });

    const spawnFirefly = () => {
      if (!arena) return;
      const f = document.createElement('div');
      f.style.position = 'absolute';
      f.style.width = '34px';
      f.style.height = '34px';
      f.style.borderRadius = '50%';
      f.style.backgroundColor = 'rgba(243, 216, 139, 0.35)';
      f.style.boxShadow = '0 0 16px #F3D88B';
      f.style.display = 'flex';
      f.style.alignItems = 'center';
      f.style.justifyContent = 'center';
      f.style.fontSize = '20px';
      f.textContent = '✨';
      f.style.left = `${Math.random() * (arena.clientWidth - 40)}px`;
      f.style.top = `${Math.random() * (arena.clientHeight - 40)}px`;
      f.style.cursor = 'pointer';
      f.style.transition = 'all 400ms ease';

      f.addEventListener('pointerdown', () => {
        sound.playChime();
        score++;
        if (scoreEl) scoreEl.textContent = score;
        f.remove();
      });

      arena.appendChild(f);
      setTimeout(() => f.remove(), 1600);
    };

    const spawnInterval = setInterval(spawnFirefly, 600);

    this.minigameTimer = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(spawnInterval);
        clearInterval(this.minigameTimer);

        const lucerosEarned = Math.min(25, Math.round(score * 2.2));
        localStore.recordGameReward('Noche de Luciérnagas', score, lucerosEarned);
        sound.playChime();

        container.innerHTML = `
          <div class="ui-card" style="text-align: center; padding: 24px;">
            <div style="font-size: 38px;">🎉</div>
            <h3 style="font-size: 18px; font-weight: 800; margin-top: 8px;">¡Excelente noche de jardín!</h3>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 8px 0;">Atrapaste ${score} luciérnagas y ganaron +${lucerosEarned} Luceros para el nido.</p>
            <button class="action-primary-btn" id="btn-finish-ff" style="margin: 0 auto;">Volver al Nido</button>
          </div>
        `;
        document.getElementById('btn-finish-ff')?.addEventListener('click', () => {
          container.style.display = 'none';
          container.innerHTML = '';
        });
      }
    }, 1000);
  }

  // Minijuego 2: Memoria del Nido
  startMemoryGame() {
    const container = document.getElementById('active-game-container');
    if (!container) return;

    sound.playTap();
    container.style.display = 'block';

    const icons = ['🍎', '🫐', '🥞', '🍵', '🧶', '🪴'];
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div style="background-color: var(--surface-card); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-weight: 800;">🧩 Memoria del Nido</h3>
          <button id="btn-exit-memory" style="background: none; border: none; font-size: 18px; cursor: pointer;">✕</button>
        </div>
        <div id="memory-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;"></div>
      </div>
    `;

    document.getElementById('btn-exit-memory')?.addEventListener('click', () => {
      container.style.display = 'none';
      container.innerHTML = '';
    });

    const grid = document.getElementById('memory-grid');
    let flippedCards = [];
    let matchedPairs = 0;

    deck.forEach((icon, index) => {
      const card = document.createElement('div');
      card.style.height = '62px';
      card.style.borderRadius = 'var(--radius-md)';
      card.style.backgroundColor = '#EAE4D7';
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'center';
      card.style.fontSize = '26px';
      card.style.cursor = 'pointer';
      card.style.userSelect = 'none';
      card.setAttribute('data-icon', icon);
      card.setAttribute('data-index', index);
      card.textContent = '❓';

      card.addEventListener('click', () => {
        if (flippedCards.length >= 2 || card.textContent !== '❓') return;

        sound.playTap();
        card.textContent = icon;
        card.style.backgroundColor = 'var(--surface-white)';
        card.style.border = '2px solid var(--color-sage)';
        flippedCards.push(card);

        if (flippedCards.length === 2) {
          const [c1, c2] = flippedCards;
          if (c1.getAttribute('data-icon') === c2.getAttribute('data-icon')) {
            sound.playChime();
            matchedPairs++;
            flippedCards = [];

            if (matchedPairs === icons.length) {
              setTimeout(() => {
                localStore.recordGameReward('Memoria del Nido', 100, 30);
                container.innerHTML = `
                  <div class="ui-card" style="text-align: center; padding: 24px;">
                    <div style="font-size: 38px;">🏆</div>
                    <h3 style="font-size: 18px; font-weight: 800; margin-top: 8px;">¡Memoria completada!</h3>
                    <p style="font-size: 13.5px; color: var(--text-muted); margin: 8px 0;">Emparejaron todos los objetos y sumaron +30 Luceros al nido.</p>
                    <button class="action-primary-btn" id="btn-finish-mem" style="margin: 0 auto;">Volver al Nido</button>
                  </div>
                `;
                document.getElementById('btn-finish-mem')?.addEventListener('click', () => {
                  container.style.display = 'none';
                  container.innerHTML = '';
                });
              }, 450);
            }
          } else {
            setTimeout(() => {
              c1.textContent = '❓';
              c1.style.backgroundColor = '#EAE4D7';
              c1.style.border = 'none';
              c2.textContent = '❓';
              c2.style.backgroundColor = '#EAE4D7';
              c2.style.border = 'none';
              flippedCards = [];
            }, 800);
          }
        }
      });

      grid.appendChild(card);
    });
  }

  // Ejecución de la Suite QA Automatizada (25 Pruebas)
  runQATests() {
    const resultsContainer = document.getElementById('qa-results-container');
    if (!resultsContainer) return;

    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<div style="font-size: 13px; color: var(--color-sage-deep);">Ejecutando pruebas...</div>';

    const testSummary = runAutomatedAuditTests();

    let html = `
      <div style="background-color: ${testSummary.allPassed ? '#EAF5EC' : '#FDE8E8'}; border: 1.5px solid ${testSummary.allPassed ? '#A9C7B1' : '#F8B4B4'}; border-radius: var(--radius-md); padding: 12px; margin-bottom: 10px;">
        <strong style="color: ${testSummary.allPassed ? '#2C663C' : '#9B1C1C'}; font-size: 14px;">
          ${testSummary.allPassed ? '✅ Todas las pruebas aprobadas' : '❌ Se detectaron fallos'}: ${testSummary.passed} / ${testSummary.total} Tests Aprobados
        </strong>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; max-height: 240px; overflow-y: auto; font-size: 12px;">
    `;

    testSummary.tests.forEach((t) => {
      html += `
        <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-bottom: 1px solid var(--border-subtle); background-color: var(--surface-white);">
          <span><strong>${t.id}:</strong> ${t.name}</span>
          <span style="font-weight: 700; color: ${t.passed ? '#2C663C' : '#9B1C1C'};">${t.passed ? 'PASÓ' : 'FALLÓ'}</span>
        </div>
      `;
    });

    html += '</div>';
    resultsContainer.innerHTML = html;
  }
}

// Iniciar aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
