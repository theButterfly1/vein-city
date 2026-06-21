// ─── Achievements ────────────────────────────────────────────────────────────
// In-game achievements (always tracked in the save so the panel works on every
// platform) plus a best-effort native unlock via the Bridge where supported.
// `id` is the stored/native id; the UI label/description come from i18n keys
// `ach.<id>` and `ach.<id>.desc`. `test(save)` decides when it unlocks.

import { LEVELS } from './levels.js';

const actComplete = (save, act) =>
  LEVELS.filter((l) => l.act === act).every((l) => save.completed[l.id]);

export const ACHIEVEMENTS = [
  { id: 'act1_clear', test: (s) => actComplete(s, 1) },
  { id: 'act2_clear', test: (s) => actComplete(s, 2) },
  { id: 'act3_clear', test: (s) => actComplete(s, 3) },
  { id: 'first_three_star', test: (s) => Object.values(s.completed).some((v) => v >= 3) },
  { id: 'all_relics', test: (s) => s.relics.length >= LEVELS.length },
  { id: 'game_finished', test: (s) => Object.keys(s.completed).length >= LEVELS.length }
];
