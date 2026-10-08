// Easing families and material responses. Times are in seconds, always continuous, so any
// moment can be sampled (motion blur samples between frames).

import {clamp} from './math';

export type Ease = (x: number) => number;

export const linear: Ease = (x) => x;
export const inCubic: Ease = (x) => x * x * x;
export const outCubic: Ease = (x) => 1 - Math.pow(1 - x, 3);
export const inOutCubic: Ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const inQuad: Ease = (x) => x * x;
export const inOutSine: Ease = (x) => -(Math.cos(Math.PI * x) - 1) / 2;

/** Progress of t through [t0, t1], clamped to 0..1 and eased. */
export const span = (t: number, t0: number, t1: number, ease: Ease = linear) => ease(clamp((t - t0) / (t1 - t0)));

/**
 * Release of a mass-spring from a displaced state with zero velocity: starts at 1, ends at 0,
 * crossing zero and overshooting when zeta < 1. f is the natural frequency in Hz.
 */
export const releaseResponse = (t: number, f: number, zeta: number) => {
  if (t <= 0) return 1;
  const w = 2 * Math.PI * f;
  if (zeta >= 1) return Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
};

/** Step response of the same oscillator: starts at 0, settles at 1 with overshoot when zeta < 1. */
export const settle = (t: number, f: number, zeta: number) => 1 - releaseResponse(t, f, zeta);
