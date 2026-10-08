// Tansen's tree lifted out of the thread, shared by every film that grows it. The thread is never
// cut: it climbs both trunk sides at once, a stop per note, and the rest of the outline between the
// two climbing points is a low leafy crown that rounds out as they climb. See parts/tree.ts.

import {cumulative, slice} from '../../thread/geometry';
import {inOutCubic, outCubic, settle, span} from '../../utils/easing';
import {add, clamp, dist, lerp, mul, norm, perp, sub, type V} from '../../utils/math';
import {seconds} from '../timing';
import {TREE_HALVES, TREE_LOOP, TREE_STOPS} from './tree';

/**
 * How far the thread has been lifted into the tree on `frame`: 0 flat on the line, 1 trunk and
 * branches, 2 the lower canopy, 3 the upper canopy, 4 the outline closed at the top. Each note in
 * `notes` snaps it up to the next stop with a little overshoot, like a string; the last closes it
 * exactly. Over `letGo` (frames) the tree is let go back down into the line.
 */
export const liftAt = (frame: number, notes: readonly number[], letGo: readonly [number, number]) => {
  let q = 0;
  for (let i = 0; i < notes.length; i++) {
    if (frame < notes[i]) break;
    const t = seconds(frame - notes[i]);
    q = i + (i === notes.length - 1 ? outCubic(clamp(t / 0.3)) : settle(t, 3.2, 0.55));
  }
  return q * (1 - span(frame, letGo[0], letGo[1], inOutCubic));
};

/** Arc length up one half of the tree for a lift q, moving evenly between the stops. */
const climb = (stops: number[], q: number) => {
  const i = Math.min(stops.length - 2, Math.max(0, Math.floor(q)));
  return Math.min(stops[stops.length - 1], lerp(stops[i], stops[i + 1], q - i));
};

const LOOP_LEN = cumulative(TREE_LOOP)[TREE_LOOP.length - 1];

/** How much of its height the crown above the climbing points has: flat on the line at first, then a low dome, the whole crown at the top. */
const domeAt = (q: number) => (q <= 1 ? 0.45 * q : q <= 3 ? 0.45 : 0.45 + 0.55 * (q - 3));

export type TreeShape = {left: V[]; crown: V[]; right: V[]};

/**
 * The tree as lifted so far: each half from its trunk base up to its climbing point, and the crown:
 * the rest of the outline between the two climbing points, pressed down towards them into a low
 * leafy dome (and, while the trunk is still rising, drawn in over it). So at every stop it is a tree,
 * a little taller and rounder on each note. `place` moves the whole tree (frame coordinates).
 */
export const treeShape = (q: number, place?: (p: V) => V): TreeShape => {
  const sL = climb(TREE_STOPS.left, q);
  const sR = climb(TREE_STOPS.right, q);
  const left = slice(TREE_HALVES.left, 0, sL);
  const right = slice(TREE_HALVES.right, 0, sR);
  const a = left[left.length - 1];
  const ab = sub(right[right.length - 1], a);
  const len2 = ab[0] * ab[0] + ab[1] * ab[1];
  const f = domeAt(q);
  const reach = clamp(q);
  const crown = slice(TREE_LOOP, sL, LOOP_LEN - sR).map((p): V => {
    const t = len2 > 0 ? ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / len2 : 0;
    const out = t < 0 ? t * reach : t > 1 ? 1 + (t - 1) * reach : t;
    const foot = add(a, mul(ab, t));
    return add(add(a, mul(ab, out)), mul(sub(p, foot), f));
  });
  return place ? {left: left.map(place), crown: crown.map(place), right: right.map(place)} : {left, crown, right};
};

/** The crown rings on every note that lifts it, like a plucked string between the two climbing points. */
export const ringCrown = (frame: number, crown: V[], notes: readonly number[]): V[] => {
  const a = crown[0];
  const b = crown[crown.length - 1];
  const len = dist(a, b);
  if (len < 2) return crown;
  const across = norm(perp(sub(b, a)));
  let ring = 0;
  for (const at of notes) {
    const age = frame - at;
    if (age >= 0) ring += 12 * (age % 2 === 0 ? 1 : -1) * Math.exp(-seconds(age) / 0.35);
  }
  ring *= Math.min(1, len / 300);
  return crown.map((p, i) => add(p, mul(across, ring * Math.sin((Math.PI * i) / (crown.length - 1)))));
};
