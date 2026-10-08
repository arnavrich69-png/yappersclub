// The cream FLAVOUR seal. One seal per post. It stamps down: fast drop, squash, a small rebound and
// a little ink spread where it hits.

import React from 'react';
import {C} from '../brand';
import {FONT} from '../components/fonts';
import {inQuad, outCubic, releaseResponse, span} from '../utils/easing';
import {clamp, deg, fromAngle} from '../utils/math';
import {randRange} from '../utils/random';

export const SEAL_R = 112;

export type SealSpec = {
  number: string;
  rim: string;
  /** Rest angle in degrees. */
  angle: number;
};

export const SEAL_NIGHT_01: SealSpec = {
  number: '01',
  rim: 'MFD. IN GWALIOR BY THE KUL · SUR GUARANTEED · ',
  angle: -9,
};

/** The seal artwork, centred on 0,0. */
const SealArt: React.FC<{uid: string; spec: SealSpec}> = ({uid, spec}) => {
  const rimR = SEAL_R - 22;
  const ring = `M${-rimR},0 a${rimR},${rimR} 0 1,1 ${2 * rimR},0 a${rimR},${rimR} 0 1,1 ${-2 * rimR},0`;
  const modakSize = 70;
  return (
    <g>
      <defs>
        <path id={`${uid}-rim`} d={ring} />
      </defs>
      <circle r={SEAL_R} fill={C.cream} stroke={C.ink} strokeWidth={5} />
      <circle r={SEAL_R - 33} fill="none" stroke={C.ink} strokeWidth={2.5} />
      <text fontFamily={FONT.label} fontWeight={800} fontSize={18} letterSpacing={1.6} fill={C.ink} dominantBaseline="central">
        <textPath href={`#${uid}-rim`} textLength={2 * Math.PI * rimR - 4} lengthAdjust="spacing">
          {spec.rim}
        </textPath>
      </text>
      <text y={-26} textAnchor="middle" fontFamily={FONT.label} fontWeight={900} fontSize={24} letterSpacing={24 * 0.22} fill={C.ink}>
        FLAVOUR
      </text>
      <text x={-36} y={36} textAnchor="middle" fontFamily={FONT.label} fontWeight={900} fontSize={21} letterSpacing={1} fill={C.ink}>
        No.
      </text>
      {/* Modak number: cream fill, ink outline at 4.5% and tamarind shadow at 5% of the size. */}
      <g fontFamily={FONT.display} fontSize={modakSize} textAnchor="middle">
        <text x={16 + modakSize * 0.05} y={48 + modakSize * 0.05} fill={C.tamarind} stroke={C.tamarind} strokeWidth={modakSize * 0.09} strokeLinejoin="round">
          {spec.number}
        </text>
        <text x={16} y={48} fill={C.cream} stroke={C.ink} strokeWidth={modakSize * 0.09} strokeLinejoin="round" paintOrder="stroke">
          {spec.number}
        </text>
      </g>
    </g>
  );
};

/** Ink that squeezes out from under the seal's rim on impact, and a few specks. */
const InkSpread: React.FC<{k: number; seed: string}> = ({k, seed}) => {
  const grow = span(k, 0, 0.16, outCubic);
  const pts: string[] = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    const wobble = 1.1 * Math.sin(a * 7 + randRange(seed, 1, 0, 6)) + 0.8 * Math.sin(a * 13 + randRange(seed, 2, 0, 6));
    const r = SEAL_R + 1 + grow * (2.4 + wobble);
    const p = fromAngle(a, r);
    pts.push(`${p[0].toFixed(2)},${p[1].toFixed(2)}`);
  }
  const specks = Array.from({length: 5}, (_, i) => {
    const a = deg(randRange(seed, 10 + i, 0, 360));
    const d = SEAL_R + randRange(seed, 20 + i, 6, 12) * (0.6 + 0.4 * grow);
    const r = randRange(seed, 30 + i, 1.3, 2.6) * grow;
    return {p: fromAngle(a, d), r};
  });
  return (
    <g fill={C.ink}>
      <polygon points={pts.join(' ')} />
      {specks.map((s, i) => (
        <circle key={i} cx={s.p[0]} cy={s.p[1]} r={s.r} />
      ))}
    </g>
  );
};

/**
 * Seal stamping down so it hits at `impact` (seconds). Before that it falls from above the paper
 * (bigger, shadow further away, still turning); then squash, rebound and settle.
 */
export const StampedSeal: React.FC<{uid: string; t: number; impact: number; at: [number, number]; spec: SealSpec}> = ({
  uid,
  t,
  impact,
  at,
  spec,
}) => {
  const fall = 0.1;
  if (t < impact - fall) return null;
  const k = t - impact;
  // Height above the paper: 1 at the start of the drop, 0 on impact (accelerating fall).
  const h = k < 0 ? 1 - inQuad(clamp((k + fall) / fall)) : 0;
  const lift = 1 + 0.5 * h;
  // After impact: squash, then a small rebound that settles.
  const squash = k < 0 ? 0 : 0.12 * releaseResponse(k, 7, 0.38);
  const sx = lift * (1 + squash * 0.7);
  const sy = lift * (1 - squash);
  const angle = spec.angle - 6 * h;
  const shadow: [number, number] = [6 + 34 * h, 8 + 44 * h];
  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <g transform={`translate(${shadow[0]} ${shadow[1]}) rotate(${angle}) scale(${sx} ${sy})`}>
        <circle r={SEAL_R + 2} fill={C.tamarind} />
      </g>
      {k >= 0 ? (
        <g transform={`rotate(${angle})`}>
          <InkSpread k={k} seed={`${uid}-ink`} />
        </g>
      ) : null}
      <g transform={`rotate(${angle}) scale(${sx} ${sy})`}>
        <SealArt uid={uid} spec={spec} />
      </g>
    </g>
  );
};
