// The one thread of the open call film. It lives on the grid line (y 672) in screen space, so every
// frame lines up with the profile grid. Anything that weighs on it or pulls it (a finger, a caught
// pod, a tag) bends it between two anchors off the frame; every string the score plays makes it
// ring: a crisp flip from side to side each frame (15 Hz at 30 fps), never blurred, dying away.
// Notes ring from the point they are played: higher notes further right, as if stopping a string.

import {THREAD} from '../brand';
import type {V} from '../utils/math';
import {HITS, SILENCES, type Hit} from './score';
import {HIT, STILL, seconds} from './timing';

export const THREAD_Y = THREAD.gridY9x16;
export const THREAD_WIDTH = THREAD.thickness.story9x16;
export const LEFT = -20;
export const RIGHT = 1100;
/** Off-frame anchors the thread hangs between when something bends it. */
const ANCHOR_L = -420;
const ANCHOR_R = 1500;
const N = 140;

/** x where a note is plucked. Sa is the middle of the frame. */
export const pluckX = (semitones: number) => 540 + semitones * 30;

const RING: Partial<Record<Hit['kind'], {amp: number; decay: number}>> = {
  note: {amp: 13, decay: 0.35},
  glide: {amp: 7, decay: 0.6},
  drone: {amp: 3.2, decay: 0.3},
  muted: {amp: 2, decay: 0.06},
};

/** Moments that shake the whole thread: the yank, the fling of the imli, the stamp. */
const TWANGS: {frame: number; amp: number; decay: number}[] = [
  {frame: HIT.fling, amp: 22, decay: 0.22},
  {frame: HIT.yank, amp: 30, decay: 0.18},
  {frame: HIT.stamp, amp: 20, decay: 0.2},
];

const silencedBefore = (frame: number) => {
  let cut = -Infinity;
  for (const [a] of SILENCES) if (a <= frame) cut = Math.max(cut, a);
  return cut;
};

const flip = (age: number) => (age % 2 === 0 ? 1 : -1);

/** Ringing displacement at x on `frame` (pixels, down positive). */
export const ringAt = (frame: number, x: number) => {
  if (STILL.some(([a, b]) => frame >= a && frame < b)) return 0;
  const u = (x - LEFT) / (RIGHT - LEFT);
  const cut = silencedBefore(frame);
  let y = 0;
  for (const h of HITS) {
    if (h.frame > frame) break;
    if (h.frame < cut) continue;
    const spec = RING[h.kind];
    if (!spec) continue;
    const age = frame - h.frame;
    const tau = seconds(age);
    if (tau > spec.decay * 7) continue;
    let shape = Math.sin(Math.PI * u);
    if (h.kind === 'note') {
      const u0 = (pluckX(h.semitones ?? 0) - LEFT) / (RIGHT - LEFT);
      shape = u < u0 ? u / u0 : (1 - u) / (1 - u0);
    }
    y += spec.amp * (h.vel ?? 0.7) * shape * flip(age) * Math.exp(-tau / spec.decay);
  }
  for (const tw of TWANGS) {
    const age = frame - tw.frame;
    if (age >= 0) y += tw.amp * Math.sin(Math.PI * u) * flip(age) * Math.exp(-seconds(age) / tw.decay);
  }
  return y;
};

/** Points the thread is pulled to: x and how far below the grid line, joined by straight runs. */
export type Bend = [number, number][];

/** A single weight hanging on the thread (a tag's loop). */
export type Weight = {x: number; depth: number};
export const bendOf = (w: Weight | null): Bend => (w && w.depth !== 0 ? [[w.x, w.depth]] : []);

const sagAt = (x: number, bend: Bend) => {
  if (bend.length === 0) return 0;
  const pts: Bend = [[ANCHOR_L, 0], ...[...bend].sort((a, b) => a[0] - b[0]), [ANCHOR_R, 0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, d0] = pts[i];
    const [x1, d1] = pts[i + 1];
    if (x >= x0 && x <= x1) return x1 === x0 ? d1 : d0 + ((d1 - d0) * (x - x0)) / (x1 - x0);
  }
  return 0;
};

/** Height of the thread at x, without ringing (what a loop hanging on it feels). */
export const restYAt = (x: number, bend: Bend) => THREAD_Y + sagAt(x, bend);

/** The thread across the frame on `frame`: on the grid line, bent and ringing. */
export const threadPoints = (frame: number, bend: Bend, from = LEFT, to = RIGHT): V[] => {
  const xs: number[] = [];
  for (let i = 0; i <= N; i++) {
    const x = LEFT + ((RIGHT - LEFT) * i) / N;
    if (x > from && x < to) xs.push(x);
  }
  xs.push(from, to);
  for (const [x] of bend) if (x > from && x < to) xs.push(x);
  xs.sort((a, b) => a - b);
  return xs.map((x) => [x, restYAt(x, bend) + ringAt(frame, x)]);
};
