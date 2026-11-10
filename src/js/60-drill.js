
/* ---------- drill ---------- */
var D = {mode:"flash", deck:"italian", lastSubDeck:"italian", bank:null, queue:[], pos:0, right:0, wrong:0, missed:[], custom:null, title:null, streak:0, mixed:false, active:false, game:null};
var qArea = $("q-area");

function savePrefs(){ store(PREF_KEY, {mode:D.mode, deck:D.lastSubDeck}); }
function deckObj(key){
  for (var i=0;i<DECKS.length;i++){ if (DECKS[i].key === key) return DECKS[i]; }
  return null;
}
function modeObj(key){
  for (var i=0;i<MODES.length;i++){ if (MODES[i].key === key) return MODES[i]; }
  return null;
}
function deckIds(key){
  var d = deckObj(key);
  if (d && d.today) return todayQueue();
  if (!d) return numbered.map(function(s){ return s.id; });
  if (key === "weak") return weakIds().map(function(k){ return isNaN(+k) ? k : +k; });
  if (d.bank) return BANKS[d.bank].map(function(q){ return q.id; });
  return d.ids.slice();
}
/* mode and deck are optional: whatever is missing stays as it was. customIds runs exactly those; title names them. */
function startRun(mode, deck, customIds, title){
  stopListen();
  if (saying){ Voice.stop(); sayReset(); }
  if (mode) D.mode = mode;
  if (deck) D.deck = deck;
  else if (mode && deckObj(D.deck) && (deckObj(D.deck).bank || deckObj(D.deck).today)) D.deck = D.lastSubDeck || "italian";
  var d = deckObj(D.deck);
  D.bank = (d && d.bank) ? d.bank : null;
  if (!D.bank && !(d && d.today)) D.lastSubDeck = D.deck;
  D.custom = customIds || null;
  D.title = title || null;
  var ids = D.custom ? D.custom.slice() : deckIds(D.deck);
  D.mixed = ids.some(function(x){ return x && typeof x === "object"; });
  if (D.mixed) D.bank = null;
  D.queue = (d && d.today && !D.custom) ? ids : shuffle(ids);   /* today's session is already in the order it should be met */
  if (d && d.today && !D.custom) store(SESSION_KEY, todayStamp());
  D.pos = 0; D.right = 0; D.wrong = 0; D.missed = []; D.streak = 0; D.active = true;
  syncControls();
  savePrefs();
  renderQuestion();
}
function stopRun(){
  stopListen();
  D.active = false;
  clear(qArea);
  syncControls();
}
function isSubRun(){ return D.active && !D.bank && !D.mixed; }
function syncControls(){
  each(document.querySelectorAll("#mode-seg .mode"), function(b){
    b.setAttribute("aria-pressed", isSubRun() && b.getAttribute("data-mode") === D.mode ? "true" : "false");
  });
  each(document.querySelectorAll("#deck-seg button"), function(b){
    b.setAttribute("aria-pressed", (!D.custom || !isSubRun()) && b.getAttribute("data-deck") === D.lastSubDeck ? "true" : "false");
  });
}
function runLabel(){
  var isQuiz = !!D.bank || (D.mixed && D.deck !== "today");
  var kind = D.mixed && D.deck === "today" ? "Today's session" : (isQuiz ? "Quiz" : (modeObj(D.mode) || {}).label || "");
  if (D.title) return kind + ", " + D.title;
  if (D.custom) return kind + ", the ones you missed";
  if (D.mixed && D.deck === "today") return kind;
  var d = deckObj(D.deck);
  return kind + (d ? ", " + d.label : "");
}
function runHeader(card, counted){
  var total = D.queue.length;
  var pct = total ? Math.round((D.pos / total) * 100) : 0;
  card.appendChild(h("div", {class:"prog"}, [
    counted ? h("span", {class:"mono", text:(D.pos + 1) + " of " + total}) : null,
    counted ? h("div", {class:"bar"}, h("i", {style:"width:" + pct + "%"})) : h("span", {style:"flex:1"}),
    counted ? h("button", {class:"btn quiet small", text:"Restart", onclick:function(){ startRun(null, null, D.custom, D.title); toQuestion(true); }}) : null,
    h("button", {class:"btn quiet small", text:"Stop", onclick:function(){ stopRun(); }})
  ]));
  card.appendChild(h("p", {class:"ctx"}, [
    h("span", {text:runLabel()}),
    D.streak >= 2 ? h("span", {class:"streak", text:D.streak + " in a row"}) : null
  ]));
}
function refreshProgress(){
  renderWeak(); renderMastery(); renderReady(); renderToday(); renderMods(); renderQuizzes(); renderPath();
}
function tally(id, ok){
  mark(id, ok);
  schedUpdate(id, ok);
  refreshProgress();
  buzz(ok);
  if (ok){ D.right++; D.streak++; return; }
  D.wrong++; D.streak = 0;
  var key = String(id), m = id;
  if (D.mixed){
    if (key.indexOf("seq:") === 0) m = {kind:"seq", id:key.slice(4)};
    else if (key.indexOf("q:") !== 0){
      var was = D.queue[D.pos] && D.queue[D.pos].mode;
      m = {kind:"sub", id:id, mode:(!was || was === "teach") ? "num" : was};
    }
  }
  D.missed.push(m);
}
function nextQuestion(){ D.pos++; renderQuestion(); toQuestion(true); }
function renderQuestion(){
  clear(qArea);
  D.game = null;
  if (!D.active) return;
  if (!D.queue.length){
    var msg = D.deck === "weak" && !D.custom
      ? "Nothing in Weak spots yet. Run any other deck first; whatever you miss lands here."
      : "This deck is empty.";
    qArea.appendChild(h("div", {class:"card"}, [h("p", {text:msg}), h("div", {class:"row"}, [
      h("button", {class:"btn", text:"Drill everything instead", onclick:function(){ startRun(null, "all"); toQuestion(true); }}),
      h("button", {class:"btn quiet", text:"Close", onclick:function(){ stopRun(); }})])]));
    return;
  }
  var card = h("div", {class:"card"});
  if (isSubRun() && D.mode === "listen"){
    runHeader(card, false);
    renderListen(card);
    qArea.appendChild(card);
    return;
  }
  if (D.pos >= D.queue.length){ renderSummary(); return; }
  runHeader(card, true);
  var entry = D.queue[D.pos], mode = D.mode;
  if (D.mixed && entry && typeof entry === "object"){
    var isToday = D.deck === "today" && !D.custom;
    if (entry.kind === "q"){
      if (isToday && !sched["q:" + entry.id]) renderTeachFact(bankQ(entry.bank, entry.id), card, entry.bank);
      else renderBank(bankQ(entry.bank, entry.id), card, entry.bank);
      qArea.appendChild(card); return;
    }
    if (entry.kind === "seq"){
      if (isToday && !sched["seq:" + entry.id]) renderTeachSeq(entry.id, card);
      else renderSeq(entry.id, card);
      qArea.appendChild(card); return;
    }
    mode = entry.mode || "num"; entry = entry.id;
  } else if (D.bank){
    renderBank(bankQ(D.bank, entry), card, D.bank);
    qArea.appendChild(card);
    return;
  }
  var sub = byId(entry);
  if (mode === "teach") renderTeach(sub, card);
  else if (mode === "flash") renderFlash(sub, card);
  else if (mode === "num") renderMC(sub, card, "num");
  else if (mode === "what") renderMC(sub, card, "what");
  else if (mode === "order") renderOrder(sub, card);
  else renderBuild(sub, card);
  qArea.appendChild(card);
}
/* a clean run throws the toppings: tomato, lettuce, provolone, onion, the red of the number tiles */
function celebrate(card){
  if (reducedMotion || document.body.classList.contains("nomotion")) return;
  var colors = ["#E05A4E", "#9FD67A", "#F2D97A", "#C9A9E3", "#C8102E", "#2C6CB0"], box = h("div", {class:"confetti", "aria-hidden":"true"});
  for (var i = 0; i < 22; i++){
    var a = (i / 22) * Math.PI * 2 + Math.random() * 0.5, far = 90 + Math.random() * 130;
    box.appendChild(h("i", {style:"background:" + colors[i % colors.length] + ";--dx:" + Math.round(Math.cos(a) * far) + "px;--dy:" + Math.round(Math.sin(a) * far * 0.7 + 60) + "px;--r:" + Math.round(Math.random() * 720 - 360) + "deg;--d:" + Math.round(Math.random() * 140) + "ms"}));
  }
  card.appendChild(box);
  setTimeout(function(){ if (box.parentNode) box.parentNode.removeChild(box); }, 1700);
}
function renderSummary(){
  var total = D.queue.length;
  var pct = total ? Math.round(D.right / total * 100) : 0;
  var card = h("div", {class:"card done-card"}, [h("h2", {text:pct === 100 ? "Clean run" : "Done"}), h("p", {text:D.right + " of " + total + " right (" + pct + "%)."})]);
  if (pct === 100 && total) celebrate(card);
  if (D.missed.length && D.mixed){
    var rows2 = h("div", {class:"rows"}), ul2 = h("ul", {class:"plain"});
    D.missed.forEach(function(m){
      if (m.kind === "q"){ var q2 = bankQ(m.bank, m.id); if (q2) ul2.appendChild(h("li", {}, [h("b", {text:q2.q + " "}), h("span", {text:q2.a + ". " + q2.why})])); }
      else if (m.kind === "seq"){ ul2.appendChild(h("li", {}, [h("b", {text:SEQS[m.id].title + ". "}), h("span", {text:SEQS[m.id].recap})])); }
      else rows2.appendChild(subRow(byId(m.id), false, false));
    });
    card.appendChild(h("p", {class:"fine mt-s", text:"Missed. These come back first in your next session:"}));
    if (rows2.children.length) card.appendChild(rows2);
    if (ul2.children.length) card.appendChild(ul2);
  } else if (D.missed.length && D.bank){
    var ul = h("ul", {class:"plain"});
    D.missed.forEach(function(id){
      var q = bankQ(D.bank, id);
      if (q) ul.appendChild(h("li", {}, [h("b", {text:q.q + " "}), h("span", {text:q.a + ". " + q.why})]));
    });
    card.appendChild(h("p", {class:"fine mt-s", text:"Missed:"}));
    card.appendChild(ul);
  } else if (D.missed.length){
    var rows = h("div", {class:"rows"});
    D.missed.forEach(function(id){ rows.appendChild(subRow(byId(id), false, false)); });
    card.appendChild(h("p", {class:"fine mt-s", text:"Missed. Tap one to study it:"}));
    card.appendChild(rows);
  } else {
    var left = readiness();
    card.appendChild(h("p", {class:"fine", text:D.mixed && D.deck === "today"
      ? "That's a session. What you got right comes back tomorrow, and getting it right again is what locks it in." + (left.fresh ? " There are " + left.fresh + " more you haven't met yet, whenever you want another round." : "")
      : (D.mixed || D.bank ? "Clean. These come back in today's sessions until they're locked in." : "Do it again tomorrow: right on two different days is what locks a sub in.")}));
  }
  var row = h("div", {class:"row"}, [
    h("button", {class:"btn", text:"Run it again", onclick:function(){ startRun(null, null, D.custom, D.title); toQuestion(true); }})
  ]);
  if (D.missed.length){
    var missed = D.missed.slice();
    row.appendChild(h("button", {class:"btn ghost", text:"Drill the missed ones", onclick:function(){ startRun(null, null, missed); toQuestion(true); }}));
  }
  row.appendChild(h("button", {class:"btn quiet", text:"Close", onclick:function(){ stopRun(); }}));
  card.appendChild(row);
  qArea.appendChild(card);
}

/* first meeting: teach it, then ask. The lesson steps aside when the question comes, so the answer isn't sitting above it. */
function teachThen(card, lesson, sayFn, ask){
  var teach = h("div", {}, [h("p", {class:"teach-note", text:"New one. Look it over, then you'll get asked."})].concat(lesson));
  var quizBox = h("div", {hidden:true});
  var sayB = sayFn ? sayButton(sayFn) : null;
  teach.appendChild(h("div", {class:"row"}, [sayB, h("button", {class:"btn", text:"Got it, ask me", onclick:function(){
    if (saying){ Voice.stop(); sayReset(); }
    teach.hidden = true;
    ask(quizBox);
    quizBox.hidden = false;
    toQuestion(true);
  }})]));
  card.appendChild(teach);
  card.appendChild(quizBox);
}
function renderTeach(sub, card){
  teachThen(card, [subCard(sub, true)], function(){ return sayText(sub); }, function(box){ renderMC(sub, box, "num"); });
}
function renderTeachFact(q, card, bankKey){
  var lesson = [
    h("p", {class:"q-label", text:BANK_LABEL[bankKey] || "Quiz"}),
    h("h3", {class:"q-name q-text", text:q.q}),
    h("div", {class:"fact"}, [h("b", {text:q.a}), h("span", {text:q.why})])
  ];
  teachThen(card, lesson, function(){ return speakable(q.q + " " + q.a + ". " + q.why); }, function(box){ renderBank(q, box, bankKey); });
}
function renderTeachSeq(key, card){
  var sq = SEQS[key], ol = h("ol", {class:"plain"});
  sq.steps.forEach(function(st){ ol.appendChild(h("li", {text:st})); });
  var lesson = [h("h3", {class:"q-name", text:sq.title}), ol];
  if (sq.where) lesson.push(h("p", {class:"fine mt-s", text:"More on each step is on the Training tab, under " + sq.where + "."}));
  teachThen(card, lesson, function(){ return speakable(sq.title + ". " + sq.steps.join(". ") + "."); }, function(box){ renderSeq(key, box); });
}

/* flashcards */
function renderFlash(sub, card){
  var back = h("div", {class:"fc-back", hidden:true});
  var front = h("div", {class:"fc"}, [
    tagEl(sub, "big"),
    h("p", {class:"hint", text:(sub.type === "cold" ? "Cold sub. " : "Hot sub. ") + "Say the name and everything on it, in order."}),
    h("button", {class:"btn", text:"Flip", onclick:function(){ front.hidden = true; back.hidden = false; back.classList.add("flip-in"); }})
  ]);
  back.appendChild(subCard(sub, true));
  var sayB = sayButton(function(){ return sayText(sub); });
  if (sayB) back.appendChild(h("div", {class:"row"}, sayB));
  back.appendChild(h("div", {class:"row pair"}, [
    h("button", {class:"btn ghost", text:"Missed it", onclick:function(){ tally(sub.id, false); nextQuestion(); }}),
    h("button", {class:"btn", text:"Got it", onclick:function(){ tally(sub.id, true); nextQuestion(); }})
  ]));
  card.appendChild(front);
  card.appendChild(back);
}

/* multiple choice */
function pickOptions(sub){
  var sameFam = numbered.filter(function(s){ return s.fam === sub.fam && s.id !== sub.id; });
  var sameType = numbered.filter(function(s){ return s.type === sub.type && s.fam !== sub.fam; });
  var picks = shuffle(sameFam).slice(0,3);
  if (picks.length < 3) picks = picks.concat(shuffle(sameType).slice(0, 3 - picks.length));
  return shuffle([sub].concat(picks));
}
function renderMC(sub, card, kind){
  var opts = pickOptions(sub);
  var fb = h("div", {class:"fb", hidden:true, role:"status"});
  var next = h("button", {class:"btn", text:"Next", hidden:true, onclick:nextQuestion});
  var buttons = [];
  var grid = h("div", {class:"opts " + (kind === "num" ? "numbers" : "names")});
  if (kind === "num"){
    card.appendChild(h("p", {class:"q-label", text:"Which number is this?"}));
    card.appendChild(h("h3", {class:"q-name", text:sub.name}));
  } else {
    card.appendChild(h("p", {class:"q-label", text:"Which sub is this?"}));
    card.appendChild(stackSVG(sub, {compact:true}));
  }
  opts.forEach(function(o){
    var b = h("button", {class:"opt", "data-id":String(o.id)}, kind === "num" ? [tagEl(o)] : [h("span", {text:o.name})]);
    b.addEventListener("click", function(){
      buttons.forEach(function(x){ x.disabled = true; });
      var ok = o.id === sub.id;
      b.className = "opt " + (ok ? "ok" : "bad");
      buttons.forEach(function(x){ if (x.getAttribute("data-id") === String(sub.id)) x.className = "opt ok"; });
      fb.className = "fb " + (ok ? "ok" : "bad");
      clear(fb);
      if (ok){
        fb.appendChild(h("b", {text:"Yes. #" + sub.n + " is " + theName(sub) + "."}));
      } else if (kind === "num"){
        var tn = theName(sub);
        fb.appendChild(h("b", {text:"No. You tapped #" + o.n + ", " + theName(o) + ". " + tn.charAt(0).toUpperCase() + tn.slice(1) + " is #" + sub.n + "."}));
      } else {
        fb.appendChild(h("b", {text:"No. That's #" + sub.n + ", " + theName(sub) + "."}));
        fb.appendChild(h("span", {text:"You tapped #" + o.n + ", " + theName(o) + ", which is: " + coreItems(o).join(", ").toLowerCase() + "."}));
      }
      fb.appendChild(sub.type === "cold" ? fullOrderLine(itemsOf(sub)) : buildLine(sub));
      fb.hidden = false;
      next.hidden = false;
      tally(sub.id, ok);
      try { next.focus({preventScroll:true}); } catch(e){}
    });
    buttons.push(b);
    grid.appendChild(b);
  });
  card.appendChild(grid);
  card.appendChild(fb);
  card.appendChild(h("div", {class:"row"}, next));
}

/* ---------- tap things in order: the sandwich stacks up, or steps line up in a tray ----------
   o.pool          what can be tapped
   o.visual        true: a sandwich that builds; false: a list of steps that get numbered where they sit, so nothing moves
   o.ordered       false: tap to add, tap again to take off (hot subs)
   o.head          a heading that rides on top of the sandwich, so it stays in view while you build
   o.reserve       how tall the finished sandwich is, in picture units, so the page doesn't jump
   o.check(seq)    -> {ok, status:["ok"|"bad", ...], issues:[...]}
   o.feedback(box, result), o.done(result)
   o.next          {label, fn}: a button that appears after checking. Without it you get Shuffle again.
   o.layout(seq, {statuses, closed, justAdded})  draws the sandwich its own way (hot subs: the lid's toppings hang under the lid)
   On a phone the sandwich sits in a window sized so the chips and Check stay on screen with it. Once the
   sandwich outgrows the window, the window follows the top of it. Check opens the whole thing. */
function stuckBottom(){
  var t = document.querySelector(".tabs"), top = 0;
  if (!t) return 0;
  try { top = parseFloat(getComputedStyle(t).top) || 0; } catch(e){}
  return top + t.offsetHeight;
}
function orderGame(host, o){
  var ordered = o.ordered !== false;
  var seq = [], checked = false, pool = [], btns = {};
  var show = o.visual ? h("div", {class:"plate"}) : h("p", {class:"pool-hint", text:"Tap the last one again to take it back."});
  var win = o.visual ? h("div", {class:"plate-win"}) : null;
  var hint = o.visual ? h("p", {class:"plate-hint", text:o.hint}) : null;
  var said = h("p", {class:"sr", role:"status"});
  var poolEl = h("div", {class:o.visual ? "pool" : "pool steps-pool"});
  var fb = h("div", {class:"fb", hidden:true, role:"status"});
  var undo = h("button", {class:"btn quiet", text:"Undo", onclick:function(){
    if (checked || !seq.length) return;
    var it = seq.pop(); draw(null, false); said.textContent = "Took off " + it + ".";
  }});
  var check = h("button", {class:"btn", text:"Check", onclick:doCheck});
  var after = o.next
    ? h("button", {class:"btn", text:o.next.label || "Next", hidden:true, onclick:o.next.fn})
    : h("button", {class:"btn quiet", text:"Shuffle again", onclick:reset});
  var rowEl = h("div", {class:"row"}, [undo, check, after]);
  var fullUnits = 28 + (o.reserve || 0) + 17;   /* lid, layers, bottom bread */
  if (o.visual){
    if (o.head) show.appendChild(o.head);
    win.appendChild(hint);
    win.style.setProperty("--full", Math.ceil(fullUnits * 1.02 + 20) + "px");
    show.appendChild(win);
  }
  var packed = false;
  function makePool(){
    pool = shuffle(o.pool); btns = {}; clear(poolEl); packed = false;
    pool.forEach(function(it){
      var b = o.visual ? ingChip(it, {}) : h("button", {class:"chip step", "aria-pressed":"false"}, [h("span", {class:"idx", "aria-hidden":"true"}), h("span", {text:it})]);
      b.addEventListener("click", function(){ tap(it); });
      btns[it] = b; poolEl.appendChild(b);
    });
  }
  /* The chips are shuffled, and some orders wrap into one more row than others. On a small screen that extra row pushes Check
     below the fold (the #13's 15 chips did it in about 1 open in 100). So the first time the chips are on screen, try a few
     more orders and keep the one that packs tightest. The order still says nothing about the build. */
  function pack(){
    if (packed || !o.visual || seq.length || !poolEl.offsetHeight) return;
    packed = true;
    var best = pool, bestH = poolEl.offsetHeight;
    for (var t = 0; t < 6; t++){
      var order = shuffle(pool);
      order.forEach(function(it){ poolEl.appendChild(btns[it]); });
      var hgt = poolEl.offsetHeight;
      if (hgt < bestH){ best = order; bestH = hgt; }
    }
    best.forEach(function(it){ poolEl.appendChild(btns[it]); });
    pool = best;
  }
  function tap(it){
    if (checked) return;
    var k = seq.indexOf(it), added = true, held = document.activeElement === btns[it];
    if (!o.visual && k >= 0){   /* a step already numbered: tapping the last one takes it back, the others stay put */
      if (k !== seq.length - 1) return;
      seq.pop(); added = false;
    }
    else if (ordered || k < 0) seq.push(it); else { seq.splice(k, 1); added = false; }
    draw(null, added);
    said.textContent = (added ? "Added " : "Took off ") + it + ". " + seq.length + " on.";
    if (held && btns[it].disabled){   /* a chip that just went grey can't keep the keyboard focus, so hand it on */
      var at = pool.indexOf(it), nextB = null;
      for (var j = 1; j <= pool.length && !nextB; j++){ var c = btns[pool[(at + j) % pool.length]]; if (!c.disabled) nextB = c; }
      try { (nextB || check).focus({preventScroll:true}); } catch(e){}
    }
  }
  function fit(){
    if (!o.visual) return;
    var svg = win.querySelector("svg"), w = svg ? svg.getBoundingClientRect().width : 0;
    if (!w) return;   /* not on screen yet; the observer below calls back when it is */
    pack();
    win.style.setProperty("--full", Math.ceil(fullUnits * (w / 300) + 20) + "px");
    var chrome = stuckBottom() + 10 + (o.head ? o.head.offsetHeight : 0) + (poolEl.hidden ? 0 : poolEl.offsetHeight + 12) + rowEl.offsetHeight + 14 + 12;
    win.style.setProperty("--chrome", Math.round(chrome) + "px");
    win.classList.toggle("over", !checked && svg.getBoundingClientRect().height > win.clientHeight - 19);
  }
  function draw(statuses, justAdded){
    if (o.visual){
      var old = win.querySelector("svg");
      if (old) win.removeChild(old);
      hint.classList.toggle("off", checked || seq.length > 0);
      win.classList.toggle("open", checked);
      var lo = {statuses:statuses, closed:checked, base:o.base, justAdded:justAdded};
      win.appendChild(o.layout ? o.layout(seq, lo) : liveStack(seq, lo));
    }
    pool.forEach(function(it){
      var at = seq.indexOf(it), picked = at >= 0, b = btns[it];
      if (o.visual){
        b.disabled = checked || (ordered && picked);
        if (!ordered) b.setAttribute("aria-pressed", picked ? "true" : "false");
      } else {
        b.disabled = checked;
        b.className = "chip step" + (picked ? " placed" : "") + (statuses && picked ? " " + statuses[at] : "");
        b.firstChild.textContent = picked ? String(at + 1) : "";
        b.setAttribute("aria-pressed", picked ? "true" : "false");
        b.setAttribute("aria-label", picked ? it + ", number " + (at + 1) : it);
      }
    });
    poolEl.hidden = checked && !!o.visual;
    undo.disabled = !seq.length; check.disabled = !seq.length;
    undo.hidden = checked; check.hidden = checked;
    if (o.next) after.hidden = !checked;
    fit();
  }
  function doCheck(){
    if (checked || !seq.length) return;
    checked = true;
    var r = o.check(seq.slice());
    draw(r.status, false);
    if (o.visual && r.ok) show.classList.add("win");
    fb.className = "fb " + (r.ok ? "ok" : "bad");
    clear(fb);
    o.feedback(fb, r);
    fb.hidden = false;
    said.textContent = "";
    try { after.focus({preventScroll:true}); } catch(e){}
    if (o.done) o.done(r);
    /* right answers are about moving on, so keep Next on screen; wrong ones are about reading, so stay put */
    if (o.next && r.ok){ try { after.scrollIntoView({behavior:reducedMotion ? "auto" : "smooth", block:"nearest"}); } catch(e){} }
  }
  function reset(){ seq = []; checked = false; fb.hidden = true; clear(fb); show.classList.remove("win"); makePool(); draw(null, false); }
  host.appendChild(show);
  host.appendChild(said);
  host.appendChild(poolEl);
  host.appendChild(fb);
  host.appendChild(rowEl);
  makePool();
  draw(null, false);
  if (o.visual && typeof ResizeObserver !== "undefined"){
    /* refit when the window first gets a width (a hidden tab opening) or the phone turns; a frame later, so the observer never sees its own change */
    try { new ResizeObserver(function(){ requestAnimationFrame(fit); }).observe(win); } catch(e){}
  }
  return {el:show, fit:fit, bottom:function(){ return rowEl.getBoundingClientRect().bottom; }};
}
function issueList(fb, issues){
  if (!issues || !issues.length) return;
  var ul = h("ul", {});
  issues.slice(0, 4).forEach(function(m){ ul.appendChild(h("li", {text:m})); });
  fb.appendChild(ul);
}

/* build it */
function distractors(sub, k){
  var correct = itemsOf(sub);
  var pool = (sub.type === "cold" ? COLD_POOL : HOT_POOL).filter(function(it){
    if (correct.indexOf(it) >= 0) return false;
    if (it.indexOf("White American") >= 0 && correct.join("|").indexOf("White American") >= 0) return false;
    return true;
  });
  return shuffle(pool).slice(0, k);
}
function checkCold(sub, seq){
  var cheese = sub.cheese, meats = sub.meats, fixed = sub.fixed, mw = sub.mw ? MW : [], lid = sub.lid || [];
  var status = [], issues = [], placed = [];
  var maxStage = -1, maxMW = -1, coreCount = cheese.length + meats.length, corePlaced = 0, maxMeat = -1, maxCheese = -1;
  function add(m){ if (issues.indexOf(m) < 0) issues.push(m); }
  seq.forEach(function(it){
    var st = "ok";
    if (lid.indexOf(it) >= 0){
      var mwDone = mw.every(function(x){ return placed.indexOf(x) >= 0; });
      if (corePlaced < coreCount || !mwDone){ st = "bad"; add("Mayo and bacon go on the lid, after Mike's Way."); }
      else if (it === "Bacon" && lid.indexOf("Mayo") >= 0 && placed.indexOf("Mayo") < 0){ st = "bad"; add("Mayo goes on the lid first, then bacon, so the bacon sticks."); }
      placed.push(it); status.push(st); return;
    }
    placed.push(it);
    if (cheese.indexOf(it) >= 0){
      if (maxStage > 0){ st = "bad"; add("Cheese goes on the bread first, before the meat and the toppings."); }
      else if (cheese.indexOf(it) < maxCheese){ st = "bad"; add("The board lists the cheese as " + cheese.join(", then ").toLowerCase() + ", and that's the order it goes on."); }
      maxCheese = Math.max(maxCheese, cheese.indexOf(it));
      if (maxStage < 0) maxStage = 0;
      corePlaced++;
    } else if (meats.indexOf(it) >= 0){
      if (maxStage > 1){ st = "bad"; add("Meat goes on before Mike's Way."); }
      else if (meats.indexOf(it) < maxMeat){ st = "bad"; add("The meats go on in the order the board lists them: " + meats.join(", ").toLowerCase() + "."); }
      maxMeat = Math.max(maxMeat, meats.indexOf(it));
      if (maxStage < 1) maxStage = 1;
      corePlaced++;
    } else if (fixed.indexOf(it) >= 0){
      if (corePlaced < coreCount){ st = "bad"; add(it + " goes on after the cheese and meat."); }
      else if (maxStage >= 2){ st = "bad"; add(it + " goes on before Mike's Way."); }
    } else if (mw.indexOf(it) >= 0){
      var idx = mw.indexOf(it);
      if (corePlaced < coreCount){ st = "bad"; add("Mike's Way goes on after the cheese and meat."); }
      else if (idx < maxMW){ st = "bad"; add("Mike's Way order: onions, lettuce, tomatoes, vinegar, oil, oregano, salt."); }
      if (idx > maxMW) maxMW = idx;
      maxStage = 2;
    } else {
      st = "bad"; add(it + " is not on a #" + sub.n + ".");
    }
    status.push(st);
  });
  var missing = itemsOf(sub).filter(function(it){ return seq.indexOf(it) < 0; });
  if (missing.length) add("Missing: " + missing.join(", ") + ".");
  return {ok:issues.length === 0, status:status, issues:issues};
}
/* A hot sub is made in stages: the lid is dressed first, then everything that cooks, any sauce on the cooked meat, the cheese
   on top, and the finish once it is on the bread. Inside the grill stage the order is free: it all gets chopped together. */
/* the nine hot subs the grill video walks through: on those the order on the grill is known too (vegetables down first, onions before peppers, then the meat) */
function hotKnown(sub){ return HOT_AMT_IDS.indexOf(sub.id) >= 0; }
function vegWords(sub){
  var w = sub.grill.map(function(x){ return x.replace(/^Grilled /, "").toLowerCase(); });
  return w.length > 1 ? w.slice(0, -1).join(", ") + " and " + w[w.length - 1] : w.join("");
}
function hotStage(sub, it){
  if (sub.lid.indexOf(it) >= 0) return 0;
  if (sub.grill.indexOf(it) >= 0) return 1;
  if (it === sub.protein) return hotKnown(sub) && sub.grill.length ? 1.5 : 1;
  if (sub.sauce.indexOf(it) >= 0) return 2;
  if (sub.cheese.indexOf(it) >= 0) return 3;
  if (sub.finish.indexOf(it) >= 0) return 4;
  return -1;
}
function checkHot(sub, seq){
  var correct = itemsOf(sub), status = [], issues = [], maxStage = -1, maxLid = -1, seen = {};
  function add(m){ if (issues.indexOf(m) < 0) issues.push(m); }
  seq.forEach(function(it){
    var sg = hotStage(sub, it), st = "ok";
    if (sg < 0){ status.push("bad"); add(it + " is not on a #" + sub.n + "."); return; }
    if (sg < maxStage){
      st = "bad";
      var meat = (sub.protein || "meat").toLowerCase();
      if (sg === 0) add("The lid comes first on a hot sub: " + sub.lid.join(", ").toLowerCase() + " on the inside of the lid, before the " + meat + " hits the grill.");
      else if (maxStage === 4) add(sub.finish.join(", ") + " goes on last, once the " + meat + " and cheese are on the bread.");
      else if (sg === 2 || maxStage === 2) add(sub.sauce.join(", ") + " goes on once the " + meat + " is cooked, right before the cheese.");
      else if (sg === 1 && maxStage === 1.5) add("On the grill, the " + vegWords(sub) + " go down first, then the " + meat + ".");
      else add("Cheese goes on top after everything on the grill is cooked.");
    }
    if (sg === 1 && hotKnown(sub) && it === "Grilled onions" && seen["Grilled peppers"]){ st = "bad"; add("Onions go down first. The peppers go on top of them."); }
    seen[it] = true;
    if (sg === 0){
      var li = sub.lid.indexOf(it);
      if (li < maxLid){ st = "bad"; add("On the lid, in order: " + sub.lid.join(", then ").toLowerCase() + "."); }
      maxLid = Math.max(maxLid, li);
    }
    maxStage = Math.max(maxStage, sg);
    status.push(st);
  });
  var missing = correct.filter(function(it){ return seq.indexOf(it) < 0; });
  if (missing.length) add("Missing: " + missing.join(", ") + ".");
  return {ok:issues.length === 0, status:status, issues:issues};
}
function hotHint(sub){ return sub.lid.length ? "Tap it in the order it's made. On this one the lid comes first." : "Tap it in the order it's made: what goes on the grill, then the cheese."; }

/* the heading that rides on the sandwich: its number and name, or on an order with changes, its number and the changes */
function plateHead(sub, label, mods){
  var kids = [tagEl(sub), (mods && mods.length) ? h("span", {class:"mods"}, mods) : h("span", {text:label})];
  return h("h3", {class:"plate-head"}, kids);
}
function renderBuild(sub, card){
  var isCold = sub.type === "cold";
  var correct = itemsOf(sub);
  D.game = orderGame(card, {
    visual:true, ordered:true, pool:correct.concat(distractors(sub, correct.length >= 12 ? 2 : 3)), reserve:stackHeightFor(correct) + 26,
    head:plateHead(sub, sub.name), layout:isCold ? null : hotLive(sub),
    hint:isCold ? (sub.mw ? "Build it Mike's Way. Tap what goes on the bread first." : "Tap what goes on the bread first.") : hotHint(sub),
    check:function(seq){ return isCold ? checkCold(sub, seq) : checkHot(sub, seq); },
    feedback:function(fb, r){
      fb.appendChild(h("b", {text:r.ok ? (isCold ? "Clean build." : "That's how it's made.") : "Not yet."}));
      if (!r.ok){
        issueList(fb, r.issues);
        fb.appendChild(h("p", {class:"delta mt-s", text:isCold ? "The right build, bottom to top:" : "The right build. The numbers are the order it's made in:"}));
        fb.appendChild(stackSVG(sub, {brackets:true}));
      } else if (!isCold) fb.appendChild(breakdown(sub));
    },
    done:function(r){ tally(sub.id, r.ok); },
    next:{label:"Next", fn:nextQuestion}
  });
}

/* quiz banks */
function renderBank(q, card, bankKey){
  var fb = h("div", {class:"fb", hidden:true, role:"status"});
  var next = h("button", {class:"btn", text:"Next", hidden:true, onclick:nextQuestion});
  var buttons = [];
  if (D.mixed) card.appendChild(h("p", {class:"q-label", text:BANK_LABEL[bankKey] || "Quiz"}));
  card.appendChild(h("h3", {class:"q-name q-text", text:q.q}));
  var grid = h("div", {class:"opts single"});
  shuffle(q.o).forEach(function(o){
    var b = h("button", {class:"opt", "data-o":o}, [h("span", {text:o})]);
    b.addEventListener("click", function(){
      var ok = o === q.a;
      buttons.forEach(function(x){ x.disabled = true; if (x.getAttribute("data-o") === q.a) x.className = "opt ok"; });
      if (!ok) b.className = "opt bad";
      fb.className = "fb " + (ok ? "ok" : "bad");
      clear(fb);
      fb.appendChild(h("b", {text:ok ? "Right." : "The answer is: " + q.a + "."}));
      fb.appendChild(h("span", {text:q.why}));
      fb.hidden = false;
      next.hidden = false;
      tally("q:" + q.id, ok);
      if (!ok){ D.missed[D.missed.length - 1] = D.mixed ? {kind:"q", bank:bankKey, id:q.id} : q.id; }
      try { next.focus({preventScroll:true}); } catch(e){}
    });
    buttons.push(b);
    grid.appendChild(b);
  });
  card.appendChild(grid);
  card.appendChild(fb);
  card.appendChild(h("div", {class:"row"}, next));
}

/* a fixed sequence: Mike's Way stacks on a sub, the wrap steps line up in a tray */
function seqOptions(key, extra){
  var sq = SEQS[key];
  var o = {
    visual:sq.visual, pool:sq.steps, hint:sq.first,
    base:sq.visual ? "Cheese and meat, from the slicer" : null,
    reserve:sq.visual ? stackHeightFor(sq.steps) + 28 : 0,   /* the seven, plus the band that stands for the cheese and meat */
    check:function(seq){
      var status = seq.map(function(it, i){ return sq.steps[i] === it ? "ok" : "bad"; });
      return {ok:seq.length === sq.steps.length && status.every(function(x){ return x === "ok"; }), status:status, issues:[]};
    },
    feedback:function(fb, r){
      fb.appendChild(h("b", {text:r.ok ? sq.okText : "Not yet."}));
      fb.appendChild(h("span", {text:sq.recap}));
    }
  };
  for (var k in extra){ if (Object.prototype.hasOwnProperty.call(extra, k)) o[k] = extra[k]; }
  return o;
}
function renderSeq(key, card){
  var sq = SEQS[key];
  var title = h("h3", {class:"q-name", text:sq.title});
  card.appendChild(title);
  card.appendChild(h("p", {class:"q-label", text:sq.hint}));
  D.game = orderGame(card, seqOptions(key, {done:function(r){ tally("seq:" + key, r.ok); }, next:{label:"Next", fn:nextQuestion}}));
  D.game.el = title;   /* line the card up on its title, not on the game under it */
}
/* the same games standing on their own pages. They count toward the schedule but not toward a run. */
function standaloneSeq(hostId, key){
  var host = $(hostId);
  if (!host) return;
  orderGame(host, seqOptions(key, {done:function(r){ schedUpdate("seq:" + key, r.ok); buzz(r.ok); refreshProgress(); }}));
}

/* take an order: read it back, then build it */
function makeOrder(sub){
  var r = Math.random();
  var size = r < 0.6 ? "regular" : (r < 0.85 ? "giant" : "mini");
  var o = {guest:pick(GUESTS), size:size, bread:pick(BREADS), no:null, add:[]};
  if (sub.type === "cold" && sub.mw){
    if (Math.random() < 0.35) o.no = pick(["Onions","Tomatoes","Onions","Lettuce"]);
    if (Math.random() < 0.45){
      var opts = TOP_EXTRAS.concat(["Mustard","Cherry pepper relish"]);
      if (!sub.lid) opts.push("Mayo");
      o.add.push(pick(opts));
    }
  }
  return o;
}
function orderMods(o){
  var m = [];
  if (o.no) m.push("no " + o.no.toLowerCase());
  o.add.forEach(function(a){ m.push("add " + a.toLowerCase()); });
  return m;
}
function orderSpoken(sub, o){
  var who = sub.lto ? "a " + sub.name : "a " + o.size + " " + sub.n;
  var t = "Hi, can I get " + who;
  if (sub.type === "cold" && sub.mw) t += ", Mike's Way";
  orderMods(o).forEach(function(m){ t += ", " + m; });
  return t + ", on " + o.bread + "?";
}
function orderItems(sub, o){
  if (sub.type !== "cold") return itemsOf(sub);
  var mw = sub.mw ? MW.filter(function(x){ return x !== o.no; }) : [];
  var top = o.add.filter(function(x){ return TOP_EXTRAS.indexOf(x) >= 0; });
  var lid = (sub.lid || []).concat(o.add.filter(function(x){ return LID_ORDER.indexOf(x) >= 0; }));
  lid.sort(function(a, b){ return LID_ORDER.indexOf(a) - LID_ORDER.indexOf(b); });
  return sub.cheese.concat(sub.meats, sub.fixed, mw, top, lid);
}
function checkOrder(sub, o, seq){
  var expect = orderItems(sub, o);
  var stageOf = function(it){
    if (sub.cheese.indexOf(it) >= 0) return 0;
    if (sub.meats.indexOf(it) >= 0) return 1;
    if (sub.fixed.indexOf(it) >= 0) return 2;
    if (MW.indexOf(it) >= 0) return 3;
    if (TOP_EXTRAS.indexOf(it) >= 0) return 4;
    return 5;
  };
  var status = [], issues = [], maxStage = -1, maxMW = -1, maxLid = -1, maxMeat = -1, maxCheese = -1;
  function add(m){ if (issues.indexOf(m) < 0) issues.push(m); }
  seq.forEach(function(it){
    var st = "ok";
    if (expect.indexOf(it) < 0){
      st = "bad";
      if (it === o.no) add(o.guest + " said no " + it.toLowerCase() + ".");
      else add(it + " isn't on this order.");
      status.push(st); return;
    }
    var sg = stageOf(it);
    if (sg < maxStage){
      st = "bad";
      if (sg === 0) add("Cheese goes on the bread first.");
      else if (sg === 1) add("Meat goes on before any toppings.");
      else if (sg === 3) add("Mike's Way goes on before the extras.");
      else if (sg === 4) add("Pickles and peppers go on top of the tomatoes, after Mike's Way, before the lid.");
      else add(it + " is out of order.");
    }
    if (sg === 0){ var ci = sub.cheese.indexOf(it); if (ci < maxCheese){ st = "bad"; add("The board lists the cheese as " + sub.cheese.join(", then ").toLowerCase() + ", and that's the order it goes on."); } maxCheese = Math.max(maxCheese, ci); }
    if (sg === 1){ var ei = sub.meats.indexOf(it); if (ei < maxMeat){ st = "bad"; add("The meats go on in the order the board lists them: " + sub.meats.join(", ").toLowerCase() + "."); } maxMeat = Math.max(maxMeat, ei); }
    if (sg === 3){ var mi = MW.indexOf(it); if (mi < maxMW){ st = "bad"; add("Mike's Way order: onions, lettuce, tomatoes, vinegar, oil, oregano, salt."); } maxMW = Math.max(maxMW, mi); }
    if (sg === 5){ var li = LID_ORDER.indexOf(it); if (li < maxLid){ st = "bad"; add("On the lid: mayo first, then mustard or relish, then bacon."); } maxLid = Math.max(maxLid, li); }
    maxStage = Math.max(maxStage, sg);
    status.push(st);
  });
  var missing = expect.filter(function(it){ return seq.indexOf(it) < 0; });
  if (missing.length) add("Missing: " + missing.join(", ") + ".");
  return {ok:issues.length === 0, status:status, issues:issues, expect:expect};
}
function readBackChoices(sub, o){
  var right = sayBack(sub, o.size, o.bread, orderMods(o));
  var wrongs = [];
  var otherSize = pick(SIZES.filter(function(s){ return s !== o.size; }));
  wrongs.push(sayBack(sub, otherSize, o.bread, orderMods(o)));
  var sib = shuffle(numbered.filter(function(s){ return s.fam === sub.fam && s.id !== sub.id; }))[0]
    || shuffle(numbered.filter(function(s){ return s.type === sub.type && s.id !== sub.id; }))[0];
  if (sib) wrongs.push(sayBack(sib, o.size, o.bread, orderMods(o)));
  if (o.no || o.add.length){ wrongs.push(sayBack(sub, o.size, o.bread, [])); }
  else { wrongs.push(sayBack(sub, o.size, o.bread === "white" ? "wheat" : "white", [])); }
  return {right:right, all:shuffle([right].concat(wrongs.slice(0, 3)))};
}
function renderOrder(sub, card){
  var o = makeOrder(sub);
  var isCold = sub.type === "cold";
  var tchips = [h("span", {text:SIZE_LABEL[o.size]}), h("span", {text:sub.lto ? sub.name : "#" + sub.n}), h("span", {text:o.bread.charAt(0).toUpperCase() + o.bread.slice(1)})];
  if (isCold && sub.mw) tchips.push(h("span", {text:"Mike's Way"}));
  if (o.no) tchips.push(h("span", {class:"no", text:"No " + o.no.toLowerCase()}));
  o.add.forEach(function(a){ tchips.push(h("span", {class:"add", text:"Add " + a.toLowerCase()})); });
  card.appendChild(h("div", {class:"ticket"}, [
    h("div", {class:"guest", text:o.guest + ", at the counter"}),
    h("p", {class:"said", text:"“" + orderSpoken(sub, o) + "”"}),
    h("div", {class:"tchips"}, tchips)
  ]));
  var stage1 = h("div", {});
  var stage2 = h("div", {hidden:true});
  card.appendChild(stage1);
  card.appendChild(stage2);
  var readOk = false;
  /* step 1: read it back */
  var rb = readBackChoices(sub, o);
  stage1.appendChild(h("p", {class:"stepper", text:"Step 1 of 2. Read it back"}));
  var grid = h("div", {class:"opts single"});
  var rbButtons = [];
  rb.all.forEach(function(line){
    var b = h("button", {class:"opt", "data-o":line}, [h("span", {text:"“" + line + "”"})]);
    b.addEventListener("click", function(){
      readOk = line === rb.right;
      rbButtons.forEach(function(x){ x.disabled = true; if (x.getAttribute("data-o") === rb.right) x.className = "opt ok"; });
      if (!readOk) b.className = "opt bad";
      buzz(readOk);
      var go = h("button", {class:"btn", text:"Now build it", onclick:function(){
        stage1.hidden = true; stage2.hidden = false;
        toQuestion(true);
      }});
      stage1.appendChild(h("div", {class:"fb " + (readOk ? "ok" : "bad")}, [
        h("b", {text:readOk ? o.guest + " nods." : "Not quite."}),
        readOk ? null : h("span", {text:"The right read-back is the green one. " + o.guest + " would have caught that."})
      ]));
      stage1.appendChild(h("div", {class:"row"}, go));
      try { go.focus({preventScroll:true}); go.scrollIntoView({behavior:reducedMotion ? "auto" : "smooth", block:"nearest"}); } catch(e){}
    });
    rbButtons.push(b);
    grid.appendChild(b);
  });
  stage1.appendChild(grid);
  /* step 2: build it. The order rides on top of the sandwich, because the ticket scrolls away. */
  var expect = orderItems(sub, o);
  /* the trap that matters is the topping the guest said no to; big orders skip the other decoys so it all fits one screen */
  var extraPool = (expect.length >= 10 ? [] : distractors(sub, 2)).filter(function(x){ return expect.indexOf(x) < 0; });
  if (o.no && extraPool.indexOf(o.no) < 0){ if (extraPool.length) extraPool[0] = o.no; else extraPool.push(o.no); }
  var mods = [];
  if (o.no) mods.push(h("span", {class:"no", text:"No " + o.no.toLowerCase()}));
  o.add.forEach(function(a){ mods.push(h("span", {class:"add", text:"Add " + a.toLowerCase()})); });
  stage2.appendChild(h("p", {class:"stepper", text:"Step 2 of 2. Build it"}));
  D.game = orderGame(stage2, {
    visual:true, ordered:true, pool:expect.concat(extraPool.filter(function(x){ return expect.indexOf(x) < 0; })), reserve:stackHeightFor(expect) + 26,
    head:plateHead(sub, sub.name, mods), layout:isCold ? null : hotLive(sub),
    hint:isCold ? "Tap everything in the order it goes on, lid last." : hotHint(sub),
    check:function(seq){ return isCold ? checkOrder(sub, o, seq) : checkHot(sub, seq); },
    feedback:function(fb, r){
      var ok = r.ok && readOk;
      fb.className = "fb " + (ok ? "ok" : "bad");
      if (ok) fb.appendChild(h("b", {text:"Order up. " + o.guest + " got exactly what they asked for."}));
      else {
        fb.appendChild(h("b", {text:r.ok ? "Good build, but the read-back was off." : "Not yet."}));
        issueList(fb, r.issues);
      }
      if (!r.ok){
        fb.appendChild(h("p", {class:"delta mt-s", text:isCold ? "This order, bottom to top:" : "The right build. The numbers are the order it's made in:"}));
        fb.appendChild(isCold ? drawStack(expect.map(function(k){ return {k:k}; }), {label:"The right build for this order"}) : stackSVG(sub, {brackets:true}));
      }
      if (isCold && sub.mw){
        var a = AMT[o.size];
        var said = {"Onions":"onions " + a.Onions, "Lettuce":"lettuce " + a.Lettuce, "Tomatoes":"tomatoes " + a.Tomatoes, "Red wine vinegar":"2 rows vinegar (" + a.juice + ")",
          "Olive oil blend":"3 rows oil (" + a.juice + ")", "Oregano":"2 rows oregano", "Salt":(sub.saltRows === 2 ? "2 rows" : "1 row") + " salt"};
        var amt = "For a " + o.size + ": " + MW.filter(function(x){ return x !== o.no; }).map(function(x){ return said[x]; }).join(", ") + ".";
        var tops = o.add.filter(function(x){ return TOP_EXTRAS.indexOf(x) >= 0; });
        if (tops.length) amt += " " + a.top + " " + tops[0].toLowerCase() + (o.no === "Tomatoes" ? " on top." : " on the tomatoes.");
        if ((sub.lid || []).indexOf("Bacon") >= 0) amt += " " + a.bacon + " of bacon on the lid.";
        fb.appendChild(h("p", {class:"amt-line", text:amt}));
      }
    },
    done:function(r){ tally(sub.id, r.ok && readOk); },
    next:{label:"Next guest", fn:nextQuestion}
  });
}

/* ---------- listen: hands-free, for the car ----------
   It says the number (or the name), leaves you a few seconds to answer out loud, then tells you. Nothing is graded. */
var LISTEN_KEY = "jm-listen-v1";
var LP = (function(){
  var d = {pace:5, nameFirst:false}, s = load(LISTEN_KEY, null);
  if (s){ if ([3, 5, 8].indexOf(s.pace) >= 0) d.pace = s.pace; d.nameFirst = !!s.nameFirst; }
  return d;
})();
var listenRun = null;
function stopListen(){ if (listenRun){ var r = listenRun; listenRun = null; r.stop(); } }
function renderListen(card){
  var ids = D.queue.slice(), i = 0, playing = false, timer = null, startedAt = 0, me = {};
  var face = h("div", {class:"listen-face"});
  var ans = h("p", {class:"listen-ans wait"});
  var barI = h("i", {});
  var note = h("p", {class:"listen-note", role:"status"});
  var playB = h("button", {class:"btn listen-play", text:"Play"});
  function sub(){ return byId(ids[i]); }
  function show(revealed){
    var s = sub();
    clear(face);
    if (!LP.nameFirst || revealed) face.appendChild(tagEl(s, "big"));
    if (LP.nameFirst || revealed) face.appendChild(h("p", {class:"name", text:s.name}));
    ans.className = "listen-ans" + (revealed ? "" : " wait");
    ans.textContent = revealed ? (s.type === "cold"
        ? coreItems(s).join(", ") + (s.mw ? ", then Mike's Way" : "") + (s.lid && s.lid.length ? ", " + s.lid.join(" and ").toLowerCase() + " on the lid" : "") + "."
        : hotParts(s).map(function(p){ return p.label + ": " + p.items.join(", ").toLowerCase() + "."; }).join(" "))
      : (playing ? "Say it out loud." : "Tap Play. Answer out loud before it tells you.");
  }
  function bar(ms){
    barI.style.transition = "none"; barI.style.width = "0%";
    if (!ms) return;
    void barI.offsetWidth;
    barI.style.transition = "width " + ms + "ms linear"; barI.style.width = "100%";
  }
  function talking(){ if (box) box.classList.add("speaking"); }
  function quiet(){ if (box) box.classList.remove("speaking"); }
  function fail(kind){
    pause();
    note.className = "listen-note warn";
    note.textContent = kind === "none" ? "This browser has no built-in voice, so Listen can't play here. Flashcards cover the same ground."
      : "No sound came out. Check the ringer switch and the volume, then tap Play.";
  }
  function ask(){
    if (!playing || listenRun !== me) return;
    var s = sub();
    show(false); bar(0);
    Voice.speak(speakable(LP.nameFirst ? s.name + "." : "Number " + s.n + "."), {
      onstart:talking,
      onend:function(){
        quiet();
        if (!playing || listenRun !== me) return;
        bar(LP.pace * 1000);
        timer = setTimeout(tell, LP.pace * 1000);
      }, onfail:fail});
  }
  function tell(){
    if (!playing || listenRun !== me) return;
    var s = sub();
    show(true); bar(0);
    Voice.speak(speakable((LP.nameFirst ? "Number " + s.n + ". " : s.name + ". ") + sayContents(s)), {
      onstart:talking,
      onend:function(){
        quiet();
        if (!playing || listenRun !== me) return;
        timer = setTimeout(function(){
          i++;
          if (i >= ids.length){ i = 0; ids = shuffle(ids); }
          if (Date.now() - startedAt > 30 * 60000){ pause(); note.className = "listen-note"; note.textContent = "Paused after thirty minutes. Tap Play to keep going."; show(false); return; }
          ask();
        }, 1300);
      }, onfail:fail});
  }
  function play(){
    if (saying){ Voice.stop(); sayReset(); }
    walkPause();
    listenRun = me; playing = true; startedAt = Date.now();
    playB.textContent = "Pause"; note.className = "listen-note"; note.textContent = "Keeps the screen on while it plays. Answer out loud.";
    Awake.on();
    ask();
  }
  function pause(){
    playing = false;
    clearTimeout(timer); timer = null;
    Voice.stop(); Awake.off(); bar(0); quiet();
    playB.textContent = "Play";
    if (listenRun === me) listenRun = null;
  }
  me.stop = function(){ pause(); };
  function jump(d){
    var was = playing;
    clearTimeout(timer); timer = null; Voice.stop(); quiet();
    i = (i + d + ids.length) % ids.length;
    if (was) ask(); else show(false);
  }
  playB.addEventListener("click", function(){ if (playing){ pause(); show(false); } else play(); });
  function seg(label, opts, cur, onPick){
    var box = h("div", {class:"seg tight", role:"group", "aria-label":label});
    opts.forEach(function(op){
      box.appendChild(h("button", {"aria-pressed":op.v === cur() ? "true" : "false", text:op.t, onclick:function(){
        onPick(op.v);
        each(box.children, function(b, k){ b.setAttribute("aria-pressed", opts[k].v === cur() ? "true" : "false"); });
      }}));
    });
    return h("div", {class:"ctl-row"}, [h("span", {class:"ctl-label", text:label}), box]);
  }
  function savePrefsL(){ store(LISTEN_KEY, LP); }
  var box = h("div", {class:"listen"}, [
    face, h("div", {class:"eq", "aria-hidden":"true"}, [h("i"), h("i"), h("i"), h("i"), h("i")]), ans, h("div", {class:"bar"}, barI),
    h("div", {class:"listen-ctl"}, [
      h("button", {class:"btn ghost", text:"Back", "aria-label":"Previous sub", onclick:function(){ jump(-1); }}),
      playB,
      h("button", {class:"btn ghost", text:"Skip", "aria-label":"Next sub", onclick:function(){ jump(1); }})
    ]),
    note,
    h("div", {class:"listen-set"}, [
      seg("It says", [{v:false, t:"The number"}, {v:true, t:"The name"}], function(){ return LP.nameFirst; }, function(v){ LP.nameFirst = v; savePrefsL(); if (!playing) show(false); }),
      seg("Time to answer", [{v:3, t:"3 seconds"}, {v:5, t:"5 seconds"}, {v:8, t:"8 seconds"}], function(){ return LP.pace; }, function(v){ LP.pace = v; savePrefsL(); }),
      seg("Voice", [{v:false, t:"Normal"}, {v:true, t:"Slower"}], function(){ return Voice.isSlow(); }, function(v){ Voice.setSlow(v); })
    ])
  ]);
  card.appendChild(box);
  show(false);
  if (!Voice.ok){ playB.disabled = true; fail("none"); }
}

/* ---------- the meter, weak spots, quizzes ---------- */
function renderReady(){
  var r = readiness();
  var pctEl = $("ready-pct"); if (!pctEl) return;
  pctEl.textContent = r.board.pct + "%";
  $("ready-bar").style.width = r.board.pct + "%";
  $("ready-once").style.width = r.board.oncePct + "%";
  $("ready-board").textContent = r.board.known + " of " + r.board.total + " locked in";
  $("ready-orient").textContent = r.orient.known + " of " + r.orient.total + " locked in";
  var lab = $("ready-orient-label"), lv = levelNow();
  if (lab) lab.textContent = lv ? "Training facts, " + LEVELS[lv - 1].title.toLowerCase() + " level" : "Training facts, every level";
  $("ready-orient-bar").style.width = r.orient.pct + "%";
  $("ready-orient-once").style.width = r.orient.oncePct + "%";
  var once = r.board.once + r.orient.once, parts = [];
  if (once) parts.push(once + " right once so far (the lighter part of the bar).");
  if (r.due) parts.push(r.due + " ready to review now.");
  if (r.fresh) parts.push(r.fresh + " you haven't met yet.");
  $("ready-line").textContent = "Locked in means you got it right on two different days. " + (r.seen ? parts.join(" ") : "Start a session to meet your first ones.") +
    (r.board.pct >= 70 ? " The board is in good shape; the rest is for the quizzes, not the counter." : "");
}
function renderWeak(){
  var list = $("weak-list");
  clear(list);
  var ids = weakIds();
  $("weak-drill").disabled = !ids.length;
  if (!ids.length){ list.appendChild(h("div", {class:"fine", text:"Nothing here yet. It fills in as you drill."})); return; }
  ids.forEach(function(k){
    var s = byId(k), st = stats[k];
    list.appendChild(h("div", {}, [tagEl(s), h("span", {text:s.name}), h("span", {class:"cnt", text:"missed " + st.miss + ", got " + st.hit})]));
  });
}
function renderQuizzes(){
  var list = $("quiz-list");
  if (!list) return;
  clear(list);
  /* the menu's own quiz first, then each level's quizzes under its name */
  var sets = [{title:"", banks:Object.keys(BANKS).filter(function(b){ return !bankLevel(b); })}];
  LEVELS.forEach(function(L){ sets.push({title:"Level " + L.n + ": " + L.title, banks:Object.keys(BANKS).filter(function(b){ return bankLevel(b) === L.n; })}); });
  sets.forEach(function(s){
    if (!s.banks.length) return;
    if (s.title) list.appendChild(h("h3", {class:"qz-h", text:s.title}));
    s.banks.forEach(function(b){
      var total = BANKS[b].length, known = BANKS[b].filter(function(q){ return locked("q:" + q.id); }).length;
      list.appendChild(h("div", {class:"qz"}, [
        h("div", {}, [h("b", {text:BANK_LABEL[b]}), h("span", {class:"qz-n", text:total + " questions, " + known + " locked in"})]),
        h("button", {class:"btn small", "data-bank":b, text:"Start"}),
        h("div", {class:"bar"}, h("i", {style:"width:" + Math.round(known / total * 100) + "%"}))
      ]));
    });
  });
}
function toQuestion(soft){
  var g = D.game, need = stuckBottom() + 10;
  if (g && g.el.getClientRects().length){
    g.fit();
    /* a build card is taller than most phones: put the sandwich right under the tabs so the chips and Check stay on screen with it */
    if (g.bottom() - qArea.getBoundingClientRect().top + need > window.innerHeight - 6){
      window.scrollBy(0, g.el.getBoundingClientRect().top - need);
      focusCard();
      return;
    }
    soft = false;
  }
  /* measured last and scrolled by a distance, not to a position: laying the new card out can itself move the page */
  var top = qArea.getBoundingClientRect().top;
  if (!(soft && top >= 60 && top < window.innerHeight * 0.4)) window.scrollBy(0, top - need);   /* already in view: don't yank the page */
  focusCard();
}
/* the old card, and the button that had the focus, are gone: put the focus on the new card so the keyboard and screen readers follow */
function focusCard(){
  var c = qArea.firstElementChild;
  if (!c) return;
  c.setAttribute("tabindex", "-1");
  try { c.focus({preventScroll:true}); } catch(e){}
}
/* one small line drawing per way to practice: cards, a number sign, layers, a stack going up, a guest talking, headphones */
var MODE_ICON = {
  flash:"M5 8h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2zM7 5h12a2 2 0 0 1 2 2v10",
  num:"M9.5 4 7.5 20M16.5 4l-2 16M4.5 9.5h16M3.5 14.5h16",
  what:"M12 3.5 3.5 8l8.5 4.5L20.5 8 12 3.5zM3.5 12l8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5",
  build:"M4 20h16M6 15.5h12M8 11h8M12 7.5V3M9.8 5.2 12 3l2.2 2.2",
  order:"M4 5h16v11H10l-4.5 4V16H4zM8 9h8M8 12.5h5",
  listen:"M4.5 14.5V12a7.5 7.5 0 0 1 15 0v2.5M4.5 14h2.7v6H6a1.5 1.5 0 0 1-1.5-1.5zM16.8 14h2.7v4.5A1.5 1.5 0 0 1 18 20h-1.2z"
};
function initControls(){
  var modeSeg = $("mode-seg");
  MODES.forEach(function(m){
    var ic = svgEl("svg", {class:"mode-ic", viewBox:"0 0 24 24", "aria-hidden":"true"});
    ic.appendChild(svgEl("path", {d:MODE_ICON[m.key] || ""}));
    modeSeg.appendChild(h("button", {class:"mode", "data-mode":m.key, "aria-pressed":"false", onclick:function(){ startRun(m.key, null); toQuestion(); }},
      [ic, h("b", {text:m.label}), h("span", {text:m.help})]));
  });
  var deckSeg = $("deck-seg");
  DECKS.forEach(function(d){
    if (d.hidden) return;
    deckSeg.appendChild(h("button", {"data-deck":d.key, "aria-pressed":"false", text:d.label, onclick:function(){ startRun(null, d.key); toQuestion(); }}));
  });
  $("weak-drill").addEventListener("click", function(){ startRun("flash", "weak"); toQuestion(); });
  $("today-btn").addEventListener("click", function(){ startRun(null, "today"); toQuestion(); });
  var resetBtn = $("reset-stats");
  var armed = false, timer = null;
  resetBtn.addEventListener("click", function(){
    if (!armed){
      armed = true; resetBtn.textContent = "Tap again to erase all progress";
      timer = setTimeout(function(){ armed = false; resetBtn.textContent = "Reset progress"; }, 4000);
      return;
    }
    clearTimeout(timer); armed = false; resetBtn.textContent = "Reset progress";
    stats = {}; saveStats(); sched = {}; saveSched();
    refreshProgress();
    if (D.active && D.deck === "weak" && !D.custom) startRun(null, "weak");
  });
  var prefs = load(PREF_KEY, null);
  if (prefs){
    if (modeObj(prefs.mode)) D.mode = prefs.mode;
    var pd = deckObj(prefs.deck);
    if (pd && !pd.hidden){ D.deck = prefs.deck; D.lastSubDeck = prefs.deck; }
  }
  syncControls();
}
