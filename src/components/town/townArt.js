// ─── Town art loader ─────────────────────────────────────────────────────────
// Preloads the menu PNGs as HTMLImageElements for the canvas renderer. Each
// piece is optional: if a file is missing it simply 404s, `loaded()` stays
// false, and the renderer falls back to its procedural drawing for that piece.

import { MENU_ART } from '../../assets/images.js';

const ART = {};
for (const [key, src] of Object.entries(MENU_ART)) {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  ART[key] = img;
}

export const TOWN_ART = ART;

// True only once the image has decoded to non-zero pixels (a 404 leaves
// complete === true but naturalWidth === 0).
export const loaded = (img) => !!img && img.complete && img.naturalWidth > 0;
