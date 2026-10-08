// One continuous piece of kalava thread drawn along any path.
// Knots and crossings are made of several pieces stacked in over/under order.

import React from 'react';
import {C} from '../brand';
import {randRange} from '../utils/random';
import {add, angleOf, fromAngle, mul, type V} from '../utils/math';
import {bounds, cumulative, resample, tangents, toPathD, type Polyline} from './geometry';
import {BASE, PATTERN_WIDTH_RATIO, RIM, strandPaths} from './look';

export type Fray = 'none' | 'start' | 'end' | 'both';

export type ThreadPieceProps = {
  /** Unique within the frame (used for filter and mask ids). */
  uid: string;
  points: Polyline;
  /** Outer width including the dark rim. Logo wraps are 36.9, loose ends 14 to 15.4, the hero thread 26 or 32. */
  width: number;
  /** Material coordinate per input point. Defaults to arc length plus materialOffset. */
  material?: number[];
  materialOffset?: number;
  twistDeg?: number;
  cap?: 'round' | 'butt';
  fray?: Fray;
  /** Width of the flat yellow strand along the middle (0 for none), as on the logo's outer loose ends. */
  yellowCore?: number;
  /** Print shadow offset, or null for none. */
  shadow?: V | null;
  /** Thickness the roundness filter is tuned for (30 in the logo, 26 on posts, 32 on stories). */
  roundBasis?: number;
  seed?: string;
};

const SPACING = 2.5;

const resampleWithMaterial = (pts: Polyline, mat: number[] | undefined, offset: number) => {
  const dense = resample(pts, SPACING);
  const cumDense = cumulative(dense);
  if (!mat) return {pts: dense, mat: cumDense.map((s) => s + offset)};
  // Interpolate the given material values at the resampled arc lengths.
  const cumIn = cumulative(pts);
  const out: number[] = [];
  let j = 0;
  for (const s of cumDense) {
    while (j < cumIn.length - 2 && cumIn[j + 1] < s) j++;
    const seg = cumIn[j + 1] - cumIn[j];
    const f = seg > 1e-9 ? Math.min(1, Math.max(0, (s - cumIn[j]) / seg)) : 0;
    out.push(mat[j] + (mat[j + 1] - mat[j]) * f + offset);
  }
  return {pts: dense, mat: out};
};

/** Two short splayed strokes at a frayed tip, like the logo's loose ends. */
const frayStrokes = (tip: V, dir: V, width: number, seed: string): string => {
  const base = angleOf(dir);
  const len = width * 0.75;
  const a1 = base - (randRange(seed, 1, 19, 27) * Math.PI) / 180;
  const a2 = base + (randRange(seed, 2, 18, 26) * Math.PI) / 180;
  const p1 = add(tip, fromAngle(a1, len * randRange(seed, 3, 0.9, 1.08)));
  const p2 = add(tip, fromAngle(a2, len * randRange(seed, 4, 0.9, 1.08)));
  const f = (p: V) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  return `M${f(tip)}L${f(p1)}M${f(tip)}L${f(p2)}`;
};

export const ThreadPiece: React.FC<ThreadPieceProps> = ({
  uid,
  points,
  width,
  material,
  materialOffset = 0,
  twistDeg = 32,
  cap = 'round',
  fray = 'none',
  yellowCore = 0,
  shadow = null,
  roundBasis = 30,
  seed = uid,
}) => {
  if (points.length < 2) return null;
  const {pts, mat} = resampleWithMaterial(points, material, materialOffset);
  const total = cumulative(pts);
  if (total[total.length - 1] < 0.5) return null;

  const d = toPathD(pts);
  const half = (width * PATTERN_WIDTH_RATIO) / 2;
  const capExtend = cap === 'round' ? half * 1.05 : 0;
  const strands = strandPaths(pts, mat, half, twistDeg, capExtend);

  const blur = 0.16 * roundBasis;
  const box = bounds(pts, width + blur * 4 + 4);
  const filterId = `round-${uid}`;
  const maskId = `mask-${uid}`;
  const linecap = cap === 'round' ? 'round' : 'butt';

  const tans = tangents(pts);
  let fraySvg = '';
  if (fray === 'end' || fray === 'both') fraySvg += frayStrokes(pts[pts.length - 1], tans[tans.length - 1], width, `${seed}-end`);
  if (fray === 'start' || fray === 'both') fraySvg += frayStrokes(pts[0], mul(tans[0], -1), width, `${seed}-start`);

  return (
    <g>
      <defs>
        <filter id={filterId} filterUnits="userSpaceOnUse" x={box.x} y={box.y} width={box.width} height={box.height}>
          <feGaussianBlur in="SourceAlpha" stdDeviation={blur} result="b" />
          <feDiffuseLighting in="b" surfaceScale={0.09 * roundBasis} diffuseConstant={1.05} lightingColor="#fff" result="l">
            <feDistantLight azimuth={235} elevation={52} />
          </feDiffuseLighting>
          <feComposite in="l" in2="SourceAlpha" operator="in" result="lc" />
          <feBlend in="SourceGraphic" in2="lc" mode="multiply" />
        </filter>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={box.x} y={box.y} width={box.width} height={box.height}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={half * 2} strokeLinecap={linecap} strokeLinejoin="round" />
        </mask>
      </defs>
      {shadow ? (
        <path
          d={d}
          transform={`translate(${shadow[0].toFixed(2)} ${shadow[1].toFixed(2)})`}
          fill="none"
          stroke={C.tamarind}
          strokeWidth={width}
          strokeLinecap={linecap}
          strokeLinejoin="round"
        />
      ) : null}
      <g filter={`url(#${filterId})`}>
        <path d={d} fill="none" stroke={RIM} strokeWidth={width} strokeLinecap={linecap} strokeLinejoin="round" />
        <path d={d} fill="none" stroke={BASE} strokeWidth={half * 2} strokeLinecap={linecap} strokeLinejoin="round" />
        <g mask={`url(#${maskId})`}>
          {strands.map((s) => (
            <path key={`${s.fill}${s.opacity}`} d={s.d} fill={s.fill} opacity={s.opacity} />
          ))}
        </g>
      </g>
      {yellowCore > 0 ? (
        <path d={d} fill="none" stroke={C.strand} strokeWidth={yellowCore} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      {fraySvg ? (
        <path d={fraySvg} fill="none" stroke={C.thread} strokeWidth={Math.max(2, width * 0.22)} strokeLinecap="round" />
      ) : null}
    </g>
  );
};
