import React, { useState } from 'react';
import { SpaceState, SpaceDecor } from '../domain/types';
import { FOOD_CATALOG, DECOR_CATALOG, ACCESSORY_CATALOG } from '../domain/constants';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';
import { Sparkles, Home, ShoppingCart, Check, Tag } from 'lucide-react';

interface HomeShopProps {
  space: SpaceState;
  onBuyItem: (type: 'food' | 'decor' | 'accessory', itemId: string) => Promise<void>;
  onEquipDecor: (slot: keyof SpaceDecor, decorId?: string) => Promise<void>;
  onEquipAccessory: (accessoryId?: string) => Promise<void>;
}

export const HomeShop: React.FC<HomeShopProps> = ({
  space,
  onBuyItem,
  onEquipDecor,
  onEquipAccessory,
}) => {
  const [activeTab, setActiveTab] = useState<'decor' | 'wardrobe' | 'shop'>('decor');
  const [shopCategory, setShopCategory] = useState<'all' | 'food' | 'decor' | 'accessory'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const luceros = space.economy.luceros;
  const inventory = space.inventory;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleBuy = async (type: 'food' | 'decor' | 'accessory', id: string, name: string) => {
    if (isBusy) return;
    setIsBusy(true);
    sound.playTap();

    try {
      await onBuyItem(type, id);
      sound.playChime();
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      } catch {}
      showFeedback(`¡Compraste "${name}" para el nido!`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        showFeedback(err.message);
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
        gap: '14px',
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto',
      }}
    >
      {/* Toast */}
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
          }}
        >
          {feedback}
        </div>
      )}

      {/* Pestañas: Decorar / Armario / Tienda */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--surface-white)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('decor');
          }}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'decor' ? 'var(--color-sage)' : 'transparent',
            color: activeTab === 'decor' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Home size={16} />
          Habitación
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('wardrobe');
          }}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'wardrobe' ? 'var(--color-sage)' : 'transparent',
            color: activeTab === 'wardrobe' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Tag size={16} />
          Accesorios
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('shop');
          }}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'shop' ? 'var(--color-sage)' : 'transparent',
            color: activeTab === 'shop' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShoppingCart size={16} />
          Despensa
        </button>
      </div>

      {/* PESTAÑA 1: DECORACIÓN DE LA HABITACIÓN */}
      {activeTab === 'decor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              backgroundColor: 'var(--surface-white)',
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Muebles y adornos del Nido
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Tocá cualquier objeto desbloqueado para colocarlo o quitarlo de la habitación compartida.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {Object.values(DECOR_CATALOG).map((item) => {
              const isUnlocked = inventory.unlockedDecor.includes(item.id);
              const isEquipped = inventory.activeDecor[item.slot] === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playTap();
                      onEquipDecor(item.slot, isEquipped ? undefined : item.id);
                    }
                  }}
                  style={{
                    backgroundColor: 'var(--surface-white)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: isEquipped
                      ? '2.5px solid var(--color-sage-deep)'
                      : isUnlocked
                      ? '1px solid var(--border-subtle)'
                      : '1px dashed #D0D4DC',
                    opacity: isUnlocked ? 1 : 0.6,
                    cursor: isUnlocked ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '30px' }}>{item.icon}</span>
                    {isEquipped && (
                      <span
                        style={{
                          backgroundColor: 'var(--color-sage-deep)',
                          color: '#FFFFFF',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={12} />
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.description}
                  </span>

                  {!isUnlocked && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#D4A838' }}>
                      Disponible en la Despensa ({item.price} ✨)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ACCESORIOS PARA LA MASCOTA */}
      {activeTab === 'wardrobe' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              backgroundColor: 'var(--surface-white)',
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Armario de Accesorios
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Elegí un accesorio tierno para que {space.pet.name} luzca en el nido.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {Object.values(ACCESSORY_CATALOG).map((item) => {
              const isUnlocked = inventory.unlockedAccessories.includes(item.id);
              const isEquipped = space.pet.accessory === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playTap();
                      onEquipAccessory(isEquipped ? undefined : item.id);
                    }
                  }}
                  style={{
                    backgroundColor: 'var(--surface-white)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: isEquipped
                      ? '2.5px solid var(--color-sage-deep)'
                      : isUnlocked
                      ? '1px solid var(--border-subtle)'
                      : '1px dashed #D0D4DC',
                    opacity: isUnlocked ? 1 : 0.6,
                    cursor: isUnlocked ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '30px' }}>{item.icon}</span>
                    {isEquipped && (
                      <span
                        style={{
                          backgroundColor: 'var(--color-sage-deep)',
                          color: '#FFFFFF',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={12} />
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.description}
                  </span>

                  {!isUnlocked && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#D4A838' }}>
                      Disponible en la Despensa ({item.price} ✨)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: DESPENSA Y TIENDA DE LUCEROS */}
      {activeTab === 'shop' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Saldo de Luceros */}
          <div
            style={{
              backgroundColor: 'var(--surface-white)',
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                Fondo del Nido
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Obtené más cuidando a la criatura y jugando minijuegos
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(243, 216, 139, 0.3)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Sparkles size={16} color="#D4A838" />
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#B58718' }}>
                {luceros} Luceros
              </span>
            </div>
          </div>

          {/* Subfiltro de categorías */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'food', 'decor', 'accessory'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setShopCategory(cat)}
                style={{
                  flex: 1,
                  padding: '6px 2px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: shopCategory === cat ? 'var(--color-sage-deep)' : 'var(--surface-white)',
                  color: shopCategory === cat ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {cat === 'all'
                  ? 'Todo'
                  : cat === 'food'
                  ? 'Comidas'
                  : cat === 'decor'
                  ? 'Muebles'
                  : 'Accesorios'}
              </button>
            ))}
          </div>

          {/* Artículos de la tienda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Comidas */}
            {(shopCategory === 'all' || shopCategory === 'food') &&
              Object.values(FOOD_CATALOG).map((food) => (
                <div
                  key={food.id}
                  style={{
                    backgroundColor: 'var(--surface-white)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>{food.icon}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {food.name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {food.description}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-sage-deep)', fontWeight: 600 }}>
                        +{food.hungerGain} Hambre | En alacena: {inventory.foods[food.id] || 0}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuy('food', food.id, food.name)}
                    disabled={isBusy || luceros < food.price}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: luceros >= food.price ? 'var(--color-sage-deep)' : '#CCD0D6',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {food.price} ✨ Comprar
                  </button>
                </div>
              ))}

            {/* Muebles */}
            {(shopCategory === 'all' || shopCategory === 'decor') &&
              Object.values(DECOR_CATALOG).map((decor) => {
                const isOwned = inventory.unlockedDecor.includes(decor.id);
                return (
                  <div
                    key={decor.id}
                    style={{
                      backgroundColor: 'var(--surface-white)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '32px' }}>{decor.icon}</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {decor.name}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {decor.description}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuy('decor', decor.id, decor.name)}
                      disabled={isBusy || isOwned || luceros < decor.price}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: isOwned
                          ? '#A9C7B1'
                          : luceros >= decor.price
                          ? 'var(--color-sage-deep)'
                          : '#CCD0D6',
                        color: '#FFFFFF',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 700,
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isOwned ? 'Adquirido' : `${decor.price} ✨ Comprar`}
                    </button>
                  </div>
                );
              })}

            {/* Accesorios */}
            {(shopCategory === 'all' || shopCategory === 'accessory') &&
              Object.values(ACCESSORY_CATALOG).map((acc) => {
                const isOwned = inventory.unlockedAccessories.includes(acc.id);
                return (
                  <div
                    key={acc.id}
                    style={{
                      backgroundColor: 'var(--surface-white)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '32px' }}>{acc.icon}</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {acc.name}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {acc.description}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuy('accessory', acc.id, acc.name)}
                      disabled={isBusy || isOwned || luceros < acc.price}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: isOwned
                          ? '#A9C7B1'
                          : luceros >= acc.price
                          ? 'var(--color-sage-deep)'
                          : '#CCD0D6',
                        color: '#FFFFFF',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 700,
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isOwned ? 'Adquirido' : `${acc.price} ✨ Comprar`}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
