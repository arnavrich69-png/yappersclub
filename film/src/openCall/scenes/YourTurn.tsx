// Scene 6: the stage under the label. The light comes on with one flicker on beat 4, तेरी pops on
// the downbeat with the tune's first note and बारी on the next beat, then the promise types in.

import React from 'react';
import {popTransform} from '../../components/pop';
import {LabelText, ModakText} from '../../components/Type';
import {StageArt, type ClearBox, type Spot} from '../../performer/Stage';
import {HIT, seconds} from '../timing';

export const LIGHT: Spot = {cx: 540, cy: 1110, r: 360, falloff: 120};
const NO_CLEAR: ClearBox[] = [];
const HEADLINE_Y = 1170;

/** On for two frames, off for two, then on for good. */
export const lightOn = (frame: number) => frame >= HIT.light && !(frame >= HIT.light + 2 && frame < HIT.light + 4);

const typed = (frame: number, start: number, rate = 60) => Math.max(0, seconds(frame - start) * rate);

export const YourTurnStage: React.FC<{frame: number}> = ({frame}) => (
  <StageArt uid="lantern" lit={lightOn(frame)} spot={LIGHT} clear={NO_CLEAR} />
);

/** When the ritual begins the words drop out of the light, the first a frame ahead of the second. */
const dropOut = (frame: number, delay: number, spin: number) => {
  const t = seconds(frame - HIT.ritual - delay);
  if (t <= 0) return '';
  const y = 0.5 * 5200 * t * t;
  return `translate(0 ${y.toFixed(1)}) rotate(${(spin * t * 40).toFixed(2)} 540 ${HEADLINE_Y})`;
};

export const YourTurnWords: React.FC<{frame: number}> = ({frame}) => {
  if (frame >= HIT.ritual + 24) return null;
  const words: [string, number, number, number, 'end' | 'start'][] = [
    ['तेरी', HIT.teri, 522, 380, 'end'],
    ['बारी', HIT.bari, 558, 700, 'start'],
  ];
  return (
    <g>
      {words.map(([word, start, x, pivot, anchor], i) =>
        frame < start ? null : (
          <g key={word} transform={dropOut(frame, i, i === 0 ? -1 : 1) || undefined}>
            <g transform={popTransform(seconds(frame - start), pivot, HEADLINE_Y)}>
              <ModakText x={x} y={HEADLINE_Y} size={170} anchor={anchor} text={word} dressed={frame >= start + 1} />
            </g>
          </g>
        ),
      )}
      <g transform={dropOut(frame, 2, 0.4) || undefined}>
        <LabelText x={540} y={HEADLINE_Y + 88} size={36} weight={900} tracking={0.12} anchor="middle" text="BRING ONE SONG · WE BRING THE IMLI" shown={typed(frame, HIT.bring)} />
      </g>
    </g>
  );
};
