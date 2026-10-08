// Tansen's tomb in Gwalior, drawn like an illustration on an old candy wrapper: a small pavilion on a
// stepped plinth, three pointed arches, a deep eave with a little kiosk at each corner, and an onion
// dome with its finial. Cream, ink outline, halftone, a tamarind print shadow. Drawn on its base:
// (0, 0) is the middle of the ground line, up is negative.

import React from 'react';
import {C} from '../../brand';
import {HalftonePattern} from '../../components/Print';

const ARCHES = [-62, 0, 62];
const arch = (cx: number) =>
  `M${cx - 22},-46 L${cx - 22},-108 C${cx - 22},-127 ${cx - 9},-137 ${cx},-147 C${cx + 9},-137 ${cx + 22},-127 ${cx + 22},-108 L${cx + 22},-46 Z`;
const kiosk = (x: number) => `M${x - 15},-206 C${x - 18},-221 ${x - 7},-231 ${x},-236 C${x + 7},-231 ${x + 18},-221 ${x + 15},-206 Z`;

const SHAPES = {
  plinth: 'M-150,0 L-150,-24 L150,-24 L150,0 Z',
  step: 'M-128,-24 L-128,-46 L128,-46 L128,-24 Z',
  body: 'M-108,-46 L-108,-176 L108,-176 L108,-46 Z',
  eave: 'M-130,-176 L-118,-191 L118,-191 L130,-176 Z',
  drum: 'M-64,-191 L-64,-213 L64,-213 L64,-191 Z',
  dome: 'M-58,-213 C-86,-238 -76,-292 0,-316 C76,-292 86,-238 58,-213 Z',
};
const POSTS = [-104, 104].map((x) => `M${x - 12},-191 L${x - 12},-206 L${x + 12},-206 L${x + 12},-191 Z`);
const PETALS = Array.from({length: 9}, (_, i) => {
  const x = -52 + i * 13;
  return `M${x - 6.5},-213 Q${x},-228 ${x + 6.5},-213`;
}).join(' ');

const Solid: React.FC<{d: string; fill?: string}> = ({d, fill = C.cream}) => <path d={d} fill={fill} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />;

export const Tomb: React.FC<{uid: string}> = ({uid}) => {
  const all = [...Object.values(SHAPES), ...POSTS, ...[-104, 104].map(kiosk)];
  return (
    <g>
      <defs>
        <HalftonePattern id={`${uid}-ht`} />
        <clipPath id={`${uid}-in`}>
          {all.map((d) => (
            <path key={d} d={d} />
          ))}
        </clipPath>
      </defs>
      {/* Print shadow. */}
      <g transform="translate(8 10)" fill={C.tamarind}>
        {all.map((d) => (
          <path key={d} d={d} />
        ))}
        <rect x={-3} y={-344} width={6} height={30} />
      </g>
      <Solid d={SHAPES.plinth} />
      <Solid d={SHAPES.step} />
      <Solid d={SHAPES.body} />
      {ARCHES.map((cx) => (
        <Solid key={cx} d={arch(cx)} fill={C.tamarind} />
      ))}
      {/* A pierced stone screen (jali) in the middle arch. */}
      {[0, 1, 2].map((r) =>
        [-1, 0, 1].map((c) => <circle key={`${r}${c}`} cx={c * 9} cy={-66 - r * 12} r={2.6} fill={C.wrapperDark} />),
      )}
      <Solid d={SHAPES.eave} />
      {POSTS.map((d) => (
        <Solid key={d} d={d} />
      ))}
      {[-104, 104].map((x) => (
        <g key={x}>
          <Solid d={kiosk(x)} />
          <line x1={x} y1={-236} x2={x} y2={-246} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        </g>
      ))}
      <Solid d={SHAPES.drum} />
      <Solid d={SHAPES.dome} />
      <path d={PETALS} fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M-40,-262 C-34,-286 -18,-302 0,-310" fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      {/* Finial: a pot and its spike. */}
      <line x1={0} y1={-316} x2={0} y2={-346} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <circle cx={0} cy={-326} r={7} fill={C.haldi} stroke={C.ink} strokeWidth={4} />
      <g clipPath={`url(#${uid}-in)`}>
        <rect x={-160} y={-350} width={320} height={350} fill={`url(#${uid}-ht)`} />
      </g>
    </g>
  );
};
