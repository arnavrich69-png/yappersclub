"""A test song for the lyric film machine, with known word timing: songs/_test-hinglish/.

Nobody's song: a 32 s groove (kick, snare, hats, bass, pads) made here, with a synthetic voice (the
MMS text to speech models) speaking an original Hinglish lyric a line at a time, and the true start
and end of every word read from the voice model itself. It exercises what real songs throw at the aligner:
Devanagari lyrics, Hindi written in Latin letters, English, a word held for a long note, a repeated
word, punctuation, and an ad lib that is not in lyrics.txt.

    python test/make_test_song.py      writes song.wav, lyrics.txt and truth.json
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import MODELS, SONGS, save_json, write_wav  # noqa: E402

os.environ.setdefault('HF_HOME', str(MODELS / 'huggingface'))

RATE = 44100
BPM = 96
BEAT = 60 / BPM
BARS = 13
rng = np.random.default_rng(17)

# Each line: what lyrics.txt says, what the voice says (the same words; Hindi typed in Latin letters is
# spoken from its Devanagari), the voice, and the bar it starts on.
LINES = [
    ('पहला सुर किसका है?', 'पहला सुर किसका है', 'hin', 1),
    ('tera naam likh do yahan', 'तेरा नाम लिख दो यहाँ', 'hin', 3),
    ('bring one song tonight', 'bring one song tonight', 'eng', 5),
    ('धागा बाँध ले, तू भी कुल है', 'धागा बाँध ले तू भी कुल है', 'hin', 7),
    ('सुर सुर सुर', 'सुर सुर सुर', 'hin', 9),
    ('sweet voice, tied.', 'sweet voice tied', 'eng', 11),
]
AD_LIB = ('yeah', 'eng', 6.6)  # (said, voice, bar position): between lines 3 and 4, not in the lyrics
HELD = (3, 1.1)  # line 4's last word is held for 1.1 s


def tts():
    """Whole lines in the MMS voices (natural phrasing), with every word's true start and end taken
    from the voice model's own duration predictor, so the truth is exact to a 16 ms frame."""
    import torch
    from transformers import AutoTokenizer, VitsModel

    voices = {}
    for code in ('hin', 'eng'):
        voices[code] = (VitsModel.from_pretrained(f'facebook/mms-tts-{code}'), AutoTokenizer.from_pretrained(f'facebook/mms-tts-{code}'))

    def say(text: str, code: str, seed: int) -> tuple[np.ndarray, list[tuple[float, float]]]:
        import librosa

        model, tok = voices[code]
        captured = {}
        hook = model.duration_predictor.register_forward_hook(lambda m, i, o: captured.update(log=o))
        torch.manual_seed(seed)
        inputs = tok(text, return_tensors='pt')
        with torch.no_grad():
            wav = model(**inputs).waveform[0].numpy()
        hook.remove()
        frames = torch.ceil(torch.exp(captured['log'])[0, 0] / model.speaking_rate).numpy()
        hop = int(np.prod(model.config.upsample_rates)) / model.config.sampling_rate
        ids = inputs['input_ids'][0].tolist()
        chars = tok.convert_ids_to_tokens(ids)
        # Words are the runs of characters between spaces (every other token is the blank).
        bounds, t, cur = [], 0.0, None
        for c, f in zip(chars, frames):
            if c not in (' ', tok.pad_token) and c != tok.convert_ids_to_tokens(0):
                if cur is None:
                    cur = [t, t + f * hop]
                else:
                    cur[1] = t + f * hop
            elif c == ' ' and cur is not None:
                bounds.append(tuple(cur))
                cur = None
            t += f * hop
        if cur is not None:
            bounds.append(tuple(cur))
        wav = librosa.resample(wav, orig_sr=model.config.sampling_rate, target_sr=RATE)
        peak = np.abs(wav).max() + 1e-9
        return wav / peak, bounds

    return say


def sounding(wav: np.ndarray) -> tuple[float, float]:
    """First and last moment the voice is within 35 dB of its peak (10 ms steps)."""
    hop = RATE // 100
    n = len(wav) // hop
    level = 20 * np.log10(np.sqrt((wav[: n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9)
    loud = np.where(level > level.max() - 35)[0]
    return loud[0] / 100, (loud[-1] + 1) / 100


def env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / RATE
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def band(x: np.ndarray, lo: float | None, hi: float | None) -> np.ndarray:
    if lo and hi:
        b, a = butter(2, [lo / (RATE / 2), hi / (RATE / 2)], 'band')
    elif lo:
        b, a = butter(2, lo / (RATE / 2), 'high')
    else:
        b, a = butter(2, hi / (RATE / 2), 'low')
    return lfilter(b, a, x)


def place(buf: np.ndarray, x: np.ndarray, t: float, gain: float) -> None:
    i = int(round(t * RATE))
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += gain * x[: j - i]


def groove(length: float) -> np.ndarray:
    n = int(length * RATE)
    out = np.zeros(n)
    kick_n = int(0.35 * RATE)
    t = np.arange(kick_n) / RATE
    kick = np.sin(2 * np.pi * (45 * t + (120 - 45) * 0.05 * (1 - np.exp(-t / 0.05)))) * env(kick_n, 0.002, 0.18)
    snare_n = int(0.25 * RATE)
    snare = band(rng.standard_normal(snare_n), 1200, 6000) * env(snare_n, 0.001, 0.09) + 0.4 * np.sin(2 * np.pi * 185 * np.arange(snare_n) / RATE) * env(snare_n, 0.001, 0.05)
    hat_n = int(0.06 * RATE)
    hat = band(rng.standard_normal(hat_n), 7000, None) * env(hat_n, 0.001, 0.015)
    roots = [48, 45, 41, 43]  # C, A, F, G (midi), a bar each
    chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    for bar in range(BARS):
        b0 = bar * 4 * BEAT
        for beat in range(4):
            tb = b0 + beat * BEAT
            if bar >= 1 or beat >= 2:
                if beat in (0, 2):
                    place(out, kick, tb, 0.9)
                if beat in (1, 3):
                    place(out, snare, tb, 0.45)
            for e in range(2):
                place(out, hat, tb + e * BEAT / 2, 0.18 if e else 0.25)
            # Bass: the root on each beat, plucked.
            bn = int(BEAT * 0.9 * RATE)
            tt = np.arange(bn) / RATE
            f = hz(roots[bar % 4])
            bass = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env(bn, 0.004, 0.25)
            place(out, bass, tb, 0.35)
        # Pads: the chord held for the bar, soft saws through a low pass.
        pn = int(4 * BEAT * RATE)
        tt = np.arange(pn) / RATE
        pad = sum(2 * ((hz(m) * tt + 0.37 * k) % 1) - 1 for k, m in enumerate(chords[bar % 4]))
        pad = band(pad, None, 1800) * np.minimum(1, tt / 0.3) * np.minimum(1, (4 * BEAT - tt) / 0.3)
        place(out, pad, b0, 0.06)
    return out


def main() -> None:
    import librosa

    say = tts()
    length = BARS * 4 * BEAT
    voice = np.zeros(int(length * RATE))
    truth = []
    lyrics = []
    for li, (written, said, code, bar) in enumerate(LINES):
        wav, bounds = say(said, code, 11 + li)
        words = written.split()
        assert len(words) == len(bounds), (written, len(bounds))
        t0 = bar * 4 * BEAT
        # The voice model counts the silence before a line's first sound, and after its last, as part
        # of the first and last letters: the truth there is where the voice actually sounds.
        on, off = sounding(wav)
        bounds[0] = (max(bounds[0][0], on), bounds[0][1])
        bounds[-1] = (bounds[-1][0], min(bounds[-1][1], off) if bounds[-1][1] > off else off)
        if li == HELD[0]:
            # Hold the line's last word: stretch its sounding part to a long note.
            a, b = int(bounds[-1][0] * RATE), int(off * RATE)
            held = librosa.effects.time_stretch(wav[a:b], rate=(b - a) / (HELD[1] * RATE))
            wav = np.concatenate([wav[:a], held, wav[b:]])
            _, off = sounding(wav)
            bounds[-1] = (bounds[-1][0], off)
        place(voice, wav, t0, 0.9)
        for w, (a, b) in zip(words, bounds):
            truth.append({'word': w, 'start': round(float(t0 + a), 3), 'end': round(float(t0 + b), 3)})
        lyrics.append(written)
    said, code, at = AD_LIB
    adlib, _ = say(said, code, 99)
    place(voice, adlib, at * 4 * BEAT, 0.6)
    # A little room on the voice, as on a real record.
    tail = rng.standard_normal(int(0.4 * RATE)) * np.exp(-np.arange(int(0.4 * RATE)) / RATE / 0.12) * 0.02
    voice = voice + np.convolve(voice, tail)[: len(voice)]
    music = groove(length)
    mix = 0.55 * voice + 0.5 * music
    mix = mix / np.abs(mix).max() * 0.89
    stereo = np.stack([mix, mix], axis=1)
    folder = SONGS / '_test-hinglish'
    folder.mkdir(parents=True, exist_ok=True)
    sf.write(str(folder / 'song.wav'), stereo.astype(np.float32), RATE, subtype='PCM_16')
    (folder / 'work').mkdir(exist_ok=True)
    write_wav(folder / 'work' / 'voice-only.wav', (0.55 * voice / np.abs(mix).max() * 0.89).astype(np.float32), RATE)
    (folder / 'lyrics.txt').write_text('\n'.join(lyrics[:3]) + '\n\n' + '\n'.join(lyrics[3:]) + '\n', encoding='utf-8')
    save_json(folder / 'truth.json', truth)
    print(f'{folder}: {length:.1f} s, {len(truth)} words, an ad lib at {at * 4 * BEAT:.2f} s')


if __name__ == '__main__':
    main()
