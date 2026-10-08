# Implementation notes · stage 4, the hero proof

The hero proof is a slice of the 40 s film, not a separate piece: frames 520 to 719 of the
`OpenCallFilm` composition (bar 7 beat 3 to the end of bar 9), rendered as `OpenCallHero`.
It starts half a bar before the silence so the finished recipe label is seen before it is yanked.

- `film/out/open-call-hero.mp4`: 6.7 s, 1080 x 1920, 30 fps, with sound
- `film/out/open-call-hero-frames/`: eight frames (recipe, silence, yank, dark, light, तेरी, बारी, your turn)
- `npm run hero` renders both; `npm run score` rewrites the music only

## Architecture (`film/src/openCall/`)

| File | Job |
|------|-----|
| `timing.ts` | The film clock. 90 BPM at 30 fps is exactly 20 frames a beat, so every beat, eighth and sixteenth is a whole frame. Scenes, hits and the hero range |
| `score.json`, `score.ts` | The hit list written with the music by `scripts/make-score.mjs`: every pluck, drone string, thud and crinkle with its frame |
| `thread.ts` | The one thread: on the grid line in screen space, sagging into a V under a weight, ringing on every string in the score from the point it is played (higher notes further right), silenced by the score's silences |
| `tag.ts` | The blank tag: slides in along the thread, swings as a real pendulum driven by its pivot and nudged by the strings, integrated from its arrival so every frame is reproducible |
| `camera.ts` | World layers take the camera (a push into the light, a kick on तेरी); the thread layer stays on the grid line and only feels the knock of the yank |
| `parts/` | The label sheet (border, diamonds, halftone, grain from the Night 01 story), the flavour band, the ingredients panel |
| `scenes/` | `RecipeLabel` (the packet and its yank), `YourTurn` (the LANTERN stage, the light, तेरी बारी) |
| `OpenCallFilm.tsx` | The composition: world layer, thread layer, one score. Scenes not built yet show a slate in the Studio only |

Shared parts were extended without changing what they already draw (checked frame for frame):
`performer/Stage.tsx` takes any light position and has a movable `StageArt`; `performer/GiftTag.tsx`
draws a blank tag with fill-in lines and a caret when there is no name.

## The music (`scripts/make-score.mjs`)

The score in `open-call/beat-map.json` is played on the three prepared brand sounds and written as
one 40 s wav, so sync is sample exact (checked: the hero's sound is the score's own slice to within
-72 dB, the mp4's AAC track lines up to the sample, every hit rises on its frame, the silence is
truly silent).

- The tune is the pluck repitched to Raag Bhupali, each note closed with a 0.85 s decay.
- The drone is the four tanpura strings left to ring, 3 dB lower than first planned so the tune sits clear.
- The keherwa groove is the thud (dha, and a lower ge) and slices of the wrapper crinkle (na, ti),
  a different gesture each time so it never machine-guns.
- The yank is a loud pluck with a sped-up crinkle swish; the light is a thud.
- `STEM=drone|tune|groove npm run score` writes one voice alone to `out/tmp` for balancing.

## Deviations from the screenplay, and why

1. **Ingredients panel**: built in the nutrition panel's own format, with English names, their Hindi
   in Khand (इमली, कलावा, गाना, आवाज़) and quantities in a column, instead of four long English lines.
   It keeps the brand's packet language, and the panel fits beside the tag.
2. **बस तू बाकी है** sits under the panel, printed on the paper (150 px), rather than settling into the
   blank line, so the thread stays free for the tag. It leaves with the paper on the yank.
3. **Fine print** added at the foot of the label: NET WT: ONE VOICE · BEST BEFORE: 17.10.2026, in the
   packet voice; it balances the lower third and doubles as the deadline.
4. **तेरी** pops on beat 1 (Sa) and **बारी** on beat 2 (Ga), each word on a note, rather than together.
5. **Velocities** were added to a few events in `beat-map.json` (the yank loud, the knots soft).

## Known weaknesses

- The sounds are still the synthetic stand-ins. The groove's character will come from your real
  pluck, crinkle and thud; record them and run `npm run hero`.
- The proof begins mid-groove (a slice of the film), softened by a 4 frame fade.
- While the tag arrives it swings over the left edge of the ingredients panel for a few frames.
- The camera's push into the light is gentle (3.5%); it can go further in the full film.
- The label appears already written: the thread writing each ingredient (scene 4) comes in stage 5.
- Halftone and grain are fine detail; check the proof on a phone after Instagram's compression.

## Performance

About 0.6 s a frame on this machine (200 frames in about 2 minutes, the headless shell, one tab).
The tag's pendulum integrates at 12 steps a frame from its arrival, which costs nothing next to
the SVG filters. The whole 40 s film will take about 12 minutes to render.
