"""The how-to pictures: wrapping, cutting, bagging, and a #17 on the grill.

    python3 tools/howto.py

writes src/include/howto-{wrap,cut,bag,steak}.html, src/include/howto-defs.html, src/howto.css and proof/howto.html
(every picture as a still and frozen at four moments of its loop).

Wording follows the orientation videos' own words (transcripts pasted Nov 2 and Nov 4, 2026). Where a picture has to
choose something the transcript does not say (which end first, which hand is which, how the bag lies), the step text
stays with the transcript and the picture is one way of doing what the words say. The page says so above the pictures.
"""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from howto_lib import *

ROOT = pathlib.Path(__file__).resolve().parent.parent

TOP, RIGHT, BOT, LEFT = (160, 22), (248, 110), (160, 198), (72, 110)
DIAMOND = [TOP, RIGHT, BOT, LEFT]
FOLD_Y = 124                                             # the near edge of the sub: the first fold line
PENT = [TOP, RIGHT, (234, FOLD_Y), (86, FOLD_Y), LEFT]   # the sheet once the near corner is folded up
FLAP = [(86, FOLD_Y), (234, FOLD_Y), (160, 50)]          # that corner, lying over the sub
SUB = (92, 96, 228, 124)
KNIFE_STEEL, KNIFE_LN, KNIFE_GRIP = "#D3DAE2", "#6F7B88", "#2B2B2E"


def loop(body):
    """Everything that moves sits in here, so it can blink out while the loop restarts."""
    return g(body, cls="hw-loop")


def corner_dashes(cls=None):
    c = f' class="{cls}"' if cls else ""
    return (f'<path{c} d="M74 110 H90 M230 110 H246" stroke="{RED}" stroke-width="2.2" stroke-dasharray="3.5 3" stroke-linecap="round" fill="none"/>')


# =============================================================== wrapping
WRAP = []

# ---- start: tear one sheet
b = (f'<rect x="60" y="12" width="200" height="28" rx="14" fill="#F3F0E9" stroke="{PAPER_LN}" stroke-width="1.4"/>'
     f'<ellipse cx="60.5" cy="26" rx="6.5" ry="14" fill="#E2DCCF" stroke="{PAPER_LN}" stroke-width="1.4"/>'
     f'<ellipse cx="60.5" cy="26" rx="2.2" ry="5" fill="#B9B1A0"/>')
sheet = f'<rect x="100" y="39" width="120" height="112" fill="{PAPER}" stroke="{PAPER_LN}" stroke-width="1.4"/>'
mv = about(160, 39, sheet, "hw-mv-ab", "scale(1,.32)")
marks = label(160, 66, "logo side down", "middle", 11.5, MUTED, 600, halo=PAPER)
for yy, t in ((103, "12 in  mini"), (119, "15 in  regular")):
    marks += f'<line x1="104" y1="{yy}" x2="216" y2="{yy}" stroke="{PAPER_LN}" stroke-width="1.3" stroke-dasharray="4 3"/>'
    marks += label(108, yy - 4, t, "start", 11.5, INK, 700, halo=PAPER)
marks += label(108, 146, "21 in  giant", "start", 11.5, INK, 700, halo=PAPER)
mv += g(marks, cls="hw-on-b")
mv += hand(219, 141, rot=-62, s=.9, pose="curl", mirror=True, cls="hw-mv-ab", frm="translate(0px,-76px)")
mv += (f'<path class="hw-on-c" d="M100 40 l7.5 -4 l7.5 4 l7.5 -4 l7.5 4 l7.5 -4 l7.5 4 l7.5 -4 l7.5 4 l7.5 -4 l7.5 4 l7.5 -4 l7.5 4 l7.5 -4 l7.5 4 l7.5 -4 l7.5 4" '
       f'fill="none" stroke="{RED}" stroke-width="2" stroke-linejoin="round"/>')
b += loop(mv)
b += hand(46, 150, rot=8, s=.9)
b += label(160, 178, "pull to length, then tear", "middle", 13, RED)
b += label(20, 206, "other hand on the counter", "start", 11.5, MUTED, 600)
WRAP.append(("Tear one sheet",
             "Grab the paper from the edge of the roll with your dominant hand, not the middle, with your other hand on the counter. Pull it to the length for the sub and tear. Mini or kids meal 12 inches, regular 15, giant 21. One sheet at a time, logo side down.",
             svg(b, "Pulling one sheet of paper off the roll to length")))

# ---- 1: four fingers underneath, thumbs on top
b = paper(DIAMOND) + corner_dashes()
mv = heel(79, 110, rot=90, s=.95) + heel(241, 110, rot=-90, s=.95)
mv += sub_top(*SUB)
mv += thumb(95, 104, rot=90, s=.95) + thumb(225, 104, rot=-90, s=.95)
b += loop(g(mv, cls="hw-mv-ab", frm="translate(0px,58px)"))
b += label(160, 152, "ends to the corners", "middle", 13, RED, halo=PAPER)
b += arrow("M150 208 L150 184", w=2.6)
b += label(160, 206, "slide it in low", "start", 12, INK)
b += f'<rect x="218" y="6" width="96" height="60" rx="9" fill="#FFFFFF" stroke="{COUNTER_LN}" stroke-width="1.5"/>'
b += label(266, 20, "side view", "middle", 10.5, MUTED, 600, halo="#FFFFFF")
b += f'<rect x="244" y="31" width="60" height="15" rx="7.5" fill="{BREAD}" stroke="{BREAD_LN}" stroke-width="1.2"/>'
b += f'<rect x="229" y="31" width="16" height="17" rx="6" fill="{GLOVE}" stroke="{GLOVE_LN}" stroke-width="1.3"/>'
b += (f'<line x1="244" y1="27.5" x2="262" y2="27.5" stroke="{GLOVE_LN}" stroke-width="8" stroke-linecap="round"/>'
      f'<line x1="244" y1="27.5" x2="262" y2="27.5" stroke="{GLOVE}" stroke-width="5.4" stroke-linecap="round"/>')
for fx in (248, 255.5, 263, 270.5):
    b += (f'<line x1="{fx}" y1="49.5" x2="{fx + 2}" y2="49.5" stroke="{GLOVE_LN}" stroke-width="7.4" stroke-linecap="round"/>'
          f'<line x1="{fx}" y1="49.5" x2="{fx + 2}" y2="49.5" stroke="{GLOVE}" stroke-width="4.8" stroke-linecap="round"/>')
b += label(266, 62, "four fingers under", "middle", 9.6, INK, 700, halo="#FFFFFF")
WRAP.append(("Four fingers underneath, thumbs on top",
             "Slide your fingers under each end of the sub and put your thumbs on top. Always grab it by the ends. Keep it close to the counter so it holds together, and set it in the very center of the paper on the diagonal, the ends of the sub matched to the corners.",
             svg(b, "Sub held by its ends and set diagonally in the center of the paper, ends toward the corners")))

# ---- 2: cut, then check it is still centered
b = paper(DIAMOND)
b += sub_top(*SUB)
mv = f'<line class="hw-on-c" x1="160" y1="97.5" x2="160" y2="122.5" stroke="{BREAD_LN}" stroke-width="2.2" stroke-linecap="round"/>'
knife = (f'<rect x="158.2" y="80" width="3.6" height="60" rx="1.2" fill="{KNIFE_STEEL}" stroke="{KNIFE_LN}" stroke-width=".9"/>'
         f'<rect x="155.6" y="138" width="8.8" height="38" rx="3.2" fill="{KNIFE_GRIP}"/>')
knife += hand(164, 170, rot=-90, s=.86, pose="curl", mirror=True)
mv += g(g(knife, cls="hw-saw-a"), cls="hw-saw-b")
mv += hand(160, 117, rot=0, s=.92, pose="nothumb")
mv += corner_dashes("hw-on-c")
b += loop(mv)
b += label(26, 44, "cup your hand", "start", 13, RED) + label(26, 59, "over the blade", "start", 13, RED)
b += arrow("M100 64 Q128 72 142 90", w=2.4)
b += label(160, 208, "saw gently, don't cut the paper", "middle", 11.5, INK, 700)
WRAP.append(("Cut it, then check the center",
             "Cut the sub the way Cutting the sub shows: hand cupped over the blade, sawing gently, without cutting the paper. After cutting, make sure the sub is still centered on the paper.",
             svg(b, "Cutting the sub in half on the paper with one hand cupped over the blade")))

# ---- 3: pinch, pull over, punch
b = paper(PENT)
b += paper([(86, FOLD_Y), (234, FOLD_Y), BOT], dash=True, op=.85)
b += sub_top(*SUB, cuts=[160])
flap = paper(FLAP, cls="hw-fs-b") + paper(FLAP, printed=True, cls="hw-fe-b")
mv = about(160, FOLD_Y, flap, "hw-mv-b", "scaleY(-1)")
pinch = hand(160, 78, rot=0, s=.92, pose="curl", cls="hw-mv-a", frm="translate(0px,26px)")
mv += g(g(pinch, cls="hw-mv-b", frm="translate(0px,148px)"), cls="hw-off-c")
palm = about(160, 66, hand(160, 66, rot=0, s=.95, pose="flat"), "hw-pulse-c", None)
mv += g(palm + ticks(160, 30, r0=4, r1=11, angles=(215, 250, 290, 325)), cls="hw-on-c")
b += loop(mv)
b += arrow("M186 192 Q262 150 206 78")
b += label(70, 190, "pinch", "start", 13.5, RED)
b += label(308, 164, "pull over", "end", 13.5, RED)
b += label(214, 44, "punch", "start", 13.5, RED)
b += label(22, 34, "palm holds it", "start", 11.5, INK, 700) + label(22, 48, "to the counter", "start", 11.5, INK, 700)
WRAP.append(("Pinch, pull over, punch",
             "Pinch the corner of the paper closest to you, thumb underneath and fingers on top. Bring it over the sub and hold it against the paper and the counter with the palm of your hand. On a giant, check the outside corners, since they sometimes move.",
             svg(b, "The corner of the paper nearest you folded up and over the sub and held down with a flat palm")))

# ---- 4: grab, pull back
b = paper(PENT)
mv = g(sub_top(*SUB, cuts=[160]), cls="hw-mv-b", frm="translate(0px,-8px)")
mv += about(160, 50, paper(FLAP, printed=True), "hw-mv-b", "scale(1,.892)")
mv += (f'<path class="hw-off-b" d="M118 100 q8 -5 16 0 M186 100 q8 -5 16 0 M140 84 q7 -4 14 0 M168 84 q7 -4 14 0" fill="none" stroke="{PAPER_LN}" stroke-width="1.4" stroke-linecap="round"/>')
mv += g(hand(164, 66, rot=0, s=.95, pose="flat"), cls="hw-dim-c")
pull = hand(114, 128, rot=6, s=.92, pose="flat", cls="hw-mv-a", frm="translate(-8px,44px)")
mv += g(pull, cls="hw-mv-b", frm="translate(0px,-8px)")
b += loop(mv)
b += arrow("M214 138 L214 176")
b += label(224, 162, "pull back", "start", 13.5, RED) + label(224, 177, "toward you", "start", 13.5, RED)
b += label(202, 36, "this hand lets go", "start", 11.5, INK, 700) + label(202, 50, "once it's tight", "start", 11.5, INK, 700)
b += label(20, 206, "other hand on top of the sub", "start", 11.5, INK, 700)
WRAP.append(("Grab, pull back",
             "Put your other hand on top of the sub and pull back on the sub to secure the paper. Pulling back releases the paper from your first hand, and the paper now completely covers the sub.",
             svg(b, "One hand on top of the sub pulling it back toward you while the paper tightens around it")))

# ---- 5: quarter turn
BUN5 = (92, 78, 228, 106)
b = paper(PENT)
mv = paper([(114, 96), (206, 96), (160, 50)], printed=True, cls="hw-off-b")
roll = f'<rect x="56" y="92" width="208" height="46" fill="{COUNTER}"/>'
roll += g(paper([(228, 80), (228, 104), (250, 92)], printed=True) + paper([(92, 80), (92, 104), (70, 92)], printed=True), cls="hw-on-b")
roll += bundle(*BUN5)
roll += hand(126, 110, rot=0, s=.92, pose="nothumb") + hand(194, 110, rot=0, s=.92, pose="nothumb", mirror=True)
mv += g(roll, cls="hw-mv-b", frm="translate(0px,18px)")
b += loop(mv)
b += arrow("M272 118 A25 25 0 1 0 272 68")
b += label(306, 146, "quarter turn", "end", 13.5, RED) + label(306, 161, "forward", "end", 13.5, RED)
b += label(160, 204, "thumbs behind and under", "middle", 11.5, INK, 700)
WRAP.append(("Quarter turn",
             "Swing your thumbs behind and under the sub. With a secure grip and your thumbs perpendicular to the sub, use both hands to roll it forward a quarter turn. It is now on its side with your fingers underneath.",
             svg(b, "Both hands rolling the covered sub a quarter turn away from you")))

# ---- 6: fold it in, fold it in
BUN6 = (100, 78, 220, 106)
b = paper([TOP, (220, 82), (220, 106), (100, 106), (100, 82)])
b += bundle(*BUN6)
EAR_L, EAR_R = [(100, 79), (100, 105), (128, 92)], [(220, 79), (220, 105), (192, 92)]
earL = paper(EAR_L, printed=True, cls="hw-fs-a") + paper(EAR_L, cls="hw-fe-a")
earR = paper(EAR_R, printed=True, cls="hw-fs-b") + paper(EAR_R, cls="hw-fe-b")
mv = about(100, 92, earL, "hw-mv-a", "scaleX(-1)")
mv += about(220, 92, earR, "hw-mv-b", "scaleX(-1)")
mv += hand(82, 126, rot=42, s=.84, pose="curl", cls="hw-mv-a", frm="translate(-18px,8px)")
mv += hand(238, 126, rot=-42, s=.84, pose="curl", mirror=True, cls="hw-mv-b", frm="translate(18px,8px)")
b += loop(mv)
b += arrow("M58 76 Q74 54 100 66", w=2.6) + arrow("M262 76 Q246 54 220 66", w=2.6)
b += label(22, 60, "fold it in", "start", 13.5, RED) + label(298, 60, "fold it in", "end", 13.5, RED)
b += label(160, 190, "thumb on the end of the sub,", "middle", 11.5, INK, 700)
b += label(160, 205, "roll your fingers over it, hold the fold", "middle", 11.5, INK, 700)
WRAP.append(("Fold it in, fold it in",
             "Place your thumb on the end of the sub, roll your fingers over your thumb, then hold the fold in place. That tucks the paper and leaves a rounded end. Repeat on the other side.",
             svg(b, "The side corners of the paper folded in over each end of the sub, one end and then the other")))

# ---- 7: roll forward: bottom, side, top
BUN7 = (100, 30, 220, 58)
b = paper([TOP, (220, 82), (220, 106), (100, 106), (100, 82)])
roll = f'<rect x="60" y="44" width="200" height="120" fill="{COUNTER}"/>'
roll += bundle(*BUN7)
roll += paper([(100, 31), (100, 57), (126, 44)]) + paper([(220, 31), (220, 57), (194, 44)])
roll += hand(128, 66, rot=-4, s=.86, pose="roll") + hand(192, 66, rot=4, s=.86, pose="roll", mirror=True)
mv = g(g(g(roll, cls="hw-mv-c", frm="translate(0px,16px)"), cls="hw-mv-b", frm="translate(0px,16px)"), cls="hw-mv-a", frm="translate(0px,16px)")
b += loop(mv)
b += arrow("M256 150 L256 44")
b += label(266, 144, "bottom", "start", 13, RED, cls="hw-on-a") + label(266, 100, "side", "start", 13, RED, cls="hw-on-b") + label(266, 56, "top", "start", 13, RED, cls="hw-on-c")
b += label(160, 190, "fingers spread wide, thumbs across the sub", "middle", 11.5, INK, 700)
b += label(160, 205, "tight, without crushing it", "middle", 11.5, INK, 700)
WRAP.append(("Roll forward: bottom, side, top",
             "Both hands on the sub, fingers spread wide and thumbs perpendicular to the sub, which is the key to a tight roll. Roll it forward quickly: that's the bottom of the sub, roll again for the side, roll again for the top. Tight, without crushing the sub.",
             svg(b, "The wrapped sub rolled forward three times toward the far corner of the paper")))

# ---- 8: finish in your dominant hand
held = heel(186, 126, rot=0, s=1.12)
held += bundle(66, 82, 254, 118)
held += f'<path d="M150 83 L178 108 L206 83" fill="none" stroke="{PAPER_LN}" stroke-width="1.4" stroke-linejoin="round"/>'
for fx in (200, 212, 224):
    held += (f'<line x1="{fx}" y1="76" x2="{fx}" y2="88" stroke="{GLOVE_LN}" stroke-width="10.4" stroke-linecap="round"/>'
             f'<line x1="{fx}" y1="76" x2="{fx}" y2="88" stroke="{GLOVE}" stroke-width="7.6" stroke-linecap="round"/>')
held += (f'<line x1="187" y1="76" x2="179" y2="104" stroke="{GLOVE_LN}" stroke-width="10.6" stroke-linecap="round"/>'
         f'<line x1="187" y1="76" x2="179" y2="104" stroke="{GLOVE}" stroke-width="7.8" stroke-linecap="round"/>')
held += (f'<line x1="166" y1="126" x2="163" y2="109" stroke="{GLOVE_LN}" stroke-width="11.4" stroke-linecap="round"/>'
         f'<line x1="166" y1="126" x2="163" y2="109" stroke="{GLOVE}" stroke-width="8.6" stroke-linecap="round"/>')
held += f'<circle cx="179" cy="103" r="14.5" fill="none" stroke="{RED}" stroke-width="2.2"/>'
b = loop(g(g(held, tr="rotate(-14 160 100)"), cls="hw-mv-ab", frm="translate(0px,18px)"))
b += label(22, 36, "index finger", "start", 13.5, RED) + label(22, 51, "anchors the flap", "start", 13.5, RED)
b += f'<path d="M116 58 L164 88" stroke="{RED}" stroke-width="1.8" stroke-linecap="round"/>'
b += label(160, 190, "top of the sub in your hand", "middle", 11.5, INK, 700)
b += label(160, 205, "your other hand is free for the bag", "middle", 11.5, MUTED, 600)
WRAP.append(("Finish in your dominant hand",
             "Keep rolling and bring the sub into your dominant hand, anchoring the flap with your index finger. The sub is wrapped neatly with the ends tucked in, and the top of the sub is in your hand. Always finish in your dominant hand.",
             svg(b, "The wrapped sub held in one hand with the index finger on the last flap")))


# =============================================================== cutting
CUT = []
# ---- cup, up, down: looking along the sub, so the blade is seen from its flat side
b = f'<line x1="18" y1="186" x2="302" y2="186" stroke="{COUNTER_LN}" stroke-width="2"/>'
b += f'<rect x="100" y="181" width="120" height="5" rx="2" fill="{PAPER}" stroke="{PAPER_LN}" stroke-width="1"/>'
dome = "M124 181 L124 160 Q124 138 160 138 Q196 138 196 160 L196 181 Z"
b += (f'<path d="{dome}" fill="{BREAD}" stroke="{BREAD_LN}" stroke-width="1.4"/><path d="{dome}" fill="url(#hw-grain)"/>'
      f'<path d="M127 163 H193" stroke="#7FB069" stroke-width="5" stroke-linecap="round"/><path d="M127 169 H193" stroke="#E0907F" stroke-width="5" stroke-linecap="round"/>'
      f'<path d="M127 175 H193" stroke="#F2E3AE" stroke-width="4" stroke-linecap="round"/>')
b += label(160, 206, "the sub, seen from its end", "middle", 11, MUTED, 600)
blade = (f'<path d="M72 108 H236 Q248 108 248 120 V130 Q160 138 72 130 Z" fill="{KNIFE_STEEL}" stroke="{KNIFE_LN}" stroke-width="1.2"/>'
         f'<rect x="28" y="106" width="48" height="18" rx="6" fill="{KNIFE_GRIP}"/>')
fingers = (130, 144, 158, 172)
cup = "".join(f'<line x1="{fx}" y1="104" x2="{fx}" y2="124" stroke="{GLOVE_LN}" stroke-width="12.6" stroke-linecap="round"/>' for fx in fingers)
cup += f'<line x1="190" y1="102" x2="196" y2="120" stroke="{GLOVE_LN}" stroke-width="13" stroke-linecap="round"/>'
cup += f'<rect x="120" y="82" width="80" height="30" rx="14" fill="{GLOVE_LN}"/>'
cup += "".join(f'<line x1="{fx}" y1="104" x2="{fx}" y2="124" stroke="{GLOVE}" stroke-width="9.8" stroke-linecap="round"/>' for fx in fingers)
cup += f'<line x1="190" y1="102" x2="196" y2="120" stroke="{GLOVE}" stroke-width="10.2" stroke-linecap="round"/>'
cup += f'<rect x="121.4" y="83.4" width="77.2" height="27.2" rx="12.6" fill="{GLOVE}"/>'
mv = g(g(blade, cls="hw-mv-b", frm="translate(0px,26px)"), cls="hw-mv-c", frm="translate(0px,-34px)")
mv += g(g(cup, cls="hw-mv-a", frm="translate(0px,-14px)"), cls="hw-mv-c", frm="translate(0px,-34px)")
b += loop(mv)
b += label(22, 30, "1 Cup", "start", 14.5, RED, 800) + label(22, 45, "all five fingers", "start", 11.5, INK, 700) + label(22, 59, "over the blade", "start", 11.5, INK, 700)
b += label(298, 30, "2 Up", "end", 14.5, RED, 800) + label(298, 45, "knife comes up", "end", 11.5, INK, 700) + label(298, 59, "to your hand", "end", 11.5, INK, 700)
b += label(298, 160, "3 Down", "end", 14.5, RED, 800) + label(298, 175, "onto the sub", "end", 11.5, INK, 700)
CUT.append(("Cup, up, down",
            "Cup your hand with all five fingers over the blade, bring the knife up to your hand, then down on the sub. Gently press down on the sub's lid and cut with a sawing motion, quickly and neatly, without cutting the paper. Watch your thumb and pinky: they get hurt the most.",
            svg(b, "A hand cupped over the top of the knife blade as it comes down on the sub")))

# ---- how many pieces
b = ""
rows = [("Mini, regular", "in half", 34, 170, 250, [210]),
        ("Giant", "in quarters", 84, 150, 302, [188, 226, 264]),
        ("Asked for 6", "halves, then thirds", 134, 150, 302, [175.3, 200.7, 226, 251.3, 276.7]),
        ("Asked for 8", "quarters, then halves", 184, 150, 302, [169, 188, 207, 226, 245, 264, 283])]
for name, how, cy, x0, x1, cuts in rows:
    b += label(18, cy - 1, name, "start", 13, INK, 700) + label(18, cy + 14, how, "start", 11.5, MUTED, 600)
    b += sub_top(x0, cy - 13, x1, cy + 13, cuts=cuts)
CUT.append(("How many pieces",
            "Minis in half, regulars in half, giants in quarters. Don't ask how they want it cut. If a guest asks for six, cut it in half and each half in thirds. For eight, cut quarters and then each quarter in half. Take the moment to make the pieces equal.",
            svg(b, "Where the cuts go for a mini or regular, a giant in quarters, in six and in eight")))


# =============================================================== bagging
BAG = []


def bag_rect(x, y, w, h, printed=False, op=1):
    s = f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" rx="3" fill="{PRINT_BG if printed else PAPER}" stroke="{PAPER_LN}" stroke-width="1.4" opacity="{op}"/>'
    if printed:
        s += f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" rx="3" fill="url(#hw-print)" opacity="{op}"/>'
    return s


# ---- pop the bag
b = ""
for i in range(3, -1, -1):
    b += bag_rect(30 + i * 1.5, 106 - i * 2.5, 140, 38)
b += g(f'<path d="M170 108 Q184 125 170 142" fill="{COUNTER}" stroke="{PAPER_LN}" stroke-width="1.4"/>', cls="hw-on-a")
press = about(140, 132, hand(140, 146, rot=0, s=.84, pose="curl"), "hw-pulse-a", None)
popped = bag_rect(150, 34, 146, 44) + f'<path d="M296 36 Q312 56 296 76" fill="#F4F1EA" stroke="{PAPER_LN}" stroke-width="1.4"/>'
mv = g(g(about(223, 56, popped, "hw-mv-c", "scale(1,.55)"), cls="hw-mv-b", frm="translate(-118px,70px)"), cls="hw-on-b")
mv += g(ticks(223, 26, r0=4, r1=13, angles=(235, 270, 305)) + ticks(223, 86, r0=4, r1=13, angles=(55, 90, 125)), cls="hw-on-c")
mv += press
b += loop(mv)
b += arrow("M104 94 Q116 70 144 62", w=2.6)
b += label(306, 122, "pop it forward", "end", 13.5, RED)
b += label(306, 20, "guest side", "end", 10.5, MUTED, 600)
b += label(160, 191, "press a few inches from the open end,", "middle", 11.5, INK, 700)
b += label(160, 206, "slide your thumb in and lift", "middle", 11.5, INK, 700)
BAG.append(("Pop the bag forward",
            "Press down with your fingers on the stack of bags a few inches from the open end, which opens the top bag just enough to slide your thumb in. Press your thumb against your pointer and middle fingers and lift the bag. Extend your arm and flick your wrist so the bag pops open. Always pop it forward, where guests can see and hear it, never down or back.",
            svg(b, "The top bag lifted off the stack and popped open away from you")))

# ---- twist the sub into the bag
b = bag_rect(160, 84, 140, 48)
b += f'<path d="M160 86 Q146 108 160 130" fill="#F4F1EA" stroke="{PAPER_LN}" stroke-width="1.4"/>'
mv = about(120, 108, bundle(56, 94, 184, 122), "hw-mv-bc", "translate(-50px,0px) rotate(-12deg)")
mv += hand(84, 136, rot=14, s=.88, pose="nothumb", mirror=True, cls="hw-mv-bc", frm="translate(-50px,0px)")
b += loop(mv)
b += f'<rect x="161" y="85" width="138" height="46" rx="3" fill="{PAPER}" opacity=".6"/>'
b += hand(262, 150, rot=-8, s=.88, pose="curl")
b += arrow("M56 76 Q88 54 122 74", w=2.6)
b += label(160, 40, "a little twist as it goes in", "middle", 13.5, RED)
b += label(160, 191, "top of the sub to the top of the bag,", "middle", 11.5, INK, 700)
b += label(160, 206, "bottom of the sub to the bottom", "middle", 11.5, INK, 700)
BAG.append(("Twist it into the bag",
            "With the wrapped sub in your dominant hand, give it a little twist as it first goes into the bag, keeping everything over the counter. The top of the sub goes on the top of the bag and the bottom of the sub on the bottom of the bag.",
            svg(b, "The wrapped sub sliding into the open end of the bag with a small twist")))

# ---- crease it, roll it over
CREASE_Y = 92
b = f'<line class="hw-on-a" x1="46" y1="{CREASE_Y}" x2="254" y2="{CREASE_Y}" stroke="{RED}" stroke-width="2.2" stroke-dasharray="5 4" stroke-linecap="round"/>'
before = bag_rect(50, CREASE_Y, 200, 52) + f'<rect x="64" y="{CREASE_Y + 11}" width="150" height="30" rx="15" fill="none" stroke="{PAPER_LN}" stroke-width="1.3" stroke-dasharray="4 3"/>'
before += label(139, CREASE_Y + 30, "logo side down", "middle", 11.5, MUTED, 600, halo=PAPER)
after = bag_rect(50, CREASE_Y - 52, 200, 52, printed=True) + f'<rect x="64" y="{CREASE_Y - 41}" width="150" height="30" rx="15" fill="none" stroke="{PAPER_LN}" stroke-width="1.3" stroke-dasharray="4 3"/>'
after += label(139, CREASE_Y - 22, "logo side up", "middle", 11.5, INK, 700, halo=PRINT_BG)
# drawn in the end pose (rolled over the crease). Before the roll you see the plain face, mirrored below the crease.
faces = g(g(before, tr=f"translate(0 {2 * CREASE_Y}) scale(1 -1)"), cls="hw-fs-c") + g(after, cls="hw-fe-c")
mv = about(150, CREASE_Y, faces, "hw-mv-c", "scaleY(-1)")
mv += g(hand(70, 112, rot=0, s=.8, pose="curl") + hand(230, 112, rot=0, s=.8, pose="curl", mirror=True), cls="hw-off-c")
b += loop(mv)
b += arrow("M276 136 A32 32 0 0 0 276 50", w=2.8)
b += label(306, 20, "guest side", "end", 10.5, MUTED, 600)
b += label(160, 170, "pinch along the top, press it into the counter", "middle", 11.5, INK, 700)
b += label(160, 189, "then roll the sub over the crease,", "middle", 13, RED)
b += label(160, 205, "toward the guest", "middle", 13, RED)
BAG.append(("Crease it, roll it over",
            "Place the bag logo side down on the counter. Pinch the bag along the top and press it into the counter to make a crease. Then roll the sub over the crease toward the guest until the logo side is up. The crease seals the bag around the sub.",
            svg(b, "The bag creased along one long edge and the sub rolled over the crease, ending logo side up")))

# ---- twist and mark
b = bag_rect(22, 22, 104, 42, printed=True)
b += (f'<path d="M126 24 L142 37 L162 26 L162 60 L142 49 L126 62 Z" fill="{PRINT_BG}" stroke="{PAPER_LN}" stroke-width="1.4" stroke-linejoin="round"/>'
      f'<path d="M137 33 Q143 43 137 53" fill="none" stroke="{PAPER_LN}" stroke-width="1.3"/>')
b += loop(g(arrow("M150 14 Q166 24 154 38", w=2.4), cls="hw-on-a"))
b += label(176, 38, "regular, mini, kids meal:", "start", 11.5, INK, 700) + label(176, 54, "add a twist", "start", 13.5, RED)
b += bag_rect(22, 88, 226, 42, printed=True)
b += label(258, 106, "giant:", "start", 11.5, INK, 700) + label(258, 121, "no twist", "start", 11.5, INK, 700)
b += bag_rect(22, 154, 104, 46, printed=True)
b += f'<rect x="32" y="162" width="84" height="30" rx="5" fill="#FFFFFF" stroke="{COUNTER_LN}" stroke-width="1.2"/>'
b += label(52, 183, "#5", "middle", 17, INK, 800, halo="#FFFFFF") + label(90, 182, "DANA", "middle", 12, INK, 800, halo="#FFFFFF")
b += label(136, 166, "sub number when the order", "start", 11.5, INK, 700) + label(136, 180, "has more than one sub", "start", 11.5, INK, 700)
b += label(136, 198, "name: phone, online, catering", "start", 11.5, INK, 700)
BAG.append(("Twist it, mark it",
            "For regulars, minis and kids meals, add a twist after the sub is rolled over. Keep a marker handy: mark the number of the sub on the bag when there are multiple subs on an order, and always mark the name for a phone, online or catering order. Bags can be marked ahead while the subs are being sliced and sprinkled.",
            svg(b, "A regular's bag with its end twisted, a giant's bag left flat, and a bag marked with a sub number and a name")))


# =============================================================== a #17 on the grill
# Looking down at the flat top, you at the bottom. The grill is the dark plate on the left, the counter with the paper is
# on the right. The video gives the order, the amounts and the counts; where things sit on the plate is one way to show it.
STEAK = []
GRILL, GRILL_HI = "#3F4753", "#5B6470"
G_X0, G_Y0, G_X1, G_Y1 = 10, 10, 214, 166
BUN_G = (34, 24, 190, 50)                  # the loaf, warming at the back of the plate
ONION_C, ONION_LN_C, PEPPER_C, PEPPER_LN_C = "#E8DFF2", "#9C86B8", "#7FA85E", "#4E7A3A"
STEAK_C, STEAK_LN_C, CHEESE_C, CHEESE_LN_C = "#7A4A3C", "#3A1F17", "#FBF5E4", "#B9AE8C"
STEEL_C, STEEL_LN_C = "#D3DAE2", "#6F7B88"


def plate():
    return (f'<rect x="{G_X0}" y="{G_Y0}" width="{G_X1 - G_X0}" height="{G_Y1 - G_Y0}" rx="9" fill="{GRILL}" stroke="{GRILL_HI}" stroke-width="2"/>'
            f'<path d="M{G_X0 + 10} {G_Y1 - 8} H{G_X1 - 10}" stroke="{GRILL_HI}" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>')


def glabel(x, y, t, anchor="start", size=12):
    """Words that sit on the dark plate."""
    return label(x, y, t, anchor, size, "#FFFFFF", 700, halo=GRILL)


def sheet(cheese=3, cls=None):
    """The paper on the counter, with the cheese laid out on it."""
    s_ = f'<rect x="226" y="16" width="84" height="150" fill="{PAPER}" stroke="{PAPER_LN}" stroke-width="1.4"/>'
    for i in range(cheese):
        c = f' class="{cls[i]}"' if cls else ""
        s_ += f'<rect{c} x="236" y="{26 + i * 44}" width="64" height="38" rx="3" fill="{CHEESE_C}" stroke="{CHEESE_LN_C}" stroke-width="1.2"/>'
    return s_


def strip(y, h, fill, ln, rings=False):
    x0, x1 = BUN_G[0], BUN_G[2]
    s_ = f'<rect x="{x0}" y="{y}" width="{x1 - x0}" height="{h}" rx="{h / 2}" fill="{fill}" stroke="{ln}" stroke-width="1.2"/>'
    if rings:
        for cx in range(x0 + 14, x1 - 6, 19):
            s_ += f'<circle cx="{cx}" cy="{y + h / 2}" r="{h / 2 - 3.2}" fill="none" stroke="{ln}" stroke-width="1"/>'
    return s_


def veg(y=70):
    return strip(y, 18, ONION_C, ONION_LN_C, rings=True) + strip(y + 3, 12, PEPPER_C, PEPPER_LN_C)


def meat(x=58, y=104, w=110, h=40, broken=False, mixed=False):
    s_ = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{STEAK_C}" stroke="{STEAK_LN_C}" stroke-width="1.4"/>'
    if broken:
        s_ += f'<path d="M{x + 22} {y + 6} V{y + h - 6} M{x + 44} {y + 6} V{y + h - 6} M{x + 66} {y + 6} V{y + h - 6} M{x + 88} {y + 6} V{y + h - 6}" stroke="{STEAK_LN_C}" stroke-width="1.6" stroke-linecap="round"/>'
    if mixed:
        for i, (dx, dy) in enumerate(((14, 10), (34, 26), (52, 12), (72, 28), (92, 14), (24, 30), (62, 20), (84, 32), (44, 34), (100, 26))):
            s_ += f'<rect x="{x + dx - 5}" y="{y + dy - 3}" width="10" height="6" rx="3" fill="{PEPPER_C if i % 2 else ONION_C}" stroke="{PEPPER_LN_C if i % 2 else ONION_LN_C}" stroke-width=".8"/>'
    return s_


def tool(x, y, kind, rot=0):
    """A red-handled tool lying on the plate: tongs, spatula or dough cutter."""
    if kind == "tongs":
        b_ = (f'<path d="M0 0 L46 -9 M0 0 L46 9" stroke="{STEEL_LN_C}" stroke-width="3.2" stroke-linecap="round" fill="none"/>'
              f'<path d="M-20 0 H2" stroke="{RED}" stroke-width="9" stroke-linecap="round"/>')
    elif kind == "spatula":
        b_ = (f'<path d="M0 -13 H30 V13 H0 Z" fill="{STEEL_C}" stroke="{STEEL_LN_C}" stroke-width="1.2"/>'
              f'<path d="M-30 0 H0" stroke="{RED}" stroke-width="8" stroke-linecap="round"/>')
    else:
        b_ = (f'<rect x="0" y="-16" width="9" height="32" rx="2" fill="{STEEL_C}" stroke="{STEEL_LN_C}" stroke-width="1.2"/>'
              f'<rect x="-9" y="-16" width="9" height="32" rx="4" fill="{RED}"/>')
    return g(b_, tr=f"translate({f(x)} {f(y)}) rotate({f(rot)})")


# ---- 1: temper the bread
b = plate() + sheet(0)
b += loop(g(sub_top(*BUN_G), cls="hw-mv-ab", frm="translate(0px,26px)"))
b += arrow("M196 62 A22 22 0 1 1 196 18", w=2.6)
b += glabel(112, 84, "bottom side down", "middle", 13)
b += glabel(112, 102, "turn it often", "middle", 13)
b += label(268, 96, "paper", "middle", 11.5, MUTED, 600, halo=PAPER)
b += label(112, 190, "warm, not toasted", "middle", 13, RED)
b += label(112, 206, "open and close the loaf first", "middle", 11.5, INK, 700)
STEAK.append(("Bread on the grill to temper",
              "The pre-cut loaf goes on the grill bottom side down, to warm it, not toast it. Open and close it first so the heat can reach the middle. Keep turning it through the whole cook, and leave it on as long as you can.",
              svg(b, "A pocket-cut loaf warming at the back of the grill, bottom side down")))

# ---- 2: paper and cheese
b = plate() + sub_top(*BUN_G)
b += loop(sheet(3, cls=("hw-on-a", "hw-on-b", "hw-on-c")))
b += glabel(112, 100, "bread keeps warming", "middle", 12)
b += label(268, 186, "3 slices", "middle", 13, RED)
b += label(268, 204, "15 in of paper", "middle", 11.5, INK, 700)
b += label(112, 196, "a Big Kahuna gets 4 slices", "middle", 11.5, MUTED, 600)
STEAK.append(("Paper torn, cheese laid out",
              "Tear the paper: 15 inches for a regular. Lay out the cheese: 3 slices. A Big Kahuna gets 4.",
              svg(b, "A sheet of paper on the counter beside the grill with three slices of cheese laid out on it")))

# ---- 3: onions
b = plate() + sheet(3) + sub_top(*BUN_G)
b += f'<path d="M{BUN_G[0]} 54 V96 M{BUN_G[2]} 54 V96" stroke="{RED}" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round"/>'
b += loop(about(BUN_G[0], 79, strip(70, 18, ONION_C, ONION_LN_C, rings=True), "hw-mv-ab", "scale(.04,1)"))
b += glabel(112, 118, "as long as the bread", "middle", 13)
b += label(112, 190, "1.25 oz of onions", "middle", 13, RED)
b += label(112, 206, "spread to the length of the loaf", "middle", 11.5, INK, 700)
STEAK.append(("Onions down, as long as the bread",
              "Using the length of the bread on the grill as your guide, spread out 1.25 ounces of onions.",
              svg(b, "A line of onions on the grill, the same length as the loaf warming behind it")))

# ---- 4: peppers on top
b = plate() + sheet(3) + sub_top(*BUN_G)
b += strip(70, 18, ONION_C, ONION_LN_C, rings=True)
b += loop(about(BUN_G[0], 79, strip(73, 12, PEPPER_C, PEPPER_LN_C), "hw-mv-ab", "scale(.04,1)"))
b += glabel(112, 118, "peppers ride on the onions", "middle", 12.5)
b += label(112, 190, "0.75 oz of peppers, on top", "middle", 13, RED)
b += label(112, 206, "they help cook and marinate the onions", "middle", 11, INK, 700)
STEAK.append(("Peppers on top of the onions",
              "Spread 0.75 ounces of peppers to the same length, on top of the onions. The peppers help cook and marinate the onions.",
              svg(b, "Green peppers laid on top of the line of onions")))

# ---- 5: steak on, flip, salt
b = plate() + sheet(3) + sub_top(*BUN_G) + veg()
mv = g(meat() + tool(170, 124, "tongs", rot=180), cls="hw-mv-a", frm="translate(0px,34px)")
mv += g("".join(f'<circle cx="{74 + i * 13}" cy="{112 + (i % 3) * 9}" r="1.5" fill="#FFFFFF"/>' for i in range(7)), cls="hw-on-c")
mv += g(arrow("M40 146 A20 20 0 0 1 40 104", w=2.4), cls="hw-on-b")
b += loop(mv)
b += label(112, 190, "red tongs, flip, light salt", "middle", 13, RED)
b += label(112, 206, "don't touch the raw meat", "middle", 11.5, INK, 700)
STEAK.append(("Steak on, flipped, lightly salted",
              "Place the steak on the grill with the red-handled tongs, and avoid touching the raw meat. Once it's on, flip it and lightly salt it. A good moment to turn the bread.",
              svg(b, "A steak on the grill in front of the onions and peppers, held with red-handled tongs and salted")))

# ---- 6: break 4, together, 4
b = plate() + sheet(3) + sub_top(*BUN_G) + veg()
mv = meat(broken=True)
mv += g(tool(36, 124, "cutter"), cls="hw-saw-a") + g(tool(176, 124, "spatula", rot=180), cls="hw-saw-b")
b += loop(mv)
b += glabel(113, 160, "4, bring it together, 4 more", "middle", 12)
b += label(112, 190, "break it with the red tools", "middle", 13, RED)
b += label(112, 206, "spatula and dough cutter", "middle", 11.5, INK, 700)
STEAK.append(("Break 4, bring together, break 4",
              "With the red spatula and the red dough cutter, break the steak 4 times. Bring it together and break it 4 more.",
              svg(b, "The steak chopped on the grill between a red dough cutter and a red spatula")))

# ---- 7: veg on top, 8 more
b = plate() + sheet(3) + sub_top(*BUN_G)
b += f'<rect x="{BUN_G[0]}" y="70" width="{BUN_G[2] - BUN_G[0]}" height="18" rx="9" fill="none" stroke="{GRILL_HI}" stroke-width="1.4" stroke-dasharray="4 4"/>'
mv = meat(broken=True) + g(meat(mixed=True), cls="hw-on-b")
mv += g(arrow("M112 90 V104", w=2.6), cls="hw-on-a")
b += loop(mv)
b += glabel(113, 160, "8 more: 16 in all", "middle", 12.5)
b += label(112, 190, "onions and peppers on top", "middle", 13, RED)
b += label(112, 206, "then break it 8 more times", "middle", 11.5, INK, 700)
STEAK.append(("Onions and peppers on top, break 8 more",
              "Put the peppers and onions on top of the steak and break it 8 more times, the same 4 and 4 as before. That's 16 in all.",
              svg(b, "The onions and peppers moved onto the chopped steak and broken in with it")))

# ---- 8: cheese on top
b = plate() + sheet(0) + sub_top(*BUN_G) + meat(mixed=True)
mv = ""
for i, k in enumerate("abc"):
    x = 62 + i * 34
    sl = f'<rect x="{x}" y="106" width="34" height="36" rx="3" fill="{CHEESE_C}" stroke="{CHEESE_LN_C}" stroke-width="1.2"/>'
    sl += f'<path d="M{x + 9} 116 V132 M{x + 17} 113 V129 M{x + 25} 117 V133" stroke="{CHEESE_LN_C}" stroke-width="1.5" stroke-linecap="round"/>'
    mv += g(sl, cls=f"hw-on-{k}")
b += loop(mv)
b += glabel(113, 160, "don't overcook it waiting", "middle", 12)
b += label(112, 190, "cheese on top, a few slits", "middle", 13, RED)
b += label(112, 206, "the slits help it melt faster", "middle", 11.5, INK, 700)
STEAK.append(("Cheese on top, a few slits",
              "Lay the slices of cheese on top of the steak to melt, and cut a few slits in the cheese so it melts faster. Don't overcook the steak while you wait for it.",
              svg(b, "Three slices of cheese laid over the chopped steak, each with a few slits")))

# ---- 9: onto the bread
b = plate() + sheet(0) + sub_top(*BUN_G)
pile = f'<rect x="58" y="104" width="110" height="40" rx="12" fill="{CHEESE_C}" stroke="{CHEESE_LN_C}" stroke-width="1.4"/>'
pile += f'<path d="M70 144 q10 6 20 0 M104 144 q10 6 20 0 M138 144 q8 5 16 0" fill="none" stroke="{STEAK_LN_C}" stroke-width="2" stroke-linecap="round"/>'
mv = g(pile, cls="hw-off-b")
filled = f'<rect x="{BUN_G[0] + 14}" y="{BUN_G[1] + 6}" width="{BUN_G[2] - BUN_G[0] - 28}" height="14" rx="7" fill="{CHEESE_C}" stroke="{CHEESE_LN_C}" stroke-width="1.2"/>'
mv += g(filled, cls="hw-on-b")
mv += g(tool(30, 124, "cutter") + tool(196, 124, "spatula", rot=180), cls="hw-off-b")
b += loop(mv)
b += arrow("M112 100 V58")
b += glabel(113, 160, "scrape the loose bits on too", "middle", 12)
b += label(112, 190, "onto the bread", "middle", 13, RED)
b += label(112, 206, "dough cutter pushes it onto the spatula", "middle", 11, INK, 700)
STEAK.append(("Onto the bread, loose bits scraped on",
              "Use the dough cutter to get all of the steak onto the spatula, and place it onto the bread. Scrape the loose bits off the grill and onto the sub.",
              svg(b, "The cheesesteak lifted off the grill and into the pocket of the loaf")))


# =============================================================== output
def howto(steps, key, before=False):
    out = [f'<ol class="howto" data-howto="{key}">']
    for i, (title, text, pic) in enumerate(steps):
        if before and i == 0:
            num = '<span class="hn hn-pre">Start</span>'
        else:
            num = f'<span class="hn">{i if before else i + 1}</span>'
        out.append(f'<li><figure>{pic}</figure><div class="ht">{num}<p><b>{title}.</b> {text}</p></div></li>')
    out.append("</ol>")
    html = "\n".join(out)
    for bad in (chr(0x2014), chr(0x2013)):
        if bad in html: raise SystemExit("dash found in how-to text: " + key)
    return html


if __name__ == "__main__":
    inc = ROOT / "src" / "include"; inc.mkdir(parents=True, exist_ok=True)
    (inc / "howto-wrap.html").write_text(howto(WRAP, "wrap", before=True), encoding="utf-8")
    (inc / "howto-cut.html").write_text(howto(CUT, "cut"), encoding="utf-8")
    (inc / "howto-bag.html").write_text(howto(BAG, "bag"), encoding="utf-8")
    (inc / "howto-steak.html").write_text(howto(STEAK, "steak"), encoding="utf-8")
    (inc / "howto-defs.html").write_text(DEFS, encoding="utf-8")
    (ROOT / "src" / "howto.css").write_text(keyframes_css(), encoding="utf-8")
    # proof: every picture as a still, then frozen at four moments of its loop
    times = [("still", None), ("0.3 s", .3), ("1.9 s", 1.9), ("2.9 s", 2.9), ("4.2 s", 4.2)]
    cells = []
    for name, steps in (("WRAP", WRAP), ("CUT", CUT), ("BAG", BAG), ("STEAK", STEAK)):
        for i, (title, text, pic) in enumerate(steps):
            row = f'<div class="cap">{name} {i}: {title}</div>'
            for tname, t in times:
                p = pic if t is None else pic.replace('class="howto-pic"', f'class="howto-pic play freeze" style="--hw-at:{t}"')
                row += f'<div class="c">{p}<small>{tname}</small></div>'
            cells.append(f'<div class="row">{row}</div>')
    fonts = "".join(f"@font-face{{font-family:Barlow;font-weight:{w};src:url(../tools/fonts/barlow-latin-{w}-normal.woff2) format('woff2')}}" for w in (400, 500, 600, 700))
    page = ("<!doctype html><meta charset=utf-8><style>" + fonts + "body{margin:10px;background:#fff;font:12px Arial}"
            ".row{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px}.cap{grid-column:1/-1;font-weight:700}"
            ".howto-pic{width:100%;display:block}small{color:#555}" + keyframes_css() + "</style>"
            "<svg width=0 height=0 style='position:absolute'><defs>" + DEFS + "</defs></svg>" + "".join(cells))
    (ROOT / "proof").mkdir(exist_ok=True)
    (ROOT / "proof" / "howto.html").write_text(page, encoding="utf-8")
    print("frames", len(WRAP), len(CUT), len(BAG), len(STEAK))
