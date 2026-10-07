// ─── MainMenu ────────────────────────────────────────────────────────────────
// The living town is the menu. Districts breathe in time with the heartbeat;
// pending reveals (from solving, even in a previous session) animate the
// moment the player arrives here. Tap the beacon district — or any solved
// district — to play.

import React, { useState, useEffect, useRef } from 'react';
import TownView from '../town/TownView.jsx';
import Journal from '../journal/Journal.jsx';
import { useGame } from '../../state/GameContext.jsx';
import { LEVELS, ACTS, getLevel } from '../../data/levels.js';
import { audio } from '../../audio/AudioEngine.js';
import { MENU_ART } from '../../assets/images.js';

export default function MainMenu({ onPlayLevel, paused = false }) {
  const game = useGame();
  const [revealQueue, setRevealQueue] = useState([]);
  const [revealedNow, setRevealedNow] = useState([]); // ids already animated this visit
  const [showJournal, setShowJournal] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [banner, setBanner] = useState(null);
  const consumedRef = useRef(false);

  const completed = game.save.completed;
  const nextId = game.nextLevelId();

  // Districts already lit (exclude ones still waiting in the reveal queue)
  const pendingSet = new Set([...game.save.pendingReveals, ...revealQueue]);
  const litIds = Object.keys(completed).map(Number)
    .filter(id => !pendingSet.has(id) || revealedNow.includes(id));

  // On arrival: consume queued reveals (after a level OR from a past session)
  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;
    const q = game.consumeReveals();
    if (q.length) {
      const t = setTimeout(() => setRevealQueue(q), 650);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRevealDone = (id) => {
    setRevealedNow(prev => [...prev, id]);
    const lvl = getLevel(id);
    setBanner(`${lvl.name.toUpperCase()} — COMES ALIVE`);
    setTimeout(() => setBanner(null), 2400);
  };

  const onPickDistrict = (id) => {
    if (paused) return;
    audio.init();
    if (id === nextId || completed[id]) {
      onPlayLevel(id);
    } else if (game.isUnlocked(id)) {
      onPlayLevel(id);
    } else {
      setBanner('THIS BLOCK IS STILL DARK — solve the marked district first');
      setTimeout(() => setBanner(null), 2200);
      audio.playDenied();
    }
  };

  const allDone = nextId === null;
  const stars = Object.values(completed).reduce((a, b) => a + b, 0);

  return (
    <div
      className="menu-screen"
      onPointerDown={() => {
        if (paused) return;
        audio.init();
        audio.setEnabled(game.save.sound);
        audio.startHeartbeat(0.2);
        audio.startDrone();
      }}
    >
      <TownView
        litIds={litIds}
        nextId={nextId}
        revealQueue={revealQueue}
        onRevealDone={onRevealDone}
        onPickDistrict={onPickDistrict}
      />

      <header className="menu-head">
        <img
          className="menu-emblem"
          src={MENU_ART.emblem}
          alt=""
          draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="menu-headtext">
          <div className="menu-title">VEIN CITY</div>
          <div className="menu-tag">“The city doesn't have a grid. The city has a heartbeat.”</div>
        </div>
      </header>

      <div className="menu-stats">
        <span>{litIds.length} / 30 DISTRICTS ALIVE</span>
        <span>★ {stars}</span>
      </div>

      {banner && <div className="menu-banner">{banner}</div>}

      <footer className="menu-bar">
        <button className="menu-btn primary" onClick={() => { if (paused) return; audio.init(); audio.playUI(); nextId ? onPlayLevel(nextId) : setShowLevels(true); }}>
          {allDone ? 'REPLAY BLOCKS' : `▸ LEVEL ${String(nextId).padStart(2, '0')} — ${getLevel(nextId).name.toUpperCase()}`}
        </button>
        <button className="menu-btn" onClick={() => { if (paused) return; audio.init(); audio.playUI(); setShowLevels(true); }}>DISTRICTS</button>
        <button className="menu-btn" onClick={() => { if (paused) return; audio.init(); audio.playUI(); setShowJournal(true); }}>JOURNAL</button>
        <button className="menu-btn" onClick={() => { if (paused) return; game.setSound(!game.save.sound); audio.init(); audio.setEnabled(!game.save.sound); audio.playUI(); }}>
          {game.save.sound ? 'SOUND ◉' : 'SOUND ○'}
        </button>
      </footer>

      <div className="menu-hint">drag to slide · pinch / wheel to zoom · twist or dials to rotate · tap the beacon to play</div>

      {showJournal && <Journal onClose={() => setShowJournal(false)} />}

      {showLevels && (
        <div className="journal-veil" onClick={() => setShowLevels(false)}>
          <div className="journal levels-modal" onClick={e => e.stopPropagation()}>
            <div className="journal-head">
              <h2>CITY DISTRICTS</h2>
              <button className="journal-close" onClick={() => setShowLevels(false)}>✕</button>
            </div>
            <div className="levels-grid">
              {LEVELS.map(l => {
                const done = completed[l.id];
                const unlocked = game.isUnlocked(l.id);
                return (
                  <button
                    key={l.id}
                    className={`level-cell ${done ? 'done' : ''} ${!unlocked ? 'locked' : ''} ${l.id === nextId ? 'next' : ''}`}
                    disabled={!unlocked}
                    onClick={() => { if (paused) return; audio.playUI(); setShowLevels(false); onPlayLevel(l.id); }}
                  >
                    <span className="lc-num">{String(l.id).padStart(2, '0')}</span>
                    <span className="lc-name">{l.name}</span>
                    <span className="lc-stars">{done ? '★'.repeat(done) : unlocked ? 'OPEN' : '🔒'}</span>
                  </button>
                );
              })}
            </div>
            <div className="journal-foot">
              {ACTS[1].title} · {ACTS[2].title} · {ACTS[3].title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
