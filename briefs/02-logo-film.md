# Brief 02 · The 5 second logo film

**What:** the opener for every Dhwanikul reel. An imli tied with red thread gets plucked, untied, unwrapped, and becomes the label.
**When:** by Wednesday 14 Oct, so it can open the Night 01 reminder reel.
**Look at first:** `reference/logo-film-storyboard.jpg`.

## Sounds to record yourself (copyright free, 2 minutes on your phone)

1. One plucked string (guitar or tanpura), let it ring.
2. A real imli or toffee wrapper being untwisted, close to the mic.
3. A thick book dropped flat on a table (the stamp).

Save them as `audio/pluck.wav`, `audio/crinkle.wav`, `audio/thud.wav` in this pack.

## Prompt 1 · build the pieces and a one second proof

```
Read brand/BRAND-RULES.md first. Its "Fixed" sections are locked. Then look at
reference/logo-film-storyboard.jpg, the files in logo/ and svg-parts/.

We are making the Dhwanikul logo film in Remotion (React + TypeScript): 1080 x 1920, 30 fps,
about 5 seconds, using the sounds in audio/.

Do NOT build the whole film yet. First:

1. Set up a clean Remotion project in film/ with folders: components/, thread/, wrapper/, label/, audio/.
2. Build the thread as one reusable component: the kalava look from svg-parts (red with yellow strands,
   twisted at about 32 degrees, soft roundness, tamarind brown shadow). It must be able to:
   - follow any path,
   - be plucked: pulled into a curve, released, then ring as a decaying standing wave,
   - tie and untie the rakhi knot with two loose ends,
   - slide and whip with elastic overshoot.
3. Build the tied imli from logo/ (body, twisted ends, thread wraps) as separate layers so each part can move.
4. Render ONLY a 1 second proof: a finger plucks one loose end of the thread, the string rings in time with
   audio/pluck.wav. Save proof-pluck.mp4 and 4 still frames.

Motion must feel physical: anticipation before the pluck, overshoot, decay. No linear slides, no
scale from zero, no generic springs on everything. Deterministic renders only (seeded randomness).

Stop after the proof and show me.
```

## Prompt 2 · the full film (after you approve the proof)

```
Proof approved. Freeze the thread component and its look.

Now build the full logo film, about 5 seconds, 1080 x 1920, 30 fps:

0.0 to 0.5 s  The tied imli sits centred on haldi yellow with halftone. Silence. A tiny settle.
0.5 to 1.2 s  A finger plucks the loose end. The thread rings (audio/pluck.wav).
1.2 to 2.0 s  Both knots slip loose. The threads slide off and whip out of frame. The twisted ends
              untwist with a crinkle (audio/crinkle.wav).
2.0 to 2.8 s  The wrapper flattens towards camera into the orange label. ध्वनि KUL pops in with a
              soft candy bounce, outline and brown shadow arriving a frame after the fill.
2.8 to 3.6 s  The thread snaps back across the frame at y = 672 (the grid height), passes over the
              label like a string on a sweet box, and ties a rakhi knot. Pluck it lightly once more.
3.6 to 4.2 s  A cream seal stamps down on the downbeat (audio/thud.wav): FLAVOUR No. 01. Fast drop,
              squash, rebound, a little ink spread.
4.2 to 5.2 s  SOUND. PEOPLE. CULTURE. types in, letter by letter, in Big Shoulders. Hold.

Keep critical text inside the safe zones in the brand rules. Render logo-film.mp4 plus a version
with no seal (logo-film-clean.mp4) that can open any future reel, and export 8 frames as PNGs.
Check every frame yourself for Devanagari shaping, clipping and anything that looks like a coding demo.
Fix and re-render before showing me.
```
