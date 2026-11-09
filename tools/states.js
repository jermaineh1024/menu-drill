// node tools/states.js [light|dark] [engine]  -> screenshots of the interactive states at phone size into proof/st-*.png
const pw = require('playwright');
const path = require('path');
const scheme = process.argv[2] || 'light';
const engine = process.argv[3] || 'webkit';
const out = n => path.resolve(__dirname, `../proof/st-${scheme}-${n}.png`);
(async()=>{
  const b = await pw[engine].launch();
  const p = await b.newPage({viewport:{width:390,height:844}, deviceScaleFactor:1, colorScheme:scheme});
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + path.resolve(__dirname, '../dist/site/index.html')); await p.waitForTimeout(600);
  const shot = async (n, full) => { await p.waitForTimeout(700); await p.screenshot({path: out(n), fullPage: !!full}); };
  // 1 sheet for #13
  await p.click('#cold-families .row-sub[data-sub="13"]'); await shot('1-sheet13');
  await p.evaluate(() => document.querySelector('.sheet-panel').scrollTo(0, 500)); await shot('1b-sheet13-low');
  await p.click('#sheet .stack .band[data-ing="Cappacuolo"]'); await shot('2-ing');
  await p.keyboard.press('Escape');
  // hot sub sheet
  await p.click('#glance [data-sub="56"]'); await shot('2b-sheet56');
  await p.keyboard.press('Escape');
  // 3 build mode
  await p.click('#tab-drill'); await p.click('#deck-seg button[data-deck="italian"]'); await p.click('#mode-seg [data-mode="build"]'); await p.waitForTimeout(300);
  await shot('3a-build-empty');
  for (const it of ['Provolone','Ham','Onions','Lettuce']) { const c = p.locator(`#q-area .pool button:has(span:text-is("${it}"))`); if (await c.count() && await c.isEnabled()) await c.click(); }
  await shot('3b-build-mid');
  await p.click('#q-area button:has-text("Check")'); await shot('3c-build-checked', true);
  // 4 order
  await p.click('#mode-seg [data-mode="order"]'); await p.waitForTimeout(300); await shot('4a-order');
  await p.click('#q-area .opt >> nth=0'); await p.waitForTimeout(500); await shot('4b-order-read');
  await p.click('#q-area button:has-text("Now build it")'); await p.waitForTimeout(500); await shot('4c-order-build');
  await p.click('#q-area .pool button >> nth=0'); await p.click('#q-area .pool button >> nth=1'); await p.click('#q-area button:has-text("Check")'); await p.waitForTimeout(500); await shot('4d-order-checked', true);
  // 5 today teach
  await p.click('#today-btn'); await p.waitForTimeout(400);
  for (let i = 0; i < 30; i++) { if (await p.isVisible('#q-area .teach-note')) break;
    if (await p.isVisible('#q-area .opt')) { await p.click('#q-area .opt >> nth=0'); }
    else if (await p.isVisible('#q-area .pool')) { await p.click('#q-area .pool button >> nth=0'); await p.click('#q-area button:has-text("Check")'); }
    await p.click('#q-area .row button:visible:has-text("Next")'); await p.waitForTimeout(80); }
  await shot('5-teach');
  // 6 listen and flash
  await p.click('#mode-seg [data-mode="listen"]'); await p.waitForTimeout(300); await shot('6-listen');
  await p.click('#mode-seg [data-mode="flash"]'); await p.waitForTimeout(300); await p.click('#q-area button:has-text("Flip")'); await shot('6b-flash-back');
  await p.click('#mode-seg [data-mode="what"]'); await p.waitForTimeout(300); await shot('6c-what');
  await p.click('#quiz-list [data-bank="amounts"]'); await p.waitForTimeout(300); await shot('6d-quiz');
  // 7 orientation wrap module + walkthrough
  await p.click('#tab-orient'); await p.click('#o-wrap summary'); await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById('o-wrap').scrollIntoView()); await shot('7a-wrap-open');
  await p.evaluate(() => window.scrollBy(0, 700)); await shot('7b-wrap-steps');
  await p.click('#o-wrap [data-walk]'); await p.waitForTimeout(300); await p.click('#sheet button:has-text("Next")'); await p.click('#sheet button:has-text("Next")'); await p.click('#sheet button:has-text("Next")');
  await shot('7c-walk-step3');
  await p.keyboard.press('Escape');
  // 8 MW game
  await p.click('#tab-line'); await p.evaluate(() => document.getElementById('mw-game').scrollIntoView({block:'center'}));
  for (const it of ['Onions','Lettuce','Tomatoes']) await p.click(`#mw-game .pool button:has(span:text-is("${it}"))`);
  await shot('8-mw-game');
  console.log('ERRORS', errs.length ? errs : 'none');
  await b.close();
})();
