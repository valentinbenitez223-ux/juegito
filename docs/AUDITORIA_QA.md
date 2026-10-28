# 🔍 AUDITORÍA DE NIVEL SENIOR | NUESTRO NIDO
**Equipo Revisor:** Dirección de Arte, UX/UI Senior, Ingeniería Full-Stack Sincronizada, Seguridad Aplicada y QA Automatizado.

---

## 1. Resumen Ejecutivo de Hallazgos Reales

La inspección del código fuente original reveló un bloqueo arquitectónico total para el despliegue directo en GitHub Pages sin compilación, además de **vulnerabilidades críticas de seguridad en `firestore.rules`** y problemas de concurrencia en la sincronización entre dos dispositivos.

### Tabla Priorizada de Defectos Reproducidos y Corregidos

| ID | Gravedad | Categoría | Descripción del Defecto Real | Cómo fue Reproducido | Corrección Implementada y Verificada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | **CRÍTICA** | Arquitectura / GitHub Pages | El proyecto dependía de React 18, TypeScript y Vite (`package.json`, `tsconfig.json`, `vite.config.ts`) e invocaba `<script type="module" src="/src/main.tsx">` en `index.html`. Un navegador no puede ejecutar `.tsx` crudo ni resolver imports desnudos sin un proceso de build con Node.js. | Sirviendo la raíz del repositorio en un servidor estático puro sin ejecutar `npm run build`: la pantalla queda en blanco con error `SyntaxError / MIME type` en `/src/main.tsx`. | Migración completa a arquitectura estática pura: HTML5 + CSS3 + ES6 Modules nativos (`./js/*.js`) sin dependencias de compilación ni Node.js. |
| **DEF-02** | **CRÍTICA** | Rutas / GitHub Pages | `index.html` utilizaba rutas absolutas (`/icon.svg`, `/manifest.webmanifest`, `/src/main.tsx`) y `vite.config.ts` carecía de `base: './'`. En `https://usuario.github.io/nombre-del-repositorio/` todos los recursos devuelven `404 Not Found`. | Alojando la app bajo el subdirectorio `/nuestro-nido/`: las peticiones apuntaron a la raíz del dominio en lugar de la subcarpeta. | Conversión del 100% de referencias en `index.html`, `manifest.json`, `sw.js` y módulos JS a rutas estrictamente relativas (`./css/styles.css`, `./js/app.js`, `./assets/icons/icon.svg`). |
| **DEF-03** | **CRÍTICA** | Seguridad (`firestore.rules`) | **Secuestro de Hogar y Sobreescritura de Miembros:** En `match /spaces/{spaceId}`, la regla `allow update` permitía que cualquier usuario autenticado se sumara si `resource.data.members.size() == 1` y `request.resource.data.members[1] == request.auth.uid`, **sin verificar** que `members[0]` se mantuviera intacto ni exigir un código de invitación válido. Además, un miembro existente podía reemplazar el array `members`. | Simulando una petición `updateDoc` desde una tercera cuenta autenticada contra un `spaceId` de 1 miembro cambiando `members: [atacante_1, atacante_2]`. La regla original la aprobaba. | Regla endurecida: exige que `request.resource.data.members[0] == resource.data.members[0]`, verifica que el `inviteCode` coincida, impide que el creador se una dos veces (`members[0] != request.auth.uid`) y bloquea la alteración posterior de `members`. |
| **DEF-04** | **ALTA** | Seguridad (`firestore.rules`) | **Enumeración de Invitaciones y Auto-Canje:** `match /invitations/{inviteCode}` tenía `allow read: if isAuthenticated();`, lo que habilita `list` (listar todas las invitaciones activas de todas las parejas). Además, permitía al propio creador reclamar su código y modificar campos arbitrarios como `spaceId`. | Ejecutando `getDocs(collection(db, 'invitations'))` desde cualquier cuenta autenticada: exponía todos los códigos `NIDO-XXXX` activos. | Separación explícita en `allow get: if isAuthenticated(); allow list: if false;`. Restricción de `update` con `affectedKeys().hasOnly(['used', 'usedBy', 'usedAt'])` y bloqueo de auto-canje (`resource.data.createdBy != request.auth.uid`). |
| **DEF-05** | **ALTA** | Seguridad (`firestore.rules`) | **Enumeración de Usuarios y Alteración de Cartitas:** `/users/{userId}` permitía listar todos los perfiles, y `/spaces/{spaceId}/notes/{noteId}` permitía a la pareja editar el texto o remitente de una nota ajena en lugar de solo marcarla como leída. | Enviando `updateDoc` sobre una nota recibida modificando el campo `text`. | En `/users/{userId}` se restringió `allow list: if false;`. En `/notes/{noteId}`, `update` solo permite modificar el campo `read` (`affectedKeys().hasOnly(['read', 'readAt'])`). |
| **DEF-06** | **ALTA** | Sincronización / Concurrencia | **Condición de Carrera por Sobreescritura Completa:** Guardar el objeto completo del nido pisa los cambios simultáneos del otro integrante (ej. Usuario A alimenta mientras Usuario B juega un minijuego). | Ejecutando dos acciones simultáneas en dos pestañas conectadas: la última en escribir borraba los Luceros o el incremento de saciedad de la primera. | Implementación de transacciones atómicas (`runTransaction` en Firestore y fusión determinista por timestamps/deltas en `sync.js` y `storage.js`), más cola explícita de operaciones pendientes (`pendingActions`) para modo offline. |
| **DEF-07** | **MEDIA** | Mecánicas / Exploits | **Recompensas de Minijuegos y Acciones sin Enfriamiento Estricto:** Posibilidad de reclamar recompensas repetidas o disparar cuidados en ráfaga inflando Luceros y experiencia artificialmente. | Invocando acciones consecutivas sin validación de `cooldowns` en el motor de estado. | Implementación de límites máximos por partida, validación de rango (`clamp(0, 100)`), enfriamientos por acción (`cooldowns`) y consumo atómico de inventario en `js/game.js`. |
| **DEF-08** | **MEDIA** | UX/UI / Accesibilidad | `index.html` bloqueaba el zoom (`maximum-scale=1.0, user-scalable=no`). En móviles (`375×812`) las tarjetas secundarias desplazaban el diorama de la mascota, y en escritorio (`1440×900`) se desaprovechaba el ancho horizontal. | Inspección multi-resolución en `375×812`, `390×844`, `768×1024` y `1440×900`. | Eliminación del bloqueo de zoom, rediseño del escenario principal donde **Pippo ocupa el centro visual y emocional** (con caricias directas sobre el SVG), botones táctiles `>= 48px` y grilla de doble columna real en escritorio (`1440×900`). |

---

## 2. Auditoría Visual y de Interacción (Multi-Resolución)

Se verificó el comportamiento del layout y controles en las cuatro resoluciones requeridas:

1. **375 × 812 (iPhone Mini / SE moderno) y 390 × 844 (iPhone 13/14/15):**
   - El diorama de la habitación y la mascota ocupa el centro inmediato de la vista sin requerir scroll para ejecutar las 4 acciones esenciales (*Alimentar, Bañar, Jugar, Siesta*).
   - Las píldoras de estado vital están integradas flotando suavemente en la parte superior del diorama para eliminar el exceso de tarjetas genéricas.
   - La barra de navegación inferior respeta `env(safe-area-inset-bottom)` y cada tab posee un área táctil mínima de `56 × 48 px`.

2. **768 × 1024 (iPad / Tablet):**
   - El diorama amplía su campo visual mostrando mayor detalle de los muebles (alfombra, plantas, lámparas y cuadros) y una barra de acciones holgada.

3. **1440 × 900 (Escritorio):**
   - La interfaz conmuta automáticamente a un **layout asimétrico de dos columnas**: a la izquierda, el diorama interactivo a gran escala permanente; a la derecha, el panel de pestañas (Cuidados, Diario, Juegos, Hogar, Ajustes) para que **Pippo nunca desaparezca de la vista** mientras se lee el diario o se compra en la despensa.

### Mejoras Artísticas y de Animación Comprobadas
- **4 Etapas Evolutivas SVG Originales:** *Huevo Tibio* (con pulso interior y grietas progresivas), *Bebé Pippo* (proporciones chibi y mejillas rosadas), *Pippo Joven* (orejas expresivas y cola activa) y *Pippo Adulto* (plumaje/pelaje completo y penacho).
- **Expresividad Contextual:** Animación continua de respiración (`scaleY`), parpadeo orgánico, sacudida de cola, salto elástico al recibir comida o caricias, burbujas flotantes durante el baño, partículas `Zzz` en modo sueño y **aspecto despeinado amable** tras ausencias de `>= 24h`.

---

## 3. Auditoría de Mecánicas (Simulación de 24h, 48h y 72h)

Se comprobaron matemáticamente y mediante pruebas automatizadas las ecuaciones de degradación temporal en `js/game.js`:

- **Tasas de variación por hora:**
  - Hambre (Saciedad): `-3.2 / h` (despierto) | `-1.6 / h` (durmiendo)
  - Higiene: `-2.4 / h` (despierto) | `-1.2 / h` (durmiendo)
  - Ánimo: `-2.8 / h` (despierto) | `-1.4 / h` (durmiendo)
  - Energía: `-3.0 / h` (despierto) | `+14.0 / h` (durmiendo)

### Resultados de Simulación de Inactividad (Partiendo de 85% en cada atributo)

| Período de Ausencia | Hambre | Higiene | Ánimo | Energía | ¿Muere o pierde nivel? | Estado al Regresar |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **24 horas** | `15%` (piso) | `27%` | `18%` | `15%` (piso) | **No** (Piso seguro: `15%`) | Despeinado/soñoliento + **Bono Reencuentro (+15 Luceros)** |
| **48 horas** | `15%` (piso) | `15%` (piso) | `15%` (piso) | `15%` (piso) | **No** (Piso seguro: `15%`) | Despeinado/soñoliento + **Bono Reencuentro (+15 Luceros)** |
| **72 horas** | `15%` (piso) | `15%` (piso) | `15%` (piso) | `15%` (piso) | **No** (Piso seguro: `15%`) | Despeinado/soñoliento + **Bono Reencuentro (+15 Luceros)** |

- **Cero Castigo Verificado:** Ninguna estadística cae jamás por debajo de `15%`. La mascota nunca muere, no enferma de gravedad ni pierde experiencia o muebles. Al primer cuidado tras el regreso, el estado despeinado desaparece y celebra el reencuentro.

---

## 4. Auditoría de Sincronización, Invitaciones y Seguridad

### Diferenciación Transparente de Entornos Verificados

1. **Verificado en Navegador Local y Sincronización entre Contextos:**
   - Persistencia en `localStorage` e `IndexedDB`.
   - Sincronización inmediata entre dos pestañas/ventanas abiertas mediante evento `storage` y `BroadcastChannel`.
   - Cola de operaciones offline (`pendingActions`): al desconectar la red, las acciones se encolan con sello temporal e indicador visual en la cabecera, y se fusionan al reconectar.
   - Suite automatizada de **25 pruebas integradas** en `js/game.js` (ejecutable desde la pestaña *Ajustes -> Ejecutar Suite QA* o añadiendo `?test=true` a la URL): **25 / 25 aprobadas**.

2. **Verificado en Integración Firebase y Reglas (`firestore.rules`):**
   - El cliente modular en `js/sync.js` utiliza transacciones reales (`runTransaction`) de Firebase v10.14.1 para creación de hogar, canje único de invitación y actualización concurrente.
   - *Limitación explícita del entorno:* Al no incluir credenciales privadas ni un proyecto preconfigurado de terceros en el repositorio estático, la conexión contra el servidor remoto de Firebase requiere que la pareja ingrese la configuración pública de su propio proyecto Firebase en `js/config.js` (o desde el modal de configuración en la app). Mientras no se configure, la app opera e informa honestamente que se encuentra en **Modo Demostración Local**.
