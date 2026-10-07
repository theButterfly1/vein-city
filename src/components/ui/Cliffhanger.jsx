// ─── Cliffhanger ─────────────────────────────────────────────────────────────
// End of the day's towns: the city teases tomorrow, then the locked menu.

import React from 'react';
import LINES from '../../data/cliffhangers.json';
import { audio } from '../../audio/AudioEngine.js';

export default function Cliffhanger({ levelId, onDone }) {
  return (
    <div className="cliffhanger" onClick={() => { audio.playPage(); onDone(); }}>
      <div className="cliffhanger-sign">THE CITY SPEAKS</div>
      <p className="cliffhanger-line">{LINES[levelId]}</p>
      <div className="cliffhanger-tap">tap to continue</div>
    </div>
  );
}
