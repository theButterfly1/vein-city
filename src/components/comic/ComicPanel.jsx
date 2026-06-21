// ─── Comic art ───────────────────────────────────────────────────────────────
// Ink-and-amber SVG panels. Backgrounds are parameterized scene kinds; the
// cast are distinct silhouettes. Everything reads as 1970s technical
// illustration: flat shapes, hard shadows, one warm light source.

import React, { useState, useEffect } from 'react';
import { PAL } from '../../core/constants.js';
import { comicSrc } from '../../assets/images.js';

// scene kind + accent per background name
const SCENES = {
  office:      { kind: 'interior', accent: PAL.gold,  props: 'desk' },
  archive:     { kind: 'interior', accent: '#9b7bb8', props: 'shelves' },
  vault:       { kind: 'interior', accent: PAL.rust,  props: 'vaultdoor' },
  printing:    { kind: 'interior', accent: PAL.gold,  props: 'press' },
  chapel:      { kind: 'interior', accent: PAL.teal,  props: 'arches' },
  gallery:     { kind: 'interior', accent: PAL.gold,  props: 'names' },
  tunnel:      { kind: 'tunnel', accent: PAL.gold },
  underpass:   { kind: 'tunnel', accent: PAL.teal },
  drain:       { kind: 'tunnel', accent: '#5a6b72', dark: true },
  aqueduct:    { kind: 'tunnel', accent: PAL.teal, water: true },
  junction:    { kind: 'tunnel', accent: PAL.rust },
  antechamber: { kind: 'tunnel', accent: PAL.goldBright, door: true },
  cistern:     { kind: 'tunnel', accent: PAL.teal, water: true },
  cellar:      { kind: 'tunnel', accent: '#c8b89a' },
  boiler:      { kind: 'tunnel', accent: PAL.rust, pipes: 3 },
  foundry:     { kind: 'tunnel', accent: PAL.rust, pipes: 2 },
  gates:       { kind: 'tunnel', accent: PAL.teal, door: true },
  glassworks:  { kind: 'tunnel', accent: PAL.goldBright, water: true },
  bridge:      { kind: 'tunnel', accent: '#8a8a7a', pipes: 2 },
  street:      { kind: 'exterior', accent: PAL.gold },
  market:      { kind: 'exterior', accent: PAL.rust, awnings: true },
  alley:       { kind: 'exterior', accent: PAL.gold, narrow: true },
  gaslight:    { kind: 'exterior', accent: PAL.goldBright, lamps: true, night: true },
  clocktower:  { kind: 'exterior', accent: PAL.gold, tower: true },
  rooftop:     { kind: 'exterior', accent: PAL.teal, roof: true, night: true },
  depot:       { kind: 'exterior', accent: PAL.rust, rails: true },
  heart:       { kind: 'heart', lit: false },
  heartlit:    { kind: 'heart', lit: true }
};

function Interior({ s }) {
  return (
    <g>
      <rect x="0" y="0" width="640" height="360" fill="#251e17" />
      <rect x="0" y="282" width="640" height="78" fill="#1a1410" />
      {/* window light */}
      <rect x="468" y="44" width="118" height="150" fill="#15110d" stroke="#4a3a28" strokeWidth="4" />
      <rect x="474" y="50" width="106" height="138" fill={s.accent} opacity="0.16" />
      <line x1="527" y1="44" x2="527" y2="194" stroke="#4a3a28" strokeWidth="4" />
      <line x1="468" y1="119" x2="586" y2="119" stroke="#4a3a28" strokeWidth="4" />
      {s.props === 'desk' && (<g>
        <rect x="60" y="252" width="250" height="14" fill="#0f0c09" />
        <rect x="75" y="266" width="14" height="50" fill="#0f0c09" />
        <rect x="280" y="266" width="14" height="50" fill="#0f0c09" />
        <rect x="100" y="226" width="70" height="26" fill="#332a1f" />
        <path d="M 230 252 L 230 212 L 256 212 L 268 230 L 268 252" fill="none" stroke={s.accent} strokeWidth="5" />
        <ellipse cx="252" cy="244" rx="34" ry="9" fill={s.accent} opacity="0.25" />
      </g>)}
      {s.props === 'shelves' && [0, 1, 2].map(i => (
        <g key={i}>
          <rect x={40 + i * 130} y="70" width="100" height="212" fill="#1d1712" stroke="#3a2d1f" strokeWidth="3" />
          {[0, 1, 2, 3].map(j => <rect key={j} x={48 + i * 130} y={84 + j * 50} width="84" height="32" fill="#33291d" />)}
        </g>
      ))}
      {s.props === 'vaultdoor' && (<g>
        <circle cx="150" cy="180" r="92" fill="#241d15" stroke="#4a3a28" strokeWidth="8" />
        <circle cx="150" cy="180" r="34" fill="none" stroke={s.accent} strokeWidth="6" />
        {[0, 60, 120, 180, 240, 300].map(a => (
          <line key={a} x1={150 + 40 * Math.cos(a * Math.PI / 180)} y1={180 + 40 * Math.sin(a * Math.PI / 180)}
            x2={150 + 78 * Math.cos(a * Math.PI / 180)} y2={180 + 78 * Math.sin(a * Math.PI / 180)}
            stroke="#4a3a28" strokeWidth="6" />
        ))}
      </g>)}
      {s.props === 'press' && (<g>
        <rect x="56" y="170" width="220" height="112" fill="#241d15" stroke="#3a2d1f" strokeWidth="4" />
        <circle cx="110" cy="200" r="26" fill="none" stroke={s.accent} strokeWidth="6" />
        <circle cx="180" cy="200" r="26" fill="none" stroke={s.accent} strokeWidth="6" />
        <rect x="70" y="240" width="190" height="12" fill="#0f0c09" />
      </g>)}
      {s.props === 'arches' && [0, 1, 2].map(i => (
        <path key={i} d={`M ${50 + i * 120} 282 L ${50 + i * 120} 140 A 50 50 0 0 1 ${150 + i * 120} 140 L ${150 + i * 120} 282`}
          fill="none" stroke="#3a2d1f" strokeWidth="8" />
      ))}
      {s.props === 'names' && [0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={50 + (i % 3) * 110} y={90 + Math.floor(i / 3) * 90} width="86" height="60"
          fill="#1d1712" stroke={s.accent} strokeWidth="2" opacity="0.8" />
      ))}
      <rect x="0" y="0" width="640" height="360" fill="url(#vcvig)" />
    </g>
  );
}

function Tunnel({ s }) {
  const pipes = s.pipes || 1;
  return (
    <g>
      <rect x="0" y="0" width="640" height="360" fill={s.dark ? '#100d0a' : '#1c1610'} />
      <path d="M 40 360 L 40 130 A 280 200 0 0 1 600 130 L 600 360" fill="#241c14" />
      <path d="M 40 360 L 40 130 A 280 200 0 0 1 600 130 L 600 360" fill="none" stroke="#3a2d1f" strokeWidth="7" />
      <path d="M 90 360 L 90 160 A 230 170 0 0 1 550 160 L 550 360" fill="none" stroke="#2c2218" strokeWidth="5" />
      {Array.from({ length: pipes }).map((_, i) => (
        <g key={i}>
          <rect x="0" y={70 + i * 36} width="640" height="16" fill="#33281c" stroke="#1a1410" strokeWidth="2" />
          <circle cx={150 + i * 160} cy={78 + i * 36} r="13" fill="#33281c" stroke={s.accent} strokeWidth="3" />
        </g>
      ))}
      {s.water && (<g>
        <rect x="0" y="300" width="640" height="60" fill={s.accent} opacity="0.18" />
        <path d="M 0 302 Q 80 296 160 302 T 320 302 T 480 302 T 640 302" fill="none" stroke={s.accent} strokeWidth="3" opacity="0.6" />
      </g>)}
      {s.door && (<g>
        <path d="M 250 360 L 250 150 A 70 70 0 0 1 390 150 L 390 360" fill="#13100c" stroke={s.accent} strokeWidth="5" />
        <line x1="320" y1="150" x2="320" y2="360" stroke={s.accent} strokeWidth="2" opacity="0.5" />
        <circle cx="320" cy="240" r="20" fill="none" stroke={s.accent} strokeWidth="3" opacity="0.8" />
      </g>)}
      {/* amber vein glow along the floor */}
      <path d="M 0 340 Q 160 322 320 338 T 640 332" fill="none" stroke={PAL.gold} strokeWidth="4" opacity="0.5" />
      <path d="M 0 340 Q 160 322 320 338 T 640 332" fill="none" stroke={PAL.goldBright} strokeWidth="1.6" opacity="0.9" />
      <rect x="0" y="0" width="640" height="360" fill="url(#vcvig)" />
    </g>
  );
}

function Exterior({ s }) {
  const sky = s.night ? '#0e0c12' : '#2a2118';
  return (
    <g>
      <rect x="0" y="0" width="640" height="360" fill={sky} />
      {s.night && [...Array(14)].map((_, i) => (
        <circle key={i} cx={(i * 97) % 640} cy={20 + (i * 53) % 90} r="1.4" fill="#cfc6b8" opacity="0.7" />
      ))}
      {/* skyline */}
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i} x={i * 132 - 8} y={s.narrow ? 60 : 110 - (i % 3) * 26} width={s.narrow ? 150 : 120}
          height={300} fill={i % 2 ? '#1c1610' : '#221a12'} stroke="#0f0c09" strokeWidth="2" />
      ))}
      {/* lit windows */}
      {[...Array(16)].map((_, i) => (
        <rect key={i} x={28 + (i * 73) % 580} y={130 + (i * 41) % 130} width="9" height="13"
          fill={PAL.goldBright} opacity={s.night ? 0.75 : 0.4} />
      ))}
      {s.tower && (<g>
        <rect x="430" y="20" width="80" height="280" fill="#1a140e" stroke="#0f0c09" strokeWidth="3" />
        <circle cx="470" cy="74" r="30" fill="#15110d" stroke={s.accent} strokeWidth="4" />
        <line x1="470" y1="74" x2="470" y2="54" stroke={s.accent} strokeWidth="3" />
        <line x1="470" y1="74" x2="486" y2="80" stroke={s.accent} strokeWidth="3" />
      </g>)}
      {s.lamps && [120, 320, 520].map(x => (<g key={x}>
        <rect x={x} y="180" width="6" height="130" fill="#0f0c09" />
        <circle cx={x + 3} cy="172" r="11" fill={s.accent} opacity="0.95" />
        <circle cx={x + 3} cy="172" r="22" fill={s.accent} opacity="0.18" />
      </g>))}
      {s.awnings && [60, 250, 440].map(x => (<g key={x}>
        <rect x={x} y="226" width="120" height="60" fill="#1a140e" />
        <path d={`M ${x - 8} 226 L ${x + 128} 226 L ${x + 116} 200 L ${x + 4} 200 Z`} fill={s.accent} opacity="0.7" />
      </g>))}
      {s.rails && (<g>
        <line x1="0" y1="330" x2="640" y2="312" stroke="#4a3a28" strokeWidth="5" />
        <line x1="0" y1="346" x2="640" y2="330" stroke="#4a3a28" strokeWidth="5" />
      </g>)}
      {s.roof && <rect x="0" y="270" width="640" height="90" fill="#181208" />}
      <rect x="0" y={s.roof ? 270 : 300} width="640" height="90" fill="#171209" />
      <path d="M 0 332 Q 160 320 320 334 T 640 326" fill="none" stroke={PAL.gold} strokeWidth="3" opacity="0.35" />
      <rect x="0" y="0" width="640" height="360" fill="url(#vcvig)" />
    </g>
  );
}

function HeartChamber({ s }) {
  return (
    <g>
      <rect x="0" y="0" width="640" height="360" fill="#0c0907" />
      {/* organic conduit walls */}
      {[0, 1, 2, 3].map(i => (
        <path key={i}
          d={`M ${i * 170 - 40} 360 C ${i * 170 + 20} ${230 - i * 12}, ${i * 170 + 60} ${150 - i * 8}, ${i * 170 + 110} 0`}
          fill="none" stroke="#2a1d12" strokeWidth={26 - i * 4} strokeLinecap="round" />
      ))}
      {/* the heart */}
      <g transform="translate(320,185)">
        <path d="M 0 70 C -120 -10 -70 -110 0 -45 C 70 -110 120 -10 0 70 Z"
          fill={s.lit ? PAL.rust : '#3a241a'} stroke={s.lit ? PAL.goldBright : '#5a3a26'} strokeWidth="5" />
        {s.lit && (<>
          <path d="M 0 70 C -120 -10 -70 -110 0 -45 C 70 -110 120 -10 0 70 Z" fill={PAL.goldBright} opacity="0.28" />
          <circle cx="0" cy="-5" r="110" fill={PAL.gold} opacity="0.12" />
          <circle cx="0" cy="-5" r="160" fill={PAL.gold} opacity="0.06" />
        </>)}
        {/* veins out of the heart */}
        {[-1, 1].map(k => (
          <path key={k} d={`M ${k * 55} -45 C ${k * 140} -90 ${k * 200} -60 ${k * 320} -110`}
            fill="none" stroke={s.lit ? PAL.gold : '#4a3020'} strokeWidth="7" strokeLinecap="round" opacity="0.9" />
        ))}
        <path d="M 0 70 C 0 140 -30 170 -60 200" fill="none" stroke={s.lit ? PAL.gold : '#4a3020'} strokeWidth="8" strokeLinecap="round" />
      </g>
      <rect x="0" y="0" width="640" height="360" fill="url(#vcvig)" />
    </g>
  );
}

// ── cast silhouettes ─────────────────────────────────────────────────────────
function Figure({ who, x, flip }) {
  const sc = flip ? -1 : 1;
  const body = '#0d0a08';
  const rim = PAL.gold;
  return (
    <g transform={`translate(${x},356) scale(${sc},1)`}>
      {who === 'mara' && (<g>
        <path d="M -22 0 L -18 -86 Q -16 -104 0 -106 Q 16 -104 18 -86 L 24 0 Z" fill={body} />
        <circle cx="2" cy="-122" r="15" fill={body} />
        <path d="M -14 -128 Q 2 -140 18 -128 L 16 -120 L -12 -120 Z" fill={PAL.gold} />{/* hardhat */}
        <path d="M 14 -118 Q 26 -108 22 -88" fill="none" stroke={body} strokeWidth="7" strokeLinecap="round" />{/* ponytail */}
        <rect x="-20" y="-70" width="40" height="5" fill={rim} opacity="0.85" />{/* tool belt */}
        <path d="M 18 -80 L 38 -64" stroke={body} strokeWidth="8" strokeLinecap="round" />{/* arm w/ wrench */}
        <rect x="32" y="-72" width="14" height="6" fill={rim} transform="rotate(38 39 -69)" />
      </g>)}
      {who === 'dorn' && (<g>
        <path d="M -30 0 L -26 -92 Q -22 -110 0 -112 Q 24 -110 28 -92 L 32 0 Z" fill={body} />
        <circle cx="0" cy="-128" r="16" fill={body} />
        <rect x="-20" y="-146" width="40" height="8" fill={body} />
        <rect x="-13" y="-158" width="26" height="14" fill={body} />{/* hat */}
        <path d="M -26 -96 L 26 -96" stroke="#2c2218" strokeWidth="4" />{/* coat seam */}
        <path d="M -28 -84 L -44 -58" stroke={body} strokeWidth="9" strokeLinecap="round" />
      </g>)}
      {who === 'theo' && (<g>
        <path d="M -14 0 L -12 -96 Q -10 -110 0 -112 Q 10 -110 12 -96 L 16 0 Z" fill={body} />
        <circle cx="1" cy="-126" r="13" fill={body} />
        <path d="M -12 -132 Q 1 -142 14 -132 L 13 -126 L -11 -126 Z" fill={PAL.teal} />{/* beanie */}
        <path d="M 12 -88 L 34 -70" stroke={body} strokeWidth="7" strokeLinecap="round" />
        {/* tripod rig */}
        <line x1="46" y1="0" x2="46" y2="-66" stroke={body} strokeWidth="4" />
        <line x1="46" y1="-40" x2="32" y2="0" stroke={body} strokeWidth="4" />
        <line x1="46" y1="-40" x2="60" y2="0" stroke={body} strokeWidth="4" />
        <rect x="36" y="-82" width="20" height="14" fill={body} stroke={PAL.teal} strokeWidth="2" />
      </g>)}
      {who === 'imka' && (<g>
        <path d="M -24 0 Q -28 -60 -16 -92 Q -8 -108 0 -108 Q 8 -108 16 -92 Q 28 -60 24 0 Z" fill={body} />
        <path d="M -24 -64 Q 0 -84 24 -64 L 24 -44 Q 0 -62 -24 -44 Z" fill="#241c2a" />{/* shawl */}
        <circle cx="0" cy="-122" r="14" fill={body} />
        <circle cx="0" cy="-138" r="7" fill={body} />{/* bun */}
        <circle cx="-5" cy="-122" r="5" fill="none" stroke={PAL.gold} strokeWidth="2" />
        <circle cx="7" cy="-122" r="5" fill="none" stroke={PAL.gold} strokeWidth="2" />
        <line x1="0" y1="-122" x2="2" y2="-122" stroke={PAL.gold} strokeWidth="2" />
      </g>)}
    </g>
  );
}

function CityPresence() {
  return (
    <g opacity="0.95">
      {[0, 1, 2, 3, 4].map(i => (
        <path key={i}
          d={`M ${90 + i * 120} 360 C ${110 + i * 120} ${260 - i * 14}, ${70 + i * 120} ${180 + i * 10}, ${100 + i * 120} ${90 - i * 8}`}
          fill="none" stroke={PAL.gold} strokeWidth={3.5 - i * 0.4} opacity={0.55 - i * 0.07} strokeLinecap="round"
          className="vc-vein-anim" />
      ))}
      <circle cx="320" cy="150" r="60" fill={PAL.gold} opacity="0.07" />
      <circle cx="320" cy="150" r="26" fill={PAL.goldBright} opacity="0.12" />
    </g>
  );
}

const FIG_X = { 1: [320], 2: [185, 460], 3: [140, 320, 505], 4: [110, 260, 400, 540] };

// Procedural ink-and-amber fallback, used when the painted PNG is unavailable.
function ComicArt({ bg, actors }) {
  const s = SCENES[bg] || SCENES.tunnel;
  const figures = actors.filter(a => a !== 'city' && a !== 'cap');
  const hasCity = actors.includes('city');
  const xs = FIG_X[Math.min(4, Math.max(1, figures.length))] || FIG_X[1];
  return (
    <svg viewBox="0 0 640 360" className="comic-svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="vcvig" cx="50%" cy="42%" r="75%">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(8,6,4,0.6)" />
        </radialGradient>
      </defs>
      {s.kind === 'interior' && <Interior s={s} />}
      {s.kind === 'tunnel' && <Tunnel s={s} />}
      {s.kind === 'exterior' && <Exterior s={s} />}
      {s.kind === 'heart' && <HeartChamber s={s} />}
      {hasCity && s.kind !== 'heart' && <CityPresence />}
      {figures.map((who, i) => (
        <Figure key={who} who={who} x={xs[i]} flip={figures.length > 1 && i === figures.length - 1} />
      ))}
      {/* ink frame */}
      <rect x="3" y="3" width="634" height="354" fill="none" stroke="#0d0a08" strokeWidth="6" />
    </svg>
  );
}

// Painted comic panel. Shows the level/phase PNG; if that file is missing or
// fails to load, it falls back to the procedural ink-and-amber scene above.
export default function ComicPanel({ levelId, phase, bg, actors }) {
  const [failed, setFailed] = useState(false);
  const haveKey = levelId != null && phase;
  const src = haveKey ? comicSrc(levelId, phase) : null;

  // reset the error state whenever the panel target changes
  useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) return <ComicArt bg={bg} actors={actors} />;

  return (
    <img
      className="comic-img"
      src={src}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
