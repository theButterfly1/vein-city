import { generateLevel } from '../src/game/generator.js';
import { getLevel } from '../src/data/levels.js';
import { N, E, S, W } from '../src/core/constants.js';

const lvl = getLevel(9);
const g = generateLevel(lvl);
const { w, h, cells } = g;

// recover the solved port mask per cell from its solution rotation
import { TILE_BASE, rotMask } from '../src/core/constants.js';
const portsOf = (c) => {
  if (c.type === 'source' || c.type === 'sink') return rotMask(TILE_BASE[c.type], c.solRot);
  if (!c.network) return 0;
  return rotMask(TILE_BASE[c.type], c.solRot);
};

const GLYPH = {
  0: ' ', [N]: '╵', [E]: '╶', [S]: '╷', [W]: '╴',
  [N | S]: '│', [E | W]: '─',
  [N | E]: '└', [N | W]: '┘', [S | E]: '┌', [S | W]: '┐',
  [N | E | S]: '├', [N | S | W]: '┤', [E | S | W]: '┬', [N | E | W]: '┴',
  [N | E | S | W]: '┼'
};

console.log(`Level ${lvl.id}: ${lvl.name}  (${w}×${h}, moves=${g.moves})`);
console.log('Sources:', g.sources.map(i => `(c${i % w},r${(i / w) | 0})`).join(' '));
console.log('Sinks:  ', g.sinks.map(i => `(c${i % w},r${(i / w) | 0})`).join(' '));
console.log('\n    ' + [...Array(w)].map((_, x) => 'c' + x).join('  '));
for (let y = 0; y < h; y++) {
  let row = 'r' + y + '  ';
  for (let x = 0; x < w; x++) {
    const c = cells[y * w + x];
    const m = portsOf(c);
    let ch = c.network ? GLYPH[m] : '·';
    if (c.type === 'source') ch = 'S';
    if (c.type === 'sink') ch = 'K';
    row += ' ' + ch + ' ';
  }
  console.log(row);
}
console.log('\nLegend: S=source  K=sink  ·=decoy(ignore)  lines=pressurized pipe in solved orientation');
const press = cells.filter(c => c.network && c.pressure).map(c => `(c${c.x},r${c.y})`);
console.log('Pressure cells (cost 2):', press.join(' ') || 'none');
