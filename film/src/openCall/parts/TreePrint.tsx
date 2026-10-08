// Tansen's tree as printed on the wrapper inside the thread's outline: a haldi crown full of tamarind
// sprigs over a tamarind brown trunk, halftoned and grained like the paper it is printed on. It is
// clipped to the shape the thread has been lifted into, so the print rises with the thread.

import React from 'react';
import {C} from '../../brand';
import {GrainFilter, HalftonePattern} from '../../components/Print';
import type {V} from '../../utils/math';
import {BARK_D, CROWN_D, TRUNK_D} from './tree';

const TILE = 76;

/** A tamarind sprig: a midrib with small leaflets in pairs, swept forward like a feather. */
const Sprig: React.FC<{x: number; y: number; angle: number; size: number}> = ({x, y, angle, size}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}>
    <path d="M-16 0 Q0 -2 18 0" fill="none" stroke={C.wrapperDark} strokeWidth={2} strokeLinecap="round" />
    {[-11, -5, 1, 7, 13].map((lx) => (
      <g key={lx}>
        <ellipse cx={lx + 2} cy={-5} rx={2.4} ry={5} transform={`rotate(38 ${lx + 2} -5)`} fill={C.wrapperDark} />
        <ellipse cx={lx + 2} cy={5} rx={2.4} ry={5} transform={`rotate(-38 ${lx + 2} 5)`} fill={C.wrapperDark} />
      </g>
    ))}
  </g>
);

const SPRIGS: [number, number, number, number][] = [
  [18, 16, -24, 1],
  [56, 30, 14, 0.9],
  [24, 54, 8, 0.85],
  [62, 66, -30, 1],
];

const polygonD = (pts: V[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;

export const TreePrint: React.FC<{uid: string; clip: V[]}> = ({uid, clip}) => {
  if (clip.length < 3) return null;
  return (
    <g>
      <defs>
        <clipPath id={`${uid}-shape`}>
          <path d={polygonD(clip)} />
        </clipPath>
        <clipPath id={`${uid}-ink`}>
          <path d={TRUNK_D} />
          <path d={CROWN_D} />
        </clipPath>
        <pattern id={`${uid}-crown`} width={TILE} height={TILE} patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <rect width={TILE} height={TILE} fill={C.haldi} />
          {SPRIGS.map(([x, y, a, s]) => (
            <Sprig key={`${x}-${y}`} x={x} y={y} angle={a} size={s} />
          ))}
        </pattern>
        <HalftonePattern id={`${uid}-ht`} />
        <GrainFilter id={`${uid}-grain`} />
      </defs>
      <g clipPath={`url(#${uid}-shape)`}>
        <path d={TRUNK_D} fill={C.tamarind} />
        <path d={BARK_D} fill="none" stroke={C.wrapperDark} strokeWidth={4} strokeLinecap="round" />
        <path d={CROWN_D} fill={`url(#${uid}-crown)`} />
        <path d={CROWN_D} fill="none" stroke={C.wrapperDark} strokeWidth={3} strokeLinejoin="round" />
        <g clipPath={`url(#${uid}-ink)`}>
          <rect x={120} y={40} width={840} height={660} fill={`url(#${uid}-ht)`} />
          <rect x={120} y={40} width={840} height={660} filter={`url(#${uid}-grain)`} opacity={0.5} style={{mixBlendMode: 'multiply'}} />
        </g>
      </g>
    </g>
  );
};
