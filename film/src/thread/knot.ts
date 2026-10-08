// The rakhi knot, tied and untied. One continuous thread runs from the tip of end A, round a loop
// and out to the tip of end B. `p` = 0 is a wide open loop, 1 is pulled tight: the loop cinches,
// cotton flows out of the loop into the two ends (total length is kept), the ends cross and open
// into the V, and the tight knot becomes the logo's knot shape. Values a little above 1 give the
// overshoot of a sharp final tug.

import {add, clamp, deg, fromAngle, lerp, smoothstep, type V} from '../utils/math';
import {cumulative, quad, type Polyline} from './geometry';

export type KnotSpec = {
  center: V;
  /** Size of the tight knot (the logo's is about 43 px). */
  size: number;
  /** Width of the thread that makes the knot and its ends. */
  width: number;
  /** Loop radius when fully open. */
  openRadius: number;
  /** The two ends once tied: heading (radians) and length. A swings left, B right, as in the logo. */
  endA: {heading: number; length: number};
  endB: {heading: number; length: number};
};

export type KnotPiece = {
  key: string;
  points: Polyline;
  material: number[];
  /** 'back' pieces go behind whatever the knot is tied around, 'front' pieces in front of it. */
  layer: 'back' | 'front';
  fray: 'none' | 'end';
};

export type KnotShape = {pieces: KnotPiece[]; blob: {center: V; scale: number} | null};

// The loop starts at the lower right, goes up and over the top, and comes down at the lower left.
const LOOP_FROM = deg(50);
const LOOP_TO = deg(130) - 2 * Math.PI;
const LOOP_STEPS = 64;
// The part of the loop above its centre (it passes behind a thread the knot is tied around).
const UPPER_FROM = 50 / 280;
const UPPER_TO = 230 / 280;

export const rakhiKnot = (spec: KnotSpec, p: number): KnotShape => {
  const e = clamp(p, 0, 1.15);
  const tight = (spec.size - spec.width) * 0.24;
  const r = lerp(spec.openRadius, tight, smoothstep(0, 0.8, e));
  const c = spec.center;

  const loop: Polyline = Array.from({length: LOOP_STEPS + 1}, (_, i) => add(c, fromAngle(LOOP_FROM + ((LOOP_TO - LOOP_FROM) * i) / LOOP_STEPS, r)));
  const sweep = Math.abs(LOOP_TO - LOOP_FROM);
  // Cotton taken up by an open loop comes out of the ends.
  const extra = (sweep * r - sweep * tight) / 2;

  const openness = 1 - smoothstep(0.2, 1, e);
  const end = (start: V, heading: number, length: number, bend: number): Polyline => {
    const h = lerp(heading, deg(90), openness * 0.6);
    const len = Math.max(8, length - extra);
    return quad(start, add(start, fromAngle(h - bend, len * 0.5)), add(start, fromAngle(h, len)), 32);
  };
  // A leaves from the loop's lower right towards the left, B from the lower left towards the
  // right, so they cross just under the loop.
  const endA = end(loop[0], spec.endA.heading, spec.endA.length, deg(14));
  const endB = end(loop[LOOP_STEPS], spec.endB.heading, spec.endB.length, -deg(14));

  // Material along the whole thread, measured from the middle of the loop.
  const whole = [...[...endA].reverse(), ...loop.slice(1), ...endB.slice(1)];
  const cum = cumulative(whole);
  const loopStart = endA.length - 1;
  const mid = cum[loopStart] + (sweep * r) / 2;
  const mat = cum.map((s) => s - mid);
  const take = (from: number, to: number) => ({points: whole.slice(from, to + 1), material: mat.slice(from, to + 1)});
  const reversed = (x: {points: Polyline; material: number[]}) => ({points: [...x.points].reverse(), material: [...x.material].reverse()});

  const upFrom = loopStart + Math.floor(LOOP_STEPS * UPPER_FROM);
  const upTo = loopStart + Math.ceil(LOOP_STEPS * UPPER_TO);
  const loopEnd = loopStart + LOOP_STEPS;
  const pieces: KnotPiece[] = [
    {key: 'loop-upper', ...take(upFrom, upTo), layer: 'back', fray: 'none'},
    {key: 'end-a', ...reversed(take(0, loopStart)), layer: 'front', fray: 'end'},
    {key: 'loop-right', ...take(loopStart, upFrom + 1), layer: 'front', fray: 'none'},
    {key: 'loop-left', ...take(upTo - 1, loopEnd), layer: 'front', fray: 'none'},
    {key: 'end-b', ...take(loopEnd, whole.length - 1), layer: 'front', fray: 'end'},
  ];

  const blob = e > 0.8 ? {center: add(c, [0, -2]), scale: lerp(0.78, 1, smoothstep(0.8, 1, e)) * (1 + Math.max(0, e - 1) * 0.6)} : null;
  return {pieces, blob};
};
