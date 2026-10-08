// Brand type as live text (for words that are not in the logo files). Modak gets its fixed
// treatment: cream fill, ink outline at 4.5% of the size, tamarind shadow 5% down and right.

import React from 'react';
import {C} from '../brand';
import {FONT} from './fonts';

type Anchor = 'start' | 'middle' | 'end';

/**
 * Modak headline. `dressed` false draws only the fill: the first frame of a pop, before the outline
 * and shadow arrive.
 */
export const ModakText: React.FC<{x: number; y: number; size: number; anchor?: Anchor; text: string; dressed?: boolean; fill?: string}> = ({
  x,
  y,
  size,
  anchor = 'middle',
  text,
  dressed = true,
  fill = C.cream,
}) => {
  const outline = size * 0.09;
  const drop = size * 0.05;
  return (
    <g fontFamily={FONT.display} fontSize={size} textAnchor={anchor}>
      {dressed ? (
        <>
          <text x={x + drop} y={y + drop} fill={C.tamarind} stroke={C.tamarind} strokeWidth={outline} strokeLinejoin="round">
            {text}
          </text>
          <text x={x} y={y} fill={fill} stroke={C.ink} strokeWidth={outline} strokeLinejoin="round" paintOrder="stroke">
            {text}
          </text>
        </>
      ) : (
        <text x={x} y={y} fill={fill}>
          {text}
        </text>
      )}
    </g>
  );
};

/**
 * Big Shoulders label text, all caps, tracked open. `shown` characters are visible (typing);
 * the rest keep their place so centred lines do not shift while they type.
 */
export const LabelText: React.FC<{
  x: number;
  y: number;
  size: number;
  text: string;
  fill?: string;
  weight?: 800 | 900;
  tracking?: number;
  anchor?: Anchor;
  shown?: number;
}> = ({x, y, size, text, fill = C.ink, weight = 800, tracking = 0.14, anchor = 'start', shown = text.length}) => {
  const n = Math.max(0, Math.min(text.length, Math.floor(shown)));
  if (n === 0) return null;
  return (
    <text x={x} y={y} fontFamily={FONT.label} fontWeight={weight} fontSize={size} letterSpacing={size * tracking} textAnchor={anchor} fill={fill}>
      <tspan>{text.slice(0, n)}</tspan>
      {n < text.length ? <tspan fillOpacity={0}>{text.slice(n)}</tspan> : null}
    </text>
  );
};
