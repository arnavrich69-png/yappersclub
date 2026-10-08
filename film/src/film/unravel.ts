// The knots slip and each thread is pulled off its wrapper end: the free end is yanked away along a
// whip path and the rest of the cotton follows it out through the wraps, like string pulled from a
// spool. The thread is one continuous piece of cotton laid along
//   [the path the free end has travelled] + [its own channel: free end, knot, the three wraps
//   (front turns visible, back turns hidden behind the neck), the other end]
// and slides along it as the free end travels (thread/motion.ts slideAlong, generalised).

import {cubicPoints} from '../utils/curves';
import {add, applyPose, mul, norm, sub, type Pose, type V} from '../utils/math';
import {lengthOf, line, quad, slice, type Polyline} from '../thread/geometry';
import {screenMatchedTwist} from '../thread/look';
import {MARK, type Side} from '../wrapper/mark';
import {endTwist} from '../wrapper/TiedImli';
import {candyPose, endA, endB, knotWorld, MARK_TO_WORLD} from '../proofs/pluckScene';
import {B, PLUCK_OFFSET} from './timeline';

/**
 * A stretch of the channel. The wraps look thick because the cotton is bunched round the neck; off
 * the neck the same cotton is a single thin strand, so width and twist belong to the place, not to
 * the cotton.
 */
type ChannelSeg = {pts: Polyline; visible: boolean; wrap: boolean; width: number; twist: number};

export type Unravel = {
  side: Side;
  start: number;
  channel: ChannelSeg[];
  head: Polyline;
  /** Width and twist of the strand once it is off the neck. */
  strand: {width: number; twist: number};
  total: number;
};

export type UnravelPiece = {
  key: string;
  points: Polyline;
  material: number[];
  width: number;
  twist: number;
  fray: 'start' | 'end' | 'none';
  flying: boolean;
};

const WRAP_TWIST = screenMatchedTwist(87);
const toWorld = (p: V, pose: Pose) => applyPose(add(p, MARK_TO_WORLD), pose);

/** Free end yanked along this speed profile: eases up to `speed` px/s with time constant `ramp`. */
const SPEED = 5200;
const RAMP = 0.05;
export const travelled = (tau: number) => (tau <= 0 ? 0 : SPEED * (tau - RAMP * (1 - Math.exp(-tau / RAMP))));

const build = (side: Side): Unravel => {
  const start = B.slip[side];
  const pose = candyPose(start - PLUCK_OFFSET);
  const ends = MARK.ends[side];
  const w = (p: V) => toWorld(p, pose);
  // The outer end (the one nearest the frame edge) leads; the inner end comes last.
  const outerKey = side === 'right' ? 'b' : 'a';
  const innerKey = side === 'right' ? 'a' : 'b';
  let outer: Polyline;
  let inner: Polyline;
  let knot: V;
  if (side === 'right') {
    // The plucked side: take the ends exactly where the pluck left them.
    outer = endB(start - PLUCK_OFFSET).points;
    inner = endA(start - PLUCK_OFFSET).points;
    knot = knotWorld(start - PLUCK_OFFSET);
  } else {
    outer = quad(w(ends.knot), w(ends.a.ctrl), w(ends.a.tip), 40);
    inner = quad(w(ends.knot), w(ends.b.ctrl), w(ends.b.tip), 40);
    knot = w(ends.knot);
  }
  const strokes = MARK.wraps[side].map(([top, bottom]) => [w(top), w(bottom)] as [V, V]);
  const kc = w([MARK.knots[side].rim.x + MARK.knots[side].rim.w / 2, MARK.knots[side].rim.y + MARK.knots[side].rim.h / 2]);

  const strand = {width: ends[outerKey].width, twist: endTwist(side, outerKey)};
  const off = (pts: Polyline, visible: boolean): ChannelSeg => ({pts, visible, wrap: false, ...strand});
  const channel: ChannelSeg[] = [off([...outer].reverse(), true), off(line(knot, kc, 4), true), off(line(kc, strokes[0][1], 6), false)];
  strokes.forEach(([top, bottom], i) => {
    channel.push({pts: line(bottom, top, 40), visible: true, wrap: true, width: MARK.wraps.width, twist: WRAP_TWIST});
    const next = i < strokes.length - 1 ? strokes[i + 1][1] : kc;
    channel.push(off(line(top, next, 40), false));
  });
  channel.push(off(line(kc, knot, 4), false));
  channel.push({pts: inner, visible: true, wrap: false, width: ends[innerKey].width, twist: endTwist(side, innerKey)});
  const total = channel.reduce((acc, c) => acc + lengthOf(c.pts), 0);

  // The free end is yanked away: it carries on the way it was hanging, then sweeps out of its side
  // of the frame, so the thread draws one smooth J instead of kinking.
  const tip = outer[outer.length - 1];
  const tangent = norm(sub(tip, outer[outer.length - 4]));
  const dir = side === 'right' ? 1 : -1;
  const exit: V = [540 + dir * 960, 900];
  const head = [
    ...cubicPoints(tip, add(tip, mul(tangent, 150)), [540 + dir * 620, 1290], exit, 48),
    ...line(exit, [540 + dir * 3200, 420], 40).slice(1),
  ];
  return {side, start, channel, head, strand, total};
};

export const UNRAVEL: Record<Side, Unravel> = {left: build('left'), right: build('right')};

/** Thread pieces to draw at time t. Before the slip only the wraps are drawn (the ends are drawn elsewhere). */
export const unravelPieces = (u: Unravel, t: number, wrapsOnly: boolean): UnravelPiece[] => {
  const D = travelled(t - u.start);
  type Seg = ChannelSeg & {s0: number; s1: number; flying: boolean};
  const segs: Seg[] = [];
  let s = 0;
  const push = (seg: ChannelSeg, flying: boolean) => {
    const len = lengthOf(seg.pts);
    segs.push({...seg, flying, s0: s, s1: s + len});
    s += len;
  };
  if (D > 0.5) push({pts: [...slice(u.head, 0, D)].reverse(), visible: true, wrap: false, ...u.strand}, true);
  u.channel.forEach((c) => push(c, false));

  // The cotton fills the first `total` of this path, starting at the free end.
  const pieces: UnravelPiece[] = [];
  segs.forEach((seg, si) => {
    if (!seg.visible || (wrapsOnly && !seg.wrap)) return;
    const a = seg.s0;
    const b = Math.min(seg.s1, u.total);
    if (b - a < 0.75) return;
    const pts = slice(seg.pts, 0, b - a);
    const material = pts.map((_, i) => a + ((b - a) * i) / Math.max(1, pts.length - 1));
    const fray = a <= 0.5 ? 'start' : b >= u.total - 0.5 ? 'end' : 'none';
    pieces.push({key: `${u.side}-${si}`, points: pts, material, width: seg.width, twist: seg.twist, fray, flying: seg.flying});
  });
  return pieces;
};

/** The knot blob is part of the thread: it slips the moment the thread starts to slide. */
export const knotHeld = (u: Unravel, t: number) => t < u.start + 0.034;
