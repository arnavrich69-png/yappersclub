// A wrapper end at any stage between twisted and flat (see untwist.ts).

import React from 'react';
import {C} from '../brand';
import {MARK, type Side} from './mark';
import {endFolds, endOutline, type OpenState} from './untwist';

export const OpenEnd: React.FC<{side: Side; state: OpenState}> = ({side, state}) => {
  const outline = endOutline(side, state);
  const d = `M${outline.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' L')} Z`;
  return (
    <g>
      <path d={d} fill={C.imli} stroke={C.ink} strokeWidth={MARK.outline} strokeLinejoin="round" />
      {endFolds(side, state).map((f, i) => (
        <path
          key={i}
          d={`M${f.a[0].toFixed(2)},${f.a[1].toFixed(2)} L${f.b[0].toFixed(2)},${f.b[1].toFixed(2)}`}
          stroke={f.dark ? C.wrapperDark : C.wrapperLight}
          strokeWidth={f.dark ? 7.23 : 4.82}
          opacity={f.opacity}
        />
      ))}
    </g>
  );
};
