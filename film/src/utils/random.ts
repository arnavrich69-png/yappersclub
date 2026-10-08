// Seeded randomness. Every "random" wobble in a Dhwanikul film comes from here so renders are
// identical on every machine and every re-render.

const hashString = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** mulberry32: a tiny, good enough PRNG. Returns a function giving numbers in [0, 1). */
export const seeded = (seed: string | number) => {
  let a = typeof seed === 'number' ? seed >>> 0 : hashString(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** One stable random number for (seed, index), without keeping generator state. */
export const rand = (seed: string, index: number) => seeded(`${seed}#${index}`)();

/** Stable value in [lo, hi). */
export const randRange = (seed: string, index: number, lo: number, hi: number) => lo + (hi - lo) * rand(seed, index);

/**
 * Smooth 1D value noise in [-1, 1], continuous in t. Used for tiny idle drift so nothing is ever
 * perfectly frozen, but nothing jitters either.
 */
export const smoothNoise = (seed: string, t: number) => {
  const i = Math.floor(t);
  const f = t - i;
  const a = rand(seed, i) * 2 - 1;
  const b = rand(seed, i + 1) * 2 - 1;
  const u = f * f * (3 - 2 * f);
  return a + (b - a) * u;
};
