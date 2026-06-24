const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

const BLOCK_COLS = 10;
const BLOCK_ROWS = 6;
const BLOCK_W = 72;
const BLOCK_H = 22;
const BLOCK_GAP = 4;
const BLOCKS_OFFSET_X = (800 - (BLOCK_COLS * BLOCK_W + (BLOCK_COLS - 1) * BLOCK_GAP)) / 2;
const BLOCKS_OFFSET_Y = 60;
const BLOCK_COLORS = ['red', 'cyan', 'green', 'magenta', 'yellow', 'hotpink'];

const BALL_RADIUS = 8;
const BALL_SPEED = 4;

const PADDLE_W = 100;
const PADDLE_H = 14;
const PADDLE_Y = H - 40;
const PADDLE_SPEED = 6;

const paddle = {
  x: W / 2 - PADDLE_W / 2,
  y: PADDLE_Y,
  width: PADDLE_W,
  height: PADDLE_H,
  speed: PADDLE_SPEED,
};

function createBlocks() {
  const blocks = [];
  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = 0; col < BLOCK_COLS; col++) {
      blocks.push({
        x: BLOCKS_OFFSET_X + col * (BLOCK_W + BLOCK_GAP),
        y: BLOCKS_OFFSET_Y + row * (BLOCK_H + BLOCK_GAP),
        width: BLOCK_W,
        height: BLOCK_H,
        color: BLOCK_COLORS[row],
        alive: true,
      });
    }
  }
  return blocks;
}

let blocks = createBlocks();

const state = {
  lives: 3,
  score: 0,
  status: 'playing',
};

const ball = {
  x: W / 2,
  y: H / 2,
  vx: BALL_SPEED,
  vy: -BALL_SPEED,
  radius: BALL_RADIUS,
};

const keys = { left: false, right: false };

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = mouseX - paddle.width / 2;
  paddle.x = Math.max(0, Math.min(W - paddle.width, paddle.x));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  keys.left  = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'r' || e.key === 'R') restart();
});

canvas.addEventListener('click', () => {
  if (state.status !== 'playing') restart();
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft')  keys.left  = false;
  if (e.key === 'ArrowRight') keys.right = false;
});

function update() {
  if (state.status !== 'playing') return;

  if (keys.left)  paddle.x -= paddle.speed;
  if (keys.right) paddle.x += paddle.speed;
  paddle.x = Math.max(0, Math.min(W - paddle.width, paddle.x));

  ball.x += ball.vx;
  ball.y += ball.vy;

  // bola sale por el borde inferior
  if (ball.y - ball.radius > H) {
    state.lives -= 1;
    ball.x = W / 2;
    ball.y = H / 2;
    ball.vx = BALL_SPEED;
    ball.vy = -BALL_SPEED;
  }

  // paredes laterales
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x + ball.radius > W) {
    ball.x = W - ball.radius;
    ball.vx = -Math.abs(ball.vx);
  }

  // techo
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy);
  }

  // bloques
  for (const b of blocks) {
    if (!b.alive) continue;

    const bLeft   = b.x;
    const bRight  = b.x + b.width;
    const bTop    = b.y;
    const bBottom = b.y + b.height;

    if (
      ball.x + ball.radius > bLeft &&
      ball.x - ball.radius < bRight &&
      ball.y + ball.radius > bTop &&
      ball.y - ball.radius < bBottom
    ) {
      b.alive = false;
      state.score += 10;

      // determinar lado de impacto por solapamiento mínimo
      const overlapLeft   = (ball.x + ball.radius) - bLeft;
      const overlapRight  = bRight - (ball.x - ball.radius);
      const overlapTop    = (ball.y + ball.radius) - bTop;
      const overlapBottom = bBottom - (ball.y - ball.radius);

      const minH = Math.min(overlapLeft, overlapRight);
      const minV = Math.min(overlapTop, overlapBottom);

      if (minH < minV) {
        ball.vx = -ball.vx;
      } else {
        ball.vy = -ball.vy;
      }

      break; // un bloque por frame para evitar doble inversión
    }
  }

  // condiciones de fin
  if (state.lives === 0) {
    state.status = 'gameover';
    return;
  }
  if (blocks.every(b => !b.alive)) {
    state.status = 'win';
    return;
  }

  // paleta
  if (
    ball.vy > 0 &&
    ball.y + ball.radius >= paddle.y &&
    ball.y + ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    ball.y = paddle.y - ball.radius;
    ball.vy = -Math.abs(ball.vy);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.width, paddle.height);
  drawSprite(ctx, 'ball', ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);

  for (const b of blocks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.width, b.height);
  }

  if (state.status !== 'playing') {
    drawOverlay();
  }

  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('Puntos: ' + state.score, 16, 28);
  ctx.textAlign = 'right';
  ctx.fillText('Vidas: ' + state.lives, W - 16, 28);
}

function restart() {
  if (state.status === 'playing') return;

  blocks = createBlocks();

  state.lives = 3;
  state.score = 0;
  state.status = 'playing';

  ball.x = W / 2;
  ball.y = H / 2;
  ball.vx = BALL_SPEED;
  ball.vy = -BALL_SPEED;

  paddle.x = W / 2 - paddle.width / 2;
}

function drawOverlay() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, W, H);

  const isWin = state.status === 'win';
  ctx.textAlign = 'center';

  ctx.font = 'bold 48px monospace';
  ctx.fillStyle = isWin ? '#ffe066' : '#ff4444';
  ctx.fillText(isWin ? '¡GANASTE!' : 'GAME OVER', W / 2, H / 2 - 60);

  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText('Puntuación final: ' + state.score, W / 2, H / 2);

  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Pulsa R o haz click para reiniciar', W / 2, H / 2 + 60);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadSpritesheet(() => {
  loop();
});
