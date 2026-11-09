// node tools/fitcheck.js  -> does a build card keep the sandwich, the chips and Check on one phone screen?
const pw = require('playwright'); const path = require('path');
const out = n => path.resolve(__dirname, `../proof/fit-${n}.png`);
(async()=>{
  const b = await pw.webkit.launch();
  for (const [W,H] of [[390,664],[375,553],[430,740],[1280,800]]) {
    const p = await b.newPage({viewport:{width:W,height:H}});
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.resolve(__dirname, '../dist/site/index.html')); await p.waitForTimeout(400);
    await p.click('#tab-drill'); await p.click('#deck-seg button[data-deck="italian"]'); await p.click('#mode-seg [data-mode="build"]'); await p.waitForTimeout(500);
    const geo = async () => p.evaluate(() => { const q = s => document.querySelector(s); const r = e => e ? e.getBoundingClientRect() : null;
      const tabs = r(q('.tabs')), plate = r(q('#q-area .plate')), win = r(q('#q-area .plate-win')), pool = r(q('#q-area .pool')), row = r(q('#q-area .row:last-of-type')), svg = r(q('#q-area .plate-win svg'));
      return {vh: innerHeight, tabsB: Math.round(tabs.bottom), plateT: Math.round(plate.top), winH: Math.round(win.height), poolH: pool ? Math.round(pool.height) : 0, rowB: Math.round(row.bottom), svgH: Math.round(svg.height), over: q('#q-area .plate-win').classList.contains('over'), name: q('#q-area .plate-head').textContent}; });
    const g0 = await geo();
    console.log(W + 'x' + H, 'start', JSON.stringify(g0), g0.rowB <= g0.vh ? 'FITS' : 'ROW_BELOW_FOLD by ' + (g0.rowB - g0.vh));
    if (W === 390) await p.screenshot({path: out('a-start')});
    // tap the right build, in order
    const order = await p.evaluate(() => null);
    const want = ['Provolone','Ham','Prosciuttini','Cappacuolo','Salami','Pepperoni','Onions','Lettuce','Tomatoes','Red wine vinegar','Olive oil blend','Oregano','Salt'];
    let n = 0;
    for (const it of want) { const c = p.locator(`#q-area .pool button:has(span:text-is("${it}"))`); if (await c.count() && await c.isEnabled()) { await c.click(); n++; if (W === 390 && (n === 3 || n === 8)) { await p.waitForTimeout(350); await p.screenshot({path: out('b-tap' + n)}); } } }
    await p.waitForTimeout(350);
    const g1 = await geo(); console.log('   after', n, 'taps', JSON.stringify(g1));
    if (W === 390) await p.screenshot({path: out('c-full')});
    await p.click('#q-area button:has-text("Check")'); await p.waitForTimeout(700);
    const g2 = await p.evaluate(() => { const q = s => document.querySelector(s); const nx = [...document.querySelectorAll('#q-area .row .btn')].find(b => !b.hidden && b.textContent.startsWith('Next')).getBoundingClientRect(); return {vh: innerHeight, nextB: Math.round(nx.bottom), nextT: Math.round(nx.top), fb: q('#q-area .fb').textContent.slice(0, 60), poolHidden: q('#q-area .pool').hidden, y: Math.round(scrollY)}; });
    console.log('   checked', JSON.stringify(g2), g2.nextB <= g2.vh && g2.nextT > 60 ? 'NEXT_VISIBLE' : 'NEXT_OFFSCREEN');
    if (W === 390) await p.screenshot({path: out('d-checked')});
    if (errs.length) console.log('   ERRORS', errs);
    await p.close();
  }
  await b.close();
})();
