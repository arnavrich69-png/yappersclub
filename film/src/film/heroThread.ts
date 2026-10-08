// The thread comes back: it whips in from the right edge along a curve, its leading end stops on
// the left edge, and it snaps straight along the grid height (y = 672) with elastic follow-through,
// strung behind ध्वनि's headline bar. An open loop rides in on it and cinches into the rakhi knot;
// the final tug plucks the thread lightly (a bow that flips side every frame and dies away).

import {THREAD} from '../brand';
import {outCubic, settle, span} from '../utils/easing';
import {add, deg, smoothstep, type V} from '../utils/math';
import {cumulative, lengthOf, line, slice, type Polyline} from '../thread/geometry';
import type {KnotSpec} from '../thread/knot';
import {resampleCount, whip} from '../thread/motion';
import {pluckedSpan} from '../thread/pluck';
import {B} from './timeline';

const Y = THREAD.gridY9x16;
const LEFT = -20;
/** Total cotton in the returning thread; its tail stays off the right edge. */
const LENGTH = 1250;
const N = 100;
const STRAIGHT = resampleCount(line([LEFT, Y], [LEFT + LENGTH, Y], 10), N);

/**
 * Where the leading end flies: in from the right edge along the grid line, riding a wave that dies
 * out towards the left edge where it stops. The thread trails it as a travelling wave, then cracks
 * flat.
 */
const HEAD_PATH: Polyline = Array.from({length: 148}, (_, i): V => {
  const x = 1450 - (i * (1450 - LEFT)) / 147;
  const fade = (x - LEFT) / (1450 - LEFT);
  return [x, Y - 74 * fade * Math.sin((2 * Math.PI * (1450 - x)) / 540)];
});
const HEAD_LEN = lengthOf(HEAD_PATH);

/** Knot position along the thread (cotton from the leading end) and its tied shape. */
export const KNOT_X = 958;
const KNOT_M = KNOT_X - LEFT;
export const HERO_KNOT = (center: V): KnotSpec => ({
  center,
  size: 43,
  width: 15,
  openRadius: 50,
  endA: {heading: deg(104), length: 70},
  endB: {heading: deg(66), length: 70},
});

const headDistance = (t: number) => HEAD_LEN * span(t, B.thread.enter, B.thread.arrive, outCubic);

/** The thread while it flies in: the last stretch of the head's path, leading end first. */
const flying = (t: number) => {
  const d = headDistance(t);
  const pts = [...slice(HEAD_PATH, Math.max(0, d - LENGTH), d)].reverse();
  const c = cumulative(pts);
  return {pts, material: c};
};

const AT_ARRIVAL = (() => {
  const f = flying(B.thread.arrive);
  return resampleCount(f.pts, N);
})();
const AT_ARRIVAL_LEN = lengthOf(AT_ARRIVAL);

/** Light pluck from the knot's final tug. */
const PLUCK_AT = KNOT_M / LENGTH;
const pluckShape = (t: number) =>
  pluckedSpan([LEFT, Y], [LEFT + LENGTH, Y], {at: PLUCK_AT, amount: 13, tau: t - B.lightPluck, pull: 0, f1: 15, decay: 7.5, modes: 1, n: N});

export type HeroState = {points: Polyline; material: number[]; knot: V | null; tie: number};

const knotOn = (pts: Polyline, material: number[]): V | null => {
  for (let i = 1; i < pts.length; i++) {
    if (material[i] >= KNOT_M) {
      const f = (KNOT_M - material[i - 1]) / Math.max(1e-6, material[i] - material[i - 1]);
      const p: V = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
      return add(p, [0, 4]);
    }
  }
  return null;
};

/** Knot tightness: an open loop until the cinch, then a hard pull that overshoots and settles. */
const tie = (t: number) => (t < B.knot.cinch ? 0.12 : 0.12 + 0.88 * settle(t - B.knot.cinch, 2.4, 0.42));

export const heroAt = (t: number): HeroState | null => {
  if (t < B.thread.enter) return null;
  let points: Polyline;
  let material: number[];
  if (t < B.thread.arrive) {
    const f = flying(t);
    points = f.pts;
    material = f.material;
  } else if (t < B.lightPluck) {
    const whipped = whip(AT_ARRIVAL, STRAIGHT, t, {start: B.thread.arrive, lag: 0.1, f: 3.6, zeta: 0.4, n: N});
    // Land exactly on the line by the time the thread is taut.
    const fade = 1 - smoothstep(B.thread.taut - 0.1, B.thread.taut, t);
    points = whipped.map((p, i) => [STRAIGHT[i][0] + (p[0] - STRAIGHT[i][0]) * fade, STRAIGHT[i][1] + (p[1] - STRAIGHT[i][1]) * fade]);
    material = points.map((_, i) => (AT_ARRIVAL_LEN * i) / N);
  } else {
    points = pluckShape(t);
    material = points.map((_, i) => (AT_ARRIVAL_LEN * i) / N);
  }
  return {points, material, knot: knotOn(points, material), tie: tie(t)};
};
