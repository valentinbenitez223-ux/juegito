import React, { useState, useEffect } from 'react';
import { SpaceState, PetMood } from '../domain/types';
import { PetIllustrations } from './PetIllustrations';
import { sound } from '../services/sound';
import { Heart, Sparkles } from 'lucide-react';

interface PetDioramaProps {
  space: SpaceState;
  mood: PetMood;
  onPetTouch: () => void;
  onFeedDirect?: () => void;
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  type: 'heart' | 'zzz' | 'sparkle';
}

export const PetDiorama: React.FC<PetDioramaProps> = ({
  space,
  mood,
  onPetTouch,
}) => {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [isPettedAnimation, setIsPettedAnimation] = useState(false);
  const [petThought, setPetThought] = useState<string>('');

  const pet = space.pet;
  const isSleeping = pet.isSleeping;
  const decor = space.inventory.activeDecor;

  // Frases de pensamiento según el estado
  useEffect(() => {
    if (isSleeping) {
      setPetThought('Zzz... qué calentito está el nido...');
    } else if (pet.stage === 'egg') {
      const prog = pet.hatchingProgress || 0;
      if (prog === 0) setPetThought('Se siente un suave latido dentro...');
      else if (prog === 1) setPetThought('¡Se escuchó un crujidito tierno!');
      else if (prog === 2) setPetThought('¡Se está asomando una patita!');
      else setPetThought('¡Ya casi rompe el cascarón!');
    } else {
      switch (mood) {
        case 'hungry':
          setPetThought('Tengo un poquito de hambre... ¿habrá una manzanita?');
          break;
        case 'dirty':
          setPetThought('Un bañito tibio con burbujas me vendría genial...');
          break;
        case 'sleepy':
          setPetThought('Bostezo... se me cierran los ojitos...');
          break;
        case 'bored':
          setPetThought('¿Jugamos a algo juntos?');
          break;
        case 'happy':
          setPetThought('¡Qué lindo estar acá con ustedes!');
          break;
        case 'eating':
          setPetThought('¡Mmm, qué manjar!');
          break;
        case 'bathing':
          setPetThought('¡Plaf plaf, me encantan las burbujas!');
          break;
        default:
          setPetThought('Mirando por la ventana...');
      }
    }
  }, [isSleeping, pet.stage, pet.hatchingProgress, mood]);

  const handlePetClick = (e?: React.MouseEvent) => {
    let x = 110;
    let y = 100;
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    sound.playPurr();
    setIsPettedAnimation(true);
    setTimeout(() => setIsPettedAnimation(false), 450);

    // Agregar partícula flotante de corazón
    const newId = Date.now() + Math.random();
    setParticles((prev) => [
      ...prev,
      { id: newId, x: x || 110, y: y || 100, type: isSleeping ? 'zzz' : 'heart' },
    ]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newId));
    }, 1200);

    onPetTouch();
  };

  return (
    <div
      className={`diorama-stage ${isSleeping ? 'is-night' : 'is-day'}`}
      style={{
        width: '100%',
        maxWidth: '460px',
        height: '380px',
        margin: '0 auto',
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        background: isSleeping
          ? 'linear-gradient(180deg, #1F2438 0%, #2E3754 55%, #3D4868 100%)'
          : 'linear-gradient(180deg, #E6F0FA 0%, #F5F1E8 60%, #EFE8DA 100%)',
        boxShadow: 'var(--shadow-md)',
        transition: 'background 600ms ease',
        border: '1.5px solid var(--border-subtle)',
      }}
    >
      {/* Ventana de fondo con cielo y nubes o estrellas */}
      <div
        className="diorama-window"
        style={{
          position: 'absolute',
          top: '25px',
          left: '30px',
          width: '85px',
          height: '110px',
          borderRadius: '45px 45px 6px 6px',
          backgroundColor: isSleeping ? '#131828' : '#D1E6F7',
          border: '4px solid #FFFDF9',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {isSleeping ? (
          /* Luna creciente y estrellitas */
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                boxShadow: '-6px 4px 0 2px #F7E9B8',
              }}
            />
            <span style={{ position: 'absolute', top: '20px', left: '15px', fontSize: '10px', color: '#FFF' }}>✦</span>
            <span style={{ position: 'absolute', bottom: '25px', right: '20px', fontSize: '8px', color: '#F3D88B' }}>✧</span>
          </div>
        ) : (
          /* Sol y nubecita de día */
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: '#F7DF94',
                boxShadow: '0 0 12px #F7DF94',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '10px',
                width: '45px',
                height: '18px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                opacity: 0.85,
                animation: 'cloudFloat 12s infinite linear',
              }}
            />
          </div>
        )}
      </div>

      {/* Cuadro de pared (Decoración opcional) */}
      {decor.wallArt === 'cuadro_estrellas' && (
        <div
          style={{
            position: 'absolute',
            top: '30px',
            right: '35px',
            width: '65px',
            height: '75px',
            borderRadius: '8px',
            backgroundColor: '#262D42',
            border: '3px solid #E8D4B0',
            boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: '24px' }}>🌌</span>
        </div>
      )}

      {/* Suelo de madera cálida */}
      <div
        className="diorama-floor"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '115px',
          background: isSleeping
            ? 'linear-gradient(180deg, #322B38 0%, #241E2B 100%)'
            : 'linear-gradient(180deg, #E2D3BE 0%, #CEBC9F 100%)',
          borderTop: '2px solid rgba(0,0,0,0.06)',
          zIndex: 2,
        }}
      >
        {/* Tablones sutiles */}
        <div
          style={{
            width: '100%',
            height: '100%',
            opacity: 0.15,
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent, transparent 48px, #826E54 48px, #826E54 50px)',
          }}
        />
      </div>

      {/* Alfombra equipada */}
      {decor.rug && (
        <div
          style={{
            position: 'absolute',
            bottom: '25px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '210px',
            height: '65px',
            borderRadius: decor.rug === 'alfombra_margarita' ? '50%' : '35px',
            backgroundColor: decor.rug === 'alfombra_margarita' ? '#FFFDF7' : '#EFB7B5',
            border: decor.rug === 'alfombra_margarita' ? '4px solid #F3D88B' : '3px dashed #D69795',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {decor.rug === 'alfombra_margarita' && (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#F3D88B',
              }}
            />
          )}
        </div>
      )}

      {/* Planta Monstera (Decoración) */}
      {decor.plant && (
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '20px',
            zIndex: 4,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))',
            animation: 'plantSway 4.5s ease-in-out infinite',
            transformOrigin: 'bottom center',
          }}
        >
          <span style={{ fontSize: '48px', lineHeight: 1 }}>🪴</span>
        </div>
      )}

      {/* Lámpara Hongo / Guirnalda (Decoración) */}
      {decor.lamp && (
        <div
          style={{
            position: 'absolute',
            bottom: '75px',
            right: '25px',
            zIndex: 4,
            filter: isSleeping
              ? 'drop-shadow(0 0 16px rgba(243, 216, 139, 0.8))'
              : 'drop-shadow(0 2px 5px rgba(0,0,0,0.1))',
            animation: 'lampGlow 3s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: '42px', lineHeight: 1 }}>
            {decor.lamp === 'guirnalda_luces' ? '✨' : '🍄'}
          </span>
        </div>
      )}

      {/* Juguete / Peluche */}
      {decor.toy && (
        <div
          style={{
            position: 'absolute',
            bottom: '45px',
            right: '90px',
            zIndex: 4,
          }}
        >
          <span style={{ fontSize: '28px' }}>☁️</span>
        </div>
      )}

      {/* Plato de comida */}
      <div
        style={{
          position: 'absolute',
          bottom: '35px',
          left: '95px',
          width: '36px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#FFFDF9',
          border: '2px solid #E2D0B5',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
        }}
      >
        <span style={{ fontSize: '13px', marginTop: '-6px' }}>
          {mood === 'eating' ? '🍎' : '🥣'}
        </span>
      </div>

      {/* LA MASCOTA / HUEVO (Centro del diorama) */}
      <div
        style={{
          position: 'absolute',
          bottom: '38px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
        }}
      >
        <PetIllustrations
          pet={pet}
          mood={mood}
          isPettedAnimation={isPettedAnimation}
          onPetClick={handlePetClick}
        />
      </div>

      {/* Partículas flotantes de caricia / Zzz */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}px`,
            top: `${p.y}px`,
            pointerEvents: 'none',
            zIndex: 10,
            animation: 'floatUpAndFade 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
          }}
        >
          {p.type === 'heart' ? (
            <Heart size={24} fill="#EFB7B5" color="#D87875" />
          ) : (
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#C8B9E8',
                fontFamily: 'monospace',
              }}
            >
              Zzz
            </span>
          )}
        </div>
      ))}

      {/* Globo de pensamiento / mensaje cálido de la mascota */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 252, 247, 0.95)',
          backdropFilter: 'blur(6px)',
          padding: '6px 14px',
          borderRadius: '16px',
          boxShadow: '0 3px 12px rgba(52, 55, 70, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          maxWidth: '85%',
          zIndex: 8,
          border: '1px solid rgba(78, 118, 100, 0.15)',
        }}
      >
        <Sparkles size={14} color="#D4A838" />
        <span
          style={{
            fontSize: '13px',
            color: '#343746',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {petThought}
        </span>
      </div>

      <style>{`
        @keyframes floatUpAndFade {
          0% { opacity: 1; transform: translateY(0) scale(0.8); }
          100% { opacity: 0; transform: translateY(-45px) scale(1.3); }
        }
        @keyframes plantSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2.5deg); }
        }
        @keyframes lampGlow {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        @keyframes cloudFloat {
          0% { transform: translateX(-15px); }
          100% { transform: translateX(55px); }
        }
      `}</style>
    </div>
  );
};
