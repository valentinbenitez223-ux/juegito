# Reglas de Juego y Simulación: Nuestro Nido
## Mecánicas, Balance y Progresión Asíncrona

Este documento define el comportamiento matemático de las necesidades, la simulación temporal fuera de línea, la economía de luceros, la evolución de la criatura y las actividades compartidas.

---

### 1. Variables de Estado de la Mascota

La criatura posee 5 medidores vitales (rango estricto **10 a 100**):

| Necesidad | Significado | Tasa de Caída por Hora (Despierta) | Tasa de Caída por Hora (Durmiendo) | Estado Crítico (< 25) |
| :--- | :--- | :--- | :--- | :--- |
| **Hambre** | Saciedad nutricional | -3.5 puntos / hora | -1.5 puntos / hora | Busca su plato, pancita rugiente |
| **Higiene** | Limpieza personal y entorno | -2.5 puntos / hora | -0.8 puntos / hora | Pequeñas manchitas, sacudidas |
| **Energía** | Vigor y descanso | -3.0 puntos / hora | **+12.0 puntos / hora (recuperación)** | Bosteza, ojos entrecerrados |
| **Diversión** | Estimulación y alegría | -3.0 puntos / hora | 0.0 puntos / hora | Se distrae mirando al vacío |
| **Comodidad** | Bienestar del nido y afecto | -1.5 puntos / hora | -0.5 puntos / hora | Se acurruca en la manta |

#### Principio Fundamental de Ausencia (Cero Castigo)
- Las necesidades decaen de forma asíncrona usando la fórmula:
  $$\Delta t = \frac{\text{now} - \text{lastNeedsUpdate}}{3600000 \text{ ms}}$$
  $$\text{nuevaNecesidad} = \max(10, \min(100, \text{necesidadAnterior} + \text{tasa} \times \Delta t))$$
- El piso mínimo es **10 puntos**. La mascota **jamás muere ni retrocede de etapa** por ausencia.
- Si ambos usuarios pasan 72 horas sin entrar:
  - Hambre: 10/100 (muy hambriento, pero inmediatamente recuperable)
  - Higiene: 10/100 (necesita una linda sesión de baño con burbujas)
  - Energía: Si quedó durmiendo, 100/100; si quedó despierta, 10/100
  - Diversión: 10/100
  - Comodidad: 10/100
- **Bono de Reencuentro:** Al iniciar sesión después de más de 24 horas de ausencia, la mascota saluda con alegría y otorga un regalo de bienvenida de **+25 Luceros** y un bocadillo dulce en el inventario.

---

### 2. Acciones de Cuidado y Efectos

| Acción | Efecto en Necesidades | Requisito / Costo | Recompensa en Luceros | Reacción Visual |
| :--- | :--- | :--- | :--- | :--- |
| **Alimentar** | Hambre: +30 a +45<br>Energía: +5<br>Comodidad: +5 | Consume 1 ítem de comida | +5 Luceros | Mastica feliz, corazones pequeños, relame labios |
| **Acariciar** | Comodidad: +20<br>Diversión: +10 | Ninguno (enfriamiento: 10s para luceros) | +3 Luceros | Ronronea, guiña el ojo, ondas de ternura |
| **Bañar / Limpiar** | Higiene: +45<br>Comodidad: +15 | Ninguno | +5 Luceros | Burbujas flotantes, brillo corporal |
| **Jugar** | Diversión: +35<br>Comodidad: +10<br>Energía: -15 | Energía mínima > 15 | +8 Luceros | Saltitos, pirueta en el aire, sonrisa amplia |
| **Dormir / Arropar** | Activa modo sueño (`isSleeping: true`)<br>Recupera energía (+12/h) | Solo si despierta | +5 Luceros | Luz tenue, manta cálida, respiración lenta con *zzz* |
| **Despertar** | Desactiva modo sueño (`isSleeping: false`) | Solo si durmiendo | - | Estiramiento placentero, bostezo suave |

---

### 3. Fases Evolutivas

1. **Huevo del Nido (Fase 1):**
   - La criatura comienza en un cascarón color crema con motitas doradas.
   - Pulsa suavemente al compás de un latido sereno.
   - Requiere **3 cuidados conjuntos** (por ejemplo: acariciar, arrullar y dejar una nota) para agrietarse y eclosionar.
   - Al eclosionar se dispara una celebración de confeti y se desbloquea el recuerdo *"¡Hola, mundo!"*.

2. **Bebé Nido (Fase 2):**
   - Criatura tierna con patitas redondeadas, orejitas suaves y cola esponjosa.
   - Abre todas las acciones de cuidado y los minijuegos.
   - Eclosiona entre las primeras 24 horas de uso compartido.

3. **Joven Nido (Fase 3):**
   - Se alcanza tras acumular **25 interacciones de cuidado conjuntas**.
   - Permite personalizar accesorios (gorritos, moños, bufandas) y cambiar su paleta de color.

4. **Guardián del Nido (Fase 4):**
   - Se alcanza con **75 interacciones conjuntas** y 3 días de ritos diarios respondidos.
   - Desbloquea transformaciones estacionales del entorno (jardín primaveral, chimenea invernal).

---

### 4. Economía del Hogar: "Luceros"

Los Luceros son la moneda del universo de Nuestro Nido. Se obtienen exclusivamente cuidando a la criatura y jugando juntos:
- Acción de cuidado: **+3 a +8 Luceros** (límite saludable: máximo 100 Luceros/día por acciones básicas para evitar bucles compulsivos).
- Minijuego "Atrapa Luciérnagas": **+10 a +25 Luceros** según la puntuación.
- Minijuego "Memoria del Nido": **+15 a +30 Luceros** al completar el tablero.
- Rito Diario: **+20 Luceros** al responder.

#### Tienda del Nido (Precios Balanceados)
- **Comidas Ricas:**
  - Manzanita dulce (+30 Hambre): 5 Luceros
  - Bayas del bosque (+35 Hambre): 8 Luceros
  - Panqueque con miel (+50 Hambre): 15 Luceros
  - Té de manzanilla (+20 Hambre, +25 Energía): 12 Luceros
- **Decoración de la Habitación:**
  - Alfombra de lana tejida: 40 Luceros
  - Planta Monstera en maceta: 50 Luceros
  - Lámpara hongo cálida: 60 Luceros
  - Cuadro de constelación: 75 Luceros
- **Accesorios para la Mascota:**
  - Sombrerito de hoja: 45 Luceros
  - Moño rosa pastel: 45 Luceros
  - Bufanda de lana suave: 55 Luceros
  - Corona de flores: 70 Luceros
