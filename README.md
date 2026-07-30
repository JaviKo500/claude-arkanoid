# Arkanoid Game

Un juego de Arkanoid (estilo Breakout) hecho con HTML, CSS y JavaScript puro — sin dependencias ni paso de compilación.

## Cómo jugar

Abrí `index.html` en cualquier navegador moderno.

- **Mover la paleta:** mouse o flechas ← →
- **Elegir nivel:** click sobre uno de los botones numerados en la pantalla inicial
- **Reiniciar:** tecla `R`, o click sobre el overlay de game over / victoria (vuelve al selector de niveles)

## Funcionalidades

- Rebote de la bola contra paredes, techo, paleta y bloques, con detección de lado de impacto
- Efectos de sonido de rebote y de rotura de bloques
- 5 niveles con patrón de bloques, cantidad de filas y velocidad de bola propios, con dificultad creciente
- Pantalla de selección de nivel al inicio y al reiniciar; los 5 niveles están siempre disponibles
- Progresión secuencial automática entre niveles (transición con aviso "¡Nivel X!") hasta completar el nivel 5
- HUD con puntaje, nivel actual y vidas restantes
- Overlays de "GAME OVER" y "¡GANASTE!" con puntaje final

## Estructura del proyecto

- `index.html` — canvas del juego y carga de scripts
- `game.js` — toda la lógica: estado, niveles, física, input, dibujo
- `assets/` — spritesheet y sonidos (ver `CLAUDE.md` para detalle)
- `specs/` — historial de specs del proyecto (spec-driven development)

## Desarrollo

Este proyecto sigue un flujo spec-driven. Ver `CLAUDE.md` para el detalle de las skills `/spec` y `/spec-impl`.
