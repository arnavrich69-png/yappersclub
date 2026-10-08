# The lyric film machine (brief 04)

Every member's original song becomes a Dhwanikul lyric film by the PYAAR? method: word timing,
a sync test, creative direction, a hero proof, then the film. This folder holds the machine.

| Stage | What runs | What you get |
|-------|-----------|--------------|
| 1 · Word timing | `npm run lyric:timing -- <song>` | `word-timestamps.json`, `phrases.json`, `timing-report.md` |
| 1 · The music as data | `npm run lyric:analyse -- <song>` | `beat-map.json` |
| 2 · Sync test | `npm run lyric:sync -- <song>` | `sync-test.mp4` |
| 3 · Creative direction | a conversation, no code | `creative-direction.md`, `visual-screenplay.json` |
| 4 · Hero proof | the engine in `film/src/lyric/` | `hero-proof.mp4`, eight frames, notes |
| 5 · The film | the same engine, section by section | the film |

How to hand over a song: `../../songs/README.md`. First time on a computer: `npm run lyric:setup`.

## Stage 1: how the timing is made (`tools/timing.py`)

lyrics.txt is the source of truth for the words, the audio for the timing. Nothing is transcribed.

1. **The vocal is separated** from the music with Demucs (the htdemucs_ft vocal model).
2. **The lyrics are romanised** with uroman, the romaniser the aligner was trained with, so Hindi in
   Devanagari, Hindi typed in Latin letters, English and mixed lines all go through the same way.
3. **Forced alignment** with the MMS forced aligner (wav2vec2, 300M parameters, 1130 languages) and
   CTC: every letter of every lyric is placed on the vocal, 20 ms at a time. A "star" token between
   lines matches anything, so ad libs and backing vocals are absorbed instead of dragging words.
4. **Words stay whole.** If one letter of a word is pulled far from the rest (onto an ad lib), the
   word keeps its main group and the report says so.
5. **Held notes.** A word's end is carried on while the voice holds a pitched note at close to the
   word's own level (pYIN pitch tracking, so drum bleed in the vocal never counts), up to the next word.
6. **Whisper checks, separately.** Whisper large-v3-turbo transcribes the vocal on its own, in Hindi
   and in English when the lyrics mix them. Each lyric word is matched to what Whisper heard near it
   (romanised and compared by consonant shape, so पहला and "pehla" match).
7. **The report** lists every line to check by ear (words pulled apart, words Whisper did not hear,
   implausibly short words, lines placed where there is little voice) and every stretch of voice
   with no lyric on it (an ad lib, or a line missing from lyrics.txt).

### How accurate (measured, not guessed)

`songs/_test-hinglish/` is a test song made for this: a groove with a synthetic voice reading an
original Hinglish lyric (Devanagari, Hindi in Latin letters, English, a held note, a repeated word,
punctuation, and an ad lib that is not in the lyrics), where the true time of every word is known.

| | median error | 90% within | worst |
|--|--|--|--|
| Word starts | 20 ms | 42 ms | 80 ms |
| Word ends | 70 ms | 100 ms | 134 ms |

At 30 fps a frame is 33 ms: starts land within a frame or two. Ends run a little late on purpose
(a word stays lit while it rings out). The held note is carried to within 70 ms of its true end, the
ad lib is absorbed and reported, and Whisper, on its own, heard most words where they were placed;
the lines it missed are listed for checking by ear. The same song always gives the same timing
(only Whisper's check can differ slightly from run to run, with the vocal's last bits of rounding).
`run.sh test/make_test_song.py` and `run.sh test/score_against_truth.py` rerun the test.
A synthetic voice is easier than a real singer, so the sync test (stage 2) is still the judge.

## Stage 1: the music as data (`tools/analyse.py`)

`beat-map.json` holds the tempo and every beat (fitted to a steady grid when the record keeps one
tempo, then moved onto the attacks themselves: within 2 ms on the test song), the bar lines, the
sections (where the music's colour and harmony change, alike sections sharing a letter), an energy
level from 1 to 10 for every beat, the silences, where the voice sings, and the loudest moments.
Lyrics are timed by their words; the beat map is for stamps, knots, scene changes and the peak.

## Stage 2: the sync test (`src/lyric/SyncTest.tsx`)

Black, the current line in the middle with the sung word lit in haldi, sung words cream, words to
come grey, and the timing in small print. Hindi is set whole, word by word, so every conjunct and
matra is shaped exactly as written. The song's own audio is joined to the picture with ffmpeg so
the sound sits exactly in place (checked: no offset, to the sample).

## Where things live

- `tools/` the Python tools (`setup.sh` installs them; `run.sh` runs one in its environment)
- `tools/.venv`, `tools/.models` the environment and the models, made by setup, not committed
- `songs/<song>/work/` intermediate files (the separated vocal, Whisper's transcript), not committed
