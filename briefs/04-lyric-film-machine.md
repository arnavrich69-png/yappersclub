# Brief 04 · The lyric film machine (members' original songs)

**What:** the PYAAR? method from `reference/Lyric-Video-Process-Guide.pdf`, rebuilt inside the Dhwanikul look.
One machine, every original song, every film unmistakably Dhwanikul. This is the prize for members who
perform their own music.
**Only for originals.** Get the artist's written OK before you start, and credit them in the film and the caption.

## The idea in one line

Every song is a new **flavour** of imli. The film opens the wrapper, the thread plays the song's strings,
and the meaning of each lyric decides what happens on screen.

## The three worlds of a song

| World | Ground | Used for |
|-------|--------|----------|
| **LABEL** | Imli orange wrapper, cream panels, halftone | The story: verses, arguments, everyday scenes |
| **LANTERN** | Ink black, one haldi yellow pool of light, cream letters | Quiet, intimate, late night lines |
| **PULP** | Tamarind brown, sticky, darker, slower | The inside of the imli. Reserved for the song's emotional peak only |

The thread is the only red in every world.

## What the thread can become

Underline · a string plucked on held notes · stitches that sew two words together · a knot on a rhyme ·
a rakhi on a wrist · a kite string (patang ki dor) for lines that fly · a clothesline for words ·
a rope between two people · the four strings of a tanpura when the music drones · the tie that closes the film.
Keep the same thread alive from scene to scene whenever possible.

## What the label world gives you

Stamps (verdicts, decisions) · nutrition facts and ingredient lists (any list in a lyric) · best before and
batch numbers (time) · twisting and untwisting wrappers (transitions) · peel off stickers (reveals) ·
seals (payoffs) · tamarind leaves (rare, for big moments) · Tansen's tamarind tree (once per film at most).
No instruments, mics or sound wave icons.

---

## Stage 1 · Word timing (about 15 minutes, automatic)

Put `song.mp3` (or .wav) and `lyrics.txt` (one lyric line per line, original script) in a new folder `songs/<song-name>/`.

```
I have provided two files in songs/<song-name>/:
- song.mp3: the original song (a Dhwanikul member's own track)
- lyrics.txt: the exact lyrics, one line per lyric line

Before creating any video, create highly accurate word level timestamps for the lyrics.
Inspect the environment and install whatever local tools are needed. Separate the vocal from the
music first (for example with Demucs), then force align my lyrics to the vocal (for example torchaudio
MMS_FA with uroman romanisation, which handles Hindi, English and mixed lines), and cross check with
an independent Whisper transcription.

lyrics.txt is the source of truth for the WORDS. The audio is the source of truth for the TIMING.
Do not transcribe and replace my lyrics.

Save word-timestamps.json as [{ "word": "...", "start": 1.240, "end": 1.510 }, ...]
and phrases.json grouping the words into the actual lyric lines, keeping their timing.

Pay attention to fast delivery, repeated words, held notes, ad libs and pauses. Absorb unlisted ad libs
so they do not drag nearby words out of place.

At the end, verify the timestamps cover the song and report any lines with poor confidence.
Do not start building the video.
```

## Stage 2 · Sync test video

```
Do NOT modify or re-run the alignment.
Create a plain 1080 x 1920, 30 fps verification video, sync-test.mp4: black background, the original
audio, the current lyric line in the middle with the sung word highlighted using the exact word
timestamps, and small debug text at the bottom (song time, line number, word, start and end).
Hindi must be shaped correctly (use a proper text shaper). No effects. This is only for checking timing.
Stop after rendering and tell me the path.
```

Watch it with sound. Note any words that light up early or late.

## Stage 3 · Creative direction (the most important stage)

```
The sync test is approved. FREEZE word-timestamps.json, phrases.json and the audio. Do not modify them.

Read brand/BRAND-RULES.md and this brief (briefs/04-lyric-film-machine.md) completely. They are fixed.
Then act as a senior motion designer and music video art director and design the visual language of
this song INSIDE the Dhwanikul world. Do not code anything yet.

The most important principle: THE MEANING OF THE LYRIC SHOULD DRIVE THE VISUAL.
For every line ask: what is the singer actually saying, and how could that meaning physically exist
on screen using the Dhwanikul vocabulary (the thread, the label, the wrapper, the stamp, the seal,
the three worlds LABEL, LANTERN and PULP)? Do not cycle zoom, slide and fade. Those are tools, not ideas.

1. Name the song's FLAVOUR: a Hindi flavour name and a three word English line, in the voice of a packet.
2. Analyse every lyric line: meaning, slang, code switching, cultural context.
3. Think word, phrase, scene, sequence, song. Group adjacent lines into sequences. Some words barely move,
   some get a whole scene, some moments go quiet so the next one hits harder.
4. Transitions must be motivated: the thread pulls us into the next scene, a wrapper twists shut and
   opens on a new world, a stamp lands and becomes the next background.
5. Analyse the audio (structure, energy, beats, silences) into beat-map.json. Use word timing for lyrics,
   beats only for secondary motion and big payoffs. Design an intensity curve with real contrast.
   PULP appears only at the emotional peak.
6. Typography: Modak for hero words (cream, ink outline, brown shadow), Big Shoulders for English support,
   Khand for small Hindi. Respect Devanagari shaping: never split into raw characters.

Deliver creative-direction.md and visual-screenplay.json (every line: start, end, lyrics, meaning,
hero words, concept, what the thread does, typography, world, motion, transition in and out, intensity
1 to 10, custom assets needed, which sequence it belongs to).

Then review it yourself: reject anything generic, repetitive, template like, unreadable at speed,
culturally wrong, or that ignores the thread. Count how often each idea repeats and redesign repeats.
Give me the 10 strongest moments so I can review before implementation.
```

Push back on anything generic before approving. Ask "what is the singer saying, and how does the thread show it?"

## Stage 4 · Engine and a short hero proof

```
Creative direction APPROVED. It is now the creative source of truth. Timing and audio stay frozen.

Build the motion engine in Remotion (React + TypeScript) in film/lyric/, reusing the thread component
from the logo film if it exists:
timing/ (frozen JSON, one song clock) · typography/ (akshara safe splitting, Modak hero words with
outline and shadow, Big Shoulders and Khand) · thread/ (one continuous thread character: path following,
pluck and ring, knots, stitches, wraps) · label/ (borders, bands, seals, stamps with weight, nutrition
panels, wrappers that twist and untwist) · backgrounds/ (LABEL, LANTERN, PULP as systems with halftone
and grain, never flat colour) · camera/ (2.5D camera that can travel along the thread) · sequences/
(one file per screenplay sequence) · utils/ (easing families, material springs, seeded randomness).

Materials move differently: wrapper crinkles and snaps, thread is elastic and rings like a string,
stamps drop fast, squash and rebound, Modak letters pop with a soft candy bounce.
No linear slides, no scale from zero, not everything centred, no random glitch.
Keep critical text in the Reels safe zones. Deterministic renders.

Do NOT render the whole song. Render ONE short hero section (5 to 8 seconds) of the strongest moment
from the screenplay, fully finished: final type, backgrounds, thread, transitions, timing.
Inspect rendered frames yourself and fix anything that looks like a coding demo.
Deliver hero-proof.mp4, 8 PNG frames and implementation-notes.md. Then stop.
```

## Stage 5 · Sections, then the whole song

```
Hero proof approved. Now render <start time> to <end time> on the same engine.
Review contact sheets of key frames first, fix issues, then do the full render.
```

Repeat by time range until the song is done. End every film on the thread tying off and the label:
"<FLAVOUR NAME> · <ARTIST> · ध्वनि KUL".

## Rules that made the original work (keep them)

1. **Freeze what's approved** and say so in every prompt.
2. **Review pictures, not code:** test videos, frames, short proofs.
3. **Prove small first:** a few polished seconds before the whole song.
4. **Demand Hindi shaping tests** for every font before using it.
5. **Name the platform:** Reels, so text avoids the buttons and caption.
