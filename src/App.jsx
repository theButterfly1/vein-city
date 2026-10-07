// ─── App ─────────────────────────────────────────────────────────────────────
// Screen flow: TOWN MENU → BEFORE-COMIC → PUZZLE → AFTER-COMIC → TOWN MENU
// (where the newly-solved district animates alive). Landscape is enforced by
// the OrientationGate.

import React, { useState, useEffect, useCallback } from 'react';
import { GameProvider, useGame } from './state/GameContext.jsx';
import MainMenu from './components/menu/MainMenu.jsx';
import PuzzleScreen from './components/puzzle/PuzzleScreen.jsx';
import ComicScreen from './components/comic/ComicScreen.jsx';
import OrientationGate from './components/ui/OrientationGate.jsx';
import { getLevel, ACTS } from './data/levels.js';
import { STORY, ENDING } from './data/story.js';
import { audio } from './audio/AudioEngine.js';
import { platform } from './platform/bridge.js';

function Flow() {
  const game = useGame();
  const [screen, setScreen] = useState({ name: 'menu' });
  const [paused, setPaused] = useState(platform.isGameplayPaused);

  useEffect(() => platform.subscribePause(setPaused), []);

  // audio lifecycle: heartbeat + drone live on the menu
  useEffect(() => {
    audio.setEnabled(game.save.sound);
  }, [game.save.sound]);

  useEffect(() => {
    if (screen.name === 'menu') {
      audio.startHeartbeat(0.2);
      audio.startDrone();
    } else {
      audio.stopHeartbeat();
      audio.setBgmDuck(0);   // the zoom-duck only applies to the menu town
      audio.setHeartRate(1);
      if (screen.name === 'puzzle') audio.startDrone(); else audio.stopDrone();
    }

    // background music follows the act of the level in focus (act 1: L1–8,
    // act 2: L9–20, act 3: L21–30) — crossfades only when the act changes.
    const focusId = screen.levelId ?? game.nextLevelId() ?? 30;
    const lvl = getLevel(focusId);
    if (lvl) audio.setBgmAct(lvl.act);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen.name, screen.levelId]);

  useEffect(() => {
    if (screen.name === 'puzzle') platform.levelStarted(screen.levelId);
  }, [screen.name, screen.levelId]);

  const startLevel = useCallback((id) => {
    if (platform.isGameplayPaused) return;
    const lvl = getLevel(id);
    const beats = STORY[id];
    if (beats?.before?.length) {
      setScreen({ name: 'comic', phase: 'before', levelId: id, panels: beats.before });
    } else {
      setScreen({ name: 'puzzle', levelId: id });
    }
  }, []);

  const onComicDone = useCallback(() => {
    if (platform.isGameplayPaused) return;
    const { phase, levelId, stars } = screen;
    game.markComicSeen(`${levelId}:${phase}`);
    if (phase === 'before') {
      setScreen({ name: 'puzzle', levelId });
    } else {
      // Natural break after a solved level → interstitial (SDK throttles to a
      // 60s minimum; audio is paused by the central ad handler).
      platform.showInterstitial();
      setScreen({ name: 'menu' });
    }
  }, [screen, game]);

  const onPuzzleComplete = useCallback((stars) => {
    if (platform.isGameplayPaused) return;
    const id = screen.levelId;
    const beats = STORY[id];
    if (beats?.after?.length) {
      setScreen({ name: 'comic', phase: 'after', levelId: id, panels: beats.after, stars });
    } else {
      setScreen({ name: 'menu' });
    }
  }, [screen]);

  if (screen.name === 'menu') {
    return (
      <>
        <MainMenu onPlayLevel={startLevel} paused={paused} />
        {paused && <div className="platform-pause-veil" aria-hidden="true" />}
      </>
    );
  }

  if (screen.name === 'comic') {
    const lvl = getLevel(screen.levelId);
    const isFinale = screen.levelId === 30 && screen.phase === 'after';
    const sub = screen.phase === 'before'
      ? `${ACTS[lvl.act].title} · LEVEL ${String(lvl.id).padStart(2, '0')}`
      : isFinale
        ? (screen.stars === 3 ? ENDING.threeStar : ENDING.normal)
        : `LEVEL ${String(lvl.id).padStart(2, '0')} — SOLVED`;
    return (
      <>
        <ComicScreen
          key={`${screen.levelId}-${screen.phase}`}
          panels={screen.panels}
          levelId={screen.levelId}
          phase={screen.phase}
          title={lvl.name.toUpperCase()}
          subtitle={sub}
          onDone={onComicDone}
        />
        {paused && <div className="platform-pause-veil" aria-hidden="true" />}
      </>
    );
  }

  if (screen.name === 'puzzle') {
    const lvl = getLevel(screen.levelId);
    return (
      <>
        <PuzzleScreen
          key={screen.levelId + ':' + (screen.retry || 0)}
          level={lvl}
          paused={paused}
          onComplete={onPuzzleComplete}
          onRetry={() => { if (!platform.isGameplayPaused) setScreen(s => ({ ...s, retry: (s.retry || 0) + 1 })); }}
          onExit={() => {
            if (platform.isGameplayPaused) return;
            platform.levelFailed(screen.levelId);
            setScreen(s => (s.name === 'puzzle' ? { name: 'menu' } : s));
          }}
        />
        {paused && <div className="platform-pause-veil" aria-hidden="true" />}
      </>
    );
  }

  return null;
}

export default function App({ initialSave }) {
  return (
    <GameProvider initialSave={initialSave}>
      <OrientationGate>
        <Flow />
      </OrientationGate>
    </GameProvider>
  );
}
