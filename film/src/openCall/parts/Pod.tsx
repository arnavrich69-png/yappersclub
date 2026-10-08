// The tamarind pod from svg-parts (the designer's drawing), drawn in pod coordinates: 720 long,
// centred, stem to the right. `bite` takes a bite out of the left end: three tooth arcs with an
// ink edge where the pod was bitten.

import React from 'react';
import {C} from '../../brand';
import {POD} from './podArt';

const BITE: [number, number, number][] = [
  [-352, -26, 34],
  [-338, 4, 30],
  [-366, 18, 28],
];
const EDGE = 5;

const BiteMask: React.FC<{id: string; inset: number}> = ({id, inset}) => (
  <mask id={id} maskUnits="userSpaceOnUse" x={-420} y={-120} width={880} height={240}>
    <rect x={-420} y={-120} width={880} height={240} fill="#fff" />
    {BITE.map(([x, y, r]) => (
      <circle key={`${x}`} cx={x} cy={y} r={r - inset} fill="#000" />
    ))}
  </mask>
);

export const Pod: React.FC<{uid: string; bite?: boolean}> = ({uid, bite = false}) => (
  <g>
    <defs>
      <pattern id={`${uid}-ht`} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
        <circle cx={4} cy={4} r={2.2} fill={C.ink} opacity={0.22} />
      </pattern>
      <BiteMask id={`${uid}-bite`} inset={0} />
      <BiteMask id={`${uid}-edge`} inset={EDGE / 2} />
      <clipPath id={`${uid}-in`}>
        <path d={POD.outline} />
      </clipPath>
    </defs>
    <g mask={bite ? `url(#${uid}-bite)` : undefined}>
      <path d={POD.outline} transform="translate(8.3 8.3)" fill={C.ink} />
      <path d={POD.outline} fill={POD.fill} stroke={C.ink} strokeWidth={5.5} strokeLinejoin="round" />
      <path d={POD.outline} fill={`url(#${uid}-ht)`} />
      {POD.segments.map((d) => (
        <path key={d} d={d} stroke={POD.line} strokeWidth={3.7} fill="none" opacity={0.75} />
      ))}
      {POD.highlights.map((d) => (
        <path key={d} d={d} stroke={C.cream} strokeWidth={4.6} fill="none" strokeLinecap="round" opacity={0.45} />
      ))}
      <path d={POD.stem} stroke={POD.line} strokeWidth={8.3} fill="none" strokeLinecap="round" />
    </g>
    {bite ? (
      <g clipPath={`url(#${uid}-in)`} mask={`url(#${uid}-edge)`}>
        {BITE.map(([x, y, r]) => (
          <circle key={`e${x}`} cx={x} cy={y} r={r} fill="none" stroke={C.ink} strokeWidth={EDGE} />
        ))}
      </g>
    ) : null}
  </g>
);
