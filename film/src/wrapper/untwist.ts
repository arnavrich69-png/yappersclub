// A twisted wrapper end spinning open into a flat flap. Seen from the front, untwisting paper turns
// about the candy's long axis, so its height swings through cos(spin) while the pinched neck opens
// out into a straight edge. Crinkle is a per-frame jitter of the paper edge while it moves.

import {cubicPoints} from '../utils/curves';
import {clamp, lerp, lerpV, type V} from '../utils/math';
import {smoothNoise} from '../utils/random';
import {MARK, type Side} from './mark';

const ZIG: V[] = [
  [80.2, 339.1],
  [102.8, 379.3],
  [80.2, 419.5],
  [102.8, 459.6],
  [80.2, 499.8],
  [102.8, 540.0],
  [80.2, 580.2],
  [102.8, 620.4],
  [80.2, 660.5],
  [102.8, 700.7],
  [80.2, 740.9],
];
const CURVE_N = 8;
const TOP = MARK.body.y;
const BOTTOM = MARK.body.y + MARK.body.h;
/** Flat flaps reach under the body far enough to fill its rounded corners. */
const UNDER = 420;
const NECK_X = 240;

/** Left fan outline, exactly the mark's path, as points. */
const FAN: V[] = [
  ...cubicPoints([306.4, 407.4], [256.6, 478.1], [256.6, 487.0], [238.5, 460.4], CURVE_N),
  ...ZIG,
  ...cubicPoints([238.5, 619.6], [256.6, 593.0], [256.6, 601.9], [306.4, 672.6], CURVE_N),
];

/** The same outline once flat: a flap the height of the body with the serrated paper edge. */
const FLAP: V[] = [
  ...Array.from({length: CURVE_N + 1}, (_, i): V => [lerp(UNDER, NECK_X, i / CURVE_N), TOP]),
  ...ZIG.map((p, i): V => [p[0], lerp(TOP, BOTTOM, i / (ZIG.length - 1))]),
  ...Array.from({length: CURVE_N + 1}, (_, i): V => [lerp(NECK_X, UNDER, i / CURVE_N), BOTTOM]),
];

const ZIG_START = CURVE_N + 1;

export type OpenState = {
  /** 0 twisted (the logo), 1 flat. */
  open: number;
  /** Turn of the paper about the long axis, radians (0 and 2*pi both face the camera). */
  spin: number;
  /** 0..1 strength of the crinkle jitter. */
  crinkle: number;
  /** Time, for the jitter. */
  t: number;
};

export const TWISTED: OpenState = {open: 0, spin: 0, crinkle: 0, t: 0};
export const FLAT: OpenState = {open: 1, spin: 2 * Math.PI, crinkle: 0, t: 0};

const mirror = (p: V): V => [MARK.size - p[0], p[1]];

const spinY = (p: V, spin: number): V => [p[0], MARK.center[1] + (p[1] - MARK.center[1]) * Math.cos(spin)];

/** Outline of one wrapper end in mark coordinates. */
export const endOutline = (side: Side, s: OpenState): V[] => {
  const pts = FAN.map((p, i) => {
    let q = lerpV(p, FLAP[i], s.open);
    if (s.crinkle > 0 && i >= ZIG_START && i < ZIG_START + ZIG.length) {
      const frame = Math.floor(s.t * 30);
      q = [q[0] + 3.2 * s.crinkle * smoothNoise(`crx-${side}-${i}`, frame), q[1] + 3.2 * s.crinkle * smoothNoise(`cry-${side}-${i}`, frame)];
    }
    return spinY(q, s.spin);
  });
  return side === 'left' ? pts : pts.map(mirror);
};

/** Fold lines: radiating from the neck when twisted, flat creases across the flap when open. */
export const endFolds = (side: Side, s: OpenState) =>
  MARK.wrapper.folds.map(([neckY, edge, dark], i) => {
    const zigIndex = i + 1;
    const flatY = lerp(TOP, BOTTOM, zigIndex / (ZIG.length - 1));
    const a = lerpV([MARK.wrapper.foldNeckX, neckY], [UNDER - 120, flatY], s.open);
    const b = lerpV(edge, [edge[0], flatY], s.open);
    const pa = spinY(a, s.spin);
    const pb = spinY(b, s.spin);
    return {
      a: side === 'left' ? pa : mirror(pa),
      b: side === 'left' ? pb : mirror(pb),
      dark,
      opacity: lerp(dark ? 0.8 : 0.9, dark ? 0.3 : 0.35, clamp(s.open)),
    };
  });
