// The things in इमली क्यों? that weigh on the thread or sit in front of it: the candy in the light, a
// leaf off Tansen's tree that lands on the string, the wrapper that closes round it and is tied (the
// tied imli itself), the wrist the thread is tied on, and the knot that ties the film off. Also the
// bend each of them puts in the thread.

import React from 'react';
import {C} from '../../brand';
import {popTransform} from '../../components/pop';
import {SLEEVES, Wrist, WristTie} from '../../openCall/parts/Wrist';
import {KnotBody} from '../../thread/RakhiKnot';
import {ThreadPiece} from '../../thread/ThreadPiece';
import {cumulative, quad, slice} from '../../thread/geometry';
import type {Bend} from '../../thread/stringLine';
import {restYAt, THREAD_Y} from '../../thread/stringLine';
import {inOutCubic, outCubic, releaseResponse, settle, span} from '../../utils/easing';
import {lerp, type V} from '../../utils/math';
import {OpenEnd} from '../../wrapper/OpenEnd';
import {Body, KnotBlob, Letter, LooseEnd, TiedImli, Wraps} from '../../wrapper/TiedImli';
import {FLAT, TWISTED, type OpenState} from '../../wrapper/untwist';
import {panAt} from '../camera';
import {ringAt} from '../thread';
import {HIT, seconds} from '../timing';

// ---------------------------------------------------------------- bar 1: the candy in the light

const HOOK = {x: 540, scale: 0.62};

/** The tied imli threaded on the string in the light, jolted by every note; slides off with the pan. */
export const HookCandy: React.FC<{frame: number}> = ({frame}) => {
  if (frame >= HIT.panEnd) return null;
  const x = HOOK.x - panAt(frame);
  const y = THREAD_Y + ringAt(frame, Math.max(-20, x));
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}>
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

// ---------------------------------------------------------------- bar 6: wrapped and tied

/** Big on the string, where it is the subject; the size of the brand mark once it is at the top. */
const CANDY = {sit: 0.56, home: [540, 360] as V, homeScale: 0.42};
const NECK = (540 - 262) * CANDY.sit;
const SIT = 8;

/** The candy's place: sitting in the string where the leaf landed, then flung up to the top. */
const candyAt = (frame: number): {c: V; rot: number; sx: number; sy: number; scale: number} => {
  const sitting: V = [LEAF.x, THREAD_Y - SIT + leafDepth(frame)];
  if (frame < HIT.fling) return {c: sitting, rot: -4, sx: 1, sy: 1, scale: CANDY.sit};
  const land = HIT.fling + 12;
  if (frame < land) {
    const k = span(frame, HIT.fling, land);
    const e = outCubic(k);
    return {
      c: [lerp(sitting[0], CANDY.home[0], e), lerp(sitting[1], CANDY.home[1], e) - 60 * Math.sin(Math.PI * k)],
      rot: lerp(-4, 4, e),
      sx: 0.96,
      sy: 1.06,
      scale: lerp(CANDY.sit, CANDY.homeScale, e),
    };
  }
  const sq = 0.08 * releaseResponse(seconds(frame - land), 6, 0.35);
  return {c: CANDY.home, rot: 4 * releaseResponse(seconds(frame - land), 3, 0.4), sx: 1 + sq * 0.6, sy: 1 - sq, scale: CANDY.homeScale};
};

const place = (c: {c: V; rot: number; sx: number; sy: number; scale: number}) =>
  `translate(${c.c[0].toFixed(2)} ${c.c[1].toFixed(2)}) rotate(${c.rot.toFixed(3)}) scale(${(c.scale * c.sx).toFixed(4)} ${(c.scale * c.sy).toFixed(4)}) translate(-540 -540)`;

const twistShut = (frame: number): OpenState => {
  if (frame < HIT.twist) return FLAT;
  const p = span(frame, HIT.twist, HIT.twist + 16, inOutCubic);
  if (p >= 1) return TWISTED;
  return {open: 1 - p, spin: 2 * Math.PI * (1 - p), crinkle: 1, t: seconds(frame)};
};

/** The candy closing round the leaf, twisting shut and being tied, until it is flung. */
export const LeafCandy: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.wrap) return null;
  const c = candyAt(frame);
  if (frame >= HIT.fling + 12) {
    return (
      <g transform={place(c)}>
        <TiedImli uid="imli-landed" />
      </g>
    );
  }
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
export const bendAt = (frame: number): Bend => {
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

// ---------------------------------------------------------------- bar 7: tied on a wrist

/** On the right, so the words stand clear beside it. */
const WRIST_X = 800;

/** The wrist rises to the thread and stops with it on the wrist; it drops away as the label lands. */
const wristY = (frame: number) => {
  if (frame < HIT.wrist) return null;
  const rise = 672 + 1400 * (1 - settle(seconds(frame - HIT.wrist), 2.4, 0.9));
  const t = seconds(frame - (HIT.label - 4));
  return t > 0 ? rise + 0.5 * 16000 * t * t : rise;
};

export const KulWrist: React.FC<{frame: number}> = ({frame}) => {
  const y = wristY(frame);
  if (y === null || y > 1920 + 400) return null;
  const wound = 2 * span(frame, HIT.wind, HIT.tie - 2, inOutCubic);
  const knot = frame < HIT.tie ? 0 : 1 + 0.15 * releaseResponse(seconds(frame - HIT.tie), 5, 0.4) - 0.15;
  return (
    <g transform={`translate(${WRIST_X} ${y.toFixed(1)})`}>
      <Wrist uid="kul-wrist" sleeve={SLEEVES[1]} />
      <WristTie uid="kul-tie" wound={wound} knot={knot} />
    </g>
  );
};

// ---------------------------------------------------------------- bar 8: the thread ties off

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

