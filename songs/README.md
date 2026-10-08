# songs/ · one folder per member's original song

Lyric films are only for members' own songs (brief 04). For each song, make a folder with a short
name, no spaces, and put three things in it:

```
songs/<song-name>/
  song.mp3       the finished track (or .wav, .m4a, .flac): the exact master that will be posted
  lyrics.txt     the exact lyrics, one sung line per line, in the script they are written in
  credit.txt     the artist's name as it should appear, and their written OK to make the film
```

lyrics.txt rules:
- One lyric line per line, written out in full every time it is sung (repeat a chorus each time).
- Hindi in Devanagari, English in English. Hindi typed in Latin letters (Hinglish) is fine too.
- A blank line, or a label in square brackets such as `[chorus]`, marks a new section. Labels are
  not sung and are never aligned.
- Leave out ad libs (oh, yeah, haan): the machine absorbs them so they do not drag the words.

Then, from `film/`:

```
npm run lyric:setup                  # once per computer: Python tools and models, about 3 GB
npm run lyric:timing -- <song-name>  # stage 1: word-timestamps.json, phrases.json, timing-report.md
npm run lyric:analyse -- <song-name> # beat-map.json: tempo, bars, sections, energy, silences, voice
npm run lyric:sync -- <song-name>    # stage 2: sync-test.mp4, to watch with sound
```

`_test-hinglish/` is the machine's own test: a made up groove with a synthetic voice, nobody's song.
Its `truth.json` holds the real time of every word, so the timing can be measured, not guessed.
