// Bezier sampling shared by film geometry.

import type {V} from './math';

export const cubicPoints = (a: V, c0: V, c1: V, b: V, n = 32): V[] =>
  Array.from({length: n + 1}, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [
      u * u * u * a[0] + 3 * u * u * t * c0[0] + 3 * u * t * t * c1[0] + t * t * t * b[0],
      u * u * u * a[1] + 3 * u * u * t * c0[1] + 3 * u * t * t * c1[1] + t * t * t * b[1],
    ];
  });
