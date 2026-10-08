# film/ · Dhwanikul motion

Remotion (React + TypeScript) project for the logo film and every reel after it.
The brand rules in `../brand/BRAND-RULES.md` are the law; colours and sizes are read from
`../brand/tokens.json`.

## Status

Brief 02, prompt 1 is done: the thread, the tied imli in layers, and a one second pluck proof.

- `out/proof-pluck.mp4` (1080 x 1920, 30 fps, 1 s, with sound)
- `out/proof-pluck-frames/` (frames 7 reach, 15 held, 18 snap, 22 ring)

## Use it

```
cd film
npm install
npm run studio     # opens Remotion Studio: scrub ProofPluck, or Checks/ThreadLab
npm run proof      # re-renders the proof video and its four stills
```

## Your pluck sound

Record the pluck (Brief 02 says how) and save it as `audio/pluck.wav` in the pack, next to
`brand/`. Then run `npm run proof`. The script finds the attack, lines it up with the frame the
thread snaps on (frame 17) and makes the ring follow the sound's loudness.

Until that file exists the proof uses `public/audio/pluck-placeholder.wav`, a synthetic
tanpura-like pluck made by `scripts/make-placeholder-pluck.mjs`. It is a stand-in, not the final
sound.

## What is where

| Folder | What |
|--------|------|
| `src/thread/` | The kalava thread. `ThreadPiece` draws it along any path (strands travel with the cotton). `pluck.ts`: plucked between two points, or a loose end that swings and rings. `knot.ts` and `RakhiKnot`: tie and untie the rakhi knot with its two loose ends. `motion.ts`: slide, trail (whip out of frame), whip between shapes with elastic overshoot. |
| `src/wrapper/` | The tied imli from `logo/dhwanikul-mark.svg` as separate layers: wrapper ends, wraps, knots, loose ends, body, the ध letter. |
| `src/components/` | Print world (haldi ground, halftone, paper grain) and the plucking finger. |
| `src/audio/` | Pluck timing and loudness, written by `scripts/prepare-audio.mjs`. |
| `src/label/` | For prompt 2: the label, the seal stamp, the tagline. |
| `src/proofs/` | The pluck proof, written as "where is everything at time t". |
| `src/lab/` | Checks: the thread against `svg-parts`, the imli against the logo, a test bench of every thread ability. |

## Choices worth knowing

- The thread is never motion blurred. A blurred red thread over haldi turns orange, which breaks
  "red belongs to the thread" and "never fading, never changing colour". It vibrates like a
  cartoon string instead: crisp on every frame, flipping side frame to frame as it dies away.
- The strands keep the logo's 32 degree twist and travel with the cotton, so a sliding thread
  looks like it is moving rather than the pattern swimming over it.
- The finger is cream with an ink outline and halftone, like the pointing hand printed on old
  packets, so it stays inside the palette.
- Every wobble comes from seeded randomness: the same frame renders the same way every time.
- In a container that cannot download Chrome, set `REMOTION_BROWSER_EXECUTABLE` to a local
  headless Chrome.
