// The clock of इमली क्यों?, the film that explains the imli. 90 BPM at 30 fps: 20 frames a beat,
// 80 a bar, 8 bars, 640 frames (21.3 s). Every move lands on a beat of imli/beat-map.json.

export const IMF = {fps: 30, framesPerBeat: 20, beatsPerBar: 4, bars: 8, frames: 640} as const;

/** Frame of a beat (both 1 based; beat may be fractional). */
export const at = (bar: number, beat = 1) => Math.round(((bar - 1) * IMF.beatsPerBar + (beat - 1)) * IMF.framesPerBeat);
export const seconds = (frame: number) => frame / IMF.fps;

export const HIT = {
  // 1 · इमली क्यों? the candy on the thread, in the dark
  hook: at(1, 1),
  question: at(1, 3),
  rising: [at(1, 3), at(1, 3.5), at(1, 4)],
  panStart: at(1, 4),
  panEnd: at(2, 1.2),
  // 2 · तानसेन: his tomb in Gwalior
  tomb: at(2, 1.2),
  tansen: at(2, 2),
  line1: at(2, 2.5),
  // 3 · the tamarind tree beside it, lifted out of the thread a stop per beat
  tree: [at(3, 1), at(3, 2), at(3, 3), at(3, 4)],
  line2: at(3, 1.5),
  // 4 · a leaf lets go and lands on the string
  leaf: at(4, 1),
  line3: at(4, 1.5),
  leafLands: at(4, 4),
  // 5 · मीठी आवाज़: the string sings
  sweet: at(5, 1),
  line4: at(5, 1.5),
  // 6 · wrapped as an imli and tied
  letGo: at(6, 1),
  wrap: at(6, 1.5),
  twist: at(6, 2),
  knot: at(6, 4),
  line5: at(6, 1.5),
  // 7 · tied on a wrist: कुल
  fling: at(7, 1),
  wrist: at(7, 1),
  wind: at(7, 1.5),
  tie: at(7, 3),
  line6: at(7, 1.5),
  // 8 · ध्वनि KUL
  label: at(8, 1),
  tagline: at(8, 2),
  tieOff: at(8, 3),
} as const;
