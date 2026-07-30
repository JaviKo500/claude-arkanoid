# SPEC 04 — Selector de niveles

> **Estado:** Approved · **Depende de:** 01-mvp-arkanoid, 02-sound-effects, 03-levels-system · **Fecha:** 2026-07-29
> **Objetivo:** Añadir una pantalla de selección de nivel al cargar la página (y al reiniciar con R) donde el usuario elige, haciendo click sobre un botón numerado, entre 5 niveles —los 3 existentes más 2 nuevos con patrones de bloques distintos—, arrancando siempre con `score = 0` y `lives = 3` desde el nivel elegido y continuando la progresión secuencial normal por los niveles restantes hasta el final.

---

## Scope

**In:**

- Pantalla de selección de nivel (`status: 'menu'`) que se muestra al cargar la página, con 5 botones numerados (1-5) dibujados en el canvas, uno por cada nivel disponible
- Los 5 niveles están siempre desbloqueados (sin lógica de progreso ni bloqueo)
- Click sobre un botón de nivel: arranca la partida en ese nivel con su patrón/filas/velocidad propios, `score = 0`, `lives = 3`, bola y paleta en posición inicial
- Tras completar el nivel elegido manualmente, la progresión continúa en secuencia por los niveles siguientes (igual que hoy), mostrando "¡GANASTE!" solo al completar el nivel 5 (el último)
- Tecla R y click en overlays de game over/victoria ahora llevan de vuelta a la pantalla de selección de nivel (`status: 'menu'`), no directo a nivel 1
- 2 niveles nuevos (4 y 5) añadidos al final de `LEVELS`, con patrón de bloques, número de filas y velocidad de bola propios, continuando la progresión de dificultad existente (más filas/densidad, mayor velocidad)

**Fuera del scope:**

- Persistencia de niveles desbloqueados o progreso entre sesiones (localStorage o similar)
- Bloqueo/desbloqueo progresivo de niveles según progreso
- Selección de nivel mediante teclado (solo click)
- Miniaturas o previsualización visual del patrón de bloques en los botones del selector
- Más de 5 niveles o generación procedural de patrones
- Powerups o variaciones de mecánica más allá de patrón/filas/velocidad
- Cambiar de nivel manualmente durante una partida en curso (solo se elige al inicio, desde el selector)

---

## Data model

```js
// Estado global (agrega 'menu' como nuevo valor posible de status)
const state = { lives, score, status, level, transitionFramesLeft }
// status: 'menu' | 'playing' | 'transition' | 'win' | 'gameover'
// status inicial ahora es 'menu' (antes era 'playing' directamente)

// LEVELS crece de 3 a 5 elementos; los niveles 1-3 no cambian.
const LEVELS = [
  /* ...nivel 1, 2, 3 sin cambios... */
  {
    speed: { vx: 3.5, vy: -3.5 },
    pattern: [
      'RR......RR',
      '.CC....CC.',
      '..GG..GG..',
      '...MMMM...',
      '..YY..YY..',
      '.HH....HH.',
    ],
  }, // nivel 4 — patrón "reloj de arena" (6 filas)
  {
    speed: { vx: 4.0, vy: -4.0 },
    pattern: [
      'RR........',
      'CCRR......',
      '.CCGG.....',
      '..GGMM....',
      '...MMYY...',
      '....YYHH..',
      '.....HHAA.',
      '......AAAA',
      'AAAAAAAAAA',
    ],
  }, // nivel 5 — patrón "escalera diagonal" (9 filas)
];

// Botones del selector de nivel (nueva constante, calculada una sola vez)
// Grilla horizontal de 5 botones de 100x100px, separados por 20px, centrada en el canvas
const LEVEL_BUTTON_SIZE = 100;
const LEVEL_BUTTON_GAP = 20;
const LEVEL_BUTTONS_OFFSET_X = (W - (LEVELS.length * LEVEL_BUTTON_SIZE + (LEVELS.length - 1) * LEVEL_BUTTON_GAP)) / 2;
const LEVEL_BUTTONS_Y = H / 2 - LEVEL_BUTTON_SIZE / 2;
// LEVEL_BUTTONS[i] = { index: i (0-based, nivel = index + 1), x, y, width, height }
// x de cada botón = LEVEL_BUTTONS_OFFSET_X + i * (LEVEL_BUTTON_SIZE + LEVEL_BUTTON_GAP)
```

Notas:

- `LEVEL_BUTTONS` se calcula una vez a partir de `LEVELS.length`, no hardcodeado a 5, así si en el futuro cambia la cantidad de niveles el layout se recalcula solo.
- Los niveles 4 y 5 reutilizan las mismas 7 letras de color (`COLOR_MAP` no cambia), solo varían patrón/filas/velocidad.
- No se agrega ninguna estructura de "nivel desbloqueado" — los 5 botones siempre son clickeables.

---

## Implementation plan

1. **Extender `LEVELS` con los niveles 4 y 5** — el juego sigue arrancando igual que hoy (en `'playing'`, nivel 1), pero ahora la secuencia normal de transición continúa hasta el nivel 5 antes de mostrar "¡GANASTE!".
2. **Agregar el estado `'menu'` y la pantalla de selección** — declarar `LEVEL_BUTTON_SIZE`, `LEVEL_BUTTON_GAP`, `LEVEL_BUTTONS_OFFSET_X`, `LEVEL_BUTTONS_Y` y `LEVEL_BUTTONS`; crear `drawLevelSelector()` que dibuja fondo + 5 botones numerados ("1".."5"), invocada desde `draw()` cuando `status === 'menu'`; cambiar el `status` inicial de `state` a `'menu'` y hacer que `update()` retorne temprano en ese estado (igual que ya hace para otros status distintos de `'playing'`).
3. **Implementar `startLevel(index)`** — función que fija `state.level = index + 1`, `state.score = 0`, `state.lives = 3`, regenera `blocks` desde `LEVELS[index].pattern`, resetea bola y paleta con la velocidad de ese nivel, y pasa `status` a `'playing'`.
4. **Conectar clicks del selector** — en el listener de click del canvas, si `status === 'menu'`, calcular la posición del click relativa al canvas y, si cae dentro del área de algún `LEVEL_BUTTONS[i]`, llamar `startLevel(i)`. El juego ya es jugable de punta a punta eligiendo cualquier nivel desde el selector.
5. **Reconectar `restart()` al selector** — cambiar `restart()` para que, en vez de resetear directo a nivel 1 con `status = 'playing'`, solo fije `status = 'menu'` (dejando que `startLevel` se encargue de score/lives/blocks/bola cuando el usuario elija un nivel); actualizar el listener de click del canvas para que, si `status` es `'gameover'` o `'win'`, siga llamando a `restart()` (y ya no dispare `restart()` si `status === 'transition'`, evitando el reinicio accidental durante la transición entre niveles).
6. **Ocultar el HUD de nivel en el menú** — asegurar que "Nivel X" del HUD no se dibuje mientras `status === 'menu'` (sí se sigue mostrando en `'playing'` y `'transition'`, como hoy).

---

## Acceptance criteria

- [ ] Al cargar la página, se muestra la pantalla de selección con 5 botones numerados "1" a "5" en vez de arrancar el juego directamente.
- [ ] Al hacer click en el botón "1", el juego arranca en el nivel 1 con su patrón, filas y velocidad definidos, `score = 0` y `lives = 3`.
- [ ] Al hacer click en cualquier otro botón (2, 3, 4 o 5), el juego arranca directamente en ese nivel con su propio patrón, filas y velocidad, `score = 0` y `lives = 3`.
- [ ] Los niveles 4 y 5 tienen patrones de bloques visualmente distintos entre sí y respecto de los niveles 1-3 (reloj de arena y escalera diagonal), con más filas y bola más rápida que el nivel anterior.
- [ ] Al completar el nivel elegido manualmente (por ejemplo, empezar en nivel 2), la partida continúa en secuencia por los niveles siguientes (3, 4, 5) igual que hoy, sin volver al selector entre niveles.
- [ ] Al destruir todos los bloques del nivel 5 (el último), se muestra el overlay "¡GANASTE!" con el puntaje final.
- [ ] Si las vidas llegan a 0 en cualquier nivel (1 a 5), se muestra el overlay de game over con el puntaje final, igual que antes.
- [ ] Al presionar R o hacer click sobre el overlay de game over o victoria, el juego vuelve a la pantalla de selección de niveles (no directo a nivel 1).
- [ ] Mientras está la pantalla de selección visible, el HUD (puntaje, nivel, vidas) no se dibuja.
- [ ] Un click durante la transición entre niveles ("¡Nivel X!") no reinicia la partida ni la interrumpe.
- [ ] Los 5 botones del selector son clickeables en toda su área (100x100px) y quedan centrados horizontalmente en el canvas.

---

## Decisions

| Decisión | Elegida | Descartada | Motivo |
| --- | --- | --- | --- |
| Momento de mostrar el selector | Al cargar la página, antes de jugar | Pantalla intermedia solo accesible desde un menú aparte | Más simple e intuitivo; no agrega un estado extra de navegación |
| Desbloqueo de niveles | Todos desbloqueados siempre | Desbloqueo progresivo según nivel alcanzado | Persistencia queda fuera de scope; bloquear niveles sin guardar progreso se perdería en cada recarga y sería confuso |
| Puntaje/vidas al elegir nivel manualmente | Siempre arrancan en `score = 0`, `lives = 3` | Mantener el puntaje de la partida anterior | Evita arrastrar estado de una partida distinta; consistente con cómo ya funciona el reinicio |
| Progresión tras elegir nivel manualmente | Continúa en secuencia por los niveles siguientes hasta el 5 | Volver al selector after cada nivel completado | Mantiene el comportamiento de flujo continuo ya validado en la spec 03; el selector solo define el punto de partida |
| Método de selección | Click sobre botones numerados en el canvas | Teclado (teclas 1-5) | Consistente con la interacción ya usada en el juego (click para reiniciar); más simple de implementar |
| Cantidad de niveles nuevos | 2 (total 5) | Solo 1, o más de 2 | Pedido explícito del usuario; cantidad manejable para diseñar patrones distintos a mano |
| Posición de los niveles nuevos | Al final (4 y 5), continuando la progresión de dificultad | Insertados entre los existentes | Mantiene la progresión de dificultad ya validada (velocidad y densidad crecientes) sin reordenar niveles ya probados |
| Formas de los niveles 4 y 5 | "Reloj de arena" (nivel 4) y "escalera diagonal" (nivel 5) | Reutilizar formas ya usadas en niveles 1-3 con otro color | Formas nuevas y reconocibles, distintas entre sí y de las existentes (barras sólidas, huecos, pirámide) |
| Destino de `restart()` (tecla R / click en overlays) | Vuelve a la pantalla de selección de nivel | Vuelve directo a nivel 1 (comportamiento actual) | Pedido explícito del usuario; hace que el selector sea el punto de entrada consistente después de cualquier partida |
| Comportamiento del click durante `'transition'` | No hace nada (ya no dispara `restart()`) | Mantener el comportamiento actual (click durante transición reinicia) | Efecto colateral necesario al diferenciar clicks de `'menu'` de clicks de fin de partida; evita un reinicio accidental durante la transición automática |
| Miniaturas/preview de patrón en los botones | No incluidas | Mostrar una vista previa en miniatura del patrón de cada nivel | Fuera de scope explícito; los botones solo muestran el número de nivel |

---

## Risks

| Riesgo | Mitigación |
| --- | --- |
| El cálculo de coordenadas de click sobre los botones del selector no coincide con el tamaño real del canvas si este se escala por CSS | El canvas se usa a tamaño fijo (800x600, sin CSS que lo escale) igual que el resto de listeners de mouse existentes (`mousemove` de la paleta ya usa `getBoundingClientRect()` de la misma forma) |
| El patrón de 9 filas del nivel 5 podría no entrar visualmente en el canvas o superponerse con la paleta | Con `BLOCKS_OFFSET_Y = 60`, `BLOCK_H = 22` y `BLOCK_GAP = 4`, 9 filas ocupan hasta y=294, muy por debajo de la paleta (y=560); se valida manualmente al probar el nivel 5 |
| Cambiar `restart()` para que lleve a `'menu'` en vez de a nivel 1 podría dejar el juego en un estado no jugable si algún código externo asumía que tras `restart()` el status siempre es `'playing'` | Solo `restart()` y el listener de click lo invocan; se revisan ambos puntos de uso en el mismo cambio (paso 5 del plan) |
