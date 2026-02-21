const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRID_WIDTH = 9;
const GRID_HEIGHT = 7;
const TILE_COLOR = '#F5F0E1';
const BG_COLOR = '#444444';
const PLAYER_COLOR = '#0094FF';
const PATH_COLOR = '#6ABE6A';
const START_ROW = GRID_HEIGHT - 1;
const START_COL = 0;
const RESET_DURATION = 1000;
const MARGIN_RATIO = 0.1;
const GAP_RATIO = 0.002;
const PATH_ATTEMPTS = 500;
const TIMER_DURATION = 3000;
const TIMER_OPACITY = 0.3;
const SCORE_COLOR = 'rgba(255, 255, 255, 0.45)';
const SCORE_SIZE_RATIO = 0.12;
const SCORE_MARGIN_RATIO = 0.03;
const DEBUG = false;
const SFX_RIGHT = new Audio('audio/right.wav');
const SFX_WRONG = new Audio('audio/wrong.wav');

const player = { row: START_ROW, col: START_COL };
const pathSet = new Set();
const visitedSet = new Set([START_ROW + ',' + START_COL]);
let animating = false;
let playerScale = 1;
let timerStart = 0;
let timerRunning = false;
let timerRAF = 0;
let globalScore = 0;
let gameWon = false;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

function getOrthogonalNeighbors(row, col) {
  const neighbors = [];
  if (row > 0)              neighbors.push([row - 1, col]);
  if (row < GRID_HEIGHT - 1) neighbors.push([row + 1, col]);
  if (col > 0)              neighbors.push([row, col - 1]);
  if (col < GRID_WIDTH - 1)  neighbors.push([row, col + 1]);
  return neighbors;
}

function scoredCandidates(row, col, visited, path) {
  let forbiddenKey = null;
  if (path.length >= 3) {
    const [r1, c1] = path[path.length - 3];
    const [r2, c2] = path[path.length - 2];
    if (r1 === r2 && r2 === row) {
      const dc = col - c2;
      forbiddenKey = row + ',' + (col + dc);
    } else if (c1 === c2 && c2 === col) {
      const dr = row - r2;
      forbiddenKey = (row + dr) + ',' + col;
    }
  }
  const candidates = [];
  for (const [nr, nc] of getOrthogonalNeighbors(row, col)) {
    if (nr + ',' + nc === forbiddenKey) continue;
    if (!visited.has(nr + ',' + nc)) {
      let freeNeighbors = 0;
      for (const [ar, ac] of getOrthogonalNeighbors(nr, nc)) {
        if (!visited.has(ar + ',' + ac)) freeNeighbors++;
      }
      const dist = nr + (GRID_WIDTH - 1 - nc);
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
  const stack = [scoredCandidates(START_ROW, START_COL, visited, path)];

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
      stack.push(scoredCandidates(nr, nc, visited, path));
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
  const endKey = '0,' + (GRID_WIDTH - 1);
  const maxCells = GRID_WIDTH * GRID_HEIGHT;
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
  const gap = smaller * GAP_RATIO;
  const availW = canvas.width * (1 - MARGIN_RATIO * 2);
  const availH = canvas.height * (1 - MARGIN_RATIO * 2);
  const tileFitW = (availW - gap * (GRID_WIDTH - 1)) / GRID_WIDTH;
  const tileFitH = (availH - gap * (GRID_HEIGHT - 1)) / GRID_HEIGHT;
  const tileSize = Math.min(tileFitW, tileFitH);

  const totalWidth = tileSize * GRID_WIDTH + gap * (GRID_WIDTH - 1);
  const totalHeight = tileSize * GRID_HEIGHT + gap * (GRID_HEIGHT - 1);
  const offsetX = (canvas.width - totalWidth) / 2;
  const offsetY = (canvas.height - totalHeight) / 2;

  const scoreFontSize = Math.round(smaller * SCORE_SIZE_RATIO);
  const scoreMargin = Math.round(smaller * SCORE_MARGIN_RATIO);
  ctx.save();
  ctx.font = `700 ${scoreFontSize}px "Courier New", Courier, monospace`;
  ctx.fillStyle = SCORE_COLOR;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'right';
  ctx.fillText(globalScore, canvas.width - scoreMargin, scoreMargin);
  if (DEBUG) {
    ctx.textAlign = 'left';
    ctx.fillText(pathSet.size, scoreMargin, scoreMargin);
  }
  ctx.restore();

  for (let row = 0; row < GRID_HEIGHT; row++) {
    for (let col = 0; col < GRID_WIDTH; col++) {
      const x = offsetX + col * (tileSize + gap);
      const y = offsetY + row * (tileSize + gap);
      ctx.fillStyle = (DEBUG && pathSet.has(row + ',' + col)) ? PATH_COLOR : TILE_COLOR;
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
      SFX_WRONG.currentTime = 0;
      SFX_WRONG.play().catch(() => {});
      const runScore = visitedSet.size - 1;
      if (runScore > globalScore) globalScore = runScore;
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
      const runScore = visitedSet.size - 1;
      if (runScore > globalScore) globalScore = runScore;
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
  if (e.repeat || animating || gameWon) return;
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
  if (nr < 0 || nr >= GRID_HEIGHT || nc < 0 || nc >= GRID_WIDTH) return;
  if (visitedSet.has(nr + ',' + nc)) return;
  if (pathSet.has(nr + ',' + nc)) {
    player.row = nr;
    player.col = nc;
    visitedSet.add(nr + ',' + nc);
    const runScore = visitedSet.size - 1;
    if (runScore > globalScore) globalScore = runScore;
    SFX_RIGHT.currentTime = 0;
    SFX_RIGHT.play().catch(() => {});
    if (nr === 0 && nc === GRID_WIDTH - 1) {
      stopTimer();
      gameWon = true;
    } else {
      startTimer();
    }
  } else {
    stopTimer();
    SFX_WRONG.currentTime = 0;
    SFX_WRONG.play().catch(() => {});
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
