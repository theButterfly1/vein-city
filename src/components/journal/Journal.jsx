// ─── Journal ─────────────────────────────────────────────────────────────────
// Mara's unofficial notebook: one torn page per solved level, the relic shelf,
// and act dossier progress.

import React, { useState } from 'react';
import { useGame } from '../../state/GameContext.jsx';
import { JOURNAL, RELICS } from '../../data/story.js';
import { LEVELS, ACTS } from '../../data/levels.js';

export default function Journal({ onClose }) {
  const game = useGame();
  const [tab, setTab] = useState('pages');
  const unlocked = game.save.journal;

  return (
    <div className="journal-veil" onClick={onClose}>
      <div className="journal" onClick={e => e.stopPropagation()}>
        <div className="journal-head">
          <h2>MARA'S JOURNAL</h2>
          <div className="journal-tabs">
            <button className={tab === 'pages' ? 'on' : ''} onClick={() => setTab('pages')}>TORN PAGES</button>
            <button className={tab === 'relics' ? 'on' : ''} onClick={() => setTab('relics')}>RELICS</button>
          </div>
          <button className="journal-close" onClick={onClose}>✕</button>
        </div>

        {tab === 'pages' && (
          <div className="journal-pages">
            {[1, 2, 3].map(act => (
              <section key={act}>
                <h3>{ACTS[act].title}</h3>
                {LEVELS.filter(l => l.act === act).map(l => (
                  <article key={l.id} className={`page ${unlocked.includes(l.id) ? '' : 'locked-page'}`}>
                    <div className="page-meta">ENTRY {String(l.id).padStart(2, '0')} · {l.name.toUpperCase()}</div>
                    <p>{unlocked.includes(l.id) ? `“${JOURNAL[l.id]}”` : '— page not yet recovered —'}</p>
                  </article>
                ))}
              </section>
            ))}
          </div>
        )}

        {tab === 'relics' && (
          <div className="relic-shelf">
            {LEVELS.map(l => {
              const owned = game.save.relics.includes(l.id);
              return (
                <div key={l.id} className={`relic ${owned ? 'owned' : ''}`} title={owned ? RELICS[l.id].name : 'Not found'}>
                  <div className="relic-num">{String(l.id).padStart(2, '0')}</div>
                  <div className="relic-name">{owned ? RELICS[l.id].name : '— ? —'}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="journal-foot">
          {unlocked.length} / 30 PAGES RECOVERED · {game.save.relics.length} / 30 RELICS
        </div>
      </div>
    </div>
  );
}
