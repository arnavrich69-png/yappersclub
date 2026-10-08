// The pluck sound and its loudness over time, measured by scripts/prepare-audio.mjs.
// The attack is always placed exactly `onsetSec` into public/audio/pluck.wav.

import data from './pluck.json';

export const PLUCK = {
  file: data.file,
  source: data.source as 'recorded' | 'placeholder',
  onsetSec: data.onsetSec,
};

/** Loudness of the pluck (0..1, 1 = loudest moment), `sinceAttack` seconds after the attack. */
export const pluckEnvelope = (sinceAttack: number) => {
  if (sinceAttack < 0) return 0;
  const x = (data.onsetSec + sinceAttack) * data.envRate;
  const i = Math.floor(x);
  if (i >= data.env.length - 1) return data.env[data.env.length - 1] ?? 0;
  const f = x - i;
  return data.env[i] * (1 - f) + data.env[i + 1] * f;
};
