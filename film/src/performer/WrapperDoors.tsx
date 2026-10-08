// Brief 03 intro: the frame opens like an imli wrapper untwisting. Two flaps of wrapper fill the
// frame, their twisted ends just off the sides; the folds fan out as the twist lets go and the flaps
// swing open towards camera, serrated edges first.

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FRAME} from '../brand';
import {HalftonePattern} from '../components/Print';
import {inQuad, span} from '../utils/easing';
import {smoothNoise} from '../utils/random';

const W = FRAME.width / 2;
const H = FRAME.height;
const TOOTH = 64;
const DEPTH = 34;

/** The serrated edge where the two flaps meet (left flap), top to bottom. */
const serrated = (crinkle: number, frame: number) => {
  const pts: [number, number][] = [];
  for (let i = 0, y = -20; y <= H + 20; i++, y += TOOTH / 2) {
    const jitter = crinkle * 3 * smoothNoise(`door-${i}`, frame);
    pts.push([i % 2 === 0 ? W : W - DEPTH, y + jitter]);
  }
  return pts;
};

/** One flap, drawn as the left one; `mirror` draws the right one (the halftone keeps its angle). */
const Flap: React.FC<{uid: string; untwist: number; crinkle: number; frame: number; mirror?: boolean}> = ({uid, untwist, crinkle, frame, mirror = false}) => {
  const at = ([x, y]: [number, number]) => `${(mirror ? W - x : x).toFixed(1)},${y.toFixed(1)}`;
  const edge = serrated(crinkle, frame);
  const outline = `M${at([0, -20])} L${edge.map(at).join(' L')} L${at([0, H + 20])} Z`;
  // Folds radiate from the twisted neck just off the frame; as the twist lets go the neck moves
  // further away and the folds open out towards parallel.
  const neck: [number, number] = [-180 - 900 * untwist, H / 2];
  const folds = edge.filter((_, i) => i % 2 === 0 && i > 0);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible'}}>
      <defs>
        <HalftonePattern id={`${uid}-ht`} grid={7} r={1.7} opacity={0.16} rotate={18} />
        <clipPath id={`${uid}-clip`}>
          <path d={outline} />
        </clipPath>
      </defs>
      <path d={outline} fill={C.imli} />
      <path d={outline} fill={`url(#${uid}-ht)`} />
      {/* The folds stop at the flap: once it swings, anything past the hinge would show. */}
      <g clipPath={`url(#${uid}-clip)`}>
        {folds.map((p, i) => (
          <path
            key={i}
            d={`M${at(neck)} L${at([p[0] - 18, p[1]])}`}
            stroke={i % 2 === 0 ? C.wrapperDark : C.wrapperLight}
            strokeWidth={i % 2 === 0 ? 14 : 9}
            opacity={i % 2 === 0 ? 0.8 : 0.9}
          />
        ))}
      </g>
      <path d={`M${edge.map(at).join(' L')}`} fill="none" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
    </svg>
  );
};

/** Angle the flaps have swung open, degrees: a small press shut, then an accelerating swing. */
const swing = (frame: number, open: number, gone: number) => {
  const press = frame < open ? 2.5 * Math.sin((Math.PI * frame) / open) : 0;
  return press + 112 * span(frame, open, gone, inQuad);
};

export const WrapperDoors: React.FC<{frame: number; open: number; gone: number}> = ({frame, open, gone}) => {
  if (frame >= gone) return null;
  const a = swing(frame, open, gone);
  const untwist = span(frame, 0, gone);
  const crinkle = frame < gone ? 1 : 0;
  return (
    <AbsoluteFill style={{perspective: 1500, perspectiveOrigin: '540px 960px'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: 'left center', transform: `rotateY(${-a}deg)`}}>
        <Flap uid="door-l" untwist={untwist} crinkle={crinkle} frame={frame} />
      </div>
      <div style={{position: 'absolute', left: W, top: 0, width: W, height: H, transformOrigin: 'right center', transform: `rotateY(${a}deg)`}}>
        <Flap uid="door-r" untwist={untwist} crinkle={crinkle} frame={frame + 7} mirror />
      </div>
    </AbsoluteFill>
  );
};
