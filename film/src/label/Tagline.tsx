// SOUND. PEOPLE. CULTURE. typed in letter by letter, from the lockup's own Big Shoulders outlines.
// Each letter lands with a small press, like a label printer striking it.

import React from 'react';
import {C} from '../brand';
import {outCubic, span} from '../utils/easing';
import {TAGLINE} from './lockup';

/** Start time (seconds) of each glyph: one per frame, a short breath after each full stop. */
export const typingSchedule = (start: number, fps: number, pauseFrames = 2) => {
  const times: number[] = [];
  let f = 0;
  TAGLINE.forEach((g) => {
    times.push(start + f / fps);
    f += g.key.endsWith('.') ? 1 + pauseFrames : 1;
  });
  return times;
};

export const Tagline: React.FC<{t: number; times: number[]; dy?: number}> = ({t, times, dy = 0}) => (
  <g transform={`translate(0 ${dy})`}>
    {TAGLINE.map((g, i) => {
      if (t < times[i]) return null;
      const press = 1 + 0.18 * (1 - span(t, times[i], times[i] + 0.1, outCubic));
      const cx = (g.box[0] + g.box[2]) / 2;
      const cy = (g.box[1] + g.box[3]) / 2;
      return <path key={g.key} d={g.d} fill={C.ink} transform={`translate(${cx} ${cy}) scale(${press.toFixed(4)}) translate(${-cx} ${-cy})`} />;
    })}
  </g>
);
