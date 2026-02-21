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
const PATH_ATTEMPTS = 500;
const TIMER_DURATION = 3000;
const TIMER_OPACITY = 0.6;

const player = { row: START_ROW, col: START_COL };
const pathSet = new Set();
const visitedSet = new Set([START_ROW + ',' + START_COL]);
let animating = false;
let playerScale = 1;
let timerStart = 0;
let timerRunning = false;
let timerRAF = 0;

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

function scoredCandidates(row, col, visited) {
  const candidates = [];
  for (const [nr, nc] of getOrthogonalNeighbors(row, col)) {
    if (!visited.has(nr + ',' + nc)) {
      let freeNeighbors = 0;
      for (const [ar, ac] of getOrthogonalNeighbors(nr, nc)) {
        if (!visited.has(ar + ',' + ac)) freeNeighbors++;
      }
      const dist = nr + (GRID_SIZE - 1 - nc);
      const score = dist * 2 - freeNeighbors * 3 + Math.random() * 4;
      candidates.push([nr, nc, score]);
    }
  }
  candidates.sort((a, b) => a[2] - b[2]);
  return candidates.map(([r, c]) => [r, c]);
}

function findPath(endKey) {
  const path = [[START_ROW, START_COL]];
  const visited = new Set([START_ROW + ',' + START_COL]);
  const stack = [scoredCandidates(START_ROW, START_COL, visited)];

  while (stack.length > 0) {
    const [cr, cc] = path[path.length - 1];

    if (cr + ',' + cc === endKey) return new Set(visited);

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
      stack.push(scoredCandidates(nr, nc, visited));
      extended = true;
      break;
    }

    if (!extended) {
      stack.pop();
      const [br, bc] = path.pop();
      visited.delete(br + ',' + bc);
    }
  }
  return null;
}

function generatePath() {
  const endKey = '0,' + (GRID_SIZE - 1);
  const maxCells = GRID_SIZE * GRID_SIZE;
  let best = null;

  for (let i = 0; i < PATH_ATTEMPTS; i++) {
    const result = findPath(endKey);
    if (result && (!best || result.size > best.size)) {
      best = result;
      if (best.size >= maxCells) break;
    }
  }

  while (!best) best = findPath(endKey);

  pathSet.clear();
  for (const key of best) pathSet.add(key);
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

  if (timerRunning) {
    const elapsed = performance.now() - timerStart;
    const progress = Math.min(elapsed / TIMER_DURATION, 1);
    const inset = (tileSize / 2) * progress;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, tileSize, tileSize);
    ctx.rect(px + inset, py + inset, tileSize - inset * 2, tileSize - inset * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${TIMER_OPACITY})`;
    ctx.fill('evenodd');
    ctx.restore();
  }
}

function stopTimer() {
  timerRunning = false;
  cancelAnimationFrame(timerRAF);
  timerRAF = 0;
}

function startTimer() {
  stopTimer();
  timerStart = performance.now();
  timerRunning = true;

  function timerFrame(now) {
    if (!timerRunning) return;
    const elapsed = now - timerStart;
    if (elapsed >= TIMER_DURATION) {
      player.row = START_ROW;
      player.col = START_COL;
      visitedSet.clear();
      visitedSet.add(START_ROW + ',' + START_COL);
      startTimer();
      return;
    }
    draw();
    timerRAF = requestAnimationFrame(timerFrame);
  }
  timerRAF = requestAnimationFrame(timerFrame);
}

function startResetAnimation() {
  const startTime = performance.now();
  function frame(now) {
    const elapsed = now - startTime;
    if (elapsed >= RESET_DURATION) {
      playerScale = 1;
      player.row = START_ROW;
      player.col = START_COL;
      visitedSet.clear();
      visitedSet.add(START_ROW + ',' + START_COL);
      animating = false;
      draw();
      startTimer();
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
  if (visitedSet.has(nr + ',' + nc)) return;
  if (pathSet.has(nr + ',' + nc)) {
    player.row = nr;
    player.col = nc;
    visitedSet.add(nr + ',' + nc);
    startTimer();
  } else {
    stopTimer();
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
startTimer();
