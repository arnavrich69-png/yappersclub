// The blank SUNG BY tag: where its loop sits on the thread and how it swings. It appears three times:
// hanging in the dark at the start, sliding in during the silence (and out again when the ritual
// begins), and sliding in once more for the call to action. Each swing is a real pendulum driven by
// its pivot and nudged by the strings, integrated from the moment it appears, so every frame is the
// same on every render.

import {clamp} from '../utils/math';
import {HITS} from './score';
import {HIT, SCENE} from './timing';
import {THREAD_Y, type Weight} from './thread';

// A tag on a loop this short swings at about 1.6 Hz and settles in a couple of swings.
const OMEGA = 2 * Math.PI * 1.6;
const ZETA = 0.2;
const LENGTH = 150;
const G = OMEGA * OMEGA * LENGTH;
const REST_X = 190;
const OFF_X = -170;
/** How far the tag pulls the thread down while it hangs slack, and once the thread is taut. */
const SAG = {slack: 16, taut: 3};

const outQuad = (x: number) => 1 - (1 - x) * (1 - x);
const inQuad = (x: number) => x * x;
const slide = (f: number, start: number, frames: number, from: number, to: number, ease = outQuad) =>
  from + (to - from) * ease(clamp((f - start) / frames));

type Episode = {start: number; end: number; arrive: number; weight: (f: number) => Weight};

const EPISODES: Episode[] = [
  // Hanging in the dark from the first frame, until the camera has panned away from it.
  {start: SCENE.question[0], end: HIT.panEnd, arrive: 0.07, weight: () => ({x: REST_X, depth: SAG.taut})},
  // Slides in during the silence, is jolted by the yank, slides off as the ritual begins.
  {
    start: HIT.silence,
    end: HIT.tagOut + 20,
    arrive: 0.12,
    weight: (f) => {
      let x = slide(f, HIT.silence, 20, OFF_X, REST_X);
      const k = f - HIT.yank;
      if (k > 0) x -= 22 * (k < 2 ? k / 2 : Math.max(0, 1 - (k - 2) / 6) ** 2);
      x = slide(f, HIT.tagOut, 18, x, OFF_X - 60, inQuad);
      const snap = clamp((f - HIT.yank) / 2);
      return {x, depth: SAG.slack + (SAG.taut - SAG.slack) * snap * snap * (3 - 2 * snap)};
    },
  },
  // Back for the call to action, on the finished label.
  {start: HIT.tagBack, end: SCENE.dm[1], arrive: 0.12, weight: (f) => ({x: slide(f, HIT.tagBack, 20, OFF_X, REST_X), depth: SAG.taut})},
];

const episodeAt = (frame: number) => EPISODES.find((e) => frame >= e.start && frame < e.end) ?? null;

/** Where the tag's loop sits on the thread on `frame`, or null when it is not in the film. */
export const tagWeight = (frame: number): Weight | null => episodeAt(frame)?.weight(frame) ?? null;

/** Angle of the tag (degrees, clockwise positive, 0 hanging straight down) on `frame`, or null. */
export const tagAngle = (frame: number): number | null => {
  const ep = episodeAt(frame);
  if (!ep) return null;
  const sub = 12;
  const dt = 1 / (30 * sub);
  const pivot = (f: number): [number, number] => {
    const w = ep.weight(f);
    return [w.x, THREAD_Y + w.depth];
  };
  let theta = ep.arrive;
  let omega = 0;
  const kicks = HITS.filter((h) => h.frame > ep.start && h.frame <= frame && (h.kind === 'note' || h.kind === 'drone'));
  let next = 0;
  for (let i = 0; i < (frame - ep.start) * sub; i++) {
    const f = ep.start + i / sub;
    const p0 = pivot(f - 1 / sub);
    const p1 = pivot(f);
    const p2 = pivot(f + 1 / sub);
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
