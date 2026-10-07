import { audio } from '../audio/AudioEngine.js';

export const IDS = {
  interstitial: 'game_over',
  rewarded: {
    moves: 'continue'
  },
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

class PlaygamaPlatform {
  constructor() {
    this._initialized = false;
    this._audioEnabled = true;
    this._isPlatformPaused = false;
    this._documentHidden = false;
    this._language = 'en';
    this._ready = null;
    this._pauseListeners = new Set();
  }

  async init() {
    if (this._ready) return this._ready;

    this._ready = (async () => {
      if (typeof bridge === 'undefined') {
        console.info('[Playgama] Bridge not detected - running in dev/fallback mode.');
        this._initialized = false;
        this._language = this._browserLanguage();
        return false;
      }

      try {
        await bridge.initialize();
        this._initialized = true;
        this._language = bridge.platform.language || this._browserLanguage();
        this._subscribeEvents();

        if (bridge.advertisement.interstitialState === 'opened') {
          this._setPlatformPaused(true);
        }

        return true;
      } catch (err) {
        console.warn('[Playgama] Initialization failed, using dev fallback:', err);
        this._initialized = false;
        this._language = this._browserLanguage();
        return false;
      }
    })();

    return this._ready;
  }

  get available() {
    return this._initialized;
  }

  get isGameplayPaused() {
    return this._isPlatformPaused || this._documentHidden;
  }

  get id() {
    if (!this._initialized) return 'mock';
    try { return bridge.platform.id || 'mock'; } catch { return 'mock'; }
  }

  get language() {
    return (this._language || 'en').slice(0, 2).toLowerCase();
  }

  get payload() {
    if (!this._initialized) return null;
    try { return bridge.platform.payload; } catch { return null; }
  }

  get deviceType() {
    if (!this._initialized) return 'desktop';
    try { return bridge.device.type || 'desktop'; } catch { return 'desktop'; }
  }

  subscribePause(fn) {
    if (typeof fn !== 'function') return () => {};
    this._pauseListeners.add(fn);
    fn(this.isGameplayPaused);
    return () => this._pauseListeners.delete(fn);
  }

  setDocumentHidden(hidden) {
    this._documentHidden = !!hidden;
    if (this._documentHidden) audio.suspend();
    else this._applyAudioState();
    this._emitPause();
  }

  gameReady() {
    this._send('game_ready');
    return Promise.resolve();
  }

  loadingStarted() {
    this._send('in_game_loading_started');
  }

  loadingStopped() {
    this._send('in_game_loading_stopped');
  }

  levelStarted(level) {
    this._send('level_started', { world: 'vein_city', level: String(level) });
  }

  levelCompleted(level) {
    this._send('level_completed', { world: 'vein_city', level: String(level) });
  }

  levelFailed(level) {
    this._send('level_failed', { world: 'vein_city', level: String(level) });
  }

  sendMessage(message, params) {
    this._send(message, params);
    return Promise.resolve();
  }

  async load(key) {
    if (this._initialized) {
      try {
        const value = await bridge.storage.get(key);
        const parsed = this._parseStored(value);
        if (parsed !== null && parsed !== undefined) return parsed;
      } catch {}
    }

    return this._loadLocal(key);
  }

  async save(key, value) {
    this._saveLocal(key, value);

    if (this._initialized) {
      try {
        await bridge.storage.set(key, JSON.stringify(value));
        return;
      } catch {}
    }
  }

  async remove(key) {
    try {
      localStorage.removeItem(`vc:${key}`);
      localStorage.removeItem(key);
    } catch {}

    if (this._initialized) {
      try { await bridge.storage.delete(key); } catch {}
    }
  }

  get defaultStorageType() {
    if (!this._initialized) return 'local_storage';
    try { return bridge.storage.defaultType || 'local_storage'; } catch { return 'local_storage'; }
  }

  get isInterstitialSupported() {
    return this._initialized && !!bridge.advertisement.isInterstitialSupported;
  }

  get isRewardedSupported() {
    return this._initialized && !!bridge.advertisement.isRewardedSupported;
  }

  showInterstitial(placement = IDS.interstitial) {
    if (!this.isInterstitialSupported) return Promise.resolve();

    return new Promise((resolve) => {
      const onStateChanged = (state) => {
        if (state === 'closed' || state === 'failed') {
          bridge.advertisement.off(bridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, onStateChanged);
          resolve();
        }
      };

      bridge.advertisement.on(bridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, onStateChanged);
      bridge.advertisement.showInterstitial(placement);
    });
  }

  showRewarded(placement = IDS.rewarded.moves) {
    if (!this.isRewardedSupported) return Promise.resolve({ rewarded: false });

    return new Promise((resolve) => {
      let wasRewarded = false;

      const onStateChanged = (state) => {
        if (state === 'rewarded') {
          wasRewarded = true;
        }
        if (state === 'closed' || state === 'failed') {
          bridge.advertisement.off(bridge.EVENT_NAME.REWARDED_STATE_CHANGED, onStateChanged);
          resolve({ rewarded: wasRewarded });
        }
      };

      bridge.advertisement.on(bridge.EVENT_NAME.REWARDED_STATE_CHANGED, onStateChanged);
      bridge.advertisement.showRewarded(placement);
    });
  }

  get leaderboardType() {
    if (!this._initialized) return 'not_available';
    try { return bridge.leaderboards.type || 'not_available'; } catch { return 'not_available'; }
  }

  get leaderboardAvailable() {
    return this.leaderboardType !== 'not_available';
  }

  submitScore(score, leaderboardId = IDS.leaderboard) {
    if (!this.leaderboardAvailable) return Promise.resolve();
    try { return bridge.leaderboards.setScore(leaderboardId, score).catch(() => {}); } catch { return Promise.resolve(); }
  }

  showLeaderboard(leaderboardId = IDS.leaderboard) {
    if (this.leaderboardType !== 'native_popup') return Promise.resolve(false);
    try { return bridge.leaderboards.showNativePopup(leaderboardId).then(() => true).catch(() => false); } catch { return Promise.resolve(false); }
  }

  getLeaderboardEntries(leaderboardId = IDS.leaderboard) {
    if (this.leaderboardType !== 'in_game') return Promise.resolve([]);
    try { return bridge.leaderboards.getEntries(leaderboardId).then((entries) => entries || []).catch(() => []); } catch { return Promise.resolve([]); }
  }

  unlockAchievement(achievementId) {
    if (!this._initialized) return Promise.resolve();
    try {
      if (!bridge.achievements?.isSupported) return Promise.resolve();

      let options = null;
      if (this.id === 'y8') {
        options = { achievement: achievementId, achievementkey: achievementId };
      } else if (this.id === 'lagged') {
        options = { achievement: achievementId };
      }

      if (!options) return Promise.resolve();
      return bridge.achievements.unlock(options).catch(() => {});
    } catch {
      return Promise.resolve();
    }
  }

  get player() {
    if (!this._initialized) {
      return {
        isAuthorizationSupported: false,
        isAuthorized: false,
        id: null,
        name: null,
        photos: []
      };
    }

    try {
      return {
        isAuthorizationSupported: !!bridge.player.isAuthorizationSupported,
        isAuthorized: !!bridge.player.isAuthorized,
        id: bridge.player.id || null,
        name: bridge.player.name || null,
        photos: bridge.player.photos || []
      };
    } catch {
      return {
        isAuthorizationSupported: false,
        isAuthorized: false,
        id: null,
        name: null,
        photos: []
      };
    }
  }

  authorizePlayer(options = {}) {
    if (!this._initialized) return Promise.resolve(false);
    try {
      if (!bridge.player.isAuthorizationSupported) return Promise.resolve(false);
      return bridge.player.authorize(options).then(() => true).catch(() => false);
    } catch {
      return Promise.resolve(false);
    }
  }

  _send(message, params) {
    if (!this._initialized) return;
    try { bridge.platform.sendMessage(message, params); } catch {}
  }

  _subscribeEvents() {
    bridge.platform.on(bridge.EVENT_NAME.PAUSE_STATE_CHANGED, (isPaused) => {
      this._setPlatformPaused(isPaused);
    });

    bridge.platform.on(bridge.EVENT_NAME.AUDIO_STATE_CHANGED, (isEnabled) => {
      this._audioEnabled = isEnabled;
      this._applyAudioState();
    });
  }

  _setPlatformPaused(isPaused) {
    this._isPlatformPaused = isPaused;
    this._applyAudioState();
    this._emitPause();
  }

  _applyAudioState() {
    if (this.isGameplayPaused || !this._audioEnabled) audio.suspend();
    else audio.resume();
  }

  _emitPause() {
    const paused = this.isGameplayPaused;
    this._pauseListeners.forEach((fn) => {
      try { fn(paused); } catch {}
    });
  }

  _saveLocal(key, value) {
    try { localStorage.setItem(`vc:${key}`, JSON.stringify(value)); } catch {}
  }

  _loadLocal(key) {
    try {
      const raw = localStorage.getItem(`vc:${key}`) ?? localStorage.getItem(key);
      return this._parseStored(raw);
    } catch {
      return null;
    }
  }

  _parseStored(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return value; }
  }

  _browserLanguage() {
    return ((typeof navigator !== 'undefined' && navigator.language) || 'en').slice(0, 2).toLowerCase();
  }
}

export const platform = new PlaygamaPlatform();
