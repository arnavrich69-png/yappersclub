// The orange label the wrapper becomes: the lockup's label body with its dashed border and small
// print. Drawn in lockup coordinates; LABEL_PLACE puts it in the 9:16 frame so ध्वनि's headline bar
// sits on the thread's grid height (y = 672) and every word stays clear of the Reels buttons.

import React from 'react';
import {C, THREAD} from '../brand';
import {HalftonePattern} from '../components/Print';
import {LOCKUP, SMALL_PRINT} from './lockup';

/** Scale of the lockup in the film: keeps the wordmark's right edge inside x = 940. */
export const LABEL_SCALE = 0.92;

/** Lockup point to frame point. */
export const labelToWorld = (x: number, y: number): [number, number] => [
  (x - LOCKUP.centerX) * LABEL_SCALE + 540,
  (y - LOCKUP.headlineY) * LABEL_SCALE + THREAD.gridY9x16,
];

export const LABEL_PLACE = `translate(540 ${THREAD.gridY9x16}) scale(${LABEL_SCALE}) translate(${-LOCKUP.centerX} ${-LOCKUP.headlineY})`;

/** The label's box in the frame. */
export const LABEL_BOX = (() => {
  const l = LOCKUP.label;
  const [x0, y0] = labelToWorld(l.x, l.y);
  const [x1, y1] = labelToWorld(l.x + l.w, l.y + l.h);
  return {x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2};
})();

export const LabelArt: React.FC<{uid: string}> = ({uid}) => {
  const l = LOCKUP.label;
  const b = LOCKUP.border;
  return (
    <g>
      <defs>
        <HalftonePattern id={`${uid}-ht`} grid={7} r={1.7} opacity={0.16} rotate={18} />
      </defs>
      <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={l.rx} fill={C.imli} stroke={C.ink} strokeWidth={l.stroke} />
      <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={l.rx} fill={`url(#${uid}-ht)`} />
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={b.rx}
        fill="none"
        stroke={C.cream}
        strokeWidth={b.stroke}
        strokeDasharray={b.dash}
        strokeLinecap="round"
      />
      <path d={SMALL_PRINT.left} fill={C.cream} />
      <path d={SMALL_PRINT.right} fill={C.cream} />
    </g>
  );
};
