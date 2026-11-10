
/* ---------- the path: crew, shift lead, manager ----------
   Added Nov 9, 2026 from the second batch of training videos (bread extras, opening, closing, the slicer's upkeep, ordering,
   inventory, food cost, scheduling, marketing, profit) and the store's own training sheets (the 14 foot fundamentals, speed
   of experience, the training play sheets, the prep clock, the scheduling checklist, the weekly review sheet).
   Every station that was already here is level 1. */
var LEVELS = [
  {n:1, key:"crew", title:"Crew", line:"Work every station."},
  {n:2, key:"lead", title:"Shift lead", line:"Run a shift."},
  {n:3, key:"mgr", title:"Manager", line:"Run the store."}
];
GROUPS.forEach(function(g){ g.level = 1; });

/* ---------- bread extras: floor thaw, rosemary parm, gluten-free ---------- */
BANKS.bread = BANKS.bread.concat([
  {id:"b33", q:"A floor thaw is for:", o:["Every morning, to free up room in the walk-in cooler","A pinch, when the overnight thaw wasn't enough","Wheat bread only","Leftover bread"], a:"A pinch, when the overnight thaw wasn't enough", why:"High demand or a surprise. It works, but it isn't the ideal way."},
  {id:"b34", q:"For a floor thaw, the frozen dough sits in the bread rack at room temperature for about:", o:["Twenty-five minutes","An hour and a half","Four hours","Overnight"], a:"An hour and a half", why:"An hour and a half, or until it's thawed all the way. Check it often."},
  {id:"b35", q:"Dough on a floor thaw starts to look dry. You:", o:["Add more cornmeal","Put it straight in the oven","Mist it with water","Throw it out"], a:"Mist it with water", why:"Mist when needed so the dough doesn't dry out."},
  {id:"b36", q:"Why isn't a floor thaw the ideal way?", o:["It takes longer than a night in the walk-in cooler","The dough misses the aging it gets overnight","The loaves can't be scored","It uses more cornmeal"], a:"The dough misses the aging it gets overnight", why:"Without that aging the bread isn't at its best. Color, texture and flavor can be slightly off."},
  {id:"b37", q:"The best fix for running short on bread is to:", o:["Floor thaw a few pans every day, just in case","Proof it hotter","Bake enough in the first place","Skip the proof"], a:"Bake enough in the first place", why:"Track your bread and tell the team, so the predictions get accurate."},
  {id:"b38", q:"How much Parmesan goes on one loaf of rosemary parm?", o:["Half an ounce","2 ounces","1/16 of an ounce","A full soufflé cup"], a:"Half an ounce", why:"Half an ounce a loaf, about a third of a 4 oz soufflé cup."},
  {id:"b39", q:"How much rosemary goes on one loaf?", o:["A third of a soufflé cup","About 2 small pinches","Half an ounce","1 full row"], a:"About 2 small pinches", why:"1/16 of an ounce, which is about 2 small pinches."},
  {id:"b40", q:"On rosemary parm, what goes on right after you score the loaf?", o:["The chopped rosemary","The Parmesan","A mist of water","Cornmeal"], a:"A mist of water", why:"Score, then mist. The water helps the cheese and rosemary stick."},
  {id:"b41", q:"Which goes on first, the Parmesan or the rosemary?", o:["Rosemary, then Parmesan on top","Parmesan, then rosemary on top","Both mixed together first","Either one"], a:"Parmesan, then rosemary on top", why:"Parmesan across the loaf with the ends covered. Rosemary on top of the cheese."},
  {id:"b42", q:"Why shredded Parmesan and not grated?", o:["It costs less","It keeps longer","It sticks without water","It melts nicely"], a:"It melts nicely", why:"The video says shredded was picked because it melts nicely."},
  {id:"b43", q:"An open bag of Parmesan goes into:", o:["The freezer, still in its own bag","A 4-quart Cambro in the walk-in","A third pan on the line","Dry storage"], a:"A 4-quart Cambro in the walk-in", why:"Unopened extra bags can go in the freezer. The open one goes in a 4-quart Cambro in the walk-in."},
  {id:"b44", q:"Rosemary parm is usually about how much of the bread you bake?", o:["5%","20%","50%","75%"], a:"20%", why:"About 20% of the bread count. Track it on the production report so it never runs out."},
  {id:"b45", q:"Rosemary parm loaves left at the end of the day:", o:["Get thrown out at close","Go back in the freezer","Go to hot subs the next day","Are sold first tomorrow, cold"], a:"Go to hot subs the next day", why:"Remaining loaves can be stored and used for hot subs the next day."},
  {id:"b46", q:"During a rush, where does rosemary parm sit so guests try it?", o:["In the walk-in cooler until a guest asks for it by name","In front of the slicer or on top of the meat case","Behind the grill","Under the counter"], a:"In front of the slicer or on top of the meat case", why:"Keep it on display where guests can see it."},
  {id:"b47", q:"The shredded Parmesan's shelf life is:", o:["7 days","30 days","90 days","1,095 days"], a:"90 days", why:"Parmesan, 90 days. The chopped rosemary is the one that lasts 1,095 days."},
  {id:"b48", q:"Gluten-free rolls arrive:", o:["As frozen dough that proofs with the white bread","Fully baked, each one wrapped, 12 to a case","Baked fresh every morning","In bags of 6, unwrapped"], a:"Fully baked, each one wrapped, 12 to a case", why:"Fully baked and individually wrapped. The cases go straight into the freezer."},
  {id:"b49", q:"Frozen, the gluten-free rolls keep for up to:", o:["7 days","90 days","6 months","2 years"], a:"6 months", why:"Up to 6 months fully frozen."},
  {id:"b50", q:"Where do gluten-free rolls thaw?", o:["On the bread rack with the other loaves","In the proofer","On the back counter, still wrapped","In the walk-in overnight"], a:"On the back counter, still wrapped", why:"Never on the bread rack. They stay wrapped until served."},
  {id:"b51", q:"A gluten-free roll takes about how long to thaw?", o:["5 minutes","40 minutes","2 hours","Overnight"], a:"40 minutes", why:"About 40 minutes, so they're pulled at 9:15 a.m. as part of opening."},
  {id:"b52", q:"A guest orders a gluten-free sub. What comes first?", o:["Clean the slicer and the counter","Cut the roll","Tear the parchment","Ask about toppings"], a:"Clean the slicer and the counter", why:"Clean the slicer and counters. Then wash hands and change gloves. Then the parchment goes down."},
  {id:"b53", q:"What is the parchment paper for?", o:["Keeping the roll warm","Marking the sub as gluten-free for the wrapper","Catching the juice","A barrier between the counter and the sub"], a:"A barrier between the counter and the sub", why:"The whole sub is made on the paper, so it never touches the counter or the board."},
  {id:"b54", q:"The knife for a gluten-free sub is:", o:["The line's bread knife, wiped with a sanitizer towel","A clean knife used only for gluten-free","Any knife from the rack","The grill's dough cutter"], a:"A clean knife used only for gluten-free", why:"A dedicated knife. It travels down the line with the sub."},
  {id:"b55", q:"The gluten-free roll is a little smaller. The meat and cheese portions are:", o:["Half","Smaller, to match the size of the roll","The same as a regular or giant","Whatever fits"], a:"The same as a regular or giant", why:"Smaller roll, same portions."},
  {id:"b56", q:"A guest wants mayo on a gluten-free sub. You use:", o:["The same spatula that sits in the mayo pan","A soufflé cup from the line","The squeeze bottle from the meat case","Nothing, mayo isn't allowed"], a:"The squeeze bottle from the meat case", why:"Squeeze bottles for mayo and cherry pepper relish, not the spatulas."},
  {id:"b57", q:"A finished gluten-free sub is wrapped on a fresh sheet and labeled:", o:["X","GF","NG","GL"], a:"GF", why:"GF, for gluten-free."},
  {id:"b58", q:"A gluten-free hot sub's bread is cut:", o:["Into a pocket, like every other hot sub","Not at all","In thirds","All the way through, like a cold sub"], a:"All the way through, like a cold sub", why:"No pocket. Once the fillings are on the bottom half, regulars are cut in half and giants in quarters."},
  {id:"b59", q:"Thawed gluten-free rolls still in their wrapper are good for:", o:["24 hours","5 to 7 days","2 weeks","6 months"], a:"5 to 7 days", why:"Unopened and thawed, 5 to 7 days. An opened roll is wrapped in plastic and used that day."}
]);
SEQS.rosemary = {title:"Rosemary parm, in order", hint:"Tap the six steps in order.", first:"Tap the first step.", okText:"That's rosemary parm.", board:false, visual:false, where:"Rosemary parm bread",
  steps:["Bread fully proofed","Score the loaves","Mist with water","Parmesan across the loaf, ends covered","Rosemary on top of the cheese","Bake as normal"]};
SEQS.gf = {title:"A gluten-free cold sub, in order", hint:"Tap the eight steps in order.", first:"Tap the first step.", okText:"That's a gluten-free sub.", board:false, visual:false, where:"Gluten-free bread",
  steps:["Clean the slicer and counter","Wash hands, fresh gloves","Parchment paper down","Unwrap the roll, cut it with the gluten-free knife","Slice it, same portions","Paper, sub and knife go to the sprinkler","Fresh sheet: wrap it, cut it with the same knife","Label it GF"]};

/* ---------- guests and the line: customer service fundamentals, speed of experience ---------- */
GROUPS.push({id:"team", bank:"team", level:1});
BANKS.team = [
  {id:"l1", q:"A guest walks in while you're doing prep in the back. You:", o:["Finish the pan you're on, then come up","Stop and come to the front line","Call hello from the back","Wait to be asked"], a:"Stop and come to the front line", why:"Customers first. Everyone stops what they're doing and comes forward to help."},
  {id:"l2", q:"The three places the training says to greet a guest:", o:["The door, the register, and the exit","Outside, inside, and at the slicer","Phone, app, counter","Line, grill, tables"], a:"Outside, inside, and at the slicer", why:"The parking lot, inside the store, and at the slicer."},
  {id:"l3", q:"A scripted \"Welcome to Jersey Mike's!\" at the door is:", o:["Required for every guest who walks in the door","Only for new guests","What the training tells you not to do","The slicer's line"], a:"What the training tells you not to do", why:"They know where they are. Greet like yourself, and introduce yourself."},
  {id:"l4", q:"A guest outside is done with a shopping cart. The training's example is to:", o:["Offer to walk it back for them","Wave from the window so they feel seen","Hold the door only","Stay inside"], a:"Offer to walk it back for them", why:"A small kindness while wearing the logo makes a strong impression."},
  {id:"l5", q:"Where is the easiest place to learn a guest's name?", o:["Their card","The receipt","Their hot sub ticket","The app"], a:"Their hot sub ticket", why:"Their name is written on it. Look at the face too, so you know them next time."},
  {id:"l6", q:"A guest has never been in before. You:", o:["Read them the whole board so they don't miss anything good","Offer help and maybe a suggestion, without crowding them","Let them figure it out","Send them to the register"], a:"Offer help and maybe a suggestion, without crowding them", why:"Gauge what they know, offer to help, and give them space."},
  {id:"l7", q:"At the very least, a guest should walk out saying:", o:["\"That was fast.\"","\"That was cheap.\"","\"I'm going back.\"","\"Nice store.\""], a:"\"I'm going back.\"", why:"That's the lasting impression. A real thank you, every single time."},
  {id:"l8", q:"\"360° vision\" means:", o:["Watching the slicer blade","Knowing what's happening in the whole store","Checking the cameras","Turning all the way around once every minute"], a:"Knowing what's happening in the whole store", why:"Head up, noticing guests and the team, so you can step in."},
  {id:"l9", q:"Which one is an example of peripheral hearing?", o:["You hear a cashier ask a guest what they ordered, and you tell the cashier","You repeat every order loudly so the whole line and the grill can hear it","You wear one earbud","You answer the phone first"], a:"You hear a cashier ask a guest what they ordered, and you tell the cashier", why:"You listen to the whole store while you work, and you act on what you hear."},
  {id:"l10", q:"Chatting with a teammate about your weekend while serving a guest is:", o:["Good banter","Fine if it's quiet","Fine at the register","Something to avoid"], a:"Something to avoid", why:"Keep the conversation on the guest. Share your life with them, not past them."},
  {id:"l11", q:"Who is the quarterback of the line?", o:["The cashier","The grill","The slicer","The wrapper"], a:"The slicer", why:"The slicer controls the pace and is responsible for the whole line."},
  {id:"l12", q:"For the slicer, which comes first?", o:["Speed first, experience second","Experience first, speed second","Speed only","Weight only"], a:"Experience first, speed second", why:"The slicer holds the guest's experience together. The sprinkler and the wrapper are speed first."},
  {id:"l13", q:"At most, how many subs does the slicer work on at one time?", o:["1","3","5","As many as fit"], a:"3", why:"No more than 3. It sets the pace, leaves time to check the team, and cuts mistakes."},
  {id:"l14", q:"\"Calling an audible\" means:", o:["Shouting the order","Calling the manager","Reading the hot sub ticket out loud to the grill","Changing the play to help where it's backed up"], a:"Changing the play to help where it's backed up", why:"Slow down or stop slicing to help sprinkle, or move a teammate to the spot that's behind."},
  {id:"l15", q:"\"Aces in their places\" means:", o:["Your best people in their best spots when a rush starts","Everyone picks the station they like best for the shift","The meat case is fully stocked","Cards on the break table"], a:"Your best people in their best spots when a rush starts", why:"Set it at the start of a shift or rush, and move people if a spot falls behind."},
  {id:"l16", q:"Something goes wrong on the line. Who takes responsibility?", o:["Whoever touched it last","The newest person","The slicer","Nobody, keep moving"], a:"The slicer", why:"On the slicer you aren't just running the slicer. You're running the store."},
  {id:"l17", q:"The slicer passes a sub down. What do they say?", o:["Nothing, because the ticket covers it","What the sub is and who it's for","\"Next!\"","The price"], a:"What the sub is and who it's for", why:"Slicer tells sprinkler, sprinkler tells wrapper, wrapper tells cashier. The guest is never asked twice."},
  {id:"l18", q:"What is speed of experience training for?", o:["Making any single sub as fast as it can be made","Skipping the banter","Serving more guests in the same amount of time","Smaller portions"], a:"Serving more guests in the same amount of time", why:"Not one sub faster. More guests served in the same time."},
  {id:"l19", q:"A guest asks for lettuce, tomatoes, vinegar, oil and spices. In Mike's Way language that is:", o:["Mike's Way, dry","Mike's Way, no onions","Mike's Way, plus onions","Not Mike's Way"], a:"Mike's Way, no onions", why:"Convert the list to Mike's Way. It's far easier to remember across three subs."},
  {id:"l20", q:"You're sprinkling three subs and one is Mike's Way with no onions. The memory hint is:", o:["A pickle slice in front of it","Its lid flipped over","A few shreds of lettuce on it","Move it back"], a:"A few shreds of lettuce on it", why:"A few shreds of lettuce on the sub means: no onions on this one."},
  {id:"l21", q:"The memory hint for \"Mike's Way plus pickles\":", o:["A pickle slice in front of the sub","Shreds of lettuce on the sub","The sub pushed forward","Two lids stacked"], a:"A pickle slice in front of the sub", why:"One pickle slice in front of that sub."},
  {id:"l22", q:"One sub gets no vinegar and oil (dry). The memory hint is:", o:["One pickle slice set in front of it on the board","Lettuce shreds on it","Its lid in the trough","Space it apart, or move it forward on the board"], a:"Space it apart, or move it forward on the board", why:"Out of line with the others, so the juice skips it."},
  {id:"l23", q:"Subs getting mayo, cherry pepper relish or bacon: where do their lids go?", o:["On top of the sub","To the other side of the board","In the trough","To the cashier"], a:"To the other side of the board", why:"It reminds you, and it lets the wrapper help dress them."},
  {id:"l24", q:"What is the Sprinkle Dance?", o:["One person sprinkling with a bottle in each hand","A cornmeal drill","Two people trading places, topping by topping","Sprinkling to music"], a:"Two people trading places, topping by topping", why:"One does onions, steps around while the other does lettuce, comes back for tomatoes, and so on, talking the whole time."},
  {id:"l25", q:"A guest orders topping by topping. After you convert it to Mike's Way, you:", o:["Say it back to them and invite them to order that way next time","Keep it to yourself","Correct them","Charge for extras"], a:"Say it back to them and invite them to order that way next time", why:"It takes a few visits. Guests who speak Mike's Way get through the line faster."},
  {id:"l26", q:"For speed, the sprinkling counter is set with how many sets of bottles and shakers?", o:["1","2","3","4"], a:"2", why:"Two sets of bottles and shakers, backup extras ready, 2 squeegees, caps clean and tight."},
  {id:"l27", q:"The wrapper knows three things about every sub:", o:["Its weight, price and points","Its bread, cheese and meat","What it is, where it is, and who it's for","Its number, size and time"], a:"What it is, where it is, and who it's for", why:"Front line, digital line, grill, call-ins, catering: the wrapper keeps them all straight."},
  {id:"l28", q:"Who can ask \"chips and a drink?\" before the guest reaches the register?", o:["Only the cashier","The wrapper","Only the manager","Nobody"], a:"The wrapper", why:"The wrapper asks the add-on questions and about Shore Points. That takes load off the cashier."},
  {id:"l29", q:"\"Avoid the wrapper lean\" means:", o:["Stand up straight","Don't lean on the bags","Wrap looser","Don't stand waiting: be the second sprinkler"], a:"Don't stand waiting: be the second sprinkler", why:"Help with lids for mayo, bacon and relish, and do the Sprinkle Dance. Don't wait to be asked."},
  {id:"l30", q:"A hot sub is ready and the guest is at a table. The wrapper:", o:["Shouts their name","Brings it to them","Leaves it at the grill","Waits for them to ask"], a:"Brings it to them", why:"Don't yell the name. Deliver it whenever you can."},
  {id:"l31", q:"Why is the wrapper called the last line of defense?", o:["They can still catch a wrong sub before it leaves","They guard the register","They lock the doors","They count the bags"], a:"They can still catch a wrong sub before it leaves", why:"Listen as the guest orders. Check that clubs got their bacon by lifting the lid."},
  {id:"l32", q:"To ring a guest faster, can you pull them ahead in the line?", o:["Yes, in a rush","Yes, for regulars","No, never","Yes, if they have one sub"], a:"No, never", why:"The training's reason: it keeps the guests organized."}
];

/* ---------- pass the check: what a trainer or a strict manager watches for at each station ---------- */
GROUPS.push({id:"check", bank:"check", level:1});
BANKS.check = [
  {id:"k1", q:"Right before the juice goes on, a confident sprinkler:", o:["Salts the sub","Sweeps the board","Closes the lid","Weighs the sub"], a:"Sweeps the board", why:"Sweep the board, then the juice."},
  {id:"k2", q:"Once you start sprinkling a sub, it:", o:["Stays where it is","Slides toward the wrapper","Gets turned around","Moves to the trough"], a:"Stays where it is", why:"All the way down the board first. Then it doesn't move until it's done."},
  {id:"k3", q:"The juice goal a trainer keeps coaching: 2 rows come out to 2 oz at least:", o:["5 times out of 10","Every other time","8 times out of 10","Once a shift"], a:"8 times out of 10", why:"Two rows for 2 oz on a giant, hit at least 8 times out of 10."},
  {id:"k4", q:"How does a sub leave the sprinkling board?", o:["Slid along the board","Lifted from the middle","Flipped onto the paper","Picked up by its ends"], a:"Picked up by its ends", why:"By the ends. Never slid."},
  {id:"k5", q:"How many sheets of wrapping paper do you tear at a time?", o:["One","Two","Three","A stack for the rush"], a:"One", why:"One sheet at a time. No stacking."},
  {id:"k6", q:"On a finished wrap, the ends are:", o:["Left open","Tucked tight, with no wings sticking out","Folded under twice and taped with a sticker","Taped"], a:"Tucked tight, with no wings sticking out", why:"Ends tucked and rounded, the roll tight but not crushing the sub."},
  {id:"k7", q:"How many wrapped subs go in a 12 lb. bag?", o:["1 to 2","3 to 4","5 to 6","As many as fit"], a:"3 to 4", why:"A 12 lb. bag holds 3 to 4 subs. A 20 lb. bag holds 4 to 5."},
  {id:"k8", q:"The wrapper asks one question about where the guest is eating. It is:", o:["\"To go?\"","\"Here or to go?\"","\"For here?\"","\"Taking it out?\""], a:"\"For here?\"", why:"Only ask if it's for here. It's more inviting than asking if it's to go."},
  {id:"k9", q:"At the register, CFT stands for:", o:["Cash For Till","Customer Facing Terminal","Card Fee Total","Counter Front Tablet"], a:"Customer Facing Terminal", why:"The screen the guest uses, including for their Shore Points number."},
  {id:"k10", q:"Handling money at the register, gloves are:", o:["On, the same pair you wear on the line","On, with a fresh pair for every guest","Optional","Off, and you wash before touching food"], a:"Off, and you wash before touching food", why:"No gloves on money. Wash your hands before you touch food again."},
  {id:"k11", q:"A new cashier's training covers which section of the Safety First booklet?", o:["Robbery","Fire","Slips and falls","Knife safety"], a:"Robbery", why:"Thirty minutes go to the robbery section of the Safety First booklet."},
  {id:"k12", q:"Besides ringing sales, a confident cashier can handle:", o:["Bread orders","The schedule","Refunds, voids and cancels","Slicer sharpening"], a:"Refunds, voids and cancels", why:"Sales, discounts and coupons, refunds, voids, cancels, gift cards and Shore Points."},
  {id:"k13", q:"On the grill, when does the steak go down?", o:["First, before anything else is on the grill","Last, after the onions and peppers","With the cheese","Before the bread"], a:"Last, after the onions and peppers", why:"The play sheet's words: steak down last on the grill."},
  {id:"k14", q:"When is the steak salted?", o:["Before it hits the grill","With the cheese","After the flip","It isn't"], a:"After the flip", why:"Flip, then lightly salt."},
  {id:"k15", q:"The grill tools drill: break the onions how many times?", o:["8","12","20","16, in a 4 x 4 x 4 x 4 pattern"], a:"16, in a 4 x 4 x 4 x 4 pattern", why:"Sixteen breaks, always in the same four-by-four pattern."},
  {id:"k16", q:"How many hot subs does one person cook at a time, at most?", o:["3","2","5","6"], a:"3", why:"No more than 3 at a time, so nothing overcooks."},
  {id:"k17", q:"The slicing check: 5 slices of provolone should weigh:", o:["1 oz","2 to 2.2 oz","3 to 3.2 oz","4.75 oz"], a:"2 to 2.2 oz", why:"Five slices of provolone, 2 oz. The challenge range is 2 to 2.2."},
  {id:"k18", q:"And 5 slices of ham should weigh about:", o:["1 oz","2 oz","3 oz","5 oz"], a:"3 oz", why:"The fundamentals sheet says 2.95 oz and the play sheet says 3 to 3.2. Same thickness as 8 slices for 4.75 oz."},
  {id:"k19", q:"How many hot, wet towels does the slicer keep ready for wipe-downs?", o:["1","2","5","10"], a:"5", why:"Five hot, wet towels ready, and wipe often."},
  {id:"k20", q:"After cutting the bread, where does the slicer put the lid?", o:["On the counter next to the sprinkling board","On top of the meat case, where it's out of the way","Back on the loaf","In the trough"], a:"On the counter next to the sprinkling board", why:"Lids go next to the sprinkling board, ready for the sprinkler."}
];
MODS = MODS.concat([
  {id:"thaw", bank:"bread", q:ids("b", 33, 37)},
  {id:"rosemary", bank:"bread", q:ids("b", 38, 47), seq:"rosemary"},
  {id:"gf", bank:"bread", q:ids("b", 48, 59), seq:"gf"},
  {id:"service", bank:"team", q:ids("l", 1, 10)},
  {id:"qb", bank:"team", q:ids("l", 11, 18)},
  {id:"sprk", bank:"team", q:ids("l", 19, 26)},
  {id:"wrapx", bank:"team", q:ids("l", 27, 32)},
  {id:"cksprk", bank:"check", q:ids("k", 1, 4)},
  {id:"ckwrap", bank:"check", q:ids("k", 5, 8)},
  {id:"ckcash", bank:"check", q:ids("k", 9, 12)},
  {id:"ckgrill", bank:"check", q:ids("k", 13, 16)},
  {id:"ckslice", bank:"check", q:ids("k", 17, 20)}
]);
BANK_LABEL.team = "Guests and the line";
BANK_LABEL.check = "Pass the check";
["team", "check"].forEach(function(b){ DECKS.push({key:b, label:BANK_LABEL[b], bank:b, hidden:true}); });
