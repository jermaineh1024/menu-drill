"""The diagrams for the training modules: yields, thickness, cooling, the prep chart, bread, the grill, the slicer.

    python3 tools/pics.py

writes one src/include/pic-NAME.html per drawing and proof/pics.html (every drawing, light and dark).

Each drawing is an inline SVG 340 units wide that takes its colours from the page (class "stations pic"), so it follows
light and dark. Food keeps its own fixed colour and any words on food use a fixed ink. Every number and every label comes
from the training videos' own words (transcript pasted Nov 9, 2026); where a drawing has to choose something the words
don't give (how a hand looks, where a pan sits), the note beside it on the page carries the words and the drawing is one
way of showing them. Labels are measured before they are written: one that would run past its box stops the build.
"""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
W = 340
EDGE = 3          # the least clear space between a label and the picture edge
INK = "#1B2B44"
BREAD, BREAD_LN, BREAD_HI = "#D9A76A", "#9B6A33", "#EBCB9A"
LETTUCE, LETTUCE_LN = "#BEE2A0", "#6E9B55"
TOMATO, ONION, ONION_LN = "#E05A4E", "#E8DFF2", "#9C86B8"
CHEESE, HAM, TURKEY = "#F2E3AE", "#EDA4AA", "#F1E2D2"
STEAK, CHICKEN, PEPPER, BACON = "#6A3E33", "#E8CCA6", "#7FA85E", "#A94E38"
STEEL, STEEL_LN, GRILL = "#C9D2DB", "#6F7B88", "#3A4250"
PAPER, PAPER_LN = "#FFFFFF", "#AEA796"
PICS = {}
TOO_WIDE = []   # every label that would run past its box; the build stops if there are any


def f(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


# ---------------------------------------------------------------- text, measured
WIDTH = {"t1": 0.50, "t2": 0.50, "tk": 0.53, "ts": 0.52, "big": 0.47, "dk": 0.54, "lt": 0.54, "num": 0.6, "mid": 0.47}
SIZE = {"t1": 15, "t2": 12.5, "tk": 12.5, "ts": 11, "big": 24, "dk": 11.5, "lt": 11.5, "num": 12, "mid": 18}


def est(s, cls):
    return len(s) * SIZE[cls] * WIDTH[cls] + (len(s) * 0.75 if cls in ("t1", "big", "mid") else 0)


def text(x, y, s, cls="t2", anchor="middle", room=None, name=""):
    """room: the width this label has. The build stops if the label is wider than its room."""
    if room is not None and est(s, cls) > room + 1:
        TOO_WIDE.append(f"{name}: {s!r} needs {est(s, cls):.0f}, has {room:.0f} ({cls})")
    # A label may not touch the picture's own edge. Firefox sets type a hair wider than the others, and a label that
    # starts at x 0 loses its first pixel there (found Nov 9 on the slicer cleaning times).
    w = est(s, cls)
    left = x - (w / 2 if anchor == "middle" else w if anchor == "end" else 0)
    if left < EDGE or left + w > W - EDGE:
        TOO_WIDE.append(f"{name}: {s!r} runs {left:.0f} to {left + w:.0f}, the picture is 0 to {W} and labels keep {EDGE} clear ({cls})")
    css = {"big": "temp-big"}.get(cls, cls)
    return f'<text x="{f(x)}" y="{f(y)}" text-anchor="{anchor}" class="{css}">{s}</text>'


def lines(x, y, rows, cls="t2", anchor="middle", room=None, lh=None, name=""):
    lh = lh or SIZE[cls] * 1.22
    return "".join(text(x, y + i * lh, r, cls, anchor, room, name) for i, r in enumerate(rows))


# ---------------------------------------------------------------- shapes
def box(x, y, w, h, cls="", rx=10):
    c = f' class="{cls}"' if cls else ""
    return f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" rx="{f(rx)}"{c}/>'


def fx(x, y, w, h, fill, rx=4, stroke=None, sw=1.2, op=None):
    """A rectangle in a fixed food colour."""
    st = f"fill:{fill};stroke:{stroke or 'none'}" + (f";stroke-width:{sw}" if stroke else "")
    o = f' opacity="{op}"' if op is not None else ""
    return f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" rx="{f(rx)}" style="{st}"{o}/>'


def circ(cx, cy, r, fill, stroke=None, sw=1.2):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="{fill}"{s}/>'


def ell(cx, cy, rx, ry, fill, stroke=None, sw=1.2):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(rx)}" ry="{f(ry)}" fill="{fill}"{s}/>'


def path(d, cls):
    return f'<path class="{cls}" d="{d}"/>'


def arr(d):
    return path(d, "arr")


def red(d):
    """A red arrow: motion, or the thing to look at."""
    return path(d, "red")


def disc(cx, cy, n, r=9):
    return f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{r}" class="disc"/>' + text(cx, cy + 4.2, str(n), "num")


def svg(h, body, label, name):
    for bad in (chr(0x2014), chr(0x2013)):
        if bad in body or bad in label:
            raise SystemExit("pics: dash in " + name)
    PICS[name] = f'<svg class="stations pic" viewBox="0 0 {W} {f(h)}" role="img" aria-label="{label}">{body}</svg>'


def tiles(items, name, label, y=6, h=78, gap=8, extra="", total_h=None):
    """A row of boxes: (heading, big value, caption lines, box class)."""
    n = len(items)
    w = (W - gap * (n - 1)) / n
    b = ""
    for i, (head, value, cap, cls) in enumerate(items):
        x = i * (w + gap)
        b += box(x, y, w, h, cls)
        cy = y + 18
        if head:
            b += text(x + w / 2, cy, head, "t1", room=w - 8, name=name); cy += 25
        else:
            cy += 8
        if value:
            b += text(x + w / 2, cy, value, "big", room=w - 8, name=name); cy += 17
        b += lines(x + w / 2, cy, cap, "t2", room=w - 6, name=name)
    svg(total_h or (y + h + 6), b + extra, label, name)


def flow(chips, name, label, cols=3, ch=46, gapx=22, gapy=20, y0=6, extra="", total_h=None):
    """Numbered chips joined by arrows, wrapping to rows: (title, caption)."""
    cw = (W - gapx * (cols - 1)) / cols
    b = ""
    rows = (len(chips) + cols - 1) // cols
    for i, (title, cap) in enumerate(chips):
        r, c = divmod(i, cols)
        x, y = c * (cw + gapx), y0 + r * (ch + gapy)
        b += box(x, y, cw, ch)
        b += disc(x + 13, y + 14, i + 1, 8.5)
        b += text(x + 26, y + 19, title, "t1", "start", room=cw - 30, name=name)
        if cap:
            b += text(x + 8, y + 37, cap, "ts", "start", room=cw - 12, name=name)
        if i < len(chips) - 1:
            if c < cols - 1:
                b += arr(f"M{f(x + cw + 3)} {f(y + ch / 2)} H{f(x + cw + gapx - 7)}")
            else:   # down to the start of the next row
                b += arr(f"M{f(x + cw / 2)} {f(y + ch + 2)} V{f(y + ch + gapy / 2)} H{f(cw / 2)} V{f(y + ch + gapy - 6)}")
    svg(total_h or (y0 + rows * ch + (rows - 1) * gapy + 6), b + extra, label, name)


# ================================================================ REGISTER
def pic_cash():
    n = "cash"
    b = box(8, 34, 150, 92)
    for i in range(5):
        b += fx(16 + i * 28, 42, 22, 44, "#CFE3C4" if i else "#DCE9D4", 3, "#8FAE80")
    for i in range(5):
        b += circ(27 + i * 28, 106, 9, "#D8DDE3", STEEL_LN)
    # the guest's bill lies across the drawer until the change is made
    b += f'<g transform="rotate(-9 84 26)">' + fx(40, 14, 88, 26, "#9CC98A", 3, "#4E7D3F", 1.4) + text(84, 31, "$20", "dk") + "</g>"
    b += text(84, 142, "the drawer", "t2", room=150, name=n)
    x = 172
    for i, (y, head, caps) in enumerate(((30, "BILLS REST ON TOP", ["not in the slots yet"]), (72, "MAKE THE CHANGE", ["coins first, then bills,", "counted back out loud"]), (126, "THEN BILLS GO IN", []))):
        b += disc(x + 9, y, i + 1, 9)
        b += text(x + 23, y + 5, head, "t1", "start", room=146, name=n)
        b += lines(x + 23, y + 21, caps, "ts", "start", room=146, name=n)
    svg(150, b, "A cash drawer with the guest's bill lying across it while change is made. Coins go back first, then bills, counted out loud. Then the bill goes in.", n)


def pic_smile():
    n = "smile"
    w, gap = (W - 16) / 3, 8
    b = ""
    for i, (head, cap) in enumerate((("SMILE", "it's contagious"), ("EYE CONTACT", "likable, trusted"), ("BE GENUINE", "be yourself"))):
        x = i * (w + gap)
        b += box(x, 6, w, 96)
        cx, cy = x + w / 2, 38
        if i == 0:
            b += f'<circle cx="{f(cx)}" cy="{cy}" r="19" class="ln"/>' + circ(cx - 7, cy - 5, 2.2, "currentColor") + circ(cx + 7, cy - 5, 2.2, "currentColor")
            b += path(f"M{f(cx - 10)} {cy + 4} Q{f(cx)} {cy + 15} {f(cx + 10)} {cy + 4}", "ln")
        elif i == 1:
            b += path(f"M{f(cx - 24)} {cy} Q{f(cx)} {cy - 20} {f(cx + 24)} {cy} Q{f(cx)} {cy + 20} {f(cx - 24)} {cy} Z", "ln")
            b += f'<circle cx="{f(cx)}" cy="{cy}" r="8" class="ln"/>' + circ(cx, cy, 3, "currentColor")
        else:
            b += path(f"M{f(cx)} {cy + 16} C{f(cx - 30)} {cy - 4} {f(cx - 12)} {cy - 24} {f(cx)} {cy - 8} C{f(cx + 12)} {cy - 24} {f(cx + 30)} {cy - 4} {f(cx)} {cy + 16} Z", "ln")
        b += text(cx, 76, head, "t1", room=w - 6, name=n) + text(cx, 93, cap, "ts", room=w - 6, name=n)
    svg(108, b, "Three habits at the register: smile, make eye contact, be genuine.", n)


# ================================================================ PREP
def onion_icon(cx, cy, r):
    return circ(cx, cy, r, ONION, ONION_LN) + f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r * .62)}" fill="none" stroke="{ONION_LN}" stroke-width="1.1"/>' + f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r * .28)}" fill="none" stroke="{ONION_LN}" stroke-width="1.1"/>'


def lettuce_icon(cx, cy, r):
    s = circ(cx, cy, r, LETTUCE, LETTUCE_LN)
    s += f'<path d="M{f(cx - r * .6)} {f(cy - r * .2)} Q{f(cx - r * .1)} {f(cy - r * .8)} {f(cx + r * .5)} {f(cy - r * .35)} M{f(cx - r * .5)} {f(cy + r * .4)} Q{f(cx)} {f(cy - r * .1)} {f(cx + r * .6)} {f(cy + r * .3)}" fill="none" stroke="{LETTUCE_LN}" stroke-width="1.2" stroke-linecap="round"/>'
    return s


def tomato_icon(cx, cy, r):
    s = circ(cx, cy, r, TOMATO, "#A83A30")
    s += f'<path d="M{f(cx - 5)} {f(cy - r + 3)} L{f(cx)} {f(cy - r + 7)} L{f(cx + 5)} {f(cy - r + 3)} M{f(cx)} {f(cy - r + 7)} V{f(cy - r - 2)}" fill="none" stroke="#3E7A34" stroke-width="2" stroke-linecap="round"/>'
    return s


def pic_yields():
    n = "yields"
    w, gap = (W - 16) / 3, 8
    b = ""
    data = (("1 ONION", "15", ["loaves"], onion_icon), ("1 HEAD", "5", ["loaves"], lettuce_icon), ("1 TOMATO", "1.5", ["loaves, from", "8 to 9 slices"], tomato_icon))
    for i, (head, val, cap, icon) in enumerate(data):
        x = i * (w + gap)
        b += box(x, 6, w, 118)
        b += icon(x + w / 2, 30, 15)
        b += text(x + w / 2, 64, head, "t1", room=w - 6, name=n)
        b += text(x + w / 2, 88, val, "big", room=w - 6, name=n)
        b += lines(x + w / 2, 103, cap, "ts", room=w - 6, name=n)
    b += box(0, 132, W, 46, "okb")
    b += text(W / 2, 151, "150 LOAVES A DAY", "t1", room=W - 10, name=n)
    b += text(W / 2, 168, "about 10 onions, 30 heads of lettuce, 100 tomatoes", "t2", room=W - 10, name=n)
    svg(184, b, "One onion covers 15 loaves. One head of lettuce covers 5. One tomato gives 8 to 9 slices, about one and a half loaves. A store selling 150 loaves a day needs about 10 onions, 30 heads of lettuce and 100 tomatoes.", n)


def pic_onion():
    n = "onion"
    cx, cy = 84, 82
    b = ell(cx, cy, 52, 46, ONION, ONION_LN, 1.6)
    for k in (.8, .58, .36):
        b += f'<ellipse cx="{cx}" cy="{cy}" rx="{f(52 * k)}" ry="{f(46 * k)}" fill="none" stroke="{ONION_LN}" stroke-width="1"/>'
    b += f'<path d="M{cx - 5} 36 Q{cx} 22 {cx + 4} 36" fill="none" stroke="{ONION_LN}" stroke-width="3" stroke-linecap="round"/>'           # stem
    b += f'<path d="M{cx - 9} 128 l3 8 M{cx} 128 v9 M{cx + 9} 128 l-3 8" fill="none" stroke="{ONION_LN}" stroke-width="1.6" stroke-linecap="round"/>'   # roots
    b += path(f"M{cx - 34} 44 H{cx + 34}", "dash") + path(f"M{cx - 30} 118 H{cx + 30}", "dash")
    b += path(f"M{cx + 46} 60 Q{cx + 56} 82 {cx + 46} 104", "dash")
    b += disc(18, 44, 1) + disc(18, 118, 2) + disc(cx + 66, 82, 3)
    x = 176
    b += text(x, 30, "1  STEM OFF", "t1", "start", room=160, name=n)
    b += text(x, 60, "2  ROOT OFF", "t1", "start", room=160, name=n) + text(x, 76, "deep enough to take out", "ts", "start", room=160, name=n) + text(x, 89, "the solid core, no deeper", "ts", "start", room=160, name=n)
    b += text(x, 116, "3  SLIT THE SIDE", "t1", "start", room=160, name=n) + text(x, 132, "about 2 layers, then peel", "ts", "start", room=160, name=n)
    # rings, not strings
    b += box(0, 150, 164, 58, "okb") + box(176, 150, 164, 58, "badb")
    for k in (14, 9, 4.5):
        b += f'<circle cx="30" cy="179" r="{k}" fill="none" stroke="{ONION_LN}" stroke-width="2"/>'
    b += text(56, 175, "RINGS", "t1", "start", room=100, name=n) + text(56, 191, "a shallow cut", "ts", "start", room=104, name=n)
    b += f'<path d="M192 170 q8 -8 16 0 M190 180 q10 9 20 -1 M195 190 q7 -6 14 0" fill="none" stroke="{ONION_LN}" stroke-width="2" stroke-linecap="round"/>'
    b += text(226, 175, "STRINGS", "t1", "start", room=108, name=n) + text(226, 191, "cut too deep", "ts", "start", room=108, name=n)
    svg(214, b, "Peeling an onion: cut off the stem, cut off the root just deep enough to take out the core, slit about two layers along the side and peel. A shallow cut gives rings when it is sliced. A deep cut gives strings.", n)


def pic_thick():
    n = "thick"
    base, full = 92, 36           # one tomato slice, drawn 36 units tall
    w, gap = (W - 16) / 3, 8
    b = ""
    cols = (("TOMATO", ["3/16 inch", "same for celery"]), ("ONION", ["half as thick:", "2 onion = 1 tomato"]), ("LETTUCE", ["two thirds of", "a tomato slice"]))
    for i, (head, cap) in enumerate(cols):
        x = i * (w + gap)
        b += box(x, 6, w, 150)
        cx = x + w / 2
        b += text(cx, 26, head, "t1", room=w - 6, name=n)
        sx, sw = cx - 34, 68
        if i == 0:
            b += fx(sx, base - full, sw, full, TOMATO, 5, "#A83A30")
        else:
            b += f'<rect x="{f(sx)}" y="{base - full}" width="{sw}" height="{full}" rx="5" class="ghost"/>'
        if i == 1:
            b += fx(sx, base - full / 2 + 1, sw, full / 2 - 1, ONION, 4, ONION_LN) + fx(sx, base - full, sw, full / 2 - 1, ONION, 4, ONION_LN)
        if i == 2:
            b += fx(sx, base - full * 2 / 3, sw, full * 2 / 3, LETTUCE, 4, LETTUCE_LN)
        b += path(f"M{f(sx - 6)} {base + 4} H{f(sx + sw + 6)}", "lnm")
        b += lines(cx, 116, cap, "ts", room=w - 4, name=n)
    svg(162, b, "Thickness guide. A tomato slice is three sixteenths of an inch, and celery is the same. An onion slice is half of that: two onion slices stack up to one tomato slice. Lettuce is two thirds of a tomato slice.", n)


def pan_side(x, y, w, depth, fill, label_in=None):
    s = f'<path d="M{f(x)} {f(y)} H{f(x + w)} L{f(x + w - 5)} {f(y + depth)} H{f(x + 5)} Z" class="ln"/>'
    s += f'<path d="M{f(x + 3)} {f(y + 5)} H{f(x + w - 3)} L{f(x + w - 7)} {f(y + depth - 2.5)} H{f(x + 7)} Z" fill="{fill}"/>'
    return s


def pic_pans():
    n = "pans"
    w, gap = (W - 16) / 3, 8
    b = ""
    for i, (deep, count, d) in enumerate((("2.5 inch deep", "2", 22), ("4 inch deep", "4", 35), ("6 inch deep", "6", 52))):
        x = i * (w + gap)
        b += box(x, 6, w, 128)
        b += pan_side(x + 16, 20, w - 32, d, ONION)
        b += text(x + w / 2, 92, deep, "ts", room=w - 6, name=n)
        b += text(x + w / 2, 116, "about " + count, "mid", room=w - 6, name=n)
    svg(140, b, "Third pans of sliced onions. A two and a half inch deep pan holds about 2 onions, a four inch pan about 4, a six inch pan about 6.", n)


def pic_bop():
    n = "bop"
    w, gap = (W - 16) / 3, 8
    b = ""
    heads = (("1  BOP", ["core side down,", "on a hard surface"]), ("2  TWIST", ["and pull: only", "the core comes out"]), ("3  STORE", ["core side down,", "lid not sealed"]))
    for i, (head, cap) in enumerate(heads):
        x = i * (w + gap)
        b += box(x, 6, w, 150)
        cx = x + w / 2
        b += text(cx, 26, head, "t1", room=w - 6, name=n)
        b += lines(cx, 128, cap, "ts", room=w - 2, name=n)
        if i == 0:
            b += lettuce_icon(cx, 68, 24) + fx(cx - 7, 88, 14, 9, "#EEF3D8", 2, LETTUCE_LN)
            b += path(f"M{f(cx - 40)} 99 H{f(cx + 40)}", "ln")
            b += red(f"M{f(cx + 36)} 44 V74")
            b += path(f"M{f(cx - 34)} 92 l-7 -5 M{f(cx - 31)} 86 l-5 -8 M{f(cx + 34)} 92 l7 -5", "tick")
        elif i == 1:
            b += lettuce_icon(cx, 60, 24) + circ(cx, 80, 6, "#7FAE68")
            b += fx(cx - 7, 96, 14, 11, "#EEF3D8", 2, LETTUCE_LN)
            b += red(f"M{f(cx + 16)} 84 Q{f(cx + 26)} 96 {f(cx + 12)} 104")
        else:
            b += f'<path d="M{f(cx - 40)} 52 V100 H{f(cx + 40)} V52" class="ln"/>'
            b += lettuce_icon(cx - 19, 80, 16) + lettuce_icon(cx + 19, 80, 16)
            b += fx(cx - 44, 40, 88, 6, STEEL, 2, STEEL_LN)
            b += path(f"M{f(cx - 52)} 50 h8 M{f(cx + 44)} 50 h8", "tick")
    svg(162, b, "Bopping lettuce: hit the head core side down on a sanitized hard surface, twist and pull out only the core, then store the rinsed heads core side down in a container with the lid resting on top, not sealed.", n)


def pic_lettuce_half():
    n = "lettuce-half"
    b = box(0, 6, 164, 104) + box(176, 6, 164, 104)
    # left: stop with half an inch left
    b += path("M16 84 H148", "ln")
    b += fx(42, 76, 80, 8, LETTUCE, 2, LETTUCE_LN)
    b += f'<path d="M42 76 Q42 34 82 34 Q122 34 122 76" fill="none" stroke="{LETTUCE_LN}" stroke-width="1.4" stroke-dasharray="4 3"/>'
    b += text(82, 26, "STOP AT ½ INCH", "t1", room=158, name=n)
    b += text(82, 101, "deck all the way back", "ts", room=158, name=n)
    # right: the next heads go on top of it
    b += path("M192 84 H324", "ln")
    b += fx(218, 76, 80, 8, LETTUCE, 2, LETTUCE_LN)
    b += f'<path d="M218 76 Q218 36 258 36 Q298 36 298 76 Z" fill="{LETTUCE}" stroke="{LETTUCE_LN}" stroke-width="1.4"/>'
    b += red("M258 12 V28")
    b += text(258, 101, "next 2 heads go on top", "ts", room=158, name=n)
    svg(116, b, "Slice the lettuce down until about half an inch is left, then set the next two heads core side down on top of what is left and keep slicing.", n)


def pic_lettuce_pans():
    tiles([("HALF PAN", "4 heads", ["enough for", "20 giants"], ""), ("LARGE CAMBRO", "30 heads", ["enough for", "150 subs"], ""), ("BREAK IT", "4 times", ["by hand,", "2 per head"], "okb")],
          "lettuce-pans", "A half pan holds about 4 sliced heads of lettuce, enough for 20 giant subs. A large white Cambro bin holds 30, enough for 150 subs. Sliced lettuce is broken by hand 4 times, 2 per head.", h=96)


def pic_tomato():
    n = "tomato"
    b = tomato_icon(W / 2, 30, 20)
    b += box(8, 62, 150, 34) + box(182, 62, 150, 34)
    b += text(83, 84, "DEEP RED?", "t1", room=144, name=n) + text(257, 84, "GIVES A LITTLE?", "t1", room=146, name=n)
    b += arr(f"M{f(W / 2 - 22)} 40 L96 58") + arr(f"M{f(W / 2 + 22)} 40 L244 58")
    b += box(8, 122, 150, 76, "okb") + box(182, 122, 150, 76, "warnb")
    b += arr("M83 98 V116") + arr("M257 98 V116")
    b += text(83, 142, "BOTH: RIPE", "t1", room=144, name=n) + lines(83, 160, ["walk-in, rinse,", "slice tomorrow"], "t2", room=144, name=n)
    b += text(257, 142, "ONLY ONE: UNRIPE", "t1", room=146, name=n) + lines(257, 160, ["one more day. Mark the", "case P, and date it"], "t2", room=146, name=n)
    svg(204, b, "Sorting tomatoes. A ripe tomato is deep red and gives to the touch. With both, it goes in the ripe case. With only one, it goes in the unripe case for another day, marked P for pink and dated.", n)


def pic_celery():
    n = "celery"
    b = ""
    y0, y1 = 42, 108
    for i in range(5):
        y = y0 + i * 14
        b += fx(40, y, 250, 11, "#A9D08A", 5, "#6E9B55")
    b += f'<path d="M40 {y0 - 2} Q22 {(y0 + y1) / 2} 40 {y1 + 2} Z" fill="#DCEBC6" stroke="#6E9B55" stroke-width="1.2"/>'          # the core end
    b += path(f"M276 {y0 - 8} V{y1 + 8}", "dash") + path(f"M84 {y0 - 8} V{y1 + 8}", "dash")
    b += path(f"M30 {(y0 + y1) / 2 + 1} H296", "lnm")
    b += text(16, (y0 + y1) / 2 + 4, "core", "ts", "middle", room=30, name=n)
    b += red(f"M96 {y0 - 16} H236")
    b += text(166, y0 - 23, "rinse this way, away from the core", "ts", room=230, name=n)
    b += text(62, y1 + 24, "last 2 inches:", "ts", room=110, name=n) + text(62, y1 + 37, "not sliced", "ts", room=110, name=n)
    b += text(180, y1 + 24, "split down the middle,", "ts", room=130, name=n) + text(180, y1 + 37, "one split at a time", "ts", room=130, name=n)
    b += text(290, y1 + 24, "top ½ inch:", "ts", room=96, name=n) + text(290, y1 + 37, "cut off", "ts", room=96, name=n)
    svg(154, b, "A bunch of celery. Half an inch comes off the tops. The bunch is split in half at the core and rinsed away from the core. One split is sliced at a time, and the last 2 inches of each split are not sliced.", n)


def pic_tuna():
    n = "tuna"
    w, gap = (W - 4 * 6) / 5, 6
    b = ""
    data = (("2", ["pouches", "albacore"]), ("2", ["pouches", "light"]), ("1 oz", ["black", "pepper"]), ("30 oz", ["sliced", "celery"]), ("¾ gal", ["mayo", "(84 oz)"]))
    for i, (val, cap) in enumerate(data):
        x = i * (w + gap)
        b += box(x, 6, w, 70, "" if i < 2 else "warnb")
        b += text(x + w / 2, 32, val, "mid", room=w - 2, name=n)
        b += lines(x + w / 2, 50, cap, "ts", room=w, name=n)
    y = 104
    xs = [(0, "TUNA"), (1, "PEPPER"), (2, "CELERY"), (3, "MAYO")]
    cw, g2 = (W - 3 * 20) / 4, 20
    for i, t in xs:
        x = i * (cw + g2)
        b += box(x, y, cw, 30)
        b += text(x + cw / 2, y + 20, t, "t1", room=cw - 4, name=n)
        if i < 3: b += arr(f"M{f(x + cw + 3)} {y + 15} H{f(x + cw + g2 - 6)}")
    b += text(W / 2, y - 8, "Mix each one all the way in before the next:", "ts", room=W, name=n)
    svg(142, b, "A batch of tuna: 2 pouches of albacore, 2 pouches of light tuna, 1 weighed ounce of black pepper, 30 ounces of sliced celery, three quarters of a gallon of mayo. Mix in order: the tuna, then pepper, then celery, then mayo.", n)


def log(x, y, w, h, fill, ln):
    return fx(x, y, w, h, fill, h / 2, ln, 1.4)


def pic_meats():
    n = "meats"
    w, gap = (W - 16) / 3, 8
    b = ""
    heads = (("CUT IN HALF", ["slit the length,", "then peel"]), ("NOT IN HALF", ["prosciuttini: the", "wrap is cut at the", "top or the side"]), ("AN X", ["turkey: on the", "bottom, not deep"]))
    for i, (head, cap) in enumerate(heads):
        x = i * (w + gap)
        b += box(x, 6, w, 142)
        cx = x + w / 2
        b += text(cx, 26, head, "t1", room=w - 6, name=n)
        b += lines(cx, 108, cap, "ts", room=w - 2, name=n)
        if i == 0:
            b += log(cx - 40, 46, 80, 30, HAM, "#B36B73")
            b += path(f"M{f(cx)} 38 V84", "dash") + path(f"M{f(cx - 32)} 61 H{f(cx - 6)} M{f(cx + 6)} 61 H{f(cx + 32)}", "lnm")
        elif i == 1:
            b += log(cx - 40, 46, 80, 30, "#E59CA6", "#3A1A20")
            b += path(f"M{f(cx - 30)} 44 H{f(cx + 30)}", "dash")
        else:
            b += ell(cx, 60, 34, 24, TURKEY, "#A08A72", 1.4)
            b += path(f"M{f(cx - 9)} 62 l18 16 M{f(cx + 9)} 62 l-18 16", "dash")
    svg(154, b, "Opening meats and cheeses. Most are cut in half, slit along the length and peeled. Prosciuttini is not cut in half: the wrapper is cut at the top or side. Turkey gets a shallow X cut on the bottom.", n)


def pic_chart():
    n = "chart"
    b = ""
    def row(y, cells, ops, res_cls):
        s = ""
        cw = 66
        xs = [0, 90, 180, 274]
        for k, (head, val) in enumerate(cells):
            x = xs[k]
            s += box(x, y, cw, 50, res_cls if k == 3 else "")
            s += text(x + cw / 2, y + 17, head, "ts", room=cw - 2, name=n)
            s += text(x + cw / 2, y + 40, val, "mid", room=cw - 4, name=n)
            if k < 3:
                s += text((x + cw + xs[k + 1]) / 2, y + 32, ops[k], "mid", room=24, name=n)
        return s
    b += row(6, (("ON HAND", "½"), ("AM PREP", "4"), ("PM PREP", "1"), ("TOTAL", "5½")), ("+", "+", "="), "warnb")
    b += row(74, (("TOTAL", "5½"), ("WASTE", "0"), ("LEFT", "½"), ("USAGE", "5")), ("−", "−", "="), "okb")
    b += arr("M213 126 V146")
    b += text(W / 2, 162, "Tonight's LEFT is tomorrow's ON HAND.", "t2", room=W, name=n)
    b += text(W / 2, 180, "The video's example: pans of lettuce.", "ts", room=W, name=n)
    svg(188, b, "The Production Pro chart math, with the video's lettuce example. On hand one half, plus morning prep 4, plus evening prep 1, equals total 5 and a half. Total 5 and a half, minus waste 0, minus left one half, equals usage 5. What is left tonight is on hand tomorrow.", n)


# ================================================================ FOOD SAFETY
def pic_cool():
    n = "cool"
    b = box(0, 6, W, 122)
    b += path("M12 46 H104 V78 H222 V110 H328", "ln")
    b += text(16, 38, "135°F", "mid", "start", room=84, name=n)
    b += text(110, 70, "70°F", "mid", "start", room=60, name=n)
    b += text(228, 102, "41°F", "mid", "start", room=60, name=n)
    b += text(190, 70, "in 2 hours", "tk", room=66, name=n)
    b += text(300, 102, "+ 4 hours", "tk", room=60, name=n)
    b += text(58, 98, "COOLING", "t1", room=90, name=n) + text(58, 114, "6 hours in all", "ts", room=92, name=n)
    w, gap = (W - 16) / 3, 8
    data = (("HEAT", "165°F", ["for 15 seconds:", "meatballs, sauce,", "soups"], "warnb"), ("HOLD HOT", "135°F", ["or higher, in", "the steam table"], "warnb"), ("HOLD COLD", "41°F", ["or below"], "okb"))
    y = 136
    for i, (head, val, cap, cls) in enumerate(data):
        x = i * (w + gap)
        b += box(x, y, w, 100, cls)
        b += text(x + w / 2, y + 19, head, "t1", room=w - 6, name=n)
        b += text(x + w / 2, y + 45, val, "big", room=w - 6, name=n)
        b += lines(x + w / 2, y + 62, cap, "ts", room=w - 2, name=n, lh=13)
    svg(242, b, "Cooling hot food: from 135 degrees down to 70 within 2 hours, then from 70 down to 41 within 4 more hours, 6 hours in all. Heat meatballs, tomato sauce and soups to 165 degrees for 15 seconds. Hold hot food at 135 or higher and cold food at 41 or below.", n)


# ================================================================ BREAD
def pic_bread_day():
    flow([("PAN", "after 7 p.m."), ("THAW", "walk-in, overnight"), ("PROOF", "100°F, 50 to 70 min"), ("SCORE", "white only"), ("BAKE", "350°F, 14 to 16 min"), ("COOL", "bottom rungs"), ("STACK", "3 rows at most")],
         "bread-day", "The bread day, in order: pan the frozen loaves after 7 p.m., thaw in the walk-in overnight, proof at 100 degrees for 50 to 70 minutes, score the white loaves, bake at 350 degrees for 14 to 16 minutes, cool on the bottom rungs, stack no more than 3 rows high.",
         cols=2, ch=46, gapx=18, gapy=16)


def pic_pan():
    n = "pan"
    b = box(0, 6, W, 112)
    # one channel of the bread form, seen from its end
    cx = 92
    b += f'<path d="M{cx - 62} 46 Q{cx - 62} 92 {cx} 92 Q{cx + 62} 92 {cx + 62} 46" class="ln"/>'
    b += ell(cx, 60, 44, 22, BREAD, BREAD_LN, 1.4)
    for dx in (-36, -24, -12, 0, 12, 24, 36):
        b += circ(cx + dx, 86 - abs(dx) * .12, 1.7, "#C9962E")
    b += f'<path d="M{cx - 20} 76 q6 5 12 0 M{cx - 4} 78 q6 5 12 0 M{cx + 12} 76 q6 5 12 0" fill="none" stroke="{BREAD_LN}" stroke-width="1.3" stroke-linecap="round"/>'
    b += text(cx, 26, "ONE CHANNEL, END VIEW", "t1", room=176, name=n)
    b += text(cx, 110, "rib side down", "ts", room=160, name=n)
    x = 192
    b += text(x, 46, "2 OZ OF CORNMEAL", "t1", "start", room=140, name=n)
    b += text(x, 62, "evenly, in the channels", "ts", "start", room=140, name=n)
    b += text(x, 84, "Too much blocks the heat.", "ts", "start", room=142, name=n)
    b += text(x, 98, "Too little burns it.", "ts", "start", room=142, name=n)
    svg(124, b, "One channel of the bread form seen from its end: a frozen loaf rib side down on a little cornmeal. Two ounces of cornmeal go evenly in the channels. Too much blocks the heat, too little burns the bread.", n)


def pic_proofer():
    n = "proofer"
    b = box(0, 6, 150, 190)
    b += text(75, 26, "PROOFER", "t1", room=140, name=n)
    for i in range(10):
        y = 40 + i * 15
        b += fx(18, y, 114, 9, BREAD if i < 5 else BREAD_HI, 4, BREAD_LN, 1)
    b += path("M140 40 V109", "red") + path("M140 115 V184", "lnm")
    x = 164
    b += disc(x + 9, 52, 1) + text(x + 24, 57, "TOP 5 RUNGS", "t1", "start", room=150, name=n) + text(x + 24, 73, "first 5 trays, 25 minutes", "ts", "start", room=152, name=n)
    b += disc(x + 9, 104, 2) + text(x + 24, 109, "5 MORE BELOW", "t1", "start", room=150, name=n) + text(x + 24, 125, "another 25 minutes", "ts", "start", room=152, name=n)
    b += box(x, 138, 176, 58, "warnb")
    b += text(x + 88, 157, "PROOFER AT 100°F", "t1", room=172, name=n)
    b += text(x + 88, 173, "85 to 95% humidity,", "ts", room=170, name=n) + text(x + 88, 187, "setting 4 to 5. Oven at 350°F", "ts", room=172, name=n)
    svg(202, b, "The proofer. The first 5 trays go in the top 5 rungs for 25 minutes, then 5 more go below them for another 25. The proofer runs at 100 degrees and 85 to 95 percent humidity, usually setting 4 to 5.", n)


def loaf_top(x, y, w, h, fill=BREAD):
    return fx(x, y, w, h, fill, h / 2, BREAD_LN, 1.4) + fx(x + 12, y + 4, w - 24, h * .22, BREAD_HI, h * .11, None, op=.55)


def pic_score():
    n = "score"
    b = box(0, 6, W, 96)
    b += text(W / 2, 26, "WHITE AND MINIS: SCORE DOWN THE CENTER", "t1", room=W - 8, name=n)
    b += loaf_top(30, 40, 280, 30)
    b += path("M72 55 H268", "dash")
    b += path("M30 78 V88 M72 78 V88 M268 78 V88 M310 78 V88 M30 83 H72 M268 83 H310", "lnm")
    b += text(51, 99, "1.5 in", "ts", room=48, name=n) + text(289, 99, "1.5 in", "ts", room=48, name=n)
    b += text(W / 2, 99, "1/16 inch deep", "ts", room=160, name=n)
    b += box(0, 110, 164, 70) + box(176, 110, 164, 70)
    b += text(82, 130, "WHEAT: NO SCORE", "t1", room=158, name=n)
    b += loaf_top(22, 142, 120, 24, "#B98450")
    b += text(258, 130, "PYRAMID", "t1", room=158, name=n)
    for r, cnt in enumerate((8, 7, 6)):
        for k in range(cnt):
            b += circ(258 - (cnt - 1) * 8.5 + k * 17, 168 - r * 13.5, 7.2, BREAD, BREAD_LN, 1)
    svg(186, b, "Scoring bread. White loaves and minis get one score down the center, one sixteenth of an inch deep, stopping an inch and a half from each end. Wheat is not scored. Cooled bread is stacked in a pyramid no more than 3 rows high.", n)


# ================================================================ GRILL
def pic_pocket():
    n = "pocket"
    b = box(0, 6, 196, 116) + box(206, 6, 134, 116)
    b += text(98, 26, "FROM ABOVE", "t1", room=186, name=n)
    b += loaf_top(16, 44, 164, 34)
    b += path("M40 72 H156", "dash")
    b += text(98, 96, "cut along the front,", "ts", room=186, name=n) + text(98, 109, "stopping short of both ends", "ts", room=188, name=n)
    cx = 273
    b += text(cx, 26, "FROM THE END", "t1", room=126, name=n)
    b += f'<path d="M{cx - 34} 82 V62 Q{cx - 34} 40 {cx} 40 Q{cx + 34} 40 {cx + 34} 62 V82 Z" fill="{BREAD}" stroke="{BREAD_LN}" stroke-width="1.4"/>'
    b += path(f"M{cx - 34} 70 L{cx + 16} 58", "dash")
    b += text(cx, 99, "angled in, not all", "ts", room=128, name=n) + text(cx, 112, "the way through", "ts", room=128, name=n)
    svg(128, b, "Hot sub bread is cut into a pocket. From above, the cut runs along the front of the loaf and stops short of both ends. From the end, the knife angles into the bread and does not go all the way through.", n)


def pic_breaks():
    flow([("BREAK 4", "the meat alone"), ("GATHER", "into a pile"), ("BREAK 4", "more"), ("ADD", "onions, peppers"), ("BREAK 8", "more: 16 in all"), ("CHEESE", "on top, slit it")],
         "breaks", "Breaking the meat on the grill: break it 4 times, gather it into a pile, break it 4 more, put the onions and peppers on top, break it 8 more for 16 in all, then put the cheese on top with a few slits.", cols=3, ch=46, gapx=18, gapy=16)


def pic_meat2():
    n = "meat2"
    b = box(0, 6, 164, 140) + box(176, 6, 164, 140)
    for i, (head, color, tools, rows) in enumerate((("STEAK", "#C8102E", "RED TOOLS", ["thawed to about 40°F,", "still slightly frozen", "flip, then a light salt"]), ("CHICKEN", "#E3B23C", "YELLOW TOOLS", ["goes on frozen,", "takes a little longer", "cooked through, not dry"]))):
        x = i * 176
        cx = x + 82
        b += text(cx, 28, head, "t1", room=158, name=n)
        # tongs: two arms and a coloured handle
        b += f'<path d="M{cx - 30} 62 L{cx + 6} 50 M{cx - 30} 62 L{cx + 6} 74" fill="none" stroke="{STEEL_LN}" stroke-width="3" stroke-linecap="round"/>'
        b += f'<path d="M{cx - 44} 62 H{cx - 26}" fill="none" stroke="{color}" stroke-width="9" stroke-linecap="round"/>'
        b += fx(cx + 12, 48, 30, 28, STEAK if i == 0 else CHICKEN, 6, "#3A2A12" if i else "#2A1510", 1.2)
        b += text(cx, 94, tools, "tk", room=158, name=n)
        b += lines(cx, 110, rows, "ts", room=160, name=n, lh=13)
    svg(152, b, "Steak is handled with the red tools and comes thawed to about 40 degrees, still slightly frozen. Chicken is handled with the yellow tools and goes on the grill frozen, so it takes a little longer.", n)


def pic_hotwrap():
    n = "hotwrap"
    b = box(0, 6, 164, 104) + box(176, 6, 164, 104)
    b += text(82, 26, "REGULAR", "t1", room=158, name=n) + loaf_top(34, 40, 96, 26)
    b += text(82, 86, "not cut", "tk", room=158, name=n) + text(82, 101, "15 inches of hot sub wrap", "ts", room=160, name=n)
    b += text(258, 26, "GIANT", "t1", room=158, name=n) + loaf_top(188, 40, 68, 26) + loaf_top(260, 40, 68, 26)
    b += text(258, 86, "cut in half", "tk", room=158, name=n) + text(258, 101, "21 inches of hot sub wrap", "ts", room=160, name=n)
    b += text(W / 2, 126, "Stand it on its side. Wrap it loosely. Never squeeze.", "ts", room=W, name=n)
    svg(134, b, "Wrapping hot subs. A regular is not cut and takes 15 inches of hot sub wrap. A giant is cut in half and takes 21 inches. The sub stands on its side and is wrapped loosely.", n)


def pic_bacon():
    n = "bacon"
    b = fx(0, 30, 255, 34, BACON, 8) + fx(255, 30, 85, 34, "#C7783F", 8)
    b += fx(240, 30, 30, 34, BACON, 0) + fx(255, 30, 20, 34, "#C7783F", 0)
    b += text(127, 52, "LEAVE IT ALONE", "lt", room=240, name=n) + text(297, 52, "FINISH", "lt", room=80, name=n)
    b += path("M255 22 V72", "ln") + text(255, 16, "FLIP ONCE", "t1", room=110, name=n)
    b += text(127, 84, "about 75% done when it", "ts", room=250, name=n) + text(127, 97, "lets go of the grill", "ts", room=250, name=n)
    b += text(297, 84, "last 25%, to", "ts", room=86, name=n) + text(297, 97, "golden brown", "ts", room=86, name=n)
    svg(106, b, "Cooking bacon at 350 degrees. Leave it alone until it lets go of the grill, about 75 percent done. Flip it once, then finish the last 25 percent to golden brown.", n)


def pic_defrost():
    n = "defrost"
    b = box(0, 6, 164, 150) + box(176, 6, 164, 150)
    b += text(82, 26, "BEEF: THAW IT", "t1", room=158, name=n)
    # a deep pan with a grate, the steaks standing up
    b += '<path d="M24 42 H140 L134 96 H30 Z" class="ln"/>' + path("M32 88 H132", "lnm")
    for i in range(9):
        b += fx(38 + i * 10.4, 50, 7.4, 37, STEAK, 2, "#2A1510", 1)
    b += lines(82, 114, ["panned 2 to 4 p.m. the day", "before, standing up.", "Ready at about 40°F"], "ts", room=162, name=n, lh=13)
    b += text(258, 26, "CHICKEN: FROZEN", "t1", room=160, name=n)
    for i in range(5):
        b += fx(200 + i * 24, 52, 20, 30, CHICKEN, 4, "#8A6B3A", 1)
    b += f'<path d="M200 46 l4 -6 l4 6 M224 46 l4 -6 l4 6 M248 46 l4 -6 l4 6 M272 46 l4 -6 l4 6 M296 46 l4 -6 l4 6" fill="none" stroke="#5B8FCB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
    b += lines(258, 100, ["pulled from the freezer", "as needed. 4 to 6 at a time", "in the sandwich unit.", "Left at close: thrown out"], "ts", room=164, name=n, lh=13)
    svg(162, b, "Beef steaks are thawed: panned standing up between 2 and 4 p.m. the day before, and ready at about 40 degrees. Chicken steaks stay frozen: pulled from the freezer as needed, 4 to 6 at a time in the sandwich unit, and thrown out if left at close.", n)


# ================================================================ SLICER
def pic_breadcut():
    n = "breadcut"
    b = text(8, 18, "GUEST SIDE", "t2", "start", room=120, name=n) + text(332, 18, "YOUR SIDE", "t2", "end", room=120, name=n)
    b += path("M8 112 H332", "ln")                                   # the counter
    b += f'<path d="M40 112 V86 Q40 62 70 62 H290 Q304 62 304 80 V112 Z" fill="{BREAD}" stroke="{BREAD_LN}" stroke-width="1.4"/>'
    b += path("M40 88 H304", "dash")                                 # the level cut
    b += red("M52 128 H150")
    b += text(101, 144, "start at the round end,", "ts", room=180, name=n) + text(101, 157, "saw toward yourself", "ts", room=180, name=n)
    # the hand that holds the loaf: palm flat, thumb and pinky lifted
    b += fx(150, 50, 84, 13, "#8FB6E6", 6, "#2C4770", 1.3)
    b += f'<path d="M150 54 l-12 -12 M234 54 l12 -12" fill="none" stroke="#2C4770" stroke-width="9" stroke-linecap="round"/><path d="M150 54 l-12 -12 M234 54 l12 -12" fill="none" stroke="#8FB6E6" stroke-width="6.4" stroke-linecap="round"/>'
    b += text(192, 34, "palm flat, thumb and pinky up", "ts", room=200, name=n)
    b += text(250, 144, "knife level, knuckles", "ts", room=160, name=n) + text(250, 157, "sliding on the counter", "ts", room=160, name=n)
    b += text(172, 104, "equal halves", "dk", room=120, name=n)
    svg(166, b, "Cutting bread for a cold sub, seen from the side. The free hand rests flat on top with the thumb and pinky lifted. The cut starts at the round end closest to the guest and saws level toward you, leaving equal halves. The knuckles of the knife hand slide on the counter.", n)


def foot(cx, cy, rot=0):
    return f'<g transform="rotate({rot} {f(cx)} {f(cy)})"><rect x="{f(cx - 9)}" y="{f(cy - 22)}" width="18" height="44" rx="9" class="shoe"/></g>'


def pic_stance():
    n = "stance"
    b = box(0, 6, 164, 150, "okb") + box(176, 6, 164, 150, "badb")
    for i, cx in enumerate((82, 258)):
        b += fx(cx - 50, 18, 100, 22, STEEL, 5, STEEL_LN) + text(cx, 33, "SLICER", "dk", room=96, name=n)
    b += foot(60, 96) + foot(104, 96)
    b += path("M60 126 V134 M104 126 V134 M60 130 H104", "lnm") + path("M34 42 V72 M30 42 H38 M30 72 H38", "lnm")
    b += text(86, 61, "a step back", "ts", room=90, name=n)
    b += text(82, 149, "shoulder width, parallel", "ts", room=160, name=n)
    b += foot(240, 74, 8) + foot(278, 104, -6)
    b += text(258, 141, "staggered and too close:", "ts", room=162, name=n) + text(258, 153, "you lean in and rock", "ts", room=162, name=n)
    svg(162, b, "Stance at the slicer, seen from above. Right: feet shoulder width apart and parallel, a small step back from the slicer. Wrong: feet staggered and too close, which makes you lean in and rock.", n)


def pic_pcf():
    n = "pcf"
    w, gap = (W - 16) / 3, 8
    b = ""
    data = (("1  PUSH", ["right hand,", "only the length", "of the product"]), ("2  CATCH", ["left hand, under", "the blade"]), ("3  FLIP", ["onto the sub as", "the right hand", "comes back"]))
    for i, (head, cap) in enumerate(data):
        x = i * (w + gap)
        b += box(x, 6, w, 126)
        cx = x + w / 2
        b += text(cx, 26, head, "t1", room=w - 6, name=n)
        b += lines(cx, 92, cap, "ts", room=w + 2, name=n)
        if i == 0:
            b += fx(cx - 30, 44, 34, 20, HAM, 4, "#B36B73") + red(f"M{f(cx - 34)} 74 H{f(cx + 30)}")
        elif i == 1:
            b += path(f"M{f(cx - 34)} 46 H{f(cx + 34)}", "ln") + fx(cx - 16, 49, 32, 4, HAM, 2, "#B36B73")
            b += fx(cx - 26, 62, 52, 11, "#8FB6E6", 5, "#2C4770", 1.2)
        else:
            b += red(f"M{f(cx - 28)} 70 Q{f(cx)} 30 {f(cx + 26)} 62") + fx(cx + 6, 66, 40, 9, BREAD, 4, BREAD_LN)
    svg(138, b, "Push, catch, flip. The right hand pushes only as far as the product is long. The left hand catches under the blade. The slice is flipped onto the sub while the right hand comes back. The right hand never stops.", n)


def pic_strokes():
    n = "strokes"
    b = box(0, 6, 164, 84) + box(176, 6, 164, 84)
    b += text(82, 26, "HAM: LONG", "t1", room=158, name=n)
    b += fx(22, 38, 120, 20, HAM, 6, "#B36B73") + f'<path d="M22 70 H142" class="red"/><path d="M142 70 H26" class="red"/>'
    b += text(258, 26, "PEPPERONI: SHORT", "t1", room=158, name=n)
    b += fx(232, 38, 52, 20, "#C4452C", 10, "#7A2416") + f'<path d="M232 70 H284" class="red"/><path d="M284 70 H236" class="red"/>'
    svg(96, b, "The pusher deck travels only the length of the product: long strokes for ham, short quick strokes for pepperoni.", n)


def pic_hands():
    n = "hands"
    b = box(0, 6, 164, 134) + box(176, 6, 164, 134)
    b += text(82, 28, "RIGHT HAND", "t1", room=158, name=n)
    b += lines(82, 48, ["holds the product", "brings the guard down", "thumb behind pusher deck", "fingers on top of the guard", "slides it out to the left"], "ts", room=164, name=n, lh=17)
    b += text(258, 28, "LEFT HAND", "t1", room=158, name=n)
    b += lines(258, 48, ["guides the product in", "sets the dial", "catches under the blade", "takes it from the right", "never reaches in"], "ts", room=164, name=n, lh=17)
    svg(146, b, "What each hand does at the slicer. The right hand holds the product, brings the guard down, keeps its thumb behind the pusher deck and its fingers on the guard, and slides product out. The left hand guides, sets the dial, catches under the blade, and never reaches in.", n)


def slices(cx, y, cnt, fill, ln, w=62):
    s = ""
    for i in range(cnt):
        s += fx(cx - w / 2, y - i * 5.2, w, 4, fill, 2, ln, .9)
    return s


def pic_thickcheck():
    n = "thickcheck"
    b = box(0, 6, 164, 132, "warnb") + box(176, 6, 164, 132, "warnb")
    b += text(82, 26, "CHEESE: PROVOLONE", "t1", room=158, name=n)
    b += slices(82, 66, 5, CHEESE, "#B8A560") + path("M40 74 H124", "ln")
    b += text(82, 102, "2 oz", "big", room=150, name=n) + text(82, 122, "5 slices", "tk", room=150, name=n)
    b += text(258, 26, "MEAT: BOILED HAM", "t1", room=158, name=n)
    b += slices(258, 66, 8, HAM, "#B36B73") + path("M216 74 H300", "ln")
    b += text(258, 102, "4.75 oz", "big", room=150, name=n) + text(258, 122, "8 slices", "tk", room=150, name=n)
    svg(144, b, "Setting slice thickness every morning. Five slices of provolone should weigh 2 ounces, which sets the cheeses. Eight slices of boiled ham should weigh 4.75 ounces, which sets the meats.", n)


def pic_families():
    n = "families"
    b = box(0, 6, 164, 154) + box(176, 6, 164, 154)
    b += text(82, 26, "CATCH AND FLIP", "t1", room=158, name=n) + text(82, 42, "lands flat on four fingers", "ts", room=160, name=n)
    left = (("Provolone", CHEESE), ("Swiss", "#F6EDC7"), ("Cappacuolo", "#9E2F38"), ("Salami", "#AD3A44"), ("Pepperoni", "#C4452C"))
    for i, (name, col) in enumerate(left):
        y = 62 + i * 20
        b += circ(26, y - 4, 7.5, col, "rgba(0,0,0,.28)", 1) + text(42, y, name, "tk", "start", room=110, name=n)
    b += text(258, 26, "CATCH, FLOWER, FLIP", "t1", room=160, name=n) + text(258, 42, "gathered on the fingertips", "ts", room=160, name=n)
    right = (("Ham", HAM), ("Prosciuttini", "#E59CA6"), ("Turkey", TURKEY), ("Roast beef", "#7E4538"))
    for i, (name, col) in enumerate(right):
        y = 62 + i * 20
        b += circ(202, y - 4, 7.5, col, "rgba(0,0,0,.28)", 1) + text(218, y, name, "tk", "start", room=110, name=n)
    b += text(258, 150, "build the sub up, not out", "ts", room=160, name=n)
    svg(166, b, "Two families of sliced product. Catch and flip: provolone, Swiss, cappacuolo, salami and pepperoni land flat on four fingers. Catch, flower, flip: ham, prosciuttini, turkey and roast beef are gathered on the fingertips so the sub builds up, not out.", n)


def band(x, y, w, h, fill, n_, label_, ink=INK):
    s = fx(x, y, w, h, fill, 5)
    s += circ(x + 13, y + h / 2, 8, "#FFFFFF", "rgba(27,43,68,.3)", .9) + f'<text x="{f(x + 13)}" y="{f(y + h / 2 + 3.8)}" text-anchor="middle" style="font:800 10.5px Barlow,Arial,sans-serif;fill:#1B2B44">{n_}</text>'
    s += f'<text x="{f(x + 28)}" y="{f(y + h / 2 + 4.2)}" style="font:700 12px Barlow,Arial,sans-serif;fill:{ink}">{label_}</text>'
    return s


def pic_five():
    n = "five"
    b = box(0, 6, 190, 142) + box(200, 6, 140, 142)
    b += text(95, 26, "THE #5, IN ORDER", "t1", room=184, name=n)
    x, w = 11, 168
    b += fx(x - 4, 128, w + 8, 12, BREAD, 6)
    rows = (("Provolone", CHEESE, INK), ("Ham", HAM, "#4A1F25"), ("Prosciuttini", "#E59CA6", "#3A1A20"), ("Cappacuolo", "#9E2F38", "#FFF4EC"))
    for i, (name, col, ink) in enumerate(rows):
        b += band(x, 104 - i * 24, w, 22, col, i + 1, name, ink)
    cx = 270
    b += text(cx, 26, "THE #7", "t1", room=126, name=n)
    b += fx(cx - 52, 128, 104, 12, BREAD, 6)
    b += band(cx - 48, 104, 96, 22, CHEESE, 1, "Provolone")
    for k in range(2):
        for j in range(5):
            b += fx(cx - 46 + j * 19, 82 - k * 20, 16, 16, TURKEY, 4, "#A08A72", 1)
    b += text(cx, 41, "about 10 turkey slices,", "ts", room=132, name=n) + text(cx, 54, "in 2 layers of 5", "ts", room=130, name=n)
    svg(154, b, "Slicing in sequence. The number 5 goes provolone, ham, prosciuttini, cappacuolo, in the order the slice guide lists them. The number 7 is provolone, then about 10 slices of turkey in 2 layers of about 5.", n)


def pic_weigh():
    flow([("PAPER", "on the scale"), ("TARE", "zero it"), ("BREAD", "bottom half on"), ("TARE", "zero it again"), ("SLICE", "like any sub"), ("WEIGH", "the whole sub")],
         "weigh", "Weighing a sub: paper on the scale, tare, bottom of the bread on, tare again, slice the sub as normal, then put the whole sub on the scale.", cols=3, ch=46, gapx=18, gapy=16)


def pic_tub():
    n = "tub"
    w, gap = (W - 8) / 2, 8
    b = ""
    heads = ("1  LAY IT FLAT", "2  ROLL IT TIGHT", "3  CUT 5 TIMES", "4  INTO THE TUB")
    caps = (["cheese, flat meats,", "round meats diagonally"], ["neat and tight", ""], ["6 equal pieces", ""], ["2 cups of lettuce first,", "then the pieces on top"])
    for i in range(4):
        r, c = divmod(i, 2)
        x, y = c * (w + gap), 6 + r * 126
        b += box(x, y, w, 118)
        cx = x + w / 2
        b += text(cx, y + 20, heads[i], "t1", room=w - 6, name=n)
        b += lines(cx, y + 98, caps[i], "ts", room=w, name=n)
        if i == 0:
            b += fx(cx - 60, y + 32, 120, 46, PAPER, 3, PAPER_LN) + fx(cx - 52, y + 38, 104, 34, CHEESE, 3) + fx(cx - 46, y + 42, 92, 26, HAM, 3)
            for k in range(5):
                b += circ(cx - 34 + k * 17, y + 62 - k * 3.6, 8, "#AD3A44", "#6E1F27", 1)
        elif i == 1:
            b += fx(cx - 56, y + 42, 112, 26, HAM, 13, "#B36B73", 1.4) + f'<ellipse cx="{f(cx + 50)}" cy="{f(y + 55)}" rx="6" ry="13" fill="{CHEESE}" stroke="#B36B73" stroke-width="1.2"/>'
        elif i == 2:
            b += fx(cx - 60, y + 42, 120, 26, HAM, 13, "#B36B73", 1.4)
            for k in range(1, 6):
                b += path(f"M{f(cx - 60 + k * 20)} {y + 36} V{y + 74}", "dash")
        else:
            b += f'<path d="M{f(cx - 58)} {y + 34} H{f(cx + 58)} L{f(cx + 50)} {y + 80} H{f(cx - 50)} Z" class="ln"/>'
            b += fx(cx - 49, y + 68, 98, 10, LETTUCE, 3)
            for k in range(6):
                b += fx(cx - 46 + k * 15.6, y + 50, 13, 18, HAM, 5, "#B36B73", 1)
    svg(264, b, "Sub in a tub. Lay the cheese flat, the flat meats on it, and the round meats diagonally on top. Roll it neat and tight. Cut 5 times for 6 equal pieces. Put 2 souffle cups of lettuce in the bottom of the tub and the pieces on top.", n)


def pic_wipe():
    n = "wipe"
    b = ""
    rows = (("PUSHER DECK", "top to bottom", "v"), ("BLADE PLATE, ADJUSTABLE DECK", "front and top first, to the back", "h"), ("THE SIDE", "", ""), ("UNDERNEATH", "feed the towel through, front to back", "h"), ("THE BAY", "", ""))
    for i, (head, cap, d) in enumerate(rows):
        y = 6 + i * 40
        b += box(0, y, W, 34)
        b += disc(18, y + 17, i + 1)
        b += text(36, y + (15 if cap else 22), head, "t1", "start", room=250, name=n)
        if cap: b += text(36, y + 28, cap, "ts", "start", room=250, name=n)
        if d == "v": b += red(f"M312 {y + 6} V{y + 26}")
        if d == "h": b += red(f"M292 {y + 17} H326")
    svg(6 + 5 * 40, b, "Slicer wipe-down order: the pusher deck from top to bottom, the blade plate and adjustable deck from the front and top to the back, the side, underneath by feeding the towel through from front to back, and last the bay.", n)


def pic_clean():
    n = "clean"
    b = path("M34 34 H306", "ln")
    for i, (t, cap) in enumerate((("10:30", "after prep"), ("BY 2:30", "after lunch"), ("BY 6:30", "aim for 5 to 6"), ("CLOSE", ""))):
        x = 34 + i * 90.67
        b += f'<circle cx="{f(x)}" cy="34" r="7" class="disc"/>'
        b += text(x, 20, t, "t1", room=80, name=n)
        if cap: b += text(x, 56, cap, "ts", room=88, name=n)
    b += text(W / 2, 76, "Every 4 hours. Clean at 10:30 and it's due by 2:30.", "ts", room=W, name=n)
    w, gap = (W - 16) / 3, 8
    for i, (head, cap, cls) in enumerate((("1  WASH", "warm soapy water", "sink wash"), ("2  RINSE", "rinse water", "sink rinse"), ("3  SANITIZE", "warm sanitizer", "sink sani"))):
        x = i * (w + gap)
        b += box(x, 88, w, 48, cls)
        b += text(x + w / 2, 109, head, "t1", room=w - 6, name=n) + text(x + w / 2, 126, cap, "ts", room=w - 4, name=n)
    b += text(W / 2, 154, "Same steps three times, a fresh towel each pass. Then dry.", "ts", room=W, name=n)
    svg(162, b, "The slicer is fully cleaned every 4 hours. Cleaned at 10:30 after prep, it is due again by 2:30, after lunch, then by 6:30, and at close. Right before the dinner rush, between 5 and 6, is the time to aim for. Each clean is three passes: wash with warm soapy water, rinse, then sanitize.", n)


ALL = [pic_cash, pic_smile, pic_yields, pic_onion, pic_thick, pic_pans, pic_bop, pic_lettuce_half, pic_lettuce_pans, pic_tomato, pic_celery, pic_tuna,
       pic_meats, pic_chart, pic_cool, pic_bread_day, pic_pan, pic_proofer, pic_score, pic_pocket, pic_breaks, pic_meat2, pic_hotwrap, pic_bacon,
       pic_defrost, pic_breadcut, pic_stance, pic_pcf, pic_strokes, pic_hands, pic_thickcheck, pic_families, pic_five, pic_weigh, pic_tub, pic_wipe, pic_clean]

if __name__ == "__main__":
    for fn in ALL: fn()
    if TOO_WIDE:
        raise SystemExit("pics: labels too wide for their boxes:\n  " + "\n  ".join(TOO_WIDE))
    inc = ROOT / "src" / "include"; inc.mkdir(parents=True, exist_ok=True)
    for old in inc.glob("pic-*.html"): old.unlink()
    for name, html in PICS.items():
        (inc / f"pic-{name}.html").write_text(html, encoding="utf-8")
    print("pics", len(PICS), "bytes", sum(len(v) for v in PICS.values()))
