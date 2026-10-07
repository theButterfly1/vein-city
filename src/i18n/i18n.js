// ─── i18n core ───────────────────────────────────────────────────────────────
// Tiny dictionary-based localization. English is the complete base; the other
// declared languages fall back to English per-key until their strings are filled
// in. `t(key, vars)` resolves dotted keys with {var} interpolation and may
// return strings, arrays, or objects (used by the comic story data).

import { useState, useEffect } from 'react';

import en from './locales/en.js';
import ru from './locales/ru.js';
import es from './locales/es.js';
import pt from './locales/pt.js';
import fr from './locales/fr.js';
import de from './locales/de.js';

// Declared languages (shown in the in-game selector). Each must be fully
// translated before being declared on the store listing.
export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' }
];

const DICTS = { en, ru, es, pt, fr, de };
const SUPPORTED = LANGS.map((l) => l.code);

let current = 'en';
const listeners = new Set();

export const supported = (code) => SUPPORTED.includes(code);
export const getLanguage = () => current;
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

// Resolve the boot language: saved choice → browser → English.
export function initLanguage(savedLang) {
  let code = savedLang;
  if (!supported(code)) {
    let nav = 'en';
    try { nav = navigator.language.slice(0, 2).toLowerCase(); } catch (e) { /* */ }
    code = supported(nav) ? nav : 'en';
  }
  current = code;
  try { document.documentElement.lang = code; } catch (e) { /* */ }
  return code;
}

export function setLanguage(code) {
  const c = supported(code) ? code : 'en';
  if (c === current) return;
  current = c;
  try { document.documentElement.lang = c; } catch (e) { /* */ }
  listeners.forEach((fn) => fn(c));
}

function lookup(dict, key) {
  if (!dict) return null;
  if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key]; // flat key
  let o = dict;
  for (const part of key.split('.')) {
    if (o == null) return null;
    o = o[part];
  }
  return o == null ? null : o;
}

export function t(key, vars) {
  let val = lookup(DICTS[current], key);
  if (val == null) val = lookup(DICTS.en, key);
  if (val == null) return key;
  if (typeof val === 'string' && vars) {
    return val.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
  }
  return val;
}

// React hook: re-renders the component when the language changes.
export function useT() {
  const [, bump] = useState(0);
  useEffect(() => subscribe(() => bump((n) => n + 1)), []);
  return { t, lang: current, setLang: setLanguage };
}
