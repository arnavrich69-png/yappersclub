// A clay diya hung on the thread by a brass hook and two little chains, drawn like an illustration
// on an old candy wrapper. Unlit it is a dark silhouette waiting in the dark; lit, the clay is imli
// orange, the oil haldi, the brass catches the light and a flame stands on the spout. The flame is
// flat haldi with a cream heart and an ink outline: light in this world is printed, never a glow.
// Drawn on its hook: (0, 0) is the middle of the thread it hangs on, down is positive.

import React from 'react';
import {C} from '../../brand';
import {HalftonePattern} from '../../components/Print';

/** Where the flame stands (the wick on the spout) and its height, in the diya's own coordinates. */
export const WICK = {x: 66, y: 96} as const;
export const FLAME_HEIGHT = 44;
/** The middle of the flame: where its pool of light is centred. */
export const FLAME_CENTRE = {x: WICK.x, y: WICK.y - FLAME_HEIGHT * 0.45} as const;

const HOOK = 'M17,6 C20,-8 12,-23 0,-23 C-14,-23 -22,-11 -21,2 C-20,14 -13,24 -4,31 L0,34 L0,44';
const BODY = 'M-46,112 C-45,131 -26,143 0,143 C21,143 37,136 47,121 L67,104 C69,101 66,98 62,99 L44,109 Z';
const CHAINS = ['M-2,46 L-38,110', 'M2,46 L36,110'];
const FLAME = 'M0,-44 C9,-30 14,-17 11,-7 C9,-1 4,2 0,2 C-4,2 -9,-1 -11,-7 C-14,-17 -9,-30 0,-44 Z';
const HEART = 'M0,-24 C5,-17 7,-10 5,-5 C4,-2 2,-1 0,-1 C-2,-1 -4,-2 -5,-5 C-7,-10 -5,-17 0,-24 Z';

export type Flame = {
  /** 0 out, 1 burning (a little over 1 overshoots as it catches). */
  size: number;
  /** Flicker: vertical stretch and a lean, both small. */
  stretch: number;
  lean: number;
};

export const Diya: React.FC<{uid: string; lit: boolean; flame: Flame | null}> = ({uid, lit, flame}) => {
  const brass = lit ? C.haldi : C.tamarind;
  const clay = lit ? C.imli : C.tamarind;
  const line = lit ? C.ink : '#2A1A10';
  return (
    <g>
      <defs>
        <HalftonePattern id={`${uid}-ht`} grid={7} r={1.6} opacity={0.16} rotate={18} />
      </defs>
      {CHAINS.map((d) => (
        <path key={d} d={d} fill="none" stroke={brass} strokeWidth={5.5} strokeLinecap="round" strokeDasharray="0.1 7.5" />
      ))}
      <path d={HOOK} fill="none" stroke={line} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      <path d={HOOK} fill="none" stroke={brass} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={0} cy={46} r={5} fill={brass} stroke={line} strokeWidth={2.5} />
      {/* Print shadow, the clay, its halftone, the oil seen over the rim. */}
      {lit ? <path d={BODY} transform="translate(5 6)" fill={C.tamarind} /> : null}
      <path d={BODY} fill={clay} stroke={line} strokeWidth={5} strokeLinejoin="round" />
      {lit ? <path d={BODY} fill={`url(#${uid}-ht)`} /> : null}
      <ellipse cx={-1} cy={111} rx={44} ry={7} fill={lit ? C.haldi : '#4A2613'} stroke={line} strokeWidth={4} />
      <path d={`M${WICK.x - 4},${WICK.y + 5} L${WICK.x + 1},${WICK.y - 2}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      {flame && flame.size > 0 ? (
        <g transform={`translate(${WICK.x} ${WICK.y}) rotate(${flame.lean.toFixed(2)}) scale(${(flame.size * (1 - 0.3 * (flame.stretch - 1))).toFixed(4)} ${(flame.size * flame.stretch).toFixed(4)})`}>
          <path d={FLAME} fill={C.haldi} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
          <path d={HEART} fill={C.cream} />
        </g>
      ) : null}
    </g>
  );
};
