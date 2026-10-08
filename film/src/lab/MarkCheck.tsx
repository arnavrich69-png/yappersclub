// The film's tied imli drawn over the logo's own profile picture geometry, for checking fidelity.

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../brand';
import {HalftonePattern} from '../components/Print';
import {TiedImli} from '../wrapper/TiedImli';

export const MarkCheck: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.haldi}}>
    <svg width={1080} height={1080}>
      <defs>
        <HalftonePattern id="mc-ht" />
      </defs>
      <rect width={1080} height={1080} fill="url(#mc-ht)" />
      <TiedImli uid="mc" />
    </svg>
  </AbsoluteFill>
);
