// ─── PuzzleScreen ────────────────────────────────────────────────────────────
// The level itself: clipboard HUD on the left, the city-block grid centered,
// booster tray below. Tap stone to reveal (costs moves), tap pipe to rotate
// (free). Solving plays the source→sink light wave, then the dossier result.

import React, { useMemo, useReducer, useState, useEffect, useRef, useCallback } from 'react';
import { generateLevel } from '../../game/generator.js';
import { initEngine, reduce } from '../../game/engine.js';
import TileView from './TileView.jsx';
import { audio } from '../../audio/AudioEngine.js';
import { useGame } from '../../state/GameContext.jsx';
import { JOURNAL, RELICS, HINTS } from '../../data/story.js';
import { ACTS } from '../../data/levels.js';
import { platform } from '../../platform/bridge.js';
import { t } from '../../i18n/i18n.js';

function engineReducer(state, action) { return reduce(state, action); }

export default function PuzzleScreen({ level, onComplete, onRetry, onExit }) {
  const game = useGame();
  const layout = useMemo(() => generateLevel(level), [level]);
  const [st, dispatch] = useReducer(engineReducer, layout, initEngine);

  const [toast, setToast] = useState(null);
  const [ventMode, setVentMode] = useState(false);
  const [justRevealed, setJustRevealed] = useState(null);
  const [hintCell, setHintCell] = useState(null);
  const [hintReady, setHintReady] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const lastActionRef = useRef(Date.now());
  const toastTimer = useRef(null);

  const say = useCallback((msg, tone = '') => {
    setToast({ msg, tone });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // handle engine events → sound + toasts
  useEffect(() => {
    for (const ev of st.events) {
      switch (ev.t) {
        case 'reveal':
          audio.playReveal(ev.cost === 2);
          setJustRevealed(ev.i);
          setTimeout(() => setJustRevealed(null), 450);
          break;
        case 'chain':
          audio.playChain();
          say(`RESONANCE CHAIN ×${ev.len} — free reveal!`, 'gold');
          break;
        case 'rotate':
          if (ev.snapped) audio.playSnap(); else audio.playRotate();
          break;
        case 'key':
          audio.playKey();
          say('KEY FRAGMENT FOUND', 'gold');
          break;
        case 'unlock':
          audio.playSnap();
          say('GRATE UNLOCKED', 'teal');
          break;
        case 'locked':
          audio.playDenied();
          say('LOCKED — find a key fragment first', 'rust');
          break;
        case 'noMoves':
          audio.playDenied();
          say('NOT ENOUGH MOVES', 'rust');
          break;
        case 'noUndo':
          audio.playDenied();
          break;
        case 'vent':
          audio.playKey();
          say('ZONE DEPRESSURIZED', 'teal');
          break;
        case 'moves+':
          audio.playKey();
          say('+5 MOVES', 'gold');
          break;
        case 'solved':
          audio.playBreath();
          break;
        default: break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st]);

  // result panel after the light wave
  useEffect(() => {
    if (st.solved) {
      const t = setTimeout(() => setShowResult(true), 1700);
      return () => clearTimeout(t);
    }
  }, [st.solved]);

  // Mara's Intuition — inactivity timer (F-04)
  useEffect(() => {
    lastActionRef.current = Date.now();
    setHintReady(false);
  }, [st.moves, st.cells]);
  useEffect(() => {
    const id = setInterval(() => {
      if (!st.solved && Date.now() - lastActionRef.current > 60000) setHintReady(true);
    }, 2000);
    return () => clearInterval(id);
  }, [st.solved]);

  const useHint = () => {
    const hidden = st.cells.filter(c => c.network && !c.revealed && !c.locked);
    if (hidden.length) {
      const pick = hidden[0];
      setHintCell(pick.i);
      setTimeout(() => setHintCell(null), 3000);
    }
    say(`MARA: “${HINTS[(level.id - 1) % HINTS.length]}”`, 'paper');
    setHintReady(false);
    lastActionRef.current = Date.now();
    audio.playPage();
  };

  const onTap = (i) => {
    audio.init();
    if (st.solved) return;
    if (ventMode) {
      if (game.useBooster('vent')) dispatch({ type: 'VENT', i });
      setVentMode(false);
      return;
    }
    const cell = st.cells[i];
    if (cell.revealed) dispatch({ type: 'ROTATE', i });
    else dispatch({ type: 'REVEAL', i });
  };

  const booster = (kind) => {
    if (st.solved) return;
    if ((game.save.boosters[kind] || 0) <= 0) { audio.playDenied(); say('NONE LEFT — earned by solving levels', 'rust'); return; }
    if (kind === 'vent') { setVentMode(v => !v); return; }
    if (!game.useBooster(kind)) return;
    if (kind === 'echo') dispatch({ type: 'ECHO_BOOST' });
    if (kind === 'moves') dispatch({ type: 'ADD_MOVES' });
  };

  const finish = () => {
    game.completeLevel(level.id, st.stars);
    onComplete(st.stars);
  };

  // Rewarded ad: a bonus +5 moves on top of retry/boosters (never required to
  // continue — retry is always free). Grants only when the player earns it.
  const watchAdForMoves = () => {
    const started = platform.showRewarded(() => {
      dispatch({ type: 'ADD_MOVES' });
      say(t('ads.rewardMoves'), 'gold');
    });
    if (!started) say('AD UNAVAILABLE', 'rust');
  };

  // grid sizing: fit available height in landscape
  const cellPx = `min(calc((100vh - 130px) / ${layout.h}), calc((100vw - 320px) / ${layout.w}), 72px)`;
  const outOfMoves = st.moves <= 0 && !st.solved;
  const efficiency = st.solved ? Math.round((st.moves / st.movesTotal) * 100) : 0;

  return (
    <div className="puzzle-screen">
      {/* ── left clipboard HUD ── */}
      <aside className="hud">
        <button className="hud-exit" onClick={() => setConfirmExit(true)}>◂ TOWN</button>
        <div className="hud-stamp">{ACTS[level.act].title.split('—')[0].trim()}</div>
        <div className="hud-level">
          <span className="hud-label">LEVEL</span>
          <span className="hud-big">{String(level.id).padStart(2, '0')}</span>
        </div>
        <div className="hud-name">{level.name}</div>
        <div className="hud-row">
          <span className="hud-label">MOVES LEFT</span>
          <span className={`hud-big ${st.moves <= 4 && !st.solved ? 'low' : ''}`}>{String(Math.max(0, st.moves)).padStart(2, '0')}</span>
        </div>
        <div className="hud-meter">
          <div className="hud-meter-fill" style={{ width: `${Math.max(0, (st.moves / st.movesTotal)) * 100}%` }} />
        </div>
        {st.keys > 0 && <div className="hud-keys">⚷ KEY FRAGMENTS × {st.keys}</div>}
        {st.chainLen >= 2 && !st.solved && (
          <div className="hud-chain">RESONANCE {st.chainLen >= 3 ? '— NEXT FREE' : `${st.chainLen}/3`}</div>
        )}
        <div className="hud-tags">{(level.tags || []).map(t => <span key={t} className="tag">{t}</span>)}</div>

        <div className="hud-actions">
          <button className="hud-btn" onClick={() => dispatch({ type: 'UNDO' })} disabled={st.undosLeft <= 0 || st.solved}>
            UNDO <em>{st.undosLeft}</em>
          </button>
          <button className={`hud-btn journal-btn ${hintReady ? 'pulse' : ''}`} onClick={useHint} disabled={st.solved}>
            INTUITION
          </button>
        </div>
      </aside>

      {/* ── grid ── */}
      <main className="grid-area">
        <div
          className={`grid ${st.solved ? 'solved' : ''} ${ventMode ? 'vent-mode' : ''}`}
          style={{ gridTemplateColumns: `repeat(${layout.w}, ${cellPx})` }}
        >
          {st.cells.map(cell => (
            <TileView
              key={cell.i}
              cell={cell}
              flow={st.flow}
              cellPx={cellPx}
              onTap={onTap}
              justRevealed={justRevealed === cell.i}
              hintGlow={hintCell === cell.i}
            />
          ))}
        </div>

        {ventMode && <div className="vent-banner">TAP A CELL — vents the 3×3 zone around it</div>}
        {toast && <div className={`toast ${toast.tone}`}>{toast.msg}</div>}

        {outOfMoves && (
          <div className="oom-banner">
            <span>OUT OF MOVES — rotation is still free</span>
            {platform.isRewardedSupported && (
              <button className="oom-ad" onClick={watchAdForMoves}>{t('ads.watchForMoves')}</button>
            )}
            <button onClick={() => booster('moves')}>+5 MOVES <em>{game.save.boosters.moves}</em></button>
            <button onClick={onRetry}>RETRY ↻</button>
          </div>
        )}
      </main>

      {/* ── booster tray ── */}
      <footer className="tray">
        <button className={`tray-btn ${ventMode ? 'armed' : ''}`} onClick={() => booster('vent')}>
          <span className="tray-icon">⌬</span> VENT <em>{game.save.boosters.vent}</em>
        </button>
        <button className="tray-btn" onClick={() => booster('echo')}>
          <span className="tray-icon">◌</span> ECHO <em>{game.save.boosters.echo}</em>
        </button>
        <button className="tray-btn" onClick={() => booster('moves')}>
          <span className="tray-icon">＋</span> MOVES <em>{game.save.boosters.moves}</em>
        </button>
      </footer>

      {/* ── solved dossier ── */}
      {showResult && (
        <div className="result-veil">
          <div className="result-card">
            <div className="result-stamp">NETWORK<br />COMPLETE</div>
            <div className="result-stars">
              {[1, 2, 3].map(s => <span key={s} className={`star ${s <= st.stars ? 'on' : ''}`}>★</span>)}
            </div>
            <div className="result-eff">PULSE INTENSITY — {efficiency}% · {st.moves} MOVES SPARED</div>
            <div className="result-journal">
              <div className="rj-label">TORN PAGE — MARA'S JOURNAL · ENTRY {level.id}</div>
              <p>“{JOURNAL[level.id]}”</p>
            </div>
            <div className="result-relic">RELIC FRAGMENT — {RELICS[level.id].name}</div>
            <button className="result-continue" onClick={finish}>CONTINUE ▸</button>
          </div>
        </div>
      )}

      {confirmExit && (
        <div className="result-veil" onClick={() => setConfirmExit(false)}>
          <div className="result-card small" onClick={e => e.stopPropagation()}>
            <p className="confirm-text">Abandon this block? Progress on the grid is lost.</p>
            <div className="confirm-row">
              <button className="result-continue ghost" onClick={() => setConfirmExit(false)}>STAY</button>
              <button className="result-continue" onClick={onExit}>LEAVE ▸</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
