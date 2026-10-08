# film/ · Dhwanikul motion

Remotion (React + TypeScript) project for the logo film and every reel after it.
The brand rules in `../brand/BRAND-RULES.md` are the law; colours and sizes are read from
`../brand/tokens.json`, and the label, ध्वनि KUL and the tagline are the designer's own outlines
from `../logo/dhwanikul-lockup-yellow.svg`, so the Devanagari is always shaped exactly as designed.

## Status

Brief 02 is done. Brief 03 is built as the Night 01 open call: its frame, with no performer clip in it.

- `out/logo-film.mp4`: the logo film, 5.4 s, 1080 x 1920, 30 fps, with the FLAVOUR No. 01 seal
- `out/logo-film-clean.mp4`: the same film with no seal (and no thud), to open any future reel
- `out/logo-film-frames/`: eight frames, one per beat
- `out/proof-pluck.mp4` and `out/proof-pluck-frames/`: the approved one second pluck proof
- `out/open-call.mp4`: the Night 01 open call, 10 s, 1080 x 1920, 30 fps
- `out/open-call-frames/`: four frames: the wrapper opening, the seal landing, the lit stage, the PACKED AT card
- `out/open-call-hero.mp4` and `out/open-call-hero-frames/`: the hero proof of the 40 s open call film
  (`open-call/`: creative direction, screenplay, score, implementation notes). The rest of the film is stage 5

## Use it

```
cd film
npm install
npm run studio     # Remotion Studio: scrub LogoFilm, LogoFilmClean, OpenCall, ProofPluck, Checks/ThreadLab
npm run film       # renders both logo films and the eight frames
npm run open-call  # renders the 10 s open call and its four frames
npm run score      # writes the 40 s open call film's music from open-call/beat-map.json
npm run hero       # renders the open call film's hero proof and its eight frames
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

The open call uses the same three sounds. Its tanpura drone is the pluck retuned down to Pa and to
low Sa (`pluckPa`, `pluckLow`, made from the pluck by `prepare-audio.mjs`), so your pluck recording
carries over to it. Run `npm run open-call` after adding the recordings.

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

## The open call, beat by beat (`src/performer/openCall.ts`)

| Time | What happens |
|------|--------------|
| 0.0 to 0.6 | An imli wrapper fills the frame. Its twisted ends let go with a crinkle and the two flaps swing open towards camera. |
| 0.6 | One haldi light comes on over a dark stage, with a flicker. The drone starts: Pa, Sa, Sa, low Sa, one string every 0.7 s, and the thread at y = 672 rings on every string. |
| 0.8 to 2.0 | The SUNG BY · YOUR NAME · @YOU tag swings in on its kalava loop and settles. OPEN CALL · NIGHT 01 types in at the top, COVER OF YOUR SONG · ANY ARTIST bottom left. |
| 2.2 | The FLAVOUR No. 01 खट्टा मीठा seal stamps down, top right, with a thud. |
| 2.8 to 4.6 | तेरी बारी pops into the light. SAT 17 OCT · PADHARO SA and BRING ONE SONG · WE BRING THE IMLI type in under it. |
| 6.8 to 7.1 | The label card drops over the stage and lands with a crinkle. The light goes out under it. |
| 7.3 to 9.1 | PACKED AT · PADHARO SA · GWALIOR types in, NIGHT 01 pops, the DM TO PERFORM band drops with a thud, the fine print types. |
| 9.1 to 10.0 | Hold. |

## What is where

| Folder | What |
|--------|------|
| `src/thread/` | The kalava thread (frozen after the proof). `ThreadPiece` draws it along any path; `pluck.ts` plucks it between two points or rings a loose end; `knot.ts` and `RakhiKnot` tie and untie the rakhi knot; `motion.ts` slides, trails and whips it. |
| `src/wrapper/` | The tied imli from `logo/dhwanikul-mark.svg` as separate layers, and `untwist.ts` / `OpenEnd` for the ends spinning open. |
| `src/label/` | The label, the popping wordmark, the stamped seal and the typed tagline. `lockup.ts` holds the outlines from the lockup svg. |
| `src/film/` | The logo film: timeline, the threads pulled off (`unravel.ts`), the returning thread (`heroThread.ts`), and the composition. |
| `src/proofs/` | The approved pluck proof. The film reuses it as its second beat. |
| `src/performer/` | Brief 03's frame parts: the wrapper doors (intro), the stage, the gift tag on its kalava loop, the PACKED AT card (outro), and the open call that puts them together. |
| `src/audio/` | Sound timing and loudness (written by `scripts/prepare-audio.mjs`) and `Cue`, which lands a sound's attack on a frame. |
| `src/components/` | Print world (haldi ground, halftone, paper grain), the finger, font loading, brand type as live text (`Type.tsx`) and the candy pop (`pop.ts`). |
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

## The open call: choices worth knowing

- No performer clip, as asked: the frame is shown waiting for one. The tag reads SUNG BY YOUR NAME
  @YOU and the credit COVER OF YOUR SONG · ANY ARTIST. Big Shoulders is all caps, so the handle is
  @YOU.
- The stage is the LANTERN world from Brief 04: ink, one haldi light, cream letters. The light's edge
  is haldi dots that shrink outwards, never a gradient.
- तेरी बारी ("your turn") is the headline, with the English lines under it, as the copy voice asks.
- One seal: FLAVOUR No. 01 with खट्टा मीठा set in Khand under the number. Its rim reads TANGY ·
  SWEET · LIVE · NIGHT 01, the flavour line from the rules. The PACKED AT block is a card, not a
  second seal.
- The drone is the pluck retuned to a tanpura cycle, so the reel needs no fourth sound. The thread
  rings on every string, louder on the low ones, and the tag twitches with it.
- The wrapper flaps swing open in real perspective, and their folds stop at each flap's edge.
- The card covers the stage. The headline, the lines and the tag go once the card is over them, and
  the light goes out as it lands, so nothing peeks out from under it.
- Once settled, every word sits between y 220 and y 1620 and left of x 940.
- Not built yet: the PerformerClip composition that takes a performer's video (with the face check
  against the thread) and the clips.csv batch script. They will use these same parts.
