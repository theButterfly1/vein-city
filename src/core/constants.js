// ─── Vein City core constants ────────────────────────────────────────────────
// Palette straight from the GDD art direction page.
export const PAL = {
  ink: '#1A1714',      // Deep Ink
  stone: '#3D2B1A',    // Worn Stone
  rust: '#B5451B',     // Urban Rust
  gold: '#C4922A',     // Corroded Gold
  teal: '#1B6B5E',     // Patina Teal
  paper: '#F7F2EC',    // Aged Paper
  inkSoft: '#241F1A',
  stoneDark: '#2C2014',
  goldBright: '#E8B84B',
  rustDark: '#7E2F10',
  paperDim: '#D9CFC2'
};

// Direction bitmasks: N=1 E=2 S=4 W=8
export const N = 1, E = 2, S = 4, W = 8;
export const DIRS = [N, E, S, W];
export const DXY = { [N]: [0, -1], [E]: [1, 0], [S]: [0, 1], [W]: [-1, 0] };
export const OPP = { [N]: S, [E]: W, [S]: N, [W]: E };

// Rotate a mask 90° clockwise `r` times (N→E→S→W→N)
export function rotMask(mask, r) {
  let m = mask;
  for (let i = 0; i < ((r % 4) + 4) % 4; i++) {
    m = ((m & N) ? E : 0) | ((m & E) ? S : 0) | ((m & S) ? W : 0) | ((m & W) ? N : 0);
  }
  return m;
}

// Base masks per tile type at rotation 0
export const TILE_BASE = {
  straight: N | S,
  elbow: N | E,
  tee: N | E | S,
  cross: N | E | S | W,
  dead: N,
  source: N, // single port, fixed
  sink: N    // single port, fixed
};

export const popcount = (m) => ((m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1));

// Find a rotation r so rotMask(base,r) === target (assumes one exists)
export function solveRotation(type, target) {
  const base = TILE_BASE[type];
  for (let r = 0; r < 4; r++) if (rotMask(base, r) === target) return r;
  return 0;
}

// Pick tile type from a required port mask
export function typeForMask(mask) {
  const p = popcount(mask);
  if (p === 4) return 'cross';
  if (p === 3) return 'tee';
  if (p === 2) return (mask === (N | S) || mask === (E | W)) ? 'straight' : 'elbow';
  return 'dead';
}

export const SAVE_KEY = 'veincity_save_v1';

// Daily unlock: towns open on the first calendar day; then one more per day.
export const DAY_ONE_TOWNS = 3;
