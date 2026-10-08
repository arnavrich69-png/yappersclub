// The clock of इमली क्यों?, the film that explains the imli and the thread. 90 BPM at 30 fps: 20
// frames a beat, 80 a bar, 15 bars, 1200 frames (40 s). Every move lands on a beat of
// imli/beat-map.json.

export const IMF = {fps: 30, framesPerBeat: 20, beatsPerBar: 4, bars: 15, frames: 1200} as const;

/** Frame of a beat (both 1 based; beat may be fractional). */
export const at = (bar: number, beat = 1) => Math.round(((bar - 1) * IMF.beatsPerBar + (beat - 1)) * IMF.framesPerBeat);
export const seconds = (frame: number) => frame / IMF.fps;

/**
 * Where the five lamps hang, evenly along the thread, each within a few pixels of where the note
 * that lights it is plucked (pluckX in thread/stringLine.ts: low Sa 180, low Pa 390, Sa 540, Pa 750,
 * high Sa 900), so the thread rings from the lamp being lit.
 */
export const LAMP_X = [150, 345, 540, 735, 930] as const;

export const HIT = {
  // 1 · इमली क्यों? the candy on the thread, in the light
  hook: at(1, 1),
  question: at(1, 3),
  // 2 · तानसेन: the candy is flung off, the light goes out, a hand plucks one Sa in the dark
  flingAway: at(2, 1),
  lightOut: at(2, 1) + 4,
  hand: at(2, 1.5),
  tansen: at(2, 2),
  line1: at(2, 2.5),
  // 3 · दीपक: a note a lamp, low Sa to high Sa
  deepak: at(3, 1),
  lamps: [at(3, 1), at(3, 1.5), at(3, 2), at(3, 2.5), at(3, 3)],
  line2: at(3, 1.5),
  // 4 · मल्हार: thunder, rain on the string, the lamps go out; the camera pans along the thread
  malhar: at(4, 1),
  rain: at(4, 1),
  line3: at(4, 1.5),
  /** When each lamp (LAMP_X order) is put out by a drop. */
  lampsOut: [at(4, 3), at(4, 3.5), at(4, 2), at(4, 3.75), at(4, 2.5)],
  panStart: at(4, 4),
  panEnd: at(5, 1.2),
  // 5 · ग्वालियर: his tomb
  tomb: at(5, 1.2),
  gwalior: at(5, 2),
  line4: at(5, 2.5),
  // 6 · the tamarind tree beside it, lifted out of the thread a stop a beat
  tree: [at(6, 1), at(6, 2), at(6, 3), at(6, 4)],
  line5: at(6, 1.5),
  // 7 · a leaf lets go and lands on the string
  leaf: at(7, 1),
  line6: at(7, 1.5),
  leafLands: at(7, 4),
  // 8 · मीठी आवाज़: the string sings
  sweet: at(8, 1),
  line7: at(8, 1.5),
  // 9 · इमली: wrapped and tied
  letGo: at(9, 1),
  wrap: at(9, 1.5),
  twist: at(9, 2),
  knot: at(9, 4),
  line8: at(9, 1.5),
  // 10 · और धागा? the candy is flung off; the thread alone asks the question again
  fling: at(10, 1),
  thread: at(10, 2),
  line9: at(10, 2.5),
  // 11 · गंडा बंधन: a wrist rises, the kalava is wound round it and tied
  ganda: at(11, 1),
  wrist: at(11, 1),
  wind: at(11, 1.5),
  tie: at(11, 3),
  line10: at(11, 1.5),
  // 12 · कुल: PULP, the camera pulls back along the thread, wrist after wrist
  kul: at(12, 1),
  line11: at(12, 1.5),
  // 13 · मीठी डोर: the candy lands back on the packet, the directions unroll from the thread
  ritual: at(13, 1),
  panel: at(13, 1) + 4,
  rows: [at(13, 1.5), at(13, 2.5), at(13, 3.5)],
  // 14 · ध्वनि KUL, and what it means (the directions are read to the end of beat 1)
  label: at(14, 2),
  sound: at(14, 3),
  family: at(14, 4),
  // 15 · SWEET VOICE, TIED.
  tagline: at(15, 1),
  tieOff: at(15, 3),
} as const;
