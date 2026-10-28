import React, { useState } from 'react';
import { SpaceState } from '../domain/types';
import { sound } from '../services/sound';
import {
  X,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Users,
  RotateCcw,
  Sparkles,
  Cloud,
  Edit2,
} from 'lucide-react';

interface SettingsModalProps {
  space: SpaceState;
  currentUserId: string;
  currentUserName: string;
  isFirebase: boolean;
  onClose: () => void;
  onGenerateInvite: () => Promise<string>;
  onJoinWithCode: (code: string, userName: string) => Promise<void>;
  onSwitchUser: (userId: string, userName: string) => void;
  onUpdatePetName: (newName: string) => void;
  onUpdateUserName: (newName: string) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  space,
  currentUserId,
  currentUserName,
  isFirebase,
  onClose,
  onGenerateInvite,
  onJoinWithCode,
  onSwitchUser,
  onUpdatePetName,
  onUpdateUserName,
  onResetData,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinNameInput, setJoinNameInput] = useState('');
  const [editingPetName, setEditingPetName] = useState(false);
  const [newPetName, setNewPetName] = useState(space.pet.name);
  const [editingUserName, setEditingUserName] = useState(false);
  const [newUserName, setNewUserName] = useState(currentUserName);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isFull = space.members.length >= 2;
  const inviteCode = space.inviteCode;

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    sound.playTap();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGenerateCode = async () => {
    try {
      sound.playTap();
      await onGenerateInvite();
      setSuccessMsg('¡Código de invitación generado! Válido por 48 horas.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim() || !joinNameInput.trim()) return;

    sound.playTap();
    try {
      await onJoinWithCode(joinCodeInput, joinNameInput);
      setSuccessMsg('¡Te uniste con éxito al nido!');
      setJoinCodeInput('');
      setJoinNameInput('');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Error al unirse');
      }
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleSavePetName = () => {
    if (newPetName.trim()) {
      onUpdatePetName(newPetName.trim());
      setEditingPetName(false);
      sound.playTap();
    }
  };

  const handleSaveUserName = () => {
    if (newUserName.trim()) {
      onUpdateUserName(newUserName.trim());
      setEditingUserName(false);
      sound.playTap();
    }
  };

  const toggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(52, 55, 70, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 200ms ease',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-white)',
          width: '100%',
          maxWidth: '440px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          border: '1.5px solid var(--border-subtle)',
        }}
      >
        {/* Cabecera del modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
            Ajustes del Nido
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color="var(--text-main)" />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#FCE8E6',
              color: '#C5221F',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              backgroundColor: '#E6F4EA',
              color: '#137333',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            {successMsg}
          </div>
        )}

        {/* 1. SECCIÓN: INTEGRANTES Y VINCULACIÓN */}
        <div
          style={{
            backgroundColor: 'var(--surface-subtle)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--color-sage-deep)" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Integrantes del Hogar (Máximo 2)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {space.members.map((uid) => {
              const profile = space.memberProfiles[uid];
              const isMe = uid === currentUserId;
              return (
                <div
                  key={uid}
                  style={{
                    backgroundColor: 'var(--surface-white)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: profile?.avatarColor || 'var(--color-sage)',
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {profile?.displayName || 'Usuario'} {isMe && '(Vos)'}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-sage-deep)', fontWeight: 600 }}>
                    Conectado
                  </span>
                </div>
              );
            })}
          </div>

          {/* Código de invitación si falta el segundo integrante */}
          {!isFull ? (
            <div
              style={{
                marginTop: '6px',
                padding: '10px',
                backgroundColor: 'rgba(243, 216, 139, 0.25)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>
                Invitar a tu pareja:
              </span>
              {inviteCode ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--surface-white)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'monospace',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--color-sage-deep)',
                      textAlign: 'center',
                      letterSpacing: '1px',
                    }}
                  >
                    {inviteCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: copied ? 'var(--color-sage-deep)' : 'var(--color-sage)',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateCode}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-sage-deep)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  Generar código de invitación
                </button>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--color-sage-deep)', fontWeight: 600 }}>
              ✓ Los dos integrantes ya forman parte de este Nido.
            </span>
          )}

          {/* Opción de unirse a otro nido si aún no está lleno */}
          {!isFull && (
            <form onSubmit={handleJoinSubmit} style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                ¿Tenés un código de tu pareja? Ingresalo acá:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={joinNameInput}
                  onChange={(e) => setJoinNameInput(e.target.value)}
                  style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }}
                />
                <input
                  type="text"
                  placeholder="NIDO-XXXX"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  style={{ flex: 1, fontSize: '12px', padding: '6px 10px', textTransform: 'uppercase' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--color-sage)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                Unirme a su Nido
              </button>
            </form>
          )}

          {/* Alternar perfil en modo demostración local */}
          <div
            style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
              Probar en el mismo dispositivo (Alternar usuario):
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onSwitchUser('user_valen', 'Valen')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: currentUserId === 'user_valen' ? 'var(--color-sage-deep)' : 'var(--surface-white)',
                  color: currentUserId === 'user_valen' ? '#FFFFFF' : 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Jugar como Valen
              </button>
              <button
                onClick={() => onSwitchUser('user_sofi', 'Sofi')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: currentUserId === 'user_sofi' ? 'var(--color-sage-deep)' : 'var(--surface-white)',
                  color: currentUserId === 'user_sofi' ? '#FFFFFF' : 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Jugar como Sofi
              </button>
            </div>
          </div>
        </div>

        {/* 2. SECCIÓN: NOMBRES PERSONALIZABLES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Nombre de la Mascota */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              backgroundColor: 'var(--surface-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nombre de la mascota:</span>
              {editingPetName ? (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="text"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    style={{ fontSize: '13px', padding: '4px 8px' }}
                  />
                  <button
                    onClick={handleSavePetName}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: 'var(--color-sage-deep)',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {space.pet.name}
                </div>
              )}
            </div>
            {!editingPetName && (
              <button onClick={() => setEditingPetName(true)}>
                <Edit2 size={16} color="var(--color-sage-deep)" />
              </button>
            )}
          </div>

          {/* Nombre del Usuario Actual */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              backgroundColor: 'var(--surface-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tu nombre visible:</span>
              {editingUserName ? (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    style={{ fontSize: '13px', padding: '4px 8px' }}
                  />
                  <button
                    onClick={handleSaveUserName}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: 'var(--color-sage-deep)',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {currentUserName}
                </div>
              )}
            </div>
            {!editingUserName && (
              <button onClick={() => setEditingUserName(true)}>
                <Edit2 size={16} color="var(--color-sage-deep)" />
              </button>
            )}
          </div>
        </div>

        {/* 3. SECCIÓN: PREFERENCIAS (SONIDO / MODO REDUCIDO) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: 'var(--surface-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isMuted ? <VolumeX size={18} color="var(--text-muted)" /> : <Volume2 size={18} color="var(--color-sage-deep)" />}
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              Efectos sonoros
            </span>
          </div>
          <button
            onClick={toggleSound}
            style={{
              padding: '6px 14px',
              backgroundColor: isMuted ? '#CCD0D6' : 'var(--color-sage-deep)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {isMuted ? 'Silenciado' : 'Activado'}
          </button>
        </div>

        {/* 4. SECCIÓN: ESTADO DE SINCRONIZACIÓN Y FIREBASE */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--surface-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={18} color="var(--color-sage-deep)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              Estado de Sincronización
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {isFirebase
              ? 'Conectado a Firebase Firestore en tiempo real.'
              : 'Modo Local / Demostración activo (persiste en tu navegador e IndexedDB).'}
          </span>
        </div>

        {/* 5. SECCIÓN: REINICIAR DATOS */}
        <button
          onClick={() => {
            if (window.confirm('¿Querés reiniciar los datos del nido y empezar desde el cascarón inicial?')) {
              onResetData();
              onClose();
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            backgroundColor: 'transparent',
            color: '#C5221F',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <RotateCcw size={14} />
          Reiniciar nido local
        </button>
      </div>
    </div>
  );
};
