// Self-check for the daily unlock rules: node scripts/verify-daily.mjs
import assert from 'node:assert/strict';
import { initDaily, townCap, afterComplete, dateKey, formatCountdown } from '../src/game/daily.js';

const D1 = '2026-10-07', D2 = '2026-10-08', D9 = '2026-10-16';

let d = initDaily({}, D1);
assert.equal(townCap(d, D1), 3, 'day one opens towns 1–3');
d = afterComplete(d, 1, D1); d = afterComplete(d, 2, D1);
assert.equal(townCap(d, D2), 3, 'no new town until the cap town is solved');
d = afterComplete(d, 3, D1);
assert.equal(townCap(d, D1), 3, 'same day: still locked');
assert.equal(townCap(d, D2), 4, 'next day: one more');
assert.equal(townCap(d, D9), 4, 'missed days: still only one more');
d = afterComplete(d, 2, D2);              // replaying an old town
assert.equal(d.cap, 4, 'replay persists the bumped cap');
assert.equal(townCap(d, D9), 4, 'replay does not start a new day timer');
d = afterComplete(d, 4, D2);
assert.equal(townCap(d, D2), 4); assert.equal(townCap(d, D9), 5);

assert.deepEqual(initDaily({ 1: 3, 2: 2, 3: 1, 4: 1, 5: 2 }, D1), { cap: 5, capDate: D1, shift: 0 }, 'old saves keep progress');
assert.deepEqual(initDaily({ 1: 3 }, D1), { cap: 3, capDate: null, shift: 0 });
assert.equal(dateKey(1, new Date(2026, 11, 31, 23)), '2027-01-01', 'shift crosses years');
assert.equal(formatCountdown((6 * 3600 + 42 * 60 + 10) * 1000), '06:42:10');
console.log('daily unlock: all checks passed');
