#!/bin/bash
# tools/proof.sh  -> regenerates the how-to pictures and slices the proof sheet into proof/howto-N.png
set -e
cd "$(dirname "$0")/.."
python3 tools/howto.py
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers NODE_PATH=$(npm root -g) node tools/proof_shot.js proof/howto.html proof/howto.png 1500 1
python3 - <<'PY'
from PIL import Image
im = Image.open('proof/howto.png'); h = im.height; n = 5; step = h // n + 1
for i in range(n): im.crop((0, i * step, im.width, min(h, (i + 1) * step))).save(f'proof/howto-{i + 1}.png')
print(im.size)
PY
