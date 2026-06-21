import { generateLevel } from '../src/game/generator.js';
import { initEngine, reduce } from '../src/game/engine.js';
import { getLevel } from '../src/data/levels.js';

for (const id of [1, 9, 11, 17, 21, 30]) {
  const layout = generateLevel(getLevel(id));
  let st = initEngine(layout);
  // play like a perfect player: reveal key hosts first, then everything, rotate to solution
  const net = st.cells.filter(c => c.network && !c.fixed);
  const order = [...net.filter(c => c.hasKey), ...net.filter(c => !c.hasKey)];
  for (const c of order) {
    st = reduce(st, { type: 'REVEAL', i: c.i });
    if (st.events.some(e => e.t === 'locked' || e.t === 'noMoves'))
      throw new Error(`L${id}: blocked at cell ${c.i} :: ${JSON.stringify(st.events)}`);
  }
  for (const c of net) {
    let guard = 0;
    while (st.cells[c.i].rot !== st.cells[c.i].solRot && guard++ < 4) st = reduce(st, { type: 'ROTATE', i: c.i });
  }
  if (!st.solved) throw new Error(`L${id}: not solved after perfect play`);
  // undo should be inert post-solve
  const after = reduce(st, { type: 'ROTATE', i: net[0].i });
  if (after.cells[net[0].i].rot !== st.cells[net[0].i].rot) throw new Error('post-solve input not frozen');
  console.log(`L${String(id).padStart(2,'0')} solved · stars=${st.stars} · movesLeft=${st.moves}/${st.movesTotal} · keys used ok`);
}
// undo behaviour
const layout = generateLevel(getLevel(1));
let st = initEngine(layout);
const target = st.cells.find(c => !c.revealed);
st = reduce(st, { type: 'REVEAL', i: target.i });
const m1 = st.moves;
st = reduce(st, { type: 'UNDO' });
if (st.moves !== layout.moves || st.cells[target.i].revealed) throw new Error('undo failed');
console.log('undo restores state ✔');
console.log('ENGINE PLAYTHROUGH PASS ✔');
