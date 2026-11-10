# Menu Drill

Unofficial study guide for the Jersey Mike's menu, build order, sprinkling amounts and training, from a first day on the line to running the store. Made by a team member, not published by Jersey Mike's.

Open it here: https://jermaineh1024.github.io/menu-drill/

On a phone, tap Share, then Add to Home Screen, and it works like an app, offline too.

Progress, ticks and settings are kept in the browser on the device you study on. Nothing is sent anywhere, and nothing is saved in this repo.

## What is in it

- **Study, The Line, Drill:** the board. Every sub, how it is built, and six ways to practice.
- **Training:** three levels, one on screen at a time.
  1. Crew: every station, plus the lists a trainer ticks when they watch you work.
  2. Shift lead: the day by the clock, the mid-day checklist, opening, closing, training someone new.
  3. Manager: ordering, inventory, food cost, scheduling and labor, marketing, the P&L.
- Every card has a one-line summary, a picture, a quiz, and a button that reads it out loud. Some have a put-in-order game, a list you can tick, or practice math that starts on the training's own example numbers.
- **The voice.** On the site, everything that can be read out loud is read in a recorded voice: the cards, every sub, the Listen drill, the walkthrough steps, and the lesson before each quiz question. The recordings need a connection. With no signal, and in the copy on claude.ai, the page reads with the device's own voice and picks the best one it can find. The Voice button lists the choices and plays a sample of each.

## What is in this repo

The files at the top (`index.html`, `sw.js`, the manifest and icons) are the live site. They are built, not edited by hand.

- `src/` is the page in pieces: `head.html`, `body.html`, `style.css`, and `js/` in load order.
  - `js/10-data.js` is the menu: every sub, the sprinkling amounts, and the orientation questions. Hot subs are stored the way the grill builds them: what goes on the lid first, what cooks, the cheese, what finishes it.
  - `js/12-train.js` is the station training: the questions, the put-in-order games, and which card each belongs to.
  - `js/14a-crew.js`, `14b-shift.js`, `14c-numbers.js` and `14d-business.js` are the rest of the course, and say which level each station sits in.
  - `js/72-manage.js` runs the Training tab's extras: the levels, one card open at a time, the tick lists, the practice math, the day clock and the read-aloud.
  - `js/15-shifts.js` is Run the shift: short situations with a call to make, then the situation changes. Every right answer is something a training card says. `js/76-more.js` plays them, and also holds your own notes on a card, the backup code, and the short Training landing.
  - `js/40-voice.js` does the talking: it plays a recording when there is one for the exact words, and otherwise uses the device's voice. `js/74-voice.js` is the sheet where you pick a voice.
  - `src/include/train-*.html` are the training cards, one file per station. `src/include/pic-*.html` and `howto-*.html` are drawn by scripts.
- `tools/howto.py` and `tools/howto_lib.py` draw the step-by-step pictures (cutting, wrapping, bagging, a #17 on the grill).
- `tools/pics.py` draws the station diagrams and `tools/pics_mgr.py` the rest of the course's. They measure every label and stop the build if one would run past its box or the picture's edge.
- `tools/make.sh VERSION` builds everything into `dist/`: one file for claude.ai (`dist/artifact.html`) and the site (`dist/site/`), with fonts built in, an offline worker named for the version, and a baked copy that still reads when scripts are off.
- `tools/test/suite.js` taps through the built site in Chromium, WebKit and Firefox the way a person would and fails loudly if anything is off: every sub built right and wrong, hot subs in the order they're made, every way to practice, every quiz and every training card, the put-in-order games, the levels, the tick lists, the practice math against the training's numbers, the day clock, the read-aloud, today's session, the walkthroughs, Run the shift, notes, backup and restore, no voice, no storage, no motion, no scripts, tap sizes, contrast, picture labels, and nothing wider than the screen.
- `tools/test/planted.js` breaks a copy of the site twenty-eight ways on purpose to prove the suite catches each one.
- `audio/` holds the recordings: one small MP3 for each fixed thing the page says, about a thousand of them. Each file is named by a fingerprint of the exact words, which the page works out the same way, so a recording can never be played for words that have since changed.
- `tools/voice/` makes them:
  - `census.js` asks the built page for the list of everything it can say (`dist/spoken.json`).
  - `say.py` writes numbers and signs out as words ("$16.50", "9:15 a.m.", "3/16 inch") and holds the handful of words this course says its own way.
  - `g2p.py` turns words into the sounds the voice reads.
  - `record.py` records whatever is not recorded yet, and `recorded.json` keeps the sounds each file was made from.

## To change something

1. Edit the piece in `src/` (a fact about a sub lives in `src/js/10-data.js`; a training question lives in `src/js/12-train.js` or one of the `14*.js` files; a card's words live in `src/include/train-*.html`).
2. `bash tools/make.sh 2026-11-10c` with a new version name.
3. If words that get read out loud changed, record them again (below), then run `make.sh` once more so the site lists the new files. Skip this and the changed pieces are simply read by the device's own voice.
4. `node tools/test/suite.js --version 2026-11-10c` and get the line that starts `ALL_CHECKS_PASSED`. It fails if something the page says has no recording; add `--allow-unrecorded` to let that pass.
5. Copy the files in `dist/site/` (not the `audio` link) over the files at the top of this repo, and push.

Needs Python 3 and Node, each with Playwright and its browsers.

## Recording the voice again

    node tools/voice/census.js
    python3 tools/voice/record.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin --gold us_gold.json --silver us_silver.json

It needs `pip install kokoro-onnx soundfile`, `ffmpeg`, the two model files from the kokoro-onnx project's "model-files-v1.0" release on GitHub, and the two dictionary files from the `misaki` package on PyPI (`misaki/data/` inside the wheel). Only pieces whose words or sounds changed are recorded, so a small edit takes seconds. A word that comes out wrong is fixed in `say.py`: add it to `OWN` with the sounds it should have.

The voice is Kokoro-82M, voice "af_heart" (Apache 2.0, hexgrad). The pronunciation dictionary and the rules `g2p.py` follows are from misaki (Apache 2.0, hexgrad). The model runs through kokoro-onnx (MIT, thewh1teagle). None of them is in this repo; only the recordings they made are.
