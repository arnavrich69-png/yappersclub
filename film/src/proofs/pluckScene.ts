// The one second pluck proof, as pure functions of time (seconds). Every layer asks "where is
// everything at time t?", so frames can be rendered in any order.
//
// Beat sheet (30 fps):
//   0.00 to 0.03  stillness
//   0.03 to 0.20  a finger slides in from the bottom right, decelerating, and reaches a little
//                 past the tip of the outer loose end (anticipation)
//   0.20 to 0.26  it settles back onto the tip and presses it down
//   0.26 to 0.42  it drags the end down and out: thread pays out of the knot, straightens, the
//                 knot gives and the candy leans in
//   0.42 to 0.53  held under tension, creeping a few more pixels (the breath before the pluck)
//   0.533         let go after frame 16; frame 17 is the first frame of the snap and carries the
//                 attack of the pluck sound. The finger carries on sideways as the thread slips
//                 off its tip, the way you pluck a string
//   0.53 to 1.00  the end snaps back past rest and rings: a decaying swing, plus a twang that
//                 flips side on every frame and dies away with the sound; the candy recoils

import {pluckEnvelope} from '../audio/pluck';
import type {FingerPose} from '../components/Finger';
import {inCubic, inOutCubic, inOutSine, inQuad, outCubic, releaseResponse, span} from '../utils/easing';
import {add, angleOf, applyPose, clamp, deg, fromAngle, lerp, lerpV, mul, rotate, smoothstep, sub, type Pose, type V} from '../utils/math';
import {smoothNoise} from '../utils/random';
import {cumulative, lengthOf, quad, type Polyline} from '../thread/geometry';
import {ringingEnd} from '../thread/pluck';
import {MARK} from '../wrapper/mark';
import {THREAD} from '../brand';

const THREAD_SHADOW = THREAD.shadowOffsetRatio;

export const FPS = 30;
export const DURATION_FRAMES = 30;
/** Last frame the finger holds the thread. */
export const RELEASE_FRAME = 16;
/** First frame that shows the snap: the attack of the pluck sound lands here. */
export const SNAP_FRAME = RELEASE_FRAME + 1;

export const T = {
  enter: 0.03,
  arrive: 0.2,
  hook: 0.26,
  pullEnd: 0.42,
  release: RELEASE_FRAME / FPS,
  slipEnd: 0.6,
  exitEnd: 0.88,
};

/** The finger is drawn a little smaller than the storyboard so the thread stays the hero. */
export const FINGER_SIZE = 0.86;

/** The candy sits a little above centre, as in the storyboard. Mark (540, 540) maps here. */
export const CANDY_CENTER: V = [540, 860];
export const MARK_TO_WORLD: V = [CANDY_CENTER[0] - MARK.center[0], CANDY_CENTER[1] - MARK.center[1]];

const R = MARK.ends.right;
const K0 = R.knot;
const restB = quad(K0, R.b.ctrl, R.b.tip, 48);
const L0 = lengthOf(restB);
const REST_CHORD = sub(R.b.tip, K0);

/** The finger drags the end almost straight down, a little under the candy. */
const PULL_DIR = deg(97);
const PULL_LEN = 292;
const CREAK = 7;
const KNOT_GIVE = 6;

const world = (p: V, pose: Pose) => applyPose(add(p, MARK_TO_WORLD), pose);
const HOOK: V = add(R.b.tip, MARK_TO_WORLD);
const K_REST_W: V = add(K0, MARK_TO_WORLD);

// Tension in the thread while the finger holds it (0..1), and how the candy follows it.
const pullP = (t: number) => span(t, T.hook, T.pullEnd, inOutCubic);
const creakP = (t: number) => span(t, T.pullEnd, T.release, inQuad);
const heldTension = (t: number) => 0.82 * pullP(t) + 0.18 * creakP(t);
const TENSION_AT_RELEASE = heldTension(T.release);

/** Candy lean: follows the pull, then springs back past rest when the thread lets go. */
const candyLean = (t: number) =>
  t < T.release ? heldTension(t) : TENSION_AT_RELEASE * releaseResponse(t - T.release, 3.2, 0.3);
/** The knot gives a little towards the pull and snaps back faster than the candy. */
const knotGive = (t: number) =>
  t < T.release ? heldTension(t) : TENSION_AT_RELEASE * releaseResponse(t - T.release, 5.5, 0.28);

export const candyPose = (t: number): Pose => {
  const lean = candyLean(t);
  return {pivot: CANDY_CENTER, rad: deg(1.6) * lean, offset: [0, 5 * lean]};
};

/** Knot offset in mark space. */
export const knotShift = (t: number): V => mul(fromAngle(PULL_DIR), KNOT_GIVE * knotGive(t));

const knotWorld = (t: number) => world(add(K0, knotShift(t)), candyPose(t));

// ---------------------------------------------------------------- finger

const FINGER_IN = deg(64);
const P_OFF = add(HOOK, fromAngle(FINGER_IN, 980));
const P_OVER = add(HOOK, fromAngle(FINGER_IN + Math.PI, 18));
const P_PULL = add(K_REST_W, fromAngle(PULL_DIR, PULL_LEN));
const P_CREAK = add(P_PULL, fromAngle(PULL_DIR, CREAK));
/** Pluck: the fingertip carries on sideways and the thread slips off the other way. */
const SLIP = fromAngle(PULL_DIR + Math.PI / 2 + deg(10), 54);
const EXIT_DIR = deg(62);

export const fingerPose = (t: number): FingerPose => {
  let contact: V;
  let angle: number;
  let lift: number;
  if (t < T.arrive) {
    const k = span(t, T.enter, T.arrive, outCubic);
    contact = lerpV(P_OFF, P_OVER, k);
    angle = FINGER_IN;
    lift = lerp(0.9, 0.3, k);
  } else if (t < T.hook) {
    const k = span(t, T.arrive, T.hook, inOutSine);
    contact = lerpV(P_OVER, HOOK, k);
    angle = lerp(FINGER_IN, deg(68), k);
    lift = lerp(0.3, 0, k);
  } else if (t < T.pullEnd) {
    const k = pullP(t);
    contact = lerpV(HOOK, P_PULL, k);
    angle = lerp(deg(68), deg(76), k);
    lift = 0;
  } else if (t < T.release) {
    const k = creakP(t);
    // Strain: a few pixels more and a fine tremor.
    const tremor = 0.8 * smoothNoise('creak', t * 90) * k;
    contact = add(lerpV(P_PULL, P_CREAK, k), mul(fromAngle(PULL_DIR + Math.PI / 2), tremor));
    angle = deg(76);
    lift = 0;
  } else if (t < T.slipEnd) {
    const k = span(t, T.release, T.slipEnd, outCubic);
    contact = add(P_CREAK, mul(SLIP, k));
    angle = lerp(deg(76), deg(70), k);
    lift = k;
  } else {
    const k = span(t, T.slipEnd, T.exitEnd, inCubic);
    contact = add(add(P_CREAK, SLIP), fromAngle(EXIT_DIR, 1000 * k));
    angle = deg(70);
    lift = 1;
  }
  return {contact, angle, lift, size: FINGER_SIZE};
};

// ---------------------------------------------------------------- loose ends

export type EndState = {points: Polyline; material?: number[]; fray: 'end' | 'none'; shadow?: V | null};

/** Print shadow under the plucked end, easing in as the finger lifts it away from the candy. */
const endShadow = (k: number): V | null => (k <= 0 ? null : [0, MARK.ends.right.b.width * THREAD_SHADOW * k]);

const materialAlong = (pts: Polyline, mStart: number, mEnd: number) => {
  const c = cumulative(pts);
  const total = c[c.length - 1] || 1;
  return c.map((s) => mStart + ((mEnd - mStart) * s) / total);
};

/** What the finger is holding: the end from the knot to the fingertip. */
const heldEnd = (t: number) => {
  const k = knotWorld(t);
  const f = fingerPose(t).contact;
  const chord = sub(f, k);
  const len = Math.hypot(chord[0], chord[1]);
  const turn = angleOf(chord) - angleOf(REST_CHORD);
  const bent = add(k, mul(rotate(sub(R.b.ctrl, K0), turn), len / Math.hypot(REST_CHORD[0], REST_CHORD[1])));
  const straight = smoothstep(0, 0.45, pullP(t));
  const ctrl = lerpV(bent, lerpV(k, f, 0.5), straight);
  const points = quad(k, ctrl, f, 48);
  const stretch = 1 + 0.07 * heldTension(t);
  const mKnot = L0 - lengthOf(points) / stretch;
  return {points, mKnot, stretch, heading: angleOf(chord)};
};

const AT_RELEASE = heldEnd(T.release);
const PAID_OUT_LENGTH = L0 - AT_RELEASE.mKnot;

export const endB = (t: number): EndState => {
  if (t < T.hook) {
    // At rest, breathing very slightly.
    const lean = candyPose(t).rad;
    const sway = deg(0.6) * smoothNoise('endB', t * 1.7);
    const k = knotWorld(t);
    const pts = restB.map((p) => add(k, rotate(sub(p, K0), lean + sway)));
    return {points: pts, material: materialAlong(pts, 0, L0), fray: 'end'};
  }
  if (t < T.release) {
    const h = heldEnd(t);
    // The tip is under the fingertip pad, so its frayed strands are hidden.
    return {points: h.points, material: materialAlong(h.points, h.mKnot, L0), fray: 'none', shadow: endShadow(pullP(t))};
  }
  const tau = t - T.release;
  const lean = candyPose(t).rad;
  const start = AT_RELEASE.heading;
  const loud = Math.pow(clamp(pluckEnvelope(tau) / 0.92, 0, 1.2), 0.6);
  const ring = ringingEnd(knotWorld(t), {
    length: PAID_OUT_LENGTH,
    tau,
    // A longer end hangs a little more upright than the logo's short one.
    restHeading: (u) => deg(64) + deg(16) * u + lean,
    startHeading: () => start,
    swing: {f: 3.6, zeta: 0.16},
    ripples: [
      // The twang: the string bows out and back on alternate frames, dying with the sound.
      {shape: 'bow', k: 1, amp: 34, f: 15, decay: 7.5},
      // A slower ripple running down to the free tip.
      {shape: 'cantilever', k: 2, amp: 16, f: 7.5, decay: 5, phase: deg(-90)},
    ],
    rippleGain: loud,
    stretch: {amount: AT_RELEASE.stretch - 1, f: 7.5, zeta: 0.3},
  });
  return {points: ring.points, material: materialAlong(ring.points, L0 - PAID_OUT_LENGTH, L0), fray: 'end', shadow: endShadow(1)};
};

/** The inner end hangs from the same knot: dragged a little by the pull, then rings in sympathy. */
export const endA = (t: number): EndState => {
  const k = knotWorld(t);
  const lean = candyPose(t).rad;
  const drag = t < T.release ? deg(7) * heldTension(t) : deg(7) * TENSION_AT_RELEASE * releaseResponse(t - T.release, 6, 0.22);
  const sway = deg(0.6) * smoothNoise('endA', t * 1.5 + 4);
  const a = quad(K0, R.a.ctrl, R.a.tip, 40).map((p) => add(k, rotate(sub(p, K0), lean + drag + sway)));
  return {points: a, fray: 'end'};
};
