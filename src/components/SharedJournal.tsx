import React, { useState } from 'react';
import { SpaceState, SharedNote, DailyRitual, ActivityLog, NidoMemory } from '../domain/types';
import { sound } from '../services/sound';
import { MessageSquareHeart, Sparkles, BookOpen, Clock, Send, Award, Lock, Unlock } from 'lucide-react';

interface SharedJournalProps {
  space: SpaceState;
  currentUserId: string;
  notes: SharedNote[];
  ritual: DailyRitual;
  activities: ActivityLog[];
  memories: NidoMemory[];
  onSendNote: (msg: string, sticker?: string) => Promise<void>;
  onAnswerRitual: (text: string) => Promise<void>;
}

export const SharedJournal: React.FC<SharedJournalProps> = ({
  space,
  currentUserId,
  notes,
  ritual,
  activities,
  memories,
  onSendNote,
  onAnswerRitual,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'ritual' | 'timeline' | 'memories'>('notes');
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('💌');
  const [ritualInput, setRitualInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stickers = ['💌', '🌸', '☕', '🌟', '🥑', '🧸', '🥐', '✨'];

  const handleSendNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sound.playTap();
    try {
      await onSendNote(newNoteText, selectedSticker);
      setNewNoteText('');
      sound.playChime();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRitualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ritualInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sound.playTap();
    try {
      await onAnswerRitual(ritualInput);
      setRitualInput('');
      sound.playChime();
    } finally {
      setIsSubmitting(false);
    }
  };

  const myRitualAnswer = ritual.responses[currentUserId];
  const partnerId = space.members.find((m) => m !== currentUserId);
  const partnerProfile = partnerId ? space.memberProfiles[partnerId] : null;
  const partnerRitualAnswer = partnerId ? ritual.responses[partnerId] : null;

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
      {/* Pestañas superiores del diario */}
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
            setActiveTab('notes');
          }}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'notes' ? 'var(--color-sage)' : 'transparent',
            color: activeTab === 'notes' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <MessageSquareHeart size={16} />
          Cartitas
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('ritual');
          }}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'ritual' ? 'var(--color-sage)' : 'transparent',
            color: activeTab === 'ritual' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={16} />
          Rito Diario
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('timeline');
          }}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'timeline' ? 'var(--color-sage)' : 'transparent',
            color: activeTab === 'timeline' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Clock size={16} />
          Bitácora
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('memories');
          }}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'memories' ? 'var(--color-sage)' : 'transparent',
            color: activeTab === 'memories' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Award size={16} />
          Recuerdos
        </button>
      </div>

      {/* PESTAÑA 1: CARTITAS Y NOTAS */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Formulario para dejar una cartita */}
          <form
            onSubmit={handleSendNoteSubmit}
            style={{
              backgroundColor: 'var(--surface-white)',
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                Dejale una notita cariñosa
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {stickers.map((stk) => (
                  <button
                    key={stk}
                    type="button"
                    onClick={() => setSelectedSticker(stk)}
                    style={{
                      fontSize: '16px',
                      padding: '2px 4px',
                      borderRadius: '6px',
                      backgroundColor: selectedSticker === stk ? 'rgba(169, 199, 177, 0.3)' : 'transparent',
                    }}
                  >
                    {stk}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Escribí un mensajito que le alegre el día..."
              style={{
                width: '100%',
                resize: 'none',
                fontSize: '14px',
              }}
            />

            <button
              type="submit"
              disabled={isSubmitting || !newNoteText.trim()}
              style={{
                alignSelf: 'flex-end',
                padding: '8px 16px',
                backgroundColor: newNoteText.trim() ? 'var(--color-sage-deep)' : '#B2B7BE',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Send size={14} />
              Dejar notita
            </button>
          </form>

          {/* Lista de notas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notes.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '28px',
                  backgroundColor: 'var(--surface-white)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                }}
              >
                💌 Todavía no hay notitas. ¡Escribile la primera para darle una sorpresa!
              </div>
            ) : (
              notes.map((note) => {
                const isMe = note.senderId === currentUserId;
                const dateStr = new Date(note.createdAt).toLocaleDateString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={note.id}
                    style={{
                      backgroundColor: 'var(--surface-white)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-lg)',
                      border: isMe ? '1.5px solid rgba(169, 199, 177, 0.4)' : '1.5px solid rgba(239, 183, 181, 0.5)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '18px' }}>{note.sticker || '💌'}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {isMe ? 'Vos' : note.senderName}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                        {dateStr}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-main)', paddingLeft: '24px' }}>
                      {note.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: RITO DIARIO */}
      {activeTab === 'ritual' && (
        <div
          style={{
            backgroundColor: 'var(--surface-white)',
            padding: '18px',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#D4A838" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                Rito Diario de Pareja
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Una pequeña pausa reflexiva para conectar cada día (+20 Luceros)
              </span>
            </div>
          </div>

          {/* Pregunta del día */}
          <div
            style={{
              padding: '14px',
              backgroundColor: 'rgba(243, 216, 139, 0.2)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid #D4A838',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', fontStyle: 'italic' }}>
              "{ritual.prompt}"
            </span>
          </div>

          {/* Formulario de respuesta propia si aún no respondió */}
          {!myRitualAnswer ? (
            <form onSubmit={handleRitualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                rows={3}
                value={ritualInput}
                onChange={(e) => setRitualInput(e.target.value)}
                placeholder="Escribí tu respuesta con calma y sinceridad..."
                style={{ width: '100%', fontSize: '14px' }}
              />
              <button
                type="submit"
                disabled={isSubmitting || !ritualInput.trim()}
                style={{
                  padding: '10px',
                  backgroundColor: ritualInput.trim() ? 'var(--color-sage-deep)' : '#B2B7BE',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={16} />
                Guardar mi respuesta (+20 Luceros)
              </button>
            </form>
          ) : (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(169, 199, 177, 0.15)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sage-deep)' }}>
                Tu respuesta de hoy:
              </span>
              <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>
                {myRitualAnswer.text}
              </p>
            </div>
          )}

          {/* Estado de la respuesta del compañero/a */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: ritual.isRevealed
                ? 'rgba(239, 183, 181, 0.15)'
                : 'var(--surface-subtle)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {ritual.isRevealed && partnerRitualAnswer ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Unlock size={16} color="var(--color-sage-deep)" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Respuesta de {partnerProfile?.displayName || 'tu pareja'}:
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', paddingLeft: '22px' }}>
                  {partnerRitualAnswer.text}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={18} color="var(--text-muted)" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {partnerRitualAnswer
                    ? `¡${partnerProfile?.displayName || 'Tu pareja'} ya respondió! Respondé vos para revelar ambas respuestas.`
                    : `${partnerProfile?.displayName || 'Tu pareja'} todavía no respondió hoy. Las respuestas se revelarán cuando ambos participen.`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: BITÁCORA Y ACTIVIDADES */}
      {activeTab === 'timeline' && (
        <div
          style={{
            backgroundColor: 'var(--surface-white)',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--color-sage-deep)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              Historia del Nido
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activities.length === 0 ? (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Aún no hay actividades registradas.
              </span>
            ) : (
              activities.slice(0, 25).map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>
                    {act.actionType === 'feed'
                      ? '🍎'
                      : act.actionType === 'clean'
                      ? '🫧'
                      : act.actionType === 'sleep'
                      ? '🌙'
                      : act.actionType === 'game_played'
                      ? '🎮'
                      : '🌱'}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                      {act.details}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                      {new Date(act.timestamp).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {act.lucerosDelta && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: act.lucerosDelta > 0 ? 'var(--color-sage-deep)' : '#E8A08D',
                      }}
                    >
                      {act.lucerosDelta > 0 ? `+${act.lucerosDelta}` : act.lucerosDelta} ✨
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 4: RECUERDOS DESBLOQUEADOS */}
      {activeTab === 'memories' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {memories.map((mem) => (
            <div
              key={mem.id}
              style={{
                backgroundColor: 'var(--surface-white)',
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '26px' }}>{mem.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {mem.title}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {mem.description}
              </p>
              <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px' }}>
                {new Date(mem.unlockedAt).toLocaleDateString('es-AR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
