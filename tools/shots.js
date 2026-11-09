// node tools/shots.js WIDTH HEIGHT SCHEME ENGINE TAG  -> full-page shots of each tab into proof/TAG-<tab>.png, with overflow and error report
const pw = require('playwright'); const path = require('path');
const [W, H, scheme, engine, tag] = [parseInt(process.argv[2] || '390'), parseInt(process.argv[3] || '844'), process.argv[4] || 'light', process.argv[5] || 'webkit', process.argv[6] || 'shot'];
(async()=>{
  const b = await pw[engine].launch();
  const p = await b.newPage({viewport:{width:W,height:H}, deviceScaleFactor:1, colorScheme:scheme});
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + path.resolve(__dirname, '../dist/site/index.html')); await p.waitForTimeout(700);
  for (const t of ['study','line','drill','orient']) {
    await p.click('#tab-' + t); await p.waitForTimeout(300);
    if (t === 'orient') { for (const id of ['o-wrap','o-cut','o-bag','o-temps']) await p.click('#' + id + ' summary'); await p.waitForTimeout(300); }
    if (t === 'drill') { await p.click('#deck-seg button[data-deck="classicsclubs"]'); await p.click('#mode-seg [data-mode="flash"]'); await p.click('#q-area button:has-text("Flip")'); await p.waitForTimeout(1500); }
    await p.screenshot({path: path.resolve(__dirname, `../proof/${tag}-${t}.png`), fullPage: true});
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(t, 'height', await p.evaluate(() => document.documentElement.scrollHeight), 'overflow', over);
  }
  console.log('ERRORS', errs.length ? errs : 'none');
  await b.close();
})();
