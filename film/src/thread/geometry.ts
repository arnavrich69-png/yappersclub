// Polyline geometry for the thread: building paths, measuring them, and looking up a position,
// direction and normal at any distance along them.

import {add, dist, lerpV, mul, norm, perp, sub, type V} from '../utils/math';

export type Polyline = V[];

export const line = (a: V, b: V, n = 24): Polyline => Array.from({length: n + 1}, (_, i) => lerpV(a, b, i / n));

export const quad = (a: V, c: V, b: V, n = 32): Polyline =>
  Array.from({length: n + 1}, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  });

/** Centripetal-ish Catmull-Rom through the given points (endpoints are repeated). */
export const catmull = (pts: Polyline, perSegment = 12): Polyline => {
  if (pts.length < 3) return pts.length === 2 ? line(pts[0], pts[1], perSegment) : pts.slice();
  const out: Polyline = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < perSegment; j++) {
      const t = j / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

/** A path drawn by turning: start point, start heading (radians), and heading as a function of arc length. */
export const steer = (start: V, length: number, heading: (s: number) => number, n = 48): Polyline => {
  const out: Polyline = [start];
  let p = start;
  const ds = length / n;
  for (let i = 0; i < n; i++) {
    const h = heading((i + 0.5) * ds);
    p = [p[0] + Math.cos(h) * ds, p[1] + Math.sin(h) * ds];
    out.push(p);
  }
  return out;
};

export const cumulative = (pts: Polyline): number[] => {
  const c = [0];
  for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + dist(pts[i - 1], pts[i]));
  return c;
};

export const lengthOf = (pts: Polyline) => {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += dist(pts[i - 1], pts[i]);
  return l;
};

/** Re-sample a polyline at (close to) even spacing. Keeps both ends exactly. */
export const resample = (pts: Polyline, spacing: number): Polyline => {
  const c = cumulative(pts);
  const total = c[c.length - 1];
  if (total < 1e-6) return [pts[0], pts[0]];
  const n = Math.max(2, Math.ceil(total / spacing));
  const out: Polyline = [];
  let j = 0;
  for (let i = 0; i <= n; i++) {
    const s = (total * i) / n;
    while (j < c.length - 2 && c[j + 1] < s) j++;
    const segLen = c[j + 1] - c[j];
    const f = segLen > 1e-9 ? (s - c[j]) / segLen : 0;
    out.push(lerpV(pts[j], pts[j + 1], f));
  }
  return out;
};

/** Smoothed unit tangents at every vertex (central differences). */
export const tangents = (pts: Polyline): V[] =>
  pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    return norm(sub(b, a));
  });

/** Portion of a polyline between two arc lengths. */
export const slice = (pts: Polyline, s0: number, s1: number): Polyline => {
  const c = cumulative(pts);
  const at = (s: number): V => {
    let j = 0;
    while (j < c.length - 2 && c[j + 1] < s) j++;
    const segLen = c[j + 1] - c[j];
    const f = segLen > 1e-9 ? (s - c[j]) / segLen : 0;
    return lerpV(pts[j], pts[j + 1], Math.min(1, Math.max(0, f)));
  };
  const a = Math.max(0, Math.min(s0, s1));
  const b = Math.min(c[c.length - 1], Math.max(s0, s1));
  const out: Polyline = [at(a)];
  for (let i = 0; i < pts.length; i++) if (c[i] > a && c[i] < b) out.push(pts[i]);
  out.push(at(b));
  return out;
};

/**
 * A frame along a polyline indexed by "material" coordinate: given each vertex's material value
 * (monotonic), find the point and unit normal for any material value. Values outside the range are
 * extrapolated straight along the end tangents (used for round caps).
 */
export const materialFrame = (pts: Polyline, mat: number[]) => {
  const tan = tangents(pts);
  const n = pts.length;
  return (m: number): {p: V; nrm: V} => {
    if (m <= mat[0]) {
      const t = tan[0];
      return {p: add(pts[0], mul(t, m - mat[0])), nrm: perp(t)};
    }
    if (m >= mat[n - 1]) {
      const t = tan[n - 1];
      return {p: add(pts[n - 1], mul(t, m - mat[n - 1])), nrm: perp(t)};
    }
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (mat[mid] <= m) lo = mid;
      else hi = mid;
    }
    const span = mat[hi] - mat[lo];
    const f = span > 1e-9 ? (m - mat[lo]) / span : 0;
    const t = norm(lerpV(tan[lo], tan[hi], f));
    return {p: lerpV(pts[lo], pts[hi], f), nrm: perp(t)};
  };
};

export const toPathD = (pts: Polyline) => {
  if (pts.length === 0) return '';
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) d += `L${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
  return d;
};

export const bounds = (pts: Polyline, pad = 0) => {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return {x: x0 - pad, y: y0 - pad, width: x1 - x0 + 2 * pad, height: y1 - y0 + 2 * pad};
};
