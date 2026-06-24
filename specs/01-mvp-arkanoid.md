# SPEC 01 — MVP Arkanoid jugable

> **Estado:** approved · **Depende de:** ninguna · **Fecha:** 2026-06-23
> **Objetivo:** Implementar un juego de Arkanoid de nivel único y jugable en un canvas de 800×600 px, con paleta controlada por ratón y teclado, bola con física de rebote simple, cuadrícula de 10×6 bloques, 3 vidas, puntuación de 10 pts por bloque, y overlays de victoria/game over.

---

## Scope

**In:**

- Archivo `index.html` con canvas 800×600 px y carga de scripts
- Archivo `game.js` con todo el código del juego
- Paleta controlable con ratón (posición X) y teclado (flechas izquierda/derecha) de forma simultánea
- Bola en movimiento desde el inicio, velocidad fija, rebote predecible (ángulo de incidencia = ángulo de reflexión)
- Cuadrícula de bloques 10 columnas × 6 filas usando los colores del spritesheet
- Destrucción de bloques: desaparecen al ser golpeados (sin animación)
- Sistema de 3 vidas: se pierde una vida cuando la bola cae por el borde inferior
- Marcador de puntuación: 10 puntos por bloque destruido, visible durante la partida
- Overlay de victoria al destruir todos los bloques
- Overlay de game over al agotar las 3 vidas
- Ambos overlays con botón o tecla para reiniciar la partida

**Fuera del scope (para specs futuras):**

- Múltiples niveles o progresión de niveles
- Powerups / items especiales
- Efectos de sonido
- Animaciones de explosión al destruir bloques
- Persistencia de puntuación (localStorage o similar)
- Velocidad de bola variable o dificultad progresiva
- Pantalla de inicio separada
- Soporte táctil (touch)

---

## Data model

Todas las estructuras viven en memoria durante la partida y se resetean al reiniciar.

```js
// Bola
const ball = { x, y, vx, vy, radius }
// vx/vy: velocidad fija en píxeles por frame (ej. vx=4, vy=-4)

// Paleta
const paddle = { x, y, width, height, speed }
// x: borde izquierdo; speed: píxeles por frame para movimiento por teclado

// Bloque
const block = { x, y, width, height, color, alive }
// color: uno de 'red' | 'cyan' | 'green' | 'magenta' | 'yellow' | 'hotpink' | 'gray'
// alive: false cuando el bloque ha sido destruido

// Estado global
const state = { lives, score, status }
// status: 'playing' | 'win' | 'gameover'
```

Convenciones: origen de coordenadas en esquina superior izquierda; velocidades en píxeles/frame.

---

## Implementation plan

1. **Crear `index.html`** — canvas 800×600, carga de `assets/spritesheet.js` y `game.js`; fondo negro visible en el navegador.

2. **Crear `game.js` con bucle de juego** — `requestAnimationFrame` limpia y redibuja el canvas a 60 fps; nada más visible aún.

3. **Renderizar paleta e input** — paleta visible en posición inicial; se mueve con el ratón (posición X del cursor sobre el canvas) y con las flechas del teclado (izquierda/derecha) de forma simultánea; no puede salir del canvas.

4. **Renderizar bola y movimiento** — bola visible moviéndose en diagonal desde el inicio; aún no hay colisiones.

5. **Colisiones de la bola** — rebote contra paredes laterales, techo y paleta; la bola no atraviesa bordes.

6. **Renderizar cuadrícula de bloques** — 10 columnas × 6 filas usando `drawSprite`; colores asignados por fila; solo se dibujan los bloques con `alive = true`.

7. **Colisión bola-bloque** — al golpear un bloque: `alive = false`, rebote de la bola, `score += 10`; el marcador se actualiza en pantalla.

8. **Sistema de vidas** — si la bola sale por el borde inferior: `lives -= 1`, la bola vuelve al centro del canvas en movimiento diagonal; el contador de vidas se actualiza en pantalla.

9. **Overlays de victoria y game over** — si `lives === 0`: overlay de game over; si todos los bloques tienen `alive = false`: overlay de victoria; ambos muestran el puntaje final.

10. **Reinicio desde overlay** — tecla R o click en botón dentro del overlay resetea todo el estado a los valores iniciales y reanuda la partida.

---

## Acceptance criteria

- [ ] Abrir `index.html` en el navegador muestra un canvas de 800×600 px con la bola ya en movimiento.
- [ ] La paleta se mueve con el ratón (posición X del cursor sobre el canvas).
- [ ] La paleta se mueve con las flechas izquierda/derecha del teclado.
- [ ] Ambos controles funcionan simultáneamente sin interferirse.
- [ ] La paleta no sale de los bordes del canvas.
- [ ] La bola rebota en las paredes laterales y el techo sin atravesarlos.
- [ ] La bola rebota en la paleta.
- [ ] Se muestran 10 columnas × 6 filas de bloques al iniciar la partida.
- [ ] Al golpear un bloque, este desaparece y el marcador suma 10 puntos.
- [ ] El marcador de puntuación y el contador de vidas son visibles en todo momento durante la partida.
- [ ] Cuando la bola sale por el borde inferior, las vidas se reducen en 1 y la bola reaparece en movimiento.
- [ ] Al llegar a 0 vidas aparece el overlay de game over con el puntaje final.
- [ ] Al destruir todos los bloques aparece el overlay de victoria con el puntaje final.
- [ ] Desde cualquier overlay, presionar R o hacer click en el botón reinicia la partida completa.

---

## Decisions

| Decisión | Elegida | Descartada | Motivo |
| --- | --- | --- | --- |
| Número de niveles | 1 nivel fijo | Múltiples niveles, generación aleatoria | MVP: minimizar variables; los niveles van en una spec posterior |
| Velocidad de la bola | Fija toda la partida | Variable (aumenta con bloques o rebotes) | Evita trabajo de balance que no aporta al MVP |
| Inicio de la bola | En movimiento al abrir la página | Pegada a la paleta, lanzar con Espacio | Reduce fricción de inicio; el jugador entra directo al juego |
| Animación al destruir bloque | Ninguna (desaparece) | Explosión con frames del spritesheet | Suficiente para MVP; la animación puede añadirse después |
| Sonido | Sin audio | `ball-bounce.mp3` y `break-sound.mp3` | Fuera del alcance del MVP; se puede añadir en spec separada |
| Persistencia del score | Ninguna (solo visual) | localStorage | Innecesario para MVP; agrega complejidad sin valor de juego |
| Pantalla de inicio | Ninguna | Pantalla separada antes del juego | El canvas arranca directo; overlay de fin es suficiente |
| Controles | Ratón + teclado simultáneos | Solo ratón o solo teclado | Decisión cerrada por el usuario |

---

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Tunneling de la bola | Mantener velocidad inicial ≤5 px/frame; verificar que no atraviesa paleta ni bloques antes de subir velocidad |
| Colisión en esquina de bloque | Usar AABB simple y aceptar comportamiento aproximado para el MVP |
| Interferencia de controles simultáneos | Mantener estado booleano `leftPressed`/`rightPressed` actualizado por eventos `keydown`/`keyup`, independiente del ratón |
| `spritesheet.js` usa variables globales | Cargar `spritesheet.js` antes que `game.js` en el `<script>` del HTML |

---

## Lo que NO está en esta spec

- Múltiples niveles o progresión.
- Powerups de cualquier tipo.
- Efectos de sonido.
- Animaciones de explosión.
- Persistencia del puntaje entre sesiones.
- Soporte táctil.
- Pantalla de inicio separada.

Cada uno de estos, si llega, va en su propia spec.
