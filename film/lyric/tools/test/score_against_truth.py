"""How close the machine's word timing came to the truth on the test song.

    python test/score_against_truth.py [songs/_test-hinglish]
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import SONGS, load_json  # noqa: E402

folder = Path(sys.argv[1]) if len(sys.argv) > 1 else SONGS / '_test-hinglish'
got = load_json(folder / 'word-timestamps.json')
truth = load_json(folder / 'truth.json')
assert [w['word'] for w in got] == [w['word'] for w in truth], 'the words differ from the truth'
ds = np.array([g['start'] - t['start'] for g, t in zip(got, truth)])
de = np.array([g['end'] - t['end'] for g, t in zip(got, truth)])
for name, d in (('start', ds), ('end', de)):
    a = np.abs(d)
    print(f'{name:5}  median {np.median(a) * 1000:4.0f} ms  90% {np.percentile(a, 90) * 1000:4.0f} ms  max {a.max() * 1000:4.0f} ms  '
          f'within 50 ms {np.mean(a <= 0.05):4.0%}  within 100 ms {np.mean(a <= 0.1):4.0%}  bias {np.mean(d) * 1000:+4.0f} ms')
worst = np.argsort(-np.maximum(np.abs(ds), np.abs(de)))[:5]
print('worst words:')
for i in worst:
    print(f'  {truth[i]["word"]:10} start {ds[i] * 1000:+5.0f} ms  end {de[i] * 1000:+5.0f} ms  (truth {truth[i]["start"]:.2f} to {truth[i]["end"]:.2f})')
