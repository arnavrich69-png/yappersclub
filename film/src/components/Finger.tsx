// The plucking finger, drawn like the pointing hand printed on old packets: cream, ink outline,
// halftone, a solid tamarind print shadow. Seen from above, nail up. The finger points along -x;
// the hand is off frame along +x.

import React from 'react';
import {C} from '../brand';
import {toDeg, type V} from '../utils/math';
import {HalftonePattern} from './Print';

/** Where the thread sits under the fingertip pad, in the finger's own coordinates. */
export const FINGER_CONTACT: V = [30, 4];

const OUTLINE =
  'M1100,-63 L338,-58 C312,-62 286,-62 262,-57 L156,-53 C140,-56 124,-56 108,-52 ' +
  'C52,-50 2,-34 2,2 C2,36 46,54 112,55 L262,57 C287,62 310,62 336,59 L1100,64 Z';

const NAIL = 'M84,-30 L38,-30 C20,-30 13,-16 13,0 C13,16 20,30 38,30 L84,30 C92,22 94,12 94,0 C94,-12 92,-22 84,-30 Z';
const CUTICLE = 'M99,-27 C106,-14 106,14 99,27';
const CREASES = [
  'M126,-25 Q134,-9 126,9',
  'M137,-21 Q144,-7 137,7',
  'M280,-33 Q291,-9 280,15',
  'M293,-36 Q305,-9 293,19',
  'M306,-30 Q316,-9 306,13',
];

export type FingerPose = {
  /** World point that sits under the fingertip pad. */
  contact: V;
  /** Direction the finger runs towards the hand, radians (0 = hand off to the right). */
  angle: number;
  /** 0 = pressing the surface, 1 = lifted towards camera (bigger, shadow further away). */
  lift: number;
  /** Overall size (1 = the storyboard's proportion to the candy). */
  size?: number;
};

export const Finger: React.FC<{uid: string; pose: FingerPose}> = ({uid, pose}) => {
  const size = pose.size ?? 1;
  const scale = size * (1 + 0.05 * pose.lift);
  const shadow: V = [size * (9 + 22 * pose.lift), size * (13 + 28 * pose.lift)];
  const place = (extra: V = [0, 0]) =>
    `translate(${(pose.contact[0] + extra[0]).toFixed(2)} ${(pose.contact[1] + extra[1]).toFixed(2)}) ` +
    `rotate(${toDeg(pose.angle).toFixed(3)}) scale(${scale.toFixed(4)}) translate(${-FINGER_CONTACT[0]} ${-FINGER_CONTACT[1]})`;
  return (
    <g>
      <defs>
        <HalftonePattern id={`${uid}-ht`} grid={7} r={1.7} opacity={0.12} rotate={18} />
        <clipPath id={`${uid}-clip`}>
          <path d={OUTLINE} />
        </clipPath>
      </defs>
      <path d={OUTLINE} transform={place(shadow)} fill={C.tamarind} />
      <g transform={place()}>
        <path d={OUTLINE} fill={C.cream} />
        <rect x={-20} y={-80} width={1140} height={160} fill={`url(#${uid}-ht)`} clipPath={`url(#${uid}-clip)`} />
        <path d={NAIL} fill={C.cream} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={CUTICLE} fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
        {CREASES.map((d) => (
          <path key={d} d={d} fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />
        ))}
        <path d={OUTLINE} fill="none" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      </g>
    </g>
  );
};
