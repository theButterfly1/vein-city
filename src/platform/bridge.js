// ─── Playgama Bridge wrapper ─────────────────────────────────────────────────
// A thin, safe facade over the global `bridge` SDK (loaded via the CDN script
// in index.html). Every call degrades to a localStorage / no-op mock when the
// SDK is absent — local dev, itch.io, or any non-Playgama host — so the game
// behaves identically everywhere and never throws if a platform lacks a feature.
//
// Docs: https://wiki.playgama.com/playgama/bridge-sdk

import { audio } from '../audio/AudioEngine.js';

// Placement / board / achievement identifiers. Interstitial & rewarded work
// without explicit placements; leaderboard and achievement IDs must match what
// you configure in the Playgama config editor / platform dashboard.
export const IDS = {
  leaderboard: 'stars',
  achievements: {
    act1: 'act1_clear',
    act2: 'act2_clear',
    act3: 'act3_clear',
    threeStar: 'first_three_star',
    relics: 'all_relics',
    finished: 'game_finished'
  }
};

const sdk = () => (typeof window !== 'undefined' ? window.bridge : null);

let _ready = null;
let _hasBridge = false;
let _rewardCb = null;

const EV = () => { try { return sdk().EVENT_NAME; } catch (e) { return {}; } };
const on = (mod, name, fn) => { try { sdk()[mod].on(EV()[name], fn); } catch (e) { /* noop */ } };

export const platform = {
  get available() { return _hasBridge; },

  // Resolves once the SDK is initialized — or immediately in mock mode.
  init() {
    if (_ready) return _ready;
    _ready = new Promise((resolve) => {
      const b = sdk();
      if (!b || typeof b.initialize !== 'function') { _hasBridge = false; resolve(false); return; }
      b.initialize()
        .then(() => { _hasBridge = true; this._bindEvents(); resolve(true); })
        .catch(() => { _hasBridge = false; resolve(false); });
    });
    return _ready;
  },

  get id() { try { return _hasBridge ? sdk().platform.id : 'mock'; } catch (e) { return 'mock'; } },

  // ISO 639-1 language, falling back to the browser.
  get language() {
    try { if (_hasBridge && sdk().platform.language) return sdk().platform.language; } catch (e) { /* */ }
    const nav = (typeof navigator !== 'undefined' && navigator.language) || 'en';
    return nav.slice(0, 2).toLowerCase();
  },

  sendMessage(type, opts) {
    try { if (_hasBridge) sdk().platform.sendMessage(type, opts); } catch (e) { /* */ }
  },
  gameReady() { this.sendMessage('game_ready'); },

  // ── persistent storage ─────────────────────────────────────────────────────
  // Reads through the platform (cloud where available) and always mirrors to
  // localStorage so progress survives even if a platform write fails.
  async load(key) {
    try {
      if (_hasBridge && sdk().storage) {
        let v = await sdk().storage.get(key);
        if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { /* keep string */ } }
        if (v != null) return v;
      }
    } catch (e) { /* fall through */ }
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? null : JSON.parse(raw);
    } catch (e) { return null; }
  },

  async save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* */ }
    try { if (_hasBridge && sdk().storage) await sdk().storage.set(key, value); } catch (e) { /* */ }
  },

  // ── advertising ─────────────────────────────────────────────────────────────
  get isRewardedSupported() { try { return !!(_hasBridge && sdk().advertisement.isRewardedSupported); } catch (e) { return false; } },
  get isInterstitialSupported() { try { return !!(_hasBridge && sdk().advertisement.isInterstitialSupported); } catch (e) { return false; } },

  // Interstitial at a natural break (level complete → menu). The SDK enforces a
  // minimum delay (default 60s) between interstitials, so this is safe to call
  // on every level-complete; audio is paused/resumed by the central handlers.
  showInterstitial() {
    try { if (_hasBridge && this.isInterstitialSupported) sdk().advertisement.showInterstitial(); } catch (e) { /* */ }
  },

  // Rewarded ad. `onReward` fires exactly once, only when the player actually
  // earns the reward (state === 'rewarded'). Returns false if unavailable so
  // the caller can hide / skip the offer.
  showRewarded(onReward) {
    if (!_hasBridge || !this.isRewardedSupported) return false;
    try {
      _rewardCb = typeof onReward === 'function' ? onReward : null;
      sdk().advertisement.showRewarded();
      return true;
    } catch (e) { _rewardCb = null; return false; }
  },

  // ── leaderboards ────────────────────────────────────────────────────────────
  get leaderboardType() { try { return _hasBridge ? sdk().leaderboards.type : 'not_available'; } catch (e) { return 'not_available'; } },

  get leaderboardAvailable() { return this.leaderboardType !== 'not_available'; },

  submitScore(score, leaderboardId = IDS.leaderboard) {
    try {
      if (_hasBridge && this.leaderboardType !== 'not_available') {
        return sdk().leaderboards.setScore(leaderboardId, score).catch(() => {});
      }
    } catch (e) { /* */ }
    return Promise.resolve();
  },

  // For native / native_popup boards the platform renders its own overlay.
  showLeaderboard(leaderboardId = IDS.leaderboard) {
    try {
      if (_hasBridge && this.leaderboardType === 'native_popup') {
        return sdk().leaderboards.showNativePopup(leaderboardId).catch(() => {});
      }
    } catch (e) { /* */ }
    return Promise.resolve();
  },

  // For in_game boards we render our own list from these entries.
  getLeaderboardEntries(leaderboardId = IDS.leaderboard) {
    try {
      if (_hasBridge && this.leaderboardType === 'in_game') {
        return sdk().leaderboards.getEntries(leaderboardId).then(e => e || []).catch(() => []);
      }
    } catch (e) { /* */ }
    return Promise.resolve([]);
  },

  // ── achievements ────────────────────────────────────────────────────────────
  // Native achievements exist only on a couple of platforms (Y8, Lagged) and use
  // dashboard-configured IDs; elsewhere this is a no-op and the in-game
  // achievements panel (backed by the save) is the source of truth.
  unlockAchievement(achievementId) {
    try {
      if (_hasBridge && sdk().achievements && sdk().achievements.isSupported) {
        const id = this.id;
        const options = id === 'y8'
          ? { achievement: achievementId, achievementkey: achievementId }
          : { achievement: achievementId };
        return sdk().achievements.unlock(options).catch(() => {});
      }
    } catch (e) { /* */ }
    return Promise.resolve();
  },

  // ── platform-driven pause / audio (mute on overlay, minimize, ad) ───────────
  _bindEvents() {
    // Pause / mute the game when the platform asks (ad overlay, app switch…).
    on('platform', 'PAUSE_STATE_CHANGED', (paused) => { paused ? audio.suspend() : audio.resume(); });
    on('platform', 'AUDIO_STATE_CHANGED', (enabled) => { enabled ? audio.resume() : audio.suspend(); });

    // Interstitial: mute while open.
    on('advertisement', 'INTERSTITIAL_STATE_CHANGED', (state) => {
      if (state === 'opened') audio.suspend();
      else if (state === 'closed' || state === 'failed') audio.resume();
    });

    // Rewarded: mute while open; grant only on `rewarded`.
    on('advertisement', 'REWARDED_STATE_CHANGED', (state) => {
      if (state === 'opened') audio.suspend();
      else if (state === 'rewarded') { const cb = _rewardCb; _rewardCb = null; if (cb) cb(); }
      else if (state === 'closed' || state === 'failed') { _rewardCb = null; audio.resume(); }
    });
  }
};
