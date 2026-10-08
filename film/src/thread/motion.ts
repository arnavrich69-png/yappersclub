// Ways a thread travels: sliding along a path, trailing behind a moving end (a whip), and
// snapping from one shape to another with elastic follow-through.

import {settle} from '../utils/easing';
import {add, dist, fromAngle, lerpV, type V} from '../utils/math';
import {cumulative, resample, slice, type Polyline} from './geometry';

/**
 * A length of thread lying along a guide path with its leading end at arc length `head`.
 * Material is attached to the cotton, so the strands travel with it as it slides.
 */
export const slideAlong = (guide: Polyline, head: number, length: number): {points: Polyline; material: number[]} => {
  const points = slice(guide, head - length, head);
  const c = cumulative(points);
  const start = Math.max(0, head - length);
  return {points, material: c.map((s) => start + s - head)};
};

/**
 * The thread follows the path its leading end has travelled, like a whip or a snake.
 * `head(t)` is where the leading end is at time t. Before the head started moving the thread
 * continues straight back along `tailHeading`.
 */
export const trail = (head: (t: number) => V, t: number, length: number, tailHeading: number, step = 1 / 480): Polyline => {
  const pts: Polyline = [head(t)];
  let acc = 0;
  let time = t;
  for (let i = 0; i < 20000 && acc < length; i++) {
    time -= step;
    const p = head(time);
    const d = dist(p, pts[pts.length - 1]);
    if (d < 0.25) {
      if (time < t - 10) break;
      continue;
    }
    acc += d;
    pts.push(p);
  }
  if (acc < length) {
    const last = pts[pts.length - 1];
    pts.push(add(last, fromAngle(tailHeading, length - acc)));
  }
  return resample(pts, 4);
};

/**
 * Snap from one shape to another. The leading end goes first, each point further along starts
 * `lag` seconds later (in total), and every point overshoots and settles like stretched cotton.
 */
export const whip = (
  from: Polyline,
  to: Polyline,
  t: number,
  opts: {start: number; lag: number; f: number; zeta: number; lead?: 'start' | 'end'; n?: number},
): Polyline => {
  const n = opts.n ?? 80;
  const a = resampleCount(from, n);
  const b = resampleCount(to, n);
  return a.map((p, i) => {
    const u = i / n;
    const fromLead = opts.lead === 'end' ? 1 - u : u;
    const k = settle(t - opts.start - opts.lag * fromLead, opts.f, opts.zeta);
    return lerpV(p, b[i], t - opts.start - opts.lag * fromLead <= 0 ? 0 : k);
  });
};

/** Resample to exactly n segments (n + 1 points). */
export const resampleCount = (pts: Polyline, n: number): Polyline => {
  const c = cumulative(pts);
  const total = c[c.length - 1];
  const out: Polyline = [];
  let j = 0;
  for (let i = 0; i <= n; i++) {
    const s = (total * i) / n;
    while (j < c.length - 2 && c[j + 1] < s) j++;
    const seg = c[j + 1] - c[j];
    out.push(lerpV(pts[j], pts[j + 1], seg > 1e-9 ? (s - c[j]) / seg : 0));
  }
  return out;
};
