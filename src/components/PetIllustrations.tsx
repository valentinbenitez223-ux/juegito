import React from 'react';
import { PetState, PetMood } from '../domain/types';

interface PetIllustrationsProps {
  pet: PetState;
  mood: PetMood;
  isPettedAnimation?: boolean;
  onPetClick?: () => void;
}

export const PetIllustrations: React.FC<PetIllustrationsProps> = ({
  pet,
  mood,
  isPettedAnimation = false,
  onPetClick,
}) => {
  const isSleeping = pet.isSleeping;
  const isEgg = pet.stage === 'egg';

  // Paletas de color del personaje
  const colorMap = {
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

  const colors = colorMap[pet.colorVariant] || colorMap.pastel_sage;

  if (isEgg) {
    const progress = pet.hatchingProgress || 0;
    return (
      <div
        className="egg-container"
        onClick={onPetClick}
        role="button"
        tabIndex={0}
        aria-label={`Huevo de ${pet.name}. Progreso de eclosión: ${progress} de 3`}
        style={{
          width: '180px',
          height: '210px',
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 200 240"
          width="100%"
          height="100%"
          style={{
            filter: 'drop-shadow(0 10px 18px rgba(78, 118, 100, 0.2))',
            animation: isPettedAnimation
              ? 'eggWobble 0.4s ease'
              : 'gentleFloat 3.2s ease-in-out infinite',
          }}
        >
          {/* Nido de paja y hojas abajo */}
          <ellipse cx="100" cy="210" rx="75" ry="22" fill="#D7C4A5" opacity="0.9" />
          <path
            d="M 30,205 Q 60,225 100,215 Q 150,225 170,205 Q 140,228 100,225 Q 50,226 30,205 Z"
            fill="#B9A482"
          />
          <path
            d="M 45,212 Q 25,200 35,190 Q 55,205 45,212 Z"
            fill="#A9C7B1"
          />
          <path
            d="M 160,210 Q 180,195 170,185 Q 155,205 160,210 Z"
            fill="#A9C7B1"
          />

          {/* Sombra del huevo */}
          <ellipse cx="100" cy="200" rx="46" ry="14" fill="rgba(0,0,0,0.12)" />

          {/* Cuerpo del Huevo */}
          <defs>
            <radialGradient id="eggGrad" cx="38%" cy="32%" r="65%">
              <stop offset="0%" stopColor="#FFFDF7" />
              <stop offset="60%" stopColor="#F5EBD7" />
              <stop offset="100%" stopColor="#E2D0B5" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Forma ovalada de huevo */}
          <path
            d="M 100,25 
               C 142,25 168,75 168,135 
               C 168,178 138,202 100,202 
               C 62,202 32,178 32,135 
               C 32,75 58,25 100,25 Z"
            fill="url(#eggGrad)"
            stroke="#CBB797"
            strokeWidth="3.5"
          />

          {/* Motitas doradas */}
          <circle cx="80" cy="85" r="5" fill="#E8B952" opacity="0.65" />
          <circle cx="125" cy="110" r="6" fill="#E8B952" opacity="0.65" />
          <circle cx="70" cy="140" r="4.5" fill="#E8B952" opacity="0.65" />
          <circle cx="130" cy="155" r="5" fill="#E8B952" opacity="0.65" />
          <circle cx="95" cy="165" r="3.5" fill="#E8B952" opacity="0.65" />

          {/* Grietas de eclosión progresivas */}
          {progress >= 1 && (
            <path
              d="M 98,75 L 108,90 L 96,105 L 112,120"
              stroke="#8B693A"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
            />
          )}

          {progress >= 2 && (
            <path
              d="M 96,105 L 78,118 L 88,132 L 72,148"
              stroke="#8B693A"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
            />
          )}

          {progress >= 3 && (
            <path
              d="M 112,120 L 132,125 L 126,145 L 142,160"
              stroke="#D4A838"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
            />
          )}

          {/* Destellos de vida */}
          <polygon
            points="145,55 148,63 156,66 148,69 145,77 142,69 134,66 142,63"
            fill="#F3D88B"
            opacity="0.85"
            style={{ animation: 'sparkle 2.5s infinite ease-in-out' }}
          />
        </svg>
      </div>
    );
  }

  // Criatura Nacida: Pippo
  return (
    <div
      className={`pet-creature ${mood} ${isSleeping ? 'sleeping' : ''}`}
      onClick={onPetClick}
      role="button"
      tabIndex={0}
      aria-label={`${pet.name}, estado: ${mood}`}
      style={{
        width: '210px',
        height: '230px',
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 220 240"
        width="100%"
        height="100%"
        style={{
          filter: 'drop-shadow(0 12px 20px rgba(52, 55, 70, 0.15))',
          animation: isPettedAnimation
            ? 'petSquish 0.35s ease-out'
            : isSleeping
            ? 'sleepBreath 3.5s ease-in-out infinite'
            : 'idleBreathe 2.8s ease-in-out infinite',
        }}
      >
        <defs>
          <radialGradient id="bodyGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={colors.body} />
            <stop offset="85%" stopColor={colors.shadow} />
          </radialGradient>
          <filter id="softShadow">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Sombra de suelo */}
        <ellipse cx="110" cy="215" rx="60" ry="14" fill="rgba(0,0,0,0.12)" />

        {/* Cola esponjosa */}
        <g style={{ transformOrigin: '55px 175px', animation: 'tailWag 3.2s ease-in-out infinite' }}>
          <ellipse cx="50" cy="170" rx="26" ry="22" fill={colors.shadow} />
          <ellipse cx="48" cy="168" rx="20" ry="17" fill={colors.body} />
          <circle cx="36" cy="162" r="7" fill={colors.belly} opacity="0.6" />
        </g>

        {/* Orejitas */}
        {/* Oreja Izquierda */}
        <path
          d="M 65,95 Q 45,45 80,60 Q 95,80 88,105 Z"
          fill="url(#bodyGrad)"
          stroke={colors.shadow}
          strokeWidth="2.5"
        />
        <path
          d="M 68,90 Q 56,58 78,68 Q 88,82 82,98 Z"
          fill={colors.earInner}
          opacity="0.85"
        />

        {/* Oreja Derecha */}
        <path
          d="M 155,95 Q 175,45 140,60 Q 125,80 132,105 Z"
          fill="url(#bodyGrad)"
          stroke={colors.shadow}
          strokeWidth="2.5"
        />
        <path
          d="M 152,90 Q 164,58 142,68 Q 132,82 138,98 Z"
          fill={colors.earInner}
          opacity="0.85"
        />

        {/* Cuerpo Principal redondeado y esponjoso */}
        <path
          d="M 110,65 
             C 165,65 178,105 178,155 
             C 178,205 152,215 110,215 
             C 68,215 42,205 42,155 
             C 42,105 55,65 110,65 Z"
          fill="url(#bodyGrad)"
          stroke={colors.shadow}
          strokeWidth="3"
        />

        {/* Pancita suave */}
        <ellipse cx="110" cy="162" rx="42" ry="38" fill={colors.belly} />

        {/* Mejillas sonrosadas */}
        <ellipse
          cx="76"
          cy="138"
          rx="11"
          ry="7"
          fill="#F9A8A8"
          opacity={isPettedAnimation ? '0.95' : '0.65'}
        />
        <ellipse
          cx="144"
          cy="138"
          rx="11"
          ry="7"
          fill="#F9A8A8"
          opacity={isPettedAnimation ? '0.95' : '0.65'}
        />

        {/* Patitas delanteras */}
        <ellipse cx="88" cy="188" rx="14" ry="11" fill={colors.shadow} />
        <ellipse cx="88" cy="186" rx="12" ry="9" fill={colors.body} />

        <ellipse cx="132" cy="188" rx="14" ry="11" fill={colors.shadow} />
        <ellipse cx="132" cy="186" rx="12" ry="9" fill={colors.body} />

        {/* Ojitos y Mirada */}
        {isSleeping ? (
          /* Ojos cerrados durmiendo con curvita feliz */
          <g stroke="#343746" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 76,124 Q 88,132 100,124" />
            <path d="M 120,124 Q 132,132 144,124" />
          </g>
        ) : isPettedAnimation || mood === 'happy' ? (
          /* Ojos de pura felicidad (arcos invertidos ^ ^) */
          <g stroke="#343746" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M 76,126 Q 88,114 100,126" />
            <path d="M 120,126 Q 132,114 144,126" />
          </g>
        ) : (
          /* Ojos abiertos con doble brillo dulce */
          <g>
            <ellipse cx="88" cy="122" rx="10" ry="12" fill="#343746" />
            <circle cx="85" cy="118" r="4" fill="#FFFFFF" />
            <circle cx="91" cy="126" r="2" fill="#FFFFFF" />

            <ellipse cx="132" cy="122" rx="10" ry="12" fill="#343746" />
            <circle cx="129" cy="118" r="4" fill="#FFFFFF" />
            <circle cx="135" cy="126" r="2" fill="#FFFFFF" />
          </g>
        )}

        {/* Naricita y Boquita */}
        <ellipse cx="110" cy="132" rx="4" ry="3" fill="#6A5A55" />
        {mood === 'eating' ? (
          <ellipse cx="110" cy="142" rx="6" ry="5" fill="#343746" />
        ) : isSleeping ? (
          <path
            d="M 106,138 Q 110,141 114,138"
            stroke="#343746"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M 103,138 Q 107,144 110,140 Q 113,144 117,138"
            stroke="#343746"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Accesorios equipados */}
        {pet.accessory === 'sombrerito_hoja' && (
          <g style={{ transformOrigin: '110px 65px', transform: 'rotate(-8deg)' }}>
            <path
              d="M 110,65 Q 80,30 115,20 Q 145,28 120,65 Z"
              fill="#74A767"
              stroke="#4E7664"
              strokeWidth="2"
            />
            <path d="M 110,65 Q 115,40 115,20" stroke="#4E7664" strokeWidth="1.5" fill="none" />
            <circle cx="112" cy="35" r="3" fill="#D7EDD6" opacity="0.8" />
          </g>
        )}

        {pet.accessory === 'mono_rosa' && (
          <g transform="translate(132, 70)">
            <path d="M 0,0 L 15,-8 L 15,8 Z" fill="#EFB7B5" stroke="#D89492" strokeWidth="1.5" />
            <path d="M 0,0 L -15,-8 L -15,8 Z" fill="#EFB7B5" stroke="#D89492" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="4.5" fill="#D89492" />
          </g>
        )}

        {pet.accessory === 'bufanda_lana' && (
          <g>
            <path
              d="M 72,158 Q 110,172 148,158 Q 152,168 140,174 Q 110,182 80,174 Z"
              fill="#D47B78"
              stroke="#A84C49"
              strokeWidth="2"
            />
            {/* Punta de la bufanda colgante */}
            <path
              d="M 125,170 L 138,202 L 122,202 L 115,174 Z"
              fill="#D47B78"
              stroke="#A84C49"
              strokeWidth="2"
            />
          </g>
        )}

        {pet.accessory === 'corona_flores' && (
          <g transform="translate(110, 68)">
            <ellipse cx="0" cy="0" rx="35" ry="6" fill="none" stroke="#78A383" strokeWidth="2.5" />
            <circle cx="-24" cy="-2" r="6" fill="#FFFDF9" stroke="#E1BC5B" strokeWidth="1.5" />
            <circle cx="-8" cy="-5" r="7" fill="#F3D88B" stroke="#D4A838" strokeWidth="1.5" />
            <circle cx="10" cy="-5" r="6.5" fill="#EFB7B5" stroke="#D89492" strokeWidth="1.5" />
            <circle cx="26" cy="-2" r="6" fill="#FFFDF9" stroke="#E1BC5B" strokeWidth="1.5" />
          </g>
        )}

        {/* Burbujitas si se está bañando */}
        {mood === 'bathing' && (
          <g>
            <circle cx="60" cy="90" r="8" fill="#B9D5E8" opacity="0.75" />
            <circle cx="150" cy="80" r="11" fill="#B9D5E8" opacity="0.75" />
            <circle cx="170" cy="140" r="7" fill="#B9D5E8" opacity="0.75" />
            <circle cx="45" cy="130" r="9" fill="#B9D5E8" opacity="0.75" />
          </g>
        )}
      </svg>

      {/* Animaciones CSS flotantes */}
      <style>{`
        @keyframes idleBreathe {
          0%, 100% { transform: translateY(0) scale(1, 1); }
          50% { transform: translateY(-4px) scale(1.02, 0.98); }
        }
        @keyframes sleepBreath {
          0%, 100% { transform: translateY(0) scale(1, 0.98); }
          50% { transform: translateY(3px) scale(1.03, 0.95); }
        }
        @keyframes petSquish {
          0% { transform: scale(1, 1); }
          40% { transform: scale(1.08, 0.91); }
          80% { transform: scale(0.96, 1.04); }
          100% { transform: scale(1, 1); }
        }
        @keyframes eggWobble {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-7deg) scale(1.03); }
          50% { transform: rotate(7deg) scale(1.03); }
          75% { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes tailWag {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
