# Menu Drill

Unofficial study guide for the Jersey Mike's menu, build order, sprinkling amounts, orientation and station training. Made by a team member, not published by Jersey Mike's.

Open it here: https://jermaineh1024.github.io/menu-drill/

On a phone, tap Share, then Add to Home Screen, and it works like an app, offline too.

## What is in this repo

The files at the top (`index.html`, `sw.js`, the manifest and icons) are the live site. They are built, not edited by hand.

- `src/` is the page in pieces: `head.html`, `body.html`, `style.css`, and `js/` in load order.
  - `js/10-data.js` is the menu: every sub, the sprinkling amounts, and the orientation questions. Hot subs are stored the way the grill builds them: what goes on the lid first, what cooks, the cheese, what finishes it.
  - `js/12-train.js` is the station training: the questions, the put-in-order games, and which module each belongs to.
  - `src/include/train-*.html` are the training modules, one file per station. `src/include/pic-*.html` and `howto-*.html` are drawn by scripts.
- `tools/howto.py` and `tools/howto_lib.py` draw the step-by-step pictures (cutting, wrapping, bagging, a #17 on the grill).
- `tools/pics.py` draws the training diagrams. It measures every label and stops the build if one would run past its box.
- `tools/make.sh VERSION` builds everything into `dist/`: one file for claude.ai (`dist/artifact.html`) and the site (`dist/site/`), with fonts built in, an offline worker named for the version, and a baked copy that still reads when scripts are off.
- `tools/test/suite.js` taps through the built site in Chromium, WebKit and Firefox the way a person would and fails loudly if anything is off: every sub built right and wrong, hot subs in the order they're made, every way to practice, every quiz and every training module, the put-in-order games, today's session, the walkthroughs, no voice, no storage, no motion, no scripts, tap sizes, contrast, and nothing wider than the screen.
- `tools/test/planted.js` breaks a copy of the site ten ways on purpose to prove the suite catches each one.

## To change something

1. Edit the piece in `src/` (a fact about a sub lives in `src/js/10-data.js`; a training question lives in `src/js/12-train.js`).
2. `bash tools/make.sh 2026-11-10a` with a new version name.
3. `node tools/test/suite.js --version 2026-11-10a` and get the line that starts `ALL_CHECKS_PASSED`.
4. Copy `dist/site/*` over the files at the top of this repo and push.

Needs Python 3 and Node, each with Playwright and its browsers.
