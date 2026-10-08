// ध्वनि KUL popping in with a soft candy bounce, piece by piece (ध्व, नि, K, U, L: aksharas are never
// split). The cream fill lands first; the ink outline and the tamarind shadow arrive one frame later.
// Drawn as three stacked layers (all shadows, all outlines, all fills) so overlapping pieces join
// exactly like the designer's single outline.

import React from 'react';
import {C} from '../brand';
import {popTransform} from '../components/pop';
import {WORDMARK, type WordmarkPiece} from './lockup';

const popFor = (piece: WordmarkPiece, k: number) => popTransform(k, (piece.box[0] + piece.box[2]) / 2, piece.box[3]);

export type PopTimes = Record<string, number>;

export const Wordmark: React.FC<{t: number; starts: PopTimes; fps: number}> = ({t, starts, fps}) => {
  const lag = 1 / fps;
  const visible = WORDMARK.filter((p) => t >= starts[p.key]);
  const dressed = WORDMARK.filter((p) => t >= starts[p.key] + lag - 1e-6);
  const tf = (p: WordmarkPiece) => popFor(p, t - starts[p.key]);
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
