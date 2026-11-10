// node tools/voice/census.js [out.json]  -> every fixed thing the built page can say, with the fingerprint its recording is filed under.
// It opens dist/site/index.html the way a browser would and asks the page for its own list, so the words are exactly the ones a tap would speak.
const pw = require('playwright'); const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const SITE = 'file://' + path.join(ROOT, 'dist/site/index.html');
const OUT = process.argv[2] || path.join(ROOT, 'dist/spoken.json');
async function ask(browser, when, mess) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 664 } });
  const p = await ctx.newPage();
  if (when) await p.clock.install({ time: new Date(when) });
  await p.addInitScript(() => { window.__speechLog = []; });
  await p.goto(SITE + '#orient'); await p.waitForTimeout(400);
  if (mess) {   // use the page the way a person might before listening: another level, some ticks, other numbers in the practice math
    await p.evaluate(() => {
      const lv = document.querySelector('#path .lv[data-level="3"]'); if (lv) lv.click();
      document.querySelectorAll('ul.ticks li').forEach((li, i) => { if (i % 2 === 0) li.click(); });
      document.querySelectorAll('.calc input').forEach(inp => { inp.value = '7'; inp.dispatchEvent(new Event('input', { bubbles: true })); });
      document.querySelectorAll('#view-orient > details.card').forEach((d, i) => { if (i % 3 === 0) d.open = true; });
    });
    await p.waitForTimeout(300);
  }
  const list = await p.evaluate(() => window.__jmSpoken());
  await ctx.close();
  return list;
}
(async () => {
  const b = await pw.chromium.launch();
  const a = await ask(b, '2026-11-10T09:30:00', false);
  const c = await ask(b, '2026-07-04T18:45:00', true);
  await b.close();
  const ka = a.map(x => x.kind + ':' + x.id + ':' + x.key).join('\n'), kc = c.map(x => x.kind + ':' + x.id + ':' + x.key).join('\n');
  if (ka !== kc) {
    const sb = new Map(c.map(x => [x.kind + ':' + x.id, x]));
    const moved = a.filter(x => { const y = sb.get(x.kind + ':' + x.id); return !y || y.key !== x.key; });
    console.log('CENSUS_NOT_STABLE: ' + moved.length + ' texts change with the clock or with use, e.g. ' + moved.slice(0, 5).map(x => x.kind + ':' + x.id).join(' '));
    process.exit(1);
  }
  const seen = new Map(); let clash = 0;
  for (const x of a) { const was = seen.get(x.key); if (was !== undefined && was !== x.text) clash++; seen.set(x.key, x.text); }
  if (clash) { console.log('CENSUS_KEY_CLASH ' + clash); process.exit(1); }
  fs.writeFileSync(OUT, JSON.stringify(a, null, 1));
  const kinds = {}; let chars = 0; for (const x of a) { kinds[x.kind] = (kinds[x.kind] || 0) + 1; }
  for (const t of seen.values()) chars += t.length;
  console.log('CENSUS_OK ' + a.length + ' texts, ' + seen.size + ' different, ' + chars + ' characters ' + JSON.stringify(kinds));
})();
