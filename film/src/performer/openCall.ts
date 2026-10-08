// The Night 01 open call: Brief 03's performer frame with nobody in it yet. The tag on the thread
// says YOUR NAME, the credit says COVER OF YOUR SONG, and the stage is lit and waiting.
// 30 fps, 10 s. Times are in frames.
//
//   0 to 18     an imli wrapper fills the frame; its twisted ends let go and it swings open
//   18          the spotlight switches on (one flicker) and the tanpura drone starts: Pa, Sa, Sa,
//               low Sa, every 21 frames; the thread twangs on every string
//   24 to 60    the SUNG BY tag swings in on its kalava loop and settles
//   30 to 46    OPEN CALL · NIGHT 01 types in at the top
//   42 to 60    COVER OF YOUR SONG · ANY ARTIST types in, bottom left
//   66          the FLAVOUR No. 01 खट्टा मीठा seal stamps down, top right
//   84, 90      तेरी, बारी pop into the light; the date and the promise type in under them
//   204 to 216  the PACKED AT card drops over the stage and lands with a crinkle; the light goes out
//   220 to 252  PACKED AT · PADHARO SA · GWALIOR, NIGHT 01, DM TO PERFORM, the fine print
//   252 to 300  hold

import type {SoundName} from '../audio/sounds';

export const OC_FPS = 30;
export const OC_FRAMES = 300;

export const OPEN_CALL = {
  header: 'OPEN CALL · NIGHT 01',
  tag: {label: 'SUNG BY', name: ['YOUR', 'NAME'], handle: '@YOU'},
  credit: 'COVER OF YOUR SONG · ANY ARTIST',
  headline: ['तेरी', 'बारी'],
  lines: ['SAT 17 OCT · PADHARO SA', 'BRING ONE SONG · WE BRING THE IMLI'],
  seal: {number: '01', hindi: 'खट्टा मीठा', rim: 'TANGY · SWEET · LIVE · NIGHT 01 · ', angle: -8},
  card: {
    packed: 'PACKED AT · PADHARO SA · GWALIOR',
    night: ['NIGHT', '01'],
    cta: 'DM TO PERFORM',
    fine: 'SAT 17 OCT · FREE ENTRY · ONE IMLI PER SINGER',
  },
};

export const F = {
  doors: {open: 4, gone: 18},
  light: {on: 18, off: 20, back: 22},
  tagRelease: 24,
  header: 30,
  credit: 42,
  seal: 66,
  headline: [84, 90],
  lines: [100, 116],
  card: {drop: 204, land: 212},
  packed: 218,
  night: 232,
  cta: 242,
  fine: 250,
};

/** The tanpura cycle: Pa, Sa, Sa, low Sa. */
const STRINGS: SoundName[] = ['pluckPa', 'pluck', 'pluck', 'pluckLow'];
const DRONE_START = 18;
const DRONE_EVERY = 21;

export const DRONE = Array.from({length: Math.floor((OC_FRAMES - DRONE_START) / DRONE_EVERY) + 1}, (_, i) => ({
  frame: DRONE_START + i * DRONE_EVERY,
  name: STRINGS[i % STRINGS.length],
}));

/** How hard each string makes the thread ring (px at the middle of the frame). */
export const TWANG: Record<string, number> = {pluckPa: 11, pluck: 8, pluckLow: 14};
