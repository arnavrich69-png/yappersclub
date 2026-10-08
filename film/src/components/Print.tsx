// The print world: halftone dots, paper grain and the haldi yellow ground.
// Values come from brand/tokens.json (label.halftone) and the grain filter used in night01/.

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FRAME, HALFTONE} from '../brand';

export const HalftonePattern: React.FC<{id: string; grid?: number; r?: number; opacity?: number; rotate?: number}> = ({
  id,
  grid = HALFTONE.gridPx,
  r = HALFTONE.dotRadiusPx,
  opacity = HALFTONE.opacity,
  rotate = HALFTONE.rotateDeg,
}) => (
  <pattern id={id} width={grid} height={grid} patternUnits="userSpaceOnUse" patternTransform={`rotate(${rotate})`}>
    <circle cx={grid / 2} cy={grid / 2} r={r} fill={C.ink} opacity={opacity} />
  </pattern>
);

/** Paper grain, the same recipe as the Night 01 posts. Static: it is the paper, not film grain. */
export const GrainFilter: React.FC<{id: string}> = ({id}) => (
  <filter id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} stitchTiles="stitch" result="n" />
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.40 -0.11" />
  </filter>
);

/** A full-frame SVG layer. Each layer is its own svg so layers can be blended for motion blur. */
export const Layer: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <AbsoluteFill style={style}>
    <svg width={FRAME.width} height={FRAME.height} viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} style={{overflow: 'visible'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

export const Ground: React.FC<{color?: string}> = ({color = C.haldi}) => (
  <Layer>
    <defs>
      <HalftonePattern id="ground-ht" />
      <GrainFilter id="ground-grain" />
    </defs>
    <rect width={FRAME.width} height={FRAME.height} fill={color} />
    <rect width={FRAME.width} height={FRAME.height} fill="url(#ground-ht)" />
    <rect width={FRAME.width} height={FRAME.height} filter="url(#ground-grain)" />
  </Layer>
);
