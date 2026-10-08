"""Stage 1 of the lyric film machine: word level timestamps for a member's original song.

    python timing.py songs/<song-name>

Reads song.mp3 (or .wav, .m4a, .flac) and lyrics.txt from the song's folder and writes, next to them:

    word-timestamps.json   [{"word": "...", "start": 1.240, "end": 1.510}, ...] in lyric order
    phrases.json           the lyric lines with their timing and their words
    timing-report.md       coverage, and every line whose timing is not trustworthy

lyrics.txt is the source of truth for the words, the audio for the timing. How:

1. The vocal is separated from the music (Demucs, the htdemucs_ft vocal model).
2. The lyrics are romanised with uroman (Hindi, English and mixed lines alike) and force aligned to
   the vocal with the MMS forced aligner (wav2vec2, 300M, trained on 1130 languages). Star tokens
   between lines absorb ad libs and anything sung that is not in lyrics.txt, so nearby words keep
   their place.
3. Held notes: a word's end is carried on while its vocal keeps sounding, up to the next word.
4. An independent Whisper transcription (large-v3-turbo) is matched word by word against the
   alignment, and each line is scored on how far the two agree.

Nothing is transcribed into the lyrics: Whisper only checks.
"""

from __future__ import annotations

import argparse
import math
import os
import time
from difflib import SequenceMatcher
from pathlib import Path

import numpy as np

from common import (
    MODELS,
    Line,
    Word,
    decode,
    load_json,
    log,
    prepare,
    read_lyrics,
    read_wav,
    romanise,
    save_json,
    song_audio,
    song_dir,
    work_dir,
    write_wav,
)

ALIGNER = 'MahmoudAshraf/mms-300m-1130-forced-aligner'
WHISPER = 'mobiuslabsgmbh/faster-whisper-large-v3-turbo'
DEMUCS_VOCALS = '04573f0d-f3cf25b2.th'  # htdemucs_ft, the model the bag trusts for vocals
RATE = 16000
HOP = 320  # samples per aligner frame (20 ms)
FRAME = HOP / RATE
# Inside one word, letters further apart than this are not the same word sung.
SPLIT_GAP = 0.45

os.environ.setdefault('HF_HOME', str(MODELS / 'huggingface'))


# ---------------------------------------------------------------- 1. the vocal


def separate(song: Path, out: Path) -> None:
    import torch
    from demucs.apply import apply_model
    from demucs.states import load_model

    path = MODELS / 'demucs' / DEMUCS_VOCALS
    if not path.exists():
        raise SystemExit(f'Missing {path}. Run setup.sh first.')
    model = load_model(str(path))
    model.eval()
    mix = decode(song, model.samplerate, mono=False)
    wav = torch.from_numpy(mix.T.copy())
    ref = wav.mean(0)
    mean, std = ref.mean(), ref.std() + 1e-8
    torch.set_num_threads(os.cpu_count() or 4)
    with torch.no_grad():
        # No random time shifts: the same song always gives the same vocal, so timing is reproducible.
        sources = apply_model(model, ((wav - mean) / std)[None], device='cpu', shifts=0, split=True, overlap=0.25, progress=True)[0]
    vocals = sources[model.sources.index('vocals')] * std + mean
    write_wav(out, vocals.numpy().T, model.samplerate)


# ---------------------------------------------------------------- 2. forced alignment


def emissions(audio: np.ndarray) -> np.ndarray:
    """Log probabilities per 20 ms frame over the aligner's alphabet, in 30 s windows with context."""
    import torch
    from transformers import Wav2Vec2ForCTC

    model = Wav2Vec2ForCTC.from_pretrained(ALIGNER)
    model.eval()
    torch.set_num_threads(os.cpu_count() or 4)
    window, context = 30 * RATE, 2 * RATE
    frames = int(math.ceil(len(audio) / HOP))
    out = np.full((frames, model.config.vocab_size), -1e4, dtype=np.float32)
    for c0 in range(0, len(audio), window):
        s0 = max(0, c0 - context)
        s1 = min(len(audio), c0 + window + context)
        chunk = audio[s0:s1]
        chunk = (chunk - chunk.mean()) / math.sqrt(chunk.var() + 1e-7)
        with torch.no_grad():
            logits = model(torch.from_numpy(chunk)[None]).logits[0]
        lp = torch.log_softmax(logits, dim=-1).numpy()
        f0 = s0 // HOP
        keep0, keep1 = c0 // HOP, min(frames, (c0 + window) // HOP)
        for g in range(keep0, keep1):
            i = g - f0
            if 0 <= i < len(lp):
                out[g] = lp[i]
    return out


def align(words: list[Word], lines: list[Line], em: np.ndarray, stars: str, star_logp: float = 0.0) -> list[dict]:
    """CTC forced alignment of the romanised lyrics, with a star token that matches anything at a
    fixed log probability."""
    import torch
    import torchaudio.functional as F
    from transformers import Wav2Vec2CTCTokenizer

    vocab = Wav2Vec2CTCTokenizer.from_pretrained(ALIGNER).get_vocab()
    star = em.shape[1]
    em = np.concatenate([em, np.full((len(em), 1), star_logp, dtype=np.float32)], axis=1)

    targets: list[int] = []
    owner: list[int] = []  # word index per target token, -1 for a star
    def add_star() -> None:
        targets.append(star)
        owner.append(-1)

    if stars != 'none':
        add_star()
    last_line = None
    for k, w in enumerate(words):
        if not w.spoken:
            continue
        if stars == 'words' and targets and owner[-1] != -1:
            add_star()
        elif stars == 'lines' and last_line is not None and w.line != last_line and owner[-1] != -1:
            add_star()
        for ch in w.spoken:
            targets.append(vocab[ch])
            owner.append(k)
        last_line = w.line
    if stars != 'none':
        add_star()

    path, scores = F.forced_align(torch.from_numpy(em)[None], torch.tensor([targets], dtype=torch.int32), blank=0)
    path, scores = path[0].numpy(), scores[0].exp().numpy()
    # Walk the path: each run of a non-blank target index is one token's span.
    spans: list[tuple[int, int, float]] = []  # per target token: first frame, last frame, mean prob
    t = 0
    j = -1
    prev = 0
    while t < len(path):
        tok = path[t]
        if tok == 0:
            prev = 0
            t += 1
            continue
        if tok == prev and spans:
            # A repeated label continues the same token unless a blank separated them.
            a, b, s = spans[-1]
            spans[-1] = (a, t, s)
            t += 1
            continue
        j += 1
        u = t
        while u + 1 < len(path) and path[u + 1] == tok:
            u += 1
        spans.append((t, u, float(scores[t : u + 1].mean())))
        prev = tok
        t = u + 1
    if len(spans) != len(targets):
        raise SystemExit(f'alignment walked {len(spans)} tokens for {len(targets)} targets')

    out = []
    for k, w in enumerate(words):
        idx = [i for i, o in enumerate(owner) if o == k]
        if not idx:
            out.append({'start': None, 'end': None, 'confidence': None})
            continue
        # A word's letters belong together. If one strays far from the rest (pulled onto an ad lib or a
        # breath), keep the largest group and let the stray go.
        groups = [[idx[0]]]
        for i in idx[1:]:
            if (spans[i][0] - spans[groups[-1][-1]][1]) * FRAME > SPLIT_GAP:
                groups.append([])
            groups[-1].append(i)
        keep = max(groups, key=lambda g: (len(g), np.mean([spans[i][2] for i in g])))
        a = spans[keep[0]][0]
        b = spans[keep[-1]][1] + 1
        conf = float(np.exp(np.mean([math.log(max(spans[i][2], 1e-6)) for i in idx])))
        out.append({'start': a * FRAME, 'end': b * FRAME, 'confidence': conf, 'split': len(groups) > 1})
    # Words the aligner cannot hear (punctuation, symbols) sit between their neighbours.
    for k, r in enumerate(out):
        if r['start'] is None:
            before = next((out[i]['end'] for i in range(k - 1, -1, -1) if out[i]['end'] is not None), 0.0)
            after = next((out[i]['start'] for i in range(k + 1, len(out)) if out[i]['start'] is not None), before)
            r.update(start=before, end=max(before, after), confidence=0.0)
    return out


# ---------------------------------------------------------------- 3. held notes


def envelope(audio: np.ndarray, hop: int = 160) -> np.ndarray:
    """Vocal level in dB every 10 ms."""
    n = len(audio) // hop
    frames = audio[: n * hop].reshape(n, hop)
    return 20 * np.log10(np.sqrt((frames**2).mean(axis=1)) + 1e-9)


def voiced(audio: np.ndarray, a: float, b: float, step: float = 0.01) -> np.ndarray:
    """Whether a pitched voice sounds in each 10 ms step from a to b (pYIN): drums and breath that
    leak into the separated vocal have no pitch, a held note does."""
    import librosa

    i0, i1 = int(a * RATE), int(b * RATE)
    if i1 - i0 < 2048:
        return np.zeros(max(0, int((b - a) / step)), dtype=bool)
    _, flag, _ = librosa.pyin(audio[i0:i1], fmin=70, fmax=1000, sr=RATE, frame_length=2048, hop_length=int(step * RATE), center=False)
    return flag


def hold(times: list[dict], env: np.ndarray, audio: np.ndarray, step: float = 0.01) -> None:
    """Carry each word's end on while the voice holds the note: pitched, and no more than 15 dB below
    the word's own peak, never past the next word's start (less a hair) and at most 4 s."""
    for k, r in enumerate(times):
        nxt = next((times[i]['start'] for i in range(k + 1, len(times))), len(env) * step)
        i0, i1 = int(r['start'] / step), int(r['end'] / step)
        r['held'] = 0.0
        if i1 <= i0 or i1 >= len(env):
            continue
        peak = env[i0:i1].max()
        limit = int(min(nxt - 0.03, r['end'] + 4.0) / step)
        if limit <= i1:
            continue
        pitched = voiced(audio, i1 * step, limit * step)
        i = i1
        while i < limit and env[i] > peak - 15 and (i - i1 >= len(pitched) or pitched[i - i1] or i - i1 < 8):
            i += 1
        r['held'] = max(0.0, i * step - r['end'])
        r['end'] = max(r['end'], i * step)


# ---------------------------------------------------------------- 4. Whisper cross check


def languages(lines: list[Line]) -> list[str | None]:
    """Whisper passes to run: Hindi when the lyrics have Hindi, English as well when they also have
    lines in Latin letters (English, or Hindi typed in Latin), the language Whisper detects otherwise."""
    from common import DEVANAGARI

    words = [w.text for line in lines for w in line.words]
    hindi = sum(bool(DEVANAGARI.search(w)) for w in words)
    latin = sum(any(c.isascii() and c.isalpha() for c in w) for w in words)
    if hindi and latin:
        return ['hi', 'en']
    if hindi:
        return ['hi']
    return [None, 'hi'] if latin else [None]


def transcribe(audio: np.ndarray, langs: list[str | None]) -> list[dict]:
    from faster_whisper import WhisperModel

    model = WhisperModel(WHISPER, device='cpu', compute_type='int8', cpu_threads=os.cpu_count() or 4)
    words = []
    for lang in langs:
        segments, info = model.transcribe(audio, language=lang, word_timestamps=True, beam_size=5, condition_on_previous_text=False, vad_filter=False)
        n = 0
        for seg in segments:
            for w in seg.words or []:
                words.append({'text': w.word.strip(), 'start': float(w.start), 'end': float(w.end), 'p': float(w.probability), 'pass': info.language})
                n += 1
        log(f'whisper ({info.language}): {n} words')
    return words


def skeleton(s: str) -> str:
    """Consonants only, doubled letters merged: 'pahalaa' and 'pahla' both become 'phl'."""
    s = ''.join(c for c in s if c not in "aeiouy'")
    return ''.join(c for i, c in enumerate(s) if i == 0 or c != s[i - 1])


def similar(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    full = SequenceMatcher(None, a, b).ratio()
    ka, kb = skeleton(a), skeleton(b)
    cons = SequenceMatcher(None, ka, kb).ratio() if ka and kb else full
    return max(full, cons)


def cross_check(words: list[Word], times: list[dict], heard: list[dict]) -> None:
    import uroman as ur

    u = ur.Uroman()
    for h in heard:
        h['roman'] = ''.join(c for c in u.romanize_string(h['text']).lower() if c.isalpha() or c == "'")
    for w, r in zip(words, times):
        best, delta = 0.0, None
        for h in heard:
            if abs(h['start'] - r['start']) > 0.8:
                continue
            s = similar(w.spoken, h['roman'])
            if s > best:
                best, delta = s, h['start'] - r['start']
        r['whisper'] = round(best, 2)
        r['whisperDelta'] = None if delta is None else round(delta, 3)


# ---------------------------------------------------------------- outputs


def report(folder: Path, lines: list[Line], words: list[Word], times: list[dict], env: np.ndarray, duration: float, notes: list[str]) -> str:
    step = 0.01
    voice_peak = float(env.max())
    flagged = []
    for line in lines:
        rs = [times[w.index] for w in line.words if w.spoken]
        if not rs:
            continue
        why = []
        split = [w.text for w in line.words if w.spoken and times[w.index].get('split')]
        if split:
            why.append(f'letters of {", ".join(split)} were pulled apart (an ad lib or noise nearby)')
        if 'whisper' in rs[0]:
            agree = float(np.mean([r['whisper'] >= 0.5 for r in rs]))
            if agree < 0.5:
                why.append(f'Whisper heard only {agree:.0%} of its words here')
        short = [w.text for w in line.words if w.spoken and times[w.index]['end'] - times[w.index]['start'] < 0.06]
        if short:
            why.append(f'very short: {", ".join(short)}')
        a, b = int(rs[0]['start'] / step), int(max(r['end'] for r in rs) / step) + 1
        if b > a and float(np.median(env[a:b])) < voice_peak - 35:
            why.append('little voice where it is placed')
        if float(np.mean([r['confidence'] for r in rs])) < 0.02:
            why.append('the aligner barely heard it')
        if why:
            flagged.append((line, rs, why))
    # Voice that no lyric word covers: an ad lib, or a line missing from lyrics.txt.
    covered = np.zeros(len(env), dtype=bool)
    for r in times:
        covered[int(r['start'] / step) : int(r['end'] / step) + 1] = True
    loud = env > voice_peak - 25
    gaps = []
    i = 0
    while i < len(env):
        if loud[i] and not covered[i]:
            j = i
            while j < len(env) and (loud[j] or j - i < 5) and not covered[j]:
                j += 1
            if (j - i) * step >= 0.25:
                gaps.append((i * step, j * step))
            i = j
        else:
            i += 1
    first, last = times[0]['start'], max(r['end'] for r in times)
    out = [f'# Word timing · {folder.name}', '']
    out.append(f'- Song: {duration:.2f} s. Lyrics: {len(lines)} lines, {len(words)} words.')
    out.append(f'- First word at {first:.2f} s, last word ends at {last:.2f} s.')
    held = [r for r in times if r.get('held', 0) > 0.25]
    out.append(f'- Held notes carried on: {len(held)} words.')
    if 'whisper' in times[0]:
        agree_all = np.mean([r['whisper'] >= 0.5 for r in times])
        drift = [abs(r['whisperDelta']) for r in times if r.get('whisperDelta') is not None and r['whisper'] >= 0.5]
        out.append(f'- Whisper, transcribing on its own, heard {agree_all:.0%} of the words where the aligner put them (median gap {np.median(drift) * 1000:.0f} ms).')
    out += notes
    out.append('')
    if flagged:
        out.append('## Lines to check by ear in the sync test')
        out.append('')
        for line, rs, why in flagged:
            out.append(f'- Line {line.index + 1} ({rs[0]["start"]:.2f} to {max(r["end"] for r in rs):.2f} s): {line.text} · {"; ".join(why)}')
    else:
        out.append('No line needs checking: every line was heard clearly where it is placed.')
    if gaps:
        out += ['', '## Voice with no lyric on it', '', 'The vocal is clearly audible here but no word of lyrics.txt is on it: an ad lib (absorbed, so it did not drag the words), or a line missing from lyrics.txt.', '']
        out += [f'- {a:.2f} to {b:.2f} s' for a, b in gaps]
    return '\n'.join(out) + '\n'


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('song', help='songs/<song-name> or just <song-name>')
    ap.add_argument('--stars', choices=['none', 'edges', 'lines', 'words'], default='lines', help='where ad libs may be absorbed')
    ap.add_argument('--no-whisper', action='store_true', help='skip the Whisper cross check')
    ap.add_argument('--keep-vocals', action='store_true', help='reuse work/vocals.wav if it exists')
    args = ap.parse_args()

    folder = song_dir(args.song)
    work = work_dir(folder)
    song = song_audio(folder)
    lines = read_lyrics(folder)
    words = prepare(lines)
    clock = time.time()

    vocals_path = work / 'vocals.wav'
    if not (args.keep_vocals and vocals_path.exists()):
        log('1/4 separating the vocal (Demucs)')
        separate(song, vocals_path)
    vocals = decode(vocals_path, RATE, mono=True)
    duration = len(decode(song, RATE, mono=True)) / RATE

    log('2/4 aligning the lyrics to the vocal (MMS forced aligner)')
    em = emissions(vocals)
    times = align(words, lines, em, args.stars)
    for r in times:
        r['ctcStart'], r['ctcEnd'] = r['start'], r['end']

    log('3/4 carrying held notes')
    env = envelope(vocals)
    hold(times, env, vocals)

    notes: list[str] = []
    if not args.no_whisper:
        log('4/4 cross checking with Whisper')
        heard = transcribe(vocals, languages(lines))
        save_json(work / 'whisper.json', heard)
        cross_check(words, times, heard)
    else:
        notes.append('- Whisper cross check skipped.')

    word_out = [{'word': w.text, 'start': round(r['start'], 3), 'end': round(r['end'], 3)} for w, r in zip(words, times)]
    save_json(folder / 'word-timestamps.json', word_out)
    phrases = []
    for line in lines:
        ws = [word_out[w.index] for w in line.words]
        phrases.append({'line': line.index + 1, 'section': line.section + 1, 'text': line.text, 'start': ws[0]['start'], 'end': max(x['end'] for x in ws), 'words': ws})
    save_json(folder / 'phrases.json', phrases)
    detail = [{'word': w.text, 'spoken': w.spoken, 'line': w.line + 1, **{k: (round(v, 3) if isinstance(v, float) else v) for k, v in r.items()}} for w, r in zip(words, times)]
    save_json(work / 'alignment-detail.json', detail)
    (folder / 'timing-report.md').write_text(report(folder, lines, words, times, env, duration, notes), encoding='utf-8')
    log(f'done in {time.time() - clock:.0f} s: word-timestamps.json, phrases.json, timing-report.md')


if __name__ == '__main__':
    main()
