#!/usr/bin/env bash
# Runs one of the lyric machine's Python tools in its environment: run.sh timing.py <song-name>
set -euo pipefail
TOOLS="$(cd "$(dirname "$0")" && pwd)"
VENV="${LYRIC_VENV:-$TOOLS/.venv}"
export LYRIC_MODELS="${LYRIC_MODELS:-$TOOLS/.models}"
export HF_HOME="${HF_HOME:-$LYRIC_MODELS/huggingface}"
export PYTHONWARNINGS="${PYTHONWARNINGS:-ignore}"
[ -x "$VENV/bin/python" ] || { echo "Run film/lyric/tools/setup.sh first."; exit 1; }
script="$1"
shift
cd "$TOOLS"
exec "$VENV/bin/python" "$script" "$@"
