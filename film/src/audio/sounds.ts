// The films' sounds and their loudness over time, measured by scripts/prepare-audio.mjs.
// Each sound's attack is placed exactly `onsetSec` into public/audio/<name>.wav, so a cue can
// land the attack on any frame.

import crinkle from './crinkle.json';
import pluck from './pluck.json';
import thud from './thud.json';

export type SoundName = 'pluck' | 'crinkle' | 'thud';

type SoundData = {source: string; file: string; onsetSec: number; envRate: number; env: number[]};
const DATA: Record<SoundName, SoundData> = {pluck, crinkle, thud};

export const sound = (name: SoundName) => ({
  file: DATA[name].file,
  onsetSec: DATA[name].onsetSec,
  source: DATA[name].source as 'recorded' | 'placeholder',
});

/** Loudness of a sound (0..1, 1 = loudest moment), `sinceAttack` seconds after its attack. */
export const envelope = (name: SoundName, sinceAttack: number) => {
  const d = DATA[name];
  if (sinceAttack < 0) return 0;
  const x = (d.onsetSec + sinceAttack) * d.envRate;
  const i = Math.floor(x);
  if (i >= d.env.length - 1) return d.env[d.env.length - 1] ?? 0;
  const f = x - i;
  return d.env[i] * (1 - f) + d.env[i + 1] * f;
};
