import React from 'react';
import { PetNeeds } from '../domain/types';
import { Utensils, Sparkles, Moon, PartyPopper, Smile } from 'lucide-react';

interface NeedMeterProps {
  needs: PetNeeds;
  compact?: boolean;
}

export const NeedMeter: React.FC<NeedMeterProps> = ({ needs, compact = false }) => {
  const items = [
    {
      key: 'hunger',
      label: 'Hambre',
      value: needs.hunger,
      icon: Utensils,
      color: '#E8A08D',
      statusText: needs.hunger < 25 ? 'Tiene hambre' : needs.hunger < 60 ? 'Un bocadillo' : 'Satisfecho',
    },
    {
      key: 'hygiene',
      label: 'Higiene',
      value: needs.hygiene,
      icon: Sparkles,
      color: '#8DB8E8',
      statusText: needs.hygiene < 25 ? 'Pide baño' : needs.hygiene < 60 ? 'Un enjuague' : 'Limpito',
    },
    {
      key: 'energy',
      label: 'Energía',
      value: needs.energy,
      icon: Moon,
      color: '#B5A5DB',
      statusText: needs.energy < 25 ? 'Con sueño' : needs.energy < 60 ? 'Tranquilo' : 'Con energía',
    },
    {
      key: 'fun',
      label: 'Diversión',
      value: needs.fun,
      icon: PartyPopper,
      color: '#F0C965',
      statusText: needs.fun < 25 ? 'Aburrido' : needs.fun < 60 ? 'Animado' : 'Alegre',
    },
    {
      key: 'comfort',
      label: 'Comodidad',
      value: needs.comfort,
      icon: Smile,
      color: '#9EC7A7',
      statusText: needs.comfort < 25 ? 'Inquieto' : needs.comfort < 60 ? 'A gusto' : 'Muy cómodo',
    },
  ];

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          gap: '4px',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: '2px 0',
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isCritical = item.value < 25;
          return (
            <div
              key={item.key}
              title={`${item.label}: ${item.value}% (${item.statusText})`}
              style={{
                flex: 1,
                minWidth: 0,
                backgroundColor: 'var(--surface-white)',
                padding: '6px 4px',
                borderRadius: 'var(--radius-md)',
                border: isCritical ? '1.5px solid #E8A08D' : '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Icon size={12} color={item.color} />
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {item.value}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'rgba(0,0,0,0.06)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${item.value}%`,
                    height: '100%',
                    backgroundColor: item.color,
                    borderRadius: '2px',
                    transition: 'width 400ms ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        width: '100%',
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isCritical = item.value < 25;
        return (
          <div
            key={item.key}
            style={{
              backgroundColor: 'var(--surface-white)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: isCritical ? '2px solid #E8A08D' : '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: `${item.color}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={14} color={item.color} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {item.label}
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>
                {item.value}%
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${item.value}%`,
                  height: '100%',
                  backgroundColor: item.color,
                  borderRadius: '3px',
                  transition: 'width 400ms ease',
                }}
              />
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {item.statusText}
            </span>
          </div>
        );
      })}
    </div>
  );
};
