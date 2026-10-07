import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import { platform } from './platform/bridge.js';
import { SAVE_KEY } from './core/constants.js';
import { initLanguage } from './i18n/i18n.js';

function dismissLoadingVeil() {
  const splash = document.getElementById('splash');
  if (!splash) return;

  splash.classList.add('loading-veil--out');
  splash.addEventListener('animationend', () => {
    splash.classList.add('hidden');
  }, { once: true });
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
  platform.gameReady();
  dismissLoadingVeil();

  // Certification: stop all sound when the tab/window is hidden.
  document.addEventListener('visibilitychange', () => {
    platform.setDocumentHidden(document.hidden);
  });
}

boot();
