// Every beat of the logo film in one place (seconds unless named in frames). 30 fps, 5.4 s.
//
//   0.0 to 0.5  the tied imli settles on haldi
//   0.5 to 1.2  the approved pluck (finger in, drag, let go on frame 28, twang)
//   1.2 to 2.0  both knots slip, the threads are pulled off and whip out of frame, the twisted
//               ends spin open with a crinkle into a flat sheet
//   2.0 to 2.8  the sheet tips towards camera and lands as the label; ध्वनि KUL pops in
//   2.8 to 3.6  the thread whips back in across y = 672, strung behind the headline, ties a rakhi
//               knot, and the final tug plucks it lightly
//   3.6 to 4.2  the FLAVOUR No. 01 seal stamps down on the downbeat
//   4.2 to 5.4  SOUND. PEOPLE. CULTURE. types in, then hold

import {SNAP_FRAME} from '../proofs/pluckScene';

export const FPS = 30;
export const FILM_FRAMES = 162;

/** The approved one second pluck proof starts this far into the film. */
export const PLUCK_OFFSET = 0.4;

export const B = {
  slip: {right: 1.2, left: 1.25},
  untwist: {start: 1.5, end: 1.97},
  flip: {start: 2.0, end: 2.45},
  pop: {dhva: 2.42, ni: 2.48, K: 2.55, U: 2.6, L: 2.65} as Record<string, number>,
  thread: {enter: 2.8, arrive: 3.0, taut: 3.22},
  knot: {cinch: 3.04},
  lightPluck: 100 / FPS,
  sealImpact: 108 / FPS,
  typing: 126 / FPS,
};

/** Frames that carry a sound's attack. */
export const CUE = {
  pluck: SNAP_FRAME + Math.round(PLUCK_OFFSET * FPS),
  crinkle: Math.round(B.untwist.start * FPS),
  lightPluck: 100,
  thud: 108,
};
