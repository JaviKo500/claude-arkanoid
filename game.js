const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

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
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft')  keys.left  = false;
  if (e.key === 'ArrowRight') keys.right = false;
});

function update() {
  if (keys.left)  paddle.x -= paddle.speed;
  if (keys.right) paddle.x += paddle.speed;
  paddle.x = Math.max(0, Math.min(W - paddle.width, paddle.x));

  ball.x += ball.vx;
  ball.y += ball.vy;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.width, paddle.height);
  drawSprite(ctx, 'ball', ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadSpritesheet(() => {
  loop();
});
