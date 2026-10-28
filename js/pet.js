// ============================================================================
// NUESTRO NIDO | Motor de Criatura, Audio y Arte SVG
// ============================================================================

import { LIMITS } from './config.js';

/**
 * Sintetizador Web Audio API puro, ligero y sin dependencias externas.
 * Proporciona sonidos analógicos cálidos con soporte de silenciamiento persistente.
 */
export class SoundEngine {
  constructor() {
    this.ctx = null;
    let saved = null;
    if (typeof localStorage !== 'undefined') {
      saved = localStorage.getItem('nuestro_nido_muted');
    }
    this.isMuted = saved === 'true';
  }

  initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getMuted() {
    return this.isMuted;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('nuestro_nido_muted', String(this.isMuted));
    if (!this.isMuted) {
      this.playTap();
    }
    return this.isMuted;
  }

  playTap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playPurr() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(220, this.ctx.currentTime + 0.12);
    osc.frequency.linearRampToValueAtTime(180, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playNibble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0, 0.09, 0.18].forEach((offset, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520 + idx * 80, now + offset);
      osc.frequency.exponentialRampToValueAtTime(420, now + offset + 0.07);

      gain.gain.setValueAtTime(0.07, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.07);
    });
  }

  playBubble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [587.33, 739.99, 880, 1174.66]; // Re mayor armónico
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.06, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  }

  playLullaby() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const chord = [329.63, 392.00, 493.88]; // Mi menor sereno
    const now = this.ctx.currentTime;
    chord.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    });
  }
}

export const sound = new SoundEngine();

/**
 * Deriva el estado emocional y la animación de Pippo en base a sus estadísticas vitales.
 */
export function getPetMood(pet) {
  if (pet.isSleeping) return 'sleeping';

  if (pet.needs.energy <= LIMITS.criticalThreshold) return 'sleepy';
  if (pet.needs.hunger <= LIMITS.criticalThreshold) return 'hungry';
  if (pet.needs.hygiene <= LIMITS.criticalThreshold) return 'dirty';
  if (pet.needs.fun <= LIMITS.criticalThreshold) return 'bored';

  const avg =
    (pet.needs.hunger +
      pet.needs.hygiene +
      pet.needs.energy +
      pet.needs.fun +
      pet.needs.comfort) /
    5;
  if (avg >= 70) return 'happy';

  return 'idle';
}

/**
 * Mapa de paletas cromáticas suaves de la criatura.
 */
const COLOR_MAP = {
  pastel_sage: {
    body: '#A9C7B1',
    shadow: '#87AE91',
    belly: '#FFFDF9',
    earInner: '#EFB7B5',
  },
  butter_cream: {
    body: '#F3D88B',
    shadow: '#E1BC5B',
    belly: '#FFFDF9',
    earInner: '#F9C0B0',
  },
  dusty_rose: {
    body: '#EFB7B5',
    shadow: '#D89492',
    belly: '#FFFDF9',
    earInner: '#FFF0F0',
  },
  lavender_sky: {
    body: '#C8B9E8',
    shadow: '#A894D1',
    belly: '#FFFDF9',
    earInner: '#F0E5FF',
  },
};

/**
 * Genera el marcado SVG completo de Pippo según su etapa evolutiva,
 * expresión actual, accesorios equipados y animación activa.
 */
export function renderPetSVG(pet, mood, isPetted = false) {
  const isSleeping = pet.isSleeping;
  const colors = COLOR_MAP[pet.colorVariant] || COLOR_MAP.pastel_sage;
  const stage = pet.stage || 'egg';

  // -------------------------------------------------------------
  // ETAPA 1: HUEVO TIBIO
  // -------------------------------------------------------------
  if (stage === 'egg') {
    const progress = pet.hatchingProgress || 0;
    const crack1 =
      progress >= 1
        ? `<path d="M 98,75 L 108,90 L 96,105 L 112,120" stroke="#8B693A" stroke-width="3" stroke-linecap="round" fill="none" filter="url(#glow)"/>`
        : '';
    const crack2 =
      progress >= 2
        ? `<path d="M 96,105 L 78,118 L 88,132 L 72,148" stroke="#8B693A" stroke-width="3" stroke-linecap="round" fill="none" filter="url(#glow)"/>`
        : '';
    const crack3 =
      progress >= 3
        ? `<path d="M 112,120 L 132,125 L 126,145 L 142,160" stroke="#D4A838" stroke-width="3.5" stroke-linecap="round" fill="none" filter="url(#glow)"/>`
        : '';

    return `
      <svg viewBox="0 0 200 240" class="pet-svg-element" style="filter: drop-shadow(0 10px 18px rgba(78, 118, 100, 0.2)); animation: ${
        isPetted ? 'eggWobble 0.4s ease' : 'gentleFloat 3.2s ease-in-out infinite'
      };">
        <defs>
          <radialGradient id="eggGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stop-color="#FFFDF7" />
            <stop offset="60%" stop-color="#F5EBD7" />
            <stop offset="100%" stop-color="#E2D0B5" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Nido de paja y hojas -->
        <ellipse cx="100" cy="210" rx="75" ry="22" fill="#D7C4A5" opacity="0.9" />
        <path d="M 30,205 Q 60,225 100,215 Q 150,225 170,205 Q 140,228 100,225 Q 50,226 30,205 Z" fill="#B9A482" />
        <path d="M 45,212 Q 25,200 35,190 Q 55,205 45,212 Z" fill="#A9C7B1" />
        <path d="M 160,210 Q 180,195 170,185 Q 155,205 160,210 Z" fill="#A9C7B1" />

        <!-- Sombra del huevo -->
        <ellipse cx="100" cy="200" rx="46" ry="14" fill="rgba(0,0,0,0.12)" />

        <!-- Cuerpo del huevo -->
        <path d="M 100,25 C 142,25 168,75 168,135 C 168,178 138,202 100,202 C 62,202 32,178 32,135 C 32,75 58,25 100,25 Z"
              fill="url(#eggGrad)" stroke="#CBB797" stroke-width="3.5" />

        <!-- Motitas doradas -->
        <circle cx="80" cy="85" r="5" fill="#E8B952" opacity="0.65" />
        <circle cx="125" cy="110" r="6" fill="#E8B952" opacity="0.65" />
        <circle cx="70" cy="140" r="4.5" fill="#E8B952" opacity="0.65" />
        <circle cx="130" cy="155" r="5" fill="#E8B952" opacity="0.65" />

        ${crack1}
        ${crack2}
        ${crack3}

        <!-- Destello de vida -->
        <polygon points="145,55 148,63 156,66 148,69 145,77 142,69 134,66 142,63" fill="#F3D88B" opacity="0.85" />
      </svg>
    `;
  }

  // -------------------------------------------------------------
  // ACCESORIOS EQUIPADOS
  // -------------------------------------------------------------
  let accessoryMarkup = '';
  if (pet.accessory === 'sombrerito_hoja') {
    accessoryMarkup = `
      <g style="transform-origin: 110px 65px; transform: rotate(-8deg);">
        <path d="M 110,65 Q 80,30 115,20 Q 145,28 120,65 Z" fill="#74A767" stroke="#4E7664" stroke-width="2" />
        <path d="M 110,65 Q 115,40 115,20" stroke="#4E7664" stroke-width="1.5" fill="none" />
        <circle cx="112" cy="35" r="3" fill="#D7EDD6" opacity="0.8" />
      </g>
    `;
  } else if (pet.accessory === 'mono_rosa') {
    accessoryMarkup = `
      <g transform="translate(132, 70)">
        <path d="M 0,0 L 15,-8 L 15,8 Z" fill="#EFB7B5" stroke="#D89492" stroke-width="1.5" />
        <path d="M 0,0 L -15,-8 L -15,8 Z" fill="#EFB7B5" stroke="#D89492" stroke-width="1.5" />
        <circle cx="0" cy="0" r="4.5" fill="#D89492" />
      </g>
    `;
  } else if (pet.accessory === 'bufanda_lana') {
    accessoryMarkup = `
      <g>
        <path d="M 72,158 Q 110,172 148,158 Q 152,168 140,174 Q 110,182 80,174 Z" fill="#D47B78" stroke="#A84C49" stroke-width="2" />
        <path d="M 125,170 L 138,202 L 122,202 L 115,174 Z" fill="#D47B78" stroke="#A84C49" stroke-width="2" />
      </g>
    `;
  } else if (pet.accessory === 'corona_flores') {
    accessoryMarkup = `
      <g transform="translate(110, 68)">
        <ellipse cx="0" cy="0" rx="35" ry="6" fill="none" stroke="#78A383" stroke-width="2.5" />
        <circle cx="-24" cy="-2" r="6" fill="#FFFDF9" stroke="#E1BC5B" stroke-width="1.5" />
        <circle cx="-8" cy="-5" r="7" fill="#F3D88B" stroke="#D4A838" stroke-width="1.5" />
        <circle cx="10" cy="-5" r="6.5" fill="#EFB7B5" stroke="#D89492" stroke-width="1.5" />
        <circle cx="26" cy="-2" r="6" fill="#FFFDF9" stroke="#E1BC5B" stroke-width="1.5" />
      </g>
    `;
  }

  // -------------------------------------------------------------
  // OJOS Y BOCA SEGÚN EMOCIÓN
  // -------------------------------------------------------------
  let eyesMarkup = '';
  if (isSleeping) {
    eyesMarkup = `
      <g stroke="#343746" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M 76,124 Q 88,132 100,124" />
        <path d="M 120,124 Q 132,132 144,124" />
      </g>
    `;
  } else if (isPetted || mood === 'happy') {
    eyesMarkup = `
      <g stroke="#343746" stroke-width="3.5" stroke-linecap="round" fill="none">
        <path d="M 76,126 Q 88,114 100,126" />
        <path d="M 120,126 Q 132,114 144,126" />
      </g>
    `;
  } else if (mood === 'sleepy') {
    eyesMarkup = `
      <g stroke="#343746" stroke-width="2.8" stroke-linecap="round" fill="none">
        <path d="M 78,126 Q 88,130 98,126" />
        <path d="M 122,126 Q 132,130 142,126" />
      </g>
    `;
  } else {
    eyesMarkup = `
      <g>
        <ellipse cx="88" cy="122" rx="10" ry="12" fill="#343746" />
        <circle cx="85" cy="118" r="4" fill="#FFFFFF" />
        <circle cx="91" cy="126" r="2" fill="#FFFFFF" />
        <ellipse cx="132" cy="122" rx="10" ry="12" fill="#343746" />
        <circle cx="129" cy="118" r="4" fill="#FFFFFF" />
        <circle cx="135" cy="126" r="2" fill="#FFFFFF" />
      </g>
    `;
  }

  let mouthMarkup = '';
  if (mood === 'eating') {
    mouthMarkup = `<ellipse cx="110" cy="142" rx="6" ry="5" fill="#343746" />`;
  } else if (isSleeping) {
    mouthMarkup = `<path d="M 106,138 Q 110,141 114,138" stroke="#343746" stroke-width="2.5" stroke-linecap="round" fill="none" />`;
  } else if (mood === 'hungry' || mood === 'dirty' || mood === 'bored') {
    mouthMarkup = `<path d="M 105,142 Q 110,137 115,142" stroke="#343746" stroke-width="2.5" stroke-linecap="round" fill="none" />`;
  } else {
    mouthMarkup = `<path d="M 103,138 Q 107,144 110,140 Q 113,144 117,138" stroke="#343746" stroke-width="2.2" stroke-linecap="round" fill="none" />`;
  }

  // Burbujitas de baño si aplica
  const bathingBubbles =
    mood === 'bathing'
      ? `
      <circle cx="60" cy="90" r="8" fill="#B9D5E8" opacity="0.75" />
      <circle cx="150" cy="80" r="11" fill="#B9D5E8" opacity="0.75" />
      <circle cx="170" cy="140" r="7" fill="#B9D5E8" opacity="0.75" />
      <circle cx="45" cy="130" r="9" fill="#B9D5E8" opacity="0.75" />
    `
      : '';

  // Rasgos distintivos de etapa adulta o joven
  let stageDetails = '';
  if (stage === 'young') {
    // Mechón de pelo juguetón en la cabeza
    stageDetails = `
      <path d="M 106,66 Q 110,48 116,66" stroke="${colors.shadow}" stroke-width="3" stroke-linecap="round" fill="none" />
    `;
  } else if (stage === 'adult') {
    // Pequeño penacho doble y alas mullidas suaves
    stageDetails = `
      <path d="M 104,65 Q 108,42 114,65" stroke="${colors.shadow}" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <path d="M 112,65 Q 116,38 122,65" stroke="${colors.shadow}" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <ellipse cx="44" cy="145" rx="8" ry="18" fill="${colors.shadow}" transform="rotate(12 44 145)" />
      <ellipse cx="176" cy="145" rx="8" ry="18" fill="${colors.shadow}" transform="rotate(-12 176 145)" />
    `;
  }

  const anim = isPetted
    ? 'petSquish 0.35s ease-out'
    : isSleeping
    ? 'sleepBreath 3.5s ease-in-out infinite'
    : 'idleBreathe 2.8s ease-in-out infinite';

  return `
    <svg viewBox="0 0 220 240" class="pet-svg-element" style="filter: drop-shadow(0 12px 20px rgba(52, 55, 70, 0.15)); animation: ${anim};">
      <defs>
        <radialGradient id="bodyGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="${colors.body}" />
          <stop offset="85%" stop-color="${colors.shadow}" />
        </radialGradient>
      </defs>

      <!-- Sombra de suelo -->
      <ellipse cx="110" cy="215" rx="60" ry="14" fill="rgba(0,0,0,0.12)" />

      <!-- Cola esponjosa animada -->
      <g style="transform-origin: 55px 175px; animation: tailWag 3.2s ease-in-out infinite;">
        <ellipse cx="50" cy="170" rx="26" ry="22" fill="${colors.shadow}" />
        <ellipse cx="48" cy="168" rx="20" ry="17" fill="${colors.body}" />
        <circle cx="36" cy="162" r="7" fill="${colors.belly}" opacity="0.6" />
      </g>

      <!-- Oreja Izquierda -->
      <path d="M 65,95 Q 45,45 80,60 Q 95,80 88,105 Z" fill="url(#bodyGrad)" stroke="${colors.shadow}" stroke-width="2.5" />
      <path d="M 68,90 Q 56,58 78,68 Q 88,82 82,98 Z" fill="${colors.earInner}" opacity="0.85" />

      <!-- Oreja Derecha -->
      <path d="M 155,95 Q 175,45 140,60 Q 125,80 132,105 Z" fill="url(#bodyGrad)" stroke="${colors.shadow}" stroke-width="2.5" />
      <path d="M 152,90 Q 164,58 142,68 Q 132,82 138,98 Z" fill="${colors.earInner}" opacity="0.85" />

      <!-- Cuerpo Principal -->
      <path d="M 110,65 C 165,65 178,105 178,155 C 178,205 152,215 110,215 C 68,215 42,205 42,155 C 42,105 55,65 110,65 Z"
            fill="url(#bodyGrad)" stroke="${colors.shadow}" stroke-width="3" />

      <!-- Pancita suave -->
      <ellipse cx="110" cy="162" rx="42" ry="38" fill="${colors.belly}" />

      <!-- Detalles de etapa -->
      ${stageDetails}

      <!-- Mejillas sonrosadas -->
      <ellipse cx="76" cy="138" rx="11" ry="7" fill="#F9A8A8" opacity="${isPetted ? '0.95' : '0.65'}" />
      <ellipse cx="144" cy="138" rx="11" ry="7" fill="#F9A8A8" opacity="${isPetted ? '0.95' : '0.65'}" />

      <!-- Patitas delanteras -->
      <ellipse cx="88" cy="188" rx="14" ry="11" fill="${colors.shadow}" />
      <ellipse cx="88" cy="186" rx="12" ry="9" fill="${colors.body}" />
      <ellipse cx="132" cy="188" rx="14" ry="11" fill="${colors.shadow}" />
      <ellipse cx="132" cy="186" rx="12" ry="9" fill="${colors.body}" />

      <!-- Ojos, Nariz, Boca -->
      ${eyesMarkup}
      <ellipse cx="110" cy="132" rx="4" ry="3" fill="#6A5A55" />
      ${mouthMarkup}

      <!-- Accesorios y burbujas -->
      ${accessoryMarkup}
      ${bathingBubbles}
    </svg>
  `;
}
