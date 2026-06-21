# VEIN CITY

> *"The city doesn't have a grid. The city has a heartbeat."*

A hybrid **tile-reveal + path-routing puzzle** wrapped in a **30-level noir story**, built with **React + Vite**. One codebase ships to **web, Android, and PC**. Landscape-only.

Mara, a city engineer, discovers the pipes beneath an old district form a living network. Solve a block, light its district, and watch the town come alive on the main menu — beat by beat.

---

## Quick start

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the production build

node scripts/verify-levels.mjs   # proves all 30 levels solvable in budget
node scripts/play-test.mjs       # simulates full playthroughs via the engine
```

## Project structure

```
vein-city/
├── index.html                  # landscape viewport, fonts, loading splash
├── vite.config.js              # base './' → works on any static host
├── scripts/
│   ├── verify-levels.mjs       # CI-able solvability proof for all levels
│   └── play-test.mjs           # engine playthrough simulation
└── src/
    ├── main.jsx                # entry, splash teardown
    ├── App.jsx                 # screen flow: menu → comic → puzzle → comic → menu
    ├── core/
    │   ├── constants.js        # GDD palette, direction bitmasks, tile masks
    │   └── rng.js              # seeded RNG (mulberry32) — deterministic levels
    ├── game/
    │   ├── generator.js        # carves solvable networks, scrambles, budgets
    │   └── engine.js           # pure reducer: reveal/rotate/undo/chains/win
    ├── data/
    │   ├── levels.js           # 30 level configs + hand-authored L30 heart
    │   └── story.js            # cast, 60 comic beats, journal, relics, hints
    ├── state/
    │   └── GameContext.jsx     # save/load (localStorage), reveal queue, boosters
    ├── audio/
    │   └── AudioEngine.js      # WebAudio synth: heartbeat, drone, all SFX
    ├── components/
    │   ├── menu/MainMenu.jsx   # living-town hub + level select
    │   ├── town/               # townModel (layout) · townRenderer (canvas) · TownView (input)
    │   ├── puzzle/             # PuzzleScreen (HUD/boosters/hints) · TileView (pipe SVG)
    │   ├── comic/              # ComicScreen (typewriter dialogue) · ComicPanel (SVG scenes)
    │   ├── journal/Journal.jsx # torn pages + relic shelf
    │   └── ui/OrientationGate.jsx
    └── styles/global.css       # full GDD art direction
```

## How the systems map to the GDD

| GDD feature | Implementation |
|---|---|
| M1–M3 Tiles / moves / completion | `engine.js` — bitmask ports (N/E/S/W), BFS flow from sources, leak-free win check |
| M4 City Pulse | star rating from moves spared; pulse % on the result dossier |
| M5 Journal | one torn page per level (`story.js` → Journal screen) |
| F-01 Echo Tiles | ghost orientation flickers on hidden tiles; **Decoy Echoes** lie in late levels |
| F-02 Pressure Zones | rust-tinted cells cost 2 moves; **Vent** booster clears a 3×3 |
| F-03 Resonance Chains | 3+ collinear reveals → continuing reveals are free |
| F-04 Mara's Intuition | 60 s idle → pulsing INTUITION button: cryptic line + 3 s cell flash |
| F-05 District Collections | 30 relic fragments on the journal's relic shelf |
| Living world map | the main menu **is** the town: 30 districts, heartbeat audio + glow |

**Guaranteed no-broken-levels:** levels are generated from fixed seeds; the network is carved first and tiles are derived from it, so a solution always exists. `scripts/verify-levels.mjs` proves it (run it in CI).

**Town reveal flow:** completing a level pushes its district id to `pendingReveals` in the save. The animation plays whenever the player next reaches the menu — right after the level, **or** on next launch tomorrow — then the queue clears.

## Adding levels / story

1. Add a config in `src/data/levels.js` (size, sources, pressure, locked, echoRate, seed, slack).
2. Add `before` / `after` comics + journal line + relic in `src/data/story.js`.
3. Add a district position rule in `townModel.js` if you exceed 30.
4. Run `node scripts/verify-levels.mjs`.

## Shipping

### Web (Playgama / CrazyGames / itch.io / any static host)
`npm run build` → upload the contents of `dist/`. The relative base (`./`) means no path config is needed. For Playgama, integrate the PlaygamaBridge SDK in `index.html` and signal ready after the splash removes itself.

### Android (Google Play) — Capacitor
```bash
npm i -D @capacitor/cli @capacitor/core @capacitor/android
npx cap init "Vein City" com.thebutterflygames.veincity --web-dir dist
npm run build && npx cap add android && npx cap sync
```
Lock landscape in `android/app/src/main/AndroidManifest.xml`:
```xml
<activity ... android:screenOrientation="sensorLandscape">
```
Then build the AAB in Android Studio as usual.

### PC (Windows/Linux/macOS) — Tauri (light) or Electron
Tauri: `npm i -D @tauri-apps/cli && npx tauri init` (point dist dir at `dist/`), set the window to 1280×720 min. Or simply zip `dist/` for itch.io's HTML5 PC player.

## Tech notes

- No runtime dependencies beyond React. All art is inline SVG/canvas; all audio is synthesized WebAudio — **zero asset files**, ~75 KB gzipped total.
- Save data: `localStorage` key `veincity_save_v1`.
- Reduced-motion and keyboard focus styles are respected.

— The Butterfly Games
