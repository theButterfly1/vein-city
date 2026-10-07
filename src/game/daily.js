// ─── Daily town unlock ───────────────────────────────────────────────────────
// save.daily = { cap, capDate, shift }
//   cap     — highest town id open (1..cap playable)
//   capDate — local date the cap town was first solved; the NEXT calendar day
//             opens exactly one more town, however many days were missed
//   shift   — reviewer "skip to tomorrow" day offset
// Pure functions (no React / DOM) so scripts/verify-daily.mjs can test them.

import { DAY_ONE_TOWNS } from '../core/constants.js';

export const TOWN_COUNT = 30;

const pad = (n) => String(n).padStart(2, '0');

// Local calendar date as "YYYY-MM-DD" (string order === date order).
export function dateKey(shift = 0, now = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() + shift);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Fresh record, or one derived from an older save so existing progress stays open.
export function initDaily(completed = {}, today = dateKey()) {
  const highest = Math.max(0, ...Object.keys(completed).map(Number));
  const cap = Math.max(DAY_ONE_TOWNS, highest);
  return { cap, capDate: highest >= cap ? today : null, shift: 0 };
}

// Towns open right now: the stored cap, plus one if a new day has dawned since
// the cap town was solved.
export function townCap(daily, today) {
  const bump = daily.capDate && today > daily.capDate ? 1 : 0;
  return Math.min(TOWN_COUNT, daily.cap + bump);
}

// Daily record after solving town `id` (call on every completion).
export function afterComplete(daily, id, today) {
  const cap = townCap(daily, today);
  if (id === cap && cap < TOWN_COUNT) return { ...daily, cap, capDate: today };
  return cap !== daily.cap ? { ...daily, cap, capDate: null } : daily;
}

export function msToMidnight(now = new Date()) {
  const m = new Date(now);
  m.setHours(24, 0, 0, 0);
  return m - now;
}

export function formatCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
}
