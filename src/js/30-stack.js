
/* ---------- the sub picture ----------
   One drawing routine for every sandwich on the page: the small ones in the lists, the full one with amounts in
   the detail sheet, and the one that stacks up while you tap in the build drills. Layers are listed bottom to top. */
var SVG_NS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs, text){
  var e = document.createElementNS(SVG_NS, tag);
  if (attrs){ for (var k in attrs){ if (Object.prototype.hasOwnProperty.call(attrs,k) && attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]); } }
  if (text !== undefined) e.textContent = text;
  return e;
}
var NO_LAYER = {fill:"#CFD6DD", ink:"#1B2B44"};
function layerStyle(k){ return LAYERS[k] || NO_LAYER; }
function layerHeight(l){
  if (l.k === "MW" || l.k === "BASE") return 26;
  return layerStyle(l.k).thin ? 16 : 24;
}
function stackHeightFor(items){
  var t = 0; items.forEach(function(k){ t += layerHeight({k:k}) + 2; }); return t;
}
function haloText(x, y, size, fill, halo, txt, anchor){
  /* the halo is the band's own color, so a label stays readable over a textured band */
  return svgEl("text", {x:x, y:y, "font-size":size, fill:fill, stroke:halo, "stroke-width":3.5, "stroke-linejoin":"round", "paint-order":"stroke", "text-anchor":anchor || null}, txt);
}
function drawStack(layers, o){
  o = o || {};
  var W = 300, gap = 2, topH = 26, botH = 17, pad = 4;
  var brk = (o.brackets && o.brackets.length) ? 24 : 0;
  var hs = layers.map(layerHeight);
  var bodyH = 0; hs.forEach(function(x){ bodyH += x + gap; });
  var H = (o.top === false ? 0 : topH + gap) + Math.max(bodyH, o.reserve || 0) + botH;
  var bandW = W - 2 * pad - brk;
  var svg = svgEl("svg", {class:"stack" + (o.build ? " build" : ""), viewBox:"0 0 " + W + " " + H, role:"img", "aria-label":o.label || "Layers in the order they go on"});
  var bread = LAYERS.Bread;
  /* bottom bread */
  var yb = H - botH, bx1 = W - brk;
  var botPath = "M0 " + yb + " H" + bx1 + " V" + (yb + botH - 9) + " Q" + bx1 + " " + (yb + botH) + " " + (bx1 - 10) + " " + (yb + botH) + " H10 Q0 " + (yb + botH) + " 0 " + (yb + botH - 9) + " Z";
  svg.appendChild(svgEl("path", {d:botPath, fill:bread.fill}));
  svg.appendChild(svgEl("path", {d:botPath, fill:"url(#" + bread.pat + ")"}));
  svg.appendChild(svgEl("path", {d:botPath, fill:"url(#g-band)"}));   /* light from above, shade underneath: every layer gets it */
  svg.appendChild(haloText(12, yb + 12.5, 10.5, bread.ink, bread.fill, "Bread"));
  /* the layers, bottom up */
  var y = yb, num = 0, tops = [], bots = [];
  layers.forEach(function(l, i){
    var hgt = hs[i], st = layerStyle(l.k);
    y -= gap; bots[i] = y; y -= hgt; tops[i] = y;
    var tappable = o.tappable && LAYERS[l.k] && LAYERS[l.k].cue;
    var grp = svgEl("g", {class:"ly" + (l.isNew ? " new" : "") + (tappable ? " band" : ""), style:"--i:" + i});
    if (tappable) grp.setAttribute("data-ing", l.k);   /* a tap shortcut only: the full-size buttons under the picture are what the keyboard and screen readers get */
    var special = l.k === "MW" || l.k === "BASE";
    var fill = l.k === "BASE" ? "#C9D2DB" : st.fill, ink = l.k === "BASE" ? "#1B2B44" : st.ink;
    grp.appendChild(svgEl("rect", {x:pad, y:y, width:bandW, height:hgt, rx:5, fill:fill}));
    if (st.pat && !special) grp.appendChild(svgEl("rect", {x:pad, y:y, width:bandW, height:hgt, rx:5, fill:"url(#" + st.pat + ")"}));
    grp.appendChild(svgEl("rect", {x:pad, y:y, width:bandW, height:hgt, rx:5, fill:"url(#g-band)"}));
    if (l.status === "bad") grp.appendChild(svgEl("rect", {x:pad + 1, y:y + 1, width:bandW - 2, height:hgt - 2, rx:4, fill:"none", stroke:"#B3261E", "stroke-width":2.4}));
    var fs = hgt < 20 ? 10.5 : 12.5, mid = y + hgt / 2, tx = pad + 9;
    if (l.skip) num += l.skip;   /* a band that stands for several layers uses up their numbers */
    if (l.n !== false && !special){
      /* the number is the order it goes on. On a hot sub the lid is dressed first, so its bands carry 1, 2, 3 at the top of the picture */
      var shown = (l.num !== undefined && l.num !== null) ? l.num : ++num;
      var r = hgt < 20 ? 6.4 : 8.4;
      var chipFill = l.status === "ok" ? "#24693F" : (l.status === "bad" ? "#B3261E" : "#FFFFFF");
      grp.appendChild(svgEl("circle", {cx:pad + 13, cy:mid, r:r, fill:chipFill, "fill-opacity":l.status ? 1 : .95, stroke:l.status ? null : "#1B2B44", "stroke-opacity":l.status ? null : .28, "stroke-width":l.status ? null : .9}));
      grp.appendChild(svgEl("text", {x:pad + 13, y:mid + (hgt < 20 ? 3.1 : 3.7), "font-size":hgt < 20 ? 8.8 : 10.5, "font-weight":800, "text-anchor":"middle", fill:l.status ? "#FFFFFF" : "#1B2B44"}, String(shown)));
      tx = pad + 27;
    }
    var label = haloText(tx, mid + fs * 0.35, fs, ink, fill, l.label || l.k);
    if (l.k === "MW") label.setAttribute("font-style", "italic");
    grp.appendChild(label);
    var rx = pad + bandW - 9;
    if (tappable){ grp.appendChild(haloText(rx, mid + 4.5, 13, ink, fill, "›", "end")); rx -= 13; }
    if (l.amt) grp.appendChild(haloText(rx, mid + 3.6, 10.5, ink, fill, l.amt, "end"));
    svg.appendChild(grp);
  });
  /* the lid sits right on the last layer */
  if (o.top !== false){
    var yt = y - gap - topH;
    var lid = svgEl("g", {class:"ly", style:"--i:" + layers.length});
    var topPath = "M0 " + (yt + topH) + " V" + (yt + 15) + " C0 " + (yt + 4) + " " + (bx1 * 0.16) + " " + yt + " " + (bx1 / 2) + " " + yt + " C" + (bx1 * 0.84) + " " + yt + " " + bx1 + " " + (yt + 4) + " " + bx1 + " " + (yt + 15) + " V" + (yt + topH) + " Z";
    lid.appendChild(svgEl("path", {d:topPath, fill:bread.fill}));
    lid.appendChild(svgEl("path", {d:topPath, fill:"url(#" + bread.pat + ")"}));
    lid.appendChild(svgEl("path", {d:topPath, fill:"url(#g-band)"}));
    lid.appendChild(svgEl("path", {d:"M" + (bx1 * 0.2) + " " + (yt + 7.5) + " C" + (bx1 * 0.36) + " " + (yt + 4) + " " + (bx1 * 0.64) + " " + (yt + 4) + " " + (bx1 * 0.8) + " " + (yt + 7.5), fill:"none", stroke:"#F0D6AB", "stroke-width":3, "stroke-linecap":"round", opacity:.7}));
    lid.appendChild(haloText(12, yt + 20, 10.5, bread.ink, bread.fill, o.lidLabel || "Top bread, the lid"));
    svg.appendChild(lid);
  }
  /* brackets down the right side: who puts those layers on */
  (o.brackets || []).forEach(function(b){
    if (b.from > b.to || tops[b.to] === undefined) return;
    var y0 = tops[b.to] + 2, y1 = bots[b.from] - 2, x = W - brk + 7;
    svg.appendChild(svgEl("path", {class:"brk", d:"M" + (x - 4) + " " + y0 + " H" + x + " V" + y1 + " H" + (x - 4)}));
    var cy = (y0 + y1) / 2;
    svg.appendChild(svgEl("text", {class:"brk-t", x:0, y:0, "text-anchor":"middle", transform:"translate(" + (W - 4) + " " + cy + ") rotate(-90)"}, b.label));
  });
  return svg;
}
/* a sub's layers, bottom to top, and the brackets that group them */
function subLayers(sub, o){
  var layers = [], brackets = [], size = o.size;
  function amt(item){ return size ? amountFor(item, size, sub) : null; }
  function group(label, from){ if (layers.length > from) brackets.push({from:from, to:layers.length - 1, label:label}); }
  var start;
  if (sub.type === "cold"){
    start = 0;
    sub.cheese.forEach(function(c){ layers.push({k:c}); });
    sub.meats.forEach(function(m){ layers.push({k:m}); });
    sub.fixed.forEach(function(x){ layers.push({k:x}); });
    group("Slicer", start);
    if (sub.mw){
      if (o.compact) layers.push({k:"MW", label:"Mike's Way", amt:"7 toppings", n:false, skip:MW.length});
      else {
        start = layers.length;
        MW.forEach(function(x){ layers.push({k:x, amt:amt(x), label:(x === "Salt" && sub.saltRows === 2 && !size) ? "Salt, 2 rows" : null}); });
        group("Mike's Way", start);
      }
    }
    start = layers.length;
    (sub.lid || []).forEach(function(x){ layers.push({k:x, amt:amt(x), label:o.brackets ? null : x + ", on the lid"}); });
    group("Lid", start);
  } else {
    /* drawn where each thing sits in the closed sub, numbered in the order it goes on: lid first, then the grill, cheese, finish */
    var n = sub.lid.length;
    function hamt(item){ return size ? hotAmountFor(item, size, sub) : null; }
    start = 0;
    sub.grill.forEach(function(x){ layers.push({k:x, num:++n, amt:hamt(x)}); });
    if (sub.protein) layers.push({k:sub.protein, num:++n});
    sub.sauce.forEach(function(x){ layers.push({k:x, num:++n, amt:hamt(x), label:o.brackets ? null : x + ", on the " + (sub.protein || "meat").toLowerCase()}); });
    group("Grill", start);
    sub.cheese.forEach(function(c){ layers.push({k:c, num:++n, amt:hamt(c), label:c + (size ? "" : ", melted on top")}); });
    start = layers.length;
    sub.finish.forEach(function(a){ layers.push({k:a, num:++n, amt:hamt(a)}); });
    group(sub.finishLabel || "Finish", start);
    start = layers.length;
    sub.lid.slice().reverse().forEach(function(x){ layers.push({k:x, num:sub.lid.indexOf(x) + 1, amt:hamt(x), label:o.brackets ? null : x + ", on the lid"}); });
    group("Lid", start);
  }
  return {layers:layers, brackets:brackets};
}
function stackSVG(sub, o){
  o = o || {};
  var s = subLayers(sub, o);
  return drawStack(s.layers, {
    brackets:o.brackets ? s.brackets : null, tappable:o.tappable, build:o.build && !reducedMotion,
    label:sub.name + ": " + (sub.type === "cold"
      ? s.layers.map(function(l, i){ return (l.k === "MW" ? "Mike's Way" : l.k).toLowerCase(); }).join(", then ") + ", bottom to top"
      : hotParts(sub).map(function(p){ return p.label.toLowerCase() + ", " + p.items.join(", ").toLowerCase(); }).join("; "))
  });
}
/* a hot sub while you are building it: what you tap for the lid hangs under the top bread, the rest stacks up from the bottom,
   and every band carries the number of the tap that put it there */
function hotLive(sub){
  return function(seq, o){
    var low = [], lidL = [];
    seq.forEach(function(k, i){
      var l = {k:k, num:i + 1, status:o.statuses ? o.statuses[i] : null, isNew:!o.statuses && !reducedMotion && i === seq.length - 1 && o.justAdded};
      if (sub.lid.indexOf(k) >= 0) lidL.unshift(l); else low.push(l);
    });
    return drawStack(low.concat(lidL), {top:true, lidLabel:"Top bread, the lid", label:seq.length ? "Your sub so far: " + seq.join(", then ").toLowerCase() : "An empty sub, bread only"});
  };
}
/* the sandwich as it stands while you are building it */
function liveStack(items, o){
  var layers = (o.base ? [{k:"BASE", label:o.base, n:false}] : []).concat(items.map(function(k, i){
    return {k:k, status:o.statuses ? o.statuses[i] : null, isNew:!o.statuses && !reducedMotion && i === items.length - 1 && o.justAdded};
  }));
  return drawStack(layers, {top:!!o.closed, lidLabel:"Top bread", label:items.length ? "Your sub so far: " + items.join(", then ").toLowerCase() : "An empty sub, bread only"});
}
function swatch(key, size){
  var st = layerStyle(key);
  var s = svgEl("svg", {viewBox:"0 0 40 40", "aria-hidden":"true"});
  s.appendChild(svgEl("circle", {cx:20, cy:20, r:18, fill:st.fill}));
  if (st.pat) s.appendChild(svgEl("circle", {cx:20, cy:20, r:18, fill:"url(#" + st.pat + ")"}));
  s.appendChild(svgEl("circle", {cx:20, cy:20, r:18, fill:"url(#g-band)"}));
  s.appendChild(svgEl("circle", {cx:20, cy:20, r:18, fill:"none", stroke:"rgba(0,0,0,.2)", "stroke-width":size === "small" ? 2 : 1}));
  return s;
}
function ingChip(name, attrs){
  var a = attrs || {};
  a.class = "chip";
  return h("button", a, [h("span", {class:"sw", "aria-hidden":"true"}, swatch(name, "small")), h("span", {text:name})]);
}
