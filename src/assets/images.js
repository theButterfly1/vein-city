// ─── Image asset paths ───────────────────────────────────────────────────────
// Real PNG art lives in /public (copied verbatim into the build at `base`).
//  • public/images/L{n}_p{1|2}.png   — comic panels (p1 = before, p2 = after)
//  • public/mainmenu/menu_*.png      — living-town menu art (transparent)
// Reference everything through BASE_URL so it resolves on itch / CrazyGames /
// GitHub Pages / Capacitor sub-paths as well as the dev server root.

const BASE = import.meta.env.BASE_URL; // '/' in dev, './' in the built bundle

// One comic panel per level + phase. before → p1, after → p2.
export const comicSrc = (levelId, phase) =>
  `${BASE}images/L${levelId}_p${phase === 'before' ? 1 : 2}.png`;

// Looping background music, one track per act (act 1: L1–8, act 2: L9–20,
// act 3: L21–30) — matches the `act` field in data/levels.js.
export const BGM = {
  1: `${BASE}audio/bgm/act1.mp3`,
  2: `${BASE}audio/bgm/act2.mp3`,
  3: `${BASE}audio/bgm/act3.mp3`
};

// Sound-effect samples. Any missing file falls back to the synthesized cue.
export const SFX = {
  connected: `${BASE}audio/sfx/connected.mp3`, // a pipe snaps into a live connection
  heartbeat: `${BASE}audio/sfx/heartbeat.mp3`, // the city's pulse (looped cue)
  rotate:    `${BASE}audio/sfx/rotate.mp3`,    // tile rotation
  reveal:    `${BASE}audio/sfx/reveal.mp3`,    // scraping a tile / district revealed
  ui_button: `${BASE}audio/sfx/ui_button.mp3`  // menu / HUD button press
};

// Living-town menu art. Any of these may be absent — callers must degrade
// gracefully (e.g. the procedural canvas fallback) when a piece fails to load.
export const MENU_ART = {
  sky:    `${BASE}mainmenu/menu_background_sky.png`,
  dark:   `${BASE}mainmenu/menu_district_dark.png`,
  lit:    `${BASE}mainmenu/menu_district_lit.png`,
  heart:  `${BASE}mainmenu/menu_heart_core.png`,
  vein:   `${BASE}mainmenu/menu_vein_segment.png`,
  hero:   `${BASE}mainmenu/menu_town_hero.png`,
  emblem: `${BASE}mainmenu/menu_emblem.png`
};
