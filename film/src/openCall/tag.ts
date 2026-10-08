// The blank SUNG BY tag: where its loop sits on the thread and how it swings. The swing is a real
// pendulum driven by its pivot (sliding in, the thread's snap) and nudged by the strings, integrated
// from the moment the tag arrives, so every frame is the same on every render.

import {clamp} from '../utils/math';
import {HITS} from './score';
import {HIT} from './timing';
import {THREAD_Y, type Weight} from './thread';

/** The tag slides in along the thread during the silence and stops near the left edge. */
const SLIDE = {start: HIT.silence, frames: 20, from: -170, to: 190};
/** How far the tag pulls the thread down while it hangs slack, and once the thread is taut. */
const SAG = {slack: 16, taut: 3};
// A tag on a loop this short swings at about 1.6 Hz and settles in a couple of swings.
const OMEGA = 2 * Math.PI * 1.6;
const ZETA = 0.2;
const LENGTH = 150;
const G = OMEGA * OMEGA * LENGTH;
/** Swing it arrives with, radians (positive: the tag trails to the left). */
const ARRIVE_ANGLE = 0.12;

const outQuad = (x: number) => 1 - (1 - x) * (1 - x);

/** Where the loop sits along the thread (x) and how far it pulls the thread down, at time t (frames). */
export const tagWeight = (f: number): Weight => {
  const s = clamp((f - SLIDE.start) / SLIDE.frames);
  let x = SLIDE.from + (SLIDE.to - SLIDE.from) * outQuad(s);
  // The yank tugs the thread, and the loop with it, to the left for a moment.
  const k = f - HIT.yank;
  if (k > 0) x -= 22 * (k < 2 ? k / 2 : Math.max(0, 1 - (k - 2) / 6) ** 2);
  // Slack while it hangs in the silence; the yank snaps it nearly straight over two frames.
  const snap = clamp((f - HIT.yank) / 2);
  const depth = SAG.slack + (SAG.taut - SAG.slack) * snap * snap * (3 - 2 * snap);
  return {x, depth};
};

const pivotAt = (f: number): [number, number] => {
  const w = tagWeight(f);
  return [w.x, THREAD_Y + w.depth];
};

/** Angle of the tag (degrees, clockwise positive, 0 hanging straight down) on `frame`, or null before it arrives. */
export const tagAngle = (frame: number): number | null => {
  if (frame < SLIDE.start) return null;
  const sub = 12;
  const dt = 1 / (30 * sub);
  let theta = ARRIVE_ANGLE;
  let omega = 0;
  const kicks = HITS.filter((h) => h.frame > SLIDE.start && h.frame <= frame && (h.kind === 'note' || h.kind === 'drone'));
  let next = 0;
  for (let i = 0; i < (frame - SLIDE.start) * sub; i++) {
    const f = SLIDE.start + i / sub;
    // Pivot acceleration from its path, by finite differences.
    const p0 = pivotAt(f - 1 / sub);
    const p1 = pivotAt(f);
    const p2 = pivotAt(f + 1 / sub);
    const ax = (p2[0] - 2 * p1[0] + p0[0]) / (dt * dt);
    const ay = (p2[1] - 2 * p1[1] + p0[1]) / (dt * dt);
    const alpha = (-Math.sin(theta) * (G - ay) + Math.cos(theta) * ax) / LENGTH - 2 * ZETA * OMEGA * omega;
    omega += alpha * dt;
    theta += omega * dt;
    while (next < kicks.length && kicks[next].frame <= f) {
      omega += (kicks[next].kind === 'note' ? 0.22 : 0.1) * (kicks[next].vel ?? 0.7);
      next++;
    }
  }
  return (theta * 180) / Math.PI;
};

/** The caret on the blank name line blinks: on for 10 frames, off for 10. */
export const caretOn = (frame: number) => Math.floor(frame / 10) % 2 === 0;

