#!/usr/bin/env bash
# One time setup for the lyric film machine's audio tools (brief 04, stages 1 and 2): a Python
# environment and the models, about 3 GB. Safe to run again: it only fetches what is missing.
#
#   film/lyric/tools/setup.sh
#
# LYRIC_VENV and LYRIC_MODELS choose where they go (default: .venv and .models next to this file).
set -euo pipefail

TOOLS="$(cd "$(dirname "$0")" && pwd)"
VENV="${LYRIC_VENV:-$TOOLS/.venv}"
MODELS="${LYRIC_MODELS:-$TOOLS/.models}"
PY="${PYTHON:-python3}"

command -v ffmpeg >/dev/null || { echo "ffmpeg is needed (macOS: brew install ffmpeg)"; exit 1; }

if [ ! -x "$VENV/bin/python" ]; then
  echo "· Python environment in $VENV"
  "$PY" -m venv "$VENV"
fi
PIP="$VENV/bin/pip"
"$PIP" install -q --upgrade pip
if ! "$VENV/bin/python" -c "import torch, torchaudio" 2>/dev/null; then
  echo "· PyTorch (CPU)"
  if [ "$(uname)" = "Linux" ]; then
    "$PIP" install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu
  else
    "$PIP" install -q torch torchaudio
  fi
fi
echo "· Separation, alignment, transcription and analysis packages"
"$PIP" install -q numpy scipy soundfile librosa faster-whisper uroman transformers sentencepiece huggingface_hub \
  einops julius openunmix dora-search lameenc pyyaml tqdm
# Demucs pins an old torchaudio it does not need here (audio is read with ffmpeg), so no deps.
"$PIP" install -q --no-deps demucs

mkdir -p "$MODELS/demucs"
DEMUCS="$MODELS/demucs/04573f0d-f3cf25b2.th"
if [ ! -f "$DEMUCS" ]; then
  echo "· Demucs vocal model (htdemucs_ft)"
  # The official file, from a Hugging Face mirror; its name carries the first 8 hex of its sha256.
  curl -sSL --fail -o "$DEMUCS.part" "https://huggingface.co/dokodesuka/htdemucs_ft/resolve/main/04573f0d-f3cf25b2.th" \
    || curl -sSL --fail -o "$DEMUCS.part" "https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/04573f0d-f3cf25b2.th"
  sum="$( (sha256sum "$DEMUCS.part" 2>/dev/null || shasum -a 256 "$DEMUCS.part") | cut -c1-8)"
  [ "$sum" = "f3cf25b2" ] || { echo "Demucs model checksum mismatch ($sum)"; rm -f "$DEMUCS.part"; exit 1; }
  mv "$DEMUCS.part" "$DEMUCS"
fi

echo "· Aligner, Whisper and test voices (Hugging Face)"
HF_HOME="$MODELS/huggingface" "$VENV/bin/python" - <<'EOF'
from huggingface_hub import snapshot_download
for repo in ['MahmoudAshraf/mms-300m-1130-forced-aligner', 'mobiuslabsgmbh/faster-whisper-large-v3-turbo',
             'facebook/mms-tts-hin', 'facebook/mms-tts-eng']:
    snapshot_download(repo)
    print('  ok', repo)
EOF
echo "Ready. Put song.mp3 and lyrics.txt in songs/<song-name>/ and run: npm run lyric:timing -- <song-name>"
