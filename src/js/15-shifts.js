
/* ---------- Run the shift ----------
   Short situations with a decision to make, then the situation changes and you decide again. Every right answer is something
   the training says outright; "card" names the Training card it comes from. Choices are kept in a fixed order so the recorded
   voice can read them. */
var SHIFTS = [
  {id:"short", lv:2, title:"One person short at lunch", card:"o-qb", steps:[
    {say:"It's 11:45 and the lunch rush is starting. One person called out. You are on the slicer, and you are the lead.", q:"What do you do first?", opts:[
      {t:"Start extra prep now, so nothing runs out later", why:"The lunch rush is not the time for prep. The training's rule for a rush is no prep, best people in their best spots."},
      {t:"Best people in their best spots, and run the line", ok:1, why:"Aces in their places: at the start of a rush your best people go in their best spots. The slicer sets the pace and watches the whole line."},
      {t:"Slice as fast as you can to get ahead of the line before it grows any longer", why:"Experience first, speed second. The slicer goes full speed only when the line can take it, and never more than 3 subs at a time."}]},
    {say:"Ten minutes in, the sprinkler is falling behind. Four subs are waiting at the sprinkling board.", q:"What now?", opts:[
      {t:"Slow down, stop slicing, and help sprinkle", ok:1, why:"That is calling an audible: changing the play. The slicer slows when the sprinkler or wrapper backs up, and can stop slicing to help."},
      {t:"Keep slicing, so the next subs are ready when the sprinkler catches up", why:"More subs at a station that is already behind makes the pile bigger. The slicer controls the pace for the whole line."},
      {t:"Tell the sprinkler to speed up, and keep the subs coming at the same pace", why:"The slicer owns what goes wrong on the line. The training's answer is to move help to the spot that's behind."}]}]},
  {id:"grill", lv:2, title:"The grill is backing up", card:"o-qb", steps:[
    {say:"It's the dinner rush. Hot sub tickets are stacking up at the grill, and the cold line is moving fine.", q:"Who do you move?", opts:[
      {t:"Nobody. Hot subs take longer, and guests know that", why:"The training says it plainly: don't let the grill back up."},
      {t:"Send the wrapper to help the grill", ok:1, why:"Don't let the grill back up. Send the wrapper to help."},
      {t:"Leave the slicer and take over the grill yourself until the tickets are gone", why:"The slicer runs the line and keeps their head up. The training sends the wrapper to the grill."}]},
    {say:"A sub reaches the wrapper, who isn't sure what it is and turns to ask the guest what they ordered.", q:"What should have happened?", opts:[
      {t:"The wrapper should check the receipt", why:"The order travels by voice. Each station tells the next one."},
      {t:"That's fine. Asking the guest again is how you make sure the sub is right", why:"Never ask a guest what they had. If the line calls every sub, nobody needs to."},
      {t:"Each station says the order to the next one", ok:1, why:"Say it down the line: what the sub is and who it's for. The sprinkler tells the wrapper, the wrapper tells the cashier."}]}]},
  {id:"lastguest", lv:2, title:"A guest at closing time", card:"o-closefast", steps:[
    {say:"It's five minutes to close. The grill has been pre-cleaned with oil and a screen. A guest walks in and orders a hot sub.", q:"What do you do?", opts:[
      {t:"Make it, and clean the grill again after", ok:1, why:"You serve guests right up to closing time. A hot sub on a pre-cleaned grill cooks fast, and a grill is easy to clean again after one or two subs."},
      {t:"Offer them a cold sub instead, because the grill is already clean for the night", why:"Never turn a guest away because something has been cleaned."},
      {t:"Tell them the grill is closed for the night", why:"Never turn a guest away because something has been cleaned. That is the rule over the whole close."}]},
    {say:"Right behind them, another guest wants a cold sub. The slicer is apart for cleaning.", q:"What now?", opts:[
      {t:"Apologize and say the slicer is down", why:"The slicer is cleaned one piece at a time so it is never more than one piece from ready."},
      {t:"Put it back together quickly and serve them", ok:1, why:"If the slicer is apart, put it back together quickly and serve them with a smile. Cleaning it one piece at a time keeps it one piece from ready."},
      {t:"Make the sub from whatever is already sliced and sitting in the case", why:"Subs are sliced fresh in front of the guest. The training's answer is to put the slicer back together and serve them."}]}]},
  {id:"handoff", lv:2, title:"Taking over for the evening", card:"o-leadclose", steps:[
    {say:"You walk in to lead the close. The daytime shift leader is about to leave.", q:"What is your first move?", opts:[
      {t:"Start the closing checklist right away, so the night gets ahead of itself", why:"The list starts early, but first you need to know what the day left you."},
      {t:"Count the drawer", why:"The training's first step for the closing lead is a question, not a count."},
      {t:"Ask the day lead how the day went", ok:1, why:"Ask the daytime shift leader how the day went. You learn if the after-lunch checklist is done, and if you need extra prep."}]},
    {say:"You learn bread and bacon are low, and there is a catering order for tomorrow.", q:"When does the extra prep happen?", opts:[
      {t:"Before the dinner rush is in full swing", ok:1, why:"Do extra prep before the dinner rush is in full swing: bread, bacon, produce. Set up the catering boxes, and write that prep on the Production Pro chart."},
      {t:"During the dinner rush, a little at a time, whenever there is a gap in the line", why:"A rush is for guests. Extra prep is done before it, so you don't run out."},
      {t:"After close, once the doors are locked", why:"Too late for tonight's dinner. The training puts extra prep before the dinner rush."}]}]},
  {id:"two", lv:2, title:"Someone wants to leave early", card:"o-coverage", steps:[
    {say:"It's 8:30 at night and slow. There are two of you left. Your closer asks to go home early.", q:"What do you say?", opts:[
      {t:"Yes. It's slow, and it saves labor", why:"Labor never beats this rule: at least 2 people in the store during business hours and through closing."},
      {t:"No. Never fewer than 2 people, through closing", ok:1, why:"At least 2 people in the store during business hours and through closing. The store never closes with fewer than 2."},
      {t:"Yes, once the dining room and the bathrooms are mopped and the trash is out", why:"The dining room isn't mopped until the store is closed, and the store never closes with fewer than 2 people."}]},
    {say:"Next week's schedule has only two team members on from 2 to 4. No manager, assistant manager or shift leader.", q:"Is that schedule ready to post?", opts:[
      {t:"Yes. Two people are on, and that is the rule", why:"Two people is one rule. There is a second one about who they are."},
      {t:"Yes, as long as a manager can be reached by phone the whole time and lives close by", why:"The rule says in the store, not on the phone."},
      {t:"No. A manager or shift leader is always in the store", ok:1, why:"Two rules never bend: at least 2 people, and a manager, assistant manager or shift leader in the store at all times."}]}]},
  {id:"steam", lv:2, title:"Meatballs under temperature", card:"o-timetemp", steps:[
    {say:"It's 2:30. The meatballs in the steam table read 120 degrees. The log shows they have been under 135 since 10 this morning.", q:"What do you do?", opts:[
      {t:"Turn the steam table up and keep serving", why:"They have been in the danger zone for four and a half hours. Past 4 hours, heating them again does not make them safe to keep."},
      {t:"Throw them out", ok:1, why:"Bacteria grow fast between 41 and 135 degrees. Food that has spent 4 hours or more, in total, in that zone gets thrown out."},
      {t:"Reheat them to 165 degrees for 15 seconds and put them back in the steam table", why:"Reheating is for food still inside its time. This pan passed the 4 hour limit."}]},
    {say:"You heat a new batch.", q:"What temperatures does it need?", opts:[
      {t:"135 degrees inside, then hold at 120", why:"Those are too low. Heating is to 165, and holding is at 135 or higher."},
      {t:"Steaming and hot to the touch all the way through, then into the steam table", why:"Touch is not a temperature. Only temp the actual food, with a probe."},
      {t:"165 degrees inside for 15 seconds, then hold at 135", ok:1, why:"Meatballs, tomato sauce and soups are heated, and reheated, to 165 degrees inside for 15 seconds. Once heated they hold at 135 or higher."}]}]},
  {id:"temps", lv:2, title:"Logging temperatures", card:"o-temps", steps:[
    {say:"You are logging the mid-day temperatures. The walk-in's thermostat reads 38 degrees.", q:"Is that what goes on the log?", opts:[
      {t:"No. Temp the actual food with a probe", ok:1, why:"Air temp and the equipment thermostat are not product temp. Only temp the actual food."},
      {t:"Yes. 38 is inside the 36 to 41 range", why:"The number is fine for air. The log wants the food's temperature."},
      {t:"Yes, as long as the door has stayed shut", why:"The thermostat reads air. Only temp the actual food."}]},
    {say:"Next is the meatballs. The only thermometer within reach is the infrared gun.", q:"Can you use it for the inside temperature?", opts:[
      {t:"Yes, if you hold it close and aim at the center of the pan", why:"An infrared gun reads the surface only, wherever you aim it."},
      {t:"No. It reads surfaces only. Get a clean probe", ok:1, why:"Infrared gun: surface temps only, like the grill top. Never for an internal temperature. Wash, rinse and sanitize the thermometer before use and between uses."},
      {t:"Yes, if you stir the meatballs first", why:"Stirring doesn't change what the gun can read. It is never used for an internal temperature."}]}]},
  {id:"cash", lv:2, title:"Cash in the rush", card:"o-regsafe", steps:[
    {say:"It's the lunch rush. A guest pays with a hundred dollar bill.", q:"How do you handle it?", opts:[
      {t:"Put it in the drawer and count out the change", why:"The bill stays out until the change is made, so any question about the change can be settled."},
      {t:"Ask if they have something smaller, because large bills slow the line down at lunch", why:"The training takes the bill. It gets checked, then put away out of sight."},
      {t:"Check it, lay it on the drawer, make change, then put it away", ok:1, why:"Lay the guest's bills on the drawer, not in the slots. Make the change, then put the bills away. 50s and 100s get checked, then put away out of sight."}]},
    {say:"By one o'clock the drawer is thick with bills.", q:"What should the cashier do?", opts:[
      {t:"Tell the manager, so they can make a drop", ok:1, why:"Keep the drawer low. When bills build up, tell the manager so they can make a drop."},
      {t:"Move the extra bills under the tray", why:"Hiding bills in the drawer still leaves them in the drawer."},
      {t:"Leave it until the rush is over", why:"Keep the drawer low. The cashier tells the manager when bills build up."}]}]},
  {id:"walkin", lv:2, title:"A guest walks in while you clean", card:"o-leadclose", steps:[
    {say:"It's mid-afternoon. The team is spread out on the mid-day checklist. A guest walks in.", q:"What happens?", opts:[
      {t:"Whoever is closest serves them, and the rest keep working", why:"The training's rule is everyone, not whoever is closest."},
      {t:"Everyone stops and comes to the front line", ok:1, why:"Customers first. When a guest walks in, everyone stops what they're doing and comes to the front line. The training calls that a must."},
      {t:"They wait a moment while tasks get finished", why:"The checklist waits. The guest doesn't."}]},
    {say:"The guest leaves happy. The store is quiet again, and two people are standing around.", q:"What does a good lead do?", opts:[
      {t:"Let them rest until the next guest, since they have earned it", why:"Stay active when it's slow. Quiet time is checklist time."},
      {t:"Send one of them home", why:"The training's answer for a slow stretch is the checklist, and the store still needs its people for dinner."},
      {t:"Rally the team around the checklist", ok:1, why:"Stay active when it's slow. When the rush dies down, rally the team around the checklist. If you start a task, finish the task."}]}]},
  {id:"newhire", lv:2, title:"Training someone new", card:"o-trainer", steps:[
    {say:"A new team member is learning to sprinkle today. It is their first practice shift.", q:"Where do they start?", opts:[
      {t:"On the front line, during lunch", why:"Practice starts away from guests. The line comes after."},
      {t:"In the back, watching the sprinkling video until they can describe every step", why:"The method is show it, do it beside them, then watch them do it."},
      {t:"Away from guests first, then beside you on the line", ok:1, why:"Practice shifts: they do it, first away from guests, then side by side with you on the line for 1 to 2 hours. Coach politely, and step in when needed."}]},
    {say:"On their confidence shift you watch them work and tick the list. They miss a step.", q:"What do you do about it?", opts:[
      {t:"Talk it through, show it, let them practice, tell the manager", ok:1, why:"Anything missed: talk it through, show it, let them practice, and tell the manager."},
      {t:"Tick it anyway. They mostly had it", why:"The list is only worth something if a tick means the step was done."},
      {t:"Take them off the station and start the training over from the introduction shift", why:"A miss is coached. The training's steps are talk, show, practice, and tell the manager."}]}]},
  {id:"red", lv:3, title:"Turkey deep in the red", card:"o-variance", steps:[
    {say:"The weekly report shows turkey 78 pounds in the red.", q:"What do you check first?", opts:[
      {t:"Who was on the slicer for each shift that week, and how heavy their portions run", why:"Not yet. First find out whether the number is real."},
      {t:"Whether the report itself is right", ok:1, why:"First, is the report right? Is it explainable, did someone type a number wrong, are all the invoices in and reconciled?"},
      {t:"Order less turkey next week", why:"A variance is about how much was used against how much should have been. Ordering less doesn't answer it."}]},
    {say:"Nothing was burned or loaned, the counts were typed right, and every invoice is in. The report is accurate.", q:"Where is the answer now?", opts:[
      {t:"In operations: how the store is being run", ok:1, why:"If it's none of those, the report is accurate, and the answer is in operations. 78 pounds is about a whole turkey a day over-portioned or wasted."},
      {t:"With the supplier", why:"The invoices checked out. The turkey came in and went out of your store."},
      {t:"Nowhere. Some loss is normal", why:"Some loss is normal, and 78 pounds is far past normal."}]}]},
  {id:"forecast", lv:3, title:"Next week's sales number", card:"o-forecast", steps:[
    {say:"You are writing next week's schedule. The 4-week average says 17,535 dollars. Last year plus growth says 17,492 dollars.", q:"What do the two numbers tell you?", opts:[
      {t:"One of them is wrong", why:"They are 43 dollars apart. That is agreement."},
      {t:"Use the higher one, to be safe, and schedule an extra person on every shift", why:"The point of two methods is to check one against the other."},
      {t:"They agree, so the forecast is reasonable", ok:1, why:"Both land close together. That's a good sign the forecast is reasonable."}]},
    {say:"Then you remember there is a high school football game Friday night, and rain is forecast for Saturday.", q:"What do you do with that?", opts:[
      {t:"Nothing. Four weeks of sales already average out games and weather", why:"An average of past weeks can't know about this Friday."},
      {t:"Adjust the forecast for what you know", ok:1, why:"Then adjust for what you know: time of year, weather, community events, large catering orders. Labor should never be a surprise."},
      {t:"Let CrunchTime decide", why:"CrunchTime can forecast for you, and the training still wants you to know the math behind it."}]}]}
];
function shiftSay(st){ return sayable(st.say + " " + st.q + " One. " + fullStop(st.opts[0].t) + " Two. " + fullStop(st.opts[1].t) + " Three. " + fullStop(st.opts[2].t)); }
function shiftWhy(st){ var o = st.opts.filter(function(x){ return x.ok; })[0]; return sayable("The training's answer: " + fullStop(o.t) + " " + o.why); }
