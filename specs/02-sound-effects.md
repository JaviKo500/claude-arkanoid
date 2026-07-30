# SPEC 02 — Efectos de sonido

> **Estado:** Implemented · **Depende de:** 01-mvp-arkanoid · **Fecha:** 2026-07-29
> **Objetivo:** Añadir efectos de sonido al juego: reproducir `break-sound.mp3` al destruir un bloque y `ball-bounce.mp3` al rebotar la bola contra paredes laterales, techo o paleta.

---

## Scope

**In:**

- Reproducir `assets/sounds/break-sound.mp3` cada vez que un bloque es destruido por la bola
- Reproducir `assets/sounds/ball-bounce.mp3` cada vez que la bola rebota contra: pared izquierda, pared derecha, techo, o la paleta
- Comportamiento de solapamiento: cada trigger reinicia el sonido (`currentTime = 0`) y lo reproduce, cortando la reproducción anterior si seguía sonando
- Manejo silencioso de restricciones de autoplay del navegador (si `play()` falla por falta de interacción del usuario, se ignora sin generar errores visibles en consola)

**Fuera del scope:**

- Sonido al perder una vida (bola sale por el borde inferior) — no suena nada en ese caso
- Control de volumen o mute (tecla/botón)
- Música de fondo
- Animaciones o efectos visuales asociados a los sonidos
- Ajuste de volumen individual por efecto (se usa el volumen por defecto)

---

## Data model

Se añaden dos objetos `Audio` globales en `game.js`, cargados una vez al inicio:

```js
const breakSound = new Audio('assets/sounds/break-sound.mp3');
const bounceSound = new Audio('assets/sounds/ball-bounce.mp3');

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {}); // ignora bloqueo de autoplay
}
```

No se modifica ninguna estructura existente (`ball`, `paddle`, `block`, `state`). `playSound` se invoca desde los puntos de colisión ya existentes en `update()`.

---

## Implementation plan

1. **Cargar los sonidos** — declarar `breakSound`, `bounceSound` y la función `playSound(sound)` en `game.js`; el juego sigue funcionando igual, sin sonido audible todavía.

2. **Sonido en paredes laterales y techo** — invocar `playSound(bounceSound)` en los tres puntos de rebote de contorno (`ball.x - radius < 0`, `ball.x + radius > W`, `ball.y - radius < 0`); rebote audible contra bordes del canvas.

3. **Sonido en la paleta** — invocar `playSound(bounceSound)` en el bloque de colisión con la paleta; rebote audible al golpear la paleta.

4. **Sonido al romper bloque** — invocar `playSound(breakSound)` justo donde `b.alive = false` en la colisión bola-bloque; sonido audible al destruir cada bloque.

---

## Acceptance criteria

- [x] Al golpear un bloque, se reproduce `break-sound.mp3` en el momento en que el bloque desaparece.
- [x] Al rebotar contra la pared izquierda, se reproduce `ball-bounce.mp3`.
- [x] Al rebotar contra la pared derecha, se reproduce `ball-bounce.mp3`.
- [x] Al rebotar contra el techo, se reproduce `ball-bounce.mp3`.
- [x] Al rebotar contra la paleta, se reproduce `ball-bounce.mp3`.
- [x] Cuando la bola sale por el borde inferior (pérdida de vida), no se reproduce ningún sonido.
- [x] Si un sonido se dispara mientras ya está sonando, se reinicia desde el principio en lugar de superponerse.
- [x] Ningún error de audio aparece en la consola del navegador durante una partida normal (incluyendo el caso de bloqueo de autoplay antes de la primera interacción).

---

## Decisions

| Decisión | Elegida | Descartada | Motivo |
| --- | --- | --- | --- |
| Sonido en borde inferior | Sin sonido | Reproducir `ball-bounce.mp3` | No es un rebote real de contorno, es la salida de la bola del área jugable; mantiene el sonido de rebote asociado solo a colisiones físicas |
| Manejo de autoplay bloqueado | Ignorar silenciosamente (`.catch(() => {})`) | Pantalla de inicio que requiera interacción antes de jugar | Fuera de scope de esta spec (spec 01 ya definió que el juego arranca directo sin pantalla de inicio); aceptable que el primer sonido pueda no sonar |
| Solapamiento de sonidos | Reiniciar `currentTime = 0` y cortar el anterior | Múltiples instancias `Audio` simultáneas (clonación) | Un solo objeto `Audio` por efecto es más simple y suficiente; evita gestión de pool de instancias |
| Control de volumen/mute | Fuera de scope | Incluir tecla de mute | El usuario confirmó que no es necesario en esta spec; puede añadirse después |

---

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Bloqueo de autoplay impide el primer sonido | Aceptado como comportamiento estándar del navegador (ver decisión); no requiere mitigación adicional en esta spec |
| Ruta de archivo incorrecta si `game.js` se sirve desde otra ubicación | Usar ruta relativa `assets/sounds/...` igual que `spritesheet.js`, consistente con el resto del proyecto |
