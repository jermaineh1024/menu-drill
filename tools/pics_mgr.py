"""The diagrams for the shift lead and manager cards, and the bread, line and check cards added with them.

    python3 tools/pics_mgr.py        (run after tools/pics.py, which clears the folder first)

Writes one src/include/pic-NAME.html per drawing. It uses the same helpers, colours and width check as tools/pics.py:
every number and label comes from the training videos or the store's training sheets, and a label that would run past its
box stops the build. Dollar figures are the videos' own worked examples.
"""
import pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
for cand in (HERE, HERE.parent / "tools"):
    if (cand / "pics.py").exists():
        sys.path.insert(0, str(cand)); break
import pics as P

ROOT = pathlib.Path(P.__file__).resolve().parent.parent
W = P.W
f, text, lines, box, fx, circ, path, arr, disc, svg, tiles, flow = P.f, P.text, P.lines, P.box, P.fx, P.circ, P.path, P.arr, P.disc, P.svg, P.tiles, P.flow
MINE = []


def pic(fn):
    MINE.append(fn)
    return fn


def note(y, rows, n, cls="ts"):
    """Centred lines of small text under a drawing."""
    return lines(W / 2, y, rows, cls, room=W, name=n, lh=14)


def eq_row(n, y, cells, ops, res="okb", cw=96):
    """Three boxes joined by two signs: A (op) B (=) C."""
    xs = [0, 122, 244]
    s = ""
    for k, (head, val) in enumerate(cells):
        x = xs[k]
        s += box(x, y, cw, 50, res if k == 2 else "")
        s += text(x + cw / 2, y + 17, head, "ts", room=cw - 4, name=n)
        s += text(x + cw / 2, y + 40, val, "mid", room=cw - 6, name=n)
        if k < 2:
            s += text((x + cw + xs[k + 1]) / 2, y + 32, ops[k], "mid", room=24, name=n)
    return s


def grid(n, items, y0=6, cols=2, h=40, gap=8, cls=""):
    """Plain boxes in a grid: (title, caption)."""
    w = (W - gap * (cols - 1)) / cols
    s = ""
    for i, it in enumerate(items):
        title, cap = it[0], it[1]
        c = it[2] if len(it) > 2 else cls
        r, k = divmod(i, cols)
        x, y = k * (w + gap), y0 + r * (h + gap)
        s += box(x, y, w, h, c)
        s += text(x + w / 2, y + (17 if cap else h / 2 + 5), title, "t1", room=w - 8, name=n)
        if cap:
            s += text(x + w / 2, y + 32, cap, "ts", room=w - 6, name=n)
    rows = (len(items) + cols - 1) // cols
    return s, y0 + rows * h + (rows - 1) * gap


def vflow(chips, name, label, ch=42, gap=22):
    """Numbered chips in one column, an arrow in each gap: (title, caption)."""
    b = ""
    for i, (title, cap) in enumerate(chips):
        y = 6 + i * (ch + gap)
        b += box(0, y, W, ch)
        b += disc(15, y + 15, i + 1, 8.5)
        b += text(30, y + 20, title, "t1", "start", room=W - 36, name=name)
        b += text(10, y + 36, cap, "ts", "start", room=W - 16, name=name)
        if i < len(chips) - 1:
            b += arr(f"M{f(W / 2)} {f(y + ch + 4)} V{f(y + ch + gap - 9)}")
    svg(6 + len(chips) * ch + (len(chips) - 1) * gap + 6, b, label, name)


# ================================================================ BREAD EXTRAS
@pic
def pic_thaw():
    tiles([("ROOM TEMP", "1½ hr", ["in the bread", "rack"], "warnb"), ("CHECK", "", ["often. Mist it", "if it looks dry."], ""), ("THEN", "", ["proof and bake", "as usual"], "okb")],
          "thaw", "A floor thaw: frozen dough sits in the bread rack at room temperature for about an hour and a half. Check it often and mist it if it looks dry. Then proof and bake as usual.")


@pic
def pic_rosemary():
    n = "rosemary"
    flow([("SCORE", "the way you always do"), ("MIST", "water makes it stick"), ("PARMESAN", "½ oz, ends covered"), ("ROSEMARY", "2 small pinches, on top"), ("BAKE", "as normal")],
         n, "Rosemary parm bread, in order: score the proofed loaf, mist it with water, half an ounce of Parmesan across the loaf with the ends covered, about two small pinches of rosemary on top, then bake as normal. Half an ounce of Parmesan is about a third of a 4 ounce souffle cup.",
         cols=2, ch=46, gapx=18, gapy=16, extra=note(196, ["½ oz of Parmesan is about a third of a 4 oz soufflé cup."], n), total_h=206)


@pic
def pic_gf():
    flow([("CLEAN", "slicer and counters"), ("WASH", "hands, fresh gloves"), ("PAPER", "parchment under the sub"), ("GF KNIFE", "only for gluten-free"), ("PASS IT ON", "paper, sub and knife"), ("LABEL", "fresh sheet, marked GF")],
         "gf", "A gluten-free sub, in order: clean the slicer and counters, wash hands and put on fresh gloves, put parchment paper under the sub, cut with the knife that is only for gluten-free, pass the paper, the sub and the knife down the line together, then wrap on a fresh sheet and label it GF.",
         cols=2, ch=46, gapx=18, gapy=16)


# ================================================================ GUESTS AND THE LINE
@pic
def pic_greet():
    tiles([("OUTSIDE", "", ["eye contact, a", "smile, a hello,", "offer a hand"], ""), ("INSIDE", "", ["the same, plus", "a door held or", "a table cleared"], ""), ("SLICER", "", ["know regulars,", "guide new", "guests"], "okb")],
          "greet", "Three places to greet a guest. Outside: eye contact, a smile, a hello, and an offer of help. Inside: the same, plus holding a door or clearing a table. At the slicer: recognize regulars and guide new guests.", h=90)


@pic
def pic_qb():
    n = "qb"
    flow([("SLICER", "sets the pace, 3 subs max"), ("SPRINKLER", "speed first, 3 at a time"), ("WRAPPER", "helps, checks, delivers"), ("CASHIER", "rings, smiles, thanks")],
         n, "The line, in order: the slicer sets the pace and works at most three subs at a time, the sprinkler is speed first and sprinkles three at a time, the wrapper helps, checks and delivers, and the cashier rings, smiles and thanks. Each one tells the next what the sub is and who it is for.",
         cols=2, ch=46, gapx=18, gapy=16, extra=note(134, ["Each one tells the next: what it is, and who it's for."], n), total_h=144)


@pic
def pic_hints():
    n = "hints"
    b = box(0, 6, W, 132)
    b += text(W / 2, 24, "THE SPRINKLING BOARD", "t1", room=W - 10, name=n)
    xs = (22, 132, 242)
    for i, x in enumerate(xs):
        y = 38 + (16 if i == 2 else 0)
        b += fx(x, y, 76, 46, P.BREAD, 20, P.BREAD_LN)
        b += fx(x + 8, y + 10, 60, 26, P.CHEESE, 12)
    # sub 1: a few shreds of lettuce on it
    for k, (dx, dy) in enumerate(((16, 16), (30, 24), (44, 15), (52, 26), (24, 30))):
        b += fx(xs[0] + dx, 38 + dy, 12, 4, P.LETTUCE, 2, P.LETTUCE_LN, 0.8)
    # sub 2: a pickle slice in front of it
    b += circ(xs[1] + 38, 100, 7, "#8FB25A", "#55773A")
    # sub 3 sits forward of the others
    b += P.red(f"M{xs[2] + 38} 34 V50")
    caps = (("NO ONIONS", "lettuce on top"), ("PLUS PICKLES", "a pickle in front"), ("DRY", "moved forward"))
    for i, x in enumerate(xs):
        b += text(x + 38, 122, caps[i][0], "dk" if False else "tk", room=104, name=n)
        b += text(x + 38, 134, caps[i][1], "ts", room=106, name=n)
    b += note(154, ["Mayo, relish or bacon: that sub's lid moves", "to the other side of the board."], n)
    svg(176, b, "Memory hints when sprinkling three subs at once. A few shreds of lettuce on a sub means no onions. A pickle slice in front of a sub means plus pickles. A sub moved forward on the board is dry, with no vinegar and oil. For mayo, cherry pepper relish or bacon, that sub's lid moves to the other side of the board.", n)


@pic
def pic_wrapx():
    tiles([("ORGANIZE", "", ["what it is,", "where it is,", "who it's for"], ""), ("HELP", "", ["2nd sprinkler,", "asks about", "add-ons"], ""), ("EXPEDITE", "", ["hot subs out,", "last check"], "okb")],
          "wrapx", "The wrapper's three jobs. Organize: know what every sub is, where it is and who it is for. Help: be the second sprinkler and ask about add-ons. Expedite: get hot subs to their guests and give every sub a last check.", h=90)


# ================================================================ PASS THE CHECK
@pic
def pic_threeshifts():
    vflow([("INTRODUCTION", "the trainer shows you"), ("PRACTICE", "you do it, with them beside you"), ("CONFIDENCE", "they watch a real shift and tick the list")],
          "threeshifts", "The three kinds of training shift. Introduction: the trainer shows you. Practice: you do it with them beside you. Confidence: they watch you work a real shift and tick the list.")


@pic
def pic_cksprk():
    tiles([("JUICE", "2 oz", ["2 rows, a giant,", "8 of 10 times"], "okb"), ("BOARD", "", ["swept before", "the juice"], ""), ("THE SUB", "", ["all the way", "down, then", "it stays put"], "")],
          "cksprk", "Sprinkler check, three lines from the list. Two rows of juice come out to 2 ounces on a giant, at least 8 times out of 10. The board is swept before the juice. The sub goes all the way down the board and then stays put.", h=90)


@pic
def pic_ckwrap():
    tiles([("PAPER", "1", ["sheet at a time,", "logo down"], ""), ("ENDS", "", ["tucked tight,", "no wings"], "okb"), ("BAG", "", ["popped,", "creased,", "numbered"], "")],
          "ckwrap", "Wrapper check. One sheet of paper at a time, logo down. Ends tucked tight with no wings. The bag popped, creased and marked with the sub's number.", h=90)


@pic
def pic_ckcash():
    tiles([("MONEY", "", ["no gloves on it,", "wash after"], "warnb"), ("CHANGE", "", ["coins first,", "counted back"], ""), ("GUESTS", "", ["a real thank", "you, every time"], "okb")],
          "ckcash", "Cashier check. No gloves on money, and wash your hands after. Change goes back coins first and is counted out loud. Every guest gets a real thank you.", h=78)


@pic
def pic_ckgrill():
    tiles([("ORDER", "", ["onions, peppers,", "then the steak"], ""), ("BREAKS", "16", ["4 x 4 x 4 x 4"], "warnb"), ("AT ONCE", "3", ["subs, at most"], "")],
          "ckgrill", "Grill check. Onions go down first, then peppers, then the steak. The steak is broken 16 times, in a four by four by four by four pattern. No more than 3 subs are cooked at once.", h=84)


@pic
def pic_ckslice():
    tiles([("CHEESE", "2 oz", ["5 slices of", "provolone"], "okb"), ("MEAT", "1.8 oz", ["3 slices of ham"], "okb"), ("AT ONCE", "3", ["subs, at most"], "")],
          "ckslice", "Slicer check. Five slices of provolone weigh 2 ounces. Three slices of ham weigh 1.8 ounces. No more than 3 subs are sliced at once.", h=90)


# ================================================================ THE DAY
def _hx(h):
    return (h - 8) * 25.66   # 8 a.m. to 9:15 p.m., the hours of the scheduling video's example Monday, across the picture's 340


@pic
def pic_day():
    n = "day"
    segs = ((8, 11, "OPEN", "#BFD7EE", "dk"), (11, 14, "LUNCH RUSH", "#F2B24A", "dk"), (14, 17, "MID-DAY", "#CFE3C4", "dk"), (17, 19, "DINNER", "#F2B24A", "dk"), (19, 21.25, "CLOSE", "#C9D2DB", "dk"))
    b = ""
    for a, z, name, fill, cls in segs:
        x, w = _hx(a), _hx(z) - _hx(a)
        b += fx(x, 30, w - 1.5, 34, fill, 5)
        if name:
            b += text(x + w / 2 - 0.75, 51.5, name, cls, room=w - 5, name=n)
    for h, lab, anchor in ((8, "8 a.m.", "start"), (11, "11", "middle"), (14, "2", "middle"), (17, "5", "middle"), (19, "7", "middle"), (21.25, "9:15", "end")):
        b += text(min(max(_hx(h), 4), W - 4), 20, lab, "ts", anchor, room=44, name=n)
    b += path(f"M{f(_hx(21.05))} 66 V78", "lnm") + text(W - 4, 90, "reset for tomorrow", "ts", "end", room=110, name=n)
    b += text(4, 90, "opening work, then the first guests", "ts", "start", room=200, name=n) + path(f"M{f(_hx(9.5))} 66 V78", "lnm")
    b += note(110, ["No prep in the two rushes.", "The rest of the day gets ready for them."], n, "t2")
    svg(134, b, "A store day on the training's example clock. Opening work from about 8 in the morning, then the first guests. The lunch rush, usually 11 to 2. Mid-day from 2 to 5. The dinner rush, usually 5 to 7. Closing down from 7, with the reset for tomorrow last, once the doors lock. In the example a well-trained team is finished by 9:15. No prep happens during the two rushes.", n)


@pic
def pic_temps2():
    n = "temps2"
    tiles([("COLD", "36 to 41", ["°F: walk-in,", "meat cases,", "drop-ins"], "okb"), ("FREEZER", "0°F", ["give or take 10"], ""), ("GRILL TOP", "350°F", ["give or take 10"], "warnb")],
          n, "Mid-day temperatures. Cold holding, 36 to 41 degrees Fahrenheit: the walk-in, the meat cases, the hot subs unit and the drop-ins. Freezer, 0 degrees, give or take 10. Grill top surface, 350 degrees, give or take 10. Sanitizer test strips read 200 to 500 parts per million, and the buckets get fresh sanitizer every 4 hours.",
          h=96, extra=note(122, ["Sanitizer strips: 200 to 500 ppm.", "Fresh sanitizer in the red buckets every 4 hours."], n), total_h=146)


@pic
def pic_layers():
    n = "layers"
    b = text(4, 18, "RUNS BY ITSELF", "t1", "start", room=160, name=n)
    b += fx(0, 26, 250, 20, P.BREAD, 5, P.BREAD_LN) + text(125, 40.5, "bread proofs, then bakes", "dk", room=240, name=n)
    b += fx(34, 50, 70, 20, "#D8B98A", 5, P.BREAD_LN) + text(69, 64.5, "cookies", "dk", room=64, name=n)
    b += fx(60, 74, 80, 20, "#F3C9A8", 5, "#B97B4A") + text(100, 88.5, "sauce heats", "dk", room=74, name=n)
    b += fx(170, 74, 130, 20, "#E7A089", 5, P.BACON) + text(235, 88.5, "bacon cooks", "dk", room=120, name=n)
    b += text(4, 118, "YOUR HANDS", "t1", "start", room=160, name=n)
    hands = ((0, 56, "stretch"), (60, 104, "onions, lettuce"), (168, 66, "tomatoes"), (238, 102, "case, tea, grill"))
    for x, w, lab in hands:
        b += box(x, 126, w, 24) + text(x + w / 2, 142.5, lab, "ts", room=w - 4, name=n)
    b += note(170, ["Start the job that runs by itself.", "Then do the hands-on one."], n, "t2")
    svg(194, b, "Layering tasks in an opening. Some jobs run by themselves once started: the bread proofing and baking, the cookies, the sauce heating, the bacon cooking. While they run, your hands do the other jobs in order: stretching the bread, slicing onions and lettuce, slicing tomatoes, then the meat case, tea and grill top.", n)


@pic
def pic_prepclock():
    n = "prepclock"
    CW = 286   # the two hours take this much of the width; the rest is room for labels
    def mx(h, m):
        return ((h - 8) * 60 + m) * CW / 120
    b = ""
    for h, m, lab, anchor in ((8, 0, "8:00", "start"), (8, 30, "8:30", "middle"), (9, 0, "9:00", "middle"), (9, 30, "9:30", "middle"), (10, 0, "10:00", "middle")):
        b += text(max(mx(h, m), 4), 14, lab, "ts", anchor, room=40, name=n)
        b += path(f"M{f(mx(h, m))} 20 V86", "ghost")
    def bar(y, a, z, fill, ln, lab=None, cls="dk"):
        x, w = mx(*a), mx(*z) - mx(*a)
        s = fx(x, y, w, 16, fill, 4, ln)
        if lab:
            s += text(x + w / 2, y + 12, lab, cls, room=w - 4, name=n)
        return s
    PROOF, BAKE = "#E9D3A4", "#D98A2B"
    b += bar(26, (8, 5), (8, 15), "#C9D2DB", P.STEEL_LN)
    b += bar(26, (8, 15), (9, 5), PROOF, P.BREAD_LN, "proof 50") + bar(26, (9, 5), (9, 19), BAKE, P.BREAD_LN, "14")
    b += bar(46, (8, 40), (9, 30), PROOF, P.BREAD_LN, "proof 50") + bar(46, (9, 30), (9, 44), BAKE, P.BREAD_LN, "14")
    b += bar(66, (9, 5), (9, 55), PROOF, P.BREAD_LN, "proof 50")
    b += text(W - 4, 38, "bake", "ts", "end", room=44, name=n)
    b += text(4, 102, "BREAD: 3 waves of 5 pans. 60 loaves by 10.", "tk", "start", room=W, name=n)
    rows = (((8, 15), (8, 28), "#D8B98A", P.BREAD_LN, "8:15", "24 cookies, 13 min"), ((8, 30), (9, 2), "#E7A089", P.BACON, "8:30", "14 sheets of bacon, 32 min"),
            ((8, 35), (8, 42), P.ONION, P.ONION_LN, "8:35", "12 onions, 7 min"), ((8, 47), (9, 1), P.LETTUCE, P.LETTUCE_LN, "8:47", "26 heads of lettuce, 14 min"),
            ((9, 6), (9, 21), P.TOMATO, "#9E2E26", "9:06", "120 tomatoes, 15 min"))
    for i, (a, z, fill, ln, start, lab) in enumerate(rows):
        y = 114 + i * 21
        b += bar(y, a, z, fill, ln)
        b += text(mx(*a) - 4, y + 12, start, "ts", "end", room=mx(*a) - 4, name=n)
        b += text(mx(*z) + 5, y + 12, lab, "ts", "start", room=W - mx(*z) - 5, name=n)
    svg(224, b, "The prep clock from 8 to 10 in the morning. Bread goes in three waves of five pans, each proofing 50 minutes and baking 14, starting at 8:15, 8:40 and 9:05, for 60 loaves by 10. 24 cookies take 13 minutes from 8:15. 14 sheets of bacon take 32 minutes from 8:30. 12 onions take 7 minutes from 8:35. 26 heads of lettuce take 14 minutes from 8:47. 120 tomatoes take 15 minutes from 9:06.", n)


@pic
def pic_sharpen():
    n = "sharpen"
    tiles([("SHARPEN", "10 s", ["first setting"], "warnb"), ("HONE", "1.5 s", ["second setting"], "warnb"), ("OIL", "", ["a few drops on", "each shaft"], "okb")],
          n, "Sharpening the slicer. First setting for 10 seconds to sharpen. Second setting for one and a half seconds to hone. Then, after cleaning, a few drops of oil on each shaft. Between settings the slicer is switched off until the blade stops, and afterward it is unplugged and fully cleaned.",
          h=84, extra=note(110, ["Off, and wait for the blade to stop, both times.", "Then unplug it and clean off the metal dust."], n), total_h=134)


@pic
def pic_closeearly():
    tiles([("START EARLY", "", ["dishes as you go", "racks and coolers filled", "half the meat case closed", "grill: oil and a screen"], ""), ("AFTER CLOSE", "", ["mop the dining room,", "bathrooms, counter area", "reset for the opener"], "okb")],
          "closeearly", "Closing in two parts. Start early: dishes as you go, chip racks and coolers filled, half the meat case wrapped, the grill pre-cleaned with oil and a grill screen. After the store closes: mop the dining room, bathrooms and counter area, and reset the store for the opener.", h=112)


@pic
def pic_grabgo():
    n = "grabgo"
    w, gap = (W - 16) / 3, 8
    b = ""
    data = (("ONIONS", ["peeled and", "washed"], P.onion_icon), ("LETTUCE", ["bopped and", "washed"], P.lettuce_icon), ("TOMATOES", ["red, ripe,", "rinsed, ready"], P.tomato_icon))
    for i, (head, cap, icon) in enumerate(data):
        x = i * (w + gap)
        b += box(x, 6, w, 110)
        b += icon(x + w / 2, 34, 17)
        b += text(x + w / 2, 72, head, "t1", room=w - 8, name=n)
        b += lines(x + w / 2, 89, cap, "t2", room=w - 6, name=n)
    b += note(134, ["Prepped the day before, waiting in the walk-in."], n, "t2")
    svg(144, b, "Grab and go for the opener: onions peeled and washed, lettuce bopped and washed, tomatoes red, ripe, rinsed and ready. All prepped the day before and waiting in the walk-in.", n)


@pic
def pic_leadclose():
    flow([("ASK", "how did the day go?"), ("PREP", "extra, before dinner"), ("CATERING", "tomorrow's orders set up"), ("HUDDLE", "split the checklist"), ("INITIAL", "each task as it's done"), ("CHART", "waste and left filled in")],
         "leadclose", "Leading a close, in order: ask the daytime lead how the day went, do any extra prep before the dinner rush, set up tomorrow's catering orders, huddle to split the closing checklist, initial each task as it is done, and finish the Production Pro chart by filling in waste and left.",
         cols=2, ch=46, gapx=18, gapy=16)


# ================================================================ ORDERING
@pic
def pic_ct():
    n = "ct"
    b = box(40, 6, 260, 44) + text(170, 24, "ENTERPRISE MANAGER", "t1", room=250, name=n) + text(170, 41, "the company: products, recipes, vendors", "ts", room=252, name=n)
    b += arr("M170 52 V68")
    b += box(40, 74, 260, 44, "okb") + text(170, 92, "NETCHEF", "t1", room=250, name=n) + text(170, 109, "your store: orders, counts, forecasts", "ts", room=256, name=n)
    b += arr("M170 142 V124")
    b += box(40, 144, 260, 44) + text(170, 162, "THE REGISTER", "t1", room=250, name=n) + text(170, 179, "sales, checks, time punches", "ts", room=252, name=n)
    svg(194, b, "CrunchTime has two parts. Enterprise Manager holds the company's setup: products, recipes and vendors. NetChef is the part used in your store, for orders, counts, the forecast and the schedule. NetChef also pulls sales, checks and time punches from the register.", n)


def slash_box(x, y, w, h, top, bot, n, cls="mid"):
    s = box(x, y, w, h)
    s += path(f"M{f(x + 4)} {f(y + h - 4)} L{f(x + w - 4)} {f(y + 4)}", "lnm")
    s += text(x + w * 0.30, y + h * 0.45, top, cls, room=w * 0.5, name=n)
    s += text(x + w * 0.70, y + h * 0.88, bot, cls, room=w * 0.5, name=n)
    return s


@pic
def pic_orderguide():
    n = "orderguide"
    cols = ((0, 118, "PRODUCT NAME"), (122, 70, "VENDOR UNIT"), (196, 70, "FIRST ORDER"), (270, 70, "NEXT ORDER"))
    b = ""
    for x, w, head in cols:
        b += box(x, 6, w, 24, "", 5) + text(x + w / 2, 22, head, "ts", room=w - 4, name=n)
    b += box(0, 34, 118, 50, "", 5) + text(59, 64, "Red wine vinegar", "tk", room=112, name=n)
    b += box(122, 34, 70, 50, "", 5) + text(157, 64, "4/1 gal", "tk", room=64, name=n)
    b += slash_box(196, 34, 70, 50, "0.5", "1", n, "tk") + slash_box(270, 34, 70, 50, "0.25", "2", n, "tk")
    b += path("M157 86 V98", "lnm") + text(4, 112, "packed 4 one-gallon bottles to a case", "ts", "start", room=260, name=n)
    b += path("M231 86 V118", "lnm") + text(W - 4, 132, "top: on hand.  bottom: what you order.", "ts", "end", room=250, name=n)
    svg(140, b, "One row of an order guide. The product is red wine vinegar. The vendor unit is 4 slash 1 gal, which means 4 one-gallon bottles to a case. Each order gets a box split by a slash: the top half is what is on hand and the bottom half is what you order. First order: 0.5 on hand, order 1. Next order: 0.25 on hand, order 2.", n)


@pic
def pic_slash():
    n = "slash"
    b = text(64, 16, "FIRST ORDER", "t1", room=128, name=n) + text(276, 16, "NEXT ORDER", "t1", room=128, name=n)
    b += slash_box(14, 24, 100, 66, "0.5", "1", n) + slash_box(226, 24, 100, 66, "0.25", "2", n)
    b += text(64, 104, "on hand / order", "ts", room=128, name=n) + text(276, 104, "on hand / order", "ts", room=128, name=n)
    b += arr("M122 57 H212")
    b += text(170, 48, "a week passes", "ts", room=96, name=n)
    b += box(0, 116, W, 58, "warnb")
    b += text(W / 2, 137, "0.5 + 1 = 1.5 cases were in the store", "tk", room=W - 10, name=n)
    b += text(W / 2, 158, "1.5 − 0.25 left = 1.25 cases used", "tk", room=W - 10, name=n)
    b += note(192, ["1 more case would only match what you used. Order 2."], n, "t2")
    svg(202, b, "The slash box math with the vinegar example. First order: 0.5 of a case on hand, order 1. A week later: 0.25 on hand. 0.5 plus 1 means 1.5 cases were in the store. 1.5 minus 0.25 left means 1.25 cases were used. One more case would only match what was used, so the order is 2.", n)


@pic
def pic_ordclicks():
    flow([("CREATE", "Create Vendor Order"), ("VENDOR", "and the delivery date"), ("QUANTITIES", "for each product"), ("ADD", "Add Selected Products"), ("REVIEW", "Retrieve what's missing"), ("PREPARE", "Prepare Order"), ("SUBMIT", "the order is sent")],
         "ordclicks", "Placing an order in CrunchTime, in order: Create Vendor Order, choose the vendor and the delivery date, type a quantity for each product, Add Selected Products, review and Retrieve anything missing, Prepare Order, Submit.",
         cols=2, ch=46, gapx=18, gapy=16)


# ================================================================ INVENTORY
@pic
def pic_cogu():
    n = "cogu"
    b = eq_row(n, 6, (("BEGINNING", "$5,000"), ("PURCHASES", "$7,000"), ("WORKING", "$12,000")), ("+", "="), "")
    b += eq_row(n, 66, (("WORKING", "$12,000"), ("CLOSING", "$5,500"), ("USED", "$6,500")), ("−", "="), "okb")
    b += eq_row(n, 126, (("USED", "$6,500"), ("SALES", "$23,215"), ("OF SALES", "28%")), ("÷", "="), "warnb")
    b += note(194, ["The video's example week. Tonight's closing count", "is next week's beginning."], n)
    svg(216, b, "The inventory math with the video's example. Beginning inventory 5,000 dollars plus purchases 7,000 equals working inventory 12,000. Working 12,000 minus closing inventory 5,500 equals 6,500 used. 6,500 used divided by sales of 23,215 equals 28 percent.", n)


@pic
def pic_countwhen():
    n = "countwhen"
    def lane(y, title, chips):
        s = text(4, y + 12, title, "t1", "start", room=W, name=n)
        w, gap = (W - 2 * 14) / 3, 14
        for i, cap in enumerate(chips):
            x = i * (w + gap)
            s += box(x, y + 20, w, 44, "okb" if i == 2 else "")
            s += lines(x + w / 2, y + 38, cap, "ts", room=w - 4, name=n, lh=13)
            if i < 2:
                s += arr(f"M{f(x + w + 2)} {y + 42} H{f(x + w + gap - 6)}")
        return s
    b = lane(4, "SUNDAY EVENING", (["stock the working", "areas early"], ["count storage", "all evening"], ["after close:", "working areas"]))
    b += lane(82, "MONDAY MORNING", (["working areas", "first"], ["then storage"], ["done before", "open"]))
    svg(154, b, "Two times to count inventory. Sunday evening: stock the meat case and displays early, count the storage areas through the evening, and count the working areas after the store closes. Monday morning: count the working areas first, then storage, and finish before the store opens.", n)


@pic
def pic_countsheet():
    n = "countsheet"
    cols = ((0, 30, "SEQ"), (32, 84, "PRODUCT"), (118, 54, "INV. UNIT"), (174, 54, "ALT 1"), (230, 54, "ALT 2"), (286, 54, "ALT 3"))
    b = ""
    for x, w, head in cols:
        b += box(x, 6, w, 22, "", 4) + text(x + w / 2, 21, head, "ts", room=w - 2, name=n)
    b += text(4, 44, "Freezer", "tk", "start", room=80, name=n)
    b += box(0, 50, 30, 48, "", 4) + box(32, 50, 84, 48, "", 4) + text(74, 79, "Bacon, raw", "tk", room=80, name=n)
    for (x, w, _), (qty, unit) in zip(cols[2:], (("5", "Lb"), ("4", "Case"), ("6", "Sheet"), ("12", "Slice"))):
        b += box(x, 50, w, 48, "okb" if unit == "Lb" else "", 4)
        b += text(x + w / 2, 72, qty, "mid", room=w - 6, name=n) + text(x + w / 2, 90, unit, "ts", room=w - 4, name=n)
    b += note(116, ["One product, counted four ways at once: 5 pounds in the", "open case, 4 full cases, 6 sheets and 12 slices."], n)
    svg(138, b, "One row of the count sheet, in the freezer section: bacon, raw. The inventory unit is pounds, with 5 written in. The alternate units are case, sheet and slice, with 4, 6 and 12 written in. So the bacon is counted as 5 pounds from the open case, 4 full cases, 6 sheets and 12 slices.", n)


@pic
def pic_invclicks():
    flow([("JOURNAL", "every order reconciled?"), ("PRINT", "the Weekly Count sheet"), ("COUNT", "location by location"), ("ENTER", "Data Entry"), ("REVIEW", "Save and Review, then fix"), ("CLOSE", "Save and Close"), ("POST", "Post Inventory"), ("REPORT", "Actual Theoretical Cost")],
         "invclicks", "A weekly inventory in CrunchTime, in order: check the purchase journal to see every order was reconciled, print the Weekly Count sheet, count the store location by location, type the counts into Data Entry, Save and Review and fix mistakes, Save and Close, Post Inventory, then pull the Actual Theoretical Cost report.",
         cols=2, ch=46, gapx=18, gapy=16)


# ================================================================ FOOD COST
@pic
def pic_goal():
    n = "goal"
    def px(p):
        return 22 + (p - 25) / 4 * 296
    b = path(f"M22 70 H318", "ln")
    for p in (25, 26, 27, 28, 29):
        b += path(f"M{f(px(p))} 66 V74", "lnm") + text(px(p), 88, f"{p}%", "ts", room=30, name=n)
    t, g, a = px(25.71), px(27.71), px(28.08)
    b += fx(t, 60, g - t, 10, "#BEE2A0", 2, None, 1.2, 0.9)
    b += fx(g, 60, a - g, 10, "#E05A4E", 2)
    b += path(f"M{f(t)} 44 V70", "ln") + text(t, 20, "THEORETICAL", "tk", room=110, name=n) + text(t, 36, "25.71%", "tk", room=60, name=n)
    b += path(f"M{f(g)} 44 V70", "ln") + text(g - 4, 20, "GOAL", "tk", "end", room=60, name=n) + text(g - 4, 36, "27.71%", "tk", "end", room=60, name=n)
    b += path(f"M{f(a)} 44 V70", "tick") + text(a + 4, 20, "ACTUAL", "tk", "start", room=70, name=n) + text(a + 4, 36, "28.08%", "tk", "start", room=70, name=n)
    b += text((t + g) / 2, 55, "+ 2 points", "ts", room=g - t, name=n)
    b += note(108, ["Goal = theoretical + 2.", "Here actual is 0.37 over goal."], n, "t2")
    svg(132, b, "A number line of food cost from 25 to 29 percent. Theoretical is 25.71 percent. The goal is 2 points higher, 27.71 percent. Actual came in at 28.08 percent, which is 0.37 over the goal.", n)


@pic
def pic_variance():
    n = "variance"
    cx = 200
    b = path(f"M{cx} 8 V112", "lnm")
    b += text(cx, 126, "what should have been used", "ts", room=180, name=n)
    b += fx(cx - 156, 20, 156, 26, "#C1272D", 4) + text(cx - 78, 38, "TURKEY: 78 lb", "lt", room=150, name=n)
    b += text(cx - 156, 62, "RED: too much went out", "tk", "start", room=190, name=n)
    b += fx(cx, 76, 14, 26, "#1B2B44", 3, "currentColor", 1.4) + text(cx + 20, 86, "PROVOLONE: 7 lb", "tk", "start", room=118, name=n)
    b += text(cx + 20, 102, "BLACK: too little", "tk", "start", room=118, name=n)
    b += note(146, ["Both are problems.", "Black usually means guests got shorted."], n, "t2")
    svg(170, b, "Two variances drawn against a center line that stands for what should have been used. Turkey is 78 pounds in the red, a long bar on the too-much side. Provolone is 7 pounds in the black, a short bar on the too-little side. Both are problems.", n)


@pic
def pic_groups():
    n = "groups"
    parts = ((67, "#C1272D", "MEAT, CHEESE, BREAD  67%", "lt"), (12, "#B8651B", "12%", "lt"), (20, "#5E6B7C", "20%", "lt"), (1, "#2B7A4B", "", "lt"))
    b, x = "", 0
    for pct, fill, lab, cls in parts:
        w = pct * W / 100
        b += fx(x, 10, max(w - 1, 2), 36, fill, 4)
        if lab:
            b += text(x + w / 2, 33, lab, cls, room=w - 4, name=n)
        x += w
    b += path("M338 48 V58", "lnm")
    rows = ("12%: chips, bottled drinks, cookies (pre-portioned)", "20%: other food, and produce", "1%: fountain drinks")
    for i, r in enumerate(rows):
        b += text(W - 4 if i == 2 else 4, 72 + (0 if i == 2 else 16 * (i + 1)) - (0 if i != 2 else 4), r, "ts", "end" if i == 2 else "start", room=W, name=n)
    b += note(126, ["Start with the red block.", "It's two thirds of the cost."], n, "t2")
    svg(150, b, "Cost of goods used, split into four groups. Meat, cheese and bread are 67 percent. Chips, bottled drinks and cookies are 12 percent. Other food and produce are 20 percent. Fountain drinks are 1 percent.", n)


@pic
def pic_fitness():
    n = "fitness"
    items = [("OVER-PORTIONING", ""), ("WASTE", ""), ("PURCHASING, RECEIVING", ""), ("PRODUCT THEFT", ""), ("CASH HANDLING", ""), ("PRICING", ""), ("PRODUCT MIX", "")]
    w, h, gap = (W - 8) / 2, 28, 6
    b = ""
    for i, (title, _) in enumerate(items):
        r, k = divmod(i, 2)
        x, y = (k * (w + 8), 6 + r * (h + gap)) if i < 6 else ((W - w) / 2, 6 + 3 * (h + gap))
        b += box(x, y, w, h, "warnb" if i == 0 else "") + text(x + w / 2, y + 19, title, "tk", room=w - 6, name=n)
    b += note(6 + 4 * (h + gap) + 12, ["Not sure which one it is? Assume all seven."], n, "t2")
    svg(6 + 4 * (h + gap) + 22, b, "The seven causes the food cost fitness form covers: over-portioning, waste, purchasing and receiving, product theft, cash handling, pricing, and product mix. If you are not sure which one it is, assume all seven.", n)


# ================================================================ SCHEDULING
@pic
def pic_forecast():
    n = "forecast"
    tiles([("4-WEEK AVERAGE", "$17,535", ["last 4 weeks added,", "then divided by 4"], ""), ("LAST YEAR + 5%", "$17,492", ["$16,659.07 plus", "$832.95"], "")],
          n, "Two ways to forecast a week's sales, with the video's numbers. The 4-week average: the last four weeks added up and divided by 4, which gives 17,535 dollars. Last year plus growth: 16,659 dollars and 7 cents plus 5 percent, 832 dollars and 95 cents, which gives 17,492 dollars. Then adjust for the time of year, weather, events and catering.",
          h=92, extra=note(118, ["Then adjust: time of year, weather, events, catering."], n, "t2"), total_h=128)


@pic
def pic_coverage():
    n = "coverage"
    x0, x1 = 44, 332
    def hx(h):
        return x0 + (h - 8) * (x1 - x0) / 13.25
    b = ""
    for a, z, lab in ((11.75, 13.5, "5 ON"), (18, 19.5, "3 ON")):
        b += fx(hx(a), 22, hx(z) - hx(a), 122, "#F2B24A", 3, None, 1.2, 0.35)
        b += text((hx(a) + hx(z)) / 2, 16, lab, "tk", room=60, name=n)
    for h, lab in ((8, "8"), (12, "12"), (16, "4"), (20, "8")):
        b += text(hx(h), 158, lab, "ts", room=24, name=n) + path(f"M{f(hx(h))} 22 V146", "ghost")
    shifts = (("Mgr", 8, 16), ("Lead", 9.25, 13.5), ("Team", 10.5, 14.5), ("Team", 11.5, 14), ("Asst", 11.75, 19.5), ("Lead", 16, 21.25), ("Team", 18, 21.25))
    for i, (who, a, z) in enumerate(shifts):
        y = 32 + i * 17
        b += text(4, y + 4, who, "ts", "start", room=36, name=n)
        b += f'<path d="M{f(hx(a))} {y} H{f(hx(z))}" style="fill:none;stroke:#2C6CB0;stroke-width:7;stroke-linecap:round"/>'
    b += note(176, ["The video's example Monday: one line for each shift.", "2 people finish the close. Never fewer."], n)
    svg(198, b, "A coverage chart for the video's example Monday, with one line for each shift from 8 in the morning to 9:15 at night. The manager works 8 to 4. A shift leader 9:15 to 1:30. Team members 10:30 to 2:30 and 11:30 to 2. The assistant manager 11:45 to 7:30. A shift leader 4 to 9:15. A team member 6 to 9:15. Five people are on at the lunch peak, three at the dinner peak, and two finish the close.", n)


@pic
def pic_laborpct():
    n = "laborpct"
    b = eq_row(n, 6, (("DAY'S PAY", "$335.75"), ("FORECAST", "$2,250"), ("LABOR", "14.92%")), ("÷", "="), "warnb")
    b += note(76, ["Hours times wage, for each person, added up.", "Too high? Move a start to 10:15, or an end to 2:15."], n)
    svg(98, b, "Labor percent with the video's example Monday: the day's pay, 335 dollars and 75 cents, divided by forecasted sales of 2,250 dollars, equals 14.92 percent.", n)


@pic
def pic_schedweek():
    flow([("FORECAST", "the week's sales"), ("WRITE", "Thursday afternoon"), ("CHECK", "coverage, breaks, labor"), ("POST", "the team sees it"), ("LOOK BACK", "was the forecast right?")],
         "schedweek", "The scheduling week, in order: forecast the week's sales, write the schedule on Thursday afternoon, check coverage, breaks and labor, post it for the team, and after the week look back at how accurate the forecast was.",
         cols=2, ch=46, gapx=18, gapy=16)


# ================================================================ MARKETING
@pic
def pic_touch():
    n = "touch"
    b, hgt = grid(n, [("FRONT DOOR", "glass and handle clean"), ("SLICER", "clean all rush long"), ("TABLES", "wiped, never sticky"), ("NAPKINS", "dispenser clean"), ("BATHROOMS", "spotless"), ("DISPLAYS", "cookies, chips, drinks full")])
    b += note(hgt + 18, ["A commercial gets 30 seconds.", "You get at least 3 minutes."], n, "t2")
    svg(hgt + 42, b, "Six things a guest sees or touches inside the store: the front door glass and handle, the slicer, the tables, the napkin dispensers, the bathrooms, and the displays of cookies, chips and drinks. A commercial gets 30 seconds. The store gets at least 3 minutes.", n)


@pic
def pic_shore():
    n = "shore"
    b = ""
    for i in range(13):
        x = 4 + i * 25.6
        free = i == 12
        b += fx(x, 16, 21, 12, "#7FC08A" if free else P.BREAD, 6, "#2B7A4B" if free else P.BREAD_LN)
    b += text(4 + 6 * 25.6 - 2, 48, "buy 12 subs", "tk", room=200, name=n)
    b += text(W - 4, 48, "13th free", "tk", "end", room=80, name=n)
    b += note(72, ["12 minis earn a mini. 12 regulars, a regular.", "12 giants, a giant. Ask every guest."], n, "t2")
    svg(96, b, "Thirteen subs in a row. The first twelve are bought and the thirteenth is free. Twelve minis earn a free mini, twelve regulars a free regular, twelve giants a free giant. Ask every guest about Shore Points.", n)


@pic
def pic_fivesteps():
    n = "fivesteps"
    flow([("PLAN", "who goes, and where"), ("PREPARE", "cards and menus in stock"), ("IMPLEMENT", "go out and do it"), ("EVALUATE", "did the cards come back?"), ("RE-IMPLEMENT", "go again: staff change")],
         n, "A marketing program in five steps: plan who goes and where, prepare by having cards and menus in stock, implement by going out and doing it, evaluate by checking if the free sub cards came back, and re-implement, because staff at those businesses change. Then start again.",
         cols=2, ch=46, gapx=18, gapy=16, extra=note(196, ["Then back to step 1. It never stops."], n), total_h=206)


@pic
def pic_grass():
    n = "grass"
    tiles([("NEVER BEEN IN", "", ["buy them lunch:", "a free sub card"], "okb"), ("ALREADY A GUEST", "", ["give them options:", "online order, delivery"], "")],
          n, "Two kinds of people you meet on a grassroots visit. Someone who has never been in: buy them lunch with a free sub card. Someone who is already a guest: give them options, such as online ordering or delivery. Catering comes later and is not the pitch.",
          h=78, extra=note(104, ["Catering comes later. It isn't the pitch."], n, "t2"), total_h=114)


@pic
def pic_visit():
    tiles([("BIG BOX", "", ["early, right", "after open:", "the manager"], ""), ("SHOPS", "", ["any time:", "the owner, then", "everyone"], ""), ("OFFICES", "", ["mornings for", "doctors: the", "receptionist"], "")],
          "visit", "Three kinds of business to visit. Big stores: early, right after they open, and get to know the manager. Small shops: any time, the owner and then every employee. Offices: mornings for doctors' offices, and get to know the receptionist.", h=90)


# ================================================================ PROFIT
@pic
def pic_own():
    vflow([("WANT A RAISE?", "work as though you already have it"), ("WANT TO MANAGE?", "show a manager's habits now"), ("WANT A STORE?", "take pride in every sub and every guest")],
          "own", "Taking ownership before you own it. Want a raise? Work as though you already have it. Want to manage? Show a manager's habits now. Want your own store? Take pride in every sub and every guest.")


@pic
def pic_keys():
    flow([("SALES", "the top line: grow it"), ("FOOD COST", "theoretical + 2"), ("LABOR", "planned, never a surprise"), ("WHAT'S LEFT", "follows the other three")],
         "keys", "The four keys to profit: sales, the top line, which you grow. Food cost, held to theoretical plus 2. Labor, planned and never a surprise. And what is left, the bottom line, which follows the other three.",
         cols=2, ch=46, gapx=18, gapy=16)


@pic
def pic_loaf():
    n = "loaf"
    b = eq_row(n, 6, (("WEEK'S SALES", "$16,500"), ("LOAVES", "1,000"), ("PER LOAF", "$16.50")), ("÷", "="), "okb")
    b += eq_row(n, 66, (("10 MORE A DAY", "$165"), ("DAYS", "7"), ("MORE A WEEK", "$1,155")), ("×", "="), "warnb")
    b += note(134, ["10 more loaves a day at $16.50 is $165 a day.", "The week goes from $16,500 to $17,655."], n)
    svg(156, b, "Bread math with the video's example. A week's sales of 16,500 dollars divided by 1,000 loaves is 16 dollars and 50 cents a loaf. Ten more loaves a day is 165 dollars a day, times 7 days, which is 1,155 dollars more a week.", n)


@pic
def pic_pl():
    n = "pl"
    parts = ((26.1, "#C1272D", "FOOD 26.1%"), (1.9, "#D98A2B", ""), (7.0, "#5E6B7C", ""), (22.5, "#B8651B", "LABOR 22.5%"), (16.7, "#7A6A9B", ""), (25.8, "#2B7A4B", "LEFT 25.8%"))
    b, x = text(4, 14, "THE EXAMPLE STORE: WHERE $1 OF SALES WENT", "ts", "start", room=W, name=n), 0
    marks = []
    for pct, fill, lab in parts:
        w = pct * W / 100
        b += fx(x, 22, max(w - 1, 2), 38, fill, 4)
        if lab:
            b += text(x + w / 2, 46, lab, "lt", room=w - 3, name=n)
        else:
            marks.append(x + w / 2)
        x += w
    b += path(f"M{f(marks[0])} 62 V74", "lnm") + text(marks[0] - 6, 88, "paper 1.9%", "ts", "end", room=86, name=n)
    b += path(f"M{f(marks[1])} 62 V74", "lnm") + text(marks[1] + 2, 88, "facility 7%", "ts", "start", room=90, name=n)
    b += path(f"M{f(marks[2])} 62 V74", "lnm") + text(marks[2] - 16, 88, "the rest 16.7%", "ts", "start", room=90, name=n)
    b += note(108, ["The rest = operations, supplies, fees (by subtraction).", "Left = EBITDA, the bottom line."], n)
    svg(130, b, "Where each dollar of sales went in the video's example store: food 26.1 percent, paper 1.9 percent, facility 7 percent, labor 22.5 percent, the rest, which is operations, supplies and fees, 16.7 percent by subtraction, and 25.8 percent left as EBITDA, the bottom line.", n)


@pic
def pic_pl2():
    n = "pl2"
    tiles([("HOURLY", "12 to 16", ["% of sales"], "warnb"), ("WITH MGMT", "20 to 22", ["% of sales"], "warnb"), ("EBITDA", "25.8%", ["the example", "store"], "okb")],
          n, "Labor and the bottom line. Hourly labor usually runs 12 to 16 percent of sales. Hourly plus management usually runs 20 to 22 percent. The example store's EBITDA, earnings before interest, taxes, depreciation and amortization, is 25.8 percent.",
          h=84, extra=note(110, ["EBITDA: earnings before interest, taxes,", "depreciation and amortization."], n), total_h=134)


@pic
def pic_week():
    n = "week"
    tiles([("THE REGISTER", "", ["sales, tickets, bread,", "discounts and coupons,", "voids, refunds, members"], ""), ("CRUNCHTIME", "", ["food cost: actual,", "theoretical, variance.", "labor percent."], "")],
          n, "The weekly review pulls numbers from two places. From the register: sales, tickets, bread, discounts and coupons, voids, refunds and Shore Points members. From CrunchTime: actual and theoretical food cost with the variance between them, and the labor percent. Then circle the numbers that need work.",
          h=100, extra=note(126, ["Line up the weeks. Circle what needs work."], n, "t2"), total_h=136)



# ================================================================ THE SHEETS ON THE MEAT CASE DOOR (Nov 12, 2026)
@pic
def pic_weights():
    n = "weights"
    tiles([("#7 TURKEY", "9.2", ["giant", "5.5 regular", "2.95 mini"], "okb"), ("#13 ITALIAN", "11", ["giant", "6.4 regular", "3.9 mini"], "okb"), ("PROVOLONE", "2", ["giant", "1.2 regular", "0.8 mini"], "")],
          n, "Three sets of weights to learn first, in ounces. The number 7, turkey and provolone: 9.2 for a giant, 5.5 for a regular, 2.95 for a mini. The number 13, the Original Italian: 11, 6.4 and 3.9. Provolone on almost every sub: 2, 1.2 and 0.8.",
          h=96, extra=note(122, ["Ounces of cheese and meat, with no bread."], n), total_h=132)


@pic
def pic_meatcase():
    n = "meatcase"
    b, y = grid(n, [("Weigh and date", "on delivery"), ("Empty and clean", "every week"), ("New product", "into the display"), ("Extra product", "into the walk-in")], cols=2, h=42)
    b += box(0, y + 8, W, 42, "okb")
    b += text(W / 2, y + 25, "3-inch gap to the front glass", "t1", room=W - 10, name=n)
    b += text(W / 2, y + 40, "so the air can flow. No paper lining.", "ts", room=W - 10, name=n)
    svg(y + 56, b, "The meat case rules. On delivery, weigh and date each product. Empty and clean the case every week. New product rotates into the display, and extra product goes into the walk-in. Leave a 3-inch gap between the display and the front glass so the air can flow, and do not line the case with paper.", n)


@pic
def pic_sprkarea():
    n = "sprkarea"
    pans = [("Tomatoes", "warnb"), ("Lettuce", "okb"), ("Onions", ""), ("Mayo", ""), ("Relish", "")]
    b = text(4, 14, "SLICER", "ts", "start", room=60, name=n) + arr(f"M92 10 H50")
    b += text(W - 4, 14, "far end", "ts", "end", room=60, name=n)
    w, gap = 50, 4
    for i, (lab, cls) in enumerate(pans):
        x = 2 + i * (w + gap)
        b += box(x, 22, w, 46, cls)
        b += text(x + w / 2, 50, lab, "ts", room=w - 2, name=n)
    x = 2 + len(pans) * (w + gap) + 10
    b += box(x, 22, W - 2 - x, 46, "")
    b += text(x + (W - 2 - x) / 2, 50, "Bacon", "ts", room=W - x - 4, name=n)
    b += note(86, ["The extras sit behind the mayo and the relish.", "Oil, vinegar, oregano and salt stand at both ends."], n)
    svg(108, b, "The sprinkling area from the slicer's end: tomatoes nearest the slicer, then lettuce, onions, mayo and the chopped pepper relish, with the bacon pan at the far end. The extras sit behind the mayo and the relish. Oil, vinegar, oregano and salt stand at both ends.", n)



# ================================================================ THE SLICER ITSELF (photo taken in the store, Nov 12, 2026)
# src/img/slicer-gsph.jpg is that photo with the background blurred out and nothing else in it: no metadata, nothing
# readable behind the machine. Each mark is (number, the point on the machine, where the number sits), in the
# picture's own units (340 wide). The names are the training's; the card under the picture says what each part does.
SLICER_MARKS = [
    (1, (178, 88), (178, 88)),       # pusher deck: the ribbed tray
    (2, (262, 160), (300, 168)),     # green handle, on the pusher deck
    (3, (236, 20), (204, 14)),       # guard: the frame that comes down on the product
    (4, (318, 30), (324, 56)),       # red handle, on the guard
    (5, (258, 74), (258, 74)),       # spike plate, under the guard (held on by the small black knob)
    (6, (248, 184), (290, 206)),     # black knob on the side: the pusher deck swings open
    (7, (210, 242), (210, 242)),     # dial
    (8, (67, 250), (40, 226)),       # buttons: green I, white light, red O
    (9, (99, 86), (99, 86)),         # blade end: blade, guard ring, blade plate
    (10, (258, 110), (232, 124)),    # the sticker: sharpen and lube daily
]


@pic
def pic_slicerparts():
    import base64
    n = "slicerparts"
    img = ROOT / "src" / "img" / "slicer-gsph.jpg"
    data = base64.b64encode(img.read_bytes()).decode("ascii")
    h = 285
    b = f'<defs><clipPath id="sp-clip"><rect x="0" y="0" width="{P.W}" height="{h}" rx="12"/></clipPath></defs>'
    b += f'<image href="data:image/jpeg;base64,{data}" x="0" y="0" width="{P.W}" height="{h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#sp-clip)"/>'
    for num, (px, py), (dx, dy) in SLICER_MARKS:
        if (px, py) != (dx, dy):
            d = f"M{dx} {dy} L{px} {py}"
            b += f'<path d="{d}" style="fill:none;stroke:#1B2B44;stroke-width:3.6;stroke-linecap:round"/>'
            b += f'<path d="{d}" style="fill:none;stroke:#FFFFFF;stroke-width:1.6;stroke-linecap:round"/>'
            b += f'<circle cx="{px}" cy="{py}" r="2.8" style="fill:#FFFFFF;stroke:#1B2B44;stroke-width:1.4"/>'
        b += f'<circle cx="{dx}" cy="{dy}" r="10.5" style="fill:#FFFFFF"/>' + P.disc(dx, dy, num)
    P.svg(h, b, "Photo of the slicer, a Bizerba GSP H, with its parts numbered. 1, the pusher deck. 2, the green handle on the pusher deck. 3, the guard. 4, the red handle on the guard. 5, the spike plate under the guard. 6, the black knob on the side that lets the pusher deck swing open. 7, the dial. 8, the buttons. 9, the blade end. 10, the sharpen and lube sticker.", n)


if __name__ == "__main__":
    for fn in MINE: fn()
    if P.TOO_WIDE:
        raise SystemExit("pics_mgr: labels too wide for their boxes:\n  " + "\n  ".join(P.TOO_WIDE))
    inc = ROOT / "src" / "include"
    for name, html in P.PICS.items():
        (inc / f"pic-{name}.html").write_text(html, encoding="utf-8")
    print("pics_mgr", len(P.PICS), "bytes", sum(len(v) for v in P.PICS.values()))
