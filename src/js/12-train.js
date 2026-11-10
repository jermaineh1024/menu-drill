
/* ---------- the training videos, by station (register, prep, bread, the grill, the slicer; pasted Nov 9, 2026) ----------
   Every answer below is in the videos' own words or numbers. Each station is one quiz bank and one group on the Training tab. */
var GROUPS = [
  {id:"orient", bank:"orient"}, {id:"kitchen", bank:"kitchen"}, {id:"wrapper", bank:"wrap"},
  {id:"prep", bank:"prep"}, {id:"bread", bank:"bread"}, {id:"grill", bank:"grill"}, {id:"slicer", bank:"slicer"}
];

/* the cold sub cut and the hot sub cut are different, so the old question now says which one it means */
BANKS.wrap.forEach(function(q){ if (q.id === "o58") q.q = "A giant cold sub gets cut in:"; });

BANKS.kitchen = BANKS.kitchen.concat([
  {id:"t1", q:"Food has spent 4 hours in the danger zone. You:", o:["Throw it out","Reheat it to 165°F","Chill it fast","Use it first"], a:"Throw it out", why:"Four hours total in the danger zone, 41 to 135°F, is the limit. After that it's discarded."},
  {id:"t2", q:"Once heated, hot foods hold in the steam table at:", o:["135°F or higher","165°F or higher","120°F or higher","41°F or higher"], a:"135°F or higher", why:"Heated to 165°F for 15 seconds first, then held at 135°F or higher."},
  {id:"t3", q:"Cold foods hold at:", o:["41°F or below","32°F or below","45°F or below","50°F or below"], a:"41°F or below", why:"Keep cold foods cold: 41°F or below."},
  {id:"t4", q:"Cooling hot food: from 135°F down to 70°F within:", o:["2 hours","4 hours","6 hours","30 minutes"], a:"2 hours", why:"135 to 70 within 2 hours, then 70 to 41 within the next 4. Six in all."},
  {id:"t5", q:"Then from 70°F down to 41°F within the next:", o:["4 hours","2 hours","6 hours","1 hour"], a:"4 hours", why:"135 to 70 within 2 hours, then 70 to 41 within the next 4. Six in all."},
  {id:"t6", q:"Total cooling time allowed:", o:["6 hours","4 hours","2 hours","12 hours"], a:"6 hours", why:"2 hours to get to 70°F, 4 more to get to 41°F."},
  {id:"t7", q:"Besides meatballs, what else is heated to 165°F for 15 seconds?", o:["Tomato sauce and soups","Roast beef, bacon and turkey","Tuna and chicken","Bread and cookies"], a:"Tomato sauce and soups", why:"Meatballs, tomato sauce and soups, every time they're heated or reheated."}
]);

BANKS.wrap = BANKS.wrap.concat([
  {id:"r1", q:"A guest hands you cash. Where do the bills go while you make change?", o:["On the drawer, not in the slots","Straight into their slot","In your apron pocket","Under the tip jar, out of sight"], a:"On the drawer, not in the slots", why:"The bills stay out until the change is made. If there's a question, they're right there to look at."},
  {id:"r2", q:"Handing back change, what goes first?", o:["Coins, then bills","Bills, then coins","Whatever is biggest","The receipt"], a:"Coins, then bills", why:"Coins first is easier for the guest to handle."},
  {id:"r3", q:"How do you hand the change over?", o:["Counted back as you give it","Set on the counter in one pile","Dropped in the bag with the sub","With the receipt folded around it"], a:"Counted back as you give it", why:"Counting it back keeps you in control of the sale, and that keeps things safe."},
  {id:"r4", q:"What happens to 50s and 100s?", o:["Checked, then put out of sight","Handed to the next guest as change","Left on top of the drawer","Put in the 20s slot"], a:"Checked, then put out of sight", why:"Large bills get checked, then go where they can't be seen."},
  {id:"r5", q:"Bills are piling up in the drawer. You:", o:["Tell the manager, who makes a drop","Hide them under the counter by yourself","Keep going until close","Move the extra to the tip jar"], a:"Tell the manager, who makes a drop", why:"Keep a low balance in the register at all times."},
  {id:"r6", q:"When do you empty the tip jar?", o:["Between rushes","Only at close","When it's full","Once a week"], a:"Between rushes", why:"A low tip jar gives a thief less reason."},
  {id:"r7", q:"You see something suspicious. You:", o:["Tell the manager and call the police","Confront them before they reach the door","Follow them out to the parking lot","Lock the register and say nothing"], a:"Tell the manager and call the police", why:"Never try to handle it yourself. That's dangerous for you, the team and the guests."},
  {id:"r8", q:"When do you wash your hands at the register?", o:["Any time you leave it","Only after handling coins","Once an hour","Only before your break"], a:"Any time you leave it", why:"Money and cards carry germs, and your next stop may be food."},
  {id:"r9", q:"Why greet and look at every guest who walks in?", o:["Good service, and it can deter a robbery","It tells the slicer to start cutting bread right away","It starts the timer on their order","It's required before they can order"], a:"Good service, and it can deter a robbery", why:"That simple attention can discourage a robbery."},
  {id:"r10", q:"Why keep a low balance in the drawer?", o:["Less cash on hand is safer","The drawer closes faster","It makes counting change easier","Coins weigh the drawer down"], a:"Less cash on hand is safer", why:"Low drawer, big bills out of sight, drops when bills build up."},
  {id:"r11", q:"What do you ask every guest at the register?", o:["If they're a rewards member","If they want their sub toasted today","How long they waited","If they need a receipt"], a:"If they're a rewards member", why:"Guests who miss their points get upset. The points are Shore Points; the program is MyMike's Rewards."},
  {id:"r12", q:"How does the cashier know what the guest ordered?", o:["The wrapper calls it down the line","The guest repeats it at the register","It's printed on the bag","The slicer writes it on the paper"], a:"The wrapper calls it down the line", why:"Communicate down the line and you never have to ask the guest what they had."},
  {id:"r13", q:"The video's three habits for a great cashier:", o:["Smile, eye contact, be genuine","Speed, accuracy and a strong upsell","Greet, ring, repeat","Listen, nod, thank"], a:"Smile, eye contact, be genuine", why:"Positive without overdoing it. Phony turns guests off."},
  {id:"r14", q:"When do you thank the guest?", o:["Every time","Only if they tip","When they order a giant","If the line is short"], a:"Every time", why:"Smile, eye contact, and mean it."},
  {id:"r15", q:"Why does the register matter so much?", o:["It may be the guest's last contact with the team","It is the one place where a guest is able to complain","It decides how much each sub will cost","It is where most of the wait happens"], a:"It may be the guest's last contact with the team", why:"A great cashier can be the difference between a good visit and a bad one."}
]);

BANKS.prep = [
  {id:"p1", q:"When does prep happen?", o:["Outside the lunch and dinner rushes","During lunch, between orders","Any time the slicer is free","Only before the store opens"], a:"Outside the lunch and dinner rushes", why:"All prep happens outside the rushes. Customers first, prep second."},
  {id:"p2", q:"The lunch rush is usually:", o:["11 a.m. to 2 p.m.","10 a.m. to noon","Noon to 1 p.m.","1 to 4 p.m."], a:"11 a.m. to 2 p.m.", why:"Lunch is usually 11 to 2, dinner 5 to 7."},
  {id:"p3", q:"The dinner rush is usually:", o:["5 to 7 p.m.","4 to 5 p.m.","6 to 9 p.m.","3 to 5 p.m."], a:"5 to 7 p.m.", why:"Lunch is usually 11 to 2, dinner 5 to 7."},
  {id:"p4", q:"You're prepping and a guest walks in. You:", o:["Stop and help serve them","Finish the pan you're on first","Call for someone else to take them","Keep prepping unless there's a line"], a:"Stop and help serve them", why:"Any time a guest is in the store, pause and help the team serve them."},
  {id:"p5", q:"One onion, sliced, covers how many loaves?", o:["15","5","10","30"], a:"15", why:"1 onion = 15 loaves. 1 head of lettuce = 5. 1 tomato = about 1.5."},
  {id:"p6", q:"One head of lettuce covers how many loaves?", o:["5","15","10","3"], a:"5", why:"1 onion = 15 loaves. 1 head of lettuce = 5. 1 tomato = about 1.5."},
  {id:"p7", q:"One tomato gives how many usable slices?", o:["8 to 9","3 to 4","5 to 6","12 to 14"], a:"8 to 9", why:"8 to 9 usable slices, enough for about a loaf and a half."},
  {id:"p8", q:"A store sells 150 loaves a day. About how many heads of lettuce?", o:["30","10","15","100"], a:"30", why:"150 loaves at 5 loaves a head is 30 heads."},
  {id:"p9", q:"150 loaves a day needs about how many onions?", o:["10","15","30","5"], a:"10", why:"150 loaves at 15 loaves an onion is 10 onions."},
  {id:"p10", q:"150 loaves a day needs about how many tomatoes?", o:["100","30","50","150"], a:"100", why:"150 loaves at about 1.5 loaves a tomato is about 100 tomatoes."},

  {id:"p11", q:"When are onions peeled?", o:["The day before they're sliced","Right before slicing","Two days ahead","After they're sliced"], a:"The day before they're sliced", why:"Peel, rinse, and into the walk-in overnight. The opener slices them."},
  {id:"p12", q:"Peeling an onion, how deep is the slit along the side?", o:["About the first two layers","Halfway through, toward the center","Just the papery skin","All the way to the core"], a:"About the first two layers", why:"About two layers, then peel. Deeper makes strings."},
  {id:"p13", q:"\"Rings, not strings\" means:", o:["Don't cut deep when you peel","Slice the onions thicker","Fluff them longer","Use bigger onions"], a:"Don't cut deep when you peel", why:"A deep cut gives strings when the onion is sliced, and a place for germs to hide."},
  {id:"p14", q:"On the root side of the onion you cut:", o:["Deep enough to take out the core","As little as possible, skin only","A full inch, to be safe","Nothing. The root stays on for slicing"], a:"Deep enough to take out the core", why:"Deep enough to remove the solid core, and no deeper. More is waste."},
  {id:"p15", q:"Peeled onions are rinsed:", o:["In cold water, mostly at the cuts","In warm water with a little sanitizer","Only if they look dirty","After they're sliced"], a:"In cold water, mostly at the cuts", why:"Cold water at the prep sink, paying close attention to where you cut."},
  {id:"p16", q:"How thick is a slice of onion?", o:["Half a center tomato slice","The same as a tomato slice","Twice a tomato slice","Two thirds of a tomato slice"], a:"Half a center tomato slice", why:"Half. Two onion slices stacked equal one tomato slice."},
  {id:"p17", q:"How do you check onion thickness?", o:["2 slices against 1 tomato slice","Read the number on the dial and trust it","Weigh 5 slices on the scale","Hold one up to the light"], a:"2 slices against 1 tomato slice", why:"Never go by the dial. Stack two slices and compare, every time."},
  {id:"p18", q:"How many onions go on the slicer at once?", o:["2, one in front of the other","1","3, side by side","As many as fit under the guard"], a:"2, one in front of the other", why:"Two of similar size, one in front of the other, guard on top."},
  {id:"p19", q:"After slicing, onions get:", o:["Fluffed into separate rings","Pressed flat in the pan","Rinsed again","Chopped with a dough cutter"], a:"Fluffed into separate rings", why:"Fluff them in the large bin: apart into rings, without breaking the rings."},
  {id:"p20", q:"A 4-inch deep third pan holds about:", o:["4 onions","2 onions","6 onions","8 onions"], a:"4 onions", why:"2.5-inch pan about 2, 4-inch about 4, 6-inch about 6."},
  {id:"p21", q:"A 6-inch deep third pan holds about:", o:["6 onions","4 onions","8 onions","10 onions"], a:"6 onions", why:"2.5-inch pan about 2, 4-inch about 4, 6-inch about 6."},

  {id:"p22", q:"\"Bopping\" a head of lettuce is how you:", o:["Loosen the core so it twists out","Knock the dirt off the leaves","Check that the head is fresh","Break it into halves for the slicer"], a:"Loosen the core so it twists out", why:"Bop it core side down, then twist and pull the core. Only the core."},
  {id:"p23", q:"You bop the lettuce too hard. What happens?", o:["The head loosens and breaks apart","The core won't come out whole","The leaves bruise and turn brown","Nothing. Harder is faster"], a:"The head loosens and breaks apart", why:"Too hard breaks the head apart. Too soft and the whole core won't come out."},
  {id:"p24", q:"Which side is down when you bop a head of lettuce?", o:["The core side","The leafy side","Either side","Its side, rolled"], a:"The core side", why:"Core side down, on a sanitized solid surface."},
  {id:"p25", q:"Rinsing a bopped head, the water goes:", o:["On the outside, not inside the core","Straight down into the core","Over each leaf, pulled apart","Nowhere. Lettuce isn't rinsed"], a:"On the outside, not inside the core", why:"Cold water, core side down, rinsing the outside of the head."},
  {id:"p26", q:"Lettuce is stored overnight with the Cambro lid:", o:["Resting on top, not sealed","Snapped on tight","Left off completely","Wrapped in plastic"], a:"Resting on top, not sealed", why:"The lid covers the heads without sealing the bin."},
  {id:"p27", q:"Why isn't the lid sealed?", o:["A little airflow dries the lettuce","Sealed lettuce freezes","It's faster to open","The lid doesn't fit"], a:"A little airflow dries the lettuce", why:"Airflow helps the lettuce dry after it's rinsed."},
  {id:"p28", q:"How thick is sliced lettuce?", o:["2/3 of a center tomato slice","Half a tomato slice","Exactly the same as a center tomato slice","Twice a tomato slice"], a:"2/3 of a center tomato slice", why:"Open the blade to slightly less than a tomato slice. Never by the dial."},
  {id:"p29", q:"Lettuce is sliced after onions, so first you:", o:["Wipe the slicer down well","Sharpen the blade","Change the dial to zero","Swap in the tomato slicer"], a:"Wipe the slicer down well", why:"A good wipe-down, with the grit mat and green cutting board in place."},
  {id:"p30", q:"You slice lettuce down until there's about:", o:["½ inch left","Nothing left","2 inches left","Half a head left"], a:"½ inch left", why:"Stop at about half an inch and bring the deck all the way back."},
  {id:"p31", q:"What happens to that last ½ inch of lettuce?", o:["The next heads go on top of it","It goes in the trash","It's chopped with a knife","It's saved for the grill"], a:"The next heads go on top of it", why:"Two more heads go core side down on top, and slicing them takes the last half inch too."},
  {id:"p32", q:"Sliced lettuce is broken up:", o:["By hand, 4 times, 2 per head","With a dough cutter, 8 times","With a knife, into squares","By shaking the pan"], a:"By hand, 4 times, 2 per head", why:"A ripping or tearing motion. Never a knife or dough cutter: too harsh on lettuce."},
  {id:"p33", q:"A half pan of sliced lettuce is about:", o:["4 heads, enough for 20 giants","2 heads, enough for 10 giants","10 heads, enough for 50 giants","6 heads, enough for 20 giants"], a:"4 heads, enough for 20 giants", why:"About 4 heads a half pan. At 5 giants a head, that's 20."},
  {id:"p34", q:"A large white Cambro bin holds:", o:["30 sliced heads, enough for 150 subs","10 sliced heads, enough for 50 subs","50 sliced heads, enough for 150 subs","20 sliced heads, enough for 200 subs"], a:"30 sliced heads, enough for 150 subs", why:"30 heads at 5 subs a head is 150."},

  {id:"p35", q:"A ripe tomato has:", o:["Deep red color and some give","Deep red color and feels rock hard","Any red at all, soft or hard","A soft feel, whatever the color"], a:"Deep red color and some give", why:"It takes both: the deep red color, and soft enough to give to the touch."},
  {id:"p36", q:"A tomato is deep red but still hard. It goes:", o:["In the unripe case, one more day","In the ripe case, to slice tomorrow","Straight to the slicer","In the trash"], a:"In the unripe case, one more day", why:"One of the two isn't enough. Give it another day."},
  {id:"p37", q:"The unripe case is marked with:", o:["P for pink, and the date","U for unripe, and your initials","A red X on the lid","Nothing. It stays open"], a:"P for pink, and the date", why:"Lid on, P for pink, dated."},
  {id:"p38", q:"A tomato is going very soft but the color is borderline. You:", o:["Ripe case: salvage what you can","Give it two more days in the unripe case","Throw it out","Put it back in the delivery box"], a:"Ripe case: salvage what you can", why:"Another day and it might go bad, so it goes in the ripe case."},
  {id:"p39", q:"Tomatoes that get sliced today were:", o:["Rinsed and refrigerated overnight","Rinsed this morning","Taken straight from the box","Left out to warm up"], a:"Rinsed and refrigerated overnight", why:"Only rinsed, refrigerated tomatoes get sliced. Never straight out of the box."},
  {id:"p40", q:"Which way does a tomato go in the slicer?", o:["Stem side down","Stem side up","On its side","Cut in half first"], a:"Stem side down", why:"Stem side down, hands away from the blades."},
  {id:"p41", q:"A tomato sticks in the slicer. You:", o:["Take it out. Don't force it","Push harder with both hands","Hit the handle","Cut it free with a knife"], a:"Take it out. Don't force it", why:"Forcing it bends and dulls the blades."},
  {id:"p42", q:"Why not force a stuck tomato through?", o:["The blades bend and dull","The tomato bruises","The pan slides","The handle snaps off"], a:"The blades bend and dull", why:"Take it out and start again."},
  {id:"p43", q:"Where do your hands go on the tomato slicer?", o:["One at the exit end, one on the pusher","Both on the pusher handle, pushing down hard","One on the tomato, one on the blades","One on the pan, one on the counter"], a:"One at the exit end, one on the pusher", why:"One hand where the tomato comes out, to stop it. The other pushes or taps it through evenly."},

  {id:"p44", q:"How much comes off the top of the celery stalks?", o:["The first ½ inch","The first 2 inches","Nothing. Just the leaves","The top third"], a:"The first ½ inch", why:"The tops are dry, discolored and dirty."},
  {id:"p45", q:"Celery is washed in which direction?", o:["Downward, away from the core","Upward, toward the leaves","Side to side","Soaked, no direction"], a:"Downward, away from the core", why:"So the dirt washes away from the core, not into it."},
  {id:"p46", q:"How many celery splits go on the slicer at once?", o:["1","2","The whole bunch","3"], a:"1", why:"One split at a time, always with the guard."},
  {id:"p47", q:"How much sliced celery goes in a batch of tuna?", o:["30 oz","16 oz","84 oz","8 oz"], a:"30 oz", why:"Tare a food prep pan and fill it to 30 ounces."},
  {id:"p48", q:"A batch of tuna uses how many pouches?", o:["2 albacore and 2 light","4 albacore","1 albacore and 3 light","3 albacore and 3 light"], a:"2 albacore and 2 light", why:"2 pouches of albacore, 2 of light, 30 oz celery, 1 oz pepper, ¾ gallon of mayo."},
  {id:"p49", q:"How much black pepper in a batch of tuna?", o:["1 oz, weighed","1 tablespoon","A handful","2 level tablespoons"], a:"1 oz, weighed", why:"One weighed ounce, sprinkled evenly over the tuna."},
  {id:"p50", q:"How much mayo in a batch of tuna?", o:["¾ of a gallon","1 full gallon","½ a gallon","2 gallons"], a:"¾ of a gallon", why:"Three quarters of a gallon. The video also gives it as 84 ounces."},
  {id:"p51", q:"Breaking down tuna, how much do you take at a time?", o:["A golf ball, rubbed between palms","A full pouch, squeezed in the bin","A cup, pressed through a strainer","Half a pouch, mashed with the spatula"], a:"A golf ball, rubbed between palms", why:"Rubbed until fine, no chunks, one pouch at a time."},
  {id:"p52", q:"After the two tunas are mixed, what goes in next?", o:["Black pepper","Mayo","Celery","Celery and mayo together"], a:"Black pepper", why:"Pepper, then celery, then mayo. Each one all the way in before the next."},
  {id:"p53", q:"What goes into the tuna last?", o:["Mayo","Celery","Black pepper","The light tuna"], a:"Mayo", why:"Pepper, then celery, then mayo."},
  {id:"p54", q:"While mixing tuna, you check:", o:["Corners, edges and middle","The color against the chart","The temperature of the bin","The weight after each stir"], a:"Corners, edges and middle", why:"That's where unmixed pockets hide."},
  {id:"p55", q:"Fresh tuna rests until:", o:["The next day","The lunch rush","It reaches 70°F","The mayo is absorbed, about an hour"], a:"The next day", why:"Overnight it sets up and gets easier to spread."},
  {id:"p56", q:"Right before serving tuna you:", o:["Give it a good stir","Add more mayo","Drain it","Add the pepper"], a:"Give it a good stir", why:"It separates as it holds."},

  {id:"p57", q:"Prosciuttini is opened by:", o:["Cutting the wrap at the top or side","Cutting it in half, then peeling","Cutting an X on the bottom","Soaking the wrapper off in cold water"], a:"Cutting the wrap at the top or side", why:"Prosciuttini is the one that is not cut in half."},
  {id:"p58", q:"How do you open a turkey?", o:["A shallow X on the bottom","Cut it in half, then peel","Slit the top end to end","Peel from the tie at the end"], a:"A shallow X on the bottom", why:"Cut an X on the bottom, not too deep, and peel away both layers."},
  {id:"p59", q:"Which meats have a second wrapping to remove?", o:["Cappacuolo, salami and pepperoni","Ham, turkey and roast beef","Prosciuttini and pastrami","All of them"], a:"Cappacuolo, salami and pepperoni", why:"After the outside wrap, those three have a second one."},
  {id:"p60", q:"After opening, which of these gets rinsed and patted dry?", o:["Turkey","Salami","Pepperoni","Provolone"], a:"Turkey", why:"Rinse and pat dry: boiled ham, prosciuttini, cappacuolo, turkey, roast beef, pastrami."},
  {id:"p61", q:"Opened meats and cheeses should be used within:", o:["24 hours","4 hours","3 days","1 week"], a:"24 hours", why:"Within 24 hours of opening."},
  {id:"p62", q:"Meat rewrapped in plastic after opening gets:", o:["Dated","Frozen","Rinsed again","Weighed"], a:"Dated", why:"Anything wrapped in plastic after leaving its original package gets a date."},
  {id:"p63", q:"Rinsed meats are dried with:", o:["A paper towel","A sanitizer towel","The air in the walk-in","Nothing. They go in wet"], a:"A paper towel", why:"Rinse under cold water, pat dry with a paper towel."},

  {id:"p64", q:"On the Production Pro chart: on hand + AM prep + PM prep =", o:["Total","Usage","Waste","Left"], a:"Total", why:"On hand + AM prep + PM prep = total. Total minus waste minus left = usage."},
  {id:"p65", q:"Total minus waste minus left =", o:["Usage","On hand","Food cost","PM prep"], a:"Usage", why:"On hand + AM prep + PM prep = total. Total minus waste minus left = usage."},
  {id:"p66", q:"Half a pan on hand, 4 sliced in the morning, 1 more before dinner, none wasted, half a pan left. Usage is:", o:["5 pans","5.5 pans","4.5 pans","6 pans"], a:"5 pans", why:"0.5 + 4 + 1 = 5.5 total. 5.5 minus 0 wasted minus 0.5 left = 5."},
  {id:"p67", q:"What's left tonight becomes tomorrow's:", o:["On hand","Waste","AM prep","Usage"], a:"On hand", why:"Tonight's left is tomorrow's on hand."},
  {id:"p68", q:"\"Count smarter\": tomatoes are counted by the:", o:["Row","Each","Pan","Case"], a:"Row", why:"Onions each, lettuce by the pan, tomatoes by the row, bacon by the sheet."},
  {id:"p69", q:"\"Count smarter\": lettuce is counted by the:", o:["Pan","Head","Cup","Bin"], a:"Pan", why:"Onions each, lettuce by the pan, tomatoes by the row, bacon by the sheet."},
  {id:"p70", q:"A row of 7 sliced tomatoes covers about:", o:["10.5 loaves","7 loaves","15 loaves","3.5 loaves"], a:"10.5 loaves", why:"7 tomatoes at 1.5 loaves each."},
  {id:"p71", q:"The store used 140 loaves. About how many pans of lettuce should that take?", o:["7","10","14","5"], a:"7", why:"One pan is 4 heads, enough for 20 loaves. 140 divided by 20 is 7."},
  {id:"p72", q:"Leftover bread and onions go to the grill the next day and must be used by:", o:["2 p.m.","Close","11 a.m.","5 p.m."], a:"2 p.m.", why:"Hot sub bread and day-old onions not used by 2 p.m. are thrown out."},
  {id:"p73", q:"The video's line: \"Food cost is\"", o:["Food used","Food ordered","Food wasted","Food sold"], a:"Food used", why:"Knowing what you used is the key to food cost."},
  {id:"p74", q:"\"Product mix\" is:", o:["How many of each sub the store sells","The recipe for the oil and vinegar blend","The order products sit in the meat case","How the prep list is split between shifts"], a:"How many of each sub the store sells", why:"A store selling mostly cold subs uses more lettuce than one selling half hot."},
  {id:"p75", q:"Two pans of lettuce are left over every single night. That means:", o:["It's being over-prepped","Not enough is going on the subs","The pans are too small","The walk-in is too cold"], a:"It's being over-prepped", why:"And day-old lettuce is going on tomorrow's subs."}
];

BANKS.bread = [
  {id:"b1", q:"How much cornmeal goes in the channels of the bread form?", o:["2 oz","½ oz","4 oz","A light dusting, by eye"], a:"2 oz", why:"Two ounces, sprinkled evenly."},
  {id:"b2", q:"Too much cornmeal:", o:["Blocks the heat from below","Burns the bottom of the loaf","Makes the bread rise too fast","Sticks the loaf to the form"], a:"Blocks the heat from below", why:"A buildup blocks the heat coming up through the pan, and the bread doesn't bake right."},
  {id:"b3", q:"Too little cornmeal:", o:["Burns the bread","Blocks the heat","Stops the rise","Dries the crust"], a:"Burns the bread", why:"Too much blocks the heat. Too little burns the bread."},
  {id:"b4", q:"Frozen loaves go in the form:", o:["Rib side down","Rib side up","On their sides","Two to a channel"], a:"Rib side down", why:"Rib side down, in the channels. Minis the same way."},
  {id:"b5", q:"Why zip the rack cover closed?", o:["It keeps moisture on the dough as it thaws","It keeps the walk-in from smelling of yeast","It stops the loaves from rising overnight","It keeps the cornmeal from blowing off"], a:"It keeps moisture on the dough as it thaws", why:"So the dough doesn't dry out while it thaws."},
  {id:"b6", q:"Bread is panned:", o:["After 7 p.m.","Before the lunch rush","First thing in the morning","Between 2 and 4 p.m."], a:"After 7 p.m.", why:"After 7 p.m., so it thaws properly overnight."},
  {id:"b7", q:"Leftover frozen dough goes:", o:["Back in the freezer right away","In the walk-in with the rack","On the counter to finish thawing","Into tomorrow's first proof"], a:"Back in the freezer right away", why:"Close the bag in the box. Left out, it starts to thaw."},
  {id:"b8", q:"Why roll the rack into the walk-in slowly?", o:["So the dough doesn't roll around","So the cover doesn't unzip","So the cornmeal settles","So the wheels don't squeak"], a:"So the dough doesn't roll around", why:"Moved fast, the dough sticks roll in their channels."},

  {id:"b9", q:"The proofer is set to:", o:["100°F","350°F","135°F","70°F"], a:"100°F", why:"Proofer 100°F at 85 to 95% humidity. Oven 350°F."},
  {id:"b10", q:"Relative humidity in the proofer:", o:["85 to 95%","50 to 60%","100%","30 to 40%"], a:"85 to 95%", why:"The hygrometer at the bottom of the proofer shows it."},
  {id:"b11", q:"The usual humidity setting on the proofer is:", o:["4 to 5","1 to 2","8 to 9","10"], a:"4 to 5", why:"It can shift a little from one proofer to another and with the season."},
  {id:"b12", q:"A warmed-up proofer door should show:", o:["A mist, with no water running","Water running down the glass","Clear, dry glass","Frost at the corners"], a:"A mist, with no water running", why:"A mist on the door, but not so much that water runs down the glass."},
  {id:"b13", q:"The first 5 trays go in the:", o:["Top 5 rungs","Bottom 5 rungs","Middle rungs","Every other rung"], a:"Top 5 rungs", why:"Top 5 first for 25 minutes, then 5 more below them."},
  {id:"b14", q:"After the first 5 trays go in, the timer is set for:", o:["25 minutes","10 minutes","50 minutes","15 minutes"], a:"25 minutes", why:"25 minutes, then the next 5 trays go in for another 25."},
  {id:"b15", q:"How long does proofing take in all?", o:["50 to 70 minutes","20 to 30 minutes","14 to 16 minutes","About 2 hours"], a:"50 to 70 minutes", why:"The spread comes from the proofer and the weather."},
  {id:"b16", q:"The dough looks dry in the proofer. You:", o:["Spray it with room temp water","Turn the heat up","Brush it with oil","Leave the door open a minute"], a:"Spray it with room temp water", why:"It should feel slightly tacky. If not, spray with room temperature water."},
  {id:"b17", q:"Bread is done proofing when:", o:["It just touches the bread tool's curve","The timer hits 70 minutes, whatever the size","The top of the loaf starts to crack open","The loaf is 4 times its original size"], a:"It just touches the bread tool's curve", why:"The bread tool measures the height of the loaf."},
  {id:"b18", q:"Proofed dough has grown to about:", o:["2 to 2.5 times its size","1.5 times its size","4 times its size","The same size, but softer"], a:"2 to 2.5 times its size", why:"Two to two and a half times its original size."},
  {id:"b19", q:"White and wheat bread are proofed:", o:["Separately","Together, wheat on top","Together, white on top","Wheat isn't proofed"], a:"Separately", why:"It's best to proof white and wheat separately."},

  {id:"b20", q:"Which bread gets scored?", o:["White, minis included","Wheat only","Every loaf","Only giants"], a:"White, minis included", why:"All white bread, minis too. Wheat is not scored."},
  {id:"b21", q:"How deep is the score?", o:["1/16 inch","1/4 inch","1/2 inch","3/16 inch"], a:"1/16 inch", why:"A gentle score, 1/16 of an inch deep, down the center."},
  {id:"b22", q:"The score stops how far from each end?", o:["1.5 inches","½ inch","3 inches","It runs end to end"], a:"1.5 inches", why:"An inch and a half at each end is left unscored."},
  {id:"b23", q:"Bake time for white bread:", o:["14 to 16 minutes","25 minutes","50 to 70 minutes","8 to 10 minutes"], a:"14 to 16 minutes", why:"14 to 16 minutes. Wheat may take 1 to 2 minutes longer."},
  {id:"b24", q:"The oven is set to:", o:["350°F","100°F","425°F","300°F"], a:"350°F", why:"Oven 350°F, proofer 100°F."},
  {id:"b25", q:"Wheat bread, compared with white:", o:["May bake 1 to 2 minutes longer","Bakes at a higher temperature","Gets scored twice","Skips the proofer"], a:"May bake 1 to 2 minutes longer", why:"And wheat is not scored."},
  {id:"b26", q:"How do you know the bread is done?", o:["Golden brown, per the color chart","The timer goes off, no matter the color","The crust cracks when you press on it","The bottom sounds hollow when tapped"], a:"Golden brown, per the color chart", why:"The color chart is posted on the proofer door. Out of the oven the moment it gets there."},
  {id:"b27", q:"Baked bread cools on:", o:["The bottom rungs of the rack","The top rungs of the bread rack","The front counter","The top of the oven"], a:"The bottom rungs of the rack", why:"Heat rises, so the coolest bread is always on the bottom."},
  {id:"b28", q:"While bread cools, the rack cover is:", o:["Open","Zipped shut","Off the rack","Half zipped"], a:"Open", why:"Close it only once every loaf on the rack is completely cool."},
  {id:"b29", q:"How high is the bread pyramid?", o:["No more than 3 rows","5 rows","As high as it holds","2 rows, always"], a:"No more than 3 rows", why:"Three rows at most, 18 to 24 loaves a pan."},
  {id:"b30", q:"A pan of stacked bread holds:", o:["18 to 24 loaves","10 to 12 loaves","30 to 36 loaves","As many as fit"], a:"18 to 24 loaves", why:"Three rows at most, 18 to 24 loaves a pan."},
  {id:"b31", q:"How do you knock the extra cornmeal off a loaf?", o:["Rub two loaves' bottoms together","Brush each loaf with a towel","Tap the loaf on the counter","Blow it off"], a:"Rub two loaves' bottoms together", why:"Before stacking, rub the bottoms of 2 loaves together."},
  {id:"b32", q:"When can bread be stacked?", o:["Once it's completely cool","Right out of the oven","After 5 minutes","While it's still warm, so it sets"], a:"Once it's completely cool", why:"Loaves must completely cool before pyramiding."}
];

BANKS.grill = [
  {id:"g1", q:"Hot sub bread is cut into:", o:["A pocket, ends left closed","Two separate halves","A V down the top","Three sections"], a:"A pocket, ends left closed", why:"The cut doesn't go through the ends or all the way through."},
  {id:"g2", q:"Cutting a giant for the grill, the knife:", o:["Angles in and stops short of the ends","Goes straight through, end to end","Cuts down from the top","Slices the ends off first"], a:"Angles in and stops short of the ends", why:"Across the front of the loaf, angled into the bread, leaving a pocket."},
  {id:"g3", q:"Tempering the bread means:", o:["Warming it, not toasting it","Toasting it until golden","Cooling it before the meat goes on","Pressing it flat"], a:"Warming it, not toasting it", why:"A little heat brings out the flavor. The goal is warm, not toasted."},
  {id:"g4", q:"Which side of the loaf goes down on the grill?", o:["The bottom","The top","The cut side","Either. It gets flipped"], a:"The bottom", why:"Bottom side down, turned often."},
  {id:"g5", q:"Before the loaf goes on the grill you:", o:["Open and close it","Butter the inside","Poke holes in the lid","Cut it in half"], a:"Open and close it", why:"That lets the heat reach the center without toasting it."},
  {id:"g6", q:"While the sub cooks, the bread on the grill gets:", o:["Turned often","Left alone until the end","Flipped once","Covered with the paper"], a:"Turned often", why:"So it warms evenly. Keep it on as long as you can."},
  {id:"g7", q:"Why scrape the grill as often as you can?", o:["A clean grill cooks quicker","It seasons the next sub","It cools the surface down","It keeps the tickets dry"], a:"A clean grill cooks quicker", why:"Scrape it as much as possible."},
  {id:"g8", q:"Tickets on the grill are worked:", o:["In the order they came in","Chicken first, then steak","Giants first","Whichever is fastest"], a:"In the order they came in", why:"Keep them in order, and don't start a sub before you can pay attention to it."},

  {id:"g9", q:"How many slices of cheese on a regular #17?", o:["3","2","4","6"], a:"3", why:"3 on a regular cheesesteak. A Big Kahuna gets 4."},
  {id:"g10", q:"How many slices of cheese on a regular Big Kahuna?", o:["4","3","5","6"], a:"4", why:"Extra cheese: 4 slices where the others get 3."},
  {id:"g11", q:"Onions for a regular cheesesteak:", o:["1.25 oz","0.75 oz","2 oz","3 oz"], a:"1.25 oz", why:"1.25 oz of onions, then 0.75 oz of peppers on top of them."},
  {id:"g12", q:"Peppers for a regular cheesesteak:", o:["0.75 oz","1.25 oz","2 oz","1 oz"], a:"0.75 oz", why:"1.25 oz of onions, then 0.75 oz of peppers on top of them."},
  {id:"g13", q:"Where do the peppers go on the grill?", o:["On top of the onions","Beside the steak","Under the onions","On the cheese"], a:"On top of the onions", why:"The peppers help cook and marinate the onions."},
  {id:"g14", q:"Which color tools handle the steak?", o:["Red","Yellow","Blue","Green"], a:"Red", why:"Red tongs, spatula and dough cutter for steak. Yellow for chicken."},
  {id:"g15", q:"Which color tools handle the chicken?", o:["Yellow","Red","Orange","White"], a:"Yellow", why:"Yellow tongs, spatula and dough cutter for chicken. Red for steak."},
  {id:"g16", q:"Right after the steak is flipped, it gets:", o:["A light salting","Oil and vinegar","A lid over it","The cheese"], a:"A light salting", why:"Flip, then lightly salt the steak."},
  {id:"g17", q:"How many times is the meat broken in all?", o:["16","4","8","12"], a:"16", why:"4, bring it together, 4 more, then 8 more with the onions and peppers."},
  {id:"g18", q:"The break count goes:", o:["4, bring together, 4, add onions and peppers, 8 more","8, add the onions and peppers, bring together, 8 more","16 straight through, then add the onions and peppers","4, add the cheese, 4, add the onions and peppers, 8 more"], a:"4, bring together, 4, add onions and peppers, 8 more", why:"The last 8 use the same 4 and 4."},
  {id:"g19", q:"Why cut slits in the cheese?", o:["So it melts faster","So steam can vent the bread","So it tears into pieces","To mark it as done"], a:"So it melts faster", why:"And don't overcook the meat while you wait for it."},
  {id:"g20", q:"What goes on the lid of a #43, and when?", o:["3 lines of chipotle mayo, before the meat hits the grill","Chipotle mayo over the cheese, once it has melted","A spread of chipotle mayo, after the sub is wrapped","2 rows of chipotle mayo, after the meat is on the bread"], a:"3 lines of chipotle mayo, before the meat hits the grill", why:"That's the only difference between a 17 and a 43."},
  {id:"g21", q:"What does a Big Kahuna add to the onions and peppers?", o:["Mushrooms and jalapeños","Bacon and tomatoes","Banana peppers","Extra steak"], a:"Mushrooms and jalapeños", why:"Extra cheese, mushrooms and jalapeños."},
  {id:"g22", q:"A regular #55 Big Kahuna Chicken gets how many jalapeños?", o:["4 to 5","2 to 3","8 to 10","1"], a:"4 to 5", why:"0.75 oz of mushrooms and 4 to 5 jalapeños, down with the onions and peppers."},
  {id:"g23", q:"A giant hot sub is cooked as:", o:["Two regular portions","One big pile","Three small piles","A regular, then stretched"], a:"Two regular portions", why:"Double every portion, but cook it as regulars so it goes on the bread evenly."},
  {id:"g24", q:"Paper for a giant hot sub:", o:["21 inches","15 inches","18 inches","24 inches"], a:"21 inches", why:"15 inches for a regular, 21 for a giant."},
  {id:"g25", q:"How does the meat get from the grill to the bread?", o:["Dough cutter pushes it onto the spatula","Tongs, a few pieces at a time","The bread is pressed down over it","It's flipped in with the spatula"], a:"Dough cutter pushes it onto the spatula", why:"Then scrape the loose bits off the grill and onto the sub."},

  {id:"g26", q:"How does the chicken go on the grill?", o:["Frozen","Thawed overnight","At room temperature","Marinated"], a:"Frozen", why:"Chicken stays frozen until it hits the grill."},
  {id:"g27", q:"Chicken compared with steak on the grill:", o:["Usually takes a little longer","Cooks in half the time","Needs no flipping","Gets no cheese"], a:"Usually takes a little longer", why:"It goes on frozen, where the beef is thawed."},
  {id:"g28", q:"The two risks with chicken:", o:["Raw in the middle, or dried out","Too salty, or too cold","Stuck to the grill, or burned black","Too thick, or too thin"], a:"Raw in the middle, or dried out", why:"Cook it all the way through without overcooking it."},
  {id:"g29", q:"What does a #55 get that a #16 doesn't?", o:["Mushrooms, jalapeños, a 4th cheese slice","Chipotle mayo on the lid and extra onions","Bacon, ranch and tomatoes on the lid","Frank's RedHot and blue cheese dressing"], a:"Mushrooms, jalapeños, a 4th cheese slice", why:"4 slices of cheese, 0.75 oz of mushrooms, 4 to 5 jalapeños."},
  {id:"g30", q:"The #42 is a #16 plus:", o:["Chipotle mayo on the lid","Ranch on the lid","Mushrooms on the grill","Frank's RedHot"], a:"Chipotle mayo on the lid", why:"3 lines on the inside of the lid, like the 43."},

  {id:"g31", q:"On a #26, what goes on the lid, in order?", o:["Ranch, bacon, tomatoes","Tomatoes, bacon, ranch","Bacon, ranch, lettuce","Ranch, lettuce, tomatoes"], a:"Ranch, bacon, tomatoes", why:"3 lines of ranch, then the bacon, then the tomatoes."},
  {id:"g32", q:"On a #44, when does the Frank's RedHot go on?", o:["On the cooked chicken, before the cheese","On the lid, with the blue cheese dressing","Over the lettuce, right before wrapping","Into the bread, before the chicken goes in"], a:"On the cooked chicken, before the cheese", why:"Cook the chicken through, add the Frank's, then the cheese goes on top."},
  {id:"g33", q:"How much Frank's RedHot?", o:["3 full rows","3 lines on the lid","1 row","2 rows, like vinegar"], a:"3 full rows", why:"3 full rows, on the chicken."},
  {id:"g34", q:"What goes on the lid of a #44?", o:["Blue cheese dressing, then tomatoes","Ranch, bacon, then tomatoes","Frank's RedHot, then lettuce","Mayo, spread edge to edge, then tomatoes"], a:"Blue cheese dressing, then tomatoes", why:"3 lines of blue cheese dressing, then tomatoes."},
  {id:"g35", q:"What goes on a #26 or a #44 last, once the chicken and cheese are on the bread?", o:["Lettuce","Tomatoes","The sauce","Bacon"], a:"Lettuce", why:"Lettuce finishes it: 2 soufflé cups on a regular, 4 on a giant."},
  {id:"g36", q:"Lettuce on a regular hot sub:", o:["2 soufflé cups","3 soufflé cups","5 soufflé cups","1 soufflé cup"], a:"2 soufflé cups", why:"2 on a regular, 4 on a giant. A cold sub gets 3 and 5."},
  {id:"g37", q:"Lettuce on a giant hot sub:", o:["4 soufflé cups","5 soufflé cups","6 soufflé cups","3 soufflé cups"], a:"4 soufflé cups", why:"2 on a regular, 4 on a giant. A cold sub gets 3 and 5."},
  {id:"g38", q:"Tomatoes on a regular #26 or #44:", o:["3 slices","2 slices","4 slices","5 slices"], a:"3 slices", why:"3 on a regular, 5 on a giant, on the lid."},
  {id:"g39", q:"Bacon on a giant #26:", o:["4 slices","2 slices","6 slices","3 slices"], a:"4 slices", why:"2 on a regular, 4 on a giant, on the lid."},
  {id:"g40", q:"Cheese on a giant #26 or #44:", o:["6 slices","3 slices","4 slices","8 slices"], a:"6 slices", why:"3 slices on a regular, 6 on a giant."},
  {id:"g41", q:"Do the #26 and #44 get grilled onions and peppers?", o:["No","Yes, like every cheesesteak","Onions only","Peppers only"], a:"No", why:"Chicken alone on the grill. What's different is what goes on the bread."},
  {id:"g42", q:"How many pieces of chicken on a giant #26?", o:["2","1","3","4"], a:"2", why:"1 piece for a regular, 2 for a giant."},

  {id:"g43", q:"A regular hot sub gets cut:", o:["Not at all","In half","In thirds","In quarters"], a:"Not at all", why:"Giants are cut in half. Regulars are not cut."},
  {id:"g44", q:"A giant hot sub gets cut:", o:["In half","In quarters","Not at all","In thirds"], a:"In half", why:"Giants are cut in half. Regulars are not cut."},
  {id:"g45", q:"How does a hot sub sit while you wrap it?", o:["Up on its side","Flat, lid up","Upside down","Open, face up"], a:"Up on its side", why:"On its side, everything stays in place."},
  {id:"g46", q:"How tight is a hot sub wrapped?", o:["Loosely. Never squeeze it","As tight as a cold sub","Tight enough to press the cheese in","Double wrapped and tight"], a:"Loosely. Never squeeze it", why:"Same steps as a cold sub, wrapped loosely and with care."},
  {id:"g47", q:"Why the special hot sub wrap?", o:["Holds heat, lets the sub breathe","It's waterproof, so nothing can leak","It's thicker, so it can be squeezed","It tells the register it's a hot sub"], a:"Holds heat, lets the sub breathe", why:"So the sub stays hot without going soggy."},

  {id:"g48", q:"Grill temperature for bacon:", o:["350°F","250°F","400°F","300°F"], a:"350°F", why:"Preheat the grill to 350°F."},
  {id:"g49", q:"When do you flip bacon?", o:["When it lets go, about 75% done","As soon as the fat turns clear","Every minute, so it cooks evenly","When the edges turn dark brown"], a:"When it lets go, about 75% done", why:"It cooks itself off the grill. Then the last 25% to golden brown."},
  {id:"g50", q:"Bacon flipped too early or too often will:", o:["Stick and shrivel","Cook faster","Stay flat","Lose its smoke flavor"], a:"Stick and shrivel", why:"Leave it alone until it releases."},
  {id:"g51", q:"About how many sheets of bacon go on the grill at once?", o:["4","1","8","12"], a:"4", why:"About 4 sheets of defrosted bacon."},
  {id:"g52", q:"Cooked bacon is held in:", o:["The steam table","The walk-in","The meat case","A third pan on the line"], a:"The steam table", why:"In a 2.5-inch half pan with a grate, in the steam table."},
  {id:"g53", q:"Leftover bacon at the end of the night:", o:["Gets wrapped and reheated tomorrow","Has to be thrown out","Goes back in the freezer","Stays in the steam table overnight"], a:"Gets wrapped and reheated tomorrow", why:"Wrapped, and used first the next day. FIFO."},

  {id:"g54", q:"Philly steaks are stored in the freezer at:", o:["0°F","32°F","41°F","10°F"], a:"0°F", why:"Beef and chicken steaks are both received and stored at 0°F."},
  {id:"g55", q:"When are the beef steaks panned to thaw?", o:["2 to 4 p.m. the day before","First thing that morning","After 7 p.m., with the bread","An hour before the lunch rush"], a:"2 to 4 p.m. the day before", why:"That gives them the right amount of time in the walk-in."},
  {id:"g56", q:"A properly tempered beef steak is:", o:["About 40°F, still slightly frozen","Room temperature and soft","Rock hard, straight from the freezer","Fully thawed, sitting in its juices"], a:"About 40°F, still slightly frozen", why:"It holds its shape and still has some ice crystals."},
  {id:"g57", q:"How do frozen steaks sit in the pan?", o:["Standing up, closed side of paper out","Stacked flat, paper side down","Unwrapped, in a single layer","In a pile, covered in plastic wrap"], a:"Standing up, closed side of paper out", why:"In a 6-inch deep half pan with a drain grate."},
  {id:"g58", q:"How many frozen chicken steaks can sit in the sandwich unit at once?", o:["4 to 6","1 to 2","10 to 12","As many as fit"], a:"4 to 6", why:"A limited supply, and only if the sales volume calls for it."},
  {id:"g59", q:"Chicken still in the sandwich unit at close is:", o:["Thrown out","Refrozen","Moved to the walk-in","Cooked for tomorrow"], a:"Thrown out", why:"Chicken can't be refrozen."},
  {id:"g60", q:"You touched raw steak. Before anything else you:", o:["Wash your hands and change gloves","Wipe your gloves on a towel","Rinse your gloves at the sink","Keep going if the gloves look clean"], a:"Wash your hands and change gloves", why:"Avoid cross-contamination: wash and change before touching any other food."},
  {id:"g61", q:"An overthawed steak will:", o:["Cook too fast and can overcook","Take twice as long on the grill","Stick to the tongs","Lose its red color"], a:"Cook too fast and can overcook", why:"It goes soft. A tempered steak is still slightly frozen."}
];

BANKS.slicer = [
  {id:"s1", q:"A guest orders a number 7 and doesn't mention bread. You:", o:["Slice it on white","Ask white or wheat","Ask which bread they'd like","Wait for them to say"], a:"Slice it on white", why:"Don't ask. The guest will tell you if they want something else."},
  {id:"s2", q:"A guest orders a hot sub. Do you ask if they want peppers and onions?", o:["No. They'll tell you","Yes, on every cheesesteak","Only on the chicken subs","Only if the grill is backed up"], a:"No. They'll tell you", why:"Guests say so when they want a hot sub changed."},
  {id:"s3", q:"What do you do with bread before the rush?", o:["Pre-cut a few regulars and giants","Stack it by the register","Warm it on the grill","Bag it by size"], a:"Pre-cut a few regulars and giants", why:"And restock during lulls, so bread is grab and go."},
  {id:"s4", q:"The video's first step to getting quicker on the slicer:", o:["Know the menu cold","Use a thinner setting","Skip the guard","Stand closer to the blade"], a:"Know the menu cold", why:"When a guest says a number, you can't hesitate."},
  {id:"s5", q:"Once the basics are muscle memory, you push yourself to:", o:["Take more than one order at a time","Slice without looking at the sub","Leave the slicer running between subs","Cut the bread after the meat"], a:"Take more than one order at a time", why:"And slice more than one sub at a time. That's where the time savings are."},

  {id:"s6", q:"Cutting bread, which fingers lift off the loaf?", o:["Thumb and pinky","Index and middle","All but the thumb","None, the whole hand grips"], a:"Thumb and pinky", why:"Keeping them up protects them."},
  {id:"s7", q:"Where does the bread cut start?", o:["The round end closest to the guest","In the middle, working outward","At the end closest to you","Wherever the crust is softest"], a:"The round end closest to the guest", why:"At the butt, the round of the bread, closest to the guest."},
  {id:"s8", q:"What keeps the bread cut even?", o:["Knuckles of the knife hand on the counter","Pressing down hard on the lid","Cutting in one fast pull","Holding the loaf up off the counter"], a:"Knuckles of the knife hand on the counter", why:"Drag them along the counter as you saw, and keep the blade level."},
  {id:"s9", q:"The cut should leave a cold sub's bread in:", o:["Equal halves, top and bottom","A thin lid and a thick bottom","A thick lid and a thin bottom","A pocket, closed at the ends"], a:"Equal halves, top and bottom", why:"A balanced sub. The pocket is the hot sub cut."},
  {id:"s10", q:"After the cut, the lid goes:", o:["To the sprinkler, by the sprinkling board","Back on the bottom half until the meat is on","On the scale, to be weighed with the sub","On the paper, under the bottom half"], a:"To the sprinkler, by the sprinkling board", why:"As close to the sprinkling board as you can."},
  {id:"s11", q:"To make regulars you first:", o:["Cut a giant into two equal halves","Grab loaves from the regular rack","Trim the ends off a giant","Cut a giant into thirds"], a:"Cut a giant into two equal halves", why:"Then point the round ends toward the guest and cut each the same way."},
  {id:"s12", q:"As you pass the lid down, you tell the sprinkler:", o:["Which sub it is and who it's for","How many slices of each meat went on it","What the guest paid","Which bread it is"], a:"Which sub it is and who it's for", why:"That's communicating down the line."},

  {id:"s13", q:"Your feet at the slicer:", o:["Shoulder width apart and parallel","Staggered, one foot forward","Together, heels touching","Wide, toes pointed out"], a:"Shoulder width apart and parallel", why:"Staggered feet make you lean in, and someone can trip on your foot."},
  {id:"s14", q:"How close do you stand to the slicer?", o:["A small step back from it","Hips against the slicer","An arm's length away","As close as you can get"], a:"A small step back from it", why:"Too close and you rock back and forth and bump it."},
  {id:"s15", q:"Where is your elbow while you slice?", o:["Down","Up, level with your shoulder","Out to the side","Locked straight"], a:"Down", why:"Elbow up drops your shoulder and your head."},
  {id:"s16", q:"Why elbow down?", o:["Head up, so you can see the guest","More force on the pusher deck","It keeps your sleeve off the blade","It hides your hand from the guest"], a:"Head up, so you can see the guest", why:"Shoulders back, head up, standing straight, eyes free for the guest."},
  {id:"s17", q:"How hard do you push the pusher deck?", o:["Lightly. The slicer does the work","Hard, driving down into the blade","Hard on thick meats only","As hard as the meat needs"], a:"Lightly. The slicer does the work", why:"The blade is sharp. Push straight through, no downward pressure."},
  {id:"s18", q:"How far does the pusher deck travel on each stroke?", o:["Only the length of the product","All the way forward and all the way back","Half the deck, whatever the product","Until it clicks"], a:"Only the length of the product", why:"Long strokes for ham, short ones for pepperoni. The rest is wasted motion."},
  {id:"s19", q:"Push, catch, flip: which hand catches?", o:["The left, coming in under the blade","The right, after it lets go of the deck","Either, whichever is closer","Neither. The slice drops on the sub"], a:"The left, coming in under the blade", why:"The two hands meet at the slicer on every stroke."},
  {id:"s20", q:"During push, catch, flip, the right hand:", o:["Never stops moving","Stops while the left hand flips","Rests on the dial","Holds the bread"], a:"Never stops moving", why:"Stopping it while you flip breaks the rhythm."},
  {id:"s21", q:"While you're learning the motion, your eyes stay on:", o:["The sub","The blade","Your right hand","The dial"], a:"The sub", why:"The meat comes out in the same place every time. Later, eyes up on the guest."},

  {id:"s22", q:"Every time you take product out of the meat case, you:", o:["Close the door","Leave it open for the next sub","Wipe the handle","Rotate the stock"], a:"Close the door", why:"Every single time."},
  {id:"s23", q:"How does product go into the slicer?", o:["Gently: right hand holds, left guides","Dropped in from above","Slid in with the left hand alone","Pushed in under the guard"], a:"Gently: right hand holds, left guides", why:"Dropping it in wears the slicer out over time."},
  {id:"s24", q:"\"Bring the guard to the party\" means:", o:["Put the guard on every product","Clean the guard before each rush","Call a coworker over to help","Keep the guard at the party tray station"], a:"Put the guard on every product", why:"Use the guard at all times when slicing."},
  {id:"s25", q:"What does the guard do?", o:["Holds the product, protects your hand","Sets how thick the slices are","Catches the slices under the blade","Turns the slicer on and off"], a:"Holds the product, protects your hand", why:"It keeps the product in place and keeps you off the blade."},
  {id:"s26", q:"While the right hand brings the guard down, the left hand:", o:["Sets the dial","Holds the bread","Catches the product","Closes the meat case"], a:"Sets the dial", why:"Setting the blade turns the slicer on."},
  {id:"s27", q:"Where does your right thumb go while slicing?", o:["Locked in behind the pusher deck","Wrapped around the handle","On top of the guard","Resting on the dial"], a:"Locked in behind the pusher deck", why:"Thumb behind the deck, fingers on the guard. The handle pulls your elbow up."},
  {id:"s28", q:"You need a slightly thicker slice. You:", o:["Add a little finger pressure on the guard","Turn the dial two clicks","Push the deck faster","Lift the guard off"], a:"Add a little finger pressure on the guard", why:"Fingers resting on the guard give you that control."},
  {id:"s29", q:"Taking product out of the slicer:", o:["Right hand slides it into your left","Left hand reaches in for it","Tip the deck and let it drop","Leave it in for the next sub"], a:"Right hand slides it into your left", why:"Guard off first. Then back to the meat case, door closed."},
  {id:"s30", q:"Which hand never reaches into the slicer?", o:["The left","The right","Either is fine with the guard on","Whichever is gloved"], a:"The left", why:"Reaching in with the left puts it dangerously close to the blade."},

  {id:"s31", q:"5 slices of provolone should weigh:", o:["2 oz","1 oz","3 oz","4.75 oz"], a:"2 oz", why:"5 slices of provolone = 2 oz. 8 slices of boiled ham = 4.75 oz."},
  {id:"s32", q:"8 slices of boiled ham should weigh:", o:["4.75 oz","2 oz","5.25 oz","3.5 oz"], a:"4.75 oz", why:"5 slices of provolone = 2 oz. 8 slices of boiled ham = 4.75 oz."},
  {id:"s33", q:"Which product sets the thickness for all the meats?", o:["Boiled ham","Turkey","Roast beef","Pepperoni"], a:"Boiled ham", why:"Ham for the meats, provolone for the cheeses."},
  {id:"s34", q:"Which product sets the thickness for the cheeses?", o:["Provolone","Swiss","White American","Whichever is open"], a:"Provolone", why:"Provolone sets it for both provolone and Swiss."},
  {id:"s35", q:"How often is slice thickness set?", o:["Every day","Once a week","When the blade is sharpened","Only when a guest complains"], a:"Every day", why:"Every morning. It affects both food cost and what the guest gets."},
  {id:"s36", q:"Before weighing, the paper goes on the scale and you:", o:["Hit tare to zero it out","Write the weight of the paper down","Fold it in half","Turn the scale off and on"], a:"Hit tare to zero it out", why:"So the weight of the paper isn't counted."},
  {id:"s37", q:"Where do the provolone test slices go?", o:["To the grill, for hot subs","In the trash","Back on the block","On the next cold sub"], a:"To the grill, for hot subs", why:"The ham goes on call-in orders or employee meals."},
  {id:"s38", q:"Meat sliced too thin means:", o:["Not enough meat on the sub","The store spends too much on every sub","The sub builds too tall","The blade dulls faster"], a:"Not enough meat on the sub", why:"And the flavor is off. Too thick is what drives food cost up."},

  {id:"s39", q:"Which of these is a catch and flip product?", o:["Salami","Turkey","Ham","Roast beef"], a:"Salami", why:"Catch and flip: provolone, Swiss, cappacuolo, salami, pepperoni."},
  {id:"s40", q:"Which of these gets flowered (catch, flower, flip)?", o:["Turkey","Pepperoni","Provolone","Salami"], a:"Turkey", why:"Flowered: ham, prosciuttini, turkey, roast beef."},
  {id:"s41", q:"On a catch and flip, the slice lands on:", o:["Your four fingers","Your palm","The paper","The back of your hand"], a:"Your four fingers", why:"Across the four fingers, then laid down."},
  {id:"s42", q:"The slice guide is:", o:["A guide, not a rule","The law: never add a slice","Only for catering orders","A list of prices by size"], a:"A guide, not a rule", why:"Some slices come out as half slices, and you add one."},
  {id:"s43", q:"A slice comes out as half a slice. You:", o:["Add another slice","Count it as a full one","Start the sub over","Take one off to even it out"], a:"Add another slice", why:"The slice guide is a guide, not a rule."},
  {id:"s44", q:"\"Proper sequence\" means slicing in the order:", o:["Listed on the slice guide","Of lightest to heaviest","The guest names them","That's closest in the meat case"], a:"Listed on the slice guide", why:"On a #5: provolone, ham, prosciuttini, cappacuolo."},
  {id:"s45", q:"The #5, in slicing order:", o:["Provolone, ham, prosciuttini, cappacuolo","Provolone, cappacuolo, ham, prosciuttini","Ham, provolone, prosciuttini, cappacuolo","Provolone, ham, cappacuolo, prosciuttini"], a:"Provolone, ham, prosciuttini, cappacuolo", why:"Cheese first, then the meats in slice guide order."},
  {id:"s46", q:"How does the turkey go on a #7?", o:["About 10 slices, in 2 layers of 5","About 5 slices, in 1 layer","About 10 slices, piled in the middle","About 15 slices, in 3 layers"], a:"About 10 slices, in 2 layers of 5", why:"One meat goes on in layers, covering end to end."},
  {id:"s47", q:"\"Double pumping\" is:", o:["Pushing through twice and catching once","Slicing two meats at once","Weighing the same sub twice","Putting two guards on one product"], a:"Pushing through twice and catching once", why:"It takes height off the sub, and height is the value the guest sees."},
  {id:"s48", q:"\"Build it up, not out\" is about:", o:["Height: meat gathered, not flat","Width: meat spread past the bread","Speed: building two subs at once","Order: cheese on top of the meat"], a:"Height: meat gathered, not flat", why:"A taller sub looks like more, because the guest sees the meat."},
  {id:"s49", q:"Equal distribution means every meat:", o:["Covers the sub end to end","Weighs the same","Gets the same slice count","Sits in the middle"], a:"Covers the sub end to end", why:"The end nearest the guest and the end nearest you."},

  {id:"s50", q:"Weighing a sub: after the paper is tared, what goes on the scale next?", o:["The bottom bread, then tare again","The whole sub, lid and all","The cheese by itself","The lid, then tare again"], a:"The bottom bread, then tare again", why:"Paper, tare, bottom bread, tare, slice, then the whole sub."},
  {id:"s51", q:"A weighed sub comes up heavy. You:", o:["Leave it as it is","Take a slice or two off","Charge for extra meat","Start over on new bread"], a:"Leave it as it is", why:"Never take slices off. If anything, add a slice or two."},
  {id:"s52", q:"A weighed sub comes up light. You:", o:["Add a slice or two","Leave it, close enough","Thicken the dial for the next one","Tell the wrapper to add lettuce"], a:"Add a slice or two", why:"If anything, always add."},
  {id:"s53", q:"How many subs do you weigh each shift you slice?", o:["At least 3","Every sub","1","Only catering"], a:"At least 3", why:"A minimum of 3 every shift."},
  {id:"s54", q:"Which orders does the video say to weigh as many of as you can?", o:["Online, call-in and catering","Anything a manager orders for lunch","Hot subs off the grill","Minis and kids meals"], a:"Online, call-in and catering", why:"Plus one sub number a day, as many of those as you can."},
  {id:"s55", q:"You put a guest's sub on the scale. What do you say?", o:["That you're checking they get enough","Nothing at all, since it only takes a second","That the scale has to be tested every day","That the manager asked you to"], a:"That you're checking they get enough", why:"Say nothing and the guest may think you're skimping."},

  {id:"s56", q:"Which size portion goes in a sub in a tub?", o:["Regular, always","Whatever size they order","Mini","Giant, split in two tubs"], a:"Regular, always", why:"Always slice the regular-size portion for a tub."},
  {id:"s57", q:"In a tub, the round meats go on:", o:["Diagonally, on top","Flat, under the cheese","Folded in half","Last, after the roll is cut"], a:"Diagonally, on top", why:"Cheese flat, flowered meats flat, round meats diagonally on top."},
  {id:"s58", q:"How many cuts in the tub roll?", o:["5 cuts, 6 pieces","4 cuts, 5 pieces","3 cuts, 4 pieces","6 cuts, 6 pieces"], a:"5 cuts, 6 pieces", why:"Five cuts make six equal pieces."},
  {id:"s59", q:"What goes in the tub first?", o:["2 soufflé cups of lettuce","The cut pieces","Oil and vinegar","A deli sheet"], a:"2 soufflé cups of lettuce", why:"Two pinches of lettuce on the bottom, pieces on top."},
  {id:"s60", q:"A hot sub in a tub: what do you ask?", o:["If they want lettuce on the bottom","If they want it cut in six","If they want the bread on the side","If they want extra cheese melted on"], a:"If they want lettuce on the bottom", why:"Then the hot sub mixture goes in the container."},
  {id:"s61", q:"What goes out with every tub?", o:["A fork and knife","Two extra napkins","A side of bread","A second lid"], a:"A fork and knife", why:"Lid closed tight, and don't forget the fork and knife."},

  {id:"s62", q:"Which way do you turn the dial to close the blade?", o:["Clockwise","Counterclockwise","Either way, to zero","You don't. Flip the switch"], a:"Clockwise", why:"Clockwise until the blade is completely closed."},
  {id:"s63", q:"Closing the blade all the way also:", o:["Turns the slicer off","Locks the meat case","Releases the guard","Starts the sharpener"], a:"Turns the slicer off", why:"It shuts off automatically."},
  {id:"s64", q:"What releases the pusher deck so it swings open?", o:["The black knob on the side","The dial, turned past zero","A lever under the bay","Lifting the guard off"], a:"The black knob on the side", why:"Swinging the deck open locks the dial and the blade closed."},
  {id:"s65", q:"The wipe-down towel is:", o:["In warm sanitizer, wrung out, folded in 12","Dry, from the clean stack","Soaked in hot soapy water","A paper towel sprayed with glass cleaner"], a:"In warm sanitizer, wrung out, folded in 12", why:"Soaked in warm sanitizer solution and wrung out well."},
  {id:"s66", q:"The slicer gets wiped down before slicing:", o:["A veggie sub","A club","Any sub with turkey","An Italian"], a:"A veggie sub", why:"Before a veggie sub, and after any sub with roast beef."},
  {id:"s67", q:"The slicer gets wiped down after any sub with:", o:["Roast beef","Turkey","Provolone","Prosciuttini"], a:"Roast beef", why:"Before a veggie sub, and after any sub with roast beef."},
  {id:"s68", q:"Before you walk away from the slicer, you always:", o:["Wipe it down","Unplug it","Take the blade off","Cover it with a towel"], a:"Wipe it down", why:"Never step away without leaving it clean."},
  {id:"s69", q:"In a wipe-down, the pusher deck is wiped:", o:["Top to bottom","Bottom to top","Side to side","In circles"], a:"Top to bottom", why:"Start at the top of the pusher deck and wipe toward the bottom."},

  {id:"s70", q:"How often is the slicer fully taken apart and cleaned?", o:["Every 4 hours","Every 2 hours","Once a day, at close","After every 50 subs"], a:"Every 4 hours", why:"Like every food contact surface."},
  {id:"s71", q:"Cleaned at 10:30 a.m., the slicer is due again by:", o:["2:30 p.m.","12:30 p.m.","4:30 p.m.","Close"], a:"2:30 p.m.", why:"Then again by 6:30, and at close."},
  {id:"s72", q:"How many metal mesh gloves do you need for a full clean?", o:["2","1","None, regular gloves are fine","3"], a:"2", why:"Two metal mesh safety gloves, on before you touch the blade."},
  {id:"s73", q:"A full slicer clean is three passes, in this order:", o:["Wash, rinse, sanitize","Sanitize, wash, rinse","Rinse, wash, dry","Wash, sanitize, rinse"], a:"Wash, rinse, sanitize", why:"Warm soapy water, rinse water, warm sanitizer solution."},
  {id:"s74", q:"After closing the blade for a full clean, you:", o:["Unplug the slicer","Leave it plugged in","Turn the dial back open","Take the cord to the sink"], a:"Unplug the slicer", why:"Off, then unplugged, before anything comes apart."},
  {id:"s75", q:"Which parts come off and go to the three-compartment sink?", o:["The spike plate and the blade plate","The blade and the guard ring","The dial and the black knob","The pusher deck and the bay"], a:"The spike plate and the blade plate", why:"The small black knob on the guard releases the spike plate."},
  {id:"s76", q:"When do the metal mesh gloves go on?", o:["Before you wash the blade","After the slicer is back together","Only for the sanitize pass","Only when sharpening"], a:"Before you wash the blade", why:"Parts off first, then gloves on, then the blade."},
  {id:"s77", q:"The blade is wiped:", o:["From the center outward, slowly","From the edge in toward the center","Around the edge only","In quick circles"], a:"From the center outward, slowly", why:"Center out, front and back."}
];

/* ---------- more things done in a fixed order ---------- */
SEQS.steak = {title:"A #17 on the grill, in order", hint:"Tap the nine steps in order.", first:"Tap the first step.", okText:"That's a #17.", board:false, visual:false, where:"Cheesesteaks: 17, 43, 56",
  steps:["Bread on the grill to temper","Paper torn, cheese laid out","Onions down, as long as the bread","Peppers on top of the onions","Steak on, flipped, lightly salted","Break 4, bring together, break 4","Onions and peppers on top, break 8 more","Cheese on top, a few slits","Onto the bread, loose bits scraped on"]};
SEQS.tuna = {title:"A batch of tuna, in order", hint:"Tap the six steps in order.", first:"Tap the first step.", okText:"That's the tuna.", board:false, visual:false, where:"Celery and tuna",
  steps:["Break down the tuna, one pouch at a time","Mix the two tunas together","Black pepper","Celery","Mayo","Pan it, date it, rest it overnight"]};
SEQS.bread = {title:"The bread day, in order", hint:"Tap the seven steps in order.", first:"Tap the first step.", okText:"That's the bread day.", board:false, visual:false, where:"Bread 1: panning",
  steps:["Pan the frozen loaves, after 7 p.m.","Thaw in the walk-in overnight","Proof","Score the white loaves","Bake to golden brown","Cool on the bottom rungs","Stack in a pyramid"]};
SEQS.tub = {title:"Sub in a tub, in order", hint:"Tap the seven steps in order.", first:"Tap the first step.", okText:"That's a tub.", board:false, visual:false, where:"Sub in a tub",
  steps:["Deli sheet down, cheese laid flat","Ham and prosciuttini, flat on the cheese","Round meats, diagonally on top","Roll it neat and tight","Cut 5 times, 6 pieces","Lettuce in the tub, pieces on top","Sprinkle it, close the lid, fork and knife"]};
SEQS.wipe = {title:"Wiping down the slicer, in order", hint:"Tap the eight steps in order.", first:"Tap the first step.", okText:"That's the wipe-down.", board:false, visual:false, where:"Wiping down the slicer",
  steps:["Dial clockwise: blade closed, slicer off","Black knob loose, pusher deck swings open","Pusher deck, top to bottom","Blade plate and adjustable deck, front to back","The side","Towel fed through, front to back","The bay","Deck back in place, knob tight"]};
Object.keys(SEQS).forEach(function(k){ SEQS[k].recap = SEQS[k].recap || SEQS[k].steps.map(function(s){ return s.replace(/\.$/, ""); }).join(". ") + "."; });
SEQS.wrap.where = "Wrapping the sub";

/* ---------- which questions belong to which card ---------- */
function ids(prefix, a, b){ var r = []; for (var i = a; i <= b; i++) r.push(prefix + i); return r; }
MODS = MODS.concat([
  {id:"timetemp", bank:"kitchen", q:ids("t", 1, 7)},
  {id:"regsafe", bank:"wrap", q:ids("r", 1, 10)},
  {id:"regserve", bank:"wrap", q:ids("r", 11, 15)},
  {id:"prep", bank:"prep", q:ids("p", 1, 10)},
  {id:"onion", bank:"prep", q:ids("p", 11, 21)},
  {id:"lettuce", bank:"prep", q:ids("p", 22, 34)},
  {id:"tomato", bank:"prep", q:ids("p", 35, 43)},
  {id:"celery", bank:"prep", q:ids("p", 44, 56), seq:"tuna"},
  {id:"meats", bank:"prep", q:ids("p", 57, 63)},
  {id:"chart", bank:"prep", q:ids("p", 64, 75)},
  {id:"pan", bank:"bread", q:ids("b", 1, 8), seq:"bread"},
  {id:"proof", bank:"bread", q:ids("b", 9, 19)},
  {id:"bake", bank:"bread", q:ids("b", 20, 32)},
  {id:"grill", bank:"grill", q:ids("g", 1, 8)},
  {id:"steak", bank:"grill", q:ids("g", 9, 25), seq:"steak"},
  {id:"chick", bank:"grill", q:ids("g", 26, 30)},
  {id:"chick2", bank:"grill", q:ids("g", 31, 42)},
  {id:"hotwrap", bank:"grill", q:ids("g", 43, 47)},
  {id:"bacon", bank:"grill", q:ids("g", 48, 53)},
  {id:"defrost", bank:"grill", q:ids("g", 54, 61)},
  {id:"slmind", bank:"slicer", q:ids("s", 1, 5)},
  {id:"breadcut", bank:"slicer", q:ids("s", 6, 12)},
  {id:"stance", bank:"slicer", q:ids("s", 13, 21)},
  {id:"guard", bank:"slicer", q:ids("s", 22, 30)},
  {id:"thick", bank:"slicer", q:ids("s", 31, 38)},
  {id:"slice", bank:"slicer", q:ids("s", 39, 49)},
  {id:"weigh", bank:"slicer", q:ids("s", 50, 55)},
  {id:"tub", bank:"slicer", q:ids("s", 56, 61), seq:"tub"},
  {id:"wipe", bank:"slicer", q:ids("s", 62, 69), seq:"wipe"},
  {id:"sclean", bank:"slicer", q:ids("s", 70, 77)}
]);

BANK_LABEL.wrap = "Wrapper and register";
BANK_LABEL.prep = "Prep";
BANK_LABEL.bread = "Bread";
BANK_LABEL.grill = "The grill";
BANK_LABEL.slicer = "The slicer";
DECKS.forEach(function(d){ if (d.key === "wrap") d.label = BANK_LABEL.wrap; });
["prep", "bread", "grill", "slicer"].forEach(function(b){ DECKS.push({key:b, label:BANK_LABEL[b], bank:b, hidden:true}); });
HOWTO_NAME.steak = "A #17 on the grill";
