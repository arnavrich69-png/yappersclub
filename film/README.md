# film/ · Dhwanikul motion

Remotion (React + TypeScript) project for the logo film and every reel after it.
The brand rules in `../brand/BRAND-RULES.md` are the law; colours and sizes are read from
`../brand/tokens.json`, and the label, ध्वनि KUL and the tagline are the designer's own outlines
from `../logo/dhwanikul-lockup-yellow.svg`, so the Devanagari is always shaped exactly as designed.

## Status

Brief 02 is done.

- `out/logo-film.mp4`: the logo film, 5.4 s, 1080 x 1920, 30 fps, with the FLAVOUR No. 01 seal
- `out/logo-film-clean.mp4`: the same film with no seal (and no thud), to open any future reel
- `out/logo-film-frames/`: eight frames, one per beat
- `out/proof-pluck.mp4` and `out/proof-pluck-frames/`: the approved one second pluck proof

## Use it

```
cd film
npm install
npm run studio     # Remotion Studio: scrub LogoFilm, LogoFilmClean, ProofPluck, Checks/ThreadLab
npm run film       # renders both logo films and the eight frames
npm run proof      # re-renders the pluck proof
```

## Your sounds

Brief 02 asks for three recordings. Save them in the pack's `audio/` folder, next to `brand/`:
`audio/pluck.wav`, `audio/crinkle.wav`, `audio/thud.wav`. Then run `npm run film`. The script finds
each attack and lands it on its frame: the pluck on the snap (frame 29), the crinkle as the ends
start to untwist (frame 45), the pluck again, quietly, on the knot's final tug (frame 100) and the
thud on the seal's impact (frame 108).

Until a recording exists its synthetic stand-in in `public/audio/*-placeholder.wav` is used
(made by `scripts/make-placeholders.mjs`). The stand-ins are not the final sound.

## The film, beat by beat (`src/film/timeline.ts`)

| Time | What happens |
|------|--------------|
| 0.0 to 0.5 | The tied imli settles on haldi yellow. |
| 0.5 to 1.2 | The approved pluck: the finger drags the outer loose end, lets go, the thread twangs. |
| 1.2 to 2.0 | Both knots slip. Each thread is pulled off through its wraps and whips out of frame as a thin strand. The twisted ends spin open with a crinkle into flat serrated flaps. |
| 2.0 to 2.8 | The flat wrapper tips towards camera and lands face down as the label. ध्वनि KUL pops in, ध्व then नि then K, U, L, each fill landing a frame before its outline and shadow. |
| 2.8 to 3.6 | The thread whips back in as a wave and cracks flat at y = 672, strung behind ध्वनि's headline bar. An open loop rides in on it and cinches into the rakhi knot; the final tug plucks the thread lightly. |
| 3.6 to 4.2 | The cream seal drops, squashes on the downbeat, rebounds, a little ink spreads. |
| 4.2 to 5.4 | SOUND. PEOPLE. CULTURE. types in letter by letter, then holds. |

## What is where

| Folder | What |
|--------|------|
| `src/thread/` | The kalava thread (frozen after the proof). `ThreadPiece` draws it along any path; `pluck.ts` plucks it between two points or rings a loose end; `knot.ts` and `RakhiKnot` tie and untie the rakhi knot; `motion.ts` slides, trails and whips it. |
| `src/wrapper/` | The tied imli from `logo/dhwanikul-mark.svg` as separate layers, and `untwist.ts` / `OpenEnd` for the ends spinning open. |
| `src/label/` | The label, the popping wordmark, the stamped seal and the typed tagline. `lockup.ts` holds the outlines from the lockup svg. |
| `src/film/` | The logo film: timeline, the threads pulled off (`unravel.ts`), the returning thread (`heroThread.ts`), and the composition. |
| `src/proofs/` | The approved pluck proof. The film reuses it as its second beat. |
| `src/audio/` | Sound timing and loudness (written by `scripts/prepare-audio.mjs`) and `Cue`, which lands a sound's attack on a frame. |
| `src/components/` | Print world (haldi ground, halftone, paper grain), the finger, font loading. |
| `src/lab/` | Checks: the thread against `svg-parts`, the imli against the logo, a test bench of every thread ability. |

## Choices worth knowing

- The thread is never motion blurred. A blurred red thread over haldi turns orange, which breaks
  "red belongs to the thread" and "never fading, never changing colour". It vibrates like a
  cartoon string instead: crisp on every frame, flipping side frame to frame as it dies away.
- The strands keep the logo's 32 degree twist and travel with the cotton.
- The wraps are thick because the cotton is bunched round the neck. Pulled off, the same cotton is
  a single thin strand, so the threads leave the frame thin.
- The thread at y = 672 runs behind ध्वनि KUL along its headline bar, like the Night 01 headline:
  the label system's "headline strung on the thread".
- The label sits at 92% of the lockup's size so every word stays left of the Reels buttons
  (x 940); the tagline sits low enough that the card centres in the 3:4 grid crop.
- The seal's rim reads MFD. IN GWALIOR BY THE KUL · SUR GUARANTEED, from the brand's packet copy.
- The finger is cream with an ink outline and halftone, like the pointing hand on old packets.
- Every wobble comes from seeded randomness: the same frame renders the same way every time.
- Picture and sound are joined with ffmpeg's AAC encoder (Remotion's own AAC track starts about
  43 ms late). In a container that cannot download Chrome, set `REMOTION_BROWSER_EXECUTABLE` to a
  local headless Chrome.
