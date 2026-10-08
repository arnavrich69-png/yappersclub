// The open call film's camera. World layers (grounds, letters, objects) take the full camera; the
// thread and what hangs on it stay on the grid line and only feel the shakes.

import {inOutCubic, span} from '../utils/easing';
import {HIT, seconds} from './timing';

export type Shake = {dx: number; dy: number; rot: number};
export type Cam = {zoom: number; cx: number; cy: number};

/** The jolt of the yank: a hard knock that rings out in about a third of a second. */
export const shakeAt = (frame: number): Shake => {
  const k = seconds(frame - HIT.yank);
  if (k < 0) return {dx: 0, dy: 0, rot: 0};
  const e = Math.exp(-k * 9);
  return {
    dx: -6 * e * Math.cos(2 * Math.PI * 5.5 * k + 0.3),
    dy: -13 * e * Math.cos(2 * Math.PI * 6.5 * k),
    rot: 0.45 * e * Math.sin(2 * Math.PI * 5 * k + 1),
  };
};

/** Zoom about a point: a slow push into the light once it is on, kicked on तेरी's downbeat. */
export const cameraAt = (frame: number): Cam => {
  let zoom = 1 + 0.035 * span(frame, HIT.light + 4, HIT.teri + 80, inOutCubic);
  const kick = seconds(frame - HIT.teri);
  if (kick >= 0) zoom += 0.012 * Math.exp(-kick * 10);
  return {zoom, cx: 540, cy: 1110};
};

const shakeT = (s: Shake) => `translate(${s.dx.toFixed(2)} ${s.dy.toFixed(2)}) rotate(${s.rot.toFixed(3)} 540 960)`;

export const worldTransform = (cam: Cam, s: Shake) =>
  `${shakeT(s)} translate(${cam.cx} ${cam.cy}) scale(${cam.zoom.toFixed(5)}) translate(${-cam.cx} ${-cam.cy})`;

export const screenTransform = (s: Shake) => shakeT(s);
