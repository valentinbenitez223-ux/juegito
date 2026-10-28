import React, { useState, useEffect } from 'react';
import {
  SpaceState,
  ActivityLog,
  SharedNote,
  NidoMemory,
  DailyRitual,
  ActionType,
  SpaceDecor,
} from './domain/types';
import { getPetMood } from './domain/simulation';
import { syncEngine } from './services/storage';
import { sound } from './services/sound';
import { PetDiorama } from './components/PetDiorama';
import { NeedMeter } from './components/NeedMeter';
import { CareStation } from './components/CareStation';
import { SharedJournal } from './components/SharedJournal';
import { GamesHub } from './components/GamesHub';
import { HomeShop } from './components/HomeShop';
import { SettingsModal } from './components/SettingsModal';
import confetti from 'canvas-confetti';
import {
  Heart,
  Utensils,
  BookOpen,
  Gamepad2,
  Home,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const App: React.FC = () => {
  const [space, setSpace] = useState<SpaceState | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [memories, setMemories] = useState<NidoMemory[]>([]);
  const [ritual, setRitual] = useState<DailyRitual | null>(null);
  const [activeTab, setActiveTab] = useState<'nido' | 'care' | 'journal' | 'games' | 'shop'>('nido');
  const [showSettings, setShowSettings] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(syncEngine.getCurrentUserId());
  const [currentUserName, setCurrentUserName] = useState(syncEngine.getCurrentUserName());
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showNeedsDetail, setShowNeedsDetail] = useState(false);

  // Suscripciones reactivas
  useEffect(() => {
    const unsubSpace = syncEngine.subscribeToSpace((s) => setSpace({ ...s }));
    const unsubActivities = syncEngine.subscribeToActivity((acts) => setActivities([...acts]));
    const unsubNotes = syncEngine.subscribeToNotes((n) => setNotes([...n]));
    const unsubMemories = syncEngine.subscribeToMemories((m) => setMemories([...m]));

    const dateKey = new Date().toISOString().split('T')[0];
    const unsubRitual = syncEngine.subscribeToDailyRitual(dateKey, (r) => setRitual({ ...r }));

    return () => {
      unsubSpace();
      unsubActivities();
      unsubNotes();
      unsubMemories();
      unsubRitual();
    };
  }, []);

  if (!space || !ritual) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-cream)',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '42px', animation: 'spin 3s infinite linear' }}>🌱</span>
        <span style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: 600 }}>
          Preparando Nuestro Nido...
        </span>
      </div>
    );
  }

  const mood = getPetMood(space.pet);

  const handlePerformCare = async (action: ActionType, foodId?: string) => {
    const oldStage = space.pet.stage;
    const res = await syncEngine.performCare(action, foodId);

    // Si eclosionó a bebé, festejo extra
    const current = syncEngine.getSpace();
    if (current && oldStage === 'egg' && current.pet.stage === 'baby') {
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      } catch {}
    }
  };

  const handlePetTouch = async () => {
    try {
      await syncEngine.performCare('pet');
    } catch {}
  };

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const partnerId = space.members.find((m) => m !== currentUserId);
  const partnerProfile = partnerId ? space.memberProfiles[partnerId] : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        backgroundColor: 'var(--bg-cream)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '85px',
      }}
    >
      {/* 1. BARRA SUPERIOR FIJA */}
      <header
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '10px 12px',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--surface-white)',
          borderBottom: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Identidad de la mascota */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexShrink: 1 }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(169, 199, 177, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
              flexShrink: 0,
            }}
          >
            {space.pet.stage === 'egg' ? '🥚' : '🐣'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {space.pet.name}
            </span>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {space.pet.stage === 'egg'
                ? `Huevo (${space.pet.hatchingProgress || 0}/3)`
                : space.pet.stage === 'baby'
                ? 'Bebé Nido'
                : 'Joven Nido'}
            </span>
          </div>
        </div>

        {/* Pareja e info compartida */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Badge de Luceros */}
          <div
            onClick={() => {
              sound.playTap();
              setActiveTab('shop');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(243, 216, 139, 0.3)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={13} color="#D4A838" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#A07612' }}>
              {space.economy.luceros}
            </span>
          </div>

          {/* Botón de Sonido */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Botón de Ajustes */}
          <button
            onClick={() => {
              sound.playTap();
              setShowSettings(true);
            }}
            aria-label="Abrir ajustes"
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* Pill de presencia de pareja */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          boxSizing: 'border-box',
          padding: '6px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(169, 199, 177, 0.12)',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          Cuidando juntos:{' '}
          <strong style={{ color: 'var(--color-sage-deep)' }}>
            {currentUserName}
          </strong>{' '}
          y{' '}
          <strong style={{ color: '#D87875' }}>
            {partnerProfile ? partnerProfile.displayName : 'esperando invitación...'}
          </strong>
        </span>
        {!partnerProfile && (
          <button
            onClick={() => setShowSettings(true)}
            style={{
              color: 'var(--color-sage-deep)',
              fontWeight: 700,
              textDecoration: 'underline',
            }}
          >
            Invitar ahora
          </button>
        )}
      </div>

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
      <main
        style={{
          width: '100%',
          maxWidth: '460px',
          boxSizing: 'border-box',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* PESTAÑA: NIDO */}
        {activeTab === 'nido' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Diorama interactivo 2D */}
            <PetDiorama
              space={space}
              mood={mood}
              onPetTouch={handlePetTouch}
            />

            {/* Medidores de necesidades */}
            <div
              style={{
                backgroundColor: 'var(--surface-white)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setShowNeedsDetail(!showNeedsDetail)}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Estado de {space.pet.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-sage-deep)', fontWeight: 600 }}>
                  {showNeedsDetail ? 'Ver menos ▲' : 'Ver detalle ▼'}
                </span>
              </div>

              {/* Vista compacta o completa según toggle */}
              <NeedMeter needs={space.pet.needs} compact={!showNeedsDetail} />
            </div>

            {/* Cuidados rápidos directos */}
            <CareStation
              space={space}
              onPerformCare={handlePerformCare}
              onOpenShop={() => setActiveTab('shop')}
              onOpenGames={() => setActiveTab('games')}
            />

            {/* Última actividad de pareja */}
            {activities.length > 0 && (
              <div
                onClick={() => setActiveTab('journal')}
                style={{
                  backgroundColor: 'var(--surface-white)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>📖</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Último momento: <strong>{activities[0].details}</strong>
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-sage-deep)' }}>➔</span>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: CUIDADOS DETALLADOS */}
        {activeTab === 'care' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <CareStation
              space={space}
              onPerformCare={handlePerformCare}
              onOpenShop={() => setActiveTab('shop')}
              onOpenGames={() => setActiveTab('games')}
            />
            <div
              style={{
                backgroundColor: 'var(--surface-white)',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>
                Todas las necesidades
              </h3>
              <NeedMeter needs={space.pet.needs} compact={false} />
            </div>
          </div>
        )}

        {/* PESTAÑA: DIARIO COMPARTIDO */}
        {activeTab === 'journal' && (
          <SharedJournal
            space={space}
            currentUserId={currentUserId}
            notes={notes}
            ritual={ritual}
            activities={activities}
            memories={memories}
            onSendNote={async (msg, stk) => {
              await syncEngine.sendNote(msg, stk);
            }}
            onAnswerRitual={async (text) => {
              await syncEngine.answerDailyRitual(text);
            }}
          />
        )}

        {/* PESTAÑA: MINIJUEGOS */}
        {activeTab === 'games' && (
          <GamesHub
            onRecordGameResult={async (name, score, luceros) => {
              await syncEngine.recordGameResult(name, score, luceros);
            }}
            onBackToNest={() => setActiveTab('nido')}
          />
        )}

        {/* PESTAÑA: HOGAR & DESPENSA */}
        {activeTab === 'shop' && (
          <HomeShop
            space={space}
            onBuyItem={async (type, id) => {
              await syncEngine.buyItem(type, id);
            }}
            onEquipDecor={async (slot, id) => {
              await syncEngine.equipDecor(slot, id);
            }}
            onEquipAccessory={async (id) => {
              await syncEngine.equipAccessory(id);
            }}
          />
        )}
      </main>

      {/* 3. BARRA DE NAVEGACIÓN INFERIOR (Mobile-first, objetivos táctiles >= 48px) */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: 'var(--surface-white)',
          borderTop: '1.5px solid var(--border-subtle)',
          boxShadow: '0 -4px 16px rgba(52, 55, 70, 0.08)',
          zIndex: 50,
          paddingBottom: 'max(4px, env(safe-area-inset-bottom))',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: '500px',
            justifyContent: 'space-around',
            padding: '4px 2px',
          }}
        >
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('nido');
            }}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              color: activeTab === 'nido' ? 'var(--color-sage-deep)' : 'var(--text-muted)',
              fontWeight: activeTab === 'nido' ? 700 : 500,
            }}
          >
            <Heart size={19} fill={activeTab === 'nido' ? 'var(--color-sage)' : 'none'} />
            <span style={{ fontSize: '10.5px' }}>Nido</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('care');
            }}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              color: activeTab === 'care' ? 'var(--color-sage-deep)' : 'var(--text-muted)',
              fontWeight: activeTab === 'care' ? 700 : 500,
            }}
          >
            <Utensils size={19} />
            <span style={{ fontSize: '10.5px' }}>Cuidados</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('journal');
            }}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              color: activeTab === 'journal' ? 'var(--color-sage-deep)' : 'var(--text-muted)',
              fontWeight: activeTab === 'journal' ? 700 : 500,
              position: 'relative',
            }}
          >
            <BookOpen size={19} />
            <span style={{ fontSize: '10.5px' }}>Diario</span>
            {notes.some((n) => n.senderId !== currentUserId && !n.readByPartner) && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '25%',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#D87875',
                }}
              />
            )}
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('games');
            }}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              color: activeTab === 'games' ? 'var(--color-sage-deep)' : 'var(--text-muted)',
              fontWeight: activeTab === 'games' ? 700 : 500,
            }}
          >
            <Gamepad2 size={19} />
            <span style={{ fontSize: '10.5px' }}>Juegos</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('shop');
            }}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              color: activeTab === 'shop' ? 'var(--color-sage-deep)' : 'var(--text-muted)',
              fontWeight: activeTab === 'shop' ? 700 : 500,
            }}
          >
            <Home size={19} />
            <span style={{ fontSize: '10.5px' }}>Hogar</span>
          </button>
        </div>
      </nav>

      {/* MODAL DE AJUSTES */}
      {showSettings && (
        <SettingsModal
          space={space}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          isFirebase={syncEngine.isFirebaseConfigured()}
          onClose={() => setShowSettings(false)}
          onGenerateInvite={async () => {
            return await syncEngine.generateNewInvite();
          }}
          onJoinWithCode={async (code, uName) => {
            await syncEngine.joinSpaceWithCode(code, uName);
          }}
          onSwitchUser={(uId, uName) => {
            syncEngine.switchLocalUser(uId, uName);
            setCurrentUserId(uId);
            setCurrentUserName(uName);
          }}
          onUpdatePetName={(name) => {
            const sp = syncEngine.getSpace();
            if (sp) {
              sp.pet.name = name;
              localStorage.setItem('nuestro_nido_space_data', JSON.stringify(sp));
              setSpace({ ...sp });
            }
          }}
          onUpdateUserName={(name) => {
            syncEngine.setUserInfo(currentUserId, name);
            setCurrentUserName(name);
            const sp = syncEngine.getSpace();
            if (sp && sp.memberProfiles[currentUserId]) {
              sp.memberProfiles[currentUserId].displayName = name;
              localStorage.setItem('nuestro_nido_space_data', JSON.stringify(sp));
              setSpace({ ...sp });
            }
          }}
          onResetData={() => {
            syncEngine.resetAllData();
          }}
        />
      )}
    </div>
  );
};
