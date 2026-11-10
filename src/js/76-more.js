
/* ---------- Run the shift: the list on the Training tab, and the sheet a situation plays in ---------- */
var SHIFT_KEY = "jm-shift-v1";
var shiftDone = load(SHIFT_KEY, {}) || {};
function shiftById(id){ return SHIFTS.filter(function(s){ return s.id === id; })[0]; }
function renderShiftList(){
  var box = $("shift-list"); if (!box) return;
  clear(box);
  var done = 0;
  SHIFTS.forEach(function(s){
    var d = shiftDone[s.id], best = d ? d.best : -1;
    if (best === s.steps.length) done++;
    var b = h("button", {class:"srow" + (best === s.steps.length ? " done" : ""), "data-shift":s.id}, [
      h("b", {text:s.title}),
      h("span", {text:(s.lv === 3 ? "Manager. " : "") + (best < 0 ? "New" : best + " of " + s.steps.length + " right, best try")})
    ]);
    b.addEventListener("click", function(){ openSheet({type:"shift", id:s.id, step:0, score:0}); });
    box.appendChild(b);
  });
  var line = $("shift-count");
  if (line) line.textContent = done + " of " + SHIFTS.length + " handled with every call right.";
}
function fillShift(entry){
  var s = shiftById(entry.id), i = entry.step || 0;
  if (i >= s.steps.length){ fillShiftEnd(entry, s); return; }
  var st = s.steps[i], right = st.opts.filter(function(o){ return o.ok; })[0];
  sheetBody.appendChild(h("div", {class:"sheet-head"}, h("div", {}, [h("h2", {id:"sheet-title", text:s.title}), h("span", {class:"pill", text:"Run the shift, part " + (i + 1) + " of " + s.steps.length})])));
  sheetBody.appendChild(h("p", {class:"shift-say", text:st.say}));
  sheetBody.appendChild(h("p", {class:"shift-q"}, h("b", {text:st.q})));
  var sb = sayButton(function(){ return shiftSay(st); }, "Read it to me");
  if (sb) sheetBody.appendChild(h("div", {class:"row"}, sb));
  var grid = h("div", {class:"opts single"}), fb = h("div", {class:"fb", hidden:true, "aria-live":"polite"}), next = h("div", {class:"row", hidden:true});
  st.opts.forEach(function(o){
    var b = h("button", {class:"opt"}, [h("span", {text:o.t})]);
    b.addEventListener("click", function(){
      if (saying){ Voice.stop(); sayReset(); }
      each(grid.children, function(x){ x.disabled = true; });
      each(grid.children, function(x, k){ if (st.opts[k].ok) x.classList.add("ok"); });
      if (!o.ok) b.classList.add("bad"); else entry.score = (entry.score || 0) + 1;
      clear(fb);
      fb.className = "fb " + (o.ok ? "ok" : "bad");
      fb.appendChild(h("b", {text:o.ok ? "That's the call." : "Not that one."}));
      fb.appendChild(h("p", {text:o.why}));
      if (!o.ok) fb.appendChild(h("p", {}, [h("b", {text:"The training's answer: " + right.t + "."}), document.createTextNode(" " + right.why)]));
      var wb = sayButton(function(){ return shiftWhy(st); }, "Read the answer to me");
      var row = h("div", {class:"row"}, [wb, h("button", {class:"btn ghost small", text:"Open the card this comes from", onclick:function(){
        var card = $(s.card); closeSheet();
        if (card){ showView("orient"); revealFor(card); card.open = true; try { card.scrollIntoView({block:"start"}); } catch(e){ card.scrollIntoView(); } }
      }})]);
      fb.appendChild(row);
      fb.hidden = false; next.hidden = false;
      try { next.firstChild.focus({preventScroll:true}); } catch(e){}
    });
    grid.appendChild(b);
  });
  next.appendChild(h("button", {class:"btn", text:i + 1 < s.steps.length ? "Then this happens" : "See how it went", onclick:function(){ entry.step = i + 1; openSheet(entry, false); }}));
  sheetBody.appendChild(grid); sheetBody.appendChild(fb); sheetBody.appendChild(next);
}
function fillShiftEnd(entry, s){
  var got = entry.score || 0, was = shiftDone[s.id];
  shiftDone[s.id] = {best:Math.max(got, was ? was.best : 0), n:(was ? was.n : 0) + 1};
  store(SHIFT_KEY, shiftDone); renderShiftList(); renderReady();
  sheetBody.appendChild(h("div", {class:"sheet-head"}, h("div", {}, [h("h2", {id:"sheet-title", text:s.title}), h("span", {class:"pill", text:"Run the shift"})])));
  sheetBody.appendChild(h("p", {class:"shift-say", text:got === s.steps.length ? "Both calls right. That is how the training runs it." : got + " of " + s.steps.length + " calls right. Run it again in a day or two; the point is the reason, not the score."}));
  var left = SHIFTS.filter(function(x){ return x.id !== s.id && !(shiftDone[x.id] && shiftDone[x.id].best === x.steps.length); })[0];
  sheetBody.appendChild(h("div", {class:"row"}, [
    left ? h("button", {class:"btn", text:"Next: " + left.title, onclick:function(){ openSheet({type:"shift", id:left.id, step:0, score:0}, false); }}) : null,
    h("button", {class:"btn ghost", text:"Run this one again", onclick:function(){ openSheet({type:"shift", id:s.id, step:0, score:0}, false); }}),
    h("button", {class:"btn ghost", text:"Done", onclick:closeSheet})
  ]));
}

/* ---------- the short Training landing: after the first visit the three level cards fold into one line ---------- */
function nextCard(){
  var lv = curLevel === "all" ? null : curLevel, out = null;
  each(document.querySelectorAll("#view-orient > details.mod"), function(d){
    if (out || (lv && d.getAttribute("data-lv") !== lv)) return;
    var m = modById(d.getAttribute("data-mod")); if (!m) return;
    var p = modProgress(m); if (p.known < p.total) out = d;
  });
  return out;
}
function renderPathMini(){
  var line = $("path-mini-line"); if (!line) return;
  var L = curLevel === "all" ? null : LEVELS[(+curLevel || 1) - 1], nx = nextCard(), go = $("path-continue");
  var mods = L ? levelMods(L.n) : [], done = mods.filter(function(m){ var p = modProgress(m); return p.known === p.total; }).length;
  line.textContent = (L ? "Your path: level " + L.n + ", " + L.title + ". " + done + " of " + mods.length + " cards locked in." : "Showing every level.") +
    (nx ? " Next up: " + nx.querySelector("summary h2").textContent.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "") + "." : " Every card here is locked in.");
  if (go) go.hidden = !nx;
}
function initPathMini(){
  var card = $("path-card"), full = $("path-full"), mini = $("path-mini");
  if (!card || !full || !mini) return;
  function fold(on){ full.hidden = on; mini.hidden = !on; if (on) renderPathMini(); }
  $("path-change").addEventListener("click", function(){ fold(false); try { $("path").querySelector(".lv").focus({preventScroll:true}); } catch(e){} });
  $("path-continue").addEventListener("click", function(){
    var d = nextCard(); if (!d) return;
    d.open = true;
    try { d.scrollIntoView({behavior:reducedMotion ? "auto" : "smooth", block:"start"}); } catch(e){ d.scrollIntoView(); }
  });
  fold(loadRaw(LEVEL_KEY) !== null);   /* someone who has picked a level before doesn't need to pick it again */
}

/* ---------- your store's way: a note on any card, kept on this device ---------- */
var NOTES_KEY = "jm-notes-v1";
var notes = load(NOTES_KEY, {}) || {};
/* cards whose times and amounts are the training's examples; a store sets its own */
var STORE_SETS = {dayclock:1, primeprep:1, coverage:1, forecast:1, schedtips:1, open2:1, midday:1, reset:1, chart:1, proof:1, bake:1, thaw:1, ordgoal:1, laborpct:1, goal:1};
function initNotes(){
  each(document.querySelectorAll("#view-orient > details.mod"), function(d){
    var id = d.getAttribute("data-mod"), sum = d.querySelector("summary");
    var pill = h("span", {class:"pill note-pill needs-js", text:"Your note", hidden:true});
    var ta = h("textarea", {class:"note-ta", rows:"2", "aria-label":"Your note on this card", placeholder:"Does your store do this differently? Write it here."});
    ta.value = notes[id] || "";
    function mark(){ pill.hidden = !ta.value.replace(/\s+/g, ""); }
    ta.addEventListener("input", function(){
      if (ta.value.replace(/\s+/g, "")) notes[id] = ta.value.slice(0, 600); else delete notes[id];
      store(NOTES_KEY, notes); mark();
    });
    var box = h("div", {class:"mynote needs-js"}, [
      h("b", {text:"Your store's way"}),
      STORE_SETS[id] ? h("span", {class:"fine", text:"The times and amounts on this card are the training's examples. Your store sets its own, so ask your trainer and note what they say."}) : null,
      ta,
      h("span", {class:"fine", text:"Stays on this device. The voice doesn't read it."})
    ]);
    if (sum) sum.appendChild(pill);
    d.appendChild(box); mark();
  });
}

/* ---------- back up and restore: everything the page remembers, as one code you can keep anywhere ---------- */
function backupCode(){
  var all = {};
  try { for (var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if (k && k.indexOf("jm-") === 0) all[k] = localStorage.getItem(k); } } catch(e){}
  return "MD1." + btoa(unescape(encodeURIComponent(JSON.stringify(all))));
}
function readBackup(code){
  try {
    var m = String(code).replace(/\s+/g, "").match(/^MD1\.([A-Za-z0-9+\/=]+)$/); if (!m) return null;
    var all = JSON.parse(decodeURIComponent(escape(atob(m[1])))), n = 0;
    if (!all || typeof all !== "object") return null;
    for (var k in all){ if (k.indexOf("jm-") !== 0 || typeof all[k] !== "string") return null; n++; }
    return n ? all : null;
  } catch(e){ return null; }
}
function fillBackup(){
  sheetBody.appendChild(h("div", {class:"sheet-head"}, h("div", {}, [h("h2", {id:"sheet-title", text:"Back up your progress"}), h("span", {class:"pill", text:"This device"})])));
  sheetBody.appendChild(h("p", {text:"Everything this page remembers lives in this browser: what you've locked in, your ticks, your notes and your settings. Clearing the browser or changing phones loses it. This code is all of it. Copy it and keep it somewhere, like a note or a text to yourself."}));
  var out = h("textarea", {class:"note-ta code", rows:"4", readonly:"", "aria-label":"Your backup code"}); out.value = backupCode();
  var said = h("p", {class:"fine", "aria-live":"polite"});
  sheetBody.appendChild(out);
  sheetBody.appendChild(h("div", {class:"row"}, h("button", {class:"btn", text:"Copy the code", onclick:function(){
    function pick(){ try { out.focus(); out.select(); out.setSelectionRange(0, out.value.length); } catch(e){} said.textContent = "Selected. Now use Copy from your phone's menu."; }
    try { navigator.clipboard.writeText(out.value).then(function(){ said.textContent = "Copied. Paste it somewhere safe."; }, pick); } catch(e){ pick(); }
  }})));
  sheetBody.appendChild(said);
  sheetBody.appendChild(h("h3", {text:"Bring a backup back"}));
  var inp = h("textarea", {class:"note-ta code", rows:"3", "aria-label":"Paste a backup code", placeholder:"Paste a code that starts with MD1."});
  var msg = h("p", {class:"fine", "aria-live":"polite"}), sure = h("div", {class:"row", hidden:true});
  var found = null;
  sheetBody.appendChild(inp);
  sheetBody.appendChild(h("div", {class:"row"}, h("button", {class:"btn ghost", text:"Check this code", onclick:function(){
    found = readBackup(inp.value);
    sure.hidden = !found;
    msg.textContent = found ? "This code is good. Restoring replaces what this device remembers now. That can't be undone." : "That isn't a backup code from this page. A real one starts with MD1. Check that you copied all of it.";
  }})));
  sheetBody.appendChild(msg);
  sure.appendChild(h("button", {class:"btn", text:"Replace my progress with it", onclick:function(){
    if (!found) return;
    try {
      var old = []; for (var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if (k && k.indexOf("jm-") === 0) old.push(k); }
      old.forEach(function(k){ localStorage.removeItem(k); });
      for (var key in found) localStorage.setItem(key, found[key]);
      location.reload();
    } catch(e){ msg.textContent = "This browser wouldn't save it. Private windows often can't."; }
  }}));
  sure.appendChild(h("button", {class:"btn ghost", text:"Cancel", onclick:function(){ sure.hidden = true; found = null; msg.textContent = ""; }}));
  sheetBody.appendChild(sure);
}

/* ---------- hands-on is not the same as knowing: the ticks get their own line, said for what they are ---------- */
function handsLine(){
  var total = 0, got = 0;
  each(document.querySelectorAll("ul.ticks[data-check]"), function(ul){ total += ul.children.length; got += (ticks[ul.getAttribute("data-check")] || []).length; });
  var runs = SHIFTS.filter(function(s){ return shiftDone[s.id] && shiftDone[s.id].best === s.steps.length; }).length;
  return "Hands-on lists: " + got + " of " + total + " steps ticked. A tick is your own note that you did it, not a trainer signing off. Run the shift: " + runs + " of " + SHIFTS.length + " handled.";
}
function drawHands(){ var e = $("ready-hands"); if (e) e.textContent = handsLine(); }
function initMore(){
  renderShiftList(); initPathMini(); initNotes();
  var b = $("backup-open"); if (b) b.addEventListener("click", function(){ openSheet({type:"backup"}); });
}
