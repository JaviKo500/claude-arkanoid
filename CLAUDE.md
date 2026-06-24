# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaja con el código de este repositorio.

## Proyecto

Un juego de Arkanoid (estilo Breakout) construido con HTML, CSS y JavaScript puro. Sin dependencias y sin paso de compilación — abrir `index.html` directamente en el navegador.

## Ejecutar el juego

Abrir `index.html` en cualquier navegador moderno. No se requiere servidor, bundler ni instalación.

## Assets

- `assets/spritesheet-breakout.png` — spritesheet único con todos los gráficos del juego (paleta, bola, bloques, explosiones)
- `assets/spritesheet.js` — exporta los mapas de coordenadas de sprites (`SPRITES`, `EXPLOSION_FRAMES`) y tres funciones auxiliares:
  - `loadSpritesheet(cb)` — carga la imagen una sola vez y llama a todos los callbacks en cola
  - `drawSprite(ctx, name, x, y, w, h)` — dibuja un sprite por nombre; los bloques usan el prefijo `block_<color>` (ej. `block_red`)
  - `drawFrame(ctx, frame, x, y, w, h)` — dibuja un objeto frame directamente (usado para los frames de animación de explosiones)
- `assets/sounds/ball-bounce.mp3` y `assets/sounds/break-sound.mp3` — efectos de sonido

Todo el renderizado debe pasar por `drawSprite` / `drawFrame` para mantener consistencia con el layout del spritesheet.

## Flujo basado en specs

Las nuevas funcionalidades siguen el método spec-driven usando dos skills locales:

1. `/spec <descripción corta>` — diseñador guiado de specs. Hace preguntas de clarificación, construye la spec sección por sección y la guarda en `specs/NN-slug.md`. Nunca escribe código.
2. `/spec-impl <NN-slug>` — implementa una spec aprobada. Solo funciona con specs cuyo estado sea `Aprobado`. Crea una rama git `spec-NN-slug`, muestra el plan e implementa paso a paso con pausas para revisar.

Las specs viven en `specs/` y se numeran secuencialmente. Una spec debe cambiarse manualmente a `Aprobado` antes de que `/spec-impl` la toque.
