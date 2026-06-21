import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import { platform } from './platform/bridge.js';
import { SAVE_KEY } from './core/constants.js';
import { audio } from './audio/AudioEngine.js';
import { initLanguage } from './i18n/i18n.js';

function hideSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 650);
  }
}

async function boot() {
  // 1. Initialize the Bridge (resolves immediately in mock mode).
  await platform.init();

  // 2. Load saved progress through the SDK (localStorage fallback inside).
  let initialSave = null;
  try { initialSave = await platform.load(SAVE_KEY); } catch (e) { /* fresh save */ }

  // 3. Apply language (saved choice → platform language → browser).
  initLanguage(initialSave && initialSave.lang);

  // 4. Mount the game.
  const root = createRoot(document.getElementById('root'));
  root.render(<App initialSave={initialSave} />);

  // 5. First playable frame is ready → dismiss the platform loader + splash.
  requestAnimationFrame(() => {
    setTimeout(() => { platform.gameReady(); hideSplash(); }, 250);
  });

  // Certification: stop all sound when the tab/window is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.suspend(); else audio.resume();
  });
}

boot();
