// Small 2D vector and number helpers. Points are [x, y] tuples in SVG pixels (y points down).

export type V = [number, number];

export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
export const dist = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1]);
  return l < 1e-9 ? [1, 0] : [a[0] / l, a[1] / l];
};
/** The normal on the right-hand side of a direction on screen: (1,0) gives (0,1), which points down. */
export const perp = (a: V): V => [-a[1], a[0]];
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpV = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const deg = (d: number) => (d * Math.PI) / 180;
export const toDeg = (r: number) => (r * 180) / Math.PI;
export const fromAngle = (rad: number, r = 1): V => [Math.cos(rad) * r, Math.sin(rad) * r];
export const angleOf = (a: V) => Math.atan2(a[1], a[0]);
export const rotate = (a: V, rad: number): V => {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [a[0] * c - a[1] * s, a[0] * s + a[1] * c];
};
export const rotateAround = (p: V, center: V, rad: number): V => add(center, rotate(sub(p, center), rad));

/** Affine transform: rotate by `rad` around `pivot`, then translate by `offset`. */
export type Pose = {pivot: V; rad: number; offset: V};
export const applyPose = (p: V, pose: Pose): V => add(rotateAround(p, pose.pivot, pose.rad), pose.offset);
export const poseToSvg = (pose: Pose) =>
  `translate(${pose.offset[0].toFixed(3)} ${pose.offset[1].toFixed(3)}) rotate(${toDeg(pose.rad).toFixed(4)} ${pose.pivot[0]} ${pose.pivot[1]})`;

export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
