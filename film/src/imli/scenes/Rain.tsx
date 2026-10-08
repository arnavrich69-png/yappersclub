// Bar 4: मल्हार brings the rain. Printed cream streaks fall slantwise through the dark behind the
// thread. The drops the score plays land on the string (where their notes are plucked) and splash;
// one drop finds each lamp's flame and puts it out. The rain belongs to the dark stage and slides off
// with it as the camera pans.

import React from 'react';
import {C} from '../../brand';
import {pluckX, THREAD_Y} from '../../thread/stringLine';
import {span} from '../../utils/easing';
import {randRange} from '../../utils/random';
import {HITS} from '../thread';
import {HIT} from '../timing';
import {flameAt, lampPose} from './Lamps';

/** Pixels a frame, and the slant: the rain drifts left as it falls. */
const SPEED = 92;
const SLANT = -0.17;
const TOP = -80;
/** Streaks started a frame at full rain, after a short build. */
const RATE = 2.4;
const BUILD = 10;

/** The drops the score plays on the string. */
export const DROPS = HITS.filter((h) => h.label === 'drop').map((h) => ({frame: h.frame, x: pluckX(h.semitones ?? 0)}));

const streak = (x: number, yEnd: number, len: number) => `M${(x - SLANT * len).toFixed(1)} ${(yEnd - len).toFixed(1)} L${x.toFixed(1)} ${yEnd.toFixed(1)}`;

/** Where a streak that lands at (x, y) on frame `land` is on `frame`, or null if not falling. */
const falling = (x: number, y: number, land: number, frame: number, len: number) => {
  const k = frame - land;
  const yEnd = y + k * SPEED;
  if (k > 0 || yEnd < TOP) return null;
  return streak(x + SLANT * (yEnd - y), yEnd, len);
};

/** Behind the thread: the rain, and the drops on their way to the string and to the flames. */
export const RainBack: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.rain || frame >= HIT.panEnd) return null;
  const d: string[] = [];
  // The steady rain: streak i starts at its own moment and place and falls through the frame.
  const elapsed = frame - HIT.rain;
  const n = Math.floor(RATE * Math.max(0, elapsed - BUILD / 2)) + 12;
  for (let i = 0; i < n; i++) {
    const born = HIT.rain + (i < 12 ? (i * BUILD) / 12 : BUILD / 2 + (i - 12) / RATE);
    const k = frame - born;
    if (k < 0) continue;
    const yEnd = TOP + k * SPEED + randRange('rain-y', i, 0, 120);
    if (yEnd > 2000 + 120) continue;
    const x0 = randRange('rain-x', i, -60, 1420);
    d.push(streak(x0 + SLANT * (yEnd - TOP), yEnd, randRange('rain-len', i, 40, 74)));
  }
  const hits: string[] = [];
  for (const drop of DROPS) {
    const s = falling(drop.x, THREAD_Y - 14, drop.frame, frame, 70);
    if (s) hits.push(s);
  }
  HIT.lampsOut.forEach((out, i) => {
    const [fx, fy] = flameAt(lampPose(i, out));
    const s = falling(fx, fy - 22, out, frame, 70);
    if (s) hits.push(s);
  });
  return (
    <g>
      <path d={d.join(' ')} stroke={C.cream} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d={hits.join(' ')} stroke={C.cream} strokeWidth={4.5} strokeLinecap="round" fill="none" />
    </g>
  );
};

/** In front of the thread: each drop on the string bursts into three droplets. */
export const RainSplash: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.rain || frame >= HIT.panEnd) return null;
  return (
    <g>
      {DROPS.map((drop, i) => {
        const k = frame - drop.frame;
        if (k < 0 || k > 9) return null;
        const t = k / 30;
        const fade = 1 - span(k, 5, 9);
        return [-1, 0, 1].map((j) => {
          const vx = j * randRange('splash-vx', i * 3 + j + 1, 140, 220);
          const vy = randRange('splash-vy', i * 3 + j + 1, 320, 420) * (j === 0 ? 1.2 : 1);
          const x = drop.x + vx * t;
          const y = THREAD_Y - 18 - vy * t + 0.5 * 2600 * t * t;
          return <circle key={`${i}-${j}`} cx={x} cy={y} r={4.2 * fade + 0.6} fill={C.cream} />;
        });
      })}
    </g>
  );
};
