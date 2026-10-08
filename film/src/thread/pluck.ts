// Plucking: pull the thread into a curve, let go, and it rings as a decaying standing wave.
// Two boundary cases:
//   pluckedSpan  a thread held at both ends (string on a sweet box, tanpura string): fixed-fixed modes.
//   ringingEnd   a loose end held only at the knot (like a ruler twanged off a table): it swings
//                back past rest and ripples, with the knot as the node.
// Everything is a pure function of time since release, so any moment can be drawn (motion blur).

import {add, lerpV, mul, norm, perp, sub, type V} from '../utils/math';
import {releaseResponse} from '../utils/easing';
import {steer, type Polyline} from './geometry';

export type Ring = {f: number; zeta: number};

/**
 * A thread between two fixed points, plucked at `at` (0..1 along it) by `amount` px sideways.
 * Before release (`tau` < 0) it is held in the pulled triangle, scaled by `pull` (0..1).
 * After release it is the sum of its first `modes` standing waves, each decaying,
 * higher harmonics faster, so the shape smooths out as it rings (as a real string does).
 */
export const pluckedSpan = (
  a: V,
  b: V,
  opts: {at: number; amount: number; tau: number; pull?: number; f1: number; decay: number; modes?: number; envelope?: number; n?: number},
): Polyline => {
  const {at, amount, tau, pull = 1, f1, decay, modes = 16, envelope = 1, n = 80} = opts;
  const dir = sub(b, a);
  const side = perp(norm(dir));
  const p = Math.min(0.97, Math.max(0.03, at));
  const out: Polyline = [];
  for (let i = 0; i <= n; i++) {
    const x = i / n;
    let y: number;
    if (tau < 0) {
      y = amount * pull * (x < p ? x / p : (1 - x) / (1 - p));
    } else {
      y = 0;
      for (let k = 1; k <= modes; k++) {
        const ck = (2 * amount * Math.sin(k * Math.PI * p)) / (k * k * Math.PI * Math.PI * p * (1 - p));
        const wk = 2 * Math.PI * f1 * k;
        const gk = decay * (1 + 0.55 * (k - 1));
        y += ck * Math.sin(k * Math.PI * x) * Math.cos(wk * tau) * Math.exp(-gk * tau);
      }
      y *= envelope;
    }
    out.push(add(lerpV(a, b, x), mul(side, y)));
  }
  return out;
};

/**
 * A standing wave on a loose end, `u` from 0 at the knot to 1 at the tip.
 *   bow:        sin(k*pi*u). The tip stays on the line, the middle bows: the twang of a held string.
 *   cantilever: sin((2k-1)*pi*u/2). The knot is the only node, the tip moves most.
 * `amp` is the peak sideways displacement in px. With cos timing at 15 Hz the sign flips on every
 * frame at 30 fps: the cartoon twang, crisp on each frame instead of a blurred (colour-mixing) smear.
 */
export type Ripple = {shape: 'bow' | 'cantilever'; k: number; amp: number; f: number; decay: number; phase?: number};

const rippleTime = (tau: number, r: Ripple) =>
  tau <= 0 ? 0 : Math.cos(2 * Math.PI * r.f * tau + (r.phase ?? 0)) * Math.exp(-r.decay * tau) * (1 - Math.exp(-tau / 0.008));

/** Heading change (radians) a ripple adds at position u on an end of screen length L. */
const rippleSlope = (r: Ripple, u: number, L: number) => {
  const m = r.shape === 'bow' ? r.k * Math.PI : ((2 * r.k - 1) * Math.PI) / 2;
  return ((r.amp * m) / L) * Math.cos(m * u);
};

/**
 * A loose end hanging from a knot after it was pulled out to `startHeading` and let go.
 * Headings are in radians, as functions of position along the end (0 at the knot, 1 at the tip).
 * The end swings back towards `restHeading` with overshoot (`swing`) while `ripples` ring along
 * it. The shape is built from headings, so the cotton keeps its length; `stretch` adds an elastic
 * recoil that settles to 0.
 */
export const ringingEnd = (
  anchor: V,
  opts: {
    length: number;
    tau: number;
    restHeading: (u: number) => number;
    startHeading: (u: number) => number;
    swing: Ring;
    ripples?: Ripple[];
    /** Extra multiplier on the ripples, for following the loudness of the sound. */
    rippleGain?: number;
    stretch?: {amount: number; f: number; zeta: number};
    n?: number;
  },
): {points: Polyline; screenLength: number} => {
  const {length, tau, restHeading, startHeading, swing, ripples = [], rippleGain = 1, stretch, n = 72} = opts;
  const back = releaseResponse(tau, swing.f, swing.zeta);
  const eps = stretch ? stretch.amount * releaseResponse(tau, stretch.f, stretch.zeta) : 0;
  const screenLength = length * (1 + eps);
  const timing = ripples.map((r) => rippleTime(tau, r) * rippleGain);
  const heading = (s: number) => {
    const u = s / screenLength;
    let h = restHeading(u) + (startHeading(u) - restHeading(u)) * back;
    ripples.forEach((r, i) => {
      h += timing[i] * rippleSlope(r, u, screenLength);
    });
    return h;
  };
  return {points: steer(anchor, screenLength, heading, n), screenLength};
};
