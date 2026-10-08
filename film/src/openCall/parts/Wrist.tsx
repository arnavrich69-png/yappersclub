// A wrist for the kalava, drawn like the pointing hand printed on old packets: cream, ink outline,
// halftone, a tamarind print shadow. The forearm rises from below, the fist sits above the thread,
// the wrist is at 0,0 where the thread is tied. Sleeves vary (all in the brand's colours) so a row of
// wrists reads as different people. The thread's wraps and knot are drawn by WristTie, on top.

import React from 'react';
import {C} from '../../brand';
import {HalftonePattern} from '../../components/Print';
import {KnotBody} from '../../thread/RakhiKnot';
import {ThreadPiece} from '../../thread/ThreadPiece';
import {quad, slice} from '../../thread/geometry';
import {cumulative} from '../../thread/geometry';
import type {V} from '../../utils/math';

export type Sleeve = {fill: string; cuff: string; stripes?: boolean; bangle?: boolean};

export const SLEEVES: Sleeve[] = [
  {fill: C.imli, cuff: C.haldi},
  {fill: C.ink, cuff: C.ink},
  {fill: C.tamarind, cuff: C.cream, bangle: true},
  {fill: C.cream, cuff: C.ink, stripes: true},
  {fill: C.haldi, cuff: C.imli},
];

// Arms and sleeves run far below the frame, so they still leave it at the bottom when the camera pulls back.
const FOREARM = 'M-56,-6 C-60,120 -66,520 -78,1320 L-86,2300 L86,2300 L78,1320 C66,520 60,120 56,-6 Z';
const FIST =
  'M-62,-4 C-74,-40 -80,-96 -76,-140 C-74,-166 -60,-180 -40,-178 C-30,-190 -12,-192 0,-180 ' +
  'C10,-192 30,-192 38,-178 C52,-188 72,-182 76,-160 C82,-120 78,-50 62,-4 Z';
const THUMB = 'M-76,-104 C-96,-96 -98,-62 -78,-50 C-60,-40 -30,-46 -14,-58 C-6,-66 -12,-78 -24,-78 C-42,-78 -58,-80 -76,-104 Z';
const KNUCKLES = ['M-22,-176 C-24,-160 -22,-146 -18,-136', 'M18,-178 C16,-162 18,-148 22,-138', 'M50,-170 C48,-156 50,-144 54,-136'];
const SLEEVE_TOP = 360;

export const Wrist: React.FC<{uid: string; sleeve: Sleeve}> = ({uid, sleeve}) => (
  <g>
    <defs>
      <HalftonePattern id={`${uid}-ht`} grid={7} r={1.7} opacity={0.12} rotate={18} />
    </defs>
    {/* Print shadow. */}
    <g transform="translate(9 12)" fill={C.tamarind}>
      <path d={FOREARM} />
      <path d={FIST} />
    </g>
    <path d={FOREARM} fill={C.cream} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d={FOREARM} fill={`url(#${uid}-ht)`} />
    {/* Sleeve and cuff. */}
    <path d={`M-74,${SLEEVE_TOP} L74,${SLEEVE_TOP} L118,2300 L-118,2300 Z`} fill={sleeve.fill} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    {sleeve.stripes
      ? [-50, -18, 14, 46].map((x) => <line key={x} x1={x} y1={SLEEVE_TOP + 30} x2={x * 1.59} y2={2300} stroke={C.ink} strokeWidth={4} opacity={0.6} />)
      : null}
    <rect x={-80} y={SLEEVE_TOP - 6} width={160} height={34} rx={6} fill={sleeve.cuff} stroke={C.ink} strokeWidth={6} />
    {sleeve.bangle ? <rect x={-64} y={150} width={128} height={18} rx={9} fill={C.haldi} stroke={C.ink} strokeWidth={5} /> : null}
    <path d={FIST} fill={C.cream} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d={FIST} fill={`url(#${uid}-ht)`} />
    {KNUCKLES.map((d) => (
      <path key={d} d={d} fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />
    ))}
    <path d={THUMB} fill={C.cream} stroke={C.ink} strokeWidth={5.5} strokeLinejoin="round" />
  </g>
);

/** The two wraps round the front of the wrist, each a shallow curve, as they are wound on. */
const WRAPS: V[][] = [quad([-64, -18], [0, -4], [64, 4], 24), quad([-64, 4], [0, 20], [64, 26], 24)];
const ENDS: V[][] = [quad([2, 12], [-6, 46], [-28, 82], 20), quad([2, 12], [14, 46], [40, 76], 20)];

/**
 * The kalava on a wrist: `wound` 0..2 draws the two wraps on, `knot` 0..1 cinches the rakhi knot and
 * lets the loose ends fall into their V (a little over 1 overshoots).
 */
export const WristTie: React.FC<{uid: string; wound: number; knot: number}> = ({uid, wound, knot}) => (
  <g>
    {WRAPS.map((w, i) => {
      const p = Math.max(0, Math.min(1, wound - i));
      if (p <= 0) return null;
      const len = cumulative(w)[w.length - 1];
      return <ThreadPiece key={i} uid={`${uid}-w${i}`} points={slice(w, 0, len * p)} width={24} roundBasis={26} shadow={[0, 5]} cap="round" />;
    })}
    {knot > 0
      ? ENDS.map((e, i) => {
          const len = cumulative(e)[e.length - 1];
          return <ThreadPiece key={i} uid={`${uid}-e${i}`} points={slice(e, 0, len * Math.min(1, knot))} width={13} roundBasis={26} fray="end" yellowCore={i === 1 ? 3.6 : 0} />;
        })
      : null}
    {knot > 0 ? <KnotBody uid={`${uid}-k`} center={[2, 10]} size={34} scale={0.6 + 0.4 * knot} /> : null}
  </g>
);
