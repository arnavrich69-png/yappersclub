// Prepares the pluck for the film and measures it so the thread rings in time with it.
//
// Uses audio/pluck.wav from the pack (your recording) if it exists, otherwise the synthetic
// placeholder. It finds the attack, shifts the sound so the attack sits exactly 0.1 s into the
// file, levels it, and writes:
//   public/audio/pluck.wav   the sound the film plays
//   src/audio/pluck.json     attack time and loudness envelope the thread follows
//
// Usage: node scripts/prepare-audio.mjs

import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readWav, writeWav16} from './wav.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const film = path.join(here, '..');
const pack = path.join(film, '..');
const recorded = path.join(pack, 'audio', 'pluck.wav');
const placeholder = path.join(film, 'public', 'audio', 'pluck-placeholder.wav');
const outWav = path.join(film, 'public', 'audio', 'pluck.wav');
const outJson = path.join(film, 'src', 'audio', 'pluck.json');

const SR = 48000;
const ONSET = 0.1;
const MAX_AFTER = 3.0;
const ENV_RATE = 240;

const load = (file) => {
  try {
    return readWav(file);
  } catch (err) {
    // Not a plain WAV (for example an m4a renamed to .wav): convert with Remotion's ffmpeg.
    const tmp = path.join(film, 'out', 'tmp', 'pluck-converted.wav');
    fs.mkdirSync(path.dirname(tmp), {recursive: true});
    console.log(`converting ${path.basename(file)} with ffmpeg (${err.message})`);
    execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-i', file, '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', tmp], {
      cwd: film,
      stdio: 'inherit',
    });
    return readWav(tmp);
  }
};

const resample = (x, from, to) => {
  if (from === to) return x;
  const n = Math.floor((x.length * to) / from);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const s = (i * from) / to;
    const j = Math.floor(s);
    const f = s - j;
    y[i] = (x[j] ?? 0) * (1 - f) + (x[j + 1] ?? 0) * f;
  }
  return y;
};

const rmsEnvelope = (x, rate, window) => {
  const hop = SR / rate;
  const n = Math.floor(x.length / hop);
  const env = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const c = Math.round(i * hop);
    const a = Math.max(0, c - Math.floor(window / 2));
    const b = Math.min(x.length, a + window);
    let s = 0;
    for (let j = a; j < b; j++) s += x[j] * x[j];
    env[i] = Math.sqrt(s / Math.max(1, b - a));
  }
  return env;
};

let source = 'recorded';
let file = recorded;
if (!fs.existsSync(recorded)) {
  source = 'placeholder';
  file = placeholder;
  if (!fs.existsSync(placeholder)) {
    execFileSync('node', [path.join(here, 'make-placeholder-pluck.mjs'), placeholder], {stdio: 'inherit'});
  }
}

const {sampleRate, samples} = load(file);
let x = resample(samples, sampleRate, SR);

// Remove DC offset (phone recordings often have some).
let mean = 0;
for (const v of x) mean += v;
mean /= x.length;
for (let i = 0; i < x.length; i++) x[i] -= mean;

// Attack: first 1 ms window above 12% of the loudest window, then back up to where it starts rising.
const fine = rmsEnvelope(x, 1000, 48);
let peak = 0;
for (const v of fine) peak = Math.max(peak, v);
if (peak < 1e-4) throw new Error(`${file} is silent`);
let hit = fine.findIndex((v) => v > peak * 0.12);
let start = hit;
while (start > 0 && hit - start < 15 && fine[start - 1] > peak * 0.03) start--;
const onsetIn = start / 1000;

// Place the attack at exactly ONSET seconds.
const shift = Math.round((onsetIn - ONSET) * SR);
const length = Math.round((ONSET + MAX_AFTER) * SR);
const y = new Float32Array(Math.min(length, x.length - shift));
for (let i = 0; i < y.length; i++) {
  const j = i + shift;
  y[i] = j >= 0 && j < x.length ? x[j] : 0;
}
// Fade in whatever is left before the attack (5 ms), fade out the tail (150 ms) if we cut it.
const fadeIn = Math.round(0.005 * SR);
for (let i = 0; i < Math.round(ONSET * SR) && i < y.length; i++) {
  const toOnset = Math.round(ONSET * SR) - i;
  if (toOnset > fadeIn) y[i] = 0;
  else y[i] *= 1 - toOnset / fadeIn;
}
if (x.length - shift > length) {
  const fo = Math.round(0.15 * SR);
  for (let i = 0; i < fo; i++) y[y.length - 1 - i] *= i / fo;
}

// Level to -3 dBFS peak.
let p = 0;
for (const v of y) p = Math.max(p, Math.abs(v));
const g = Math.pow(10, -3 / 20) / p;
for (let i = 0; i < y.length; i++) y[i] *= g;

fs.mkdirSync(path.dirname(outWav), {recursive: true});
writeWav16(outWav, y, SR);

// Envelope for the thread (normalised to the loudest moment).
const env = rmsEnvelope(y, ENV_RATE, Math.round(SR / ENV_RATE) * 2);
let ePeak = 0;
let ePeakAt = 0;
env.forEach((v, i) => {
  if (v > ePeak) {
    ePeak = v;
    ePeakAt = i;
  }
});
const envNorm = Array.from(env, (v) => Math.round((v / ePeak) * 10000) / 10000);
const below20 = envNorm.findIndex((v, i) => i > ePeakAt && v < 0.1);

const info = {
  source,
  sourceFile: path.relative(film, file),
  file: 'audio/pluck.wav',
  sampleRate: SR,
  durationSec: Math.round((y.length / SR) * 1000) / 1000,
  onsetSec: ONSET,
  peakSec: Math.round((ePeakAt / ENV_RATE) * 1000) / 1000,
  minus20dBSec: below20 > 0 ? Math.round((below20 / ENV_RATE) * 1000) / 1000 : null,
  envRate: ENV_RATE,
  env: envNorm,
};
fs.mkdirSync(path.dirname(outJson), {recursive: true});
fs.writeFileSync(outJson, JSON.stringify(info));
console.log(
  `pluck ready (${source}): attack found at ${onsetIn.toFixed(3)} s in ${path.basename(file)}, moved to ${ONSET} s; ` +
    `rings to -20 dB by ${info.minus20dBSec ?? '?'} s`,
);
