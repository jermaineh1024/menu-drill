// node tools/smoke.js  -> loads the built site in WebKit at phone size, reports console errors, shoots each tab
const { webkit } = require('playwright');
const path = require('path');
(async()=>{
  const b = await webkit.launch();
  const p = await b.newPage({viewport:{width:390,height:844}, deviceScaleFactor:1});
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + path.resolve(__dirname, '../dist/site/index.html')); await p.waitForTimeout(700);
  for (const t of ['study','line','drill','orient']) {
    await p.click('#tab-' + t); await p.waitForTimeout(300);
    await p.screenshot({path: path.resolve(__dirname, `../proof/smoke-${t}.png`), fullPage: true});
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(t, 'height', await p.evaluate(() => document.documentElement.scrollHeight), 'overflow', over);
  }
  console.log('ERRORS', errs.length ? errs : 'none');
  await b.close();
})();
