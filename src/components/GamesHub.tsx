import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';
import { Sparkles, RefreshCw, Trophy, ArrowLeft, Gamepad2 } from 'lucide-react';

interface GamesHubProps {
  onRecordGameResult: (gameName: string, score: number, lucerosEarned: number) => Promise<void>;
  onBackToNest: () => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ onRecordGameResult, onBackToNest }) => {
  const [selectedGame, setSelectedGame] = useState<'menu' | 'fireflies' | 'memory'>('menu');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto',
      }}
    >
      {selectedGame === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              backgroundColor: 'var(--surface-white)',
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Gamepad2 size={22} color="var(--color-sage-deep)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                Rincón de Juegos
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Jugá para divertir a la criatura y conseguir Luceros para decorar el hogar compartido.
            </p>
          </div>

          {/* Tarjeta Juego 1: Atrapa Luciérnagas */}
          <div
            onClick={() => {
              sound.playTap();
              setSelectedGame('fireflies');
            }}
            style={{
              backgroundColor: '#1E2538',
              color: '#FFFFFF',
              padding: '18px',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)',
              border: '1.5px solid #364263',
              transition: 'transform 200ms ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(243, 216, 139, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  boxShadow: '0 0 16px rgba(243, 216, 139, 0.4)',
                }}
              >
                ✨
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>Noche de Luciérnagas</span>
                <span style={{ fontSize: '12px', color: '#B9D5E8' }}>
                  Atrapá destellos en el jardín nocturno (Reflejos)
                </span>
                <span style={{ fontSize: '11px', color: '#F3D88B', marginTop: '4px', fontWeight: 600 }}>
                  Recompensa: hasta +25 Luceros
                </span>
              </div>
            </div>
            <span style={{ fontSize: '20px', color: '#F3D88B' }}>➔</span>
          </div>

          {/* Tarjeta Juego 2: Memoria del Nido */}
          <div
            onClick={() => {
              sound.playTap();
              setSelectedGame('memory');
            }}
            style={{
              backgroundColor: 'var(--surface-white)',
              padding: '18px',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(169, 199, 177, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}
              >
                🧩
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Memoria del Nido
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Emparejá los objetos del hogar (Memoria)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-sage-deep)', marginTop: '4px', fontWeight: 600 }}>
                  Recompensa: +30 Luceros al completar
                </span>
              </div>
            </div>
            <span style={{ fontSize: '20px', color: 'var(--color-sage-deep)' }}>➔</span>
          </div>
        </div>
      )}

      {selectedGame === 'fireflies' && (
        <FirefliesMiniGame
          onFinish={async (score, luceros) => {
            await onRecordGameResult('Noche de Luciérnagas', score, luceros);
          }}
          onBack={() => setSelectedGame('menu')}
        />
      )}

      {selectedGame === 'memory' && (
        <MemoryMiniGame
          onFinish={async (score, luceros) => {
            await onRecordGameResult('Memoria del Nido', score, luceros);
          }}
          onBack={() => setSelectedGame('menu')}
        />
      )}
    </div>
  );
};

// ==========================================
// 1. MINIJUEGO: NOCHE DE LUCIÉRNAGAS
// ==========================================
interface Firefly {
  id: number;
  x: number;
  y: number;
  size: number;
}

const FirefliesMiniGame: React.FC<{
  onFinish: (score: number, luceros: number) => Promise<void>;
  onBack: () => void;
}> = ({ onFinish, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [caught, setCaught] = useState(0);
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    sound.playTap();
    setIsPlaying(true);
    setGameOver(false);
    setTimeLeft(25);
    setCaught(0);
    spawnFireflies();
  };

  const spawnFireflies = () => {
    const list: Firefly[] = [];
    for (let i = 0; i < 5; i++) {
      list.push({
        id: Math.random(),
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 70) + 15,
        size: Math.floor(Math.random() * 8) + 14,
      });
    }
    setFireflies(list);
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((t) => t - 1);
        // Mover aleatoriamente algunas luciérnagas
        setFireflies((prev) =>
          prev.map((f) => ({
            ...f,
            x: Math.min(90, Math.max(10, f.x + (Math.random() * 20 - 10))),
            y: Math.min(85, Math.max(15, f.y + (Math.random() * 20 - 10))),
          }))
        );
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      setGameOver(true);
      const lucerosEarned = Math.min(25, Math.max(10, Math.round(caught * 1.5)));
      sound.playChime();
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch {}
      onFinish(caught, lucerosEarned);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeLeft, caught]);

  const handleCatch = (id: number) => {
    sound.playBubble();
    setCaught((c) => c + 1);
    setFireflies((prev) => [
      ...prev.filter((f) => f.id !== id),
      {
        id: Math.random(),
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 70) + 15,
        size: Math.floor(Math.random() * 8) + 14,
      },
    ]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#161C2C',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        color: '#FFFFFF',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#B9D5E8',
            fontSize: '13px',
          }}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <span style={{ fontSize: '15px', fontWeight: 700 }}>Noche de Luciérnagas</span>
        <div style={{ width: '40px' }} />
      </div>

      {!isPlaying && !gameOver && (
        <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '42px' }}>✨</span>
          <p style={{ fontSize: '14px', color: '#D1E6F7' }}>
            Tocá todas las luciérnagas brillantes que puedas antes de que se acabe el tiempo (25 segundos).
          </p>
          <button
            onClick={startGame}
            style={{
              padding: '12px 28px',
              backgroundColor: '#F3D88B',
              color: '#343746',
              fontWeight: 700,
              fontSize: '15px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 0 16px rgba(243, 216, 139, 0.4)',
            }}
          >
            ¡Empezar a atrapar!
          </button>
        </div>
      )}

      {isPlaying && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px', fontWeight: 700 }}>
            <span style={{ color: '#F3D88B' }}>⏱️ Tiempo: {timeLeft}s</span>
            <span style={{ color: '#A9C7B1' }}>✨ Atrapadas: {caught}</span>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '300px',
              backgroundColor: '#0E1320',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1.5px solid #28334E',
            }}
          >
            {fireflies.map((f) => (
              <div
                key={f.id}
                onClick={() => handleCatch(f.id)}
                style={{
                  position: 'absolute',
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  width: `${f.size * 2}px`,
                  height: `${f.size * 2}px`,
                  borderRadius: '50%',
                  backgroundColor: '#F9E59A',
                  boxShadow: `0 0 ${f.size * 1.5}px #F9E59A, 0 0 ${f.size * 3}px rgba(249, 229, 154, 0.5)`,
                  cursor: 'pointer',
                  transform: 'translate(-50%, -50%)',
                  transition: 'left 800ms ease, top 800ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
              </div>
            ))}
          </div>
        </>
      )}

      {gameOver && (
        <div style={{ textAlign: 'center', padding: '24px 10px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <Trophy size={42} color="#F3D88B" />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>¡Tiempo terminado!</h3>
          <p style={{ fontSize: '14px', color: '#D1E6F7' }}>
            Atrapaste <strong style={{ color: '#F3D88B' }}>{caught} luciérnagas</strong> en el frasquito.
          </p>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#A9C7B1' }}>
            +{Math.min(25, Math.max(10, Math.round(caught * 1.5)))} Luceros conseguidos ✨
          </span>
          <button
            onClick={startGame}
            style={{
              marginTop: '10px',
              padding: '10px 24px',
              backgroundColor: '#F3D88B',
              color: '#343746',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={16} /> Jugar otra vez
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. MINIJUEGO: MEMORIA DEL NIDO
// ==========================================
interface MemoryCard {
  id: number;
  icon: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryMiniGame: React.FC<{
  onFinish: (score: number, luceros: number) => Promise<void>;
  onBack: () => void;
}> = ({ onFinish, onBack }) => {
  const cardItems = [
    { icon: '🍎', name: 'Manzanita' },
    { icon: '🍄', name: 'Lámpara hongo' },
    { icon: '🪴', name: 'Monstera' },
    { icon: '☁️', name: 'Nube suave' },
    { icon: '🥚', name: 'Huevo' },
    { icon: '✨', name: 'Lucero' },
  ];

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initGame = () => {
    const deck: MemoryCard[] = [];
    const duplicated = [...cardItems, ...cardItems];
    // Mezcla de Fisher-Yates
    for (let i = duplicated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]];
    }

    duplicated.forEach((item, idx) => {
      deck.push({
        id: idx,
        icon: item.icon,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    sound.playTap();
    const newFlipped = [...flippedIndices, index];
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, isFlipped: true } : c))
    );
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].icon === cards[secondIdx].icon) {
        sound.playChime();
        setTimeout(() => {
          setCards((prev) => {
            const updated = prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            );
            if (updated.every((c) => c.isMatched)) {
              setIsWon(true);
              try {
                confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
              } catch {}
              onFinish(moves + 1, 30);
            }
            return updated;
          });
          setFlippedIndices([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--surface-white)',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--color-sage-deep)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
          Memoria del Nido
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Intentos: {moves}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          margin: '10px 0',
        }}
      >
        {cards.map((card, idx) => {
          const showFace = card.isFlipped || card.isMatched;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              style={{
                aspectRatio: '1/1',
                borderRadius: 'var(--radius-md)',
                backgroundColor: showFace
                  ? card.isMatched
                    ? 'rgba(169, 199, 177, 0.3)'
                    : 'var(--surface-white)'
                  : 'var(--color-sage-deep)',
                border: showFace ? '2px solid var(--color-sage)' : '2px solid #3F6152',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                cursor: 'pointer',
                transform: showFace ? 'rotateY(0deg)' : 'rotateY(180deg)',
                transition: 'transform 300ms ease, background-color 300ms ease',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {showFace ? card.icon : '🌱'}
            </div>
          );
        })}
      </div>

      {isWon && (
        <div
          style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: 'rgba(169, 199, 177, 0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <Sparkles size={32} color="var(--color-sage-deep)" />
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
            ¡Completaste el tablero en {moves} intentos!
          </h4>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-sage-deep)' }}>
            +30 Luceros ganados ✨
          </span>
          <button
            onClick={initGame}
            style={{
              marginTop: '6px',
              padding: '8px 18px',
              backgroundColor: 'var(--color-sage-deep)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} /> Jugar otra partida
          </button>
        </div>
      )}
    </div>
  );
};
