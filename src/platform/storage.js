// ─── Save storage ────────────────────────────────────────────────────────────
// localStorage, every access wrapped: private mode / blocked storage / quota
// errors fail safely (the game just runs without persistence).

export function load(key) {
  try {
    const raw = localStorage.getItem(key) ?? localStorage.getItem(`vc:${key}`); // vc: = older builds
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
