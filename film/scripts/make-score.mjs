// Writes the open call film's music from its score, open-call/beat-map.json, played on the three
// prepared brand sounds (the thread, the wrapper and the stamp):
//   public/audio/open-call-score.wav   the whole 40 s mix, one file, sample exact
//   src/openCall/score.json            every hit with its frame, so the picture moves on the music
// Run scripts/prepare-audio.mjs first; a recorded pluck, crinkle or thud flows straight into the score.
// Usage: node scripts/make-score.mjs

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readWav, writeWav16} from './wav.mjs';

const film = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(fs.readFileSync(path.join(film, 'open-call', 'beat-map.json'), 'utf8'));

const SR = 48000;
/** Every prepared sound has its attack exactly this far into its file (prepare-audio.mjs). */
const ONSET = 0.1;
const FPS = map.fps;
const FPB = map.framesPerBeat;
const BPB = map.beatsPerBar;
const SEMI = map.raga.semitonesFromSa;

const sound = (name) => readWav(path.join(film, 'public', 'audio', `${name}.wav`)).samples;
const SRC = {pluck: sound('pluck'), pluckPa: sound('pluckPa'), pluckLow: sound('pluckLow'), crinkle: sound('crinkle'), thud: sound('thud')};

const frameOf = (bar, beat) => (bar - 1) * FPB * BPB + (beat - 1) * FPB;
const sampleOf = (frame) => Math.round((frame * SR) / FPS);

const out = new Float32Array(Math.round(map.durationSec * SR));
/** STEM=drone|tune|groove renders one voice alone (to out/tmp) for balancing. */
const STEM = process.env.STEM ?? '';
const voice = (name) => !STEM || STEM === name;
const hits = [];

/**
 * Plays `src` so that its attack lands on `frame`. `rate` reads it faster (higher, shorter);
 * `decay` (s) closes it with an exponential after the attack; `keep` (s) cuts it there with a
 * short fade; `from` (s) starts reading that far into the sound after its attack (a later slice).
 */
const place = (src, frame, {gain = 1, rate = 1, decay = 0, keep = 0, from = 0, glideTo = 0, glideOver = 0} = {}) => {
  const attack = sampleOf(frame);
  // A whole sound comes in with its own silent lead; a slice starts on its attack with a 2 ms fade.
  const lead = from > 0 ? 0 : Math.round((ONSET * SR) / rate);
  let pos = ONSET * SR + from * SR - lead * rate;
  const fade = Math.round(0.012 * SR);
  const fadeIn = 0.002;
  for (let i = attack - lead; i < out.length; i++) {
    const after = (i - attack) / SR;
    let r = rate;
    // A glide bends the pitch smoothly up to glideTo times the rate (the thread tightening).
    if (glideTo && after > 0) r = rate * Math.pow(glideTo, Math.min(1, after / glideOver) ** 0.8);
    const j = Math.floor(pos);
    if (j + 1 >= src.length) break;
    if (keep && after > keep + fade / SR) break;
    // The lead of a resampled sound can begin a fraction of a sample before the file: silence.
    const a = j >= 0 ? src[j] : 0;
    const b = j + 1 >= 0 ? src[j + 1] : 0;
    let v = a + (b - a) * (pos - j);
    if (decay && after > 0) v *= Math.exp(-after / decay);
    if (keep && after > keep) v *= 1 - (after - keep) / (fade / SR);
    if (from > 0 && after < fadeIn) v *= after / fadeIn;
    if (i >= 0) out[i] += gain * v;
    pos += r;
  }
};

const ratio = (note) => Math.pow(2, SEMI[note] / 12);

// The voices. Levels are set by ear for the stand-ins: the tune sits well above the drone.
const note = (frame, n, vel = 0.7, label = '') => {
  if (voice('tune')) place(SRC.pluck, frame, {gain: 0.62 * vel, rate: ratio(n), decay: 0.85});
  hits.push({frame, kind: 'note', note: n, semitones: SEMI[n], vel, label});
};
const muted = (frame, vel) => {
  if (voice('groove')) place(SRC.pluck, frame, {gain: 0.5 * vel, rate: 2, decay: 0.045, keep: 0.18});
  hits.push({frame, kind: 'muted', vel});
};
const thud = (frame, vel, label = '') => {
  // Dha is the full stamp; the softer ge is the same stamp a little lower.
  if (voice('groove')) place(SRC.thud, frame, {gain: 0.85 * vel, rate: vel >= 0.75 ? 1 : 0.86});
  hits.push({frame, kind: 'thud', vel, label});
};
let slice = 0;
const SLICES = [0, 0.17, 0.34];
const tick = (frame, vel) => {
  // Na and ti: a short bite of wrapper, a different gesture each time so it never machine-guns.
  const from = SLICES[slice++ % SLICES.length];
  if (voice('groove')) place(SRC.crinkle, frame, {gain: 0.55 * vel, keep: 0.075, from});
  hits.push({frame, kind: 'tick', vel});
};
const crinkle = (frame, variant, label = '') => {
  if (variant === 'roll') {
    [0, 5, 10, 15].forEach((d, i) => tick(frame + d, 0.35 + 0.15 * i));
    return;
  }
  if (!voice('groove')) {
    // Only the hit list needs it.
  } else if (variant === 'swish') place(SRC.crinkle, frame, {gain: 0.7, rate: 1.6});
  else if (variant === 'untwist') place(SRC.crinkle, frame, {gain: 0.7});
  else if (variant === 'crunch') {
    place(SRC.crinkle, frame, {gain: 0.9, keep: 0.06});
    place(SRC.crinkle, frame + 1.5, {gain: 0.7, keep: 0.05, from: 0.17});
    place(SRC.thud, frame, {gain: 0.25, rate: 1.7});
  } else place(SRC.crinkle, frame, {gain: 0.32});
  hits.push({frame, kind: 'crinkle', variant: variant ?? 'rustle', label});
};
const glide = (frame, spec, label = '') => {
  const [a, , b] = spec.split(' ');
  const over = (2 * FPB) / FPS;
  if (voice('tune')) place(SRC.pluck, frame, {gain: 0.6, rate: ratio(a), glideTo: ratio(b) / ratio(a), glideOver: over, decay: 1.4});
  hits.push({frame, kind: 'glide', from: a, to: b, overFrames: 2 * FPB, label});
};

// Tanpura: one string a beat, Pa, Sa, Sa, low Sa, each left to ring.
const STRINGS = [
  ['pluckPa', 'Pa', 0.105],
  ['pluck', 'Sa', 0.085],
  ['pluck', 'Sa', 0.085],
  ['pluckLow', 'lowSa', 0.135],
];
const drone = (bar, mode) => {
  for (let beat = 1; beat <= BPB; beat++) {
    if (mode.startsWith('cut') && beat < 3) continue;
    const [src, string, level] = STRINGS[beat - 1];
    let g = level;
    if (mode === 'fade in') g *= 0.3 + 0.7 * ((beat - 1) / (BPB - 1));
    if (mode === 'loud') g *= 1.45;
    const frame = frameOf(bar, beat);
    if (voice('drone')) place(SRC[src], frame, {gain: g});
    hits.push({frame, kind: 'drone', string, vel: g / level});
  }
};

const silences = [];
for (const b of map.barByBar) {
  if (b.drone) drone(b.bar, b.drone);
  if (b.groove) {
    for (const [what, beat, vel] of map.grooves[b.groove]) {
      const frame = frameOf(b.bar, beat);
      if (what === 'thud') thud(frame, vel);
      else if (what === 'crinkle') tick(frame, vel);
      else if (what === 'pluckMuted') muted(frame, vel);
    }
  }
  for (const [what, arg, beat, label, vel] of b.events) {
    const frame = frameOf(b.bar, beat);
    if (what === 'pluck') note(frame, arg, vel ?? 0.7, label);
    else if (what === 'tune') for (const [n, nb] of map.tune[arg]) note(frameOf(b.bar, nb), n, 0.75, nb === 1 ? label : '');
    else if (what === 'thud') thud(frame, arg === 'stamp' ? 1.15 : (vel ?? 0.8), label);
    else if (what === 'crinkle') crinkle(frame, arg, label);
    else if (what === 'glide') glide(frame, arg, label);
  }
  if (b.silence) silences.push([frameOf(b.bar, b.silence[0]), frameOf(b.bar, b.silence[1])]);
}

// True silence: nothing rings through it (3 ms edges so nothing clicks).
for (const [f0, f1] of silences) {
  const a = sampleOf(f0);
  const z = sampleOf(f1);
  const edge = Math.round(0.003 * SR);
  for (let i = a - edge; i < z; i++) if (i >= 0) out[i] *= i < a ? (a - i) / edge : 0;
}

const raw = Float32Array.from(out);
// Master: peak at -1 dBFS, with a soft knee so a single stamp does not set the level of the film.
let peak = 0;
for (const v of out) peak = Math.max(peak, Math.abs(v));
const drive = 1.25 / peak;
const ceiling = Math.pow(10, -1 / 20);
for (let i = 0; i < out.length; i++) out[i] = (ceiling * Math.tanh(out[i] * drive)) / Math.tanh(1.25);

if (STEM) {
  fs.mkdirSync(path.join(film, 'out', 'tmp'), {recursive: true});
  writeWav16(path.join(film, 'out', 'tmp', `score-${STEM}.wav`), raw, SR);
  console.log(`stem ${STEM} written to out/tmp`);
  process.exit(0);
}
writeWav16(path.join(film, 'public', 'audio', 'open-call-score.wav'), out, SR);
hits.sort((a, b) => a.frame - b.frame);
fs.writeFileSync(
  path.join(film, 'src', 'openCall', 'score.json'),
  JSON.stringify({fps: FPS, framesPerBeat: FPB, beatsPerBar: BPB, silences, hits}),
);
let rms = 0;
for (const v of out) rms += v * v;
console.log(
  `open-call-score.wav: ${map.durationSec} s, ${hits.length} hits, ${silences.length} silence(s), ` +
    `rms ${(10 * Math.log10(rms / out.length)).toFixed(1)} dBFS`,
);
