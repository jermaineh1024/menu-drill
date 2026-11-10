
/* ---------- the path: one level on screen at a time ----------
   The Training tab is three levels, each opened by a band (data-level-head). Everything after a band belongs to its level,
   and the tab shows the level picked on the path card. With scripts off nothing is tagged, so everything shows. */
var LEVEL_KEY = "jm-level";
var curLevel = (function(){ var s = loadRaw(LEVEL_KEY); return (s === "all" || s === "1" || s === "2" || s === "3") ? s : "1"; })();
function levelOf(el){ var host = el && el.closest ? el.closest("[data-lv]") : null; return host ? host.getAttribute("data-lv") : null; }
function levelMods(n){
  var out = [];
  each(document.querySelectorAll('#view-orient > details.mod[data-lv="' + n + '"]'), function(d){ var m = modById(d.getAttribute("data-mod")); if (m) out.push(m); });
  return out;
}
function setLevel(lv, quiet){
  curLevel = String(lv);
  var view = $("view-orient");
  view.setAttribute("data-show", curLevel);
  hushIfHidden();
  renderPath();
  if (quiet) return;
  store(LEVEL_KEY, curLevel);
  renderReady(); renderToday();   /* the daily session and the readiness bar follow the level */
  var head = curLevel === "all" ? null : $("lv-" + curLevel);   /* you picked a level: bring its first card up under the tabs */
  if (head){ try { head.scrollIntoView({behavior:reducedMotion ? "auto" : "smooth", block:"start"}); } catch(err){ head.scrollIntoView(); } }
}
/* a jump, a walkthrough link or a quiz result may point at a card in another level: show that level first */
function revealFor(el){
  var lv = levelOf(el);
  if (lv && curLevel !== "all" && lv !== curLevel) setLevel(lv);
}
function renderPath(){
  var box = $("path");
  if (!box) return;
  LEVELS.forEach(function(L){
    var mods = levelMods(L.n), done = mods.filter(function(m){ var p = modProgress(m); return p.known === p.total; }).length;
    var on = curLevel === String(L.n);
    var b = box.querySelector('.lv[data-level="' + L.n + '"]');
    if (!b){   /* built once, then only updated: the button you pressed keeps the keyboard focus */
      b = h("button", {class:"lv", "data-level":String(L.n)}, [
        h("span", {class:"lv-n", "aria-hidden":"true", text:String(L.n)}),
        h("span", {class:"lv-t"}, [h("b", {text:L.title}), h("span", {text:L.line})]),
        h("span", {class:"lv-c"}),
        h("span", {class:"bar"}, h("i"))
      ]);
      b.addEventListener("click", function(){ setLevel(L.n); });
      box.appendChild(b);
    }
    b.className = "lv" + (done === mods.length && mods.length ? " done" : "");
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.setAttribute("aria-label", "Level " + L.n + ", " + L.title + ". " + L.line + " " + done + " of " + mods.length + " cards locked in." + (on ? " Showing now." : " Show this level."));
    b.querySelector(".lv-c").textContent = done + " of " + mods.length;
    b.querySelector(".bar i").style.width = (mods.length ? Math.round(done / mods.length * 100) : 0) + "%";
  });
  var all = $("path-all");
  if (all){ all.setAttribute("aria-pressed", curLevel === "all" ? "true" : "false"); all.textContent = curLevel === "all" ? "Back to one level" : "Show every level"; }
  var line = $("path-now");
  if (line){
    var L = LEVELS[(+curLevel || 1) - 1];
    line.textContent = curLevel === "all" ? "Showing every level, one after the other." : "Showing level " + L.n + ": " + L.title + ". " + L.line;
  }
}
function initLevels(){
  var view = $("view-orient"), lv = null;
  each(view.children, function(el){
    var head = el.getAttribute("data-level-head");
    if (head) lv = head;
    if (lv && el.tagName !== "NAV") el.setAttribute("data-lv", lv);
  });
  each(view.querySelectorAll("nav.jump a[data-jump]"), function(a){
    var t = $(a.getAttribute("data-jump"));
    if (t && t.getAttribute("data-lv")) a.setAttribute("data-lv", t.getAttribute("data-lv"));
  });
  var all = $("path-all");
  if (all) all.addEventListener("click", function(){ setLevel(curLevel === "all" ? "1" : "all"); });
  setLevel(curLevel, true);
}

/* ---------- one card open at a time (on unless you turn it off) ---------- */
var FOCUS_KEY = "jm-focus";
function initFocus(){
  var t = $("focus-toggle"), view = $("view-orient");
  var on = loadRaw(FOCUS_KEY) !== "off";
  if (t){
    t.checked = on;
    t.addEventListener("change", function(){ on = t.checked; store(FOCUS_KEY, on ? "on" : "off"); });
  }
  view.addEventListener("toggle", function(e){
    var d = e.target;
    if (!on || !d || d.tagName !== "DETAILS" || !d.open || !d.classList.contains("mod")) return;
    var before = d.getBoundingClientRect().top;
    each(view.querySelectorAll("details.mod[open]"), function(o){ if (o !== d) o.open = false; });
    var after = d.getBoundingClientRect().top;
    if (Math.abs(after - before) > 1) window.scrollBy(0, after - before);   /* the card you tapped stays where your finger is */
  }, true);
}

/* ---------- checklists you can tick (kept on this device only) ---------- */
var TICKS_KEY = "jm-ticks-v1";
var ticks = load(TICKS_KEY, {}) || {};
function initTicks(){
  each(document.querySelectorAll("ul.ticks[data-check]"), function(ul){
    var key = ul.getAttribute("data-check"), items = Array.prototype.slice.call(ul.children);
    /* tick rows are checkboxes, so the list around them is a named group: the heading right above it, or the card's own title */
    var named = ul.previousElementSibling, host = ul.closest("details, .card");
    while (named && named.tagName !== "H3") named = named.previousElementSibling;
    if (!named && host) named = host.querySelector("summary h2, h2, h3");
    ul.setAttribute("role", "group");
    if (named) ul.setAttribute("aria-label", named.textContent.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, ""));
    var count = h("p", {class:"ticks-n", "aria-live":"polite"});
    var clearB = h("button", {class:"btn quiet small", text:"Clear these ticks"});
    function draw(){
      var got = ticks[key] || [];
      var n = 0;
      items.forEach(function(li, i){
        var on = got.indexOf(i) >= 0;
        if (on) n++;
        li.setAttribute("aria-checked", on ? "true" : "false");
      });
      count.textContent = n + " of " + items.length + " ticked";
      clearB.hidden = n === 0;
    }
    items.forEach(function(li, i){
      li.setAttribute("role", "checkbox"); li.setAttribute("tabindex", "0");
      function flip(){
        var got = (ticks[key] || []).slice(), at = got.indexOf(i);
        if (at >= 0) got.splice(at, 1); else got.push(i);
        ticks[key] = got; store(TICKS_KEY, ticks); draw();
      }
      li.addEventListener("click", flip);
      li.addEventListener("keydown", function(e){ if (e.key === " " || e.key === "Enter"){ e.preventDefault(); flip(); } });
    });
    clearB.addEventListener("click", function(){ delete ticks[key]; store(TICKS_KEY, ticks); draw(); });
    ul.classList.add("live");
    ul.parentNode.insertBefore(h("div", {class:"ticks-foot"}, [count, clearB]), ul.nextSibling);
    draw();
  });
}

/* ---------- practice math: type your own numbers, the answer follows ---------- */
function money(v){ var n = Math.round(v * 100) / 100; var s = Math.abs(n).toFixed(2).replace(/\.00$/, ""); s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ","); return (n < 0 ? "-$" : "$") + s; }
function num(v, d){ var p = Math.pow(10, d === undefined ? 2 : d); return String(Math.round(v * p) / p); }
function pct(v){ return num(v, 2) + "%"; }
var CALCS = {
  order:{title:"Try it: one product", note:"Starts with the video's vinegar. Change any number.",
    fields:[{k:"per", label:"How many come in a case", v:4}, {k:"shelf", label:"How many are on the shelf now", v:1}, {k:"had", label:"Last time: cases on hand", v:0.5}, {k:"got", label:"Last time: cases you ordered", v:1}],
    out:function(v){
      if (!(v.per > 0)) return [{t:"A case has to hold at least 1."}];
      var on = v.shelf / v.per, used = v.had + v.got - on, rows = [{l:"On hand now, in cases", r:num(on)}];
      if (used < 0) return rows.concat([{t:"That's more on the shelf than you had and ordered. Check the numbers."}]);
      rows.push({l:"Used since the last order", r:num(used) + " cases"});
      /* compared in hundredths, the way the numbers are shown, so a rounding crumb can't call an even amount a cushion */
      [1, 2, 3].forEach(function(n){ var tot = on + n, more = Math.round(tot * 100) > Math.round(used * 100); rows.push({l:"Order " + n + ": you'd have " + num(tot), r:more ? "has a cushion" : "no cushion", ok:more}); });
      rows.push({t:"Having only what you used last time may not be enough. Leave room for a busy week or a damaged case."});
      return rows;
    }},
  cogu:{title:"Try it: cost of goods used", note:"Starts with the video's week. Change any number.",
    fields:[{k:"b", label:"Beginning inventory", v:5000, m:1}, {k:"p", label:"Purchases", v:7000, m:1}, {k:"c", label:"Closing inventory", v:5500, m:1}, {k:"s", label:"Sales for the period", v:23215, m:1}],
    out:function(v){
      var w = v.b + v.p, u = w - v.c, rows = [{l:"Working inventory", r:money(w)}, {l:"Cost of goods used", r:money(u), ok:true}];
      if (u < 0) return rows.concat([{t:"Closing can't be more than what you had to work with. Check the numbers."}]);
      if (v.s > 0) rows.push({l:"As a percent of sales", r:pct(u / v.s * 100), ok:true});
      return rows;
    }},
  goal:{title:"Try it: goal and actual", note:"Starts with the video's report. Type the two numbers off your own.",
    fields:[{k:"t", label:"Theoretical food cost, %", v:25.71}, {k:"a", label:"Actual food cost, %", v:28.08}],
    out:function(v){
      var g = v.t + 2, d = Math.round((v.a - g) * 100) / 100;
      return [{l:"Goal (theoretical + 2)", r:pct(g)}, {l:d > 0 ? "Over goal by" : (d < 0 ? "Under goal by" : "Right on goal"), r:d === 0 ? "" : num(Math.abs(d)) + " points", ok:d === 0},
        {t:d > 0 ? "High. Look for red variances: too much going out." : (d < 0 ? "Low. Look for black variances: are subs getting enough on them?" : "On goal.")}];
    }},
  forecast:{title:"Try it: forecast a week", note:"The last four weeks here average to the video's $17,535. The video doesn't give its four weeks, so these four are made up to match.",
    fields:[{k:"w1", label:"Last week's sales", v:17300, m:1}, {k:"w2", label:"2 weeks ago", v:17650, m:1}, {k:"w3", label:"3 weeks ago", v:17480, m:1}, {k:"w4", label:"4 weeks ago", v:17710, m:1}, {k:"ly", label:"Same week last year", v:16659.07, m:1}, {k:"up", label:"Sales are up this year by, %", v:5}],
    out:function(v){
      var avg = (v.w1 + v.w2 + v.w3 + v.w4) / 4, grow = v.ly * (1 + v.up / 100);
      return [{l:"4-week average", r:money(avg), ok:true}, {l:"Last year plus " + num(v.up) + "%", r:money(grow), ok:true}, {t:"Then adjust for the time of year, the 10-day weather, local events and big catering orders."}];
    }},
  labor:{title:"Try it: labor percent for a day", note:"Starts with the video's Monday. Change either number.",
    fields:[{k:"pay", label:"Everyone's pay for the day, added up", v:335.75, m:1}, {k:"s", label:"Forecasted sales for the day", v:2250, m:1}],
    out:function(v){
      if (!(v.s > 0)) return [{t:"Sales has to be more than 0."}];
      return [{l:"Labor percent", r:pct(v.pay / v.s * 100), ok:true}, {t:"Too high? Go back to the shift lines. Try a quarter hour later start or earlier finish."}];
    }},
  loaf:{title:"Try it: bread math", note:"Starts with the video's week. Change either number.",
    fields:[{k:"s", label:"Sales for the week", v:16500, m:1}, {k:"b", label:"Loaves for the week", v:1000}],
    out:function(v){
      if (!(v.b > 0)) return [{t:"Loaves has to be more than 0."}];
      var per = v.s / v.b, day = v.b / 7, more = per * 10 * 7;
      return [{l:"Average sales per loaf", r:money(per), ok:true}, {l:"Average bread per day", r:num(day, 0) + " loaves"}, {l:"10 more loaves a day adds", r:money(more) + " a week", ok:true}, {l:"The week becomes", r:money(v.s + more)}];
    }},
  week:{title:"Try it: this week's numbers", note:"These starting numbers are the videos' examples. Type yours off the reports. Nothing you type leaves this phone.",
    fields:[{k:"s", label:"Sales", v:16500, m:1}, {k:"b", label:"Bread (loaves)", v:1000}, {k:"a", label:"Actual food cost, %", v:28.08}, {k:"t", label:"Theoretical food cost, %", v:25.71}],
    out:function(v){
      var rows = [];
      if (v.b > 0){ rows.push({l:"Average bread per day", r:num(v.b / 7, 0)}); rows.push({l:"Average sales per loaf", r:money(v.s / v.b)}); }
      var varc = Math.round((v.a - v.t) * 100) / 100;
      rows.push({l:"Variance (actual minus theoretical)", r:num(varc) + " points", ok:varc >= 0 && varc <= 2});
      rows.push({t:varc > 2 ? "Circle food cost: it's more than 2 points over theoretical." : (varc < 0 ? "Circle food cost: it's under theoretical. Check the count, and that subs are getting enough." : "Food cost is within 2 points of theoretical.")});
      return rows;
    }}
};
function initCalcs(){
  each(document.querySelectorAll(".calc[data-calc]"), function(box){
    var c = CALCS[box.getAttribute("data-calc")];
    if (!c) return;
    var inputs = {}, out = h("div", {class:"calc-out", "aria-live":"polite"});
    function val(k){ var x = parseFloat(String(inputs[k].value).replace(/[$,%\s]/g, "")); return isFinite(x) ? x : 0; }
    function draw(){
      var v = {};
      c.fields.forEach(function(f){ v[f.k] = val(f.k); });
      clear(out);
      c.out(v).forEach(function(r){
        if (r.t){ out.appendChild(h("p", {class:"calc-t", text:r.t})); return; }
        out.appendChild(h("div", {class:"calc-r" + (r.ok ? " ok" : "")}, [h("span", {text:r.l}), h("b", {text:r.r})]));
      });
    }
    var form = h("div", {class:"calc-in"});
    c.fields.forEach(function(f, i){
      var id = "calc-" + box.getAttribute("data-calc") + "-" + f.k;
      var inp = h("input", {id:id, type:"text", inputmode:"decimal", autocomplete:"off", value:String(f.v)});
      inp.addEventListener("input", draw);
      inp.addEventListener("focus", function(){ try { inp.select(); } catch(e){} });
      inputs[f.k] = inp;
      form.appendChild(h("label", {class:"calc-f", "for":id}, [h("span", {text:f.label}), h("span", {class:"calc-w" + (f.m ? " money" : "")}, inp)]));
    });
    var reset = h("button", {class:"btn quiet small", text:"Back to the example"});
    reset.addEventListener("click", function(){ c.fields.forEach(function(f){ inputs[f.k].value = String(f.v); }); draw(); });
    box.appendChild(h("h3", {text:c.title}));
    box.appendChild(h("p", {class:"fine", text:c.note}));
    box.appendChild(form);
    box.appendChild(out);
    box.appendChild(h("div", {class:"row"}, reset));
    draw();
  });
}

/* ---------- the day by the clock: which part of the day is it, by the training's example times ----------
   The hours are the videos' own examples: an opening that starts at 8, the rushes "typically" 11 to 2 and 5 to 7, bread racked
   after 7, and a closing team "finished by 9:15". No video says when the doors lock, so the reset has no clock time of its own. */
var DAYPARTS = [
  {id:"dp-open", from:8, to:11, say:"opening time", doing:"Bread, cookies, sauce, slicing, bacon, the slicer sharpened and cleaned, the checklist. Then the first guests."},
  {id:"dp-lunch", from:11, to:14, say:"the lunch rush", doing:"No prep. Everyone forward. The slicer runs the line."},
  {id:"dp-mid", from:14, to:17, say:"mid-day", doing:"The mid-day checklist, a full slicer clean, and tomorrow's prep."},
  {id:"dp-dinner", from:17, to:19, say:"the dinner rush", doing:"No prep. The closing checklist is already split up."},
  {id:"dp-close", from:19, to:21.25, say:"close-down time", doing:"Dishes, restock, bread racked, grill and slicer pre-cleaned. Guests still come first. Once the doors lock: mop, put everything back, finish the Production Pro chart."}
];
function clockText(d){ var hh = d.getHours(), m = d.getMinutes(), ap = hh >= 12 ? "p.m." : "a.m.", h12 = hh % 12 || 12; return h12 + ":" + (m < 10 ? "0" : "") + m + " " + ap; }
function partAt(d){ var t = d.getHours() + d.getMinutes() / 60; for (var i = 0; i < DAYPARTS.length; i++){ if (t >= DAYPARTS[i].from && t < DAYPARTS[i].to) return DAYPARTS[i]; } return null; }
function initNow(){
  var box = $("day-now");
  if (!box) return;
  var shown = "", timer = null;
  function draw(){
    var now = new Date(), p = partAt(now), time = "It's " + clockText(now) + " ";
    if (time + (p ? p.id : "") === shown) return;   /* same minute, same part of the day: leave the page alone */
    shown = time + (p ? p.id : "");
    clear(box);
    each(document.querySelectorAll(".dayparts dt"), function(dt){ dt.classList.toggle("now", !!p && dt.id === p.id); });
    box.appendChild(h("p", {class:"now-t"}, [h("b", {text:time}), document.createTextNode(p ? "On the example clock this is " + p.say + "." : "On the example clock the store is closed.")]));
    if (p) box.appendChild(h("p", {class:"now-d", text:p.doing}));
  }
  draw();
  var card = $("o-dayclock");
  if (!card) return;
  /* while the card is open the box keeps time; folded, it rests */
  card.addEventListener("toggle", function(){
    if (timer){ clearInterval(timer); timer = null; }
    if (card.open){ draw(); timer = setInterval(draw, 20000); }
  });
}

/* ---------- every training card can be read out loud ---------- */
function cardText(card){
  var c = card.cloneNode(true);
  each(c.querySelectorAll("svg, button, .needs-js, .calc, [data-seq], .mod-p, .fold-x, .ticks-foot, .row"), function(x){ if (x.parentNode) x.parentNode.removeChild(x); });
  var parts = [], tidy = function(s){ return s.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, ""); };
  var READ = "summary h2, h3, p, li, dt, dd, tbody tr";
  each(c.querySelectorAll(READ), function(x){
    var t;
    /* everything is said once: a list item that holds paragraphs is read through its paragraphs, a table through its rows */
    if (x.tagName !== "TR" && (x.querySelector(READ) || x.closest("tbody tr"))) return;
    if (x.tagName === "TR"){
      /* a table row reads as a sentence: "Walk-in cooler: 36 to 41 degrees", or with three columns "Cheese slices. Regular: 3. Giant: 6." */
      var cells = Array.prototype.map.call(x.children, function(td){ return tidy(td.textContent); });
      var heads = Array.prototype.map.call(x.closest("table").querySelectorAll("thead th"), function(th){ return tidy(th.textContent); });
      if (cells.length > 2 && heads.length === cells.length) t = cells[0] + ". " + cells.slice(1).map(function(v, i){ return heads[i + 1] + ": " + v; }).join(". ");
      else t = cells.filter(Boolean).join(": ");
    } else {
      t = tidy(x.textContent);
      var hn = x.parentNode && x.parentNode.classList.contains("ht") ? x.parentNode.querySelector(".hn") : null;
      if (hn && t) t = "Step " + tidy(hn.textContent) + ". " + t;   /* the how-to pictures are numbered; the voice says the number */
    }
    if (!t) return;
    if (!/[.!?:]["”')\]]*$/.test(t)) t += ".";   /* a line that ends inside quotes has its full stop already */
    parts.push(t);
  });
  return sayable(parts.join(" "));
}
/* the training cards carry a few signs a voice trips on */
function sayable(t){
  return speakable(t).replace(/°F/g, " degrees").replace(/°/g, " degree").replace(/\bppm\b/g, "parts per million").replace(/¾/g, "three quarters").replace(/½/g, "one half").replace(/¼/g, "one quarter");
}
/* a voice with no Stop button in sight can't be stopped: when the thing being read leaves the screen (another tab, another level), it goes quiet */
function hushIfHidden(){ if (saying && !saying.getClientRects().length){ Voice.stop(); sayReset(); } }
function initListen(){
  var note = $("listen-note");
  if (note && Voice.ok) note.textContent = "Every card has a button that reads it to you. ";
  each(document.querySelectorAll("#view-orient > details.card:not(.ease-card)"), function(card){
    var b = sayButton(function(){ return cardText(card); }, "Read this card to me");
    if (!b) return;
    var quiz = card.querySelector("[data-quiz]");
    var row = quiz ? quiz.parentNode : card.appendChild(h("div", {class:"row"}));
    row.appendChild(b);
    card.addEventListener("toggle", function(){ if (!card.open && saying === b){ Voice.stop(); sayReset(); } });
  });
}
