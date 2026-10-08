// Draws the rakhi knot at any tightness. Render the 'back' layer before the thread the knot is
// tied around and the 'front' layer after it; with nothing to tie around, use 'all'.

import React from 'react';
import type {V} from '../utils/math';
import {rakhiKnot, type KnotSpec} from './knot';
import {RoundFilter, TwistPattern} from './ThreadDefs';
import {ThreadPiece} from './ThreadPiece';

/** The tight knot, the same shape as the logo's: a rounded twist of cotton with a crossing line. */
export const KnotBody: React.FC<{uid: string; center: V; size: number; scale?: number}> = ({uid, center, size, scale = 1}) => {
  const w = size * scale;
  const h = w * 0.95;
  const x = center[0] - w / 2;
  const y = center[1] - h / 2;
  return (
    <g>
      <defs>
        <TwistPattern id={`${uid}-tw`} />
        <RoundFilter id={`${uid}-round`} x={x - 30} y={y - 30} width={w + 60} height={h + 60} />
      </defs>
      <g filter={`url(#${uid}-round)`}>
        <rect x={x} y={y} width={w} height={h} rx={w * 0.4} fill="#74130C" />
        <rect x={x + w * 0.058} y={y + h * 0.06} width={w * 0.887} height={h * 0.88} rx={w * 0.365} fill={`url(#${uid}-tw)`} />
      </g>
      <path
        d={`M${x + w * 0.258},${y + h * 0.085} C${x + w * 0.541},${y + h * 0.36} ${x + w * 0.461},${y + h * 0.74} ${x + w * 0.758},${y + h * 0.954}`}
        stroke="#74130C"
        strokeWidth={2.8 * scale}
        fill="none"
        opacity={0.75}
      />
    </g>
  );
};

export const RakhiKnot: React.FC<{
  uid: string;
  spec: KnotSpec;
  /** 0 open, 1 tied tight (slightly above 1 for the overshoot of a final tug). */
  p: number;
  layer?: 'back' | 'front' | 'all';
  twistDeg?: number;
  roundBasis?: number;
}> = ({uid, spec, p, layer = 'all', twistDeg = 32, roundBasis = 30}) => {
  const shape = rakhiKnot(spec, p);
  const pieces = shape.pieces.filter((pc) => layer === 'all' || pc.layer === layer);
  return (
    <g>
      {pieces.map((pc) => (
        <ThreadPiece
          key={pc.key}
          uid={`${uid}-${pc.key}`}
          points={pc.points}
          material={pc.material}
          width={spec.width}
          twistDeg={twistDeg}
          fray={pc.fray}
          roundBasis={roundBasis}
        />
      ))}
      {shape.blob && layer !== 'back' ? <KnotBody uid={`${uid}-body`} center={shape.blob.center} size={spec.size} scale={shape.blob.scale} /> : null}
    </g>
  );
};
