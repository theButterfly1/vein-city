import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import { load } from './platform/storage.js';
import { audio } from './audio/AudioEngine.js';
import { track } from './platform/analytics.js';
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

function boot() {
  track('session_start');

  // 1. Load saved progress (null → fresh save).
  const initialSave = load(SAVE_KEY);

  // 2. Apply language (saved choice → browser).
  initLanguage(initialSave && initialSave.lang);

  // 3. Mount the game.
  const root = createRoot(document.getElementById('root'));
  root.render(<App initialSave={initialSave} />);

  // 4. First playable frame is ready → dismiss the splash.
  dismissLoadingVeil();

  // Stop all sound when the tab/window is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.suspend(); else audio.resume();
  });
}

boot();
