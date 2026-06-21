// ─── OrientationGate ─────────────────────────────────────────────────────────
// The game is landscape-only. On portrait phones we show a rotate prompt and
// try the Screen Orientation API (works in fullscreen / installed PWA /
// Capacitor Android builds).

import React, { useState, useEffect } from 'react';

export default function OrientationGate({ children }) {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const check = () => setPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 920);
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    // best-effort lock (silently ignored where unsupported)
    try { screen.orientation?.lock?.('landscape').catch(() => {}); } catch (e) { /* unsupported */ }
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return (
    <>
      {children}
      {portrait && (
        <div className="rotate-veil">
          <div className="rotate-phone">
            <div className="rotate-frame" />
          </div>
          <div className="rotate-title">ROTATE YOUR DEVICE</div>
          <div className="rotate-sub">Vein City is surveyed in landscape.</div>
        </div>
      )}
    </>
  );
}
