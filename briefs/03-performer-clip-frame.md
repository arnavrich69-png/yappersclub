# Brief 03 · Performer clip frame (for cover performances)

**What:** a reusable frame that turns any performer's phone video from the night into a Dhwanikul post.
**When:** ready before Night 01 so clips can go out the same week.

## How covers are posted (important)

Covers are other people's songs. So:
- The performer posts it, as a **collab** with Dhwanikul.
- The original song and artist are credited on screen.
- **No lyric text on screen** for covers. Lyric films are only for members' own songs (Brief 04).
- Keep clips short (under a minute). This lowers risk; it is not legal advice.

## Prompt to paste

```
Read brand/BRAND-RULES.md first. Its "Fixed" sections are locked. Look at logo/, svg-parts/
and night01/story.png for the look.

Build a reusable Remotion composition in film/ called PerformerClip: 1080 x 1920, 30 fps, that takes:
- video: the performer's vertical phone clip (any length up to 60 s, keep its own audio),
- props: { performer, handle, song, originalArtist, flavourNumber, flavourNameHi, night, venue }.

Design:
1. The clip fills the frame. Add very light halftone and grain over it so it sits in the print world.
2. The thread crosses at y = 672 for the whole clip, like on every post. It must never cover the
   performer's face: if a face is detected near y = 672, the thread is still drawn but the
   performer's video is shifted down inside the frame so the face sits below the thread.
3. A cream gift tag hangs from the thread on a short loop, near the left edge: the performer's name in
   Modak (cream letters, ink outline, brown shadow) and their @handle in Big Shoulders. It swings in
   when the clip starts and settles with a small pendulum overshoot.
4. Bottom left, small, in Big Shoulders: COVER OF <SONG> · <ORIGINAL ARTIST>.
5. Top right seal: FLAVOUR No. <XX> with the Hindi flavour name.
6. Intro (0.6 s): the frame opens like an imli wrapper untwisting to reveal the video.
7. Outro (1.2 s): the label card: tied imli logo, "PACKED AT · <VENUE> · GWALIOR", "NIGHT <XX>".
8. Respect Reels safe zones from the brand rules.

Then make a small batch script: I put clips in clips/ and a clips.csv with one row per clip
(file, performer, handle, song, originalArtist). It renders every clip to out/<performer>-<song>.mp4.

Test it with any sample vertical video. Show me 4 frames and one rendered test before I use it.
```
