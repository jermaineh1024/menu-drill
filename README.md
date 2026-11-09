# Menu Drill

Unofficial study guide for the Jersey Mike's menu, build order, sprinkling amounts and orientation. Made by a team member, not published by Jersey Mike's.

Open it here: https://jermaineh1024.github.io/menu-drill/

On a phone, tap Share, then Add to Home Screen, and it works like an app, offline too.

## What is in this repo

The files at the top (`index.html`, `sw.js`, the manifest and icons) are the live site. They are built, not edited by hand.

- `src/` is the page in pieces: `head.html`, `body.html`, `style.css`, and `js/` in load order (the menu data is `js/10-data.js`). `src/include/` holds the cutting, wrapping and bagging pictures, which are drawn by a script.
- `tools/howto.py` and `tools/howto_lib.py` draw those pictures.
- `tools/make.sh VERSION` builds everything into `dist/`: one file for claude.ai (`dist/artifact.html`) and the site (`dist/site/`), with fonts built in, an offline worker named for the version, and a baked copy that still reads when scripts are off.
- `tools/test/suite.js` taps through the built site in Chromium, WebKit and Firefox the way a person would and fails loudly if anything is off: every sub built right and wrong, every way to practice, the quizzes, today's session, the walkthroughs, no voice, no storage, no motion, no scripts, tap sizes, contrast, and nothing wider than the screen.
- `tools/test/planted.js` breaks a copy of the site six ways on purpose to prove the suite catches each one.

## To change something

1. Edit the piece in `src/` (a fact about a sub lives in `src/js/10-data.js`).
2. `bash tools/make.sh 2026-11-10a` with a new version name.
3. `node tools/test/suite.js --version 2026-11-10a` and get the line that starts `ALL_CHECKS_PASSED`.
4. Copy `dist/site/*` over the files at the top of this repo and push.

Needs Python 3 and Node, each with Playwright and its browsers.
