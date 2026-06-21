// ─── Level generator ─────────────────────────────────────────────────────────
// Carves source→sink paths on a grid with a seeded RNG, derives the exact tile
// type + solution rotation per network cell, scrambles rotations, decorates
// with echo tiles / pressure zones / locked tiles, and computes a fair move
// budget from the true cost of the solution. Every level is solvable by
// construction.

import { makeRng } from '../core/rng.js';
import { N, E, S, W, DIRS, DXY, OPP, typeForMask, solveRotation } from '../core/constants.js';

const idx = (x, y, w) => y * x * 0 + y * w + x;

// Random-weight Dijkstra: a guaranteed, organically wiggly path a→b.
// `blocked` cells (other pairs' endpoints) are impassable.
function carve(rng, w, h, a, b, weightBias, blocked) {
  const cost = new Float64Array(w * h).fill(Infinity);
  const prev = new Int32Array(w * h).fill(-1);
  const weight = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) weight[i] = 0.5 + rng.next() * 3 + (weightBias ? weightBias[i] : 0);
  cost[a] = 0;
  const open = [a];
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (cost[open[i]] < cost[open[bi]]) bi = i;
    const cur = open.splice(bi, 1)[0];
    if (cur === b) break;
    const cx = cur % w, cy = (cur / w) | 0;
    for (const d of DIRS) {
      const nx = cx + DXY[d][0], ny = cy + DXY[d][1];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const ni = ny * w + nx;
      if (blocked && blocked.has(ni) && ni !== b) continue;
      const nc = cost[cur] + weight[ni];
      if (nc < cost[ni]) {
        cost[ni] = nc; prev[ni] = cur;
        if (!open.includes(ni)) open.push(ni);
      }
    }
  }
  const path = [];
  let c = b;
  while (c !== -1) { path.push(c); c = prev[c]; }
  return path.reverse(); // a..b
}

function edgeDir(from, to, w) {
  const fx = from % w, fy = (from / w) | 0, tx = to % w, ty = (to / w) | 0;
  if (tx === fx + 1) return E;
  if (tx === fx - 1) return W;
  if (ty === fy + 1) return S;
  return N;
}

function borderCells(w, h) {
  const cells = [];
  for (let x = 1; x < w - 1; x++) { cells.push([x, 0]); cells.push([x, h - 1]); }
  for (let y = 1; y < h - 1; y++) { cells.push([0, y]); cells.push([w - 1, y]); }
  return cells;
}

export function generateLevel(cfg) {
  const rng = makeRng(cfg.seed);
  const w = cfg.size, h = cfg.size;
  const total = w * h;
  const ports = new Array(total).fill(0); // union of carved edge dirs
  const isNet = new Array(total).fill(false);

  let pairs = [];
  if (cfg.fixedPaths) {
    // Hand-authored layout (the L30 heart).
    for (const fp of cfg.fixedPaths) {
      const cells = fp.map(([x, y]) => y * w + x);
      pairs.push({ src: cells[0], snk: cells[cells.length - 1], path: cells });
    }
  } else {
    const nPairs = cfg.sources || 1;
    const border = rng.shuffle(borderCells(w, h));
    const taken = new Set();
    const farPick = (avoid) => {
      let best = null, bestD = -1;
      for (const [x, y] of border) {
        const i = y * w + x;
        if (taken.has(i)) continue;
        let dMin = Infinity;
        for (const a of avoid) {
          const ax = a % w, ay = (a / w) | 0;
          dMin = Math.min(dMin, Math.abs(ax - x) + Math.abs(ay - y));
        }
        const d = avoid.length ? dMin : rng.next() * 100;
        if (d > bestD) { bestD = d; best = i; }
      }
      taken.add(best);
      return best;
    };
    const bias = new Float64Array(total);
    // pick all endpoints first, so paths can avoid them
    const endpoints = [];
    for (let p = 0; p < nPairs; p++) {
      const src = farPick(endpoints.flatMap(e => [e.src, e.snk]));
      const snk = farPick([src, ...endpoints.flatMap(e => [e.src, e.snk])]);
      endpoints.push({ src, snk });
    }
    const allEnds = new Set(endpoints.flatMap(e => [e.src, e.snk]));
    const nWaypoints = w >= 8 ? 2 : w >= 6 ? 1 : (cfg.id > 1 ? 1 : 0);
    for (const { src, snk } of endpoints) {
      const blocked = new Set([...allEnds].filter(i => i !== src && i !== snk));
      // detour via interior waypoints → longer, twistier networks
      const stops = [src];
      for (let k = 0; k < nWaypoints; k++) {
        let wp, guard = 0;
        do {
          wp = rng.int(1, w - 2) + rng.int(1, h - 2) * w;
          guard++;
        } while ((blocked.has(wp) || wp === src || wp === snk) && guard < 40);
        if (!blocked.has(wp) && wp !== src && wp !== snk) stops.push(wp);
      }
      stops.push(snk);
      let path = [];
      for (let s = 0; s + 1 < stops.length; s++) {
        // every endpoint is impassable except this segment's own start/end
        const segBlocked = new Set([...allEnds].filter(i => i !== stops[s] && i !== stops[s + 1]));
        const seg = carve(rng, w, h, stops[s], stops[s + 1], bias, segBlocked);
        path = path.length ? path.concat(seg.slice(1)) : seg;
      }
      // discourage later paths from fully overlapping, but allow crossings
      for (const c of path) bias[c] += 1.5;
      pairs.push({ src, snk, path });
    }
  }

  for (const { path } of pairs) {
    for (let i = 0; i < path.length; i++) {
      isNet[path[i]] = true;
      if (i + 1 < path.length) {
        const d = edgeDir(path[i], path[i + 1], w);
        ports[path[i]] |= d;
        ports[path[i + 1]] |= OPP[d];
      }
    }
  }

  const srcSet = new Set(pairs.map(p => p.src));
  const snkSet = new Set(pairs.map(p => p.snk));

  // Pressure zones: rectangular patches avoiding sources/sinks.
  const pressure = new Array(total).fill(false);
  if (cfg.pressure) {
    const zones = cfg.pressure;
    for (let z = 0; z < zones; z++) {
      const zw = rng.int(2, 3), zh = rng.int(2, 3);
      const zx = rng.int(0, w - zw), zy = rng.int(0, h - zh);
      for (let y = zy; y < zy + zh; y++) for (let x = zx; x < zx + zw; x++) {
        const i = y * w + x;
        if (!srcSet.has(i) && !snkSet.has(i)) pressure[i] = true;
      }
    }
  }

  // Build cells.
  const cells = new Array(total);
  for (let i = 0; i < total; i++) {
    const x = i % w, y = (i / w) | 0;
    if (srcSet.has(i) || snkSet.has(i)) {
      const type = srcSet.has(i) ? 'source' : 'sink';
      cells[i] = {
        i, x, y, type, network: true,
        rot: solveRotation(type, ports[i] || N),
        solRot: solveRotation(type, ports[i] || N),
        revealed: true, fixed: true,
        pressure: false, locked: false, hasKey: false, echo: null,
        skin: rng.int(0, 3)
      };
      continue;
    }
    let type, solRot;
    if (isNet[i]) {
      type = typeForMask(ports[i]);
      solRot = solveRotation(type, ports[i]);
    } else {
      // Filler / decoy tile — believable plumbing that goes nowhere.
      type = rng.pick(['straight', 'elbow', 'elbow', 'tee', 'dead', 'straight']);
      solRot = rng.int(0, 3);
    }
    let rot = rng.int(0, 3);
    if (isNet[i] && rot === solRot && rng.chance(0.8)) rot = (rot + rng.int(1, 3)) % 4;
    cells[i] = {
      i, x, y, type, network: isNet[i],
      rot, solRot,
      revealed: false, fixed: false,
      pressure: pressure[i], locked: false, hasKey: false, echo: null,
      skin: rng.int(0, 3)
    };
  }

  const netCells = cells.filter(c => c.network && !c.fixed);

  // Echo tiles (true hints) or decoy echoes (lies) on a share of network cells.
  if (cfg.echoRate > 0) {
    for (const c of rng.shuffle(netCells)) {
      if (rng.chance(cfg.echoRate)) {
        c.echo = cfg.decoyEcho && rng.chance(0.65)
          ? { rot: (c.solRot + rng.int(1, 3)) % 4, decoy: true }
          : { rot: c.solRot, decoy: false };
      }
    }
  }

  // Locked tiles + key fragments hidden inside other network cells.
  if (cfg.locked) {
    const lockable = netCells.filter(c => {
      // never lock a cell adjacent to a source (keeps openings honest)
      for (const d of DIRS) {
        const nx = c.x + DXY[d][0], ny = c.y + DXY[d][1];
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && srcSet.has(ny * w + nx)) return false;
      }
      return true;
    });
    const picked = rng.shuffle(lockable).slice(0, cfg.locked);
    for (const c of picked) c.locked = true;
    const keyHosts = rng.shuffle(netCells.filter(c => !c.locked)).slice(0, picked.length);
    keyHosts.forEach(c => { c.hasKey = true; });
  }

  // True solve cost: reveal every non-fixed network cell once.
  let solveCost = 0;
  for (const c of netCells) solveCost += c.pressure ? 2 : 1;
  const slack = Math.max(3, Math.round(solveCost * cfg.slack));
  const moves = solveCost + slack;

  return {
    cfg, w, h, cells, moves, slack,
    sources: [...srcSet], sinks: [...snkSet],
    netCount: netCells.length
  };
}
