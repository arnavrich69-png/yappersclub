// Shared SVG definitions for the kalava look on shapes that are not a single path (knots).

import React from 'react';

/** The roundness filter from the svg files, for the solid thread shapes (knots). */
export const RoundFilter: React.FC<{id: string; x: number; y: number; width: number; height: number; basis?: number}> = ({
  id,
  basis = 30,
  ...box
}) => (
  <filter id={id} filterUnits="userSpaceOnUse" {...box}>
    <feGaussianBlur in="SourceAlpha" stdDeviation={0.16 * basis} result="b" />
    <feDiffuseLighting in="b" surfaceScale={0.09 * basis} diffuseConstant={1.05} lightingColor="#fff" result="l">
      <feDistantLight azimuth={235} elevation={52} />
    </feDiffuseLighting>
    <feComposite in="l" in2="SourceAlpha" operator="in" result="lc" />
    <feBlend in="SourceGraphic" in2="lc" mode="multiply" />
  </filter>
);

/** The designer's screen-space twist pattern, for shapes that are not a path (the knot). */
export const TwistPattern: React.FC<{id: string}> = ({id}) => (
  <pattern id={id} width={30} height={30} patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
    <rect width={30} height={30} fill="#B8231A" />
    <rect x={0} width={3.2} height={30} fill="#F2B21E" />
    <rect x={3.2} width={1.2} height={30} fill="#74130C" opacity={0.6} />
    <rect x={8} width={2.6} height={30} fill="#D23A26" opacity={0.9} />
    <rect x={11} width={1} height={30} fill="#74130C" opacity={0.55} />
    <rect x={15} width={2.6} height={30} fill="#D23A26" opacity={0.9} />
    <rect x={18} width={1} height={30} fill="#74130C" opacity={0.55} />
    <rect x={22} width={2.4} height={30} fill="#D23A26" opacity={0.85} />
    <rect x={25} width={1.4} height={30} fill="#74130C" opacity={0.6} />
  </pattern>
);
