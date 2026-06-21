// ─── TileView ────────────────────────────────────────────────────────────────
// One grid cell. Hidden cells are worn stone (4 deterministic skins). Revealed
// cells show flat-ink pipe art that rotates with a snap. Cells fed by a source
// glow amber; echo tiles flicker their ghost orientation.

import React from 'react';
import { PAL } from '../../core/constants.js';

const PIPE_W = 26; // stroke width in a 100×100 cell

function PipeShape({ type, color, width }) {
  const c = 50, w = width;
  const common = { stroke: color, strokeWidth: w, fill: 'none', strokeLinecap: 'butt' };
  switch (type) {
    case 'straight':
      return <line x1={c} y1={0} x2={c} y2={100} {...common} />;
    case 'elbow': // N + E
      return <path d={`M ${c} 0 L ${c} ${c} L 100 ${c}`} {...common} strokeLinejoin="round" />;
    case 'tee': // N + E + S
      return (<g>
        <line x1={c} y1={0} x2={c} y2={100} {...common} />
        <line x1={c} y1={c} x2={100} y2={c} {...common} />
      </g>);
    case 'cross':
      return (<g>
        <line x1={c} y1={0} x2={c} y2={100} {...common} />
        <line x1={0} y1={c} x2={100} y2={c} {...common} />
      </g>);
    case 'dead': // N only, capped
      return (<g>
        <line x1={c} y1={0} x2={c} y2={c + 6} {...common} />
        <rect x={c - w / 2 - 5} y={c} width={w + 10} height={9} fill={color} />
      </g>);
    default:
      return null;
  }
}

// deterministic crack pattern per skin
const CRACKS = [
  'M 18 22 L 36 40 L 30 62 M 70 18 L 62 44',
  'M 24 70 L 48 58 L 70 74 M 60 20 L 76 38',
  'M 14 48 L 40 36 M 52 78 L 74 60 L 82 70',
  'M 30 16 L 44 34 L 38 52 M 16 72 L 34 84'
];
const STAINS = [
  { cx: 32, cy: 30, r: 16 }, { cx: 66, cy: 62, r: 19 },
  { cx: 60, cy: 28, r: 14 }, { cx: 30, cy: 68, r: 17 }
];

export default function TileView({ cell, flow, cellPx, onTap, justRevealed, hintGlow }) {
  const inFlow = flow.has(cell.i);
  const isNode = cell.type === 'source' || cell.type === 'sink';

  return (
    <button
      className={[
        'tile',
        cell.revealed ? 'revealed' : 'hidden-tile',
        cell.pressure && !cell.revealed ? 'pressure' : '',
        inFlow ? 'in-flow' : '',
        justRevealed ? 'just-revealed' : '',
        hintGlow ? 'hint-glow' : ''
      ].join(' ')}
      style={{ width: cellPx, height: cellPx }}
      onClick={() => onTap(cell.i)}
      aria-label={cell.revealed ? `${cell.type} pipe` : 'hidden tile'}
    >
      <svg viewBox="0 0 100 100" className="tile-svg">
        {/* base */}
        <rect x="1" y="1" width="98" height="98" rx="6"
          fill={cell.revealed ? PAL.inkSoft : PAL.stone} stroke="#14100c" strokeWidth="2" />

        {!cell.revealed && (
          <g>
            <rect x="1" y="1" width="98" height="98" rx="6" fill="#3D2B1A" />
            <circle {...STAINS[cell.skin]} fill="#32230f" opacity="0.7" />
            <path d={CRACKS[cell.skin]} stroke="#2a1d10" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <rect x="1" y="1" width="98" height="98" rx="6" fill="none" stroke="#4d3a24" strokeWidth="1.5" opacity="0.6" />
            {cell.pressure && (
              <rect x="4" y="4" width="92" height="92" rx="5" fill={PAL.rust} opacity="0.28" />
            )}
            {cell.locked && (
              <g opacity="0.95">
                <rect x="38" y="46" width="24" height="20" rx="3" fill="#191510" stroke={PAL.gold} strokeWidth="3" />
                <path d="M 42 46 L 42 38 A 8 8 0 0 1 58 38 L 58 46" fill="none" stroke={PAL.gold} strokeWidth="3" />
              </g>
            )}
            {/* echo ghost — the city remembers (or lies) */}
            {cell.echo && !cell.locked && (
              <g className="echo-ghost" transform={`rotate(${cell.echo.rot * 90} 50 50)`}>
                <PipeShape type={cell.type} color={cell.echo.decoy ? PAL.goldBright : PAL.goldBright} width={10} />
              </g>
            )}
          </g>
        )}

        {cell.revealed && !isNode && (
          <g className="pipe-rot" style={{ transform: `rotate(${cell.rot * 90}deg)`, transformOrigin: '50px 50px' }}>
            {/* pipe shadow + body */}
            <g opacity="0.55"><PipeShape type={cell.type} color="#0e0b08" width={PIPE_W + 8} /></g>
            <PipeShape type={cell.type} color={inFlow ? PAL.gold : '#6b5236'} width={PIPE_W} />
            {inFlow && <PipeShape type={cell.type} color={PAL.goldBright} width={8} />}
          </g>
        )}

        {isNode && (
          <g className="pipe-rot" style={{ transform: `rotate(${cell.rot * 90}deg)`, transformOrigin: '50px 50px' }}>
            <line x1="50" y1="0" x2="50" y2="40" stroke={inFlow ? PAL.gold : '#6b5236'} strokeWidth={PIPE_W} />
            {inFlow && <line x1="50" y1="0" x2="50" y2="40" stroke={PAL.goldBright} strokeWidth="8" />}
          </g>
        )}
        {isNode && (
          <g>
            <circle cx="50" cy="50" r="26" fill={cell.type === 'source' ? PAL.rust : PAL.teal}
              stroke={inFlow ? PAL.goldBright : '#14100c'} strokeWidth="4" />
            <circle cx="50" cy="50" r="13" fill={inFlow ? PAL.goldBright : PAL.paper} opacity={inFlow ? 1 : 0.85} />
            <text x="50" y="86" textAnchor="middle" fontSize="15" fontFamily="Oswald, sans-serif"
              fill={PAL.paperDim} letterSpacing="1">{cell.type === 'source' ? 'SRC' : 'SNK'}</text>
          </g>
        )}

        {/* key fragment marker once revealed */}
        {cell.revealed && cell.hasKey && (
          <g transform="translate(76,22) scale(0.85)">
            <circle cx="0" cy="0" r="7" fill="none" stroke={PAL.goldBright} strokeWidth="3" />
            <line x1="5" y1="5" x2="16" y2="16" stroke={PAL.goldBright} strokeWidth="3" />
            <line x1="12" y1="16" x2="16" y2="12" stroke={PAL.goldBright} strokeWidth="3" />
          </g>
        )}
      </svg>
    </button>
  );
}
