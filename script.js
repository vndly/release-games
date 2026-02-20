const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 7;
const TILE_COLOR = '#F5F0E1';
const BG_COLOR = '#444444';
const PLAYER_COLOR = '#E74C3C';
const PATH_COLOR = '#6ABE6A';
const START_ROW = GRID_SIZE - 1;
const START_COL = 0;
const RESET_DURATION = 1000;
const MARGIN_RATIO = 0.1;
const GAP_RATIO = 0.002;

const player = { row: START_ROW, col: START_COL };
const pathSet = new Set();
let animating = false;
let playerScale = 1;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

function getOrthogonalNeighbors(row, col) {
  const neighbors = [];
  if (row > 0)             neighbors.push([row - 1, col]);
  if (row < GRID_SIZE - 1) neighbors.push([row + 1, col]);
  if (col > 0)             neighbors.push([row, col - 1]);
  if (col < GRID_SIZE - 1) neighbors.push([row, col + 1]);
  return neighbors;
}

function shuffledCandidates(row, col, visited) {
  const candidates = [];
  for (const [nr, nc] of getOrthogonalNeighbors(row, col)) {
    if (!visited.has(nr + ',' + nc)) candidates.push([nr, nc]);
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates;
}

function generatePath() {
  const endKey = '0,' + (GRID_SIZE - 1);

  while (true) {
    const path = [[START_ROW, START_COL]];
    const visited = new Set([START_ROW + ',' + START_COL]);
    const stack = [shuffledCandidates(START_ROW, START_COL, visited)];

    while (stack.length > 0) {
      const [cr, cc] = path[path.length - 1];

      if (cr + ',' + cc === endKey) {
        pathSet.clear();
        for (const key of visited) pathSet.add(key);
        return;
      }

      const candidates = stack[stack.length - 1];
      let extended = false;

      while (candidates.length > 0) {
        const [nr, nc] = candidates.pop();
        const nKey = nr + ',' + nc;
        if (visited.has(nKey)) continue;
        let pathNeighborCount = 0;
        for (const [ar, ac] of getOrthogonalNeighbors(nr, nc)) {
          if (visited.has(ar + ',' + ac)) pathNeighborCount++;
        }
        if (pathNeighborCount !== 1) continue;

        visited.add(nKey);
        path.push([nr, nc]);
        stack.push(shuffledCandidates(nr, nc, visited));
        extended = true;
        break;
      }

      if (!extended) {
        stack.pop();
        const [br, bc] = path.pop();
        visited.delete(br + ',' + bc);
      }
    }
  }
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

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const x = offsetX + col * (tileSize + gap);
      const y = offsetY + row * (tileSize + gap);
      ctx.fillStyle = pathSet.has(row + ',' + col) ? PATH_COLOR : TILE_COLOR;
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }

  const px = offsetX + player.col * (tileSize + gap);
  const py = offsetY + player.row * (tileSize + gap);
  const size = tileSize * playerScale;
  const offset = (tileSize - size) / 2;
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(px + offset, py + offset, size, size);
}

function startResetAnimation() {
  const startTime = performance.now();
  function frame(now) {
    const elapsed = now - startTime;
    if (elapsed >= RESET_DURATION) {
      playerScale = 1;
      player.row = START_ROW;
      player.col = START_COL;
      animating = false;
      draw();
      return;
    }
    playerScale = Math.max(0, 1 - elapsed / RESET_DURATION);
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
window.addEventListener('keydown', (e) => {
  if (e.repeat || animating) return;
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
  if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return;
  if (pathSet.has(nr + ',' + nc)) {
    player.row = nr;
    player.col = nc;
  } else {
    player.row = nr;
    player.col = nc;
    animating = true;
    draw();
    startResetAnimation();
    return;
  }
  draw();
});
generatePath();
resize();
