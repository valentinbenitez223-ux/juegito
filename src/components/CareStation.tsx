import React, { useState } from 'react';
import { SpaceState, ActionType } from '../domain/types';
import { FOOD_CATALOG } from '../domain/constants';
import { sound } from '../services/sound';
import { Utensils, Heart, Sparkles, Moon, Sun, Gamepad2, ShoppingBag } from 'lucide-react';

interface CareStationProps {
  space: SpaceState;
  onPerformCare: (action: ActionType, foodId?: string) => Promise<void>;
  onOpenShop: () => void;
  onOpenGames: () => void;
}

export const CareStation: React.FC<CareStationProps> = ({
  space,
  onPerformCare,
  onOpenShop,
  onOpenGames,
}) => {
  const [selectedFood, setSelectedFood] = useState<string>('manzana_dulce');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const pet = space.pet;
  const isSleeping = pet.isSleeping;
  const inventoryFoods = space.inventory.foods;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAction = async (action: ActionType, foodId?: string) => {
    if (isBusy) return;
    setIsBusy(true);

    try {
      if (action === 'feed') {
        sound.playNibble();
      } else if (action === 'pet') {
        sound.playPurr();
      } else if (action === 'clean') {
        sound.playBubble();
      } else if (action === 'sleep') {
        sound.playLullaby();
      } else {
        sound.playChime();
      }

      await onPerformCare(action, foodId);

      if (action === 'feed') showFeedback(`¡A ${pet.name} le encantó la comidita! (+5 Luceros)`);
      else if (action === 'pet') showFeedback(`¡${pet.name} ronronea feliz con tus mimos! (+3 Luceros)`);
      else if (action === 'clean') showFeedback(`¡Bañito tibio completado, quedó reluciente! (+5 Luceros)`);
      else if (action === 'sleep') showFeedback(`¡Arropaste a ${pet.name}! Dulces sueños... (+5 Luceros)`);
      else if (action === 'wake') showFeedback(`¡Buenos días, ${pet.name}! Despertó con energía.`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        showFeedback(err.message);
      } else {
        showFeedback('No se pudo realizar la acción.');
      }
    } finally {
      setIsBusy(false);
    }
  };

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
      {/* Toast de retroalimentación suave */}
      {feedback && (
        <div
          style={{
            backgroundColor: 'var(--color-sage-deep)',
            color: '#FFFFFF',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 500,
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 200ms ease',
          }}
        >
          {feedback}
        </div>
      )}

      {/* Botonera de acciones principales */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}
      >
        {/* Acariciar */}
        <button
          onClick={() => handleAction('pet')}
          disabled={isBusy || isSleeping}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 4px',
            backgroundColor: 'var(--surface-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            gap: '4px',
            minWidth: 0,
            opacity: isSleeping ? 0.5 : 1,
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#EFB7B535',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={20} color="#D87875" fill="#EFB7B5" />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
            Acariciar
          </span>
          <span style={{ fontSize: '9.5px', color: 'var(--color-sage-deep)', fontWeight: 600 }}>
            +3 Luceros
          </span>
        </button>

        {/* Bañar */}
        <button
          onClick={() => handleAction('clean')}
          disabled={isBusy || isSleeping}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 4px',
            backgroundColor: 'var(--surface-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            gap: '4px',
            minWidth: 0,
            opacity: isSleeping ? 0.5 : 1,
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#B9D5E840',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} color="#4A88BA" />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
            Bañar
          </span>
          <span style={{ fontSize: '9.5px', color: 'var(--color-sage-deep)', fontWeight: 600 }}>
            +5 Luceros
          </span>
        </button>

        {/* Jugar / Minijuegos */}
        <button
          onClick={onOpenGames}
          disabled={isBusy || isSleeping}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 4px',
            backgroundColor: 'var(--surface-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            gap: '4px',
            minWidth: 0,
            opacity: isSleeping ? 0.5 : 1,
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#F3D88B45',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Gamepad2 size={20} color="#C49B24" />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
            Juegos
          </span>
          <span style={{ fontSize: '9.5px', color: 'var(--color-sage-deep)', fontWeight: 600 }}>
            Minijuegos
          </span>
        </button>

        {/* Dormir o Despertar */}
        <button
          onClick={() => handleAction(isSleeping ? 'wake' : 'sleep')}
          disabled={isBusy}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 4px',
            backgroundColor: isSleeping ? '#2E3754' : 'var(--surface-white)',
            color: isSleeping ? '#FFFFFF' : 'var(--text-main)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            gap: '4px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: isSleeping ? '#44517A' : '#C8B9E835',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isSleeping ? (
              <Sun size={20} color="#F3D88B" />
            ) : (
              <Moon size={20} color="#7F6EA6" />
            )}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700 }}>
            {isSleeping ? 'Despertar' : 'Arropar'}
          </span>
          <span
            style={{
              fontSize: '9.5px',
              color: isSleeping ? '#F3D88B' : 'var(--color-sage-deep)',
              fontWeight: 600,
            }}
          >
            {isSleeping ? 'Listo' : '+12/h'}
          </span>
        </button>
      </div>

      {/* Alacena de Alimentos */}
      <div
        style={{
          backgroundColor: 'var(--surface-white)',
          padding: '12px',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Utensils size={16} color="var(--color-sage-deep)" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Alacena de Comidas
            </h3>
          </div>
          <button
            onClick={onOpenShop}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--color-sage-deep)',
              fontWeight: 600,
            }}
          >
            <ShoppingBag size={13} />
            Despensa
          </button>
        </div>

        {/* Lista de comidas en inventario */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
          {Object.entries(FOOD_CATALOG).map(([id, food]) => {
            const stock = inventoryFoods[id] || 0;
            const isSelected = selectedFood === id;
            return (
              <div
                key={id}
                onClick={() => setSelectedFood(id)}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(169, 199, 177, 0.18)' : 'var(--surface-subtle)',
                  border: isSelected
                    ? '2px solid var(--color-sage-deep)'
                    : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  position: 'relative',
                  minWidth: 0,
                }}
              >
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{food.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {food.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    +{food.hungerGain}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: stock > 0 ? 'var(--color-sage)' : '#EFB7B5',
                    color: '#FFFFFF',
                    padding: '1px 5px',
                    borderRadius: '8px',
                    flexShrink: 0,
                  }}
                >
                  x{stock}
                </span>
              </div>
            );
          })}
        </div>

        {/* Botón grande para dar de comer */}
        <button
          onClick={() => handleAction('feed', selectedFood)}
          disabled={isBusy || isSleeping || (inventoryFoods[selectedFood] || 0) <= 0}
          style={{
            width: '100%',
            marginTop: '14px',
            padding: '12px',
            backgroundColor:
              (inventoryFoods[selectedFood] || 0) > 0 && !isSleeping
                ? 'var(--color-sage-deep)'
                : '#B2B7BE',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Utensils size={16} />
          {isSleeping
            ? `${pet.name} está durmiendo`
            : (inventoryFoods[selectedFood] || 0) > 0
            ? `Alimentar con ${FOOD_CATALOG[selectedFood]?.name || 'comida'}`
            : 'Sin porciones (Comprar en despensa)'}
        </button>
      </div>
    </div>
  );
};
