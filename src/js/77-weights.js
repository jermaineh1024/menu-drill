/* ---------- slice weights: the look-up on the Training tab, and the table on each cold sub's sheet ---------- */
function wtTable(w){
  var noMini = w.rows.every(function(r){ return r[3] === null; });
  var cols = noMini ? WT_SIZES.slice(0, 2) : WT_SIZES;
  var head = h("tr", {}, [h("th", {scope:"col", text:"In slicing order"})].concat(cols.map(function(c){ return h("th", {scope:"col", text:c}); })));
  var body = w.rows.map(function(r){
    return h("tr", {}, [h("td", {text:r[0]})].concat(cols.map(function(c, i){ return h("td", {text:wtCell(r[i + 1])}); })));
  });
  if (w.t) body.push(h("tr", {class:"sep wt-total"}, [h("td", {text:"The whole sub"})].concat(cols.map(function(c, i){ return h("td", {}, [h("b", {text:wtCell(w.t[i])})]); }))));
  return h("table", {class:"amt wt"}, [h("thead", {}, [head]), h("tbody", {}, body)]);
}
function fillWeights(n){
  var box = $("wt-table"), w = wtOf(n);
  if (!box || !w) return;
  clear(box);
  box.appendChild(h("h3", {class:"mt-s", id:"wt-title", text:"#" + w.n + " " + wtName(w)}));
  box.appendChild(wtTable(w));
  if (w.also) box.appendChild(h("p", {class:"fine mt-s", text:w.also}));
  var picks = $("wt-pick").querySelectorAll("button");
  for (var i = 0; i < picks.length; i++) picks[i].setAttribute("aria-pressed", picks[i].getAttribute("data-wt") === String(n) ? "true" : "false");
}
function initWeights(){
  var pick = $("wt-pick");
  if (!pick) return;
  WEIGHTS.forEach(function(w){
    pick.appendChild(h("button", {class:"wt-chip" + (WT_TOP.indexOf(w.n) >= 0 ? " top" : ""), "data-wt":String(w.n), "aria-pressed":"false", "aria-label":"Number " + w.n + ", " + wtName(w) + (WT_TOP.indexOf(w.n) >= 0 ? ", a top seller" : ""), text:"#" + w.n,
      onclick:function(){ fillWeights(w.n); }}));
  });
  fillWeights(7);
}
/* on a cold sub's sheet, under the picture */
function wtForSheet(sub){
  var w = sub.type === "cold" ? wtOf(sub.n) : null;
  if (!w) return null;
  return h("div", {class:"wt-sheet"}, [h("h3", {class:"mt", text:"On the scale"}), wtTable(w),
    h("p", {class:"fine mt-s", text:"Cheese and meat only, from the slicing sheet on the meat case door." + (w.also ? " " + w.also : "")})]);
}
