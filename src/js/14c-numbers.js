
/* ---------- level 3, manager, part 1: ordering, inventory, food cost ----------
   Sources: the CrunchTime overview, ordering, inventory, count sheet, goal and variance videos (pasted Nov 9, 2026), with a
   photo of a printed order guide and of the count sheet slide. Practice questions that use other numbers are worked with
   the same formulas the videos teach. */
GROUPS.push({id:"order", bank:"order", level:3}, {id:"count", bank:"count", level:3}, {id:"cost", bank:"cost", level:3});

BANKS.order = [
  {id:"e1", q:"The part of CrunchTime used inside the restaurant is called:", o:["Enterprise Manager","NetChef","TalentLink","The order guide"], a:"NetChef", why:"NetChef in the restaurants. Enterprise Manager at the corporate offices."},
  {id:"e2", q:"Enterprise Manager is used mostly:", o:["At the corporate offices","At the register, by the cashier","On the grill","By the delivery driver"], a:"At the corporate offices", why:"It holds the company-wide setup: products, recipes, vendors, locations."},
  {id:"e3", q:"KPI stands for:", o:["Keep product iced and covered","Key performance indicator","Kitchen prep item","Known price index"], a:"Key performance indicator", why:"The dashboard shows how the store is doing against its key performance indicators."},
  {id:"e4", q:"The most important thing you do for CrunchTime is to enter information:", o:["Once a month, in one long sitting at the desk","As fast as possible","Accurately, consistently and on time","Only when a number looks wrong"], a:"Accurately, consistently and on time", why:"Inventories, vendor orders and receiving. Good data in, useful answers out."},
  {id:"e5", q:"The CrunchTime video says its users routinely lower food cost by:", o:["2 to 5% of sales","10 to 15% of sales","Half a percent","25% of sales"], a:"2 to 5% of sales", why:"That's $20,000 to $50,000 in a store doing $1 million a year."},
  {id:"e6", q:"NetChef collects sales, checks and time punches from:", o:["Paper tickets from the grill","The register system","The bank","The order guide"], a:"The register system", why:"It connects to the POS, the register system."},
  {id:"e7", q:"The goal of ordering is to have:", o:["As much as the shelves and the walk-in can possibly hold","Enough to never run out, without overflowing the shelves","Exactly what you sold last week","The lowest invoice possible"], a:"Enough to never run out, without overflowing the shelves", why:"Enough to make everything you serve, and not so much that it piles up."},
  {id:"e8", q:"How far should your stock carry you?", o:["Exactly to the hour the next truck is due to arrive","One full business day past the next delivery","Two weeks","Until the shelf is empty"], a:"One full business day past the next delivery", why:"That cushion covers a surprise jump in business."},
  {id:"e9", q:"Which vendors does the training name?", o:["Sysco, Pepsi, and in some areas a local produce supplier","Sysco only","Pepsi and Coke","A different one for every product"], a:"Sysco, Pepsi, and in some areas a local produce supplier", why:"Those three cover the store."},
  {id:"e10", q:"The order guide works best:", o:["On the office computer, without leaving the chair","Printed, on a clipboard, as you walk the store","From memory","Read over the phone"], a:"Printed, on a clipboard, as you walk the store", why:"Print it from CrunchTime and carry it to the shelves."},
  {id:"e11", q:"On the order guide, the \"vendor unit\" tells you:", o:["The price","How the product is packed","Who delivers it","Where it's stored"], a:"How the product is packed", why:"It's the unit everything on the guide is counted and written in."},
  {id:"e12", q:"A vendor unit of \"4/1 gal\" means:", o:["1 bottle that holds 4 gallons of vinegar","4 one-gallon bottles in a case","A quarter gallon","4 cases a week"], a:"4 one-gallon bottles in a case", why:"Four 1-gallon bottles to a case."},
  {id:"e13", q:"Besides what's on the shelf, what shapes an order?", o:["Whether sales are trending up or down","The driver's schedule","How full the dumpster was on the last pickup","Nothing else"], a:"Whether sales are trending up or down", why:"Weather, catering, holidays, seasons and events all move how much you need."},
  {id:"e14", q:"Orders are best worked out:", o:["Whenever a shelf looks low","At the same time each week","During the lunch rush","By phone with the driver"], a:"At the same time each week", why:"It builds a habit, and stock levels stay consistent."},
  {id:"e15", q:"Who should know how to place an order?", o:["Only the manager, since it's the manager's job alone","Only the owner","The team: hand it off, then review it with them","Whoever opens"], a:"The team: hand it off, then review it with them", why:"Sharing it builds people up and makes your own job easier."},
  {id:"e16", q:"What goes in the top half of a slash box?", o:["What you are ordering","What you have on hand","The price","The date"], a:"What you have on hand", why:"On hand on top, order on the bottom."},
  {id:"e17", q:"What goes in the bottom half?", o:["What you used last week","How much you are ordering","What's on the shelf","The vendor's phone number"], a:"How much you are ordering", why:"The number of vendor units you're ordering."},
  {id:"e18", q:"Both halves of the slash are written in:", o:["Dollars","Each single bottle or bag","Vendor units, as decimals","Pounds only"], a:"Vendor units, as decimals", why:"Everything goes back to the vendor unit, so the numbers stay consistent."},
  {id:"e19", q:"A case holds 4 bottles and 2 are on the shelf. You write:", o:["2","0.5","0.25","4"], a:"0.5", why:"2 of 4 is half a case."},
  {id:"e20", q:"A case holds 4 bottles and 1 is on the shelf. You write:", o:["1","0.5","0.25","0.1"], a:"0.25", why:"1 of 4 is a quarter of a case."},
  {id:"e21", q:"Last week: 0.5 on hand and you ordered 1. Today 0.25 is on hand. How much was used?", o:["0.75 of a case","1 case","1.25 cases","1.5 cases"], a:"1.25 cases", why:"You had 1.5 in the store. 1.5 minus 0.25 left is 1.25 used."},
  {id:"e22", q:"You used 1.25 cases last week and 0.25 is on hand. In the video's example you order:", o:["Nothing","1 case","2 cases","4 cases"], a:"2 cases", why:"One case would leave exactly what you used, with no cushion for a busy week or a damaged bottle."},
  {id:"e23", q:"What gets written at the top of each slash column?", o:["Your initials","The date the order is placed","The vendor","The total"], a:"The date the order is placed", why:"The date, on every page of the guide."},
  {id:"e24", q:"A case holds 6 and 3 are on the shelf. In vendor units that is:", o:["3","0.3","0.5","0.6"], a:"0.5", why:"3 of 6 is half a case."},
  {id:"e25", q:"To start any vendor order in CrunchTime, you click:", o:["Post Inventory","Create Vendor Order","Purchase Journal","Count Sheet"], a:"Create Vendor Order", why:"Create Vendor Order, in the Quick Links box."},
  {id:"e26", q:"After typing your quantities on the order guide screen, you click:", o:["Add Selected Products","Reconcile","Save and Close","Export"], a:"Add Selected Products", why:"Top right corner. Then review that everything was added."},
  {id:"e27", q:"A product is missing from the order. Which button takes you back to the order guide?", o:["Submit","Retrieve","Reconcile","Post"], a:"Retrieve", why:"Retrieve, search for the product, add its quantity, then Add Selected Products again."},
  {id:"e28", q:"The click that finally sends the order:", o:["Prepare Order","Continue","Submit","Export"], a:"Submit", why:"Prepare Order, one more check, then Submit."},
  {id:"e29", q:"Which vendor's orders reconcile on their own most of the time?", o:["Pepsi","Produce","Sysco","None of them"], a:"Sysco", why:"Sysco auto-reconciles most of the time."},
  {id:"e30", q:"Which invoices do you reconcile by hand?", o:["Pepsi and produce","Sysco","All of them, every time","None"], a:"Pepsi and produce", why:"Those two are entered and reconciled manually."},
  {id:"e31", q:"To check in a delivery in CrunchTime you open:", o:["Create Vendor Order","Vendor Order Receive","Data Entry","Post Inventory"], a:"Vendor Order Receive", why:"Then type in what's on the paper invoice."},
  {id:"e32", q:"On the reconcile screen, when quantities and prices match the paper invoice, \"over/short\" reads:", o:["0","1","100","The invoice total"], a:"0", why:"Zero means the order and the invoice agree. Then click Reconcile."},
  {id:"e33", q:"Which two things do you type in first from the paper invoice?", o:["The driver's name and the time the truck pulled in","The invoice number and the invoice total","The case count and the weight","The truck number"], a:"The invoice number and the invoice total", why:"Then the actual delivery date and the invoice date."},
  {id:"e34", q:"Printing the order guide: after you click Order Guide, you click:", o:["Submit","Retrieve","Export","Post"], a:"Export", why:"Export, then print from the PDF screen."}
];
SEQS.ordct = {title:"Placing an order in CrunchTime, in order", hint:"Tap the seven steps in order.", first:"Tap the first click.", okText:"That's an order placed.", board:false, visual:false, where:"Placing and receiving an order",
  steps:["Create Vendor Order","Pick the vendor and the delivery date","Type a quantity for each product","Add Selected Products","Review it, and Retrieve anything missed","Prepare Order","Submit"]};

BANKS.count = [
  {id:"i1", q:"Taking inventory answers which question?", o:["How many guests came in during the whole inventory week?","How much money is all the product in the store worth?","Who worked the most hours?","What sold best?"], a:"How much money is all the product in the store worth?", why:"You count everything in stock to find its cash value."},
  {id:"i2", q:"COGU stands for:", o:["Cost of goods used","Count of goods unsold","Cash on general use","Cost of getting units"], a:"Cost of goods used", why:"Cost of goods used. What it cost to make what you sold."},
  {id:"i3", q:"COGU and COGS (cost of goods sold) are:", o:["Opposites: one is food, one is paper","Two names for the same thing","Food and labor","Weekly and monthly"], a:"Two names for the same thing", why:"The training uses \"used\" because it's easier to picture."},
  {id:"i4", q:"Beginning inventory plus purchases equals:", o:["Closing inventory","Working inventory","Cost of goods used","Sales"], a:"Working inventory", why:"Everything that was in the store during the period."},
  {id:"i5", q:"Working inventory minus closing inventory equals:", o:["Purchases","Beginning inventory","Cost of goods used","Profit"], a:"Cost of goods used", why:"What you had, minus what's left, is what you used."},
  {id:"i6", q:"Beginning $5,000. Purchases $7,000. Closing $5,500. Cost of goods used?", o:["$5,500","$6,500","$7,500","$12,000"], a:"$6,500", why:"5,000 + 7,000 = 12,000. 12,000 minus 5,500 = 6,500."},
  {id:"i7", q:"Cost of goods used $6,500 on sales of $23,215 is about:", o:["18%","23%","28%","36%"], a:"28%", why:"6,500 divided by 23,215 is 0.28, or 28%."},
  {id:"i8", q:"This week's closing inventory becomes:", o:["Next week's beginning inventory","Next week's purchases","This week's sales","Nothing. Every week starts over at zero."], a:"Next week's beginning inventory", why:"What you ended with is what you start with."},
  {id:"i9", q:"A weekly inventory period runs:", o:["Sunday through Saturday","Monday through Sunday","Friday through Thursday","Any 7 days"], a:"Monday through Sunday", why:"It begins Monday and ends Sunday."},
  {id:"i10", q:"Why count weekly and not monthly?", o:["The count is shorter","A food cost problem gets caught and fixed sooner","The vendors require a weekly count from every store","It's easier to remember"], a:"A food cost problem gets caught and fixed sooner", why:"Weekly lets you correct an out-of-line food cost in time."},
  {id:"i11", q:"Beginning $4,000. Purchases $6,000. Closing $4,500. Cost of goods used?", o:["$4,500","$5,500","$6,500","$10,000"], a:"$5,500", why:"4,000 + 6,000 = 10,000. 10,000 minus 4,500 = 5,500."},
  {id:"i12", q:"Cost of goods used $5,600 on sales of $20,000 is:", o:["20%","25%","28%","36%"], a:"28%", why:"5,600 divided by 20,000 is 0.28."},
  {id:"i13", q:"When is the weekly inventory counted?", o:["Friday at lunch, when everyone is in the store","Sunday at close, or Monday before open","Wednesday afternoon","Any slow hour"], a:"Sunday at close, or Monday before open", why:"The same time every week, and when you're fresh."},
  {id:"i14", q:"How long should you allow for the counting?", o:["15 minutes","30 minutes","At least 1 hour","All day"], a:"At least 1 hour", why:"So you don't rush and make a mistake. Entry and review get their own time."},
  {id:"i15", q:"Counting on Sunday evening, what is counted after the store closes?", o:["The working areas, like the meat case","The freezer, since it takes the longest to count","The dry storage","The office"], a:"The working areas, like the meat case", why:"Storage areas are counted through the evening. Working areas wait until guests are gone."},
  {id:"i16", q:"Counting on Monday morning, which areas come first?", o:["Storage","The working areas","The freezer and dry storage","The dining room"], a:"The working areas", why:"Count them before the store opens. Storage can still be counted after."},
  {id:"i17", q:"The count is written with:", o:["A pen, so it can't be changed","A marker","A pencil with an eraser","A highlighter"], a:"A pencil with an eraser", why:"Plus extra paper, a calculator and a scale that reads right."},
  {id:"i18", q:"Why count with a partner?", o:["It's required by the vendor","One counts and weighs, one writes, and somebody else learns inventory","It's a rule: nobody is allowed to be in the walk-in alone, ever, for safety","To finish in 10 minutes"], a:"One counts and weighs, one writes, and somebody else learns inventory", why:"Then switch. The more people who know inventory, the easier it gets."},
  {id:"i19", q:"Why does an organized store matter for inventory?", o:["The count is faster and more accurate","It looks better in photos","CrunchTime checks the shelves with a camera","It doesn't"], a:"The count is faster and more accurate", why:"Put every delivery in its proper place and keep it that way."},
  {id:"i20", q:"On a Sunday count, the meat case and displays get stocked up:", o:["After the count is finished","Early in the evening","Monday morning","Not at all"], a:"Early in the evening", why:"Stock the working areas early, then count storage through the evening."},
  {id:"i21", q:"The count sheet is organized by:", o:["Price","The alphabet","Storage location","Vendor"], a:"Storage location", why:"You count everything in one place before moving to the next."},
  {id:"i22", q:"SEQ on the count sheet stands for:", o:["Sequence","Sold each quarter","Shelf equal quantity","Second"], a:"Sequence", why:"Sequence. The CrunchTime lessons cover how it's set."},
  {id:"i23", q:"\"Inventory unit\" means:", o:["The shelf where it's stored","How the item is counted","Its price per case","Who counts it"], a:"How the item is counted", why:"Pound, case, box, sleeve, each, bag or gallon, depending on the item."},
  {id:"i24", q:"Provolone is counted in three places. Which three?", o:["Freezer, grill, office","Meat case, walk-in, sandwich unit","Dining room, walk-in, delivery truck","Meat case only"], a:"Meat case, walk-in, sandwich unit", why:"One item, three places. That's why the sheet goes by location."},
  {id:"i25", q:"Why does the sheet give alternate units like case, sheet and slice?", o:["To make the sheet longer","So you count what's there and don't have to estimate","To make the sheet match the buttons on the register screen","For the vendor"], a:"So you count what's there and don't have to estimate", why:"Bacon: pounds from the open case, full cases, sheets and slices."},
  {id:"i26", q:"Which item usually has to be estimated?", o:["A full, sealed case of potato chips","An open bag-in-the-box of soda","A whole turkey","Sliced tomatoes"], a:"An open bag-in-the-box of soda", why:"Use sound reasoning, not a wild guess."},
  {id:"i27", q:"After the sheet is filled in, pay special attention to:", o:["Decimal points","Handwriting","Page numbers","The date"], a:"Decimal points", why:"0.4 of an item and 4 of an item are very different numbers."},
  {id:"i28", q:"The most common cause of inventory mistakes:", o:["Bad vendors","Old scales","Carelessness","Too many products"], a:"Carelessness", why:"Not paying attention to detail. Inventory is about accuracy."},
  {id:"i29", q:"Before the count, what do you review in CrunchTime?", o:["The schedule for the week","The purchase journal","The menu","The task list"], a:"The purchase journal", why:"To be sure every order for the period was reconciled."},
  {id:"i30", q:"In the purchase journal, an order shows no reconciled date. That means:", o:["It was free","It hasn't been reconciled yet","It was returned to the vendor for credit","Nothing"], a:"It hasn't been reconciled yet", why:"Go back and reconcile it before you count."},
  {id:"i31", q:"A missing invoice is most likely from:", o:["Sysco","Pepsi or produce","The bank","Corporate"], a:"Pepsi or produce", why:"Those two are reconciled by hand. Sysco mostly reconciles on its own."},
  {id:"i32", q:"Which count does the video use for the weekly inventory?", o:["All","Consolidated","Weekly Count","Daily"], a:"Weekly Count", why:"Weekly Count: all the food and a few paper items."},
  {id:"i33", q:"The \"Consolidated\" count covers:", o:["Everything in the store","Breads, meats and cheeses","Paper only","Drinks only"], a:"Breads, meats and cheeses", why:"All is all food and paper. Consolidated is breads, meats and cheeses."},
  {id:"i34", q:"Counts left blank can be filled with \"By Exception,\" which enters:", o:["Zero","Last week's count","An ideal amount, figured from what you started with, ordered and sold","The number the vendor says you should have, straight from the last invoice"], a:"An ideal amount, figured from what you started with, ordered and sold", why:"Use it only for products you truly left blank."},
  {id:"i35", q:"After Data Entry, which button lets you check your numbers?", o:["Save and Review","Post","Export","Retrieve"], a:"Save and Review", why:"Check the physical column. Edit if something is wrong. Then Save and Close."},
  {id:"i36", q:"The last step of the inventory itself:", o:["Print the count sheet","Post Inventory","Create Vendor Order","Group by supplier"], a:"Post Inventory", why:"Under the Administration tab. Confirm the summary looks right, then Post."},
  {id:"i37", q:"The report that shows what food cost was and what it should have been:", o:["Purchase Journal","Daily Payroll Control","Actual Theoretical Cost","Count Sheet"], a:"Actual Theoretical Cost", why:"Inventory, Reports, Actual Theoretical Cost. Open a category to see each product."}
];
SEQS.cogu = {title:"The inventory math, in order", hint:"Tap the five pieces in order.", first:"Tap what you start with.", okText:"That's cost of goods used.", board:false, visual:false, where:"Inventory: the math",
  steps:["Beginning inventory","Plus purchases","Equals working inventory","Minus closing inventory","Equals cost of goods used"]};
SEQS.invct = {title:"A weekly inventory in CrunchTime, in order", hint:"Tap the eight steps in order.", first:"Tap the first step.", okText:"That's an inventory posted.", board:false, visual:false, where:"Inventory in CrunchTime",
  steps:["Review the purchase journal","Print the count sheet","Count the store","Data Entry: type in the counts","Save and Review, fix any mistakes","Save and Close","Post Inventory","Pull the Actual Theoretical Cost report"]};

BANKS.cost = [
  {id:"f1", q:"Theoretical food cost is:", o:["What you actually paid the vendors","What food cost should have been","Last year's food cost","A guess"], a:"What food cost should have been", why:"Actual is what it was. Theoretical is what it should have been."},
  {id:"f2", q:"Your goal food cost is the theoretical number plus:", o:["Nothing","2 points","5 points","10 points"], a:"2 points", why:"Goal = theoretical + 2%."},
  {id:"f3", q:"Theoretical is 25.71%. The goal is:", o:["23.71%","25.71%","27.71%","30.71%"], a:"27.71%", why:"25.71 + 2 = 27.71."},
  {id:"f4", q:"Goal 27.71%. Actual 28.08%. The store is:", o:["0.37 under goal","Right on goal","0.37 over goal","2 over goal"], a:"0.37 over goal", why:"28.08 minus 27.71 = 0.37. Food cost is high."},
  {id:"f5", q:"Why is the goal 2 points above theoretical?", o:["To pad the budget","For necessary waste, and so guests get enough meat and cheese","Because vendors always round every invoice up to the next dollar","For taxes"], a:"For necessary waste, and so guests get enough meat and cheese", why:"Some waste is unavoidable, and nobody should be shorted to hit a number."},
  {id:"f6", q:"A food cost that comes in LOW is:", o:["Always good news for the store","Just as dangerous as high","Impossible","The goal"], a:"Just as dangerous as high", why:"Low often means subs aren't getting enough on them."},
  {id:"f7", q:"The goal from this week's report is good for:", o:["The whole year, until January","This report's period only","A month","Every store"], a:"This report's period only", why:"Next period's report gives a new theoretical, and a new goal."},
  {id:"f8", q:"Theoretical 26.4%. Actual 29.0%. How far over goal?", o:["0.6","2.0","2.6","4.6"], a:"0.6", why:"Goal is 26.4 + 2 = 28.4. 29.0 minus 28.4 = 0.6."},
  {id:"f9", q:"A red (negative) variance on a product means:", o:["More was used than should have been","Less was used than should have been","It's out of stock","It's on sale"], a:"More was used than should have been", why:"Red: too much of it is going out, on subs or in the trash."},
  {id:"f10", q:"A black (positive) variance means:", o:["Too much was used","Less was used than should have been","The count was perfect","The price dropped"], a:"Less was used than should have been", why:"Black: not enough is being used."},
  {id:"f11", q:"Provolone is 7 lb in the black. Most likely:", o:["Someone is stealing cheese at night","Subs aren't getting enough cheese","The cheese is too thick","It's great news"], a:"Subs aren't getting enough cheese", why:"A positive variance is just as dangerous. Guests are being shorted."},
  {id:"f12", q:"78 lb of turkey in the red over 7 days. A turkey weighs about 10.5 lb. That's about:", o:["One slice a sub","One whole turkey a day","One turkey a week","Nothing to worry about"], a:"One whole turkey a day", why:"78 divided by 10.5 is about 7 turkeys in 7 days, over-portioned or wasted."},
  {id:"f13", q:"Before you blame operations for a variance, first check that:", o:["The whole team has been retrained","The report itself is accurate","The slicer is sharp","The vendor is honest"], a:"The report itself is accurate", why:"Explainable? A typing mistake? A missed invoice? Rule those out first."},
  {id:"f14", q:"A roast beef was burned and thrown out this week. On the report that's:", o:["An explainable variance","Theft","A data entry mistake","A missing invoice"], a:"An explainable variance", why:"It should only affect food cost for that one period."},
  {id:"f15", q:"Someone typed 1 provolone where they counted 10. That's:", o:["An explainable variance","A data entry mistake","Over-portioning","Waste"], a:"A data entry mistake", why:"Bad data entry can wreck an inventory."},
  {id:"f16", q:"If a variance isn't explainable, a mistake or an invoice problem, what's left to look at?", o:["The weather","Operations","The vendor","Nothing"], a:"Operations", why:"Then the report is accurate, and the answer is in how the store is run."},
  {id:"f17", q:"Meat, cheese and bread together are about how much of cost of goods used?", o:["One third","Half","Two thirds","Nearly all"], a:"Two thirds", why:"67%. That's where the biggest wins are."},
  {id:"f18", q:"Chips, bottled drinks and cookies are about:", o:["1%","12%","30%","50%"], a:"12%", why:"12%, and all of them come pre-portioned."},
  {id:"f19", q:"Fountain drinks are about:", o:["1%","10%","20%","40%"], a:"1%", why:"Just 1% of cost of goods used."},
  {id:"f20", q:"How many variances do you work on each week?", o:["All of them at once, every single week of the year","3 to 5, then check them again next week","One a month","None until they're red twice"], a:"3 to 5, then check them again next week", why:"Pick 3 to 5, fix them, and follow up."},
  {id:"f21", q:"Bread AND meat both run negative, week after week. That can point to:", o:["A slow slicer","Cash handling problems or theft","Good portioning","A walk-in that is running too warm"], a:"Cash handling problems or theft", why:"The training says this pattern could mean improper cash handling or theft."},
  {id:"f22", q:"Ringing a #5 in as a #2 does what?", o:["Nothing","Throws off sales, so the report is wrong","Saves the guest money and fixes the variance","Speeds up the line"], a:"Throws off sales, so the report is wrong", why:"The report is built from what was rung in. Ring the wrong sub and its numbers are off."},
  {id:"f23", q:"You give a loyal catering customer a dozen cookies. You:", o:["Say nothing about it","Ring it up properly, as a discount","Take it out of the tip jar","Count it as waste"], a:"Ring it up properly, as a discount", why:"It's fine to do. It just has to be rung in. Pennies add up to dollars."},
  {id:"f24", q:"The ends of meats and cheeses:", o:["Get sliced down as far as possible","Go in the trash at one inch","Are saved for inventory day","Go back to the vendor"], a:"Get sliced down as far as possible", why:"Ends add up fast and get expensive."},
  {id:"f25", q:"Overcooking the roast beef or the bacon:", o:["Makes it last longer","Drives food cost up","Lowers food cost","Changes nothing"], a:"Drives food cost up", why:"Follow the recipes. Tuna made the wrong way costs you too."},
  {id:"f26", q:"The team sees the manager eat a cookie off the rack. Odds are they will:", o:["Report it","Do the same","Bake more","Not notice"], a:"Do the same", why:"A cookie, chips, a soda, a strip of bacon: it adds up. Set the example."},
  {id:"f27", q:"You have a food cost problem and no idea why. The fitness form says to assume:", o:["It's the vendor","You may have all of the causes","It will fix itself","It's a typing mistake in CrunchTime"], a:"You may have all of the causes", why:"Then start with the one you know or suspect, and turn to its solution page."},
  {id:"f28", q:"Which of these is on the food cost fitness form's list of causes?", o:["Slow internet","Improper cash handling","A long lunch rush","Too many napkins"], a:"Improper cash handling", why:"Over-portioning, waste, purchasing and receiving, theft, cash handling, pricing, and product mix."},
  {id:"f29", q:"When the form doesn't answer your question, you ask:", o:["Nobody","A guest","Another store manager, the franchisee, or the area director","The vendor"], a:"Another store manager, the franchisee, or the area director", why:"All of them are glad to help."},
  {id:"f30", q:"The biggest expense of running the store:", o:["Rent","Labor","Food cost","Advertising"], a:"Food cost", why:"Food is first. Labor is second."}
];

MODS = MODS.concat([
  {id:"ct", bank:"order", q:ids("e", 1, 6)},
  {id:"ordgoal", bank:"order", q:ids("e", 7, 15)},
  {id:"slash", bank:"order", q:ids("e", 16, 24)},
  {id:"ordct", bank:"order", q:ids("e", 25, 34), seq:"ordct"},
  {id:"invmath", bank:"count", q:ids("i", 1, 12), seq:"cogu"},
  {id:"invprep", bank:"count", q:ids("i", 13, 20)},
  {id:"sheet", bank:"count", q:ids("i", 21, 28)},
  {id:"invct", bank:"count", q:ids("i", 29, 37), seq:"invct"},
  {id:"goal", bank:"cost", q:ids("f", 1, 8)},
  {id:"variance", bank:"cost", q:ids("f", 9, 16)},
  {id:"where", bank:"cost", q:ids("f", 17, 26)},
  {id:"fitness", bank:"cost", q:ids("f", 27, 30)}
]);
BANK_LABEL.order = "Ordering";
BANK_LABEL.count = "Inventory";
BANK_LABEL.cost = "Food cost";
["order", "count", "cost"].forEach(function(b){ DECKS.push({key:b, label:BANK_LABEL[b], bank:b, hidden:true}); });
