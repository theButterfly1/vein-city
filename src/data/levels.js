// ─── 30 levels · 3 acts ──────────────────────────────────────────────────────
// Every config feeds the deterministic generator; seeds were chosen so layouts
// read well. slack = extra moves above the true solve cost (stars are earned
// from what's left of it).

// L30 — "The Heartbeat": a hand-authored heart silhouette on a 9×9 grid.
// Two sources (the lobes) converge to one sink (the tip).
const HEART_LEFT = [
  [2, 1], [2, 2], [1, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 5], [3, 6], [4, 6], [4, 7]
];
const HEART_RIGHT = [
  [6, 1], [6, 2], [7, 2], [7, 3], [7, 4], [6, 4], [6, 5], [5, 5], [5, 6], [4, 6], [4, 7]
];

const L = (o) => ({ echoRate: 0, decoyEcho: false, pressure: 0, locked: 0, sources: 1, ...o });

export const LEVELS = [
  // ── ACT 1 · THE ASSIGNMENT (1–8) ──────────────────────────────────────────
  L({ id: 1,  name: 'The Leaking Alley',    size: 5, slack: 0.55, echoRate: 0.45, seed: 9101, act: 1, tags: ['Tutorial', 'Echo tiles'] }),
  L({ id: 2,  name: 'The Crossroads Block', size: 5, slack: 0.5,  echoRate: 0.4,  seed: 4022, act: 1, tags: ['Forked path', 'Free rotation'] }),
  L({ id: 3,  name: 'Under Market Street',  size: 6, slack: 0.45, echoRate: 0.35, seed: 7833, act: 1, tags: ['Decoy mains', 'Tight budget'] }),
  L({ id: 4,  name: 'Gaslight Row',         size: 6, slack: 0.45, echoRate: 0.35, seed: 1244, act: 1, tags: ['Night shift'] }),
  L({ id: 5,  name: 'The Laundry Vaults',   size: 6, slack: 0.42, echoRate: 0.3,  pressure: 1, seed: 5675, act: 1, tags: ['Pressure zones'] }),
  L({ id: 6,  name: 'Clocktower Base',      size: 6, slack: 0.4,  echoRate: 0.3,  pressure: 1, seed: 3306, act: 1, tags: ['Pressure zones'] }),
  L({ id: 7,  name: 'The Boiler District',  size: 7, slack: 0.4,  echoRate: 0.28, pressure: 1, seed: 8617, act: 1, tags: ['Resonance chains'] }),
  L({ id: 8,  name: 'Tannery Cut',          size: 7, slack: 0.38, echoRate: 0.28, pressure: 2, seed: 2458, act: 1, tags: ['Act finale'] }),

  // ── ACT 2 · THE DISCOVERY (9–20) ──────────────────────────────────────────
  L({ id: 9,  name: 'Twin Reservoir',       size: 7, slack: 0.36, echoRate: 0.25, sources: 2, seed: 6149, act: 2, tags: ['Two sources'] }),
  L({ id: 10, name: 'The Switchback',       size: 7, slack: 0.34, echoRate: 0.2,  seed: 9020, act: 2, tags: ['Decoy paths'] }),
  L({ id: 11, name: 'Old Town Underpass',   size: 7, slack: 0.34, echoRate: 0.22, locked: 2, seed: 1721, act: 2, tags: ['Locked tiles', 'Key fragments'] }),
  L({ id: 12, name: 'Archive Annex',        size: 7, slack: 0.32, echoRate: 0.22, locked: 2, pressure: 1, seed: 4892, act: 2, tags: ['Locks + pressure'] }),
  L({ id: 13, name: 'Foundry Yards',        size: 8, slack: 0.32, echoRate: 0.2,  sources: 2, pressure: 1, seed: 7263, act: 2, tags: ['Two sources'] }),
  L({ id: 14, name: 'The Cistern',          size: 8, slack: 0.3,  echoRate: 0.2,  pressure: 2, seed: 3534, act: 2, tags: ['The city speaks'] }),
  L({ id: 15, name: 'Tram Depot',           size: 8, slack: 0.3,  echoRate: 0.18, sources: 2, locked: 2, seed: 8105, act: 2, tags: ['Sources + locks'] }),
  L({ id: 16, name: 'Salt Cellars',         size: 8, slack: 0.28, echoRate: 0.18, pressure: 3, seed: 2976, act: 2, tags: ['Heavy pressure'] }),
  L({ id: 17, name: 'The Fractured Grid',   size: 8, slack: 0.28, echoRate: 0.3,  decoyEcho: true, pressure: 1, seed: 6647, act: 2, tags: ['Decoy echoes'] }),
  L({ id: 18, name: 'Chapel Undercroft',    size: 8, slack: 0.26, echoRate: 0.28, decoyEcho: true, locked: 2, seed: 1318, act: 2, tags: ['Lies + locks'] }),
  L({ id: 19, name: 'Printing Quarter',     size: 9, slack: 0.26, echoRate: 0.18, sources: 3, seed: 5589, act: 2, tags: ['Three sources'] }),
  L({ id: 20, name: 'The Black Drain',      size: 9, slack: 0.26, echoRate: 0.2,  sources: 2, pressure: 2, locked: 2, seed: 9460, act: 2, tags: ['Act finale'] }),

  // ── ACT 3 · THE PULSE (21–30) ─────────────────────────────────────────────
  L({ id: 21, name: 'The Convergence',      size: 9, slack: 0.24, echoRate: 0.18, sources: 3, pressure: 2, locked: 2, seed: 3031, act: 3, tags: ['All systems'] }),
  L({ id: 22, name: "Keepers' Gallery",     size: 9, slack: 0.24, echoRate: 0.26, decoyEcho: true, pressure: 2, seed: 7402, act: 3, tags: ['Decoy echoes'] }),
  L({ id: 23, name: 'The Aqueduct Spine',   size: 9, slack: 0.22, echoRate: 0.16, sources: 2, pressure: 3, seed: 1273, act: 3, tags: ['Long routes'] }),
  L({ id: 24, name: 'Council Vault',        size: 9, slack: 0.22, echoRate: 0.2,  decoyEcho: true, locked: 3, seed: 6844, act: 3, tags: ['Stolen schedule'] }),
  L({ id: 25, name: 'The Flush Gates',      size: 9, slack: 0.2,  echoRate: 0.16, sources: 2, pressure: 3, locked: 2, seed: 2215, act: 3, tags: ['Race the flush'] }),
  L({ id: 26, name: 'Glassworks Hollow',    size: 9, slack: 0.2,  echoRate: 0.24, decoyEcho: true, pressure: 2, locked: 2, seed: 8586, act: 3, tags: ['Memory vision'] }),
  L({ id: 27, name: 'The Old Bridge Root',  size: 9, slack: 0.2,  echoRate: 0.16, sources: 3, pressure: 2, seed: 4957, act: 3, tags: ['Collapse'] }),
  L({ id: 28, name: 'Vein Junction',        size: 9, slack: 0.18, echoRate: 0.16, sources: 3, pressure: 2, locked: 3, seed: 9728, act: 3, tags: ['Hold the line'] }),
  L({ id: 29, name: 'The Antechamber',      size: 9, slack: 0.18, echoRate: 0.22, decoyEcho: true, sources: 2, pressure: 3, locked: 3, seed: 1599, act: 3, tags: ['Every mechanic'] }),
  L({ id: 30, name: 'The Heartbeat',        size: 9, slack: 0.5,  echoRate: 0.35, seed: 3000, act: 3, tags: ['Boss', 'Pattern reveal'],
      fixedPaths: [HEART_LEFT, HEART_RIGHT] })
];

export const ACTS = {
  1: { title: 'ACT I — THE ASSIGNMENT', range: [1, 8] },
  2: { title: 'ACT II — THE DISCOVERY', range: [9, 20] },
  3: { title: 'ACT III — THE PULSE', range: [21, 30] }
};

export const getLevel = (id) => LEVELS.find(l => l.id === id);
