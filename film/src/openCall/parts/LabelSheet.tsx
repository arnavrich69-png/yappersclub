// The LABEL world's paper: imli orange, halftone, the label border (cream line, ink line, haldi
// diamonds on the corners) and paper grain over everything printed on it, as on the Night 01 story.
// The paper runs past the frame so a camera knock never shows its edge.

import React from 'react';
import {C} from '../../brand';
import {GrainFilter, HalftonePattern} from '../../components/Print';

const CORNERS: [number, number][] = [
  [40, 40],
  [1040, 40],
  [40, 1880],
  [1040, 1880],
];

const PERIMETER = {outer: 2 * (1000 + 1840), inner: 2 * (964 + 1804)};

/** `border` draws the label's border in (0 none, 1 all of it); the diamonds pop at the end. */
export const LabelSheet: React.FC<{uid: string; border?: number; children?: React.ReactNode}> = ({uid, border = 1, children}) => (
  <g>
    <defs>
      <HalftonePattern id={`${uid}-ht`} />
      <GrainFilter id={`${uid}-grain`} />
    </defs>
    <rect x={-60} y={-60} width={1200} height={2040} fill={C.imli} />
    <rect x={-60} y={-60} width={1200} height={2040} fill={`url(#${uid}-ht)`} />
    {border > 0 ? (
      <>
        <rect
          x={40}
          y={40}
          width={1000}
          height={1840}
          fill="none"
          stroke={C.cream}
          strokeWidth={10}
          strokeDasharray={border < 1 ? `${PERIMETER.outer * border} ${PERIMETER.outer}` : undefined}
        />
        <rect
          x={58}
          y={58}
          width={964}
          height={1804}
          fill="none"
          stroke={C.ink}
          strokeWidth={3}
          strokeDasharray={border < 1 ? `${PERIMETER.inner * border} ${PERIMETER.inner}` : undefined}
        />
      </>
    ) : null}
    {border >= 1
      ? CORNERS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 17} y={y - 17} width={34} height={34} transform={`rotate(45 ${x} ${y})`} fill={C.haldi} stroke={C.ink} strokeWidth={4} />
        ))
      : null}
    {children}
    <rect x={-60} y={-60} width={1200} height={2040} filter={`url(#${uid}-grain)`} opacity={0.5} style={{mixBlendMode: 'multiply'}} />
  </g>
);
