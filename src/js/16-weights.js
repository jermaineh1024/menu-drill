/* ---------- slice weights (the Slicing Reference Sheet on the meat case door, photographed Nov 12, 2026) ----------
   Ounces for a giant, a regular and a mini, in the order the sheet lists them, which is the order they are sliced.
   Every sub's rows add up to its total; the suite checks that, so a mistyped number cannot ship. */
var WT_SIZES = ["Giant", "Regular", "Mini"];
var WT_TOP = [7, 13, 8, 9, 6, 3];   /* the sign by the slicer: slicing guide for the top selling cold subs */
var WEIGHTS = [
  {n:1,  rows:[["Bacon", "12 slices", "6 slices", "4 slices"]]},
  {n:2,  t:[8.15, 5, 2.55],  rows:[["Provolone", 2, 1.2, 0.8], ["Ham", 4.75, 2.95, 1.2], ["Cappacuolo", 1.4, 0.85, 0.55]]},
  {n:3,  t:[7.95, 4.75, 2.6], rows:[["Provolone", 2, 1.2, 0.8], ["Ham", 5.95, 3.55, 1.8]], also:"The sheet calls this one The American Classic."},
  {n:4,  t:[7.4, 4.45, 2.55], rows:[["Provolone", 2, 1.2, 0.8], ["Prosciuttini", 4, 2.4, 1.2], ["Cappacuolo", 1.4, 0.85, 0.55]]},
  {n:5,  t:[9.15, 5.45, 3.35], rows:[["Provolone", 2, 1.2, 0.8], ["Ham", 2.95, 1.8, 1.2], ["Prosciuttini", 2.8, 1.6, 0.8], ["Cappacuolo", 1.4, 0.85, 0.55]]},
  {n:6,  t:[10.15, 5.3, 3.5], rows:[["Provolone", 2, 1.2, 0.8], ["Roast beef", 8.15, 4.1, 2.7]]},
  {n:7,  t:[9.2, 5.5, 2.95],  rows:[["Provolone", 2, 1.2, 0.8], ["Turkey", 7.2, 4.3, 2.15]]},
  {n:8,  t:[9.15, 5.75, 3.45], rows:[["Provolone", 2, 1.2, 0.8], ["Ham", 3.55, 2.4, 1.2], ["Turkey", 3.6, 2.15, 1.45], ["Bacon", "4 slices", "2 slices", "1 slice"]]},
  {n:9,  t:[9.2, 5.85, 3.4],  rows:[["Swiss", 1.5, 0.9, 0.6], ["Turkey", 4.3, 2.9, 1.45], ["Roast beef", 3.4, 2.05, 1.35], ["Bacon", "4 slices", "2 slices", "1 slice"]]},
  {n:10, t:[10, 5.5, 3.25],   rows:[["Tuna salad", "even layer", "even layer", "even layer"]], also:"The sheet gives chicken salad the same weights."},
  {n:11, t:[8.05, 4.9, 2.35], rows:[["Provolone", 2, 1.2, 0.8], ["Ham", 4.75, 2.95, 1.2], ["Salami", 1.3, 0.75, 0.35]]},
  {n:12, t:[9.55, 5.7, 3.05], rows:[["Provolone", 2, 1.2, 0.8], ["Roast beef", 6.8, 4.1, 2.05], ["Pepperoni", 0.75, 0.4, 0.2]]},
  {n:13, t:[11, 6.4, 3.9],    rows:[["Provolone", 2, 1.2, 0.8], ["Ham", 2.95, 1.8, 1.2], ["Prosciuttini", 2.8, 1.6, 0.8], ["Cappacuolo", 1.4, 0.85, 0.55], ["Salami", 1.1, 0.55, 0.35], ["Pepperoni", 0.75, 0.4, 0.2]]},
  {n:14, t:[7, 3.5, 2.1],     rows:[["Provolone", 4, 2, 1.2], ["Swiss", 3, 1.5, 0.9], ["Green bell peppers", "5 rings", "3 rings", "2 rings"]]},
  {n:19, name:"BBQ Beef", t:[9.5, 5.5, null], rows:[["Roast beef", 9.5, 5.5, null]], also:"On the sheet, with no mini. It is not on this page's menu."}
];
function wtOf(n){ for (var i = 0; i < WEIGHTS.length; i++) if (WEIGHTS[i].n === n) return WEIGHTS[i]; return null; }
function wtName(w){ if (w.name) return w.name; for (var i = 0; i < SUBS.length; i++) if (SUBS[i].n === w.n) return SUBS[i].name; return ""; }
function wtCell(v){ return v === null ? "" : (typeof v === "number" ? String(v) + " oz" : v); }

/* ---------- questions: the weights, the sprinkling area, the meat case ---------- */
BANKS.slicer = BANKS.slicer.concat([
  {id:"s78", q:"A giant #7, turkey and provolone, should weigh:", o:["9.2 oz","7.95 oz","10.15 oz","11 oz"], a:"9.2 oz", why:"2 oz of provolone and 7.2 oz of turkey."},
  {id:"s79", q:"A regular #7 should weigh:", o:["4.75 oz","5.5 oz","6.4 oz","5.3 oz"], a:"5.5 oz", why:"1.2 oz of provolone and 4.3 oz of turkey."},
  {id:"s80", q:"A mini #7 should weigh:", o:["3.9 oz","2.6 oz","2.95 oz","3.5 oz"], a:"2.95 oz", why:"0.8 oz of provolone and 2.15 oz of turkey."},
  {id:"s81", q:"A giant #13, the Original Italian, should weigh:", o:["9.15 oz","10.15 oz","9.2 oz","11 oz"], a:"11 oz", why:"The heaviest giant on the sheet: provolone and five meats."},
  {id:"s82", q:"A regular #13 should weigh:", o:["6.4 oz","5.75 oz","5.5 oz","4.75 oz"], a:"6.4 oz", why:"1.2 oz of provolone, then ham, prosciuttini, cappacuolo, salami and pepperoni."},
  {id:"s83", q:"A mini #13 should weigh:", o:["2.95 oz","3.9 oz","3.45 oz","2.6 oz"], a:"3.9 oz", why:"Six things on a mini, 3.9 oz in all."},
  {id:"s84", q:"A regular #8, the Club Sub, should weigh:", o:["5.3 oz","6.4 oz","5.75 oz","4.75 oz"], a:"5.75 oz", why:"Provolone 1.2, ham 2.4, turkey 2.15. The 2 slices of bacon are counted, not weighed."},
  {id:"s85", q:"A regular #9, the Club Supreme, should weigh:", o:["5.85 oz","5.5 oz","5.3 oz","6.4 oz"], a:"5.85 oz", why:"Swiss 0.9, turkey 2.9, roast beef 2.05, plus 2 slices of bacon."},
  {id:"s86", q:"A giant #6, roast beef and provolone, should weigh:", o:["9.2 oz","11 oz","7.95 oz","10.15 oz"], a:"10.15 oz", why:"2 oz of provolone and 8.15 oz of roast beef."},
  {id:"s87", q:"A regular #6 should weigh:", o:["5.75 oz","5.3 oz","4.75 oz","5.85 oz"], a:"5.3 oz", why:"1.2 oz of provolone and 4.1 oz of roast beef."},
  {id:"s88", q:"A regular #3, ham and provolone, should weigh:", o:["5.5 oz","5.3 oz","4.75 oz","6.4 oz"], a:"4.75 oz", why:"1.2 oz of provolone and 3.55 oz of ham."},
  {id:"s89", q:"How much provolone goes on a regular, on almost every sub?", o:["1.2 oz","2 oz","0.8 oz","1.5 oz"], a:"1.2 oz", why:"2 oz on a giant, 1.2 oz on a regular, 0.8 oz on a mini. Only the Veggie gets more."},
  {id:"s90", q:"How much provolone goes on a mini?", o:["1.2 oz","0.55 oz","0.8 oz","1 oz"], a:"0.8 oz", why:"2, 1.2 and 0.8: giant, regular, mini."},
  {id:"s91", q:"How many slices of bacon go on a giant BLT?", o:["4 slices","6 slices","8 slices","12 slices"], a:"12 slices", why:"12 on a giant, 6 on a regular, 4 on a mini."},
  {id:"s92", q:"How many slices of bacon go on a mini BLT?", o:["4 slices","2 slices","1 slice","6 slices"], a:"4 slices", why:"12 on a giant, 6 on a regular, 4 on a mini."},
  {id:"s93", q:"A quick check on meat thickness: 3 slices of ham should weigh:", o:["1.2 oz","1.8 oz","2 oz","2.95 oz"], a:"1.8 oz", why:"The sheet's check. For cheese it's 5 slices of provolone to 2 oz."},
  {id:"s94", q:"On the #9, the first thing sliced is:", o:["Turkey","Roast beef","Swiss cheese","Provolone"], a:"Swiss cheese", why:"Swiss, then turkey, then roast beef. Bacon goes on the lid."},
  {id:"s95", q:"On the #8 Club Sub, what is sliced right after the provolone?", o:["Turkey","Bacon","Roast beef","Ham"], a:"Ham", why:"Provolone, ham, turkey: the order the sheet lists them."},
  {id:"s96", q:"Tuna on a regular #10 should weigh:", o:["5.5 oz","3.25 oz","4.75 oz","10 oz"], a:"5.5 oz", why:"10 oz on a giant, 5.5 on a regular, 3.25 on a mini, in an even layer."},
  {id:"s97", q:"How many pepper rings go on a giant #14, the Veggie?", o:["2 rings","3 rings","5 rings","8 rings"], a:"5 rings", why:"5 on a giant, 3 on a regular, 2 on a mini."},
  {id:"s98", q:"Is a giant twice the weight of a regular?", o:["Yes, always double","No, each size has its own weight","Only on the Italians","Only the cheese doubles"], a:"No, each size has its own weight", why:"The #7 is 9.2 oz as a giant and 5.5 oz as a regular. Learn each size."},
  {id:"s99", q:"Which six subs does the sign by the slicer list?", o:["The six with bacon","The six newest","The top selling cold subs","The six lightest"], a:"The top selling cold subs", why:"The #7, #13, #8, #9, #6 and #3. Learn those weights first."},
  {id:"s100", q:"When a meat or cheese is delivered, you:", o:["Slice it right away","Weigh it and date it","Put it straight in the display","Unwrap it to air out"], a:"Weigh it and date it", why:"Weigh it and write the delivery date on it. The use-by date is already printed."},
  {id:"s101", q:"How often is the meat case emptied and cleaned?", o:["Weekly","Every 4 hours","Once a month","Only when it looks dirty"], a:"Weekly", why:"Empty it and clean it every week."},
  {id:"s102", q:"New product goes into the display. Where does the extra go?", o:["On top of the meat case","In the freezer","In the walk-in","Behind the slicer"], a:"In the walk-in", why:"Rotate new product into the display and the excess into the walk-in."},
  {id:"s103", q:"How much room is left between the display and the front glass?", o:["None, pack it tight","1 inch","6 inches","3 inches"], a:"3 inches", why:"A 3-inch gap lets air flow. Don't line the case with paper."},
  {id:"s104", q:"The slicer is fully cleaned four times a day. Which is one of them?", o:["Before the lunch rush","After prepping and sharpening","After every giant","At the first break"], a:"After prepping and sharpening", why:"After prepping and sharpening, after the lunch rush, before the dinner rush, and at closing."},
  {id:"s105", q:"After a full clean, the time is:", o:["Texted to the manager","Left to memory","Written on the day dot","Written on the slicer cleaning tracking form"], a:"Written on the slicer cleaning tracking form", why:"Record the time on the form after every full clean."}
]);
BANKS.team = BANKS.team.concat([
  {id:"l33", q:"At the sprinkling area, which pan sits nearest the slicer?", o:["Tomatoes","Onions","Bacon","Mayo"], a:"Tomatoes", why:"From the slicer: tomatoes, lettuce, onions, then mayo and the relish. Bacon is at the far end."},
  {id:"l34", q:"What goes under the sprinkling board?", o:["Deli paper","A towel","Nothing","A sheet pan"], a:"A towel", why:"The board sits on a towel."},
  {id:"l35", q:"How big is the sprinkling board?", o:["12 by 12 inches","24 by 36 inches","15 by 20 inches","10 by 30 inches"], a:"15 by 20 inches", why:"15 inches by 20, or up to 30 long."},
  {id:"l36", q:"The lettuce pan is running low in a rush. Where do you restock it?", o:["Right on the sprinkling board","At the slicer","On the back counter or in the kitchen","At the register"], a:"On the back counter or in the kitchen", why:"Keep the drop-in fully stocked, and do the restocking off the line."},
  {id:"l37", q:"A guest wants their sub cut in thirds. Where do you cut it?", o:["On the sprinkling board","At the wrapping station","In the trough","On the meat case"], a:"At the wrapping station", why:"Don't cut on the sprinkling board. The wrapper closes the sub and cuts it."},
  {id:"l38", q:"Backup pans of extras are prepared with:", o:["Extra juice for flavor","Ice on top","The lids off","The juices drained"], a:"The juices drained", why:"Backups of extras are prepared with their juices drained."}
]);
MODS = MODS.concat([
  {id:"weights", bank:"slicer", q:ids("s", 78, 99)},
  {id:"meatcase", bank:"slicer", q:ids("s", 100, 103)},
  {id:"sprkarea", bank:"team", q:ids("l", 33, 38)}
]);
MODS.forEach(function(m){ if (m.id === "sclean") m.q = m.q.concat(["s104", "s105"]); });
