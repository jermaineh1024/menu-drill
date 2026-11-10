
/* ---------- tabs ---------- */
var VIEWS = ["study","line","drill","orient"];
var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".tab"));
var shownView = null;
function showView(v){
  if (VIEWS.indexOf(v) < 0) v = "study";
  if (shownView === "drill" && v !== "drill") stopListen();
  VIEWS.forEach(function(x){
    var el = $("view-" + x);
    el.hidden = (x !== v);
    el.classList.toggle("enter", x === v && shownView !== null && shownView !== v);
  });
  tabButtons.forEach(function(b){
    var on = b.getAttribute("data-view") === v;
    b.setAttribute("aria-selected", on ? "true" : "false");
    b.setAttribute("tabindex", on ? "0" : "-1");
  });
  shownView = v;
  hushIfHidden();   /* a card being read out loud stops when you leave its tab */
}
function currentHashView(){ return (location.hash || "#study").slice(1); }
function go(v){
  if (currentHashView() !== v){ location.hash = v; }
  showView(v);
  window.scrollTo(0, 0);
}
tabButtons.forEach(function(b, i){
  b.addEventListener("click", function(){ go(b.getAttribute("data-view")); });
  b.addEventListener("keydown", function(e){
    var k = e.key, n = tabButtons.length, to = -1;
    if (k === "ArrowRight") to = (i + 1) % n; else if (k === "ArrowLeft") to = (i - 1 + n) % n;
    else if (k === "Home") to = 0; else if (k === "End") to = n - 1;
    if (to < 0) return;
    e.preventDefault();
    go(tabButtons[to].getAttribute("data-view"));
    tabButtons[to].focus();
  });
});
window.addEventListener("hashchange", function(){
  if (!sheet.hidden) closeSheet();   /* the browser's Back button with a sheet open closes the sheet along with the move */
  if (currentHashView() !== shownView) showView(currentHashView());
});

/* ---------- study ---------- */
function renderStudy(){
  var cold = $("cold-families");
  COLD_FAMS.forEach(function(f){
    var rows = h("div", {class:"rows"});
    f.ids.forEach(function(id){ rows.appendChild(subRow(byId(id), true, true)); });
    cold.appendChild(h("div", {class:"card"}, [h("h3", {text:f.title}), h("p", {class:"mastery", "data-ids":f.ids.join(",")}), h("p", {class:"fine", text:f.note}), rows]));
  });
  var hot = $("hot-families");
  HOT_FAMS.forEach(function(f){
    var famIds = [];
    f.groups.forEach(function(g){ g.ids.forEach(function(id){ if (!byId(id).lto) famIds.push(id); }); });
    var card = h("div", {class:"card"}, [h("h3", {text:f.title}), famIds.length ? h("p", {class:"mastery", "data-ids":famIds.join(",")}) : null, h("p", {class:"fine", text:f.note})]);
    f.groups.forEach(function(g){
      if (g.label){
        card.appendChild(h("div", {class:"group-label"}, [h("b", {text:g.label}), h("span", {text:g.delta})]));
      }
      var rows = h("div", {class:"rows"});
      g.ids.forEach(function(id){ rows.appendChild(subRow(byId(id), !!g.showDelta || !g.label, true)); });
      card.appendChild(rows);
    });
    hot.appendChild(card);
  });
  var glance = $("glance");
  SUBS.filter(function(s){ return !s.offBoard; }).forEach(function(s){
    glance.appendChild(h("div", {"data-sub":String(s.id), role:"button", tabindex:"0", "aria-label":s.name + ". Open details."}, [tagEl(s), h("span", {text:s.name})]));
  });
}
function renderLegend(){
  var box = $("legend");
  LEGEND_ORDER.forEach(function(k){
    box.appendChild(h("div", {"data-ing":k, role:"button", tabindex:"0", "aria-label":k + ". What it is, and every sub with it."}, [swatch(k), h("b", {text:k})]));
  });
  $("example-stack").appendChild(stackSVG(byId(13), {brackets:true}));
}
function renderMastery(){
  each(document.querySelectorAll(".mastery[data-ids]"), function(el){
    var ids = el.getAttribute("data-ids").split(",");
    var got = ids.filter(function(id){ return locked(id); }).length;
    var once = ids.filter(function(id){ var e = sched[id]; return !!e && e.iv === 1; }).length;
    clear(el);
    if (!got && !once){ el.textContent = "Not drilled yet. Tap any sub below for details."; return; }
    if (got){
      el.appendChild(h("b", {text:got + " of " + ids.length + " locked in."}));
      el.appendChild(document.createTextNode(got === ids.length ? " You've got this family." : (once ? " " + once + " more right once so far." : "")));
    } else {
      el.appendChild(document.createTextNode(once + " of " + ids.length + " right once so far. They lock in when you get them again on another day."));
    }
  });
}
var PICS_KEY = "jm-pics";
function initPics(){
  var t = $("pics-toggle");
  var on = loadRaw(PICS_KEY) !== "off";
  t.checked = on;
  document.body.classList.toggle("nopics", !on);
  t.addEventListener("change", function(){
    document.body.classList.toggle("nopics", !t.checked);
    store(PICS_KEY, t.checked ? "on" : "off");
  });
}
/* the card at the top of Study: a first-day welcome, or what's due once you've started */
var SESSION_KEY = "jm-session-day";
function todayStamp(){ var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
function sessionLabel(){ return loadRaw(SESSION_KEY) === todayStamp() ? "Start another session" : "Start today's session"; }
function renderToday(){
  var r = readiness(), title = $("st-title");
  each(document.querySelectorAll("[data-today], #today-btn"), function(b){ b.textContent = sessionLabel(); });
  if (!title) return;
  var ring = $("st-ring");
  if (!r.seen){
    title.textContent = "Ten minutes a day";
    $("st-line").textContent = "One routine: tap the button, answer what comes up, done. New things get shown to you before you're asked, and anything you miss comes back.";
    ring.hidden = true;
    return;
  }
  title.textContent = r.due ? r.due + " to review today" : (r.fresh ? "Ready for the next ones" : "Nothing due right now");
  $("st-line").textContent = "Subs and sprinkling: " + r.board.known + " of " + r.board.total + " locked in" + (r.board.once ? ", " + r.board.once + " more right once" : "") + ". " +
    (r.due ? "A session brings those back first, then adds a few new ones." : (r.fresh ? "Nothing to review yet. A session adds the next few new ones." : "Come back tomorrow, or practice anything on the Drill tab."));
  ring.hidden = false;
  $("st-pct").textContent = r.board.pct + "%";
  $("st-arc").style.strokeDashoffset = String(169.65 * (1 - r.board.pct / 100));
}

/* ---------- orientation modules ---------- */
function modProgress(m){
  var keys = m.q.map(function(id){ return "q:" + id; });
  if (m.seq) keys.push("seq:" + m.seq);
  return {total:keys.length, known:keys.filter(locked).length, seen:keys.filter(function(k){ return !!sched[k]; }).length};
}
function modQueue(m){
  if (!m.seq) return m.q.slice();
  return m.q.map(function(id){ return {kind:"q", bank:m.bank, id:id}; }).concat([{kind:"seq", id:m.seq}]);
}
function renderMods(){
  MODS.forEach(function(m){
    var el = $("o-" + m.id);
    if (!el) return;
    var p = modProgress(m), pill = el.querySelector(".mod-p");
    if (pill){
      pill.className = "mod-p" + (p.known === p.total ? " done" : "");
      pill.textContent = p.known === p.total ? "Locked in" : (p.seen ? p.known + " of " + p.total : p.total + " to quiz");
    }
    var btn = el.querySelector("[data-quiz]");
    if (!btn){
      btn = h("button", {class:"btn ghost", "data-quiz":m.id});
      el.appendChild(h("div", {class:"row"}, btn));
    }
    btn.textContent = "Quiz me on this (" + p.total + ")";
  });
}
function modById(id){ for (var i = 0; i < MODS.length; i++){ if (MODS[i].id === id) return MODS[i]; } return null; }
/* the Training tab: each station's quiz button says how many questions it holds, and the hot sub pictures are drawn into their module */
function initTraining(){
  each(document.querySelectorAll(".grp-row [data-bank]"), function(b){
    b.textContent = b.getAttribute("data-label") + " (" + BANKS[b.getAttribute("data-bank")].length + ")";
  });
  each(document.querySelectorAll("[data-subpics]"), function(box){
    box.getAttribute("data-subpics").split(",").forEach(function(id){
      var sub = byId(id);
      if (!sub) return;
      box.appendChild(h("div", {class:"sub-card"}, [h("div", {class:"sub-head"}, [tagEl(sub), h("p", {class:"name", text:sub.name})]), stackSVG(sub, {brackets:true})]));
    });
  });
}

/* ---------- how-to pictures: tap one to open it full size; they move only while they're on screen ---------- */
var MOTION_KEY = "jm-motion";
function initHowto(){
  var motion = $("motion-toggle");
  var on = loadRaw(MOTION_KEY) !== "off";
  if (motion){
    motion.checked = on;
    motion.addEventListener("change", function(){
      document.body.classList.toggle("nomotion", !motion.checked);
      store(MOTION_KEY, motion.checked ? "on" : "off");
    });
  }
  document.body.classList.toggle("nomotion", !on);
  each(document.querySelectorAll("ol.howto"), function(ol){
    ol.setAttribute("data-live", "");
    each(ol.children, function(li, i){
      var fig = li.querySelector("figure"), b = li.querySelector(".ht b");
      fig.setAttribute("role", "button"); fig.setAttribute("tabindex", "0");
      fig.setAttribute("data-step", String(i));
      fig.setAttribute("aria-label", "Open this step full size: " + (b ? b.textContent : ""));
    });
  });
  var pics = document.querySelectorAll("ol.howto .howto-pic");
  if (!("IntersectionObserver" in window)){ each(pics, function(p){ p.classList.add("play"); }); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ en.target.classList.toggle("play", en.isIntersecting && en.intersectionRatio >= 0.35); });
  }, {threshold:[0, 0.35, 0.7]});
  each(pics, function(p){ io.observe(p); });
}

/* ---------- one place that listens for taps on things drawn from data ---------- */
document.addEventListener("click", function(e){
  var t = e.target;
  if (!t || !t.closest) return;
  if (t.closest("[data-close]")){ closeSheet(); return; }
  var ing = t.closest("[data-ing]");
  if (ing){ openSheet({type:"ing", name:ing.getAttribute("data-ing")}); return; }
  var s = t.closest("[data-sub]");
  if (s){ openSheet({type:"sub", id:s.getAttribute("data-sub")}); return; }
  var bank = t.closest("[data-bank]");
  if (bank){ go("drill"); startRun(null, bank.getAttribute("data-bank")); toQuestion(); return; }
  var quiz = t.closest("[data-quiz]");
  if (quiz){
    var m = modById(quiz.getAttribute("data-quiz"));
    if (m){ var title = $("o-" + m.id).querySelector("summary h2").textContent; go("drill"); startRun(null, m.bank, modQueue(m), title); toQuestion(); }
    return;
  }
  if (t.closest("[data-today]")){ go("drill"); startRun(null, "today"); toQuestion(); return; }
  if (t.closest("[data-voice-open]")){ openSheet({type:"voice"}); return; }
  var w = t.closest("[data-walk]");
  if (w){ openSheet({type:"walk", key:w.getAttribute("data-walk"), i:0}); return; }
  var fig = t.closest("ol.howto[data-live] figure");
  if (fig){ openSheet({type:"walk", key:fig.closest("ol.howto").getAttribute("data-howto"), i:+fig.getAttribute("data-step") || 0}); return; }
  var j = t.closest("[data-jump]");
  if (j){
    e.preventDefault();
    var el = $(j.getAttribute("data-jump"));
    if (el){
      revealFor(el);   /* the target may sit in a level that isn't on screen */
      if (el.tagName === "DETAILS") el.open = true;
      try { el.scrollIntoView({behavior:reducedMotion ? "auto" : "smooth", block:"start"}); } catch(err){ el.scrollIntoView(); }
    }
  }
});
document.addEventListener("keydown", function(e){
  if (e.key === "Escape" && !sheet.hidden){ closeSheet(); return; }
  if ((e.key === "Enter" || e.key === " ") && e.target && e.target.matches && e.target.matches("[role=button][data-sub],[role=button][data-ing],figure[role=button]")){
    e.preventDefault();
    e.target.dispatchEvent(new MouseEvent("click", {bubbles:true, cancelable:true}));   /* works for drawn (SVG) targets too, which have no click() */
  }
});
