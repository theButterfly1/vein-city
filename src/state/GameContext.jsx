// ─── Persistent game state ───────────────────────────────────────────────────
// localStorage save: completion + stars, relics, journal unlocks, boosters and
// the pendingReveals queue that drives the town "comes alive" animation when
// the player returns to the main menu.

import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { SAVE_KEY } from '../core/constants.js';
import { LEVELS } from '../data/levels.js';
import { platform } from '../platform/bridge.js';
import { setLanguage } from '../i18n/i18n.js';
import { ACHIEVEMENTS } from '../data/achievements.js';

const DEFAULT_SAVE = {
  v: 1,
  completed: {},        // { levelId: stars }
  relics: [],           // levelIds
  journal: [],          // levelIds with unlocked pages
  seenComics: [],       // "id:before" / "id:after"
  pendingReveals: [],   // district ids waiting to animate on the town
  boosters: { vent: 1, echo: 1, moves: 1 },
  achievements: [],     // unlocked achievement ids (in-game record)
  lang: null,           // chosen language code (null = use platform/browser)
  sound: true,
  introSeen: false
};

// Merge loaded data (from bridge.storage / localStorage) over the defaults.
function mergeSave(data) {
  if (!data || typeof data !== 'object') return { ...DEFAULT_SAVE };
  return { ...DEFAULT_SAVE, ...data, boosters: { ...DEFAULT_SAVE.boosters, ...(data.boosters || {}) } };
}

// Debounced persist through the Bridge (cloud where available + localStorage).
let saveTimer = null;
function persist(save) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { platform.save(SAVE_KEY, save); }, 200);
}

const GameCtx = createContext(null);

export function GameProvider({ children, initialSave }) {
  const [save, setSave] = useState(() => mergeSave(initialSave));
  const [recentAch, setRecentAch] = useState(null); // newest unlock, for the banner

  const update = useCallback((fn) => {
    setSave(prev => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  }, []);

  // Sync engagement features whenever progress changes: submit the ★ score and
  // unlock any newly-earned achievements (recorded in the save + native unlock).
  useEffect(() => {
    const stars = Object.values(save.completed).reduce((a, b) => a + b, 0);
    if (stars > 0) platform.submitScore(stars);

    const newly = ACHIEVEMENTS.filter(a => a.test(save) && !save.achievements.includes(a.id));
    if (newly.length) {
      newly.forEach(a => platform.unlockAchievement(a.id));
      setRecentAch(newly[newly.length - 1].id);
      update(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newly.map(a => a.id).filter(id => !prev.achievements.includes(id))]
      }));
    }
  // re-run only when actual progress changes
  }, [save.completed, save.relics]); // eslint-disable-line react-hooks/exhaustive-deps

  const api = useMemo(() => ({
    save,
    update,

    nextLevelId() {
      for (const l of LEVELS) if (!save.completed[l.id]) return l.id;
      return null; // everything done
    },

    isUnlocked(id) {
      if (id === 1) return true;
      return !!save.completed[id - 1];
    },

    completeLevel(id, stars) {
      update(prev => {
        const prevStars = prev.completed[id] || 0;
        const firstTime = !prev.completed[id];
        const next = {
          ...prev,
          completed: { ...prev.completed, [id]: Math.max(prevStars, stars) },
          journal: prev.journal.includes(id) ? prev.journal : [...prev.journal, id],
          relics: prev.relics.includes(id) ? prev.relics : [...prev.relics, id],
          pendingReveals: firstTime ? [...prev.pendingReveals, id] : prev.pendingReveals
        };
        // Booster drip: one of each at act boundaries + every 4 levels
        if (firstTime && (id % 4 === 0 || id === 8 || id === 20)) {
          next.boosters = {
            vent: prev.boosters.vent + 1,
            echo: prev.boosters.echo + 1,
            moves: prev.boosters.moves + 1
          };
        }
        return next;
      });
    },

    consumeReveals() {
      const queue = save.pendingReveals.slice();
      if (queue.length) update(prev => ({ ...prev, pendingReveals: [] }));
      return queue;
    },

    markComicSeen(key) {
      if (save.seenComics.includes(key)) return;
      update(prev => ({ ...prev, seenComics: [...prev.seenComics, key] }));
    },

    useBooster(kind) {
      if ((save.boosters[kind] || 0) <= 0) return false;
      update(prev => ({ ...prev, boosters: { ...prev.boosters, [kind]: prev.boosters[kind] - 1 } }));
      return true;
    },

    setSound(on) { update(prev => ({ ...prev, sound: on })); },
    setIntroSeen() { update(prev => ({ ...prev, introSeen: true })); },

    setLang(code) {
      setLanguage(code);
      update(prev => ({ ...prev, lang: code }));
    },

    recentAch,
    clearRecentAch() { setRecentAch(null); },

    resetAll() {
      const fresh = { ...DEFAULT_SAVE };
      persist(fresh);
      setSave(fresh);
    }
  }), [save, update, recentAch]);

  return <GameCtx.Provider value={api}>{children}</GameCtx.Provider>;
}

export const useGame = () => useContext(GameCtx);
