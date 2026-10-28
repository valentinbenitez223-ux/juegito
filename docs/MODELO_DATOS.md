# Modelo de Datos: Nuestro Nido
## Arquitectura de Información y Estructuras de Persistencia

Este documento define las entidades, esquemas, relaciones y reglas de integridad para el estado compartido de **Nuestro Nido**. Está diseñado para sincronizarse mediante Firestore en producción y persistir en IndexedDB/LocalStorage en modo demostración local.

---

### 1. Jerarquía de Colecciones

```
spaces/ (colección raíz)
  └── {spaceId}/
        ├── document: datos principales del nido, miembros, mascota y economía
        ├── activity/ (subcolección de acciones de cuidado y eventos)
        │     └── {activityId}
        ├── notes/ (subcolección de notas y mensajes entre la pareja)
        │     └── {noteId}
        ├── memories/ (subcolección de hitos y recuerdos desbloqueados)
        │     └── {memoryId}
        └── daily_rituals/ (subcolección de ritos diarios)
              └── {dateKey} (YYYY-MM-DD)

invitations/ (colección raíz para emparejamiento seguro por código)
  └── {inviteCode}

users/ (colección raíz para metadatos del usuario)
  └── {userId}
```

---

### 2. Esquemas Detallados de Documentos

#### 2.1. Documento de Espacio (`spaces/{spaceId}`)
Representa el hogar compartido. Es la entidad central de sincronización.

```typescript
interface SpaceDocument {
  id: string;                          // Identificador único del nido
  name: string;                        // Nombre del nido (ej: "Nuestro Nido")
  createdAt: number;                   // Timestamp en milisegundos
  updatedAt: number;                   // Timestamp de última mutación
  members: string[];                   // Lista estricta de UIDs (máximo 2 miembros)
  memberProfiles: {
    [uid: string]: {
      displayName: string;             // Nombre elegido por el usuario (ej: "Sofi")
      avatarColor: string;             // Color de identificación (#A9C7B1, etc.)
      lastSeenAt: number;              // Timestamp de última presencia
    }
  };
  inviteCode: string | null;           // Código activo de invitación (si aún falta el 2do miembro)
  inviteExpiresAt: number | null;      // Vencimiento del código (ej: +48 horas)

  // Mascota Compartida
  pet: {
    name: string;                      // Nombre de la criatura (ej: "Pippo")
    stage: 'egg' | 'baby' | 'young' | 'adult'; // Etapa evolutiva
    personality: 'curioso' | 'dormilon' | 'alegre' | 'mimosa';
    colorVariant: 'pastel_sage' | 'butter_cream' | 'dusty_rose' | 'lavender_sky';
    accessory: string | null;          // Id del accesorio equipado (ej: "sombrerito_hoja")
    needs: {
      hunger: number;                  // 0 a 100 (100 = satisfecho)
      hygiene: number;                 // 0 a 100 (100 = limpio)
      energy: number;                  // 0 a 100 (100 = descansado)
      fun: number;                     // 0 a 100 (100 = entretenido)
      comfort: number;                 // 0 a 100 (100 = cómodo/ambiente)
    };
    lastNeedsUpdate: number;           // Timestamp de cálculo de simulación
    isSleeping: boolean;               // Si está durmiendo actualmente
    sleepStartedAt?: number;           // Timestamp en que se fue a dormir
    totalCareInteractions: number;     // Contador total de caricias, comidas, etc.
    hatchingProgress: number;          // 0 a 3 (3 eclosiona el huevo)
  };

  // Economía e Inventario del Hogar
  economy: {
    luceros: number;                   // Moneda compartida
    lifetimeLucerosEarned: number;     // Total histórico acumulado
  };

  inventory: {
    foods: { [foodId: string]: number }; // Ej: { "bayas_dulces": 5, "miel_dorada": 2 }
    unlockedDecor: string[];           // IDs de muebles/adornos adquiridos
    activeDecor: {
      rug?: string;                    // Alfombra activa
      plant?: string;                  // Planta decorativa
      lamp?: string;                   // Iluminación o vela
      toy?: string;                    // Juguete colocado
      wallArt?: string;                // Cuadro o guirnalda
    };
    unlockedAccessories: string[];     // IDs de accesorios desbloqueados
  };
}
```

#### 2.2. Registro de Actividad (`spaces/{spaceId}/activity/{activityId}`)
Auditoría asíncrona de lo ocurrido mientras el otro no estaba conectado.

```typescript
interface ActivityLog {
  id: string;
  spaceId: string;
  userId: string;
  userName: string;
  actionType: 'feed' | 'pet' | 'play' | 'clean' | 'sleep' | 'wake' | 'decor_changed' | 'game_played';
  details: string;                     // Mensaje en español cálido ("alimentó a Pippo con una manzana dulce")
  timestamp: number;
  lucerosDelta?: number;
}
```

#### 2.3. Notas y Mensajes Compartidos (`spaces/{spaceId}/notes/{noteId}`)
Mensajes cariñosos y notas dejadas para el compañero/a.

```typescript
interface SharedNote {
  id: string;
  spaceId: string;
  senderId: string;
  senderName: string;
  message: string;                     // Texto de la nota
  sticker?: string;                    // Corazón, estrella, taza, trébol
  createdAt: number;
  readByPartner: boolean;
}
```

#### 2.4. Recuerdos del Nido (`spaces/{spaceId}/memories/{memoryId}`)
Álbum de momentos importantes compartidos.

```typescript
interface NidoMemory {
  id: string;
  spaceId: string;
  title: string;                       // Ej: "¡El primer cascarón se rompió!"
  description: string;
  icon: string;
  unlockedAt: number;
  category: 'hatching' | 'milestone' | 'decor' | 'game';
}
```

#### 2.5. Rito Diario (`spaces/{spaceId}/daily_rituals/{dateKey}`)
Pregunta o pensamiento del día con revelación conjunta.

```typescript
interface DailyRitual {
  id: string;                          // YYYY-MM-DD
  spaceId: string;
  prompt: string;                      // Pregunta del día (ej: "¿Qué momento de hoy te hizo sonreír?")
  responses: {
    [userId: string]: {
      text: string;
      answeredAt: number;
    }
  };
  isRevealed: boolean;                 // true si ambos respondieron o si el día expiró
}
```

#### 2.6. Documento de Invitación (`invitations/{inviteCode}`)
Token temporal de un solo uso para incorporar a la segunda persona.

```typescript
interface InvitationDocument {
  code: string;                        // Código alfanumérico en mayúsculas (ej: "NIDO-7K9M")
  spaceId: string;                     // ID del espacio al que da acceso
  createdBy: string;                   // UID del creador
  createdByName: string;               // Nombre del creador
  createdAt: number;
  expiresAt: number;                   // Timestamp (+48 horas desde creación)
  used: boolean;                       // true si ya fue canjeado
  usedBy?: string;                     // UID del segundo integrante
}
```

---

### 3. Reglas de Integridad y Consistencia

1. **Aislamiento Estricto:** Un usuario solo puede pertenecer a un espacio activo a la vez.
2. **Capacidad Máxima Inmutable:** `members.length <= 2`. Si ya tiene 2 miembros, cualquier intento de unirse falla atómicamente.
3. **No-Muerte de la Mascota:** Las necesidades tienen un piso inferior de 10% (modo exhausto/adormilado) y un techo de 100%. Nunca llegan a números negativos ni causan eliminación del personaje.
4. **Economía Atómica:** El consumo de alimentos y el gasto de luceros se ejecutan mediante transacciones para evitar compras dobles o saldo negativo.
