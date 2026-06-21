// ─── ComicScreen ─────────────────────────────────────────────────────────────
// Plays a comic (array of panels). Each panel shows the SVG scene; dialogue
// lines type out one at a time; tap anywhere to advance. Replays are skippable.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ComicPanel from './ComicPanel.jsx';
import { CAST } from '../../data/story.js';
import { audio } from '../../audio/AudioEngine.js';

function useTypewriter(text, speed = 18) {
  const [shown, setShown] = useState('');
  const doneRef = useRef(false);
  useEffect(() => {
    doneRef.current = false;
    setShown('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) { doneRef.current = true; clearInterval(id); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return [shown, doneRef, setShown];
}

export default function ComicScreen({ panels, levelId, phase, title, subtitle, onDone }) {
  const [pi, setPi] = useState(0);   // panel index
  const [li, setLi] = useState(0);   // line index within panel
  const panel = panels[pi];
  const line = panel.lines[li];
  const [shown, doneRef, setShown] = useTypewriter(line ? line[1] : '');

  useEffect(() => { audio.playPage(); }, [pi]);

  const advance = useCallback(() => {
    if (!doneRef.current && line) {
      // finish the typewriter instantly first
      setShown(line[1]);
      doneRef.current = true;
      return;
    }
    if (li + 1 < panel.lines.length) {
      setLi(li + 1);
    } else if (pi + 1 < panels.length) {
      setPi(pi + 1);
      setLi(0);
    } else {
      onDone();
    }
  }, [li, pi, panel, panels, line, onDone, doneRef, setShown]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') advance();
      if (e.key === 'Escape') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, onDone]);

  const speaker = line ? CAST[line[0]] : null;
  const isCaption = line && line[0] === 'cap';
  const isCity = line && line[0] === 'city';

  return (
    <div className="comic-screen" onClick={advance}>
      <div className="comic-head">
        <div className="comic-title">{title}</div>
        {subtitle && <div className="comic-sub">{subtitle}</div>}
      </div>

      <div className="comic-stage" key={pi}>
        <ComicPanel levelId={levelId} phase={phase} bg={panel.bg} actors={panel.actors} />
      </div>

      <div className={`comic-dialogue ${isCaption ? 'is-caption' : ''} ${isCity ? 'is-city' : ''}`} key={`${pi}-${li}`}>
        {!isCaption && speaker && (
          <span className="comic-speaker" style={{ color: speaker.color }}>{speaker.name}</span>
        )}
        <span className="comic-text">{shown}</span>
        <span className="comic-caret">▸</span>
      </div>

      <div className="comic-dots">
        {panels.map((_, i) => <span key={i} className={`dot ${i === pi ? 'on' : ''}`} />)}
      </div>

      <button className="comic-skip" onClick={(e) => { e.stopPropagation(); onDone(); }}>
        SKIP ▸▸
      </button>
    </div>
  );
}
