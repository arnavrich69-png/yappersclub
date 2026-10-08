// Tansen's tamarind tree as one continuous line, like the line drawings on old candy wrappers: up
// the left of the trunk, along the underside of the left branch, round a leafy scalloped canopy, back
// along the underside of the right branch and down the right of the trunk. The thread is never cut to
// draw it: it is lifted into the shape from both trunk bases at once, a stop per note, and the rest
// of the outline between the two climbing points makes a low crown that rounds out as they climb.
// Also the shapes printed inside the outline (crown and trunk) and the pods. Frame coordinates.

import {cumulative} from '../../thread/geometry';
import {add, dist, mul, norm, perp, sub, type V} from '../../utils/math';
import {randRange} from '../../utils/random';

const Y = 672;
const CANOPY = {cx: 540, cy: 280, rx: 370, ry: 196};
/** The canopy outline runs between these angles (degrees; 90 is straight down). */
const ARC = {from: 128, to: 412};
const BUMPS = 22;

const ellipseAt = (deg: number): V => {
  const a = (deg * Math.PI) / 180;
  return [CANOPY.cx + CANOPY.rx * Math.cos(a), CANOPY.cy + CANOPY.ry * Math.sin(a)];
};

const quadBezier = (a: V, c: V, b: V, n: number): V[] =>
  Array.from({length: n}, (_, i) => {
    const t = (i + 1) / n;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  });

/** Scallops from a to b, each bulging to the left of the direction of travel, a little uneven. */
const scallops = (from: number, to: number, bumps: number, seed: string, at: (deg: number) => V): V[] => {
  const pts: V[] = [];
  for (let i = 0; i < bumps; i++) {
    const a = at(from + ((to - from) * i) / bumps);
    const b = at(from + ((to - from) * (i + 1)) / bumps);
    const out = mul(perp(norm(sub(b, a))), -1);
    const bulge = dist(a, b) * randRange(seed, i, 0.38, 0.62);
    if (i === 0) pts.push(a);
    pts.push(...quadBezier(a, add(mul(add(a, b), 0.5), mul(out, bulge)), b, 8));
  }
  return pts;
};

/** The canopy from the left branch's tip, round over the top, to the right branch's tip. */
const CANOPY_PTS = scallops(ARC.from, ARC.to, BUMPS, 'canopy', ellipseAt);

const C0 = ellipseAt(ARC.from);
const C1 = ellipseAt(ARC.to);

/** Up the left of the trunk and out along the underside of the left branch to the canopy. */
const trunkLeft: V[] = [
  [452, Y],
  [482, Y - 8],
  [500, Y - 34],
  [506, Y - 80],
  ...quadBezier([506, Y - 80], [500, Y - 140], [C0[0] + 40, C0[1] + 30], 10),
  C0,
];
/** Back from the canopy along the underside of the right branch and down the right of the trunk. */
const trunkRight: V[] = [
  ...quadBezier(C1, [C1[0] - 40, C1[1] + 30], [580, Y - 80], 10).slice(0, -1),
  [580, Y - 80],
  [586, Y - 34],
  [604, Y - 8],
  [636, Y],
];

/** The whole outline: trunk, branch, canopy, branch, trunk. */
export const TREE_LOOP: V[] = [...trunkLeft.slice(0, -1), ...CANOPY_PTS, ...trunkRight];
export const TREE_BASE = {left: trunkLeft[0][0], right: trunkRight[trunkRight.length - 1][0]};

const nearest = (pts: V[], p: V) => {
  let best = 0;
  for (let i = 1; i < pts.length; i++) if (dist(pts[i], p) < dist(pts[best], p)) best = i;
  return best;
};

const TOP = nearest(TREE_LOOP, ellipseAt(270));

/** The two halves the thread climbs at once, each from its trunk base up to the top of the canopy. */
export const TREE_HALVES: {left: V[]; right: V[]} = {
  left: TREE_LOOP.slice(0, TOP + 1),
  right: TREE_LOOP.slice(TOP).reverse(),
};

/**
 * How far up each half the climbing points have got after each note (arc lengths): the trunk and its
 * branch, the lower canopy, the upper canopy, then together at the top.
 */
const stopsOf = (half: V[], marks: V[]) => {
  const c = cumulative(half);
  return [0, ...marks.map((m) => c[nearest(half, m)]), c[c.length - 1]];
};
export const TREE_STOPS = {
  left: stopsOf(TREE_HALVES.left, [C0, ellipseAt(176), ellipseAt(222)]),
  right: stopsOf(TREE_HALVES.right, [C1, ellipseAt(364), ellipseAt(318)]),
};

// ---------------------------------------------------------------- what is printed inside the outline

const toD = (pts: V[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;

/** The crown: the canopy, closed underneath by a leafy edge that dips between the branches. */
const UNDERSIDE = scallops(0, 1, 7, 'underside', (t) => {
  const u = 1 - t;
  return [u * u * C1[0] + 2 * u * t * 540 + t * t * C0[0], u * u * C1[1] + 2 * u * t * 556 + t * t * C0[1]];
});
export const CROWN_D = toD([...CANOPY_PTS, ...UNDERSIDE.slice(1)]);

/** Trunk and branches: the outline's own trunk sides, forking at the crotch into the crown. */
const CROTCH: V = [543, 552];
export const TRUNK_D = toD([
  ...trunkLeft,
  [C0[0] + 24, C0[1] - 40],
  ...quadBezier([C0[0] + 24, C0[1] - 40], [470, 470], CROTCH, 8),
  ...quadBezier(CROTCH, [612, 470], [C1[0] - 24, C1[1] - 40], 8),
  ...trunkRight,
]);
/** A few lines of bark. */
export const BARK_D = ['M520 664 Q526 630 522 600', 'M556 660 Q552 626 560 596', 'M506 548 Q478 516 444 488', 'M580 548 Q608 516 642 488'].join(' ');

/** Where a pod's stem tucks under the canopy's lower edge near x. */
const canopyEdgeAt = (x: number): V => {
  const near = CANOPY_PTS.filter((p) => Math.abs(p[0] - x) < 24 && p[1] > CANOPY.cy);
  return [x, Math.max(...near.map((p) => p[1])) + 14];
};

/** Pods hanging from the canopy's lower edge, either side of the branches, and their tilt (degrees). */
export const PODS: {at: V; tilt: number}[] = [
  {at: canopyEdgeAt(206), tilt: 6},
  {at: canopyEdgeAt(266), tilt: -4},
  {at: canopyEdgeAt(800), tilt: 3},
  {at: canopyEdgeAt(860), tilt: -6},
];
/** The pod that falls in scene 3. */
export const FALLING_POD = 2;
export const POD_SCALE = 0.25;
