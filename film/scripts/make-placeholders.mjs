// Synthetic stand-ins for the three sounds Brief 02 asks you to record: a plucked string, a wrapper
// crinkle and a thud. They are used only until your recordings exist in the pack's audio/ folder.
// Everything is seeded, so each stand-in is identical every time.
// Usage: node scripts/make-placeholders.mjs [pluck|crinkle|thud ...]   (default: all three)

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeWav16} from './wav.mjs';

export const SR = 48000;
/** Silence before the attack, seconds. */
export const LEAD = 0.1;

const prng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const normalise = (y, dB = -3) => {
  let peak = 0;
  for (const v of y) peak = Math.max(peak, Math.abs(v));
  const gain = Math.pow(10, dB / 20) / peak;
  for (let i = 0; i < y.length; i++) y[i] *= gain;
  return y;
};

/** Two-pole band-pass (RBJ cookbook), applied in place. */
const bandpass = (y, f0, q) => {
  const w = (2 * Math.PI * f0) / SR;
  const alpha = Math.sin(w) / (2 * q);
  const a0 = 1 + alpha;
  const b0 = alpha / a0;
  const b2 = -alpha / a0;
  const a1 = (-2 * Math.cos(w)) / a0;
  const a2 = (1 - alpha) / a0;
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < y.length; i++) {
    const x0 = y[i];
    const out = b0 * x0 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = out;
    y[i] = out;
  }
  return y;
};

/** Tanpura-like pluck: additive synthesis with a sweeping "jawari" brightness. */
export const makePluck = () => {
  const DUR = 2.6;
  const f0 = 146.83; // D3, a comfortable Sa
  const n = Math.round(SR * (LEAD + DUR));
  const y = new Float32Array(n);
  const rnd = prng(20261017);
  const harmonics = 46;
  const B = 1.2e-5; // a little string stiffness
  for (let k = 1; k <= harmonics; k++) {
    const fk = k * f0 * Math.sqrt(1 + B * k * k);
    if (fk > SR / 2.2) break;
    const pluckComb = Math.abs(Math.sin((k * Math.PI) / 7.3)) + 0.08; // plucked about a seventh along
    const amp = pluckComb / Math.pow(k, 0.85);
    const tau = 2.4 / (1 + 0.045 * Math.pow(k, 1.25));
    const phase = rnd() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const t = i / SR - LEAD;
      if (t < 0) continue;
      // Jawari: a band of emphasis that starts high in the spectrum and drifts down as the note rings.
      const centre = 5 + 26 * Math.exp(-t / 0.55);
      const jawari = 1 + 1.4 * Math.exp(-Math.pow((k - centre) / 4.5, 2));
      y[i] += amp * jawari * Math.exp(-t / tau) * Math.sin(2 * Math.PI * fk * t + phase);
    }
  }
  // Finger noise at the attack: a few milliseconds of differentiated noise.
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR - LEAD;
    if (t < 0 || t > 0.03) continue;
    const w = rnd() * 2 - 1;
    y[i] += 0.5 * (w - prev) * Math.exp(-t / 0.004);
    prev = w;
  }
  // Soft attack (2 ms) and tail fade (250 ms).
  for (let i = 0; i < n; i++) {
    const t = i / SR - LEAD;
    if (t >= 0 && t < 0.002) y[i] *= 0.5 - 0.5 * Math.cos((Math.PI * t) / 0.002);
    const tail = DUR - t;
    if (tail < 0.25) y[i] *= Math.max(0, tail / 0.25);
  }
  return normalise(y);
};

/**
 * Wrapper crinkle: hundreds of tiny paper clicks, band-passed, in three gestures (the twisted end
 * turning over as it untwists), over a quiet rustle.
 */
export const makeCrinkle = () => {
  const DUR = 0.75;
  const n = Math.round(SR * (LEAD + DUR));
  const y = new Float32Array(n);
  const rnd = prng(20261014);
  const gesture = (t) => {
    let g = 0;
    for (const [at, size] of [
      [0.0, 1.0],
      [0.17, 0.85],
      [0.34, 0.65],
    ]) {
      const u = t - at;
      if (u >= 0) g += size * (1 - Math.exp(-u / 0.012)) * Math.exp(-u / 0.11);
    }
    return t > 0.6 ? g * Math.max(0, 1 - (t - 0.6) / 0.15) : g;
  };
  // Clicks: a Poisson stream whose rate follows the gestures.
  let t = 0;
  while (t < DUR) {
    t += -Math.log(1 - rnd()) / (60 + 1400 * gesture(t));
    const g = gesture(t);
    if (g <= 0.01) continue;
    const amp = g * (0.15 + 0.85 * Math.pow(rnd(), 3)) * (rnd() < 0.5 ? -1 : 1);
    const tau = 0.0003 + 0.0011 * rnd();
    const start = Math.round((LEAD + t) * SR);
    for (let i = 0; i < Math.round(tau * 6 * SR) && start + i < n; i++) {
      y[start + i] += amp * (rnd() * 2 - 1) * Math.exp(-i / (tau * SR));
    }
  }
  const clicks = bandpass(y, 3800, 0.9);
  // Rustle bed.
  const bed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR - LEAD;
    bed[i] = tt < 0 ? 0 : (rnd() * 2 - 1) * gesture(tt) * 0.06;
  }
  bandpass(bed, 1600, 0.6);
  for (let i = 0; i < n; i++) clicks[i] += bed[i];
  return normalise(clicks);
};

/** A thick book dropped flat on a table: a falling low thump, a short knock and a slap. */
export const makeThud = () => {
  const DUR = 0.7;
  const n = Math.round(SR * (LEAD + DUR));
  const y = new Float32Array(n);
  const rnd = prng(20261016);
  let phase = 0;
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR - LEAD;
    if (t < 0) continue;
    const f = 52 + 75 * Math.exp(-t / 0.028);
    phase += (2 * Math.PI * f) / SR;
    const body = Math.sin(phase) * Math.exp(-t / 0.12);
    const knock = 0.45 * Math.sin(2 * Math.PI * 176 * t) * Math.exp(-t / 0.035);
    lp += 0.3 * ((rnd() * 2 - 1) - lp);
    const slap = 0.55 * lp * Math.exp(-t / 0.007);
    const attack = t < 0.001 ? t / 0.001 : 1;
    const tail = DUR - t < 0.1 ? Math.max(0, (DUR - t) / 0.1) : 1;
    y[i] = (body + knock + slap) * attack * tail;
  }
  return normalise(y);
};

export const MAKERS = {pluck: makePluck, crinkle: makeCrinkle, thud: makeThud};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(MAKERS);
  for (const name of names) {
    const out = path.join(here, '..', 'public', 'audio', `${name}-placeholder.wav`);
    writeWav16(out, MAKERS[name](), SR);
    console.log(`stand-in ${name} written: ${path.relative(process.cwd(), out)}`);
  }
}
