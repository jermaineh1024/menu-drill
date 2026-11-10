
/* ---------- boot ---------- */
renderStudy();
renderLegend();
initPics();
initHowto();
standaloneSeq("mw-game", "mw");
each(document.querySelectorAll("[data-seq]"), function(el){ standaloneSeq(el.id, el.getAttribute("data-seq")); });   /* the put-it-in-order games inside the training modules */
initTraining();
initControls();
refreshProgress();
/* someone who has already started doesn't need the first-day explainer open */
if (Object.keys(sched).length){ var intro = $("j-first"); if (intro) intro.open = false; }
showView(currentHashView());
