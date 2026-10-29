// ============================================================================
// NUESTRO NIDO | Motor de Arte SVG, Micro-Animaciones y Audio Procedural
// ============================================================================

import { LIMITS } from './config.js';

/**
 * Sintetizador Web Audio API puro con envolventes ADSR cálidas (sin MP3 externos).
 * Simula marimba suave, ronroneos armónicos, burbujas acuáticas y acordes de cuna.
 */
export class ProceduralAudioEngine {
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
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nuestro_nido_muted', String(this.isMuted));
    }
    if (!this.isMuted) {
      this.playTap();
    }
    return this.isMuted;
  }

  // Toque suave tipo marimba/kalimba
  playTap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // Do5
    osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.05); // Mi5

    // Envolvente ADSR suave
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Ronroneo dulce con modulación de frecuencia
  playPurr() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    // LFO para efecto trémolo / ronroneo felino
    lfo.frequency.setValueAtTime(18, t);
    lfoGain.gain.setValueAtTime(15, t);
    lfo.connect(osc.frequency);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(185, t + 0.15);
    osc.frequency.linearRampToValueAtTime(130, t + 0.3);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.09, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 0.3);
    osc.stop(t + 0.3);
  }

  // Mordisco crocante / comer
  playNibble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [0, 0.08, 0.16].forEach((offset, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + idx * 90, t + offset);
      osc.frequency.exponentialRampToValueAtTime(380, t + offset + 0.06);

      gain.gain.setValueAtTime(0.07, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.06);
    });
  }

  // Burbujas de jabón realistas con pitch ascendente
  playBubble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(840, t + 0.14);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Campanita armónica de Lucero o acierto
  playChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // Do - Mi - Sol - Do (Arpegio Mayor)
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.001, t + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.07, t + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.35);
    });
  }

  // Canción de cuna serena (Acorde pentatónico cálido con filtro)
  playLullaby() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const chord = [329.63, 392.0, 493.88, 587.33]; // Mi menor 7
    const t = this.ctx.currentTime;

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      gain.gain.setValueAtTime(0.001, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.045, t + i * 0.08 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 1.4);
    });
  }

  // Fanfarria triunfal al eclosionar o evolucionar
  playEvolutionFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const fanfare = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.4 },
    ];
    let curTime = this.ctx.currentTime;

    fanfare.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, curTime);

      gain.gain.setValueAtTime(0.001, curTime);
      gain.gain.linearRampToValueAtTime(0.09, curTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, curTime + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(curTime);
      osc.stop(curTime + n.d);
      curTime += n.d * 0.85;
    });
  }

  // Click sutil de interruptor de luz
  playSwitch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.04);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Susurro de hojas de planta
  playRustle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.linearRampToValueAtTime(300, t + 0.18);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }
}

export const sound = new ProceduralAudioEngine();

/**
 * Dispara una vibración háptica muy sutil en dispositivos móviles compatibles.
 */
export function triggerHaptic(duration = 14) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {}
  }
}

/**
 * Deriva el estado anímico y corporal de Pippo con alta granularidad expresiva.
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

  if (avg >= 88) return 'ecstatic';
  if (avg >= 68) return 'happy';

  return 'idle';
}

/**
 * Paletas suaves y orgánicas por variante genética de Pippo.
 */
const COLOR_MAP = {
  pastel_sage: {
    body: '#98BFA4',
    shadow: '#769E83',
    belly: '#FFFDF9',
    earInner: '#EFA6A4',
    blush: '#F7A8A6',
  },
  butter_cream: {
    body: '#F0D484',
    shadow: '#D8B65A',
    belly: '#FFFDF9',
    earInner: '#F6B7A6',
    blush: '#F9B79B',
  },
  dusty_rose: {
    body: '#EAA9A7',
    shadow: '#CF8583',
    belly: '#FFFDF9',
    earInner: '#FFE8E8',
    blush: '#FA9A98',
  },
  lavender_sky: {
    body: '#C2B3E6',
    shadow: '#A08ECB',
    belly: '#FFFDF9',
    earInner: '#ECE3FC',
    blush: '#E4A2CE',
  },
};

/**
 * Determina el momento del día actual para iluminar la ventana del cuarto.
 */
export function getCurrentTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 21) return 'sunset';
  return 'night';
}

/**
 * Renderiza el SVG interactivo de Pippo con micro-animaciones continuas:
 * - Parpadeo orgánico (blink)
 * - Orejas dinámicas
 * - Expresiones faciales diferenciadas
 * - Balanceo y grietas doradas del huevo según XP
 */
export function renderPetSVG(pet, mood, isPetted = false) {
  const isSleeping = pet.isSleeping;
  const colors = COLOR_MAP[pet.colorVariant] || COLOR_MAP.pastel_sage;
  const stage = pet.stage || 'egg';

  // -------------------------------------------------------------
  // ETAPA 1: HUEVO TIBIO (Con grietas doradas progresivas y latido)
  // -------------------------------------------------------------
  if (stage === 'egg') {
    const progress = pet.hatchingProgress || 0;
    const crack1 =
      progress >= 1
        ? `<path d="M 98,72 L 109,88 L 95,104 L 114,120" stroke="#876233" stroke-width="3" stroke-linecap="round" fill="none" filter="url(#goldGlow)"/>`
        : '';
    const crack2 =
      progress >= 2
        ? `<path d="M 95,104 L 76,118 L 86,133 L 70,149" stroke="#876233" stroke-width="3" stroke-linecap="round" fill="none" filter="url(#goldGlow)"/>`
        : '';
    const crack3 =
      progress >= 3
        ? `<path d="M 114,120 L 134,125 L 128,145 L 144,160" stroke="#DDA833" stroke-width="3.5" stroke-linecap="round" fill="none" filter="url(#goldGlow)"/>`
        : '';

    const eggAnim = isPetted
      ? 'eggWobble 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'eggHeartbeat 3.2s ease-in-out infinite';

    return `
      <svg viewBox="0 0 200 240" class="pet-svg-element" style="filter: drop-shadow(0 12px 20px rgba(60, 98, 82, 0.22)); animation: ${eggAnim};">
        <defs>
          <radialGradient id="eggGrad" cx="36%" cy="30%" r="68%">
            <stop offset="0%" stop-color="#FFFDF9" />
            <stop offset="65%" stop-color="#F5EBDA" />
            <stop offset="100%" stop-color="#DFCEB2" />
          </radialGradient>
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Nido cálido de paja trenzada y hojas -->
        <ellipse cx="100" cy="212" rx="78" ry="24" fill="#D4C0A0" opacity="0.95" />
        <path d="M 28,206 Q 60,228 100,218 Q 150,228 172,206 Q 140,230 100,227 Q 48,228 28,206 Z" fill="#B29C77" />
        <path d="M 44,213 Q 22,198 34,188 Q 54,204 44,213 Z" fill="#98BFA4" />
        <path d="M 158,212 Q 182,195 170,185 Q 154,205 158,212 Z" fill="#98BFA4" />

        <!-- Sombra proyectada del huevo -->
        <ellipse cx="100" cy="201" rx="48" ry="14" fill="rgba(45, 48, 61, 0.15)" />

        <!-- Silueta ovoide perfecta -->
        <path d="M 100,24 C 144,24 170,74 170,136 C 170,180 139,204 100,204 C 61,204 30,180 30,136 C 30,74 56,24 100,24 Z"
              fill="url(#eggGrad)" stroke="#C8B391" stroke-width="3" />

        <!-- Motitas y pecas doradas del huevo -->
        <circle cx="78" cy="82" r="5" fill="#E8B84B" opacity="0.65" />
        <circle cx="126" cy="108" r="6" fill="#E8B84B" opacity="0.65" />
        <circle cx="68" cy="138" r="4.5" fill="#E8B84B" opacity="0.65" />
        <circle cx="132" cy="154" r="5" fill="#E8B84B" opacity="0.65" />
        <circle cx="96" cy="166" r="3.5" fill="#E8B84B" opacity="0.6" />

        ${crack1}
        ${crack2}
        ${crack3}

        <!-- Brillo estelar pulsante si está por nacer -->
        <polygon points="144,52 147,60 155,63 147,66 144,74 141,66 133,63 141,60" fill="#F4CF74" opacity="0.85" />
      </svg>
    `;
  }

  // -------------------------------------------------------------
  // ACCESORIOS SUPERPUESTOS
  // -------------------------------------------------------------
  let accessoryMarkup = '';
  if (pet.accessory === 'sombrerito_hoja') {
    accessoryMarkup = `
      <g style="transform-origin: 110px 65px; transform: rotate(-8deg);">
        <path d="M 110,65 Q 78,28 116,18 Q 148,26 122,65 Z" fill="#6FA362" stroke="#3C6252" stroke-width="2" />
        <path d="M 110,65 Q 116,38 116,18" stroke="#3C6252" stroke-width="1.6" fill="none" />
        <circle cx="114" cy="34" r="3" fill="#E1F2E0" opacity="0.85" />
      </g>
    `;
  } else if (pet.accessory === 'mono_rosa') {
    accessoryMarkup = `
      <g transform="translate(134, 68)">
        <path d="M 0,0 L 16,-9 L 16,9 Z" fill="#E8A7A5" stroke="#C96865" stroke-width="1.6" />
        <path d="M 0,0 L -16,-9 L -16,9 Z" fill="#E8A7A5" stroke="#C96865" stroke-width="1.6" />
        <circle cx="0" cy="0" r="5" fill="#C96865" />
      </g>
    `;
  } else if (pet.accessory === 'bufanda_lana') {
    accessoryMarkup = `
      <g>
        <path d="M 70,156 Q 110,174 150,156 Q 154,168 142,175 Q 110,184 78,175 Z" fill="#D06F6C" stroke="#9E413E" stroke-width="2" />
        <path d="M 126,170 L 140,204 L 124,204 L 116,174 Z" fill="#D06F6C" stroke="#9E413E" stroke-width="2" />
        <!-- Flecos de lana -->
        <line x1="124" y1="204" x2="124" y2="210" stroke="#9E413E" stroke-width="1.5" />
        <line x1="132" y1="204" x2="132" y2="210" stroke="#9E413E" stroke-width="1.5" />
        <line x1="140" y1="204" x2="140" y2="210" stroke="#9E413E" stroke-width="1.5" />
      </g>
    `;
  } else if (pet.accessory === 'corona_flores') {
    accessoryMarkup = `
      <g transform="translate(110, 66)">
        <ellipse cx="0" cy="0" rx="36" ry="7" fill="none" stroke="#6F9D7C" stroke-width="2.5" />
        <circle cx="-25" cy="-2" r="6" fill="#FFFDF9" stroke="#EAC96F" stroke-width="1.5" />
        <circle cx="-9" cy="-5" r="7.5" fill="#F4CF74" stroke="#C79D3A" stroke-width="1.5" />
        <circle cx="10" cy="-5" r="7" fill="#E8A7A5" stroke="#C96865" stroke-width="1.5" />
        <circle cx="26" cy="-2" r="6" fill="#FFFDF9" stroke="#EAC96F" stroke-width="1.5" />
      </g>
    `;
  }

  // -------------------------------------------------------------
  // OJOS Y MIRADA VIVA (Con parpadeo y emociones fluidas)
  // -------------------------------------------------------------
  let eyesMarkup = '';
  if (isSleeping) {
    eyesMarkup = `
      <g stroke="#2D303D" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M 74,124 Q 88,133 102,124" />
        <path d="M 118,124 Q 132,133 146,124" />
      </g>
    `;
  } else if (mood === 'ecstatic') {
    // Ojitos de estrellas/corazones de pura felicidad
    eyesMarkup = `
      <g>
        <path d="M 88,114 Q 96,122 88,130 Q 80,122 88,114" fill="#C96865" />
        <path d="M 132,114 Q 140,122 132,130 Q 124,122 132,114" fill="#C96865" />
      </g>
    `;
  } else if (isPetted || mood === 'happy') {
    // Ojos curvos sonrientes (^ ^)
    eyesMarkup = `
      <g stroke="#2D303D" stroke-width="3.5" stroke-linecap="round" fill="none">
        <path d="M 75,126 Q 88,112 101,126" />
        <path d="M 119,126 Q 132,112 145,126" />
      </g>
    `;
  } else if (mood === 'sleepy') {
    eyesMarkup = `
      <g stroke="#2D303D" stroke-width="2.8" stroke-linecap="round" fill="none">
        <path d="M 76,126 Q 88,131 100,126" />
        <path d="M 120,126 Q 132,131 144,126" />
      </g>
    `;
  } else {
    // Ojos abiertos con pupila dilatada y doble brillo especular + parpadeo CSS
    eyesMarkup = `
      <g class="pet-blinking-eyes">
        <ellipse cx="88" cy="122" rx="10.5" ry="12.5" fill="#2D303D" />
        <circle cx="85" cy="117" r="4.2" fill="#FFFFFF" />
        <circle cx="91" cy="126" r="2.2" fill="#FFFFFF" />

        <ellipse cx="132" cy="122" rx="10.5" ry="12.5" fill="#2D303D" />
        <circle cx="129" cy="117" r="4.2" fill="#FFFFFF" />
        <circle cx="135" cy="126" r="2.2" fill="#FFFFFF" />
      </g>
    `;
  }

  // -------------------------------------------------------------
  // BOQUITA Y EXPRESIONES EMOCIONALES
  // -------------------------------------------------------------
  let mouthMarkup = '';
  if (mood === 'eating') {
    mouthMarkup = `<ellipse cx="110" cy="142" rx="6.5" ry="5.5" fill="#2D303D" />`;
  } else if (isSleeping) {
    mouthMarkup = `<path d="M 106,138 Q 110,141 114,138" stroke="#2D303D" stroke-width="2.5" stroke-linecap="round" fill="none" />`;
  } else if (mood === 'hungry' || mood === 'dirty') {
    mouthMarkup = `<path d="M 104,143 Q 110,137 116,143" stroke="#2D303D" stroke-width="2.5" stroke-linecap="round" fill="none" />`;
  } else if (mood === 'ecstatic') {
    mouthMarkup = `<path d="M 102,137 Q 110,148 118,137 Z" fill="#2D303D" />`;
  } else {
    // Sonrisita simpática en W
    mouthMarkup = `<path d="M 103,138 Q 107,144 110,140 Q 113,144 117,138" stroke="#2D303D" stroke-width="2.2" stroke-linecap="round" fill="none" />`;
  }

  // Manchas de barro adorables si está sucio
  let dirtySmudges = '';
  if (mood === 'dirty') {
    dirtySmudges = `
      <ellipse cx="64" cy="148" rx="6" ry="4" fill="#8C7355" opacity="0.6" />
      <ellipse cx="152" cy="162" rx="7" ry="5" fill="#8C7355" opacity="0.6" />
      <ellipse cx="118" cy="98" rx="5" ry="3.5" fill="#8C7355" opacity="0.5" />
    `;
  }

  // Burbujitas irisadas si está en el baño
  let bathingBubbles = '';
  if (mood === 'bathing') {
    bathingBubbles = `
      <g>
        <circle cx="58" cy="88" r="9" fill="#A7C8DE" opacity="0.8" />
        <circle cx="56" cy="86" r="3" fill="#FFFFFF" opacity="0.9" />

        <circle cx="154" cy="78" r="12" fill="#A7C8DE" opacity="0.8" />
        <circle cx="151" cy="75" r="4" fill="#FFFFFF" opacity="0.9" />

        <circle cx="174" cy="142" r="8" fill="#A7C8DE" opacity="0.8" />
        <circle cx="44" cy="132" r="10" fill="#A7C8DE" opacity="0.8" />
      </g>
    `;
  }

  // Rasgos distintivos de etapa adulta o joven
  let stageDetails = '';
  if (stage === 'young') {
    stageDetails = `
      <!-- Mechón juguetón en la cabeza -->
      <path d="M 105,66 Q 110,46 117,66" stroke="${colors.shadow}" stroke-width="3" stroke-linecap="round" fill="none" />
    `;
  } else if (stage === 'adult') {
    stageDetails = `
      <!-- Doble penacho elegante y pequeñas alitas suaves -->
      <path d="M 103,65 Q 107,40 114,65" stroke="${colors.shadow}" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <path d="M 112,65 Q 117,36 123,65" stroke="${colors.shadow}" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <ellipse cx="42" cy="146" rx="9" ry="19" fill="${colors.shadow}" transform="rotate(14 42 146)" opacity="0.85" />
      <ellipse cx="178" cy="146" rx="9" ry="19" fill="${colors.shadow}" transform="rotate(-14 178 146)" opacity="0.85" />
    `;
  }

  const anim = isPetted
    ? 'petSquish 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
    : isSleeping
    ? 'sleepBreath 3.5s ease-in-out infinite'
    : 'idleBreathe 2.8s ease-in-out infinite';

  return `
    <svg viewBox="0 0 220 240" class="pet-svg-element" style="filter: drop-shadow(0 14px 22px rgba(45, 48, 61, 0.16)); animation: ${anim};">
      <defs>
        <radialGradient id="bodyGrad" cx="34%" cy="28%" r="72%">
          <stop offset="0%" stop-color="${colors.body}" />
          <stop offset="85%" stop-color="${colors.shadow}" />
        </radialGradient>
      </defs>

      <!-- Sombra de suelo suave -->
      <ellipse cx="110" cy="216" rx="64" ry="15" fill="rgba(45, 48, 61, 0.12)" />

      <!-- Cola esponjosa con balanceo orgánico -->
      <g style="transform-origin: 55px 175px; animation: tailWag 3.2s ease-in-out infinite;">
        <ellipse cx="50" cy="170" rx="26" ry="22" fill="${colors.shadow}" />
        <ellipse cx="48" cy="168" rx="20" ry="17" fill="${colors.body}" />
        <circle cx="36" cy="162" r="7" fill="${colors.belly}" opacity="0.65" />
      </g>

      <!-- Oreja Izquierda con micro-movimiento -->
      <g class="pet-ear-left" style="transform-origin: 75px 85px;">
        <path d="M 65,95 Q 44,44 80,60 Q 95,80 88,105 Z" fill="url(#bodyGrad)" stroke="${colors.shadow}" stroke-width="2.5" />
        <path d="M 68,90 Q 55,56 78,68 Q 88,82 82,98 Z" fill="${colors.earInner}" opacity="0.9" />
      </g>

      <!-- Oreja Derecha con micro-movimiento -->
      <g class="pet-ear-right" style="transform-origin: 145px 85px;">
        <path d="M 155,95 Q 176,44 140,60 Q 125,80 132,105 Z" fill="url(#bodyGrad)" stroke="${colors.shadow}" stroke-width="2.5" />
        <path d="M 152,90 Q 165,56 142,68 Q 132,82 138,98 Z" fill="${colors.earInner}" opacity="0.9" />
      </g>

      <!-- Cuerpo Principal esponjoso -->
      <path d="M 110,65 C 165,65 178,105 178,155 C 178,206 152,216 110,216 C 68,216 42,206 42,155 C 42,105 55,65 110,65 Z"
            fill="url(#bodyGrad)" stroke="${colors.shadow}" stroke-width="3" />

      <!-- Pancita redonda y suave -->
      <ellipse cx="110" cy="163" rx="43" ry="38" fill="${colors.belly}" />

      <!-- Detalles de etapa -->
      ${stageDetails}

      <!-- Manchas si está descuidado -->
      ${dirtySmudges}

      <!-- Mejillas sonrosadas -->
      <ellipse cx="76" cy="138" rx="11.5" ry="7" fill="${colors.blush}" opacity="${isPetted || mood === 'ecstatic' ? '0.95' : '0.7'}" />
      <ellipse cx="144" cy="138" rx="11.5" ry="7" fill="${colors.blush}" opacity="${isPetted || mood === 'ecstatic' ? '0.95' : '0.7'}" />

      <!-- Patitas delanteras -->
      <ellipse cx="88" cy="189" rx="14" ry="11" fill="${colors.shadow}" />
      <ellipse cx="88" cy="187" rx="12" ry="9" fill="${colors.body}" />
      <ellipse cx="132" cy="189" rx="14" ry="11" fill="${colors.shadow}" />
      <ellipse cx="132" cy="187" rx="12" ry="9" fill="${colors.body}" />

      <!-- Ojos y Nariz -->
      ${eyesMarkup}
      <ellipse cx="110" cy="132" rx="4" ry="3" fill="#584C49" />
      ${mouthMarkup}

      <!-- Accesorios y burbujas -->
      ${accessoryMarkup}
      ${bathingBubbles}
    </svg>
  `;
}
