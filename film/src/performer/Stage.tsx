// The stage where a performer's clip would be: the LANTERN world from Brief 04 (ink black, one
// haldi pool of light, cream letters). The light is flat haldi with a halftone edge, the way a
// cheap print shows light falling off: dots that shrink, never a gradient.

import React, {useMemo} from 'react';
import {C, FRAME} from '../brand';
import {HalftonePattern, Layer} from '../components/Print';

export type Spot = {cx: number; cy: number; r: number; falloff: number};
export const SPOT: Spot = {cx: 540, cy: 1110, r: 360, falloff: 120};

/** A box the light's dots stay out of, so small words over the falloff stay clean. */
export type ClearBox = {x0: number; y0: number; x1: number; y1: number};

/** Haldi dots around the edge of the light, shrinking outwards. */
export const falloffDots = (spot: Spot, clear: ClearBox[]) => {
  const grid = 13;
  const rot = (18 * Math.PI) / 180;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const reach = spot.r + spot.falloff;
  let d = '';
  for (let i = -Math.ceil(reach / grid) - 2; i <= Math.ceil(reach / grid) + 2; i++) {
    for (let j = -Math.ceil(reach / grid) - 2; j <= Math.ceil(reach / grid) + 2; j++) {
      const x = i * grid * c - j * grid * s;
      const y = i * grid * s + j * grid * c;
      const dist = Math.hypot(x, y);
      if (dist < spot.r - grid || dist > reach) continue;
      const k = Math.max(0, Math.min(1, (reach - dist) / spot.falloff));
      const r = 6.2 * Math.pow(k, 1.15);
      if (r < 0.6) continue;
      const px = spot.cx + x;
      const py = spot.cy + y;
      if (clear.some((b) => px + r > b.x0 && px - r < b.x1 && py + r > b.y0 && py - r < b.y1)) continue;
      d += `M${(px - r).toFixed(1)} ${py.toFixed(1)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0`;
    }
  }
  return d;
};

/** Paper grain for a dark ground: pale specks instead of dark ones. */
const DarkGrain: React.FC<{id: string}> = ({id}) => (
  <filter id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} stitchTiles="stitch" result="n" />
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.94  0 0 0 0 0.9  0 0 0 0 0.83  0 0 0 0.32 -0.1" />
  </filter>
);

const NONE: ClearBox[] = [];

/** The stage as SVG content, for a layer that moves it (a camera). */
export const StageArt: React.FC<{lit: boolean; clear?: ClearBox[]; spot?: Spot; uid?: string}> = ({lit, clear = NONE, spot = SPOT, uid = 'stage'}) => {
  const dots = useMemo(() => falloffDots(spot, clear), [spot, clear]);
  return (
    <g>
      <defs>
        <pattern id={`${uid}-ht`} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <circle cx={4} cy={4} r={1.8} fill={C.cream} opacity={0.07} />
        </pattern>
        <HalftonePattern id={`${uid}-spot-ht`} />
        <DarkGrain id={`${uid}-grain`} />
      </defs>
      <rect width={FRAME.width} height={FRAME.height} fill={C.ink} />
      <rect width={FRAME.width} height={FRAME.height} fill={`url(#${uid}-ht)`} />
      {lit ? (
        <g>
          <path d={dots} fill={C.haldi} />
          <circle cx={spot.cx} cy={spot.cy} r={spot.r} fill={C.haldi} />
          <circle cx={spot.cx} cy={spot.cy} r={spot.r} fill={`url(#${uid}-spot-ht)`} />
        </g>
      ) : null}
      <rect width={FRAME.width} height={FRAME.height} filter={`url(#${uid}-grain)`} />
    </g>
  );
};

export const Stage: React.FC<{lit: boolean; clear?: ClearBox[]; spot?: Spot; uid?: string}> = (props) => (
  <Layer>
    <StageArt {...props} />
  </Layer>
);
