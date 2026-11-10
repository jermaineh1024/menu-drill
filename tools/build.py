"""Turn the assembled page into the standalone web app in dist/site/: one index.html that works as a sent file,
plus a manifest, icons and a service worker so the hosted copy installs to a home screen and works offline.
   python3 tools/build.py VERSION      e.g. 2026-11-09d  (the service worker cache name; bump it every release)"""
import base64, os, re, json, sys
from pathlib import Path
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).resolve().parent))
from assemble import assemble

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "site"
OUT.mkdir(parents=True, exist_ok=True)
F = Path(__file__).resolve().parent / "fonts"
if len(sys.argv) != 2 or not re.fullmatch(r"\d{4}-\d{2}-\d{2}[a-z]", sys.argv[1]):
    raise SystemExit("usage: build.py VERSION   like 2026-11-09d")
VERSION = sys.argv[1]
SRC = assemble()

def b64(p):
    return base64.b64encode(p.read_bytes()).decode("ascii")

faces = [
    ("Barlow", 400, F / "barlow-latin-400-normal.woff2"),
    ("Barlow", 500, F / "barlow-latin-500-normal.woff2"),
    ("Barlow", 600, F / "barlow-latin-600-normal.woff2"),
    ("Barlow", 700, F / "barlow-latin-700-normal.woff2"),
    ("Barlow Condensed", 600, F / "barlow-condensed-latin-600-normal.woff2"),
    ("Barlow Condensed", 800, F / "barlow-condensed-latin-800-normal.woff2"),
]
font_css = "".join(
    f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;"
    f"src:url(data:font/woff2;base64,{b64(p)}) format('woff2')}}\n" for fam, w, p in faces)

# strip artifact-only bits
body = SRC
n = 0
body, k = re.subn(r"<title>.*?</title>\s*", "", body, count=1, flags=re.S); n += k
body, k = re.subn(r'<meta name="claude:viewport-fit-sides"[^>]*>\s*', "", body, count=1); n += k
body, k = re.subn(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>\s*', "", body, count=1); n += k
if n != 3: raise SystemExit(f"expected to strip 3 artifact-only head lines, stripped {n}")

# the artifact host adds this reset around every page; the standalone file carries its own
reset = """:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0}
img{max-width:100%}
[hidden]{display:none!important}
"""

sw_reg = """<script>
if (/^https?:$/.test(location.protocol)) {
  var mf = document.createElement('link'); mf.rel = 'manifest'; mf.href = 'manifest.webmanifest'; document.head.appendChild(mf);
}
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
}
</script>"""

head = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="description" content="Unofficial study guide for the Jersey Mike's menu, build order, sprinkling amounts and training.">
<title>Menu Drill</title>
<meta name="theme-color" content="#1F3A5F" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#16294A" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Menu Drill">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>
{font_css}{reset}</style>
"""
html = head + body.replace("<style>", "<style>\n", 1)
# everything up to the end of the page's own <style> belongs in head; then open body
MARK = "/* END-OF-PAGE-STYLE */"
if html.count(MARK) != 1: raise SystemExit("style.css must end with the END-OF-PAGE-STYLE marker exactly once")
idx = html.index("</style>", html.index(MARK)) + len("</style>")

# The recorded voice. audio/ holds one small MP3 for each fixed thing the page says, named by a fingerprint of the exact
# words (tools/voice/record.py makes them). The site is told which fingerprints have a recording; anything else, and the
# copy on claude.ai, is read by the device's own voice.
AUDIO = ROOT / "audio"
keys = sorted(p.stem for p in AUDIO.glob("*.mp3") if re.fullmatch(r"[0-9a-f]{16}", p.stem)) if AUDIO.is_dir() else []
audio_tag = ('<script>window.JM_AUDIO={base:"audio/",keys:"' + " ".join(keys) + '"};</script>\n') if keys else ""
link = OUT / "audio"
if AUDIO.is_dir() and not link.exists() and not link.is_symlink():
    os.symlink(os.path.join("..", "..", "audio"), link)   # so the built site finds the recordings where the live site has them

html = html[:idx] + "\n</head>\n<body>\n" + audio_tag + html[idx:] + "\n" + sw_reg + "\n</body>\n</html>\n"
(OUT / "index.html").write_text(html, encoding="utf-8")

manifest = {
    "name": "Menu Drill",
    "short_name": "Menu Drill",
    "description": "Unofficial study guide for the Jersey Mike's menu and training.",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "background_color": "#DCE6EA",
    "theme_color": "#1F3A5F",
    "icons": [
        {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}
(OUT / "manifest.webmanifest").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

sw = f"""// Keeps the drill working offline after the first visit. Bump VERSION to push an update.
const VERSION = '{VERSION}';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {{
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
}});
self.addEventListener('activate', e => {{
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
}});
// Network first so updates show up right away; the cache covers no signal.
// The recordings are left to the browser: it asks for them a piece at a time, and they are too many to keep on a phone.
self.addEventListener('fetch', e => {{
  if (e.request.method !== 'GET') return;
  if (e.request.headers.has('range') || new URL(e.request.url).pathname.indexOf('/audio/') >= 0) return;
  e.respondWith(
    fetch(e.request).then(r => {{
      const copy = r.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {{}});
      return r;
    }}).catch(() => caches.match(e.request).then(m => m || caches.match('index.html')))
  );
}});
"""
(OUT / "sw.js").write_text(sw, encoding="utf-8")

# icon: a sub seen from the side, on the page's navy
def icon(size, pad_ratio=0.0, radius=True):
    S = 4 * size
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    bg = (31, 58, 95, 255)
    if radius:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=bg)
    else:
        d.rectangle([0, 0, S - 1, S - 1], fill=bg)
    inset = S * (0.10 + pad_ratio)
    x0, x1 = inset, S - inset
    w = x1 - x0
    cy = S * 0.52
    bun = (217, 167, 106, 255)
    d.rounded_rectangle([x0, cy + w * 0.06, x1, cy + w * 0.15], radius=int(w * 0.045), fill=bun)
    layers = [((242, 227, 174, 255), 0.035), ((237, 164, 170, 255), 0.04), ((158, 47, 56, 255), 0.035),
              ((190, 226, 160, 255), 0.04), ((224, 90, 78, 255), 0.035)]
    y = cy + w * 0.06
    for col, h in layers:
        y0 = y - w * h
        d.rounded_rectangle([x0 - w * 0.015, y0, x1 + w * 0.015, y + 1], radius=int(w * 0.03), fill=col)
        y = y0
    d.pieslice([x0, y - w * 0.15, x1, y + w * 0.15], 180, 360, fill=bun)
    d.rectangle([x0, y - 2, x1, y + 2], fill=bun)
    for fx in (0.22, 0.4, 0.6, 0.78):
        cx, cyy = x0 + w * fx, y - w * 0.075
        d.ellipse([cx - w * 0.025, cyy - w * 0.012, cx + w * 0.025, cyy + w * 0.012], fill=(245, 214, 168, 255))
    return im.resize((size, size), Image.LANCZOS)

icon(192).save(OUT / "icon-192.png")
icon(512).save(OUT / "icon-512.png")
icon(512, pad_ratio=0.08, radius=False).save(OUT / "icon-512-maskable.png")
icon(180, radius=False).convert("RGB").save(OUT / "apple-touch-icon.png")
print("built", VERSION, sorted(p.name for p in OUT.iterdir()), "index bytes", (OUT / "index.html").stat().st_size, "recordings", len(keys))
