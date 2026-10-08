# film/ · Dhwanikul motion

Remotion (React + TypeScript) project for the logo film and every reel after it.
The brand rules in `../brand/BRAND-RULES.md` are the law; colours and sizes are read from
`../brand/tokens.json`, and the label, ध्वनि KUL and the tagline are the designer's own outlines
from `../logo/dhwanikul-lockup-yellow.svg`, so the Devanagari is always shaped exactly as designed.

## Status

Brief 02 is done. Brief 03 is built as the Night 01 open call: its frame, with no performer clip in it,
and the 40 s open call film बस तू बाकी है, made only in code. Brief 04's machine has stages 1 and 2
(word timing, the music as data, the sync test), measured on a test song and waiting for the first
member's original. इमली क्यों? is the 21 s reel that tells the imli legend once, for the pinned row,
so no other film has to.

- `out/logo-film.mp4`: the logo film, 5.4 s, 1080 x 1920, 30 fps, with the FLAVOUR No. 01 seal
- `out/logo-film-clean.mp4`: the same film with no seal (and no thud), to open any future reel
- `out/logo-film-frames/`: eight frames, one per beat
- `out/proof-pluck.mp4` and `out/proof-pluck-frames/`: the approved one second pluck proof
- `out/open-call.mp4`: the Night 01 open call, 10 s, 1080 x 1920, 30 fps
- `out/open-call-frames/`: four frames: the wrapper opening, the seal landing, the lit stage, the PACKED AT card
- `out/open-call-film.mp4`: the 40 s open call film, बस तू बाकी है, 1080 x 1920, 30 fps, with its score
- `out/open-call-film-frames/`: eight frames, one per beat of the story, and the grid cover (its last frame)
- `out/open-call-hero.mp4` and `out/open-call-hero-frames/`: the film's approved hero proof
  (`open-call/`: creative direction, screenplay, score, implementation notes)
- `out/imli-film.mp4`: इमली क्यों?, 21 s, 1080 x 1920, 30 fps, with its score: who Tansen was, his
  tamarind tree, why our singers get an imli (`imli/creative-direction.md`)
- `out/imli-film-frames/`: eight frames, one per bar, and the cover (its last frame)
- `lyric/`: the lyric film machine (`lyric/README.md`) and the lyric system for viewers who have
  never heard the legend (`lyric/system.md`). Songs go in the pack's `songs/` folder.

## Use it

```
cd film
npm install
npm run studio          # Remotion Studio: scrub LogoFilm, LogoFilmClean, OpenCall, OpenCallFilm, ImliFilm, LyricSyncTest, ProofPluck, Checks
npm run film            # renders both logo films and the eight frames
npm run open-call       # renders the 10 s open call and its four frames
npm run open-call-film  # renders the 40 s open call film, its eight frames and the grid cover
npm run score           # writes the open call film's music from open-call/beat-map.json
npm run hero            # renders the open call film's hero proof and its eight frames
npm run imli            # renders इमली क्यों? (its score first), its eight frames and the cover
npm run proof           # re-renders the pluck proof
```

The lyric film machine (brief 04), for a song in `../songs/<song-name>/`:

```
npm run lyric:setup                  # once per computer: Python tools and models, about 3 GB
npm run lyric:timing -- <song-name>  # stage 1: word-timestamps.json, phrases.json, timing-report.md
npm run lyric:analyse -- <song-name> # stage 1: beat-map.json (tempo, bars, sections, energy, voice)
npm run lyric:sync -- <song-name>    # stage 2: sync-test.mp4, to watch with sound
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
carries over to it. Run `npm run open-call` after adding the recordings. The 40 s film's whole score
(tune, drone and groove) is played on the same three sounds: run `npm run open-call-film`.

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

## The open call film, beat by beat (`src/openCall/`)

90 BPM, 20 frames a beat. Every move lands on a beat of the score; the thread at y = 672 is one line
from edge to edge in every frame.

| Time | What happens |
|------|--------------|
| 0.0 to 2.0 | In the dark a packet hand plucks the thread: Sa, and पहला सुर rings with it. Re, Ga, Pa rising: किसका? lands on Pa and is left hanging. NIGHT 01 NEEDS ITS FIRST VOICES types in. The blank SUNG BY tag hangs on the thread. |
| 2.0 to 2.8 | The camera pans along the thread off the dark stage onto an imli wrapper. |
| 2.7 to 7.0 | The thread is lifted into Tansen's tamarind tree from both trunk bases, a stop per note (Ga, Re, Sa, low Dha), the printed crown rising inside it. तानसेन की इमली prints in through halftone dots, GWALIOR SAYS IT SWEETENED HIS VOICE types, pods appear, leaves are shaken off the crown. |
| 8.0 to 10.5 | A pod falls; the tree goes back down into the line, which catches the pod. A wrapper pops round it and twists shut, the thread ties both ends and flings the tied imli up to the top of the packet. |
| 10.1 to 16.0 | The border draws in, the FLAVOUR No. 01 · खट्टा मीठा band drops, the ingredients panel unrolls and is written a row a beat, the camera in close: IMLI 1, KALAVA 1, SONG 1, AUTOTUNE 0% (the thread lies dead still), VOICE with nothing after it. |
| 16.0 to 18.7 | बस तू बाकी है lands with a thud. ONE INGREDIENT MISSING: YOU, and the fine print. |
| 18.7 to 20.0 | Silence. The blank tag slides in on the slack thread; its caret blinks. |
| 20.0 to 24.0 | The thread snaps taut and yanks the label away. The stage underneath; the light flickers on. तेरी बारी pops in with the tune played on the thread. BRING ONE SONG · WE BRING THE IMLI. |
| 24.0 to 29.3 | मीठी डोर. The tied imli drops into the light, untwists, the pod is bitten: 1 EAT THE IMLI BEFORE YOU SING. A wrist rises to the thread, the kalava winds twice round it and ties: 2 TIE THE THREAD ON AFTER. |
| 29.3 to 32.0 | PULP floods out of the light. The camera pulls back along the thread, wrist after wrist: YOU'RE KUL NOW, ध्वनि KUL. |
| 32.0 to 37.3 | The PACKED AT · PADHARO SA seal stamps down and the ground is the label again. तेरी बारी threads onto the line; then a piece a beat: the tied imli, the flavour band, 17 SAT OCTOBER, PADHARO SA · FREE ENTRY, UNPLUGGED COVERS · COME SING OR COME LISTEN. |
| 37.3 to 40.0 | The blank tag swings back in, DM TO PERFORM drops, the thread ties off with the rakhi knot on the final Sa. The last frame is the grid cover. |

## इमली क्यों?, bar by bar (`src/imli/`)

90 BPM, 20 frames a beat, 8 bars. One Hindi hero word and one short English line at a time; the
thread at y = 672 is one line from edge to edge in every frame. Why it exists and how to post it:
`imli/creative-direction.md`.

| Time | What happens |
|------|--------------|
| 0.0 to 2.7 | In the dark, one haldi light on the tied imli threaded on the string. इमली क्यों? pops in, WHY DO OUR SINGERS GET A CANDY? types, a rising question on the thread. The camera pans along the thread onto an imli wrapper. |
| 2.7 to 5.3 | Tansen's tomb prints in through halftone dots. तानसेन, THE GREATEST SINGER OF AKBAR'S COURT. |
| 5.3 to 8.0 | The thread is lifted into the tamarind tree beside the tomb, a stop a beat. HE RESTS IN GWALIOR, BESIDE AN IMLI TREE. |
| 8.0 to 10.7 | One leaf lets go, rocks down and lands on the string. GWALIOR SAYS: CHEW ONE OF ITS LEAVES. |
| 10.7 to 13.3 | मीठी आवाज़. The string plays a two bar tune with the leaf riding it. AND YOUR VOICE TURNS SWEET. |
| 13.3 to 16.0 | The tree goes back into the line and the tomb prints out. A wrapper closes round the leaf, twists shut and is tied: इमली, SO EVERY DHWANIKUL SINGER GETS AN IMLI. |
| 16.0 to 18.7 | The candy is flung to the top. A wrist rises to the thread and the kalava is tied on it: कुल, TIED WITH THE THREAD THAT MAKES YOU FAMILY. |
| 18.7 to 21.3 | The wrapper folds into the ध्वनि KUL label on haldi, SWEET VOICE, TIED. types, the thread ties off. The last frame is the cover. |

## What is where

| Folder | What |
|--------|------|
| `src/thread/` | The kalava thread (frozen after the proof). `ThreadPiece` draws it along any path; `pluck.ts` plucks it between two points or rings a loose end; `knot.ts` and `RakhiKnot` tie and untie the rakhi knot; `motion.ts` slides, trails and whips it; `stringLine.ts` makes the one string at y = 672 that a film's score rings. |
| `src/wrapper/` | The tied imli from `logo/dhwanikul-mark.svg` as separate layers, and `untwist.ts` / `OpenEnd` for the ends spinning open. |
| `src/label/` | The label, the popping wordmark, the stamped seal and the typed tagline. `lockup.ts` holds the outlines from the lockup svg. |
| `src/film/` | The logo film: timeline, the threads pulled off (`unravel.ts`), the returning thread (`heroThread.ts`), and the composition. |
| `src/proofs/` | The approved pluck proof. The film reuses it as its second beat. |
| `src/performer/` | Brief 03's frame parts: the wrapper doors (intro), the stage, the gift tag on its kalava loop, the PACKED AT card (outro), and the open call that puts them together. |
| `src/openCall/` | The 40 s open call film: its clock and score, the one thread, the tag's pendulum, the camera, the scenes and their parts (tree, pod, wrists, ingredients panel, venue seal). `parts/treeLift.ts` lifts Tansen's tree out of the thread for any film. See `open-call/implementation-notes.md`. |
| `open-call/` | The film's creative direction, screenplay, beat map (the score) and implementation notes. |
| `src/imli/` | इमली क्यों?: its clock and score, the string, the camera, Tansen's tomb, the dark stage and the wrapper behind the thread, the leaf, the candy and the wrist in front of it, the words. |
| `imli/` | The reel's creative direction (the legend, checked, with its sources) and its beat map. |
| `src/lyric/` | Brief 04's engine. So far the sync test (stage 2). |
| `lyric/` | Brief 04's machine: the Python tools for stage 1 (`tools/`), how they work and how accurate they are (`README.md`), and the lyric system (`system.md`). |
| `src/audio/` | Sound timing and loudness (written by `scripts/prepare-audio.mjs`) and `Cue`, which lands a sound's attack on a frame. |
| `src/components/` | Print world (haldi ground, halftone, paper grain), the finger, font loading, brand type as live text (`Type.tsx`) and the candy pop (`pop.ts`). |
| `src/lab/` | Checks: the thread against `svg-parts`, the imli against the logo, a test bench of every thread ability. |
| `../songs/` | One folder per member's original song: the song, its lyrics, the artist's OK, and everything the machine makes from them. `_test-hinglish/` is the machine's own test song. |

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
