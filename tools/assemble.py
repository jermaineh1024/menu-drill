"""Assemble the single-file page (the published artifact) from src/.
   python3 tools/assemble.py [OUT]      default OUT = dist/artifact.html
   - src/head.html, src/style.css, src/defs.html, src/body.html, then every src/js/*.js in name order in one scope
   - <!--#include NAME--> in defs/body pulls src/include/NAME.html: the how-to pictures (tools/howto.py), the training
     diagrams (tools/pics.py) and the training modules, which pull in their own drawings
   - /*#include howto.css*/ in style.css pulls src/howto.css
   Refuses to write if an include is unresolved or an em or en dash is anywhere in the page."""
import pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
S = ROOT / "src"

def read(p): return (S / p).read_text(encoding="utf-8")

def includes(text):
    def sub(m):
        f = S / "include" / (m.group(1) + ".html")
        if not f.exists(): raise SystemExit("missing include: " + str(f))
        return f.read_text(encoding="utf-8").rstrip("\n")
    for _ in range(4):   # an included file may pull in others (a module pulls in its drawings)
        if "<!--#include " not in text: return text
        text = re.sub(r"<!--#include ([\w-]+)-->", sub, text)
    raise SystemExit("includes nested too deep, or an include pulls itself in")

def assemble():
    js = "".join(p.read_text(encoding="utf-8") for p in sorted((S / "js").glob("*.js")))
    css = read("style.css")
    marker = "/*#include howto.css*/"
    if css.count(marker) != 1: raise SystemExit("style.css needs the howto.css include marker exactly once")
    css = css.replace(marker, read("howto.css").rstrip("\n"))
    html = (read("head.html") + "<style>\n" + css + "</style>\n" + includes(read("defs.html")) + includes(read("body.html"))
            + "<script>\n(function(){\n'use strict';\n" + js + "})();\n\n</script>\n")
    for ch, name in (("—", "em dash"), ("–", "en dash")):
        if ch in html:
            i = html.index(ch)
            raise SystemExit(f"{name} in the page near: {html[max(0, i - 60):i + 20]!r}")
    return html

if __name__ == "__main__":
    out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist" / "artifact.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    html = assemble()
    out.write_text(html, encoding="utf-8")
    print("wrote", out, len(html.encode("utf-8")), "bytes")
