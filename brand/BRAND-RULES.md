# Dhwanikul brand rules

This file is the source of truth for every Dhwanikul visual: posts, stories, reels, films, print.
Everything in the "Fixed" sections is locked. Everything else is open for creative improvisation,
as long as it serves the concept.

## The concept (fixed)

Dhwanikul is wrapped like the imli that, Gwalior says, sweetened Tansen's voice,
and tied with the red thread that makes you family.

| Pillar  | What carries it on screen |
|---------|---------------------------|
| Sound   | The imli (Tansen's sweet voice trick) and the thread, which can be plucked like a string |
| People  | The thread. It ties the sweet, then it ties you in (the kalava of the guru's ganda bandhan) |
| Culture | Gwalior's legends, dressed in the look of a childhood candy wrapper |

Tagline: SOUND. PEOPLE. CULTURE.

## Colours (fixed)

| Name          | Hex       | Job |
|---------------|-----------|-----|
| Imli orange   | `#D2622A` | The wrapper. Default ground for posts. |
| Haldi yellow  | `#F2B21E` | Bands, dates, second ground, corner diamonds. |
| Cream         | `#EFE6D5` | Letters, labels, panels. |
| Ink           | `#16110E` | Outlines and all small text. |
| Tamarind brown| `#5A2E17` | Drop shadows under letters and the thread. |
| Thread red    | `#B8231A` | The thread only. Strand colours: dark `#74130C`, light `#D23A26`, yellow strands `#F2B21E`. |

Rule: red belongs to the thread and nothing else, so the eye always finds it.

Wrapper shades (only for the twisted wrapper ends): dark `#B04E1E`, light `#E57A3C`.

## Letters (fixed)

| Font | Job | Treatment |
|------|-----|-----------|
| **Modak** | ध्वनि KUL, every big headline, big numbers | Cream fill, ink outline at 4.5% of the font size, tamarind brown shadow offset down and right by 5% of the font size |
| **Big Shoulders Display** (800 and 900) | English claims, dates, bands, fine print | All caps, tracked open (letter spacing 0.1 to 0.35 em). Ink on cream, cream on orange |
| **Khand** (600 to 700) | Small Hindi inside labels and panels | Sized about 10% larger than the Big Shoulders next to it |

Every night gets a **flavour**: a number, a Hindi flavour name as the headline, and a three word English line under it.
Night 01: FLAVOUR No. 01, खट्टा मीठा, TANGY · SWEET · LIVE.

Devanagari must always be shaped correctly. Never split it into raw characters; split by aksharas or keep words whole.
Never use long dashes as punctuation in any copy. Use a middle dot (·), a colon or a full stop.

## The thread (fixed)

The kalava thread is the signature object. It does the job the red line did in the PYAAR? lyric video.

- **Look:** red cotton with a few yellow strands, twisted at about 32 degrees, softly round, with a tamarind brown print shadow under it. Reusable SVG in `svg-parts/`.
- **Knot:** a rakhi style tie with two loose ends hanging in a V, slightly frayed at the tips.
- **Grid height:** on every post it crosses the full width at 30% of the Instagram grid tile.
  - 4:5 post (1080 x 1350): y = **405 px**
  - 9:16 story or reel (1080 x 1920): y = **672 px** (the grid shows the middle 1080 x 1440, so 240 + 30% of 1440)
  - It enters at the left edge and leaves at the right edge at the same height. This makes the profile grid read as one continuous string. See `reference/instagram-grid-test.png`.
- **Allowed:** knotting, tying a wrapper, stringing a headline (the thread runs behind a Modak headline, lined up with its headline bar), being plucked, vibrating with the voice, wrapping around things.
- **Never:** fading out, changing colour, being cut, doubling up into two threads on one post.

## The label system (fixed)

Every post is a candy label:

1. **Border:** cream line 10 px, ink line 3 px inside it, yellow diamonds with ink outlines on the four corners.
2. **Brand:** the tied imli logo (from `logo/`), near the top.
3. **Flavour band:** yellow bar, ink outline, `FLAVOUR No. XX`.
4. **Headline** strung on the thread.
5. **Nutrition facts panel:** SOUND सुर 100%, PEOPLE लोग 100%, CULTURE रिवाज़ 100%, AUTOTUNE 0%.
6. **One seal**, never more. For a venue: `PACKED AT · VENUE · GWALIOR · NIGHT XX` around the venue's logo.
7. **Fine print** in the voice of a packet: one imli per singer, eat it before you sing, tie the thread after.

Texture: ink halftone dots (14% opacity, 8 px grid, rotated 18 degrees) and light paper grain. Flat colour, cheap print feel. Never glossy.

## Copy voice

Packet claims used as jokes, always warm, never smug.
Examples: NET WT: ONE EVENING · BEST BEFORE: YOU LEAVE · MFD. IN GWALIOR BY THE KUL · 100% UNPLUGGED · SUR GUARANTEED.
Hinglish is welcome. Hindi headlines, English support lines.

## The ritual: मीठी डोर

Every performer gets an imli tied with a kalava thread and a tag (`ritual/`).
Eat the imli before you sing. Tie the thread on after. You're kul now.

## Motion principles

- **Materials move differently.** Wrapper: crinkle, snap, slight overshoot when it flattens. Thread: elastic, overshoots and settles, vibrates like a string (standing wave) on strong sung notes. Stamps and seals: fast drop, squash, small rebound, a little ink spread. Modak letters: pop in with a soft candy bounce.
- **The thread is a character.** Prefer continuing the same thread over spawning a new one. It can carry the camera from scene to scene.
- **Restraint, then payoff.** Do not move everything on every beat. Use downbeats for stamps, knots and scene changes.
- **Sound design:** a plucked string for the thread, a wrapper crinkle, a stamp thud. Record real ones (a guitar string, a real imli wrapper, a book on a table) so they are copyright free.

## Instagram safety

- Keep critical text away from the top 220 px and bottom 300 px of 9:16 frames and from the right edge where the buttons sit. Decoration may bleed.
- Cover songs: post performance clips as collab posts with the performer, credit the original artist, never put cover lyrics on screen. Lyric films are only for members' original songs.

## Never

Instruments, mics, headphones or sound wave icons as decoration. Neon, glow, gradients, glossy 3D. Lyric text on cover clips.
More than one seal on a post. The thread in any colour but red with yellow strands. Dashes as punctuation in copy.
