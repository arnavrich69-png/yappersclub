// The score's hit list, written by scripts/make-score.mjs from open-call/beat-map.json together with
// the music itself, so the thread rings on exactly the notes you hear.

import data from './score.json';

export type Hit = {
  frame: number;
  kind: 'note' | 'muted' | 'thud' | 'tick' | 'crinkle' | 'glide' | 'drone';
  vel?: number;
  note?: string;
  semitones?: number;
  string?: string;
  variant?: string;
  label?: string;
};

export const HITS = data.hits as Hit[];
export const SILENCES = data.silences as [number, number][];

/** Hits that have happened by `frame` and are still young enough to matter. */
export const recentHits = (frame: number, within: number, kinds?: Hit['kind'][]) =>
  HITS.filter((h) => h.frame <= frame && frame - h.frame < within && (!kinds || kinds.includes(h.kind)));
