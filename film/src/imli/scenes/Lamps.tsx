// Bars 2 to 4: Tansen's lamps. Five clay diyas hang on the thread in the dark, waiting. In bar 3 a
// note lights each one (low Sa, low Pa, Sa, Pa, high Sa: LAMP_X are where those notes are plucked),
// the flame catching with a candy bounce and a pool of haldi dots spreading round it. In bar 4 the
// rain puts them out one by one. They swing on their hooks when the thread rings near them, and
// slide off along the thread with the camera's pan.

import React from 'react';
import {C} from '../../brand';
import {candyPop} from '../../components/pop';
import {falloffDots} from '../../performer/Stage';
import {restYAt} from '../../thread/stringLine';
import {inCubic, outCubic, settle, span} from '../../utils/easing';
import {deg, type V} from '../../utils/math';
import {smoothNoise} from '../../utils/random';
import {panAt} from '../camera';
import {Diya, FLAME_CENTRE, type Flame} from '../parts/Diya';
import {HITS, ringAt} from '../thread';
import {HIT, LAMP_X, seconds} from '../timing';
import {handBendAt} from './Hand';

/** The lamps are there once the light has gone out, and gone once the pan has carried them off. */
const FROM = HIT.lightOut + 6;
const OUT_FRAMES = 5;
/** The diyas are drawn a third bigger than their drawing, to read on a phone. */
const SCALE = 1.3;

export const lampsShownAt = (frame: number) => frame >= FROM && frame < HIT.panEnd;

const NOTES = HITS.filter((h) => h.kind === 'note' && h.frame >= FROM && h.frame < HIT.panEnd);

/** How far lamp i swings on its hook (degrees): every note and drop near it rocks it, dying away. */
const swingAt = (i: number, frame: number) => {
  let a = 0;
  for (const h of NOTES) {
    if (h.frame > frame) break;
    const t = seconds(frame - h.frame);
    if (t > 3) continue;
    const x = 540 + (h.semitones ?? 0) * 30;
    const near = Math.exp(-Math.abs(x - LAMP_X[i]) / 260);
    a += 9 * (h.vel ?? 0.7) * near * Math.exp(-t / 0.8) * Math.sin(2 * Math.PI * 1.35 * t);
  }
  // A small idle sway so they are never frozen.
  return a + 1.2 * smoothNoise(`lamp-sway-${i}`, seconds(frame) * 0.8);
};

/** Where lamp i hangs on `frame` (world x, the thread's height there) and its swing. */
export const lampPose = (i: number, frame: number): {hook: V; angle: number} => {
  const x = LAMP_X[i] - panAt(frame);
  const y = restYAt(LAMP_X[i], handBendAt(frame)) + ringAt(frame, Math.max(-20, Math.min(1100, x)));
  return {hook: [x, y], angle: swingAt(i, frame)};
};

/** 0 to 1 how lit lamp i is (the pool's reach), and its flame. */
const lampState = (i: number, frame: number): {lit: boolean; glow: number; flame: Flame | null} => {
  const on = HIT.lamps[i];
  const off = HIT.lampsOut[i];
  if (frame < on) return {lit: false, glow: 0, flame: null};
  const t = seconds(frame);
  const flicker = {
    stretch: 1 + 0.09 * smoothNoise(`flame-${i}`, t * 7),
    lean: 5 * smoothNoise(`flame-lean-${i}`, t * 4),
  };
  if (frame < off) {
    const k = seconds(frame - on);
    const {sy} = candyPop(k);
    return {lit: true, glow: settle(k, 2.6, 0.7), flame: {size: sy, ...flicker}};
  }
  // Put out: the flame squashes down into the wick, the pool shrinks back after it.
  const gone = span(frame, off, off + OUT_FRAMES);
  const size = 1 - inCubic(gone);
  return {
    lit: frame < off + 2,
    glow: 1 - outCubic(span(frame, off, off + 7)),
    flame: size > 0.02 ? {size, stretch: 1 - 0.5 * gone, lean: flicker.lean} : null,
  };
};

const place = (pose: {hook: V; angle: number}) =>
  `translate(${pose.hook[0].toFixed(2)} ${pose.hook[1].toFixed(2)}) rotate(${pose.angle.toFixed(3)}) scale(${SCALE})`;

/** The flame's middle in the world, for its pool of light and the drop that puts it out. */
export const flameAt = (pose: {hook: V; angle: number}): V => {
  const a = deg(pose.angle);
  const x = FLAME_CENTRE.x * SCALE;
  const y = FLAME_CENTRE.y * SCALE;
  return [pose.hook[0] + x * Math.cos(a) - y * Math.sin(a), pose.hook[1] + x * Math.sin(a) + y * Math.cos(a)];
};

/** Behind the thread: each lit lamp's pool of haldi dots. */
export const LampLight: React.FC<{frame: number}> = ({frame}) => {
  if (!lampsShownAt(frame)) return null;
  return (
    <g>
      {LAMP_X.map((_, i) => {
        const {glow} = lampState(i, frame);
        if (glow <= 0.01) return null;
        const [cx, cy] = flameAt(lampPose(i, frame));
        const d = falloffDots({cx, cy, r: 34 * glow, falloff: 165 * glow}, []);
        return <path key={i} d={d} fill={C.haldi} />;
      })}
    </g>
  );
};

/** In front of the thread: the lamps on their hooks. */
export const Lamps: React.FC<{frame: number}> = ({frame}) => {
  if (!lampsShownAt(frame)) return null;
  return (
    <g>
      {LAMP_X.map((_, i) => {
        const pose = lampPose(i, frame);
        if (pose.hook[0] < -200) return null;
        const {lit, flame} = lampState(i, frame);
        return (
          <g key={i} transform={place(pose)}>
            <Diya uid={`diya-${i}`} lit={lit} flame={flame} />
          </g>
        );
      })}
    </g>
  );
};

/** Steam off a lamp just put out: three small dots rising off the wick and shrinking away. */
export const LampSteam: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.lampsOut[0] - 40 || frame >= HIT.panEnd) return null;
  return (
    <g>
      {LAMP_X.map((_, i) => {
        const k = frame - HIT.lampsOut[i];
        if (k < 0 || k > 16) return null;
        const pose = lampPose(i, frame);
        const [wx, wy] = flameAt(pose);
        return [0, 1, 2].map((j) => {
          const t = Math.max(0, k - 2 * j) / 16;
          if (t <= 0) return null;
          const r = 7 * (1 - t) - j;
          if (r <= 0.5) return null;
          return <circle key={`${i}-${j}`} cx={wx + (j - 1) * 7 + 10 * t * (j - 1)} cy={wy + 10 - 70 * outCubic(t)} r={r} fill={C.cream} />;
        });
      })}
    </g>
  );
};

