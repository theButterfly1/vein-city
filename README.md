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

## Daily towns, reviewer mode, city voice

| Feature | Where |
|---|---|
| **Daily unlock** — towns 1–3 on day one (`DAY_ONE_TOWNS` in `core/constants.js`), then one more the calendar day after the newest town is solved. Missed days never stack. Locked towns show *"The city wakes in hh:mm:ss"*. | `game/daily.js` (pure, tested by `node scripts/verify-daily.mjs`) · `state/GameContext.jsx` |
| **Reviewer mode** — the **REVIEWER: SKIP TO TOMORROW** button (menu, top-right) advances the day by one; `?reviewer=1` opens all 30 towns. | `components/menu/MainMenu.jsx` |
| **Cliffhanger** — after the last town open today, the city teases tomorrow. Edit the lines in `data/cliffhangers.json`. | `components/ui/Cliffhanger.jsx` |
| **Stars** — 1–3 per town from moves left vs. the level's slack above the minimum solve cost; best result saved; *Replay for 3 ★* on the dossier and the districts grid. | `game/engine.js` (`starRating`) |
| **City voice** — after each town, OpenAI (`gpt-4o-mini` by default; set `OPENAI_MODEL` to change) via the `/api/city-voice` serverless function (key server-side only, 10 req/min per IP, `max_tokens` 80, 4 s client timeout). Any failure → scripted lines in `data/fallback-lines.json`. | `api/city-voice.js` · `platform/cityVoice.js` |
| **Analytics** — `session_start`, `town_complete`, `day_return`, `ai_line_shown`, `ai_fallback_used` logged to the console as `[analytics]`. | `platform/analytics.js` |

## Shipping

### One-click public link — Vercel (recommended; runs the city-voice function)
1. Push the repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo. Vercel detects Vite (build `npm run build`, output `dist`) and turns `api/` into serverless functions.
3. Project → Settings → Environment Variables → add `OPENAI_API_KEY` (Production + Preview). Never prefix it with `VITE_`.
4. Deploy. Share `https://<project>.vercel.app` — and `https://<project>.vercel.app/?reviewer=1` for reviewers.

Without the key, or on any static host, the game still works: the city voice uses its scripted lines. To try the function locally: `npx vercel dev` with a `.env` holding the key (`.env` is git-ignored).

### Web (CrazyGames / itch.io / any static host)
`npm run build` → upload the contents of `dist/`. The relative base (`./`) means no path config is needed.

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
