// The one thread of the open call film. It lives on the grid line (y 672) in screen space, so every
// frame lines up with the profile grid; a weight on it (the tag) makes it sag into a V, and every
// string the score plays makes it ring: a crisp flip from side to side each frame (15 Hz at 30 fps),
// never blurred, dying away. Notes ring from the point they are played: higher notes further right,
// as if a finger were stopping the string.

import {THREAD} from '../brand';
import type {V} from '../utils/math';
import {HITS, SILENCES, type Hit} from './score';
import {HIT, seconds} from './timing';

export const THREAD_Y = THREAD.gridY9x16;
export const THREAD_WIDTH = THREAD.thickness.story9x16;
const LEFT = -20;
const RIGHT = 1100;
/** Off-frame anchors the thread hangs between when something weighs on it. */
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

/** The yank: the slack thread snapped taut rings hard across its whole length. */
const YANK = {amp: 30, decay: 0.18};

const silencedBefore = (frame: number) => {
  let cut = -Infinity;
  for (const [a] of SILENCES) if (a <= frame) cut = Math.max(cut, a);
  return cut;
};

/** Ringing displacement at x on `frame` (pixels, down positive). */
export const ringAt = (frame: number, x: number) => {
  const u = (x - LEFT) / (RIGHT - LEFT);
  const cut = silencedBefore(frame);
  const flip = (age: number) => (age % 2 === 0 ? 1 : -1);
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
  const yankAge = frame - HIT.yank;
  if (yankAge >= 0) y += YANK.amp * Math.sin(Math.PI * u) * flip(yankAge) * Math.exp(-seconds(yankAge) / YANK.decay);
  return y;
};

/** A weight hanging on the thread at x, pulling it down into a V of the given depth. */
export type Weight = {x: number; depth: number};

const sagAt = (x: number, w: Weight | null) => {
  if (!w || w.depth === 0) return 0;
  return x < w.x ? (w.depth * (x - ANCHOR_L)) / (w.x - ANCHOR_L) : (w.depth * (ANCHOR_R - x)) / (ANCHOR_R - w.x);
};

/** Height of the thread at x, without ringing (what the tag's loop feels). */
export const restYAt = (x: number, w: Weight | null) => THREAD_Y + sagAt(x, w);

/** The thread's points on `frame`: across the frame at the grid line, sagging and ringing. */
export const threadPoints = (frame: number, w: Weight | null): V[] => {
  const xs: number[] = [];
  for (let i = 0; i <= N; i++) xs.push(LEFT + ((RIGHT - LEFT) * i) / N);
  if (w && w.depth !== 0 && w.x > LEFT && w.x < RIGHT) {
    xs.push(w.x);
    xs.sort((a, b) => a - b);
  }
  return xs.map((x) => [x, restYAt(x, w) + ringAt(frame, x)]);
};
