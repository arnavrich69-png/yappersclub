// The label system's flavour band: a haldi bar with an ink outline. Night 01 is FLAVOUR No. 01,
// खट्टा मीठा. The Hindi is never letter-spaced, so its headline bar stays joined.

import React from 'react';
import {C} from '../../brand';
import {FONT} from '../../components/fonts';

export const BAND = {x: 220, y: 492, w: 640, h: 62};

export const FlavourBand: React.FC = () => (
  <g>
    <rect x={BAND.x} y={BAND.y} width={BAND.w} height={BAND.h} fill={C.haldi} stroke={C.ink} strokeWidth={4} />
    <text x={BAND.x + BAND.w / 2} y={BAND.y + BAND.h / 2 + 14} textAnchor="middle" fill={C.ink}>
      <tspan fontFamily={FONT.label} fontWeight={900} fontSize={40} letterSpacing={40 * 0.16}>
        FLAVOUR No. 01 ·{' '}
      </tspan>
      <tspan fontFamily={FONT.hindi} fontWeight={700} fontSize={42} letterSpacing={0}>
        खट्टा मीठा
      </tspan>
    </text>
  </g>
);
