// Brief 03's gift tag: cream card, ink outline, a punched hole, the performer's name in Modak and
// their handle in Big Shoulders. It hangs from the thread on a short kalava loop and swings in like
// a pendulum. Drawn with the hole's centre at 0,0.

import React from 'react';
import {C} from '../brand';
import {HalftonePattern} from '../components/Print';
import {LabelText, ModakText} from '../components/Type';
import {releaseResponse} from '../utils/easing';
import {add, fromAngle, rotate, type V} from '../utils/math';
import {line} from '../thread/geometry';
import {KnotBody} from '../thread/RakhiKnot';
import {ThreadPiece} from '../thread/ThreadPiece';

export type TagText = {label: string; name: string[]; handle: string};

const TAG = {w: 236, h: 318, chamfer: 46, holeY: 46};
export const LOOP = 60;

const tagOutline = (inset: number) => {
  const {w, h, chamfer} = TAG;
  const x0 = -w / 2 + inset;
  const x1 = w / 2 - inset;
  const top = -TAG.holeY + inset;
  const bottom = h - TAG.holeY - inset;
  const c = chamfer - inset * 0.4;
  return `M${x0},${top + c} L${-w / 2 + chamfer},${top} L${w / 2 - chamfer},${top} L${x1},${top + c} L${x1},${bottom} L${x0},${bottom} Z`;
};

const TagArt: React.FC<{uid: string; text: TagText}> = ({uid, text}) => (
  <g>
    <defs>
      <HalftonePattern id={`${uid}-ht`} grid={7} r={1.6} opacity={0.1} rotate={18} />
    </defs>
    <path d={tagOutline(0)} fill={C.cream} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d={tagOutline(0)} fill={`url(#${uid}-ht)`} />
    <path d={tagOutline(11)} fill="none" stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
    <circle r={17} fill={C.cream} stroke={C.ink} strokeWidth={3.5} />
    <circle r={8.5} fill={C.ink} />
    <LabelText x={0} y={56} size={20} weight={800} tracking={0.26} anchor="middle" text={text.label} />
    {text.name.map((word, i) => (
      <ModakText key={word + i} x={0} y={128 + i * 64} size={60} text={word} />
    ))}
    <LabelText x={0} y={242} size={30} weight={800} tracking={0.06} anchor="middle" text={text.handle} />
  </g>
);

/**
 * Swing of the tag, degrees from hanging straight down (clockwise positive): released from far to
 * the left, it swings in, overshoots a little and settles; each kick (a string of the drone) nudges it.
 */
export const tagSwing = (t: number, release: number, kicks: number[]) => {
  if (t < release) return null;
  let a = 100 * releaseResponse(t - release, 1.05, 0.38);
  for (const k of kicks) {
    const tau = t - k;
    if (tau > 0) a += 1.6 * Math.exp(-tau * 3) * Math.sin(2 * Math.PI * 1.05 * tau);
  }
  return a;
};

export const TagOnThread: React.FC<{uid: string; pivot: V; angle: number; text: TagText; scale?: number}> = ({uid, pivot, angle, text, scale = 1}) => {
  const rad = (angle * Math.PI) / 180;
  const down: V = rotate([0, 1], rad);
  const hole = add(pivot, fromAngle(Math.atan2(down[1], down[0]), LOOP));
  const side = rotate([7, 0], rad);
  const strand = (dx: number) => line(pivot, add(hole, [side[0] * dx, side[1] * dx]), 12);
  const place = `translate(${hole[0].toFixed(2)} ${hole[1].toFixed(2)}) rotate(${angle.toFixed(3)}) scale(${scale})`;
  return (
    <g>
      {/* Back strand of the loop, the tag's print shadow, the tag, then the front strand and knot. */}
      <ThreadPiece uid={`${uid}-back`} points={strand(1)} width={9} roundBasis={14} />
      <g transform={`translate(8 10) ${place}`}>
        <path d={tagOutline(0)} fill={C.tamarind} />
      </g>
      <g transform={place}>
        <TagArt uid={uid} text={text} />
      </g>
      <ThreadPiece uid={`${uid}-front`} points={strand(-1)} width={9} roundBasis={14} />
      <KnotBody uid={`${uid}-knot`} center={pivot} size={22} />
    </g>
  );
};
