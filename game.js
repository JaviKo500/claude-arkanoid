const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

function update() {}

function draw() {
  ctx.clearRect(0, 0, W, H);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadSpritesheet(() => {
  loop();
});
