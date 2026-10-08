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

/** Moments the picture lands on. */
export const HIT = {
  headline: at(7, 1),
  silence: at(8, 1),
  yank: at(8, 3),
  light: at(8, 4),
  teri: at(9, 1),
  bari: at(9, 2),
  bring: at(9, 3),
} as const;

/** The hero proof: the finished recipe label, the silence, the yank, the light, तेरी बारी. */
export const HERO = {from: at(7, 3), to: at(10, 1)} as const;
