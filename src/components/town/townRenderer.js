// ─── Town renderer ───────────────────────────────────────────────────────────
// Canvas 2D, rotatable oblique projection. The living town is skinned with the
// menu PNGs (district dark/lit, heart core, vein segment, sky) drawn as
// billboarded sprites; any piece that fails to load falls back to the original
// procedural drawing. Lit districts breathe with the heartbeat; reveal
// animations crossfade a district from dormant to alive and grow its vein.

import { PAL } from '../../core/constants.js';
import { TOWN } from './townModel.js';
import { TOWN_ART, loaded } from './townArt.js';

const ISO = 0.55; // vertical squash

export function project(camera, wx, wy, wz = 0) {
  const cos = Math.cos(camera.rot), sin = Math.sin(camera.rot);
  const rx = wx * cos - wy * sin;
  const ry = wx * sin + wy * cos;
  return {
    x: rx * camera.zoom + camera.cx + camera.panX,
    y: ry * ISO * camera.zoom + camera.cy + camera.panY - wz * camera.zoom,
    depth: ry
  };
}

function quad(ctx, pts, fill) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function blockCorners(d, camera, inset = 0) {
  const r = d.R - inset;
  return [
    project(camera, d.x - r, d.y - r),
    project(camera, d.x + r, d.y - r),
    project(camera, d.x + r, d.y + r),
    project(camera, d.x - r, d.y + r)
  ];
}

// ── image helpers ────────────────────────────────────────────────────────────

// Cover-fit an image across the whole canvas.
function drawCover(ctx, img, W, H, alpha = 1) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const s = Math.max(W / iw, H / ih);
  const dw = iw * s, dh = ih * s;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  ctx.globalAlpha = 1;
}

// Billboarded transparent sprite anchored so its base oval sits at (sx, sy).
const SPRITE_ASPECT = 768 / 1376; // height / width of the district frames
const ANCHOR_Y = 0.64;            // sprite-height fraction where the block base rests
function drawSprite(ctx, img, sx, sy, width, alpha = 1, lift = 0) {
  const h = width * SPRITE_ASPECT;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, sx - width / 2, sy - h * ANCHOR_Y - lift, width, h);
  ctx.globalAlpha = 1;
}

// Draw a district from the art set. Returns false if no sprite was available
// (so the caller can fall back to procedural geometry).
function drawDistrictArt(ctx, d, camera, state) {
  const { litTrue, revealing, rise, pulse } = state;
  const c = project(camera, d.x, d.y);
  const z = camera.zoom;
  const breathe = (litTrue || revealing) ? 1 + pulse * 0.05 : 1;

  if (d.id === 30) {
    const img = TOWN_ART.heart;
    if (!loaded(img)) return false;
    const w = 3.1 * d.R * z * breathe;
    if (litTrue) { ctx.shadowColor = PAL.gold; ctx.shadowBlur = (16 + 34 * pulse) * z; }
    drawSprite(ctx, img, c.x, c.y, w, litTrue ? 1 : 0.5);
    ctx.shadowBlur = 0;
    return true;
  }

  const litImg = TOWN_ART.lit, darkImg = TOWN_ART.dark;
  if (!loaded(litImg) && !loaded(darkImg)) return false;
  const w = 2.7 * d.R * z * breathe;

  if (revealing) {
    const p = Math.min(1, Math.max(0, rise));
    const lift = (1 - p) * 26 * z; // rises out of the ground
    if (loaded(darkImg)) drawSprite(ctx, darkImg, c.x, c.y, w, 1 - p, lift);
    if (loaded(litImg)) {
      ctx.shadowColor = PAL.gold; ctx.shadowBlur = 26 * z * p;
      drawSprite(ctx, litImg, c.x, c.y, w, p, lift);
      ctx.shadowBlur = 0;
    }
    return true;
  }

  const img = litTrue ? (loaded(litImg) ? litImg : darkImg)
                      : (loaded(darkImg) ? darkImg : litImg);
  if (litTrue) { ctx.shadowColor = PAL.gold; ctx.shadowBlur = (4 + 11 * pulse) * z; }
  drawSprite(ctx, img, c.x, c.y, w, litTrue ? 1 : 0.9);
  ctx.shadowBlur = 0;
  return true;
}

// ── procedural fallback (unchanged geometry) ─────────────────────────────────
function drawDistrictProcedural(ctx, d, camera, state) {
  const { lit, rise, pulse, t } = state;
  const corners = blockCorners(d, camera);

  // Ground slab
  const slabLit = lit ? `rgba(61,43,26,${0.9})` : 'rgba(34,27,21,0.95)';
  quad(ctx, corners, slabLit);
  ctx.strokeStyle = lit ? `rgba(196,146,42,${0.35 + 0.3 * pulse})` : 'rgba(80,64,48,0.5)';
  ctx.lineWidth = Math.max(1, 1.4 * camera.zoom);
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y);
  ctx.closePath();
  ctx.stroke();

  // Heart plaza (district 30) — special organ instead of buildings
  if (d.id === 30) {
    const c = project(camera, d.x, d.y);
    const base = 30 * camera.zoom;
    const s = lit ? 1 + pulse * 0.22 : 0.8;
    ctx.save();
    ctx.translate(c.x, c.y - 8 * camera.zoom);
    ctx.scale(s, s * 0.8);
    ctx.beginPath(); // simple heart silhouette
    ctx.moveTo(0, base * 0.55);
    ctx.bezierCurveTo(-base * 1.15, -base * 0.25, -base * 0.55, -base * 1.0, 0, -base * 0.35);
    ctx.bezierCurveTo(base * 0.55, -base * 1.0, base * 1.15, -base * 0.25, 0, base * 0.55);
    ctx.closePath();
    if (lit) {
      const g = ctx.createRadialGradient(0, -base * 0.2, base * 0.1, 0, 0, base * 1.4);
      g.addColorStop(0, `rgba(232,184,75,${0.85 + pulse * 0.15})`);
      g.addColorStop(0.6, 'rgba(181,69,27,0.8)');
      g.addColorStop(1, 'rgba(181,69,27,0.05)');
      ctx.fillStyle = g;
      ctx.shadowColor = PAL.gold;
      ctx.shadowBlur = 30 * camera.zoom * (0.5 + pulse);
    } else {
      ctx.fillStyle = 'rgba(70,45,35,0.9)';
    }
    ctx.fill();
    ctx.restore();
    return;
  }

  // Buildings (depth sorted within district)
  const blds = d.buildings
    .map(b => {
      const cx = d.x + b.bx + b.bw / 2, cy = d.y + b.by + b.bd / 2;
      return { b, depth: project(camera, cx, cy).depth };
    })
    .sort((a, b) => a.depth - b.depth);

  for (const { b } of blds) {
    const h = b.bh * (lit ? rise : 0.42); // dark districts squat low
    const x0 = d.x + b.bx, y0 = d.y + b.by, x1 = x0 + b.bw, y1 = y0 + b.bd;
    const base = [
      project(camera, x0, y0), project(camera, x1, y0),
      project(camera, x1, y1), project(camera, x0, y1)
    ];
    const top = base.map(p => ({ x: p.x, y: p.y - h * camera.zoom }));

    const wallA = lit ? '#4a3320' : '#2a221a';
    const wallB = lit ? '#3a2818' : '#221c15';
    quad(ctx, [base[0], base[1], top[1], top[0]], wallB);
    quad(ctx, [base[1], base[2], top[2], top[1]], wallA);
    quad(ctx, [base[3], base[2], top[2], top[3]], wallB);
    quad(ctx, [base[0], base[3], top[3], top[0]], wallA);
    quad(ctx, top, lit ? '#56402a' : '#332a20');

    // windows flicker on at the end of the rise
    if (lit && rise > 0.55) {
      const wOn = Math.min(1, (rise - 0.55) / 0.45);
      const flicker = rise < 1 ? (Math.sin(t * 40 + b.bx) > -0.2 ? 1 : 0.15) : 1;
      const glow = (0.45 + 0.5 * pulse) * wOn * flicker;
      ctx.fillStyle = `rgba(232,184,75,${glow})`;
      const fw = base[1].x - base[0].x;
      for (let wi = 0; wi < b.windows; wi++) {
        const fx = base[0].x + fw * (0.2 + wi * 0.25);
        const fy = base[0].y - h * camera.zoom * (0.35 + (wi % 2) * 0.25);
        ctx.fillRect(fx, fy, Math.max(1.5, 2.4 * camera.zoom), Math.max(2, 3.4 * camera.zoom));
      }
    }
  }
}

function drawDistrict(ctx, d, camera, state) {
  const litEff = state.litTrue || state.revealing;
  const usedArt = drawDistrictArt(ctx, d, camera, state);
  if (!usedArt) {
    drawDistrictProcedural(ctx, d, camera, {
      lit: litEff, rise: state.rise, pulse: state.pulse, t: state.t
    });
  }

  // "next level" beacon (above the sprite/geometry, both render paths)
  if (state.isNext && d.id !== 30) {
    const c = project(camera, d.x, d.y);
    const bob = Math.sin(state.t * 3) * 4 * camera.zoom;
    const py = c.y - 78 * camera.zoom + bob;
    ctx.save();
    ctx.fillStyle = PAL.goldBright;
    ctx.shadowColor = PAL.gold; ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(c.x, py + 16 * camera.zoom);
    ctx.lineTo(c.x - 9 * camera.zoom, py);
    ctx.lineTo(c.x + 9 * camera.zoom, py);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Draw a vein segment (pipe art, or a glowing line fallback) from pa toward pb.
function drawVein(ctx, pa, pb, frac, pulse, zoom) {
  const ex = pa.x + (pb.x - pa.x) * frac, ey = pa.y + (pb.y - pa.y) * frac;
  const img = TOWN_ART.vein;
  if (loaded(img)) {
    const len = Math.hypot(ex - pa.x, ey - pa.y);
    if (len < 1) return;
    const ang = Math.atan2(ey - pa.y, ex - pa.x);
    const th = Math.max(7, 16 * zoom);
    ctx.save();
    ctx.translate(pa.x, pa.y);
    ctx.rotate(ang);
    ctx.shadowColor = PAL.gold;
    ctx.shadowBlur = (5 + 16 * pulse) * zoom;
    ctx.globalAlpha = 0.94;
    ctx.drawImage(img, 0, -th / 2, len, th);
    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    return;
  }
  // procedural fallback
  ctx.strokeStyle = `rgba(232,184,75,${0.22 + 0.45 * pulse})`;
  ctx.lineWidth = (2 + 2.5 * pulse) * zoom;
  ctx.shadowColor = PAL.gold; ctx.shadowBlur = 8 + 18 * pulse;
  ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.shadowBlur = 0;
}

export function drawTown(ctx, W, H, camera, view) {
  const { litSet, revealAnim, pulsePhase, nextId, t, hoverId } = view;

  // sky / murk
  if (loaded(TOWN_ART.sky)) {
    ctx.fillStyle = '#15110e';
    ctx.fillRect(0, 0, W, H);
    drawCover(ctx, TOWN_ART.sky, W, H);
  } else {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#15110e');
    bg.addColorStop(1, '#241b13');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  // faint "whole city" ghost behind the live blocks (tracks pan/zoom)
  if (loaded(TOWN_ART.hero)) {
    const o = project(camera, 0, 0);
    const hw = Math.min(W, H) * 1.55 * camera.zoom;
    const hh = hw * (TOWN_ART.hero.naturalHeight / TOWN_ART.hero.naturalWidth);
    ctx.globalAlpha = 0.1;
    ctx.drawImage(TOWN_ART.hero, o.x - hw / 2, o.y - hh / 2, hw, hh);
    ctx.globalAlpha = 1;
  }

  // faint paper-grid survey lines
  ctx.strokeStyle = 'rgba(196,146,42,0.045)';
  ctx.lineWidth = 1;
  for (let gx = -600; gx <= 600; gx += 120) {
    const a = project(camera, gx, -600), b = project(camera, gx, 600);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    const c = project(camera, -600, gx), d2 = project(camera, 600, gx);
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d2.x, d2.y); ctx.stroke();
  }

  const pulse = Math.pow(Math.max(0, Math.sin(pulsePhase)), 6); // sharp thump

  // veins beneath everything
  for (const [a, b] of TOWN.veins) {
    const A = TOWN.districts[a - 1], B = TOWN.districts[b - 1];
    const bothLit = litSet.has(a) && litSet.has(b);
    const drawing = revealAnim && revealAnim.id === b && litSet.has(a);
    if (!bothLit && !drawing) continue;
    const pa = project(camera, A.x, A.y), pb = project(camera, B.x, B.y);
    const frac = drawing ? Math.min(1, revealAnim.p * 1.6) : 1;
    drawVein(ctx, pa, pb, frac, pulse, camera.zoom);
  }

  // districts back-to-front
  const sorted = TOWN.districts
    .map(d => ({ d, depth: project(camera, d.x, d.y).depth }))
    .sort((a, b) => a.depth - b.depth);

  for (const { d } of sorted) {
    const lit = litSet.has(d.id);
    const revealing = !!(revealAnim && revealAnim.id === d.id);
    let rise = 1;
    if (revealing) rise = Math.min(1, Math.max(0.02, revealAnim.p));
    const localPulse = lit ? Math.pow(Math.max(0, Math.sin(pulsePhase - d.phase * 0.18)), 6) : 0;
    drawDistrict(ctx, d, camera, {
      litTrue: lit, revealing,
      rise, pulse: localPulse, isNext: d.id === nextId, t
    });
    if (hoverId === d.id) {
      const c = blockCorners(d, camera, -6);
      ctx.strokeStyle = 'rgba(247,242,236,0.7)';
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(c[0].x, c[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(c[i].x, c[i].y);
      ctx.closePath(); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // reveal pulse ring
  if (revealAnim && revealAnim.p > 0.85) {
    const d = TOWN.districts[revealAnim.id - 1];
    const c = project(camera, d.x, d.y);
    const k = (revealAnim.p - 0.85) / 0.15;
    ctx.strokeStyle = `rgba(232,184,75,${1 - k})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, (20 + k * 130) * camera.zoom, (20 + k * 130) * camera.zoom * ISO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(10,8,6,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

// hit-test a screen point against districts (front-most wins)
export function pickDistrict(camera, sx, sy) {
  const hits = [];
  for (const d of TOWN.districts) {
    const c = project(camera, d.x, d.y);
    const rx = d.R * camera.zoom * 1.15;
    const ry = d.R * camera.zoom * ISO * 1.15 + 30 * camera.zoom;
    if (Math.abs(sx - c.x) <= rx && sy <= c.y + ry * 0.6 && sy >= c.y - ry) {
      hits.push({ d, depth: c.depth });
    }
  }
  hits.sort((a, b) => b.depth - a.depth);
  return hits.length ? hits[0].d : null;
}
