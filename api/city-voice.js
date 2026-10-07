// ─── /api/city-voice — Vercel serverless function ───────────────────────────
// The living city reacts to how a town was played. ANTHROPIC_API_KEY lives only
// in the server environment. The client sends numbers only (no free text), so
// nothing the player types can reach the prompt.

import Anthropic from '@anthropic-ai/sdk';
import { LEVELS } from '../src/data/levels.js';

const client = new Anthropic({ timeout: 3500, maxRetries: 0 }); // client aborts at 4 s

const SYSTEM = `You are Vein City: a living, ancient city. You speak to the engineer who is learning your veins, the pipes beneath your streets. React to how they just restored one of your districts.
Tone: noir, intimate, slightly unsettling, never cheesy.
Write one or two short lines, 25 words maximum in total, each line on its own row.
No emojis, no quotation marks, no stage directions, no hashtags. Never mention stars, moves, retries, scores or seconds; turn them into feeling.`;

// Per-IP limit: 10 calls / minute.
// ponytail: in-memory per instance (resets on cold start, not shared across
// instances); swap for Upstash / Vercel KV if a hard global limit matters.
const WINDOW_MS = 60_000, LIMIT = 10;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // bound memory
  return recent.length > LIMIT;
}

const int = (v, min, max) => Math.min(max, Math.max(min, Math.round(Number(v) || 0)));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) return res.status(429).json({ error: 'rate_limited' });

  const b = req.body || {};
  const town = int(b.town, 1, 30);
  const level = LEVELS.find(l => l.id === town);
  const play = `District ${town} of 30, "${level.name}", is flowing again.
Rating: ${int(b.stars, 1, 3)} of 3 (3 = a near-perfect route).
Budget left unspent: ${int(b.movesLeft, 0, 999)} of ${int(b.movesTotal, 0, 999)} moves.
Stones uncovered: ${int(b.revealed, 0, 999)} of ${int(b.tiles, 0, 999)}.
Time taken: ${int(b.seconds, 0, 86400)} seconds. Failed attempts before this one: ${int(b.retries, 0, 99)}.
Speak to the engineer.`;

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 80,
      system: SYSTEM,
      messages: [{ role: 'user', content: play }]
    });
    if (msg.stop_reason === 'refusal') return res.status(502).json({ error: 'refused' });

    const words = msg.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .replace(/["“”]/g, '')
      .split('\n').map(l => l.trim()).filter(Boolean).slice(0, 2);
    if (!words.length) return res.status(502).json({ error: 'empty' });
    return res.status(200).json({ lines: words });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(503).json({ error: 'upstream_busy' });
    if (err instanceof Anthropic.APIError) return res.status(502).json({ error: 'upstream_error', status: err.status });
    return res.status(500).json({ error: 'internal' });
  }
}
