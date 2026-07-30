# SPEC 03 — Sistema de niveles

> **Estado:** Approved · **Depende de:** 01-mvp-arkanoid, 02-sound-effects · **Fecha:** 2026-07-29
> **Objetivo:** Añadir un sistema de 3 niveles al Arkanoid, donde al destruir todos los bloques se muestra una transición breve y se pasa al siguiente nivel manteniendo puntuación y vidas —variando patrón de bloques, número de filas y velocidad de la bola por nivel—, mostrando la pantalla de "¡GANASTE!" solo al completar el último nivel.

---

## Scope

**In:**

- Sistema de 3 niveles, cada uno con su propio patrón de bloques (matriz de strings), número de filas y velocidad de bola
- Al destruirse todos los bloques vivos de un nivel (y no es el último), se muestra un overlay breve de transición "¡Nivel X!" durante ~1.5s (automático, sin input) y luego arranca el siguiente nivel
- Al pasar de nivel: se mantienen `score` y `lives` actuales; bola y paleta vuelven a posición inicial; la bola toma la velocidad definida para el nuevo nivel
- HUD durante la partida muestra "Nivel X" además de puntaje y vidas
- Al destruirse todos los bloques del **último** nivel (nivel 3), se muestra el overlay de victoria "¡GANASTE!" existente, con el puntaje final
- Reinicio (tecla R / botón) desde el overlay de victoria o game over vuelve siempre al **nivel 1** con `score = 0`, `lives = 3`

**Fuera del scope:**

- Persistencia del nivel alcanzado entre sesiones (localStorage o similar)
- Selección manual de nivel (menú de niveles)
- Más de 3 niveles o generación procedural de patrones
- Powerups o cualquier variación de mecánica más allá de patrón/filas/velocidad
- Ajustar velocidad de bola dentro de un mismo nivel (solo cambia al transicionar de nivel)
- Animaciones o sonidos nuevos asociados a la transición de nivel

---

## Data model

```js
// Configuración de niveles (nueva constante en game.js)
const LEVELS = [
  {
    speed: { vx: 2.5, vy: -2.5 },
    pattern: [
      'RRRRRRRRRR',
      'CCCCCCCCCC',
      'GGGGGGGGGG',
      'MMMMMMMMMM',
    ],
  },
  {
    speed: { vx: 3, vy: -3 },
    pattern: [
      'RR..RR..RR',
      '.CCCCCCCC.',
      'GGG....GGG',
      'YYYYYYYYYY',
      'HHHH..HHHH',
    ],
  },
  {
    speed: { vx: 3.5, vy: -3.5 },
    pattern: [
      '.RRRRRRRR.',
      'RR.CCCC.RR',
      'C.GGGGGG.C',
      'GYYYYYYYYG',
      'YMMMMMMMMY',
      'MHHHHHHHHM',
      'HAAAAAAAAH',
      'AAAAAAAAAA',
    ],
  },
];

// Letra → color del spritesheet; '.' = sin bloque en esa celda
const COLOR_MAP = { R: 'red', C: 'cyan', G: 'green', M: 'magenta', Y: 'yellow', H: 'hotpink', A: 'gray' };

// Estado global (extiende el existente)
const state = { lives, score, status, level, transitionFramesLeft }
// status: 'playing' | 'transition' | 'win' | 'gameover'
// level: índice 1-based del nivel actual (1, 2 o 3)
// transitionFramesLeft: frames restantes del overlay "¡Nivel X!" (90 frames ≈ 1.5s a 60fps); 0 cuando no aplica
```

Notas:

- `BLOCK_COLS` sigue fijo en 10; cada string de `pattern` debe tener exactamente 10 caracteres. El número de filas surge de `pattern.length` (varía 4–8 entre niveles).
- `block` conserva su forma actual (`{ x, y, width, height, color, alive }`); solo cambia cómo se generan (`createBlocksFromPattern` en vez de `createBlocks` fijo).
- `ball.vx`/`ball.vy` se inicializan según `LEVELS[state.level - 1].speed` en vez de una constante fija.
- El contador `transitionFramesLeft` reemplaza el uso de `setTimeout`, para que quede sincronizado con el loop de `requestAnimationFrame` y no cause condiciones de carrera si el jugador reinicia durante la transición.

---

## Implementation plan

1. **Añadir configuración de niveles** — declarar `LEVELS`, `COLOR_MAP`, y los campos `level = 1`, `transitionFramesLeft = 0` en `state`; sin uso todavía, el juego arranca igual que antes.
2. **Generar bloques desde el patrón** — sustituir `createBlocks()` por `createBlocksFromPattern(pattern)`, que recorre cada fila/columna del patrón y crea un bloque por celda distinta de `.` usando `COLOR_MAP`; se llama con `LEVELS[0].pattern` al iniciar. El nivel 1 se ve con su nuevo patrón de 4 filas.
3. **Velocidad de bola por nivel** — al inicializar o resetear la bola, usar `LEVELS[state.level - 1].speed` en vez del valor fijo actual.
4. **Detectar fin de nivel vs fin de juego** — donde hoy se comprueba `blocks.every(b => !b.alive)` para pasar a `'win'`: si `state.level < LEVELS.length`, pasar a `status = 'transition'` con `transitionFramesLeft = 90`; si es el último nivel, mantener el comportamiento actual (`status = 'win'`).
5. **Loop de transición** — en `update()`, si `status === 'transition'`: decrementar `transitionFramesLeft`; al llegar a 0, incrementar `state.level`, regenerar `blocks` con el patrón del nuevo nivel, reposicionar bola y paleta al centro/inicio con la velocidad del nuevo nivel, y volver a `status = 'playing'`.
6. **Render del overlay de transición** — en el render, si `status === 'transition'`, dibujar un overlay centrado con el texto "¡Nivel X!" (mismo estilo visual que los overlays existentes), sin botón ni instrucción de tecla.
7. **HUD con nivel actual** — añadir "Nivel X" al HUD existente junto al puntaje y las vidas, visible en `'playing'` y `'transition'`.
8. **Reinicio vuelve a nivel 1** — en `restart()`, fijar `state.level = 1`, `transitionFramesLeft = 0`, regenerar `blocks` desde `LEVELS[0].pattern` y la velocidad de bola desde `LEVELS[0].speed`, junto con el reset ya existente de `score` y `lives`.

---

## Acceptance criteria

- [ ] El nivel 1 arranca con el patrón, número de filas y velocidad de bola definidos en `LEVELS[0]`.
- [ ] Al destruir todos los bloques del nivel 1, aparece un overlay "¡Nivel 2!" (sin necesidad de presionar nada).
- [ ] Tras ~1.5s, el overlay de transición desaparece automáticamente y arranca el nivel 2 con su propio patrón, filas y velocidad de bola.
- [ ] Al pasar del nivel 1 al nivel 2, `score` y `lives` mantienen su valor (no se resetean).
- [ ] Al pasar de nivel, la bola y la paleta vuelven a su posición inicial, y la bola se mueve con la velocidad del nuevo nivel.
- [ ] El mismo comportamiento de transición se repite al completar el nivel 2 (pasa a nivel 3 con su patrón/filas/velocidad propios).
- [ ] Al destruir todos los bloques del nivel 3 (el último), se muestra el overlay de "¡GANASTE!" con el puntaje final, no una transición.
- [ ] Si las vidas llegan a 0 en cualquier nivel (1, 2 o 3), se muestra el overlay de game over con el puntaje final, igual que en el MVP.
- [ ] El HUD muestra "Nivel X" junto al puntaje y las vidas durante el juego (`playing` y `transition`).
- [ ] Al reiniciar (tecla R o botón) desde el overlay de victoria o game over, el juego vuelve siempre al nivel 1, con `score = 0` y `lives = 3`.
- [ ] Ningún bloque queda huérfano fuera de la cuadrícula ni se rompe el layout visual en niveles con huecos (`.`) en el patrón.

---

## Decisions

| Decisión | Elegida | Descartada | Motivo |
| --- | --- | --- | --- |
| Número de niveles | 3 niveles fijos | 5 o más | Cantidad pequeña, fácil de diseñar y probar rápido; escalable después en otra spec |
| Representación del patrón de bloques | Matriz de strings (una string por fila) | Función generadora por nivel; solo variar filas/colores sobre la cuadrícula uniforme | Legible y editable a mano, permite huecos sin código adicional por nivel |
| Filas por nivel | Variable, entre 4 y 8 | Fijo en 6 (como el MVP) | Permite escalar dificultad visualmente además de la velocidad |
| Columnas por nivel | Fijas en 10 | Variable por nivel | Mantiene el layout horizontal consistente entre niveles; simplifica el cálculo de posiciones |
| Mapeo de caracteres a color | Inicial de color (R, C, G, M, Y, H) + `.` para hueco | Números (1-7) + `0` para hueco | Más legible al escribir/leer patrones a mano |
| Letra para el color `gray` | `A` | `W` | Evita confusión con posibles usos futuros de `W` (ej. "white"); `A` es arbitraria pero sin colisión |
| Velocidad de bola por nivel | Progresiva (aumenta en cada nivel) | Fija en todos los niveles | Refuerza la escalada de dificultad junto con más filas/patrones más densos |
| Transición entre niveles | Overlay breve "¡Nivel X!" automático (~1.5s, sin input) | Inmediato sin pausa; requiere tecla/click para continuar | Da feedback claro del cambio de nivel sin interrumpir el flujo de juego con una acción manual |
| Posición de bola/paleta al iniciar nivel | Se resetean a posición inicial | Continúan desde su posición/trayectoria actual | Consistente con el reset ya existente al perder una vida; evita transiciones de física confusas |
| Indicador de nivel en el HUD | Visible permanentemente ("Nivel X") | Solo visible durante la transición | Consistente con que puntaje y vidas ya son visibles todo el tiempo |
| Nivel al reiniciar partida | Siempre vuelve a nivel 1 | Recordar el último nivel alcanzado | Persistencia de nivel queda fuera de scope (ver spec futura); mantiene el reinicio simple como en el MVP |
| Persistencia del nivel alcanzado | Fuera de scope | localStorage con nivel/puntaje guardado | El usuario no la pidió; se puede añadir en una spec posterior de puntuaciones/persistencia |

---

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Reinicio (tecla R) durante el overlay de transición deja el estado inconsistente | `restart()` siempre fuerza `status = 'playing'`, `level = 1` y `transitionFramesLeft = 0`, sin importar el estado previo |
| Una fila del patrón con menos/más de 10 caracteres desalinea la cuadrícula | Los 3 patrones de `LEVELS` se validan manualmente al escribirlos (10 caracteres exactos por fila); no se agrega validación en runtime por ser data estática y controlada |
| Velocidad de bola creciente en niveles avanzados provoca tunneling a través de la paleta o bloques | Incrementos moderados por nivel (ej. +0.5 px/frame) manteniendo valores dentro del rango ya validado como seguro en la spec 01 |
| Patrones con huecos (`.`) dejan zonas vacías que podrían verse como error visual en vez de diseño intencional | Los patrones se diseñan con huecos simétricos y reconocibles como parte del nivel, no como bloques faltantes por bug |
