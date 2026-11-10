#!/bin/bash
# tools/make.sh VERSION  -> pictures, artifact, standalone site (dist/site), baked for no-script previews
set -e
cd "$(dirname "$0")/.."
V="${1:?usage: tools/make.sh 2026-11-09d}"
python3 tools/howto.py >/dev/null
python3 tools/pics.py >/dev/null
python3 tools/assemble.py dist/artifact.html
python3 tools/build.py "$V"
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/prerender.py
echo "$V" > dist/VERSION
