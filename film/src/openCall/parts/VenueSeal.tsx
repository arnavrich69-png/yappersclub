// The film's one seal: PACKED AT · PADHARO SA · GWALIOR · NIGHT 01 round the venue's logo, drawn as on
// the Night 01 story. Centred on 0,0 at the seal's radius (112), so the stamp physics in Seal.tsx can
// carry it. Rendering waits until the logo image has loaded.

import React, {useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {C} from '../../brand';
import {FONT} from '../../components/fonts';

const LOGO = staticFile('images/padharo-sa-logo.png');
const RIM = 90.2;
const INNER = 68.3;

export const VenueSealArt: React.FC<{uid: string}> = ({uid}) => {
  const [handle] = useState(() => delayRender('Padharo Sa logo'));
  const ring = `M${-RIM},0 a${RIM},${RIM} 0 1,1 ${2 * RIM},0 a${RIM},${RIM} 0 1,1 ${-2 * RIM},0`;
  return (
    <g>
      <defs>
        <path id={`${uid}-rim`} d={ring} />
        <clipPath id={`${uid}-logo`}>
          <circle r={INNER} />
        </clipPath>
      </defs>
      <circle r={112} fill={C.cream} stroke={C.ink} strokeWidth={5} />
      <text fontFamily={FONT.label} fontWeight={800} fontSize={22.4} letterSpacing={2.5} fill={C.ink}>
        <textPath href={`#${uid}-rim`} textLength={558} lengthAdjust="spacing">
          PACKED AT · PADHARO SA · GWALIOR · NIGHT 01 ·{' '}
        </textPath>
      </text>
      <image
        href={LOGO}
        x={-72.3}
        y={-72.3}
        width={144.6}
        height={144.6}
        clipPath={`url(#${uid}-logo)`}
        preserveAspectRatio="xMidYMid slice"
        onLoad={() => continueRender(handle)}
        onError={() => cancelRender(new Error('could not load images/padharo-sa-logo.png'))}
      />
      <circle r={INNER} fill="none" stroke={C.ink} strokeWidth={4} />
    </g>
  );
};
