"""Shared helpers for the lyric film machine's audio tools: a song's folder, reading and writing
audio, the lyrics, romanisation for the aligner. Brief 04, stages 1 and 2."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import soundfile as sf

TOOLS = Path(__file__).resolve().parent
PACK = TOOLS.parents[2]
SONGS = PACK / 'songs'
MODELS = Path(os.environ.get('LYRIC_MODELS', TOOLS / '.models'))
AUDIO_EXTS = ('.wav', '.mp3', '.m4a', '.flac', '.aac', '.ogg')


def log(*parts: object) -> None:
    print(*parts, file=sys.stderr, flush=True)


def song_dir(arg: str) -> Path:
    """`songs/<name>`, `<name>` or a path: the song's folder."""
    p = Path(arg)
    if not p.is_dir():
        p = SONGS / arg
    if not p.is_dir():
        sys.exit(f'No song folder {arg}. Put song.mp3 (or .wav) and lyrics.txt in songs/<song-name>/.')
    return p.resolve()


def song_audio(folder: Path) -> Path:
    for ext in AUDIO_EXTS:
        if (folder / f'song{ext}').exists():
            return folder / f'song{ext}'
    sys.exit(f'No song audio in {folder}: expected song.mp3, song.wav, song.m4a or song.flac.')


def work_dir(folder: Path) -> Path:
    w = folder / 'work'
    w.mkdir(exist_ok=True)
    return w


def decode(path: Path, rate: int, mono: bool) -> np.ndarray:
    """Decode any audio file with ffmpeg to float32 at `rate` (channels last)."""
    cmd = ['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'f32le', '-acodec', 'pcm_f32le', '-ar', str(rate), '-ac', '1' if mono else '2', '-']
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    return x if mono else x.reshape(-1, 2)


def write_wav(path: Path, x: np.ndarray, rate: int) -> None:
    sf.write(str(path), x, rate, subtype='FLOAT')


def read_wav(path: Path) -> tuple[np.ndarray, int]:
    x, rate = sf.read(str(path), dtype='float32', always_2d=False)
    return x, rate


def save_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def load_json(path: Path) -> object:
    return json.loads(path.read_text(encoding='utf-8'))


# ---------------------------------------------------------------- lyrics

DEVANAGARI = re.compile(r'[ऀ-ॿ]')
# What the aligner can hear: the MMS forced aligner's alphabet.
ALIGN_ALPHABET = set("abcdefghijklmnopqrstuvwxyz'")
ONES = 'zero one two three four five six seven eight nine'.split()


@dataclass
class Word:
    text: str  # exactly as written in lyrics.txt (punctuation kept for display)
    line: int
    index: int  # position in the whole song
    spoken: str = ''  # what the aligner listens for (romanised, lower case, a to z and ')


@dataclass
class Line:
    index: int
    text: str
    words: list[Word] = field(default_factory=list)
    section: int = 0  # blank lines in lyrics.txt start a new section


def read_lyrics(folder: Path) -> list[Line]:
    """lyrics.txt: one lyric line per line, as sung (repeats written out). Blank lines and lines in
    [brackets] (section labels such as [chorus]) only mark sections; they are not sung."""
    path = folder / 'lyrics.txt'
    if not path.exists():
        sys.exit(f'No lyrics in {folder}: expected lyrics.txt, one lyric line per line.')
    lines: list[Line] = []
    section = 0
    n = 0
    for raw in path.read_text(encoding='utf-8').splitlines():
        text = unicodedata.normalize('NFC', raw.strip())
        if not text or (text.startswith('[') and text.endswith(']')):
            if lines and lines[-1].section == section:
                section += 1
            continue
        line = Line(index=len(lines), text=text, section=section)
        for token in text.split():
            line.words.append(Word(text=token, line=line.index, index=n))
            n += 1
        lines.append(line)
    if not lines:
        sys.exit(f'{path} has no lyric lines.')
    return lines


_uroman = None


def romanise(text: str) -> str:
    """Latin letters the aligner knows, for any mix of Devanagari and Latin (uroman, as MMS was trained)."""
    global _uroman
    if DEVANAGARI.search(text):
        if _uroman is None:
            import uroman as ur

            _uroman = ur.Uroman()
        text = _uroman.romanize_string(text, lcode='hin')
    text = unicodedata.normalize('NFKD', text.lower())
    text = re.sub(r'\d', lambda m: ' ' + ONES[int(m.group())] + ' ', text)
    return ''.join(c for c in text if c in ALIGN_ALPHABET or c == ' ').strip()


def prepare(lines: list[Line]) -> list[Word]:
    words = [w for line in lines for w in line.words]
    for w in words:
        w.spoken = romanise(w.text).replace(' ', '')
    return words
