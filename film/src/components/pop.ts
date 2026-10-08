// The Modak candy bounce: from 55% (never from zero), overshoot, settle, with a stretch on the way
// up and a squash on the way down. Shared by everything that pops in.

import {settle} from '../utils/easing';
import {clamp} from '../utils/math';

const bounce = (k: number) => 0.55 + 0.45 * settle(k, 3.4, 0.32);

/** Horizontal and vertical scale `k` seconds after a pop starts. */
export const candyPop = (k: number) => {
  const s = bounce(k);
  const v = (bounce(k) - bounce(k - 1 / 120)) * 120;
  const stretch = clamp(v / 9, -0.1, 0.1);
  return {sx: s * (1 - stretch * 0.6), sy: s * (1 + stretch)};
};

/** SVG transform for a pop anchored at (px, py), usually the bottom centre of the text. */
export const popTransform = (k: number, px: number, py: number) => {
  const {sx, sy} = candyPop(k);
  return `translate(${px} ${py}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-px} ${-py})`;
};
