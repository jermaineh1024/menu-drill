
/* ---------- boot ---------- */
renderStudy();
renderLegend();
initPics();
initHowto();
standaloneSeq("mw-game", "mw");
each(document.querySelectorAll("[data-seq]"), function(el){ standaloneSeq(el.id, el.getAttribute("data-seq")); });   /* the put-it-in-order games inside the training modules */
initTraining();
initControls();
initLevels();
refreshProgress();
initFocus();
initTicks();
initCalcs();
initNow();
initListen();
initVoiceUI();
try { if (window.__speechLog) window.__jmSpoken = allSpoken; } catch(e){}   /* only where a test or the recording tool asked for it before the page loaded */
/* someone who has already started doesn't need the first-day explainer open */
if (Object.keys(sched).length){ var intro = $("j-first"); if (intro) intro.open = false; }
showView(currentHashView());
