// The open call film's camera, one move into the next, never a cut except where a stamp lands.
// World layers (grounds, letters, objects) take the full camera; the thread layer stays on the grid
// line and only feels the knocks. Every zoom is anchored on the grid line or on what the camera is
// looking at, so the thread never leaves y 672.

import {inOutCubic, span} from '../utils/easing';
import {HIT, SCENE, seconds} from './timing';

export type Shake = {dx: number; dy: number; rot: number};
export type Cam = {zoom: number; cx: number; cy: number};

const KNOCKS: {frame: number; size: number}[] = [
  {frame: HIT.fling, size: 0.4},
  {frame: HIT.yank, size: 1},
  {frame: HIT.stamp, size: 1.1},
];

/** Knocks: a hard jolt that rings out in about a third of a second. */
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

/** How far the camera has panned from the dark stage onto the wrapper (frame pixels). */
export const panAt = (frame: number) => 1080 * span(frame, HIT.panStart, HIT.panEnd, inOutCubic);

const kick = (frame: number, at: number, size: number) => {
  const t = seconds(frame - at);
  return t < 0 ? 0 : size * Math.exp(-t * 10);
};

export const cameraAt = (frame: number): Cam => {
  // 1 and 2: a slight push while panning onto the wrapper, then a slow pull back as the tree is drawn.
  if (frame < SCENE.recipe[0]) {
    const push = 0.06 * span(frame, HIT.panStart + 12, HIT.panEnd, inOutCubic);
    const back = 0.06 * span(frame, HIT.panEnd, HIT.draw[3] + 30, inOutCubic);
    return {zoom: 1 + push - back, cx: 540, cy: 672};
  }
  // 3 and 4: the whole packet as the tied imli lands in it, then in close on the ingredients while
  // they are written (anchored on the grid line at the panel's right edge, so the panel stays under
  // the thread), and back out for the headline.
  if (frame < SCENE.silence[0]) {
    const close = span(frame, HIT.rows[0] + 10, HIT.rows[0] + 30, inOutCubic) - span(frame, HIT.rows[4] + 6, HIT.headline + 2, inOutCubic);
    return {zoom: 1 + 0.3 * close, cx: 940, cy: 672};
  }
  // 5 and 6: still for the silence, a slow push into the light once it is on, kicked on तेरी.
  if (frame < SCENE.ritual[0]) {
    return {zoom: 1 + 0.035 * span(frame, HIT.light + 4, HIT.teri + 80, inOutCubic) + kick(frame, HIT.teri, 0.012), cx: 540, cy: 1110};
  }
  // 7: ease back out of the light, a kick on the knot, then the long pull back along the thread.
  if (frame < SCENE.packed[0]) {
    // Still centred on the light while easing out of it; on the thread from the wrist on.
    const inLight = 0.035 * (1 - span(frame, HIT.ritual + 30, HIT.wrist, inOutCubic));
    const out = 0.38 * span(frame, HIT.kul, HIT.kul + 40, inOutCubic);
    return {zoom: 1 + inLight - out + kick(frame, HIT.tie, 0.015), cx: 540, cy: frame < HIT.wrist ? 1110 : 672};
  }
  // 8 and 9: the stamp lands the camera back on the label, square.
  return {zoom: 1, cx: 540, cy: 672};
};

const shakeT = (s: Shake) => `translate(${s.dx.toFixed(2)} ${s.dy.toFixed(2)}) rotate(${s.rot.toFixed(3)} 540 960)`;

export const worldTransform = (cam: Cam, s: Shake) =>
  `${shakeT(s)} translate(${cam.cx} ${cam.cy}) scale(${cam.zoom.toFixed(5)}) translate(${-cam.cx} ${-cam.cy})`;

export const screenTransform = (s: Shake) => shakeT(s);
