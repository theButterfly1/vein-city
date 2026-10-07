// ─── City voice ──────────────────────────────────────────────────────────────
// After each town the city reacts to how it was played. The line comes from
// /api/city-voice (serverless; the API key never reaches the browser). Any
// failure or a 4 s timeout falls back to scripted lines — the game never waits
// on, or breaks because of, the AI.

import FALLBACK from '../data/fallback-lines.json';
import { track } from './analytics.js';

const TIMEOUT_MS = 4000;

export async function cityVoice(play) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/city-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(play),
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { lines } = await res.json();
    if (!Array.isArray(lines) || !lines.length) throw new Error('empty');
    track('ai_line_shown', { town: play.town, stars: play.stars });
    return lines.slice(0, 2).map(String);
  } catch (err) {
    const pool = FALLBACK[play.stars] || FALLBACK[1];
    track('ai_fallback_used', { town: play.town, reason: err.name === 'AbortError' ? 'timeout' : err.message });
    return [pool[(play.town + play.retries) % pool.length]];
  } finally {
    clearTimeout(timer);
  }
}
