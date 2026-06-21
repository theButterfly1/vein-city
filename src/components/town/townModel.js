// ─── Town model ──────────────────────────────────────────────────────────────
// 30 districts spiral inward toward the Heart (level 30) at the city center.
// Solving a level lights its district; veins connect districts in story order.

import { makeRng } from '../../core/rng.js';
import { LEVELS } from '../../data/levels.js';

export function buildTown() {
  const rng = makeRng(777);
  const districts = [];

  for (const lvl of LEVELS) {
    const i = lvl.id;
    let x, y, R;
    if (i === 30) {
      x = 0; y = 0; R = 95; // the Heart plaza
    } else {
      const angle = i * 2.39996 + 0.7;             // golden angle spiral
      const radius = 470 - i * 13.2;               // story moves inward
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius * 0.92;
      R = 64;
    }

    // Buildings inside the block
    const buildings = [];
    const n = i === 30 ? 0 : rng.int(4, 7);
    for (let b = 0; b < n; b++) {
      const bw = rng.int(16, 30), bd = rng.int(16, 30);
      const bx = rng.int(-R * 0.55, R * 0.55 - bw);
      const by = rng.int(-R * 0.55, R * 0.55 - bd);
      const bh = rng.int(18, 30 + lvl.act * 8);
      const windows = rng.int(2, 4);
      buildings.push({ bx, by, bw, bd, bh, windows, tint: rng.int(0, 2) });
    }

    districts.push({
      id: i, name: lvl.name, act: lvl.act,
      x, y, R, buildings,
      phase: rng.next() * Math.PI * 2 // heartbeat phase offset per district
    });
  }

  // Veins: chain in story order, plus a few cross links for organic feel
  const veins = [];
  for (let i = 1; i < 30; i++) veins.push([i, i + 1]);
  veins.push([8, 14], [12, 18], [20, 24], [22, 27]);

  return { districts, veins };
}

export const TOWN = buildTown();
export const getDistrict = (id) => TOWN.districts.find(d => d.id === id);
