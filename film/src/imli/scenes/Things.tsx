// The things in इमली क्यों? that weigh on the thread or sit in front of it: the candy in the light
// (flung off when the story starts), a leaf off Tansen's tree that lands on the string, the wrapper
// that closes round it and is tied (flung off when the thread asks its question), the wrists the
// kalava is tied on, the candy landing back on the packet, and the knot that ties the film off. Also
// the bend each of them puts in the thread.

import React from 'react';
import {C} from '../../brand';
import {popTransform} from '../../components/pop';
import {SLEEVES, Wrist, WristTie} from '../../openCall/parts/Wrist';
import {KnotBody} from '../../thread/RakhiKnot';
import {ThreadPiece} from '../../thread/ThreadPiece';
import {cumulative, quad, slice} from '../../thread/geometry';
import type {Bend} from '../../thread/stringLine';
import {restYAt, THREAD_Y} from '../../thread/stringLine';
import {inOutCubic, releaseResponse, settle, span} from '../../utils/easing';
import {lerp, type V} from '../../utils/math';
import {OpenEnd} from '../../wrapper/OpenEnd';
import {Body, KnotBlob, Letter, LooseEnd, TiedImli, Wraps} from '../../wrapper/TiedImli';
import {FLAT, TWISTED, type OpenState} from '../../wrapper/untwist';
import {ringAt} from '../thread';
import {HIT, seconds} from '../timing';
import {handBendAt} from './Hand';

// ---------------------------------------------------------------- bar 1: the candy in the light

const HOOK = {x: 540, scale: 0.62};

/** The tied imli threaded on the string in the light, jolted by every note; the thread flings it off. */
export const HookCandy: React.FC<{frame: number}> = ({frame}) => {
  let x = HOOK.x;
  let y = THREAD_Y + ringAt(frame, x);
  let rot = 0;
  if (frame >= HIT.flingAway) {
    const t = seconds(frame - HIT.flingAway);
    x += 260 * t;
    y = THREAD_Y - 3400 * t + 0.5 * 2400 * t * t;
    rot = 520 * t;
    // Gone out of the top of the frame (and never seen coming down again).
    if (y < -420 || t > 0.4) return null;
  }
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)})`}>
      <g transform={popTransform(seconds(frame - HIT.hook), 0, 0)}>
        <g transform={`scale(${HOOK.scale}) translate(-540 -540)`}>
          <TiedImli uid="hook-imli" />
        </g>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- bars 4 and 5: the leaf

/** A tamarind leaf seen close: a bare stalk, then nine pairs of small rounded leaflets along the midrib. */
const TamarindLeaf: React.FC = () => (
  <g>
    <path d="M-58 2 Q-10 -2 44 0" fill="none" stroke={C.tamarind} strokeWidth={2.4} strokeLinecap="round" />
    {Array.from({length: 9}, (_, i) => {
      const x = -30 + i * 8.6;
      const len = 7.6 - Math.abs(i - 3.5) * 0.35;
      return (
        <g key={i}>
          <ellipse cx={x} cy={-len} rx={3.3} ry={len} transform={`rotate(22 ${x} ${-len})`} fill={C.haldi} stroke={C.tamarind} strokeWidth={1.3} />
          <ellipse cx={x} cy={len} rx={3.3} ry={len} transform={`rotate(-22 ${x} ${len})`} fill={C.haldi} stroke={C.tamarind} strokeWidth={1.3} />
        </g>
      );
    })}
  </g>
);

/** Where the leaf lets go of the crown, and where on the string it lands. */
const LEAF = {from: [468, 404] as V, x: 520, scale: 1.9};

/** How far the leaf presses the string down once it has landed: a light weight, bounced once. */
const leafDepth = (frame: number) => (frame < HIT.leafLands ? 0 : 9 * (1 - releaseResponse(seconds(frame - HIT.leafLands), 3, 0.35)));

export const Leafy: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.leaf || frame >= HIT.wrap + 2) return null;
  let x: number;
  let y: number;
  let rot: number;
  if (frame < HIT.leafLands) {
    // Falling like a leaf: rocking side to side, slowing as it swings, drifting to the string.
    const k = span(frame, HIT.leaf, HIT.leafLands);
    const t = seconds(frame - HIT.leaf);
    x = lerp(LEAF.from[0], LEAF.x, inOutCubic(k)) + 34 * Math.sin(2 * Math.PI * 1.1 * t) * (1 - k);
    y = lerp(LEAF.from[1], THREAD_Y - 20, k * k * (3 - 2 * k));
    rot = 20 + 32 * Math.sin(2 * Math.PI * 1.1 * t + 0.9) * (1 - k) - 28 * k;
  } else {
    x = LEAF.x;
    y = restYAt(LEAF.x, bendAt(frame)) + ringAt(frame, LEAF.x) - 20;
    rot = -8;
  }
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${LEAF.scale})`}>
      <TamarindLeaf />
    </g>
  );
};

// ---------------------------------------------------------------- bar 9: wrapped and tied

/** Big on the string, where it is the subject; the size of the brand mark once it is back at the top. */
const CANDY = {sit: 0.56, home: [540, 360] as V, homeScale: 0.42};
const NECK = (540 - 262) * CANDY.sit;
const SIT = 8;
const FLUNG = 14;

/** The candy's place: sitting in the string where the leaf landed, then flung up and out of the frame. */
const candyAt = (frame: number): {c: V; rot: number; sx: number; sy: number; scale: number} => {
  const sitting: V = [LEAF.x, THREAD_Y - SIT + leafDepth(frame)];
  if (frame < HIT.fling) return {c: sitting, rot: -4, sx: 1, sy: 1, scale: CANDY.sit};
  const t = seconds(frame - HIT.fling);
  return {
    c: [sitting[0] + 300 * t, sitting[1] - 3300 * t + 0.5 * 2200 * t * t],
    rot: -4 - 480 * t,
    sx: 0.96,
    sy: 1.06,
    scale: CANDY.sit,
  };
};

const place = (c: {c: V; rot: number; sx: number; sy: number; scale: number}) =>
  `translate(${c.c[0].toFixed(2)} ${c.c[1].toFixed(2)}) rotate(${c.rot.toFixed(3)}) scale(${(c.scale * c.sx).toFixed(4)} ${(c.scale * c.sy).toFixed(4)}) translate(-540 -540)`;

const twistShut = (frame: number): OpenState => {
  if (frame < HIT.twist) return FLAT;
  const p = span(frame, HIT.twist, HIT.twist + 16, inOutCubic);
  if (p >= 1) return TWISTED;
  return {open: 1 - p, spin: 2 * Math.PI * (1 - p), crinkle: 1, t: seconds(frame)};
};

/** The candy closing round the leaf, twisting shut and being tied, until it is flung off. */
export const LeafCandy: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.wrap || frame >= HIT.fling + FLUNG) return null;
  const c = candyAt(frame);
  const tied = frame >= HIT.knot;
  const cinch = tied ? 1 + 0.25 * releaseResponse(seconds(frame - HIT.knot), 6, 0.4) : 1;
  const tie = (side: 'left' | 'right') => {
    const n = side === 'left' ? 262 : 818;
    return `translate(${n} 540) scale(${cinch.toFixed(4)}) translate(${-n} -540)`;
  };
  return (
    <g transform={place(c)}>
      <g transform={popTransform(seconds(frame - HIT.wrap), 540, 540)}>
        <OpenEnd side="left" state={twistShut(frame - 1)} />
        <OpenEnd side="right" state={twistShut(frame)} />
        {tied
          ? (['left', 'right'] as const).map((side) => (
              <g key={side} transform={tie(side)}>
                <Wraps side={side} uid={`leaf-candy-${side}`} />
                <LooseEnd uid={`leaf-candy-${side}-a`} side={side} which="a" />
                <LooseEnd uid={`leaf-candy-${side}-b`} side={side} which="b" />
                <KnotBlob side={side} uid={`leaf-candy-${side}-k`} />
              </g>
            ))
          : null}
        <Body uid="leaf-candy-body" />
        <Letter />
      </g>
    </g>
  );
};

/** What weighs on the thread: the landed leaf, then the candy's two necks, let go as it is flung. */
const leafBendAt = (frame: number): Bend => {
  if (frame < HIT.leafLands || frame >= HIT.fling + 2) return [];
  const d = leafDepth(frame);
  if (frame < HIT.wrap) return [[LEAF.x, d]];
  const k = span(frame, HIT.wrap, HIT.wrap + 8, inOutCubic);
  const release = frame >= HIT.fling ? 1 - (frame - HIT.fling) / 2 : 1;
  return [
    [LEAF.x - NECK * k, d * release],
    [LEAF.x + NECK * k, d * release],
  ];
};

/** Everything bending the thread on `frame`: Tansen's hand lifting it, the leaf and the candy weighing on it. */
export const bendAt = (frame: number): Bend => [...handBendAt(frame), ...leafBendAt(frame)];

// ---------------------------------------------------------------- bars 11 and 12: tied on a wrist, then the kul

/** The wrist the guru ties (right of centre, under the words), then the kul along the thread either side. */
export const WRIST_X = 800;
const WRISTS = [
  {x: WRIST_X, sleeve: SLEEVES[1], rise: HIT.wrist},
  {x: WRIST_X - 420, sleeve: SLEEVES[0], rise: HIT.kul + 4},
  {x: WRIST_X + 420, sleeve: SLEEVES[2], rise: HIT.kul + 8},
  {x: WRIST_X - 840, sleeve: SLEEVES[3], rise: HIT.kul + 12},
  {x: WRIST_X - 1260, sleeve: SLEEVES[4], rise: HIT.kul + 16},
];

/** Each wrist rises to the thread and stops with it on the wrist, without overshooting it. */
const wristY = (frame: number, rise: number) => (frame < rise ? null : 672 + 1400 * (1 - settle(seconds(frame - rise), 2.4, 0.9)));

/** In front of the thread until the candy lands back on the packet. */
export const KulWrists: React.FC<{frame: number}> = ({frame}) => {
  if (frame >= HIT.ritual) return null;
  return (
    <g>
      {WRISTS.map((w, i) => {
        const y = wristY(frame, w.rise);
        if (y === null) return null;
        const first = i === 0;
        const wound = first ? 2 * span(frame, HIT.wind, HIT.tie - 2, inOutCubic) : 2;
        const knot = first ? (frame < HIT.tie ? 0 : 1 + 0.15 * releaseResponse(seconds(frame - HIT.tie), 5, 0.4) - 0.15) : 1;
        return (
          <g key={i} transform={`translate(${w.x} ${y.toFixed(1)})`}>
            <Wrist uid={`kul-wrist-${i}`} sleeve={w.sleeve} />
            <WristTie uid={`kul-tie-${i}`} wound={wound} knot={knot} />
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- bar 13: back on the packet

const RETURN = {fall: 8};

/** The tied imli drops back onto the top of the packet on the downbeat, squashes and settles (screen space). */
export const ReturnCandy: React.FC<{frame: number}> = ({frame}) => {
  const k = frame - HIT.ritual;
  if (k < -RETURN.fall) return null;
  const y = k < 0 ? CANDY.home[1] - 1100 * (1 - Math.pow(1 + k / RETURN.fall, 2)) : CANDY.home[1];
  const sq = k < 0 ? 0 : 0.1 * releaseResponse(seconds(k), 6, 0.35);
  return (
    <g transform={`translate(${CANDY.home[0]} ${y.toFixed(1)}) scale(${(CANDY.homeScale * (1 + sq * 0.6)).toFixed(4)} ${(CANDY.homeScale * (1 - sq)).toFixed(4)}) translate(-540 -540)`}>
      <TiedImli uid="imli-home" />
    </g>
  );
};

// ---------------------------------------------------------------- bar 15: the thread ties off

const KNOT: V = [958, THREAD_Y];
const ENDS = [quad([958, 684], [949, 722], [931, 762], 20), quad([958, 684], [971, 720], [991, 754], 20)];

export const TieOff: React.FC<{frame: number}> = ({frame}) => {
  const tie = frame - HIT.tieOff;
  if (tie < 0) return null;
  const k = 1 + 0.18 * releaseResponse(seconds(tie), 5, 0.4) - 0.18;
  return (
    <g>
      {ENDS.map((e, i) => {
        const len = cumulative(e)[e.length - 1];
        return (
          <ThreadPiece
            key={i}
            uid={`imli-end-${i}`}
            points={slice(e, 0, len * Math.min(1, span(tie, 0, 6)))}
            width={15}
            roundBasis={26}
            fray="end"
            yellowCore={i === 1 ? 4.5 : 0}
          />
        );
      })}
      <KnotBody uid="imli-end-knot" center={KNOT} size={46} scale={0.6 + 0.4 * k} />
    </g>
  );
};

