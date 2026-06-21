// ─── Puzzle engine ───────────────────────────────────────────────────────────
// Pure reducer over the level state. UI dispatches actions; the engine returns
// new state plus a list of `events` the UI uses for SFX / toasts / animation.

import { DIRS, DXY, OPP, TILE_BASE, rotMask } from '../core/constants.js';

export function initEngine(layout) {
  return {
    layout,
    cells: layout.cells.map(c => ({ ...c })),
    moves: layout.moves,
    movesTotal: layout.moves,
    keys: 0,
    undosLeft: 3,
    history: [],
    revealTrail: [],          // indices of recent reveals for chain detection
    chainDir: 0,
    chainLen: 0,
    flow: new Set(),          // indices currently fed by a source
    solved: false,
    stars: 0,
    events: []
  };
}

const portMask = (cell) => rotMask(TILE_BASE[cell.type], cell.rot);

function neighborIndex(cell, d, w, h) {
  const nx = cell.x + DXY[d][0], ny = cell.y + DXY[d][1];
  if (nx < 0 || ny < 0 || nx >= w || ny >= h) return -1;
  return ny * w + nx;
}

// BFS from all sources through matched, revealed ports.
function computeFlow(cells, layout) {
  const { w, h } = layout;
  const flow = new Set(layout.sources);
  const queue = [...layout.sources];
  while (queue.length) {
    const i = queue.shift();
    const c = cells[i];
    const m = portMask(c);
    for (const d of DIRS) {
      if (!(m & d)) continue;
      const ni = neighborIndex(c, d, w, h);
      if (ni < 0 || flow.has(ni)) continue;
      const nb = cells[ni];
      if (!nb.revealed) continue;
      if (portMask(nb) & OPP[d]) { flow.add(ni); queue.push(ni); }
    }
  }
  return flow;
}

// Solved = every sink fed AND the fed network has no leaking open port.
function checkSolved(cells, layout, flow) {
  for (const s of layout.sinks) if (!flow.has(s)) return false;
  const { w, h } = layout;
  for (const i of flow) {
    const c = cells[i];
    const m = portMask(c);
    for (const d of DIRS) {
      if (!(m & d)) continue;
      const ni = neighborIndex(c, d, w, h);
      if (ni < 0) return false;
      const nb = cells[ni];
      if (!nb.revealed) return false;
      if (!(portMask(nb) & OPP[d])) return false;
    }
  }
  return true;
}

function snapshot(st) {
  return {
    cells: st.cells.map(c => ({ ...c })),
    moves: st.moves, keys: st.keys,
    revealTrail: st.revealTrail.slice(), chainDir: st.chainDir, chainLen: st.chainLen
  };
}

function starRating(st) {
  const left = st.moves;
  const slack = st.layout.slack;
  if (left >= Math.ceil(slack * 0.55)) return 3;
  if (left >= Math.ceil(slack * 0.2)) return 2;
  return 1;
}

function finalize(st) {
  st.flow = computeFlow(st.cells, st.layout);
  if (!st.solved && checkSolved(st.cells, st.layout, st.flow)) {
    st.solved = true;
    st.stars = starRating(st);
    st.events.push({ t: 'solved', stars: st.stars });
  }
  return st;
}

function dirBetween(a, b, w) {
  const ax = a % w, ay = (a / w) | 0, bx = b % w, by = (b / w) | 0;
  if (bx === ax + 1 && by === ay) return 2;       // E
  if (bx === ax - 1 && by === ay) return 8;       // W
  if (by === ay + 1 && bx === ax) return 4;       // S
  if (by === ay - 1 && bx === ax) return 1;       // N
  return 0;
}

export function reduce(state, action) {
  const st = { ...state, cells: state.cells, events: [] };

  if (st.solved) return st;

  switch (action.type) {
    case 'REVEAL': {
      const i = action.i;
      const cell = st.cells[i];
      if (cell.revealed) return st;
      if (cell.locked && st.keys < 1) {
        st.events.push({ t: 'locked', i });
        return st;
      }
      // Resonance chain: 3+ collinear consecutive reveals → continuing is free
      const w = st.layout.w;
      let cost = cell.pressure ? 2 : 1;
      let chained = false;
      const trail = st.revealTrail;
      let chainDir = st.chainDir, chainLen = st.chainLen;
      if (trail.length >= 1) {
        const d = dirBetween(trail[trail.length - 1], i, w);
        if (d !== 0 && d === chainDir) chainLen += 1;
        else if (d !== 0) { chainDir = d; chainLen = 2; }
        else { chainDir = 0; chainLen = 1; }
      } else { chainLen = 1; chainDir = 0; }
      if (chainLen >= 3) { cost = 0; chained = true; }

      if (cost > st.moves) {
        st.events.push({ t: 'noMoves' });
        return st;
      }

      st.history = [...st.history, snapshot(state)].slice(-12);
      st.cells = st.cells.map((c, k) => (k === i ? { ...c, revealed: true, locked: false } : c));
      st.moves -= cost;
      st.revealTrail = [...trail, i].slice(-8);
      st.chainDir = chainDir; st.chainLen = chainLen;
      if (cell.locked) { st.keys -= 1; st.events.push({ t: 'unlock', i }); }
      if (cell.hasKey) { st.keys += 1; st.events.push({ t: 'key', i }); }
      st.events.push({ t: 'reveal', i, cost, chained, network: cell.network });
      if (chained) st.events.push({ t: 'chain', len: chainLen });
      return finalize(st);
    }

    case 'ROTATE': {
      const i = action.i;
      const cell = st.cells[i];
      if (!cell.revealed || cell.fixed) return st;
      st.history = [...st.history, snapshot(state)].slice(-12);
      st.cells = st.cells.map((c, k) => (k === i ? { ...c, rot: (c.rot + 1) % 4 } : c));
      st.revealTrail = []; st.chainDir = 0; st.chainLen = 0; // rotating breaks a chain
      const rotated = st.cells[i];
      const snapped = rotated.network && rotated.rot === rotated.solRot;
      st.events.push({ t: 'rotate', i, snapped });
      return finalize(st);
    }

    case 'UNDO': {
      if (st.undosLeft <= 0 || st.history.length === 0) {
        st.events.push({ t: 'noUndo' });
        return st;
      }
      const prev = st.history[st.history.length - 1];
      st.history = st.history.slice(0, -1);
      st.cells = prev.cells;
      st.moves = prev.moves;
      st.keys = prev.keys;
      st.revealTrail = prev.revealTrail;
      st.chainDir = prev.chainDir; st.chainLen = prev.chainLen;
      st.undosLeft -= 1;
      st.events.push({ t: 'undo' });
      return finalize(st);
    }

    case 'VENT': { // depressurize 3×3 around i
      const { w, h } = st.layout;
      const cx = action.i % w, cy = (action.i / w) | 0;
      st.cells = st.cells.map(c =>
        Math.abs(c.x - cx) <= 1 && Math.abs(c.y - cy) <= 1 ? { ...c, pressure: false } : c
      );
      st.events.push({ t: 'vent', i: action.i });
      return finalize(st);
    }

    case 'ECHO_BOOST': { // city whispers: reveal one network tile for free
      const hidden = st.cells.filter(c => c.network && !c.revealed && !c.locked);
      if (!hidden.length) return st;
      hidden.sort((a, b) => a.i - b.i);
      const pick = hidden[Math.floor(hidden.length / 2)];
      st.cells = st.cells.map((c, k) => (k === pick.i ? { ...c, revealed: true } : c));
      if (pick.hasKey) { st.keys += 1; st.events.push({ t: 'key', i: pick.i }); }
      st.events.push({ t: 'reveal', i: pick.i, cost: 0, chained: false, network: true, boost: true });
      return finalize(st);
    }

    case 'ADD_MOVES': {
      st.moves += 5;
      st.events.push({ t: 'moves+' });
      return finalize(st);
    }

    case 'HINT_FLASH': {
      st.events.push({ t: 'hint' });
      return st;
    }

    default:
      return st;
  }
}

export { computeFlow, portMask };
