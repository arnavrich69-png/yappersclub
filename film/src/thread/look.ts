// The kalava look, lifted from svg-parts/thread-straight-with-knot.svg and logo/dhwanikul-mark.svg.
// The designer draws it as: a dark rim stroke (#74130C, full width), a twisted pattern stroke at
// 84% of the width (red with yellow, dark and light strands, 30 px tile turned 32 degrees), a
// "tw-round" lighting filter for the soft roundness, and a tamarind brown print shadow.
//
// The svg files place that pattern in screen space, which is perfect for a still thread. A moving
// thread needs the strands to travel with the cotton, so here the same tile is laid out along the
// thread itself. On a horizontal thread the result is identical to the posters.

import {deg, type V} from '../utils/math';
import {THREAD} from '../brand';
import type {Polyline} from './geometry';
import {materialFrame} from './geometry';

export const TILE = THREAD.tilePx;
export const PATTERN_WIDTH_RATIO = 0.84;
export const RIM = '#74130C';
export const BASE = '#B8231A';

/** Strands inside one 30 px tile: [from, to] across the tile, colour and opacity (exact svg values). */
const STRANDS: {a: number; b: number; fill: string; opacity: number}[] = [
  {a: 0.0, b: 3.2, fill: '#F2B21E', opacity: 1},
  {a: 3.2, b: 4.4, fill: '#74130C', opacity: 0.6},
  {a: 8.0, b: 10.6, fill: '#D23A26', opacity: 0.9},
  {a: 11.0, b: 12.0, fill: '#74130C', opacity: 0.55},
  {a: 15.0, b: 17.6, fill: '#D23A26', opacity: 0.9},
  {a: 18.0, b: 19.0, fill: '#74130C', opacity: 0.55},
  {a: 22.0, b: 24.4, fill: '#D23A26', opacity: 0.85},
  {a: 25.0, b: 26.4, fill: '#74130C', opacity: 0.6},
];

type StrandClass = {fill: string; opacity: number; bands: [number, number][]};
const CLASSES: StrandClass[] = (() => {
  const map = new Map<string, StrandClass>();
  for (const s of STRANDS) {
    const key = `${s.fill}@${s.opacity}`;
    if (!map.has(key)) map.set(key, {fill: s.fill, opacity: s.opacity, bands: []});
    map.get(key)!.bands.push([s.a, s.b]);
  }
  return [...map.values()];
})();

/**
 * Twist that makes a thread lying at `axisDeg` look exactly like the screen-space pattern in the
 * logo files. Use it for pieces copied from the logo so the still frame matches the mark; use the
 * default (32) for the hero thread.
 */
export const screenMatchedTwist = (axisDeg: number) => {
  let t = THREAD.twistDeg - axisDeg;
  while (t > 90) t -= 180;
  while (t <= -90) t += 180;
  // Keep clear of 90 degrees, where the strands would run exactly along the thread.
  return Math.max(-80, Math.min(80, t));
};

export type StrandPath = {fill: string; opacity: number; d: string};

/**
 * Strand polygons for a thread. `mat` holds each vertex's material coordinate (cotton length from
 * a fixed point on the thread), so strands slide when the thread slides and spread when it stretches.
 */
export const strandPaths = (
  pts: Polyline,
  mat: number[],
  halfWidth: number,
  twistDeg: number,
  capExtend: number,
): StrandPath[] => {
  if (pts.length < 2) return [];
  const frame = materialFrame(pts, mat);
  const th = deg(twistDeg);
  const c = Math.cos(th);
  const s = Math.sin(th);
  const h = halfWidth;
  const levels = h > 8 ? 5 : 3;
  const ts = Array.from({length: levels}, (_, j) => -h + (2 * h * j) / (levels - 1));
  const mMin = mat[0] - capExtend;
  const mMax = mat[mat.length - 1] + capExtend;
  const reach = h * Math.abs(s);
  const fmt = (p: V) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

  return CLASSES.map((cls) => {
    let d = '';
    for (const [a, b] of cls.bands) {
      const nLo = Math.floor((mMin * c - reach - b) / TILE);
      const nHi = Math.ceil((mMax * c + reach - a) / TILE);
      for (let n = nLo; n <= nHi; n++) {
        const ua = a + n * TILE;
        const ub = b + n * TILE;
        // Skip bands entirely outside the visible cotton.
        if ((ub + reach) / c < mMin || (ua - reach) / c > mMax) continue;
        const left: string[] = [];
        const right: string[] = [];
        for (const t of ts) {
          const fa = frame((ua - t * s) / c);
          left.push(fmt([fa.p[0] + fa.nrm[0] * t, fa.p[1] + fa.nrm[1] * t]));
        }
        for (let j = ts.length - 1; j >= 0; j--) {
          const t = ts[j];
          const fb = frame((ub - t * s) / c);
          right.push(fmt([fb.p[0] + fb.nrm[0] * t, fb.p[1] + fb.nrm[1] * t]));
        }
        d += `M${left.join('L')}L${right.join('L')}Z`;
      }
    }
    return {fill: cls.fill, opacity: cls.opacity, d};
  }).filter((p) => p.d.length > 0);
};
