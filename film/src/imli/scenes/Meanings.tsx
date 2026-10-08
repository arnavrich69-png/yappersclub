// Bar 14: what the name means, glossed under the label like a dictionary: a bracket under ध्वनि and
// SOUND under it, then a bracket under KUL and FAMILY. Ink on the haldi ground, drawn in on the beat.

import React from 'react';
import {C} from '../../brand';
import {LabelText} from '../../components/Type';
import {labelToWorld} from '../../label/Label';
import {WORDMARK} from '../../label/lockup';
import {inOutCubic, span} from '../../utils/easing';
import {HIT, seconds} from '../timing';

const extent = (keys: string[]) => {
  const pieces = WORDMARK.filter((p) => keys.includes(p.key));
  const x0 = Math.min(...pieces.map((p) => p.box[0]));
  const x1 = Math.max(...pieces.map((p) => p.box[2]));
  return [labelToWorld(x0, 0)[0], labelToWorld(x1, 0)[0]] as const;
};

const GLOSSES = [
  {at: HIT.sound, span: extent(['dhva', 'ni']), word: 'SOUND'},
  {at: HIT.family, span: extent(['K', 'U', 'L']), word: 'FAMILY'},
];

/** Just under the label's bottom edge. */
const BRACKET_Y = 952;
const WORD_Y = 1012;

export const Meanings: React.FC<{frame: number}> = ({frame}) => (
  <g>
    {GLOSSES.map(({at, span: [x0, x1], word}) => {
      const k = frame - at;
      if (k < 0) return null;
      const cx = (x0 + x1) / 2;
      const half = ((x1 - x0) / 2 - 10) * span(k, 0, 6, inOutCubic);
      const ticks = k >= 6;
      return (
        <g key={word}>
          <path
            d={`M${cx - half},${BRACKET_Y} L${cx + half},${BRACKET_Y}${ticks ? ` M${cx - half},${BRACKET_Y} L${cx - half},${BRACKET_Y - 16} M${cx + half},${BRACKET_Y} L${cx + half},${BRACKET_Y - 16}` : ''}`}
            fill="none"
            stroke={C.ink}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <LabelText x={cx} y={WORD_Y} size={46} weight={900} tracking={0.18} anchor="middle" text={word} shown={Math.max(0, seconds(k - 4) * 40)} />
        </g>
      );
    })}
  </g>
);
