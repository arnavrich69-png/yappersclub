# Implementation notes · stages 4 and 5

The film is one composition, `OpenCallFilm`: 1200 frames, 40 s, 1080 x 1920, 30 fps, one score.
The stage 4 hero proof is frames 520 to 719 of it, rendered on its own as `OpenCallHero`. The full
film plays those 200 frames pixel for pixel as they were approved (checked against the proof's
eight PNGs).

- `film/out/open-call-film.mp4`: the whole film, with sound
- `film/out/open-call-film-frames/`: eight frames (question, Tansen's tree, packed, ingredients,
  yank, your turn, kalava, kul) and the cover, the film's last frame
- `film/out/open-call-hero.mp4` and `film/out/open-call-hero-frames/`: the approved hero proof
- `npm run open-call-film` renders the film and its frames, `npm run hero` the proof,
  `npm run score` rewrites the music only

## Architecture (`film/src/openCall/`)

| File | Job |
|------|-----|
| `timing.ts` | The film clock. 90 BPM at 30 fps is exactly 20 frames a beat, so every beat, eighth and sixteenth is a whole frame. Scenes, every hit the picture lands on, the hero range |
| `score.json`, `score.ts` | The hit list written with the music by `scripts/make-score.mjs`: every pluck, drone string, thud and crinkle with its frame |
| `thread.ts` | The one thread: on the grid line in screen space, bent by whatever weighs on it or pulls it (a finger, a caught pod, the candy's necks, a tag), ringing on every string in the score from the point it is played, dead still under AUTOTUNE 0%, silenced by the score's silence, shaken by the fling, the yank and the stamp |
| `tag.ts` | The blank tag's three visits (the dark, the silence, the call to action): each a real pendulum driven by its pivot and nudged by the strings, integrated from its arrival so every frame is reproducible |
| `camera.ts` | World layers take the camera (the pan, the close-up on the ingredients, the push into the light, the pull back across the kul); the thread layer stays on the grid line and only feels the knocks |
| `parts/` | The label sheet, flavour band, ingredients panel, the tree (outline, stops, printed crown and trunk), the pod (from `svg-parts`, with a bite), wrists and their kalava, the venue seal, the halftone print mask |
| `scenes/` | `Opening` (scenes 1 to 3), `Paper` (the wrapper that becomes the recipe packet), `YourTurn` (the stage and तेरी बारी), `Ritual` (मीठी डोर, the kul, PULP), `Night` (the seal and the Night 01 label) |
| `OpenCallFilm.tsx` | The composition: the world behind the thread, the thread layer, the world in front of it, an overlay, one score |

Shared parts were extended without changing what they already draw (checked frame for frame against
the logo film, the 10 s open call and the hero): `performer/Stage.tsx` takes any light position and
has a movable `StageArt`; `performer/GiftTag.tsx` draws a blank tag with fill-in lines and a caret;
`label/Seal.tsx` can carry other art; `components/Type.tsx` takes a fill.

## The thread is never cut

The rules say the thread at y 672 is never cut, so it is one line from edge to edge in every frame:

- The pan off the dark stage moves the world under the thread. Its stripes travel with the camera,
  31 whole pattern repeats over the pan, so the thread after the pan is stripe for stripe the thread
  of the later scenes.
- Tansen's tree is not drawn by a free end. The thread is lifted into it from both trunk bases at
  once, a stop per note: trunk and branches on Ga, the lower crown on Re, the upper crown on Sa,
  closed at the top on low Dha. The rest of the outline between the two climbing points is a low
  leafy crown that rounds out as they climb, so it is a tree at every stop, and it rings on each note.
  The printed tree (a haldi crown of tamarind sprigs, a tamarind trunk, halftone and grain) rises
  inside it. When the pod falls the tree goes back down into the line the same way.

## The music (`scripts/make-score.mjs`)

The score in `open-call/beat-map.json` is played on the three prepared brand sounds and written as
one 40 s wav, so sync is sample exact (checked: every hit rises on its frame, the mp4's AAC track
lines up to the sample, the silence is truly silent).

- The tune is the pluck repitched to Raag Bhupali, each note closed with a 0.85 s decay.
- The drone is the four tanpura strings left to ring.
- The keherwa groove is the thud (dha, and a lower ge) and slices of the wrapper crinkle (na, ti),
  a different gesture each time so it never machine-guns.
- The yank is a loud pluck with a sped-up crinkle swish; the light is a thud; the stamp the biggest thud.
- `STEM=drone|tune|groove npm run score` writes one voice alone to `out/tmp` for balancing.

## Deviations from the screenplay, and why

1. **Into the wrapper**: the camera pans along the thread off the dark stage, whose torn edge slides
   away, instead of flying through the tag's punched hole. The tag then is not in front of the camera
   at all; the pan keeps the thread on the grid line through the change of world.
2. **The tree** is lifted into shape from both trunk bases, not drawn by a travelling head (see
   above), and the printed crown and trunk were added inside the outline: as an outline alone it read
   as a loop of rope, not a tree.
3. **Leaves**: four are shaken off the crown when it closes, on the rustle, and flung out to the sides
   above the line, so they never cross तानसेन की इमली.
4. **Packed**: the pod is caught in a dip of the thread rather than followed down by the camera; the
   wrapper pops round it, twists shut and is tied, and the thread flings the tied imli up to its place
   at the top of the packet. SO WE PACKED SOME FOR YOU was dropped: the flavour band says it.
5. **Ingredients panel** (from stage 4): the nutrition panel's own format, English with Hindi in
   Khand (इमली, कलावा, गाना, आवाज़) and quantities in a column. The thread stays on the grid line above
   the panel: it rings on each row's note and lies dead still for a beat under AUTOTUNE 0%. The camera
   goes in close on the panel while it is written (so the rows are 35 px on screen) and back out for
   बस तू बाकी है, which sits under the panel.
6. **The tag** slides off the thread as the ritual begins, and तेरी बारी falls out of the light as
   the imli drops into it, so the light holds one thing at a time.
7. **Wrists**: five, all cream like the packet hand, told apart by their sleeves in the brand's
   colours (imli with a haldi cuff, ink, tamarind with a bangle, cream with stripes, haldi). The
   palette has no second skin tone that holds up on PULP, and denim, a watch or a hoodie would bring
   in colours the rules do not have.
8. **The night**: the stamp cuts from PULP to the empty label and तेरी बारी threads onto the line from
   the right, like beads, with its headline bar on the thread.

## Known weaknesses

- The sounds are still the synthetic stand-ins. Record the pluck, crinkle and thud into `audio/` and
  run `npm run open-call-film`: the whole score re-renders with them.
- While the crown grows it passes through two or three in-between shapes a frame each (a flat cap on
  the trunk); at full speed they read as growth.
- Step 1 (EAT THE IMLI BEFORE YOU SING.) is on screen for about 2 s, typing in, before the wrist rises
  through it; step 2 has the rest of the scene.
- The fine print (NET WT: ONE VOICE · BEST BEFORE: 17.10.2026) is 26 px: a detail to find, not to read.
- The packet hand in the opening is a single stiff finger; it reads as packet art, but it is plain.
- Halftone and grain are fine detail; check the film on a phone after Instagram's compression.

## Performance

`npm run open-call-film` takes about 16 minutes on this machine: the picture about 14 (0.7 s a
frame; the paper grain and the tree's print are the costly filters), the sound a minute, the nine
stills one more. The tag's pendulum integrates at 12 steps a frame from its arrival, which costs
nothing next to the SVG filters.

## Checked on the final render

- The hero's eight frames are pixel for pixel the approved proof's.
- A frame rendered twice is byte for byte the same.
- The soundtrack is the score with no offset: Remotion's mix matches it to -98 dB, the mp4's AAC
  track lines up to the sample (only AAC's own noise, -55 dB, remains), and the silence in bar 8
  is digital silence in the mix (-99 dB in the AAC).
- The thread is one line from edge to edge in all 1200 frames, and every settled word sits between
  y 220 and y 1620 and left of x 940.
