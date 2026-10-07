// ─── Audio engine ────────────────────────────────────────────────────────────
// Recorded music + SFX layered over the original WebAudio synthesis. Looping
// background music streams one track per act; sampled cues (heartbeat, rotate,
// connected, reveal, ui_button) play through the WebAudio master when decoded,
// and every cue keeps its synthesized version as an always-available fallback.

import { BGM, SFX } from '../assets/images.js';

const BGM_VOL = 0.15;

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.heart = { timer: null, loop: null, active: false, intensity: 0, rate: 1 };
    this.drone = null;
    this.samples = {};            // name -> decoded AudioBuffer (SFX)
    this._samplesRequested = false;
    this.bgm = { want: null, act: null, el: null, els: {}, duck: 0 };
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this._loadSamples();
      this._applyBgm();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? 0.85 : 0;
    this.master.connect(this.ctx.destination);
    this._loadSamples();
    this._applyBgm();
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.linearRampToValueAtTime(on ? 0.85 : 0, this.ctx.currentTime + 0.15);
    if (this.bgm.el) this._fade(this.bgm.el, this._bgmTarget(), 250);
  }

  // System-level mute, independent of the player's SOUND preference. Used while
  // the tab is hidden (sound must stop when minimized).
  suspend() {
    this._suspended = true;
    try { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); } catch (e) { /* */ }
    if (this.bgm.el) { try { this.bgm.el.pause(); } catch (e) { /* */ } }
  }

  resume() {
    this._suspended = false;
    try { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) { /* */ }
    if (this.bgm.el && this.enabled) { const p = this.bgm.el.play(); if (p && p.catch) p.catch(() => {}); }
  }

  // Lean the music back as the player zooms toward the Heart (0 = full, 1 = hushed).
  setBgmDuck(d) {
    this.bgm.duck = Math.max(0, Math.min(1, d));
    const el = this.bgm.el;
    if (el && !el._fadeId) el.volume = this._bgmTarget();
  }

  // Race the heartbeat loop as the player zooms in (r ≈ 1 calm … ~1.3 pounding).
  setHeartRate(r) {
    this.heart.rate = r;
    if (this.heart.loop && this.ctx) {
      this.heart.loop.src.playbackRate.setTargetAtTime(r, this.ctx.currentTime, 0.2);
    }
  }

  _bgmTarget() { return this.enabled ? BGM_VOL * (1 - (this.bgm.duck || 0)) : 0; }

  _env(node, t0, a, peak, d) {
    node.gain.setValueAtTime(0.0001, t0);
    node.gain.exponentialRampToValueAtTime(peak, t0 + a);
    node.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }

  _thump(time, freq, peak, dur) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, time);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.55), time + dur);
    this._env(g, time, 0.012, peak, dur);
    o.connect(g); g.connect(this.master);
    o.start(time); o.stop(time + dur + 0.1);
  }

  // intensity 0..1 — grows as the town comes alive
  startHeartbeat(intensity = 0.3) {
    this.heart.intensity = intensity;
    this.heart.active = true;
    this._ensureHeart();
  }

  setHeartIntensity(k) {
    this.heart.intensity = k;
    if (this.heart.loop && this.ctx) {
      this.heart.loop.g.gain.setTargetAtTime(this._heartGain(), this.ctx.currentTime, 0.4);
    }
    this._ensureHeart(); // lazily upgrade to the sample loop once it decodes
  }

  stopHeartbeat() {
    this.heart.active = false;
    if (this.heart.timer) { clearInterval(this.heart.timer); this.heart.timer = null; }
    if (this.heart.loop) {
      const l = this.heart.loop; this.heart.loop = null;
      try { l.g.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2); } catch (e) { /* noop */ }
      setTimeout(() => { try { l.src.stop(); } catch (e) { /* noop */ } }, 500);
    }
  }

  _heartGain() { return Math.min(0.9, 0.18 + 0.6 * this.heart.intensity); }

  // Start (or keep) the heartbeat: the recorded loop if decoded, else the
  // synthesized lub-dub on a timer. Safe to call repeatedly (per frame).
  _ensureHeart() {
    if (!this.ctx || !this.heart.active) return;
    if (this.samples.heartbeat) {
      if (this.heart.timer) { clearInterval(this.heart.timer); this.heart.timer = null; }
      if (!this.heart.loop) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.samples.heartbeat; src.loop = true;
        src.playbackRate.value = this.heart.rate;
        const g = this.ctx.createGain();
        g.gain.value = this._heartGain();
        src.connect(g); g.connect(this.master);
        src.start();
        this.heart.loop = { src, g };
      }
      return;
    }
    if (!this.heart.timer) {
      const beat = () => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime + 0.02;
        const k = this.heart.intensity;
        if (k > 0.02) {
          this._thump(t, 52, 0.16 + 0.3 * k, 0.16);          // lub
          this._thump(t + 0.22, 44, 0.1 + 0.22 * k, 0.2);    // dub
        }
      };
      beat();
      this.heart.timer = setInterval(beat, 1450);
    }
  }

  accentBeat() { // big single beat for district reveals
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.02;
    this._thump(t, 58, 0.6, 0.22);
    this._thump(t + 0.24, 47, 0.45, 0.3);
  }

  startDrone() {
    if (!this.ctx || this.drone) return;
    const o1 = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    o1.type = 'sawtooth'; o1.frequency.value = 55;
    o2.type = 'sine'; o2.frequency.value = 82.5; o2.detune.value = 7;
    f.type = 'lowpass'; f.frequency.value = 220; f.Q.value = 0.6;
    g.gain.value = 0.028;
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(this.master);
    o1.start(); o2.start();
    this.drone = { o1, o2, g };
  }

  stopDrone() {
    if (!this.drone) return;
    const t = this.ctx.currentTime;
    this.drone.g.gain.linearRampToValueAtTime(0.0001, t + 0.5);
    const d = this.drone;
    setTimeout(() => { try { d.o1.stop(); d.o2.stop(); } catch (e) { /* noop */ } }, 700);
    this.drone = null;
  }

  _noise(time, dur, peak, filterFreq, type = 'bandpass') {
    const len = Math.ceil(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = filterFreq; f.Q.value = 1.1;
    const g = this.ctx.createGain();
    this._env(g, time, 0.008, peak, dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(time);
  }

  playReveal(pressure = false) { // tile scrape / district reveal
    if (!this.ctx) return;
    if (this._playSample('reveal', { gain: pressure ? 0.85 : 0.6, rate: pressure ? 0.92 : 1 })) return;
    const t = this.ctx.currentTime;
    this._noise(t, 0.22, pressure ? 0.3 : 0.22, pressure ? 480 : 850);
    this._noise(t + 0.05, 0.14, 0.12, 1600, 'highpass');
  }

  playRotate() {
    if (!this.ctx) return;
    if (this._playSample('rotate', { gain: 0.6 })) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = 'square'; o.frequency.value = 320;
    this._env(g, t, 0.004, 0.07, 0.06);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.1);
  }

  playSnap() { // a pipe connects / snaps into place
    if (!this.ctx) return;
    if (this._playSample('connected', { gain: 0.7 })) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(1180, t);
    o.frequency.exponentialRampToValueAtTime(640, t + 0.07);
    this._env(g, t, 0.003, 0.16, 0.09);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.15);
  }

  playUI() { // menu / HUD button press
    if (!this.ctx) return;
    if (this._playSample('ui_button', { gain: 0.55 })) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(540, t);
    o.frequency.exponentialRampToValueAtTime(300, t + 0.05);
    this._env(g, t, 0.003, 0.06, 0.05);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.1);
  }

  playChain() { // golden resonance ping
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [880, 1320].forEach((f, i) => {
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      this._env(g, t + i * 0.06, 0.01, 0.1, 0.3);
      o.connect(g); g.connect(this.master); o.start(t + i * 0.06); o.stop(t + 0.6);
    });
  }

  playKey() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [620, 930, 1240].forEach((f, i) => {
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      this._env(g, t + i * 0.07, 0.008, 0.09, 0.22);
      o.connect(g); g.connect(this.master); o.start(t + i * 0.07); o.stop(t + 0.8);
    });
  }

  playDenied() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(160, t);
    o.frequency.linearRampToValueAtTime(110, t + 0.16);
    this._env(g, t, 0.006, 0.1, 0.18);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.25);
  }

  playPage() {
    if (!this.ctx) return;
    this._noise(this.ctx.currentTime, 0.18, 0.1, 2400, 'highpass');
  }

  playBreath() { // "The City Breathes" — pipe-organ chord swelling source→sink
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const chord = [110, 165, 220, 277.2, 330];
    chord.forEach((f, i) => {
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      const fl = this.ctx.createBiquadFilter();
      o.type = i < 2 ? 'sawtooth' : 'sine';
      o.frequency.value = f;
      fl.type = 'lowpass'; fl.frequency.setValueAtTime(300, t);
      fl.frequency.linearRampToValueAtTime(1800, t + 0.8);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.085, t + 0.6 + i * 0.08);
      g.gain.linearRampToValueAtTime(0.0001, t + 2.6);
      o.connect(fl); fl.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + 2.8);
    });
    this._thump(t + 0.85, 56, 0.5, 0.25);
  }

  // ── sampled SFX ────────────────────────────────────────────────────────────
  _loadSamples() {
    if (this._samplesRequested || !this.ctx) return;
    this._samplesRequested = true;
    for (const [name, url] of Object.entries(SFX)) {
      fetch(url)
        .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then(data => this.ctx.decodeAudioData(data))
        .then(buf => { this.samples[name] = buf; })
        .catch(() => { /* missing/undecodable → the synth fallback is used */ });
    }
  }

  // Play a decoded sample through the master bus. Returns false if it isn't
  // ready, so callers can fall back to a synthesized cue.
  _playSample(name, opts = {}) {
    const buf = this.samples[name];
    if (!buf || !this.ctx) return false;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = opts.rate || 1;
    const g = this.ctx.createGain();
    g.gain.value = opts.gain == null ? 1 : opts.gain;
    src.connect(g); g.connect(this.master);
    src.start();
    return true;
  }

  // ── background music ───────────────────────────────────────────────────────
  // Switch to the track for `act` (1/2/3). Crossfades only when the act
  // actually changes; safe to call on every screen transition.
  setBgmAct(act) {
    this.bgm.want = act;
    this._applyBgm();
  }

  stopBgm() {
    this.bgm.want = null;
    const el = this.bgm.el;
    if (el) { this._fade(el, 0, 700, () => el.pause()); }
    this.bgm.el = null;
    this.bgm.act = null;
  }

  _bgmEl(act) {
    if (!this.bgm.els[act]) {
      const url = BGM[act];
      if (!url) return null;
      const el = new Audio();
      el.src = url; el.loop = true; el.preload = 'auto'; el.volume = 0;
      this.bgm.els[act] = el;
    }
    return this.bgm.els[act];
  }

  _applyBgm() {
    const want = this.bgm.want;
    if (want == null) return;
    const next = this._bgmEl(want);
    if (!next) return;
    // already on the wanted track and playing → nothing to do
    if (this.bgm.act === want && this.bgm.el === next && !next.paused) return;

    const prev = this.bgm.el;
    if (prev && prev !== next) this._fade(prev, 0, 900, () => prev.pause());
    if (prev !== next) next.volume = 0; // fresh switch starts silent
    this.bgm.el = next;
    this.bgm.act = want;

    const target = this._bgmTarget();
    const p = next.play();
    // Autoplay may be blocked until a user gesture; init() retries on the next tap.
    if (p && p.catch) p.catch(() => { /* will retry */ });
    this._fade(next, target, 1200);
  }

  // Tween an <audio> element's volume.
  _fade(el, target, ms, onDone) {
    if (el._fadeId) cancelAnimationFrame(el._fadeId);
    const from = el.volume;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / ms);
      el.volume = Math.max(0, Math.min(1, from + (target - from) * k));
      if (k < 1) { el._fadeId = requestAnimationFrame(step); }
      else { el._fadeId = null; if (onDone) onDone(); }
    };
    el._fadeId = requestAnimationFrame(step);
  }
}

export const audio = new AudioEngine();
