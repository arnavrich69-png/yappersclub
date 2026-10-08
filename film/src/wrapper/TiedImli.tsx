// The tied imli from the logo, as separate layers that can each move:
// wrapper ends, thread wraps, knots, loose ends, body and the ध letter.
// Everything is drawn in the mark's own coordinates (see mark.ts); place it with a <g transform>.

import React from 'react';
import {C} from '../brand';
import {HalftonePattern} from '../components/Print';
import {add, angleOf, sub, toDeg, type V} from '../utils/math';
import {line, quad, type Polyline} from '../thread/geometry';
import {screenMatchedTwist} from '../thread/look';
import {RoundFilter, TwistPattern} from '../thread/ThreadDefs';
import {ThreadPiece, type Fray} from '../thread/ThreadPiece';
import {DHA_PATH} from './letterDha';
import {MARK, type Side} from './mark';

const mirrorX = (p: V): V => [MARK.size - p[0], p[1]];

/** Twisted wrapper end. `squeeze` > 0 pinches it towards the neck, `flare` opens the fan. */
export const WrapperEnd: React.FC<{side: Side; squeeze?: number; flare?: number}> = ({side, squeeze = 0, flare = 0}) => {
  const neck = MARK.wrapper.neck[side];
  const sx = 1 - squeeze;
  const sy = 1 + flare;
  const folds = MARK.wrapper.folds.map(([y, edge, dark]) => {
    const a: V = side === 'left' ? [MARK.wrapper.foldNeckX, y] : mirrorX([MARK.wrapper.foldNeckX, y]);
    const b: V = side === 'left' ? edge : mirrorX(edge);
    return {a, b, dark};
  });
  return (
    <g transform={`translate(${neck[0]} ${neck[1]}) scale(${sx} ${sy}) translate(${-neck[0]} ${-neck[1]})`}>
      <path d={MARK.wrapper[side]} fill={C.imli} stroke={C.ink} strokeWidth={MARK.outline} strokeLinejoin="round" />
      {folds.map(({a, b, dark}, i) => (
        <path
          key={i}
          d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`}
          stroke={dark ? C.wrapperDark : C.wrapperLight}
          strokeWidth={dark ? 7.23 : 4.82}
          opacity={dark ? 0.8 : 0.9}
        />
      ))}
    </g>
  );
};

const WRAP_TWIST = screenMatchedTwist(87);

/** The three turns of thread around a twisted end. */
export const Wraps: React.FC<{side: Side; uid: string; materialOffset?: number}> = ({side, uid, materialOffset = 0}) => (
  <g>
    {MARK.wraps[side].map(([a, b], i) => (
      <ThreadPiece
        key={i}
        uid={`${uid}-${side}-wrap${i}`}
        points={line(a, b, 40)}
        width={MARK.wraps.width}
        twistDeg={WRAP_TWIST}
        materialOffset={materialOffset + i * 11}
        roundBasis={MARK.roundBasis}
      />
    ))}
  </g>
);

export type EndKey = 'a' | 'b';

/** Loose end at rest: the logo's quadratic curve, optionally with the knot moved by `knotOffset`. */
export const restEnd = (side: Side, which: EndKey, knotOffset: V = [0, 0]): Polyline => {
  const e = MARK.ends[side];
  const spec = e[which];
  return quad(add(e.knot, knotOffset), add(spec.ctrl, knotOffset), add(spec.tip, knotOffset), 40);
};

/** Axis angle of a loose end at rest, in degrees (used to match the logo's strand angle). */
export const restAxisDeg = (side: Side, which: EndKey) => {
  const e = MARK.ends[side];
  return toDeg(angleOf(sub(e[which].tip, e.knot)));
};

export const endTwist = (side: Side, which: EndKey) => screenMatchedTwist(restAxisDeg(side, which));

export const LooseEnd: React.FC<{
  uid: string;
  side: Side;
  which: EndKey;
  points?: Polyline;
  material?: number[];
  materialOffset?: number;
  shadow?: V | null;
  fray?: Fray;
}> = ({uid, side, which, points, material, materialOffset = 0, shadow = null, fray = 'end'}) => {
  const spec = MARK.ends[side][which];
  return (
    <ThreadPiece
      uid={uid}
      points={points ?? restEnd(side, which)}
      material={material}
      materialOffset={materialOffset}
      width={spec.width}
      twistDeg={endTwist(side, which)}
      yellowCore={'yellowCore' in spec ? spec.yellowCore : 0}
      fray={fray}
      shadow={shadow}
      roundBasis={MARK.roundBasis}
      seed={`end-${side}-${which}`}
    />
  );
};

/** The rakhi knot as drawn in the logo (a tight knot seen from the front). */
export const KnotBlob: React.FC<{side: Side; uid: string; offset?: V; spin?: number}> = ({side, uid, offset = [0, 0], spin = 0}) => {
  const k = MARK.knots[side];
  const cx = k.rim.x + k.rim.w / 2;
  const cy = k.rim.y + k.rim.h / 2;
  return (
    <g transform={`translate(${offset[0]} ${offset[1]}) rotate(${spin} ${cx} ${cy})`}>
      <defs>
        <TwistPattern id={`${uid}-tw`} />
        <RoundFilter id={`${uid}-round`} x={k.rim.x - 30} y={k.rim.y - 30} width={k.rim.w + 60} height={k.rim.h + 60} />
      </defs>
      <g filter={`url(#${uid}-round)`}>
        <rect x={k.rim.x} y={k.rim.y} width={k.rim.w} height={k.rim.h} rx={k.rim.rx} fill="#74130C" />
        <rect x={k.fill.x} y={k.fill.y} width={k.fill.w} height={k.fill.h} rx={k.fill.rx} fill={`url(#${uid}-tw)`} />
      </g>
      <path d={k.crossing} stroke="#74130C" strokeWidth={2.8} fill="none" opacity={0.75} />
    </g>
  );
};

export const Body: React.FC<{uid: string}> = ({uid}) => {
  const b = MARK.body;
  return (
    <g>
      <defs>
        <HalftonePattern id={`${uid}-ht`} grid={MARK.halftone.grid} r={MARK.halftone.r} opacity={MARK.halftone.opacity} rotate={MARK.halftone.rotate} />
      </defs>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.rx} fill={C.imli} stroke={C.ink} strokeWidth={b.stroke} />
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.rx} fill={`url(#${uid}-ht)`} />
    </g>
  );
};

export const Letter: React.FC = () => (
  <g>
    <path
      d={DHA_PATH}
      transform={`translate(${MARK.letter.shadow[0]} ${MARK.letter.shadow[1]})`}
      fill={C.tamarind}
      stroke={C.tamarind}
      strokeWidth={MARK.letter.stroke}
      strokeLinejoin="round"
    />
    <path d={DHA_PATH} fill={C.cream} stroke={C.ink} strokeWidth={MARK.letter.stroke} strokeLinejoin="round" paintOrder="stroke" />
  </g>
);

export type ImliPart =
  | 'wrapperLeft'
  | 'wrapperRight'
  | 'wrapsLeft'
  | 'wrapsRight'
  | 'endsLeft'
  | 'endsRight'
  | 'knotLeft'
  | 'knotRight'
  | 'body'
  | 'letter';

export const ALL_PARTS: ImliPart[] = [
  'wrapperLeft',
  'wrapsLeft',
  'endsLeft',
  'knotLeft',
  'wrapperRight',
  'wrapsRight',
  'endsRight',
  'knotRight',
  'body',
  'letter',
];

/** The whole tied imli, or a chosen subset of its parts, in the logo's drawing order. */
export const TiedImli: React.FC<{uid: string; parts?: ImliPart[]}> = ({uid, parts = ALL_PARTS}) => {
  const has = (p: ImliPart) => parts.includes(p);
  return (
    <g>
      {ALL_PARTS.filter(has).map((p) => {
        switch (p) {
          case 'wrapperLeft':
            return <WrapperEnd key={p} side="left" />;
          case 'wrapperRight':
            return <WrapperEnd key={p} side="right" />;
          case 'wrapsLeft':
            return <Wraps key={p} side="left" uid={uid} />;
          case 'wrapsRight':
            return <Wraps key={p} side="right" uid={uid} />;
          case 'endsLeft':
            return (
              <g key={p}>
                <LooseEnd uid={`${uid}-lA`} side="left" which="a" />
                <LooseEnd uid={`${uid}-lB`} side="left" which="b" />
              </g>
            );
          case 'endsRight':
            return (
              <g key={p}>
                <LooseEnd uid={`${uid}-rA`} side="right" which="a" />
                <LooseEnd uid={`${uid}-rB`} side="right" which="b" />
              </g>
            );
          case 'knotLeft':
            return <KnotBlob key={p} side="left" uid={`${uid}-kL`} />;
          case 'knotRight':
            return <KnotBlob key={p} side="right" uid={`${uid}-kR`} />;
          case 'body':
            return <Body key={p} uid={uid} />;
          case 'letter':
            return <Letter key={p} />;
          default:
            return null;
        }
      })}
    </g>
  );
};
