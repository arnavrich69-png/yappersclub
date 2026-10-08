"""The song's structure as data, for the creative direction (stage 3): beat-map.json.

    python analyse.py songs/<song-name>

Tempo, every beat and the bar lines (downbeats), the sections (where the music changes, and which
sections repeat), an energy level from 1 to 10 for every beat, the silences, and where the voice
sings (from the separated vocal, if stage 1 has run). Word timing drives the lyrics; this is for
secondary motion and the big payoffs: stamps and knots on downbeats, the PULP world at the peak.
"""

from __future__ import annotations

import argparse

import numpy as np

from common import decode, log, save_json, song_audio, song_dir, work_dir

SR = 22050
HOP = 512


def beats_and_bars(y: np.ndarray) -> tuple[float, np.ndarray, np.ndarray, int]:
    import librosa

    onset = librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP)
    tempo, frames = librosa.beat.beat_track(onset_envelope=onset, sr=SR, hop_length=HOP, tightness=100)
    beats = librosa.frames_to_time(frames, sr=SR, hop_length=HOP)
    # The bar line falls where the low end hits hardest: try every phase of a 4 and a 3 beat bar.
    spec = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
    low = librosa.onset.onset_strength(S=librosa.amplitude_to_db(spec[: int(160 / SR * 2048) + 1], ref=np.max), sr=SR, hop_length=HOP)
    at = low[np.clip(frames, 0, len(low) - 1)]
    best = (4, 0, -np.inf)
    for meter in (4, 3):
        for phase in range(meter):
            on = at[phase::meter].mean() if len(at[phase::meter]) else 0
            off = np.delete(at, np.arange(phase, len(at), meter)).mean() if len(at) > meter else 1
            contrast = on / (off + 1e-9)
            if contrast > best[2] * (1.15 if meter == 3 else 1):
                best = (meter, phase, contrast)
    meter, phase, _ = best
    # Most records keep one tempo: when the beats sit on a straight line, use the line (it removes
    # the tracker's frame by frame jitter); a song that speeds up or breathes keeps the tracked beats.
    if len(beats) > 8:
        i = np.arange(len(beats))
        period, t0 = np.polyfit(i, beats, 1)
        grid = t0 + period * i
        if np.sqrt(np.mean((beats - grid) ** 2)) < 0.03:
            beats = grid
            tempo = 60 / period
    # The tracker hears a beat a little after it lands: move the beats onto the attacks themselves
    # (onsets found at 6 ms resolution and walked back to where each sound starts).
    fine = librosa.onset.onset_detect(y=y, sr=SR, hop_length=128, backtrack=True, units='time')
    if len(fine):
        near = [fine[np.argmin(np.abs(fine - b))] - b for b in beats]
        near = [d for d in near if abs(d) < 0.06]
        if len(near) >= len(beats) // 3:
            beats = beats + float(np.median(near))
    return float(np.atleast_1d(tempo)[0]), beats, beats[phase::meter], meter


def sections(y: np.ndarray, beats: np.ndarray, downbeats: np.ndarray) -> list[dict]:
    """Boundaries where the music's colour and harmony change, on bar lines; sections that sound
    alike get the same letter."""
    import librosa
    from scipy.ndimage import gaussian_filter1d
    from scipy.signal import find_peaks

    frames = librosa.time_to_frames(beats, sr=SR, hop_length=HOP)
    chroma = librosa.feature.chroma_cqt(y=y, sr=SR, hop_length=HOP)
    mfcc = librosa.feature.mfcc(y=y, sr=SR, hop_length=HOP, n_mfcc=13)
    feat = np.vstack([librosa.util.normalize(librosa.util.sync(chroma, frames), axis=0), librosa.util.normalize(librosa.util.sync(mfcc, frames), axis=0)])
    n = feat.shape[1]
    # sync() gives a column for the stretch before the first beat, then one per beat.
    seg_t = np.r_[0.0, beats][:n]
    if n < 16:
        return [{'label': 'A', 'start': 0.0, 'end': float(len(y) / SR)}]
    sim = feat.T @ feat / feat.shape[0]
    k = 8
    kernel = np.outer(np.r_[-np.ones(k), np.ones(k)], np.r_[-np.ones(k), np.ones(k)]) * -1
    novelty = np.zeros(n)
    for i in range(k, n - k):
        novelty[i] = (sim[i - k : i + k, i - k : i + k] * kernel).sum()
    novelty = gaussian_filter1d(np.maximum(novelty, 0), 1)
    peaks, _ = find_peaks(novelty, distance=16, prominence=np.percentile(novelty, 75) if novelty.any() else None)
    bars = list(downbeats)
    cuts = sorted({min(bars, key=lambda b: abs(b - seg_t[p])) for p in peaks}) if bars else []
    edges = [0.0] + [c for c in cuts if 4 < c < len(y) / SR - 4] + [float(len(y) / SR)]
    segs = []
    for a, b in zip(edges, edges[1:]):
        idx = (seg_t >= a) & (seg_t < b)
        segs.append({'start': round(float(a), 3), 'end': round(float(b), 3), 'mean': feat[:, idx].mean(axis=1) if idx.any() else feat.mean(axis=1)})
    letters = []
    for s in segs:
        label = None
        for prev, lab in letters:
            if float(np.dot(s['mean'], prev['mean']) / (np.linalg.norm(s['mean']) * np.linalg.norm(prev['mean']) + 1e-9)) > 0.97:
                label = lab
                break
        if label is None:
            label = chr(ord('A') + len({lab for _, lab in letters}))
        letters.append((s, label))
    return [{'label': lab, 'start': s['start'], 'end': s['end']} for s, lab in letters]


def level_db(x: np.ndarray, hop: int) -> np.ndarray:
    n = len(x) // hop
    return 20 * np.log10(np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9)


def runs(mask: np.ndarray, step: float, min_len: float) -> list[list[float]]:
    out, i = [], 0
    while i < len(mask):
        if mask[i]:
            j = i
            while j < len(mask) and mask[j]:
                j += 1
            if (j - i) * step >= min_len:
                out.append([round(i * step, 3), round(j * step, 3)])
            i = j
        else:
            i += 1
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('song')
    args = ap.parse_args()
    folder = song_dir(args.song)
    y = decode(song_audio(folder), SR, mono=True)
    duration = len(y) / SR
    log('tempo, beats and bars')
    tempo, beats, downbeats, meter = beats_and_bars(y)
    log('sections')
    secs = sections(y, beats, downbeats)
    log('energy, silences, voice')
    db = level_db(y, HOP)
    step = HOP / SR
    per_beat = []
    for a, b in zip(beats, list(beats[1:]) + [duration]):
        seg = db[int(a / step) : max(int(a / step) + 1, int(b / step))]
        per_beat.append(float(seg.mean()))
    lo, hi = np.percentile(per_beat, 5), np.percentile(per_beat, 95)
    levels = [int(np.clip(round(1 + 9 * (v - lo) / (hi - lo + 1e-9)), 1, 10)) for v in per_beat]
    for s in secs:
        idx = [i for i, t in enumerate(beats) if s['start'] <= t < s['end']]
        s['energy'] = int(round(np.mean([levels[i] for i in idx]))) if idx else 1
    silences = runs(db < db.max() - 40, step, 0.3)
    vocal = []
    vpath = work_dir(folder) / 'vocals.wav'
    if vpath.exists():
        v = decode(vpath, SR, mono=True)
        vdb = level_db(v, HOP)
        vocal = runs(vdb > vdb.max() - 30, step, 0.2)
        for s in secs:
            s['vocal'] = any(a < s['end'] and b > s['start'] for a, b in vocal)
    order = np.argsort(per_beat)[::-1]
    peaks = sorted(float(round(beats[i], 3)) for i in order[: max(1, len(beats) // 40)])
    out = {
        'song': folder.name,
        'duration': round(duration, 3),
        'tempo': round(tempo, 2),
        'meter': meter,
        'beats': [round(float(t), 3) for t in beats],
        'downbeats': [round(float(t), 3) for t in downbeats],
        'sections': secs,
        'energy': [{'t': round(float(t), 3), 'level': lv} for t, lv in zip(beats, levels)],
        'silences': silences,
        'vocal': vocal,
        'peaks': peaks,
    }
    save_json(folder / 'beat-map.json', out)
    log(f'beat-map.json: {tempo:.1f} BPM in {meter}, {len(beats)} beats, {len(downbeats)} bars, sections {" ".join(s["label"] for s in secs)}')


if __name__ == '__main__':
    main()
