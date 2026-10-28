# 🌿 Nuestro Nido
### Un universo virtual compartido por dos personas

**Nuestro Nido** es un juego web y Progressive Web App (PWA) de mascota virtual compartida, diseñado exclusivamente para que **dos personas** cuiden juntas una criatura digital, decoren un hogar acogedor y compartan momentos cotidianos de forma asíncrona.

> **📱 Jugable en el celular sin pagar licencias de App Store ni Play Store:**  
> Al ser una PWA construida en HTML5, CSS3 modular, TypeScript y React, podés abrirla directamente desde el navegador de tu celular (Chrome en Android o Safari en iOS) y presionar **"Agregar a la pantalla de inicio"** para jugarla a pantalla completa como una app nativa, con soporte fuera de línea y persistencia inmediata.

---

## 🌟 1. Cualidades Fundamentales del Juego

1. **Personalidad:** La mascota (*Pippo*, nombre personalizable) transmite sus emociones a través de expresiones visuales originales en SVG/CSS, ciclos de respiración, sacudidas de cola, reacciones a caricias y sonidos Web Audio integrados.
2. **Continuidad:** Las necesidades de la criatura se simulan matemáticamente a partir del tiempo transcurrido desde la última interacción, sin depender de procesos en segundo plano.
3. **Cooperación:** Exactamente dos integrantes comparten el mismo nido, la misma mascota, la misma economía de *Luceros* y una bitácora común.
4. **Descubrimiento:** Al entrar en horarios diferentes, podés descubrir qué hizo tu pareja, encontrar cartitas con stickers y desbloquear recuerdos.
5. **Tranquilidad (Cero Castigo):** La mascota **jamás muere ni retrocede de etapa** por inactividad. Si pasan 72 horas sin entrar, simplemente se mostrará despeinada o con sueño, y al regresar otorgará un bono de bienvenida con mucho cariño.

---

## 🏗️ 2. Arquitectura Técnica

- **Frontend:** React 18, TypeScript, Vite.
- **Dirección Artística:** Diorama 2D original con capas de profundidad, sombras suaves, paleta pastel basada en variables CSS (`#F7F3EC`, `#A9C7B1`, `#EFB7B5`, `#F3D88B`, etc.) y animaciones SVG/CSS puras.
- **Sonido:** Sintetizador Web Audio API puro (`src/services/sound.ts`) con sonidos de caricia, mordiscos, burbujas de baño y canciones de cuna nocturnas. No depende de archivos MP3 externos.
- **Motor Dual de Sincronización (`src/services/storage.ts`):**
  - **Modo Demostración / Local Inmediato:** Almacena el estado en `localStorage` e `IndexedDB`. Incluye un selector para alternar entre "Usuario 1 (Valen)" y "Usuario 2 (Sofi)" en el mismo navegador o dispositivo para probar notas, ritos y cuidados asíncronos inmediatamente sin necesidad de configurar nada.
  - **Modo Nube Compartida (Firebase):** Adaptador integrado para sincronización en tiempo real vía Cloud Firestore y Firebase Authentication.
- **Seguridad (`firestore.rules`):** Reglas de seguridad estrictas que limitan el acceso únicamente a los dos integrantes autenticados del espacio e impiden la sobreescritura de datos ajenos.
- **PWA:** `manifest.webmanifest`, service worker (`sw.js`) con estrategia de caché y soporte offline.
- **Pruebas Automatizadas:** Vitest (22 pruebas unitarias de simulación, economía, clamping, ausencia 24/48/72h y validación de tokens).

---

## 📱 3. Cómo Jugar en el Celular (PWA sin App Store)

No se requiere pagar suscripciones de desarrollador (Apple Developer Program de 99 USD/año ni Google Play Console):

### En Android (Google Chrome):
1. Abrí el enlace del juego en Chrome (por ejemplo, tu despliegue en Firebase Hosting, Vercel o la IP local de tu red Wi-Fi: `http://192.168.1.XX:4173`).
2. Tocá el menú de tres puntos (⋮) en la esquina superior derecha.
3. Seleccioná **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
4. ¡Listo! Se creará el ícono en tu pantalla de inicio y se abrirá a pantalla completa.

### En iPhone / iPad (Safari en iOS):
1. Abrí el enlace en Safari.
2. Tocá el botón de Compartir (el cuadrado con la flecha hacia arriba en la barra inferior).
3. Deslizá hacia abajo y seleccioná **"Agregar al inicio"** (o *"Add to Home Screen"*).
4. Asignale el nombre "Nuestro Nido" y confirmá. Podrás abrirlo sin barras de navegación de Safari.

---

## 🚀 4. Instalación y Ejecución Local

### Prerrequisitos
- Node.js (v18 o superior) y npm.

### Comandos Principales

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo con acceso a red local (para abrir desde el celu en la misma Wi-Fi)
npm run dev

# 3. Ejecutar suite de pruebas de lógica y simulación (22 pruebas)
npm test

# 4. Compilar versión de producción optimizada
npm run build

# 5. Previsualizar la versión de producción
npm run preview
```

> **💡 Probar en tu celular en la misma red Wi-Fi:**  
> Al ejecutar `npm run preview` o `npm run dev`, Vite muestra tu IP de red local (ejemplo: `http://192.168.1.98:4173/`). Abrí esa dirección en el navegador de tu celular conectado a la misma red Wi-Fi para jugar inmediatamente.

---

## ☁️ 5. Configuración de Firebase (Opcional para Nube Remota)

Por defecto el juego funciona de manera 100% autónoma en modo local. Si deseás sincronizar entre dos celulares a través de Internet:

1. Ingresá a la [Consola de Firebase](https://console.firebase.google.com/) y creá un proyecto gratuito (Plan Spark sin costo).
2. En **Authentication**, habilitá el proveedor **Anónimo** o **Correo electrónico/Contraseña**.
3. En **Firestore Database**, creá una base de datos en modo producción.
4. Creá un archivo `.env` en la raíz del proyecto copiando `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Completá las variables con tus credenciales de la consola:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=nuestro-nido.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=nuestro-nido
   VITE_FIREBASE_STORAGE_BUCKET=nuestro-nido.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
6. Desplegá las reglas de seguridad:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules
   ```
7. Para publicar la aplicación web gratis en Firebase Hosting:
   ```bash
   firebase init hosting
   # Seleccionar 'dist' como public directory y configurar como single-page app
   npm run build
   firebase deploy --only hosting
   ```

---

## 🎮 6. Secciones y Mecánicas

- **Nido (Pantalla Principal):** Diorama interactivo con iluminación día/noche, la criatura o huevo en su nido, medidores vitales rápidos, alacena y acciones de cuidado directo.
- **Cuidados:** Estación integral para alimentar (consume comida del inventario), bañar con esponja y burbujas, jugar o arropar para la siesta (+12/h de energía).
- **Diario Compartido:**
  - *Cartitas:* Mensajes cariñosos con stickers que el otro lee al abrir su sesión.
  - *Rito Diario:* Pregunta del día con mecánica de revelación conjunta (permanece oculta hasta que ambos responden).
  - *Bitácora:* Historial transparente de cuidados realizados por cada uno.
  - *Recuerdos:* Álbum de hitos alcanzados juntos (eclosión, compras, ritos).
- **Juegos:**
  - *Noche de Luciérnagas:* Minijuego de reflejos de 25 segundos para atrapar destellos en el jardín.
  - *Memoria del Nido:* Juego de cartas de memoria con objetos del hogar compartido.
- **Hogar & Despensa:**
  - *Habitación:* Colocar alfombras (lana tejida, margarita), plantas (Monstera, helecho), lámparas cálidas (hongo, guirnalda) y cuadros.
  - *Accesorios:* Equipar sombrerito de hoja, moño rosa, bufanda de lana o corona de flores.
  - *Despensa:* Comprar alimentos, muebles y accesorios utilizando los *Luceros* obtenidos jugando juntos.
- **Ajustes y Emparejamiento:** Generación de código de invitación seguro (`NIDO-XXXX`), unirse con código, alternar usuario local para pruebas, cambiar nombres y ajustar efectos sonoros.

---

## 📑 7. Documentación Técnica del Proyecto

- [`docs/REFERENCIAS_UXUI.md`](docs/REFERENCIAS_UXUI.md): Investigación comparativa de 15 productos (Widgetable, Lovegotchi, SumOne, Finch, Tamagotchi, Animal Crossing, etc.) con principios adaptados.
- [`docs/MODELO_DATOS.md`](docs/MODELO_DATOS.md): Esquemas TypeScript, colecciones de Firestore, reglas de integridad y persistencia.
- [`docs/REGLAS_JUEGO.md`](docs/REGLAS_JUEGO.md): Ecuaciones de degradación temporal, balance de necesidades, economía de Luceros y filosofía sin castigo.
- [`firestore.rules`](firestore.rules): Reglas declarativas de seguridad de Firestore para parejas de máximo 2 integrantes.
- [`docs/screenshots/`](docs/screenshots/): Evidencias visuales capturadas en resoluciones móviles, tablet y escritorio.
