// इमली क्यों?'s camera: still in the dark, a pan along the thread out of the dark into the wrapper,
// the long pull back along the thread through the kul, and knocks where things are flung or land.
// The thread layer stays on the grid line and only feels the knocks.

import {type Cam, type Shake} from '../openCall/camera';
import {inOutCubic, span} from '../utils/easing';
import {HIT, seconds} from './timing';

export {screenTransform, worldTransform} from '../openCall/camera';

const KNOCKS = [
  {frame: HIT.flingAway, size: 0.3},
  {frame: HIT.rain, size: 0.35},
  {frame: HIT.fling, size: 0.4},
  {frame: HIT.ritual, size: 0.7},
  {frame: HIT.label, size: 0.9},
];

export const shakeAt = (frame: number): Shake => {
  const s: Shake = {dx: 0, dy: 0, rot: 0};
  for (const k of KNOCKS) {
    const t = seconds(frame - k.frame);
    if (t < 0 || t > 1) continue;
    const e = Math.exp(-t * 9) * k.size;
    s.dx += -6 * e * Math.cos(2 * Math.PI * 5.5 * t + 0.3);
    s.dy += -13 * e * Math.cos(2 * Math.PI * 6.5 * t);
    s.rot += 0.45 * e * Math.sin(2 * Math.PI * 5 * t + 1);
  }
  return s;
};

/** How far the camera has panned from the dark onto the wrapper (frame pixels). */
export const panAt = (frame: number) => 1080 * span(frame, HIT.panStart, HIT.panEnd, inOutCubic);

/** The pull back through the kul: anchored on the first wrist's knot, so the thread stays on its line. */
export const PULL_BACK = {zoom: 0.62, cx: 800, from: HIT.kul + 4, to: HIT.kul + 44};

export const cameraAt = (frame: number): Cam => {
  // 12: the pull back along the thread, wrist after wrist, until the candy lands back on the packet.
  if (frame >= HIT.kul && frame < HIT.ritual) {
    const k = span(frame, PULL_BACK.from, PULL_BACK.to, inOutCubic);
    return {zoom: 1 - (1 - PULL_BACK.zoom) * k, cx: PULL_BACK.cx, cy: 672};
  }
  // 4 and 5: a slight push while panning, eased back before the tree grows (it lives on the thread layer).
  const push = 0.05 * span(frame, HIT.panStart + 10, HIT.panEnd, inOutCubic);
  const back = 0.05 * span(frame, HIT.panEnd, HIT.tree[0] - 6, inOutCubic);
  return {zoom: 1 + push - back, cx: 540, cy: 672};
};
