
/* ---------- detail sheet ---------- */
var sheet = $("sheet");
var sheetPanel = sheet.querySelector(".sheet-panel");
var sheetBody = $("sheet-body");
var sheetBack = $("sheet-back");
var sheetHist = [], sheetOpener = null;
function setBehind(off){
  /* the page behind the sheet goes inert while it is open */
  var els = [$("main"), document.querySelector(".topbar"), document.querySelector(".tabs")];
  els.forEach(function(el){
    if (!el) return;
    if (off){ el.setAttribute("inert", ""); el.setAttribute("aria-hidden", "true"); }
    else { el.removeAttribute("inert"); el.removeAttribute("aria-hidden"); }
  });
}
function openSheet(entry, push){
  if (sheet.hidden){
    sheetOpener = document.activeElement;
    sheetHist = [];
    sheet.hidden = false;
    document.documentElement.style.overflow = "hidden";
    setBehind(true);
  }
  walkPause(); walk = null;
  if (push !== false) sheetHist.push(entry);
  sheetBack.hidden = sheetHist.length < 2;
  clear(sheetBody);
  sheetPanel.style.transform = "";
  if (entry.type === "sub") fillSub(byId(entry.id), true);
  else if (entry.type === "walk") fillWalk(entry);
  else fillIng(entry.name);
  sheetPanel.scrollTop = 0;
  try { sheetPanel.focus({preventScroll:true}); } catch(e){ sheetPanel.focus(); }
}
function closeSheet(){
  if (sheet.hidden) return;
  walkPause(); walk = null;
  if (saying){ Voice.stop(); sayReset(); }
  sheet.hidden = true;
  sheetPanel.classList.remove("dragging", "settle");
  sheetPanel.style.transform = "";
  document.documentElement.style.overflow = "";
  setBehind(false);
  sheetHist = [];
  clear(sheetBody);
  if (sheetOpener && sheetOpener.focus && document.contains(sheetOpener)){ try { sheetOpener.focus({preventScroll:true}); } catch(e){} }
  sheetOpener = null;
}
sheetBack.addEventListener("click", function(){
  if (sheetHist.length < 2) return;
  sheetHist.pop();
  openSheet(sheetHist[sheetHist.length - 1], false);
});
/* keep Tab inside the sheet */
sheet.addEventListener("keydown", function(e){
  if (e.key !== "Tab") return;
  var f = Array.prototype.filter.call(sheetPanel.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])"), function(el){
    return !el.disabled && !el.hidden && el.getClientRects().length > 0;
  });
  if (!f.length){ e.preventDefault(); return; }
  var first = f[0], last = f[f.length - 1], a = document.activeElement;
  if (e.shiftKey && (a === first || a === sheetPanel)){ e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && a === last){ e.preventDefault(); first.focus(); }
});
/* pull the sheet down by its handle to close it */
(function(){
  var handle = $("sheet-handle"), startY = 0, dy = 0, active = false, id = null, t0 = 0;
  if (!handle || !window.PointerEvent) return;
  handle.addEventListener("pointerdown", function(e){
    if (e.pointerType === "mouse" || (e.target.closest && e.target.closest("button"))) return;
    active = true; id = e.pointerId; startY = e.clientY; dy = 0; t0 = Date.now();
    sheetPanel.classList.remove("settle"); sheetPanel.classList.add("dragging");
    try { handle.setPointerCapture(id); } catch(err){}
  });
  handle.addEventListener("pointermove", function(e){
    if (!active || e.pointerId !== id) return;
    dy = Math.max(0, e.clientY - startY);
    sheetPanel.style.transform = dy ? "translateY(" + dy + "px)" : "";
  });
  function end(e){
    if (!active || (e && e.pointerId !== id)) return;
    active = false;
    sheetPanel.classList.remove("dragging");
    var fast = dy > 40 && (Date.now() - t0) < 260;
    if (dy > 110 || fast){ closeSheet(); return; }
    sheetPanel.classList.add("settle");
    sheetPanel.style.transform = "";
  }
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);
})();

function sizePicker(onPick){
  var wrap = h("div", {class:"sizes", role:"group", "aria-label":"Sub size"});
  SIZES.forEach(function(s){
    wrap.appendChild(h("button", {"aria-pressed":s === curSize ? "true" : "false", text:SIZE_LABEL[s], onclick:function(){
      curSize = s; store(SIZE_KEY, s);
      onPick();
    }}));
  });
  return wrap;
}
function sayBack(sub, size, bread, mods){
  var t = SIZE_LABEL[size] + " " + (sub.lto ? sub.name : sub.n);
  if (sub.type === "cold" && sub.mw) t += ", Mike's Way";
  (mods || []).forEach(function(m){ t += ", " + m; });
  return t + ", on " + bread + "?";
}
function fillSub(sub, animate){
  var isCold = sub.type === "cold";
  sheetBody.appendChild(h("div", {class:"sheet-head"}, [
    h("div", {class:"tag" + (sub.lto ? " lto" : ""), text:String(sub.n)}),
    h("div", {}, [h("h2", {id:"sheet-title", text:sub.name}), h("span", {class:"pill" + (isCold ? "" : " hot"), text:isCold ? "Cold sub" : (sub.lto ? "Hot sub, limited time" : "Hot sub")})])
  ]));
  if (sub.delta) sheetBody.appendChild(h("p", {class:"delta", text:sub.delta}));
  var pic = h("div", {}), sayQ = h("q", {});
  function draw(build){
    clear(pic);
    sayQ.textContent = sayBack(sub, curSize, "white");
    var withAmounts = isCold && sub.mw;
    if (withAmounts) pic.appendChild(sizePicker(function(){ draw(false); }));
    var s = subLayers(sub, {size:withAmounts ? curSize : null, brackets:true});
    var svg = drawStack(s.layers, {brackets:s.brackets, tappable:true, build:build && !reducedMotion, label:sub.name + ", layers in the order they go on"});
    pic.appendChild(svg);
    /* the same thing as a list, for a screen reader */
    var ol = h("ol", {class:"sr"});
    s.layers.forEach(function(l){ ol.appendChild(h("li", {text:(l.label || l.k) + (l.amt ? ", " + l.amt : "")})); });
    pic.appendChild(ol);
  }
  draw(animate);
  sheetBody.appendChild(pic);
  if (isCold && sub.mw) sheetBody.appendChild(h("p", {class:"fine mt-s", text:"Every topping starts at the end closest to the guest and covers both ends."}));
  /* the meats and cheeses again as full-size buttons: the bands in the picture are tappable too, but they are thin */
  var seen = {}, known = itemsOf(sub).map(function(k){ return k.replace(/^Extra /, ""); }).filter(function(k){ var ok = LAYERS[k] && LAYERS[k].cue && !seen[k]; seen[k] = true; return ok; });
  if (known.length){
    sheetBody.appendChild(h("p", {class:"fine mt-s", text:"Tap one to see what it is and every sub that uses it:"}));
    sheetBody.appendChild(h("div", {class:"ing-row"}, known.map(function(k){ return ingChip(k, {"data-ing":k}); })));
  }
  sheetBody.appendChild(h("div", {class:"say"}, [h("b", {text:"Say it back like this"}), sayQ]));
  var row = h("div", {class:"row"});
  var sbtn = sayButton(function(){ return sayText(sub); });
  if (sbtn) row.appendChild(sbtn);
  if (!sub.lto && !sub.offBoard){
    row.appendChild(h("button", {class:"btn", text:"Build this one", onclick:function(){ closeSheet(); go("drill"); startRun("build", null, [sub.id], sub.name); toQuestion(); }}));
    row.appendChild(h("button", {class:"btn ghost", text:"Take an order for it", onclick:function(){ closeSheet(); go("drill"); startRun("order", null, [sub.id], sub.name); toQuestion(); }}));
  }
  if (row.children.length) sheetBody.appendChild(row);
}
function subsWith(name){
  return SUBS.filter(function(s){
    if (s.offBoard) return false;
    var all = s.type === "cold" ? s.cheese.concat(s.meats, s.fixed, s.lid || []) : [s.protein].concat(s.grill, s.cheese, s.after);
    return all.some(function(x){ return x === name || x === "Extra " + name; });
  });
}
function fillIng(name){
  var st = LAYERS[name];
  var sw = h("div", {class:"big-swatch"}); sw.appendChild(swatch(name));
  sheetBody.appendChild(h("div", {class:"sheet-head"}, [sw, h("div", {}, [h("h2", {id:"sheet-title", text:name}), h("span", {class:"pill", text:"In the case"})])]));
  if (st && st.cue) sheetBody.appendChild(h("p", {text:st.cue}));
  var list = subsWith(name);
  sheetBody.appendChild(h("h3", {class:"mt", text:list.length ? "On your board, it's on " + list.length + (list.length === 1 ? " sub" : " subs") : "Not on any sub on your board"}));
  var rows = h("div", {class:"rows"});
  list.forEach(function(s){ rows.appendChild(subRow(s, false, false)); });
  sheetBody.appendChild(rows);
}

/* ---------- the walkthrough: one step at a time, full size, read out loud if you want ---------- */
function howtoSteps(key){
  var ol = document.querySelector('ol.howto[data-howto="' + key + '"]');
  if (!ol) return [];
  return Array.prototype.map.call(ol.children, function(li){
    var b = li.querySelector(".ht b"), p = li.querySelector(".ht p");
    var title = b.textContent.replace(/\.$/, "");
    return {svg:li.querySelector("svg"), num:li.querySelector(".hn").textContent, title:title, text:p.textContent.slice(b.textContent.length).replace(/^\s+/, "")};
  });
}
var walk = null;   /* the walkthrough on screen: {entry, timer, reading} */
function walkPause(){
  if (!walk) return;
  clearTimeout(walk.timer); walk.timer = null;
  if (walk.reading){ Voice.stop(); walk.reading = false; }
  if (walk.entry.hands){ walk.entry.hands = false; Awake.off(); }
  if (walk.sync) walk.sync();
}
function fillWalk(entry){
  var steps = howtoSteps(entry.key), n = steps.length;
  if (!n){ sheetBody.appendChild(h("p", {text:"This walkthrough isn't on the page."})); return; }
  entry.i = Math.max(0, Math.min(n - 1, entry.i || 0));
  var st = steps[entry.i], isStart = /^start$/i.test(st.num);
  var count = steps.filter(function(s){ return !/^start$/i.test(s.num); }).length;
  var w = walk = {entry:entry, timer:null, reading:false, sync:null};
  var box = h("div", {class:"walk"});
  box.appendChild(h("p", {class:"walk-step", text:HOWTO_NAME[entry.key] + (isStart ? ", before step 1" : ", step " + st.num + " of " + count)}));
  box.appendChild(h("h2", {class:"walk-title", id:"sheet-title", text:st.title}));
  var pic = st.svg.cloneNode(true);
  pic.setAttribute("class", "howto-pic play");
  pic.removeAttribute("tabindex"); pic.removeAttribute("role"); pic.setAttribute("role", "img");
  box.appendChild(h("figure", {style:"margin:0"}, pic));
  box.appendChild(h("p", {class:"walk-text", text:st.text}));
  var dots = h("div", {class:"walk-dots", "aria-hidden":"true"});
  steps.forEach(function(s, k){ dots.appendChild(h("i", {class:k === entry.i ? "on" : null})); });
  var status = h("p", {class:"walk-status", role:"status"});
  var spoken = speakable((isStart ? "Before you start. " : "Step " + st.num + ". ") + st.title + ". " + st.text);
  var sayB = h("button", {class:"say-btn", "aria-pressed":"false", "aria-label":"Read this step out loud"});
  var icon = svgEl("svg", {viewBox:"0 0 24 24", "aria-hidden":"true"}); icon.appendChild(svgEl("path", {d:SPEAKER_ICON}));
  var sayT = h("span", {text:"Read it"});
  sayB.appendChild(icon); sayB.appendChild(sayT);
  var hands = h("input", {type:"checkbox", id:"walk-hands"});
  function goTo(k, from){
    clearTimeout(w.timer); w.timer = null;
    if (w.reading){ Voice.stop(); w.reading = false; }
    entry.i = k;
    var keep = entry.hands;
    walk = null;
    clear(sheetBody); fillWalk(entry);
    sheetPanel.scrollTop = 0;   /* each step opens from its title, wherever the last one was left scrolled */
    if (from){   /* the button that was tapped is gone; put the focus on the one that took its place */
      var bs = sheetBody.querySelectorAll(".walk-ctl .btn"), b = from === "back" && bs[0] && !bs[0].disabled ? bs[0] : bs[bs.length - 1];
      try { if (b) b.focus({preventScroll:true}); } catch(e){}
    }
    if (keep && walk) walk.read(true);
  }
  function fail(kind){
    w.reading = false;
    if (entry.hands){ entry.hands = false; Awake.off(); }
    status.textContent = kind === "none" ? "This browser has no built-in voice, so the steps can't be read out here."
      : "No sound came out. Check the ringer switch and the volume, then tap Read it.";
    sync();
  }
  function read(auto){
    if (saying){ Voice.stop(); sayReset(); }
    stopListen();
    w.reading = true; status.textContent = ""; sync();
    Voice.speak(spoken, {
      onend:function(){
        w.reading = false; sync();
        if (!entry.hands) return;
        if (entry.i >= n - 1){
          entry.hands = false; Awake.off(); sync();
          status.textContent = "That's all of it. Turn hands-free on again to hear it from the top.";
          return;
        }
        w.timer = setTimeout(function(){ if (walk === w && entry.hands) goTo(entry.i + 1); }, 2600);
      },
      onfail:fail
    });
  }
  function sync(){
    sayB.setAttribute("aria-pressed", w.reading ? "true" : "false");
    sayT.textContent = w.reading ? "Stop" : "Read it";
    hands.checked = !!entry.hands;
  }
  w.sync = sync; w.read = read;
  sayB.addEventListener("click", function(){
    if (w.reading){ walkPause(); return; }
    read(false);
  });
  hands.addEventListener("change", function(){
    if (hands.checked){
      entry.hands = true; Awake.on();
      if (entry.i >= n - 1 && !w.reading){ goTo(0); return; }
      if (!w.reading) read(true);
    } else { walkPause(); }
  });
  var back = h("button", {class:"btn ghost", text:"Back", disabled:entry.i === 0, onclick:function(){ goTo(entry.i - 1, "back"); }});
  var next = entry.i >= n - 1
    ? h("button", {class:"btn", text:"Done", onclick:function(){ closeSheet(); }})
    : h("button", {class:"btn", text:"Next", onclick:function(){ goTo(entry.i + 1, "next"); }});
  if (Voice.ok) box.appendChild(h("label", {class:"switch", for:"walk-hands"}, [hands, "Hands-free: read each step and move on by itself"]));
  box.appendChild(status);
  /* Back, Read it and Next ride at the bottom of the sheet, so a long step never pushes them off the screen */
  box.appendChild(h("div", {class:"walk-foot"}, [dots, h("div", {class:"walk-ctl"}, [back, Voice.ok ? sayB : h("span", {}), next])]));
  sheetBody.appendChild(box);
  sync();
}
