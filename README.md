# 🐣 Nuestro Nido | Mascota Compartida de a Dos

> **Un universo virtual compartido por dos personas para cuidar juntas una criatura digital.**
> Cero costos de licencia de App Store o Play Store, cero pasos de compilación (`buildless`), 100% web nativa y lista para desplegar en **GitHub Pages**.

---

## 🌟 Visión del Producto

**Nuestro Nido** es una experiencia íntima, cálida y relajada diseñada exclusivamente para dos personas que se conocen y quieren compartir la crianza de una mascota virtual (**Pippo**) y la decoración de su hogar en común.

- **Asíncrono y en tiempo real:** Cuando uno alimenta a Pippo o deja una cartita, el otro lo descubre al abrir la aplicación, sin necesidad de conectarse al mismo tiempo.
- **Cero Castigo y Piso Seguro (15%):** Si la pareja no entra por días o semanas, **Pippo nunca muere ni se pierde el progreso**. Al regresar tras una ausencia de 24 horas o más, la app otorga el **Bono Reencuentro (+15 Luceros)**.
- **Voz y Tono Rioplatense:** Textos redactados en español natural de Argentina, íntimo y relajado.
- **Sin Publicidad ni Compras In-App:** Economía 100% basada en el cuidado mutuo (los *Luceros* se ganan acariciando, alimentando, respondiendo el rito diario o jugando minijuegos).

---

## 🚀 Despliegue Inmediato en GitHub Pages (Cero Compilación)

El repositorio está estructurado en **HTML5, CSS3 y JavaScript ES6+ Modular nativo** sin requerir Node.js, TypeScript ni herramientas de empaquetado (`npm run build`).

### Pasos para publicar tu propio nido gratis:

1. **Subí este repositorio a GitHub** (público o privado).
2. Andá a **Settings** > **Pages** en tu repositorio.
3. En **Branch**, seleccioná `main` y la carpeta `/ (root)`.
4. Hacé clic en **Save**. En un minuto estará disponible en:
   ```text
   https://tu-usuario.github.io/tu-repositorio/
   ```
*(Todas las rutas de recursos, íconos, estilos y scripts son estrictamente relativas `./`, garantizando compatibilidad total tanto en la raíz como en subcarpetas).*

---

## 📱 Cómo Jugar en el Celular sin Pagar Licencias (PWA)

No necesitás pagar suscripciones de desarrollador de Apple (\$99/año) ni de Google Play (\$25):

1. **En iPhone (Safari):**
   - Abrí el enlace del juego.
   - Tocá el botón **Compartir** (icono de cuadrado con flecha hacia arriba).
   - Seleccioná **"Agregar a pantalla de inicio"**.
   - ¡Listo! Se abrirá a pantalla completa como una app nativa con su icono.

2. **En Android (Chrome):**
   - Abrí el enlace del juego.
   - Tocá los tres puntos del menú superior derecho.
   - Seleccioná **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.

---

## 🗂️ Estructura del Repositorio

```text
/
├── index.html                  # Shell HTML5 semántico y accesible
├── css/
│   └── styles.css              # Hoja de estilos responsiva, diorama y animaciones
├── js/
│   ├── config.js               # Catálogos, tasas de degradación y preguntas diarias
│   ├── pet.js                  # Sintetizador Web Audio API puro y arte SVG de 4 etapas
│   ├── game.js                 # Motor de simulación determinista y Suite QA (25 tests)
│   ├── storage.js              # Persistencia local, BroadcastChannel y multijugador local
│   ├── sync.js                 # Integración CDN Firebase v10 y resiliencia offline
│   └── app.js                  # Controlador central de la interfaz y minijuegos
├── assets/
│   └── icons/
│       └── icon.svg            # Icono vectorial oficial del nido
├── docs/
│   ├── AUDITORIA_QA.md         # Informe senior con matriz de defectos (DEF-01 a DEF-08)
│   ├── REFERENCIAS_UXUI.md     # Benchmarks de Widgetable, SumOne, Lovegotchi, etc.
│   ├── MODELO_DATOS.md         # Esquema de entidades, invariantes y flujos
│   ├── REGLAS_JUEGO.md         # Ecuaciones matemáticas y mecánicas de bienestar
│   └── screenshots/            # Capturas de auditoría multi-resolución
├── manifest.json               # Manifiesto Web PWA
├── sw.js                       # Service Worker para ejecución offline
├── firestore.rules             # Reglas endurecidas anti-secuestro de hogar
├── .gitignore                  # Exclusiones estándar
└── README.md                   # Documentación principal
```

---

## 🐣 Las 4 Etapas Evolutivas de Pippo

1. **Huevo Tibio:** Pulsa suavemente en el nido de paja y hojas. Con 3 interacciones de cuidado o caricias, el cascarón se agrieta y eclosiona.
2. **Bebé Pippo:** Criatura adorable con proporciones redondeadas, mejillas sonrosadas y colita esponjosa.
3. **Pippo Joven:** Orejitas vivaces, mechón juguetón en la cabeza y animaciones más dinámicas al jugar.
4. **Pippo Adulto:** Plumaje suave completo, alas mullidas y penacho distinguido.

---

## 💖 Mecánicas Principales

- **Diorama Vivo:** Escenario 2D interactivo con ventana que refleja el día y la noche, suelo de madera cálida, alfombra, plantas, lámpara hongo y cuadro de estrellas.
- **Cuidados Rápidos:** Caricias directas tocando a Pippo (con ronroneo Web Audio y partículas flotantes de corazones), alimentación, baño tibio con burbujas y modo siesta.
- **Diario Compartido:**
  - *Cartitas:* Buzón de notas de amor con stickers intercambiables.
  - *Rito Diario:* Una pregunta cotidiana para responder de a dos. La respuesta de la pareja se revela una vez que ambos contestan.
  - *Álbum de Recuerdos:* Registro de los grandes momentos compartidos (llegada al nido, eclosión, primer accesorio, etc.).
- **Minijuegos Cooperativos:**
  - *Noche de Luciérnagas:* Atrapá destellos en el jardín nocturno (hasta +25 Luceros).
  - *Memoria del Nido:* Emparejá los 6 pares de objetos acogedores (+30 Luceros).
- **Hogar y Armario:** Comprá comiditas, muebles y accesorios (sombrerito de hoja, moño rosa, bufanda de lana, corona de flores silvestre) en la tienda con los Luceros acumulados.

---

## 🧪 Suite de Pruebas Automatizadas QA (25 Tests)

El juego cuenta con un arnés de pruebas integrado en `js/game.js` que verifica todas las invariantes matemáticas y de seguridad:

1. **Desde la App:** En la pestaña **Ajustes** > botón **"Ejecutar Suite QA Completa"**.
2. **Por URL:** Abrí la página añadiendo `?test=true` (ej: `http://localhost:8080/?test=true`).
3. **Por consola (Node.js):**
   ```bash
   node -e "import('./js/game.js').then(m => console.log(JSON.stringify(m.runAutomatedAuditTests(), null, 2)))"
   ```
   **Resultado:** `25 / 25 Tests Aprobados (100% Pass)`.

---

## 🔒 Seguridad y Sincronización Remota (`firestore.rules`)

Si la pareja desea sincronizar en tiempo real a través de internet:
1. Crean un proyecto gratuito en [Firebase Console](https://console.firebase.google.com/).
2. Copian la configuración pública en la pestaña **Ajustes > Sincronización en la Nube**.
3. Las reglas en `firestore.rules` mitigan vulnerabilidades críticas:
   - **DEF-03:** Bloqueo de secuestro de hogar e inmutabilidad de los miembros iniciales.
   - **DEF-04:** Bloqueo de enumeración de códigos de invitación y prevención de auto-canje.
   - **DEF-05:** Bloqueo de enumeración de perfiles y restricción de alteración de cartitas ajenas.

---

*Desarrollado con dedicación para disfrutar en pareja.*
