"""Bake the script-drawn study content into dist/site/index.html so the page still reads as a full study guide
where scripts don't run (an iPhone previewing an attachment from Messages or Mail).
With scripts on, the page works exactly as before and skips redrawing what is already there.
Every edit below must apply exactly once, or the run stops: a marker that silently stopped matching is how
the read-only preview broke before."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

SITE = Path(__file__).resolve().parent.parent / "dist" / "site"
p = SITE / "index.html"
html = p.read_text(encoding="utf-8")

def once(old, new, what):
    global html
    n = html.count(old)
    if n != 1: raise SystemExit(f"prerender: expected exactly one '{what}', found {n}")
    html = html.replace(old, new, 1)

# containers the script fills; each must be empty in the source and carry data-bake
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width": 390, "height": 844})
    pg.goto(p.as_uri())
    pg.wait_for_timeout(500)
    ids = pg.eval_on_selector_all("[data-bake]", "els => els.map(e => e.id)")
    baked = {i: pg.eval_on_selector("#" + i, "e => e.innerHTML") for i in ids}
    b.close()
if not ids: raise SystemExit("prerender: no [data-bake] containers found")
for i, inner in baked.items():
    if not inner.strip(): raise SystemExit(f"prerender: #{i} rendered empty")
    import re
    m = re.search(r'<(\w+)([^>]*\bid="' + re.escape(i) + r'"[^>]*)></\1>', html)
    if not m: raise SystemExit(f"prerender: empty container #{i} not found in the page source")
    html = html[:m.start()] + f"<{m.group(1)}{m.group(2)}>" + inner + f"</{m.group(1)}>" + html[m.end():]

# scripts skip what is already drawn
once("function renderStudy(){\n", "function renderStudy(){\n  if (document.getElementById(\"cold-families\").children.length) return;\n", "renderStudy")
once("function renderLegend(){\n", "function renderLegend(){\n  if (document.getElementById(\"legend\").children.length) return;\n", "renderLegend")

# without scripts: show the Line and Orientation sections under Study, hide the parts that need taps
once('<section id="view-line" class="view" role="tabpanel" aria-labelledby="tab-line" hidden>',
     '<section id="view-line" class="view" role="tabpanel" aria-labelledby="tab-line">', "line section")
once('<section id="view-orient" class="view" role="tabpanel" aria-labelledby="tab-orient" hidden>',
     '<section id="view-orient" class="view" role="tabpanel" aria-labelledby="tab-orient">', "orient section")
once("<head>\n", "<head>\n<script>document.documentElement.className+=' js';</script>\n", "head")
nojs_css = ("html:not(.js) .tabs,html:not(.js) #view-drill,html:not(.js) .needs-js,html:not(.js) .jump{display:none!important}\n"
            "html:not(.js) #view-line,html:not(.js) #view-orient{margin-top:14px}\n")
once("[hidden]{display:none!important}\n", "[hidden]{display:none!important}\n" + nojs_css, "reset")
once('<main class="wrap gutter" id="main">',
     '<main class="wrap gutter" id="main">\n<noscript><p class="fine" style="margin:0 0 12px">You\'re looking at the read-only preview. Open this file in Chrome or Safari to use the drills.</p></noscript>', "main")

p.write_text(html, encoding="utf-8")
print("baked", {k: len(v) for k, v in baked.items()}, "bytes", p.stat().st_size)
