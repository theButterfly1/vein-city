// node scripts/verify-levels.mjs — proves all 30 levels are solvable in budget.
import { generateLevel } from '../src/game/generator.js';
import { LEVELS } from '../src/data/levels.js';
import { DIRS, DXY, OPP, TILE_BASE, rotMask } from '../src/core/constants.js';

const portMask = (c) => rotMask(TILE_BASE[c.type], c.rot);

function solvedCheck(layout) {
  // simulate perfect play: reveal every network cell, set solution rotations
  const cells = layout.cells.map(c => ({ ...c, revealed: c.network ? true : c.revealed, rot: c.network ? c.solRot : c.rot }));
  const { w, h } = layout;
  const nb = (c, d) => {
    const nx = c.x + DXY[d][0], ny = c.y + DXY[d][1];
    if (nx < 0 || ny < 0 || nx >= w || ny >= h) return -1;
    return ny * w + nx;
  };
  // flow BFS
  const flow = new Set(layout.sources);
  const q = [...layout.sources];
  while (q.length) {
    const i = q.shift();
    const m = portMask(cells[i]);
    for (const d of DIRS) {
      if (!(m & d)) continue;
      const ni = nb(cells[i], d);
      if (ni < 0 || flow.has(ni)) continue;
      if (!cells[ni].revealed) continue;
      if (portMask(cells[ni]) & OPP[d]) { flow.add(ni); q.push(ni); }
    }
  }
  for (const s of layout.sinks) if (!flow.has(s)) return { ok: false, why: `sink ${s} unfed` };
  for (const i of flow) {
    const m = portMask(cells[i]);
    for (const d of DIRS) {
      if (!(m & d)) continue;
      const ni = nb(cells[i], d);
      if (ni < 0) return { ok: false, why: `leak off-grid at ${i}` };
      if (!cells[ni].revealed) return { ok: false, why: `leak into hidden at ${i}` };
      if (!(portMask(cells[ni]) & OPP[d])) return { ok: false, why: `port mismatch ${i}->${ni}` };
    }
  }
  return { ok: true };
}

let fail = 0;
for (const cfg of LEVELS) {
  const layout = generateLevel(cfg);
  const netCost = layout.cells.filter(c => c.network && !c.fixed).reduce((a, c) => a + (c.pressure ? 2 : 1), 0);
  const res = solvedCheck(layout);
  const keys = layout.cells.filter(c => c.hasKey).length;
  const locks = layout.cells.filter(c => c.locked).length;
  const lockedKeyHost = layout.cells.some(c => c.hasKey && c.locked);
  const budgetOk = layout.moves >= netCost;
  const keysOk = keys >= locks && !lockedKeyHost;
  const status = res.ok && budgetOk && keysOk ? 'OK ' : 'FAIL';
  if (status === 'FAIL') fail++;
  console.log(
    `L${String(cfg.id).padStart(2, '0')} ${status} ${cfg.size}x${cfg.size} net=${layout.netCount} cost=${netCost} moves=${layout.moves} ` +
    `src=${layout.sources.length} snk=${layout.sinks.length} locks=${locks}/keys=${keys}` +
    (res.ok ? '' : ` :: ${res.why}`)
  );
}
console.log(fail === 0 ? '\nALL 30 LEVELS SOLVABLE ✔' : `\n${fail} LEVEL(S) BROKEN ✘`);
process.exit(fail === 0 ? 0 : 1);
