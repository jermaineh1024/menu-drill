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

## What is in this repo

The files at the top (`index.html`, `sw.js`, the manifest and icons) are the live site. They are built, not edited by hand.

- `src/` is the page in pieces: `head.html`, `body.html`, `style.css`, and `js/` in load order.
  - `js/10-data.js` is the menu: every sub, the sprinkling amounts, and the orientation questions. Hot subs are stored the way the grill builds them: what goes on the lid first, what cooks, the cheese, what finishes it.
  - `js/12-train.js` is the station training: the questions, the put-in-order games, and which card each belongs to.
  - `js/14a-crew.js`, `14b-shift.js`, `14c-numbers.js` and `14d-business.js` are the rest of the course, and say which level each station sits in.
  - `js/72-manage.js` runs the Training tab's extras: the levels, one card open at a time, the tick lists, the practice math, the day clock and the read-aloud.
  - `src/include/train-*.html` are the training cards, one file per station. `src/include/pic-*.html` and `howto-*.html` are drawn by scripts.
- `tools/howto.py` and `tools/howto_lib.py` draw the step-by-step pictures (cutting, wrapping, bagging, a #17 on the grill).
- `tools/pics.py` draws the station diagrams and `tools/pics_mgr.py` the rest of the course's. They measure every label and stop the build if one would run past its box or the picture's edge.
- `tools/make.sh VERSION` builds everything into `dist/`: one file for claude.ai (`dist/artifact.html`) and the site (`dist/site/`), with fonts built in, an offline worker named for the version, and a baked copy that still reads when scripts are off.
- `tools/test/suite.js` taps through the built site in Chromium, WebKit and Firefox the way a person would and fails loudly if anything is off: every sub built right and wrong, hot subs in the order they're made, every way to practice, every quiz and every training card, the put-in-order games, the levels, the tick lists, the practice math against the training's numbers, the day clock, the read-aloud, today's session, the walkthroughs, no voice, no storage, no motion, no scripts, tap sizes, contrast, picture labels, and nothing wider than the screen.
- `tools/test/planted.js` breaks a copy of the site sixteen ways on purpose to prove the suite catches each one.

## To change something

1. Edit the piece in `src/` (a fact about a sub lives in `src/js/10-data.js`; a training question lives in `src/js/12-train.js` or one of the `14*.js` files; a card's words live in `src/include/train-*.html`).
2. `bash tools/make.sh 2026-11-10a` with a new version name.
3. `node tools/test/suite.js --version 2026-11-10a` and get the line that starts `ALL_CHECKS_PASSED`.
4. Copy `dist/site/*` over the files at the top of this repo and push.

Needs Python 3 and Node, each with Playwright and its browsers.
