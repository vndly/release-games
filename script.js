const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 7;
const TILE_COLOR = '#F5F0E1';
const BG_COLOR = '#444444';
const PLAYER_COLOR = '#E74C3C';
const MARGIN_RATIO = 0.1;
const GAP_RATIO = 0.002;

const player = { row: GRID_SIZE - 1, col: 0 };

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

function draw() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const smaller = Math.min(canvas.width, canvas.height);
  const gridArea = smaller * (1 - MARGIN_RATIO * 2);
  const gap = smaller * GAP_RATIO;
  const tileSize = (gridArea - gap * (GRID_SIZE - 1)) / GRID_SIZE;

  const totalWidth = tileSize * GRID_SIZE + gap * (GRID_SIZE - 1);
  const totalHeight = totalWidth;
  const offsetX = (canvas.width - totalWidth) / 2;
  const offsetY = (canvas.height - totalHeight) / 2;

  ctx.fillStyle = TILE_COLOR;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const x = offsetX + col * (tileSize + gap);
      const y = offsetY + row * (tileSize + gap);
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }

  const px = offsetX + player.col * (tileSize + gap);
  const py = offsetY + player.row * (tileSize + gap);
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(px, py, tileSize, tileSize);
}

window.addEventListener('resize', resize);
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  let dr = 0, dc = 0;
  switch (e.key) {
    case 'ArrowUp':    case 'w': case 'W': dr = -1; break;
    case 'ArrowDown':  case 's': case 'S': dr =  1; break;
    case 'ArrowLeft':  case 'a': case 'A': dc = -1; break;
    case 'ArrowRight': case 'd': case 'D': dc =  1; break;
    default: return;
  }
  e.preventDefault();
  const nr = player.row + dr;
  const nc = player.col + dc;
  if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
    player.row = nr;
    player.col = nc;
    draw();
  }
});
resize();
