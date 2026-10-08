// ध्वनि KUL popping in with a soft candy bounce, piece by piece (ध्व, नि, K, U, L: aksharas are never
// split). The cream fill lands first; the ink outline and the tamarind shadow arrive one frame later.
// Drawn as three stacked layers (all shadows, all outlines, all fills) so overlapping pieces join
// exactly like the designer's single outline.

import React from 'react';
import {C} from '../brand';
import {settle} from '../utils/easing';
import {clamp} from '../utils/math';
import {WORDMARK, type WordmarkPiece} from './lockup';

/** Scale of a piece `k` seconds after it starts: from 0.55 (never from zero), overshoot, settle. */
const bounce = (k: number) => 0.55 + 0.45 * settle(k, 3.4, 0.32);

/** Pop transform for one piece: uniform bounce plus stretch on the way up, squash on the way down. */
const popTransform = (piece: WordmarkPiece, k: number) => {
  const s = bounce(k);
  const v = (bounce(k) - bounce(k - 1 / 120)) * 120;
  const stretch = clamp(v / 9, -0.1, 0.1);
  const sx = s * (1 - stretch * 0.6);
  const sy = s * (1 + stretch);
  const px = (piece.box[0] + piece.box[2]) / 2;
  const py = piece.box[3];
  return `translate(${px} ${py}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-px} ${-py})`;
};

export type PopTimes = Record<string, number>;

export const Wordmark: React.FC<{t: number; starts: PopTimes; fps: number}> = ({t, starts, fps}) => {
  const lag = 1 / fps;
  const visible = WORDMARK.filter((p) => t >= starts[p.key]);
  const dressed = WORDMARK.filter((p) => t >= starts[p.key] + lag - 1e-6);
  const tf = (p: WordmarkPiece) => popTransform(p, t - starts[p.key]);
  return (
    <g>
      {dressed.map((p) => (
        <g key={`sh-${p.key}`} transform={tf(p)}>
          <path d={p.d} transform={`translate(${p.shadow} ${p.shadow})`} fill={C.tamarind} stroke={C.tamarind} strokeWidth={p.stroke} strokeLinejoin="round" />
        </g>
      ))}
      {dressed.map((p) => (
        <g key={`ol-${p.key}`} transform={tf(p)}>
          <path d={p.d} fill={C.ink} stroke={C.ink} strokeWidth={p.stroke} strokeLinejoin="round" />
        </g>
      ))}
      {visible.map((p) => (
        <g key={`fill-${p.key}`} transform={tf(p)}>
          <path d={p.d} fill={C.cream} />
        </g>
      ))}
    </g>
  );
};
