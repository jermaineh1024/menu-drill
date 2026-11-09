
/* ---------- boot ---------- */
renderStudy();
renderLegend();
initPics();
initHowto();
standaloneSeq("mw-game", "mw");
standaloneSeq("wrap-game", "wrap");
initControls();
refreshProgress();
each(document.querySelectorAll("#o-quiz [data-bank]"), function(b){ b.textContent += " (" + BANKS[b.getAttribute("data-bank")].length + ")"; });
/* someone who has already started doesn't need the first-day explainer open */
if (Object.keys(sched).length){ var intro = $("j-first"); if (intro) intro.open = false; }
showView(currentHashView());
