
/* ---------- helpers ---------- */
function h(tag, attrs, kids){
  var e = document.createElement(tag);
  if (tag === "button" && !(attrs && attrs.type)) e.type = "button";
  if (attrs){
    for (var k in attrs){
      if (!Object.prototype.hasOwnProperty.call(attrs,k) || attrs[k] === null || attrs[k] === undefined) continue;
      if (k === "class") e.className = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), attrs[k]);
      else if (k === "hidden") e.hidden = !!attrs[k];
      else if (k === "disabled") e.disabled = !!attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
  }
  if (kids !== undefined && kids !== null){
    var arr = Array.isArray(kids) ? kids : [kids];
    for (var i=0;i<arr.length;i++){
      var c = arr[i];
      if (c === null || c === undefined || c === false) continue;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
  }
  return e;
}
function $(id){ return document.getElementById(id); }
function each(list, fn){ Array.prototype.forEach.call(list, fn); }
function clear(el){ while (el.firstChild) el.removeChild(el.firstChild); }
function byId(id){
  for (var i=0;i<SUBS.length;i++){ if (String(SUBS[i].id) === String(id)) return SUBS[i]; }
  return null;
}
function shuffle(a){
  a = a.slice();
  for (var i=a.length-1;i>0;i--){ var j = Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}
function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
function store(key, val){ try { localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val)); } catch(e){} }
function load(key, fallback){ try { var s = localStorage.getItem(key); return s === null ? fallback : JSON.parse(s); } catch(e){ return fallback; } }
function loadRaw(key){ try { return localStorage.getItem(key); } catch(e){ return null; } }
var reducedMotion = (function(){ try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch(e){ return false; } })();
function buzz(ok){ try { if (navigator.vibrate) navigator.vibrate(ok ? 12 : [18, 40, 18]); } catch(e){} }

/* ---------- a sub, in words ---------- */
/* "the Club Sub", but never "the The Super Sub" */
function theName(sub){ return /^the /i.test(sub.name) ? sub.name : "the " + sub.name; }
function tagEl(sub, extra){
  return h("span", {class:"tag" + (sub.lto ? " lto" : "") + (extra ? " " + extra : ""), text:String(sub.n), "aria-label": sub.lto ? "limited time" : "number " + sub.n});
}
function coreItems(sub){
  if (sub.type === "cold") return sub.cheese.concat(sub.meats, sub.fixed);
  return hotOrder(sub);
}
/* a hot sub in words, the way it is made: what goes on the lid first, what cooks, the cheese, what finishes it */
function hotParts(sub){
  var parts = [];
  if (sub.lid.length) parts.push({label:"On the lid first", items:sub.lid});
  parts.push({label:"On the grill", items:sub.grill.concat(sub.protein ? [sub.protein] : [])});
  if (sub.sauce.length) parts.push({label:"On the cooked " + (sub.protein || "meat").toLowerCase(), items:sub.sauce});
  parts.push({label:"Cheese on top", items:sub.cheese});
  if (sub.finish.length) parts.push({label:sub.finishLabel === "After" ? "After the grill" : "To finish", items:sub.finish});
  return parts;
}
function itemsOf(sub){
  if (sub.type === "cold") return coreItems(sub).concat(sub.mw ? MW : [], sub.lid || []);
  return coreItems(sub);
}
function step(text, cls, first){
  /* the arrow travels with the item it points to, so a wrapped line never ends in a dangling arrow */
  var s = h("span", {class:"step"});
  if (!first) s.appendChild(h("span", {class:"arrow", "aria-hidden":"true", text:"→"}));
  s.appendChild(h("span", {class:cls || null, text:text}));
  return s;
}
function buildLine(sub, noMW){
  var wrap = h("div", {class:"build"});
  if (sub.type !== "cold"){
    /* the lid is one step: it is dressed before anything goes on the grill */
    var hs = (sub.lid.length ? [sub.lid.join(", ") + " on the lid first"] : []).concat(hotOrder(sub).slice(sub.lid.length));
    hs.forEach(function(t, k){ wrap.appendChild(step(t, null, k === 0)); });
    return wrap;
  }
  var items = coreItems(sub);
  for (var i=0;i<items.length;i++){ wrap.appendChild(step(items[i], null, i === 0)); }
  if (sub.type === "cold" && sub.mw && !noMW){ wrap.appendChild(step("Mike's Way", "mwb", items.length === 0)); }
  if (sub.lid && sub.lid.length){ wrap.appendChild(step(sub.lid.join(" and ") + " on the lid", null, false)); }
  return wrap;
}
function fullOrderLine(items){
  var wrap = h("div", {class:"build"});
  for (var i=0;i<items.length;i++){ wrap.appendChild(step(items[i], null, i === 0)); }
  return wrap;
}
function breakdown(sub){
  if (sub.type === "cold"){
    if (!sub.mw) return h("p", {class:"delta", text:"Not a Mike's Way sub unless the guest asks for it."});
    return h("p", {class:"delta", text:"Mike's Way after the meat: " + MW.join(", ").toLowerCase() + "."});
  }
  return h("p", {class:"delta", text:hotParts(sub).map(function(p){ return p.label + ": " + p.items.join(", ").toLowerCase().replace("white american", "White American").replace("frank's redhot", "Frank's RedHot") + "."; }).join(" ")});
}
function subRow(sub, showDelta, withStack){
  var head = h("div", {class:"head"}, [h("p", {class:"name", text:sub.name})]);
  var txt = h("div", {class:"txt"}, [buildLine(sub, false)]);
  if (showDelta && sub.delta) txt.appendChild(h("p", {class:"delta", text:sub.delta}));
  var kids = [tagEl(sub), head];
  if (withStack) kids.push(stackSVG(sub, {compact:true}));
  kids.push(txt, h("span", {class:"chev", "aria-hidden":"true", text:"›"}));
  return h("div", {class:"row-sub" + (withStack ? " has-pic" : ""), "data-sub":String(sub.id), role:"button", tabindex:"0",
    "aria-label":(sub.lto ? "" : "Number " + sub.n + ", ") + sub.name + ". Open details."}, kids);
}
/* the full card: number, name, picture, then the words. Used when a sub is shown as an answer. */
function subCard(sub, build){
  var card = h("div", {class:"sub-card"}, [
    h("div", {class:"sub-head"}, [tagEl(sub), h("p", {class:"name", text:sub.name})]),
    stackSVG(sub, {brackets:true, build:build}),
    breakdown(sub)
  ]);
  if (sub.delta) card.appendChild(h("p", {class:"delta", text:sub.delta}));
  return card;
}

/* ---------- amounts ---------- */
function hotAmountFor(item, size, sub){
  if (HOT_AMT_IDS.indexOf(sub.id) < 0) return "";
  if (item === "Mayo" && sub.lid.indexOf("Mayo") >= 0) return "spread evenly";
  return HOT_AMT[size === "giant" ? "giant" : "regular"][item] || HOT_ANY[item] || "";
}
function amountFor(item, size, sub){
  if (sub && sub.type === "hot") return hotAmountFor(item, size, sub);
  var a = AMT[size];
  if (a[item]) return a[item];
  if (item === "Red wine vinegar") return "2 rows (" + a.juice + ")";
  if (item === "Olive oil blend") return "3 rows (" + a.juice + ")";
  if (item === "Oregano") return "2 rows";
  if (item === "Salt") return sub && sub.saltRows === 2 ? "2 rows on the #6" : "1 row";
  if (TOP_EXTRAS.indexOf(item) >= 0) return a.top;
  if (item === "Bacon") return a.bacon;
  if (item === "Mustard") return "3 lines";
  if (item === "Mayo" || item === "Cherry pepper relish") return "spread";
  return "";
}
var SIZE_KEY = "jm-size";
var curSize = (function(){ var s = loadRaw(SIZE_KEY); return SIZES.indexOf(s) >= 0 ? s : "regular"; })();

/* ---------- what you've gotten right and wrong ---------- */
var STATS_KEY = "jm-drill-stats-v1";
var PREF_KEY = "jm-drill-prefs-v1";
var stats = load(STATS_KEY, {}) || {};
function saveStats(){ store(STATS_KEY, stats); }
function knows(id){ var s = stats[String(id)]; return !!s && s.hit > 0 && s.hit > s.miss; }
function mark(id, ok){
  var k = String(id);
  var s = stats[k] || (stats[k] = {hit:0, miss:0});
  if (ok) s.hit++; else s.miss++;
  saveStats();
}
function weakIds(){
  return Object.keys(stats).filter(function(k){
    var s = stats[k]; return s.miss > 0 && s.miss >= s.hit && byId(k) && !byId(k).lto && !byId(k).offBoard;
  }).sort(function(a,b){ return stats[b].miss - stats[a].miss; });
}

/* ---------- spacing: what comes back, and when ---------- */
var SCHED_KEY = "jm-sched-v1";
var sched = load(SCHED_KEY, {}) || {};
function saveSched(){ store(SCHED_KEY, sched); }
var DAY = 86400000;
/* Right once puts it on tomorrow's list. Right again on or after the day it is due moves it further out (2 days, 5, 12 ...),
   and from 2 on it counts as locked in. Right again before it is due changes nothing, so drilling one deck twice in a row
   cannot lock it: "right on two different days" is literally what it takes. A miss starts it over, back in ten minutes. */
function dueOn(days){ var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + days); return d.getTime(); }
function schedUpdate(id, ok){
  var k = String(id), now = Date.now(), e = sched[k] || (sched[k] = {iv:0, due:0, n:0});
  e.n++;
  if (!ok){ e.iv = 0; e.due = now + 10 * 60000; }
  else if (e.iv === 0){ e.iv = 1; e.due = dueOn(1); }
  else if (now >= e.due){ e.iv = Math.min(60, Math.round(e.iv * 2.3)); e.due = dueOn(e.iv); }
  saveSched();
}
function locked(key){ var e = sched[key]; return !!e && e.iv >= 2; }
function bankQ(bankKey, id){
  var b = BANKS[bankKey] || [];
  for (var i=0;i<b.length;i++){ if (b[i].id === id) return b[i]; }
  return null;
}
function universe(){
  var u = numbered.map(function(s){ return {kind:"sub", id:s.id, key:String(s.id), board:true}; });
  Object.keys(SEQS).forEach(function(k){ u.push({kind:"seq", id:k, key:"seq:" + k, board:SEQS[k].board}); });
  Object.keys(BANKS).forEach(function(b){ BANKS[b].forEach(function(q){ u.push({kind:"q", bank:b, id:q.id, key:"q:" + q.id, board:b === "amounts"}); }); });
  return u;
}
/* Levels. Every training question and order game belongs to the level of its station; the board and the sprinkling amounts
   belong to none, so they count at every level. The level picked on the Training tab decides which new facts a daily
   session brings in and what the readiness bar counts. Anything already met still comes back for review, whatever its level. */
function bankLevel(b){ for (var i = 0; i < GROUPS.length; i++){ if (GROUPS[i].bank === b) return GROUPS[i].level || 1; } return 0; }
function itemLevel(it){
  if (it.kind === "q") return bankLevel(it.bank);
  if (it.kind === "seq"){ for (var i = 0; i < MODS.length; i++){ if (MODS[i].seq === it.id) return bankLevel(MODS[i].bank); } }
  return 0;
}
function levelNow(){ return (typeof curLevel === "string" && /^[123]$/.test(curLevel)) ? +curLevel : 0; }   /* 0: every level */
function inLevel(it){ var lv = levelNow(), il = itemLevel(it); return !lv || !il || il === lv; }
/* known: locked in. once: right the last time, not yet on a second day. due: met before and ready to come back. fresh: never met. */
function readiness(){
  var u = universe(), now = Date.now();
  var r = {board:{known:0,once:0,total:0}, orient:{known:0,once:0,total:0}, due:0, fresh:0, seen:0};
  u.forEach(function(it){
    var e = sched[it.key], g = it.board ? r.board : r.orient;
    if (e){ r.seen++; if (e.due <= now) r.due++; }
    if (!inLevel(it)) return;   /* another level's facts are counted when that level is the one on screen */
    g.total++;
    if (!e){ r.fresh++; return; }
    if (e.iv >= 2) g.known++; else if (e.iv >= 1) g.once++;
  });
  [r.board, r.orient].forEach(function(g){ g.pct = Math.round(g.known / g.total * 100); g.oncePct = Math.round((g.known + g.once) / g.total * 100); });
  return r;
}
function modeFor(key){
  var e = sched[key]; var iv = e ? e.iv : 0;
  if (!e) return "teach";
  if (iv === 0) return "num";
  if (iv <= 1) return "what";
  if (iv <= 3) return "build";
  return "order";
}
/* Today's session. What is ready to come back goes first, then a few new ones in teaching order, never a pile:
   the board before the videos (Mike's Way, then the subs a family at a time, each one building on the last), and
   new facts beside them (sprinkling amounts first). A first day is ten cards: five to meet on the board, five facts. */
function teachOrder(){
  var keys = ["seq:mw"];
  ["italian", "classicsclubs", "pairs", "chickenonly"].forEach(function(dk){
    DECKS.forEach(function(d){ if (d.key === dk) d.ids.forEach(function(id){ keys.push(String(id)); }); });
  });
  return keys;
}
function todayQueue(){
  var now = Date.now(), u = universe(), byKey = {};
  u.forEach(function(it){ byKey[it.key] = it; });
  var due = u.filter(function(it){ var e = sched[it.key]; return e && e.due <= now; });
  due.sort(function(a, b){ return sched[a.key].due - sched[b.key].due; });
  var picks = shuffle(due.slice(0, 10));
  var newBoard = teachOrder().filter(function(k){ return byKey[k] && !sched[k]; }).map(function(k){ return byKey[k]; });
  var newFacts = u.filter(function(it){ return !sched[it.key] && it.kind === "q" && inLevel(it); });   /* sprinkling amounts, then this level's cards in order */
  u.forEach(function(it){ if (it.kind === "seq" && !it.board && !sched[it.key] && inLevel(it)) newFacts.push(it); });   /* the put-in-order games come after the facts they rest on */
  if (levelNow() > 1){   /* at shift lead and manager level, that level's own facts and games come first; the sprinkling amounts wait behind them */
    newFacts = newFacts.filter(function(it){ return itemLevel(it) > 0; }).concat(newFacts.filter(function(it){ return itemLevel(it) === 0; }));
  }
  var a = newBoard.slice(0, 5), f = newFacts.slice(0, 5);
  while ((a.length || f.length) && picks.length < 16){
    if (a.length) picks.push(a.shift());
    if (f.length && picks.length < 16) picks.push(f.shift());
  }
  if (picks.length < 10){   /* nothing left to meet and little due: round the session out with practice */
    var rest = shuffle(u.filter(function(it){ return picks.indexOf(it) < 0 && (!!sched[it.key] || inLevel(it)); })).slice(0, 10 - picks.length);
    picks = picks.concat(rest);
  }
  return picks.map(function(it){ return it.kind === "sub" ? {kind:"sub", id:it.id, mode:modeFor(it.key)} : it; });
}
