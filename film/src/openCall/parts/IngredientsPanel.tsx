// Tansen's recipe as a packet's ingredients panel, in the style of svg-parts/nutrition-panel.svg:
// cream, ink rules, English names with their Hindi in Khand, dotted leaders to the quantity. The
// last quantity is empty: the voice is the ingredient still missing.

import React from 'react';
import {C} from '../../brand';
import {FONT} from '../../components/fonts';

export const PANEL = {x: 330, y: 712, w: 610, h: 314};

export const INGREDIENTS = [
  {name: 'IMLI', hindi: 'इमली', value: '1'},
  {name: 'KALAVA', hindi: 'कलावा', value: '1'},
  {name: 'SONG', hindi: 'गाना', value: '1'},
  {name: 'AUTOTUNE', hindi: '', value: '0%'},
  {name: 'VOICE', hindi: 'आवाज़', value: ''},
];

const PAD = 22;
const ROW0 = 104;
const ROW = 44;

export const IngredientsPanel: React.FC<{caret: boolean}> = ({caret}) => {
  const {x, y, w, h} = PANEL;
  const right = x + w - PAD;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={C.cream} stroke={C.ink} strokeWidth={4} />
      <text x={x + PAD} y={y + 46} fontFamily={FONT.label} fontWeight={900} fontSize={34} letterSpacing={34 * 0.08} fill={C.ink}>
        INGREDIENTS
      </text>
      <text x={right} y={y + 46} textAnchor="end" fontFamily={FONT.label} fontWeight={700} fontSize={20} letterSpacing={20 * 0.12} fill={C.ink}>
        PER SINGER
      </text>
      <line x1={x + PAD} y1={y + 60} x2={right} y2={y + 60} stroke={C.ink} strokeWidth={5} />
      {INGREDIENTS.map((row, i) => {
        const base = y + ROW0 + i * ROW;
        return (
          <g key={row.name}>
            <text x={x + PAD} y={base} fontFamily={FONT.label} fontWeight={800} fontSize={27} letterSpacing={27 * 0.06} fill={C.ink}>
              {row.name}
              {row.hindi ? (
                <tspan fontFamily={FONT.hindi} fontWeight={600} fontSize={27} letterSpacing={0} dx={8}>
                  {row.hindi}
                </tspan>
              ) : null}
            </text>
            <line x1={x + 240} y1={base - 7} x2={right - 44} y2={base - 7} stroke={C.ink} strokeWidth={3} strokeDasharray="0.1 8" strokeLinecap="round" />
            {row.value ? (
              <text x={right} y={base} textAnchor="end" fontFamily={FONT.label} fontWeight={900} fontSize={27} fill={C.ink}>
                {row.value}
              </text>
            ) : caret ? (
              <rect x={right - 6} y={base - 24} width={5} height={26} fill={C.ink} />
            ) : null}
            {i < INGREDIENTS.length - 1 ? (
              <line x1={x + PAD} y1={base + 12} x2={right} y2={base + 12} stroke={C.ink} strokeWidth={1.2} opacity={0.5} />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
