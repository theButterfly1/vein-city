// ─── TownView ────────────────────────────────────────────────────────────────
// The living town. Drag to slide, wheel / pinch to zoom, two-finger twist or
// the on-screen dial to rotate. Newly-solved districts animate to life when
// the player arrives at the menu (after a level, or next session).

import React, { useRef, useEffect, useCallback } from 'react';
import { drawTown, pickDistrict, project } from './townRenderer.js';
import { getDistrict } from './townModel.js';
import { audio } from '../../audio/AudioEngine.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function TownView({ litIds, nextId, revealQueue, onRevealDone, onPickDistrict, soundOn }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    camera: { rot: 0.5, zoom: 0.85, panX: 0, panY: 0, cx: 0, cy: 0 },
    target: null,            // camera tween target
    pointers: new Map(),
    pinch: null,
    dragMoved: false,
    hoverId: null,
    pulsePhase: 0,
    lastTs: 0,
    revealAnim: null,        // {id, p}
    queue: [],
    holdAfter: 0
  });

  // keep external data in a ref so the rAF loop sees fresh values
  const dataRef = useRef({ litIds, nextId, onRevealDone, onPickDistrict });
  dataRef.current = { litIds, nextId, onRevealDone, onPickDistrict };

  // enqueue reveals
  useEffect(() => {
    if (revealQueue && revealQueue.length) {
      const st = stateRef.current;
      st.queue.push(...revealQueue);
    }
  }, [revealQueue]);

  const fit = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const st = stateRef.current;
    st.camera.cx = w / 2;
    st.camera.cy = h / 2 + 30;
    st.dpr = dpr;
  }, []);

  useEffect(() => {
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [fit]);

  // main loop
  useEffect(() => {
    let raf;
    const loop = (ts) => {
      const cv = canvasRef.current;
      if (!cv) return;
      const st = stateRef.current;
      const dt = Math.min(0.05, (ts - (st.lastTs || ts)) / 1000);
      st.lastTs = ts;
      const litSet = new Set(dataRef.current.litIds);
      const litCount = litSet.size;

      // zoom focus: 0 at the resting/zoomed-out view → 1 pushed all the way in.
      // The deeper you lean toward the Heart, the more the music hushes and the
      // faster + harder the city's pulse beats.
      const zf = Math.max(0, Math.min(1, (st.camera.zoom - 0.85) / (2.6 - 0.85)));

      // heartbeat tempo grows gently with progress, and races when you zoom in
      const bpm = 42 + litCount * 0.9 + zf * 38;
      st.pulsePhase += dt * (bpm / 60) * Math.PI;
      audio.setHeartIntensity(0.12 + (litCount / 30) * 0.8 + zf * 0.6);
      audio.setHeartRate(1 + zf * 0.28);
      audio.setBgmDuck(zf * 0.95);

      // reveal queue handling
      if (!st.revealAnim && st.queue.length && st.holdAfter <= 0) {
        const id = st.queue.shift();
        st.revealAnim = { id, p: 0, accented: false };
        const d = getDistrict(id);
        // tween camera to the district
        st.target = {
          panX: -((d.x * Math.cos(st.camera.rot) - d.y * Math.sin(st.camera.rot)) * 1.35),
          panY: -((d.x * Math.sin(st.camera.rot) + d.y * Math.cos(st.camera.rot)) * 0.55 * 1.35),
          zoom: 1.35
        };
      }
      if (st.revealAnim) {
        st.revealAnim.p += dt / 1.9;
        if (st.revealAnim.p > 0.45 && !st.revealAnim.accented) {
          st.revealAnim.accented = true;
          audio.accentBeat();
        }
        if (st.revealAnim.p >= 1) {
          litSet.add(st.revealAnim.id);
          dataRef.current.onRevealDone?.(st.revealAnim.id);
          st.revealAnim = null;
          st.holdAfter = 0.6;
          if (!st.queue.length) st.target = { panX: 0, panY: 0, zoom: 0.85 };
        }
      } else if (st.holdAfter > 0) {
        st.holdAfter -= dt;
      }

      // camera tween
      if (st.target) {
        const c = st.camera, t = st.target, k = Math.min(1, dt * 3.2);
        c.panX += (t.panX - c.panX) * k;
        c.panY += (t.panY - c.panY) * k;
        c.zoom += (t.zoom - c.zoom) * k;
        if (Math.abs(t.zoom - c.zoom) < 0.005 && Math.abs(t.panX - c.panX) < 1 && Math.abs(t.panY - c.panY) < 1) st.target = null;
      }

      const ctx = cv.getContext('2d');
      ctx.save();
      ctx.scale(st.dpr || 1, st.dpr || 1);
      drawTown(ctx, cv.clientWidth, cv.clientHeight, st.camera, {
        litSet,
        revealAnim: st.revealAnim,
        pulsePhase: st.pulsePhase,
        nextId: dataRef.current.nextId,
        hoverId: st.hoverId,
        t: ts / 1000
      });
      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // pointer interaction
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const st = stateRef.current;

    const pos = (e) => {
      const r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const down = (e) => {
      cv.setPointerCapture?.(e.pointerId);
      st.pointers.set(e.pointerId, pos(e));
      st.dragMoved = false;
      st.target = null;
      if (st.pointers.size === 2) {
        const [a, b] = [...st.pointers.values()];
        st.pinch = {
          dist: Math.hypot(b.x - a.x, b.y - a.y),
          ang: Math.atan2(b.y - a.y, b.x - a.x),
          zoom: st.camera.zoom,
          rot: st.camera.rot
        };
      }
    };

    const move = (e) => {
      if (!st.pointers.has(e.pointerId)) {
        st.hoverId = pickDistrict(st.camera, pos(e).x, pos(e).y)?.id ?? null;
        return;
      }
      const p = pos(e);
      const old = st.pointers.get(e.pointerId);
      st.pointers.set(e.pointerId, p);

      if (st.pointers.size === 1) {
        const dx = p.x - old.x, dy = p.y - old.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) st.dragMoved = true;
        st.camera.panX += dx;
        st.camera.panY += dy;
      } else if (st.pointers.size === 2 && st.pinch) {
        st.dragMoved = true;
        const [a, b] = [...st.pointers.values()];
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        st.camera.zoom = clamp(st.pinch.zoom * (dist / st.pinch.dist), 0.4, 2.6);
        st.camera.rot = st.pinch.rot + (ang - st.pinch.ang);
      }
    };

    const up = (e) => {
      const had = st.pointers.has(e.pointerId);
      const p = had ? st.pointers.get(e.pointerId) : null;
      st.pointers.delete(e.pointerId);
      if (st.pointers.size < 2) st.pinch = null;
      if (had && !st.dragMoved && p && st.pointers.size === 0) {
        const d = pickDistrict(st.camera, p.x, p.y);
        if (d) dataRef.current.onPickDistrict?.(d.id);
      }
    };

    const wheel = (e) => {
      e.preventDefault();
      st.target = null;
      st.camera.zoom = clamp(st.camera.zoom * (e.deltaY > 0 ? 0.92 : 1.08), 0.4, 2.6);
    };

    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', wheel, { passive: false });
    return () => {
      cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up);
      cv.removeEventListener('pointercancel', up);
      cv.removeEventListener('wheel', wheel);
    };
  }, []);

  const rotateBy = (delta) => {
    audio.playUI();
    stateRef.current.camera.rot += delta;
  };
  const zoomBy = (f) => {
    audio.playUI();
    const c = stateRef.current.camera;
    c.zoom = clamp(c.zoom * f, 0.4, 2.6);
  };

  return (
    <div className="town-wrap">
      <canvas ref={canvasRef} className="town-canvas" />
      <div className="town-dials">
        <button className="dial" onClick={() => rotateBy(-0.35)} aria-label="Rotate left">⟲</button>
        <button className="dial" onClick={() => rotateBy(0.35)} aria-label="Rotate right">⟳</button>
        <button className="dial" onClick={() => zoomBy(1.2)} aria-label="Zoom in">＋</button>
        <button className="dial" onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out">－</button>
      </div>
    </div>
  );
}
