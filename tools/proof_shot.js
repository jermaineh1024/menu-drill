// node tools/proof_shot.js IN.html OUT.png [width] [scale]  -> full-page screenshot in Chromium
const { chromium } = require('playwright');
(async()=>{ const [,, inp, out, w, sc] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:+(w||1200),height:800}, deviceScaleFactor:+(sc||1)});
  await p.goto('file://'+require('path').resolve(inp)); await p.waitForTimeout(400);
  await p.screenshot({path: out, fullPage:true}); await b.close(); })();
