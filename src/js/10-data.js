/* ---------- the board (matched to the store's menu board, Nov 2, 2026) ---------- */
var MW = ['Onions','Lettuce','Tomatoes','Red wine vinegar','Olive oil blend','Oregano','Salt'];

var SUBS = [
  {id:1, n:1, name:"BLT", type:"cold", offBoard:true, cheese:[], meats:["Bacon"], fixed:["Lettuce","Tomatoes","Mayo"], mw:false, fam:"solo",
   delta:"Bacon, lettuce, tomato, mayo. The one cold sub that is not Mike's Way by default. Add it only if the guest asks."},
  {id:2, n:2, name:"Jersey Shore's Favorite", type:"cold", cheese:["Provolone"], meats:["Ham","Cappacuolo"], fixed:[], mw:true, fam:"italian",
   delta:"Ham and Provolone (the #3) plus cappacuolo."},
  {id:3, n:3, name:"Ham and Provolone", type:"cold", cheese:["Provolone"], meats:["Ham"], fixed:[], mw:true, fam:"italian",
   delta:"The bottom of the Italian ladder. On the board it sits under American Classics."},
  {id:4, n:4, name:"The Number Four", type:"cold", offBoard:true, cheese:["Provolone"], meats:["Prosciuttini","Cappacuolo"], fixed:[], mw:true, fam:"italian",
   delta:"Jersey Shore's Favorite (the #2) with prosciuttini instead of ham."},
  {id:5, n:5, name:"The Super Sub", type:"cold", cheese:["Provolone"], meats:["Ham","Prosciuttini","Cappacuolo"], fixed:[], mw:true, fam:"italian",
   delta:"Jersey Shore's Favorite (the #2) plus prosciuttini. Three meats."},
  {id:6, n:6, name:"Roast Beef and Provolone", type:"cold", cheese:["Provolone"], meats:["Roast beef"], fixed:[], mw:true, saltRows:2, fam:"classic",
   delta:"Roast beef cooked in the store. The only sub that gets two rows of salt."},
  {id:7, n:7, name:"Turkey and Provolone", type:"cold", cheese:["Provolone"], meats:["Turkey"], fixed:[], mw:true, fam:"classic",
   delta:"One of the most popular, with the #13."},
  {id:8, n:8, name:"Club Sub", type:"cold", cheese:["Provolone"], meats:["Turkey","Ham"], fixed:[], lid:["Mayo","Bacon"], mw:true, fam:"club",
   delta:"Turkey and ham, with mayo and bacon on the lid automatically."},
  {id:9, n:9, name:"Club Supreme", type:"cold", cheese:["Swiss"], meats:["Roast beef","Turkey"], fixed:[], lid:["Mayo","Bacon"], mw:true, fam:"club",
   delta:"The Club Sub (the #8) with roast beef instead of ham and Swiss instead of provolone. Mayo and bacon on the lid."},
  {id:10, n:10, name:"Tuna Fish", type:"cold", cheese:[], meats:["Tuna salad"], fixed:[], mw:true, fam:"classic",
   delta:"Tuna salad made in the store. No cheese. Mike's Way."},
  {id:11, n:11, name:"Stickball Special", type:"cold", offBoard:true, cheese:["Provolone"], meats:["Ham","Salami"], fixed:[], mw:true, fam:"italian",
   delta:"Jersey Shore's Favorite (the #2) with salami instead of cappacuolo."},
  {id:12, n:12, name:"Cancro Special", type:"cold", offBoard:true, cheese:["Provolone"], meats:["Roast beef","Pepperoni"], fixed:[], mw:true, fam:"classic",
   delta:"Roast Beef and Provolone (the #6) plus pepperoni."},
  {id:13, n:13, name:"The Original Italian", type:"cold", cheese:["Provolone"], meats:["Ham","Prosciuttini","Cappacuolo","Salami","Pepperoni"], fixed:[], mw:true, fam:"italian",
   delta:"The Super Sub (the #5) plus salami and pepperoni. Five meats. When a guest says \"the Italian,\" this is it."},
  {id:14, n:14, name:"The Veggie", type:"cold", cheese:["Swiss","Provolone"], meats:[], fixed:["Green bell peppers"], mw:true, fam:"classic",
   delta:"Two cheeses and green peppers, no meat. Mike's Way is what puts the onions, lettuce and tomatoes on it."},

  /* Hot subs, the way the grill video builds them. lid: goes on the inside of the lid BEFORE the meat hits the grill, in this order.
     grill: goes down on the grill ahead of the meat and gets chopped in. sauce: goes on the cooked meat, before the cheese.
     finish: goes on last, once the meat is on the bread. */
  {id:16, n:16, name:"Mike's Chicken Philly", type:"hot", protein:"Chicken", grill:["Grilled onions","Grilled peppers"], cheese:["White American"], fam:"philly",
   delta:"The cheesesteak base: grilled onions, grilled peppers, white American melted on top. Nothing added."},
  {id:17, n:17, name:"Mike's Famous Philly", type:"hot", protein:"Steak", grill:["Grilled onions","Grilled peppers"], cheese:["White American"], fam:"philly",
   delta:"The cheesesteak base: grilled onions, grilled peppers, white American melted on top. Nothing added."},
  {id:26, n:26, name:"Chicken Bacon Ranch", type:"hot", protein:"Chicken", lid:["Ranch","Bacon","Tomatoes"], grill:[], cheese:["White American"], finish:["Lettuce"], fam:"chickenonly",
   delta:"Ranch is the 26. Ranch, bacon and tomatoes go on the lid first. Chicken and cheese come off the grill, and lettuce finishes it."},
  {id:31, n:31, name:"California Chicken Cheese Steak", type:"hot", offBoard:true, protein:"Chicken", lid:["Mayo","Tomatoes"], grill:[], cheese:["White American"], finish:["Lettuce"], fam:"chickenonly",
   delta:"Mayo and tomatoes on the lid first, lettuce to finish."},
  {id:42, n:42, name:"Chipotle Chicken", type:"hot", protein:"Chicken", lid:["Chipotle mayo"], grill:["Grilled onions","Grilled peppers"], cheese:["White American"], fam:"philly",
   delta:"The cheesesteak base, with chipotle mayo on the lid before the meat hits the grill."},
  {id:43, n:43, name:"Chipotle", type:"hot", protein:"Steak", lid:["Chipotle mayo"], grill:["Grilled onions","Grilled peppers"], cheese:["White American"], fam:"philly",
   delta:"The cheesesteak base, with chipotle mayo on the lid before the meat hits the grill."},
  {id:44, n:44, name:"Buffalo Chicken", type:"hot", protein:"Chicken", lid:["Blue cheese dressing","Tomatoes"], grill:[], sauce:["Frank's RedHot"], cheese:["White American"], finish:["Lettuce"], fam:"chickenonly",
   delta:"Buffalo is the 44. Blue cheese dressing and tomatoes go on the lid first. Frank's RedHot goes on the cooked chicken, then the cheese. Lettuce finishes it."},
  {id:55, n:55, name:"The Big Kahuna Chicken", type:"hot", protein:"Chicken", grill:["Grilled onions","Grilled peppers","Mushrooms","Jalapeños"], cheese:["Extra White American"], fam:"philly",
   delta:"The cheesesteak base plus mushrooms, jalapeños and extra cheese: 4 slices on a regular, not 3."},
  {id:56, n:56, name:"The Big Kahuna", type:"hot", protein:"Steak", grill:["Grilled onions","Grilled peppers","Mushrooms","Jalapeños"], cheese:["Extra White American"], fam:"philly",
   delta:"The cheesesteak base plus mushrooms, jalapeños and extra cheese: 4 slices on a regular, not 3."},
  {id:64, n:64, name:"Grilled Portabella Mushroom & Swiss", type:"hot", offBoard:true, protein:null, grill:["Portabella mushrooms","Grilled peppers","Grilled onions"], cheese:["Swiss"], fam:"philly",
   delta:"No steak, no chicken."},
  {id:65, n:65, name:"Portabella Chicken Cheese Steak", type:"hot", offBoard:true, protein:"Chicken", grill:["Portabella mushrooms","Grilled peppers","Grilled onions"], cheese:["White American"], fam:"philly",
   delta:"The cheesesteak base plus portabella mushrooms."},
  {id:66, n:66, name:"Portabella Cheese Steak", type:"hot", offBoard:true, protein:"Steak", grill:["Portabella mushrooms","Grilled peppers","Grilled onions"], cheese:["White American"], fam:"philly",
   delta:"The cheesesteak base plus portabella mushrooms."},
  {id:"lto-hotitalian", n:"LTO", name:"Mike's Hot Italian", type:"hot", lto:true, protein:null, grill:["Ham","Salami","Pepperoni"], cheese:["Provolone"], finish:["Grilled onions","Lettuce","Tomatoes","Chopped pepper relish"], finishLabel:"After", fam:"lto",
   delta:"Ham, salami and pepperoni grilled and chopped, provolone melted on, then grilled onions, lettuce, tomato and pepper relish. Limited time, and not in the grill video, so ask your trainer what goes on the lid."}
];

SUBS.forEach(function(s){ if (s.type === "hot"){ s.lid = s.lid || []; s.sauce = s.sauce || []; s.finish = s.finish || []; } });
/* a hot sub in the order it is made: the lid, what goes on the grill, the meat, any sauce on the meat, the cheese, the finish */
function hotOrder(s){ return s.lid.concat(s.grill, s.protein ? [s.protein] : [], s.sauce, s.cheese, s.finish); }
/* what the grill video gives for a regular and a giant (it gives no mini). Giants double the regular. */
var HOT_AMT = {
  regular:{"Grilled onions":"1.25 oz", "Grilled peppers":"0.75 oz", "Mushrooms":"0.75 oz", "Jalapeños":"4 to 5", "White American":"3 slices", "Extra White American":"4 slices", "Bacon":"2 slices", "Tomatoes":"3 slices", "Lettuce":"2 soufflé cups"},
  giant:{"Grilled onions":"2.5 oz", "Grilled peppers":"1.5 oz", "Mushrooms":"1.5 oz", "Jalapeños":"8 to 10", "White American":"6 slices", "Extra White American":"8 slices", "Bacon":"4 slices", "Tomatoes":"5 slices", "Lettuce":"4 soufflé cups"}
};
var HOT_ANY = {"Chipotle mayo":"3 lines", "Ranch":"3 lines", "Blue cheese dressing":"3 lines", "Mayo":"spread", "Frank's RedHot":"3 full rows"};
var HOT_AMT_IDS = [16, 17, 26, 31, 42, 43, 44, 55, 56];

var COLD_FAMS = [
  {title:"Italian Favorites: the ladder", note:"Four subs, and each one only adds meat to the one before. No swaps. It starts from the 3, which sits under American Classics on the board.", ids:[3,2,5,13]},
  {title:"American Classics", note:"Each of these stands on its own. (The 3 is here on the board too; it's in the ladder above.)", ids:[6,7,10,14]},
  {title:"Club Subs", note:"The only two that get mayo and bacon automatically, both on the lid.", ids:[8,9]}
];

var HOT_FAMS = [
  {title:"Steak and chicken pairs", note:"Base: grilled onions, grilled peppers, white American melted on top. Chicken takes the lower number in every pair.", groups:[
    {label:"Philly", delta:"The base, nothing added.", ids:[16,17]},
    {label:"Chipotle", delta:"Base, with chipotle mayo on the lid first.", ids:[42,43]},
    {label:"Big Kahuna", delta:"Base plus mushrooms, jalapeños and extra cheese.", ids:[55,56]}
  ]},
  {title:"Chicken only", note:"No grilled onions or peppers. The sauce and tomatoes go on the lid first, then chicken and white American off the grill, and lettuce last. Ranch is the 26, buffalo is the 44.", groups:[
    {label:"", delta:"", ids:[26,44], showDelta:true}
  ]},
  {title:"For a limited time", note:"Specials rotate. Learn this one last.", groups:[
    {label:"", delta:"", ids:["lto-hotitalian"]}
  ]}
];


var numbered = SUBS.filter(function(s){ return !s.lto && !s.offBoard; });

/* decks of subs you can pick, then the ones a button elsewhere starts */
var DECKS = [
  {key:"italian", label:"Italian ladder", ids:[3,2,5,13]},
  {key:"classicsclubs", label:"Classics and clubs", ids:[6,7,10,14,8,9]},
  {key:"pairs", label:"Steak and chicken pairs", ids:[16,17,42,43,55,56]},
  {key:"chickenonly", label:"Chicken only", ids:[26,44]},
  {key:"cold", label:"All cold", ids:numbered.filter(function(s){ return s.type==="cold"; }).map(function(s){ return s.id; })},
  {key:"hot", label:"All hot", ids:numbered.filter(function(s){ return s.type==="hot"; }).map(function(s){ return s.id; })},
  {key:"all", label:"Everything", ids:numbered.map(function(s){ return s.id; })},
  {key:"weak", label:"Weak spots", ids:null},
  {key:"today", label:"Today", today:true, hidden:true},
  {key:"amounts", label:"Sprinkling and the line", bank:"amounts", hidden:true},
  {key:"orient", label:"Orientation", bank:"orient", hidden:true},
  {key:"kitchen", label:"Kitchen and food safety", bank:"kitchen", hidden:true},
  {key:"wrap", label:"Cut, wrap, bag", bank:"wrap", hidden:true}
];

var MODES = [
  {key:"flash", label:"Flashcards", help:"See the number, say what's on it out loud, flip."},
  {key:"num", label:"Name the number", help:"See the name, tap its number."},
  {key:"what", label:"What's on it", help:"See what's on it, tap the sub."},
  {key:"build", label:"Build it", help:"Stack the sub in the order it goes on."},
  {key:"order", label:"Take an order", help:"A guest orders. Read it back, then build it."},
  {key:"listen", label:"Listen", help:"Hands-free. It asks, waits, then tells you."}
];
var GUESTS = ["Dana","Marcus","Keisha","Tom","Rosa","Andre","Linda","Jose","Brittany","Hank","Priya","DeShawn","Carol","Luis"];
var BREADS = ["white","white","white","wheat","wheat","rosemary parm"];

var COLD_POOL = ["Provolone","Swiss","Ham","Turkey","Roast beef","Salami","Pepperoni","Cappacuolo","Prosciuttini","Bacon","Tuna salad","Mayo","Mustard","Pickles","Jalapeños","Banana peppers","Cherry pepper relish","Green bell peppers"];
var HOT_POOL = ["Steak","Chicken","Grilled onions","Grilled peppers","Mushrooms","Jalapeños","Portabella mushrooms","Bacon","Lettuce","Tomatoes","Ranch","Mayo","Chipotle mayo","Frank's RedHot","Blue cheese dressing","Swiss","White American","Provolone"];


/* ---------- layer colors ---------- */
var LAYERS = {
  "Bread":{fill:"#D9A76A", ink:"#3B2A14", pat:"p-grain"},
  "Provolone":{fill:"#F2E3AE", ink:"#4A3A12", cue:"Pale yellow, mild. The default cheese on cold subs."},
  "Swiss":{fill:"#F6EDC7", ink:"#4A3A12", pat:"p-holes", cue:"Pale and nutty, the one with holes. Only on #9 and #14."},
  "White American":{fill:"#FBF5E4", ink:"#4A3A12", cue:"Soft ivory slices made for melting. On every cheesesteak."},
  "Extra White American":{fill:"#FBF5E4", ink:"#4A3A12"},
  "Ham":{fill:"#EDA4AA", ink:"#4A1F25", cue:"Plain pink boiled ham."},
  "Cappacuolo":{fill:"#9E2F38", ink:"#FFF4EC", pat:"p-marble", cue:"Dark red, marbled with fat, spice on the outside. The hot one. Say cap-uh-COLE-oh."},
  "Prosciuttini":{fill:"#E59CA6", ink:"#3A1A20", pat:"p-pepper", cue:"Rosy ham rolled in cracked black pepper, so the rim is dark."},
  "Salami":{fill:"#AD3A44", ink:"#FFF4EC", pat:"p-dots", cue:"Brick red with white flecks of fat. Mild and a little garlicky."},
  "Pepperoni":{fill:"#C4452C", ink:"#FFF4EC", pat:"p-dark-dots", cue:"Orange-red, smaller, a little smoky heat. Pizza pepperoni, sliced thin."},
  "Turkey":{fill:"#F1E2D2", ink:"#4A3A2A", cue:"Almost white. Lean."},
  "Roast beef":{fill:"#7E4538", ink:"#FFF4EC", pat:"p-marble-soft", cue:"Dark edge, pink middle. Roasted in the store."},
  "Bacon":{fill:"#A94E38", ink:"#FFF4EC", pat:"p-stripes", cue:"Applewood smoked strips."},
  "Tuna salad":{fill:"#E6D7BE", ink:"#4A3A2A", pat:"p-flecks", cue:"Tuna and mayo, mixed in the store."},
  "Green bell peppers":{fill:"#6CAB5A", ink:"#10300E"},
  "Mayo":{fill:"#FBF8EC", ink:"#4A3A2A", thin:true},
  "Onions":{fill:"#E8DFF2", ink:"#3B2A4A", pat:"p-rings"},
  "Lettuce":{fill:"#BEE2A0", ink:"#1E3A14", pat:"p-shreds"},
  "Tomatoes":{fill:"#E05A4E", ink:"#FFF4EC", pat:"p-seeds"},
  "Red wine vinegar":{fill:"#8A2A3D", ink:"#FFF0F3", thin:true},
  "Olive oil blend":{fill:"#D9C86E", ink:"#3A3210", thin:true},
  "Oregano":{fill:"#E6EDD6", ink:"#2A3A1A", thin:true, pat:"p-herb"},
  "Salt":{fill:"#F5F5F5", ink:"#444444", thin:true, pat:"p-salt"},
  "Steak":{fill:"#6A3E33", ink:"#FFF4EC"},
  "Chicken":{fill:"#E8CCA6", ink:"#3A2A12"},
  "Grilled onions":{fill:"#D6B27C", ink:"#3A2A12", pat:"p-rings"},
  "Grilled peppers":{fill:"#7FA85E", ink:"#10300E"},
  "Mushrooms":{fill:"#B3987B", ink:"#2A1F14"},
  "Jalapeños":{fill:"#4F8B40", ink:"#F0FFE8", pat:"p-seeds"},
  "Portabella mushrooms":{fill:"#6E5541", ink:"#FFF4EC"},
  "Ranch":{fill:"#F3F0E4", ink:"#3A3A2A", thin:true},
  "Blue cheese dressing":{fill:"#ECEEF3", ink:"#2A2A3A", thin:true},
  "Chipotle mayo":{fill:"#E9A572", ink:"#3A1F0A", thin:true},
  "Frank's RedHot":{fill:"#D23A2A", ink:"#FFF4EC", thin:true},
  "Smoky Southwest sauce":{fill:"#B96B3C", ink:"#FFF4EC", thin:true},
  "Salsa Verde sauce":{fill:"#8FBE5A", ink:"#10300E", thin:true},
  "Chopped pepper relish":{fill:"#C8432F", ink:"#FFF4EC", thin:true},
  "Pickles":{fill:"#9DBB5C", ink:"#1E3A14"},
  "Banana peppers":{fill:"#E6D36A", ink:"#3A3210"},
  "Mustard":{fill:"#E3B23C", ink:"#3A2A0A", thin:true},
  "Cherry pepper relish":{fill:"#C8432F", ink:"#FFF4EC", thin:true},
  "MW":{fill:"#24406A", ink:"#FFFFFF"}
};
var LEGEND_ORDER = ["Provolone","Swiss","White American","Ham","Cappacuolo","Prosciuttini","Salami","Pepperoni","Turkey","Roast beef","Bacon","Tuna salad"];

/* ---------- amounts by size (from the sprinkling videos) ---------- */
var SIZES = ["mini","regular","giant"];
var SIZE_LABEL = {mini:"Mini", regular:"Regular", giant:"Giant"};
var AMT = {
  mini:{Onions:"2 to 3 rings", Lettuce:"2 soufflé cups", Tomatoes:"2 slices", juice:"½ oz", top:"3 to 4", bacon:"1 strip"},
  regular:{Onions:"4 to 6 rings", Lettuce:"3 soufflé cups", Tomatoes:"3 slices", juice:"1 oz", top:"4 to 5", bacon:"2 strips"},
  giant:{Onions:"8 to 10 rings", Lettuce:"5 soufflé cups", Tomatoes:"5 slices", juice:"2 oz", top:"8 to 10", bacon:"4 strips"}
};
var TOP_EXTRAS = ["Pickles","Banana peppers","Jalapeños"];
var LID_ORDER = ["Mayo","Mustard","Cherry pepper relish","Bacon"];

/* ---------- question banks ---------- */
var BANKS = {
  amounts:[
    {id:"a1", q:"How many onion rings go on a regular?", o:["2 to 3","4 to 6","8 to 10","3 to 4"], a:"4 to 6", why:"Mini 2 to 3, regular 4 to 6, giant 8 to 10. Taste, not texture."},
    {id:"a2", q:"How many onion rings go on a giant?", o:["4 to 6","8 to 10","5","12 to 14"], a:"8 to 10", why:"Mini 2 to 3, regular 4 to 6, giant 8 to 10."},
    {id:"a3", q:"How much lettuce goes on a regular?", o:["2 soufflé cups","3 soufflé cups","5 soufflé cups","1 handful"], a:"3 soufflé cups", why:"Mini 2, regular 3, giant 5. Piled high with a flat top."},
    {id:"a4", q:"How much lettuce goes on a giant?", o:["3 soufflé cups","4 soufflé cups","5 soufflé cups","8 soufflé cups"], a:"5 soufflé cups", why:"Mini 2, regular 3, giant 5."},
    {id:"a5", q:"How many tomato slices go on a mini?", o:["1","2","3","5"], a:"2", why:"Mini 2, regular 3, giant 5. Dealt like cards, no overlap."},
    {id:"a6", q:"How many tomato slices go on a giant?", o:["3","4","5","8"], a:"5", why:"Mini 2, regular 3, giant 5."},
    {id:"a7", q:"How many rows of red wine vinegar?", o:["1","2","3","It depends on the size"], a:"2", why:"Two rows of vinegar and three rows of oil, on every size."},
    {id:"a8", q:"How many rows of olive oil blend?", o:["1","2","3","It depends on the size"], a:"3", why:"Two rows of vinegar and three rows of oil, on every size."},
    {id:"a9", q:"How much of each juice ends up on a regular?", o:["½ oz","1 oz","2 oz","3 oz"], a:"1 oz", why:"The rows give a mini ½ oz, a regular 1 oz and a giant 2 oz of each."},
    {id:"a10", q:"How many rows of oregano?", o:["1","2","3","None on a mini"], a:"2", why:"Two rows of oregano, down one side and back up the other. One row of salt."},
    {id:"a11", q:"Which sub gets two rows of salt?", o:["#6 Roast Beef and Provolone","#13 The Original Italian","#9 Club Supreme","#7 Turkey and Provolone"], a:"#6 Roast Beef and Provolone", why:"Only the #6. The extra salt brings out the roast beef."},
    {id:"a12", q:"How many bacon strips on a regular club?", o:["1","2","3","4"], a:"2", why:"Mini 1, regular 2, giant 4. On the lid."},
    {id:"a13", q:"Pickles, banana peppers or jalapeños on a regular: how many?", o:["3 to 4","4 to 5","8 to 10","2"], a:"4 to 5", why:"Mini 3 to 4, regular 4 to 5, giant 8 to 10, on top of the tomatoes."},
    {id:"a14", q:"Where do pickles, banana peppers and jalapeños go?", o:["On top of the tomatoes","On the lid, with the mayo","Under the cheese, on the bread","Between the meats, in the middle"], a:"On top of the tomatoes", why:"Extras go on after all of Mike's Way. The peppers and pickles sit on the tomatoes."},
    {id:"a15", q:"Where do mayo, mustard, relish and bacon go?", o:["On the lid","On top of the tomatoes","Under the meat","In a cup on the side"], a:"On the lid", why:"Mayo, sauces, cherry pepper relish and bacon all go on the lid."},
    {id:"a16", q:"A guest wants mayo and cherry pepper relish. Which goes on first?", o:["Mayo","Cherry pepper relish","Doesn't matter","Mix them together"], a:"Mayo", why:"Mayo first, then relish. Mayo also goes under bacon so the bacon sticks."},
    {id:"a17", q:"Mustard or another sauce: how much?", o:["3 lines on the lid","2 rows over the tomatoes","1 line on the bottom bread","A squirt in the middle"], a:"3 lines on the lid", why:"Three lines on the lid."},
    {id:"a18", q:"Where does every topping start?", o:["At the end closest to the guest","At the end closest to you","In the middle, working outward","Wherever there's the most room"], a:"At the end closest to the guest", why:"Start at the guest's end, spread it evenly, cover both ends."},
    {id:"a19", q:"Which end of the sub do people miss most?", o:["The end closest to you","The end closest to the guest","The middle","The lid"], a:"The end closest to you", why:"The end closest to you is the one that gets missed. Check it every time."},
    {id:"a20", q:"How far above the sub do you hold the vinegar and oil bottle?", o:["About 2 inches","About 6 inches","Touching the bread","About a foot"], a:"About 2 inches", why:"Cap about 2 inches off the sub. Higher and it splashes. Listen for a swish, not a chop."},
    {id:"a21", q:"What's the rule for onions?", o:["Taste, not texture","Crunch in every bite","Pile them in the middle","As many as fit"], a:"Taste, not texture", why:"Rings loosely overlapping, no clumps. The guest should taste them, not crunch them."},
    {id:"a22", q:"Do you ask guests if they want extras?", o:["No. Listen, and they'll tell you","Yes, on every sub, every time","Only on giants, to fill them out","Only on hot subs, after the grill"], a:"No. Listen, and they'll tell you", why:"Extras are by request only. Never offer them."},
    {id:"a23", q:"Which subs get mayo and bacon without anyone asking?", o:["The two clubs, #8 and #9","The turkey subs, #7 and #8","The Club Supreme and the Italian, #9 and #13","The roast beef subs, #6 and #9"], a:"The two clubs, #8 and #9", why:"The Club Sub and the Club Supreme. Both get mayo and bacon on the lid."},
    {id:"a24", q:"How do you hold the oregano and salt shakers?", o:["On their side","Straight up and down","Upside down over one spot","With both hands"], a:"On their side", why:"Shaker on its side, loose shake from the wrist."},
    {id:"a25", q:"When do you ask \"Mike's Way?\"", o:["Before any toppings go on","After the onions","Once the sub is wrapped","Only if they look unsure"], a:"Before any toppings go on", why:"Trainer's note: ask first. The answer decides everything the sprinkler does."},
    {id:"a26", q:"A guest wants Mike's Way plus banana peppers. What goes on first?", o:["All of Mike's Way, then the banana peppers","The banana peppers, then Mike's Way","Banana peppers between the lettuce and tomatoes","Doesn't matter"], a:"All of Mike's Way, then the banana peppers", why:"Mike's Way first, then the extras. Peppers and pickles sit on the tomatoes."},
    {id:"a27", q:"How do you pick up a sub to move it?", o:["By the ends","From the middle","By the wrapper only","With a spatula"], a:"By the ends", why:"Trainer's note: always grab the sub by the ends."},
    {id:"a29", q:"There's a line. How many subs do you sprinkle at once?", o:["More than one, side by side","One at a time, start to finish","Only giants first","Wait for the slicer"], a:"More than one, side by side", why:"Trainer's note, and the sprinkling video: push yourself to do more than one sub at a time."}
  ],
  orient:[
    {id:"o1", q:"How long do you scrub your hands?", o:["At least 20 seconds","About 5 seconds","10 seconds","Until the soap is gone"], a:"At least 20 seconds", why:"Hands, wrists and arms for at least 20 seconds. The ABCs time it."},
    {id:"o2", q:"How much hand soap?", o:["About the size of a quarter","About the size of a dime","Enough to fill your palm","Two pumps, whatever the size"], a:"About the size of a quarter", why:"A quarter-sized amount, then lather and scrub."},
    {id:"o3", q:"How do you turn the faucet off after washing?", o:["With the towel","With your clean hand","With your elbow","Leave it running"], a:"With the towel", why:"Dry your hands, then use the towel on the faucet."},
    {id:"o4", q:"What's the temperature danger zone?", o:["41°F to 135°F","32°F to 100°F","50°F to 150°F","70°F to 165°F"], a:"41°F to 135°F", why:"Food left between 41°F and 135°F too long is time and temperature abuse."},
    {id:"o5", q:"What's the leading cause of foodborne illness in the U.S.?", o:["Norovirus","Salmonella","E. coli","Mold"], a:"Norovirus", why:"Norovirus. The food safety video calls it the bad boy of the five."},
    {id:"o6", q:"Which of these does NOT mean you stay home?", o:["A cut you bandaged and covered with a glove","A fever, with or without a sore throat","Vomiting or diarrhea in the last day","Jaundice, which shows as yellow skin"], a:"A cut you bandaged and covered with a glove", why:"Stay home with fever, vomiting, diarrhea, sore throat with fever or jaundice. A covered cut is fine."},
    {id:"o7", q:"You're diagnosed with hepatitis A, E. coli, salmonella, shigella or norovirus. You:", o:["Stay home and report it to the health department","Wear two pairs of gloves and work as normal","Work the register only, away from the food","Tell a coworker and keep it off the schedule"], a:"Stay home and report it to the health department", why:"Those five must be reported to the health department or medical authority."},
    {id:"o8", q:"You just took a guest's cash. Next you:", o:["Wash your hands and put on new gloves","Keep the same gloves on and keep moving","Wipe your gloves on a sanitizer towel","Rinse the gloves at the hand sink"], a:"Wash your hands and put on new gloves", why:"Never touch money with gloves and then touch food. Guests watch for this."},
    {id:"o9", q:"Before putting on gloves you:", o:["Wash your hands","Shake them out","Put on hand lotion","Nothing"], a:"Wash your hands", why:"Always wash before gloves, and pick a pair that fits."},
    {id:"o10", q:"Unwashed produce can carry which bacteria?", o:["Shigella","Botulism","Staph","Listeria"], a:"Shigella", why:"Produce isn't cooked, so washing it is the only way to remove shigella."},
    {id:"o11", q:"The four kinds of microorganisms are:", o:["Bacteria, viruses, molds and mildews","Germs, dirt, grease and dust","Salmonella, staph, norovirus and E. coli","Bacteria, yeast, mold and rust"], a:"Bacteria, viruses, molds and mildews", why:"Those are the enemy. The five hazards are their weapons."},
    {id:"o12", q:"Which is one of the five hazards to food?", o:["Cross-contamination","Loud music on the line","A long line of guests","Bread that has gone cold"], a:"Cross-contamination", why:"Time and temperature abuse, cross-contamination, poor hygiene, poor cleaning, and unwashed produce."},
    {id:"o13", q:"What do you call the cloth you wipe tables with?", o:["A towel","A rag","A wipe","A cloth"], a:"A towel", why:"Always a towel, never a rag."},
    {id:"o14", q:"Can you take a spray bottle out to the tables?", o:["Never","Yes, if it's sanitizer","Only after close","Only if no one is sitting"], a:"Never", why:"You and the guests could breathe the chemicals."},
    {id:"o15", q:"How many towels when you check tables?", o:["Two: one for tabletops, one for seats","One towel for everything, rinsed often","Three: tables, seats and the floor","None: napkins from the dispenser"], a:"Two: one for tabletops, one for seats", why:"Separate towels, kept out of the guests' sight."},
    {id:"o16", q:"Dining room or kitchen first?", o:["Dining room first","Kitchen first","Whichever is dirtier","Whatever the slicer says"], a:"Dining room first", why:"Dining room first, kitchen second."},
    {id:"o17", q:"Jersey Mike's sums up banter in three words:", o:["Share your life","Smile and wave","Keep it moving","Ask about them"], a:"Share your life", why:"Natural conversation beyond the order. Smile, eye contact, match their mood."},
    {id:"o18", q:"What does sense of urgency mean here?", o:["Move with purpose, safely, right before quick","Go as fast as you can, and fix mistakes after","Skip the small steps whenever there's a line","Rush the guest along so the line keeps moving"], a:"Move with purpose, safely, right before quick", why:"Safety first. Do it right before doing it quick."},
    {id:"o19", q:"On the P&L, food, beverage and paper (cost of goods used) should be about:", o:["30%","20%","50%","10%"], a:"30%", why:"Goods 30, labor 20, expenses 30, profit goal 20."},
    {id:"o20", q:"Labor on the P&L should be about:", o:["20%","30%","12%","50%"], a:"20%", why:"20 total: hourly crew 12 to 14, salaried managers 6 to 8."},
    {id:"o21", q:"What's the profit goal on the bottom line?", o:["20%","30%","50%","5%"], a:"20%", why:"100 minus 30 goods, 20 labor and 30 expenses leaves 20."},
    {id:"o22", q:"Which are fixed costs?", o:["Rent and utilities","Food and paper","Hourly labor","Bread and meat"], a:"Rent and utilities", why:"Fixed costs stay the same no matter the sales. Goods and labor are variable."},
    {id:"o23", q:"EBITDA stands for:", o:["Earnings Before Interest, Taxes, Depreciation and Amortization","Every Business Is Tracked Daily And Audited","Earnings, Bills, Interest, Taxes, Debt, Assets","Expenses Before Income, Taxes and Debt"], a:"Earnings Before Interest, Taxes, Depreciation and Amortization", why:"The 20% still has those to pay."},
    {id:"o24", q:"How long can facial hair be?", o:["A quarter inch","Half an inch","Any length with a net","No facial hair at all"], a:"A quarter inch", why:"Trimmed to a quarter inch or less, shaved around every shift."},
    {id:"o25", q:"Which jewelry is allowed?", o:["One plain band ring","A smartwatch, if silenced","One bracelet per wrist","Any rings without stones"], a:"One plain band ring", why:"No watches, smartwatches or bracelets. Necklaces tucked under the shirt."},
    {id:"o26", q:"Undershirts must be:", o:["White or navy blue","Any solid color","Black or dark gray","A logo shirt only"], a:"White or navy blue", why:"Long sleeves are fine if they're form fitting."},
    {id:"o27", q:"What's the mission?", o:["Make a difference, one sub at a time","Serve the fastest subs in every town","Bring the juice to every single guest","Be a sub above, one guest at a time"], a:"Make a difference, one sub at a time", why:"\"A sub above\" is the slogan. \"Bring the juice\" is a core value."},
    {id:"o28", q:"\"Bring the juice\" means:", o:["The extra and the unexpected","More vinegar and oil on every sub","Upsell a drink with every order","Work faster when there is a line"], a:"The extra and the unexpected", why:"In how you serve guests, support the team and keep the standards."},
    {id:"o29", q:"\"We give to give\" means:", o:["Give without expecting anything back","Give discounts to your regular guests","Give 110 percent on every single shift","Give the guest extra meat when asked"], a:"Give without expecting anything back", why:"Passion, time, talent and attention, not to get something back."}
  ],
  kitchen:[
    {id:"o30", q:"FIFO stands for:", o:["First in, first out","Fresh in, fresh out","First in, final out","Food in, food out"], a:"First in, first out", why:"Oldest product gets used first, in every storage area."},
    {id:"o31", q:"Restocking the sandwich unit, new product goes:", o:["In a fresh pan, on the bottom, old on top","On top of the old product, in the same pan","In the same pan, stirred in with the old","Straight into the drop-in, during service"], a:"In a fresh pan, on the bottom, old on top", why:"Fresh pan every time. New on the bottom, existing on top. Never restock straight into the drop-in."},
    {id:"o32", q:"A sauce bottle is almost empty. You:", o:["Use it until empty, then wash, rinse, sanitize and fill","Top it off with fresh sauce so it never runs out on the line","Pour what's left into a new bottle and fill that one up","Mix the old sauce into the new batch so none gets wasted"], a:"Use it until empty, then wash, rinse, sanitize and fill", why:"Never refill. Never new sauce on top of old."},
    {id:"o33", q:"How full do you fill the backup pans?", o:["About 3/4","All the way","Half","A quarter"], a:"About 3/4", why:"Three quarters makes FIFO easier."},
    {id:"o34", q:"Vinegar and oil bottles get emptied, washed, rinsed and sanitized:", o:["At least once a week","Every shift","Once a month","Only when they look dirty"], a:"At least once a week", why:"At least weekly."},
    {id:"o35", q:"Prepped food that won't be used within 24 hours gets:", o:["Labeled with its expiration date","Thrown out at the end of the shift","Frozen until the next delivery","Moved to the front of the drop-in"], a:"Labeled with its expiration date", why:"Tuna is the classic example."},
    {id:"o36", q:"How often are temperatures taken and logged?", o:["3 times a day","Once a day","Every hour","Once a week"], a:"3 times a day", why:"Three times a day, on the daily checklist."},
    {id:"o37", q:"How long are temperature logs kept?", o:["3 months","1 week","1 month","1 year"], a:"3 months", why:"Three months, to prove what you served was safe."},
    {id:"o38", q:"Roast beef has to hold:", o:["140°F for 12 minutes","165°F for 15 seconds","135°F for 1 minute","120°F for 20 minutes"], a:"140°F for 12 minutes", why:"Roast beef 140 for 12 minutes. Meatballs 165 for 15 seconds."},
    {id:"o39", q:"Meatballs have to hold:", o:["165°F for 15 seconds","140°F for 12 minutes","150°F for 1 minute","135°F for 15 seconds"], a:"165°F for 15 seconds", why:"Meatballs 165 for 15 seconds. Roast beef 140 for 12 minutes."},
    {id:"o40", q:"The infrared gun thermometer is for:", o:["Surfaces like the grill top, never internal temps","Roast beef in the oven, through the door glass","Checking the tuna and other cold prepped food","Anything at all, since it is the most accurate"], a:"Surfaces like the grill top, never internal temps", why:"Internal temps only with a probe."},
    {id:"o41", q:"The most accurate everyday thermometer is:", o:["The digital probe","The bimetallic stem","The infrared gun","The oven thermostat"], a:"The digital probe", why:"Needs very little calibrating. The bimetallic stem needs constant ice-point calibration."},
    {id:"o42", q:"Food contact surfaces get cleaned and sanitized every:", o:["4 hours of continuous use","8 hours, once per shift","2 hours, on the dot","Day, at closing time only"], a:"4 hours of continuous use", why:"And before and after use. The slicer comes apart for it."},
    {id:"o43", q:"Sink one in the three-compartment sink is:", o:["Hot soapy water, at least 110°F","Sanitizer, tested with a strip","Clear rinse water, no soap","Cold water to soak the knives"], a:"Hot soapy water, at least 110°F", why:"Wash, rinse, sanitize. Sink two starts empty, sink three is sanitizer."},
    {id:"o44", q:"How long do dishes sit in the sanitizer?", o:["At least 30 seconds","About 5 seconds","At least 2 minutes","Until they are dry"], a:"At least 30 seconds", why:"Thirty seconds in, then air dry at least 30 seconds."},
    {id:"o45", q:"Chlorine sanitizer concentration:", o:["50 to 200 ppm","200 to 500 ppm","10 to 50 ppm","500 to 1000 ppm"], a:"50 to 200 ppm", why:"Chlorine 50 to 200. Quats 200 to 500."},
    {id:"o46", q:"Quats (quaternary ammonium) concentration:", o:["200 to 500 ppm","50 to 200 ppm","100 ppm exactly","1000 ppm"], a:"200 to 500 ppm", why:"Quats 200 to 500. Chlorine 50 to 200."},
    {id:"o47", q:"How full is a red sanitizer bucket?", o:["One third","Half","Full","A quarter"], a:"One third", why:"One third full, clean bucket, towels submerged, one per station."},
    {id:"o48", q:"Which station shares a sanitizer bucket?", o:["Sprinkler and wrapper","Slicer and grill","Prep and dining room","Nobody shares"], a:"Sprinkler and wrapper", why:"Slicer, grill, prep and dining room each get their own."},
    {id:"o49", q:"Washing a knife, you:", o:["Take it all the way through wash, rinse, sanitize and never leave it in the sink","Leave it soaking in the soapy sink until the rush is over, then finish it","Rinse it under the tap and set it back on the cutting board to air dry","Wipe both sides on a sanitizer towel and put it straight back to work"], a:"Take it all the way through wash, rinse, sanitize and never leave it in the sink", why:"A knife left in the sink cuts someone."},
    {id:"o50", q:"You see evidence of pests. You:", o:["Report it to the manager right away","Spray it yourself before guests notice","Set a trap and check it at closing","Ignore it unless you see a live one"], a:"Report it to the manager right away", why:"Never apply pesticide yourself; the manager calls the pest company."},
    {id:"o51", q:"The most common physical contaminant in food is:", o:["Hair","Glass","A staple","A band-aid"], a:"Hair", why:"Hat or visor, hair pulled back and covered."},
    {id:"o52", q:"Too-strong sanitizer is which kind of hazard?", o:["Chemical","Physical","Biological","Not a hazard"], a:"Chemical", why:"Detergents, pesticides, cleaners and allergens are chemical hazards too."},
    {id:"o53", q:"One of the most dangerous things you can do in the restaurant:", o:["Slice a tomato straight out of the box","Cut a giant into six pieces instead of four","Pop the bag back toward you, not forward","Mix quats sanitizer for the red buckets"], a:"Slice a tomato straight out of the box", why:"Only slice tomatoes that have been washed."},
    {id:"o54", q:"Rinsing lettuce, the head goes:", o:["Core side down, rinsed around, never water poured in","Core side up, with cold water running straight into it","On its side, outer leaves left on to protect the rest","Into a full sink to soak, then shaken dry over the drain"], a:"Core side down, rinsed around, never water poured in", why:"Outer leaves removed and tossed first."},
    {id:"o55", q:"Celery is rinsed:", o:["30 seconds each half, 1 minute total","10 seconds for the whole bunch","5 minutes under running water","Not at all, because it gets cooked"], a:"30 seconds each half, 1 minute total", why:"Downward motion, between the stalks. Slice to 3/16, skip the last 2 inches."},
    {id:"o56", q:"How thick is a celery slice?", o:["3/16 inch, same as a tomato","1/2 inch, a thick chunk","1/8 inch, paper thin","A quarter inch, about a pencil"], a:"3/16 inch, same as a tomato", why:"Same thickness as a tomato slice."}
  ],
  wrap:[
    {id:"o57", q:"Cutting a sub, the motion is:", o:["Cup, up, down","Up, cup, down","Down, cup, up","Grip, press, pull"], a:"Cup, up, down", why:"Cup all five fingers over the blade, bring the knife up to your hand, then down on the sub."},
    {id:"o58", q:"A giant gets cut in:", o:["Quarters","Halves","Thirds","Sixths"], a:"Quarters", why:"Mini half, regular half, giant quarters, without asking."},
    {id:"o59", q:"You cut the paper. You:", o:["Finish wrapping, then wrap it again with another sheet","Start over: unwrap it and move the sub to new paper","Tape the cut closed and bag it so nothing leaks out","Bag it as it is, since the bag covers the cut anyway"], a:"Finish wrapping, then wrap it again with another sheet", why:"Double wrap it."},
    {id:"o60", q:"When do you always clean the knife?", o:["After tuna and subs with mayo","Only at close, with the slicer","After every tenth sub you cut","Only between shifts, never mid rush"], a:"After tuna and subs with mayo", why:"Clean it whenever it needs it, and always after those."},
    {id:"o61", q:"Paper for a regular sub:", o:["15 inches","12 inches","21 inches","18 inches"], a:"15 inches", why:"Mini 12, regular 15, giant 21."},
    {id:"o62", q:"Paper for a giant:", o:["21 inches","15 inches","24 inches","18 inches"], a:"21 inches", why:"Mini 12, regular 15, giant 21."},
    {id:"o63", q:"The sub goes on the paper:", o:["Centered, diagonal, ends to the corners","Straight across the middle, ends to the sides","Along the edge nearest you, to roll away","Anywhere at all, since it gets rolled up"], a:"Centered, diagonal, ends to the corners", why:"Logo side down, one sheet at a time."},
    {id:"o64", q:"Pinch, pull over, punch is:", o:["The first fold of the wrap","How you pop the bag","How you cut the sub","How you crease the bag"], a:"The first fold of the wrap", why:"Pinch the near corner, pull it over the sub, punch it into the counter."},
    {id:"o65", q:"The roll goes:", o:["Bottom, side, top","Top, side, bottom","Side, bottom, top","However it lands"], a:"Bottom, side, top", why:"Thumbs perpendicular to the sub for a tight roll."},
    {id:"o66", q:"The wrapped sub finishes in:", o:["Your dominant hand, top of the sub in your palm","Your non-dominant hand, bottom of the sub in your palm","Both hands, held level in front of the guest","The open bag, dropped in from above the counter"], a:"Your dominant hand, top of the sub in your palm", why:"So your other hand is free to pop the bag."},
    {id:"o67", q:"You pop the bag:", o:["Forward, where the guest can see and hear it","Down toward the counter, so it stays quiet","Back toward you, away from the guest's side","Under the counter, before the guest looks"], a:"Forward, where the guest can see and hear it", why:"It's part of the show."},
    {id:"o68", q:"Which subs get a twist after the bag is creased?", o:["Regulars, minis and kids meals","Giants and catering orders","Every sub, whatever the size","Only subs going out the door"], a:"Regulars, minis and kids meals", why:"Giants don't get the twist."},
    {id:"o69", q:"When does the name go on the bag?", o:["Every phone, online or catering order","Only catering orders of ten or more","Only when the guest asks for it","Every order, even at the counter"], a:"Every phone, online or catering order", why:"And the sub number when there's more than one sub on an order."},
    {id:"o70", q:"A guest walks straight to the register without ordering. You:", o:["Walk them to the slicer","Take their order at the register","Tell them to wait","Ring them up"], a:"Walk them to the slicer", why:"Direct traffic. Orders start at the slicer."},
    {id:"o71", q:"Can you pull a guest to the register before their cold sub is made?", o:["Never","Yes, to save time","Only on giants","Only if the line is long"], a:"Never", why:"They just get pulled back, and it confuses the whole line."},
    {id:"o72", q:"\"Peripheral hearing\" at the counter means:", o:["Listening in on the order so the next station knows what's coming","Wearing an earpiece so the manager can call out orders from the back","Asking the guest to repeat the order at every station on the line","Reading the ticket out loud before the sub moves down the counter"], a:"Listening in on the order so the next station knows what's coming", why:"Then you call it down: \"Number five, come down.\""}
  ]
};

/* ---------- things done in a fixed order ---------- */
var WRAP_STEPS = ["Four fingers underneath, thumbs on top","Cut it, then check the center","Pinch, pull over, punch","Grab, pull back","Quarter turn","Fold it in, fold it in","Roll forward: bottom, side, top","Finish in your dominant hand"];
var SEQS = {
  mw:{title:"Mike's Way, in order", steps:MW, hint:"Tap the seven in the order they go on.", first:"Tap what goes on first.", okText:"That's Mike's Way.",
      recap:"Onions, lettuce, tomatoes, red wine vinegar, olive oil blend, oregano, salt. Vegetables, then the juice, then the shake.", board:true, visual:true},
  wrap:{title:"The wrap, in order", steps:WRAP_STEPS, hint:"Tap the eight steps in order.", first:"Tap the first step.", okText:"That's the wrap.",
      recap:"Four fingers underneath, thumbs on top. Cut it, then check the center. Pinch, pull over, punch. Grab, pull back. Quarter turn. Fold it in, fold it in. Roll forward: bottom, side, top. Finish in your dominant hand.", board:false, visual:false}
};

/* ---------- orientation modules: which questions belong to which card ---------- */
function qRange(a, b){ var r = []; for (var i = a; i <= b; i++) r.push("o" + i); return r; }
var MODS = [
  {id:"values", bank:"orient", q:qRange(27, 29)},
  {id:"food", bank:"orient", q:qRange(1, 12)},
  {id:"uniform", bank:"orient", q:qRange(24, 26)},
  {id:"pl", bank:"orient", q:qRange(19, 23)},
  {id:"floor", bank:"orient", q:qRange(13, 18)},
  {id:"fifo", bank:"kitchen", q:qRange(30, 35)},
  {id:"temps", bank:"kitchen", q:qRange(36, 41)},
  {id:"sani", bank:"kitchen", q:qRange(42, 49)},
  {id:"pests", bank:"kitchen", q:qRange(50, 52)},
  {id:"produce", bank:"kitchen", q:qRange(53, 56)},
  {id:"cut", bank:"wrap", q:qRange(57, 60)},
  {id:"wrap", bank:"wrap", q:qRange(61, 66), seq:"wrap"},
  {id:"bag", bank:"wrap", q:qRange(67, 69)},
  {id:"register", bank:"wrap", q:qRange(70, 72)}
];
var BANK_LABEL = {amounts:"Sprinkling and the line", orient:"Orientation", kitchen:"Kitchen and food safety", wrap:"Cut, wrap, bag"};
var HOWTO_NAME = {cut:"Cutting the sub", wrap:"Wrapping the sub", bag:"Bagging the sub"};
