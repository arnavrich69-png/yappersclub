// Printing in and out on the wrapper: whatever is masked comes up through halftone dots that grow
// until they are solid (p 0 to 1), and goes away the same way in reverse.

import React from 'react';

export const PrintMask: React.FC<{id: string; p: number}> = ({id, p}) => (
  <>
    <pattern id={`${id}-dots`} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
      <circle cx={4} cy={4} r={0.2 + 5.6 * p} fill="#fff" />
    </pattern>
    <mask id={id} maskUnits="userSpaceOnUse" x={-100} y={-100} width={1280} height={2120}>
      <rect x={-100} y={-100} width={1280} height={2120} fill={`url(#${id}-dots)`} />
    </mask>
  </>
);
