// The open call film's clock (open-call/visual-screenplay.json and beat-map.json). 90 BPM at 30 fps is
// exactly 20 frames a beat and 80 a bar, so every beat, eighth and sixteenth lands on a whole frame.

export const OCF = {fps: 30, framesPerBeat: 20, beatsPerBar: 4, bars: 15, frames: 1200} as const;

/** Frame of a beat: bar and beat count from 1, beats can be fractional (1.5 is the "and" of 1). */
export const at = (bar: number, beat = 1) => (bar - 1) * OCF.framesPerBeat * OCF.beatsPerBar + (beat - 1) * OCF.framesPerBeat;

export const seconds = (frame: number) => frame / OCF.fps;

/** The nine scenes of the screenplay, [first frame, end frame). */
export const SCENE = {
  question: [at(1), at(2)],
  legend: [at(2), at(4)],
  recipe: [at(4), at(5)],
  ingredients: [at(5), at(8)],
  silence: [at(8), at(8, 3)],
  yourTurn: [at(8, 3), at(10)],
  ritual: [at(10), at(13)],
  packed: [at(13), at(15)],
  dm: [at(15), OCF.frames],
} as const;

/** Moments the picture lands on, each on a beat of the score. */
export const HIT = {
  // 1 · पहला सुर किसका?
  firstNote: at(1, 1),
  rising: [at(1, 3), at(1, 3.5), at(1, 4)],
  question: at(1, 4),
  english1: at(1, 3),
  panStart: at(1, 4),
  panEnd: at(2, 1.2),
  // 2 · तानसेन की इमली: the tree is drawn a part per note
  draw: [at(2, 1), at(2, 3), at(3, 1), at(3, 3)],
  title: at(2, 3),
  english2: at(3, 1),
  pods: at(3, 1.8),
  leaves: at(3, 3.5),
  // 3 · packed: the pod falls, is caught, wrapped, tied and flung into the packet
  podFalls: at(4, 1),
  wrap: at(4, 3),
  knot: at(4, 4),
  fling: at(4, 4) + 2,
  label: at(4, 4) + 4,
  // 4 · the ingredients, a row a beat, then the missing one
  panel: at(5, 1) - 8,
  rows: [at(5, 1), at(5, 3), at(6, 1), at(6, 3), at(6, 4)],
  headline: at(7, 1),
  // 5 and 6 · the silence, the yank, the light, तेरी बारी
  silence: at(8, 1),
  yank: at(8, 3),
  light: at(8, 4),
  teri: at(9, 1),
  bari: at(9, 2),
  bring: at(9, 3),
  // 7 · मीठी डोर
  ritual: at(10, 1),
  tagOut: at(10, 1),
  bite: at(10, 3),
  wrist: at(11, 1),
  tie: at(11, 3),
  kul: at(12, 1),
  wordmark: at(12, 3),
  // 8 and 9 · the night, then your name
  stamp: at(13, 1),
  tagBack: at(15, 1),
  dm: at(15, 2),
  tieOff: at(15, 3),
} as const;

/** The thread lies dead still for a beat under AUTOTUNE 0%. */
export const STILL: [number, number][] = [[at(6, 3), at(6, 4)]];

/** The hero proof: the finished recipe label, the silence, the yank, the light, तेरी बारी. */
export const HERO = {from: at(7, 3), to: at(10, 1)} as const;
