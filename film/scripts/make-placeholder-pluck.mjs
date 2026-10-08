// A synthetic tanpura-like pluck, used only until audio/pluck.wav (your own recording) exists.
// Additive synthesis with a sweeping "jawari" brightness, seeded, so it is identical every time.
// Usage: node scripts/make-placeholder-pluck.mjs [out.wav]

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeWav16} from './wav.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] ?? path.join(here, '..', 'public', 'audio', 'pluck-placeholder.wav');

const SR = 48000;
const LEAD = 0.1; // silence before the attack, seconds
const DUR = 2.6;
const f0 = 146.83; // D3, a comfortable Sa
const n = Math.round(SR * (LEAD + DUR));
const y = new Float32Array(n);

let seed = 20261017;
const rnd = () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

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

let peak = 0;
for (const v of y) peak = Math.max(peak, Math.abs(v));
const gain = Math.pow(10, -3 / 20) / peak;
for (let i = 0; i < n; i++) y[i] *= gain;

writeWav16(out, y, SR);
console.log(`placeholder pluck written: ${path.relative(process.cwd(), out)}`);
