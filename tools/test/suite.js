// node tools/test/suite.js [--site dist/site/index.html] [--engines chromium,webkit,firefox] [--version 2026-11-09d] [--quick]
// Taps through the built page the way a person would, in every engine, and exits 0 only if every check passed.
// The last line is ALL_CHECKS_PASSED ... on success, CHECKS_FAILED ... otherwise.
const pw = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : dflt; };
const ROOT = path.resolve(__dirname, '../..');
const SITE = path.resolve(ROOT, opt('site', 'dist/site/index.html'));
const URL = 'file://' + SITE;
const ENGINES = opt('engines', 'chromium,webkit,firefox').split(',');
const VERSION = opt('version', null);
const QUICK = args.includes('--quick');

// the page's own data, loaded straight from the source file, so the tests know the right answers without scraping
const DATA = new Function(['10-data.js', '12-train.js'].map(f => fs.readFileSync(path.resolve(ROOT, 'src/js', f), 'utf8')).join('\n') +
  '; return {SUBS, MW, TOP_EXTRAS, LID_ORDER, numbered, BANKS, MODS, SEQS, DECKS, MODES, hotOrder, HOT_AMT, GROUPS, HOWTO_NAME};')();
const subByN = n => DATA.numbered.find(s => String(s.n) === String(n));
const subByName = name => DATA.SUBS.find(s => s.name === name);
const itemsOf = s => s.type === 'cold' ? s.cheese.concat(s.meats, s.fixed, s.mw ? DATA.MW : [], s.lid || []) : DATA.hotOrder(s);
const ALLQ = {}; Object.keys(DATA.BANKS).forEach(b => DATA.BANKS[b].forEach(q => { ALLQ[q.q] = q; }));

let passed = 0; const failures = [];
let scope = '';
function check(name, ok, detail) {
  if (ok) { passed++; return true; }
  failures.push(`[${scope}] ${name}${detail !== undefined ? ' :: ' + String(detail).slice(0, 300) : ''}`);
  console.log(`  FAIL [${scope}] ${name}${detail !== undefined ? ' :: ' + String(detail).slice(0, 300) : ''}`);
  return false;
}

const SPEECH_MOCK = () => {
  window.__spoken = []; window.__cancels = 0;
  function U(t) { this.text = t; }
  window.SpeechSynthesisUtterance = U;
  const synth = {
    speaking: false, pending: false, _t: null,
    getVoices() { return []; },
    addEventListener() {}, removeEventListener() {},
    resume() {},
    cancel() { window.__cancels++; clearTimeout(this._t); this.speaking = false; },
    speak(u) {
      window.__spoken.push(u.text); this.speaking = true;
      const self = this;
      this._t = setTimeout(() => { if (u.onstart) u.onstart(); self._t = setTimeout(() => { self.speaking = false; if (u.onend) u.onend(); }, 25); }, 5);
    }
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  window.__wl = 0; window.__wlr = 0;
  try { Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => { window.__wl++; return { release() { window.__wlr++; }, addEventListener() {} }; } } }); } catch (e) {}
};
const NO_SPEECH = () => {
  Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: undefined, configurable: true });
};
const BAD_STORAGE = () => {
  Storage.prototype.setItem = function () { throw new Error('QuotaExceededError'); };
  Storage.prototype.getItem = function () { throw new Error('SecurityError'); };
};

async function open(browser, o = {}) {
  const ctx = await browser.newContext({
    viewport: o.viewport || { width: 390, height: 664 }, colorScheme: o.scheme || 'light',
    reducedMotion: o.reduced ? 'reduce' : 'no-preference', javaScriptEnabled: o.js !== false, hasTouch: !!o.touch
  });
  const page = await ctx.newPage();
  page.__errs = []; page.__ext = [];
  page.on('pageerror', e => page.__errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') page.__errs.push('console: ' + m.text()); });
  page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) page.__ext.push(r.url()); });
  if (o.init !== null) await page.addInitScript(o.init || SPEECH_MOCK);
  // error events that never become exceptions (a ResizeObserver loop, a failed resource) still count
  if (o.js !== false) {
    await page.exposeFunction('__reportWinError', m => { page.__errs.push('window error: ' + m); });
    await page.addInitScript(() => { window.addEventListener('error', e => { try { window.__reportWinError(String(e.message || (e.target && (e.target.src || e.target.href)) || 'error event')); } catch (x) {} }, true); });
  }
  await page.goto(URL + (o.hash || ''));
  await page.waitForTimeout(250);
  page.__close = () => ctx.close();
  return page;
}
const tab = async (p, t) => { await p.click('#tab-' + t); };
const overflow = p => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const txt = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, sel);
const vis = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return !!e && e.getClientRects().length > 0; }, sel);
const tapChip = (p, name, scopeSel = '#q-area') => p.evaluate(([n, sc]) => {
  const b = [...document.querySelectorAll(sc + ' .pool button')].find(x => x.textContent.trim() === n);
  if (!b || b.disabled) return false; b.click(); return true;
}, [name, scopeSel]);
const clickBtn = (p, label, scopeSel = '#q-area') => p.evaluate(([l, sc]) => {
  const b = [...document.querySelectorAll(sc + ' button')].find(x => x.textContent.trim() === l && !x.hidden && !x.disabled && x.getClientRects().length > 0);
  if (!b) return false; b.click(); return true;
}, [label, scopeSel]);

// ---- what kind of card is showing, and how to answer it ----
const cardKind = p => p.evaluate(() => {
  const q = document.getElementById('q-area'); if (!q || !q.firstElementChild) return 'none';
  const has = s => { const e = q.querySelector(s); return !!e && e.getClientRects().length > 0; };
  if (!q.querySelector('.prog')) { const h2 = q.querySelector('h2'); return h2 ? 'summary' : 'other'; }
  if (q.querySelector('.listen')) return 'listen';
  if (q.querySelector('.ticket')) return 'order';
  if (has('.plate') || has('.steps-pool')) return 'game';
  if (has('.fc')) return 'flash-front';
  if (has('.fc-back')) return 'flash-back';
  if (has('.opts.single')) return 'bank';
  if (has('.opts.numbers')) return 'num';
  if (has('.opts.names')) return 'what';
  if (has('.teach-note')) return 'teach';
  return 'other';
});
function orderExpect(sub, o) {
  if (sub.type !== 'cold') return itemsOf(sub);
  const mw = sub.mw ? DATA.MW.filter(x => x !== o.no) : [];
  const top = o.add.filter(x => DATA.TOP_EXTRAS.includes(x));
  const lid = (sub.lid || []).concat(o.add.filter(x => DATA.LID_ORDER.includes(x))).sort((a, b) => DATA.LID_ORDER.indexOf(a) - DATA.LID_ORDER.indexOf(b));
  return sub.cheese.concat(sub.meats, sub.fixed, mw, top, lid);
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
async function playGame(p, order, right) {
  const seq = right ? order : order.slice().reverse();
  for (const it of seq) { const ok = await tapChip(p, it); if (!ok) return 'no chip: ' + it; }
  if (!await clickBtn(p, 'Check')) return 'no Check';
  return null;
}
// answers the card on screen; right=false answers it wrong on purpose. Returns the kind it handled.
async function answer(p, right = true) {
  const kind = await cardKind(p);
  if (kind === 'teach') { await clickBtn(p, 'Got it, ask me'); return answer(p, right); }
  if (kind === 'flash-front') { await clickBtn(p, 'Flip'); await clickBtn(p, right ? 'Got it' : 'Missed it'); return 'flash'; }
  if (kind === 'num' || kind === 'what') {
    const name = kind === 'num' ? await txt(p, '#q-area .q-name') : (await p.getAttribute('#q-area svg.stack', 'aria-label')).split(':')[0];
    const sub = subByName(name);
    if (!sub) { check('card names a real sub', false, name); return kind; }
    await p.evaluate(([id, r]) => { const bs = [...document.querySelectorAll('#q-area .opt')]; (r ? bs.find(b => b.dataset.id === id) : bs.find(b => b.dataset.id !== id)).click(); }, [String(sub.id), right]);
    const fbOk = await p.evaluate(() => document.querySelector('#q-area .fb').classList.contains('ok'));
    check(kind + ' feedback matches the answer', fbOk === right, name);
    const said = await txt(p, '#q-area .fb'); check('feedback never says "the The"', !/the The /.test(said), said);
    await clickBtn(p, 'Next'); return kind;
  }
  if (kind === 'bank') {
    const qt = await txt(p, '#q-area .q-text'); const q = ALLQ[qt];
    if (!q) { check('quiz question is in the bank', false, qt); return kind; }
    await p.evaluate(([a, r]) => { const bs = [...document.querySelectorAll('#q-area .opt')]; (r ? bs.find(b => b.dataset.o === a) : bs.find(b => b.dataset.o !== a)).click(); }, [q.a, right]);
    const fbOk = await p.evaluate(() => document.querySelector('#q-area .fb').classList.contains('ok'));
    check('quiz feedback matches the answer', fbOk === right, qt);
    await clickBtn(p, 'Next'); return kind;
  }
  if (kind === 'game') {
    const head = await p.evaluate(() => { const h = document.querySelector('#q-area .plate-head .tag'); return h ? h.textContent.trim() : null; });
    let order;
    if (head) { const sub = subByN(head); if (!sub) { check('build names a real sub', false, head); return kind; } order = itemsOf(sub); }
    else { const title = await txt(p, '#q-area .q-name'); const key = Object.keys(DATA.SEQS).find(k => DATA.SEQS[k].title === title); if (!key) { check('sequence is known', false, title); return kind; } order = DATA.SEQS[key].steps; }
    const err = await playGame(p, order, right);
    check('game can be played', !err, err);
    const fbOk = await p.evaluate(() => document.querySelector('#q-area .fb:not([hidden])') ? document.querySelector('#q-area .fb:not([hidden])').classList.contains('ok') : null);
    check('game feedback matches the answer', fbOk === right, (head || 'seq') + ' fb=' + fbOk);
    await clickBtn(p, 'Next'); return kind;
  }
  if (kind === 'order') {
    const chips = await p.evaluate(() => [...document.querySelectorAll('#q-area .ticket .tchips span')].map(s => s.textContent.trim()));
    const o = { size: chips[0], who: chips[1], bread: chips[2].toLowerCase(), mw: chips.includes("Mike's Way"), no: null, add: [] };
    chips.forEach(c => { if (/^No /.test(c)) o.no = cap(c.slice(3)); if (/^Add /.test(c)) o.add.push(cap(c.slice(4))); });
    const sub = o.who.startsWith('#') ? subByN(o.who.slice(1)) : subByName(o.who);
    if (!sub) { check('order names a real sub', false, o.who); return kind; }
    let line = o.size + ' ' + (sub.lto ? sub.name : sub.n) + (o.mw ? ", Mike's Way" : '');
    if (o.no) line += ', no ' + o.no.toLowerCase();
    o.add.forEach(a => { line += ', add ' + a.toLowerCase(); });
    line += ', on ' + o.bread + '?';
    const found = await p.evaluate(([l, r]) => { const bs = [...document.querySelectorAll('#q-area .opt')]; const b = r ? bs.find(x => x.dataset.o === l) : bs.find(x => x.dataset.o !== l); if (!b) return false; b.click(); return true; }, [line, right]);
    check('the right read-back is one of the choices', found, line);
    check('Now build it appears', await clickBtn(p, 'Now build it'));
    const og = await p.evaluate(() => { const r = [...document.querySelectorAll('#q-area .row')].filter(x => x.getClientRects().length).pop().getBoundingClientRect(), pl = document.querySelector('#q-area .plate').getBoundingClientRect(), tb = document.querySelector('.tabs').getBoundingClientRect(); return { rowB: Math.round(r.bottom), plateT: Math.round(pl.top), tabsB: Math.round(tb.bottom), vh: innerHeight, vw: innerWidth }; });
    if (og.vw >= 390 && og.vh >= 664) check('order: sandwich, chips and Check fit one phone screen', og.rowB <= og.vh + 1 && og.plateT >= og.tabsB - 1, JSON.stringify(og) + ' ' + JSON.stringify(o));
    const err = await playGame(p, orderExpect(sub, o), right);
    check('order can be built', !err, err + ' ' + JSON.stringify(o));
    const fbOk = await p.evaluate(() => { const f = [...document.querySelectorAll('#q-area .fb')].filter(x => !x.hidden && x.getClientRects().length > 0).pop(); return f ? f.classList.contains('ok') : null; });
    check('order feedback matches the answer', fbOk === right, JSON.stringify(o) + ' fb=' + fbOk);
    if (o.no) { const amt = (await txt(p, '#q-area .amt-line')) || ''; check('amounts leave out what the guest took off', !amt.toLowerCase().includes(o.no.toLowerCase()), o.no + ' :: ' + amt); }
    await clickBtn(p, 'Next guest'); return kind;
  }
  return kind;
}
async function runToEnd(p, right, max = 200) {
  const kinds = {};
  for (let i = 0; i < max; i++) {
    const k = await cardKind(p);
    if (k === 'summary' || k === 'none' || k === 'other' || k === 'listen') return { end: k, kinds };
    const did = await answer(p, typeof right === 'function' ? right(i) : right);
    kinds[did] = (kinds[did] || 0) + 1;
  }
  return { end: 'too long', kinds };
}
const startRun = async (p, mode, deck) => { await tab(p, 'drill'); if (deck) await p.click(`#deck-seg button[data-deck="${deck}"]`); if (mode) await p.click(`#mode-seg [data-mode="${mode}"]`); };

// ---- page-wide audits, run inside the page ----
const TAP_AUDIT = () => {
  const bad = [];
  document.querySelectorAll('button, [role=button], summary, a[href], label.switch, .tab').forEach(el => {
    if (el.closest('svg') || el.closest('[hidden]') || el.disabled) return;   // thin bands in the sub picture have full-size twins right under it
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (getComputedStyle(el).visibility === 'hidden') return;
    if (r.height < 43.5 || r.width < 43.5) bad.push((el.id || el.className || el.tagName) + ' "' + el.textContent.trim().slice(0, 24) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height));
  });
  return bad;
};
const CONTRAST_AUDIT = () => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const bgOf = el => { const layers = []; for (let e = el; e; e = e.parentElement) { const bg = parse(getComputedStyle(e).backgroundColor); if (bg && bg.a > 0) { layers.push(bg); if (bg.a >= 1) break; } } let base = { r: 255, g: 255, b: 255, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base); return base; };
  const bad = []; const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement;
    if (!el || seen.has(el) || el.closest('svg, .sr, script, style, noscript, [hidden], [inert]')) continue;
    seen.add(el);
    if (!el.getClientRects().length) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden') continue;
    if (el.closest('button:disabled, [aria-disabled=true]')) continue;   // greyed-out controls are exempt
    let op = 1; for (let e = el; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
    if (op < 0.05) continue;
    const bg = bgOf(el); let fg = parse(cs.color); if (!fg) continue;
    fg = over({ r: fg.r, g: fg.g, b: fg.b, a: fg.a * op }, bg);
    const l1 = lum(fg), l2 = lum(bg), ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
    const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    if (ratio < need) bad.push(ratio.toFixed(2) + ' < ' + need + ' "' + n.nodeValue.trim().slice(0, 30) + '" ' + (el.className || el.tagName) + ' ' + cs.color + ' on rgb(' + [bg.r, bg.g, bg.b].map(Math.round) + ')');
  }
  return bad;
};

// Every label inside a picture: is it cut by the picture's own edge, or printed over another label?
// Sideways the measure is exact. Up and down, Firefox reports a taller box than the ink, so 1px is allowed there,
// and two labels only count as colliding when they share most of a line.
const PIC_AUDIT = () => {
  const res = []; let pics = 0, labels = 0;
  document.querySelectorAll('svg').forEach(svg => {
    if (!svg.getClientRects().length) return;
    const ts = [...svg.querySelectorAll('text')].filter(t => t.textContent.trim() && t.getClientRects().length);
    if (!ts.length) return;
    pics++; labels += ts.length;
    const s = svg.getBoundingClientRect();
    const host = svg.closest('details, .card, section'); const where = (host && (host.id || host.className)) || '?';
    const rs = ts.map(t => ({ t: t.textContent.trim(), r: t.getBoundingClientRect() }));
    rs.forEach(a => {
      if (a.r.left < s.left - 0.5 || a.r.right > s.right + 0.5 || a.r.top < s.top - 1 || a.r.bottom > s.bottom + 1)
        res.push(`${where} CUT "${a.t}" x ${(a.r.left - s.left).toFixed(1)}..${(a.r.right - s.left).toFixed(1)} of ${s.width.toFixed(0)}, y ${(a.r.top - s.top).toFixed(1)}..${(a.r.bottom - s.top).toFixed(1)} of ${s.height.toFixed(0)}`);
    });
    if (!svg.classList.contains('pic')) return;   // the older drawings cross-fade labels on purpose; the diagrams never do
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
      const a = rs[i].r, c = rs[j].r;
      const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
      if (ox > 2 && oy > 0.7 * Math.min(a.height, c.height)) res.push(`${where} OVERLAP "${rs[i].t}" and "${rs[j].t}" by ${ox.toFixed(1)} x ${oy.toFixed(1)}`);
    }
  });
  return { res, pics, labels };
};

// =====================================================================================================
async function engineSuite(name) {
  const browser = await pw[name].launch();
  const S = s => { scope = name + ' ' + s; };
  const phone = { width: 390, height: 664 };

  // ---------- 1. loads clean, four tabs, nothing wider than the screen ----------
  for (const [label, vp] of [['phone', phone], ['small phone', { width: 320, height: 568 }], ['laptop', { width: 1280, height: 800 }]]) {
    S('load ' + label);
    const p = await open(browser, { viewport: vp });
    for (const t of ['study', 'line', 'drill', 'orient']) {
      await tab(p, t);
      check(t + ' tab shows its view', await vis(p, '#view-' + t));
      const hsh = await p.evaluate(() => location.hash); check(t + ' hash', hsh === '#' + t || (t === 'study' && hsh === ''), hsh);
      if (t === 'orient') {
        await p.evaluate(() => document.querySelectorAll('#view-orient details').forEach(d => { d.open = true; }));
        const out = await p.evaluate(() => [...document.querySelectorAll('#view-orient details.card > svg, #view-orient details.card .howto-pic, #view-orient details.card svg.stack')].filter(s => { const r = s.getBoundingClientRect(), c = s.closest('details').getBoundingClientRect(); return r.left < c.left + 9 || r.right > c.right - 9; }).map(s => s.getAttribute('class')));
        check('orientation drawings stay inside their card', out.length === 0, out.join(' '));
      }
      const ov = await overflow(p); check(t + ' has no sideways scroll', ov <= 0, ov + 'px');
      if (label !== 'small phone') { const bad = await p.evaluate(TAP_AUDIT); check(t + ' tap targets are 44px', bad.length === 0, bad.slice(0, 6).join(' | ')); }
    }
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    check('nothing fetched from outside', p.__ext.length === 0, p.__ext.slice(0, 3).join(' '));
    await p.__close();
  }

  // ---------- 1a. picture labels: none cut by the picture's edge, none on top of another (found Nov 9: Firefox sets type a hair wider) ----------
  for (const [label, vp] of [['phone', phone], ['laptop', { width: 1280, height: 800 }]]) {
    S('pictures ' + label);
    const p = await open(browser, { viewport: vp });
    let pics = 0, labels = 0;
    for (const t of ['study', 'line', 'drill', 'orient']) {
      await tab(p, t);
      await p.evaluate(() => { document.querySelectorAll('details').forEach(d => { d.open = true; }); const o = document.getElementById('view-orient'); if (o && o.hasAttribute('data-show')) o.setAttribute('data-show', 'all'); });
      await p.waitForTimeout(200);
      const out = await p.evaluate(PIC_AUDIT);
      pics += out.pics; labels += out.labels;
      check(t + ': no picture label is cut by its picture or sits on another label', out.res.length === 0, out.res.slice(0, 5).join(' | '));
    }
    check('the picture audit saw the pictures', pics >= 80 && labels >= 700, pics + ' pictures, ' + labels + ' labels');
    await p.__close();
  }

  // ---------- 1b. the finish: gradients are there, motion runs, and it stops when asked ----------
  S('finish');
  {
    const p = await open(browser);
    const look = await p.evaluate(() => { const g = s => getComputedStyle(document.querySelector(s)).backgroundImage; return { head: g('.topbar'), tabs: g('.tabs'), band: g('.today-card'), btn: g('.btn.light'), tag: g('#glance .tag'), card: g('#j-how') }; });
    check('header, tabs, cards, buttons and number tiles carry gradients', Object.values(look).every(v => /gradient/.test(v)), JSON.stringify(look).slice(0, 200));
    const moving = () => p.evaluate(() => document.querySelector('.topbar').getAnimations({ subtree: true }).filter(a => a.playState === 'running').length);
    check('the water under the title is moving', (await moving()) >= 2, await moving());
    const a = await p.locator('.topbar').screenshot(); await p.waitForTimeout(900); const b = await p.locator('.topbar').screenshot();
    check('and it shows: two looks at the header differ', Buffer.compare(a, b) !== 0);
    check('sandwich layers are shaded', (await p.evaluate(() => document.querySelectorAll('#cold-families svg.stack rect[fill="url(#g-band)"]').length)) >= 40);
    // a clean run throws toppings, then tidies up
    await startRun(p, 'num', 'italian'); await runToEnd(p, true);
    check('a clean run throws toppings', (await p.evaluate(() => document.querySelectorAll('#q-area .done-card .confetti i').length)) === 22);
    await p.waitForTimeout(1900);
    check('and clears them away', (await p.evaluate(() => document.querySelectorAll('#q-area .confetti').length)) === 0);
    const ov = await overflow(p); check('no sideways scroll after the celebration', ov <= 0, ov);
    // the bars move while Listen is talking
    await p.evaluate(() => { window.__spoke = false; new MutationObserver(() => { if (document.querySelector('#q-area .listen.speaking')) window.__spoke = true; }).observe(document.getElementById('q-area'), { subtree: true, attributes: true, attributeFilter: ['class'] }); });
    await p.click('#mode-seg [data-mode="listen"]'); await p.click('#q-area .listen-play');
    check('listen bars move while it talks', await p.waitForFunction(() => window.__spoke === true, null, { timeout: 3000 }).then(() => true, () => false));
    await p.click('#q-area .listen-play');
    check('and rest when it stops', !(await p.evaluate(() => document.querySelector('#q-area .listen').classList.contains('speaking'))));
    check('each way to practice has its picture', (await p.evaluate(() => [...document.querySelectorAll('#mode-seg .mode svg.mode-ic path')].filter(x => (x.getAttribute('d') || '').length > 20).length)) === 6);
    // the switch stops the background motion as well as the pictures
    await tab(p, 'orient'); await p.click('#motion-toggle');
    check('the motion switch stills the water', (await moving()) === 0, await moving());
    await startRun(p, 'num', 'italian'); await runToEnd(p, true);
    check('and holds the toppings', (await p.evaluate(() => document.querySelectorAll('#q-area .confetti').length)) === 0);
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
    const r = await open(browser, { reduced: true });
    check('reduced motion: nothing in the header moves', (await r.evaluate(() => document.querySelector('.topbar').getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)) === 0);
    await r.__close();
  }

  // ---------- 2. tabs by keyboard, deep link ----------
  S('tabs');
  {
    const p = await open(browser, { hash: '#orient' });
    check('deep link opens Orientation', await vis(p, '#view-orient'));
    await p.focus('#tab-orient'); await p.keyboard.press('ArrowLeft');
    check('arrow key moves to Drill', await vis(p, '#view-drill') && (await p.evaluate(() => document.activeElement.id)) === 'tab-drill');
    await p.keyboard.press('Home'); check('Home goes to Study', await vis(p, '#view-study'));
    check('one tab is in the tab order', (await p.evaluate(() => [...document.querySelectorAll('.tab')].filter(b => b.tabIndex === 0).length)) === 1);
    await p.__close();
  }

  // ---------- 3. the detail sheet ----------
  S('sheet');
  {
    const p = await open(browser);
    check('study lists every board sub with a picture', (await p.evaluate(() => document.querySelectorAll('#view-study .row-sub[data-sub] svg.stack').length)) === 19);
    check('no ingredient is missing its color', (await p.evaluate(() => [...document.querySelectorAll('svg.stack rect')].filter(r => r.getAttribute('fill') === '#CFD6DD').length)) === 0);
    await p.focus('#cold-families .row-sub[data-sub="13"]'); await p.keyboard.press('Enter');
    check('Enter on a sub opens the sheet', !(await p.evaluate(() => document.getElementById('sheet').hidden)));
    check('sheet names the sub', (await txt(p, '#sheet-title')) === 'The Original Italian');
    check('page behind is inert', await p.evaluate(() => document.getElementById('main').hasAttribute('inert')));
    check('sheet picture has 13 layers and a list for screen readers', (await p.evaluate(() => document.querySelectorAll('#sheet ol.sr li').length)) === 13);
    const amtReg = await p.evaluate(() => [...document.querySelectorAll('#sheet ol.sr li')].map(l => l.textContent).join('|'));
    check('regular amounts show', /Onions, 4 to 6 rings/.test(amtReg) && /Tomatoes, 3 slices/.test(amtReg), amtReg);
    await clickBtn(p, 'Giant', '#sheet');
    const amtG = await p.evaluate(() => [...document.querySelectorAll('#sheet ol.sr li')].map(l => l.textContent).join('|'));
    check('giant amounts show after picking Giant', /Onions, 8 to 10 rings/.test(amtG) && /Tomatoes, 5 slices/.test(amtG), amtG);
    check('say-back follows the size', /Giant 13, Mike's Way, on white\?/.test(await txt(p, '#sheet .say q')), await txt(p, '#sheet .say q'));
    for (let i = 0; i < 25; i++) await p.keyboard.press('Tab');
    check('Tab stays inside the sheet', await p.evaluate(() => document.getElementById('sheet').contains(document.activeElement)));
    const ov = await overflow(p); check('sheet has no sideways scroll', ov <= 0, ov);
    const bad = await p.evaluate(TAP_AUDIT); check('sheet tap targets are 44px', bad.length === 0, bad.slice(0, 6).join(' | '));
    await p.click('#sheet .ing-row [data-ing="Cappacuolo"]');
    check('ingredient sheet opens', (await txt(p, '#sheet-title')) === 'Cappacuolo');
    check('ingredient lists the subs it is on', (await p.evaluate(() => [...document.querySelectorAll('#sheet .row-sub[data-sub]')].map(r => r.dataset.sub).join(','))) === '2,5,13');
    check('Back is offered', !(await p.evaluate(() => document.getElementById('sheet-back').hidden)));
    await p.click('#sheet-back'); check('Back returns to the sub', (await txt(p, '#sheet-title')) === 'The Original Italian');
    await p.evaluate(() => document.querySelector('#sheet svg.stack .band[data-ing="Ham"]').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    check('tapping a band in the picture opens that ingredient', (await txt(p, '#sheet-title')) === 'Ham');
    check('the picture adds no dead keyboard stops', (await p.evaluate(() => document.querySelectorAll('#sheet svg [tabindex], #sheet svg [role=button]').length)) === 0);
    await p.keyboard.press('Escape');
    check('Escape closes the sheet', await p.evaluate(() => document.getElementById('sheet').hidden));
    check('focus goes back to the row that opened it', (await p.evaluate(() => document.activeElement.getAttribute('data-sub'))) === '13');
    check('page is live again', !(await p.evaluate(() => document.getElementById('main').hasAttribute('inert'))));
    await p.evaluate(() => { localStorage.setItem('probe', '1'); });
    await p.reload(); await p.waitForTimeout(200);
    await p.click('#glance [data-sub="13"]');
    check('size choice is remembered', /Giant 13/.test(await txt(p, '#sheet .say q')));
    check('Read it to me speaks the sub', await clickBtn(p, 'Read it to me', '#sheet') && await p.waitForFunction(() => window.__spoken.length > 0, null, { timeout: 2000 }).then(() => true, () => false));
    check('it says capicola, not the spelling', await p.waitForFunction(() => window.__spoken.join(' ').includes('capicola'), null, { timeout: 3000 }).then(() => true, () => false), await p.evaluate(() => window.__spoken.join(' ')));
    check('read-aloud says olive oil blend, like the page', await p.waitForFunction(() => window.__spoken.join(' ').includes('olive oil blend'), null, { timeout: 4000 }).then(() => true, () => false), await p.evaluate(() => window.__spoken.join(' ')));
    await clickBtn(p, 'Close', '#sheet');
    await p.evaluate(() => { window.__spoken.length = 0; });
    await p.click('#glance [data-sub="44"]'); await clickBtn(p, 'Read it to me', '#sheet');
    await p.waitForFunction(() => window.__spoken.join(' ').includes('melted on top'), null, { timeout: 4000 }).catch(() => {});
    const heard = await p.evaluate(() => window.__spoken.join(' '));
    check('read-aloud of a sub with nothing else on the grill has no stray comma', /On the grill: Chicken\./.test(heard) && !/, \./.test(heard), heard);
    await clickBtn(p, 'Close', '#sheet');
    // a hot sub's sheet: regular and giant only, amounts from the grill video, read out in the order it is made
    await p.evaluate(() => { try { localStorage.setItem('jm-size', 'regular'); } catch (e) {} }); await p.reload(); await p.waitForTimeout(200);
    await p.click('#glance [data-sub="26"]');
    check('hot sub sheet offers regular and giant, no mini', (await p.evaluate(() => [...document.querySelectorAll('#sheet .sizes button')].map(b => b.textContent).join(','))) === 'Regular,Giant');
    const hot26 = await p.evaluate(() => [...document.querySelectorAll('#sheet ol.sr li')].map(l => l.textContent).join(' | '));
    check('#26 reads in the order it is made, with regular amounts', hot26 === 'Ranch, 3 lines, on the lid | Bacon, 2 slices, on the lid | Tomatoes, 3 slices, on the lid | Chicken | White American, 3 slices | Lettuce, 2 soufflé cups', hot26);
    await clickBtn(p, 'Giant', '#sheet');
    const hot26g = await p.evaluate(() => [...document.querySelectorAll('#sheet ol.sr li')].map(l => l.textContent).join(' | '));
    check('#26 giant amounts', /Bacon, 4 slices/.test(hot26g) && /Tomatoes, 5 slices/.test(hot26g) && /White American, 6 slices/.test(hot26g) && /Lettuce, 4 soufflé cups/.test(hot26g), hot26g);
    const nums26 = await p.evaluate(() => [...document.querySelectorAll('#sheet svg.stack .ly')].map(g => { const t = [...g.querySelectorAll('text')].map(x => x.textContent); return t[0] + ':' + t[1]; }).join(','));
    check('#26 picture: lid numbered 1 to 3 at the top, lettuce last', nums26.startsWith('4:Chicken,5:White American,6:Lettuce,3:Tomatoes,2:Bacon,1:Ranch'), nums26);
    await clickBtn(p, 'Close', '#sheet');
    await p.click('#glance [data-sub="56"]');
    const hot56 = await p.evaluate(() => [...document.querySelectorAll('#sheet ol.sr li')].map(l => l.textContent).join(' | '));
    check('#56 giant doubles the regular', hot56 === 'Grilled onions, 2.5 oz | Grilled peppers, 1.5 oz | Mushrooms, 1.5 oz | Jalapeños, 8 to 10 | Steak | Extra White American, 8 slices', hot56);
    await clickBtn(p, 'Regular', '#sheet');
    check('#56 regular: 4 slices of cheese', /Extra White American, 4 slices/.test(await p.evaluate(() => [...document.querySelectorAll('#sheet ol.sr li')].map(l => l.textContent).join(' | '))));
    const ovh = await overflow(p); check('hot sub sheet has no sideways scroll', ovh <= 0, ovh);
    await clickBtn(p, 'Close', '#sheet');
    check('the Study list tells a hot sub in the order it is made', /Blue cheese dressing, Tomatoes on the lid first.*Chicken.*Frank's RedHot.*White American.*Lettuce/.test(await txt(p, '#hot-families .row-sub[data-sub="44"] .build')), await txt(p, '#hot-families .row-sub[data-sub="44"] .build'));
    // the browser's Back button with a sheet open
    await tab(p, 'line'); await tab(p, 'study'); await p.click('#glance [data-sub="13"]');
    await p.goBack(); await p.waitForTimeout(150);
    check('Back with a sheet open closes the sheet', await p.evaluate(() => document.getElementById('sheet').hidden) && await vis(p, '#view-line'));
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }

  // ---------- 4. build every sub on the board, right and wrong ----------
  S('build');
  {
    const p = await open(browser);
    const subs = QUICK ? DATA.numbered.slice(0, 4) : DATA.numbered;
    for (const sub of subs) {
      await tab(p, 'study'); await p.click(`#glance [data-sub="${sub.id}"]`);
      await clickBtn(p, 'Build this one', '#sheet');
      check(`#${sub.n} build card names it`, (await txt(p, '#q-area .plate-head .tag')) === String(sub.n));
      const g = await p.evaluate(() => { const r = [...document.querySelectorAll('#q-area .row')].pop().getBoundingClientRect(), pl = document.querySelector('#q-area .plate').getBoundingClientRect(), tb = document.querySelector('.tabs').getBoundingClientRect(); return { rowB: r.bottom, plateT: pl.top, tabsB: tb.bottom, vh: innerHeight }; });
      check(`#${sub.n} sandwich, chips and Check fit one phone screen`, g.rowB <= g.vh + 1 && g.plateT >= g.tabsB - 1, JSON.stringify(g));
      const err = await playGame(p, itemsOf(sub), true);
      check(`#${sub.n} can be built`, !err, err);
      const fb = await txt(p, '#q-area .fb b');
      check(`#${sub.n} right build is accepted`, fb === (sub.type === 'cold' ? 'Clean build.' : "That's how it's made."), fb);
      check(`#${sub.n} all layers show after Check`, (await p.evaluate(() => document.querySelectorAll('#q-area .plate-win svg .ly').length)) === itemsOf(sub).length + 1);
      const nx = await p.evaluate(() => { const b = [...document.querySelectorAll('#q-area .row button')].find(x => !x.hidden && x.textContent === 'Next'); const r = b.getBoundingClientRect(); return { t: r.top, b: r.bottom, vh: innerHeight, focus: document.activeElement === b }; });
      check(`#${sub.n} Next is on screen and focused after a right build`, nx.focus && nx.b <= nx.vh + 1 && nx.t >= 0, JSON.stringify(nx));
      await clickBtn(p, 'Next');
      check(`#${sub.n} run of one ends clean`, (await txt(p, '#q-area h2')) === 'Clean run');
    }
    // a wrong build
    await tab(p, 'study'); await p.click('#glance [data-sub="8"]'); await clickBtn(p, 'Build this one', '#sheet');
    await playGame(p, ['Provolone', 'Turkey', 'Ham', 'Mayo', 'Bacon'].concat(DATA.MW), true);
    check('lid before Mike\'s Way is caught', /Mayo and bacon go on the lid, after Mike's Way/.test(await txt(p, '#q-area .fb')), await txt(p, '#q-area .fb'));
    check('wrong build shows the right one', await vis(p, '#q-area .fb svg.stack'));
    check('wrong layers are marked', (await p.evaluate(() => document.querySelectorAll('#q-area .plate-win svg rect[stroke="#B3261E"]').length)) >= 1);
    await clickBtn(p, 'Next');
    check('missed sub is listed at the end', (await txt(p, '#q-area h2')) === 'Done' && await vis(p, '#q-area .row-sub[data-sub="8"]'));
    await clickBtn(p, 'Close');
    for (const [id, order, why] of [
      [14, ['Swiss', 'Provolone'].concat(DATA.MW, ['Green bell peppers']), /Green bell peppers goes on before Mike's Way/],
      [13, ['Provolone', 'Pepperoni', 'Salami', 'Cappacuolo', 'Prosciuttini', 'Ham'].concat(DATA.MW), /order the board lists them/],
      [14, ['Provolone', 'Swiss', 'Green bell peppers'].concat(DATA.MW), /board lists the cheese as swiss, then provolone/]]) {
      await tab(p, 'study'); await p.click(`#glance [data-sub="${id}"]`); await clickBtn(p, 'Build this one', '#sheet');
      await playGame(p, order, true);
      check(`#${id} built out of the picture's order is caught`, why.test(await txt(p, '#q-area .fb')) && (await txt(p, '#q-area .fb b')) === 'Not yet.', await txt(p, '#q-area .fb'));
      await clickBtn(p, 'Next');
    }
    await tab(p, 'study'); await p.click('#glance [data-sub="8"]'); await clickBtn(p, 'Build this one', '#sheet');
    await playGame(p, ['Provolone'], true); await clickBtn(p, 'Next');
    // undo, and keyboard focus moving on
    await clickBtn(p, 'Run it again');
    await p.evaluate(() => [...document.querySelectorAll('#q-area .pool button')].find(b => b.textContent.trim() === 'Provolone').focus());
    await p.keyboard.press('Enter');
    check('a used chip greys out and focus moves to a live one', await p.evaluate(() => { const a = document.activeElement; return a && a.tagName === 'BUTTON' && !a.disabled && !!a.closest('#q-area'); }));
    check('layer landed', (await p.evaluate(() => document.querySelectorAll('#q-area .plate-win svg .ly').length)) === 1);
    await clickBtn(p, 'Undo');
    check('Undo takes it off', (await p.evaluate(() => document.querySelectorAll('#q-area .plate-win svg .ly').length)) === 0 && !(await p.evaluate(() => [...document.querySelectorAll('#q-area .pool button')].find(b => b.textContent.trim() === 'Provolone').disabled)));
    // hot subs are built in the order the grill video makes them: the lid first, what cooks, the cheese, the finish
    const hotBuild = async (id, order) => { await tab(p, 'study'); await p.click(`#glance [data-sub="${id}"]`); await clickBtn(p, 'Build this one', '#sheet'); const err = await playGame(p, order, true); const fb = await txt(p, '#q-area .fb'); return { err, fb, ok: await p.evaluate(() => document.querySelector('#q-area .fb').classList.contains('ok')) }; };
    for (const [id, order, why, label] of [
      [26, ['Chicken', 'Ranch', 'Bacon', 'Tomatoes', 'White American', 'Lettuce'], /The lid comes first on a hot sub: ranch, bacon, tomatoes/, 'the lid dressed after the meat is caught'],
      [26, ['Bacon', 'Ranch', 'Tomatoes', 'Chicken', 'White American', 'Lettuce'], /On the lid, in order: ranch, then bacon, then tomatoes/, 'the lid dressed out of order is caught'],
      [26, ['Ranch', 'Bacon', 'Tomatoes', 'Lettuce', 'Chicken', 'White American'], /Lettuce goes on last/, 'lettuce before the meat is caught'],
      [44, ['Blue cheese dressing', 'Tomatoes', 'Chicken', 'White American', "Frank's RedHot", 'Lettuce'], /Frank's RedHot goes on once the chicken is cooked, right before the cheese/, 'hot sauce after the cheese is caught'],
      [17, ['White American', 'Grilled onions', 'Grilled peppers', 'Steak'], /Cheese goes on top after everything on the grill is cooked/, 'cheese before the meat is caught'],
      [43, ['Grilled onions', 'Grilled peppers', 'Steak', 'White American', 'Chipotle mayo'], /The lid comes first on a hot sub: chipotle mayo/, 'chipotle mayo at the end is caught'],
      [17, ['Steak', 'Grilled onions', 'Grilled peppers', 'White American'], /On the grill, the onions and peppers go down first, then the steak/, 'the steak down before the onions and peppers is caught'],
      [17, ['Grilled peppers', 'Grilled onions', 'Steak', 'White American'], /Onions go down first\. The peppers go on top of them/, 'peppers down before the onions is caught'],
      [55, ['Grilled onions', 'Chicken', 'Grilled peppers', 'Mushrooms', 'Jalapeños', 'Extra White American'], /On the grill, the onions, peppers, mushrooms and jalapeños go down first, then the chicken/, 'the chicken down in the middle of the vegetables is caught']]) {
      const r = await hotBuild(id, order);
      check(`#${id}: ${label}`, !r.err && !r.ok && why.test(r.fb), r.err + ' ' + r.fb);
      check(`#${id}: a wrong hot build shows the right one, numbered`, await vis(p, '#q-area .fb svg.stack'));
      await clickBtn(p, 'Next'); await clickBtn(p, 'Close');
    }
    // the video adds mushrooms and jalapeños "when putting the onions and peppers on the grill", so those two can land anywhere among the vegetables
    { const r = await hotBuild(56, ['Mushrooms', 'Grilled onions', 'Jalapeños', 'Grilled peppers', 'Steak', 'Extra White American']); check('#56: mushrooms and jalapeños can go down anywhere among the vegetables', !r.err && r.ok, r.fb); await clickBtn(p, 'Next'); await clickBtn(p, 'Close'); }
    // while you build a hot sub, the lid's toppings hang under the top bread and the meat stacks from the bottom
    await tab(p, 'study'); await p.click('#glance [data-sub="26"]'); await clickBtn(p, 'Build this one', '#sheet');
    check('a hot build starts with both halves of the bread and nothing between', (await p.evaluate(() => document.querySelectorAll('#q-area .plate-win svg .ly').length)) === 1);
    await tapChip(p, 'Ranch'); await tapChip(p, 'Bacon'); await tapChip(p, 'Chicken');
    const bands = await p.evaluate(() => [...document.querySelectorAll('#q-area .plate-win svg .ly')].map(g => [...g.querySelectorAll('text')].map(t => t.textContent).join(' ')));
    check('lid toppings sit under the lid in the order they went on, the meat at the bottom', bands.length === 4 && /^3 Chicken/.test(bands[0]) && /^2 Bacon/.test(bands[1]) && /^1 Ranch/.test(bands[2]) && /Top bread/.test(bands[3]), JSON.stringify(bands));
    check('a tapped chip is spent on the hot side too', await p.evaluate(() => [...document.querySelectorAll('#q-area .pool button')].find(b => b.textContent.trim() === 'Ranch').disabled));
    await clickBtn(p, 'Undo');
    check('Undo takes the last one off a hot build', (await p.evaluate(() => document.querySelectorAll('#q-area .plate-win svg .ly').length)) === 3);
    // the chip order is shuffled; no shuffle may push Check off a phone screen (found Nov 9: the #13's 15 chips wrapped into an 8th row about 1 open in 100)
    if (!QUICK) {
      let low = 0, rowsSeen = {};
      for (let i = 0; i < 14; i++) {
        await tab(p, 'study'); await p.click('#glance [data-sub="13"]');
        await clickBtn(p, 'Build this one', '#sheet');
        const g = await p.evaluate(() => { const r = [...document.querySelectorAll('#q-area .row')].pop().getBoundingClientRect(), pool = document.querySelector('#q-area .pool'); return { rowB: r.bottom, vh: innerHeight, rows: new Set([...pool.querySelectorAll('button')].map(x => Math.round(x.getBoundingClientRect().top))).size }; });
        rowsSeen[g.rows] = (rowsSeen[g.rows] || 0) + 1;
        if (g.rowB > g.vh + 1) low++;
        await clickBtn(p, 'Stop');
      }
      check('#13 fits one phone screen on 14 shuffles in a row', low === 0, low + ' did not; rows of chips seen ' + JSON.stringify(rowsSeen));
    }
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }

  // ---------- 5. every way to practice, whole board ----------
  S('modes');
  {
    const p = await open(browser);
    // first thing on a clean slate: one miss lands in Weak spots, and the Weak spots deck drills just that one
    await startRun(p, 'num', 'italian'); await runToEnd(p, i => i !== 0);
    check('weak spots lists the miss', (await p.evaluate(() => document.querySelectorAll('#weak-list > div .tag').length)) === 1, await txt(p, '#weak-list'));
    await p.click('#weak-drill');
    check('weak spots run has just that sub', (await txt(p, '#q-area .prog .mono')) === '1 of 1', await txt(p, '#q-area .prog .mono'));
    await clickBtn(p, 'Stop');
    for (const mode of QUICK ? ['num', 'order'] : ['flash', 'num', 'what', 'build', 'order']) {
      await startRun(p, mode, mode === 'order' && QUICK ? 'italian' : 'all');
      const n = mode === 'order' && QUICK ? 4 : 18;
      check(`${mode}: starts at 1 of ${n}`, (await txt(p, '#q-area .prog .mono')) === `1 of ${n}`, await txt(p, '#q-area .prog .mono'));
      check(`${mode}: its tile is lit`, (await p.getAttribute(`#mode-seg [data-mode="${mode}"]`, 'aria-pressed')) === 'true');
      const r = await runToEnd(p, true);
      check(`${mode}: all right ends as a clean run`, r.end === 'summary' && (await txt(p, '#q-area h2')) === 'Clean run', JSON.stringify(r) + ' ' + await txt(p, '#q-area'));
      const ov = await overflow(p); check(`${mode}: no sideways scroll`, ov <= 0, ov);
    }
    // order mode several more times, to hit the random "no" and "add" lines
    if (!QUICK) for (const id of [13, 8, 9, 14, 13, 8, 13, 2, 8, 13]) {
      await tab(p, 'study'); await p.click(`#glance [data-sub="${id}"]`); await clickBtn(p, 'Take an order for it', '#sheet');
      const r = await runToEnd(p, true);
      check(`order for #${id}: built right from the ticket`, r.end === 'summary' && (await txt(p, '#q-area h2')) === 'Clean run', await txt(p, '#q-area'));
    }
    // a run with misses: summary, then drill only the missed ones
    await startRun(p, 'num', 'italian');
    await runToEnd(p, i => i !== 1);
    check('a miss shows Done and the missed sub', (await txt(p, '#q-area h2')) === 'Done' && (await p.evaluate(() => document.querySelectorAll('#q-area .row-sub[data-sub]').length)) === 1);
    await clickBtn(p, 'Drill the missed ones');
    check('missed-only run has one card', (await txt(p, '#q-area .prog .mono')) === '1 of 1');
    check('focus is on the new card', await p.evaluate(() => document.activeElement === document.querySelector('#q-area > .card')));
    await answer(p, true);
    await clickBtn(p, 'Close'); check('Close clears the card', (await cardKind(p)) === 'none');
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }

  // ---------- 6. quizzes, module quiz, today's session, and coming back days later ----------
  S('quizzes');
  {
    const p = await open(browser);
    await tab(p, 'drill');
    for (const b of QUICK ? ['wrap'] : Object.keys(DATA.BANKS)) {
      await p.click(`#quiz-list [data-bank="${b}"]`);
      const n = DATA.BANKS[b].length;
      check(`${b} quiz has ${n} questions`, (await txt(p, '#q-area .prog .mono')) === `1 of ${n}`, await txt(p, '#q-area .prog .mono'));
      const r = await runToEnd(p, true);
      check(`${b} quiz all right is a clean run`, r.end === 'summary' && (await txt(p, '#q-area h2')) === 'Clean run', JSON.stringify(r));
    }
    await p.click('#quiz-list [data-bank="wrap"]');
    {
      const q = ALLQ[await txt(p, '#q-area .q-text')];
      await p.evaluate(a => { [...document.querySelectorAll('#q-area .opt')].find(b => b.dataset.o !== a).click(); }, q.a);
      const fb = await txt(p, '#q-area .fb');
      check('a wrong quiz answer names the right one and why', fb.startsWith('The answer is: ' + q.a + '.') && fb.includes(q.why), fb);
      check('the right option is marked', (await p.evaluate(() => document.querySelector('#q-area .opt.ok').dataset.o)) === q.a);
    }
    await clickBtn(p, 'Stop');
    // module quiz
    await tab(p, 'orient'); await p.click('#o-wrap summary');
    const label = await txt(p, '#o-wrap [data-quiz="wrap"]');
    check('wrap module offers its quiz', label === 'Quiz me on this (7)', label);
    await p.click('#o-wrap [data-quiz="wrap"]');
    check('module quiz opens on Drill with its own label', await vis(p, '#view-drill') && /Quiz, Wrapping the sub/.test(await txt(p, '#q-area .ctx')), await txt(p, '#q-area .ctx'));
    const r = await runToEnd(p, true);
    check('module quiz includes the put-in-order game', r.kinds.game === 1 && r.kinds.bank === 6 && r.end === 'summary', JSON.stringify(r));
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }
  S('training');
  {
    const p = await open(browser, { hash: '#orient' });
    check('the tab is named Training', (await txt(p, '#tab-orient')) === 'Training');
    const st = await p.evaluate(() => ({
      mods: [...document.querySelectorAll('#view-orient details.mod')].map(d => d.getAttribute('data-mod')),
      open: document.querySelectorAll('#view-orient details.mod[open]').length,
      groups: [...document.querySelectorAll('#view-orient .section-title.grp')].map(e => e.id),
      jumps: [...document.querySelectorAll('#view-orient .jump a')].map(a => a.getAttribute('data-jump')),
      btns: [...document.querySelectorAll('#view-orient .grp-row [data-bank]')].map(b => b.getAttribute('data-bank') + ':' + b.textContent)
    }));
    check('one card for every module, all folded to start', st.mods.length === DATA.MODS.length && st.open === 0 && DATA.MODS.every(m => st.mods.includes(m.id)), JSON.stringify(st.mods));
    check('seven stations, each with a jump chip', st.groups.join() === DATA.GROUPS.map(g => 'g-' + g.id).join() && st.jumps.join() === st.groups.join(), st.groups + ' / ' + st.jumps);
    check('each station button counts its questions', st.btns.length === 7 && DATA.GROUPS.every((g, i) => st.btns[i].startsWith(g.bank + ':') && st.btns[i].endsWith('(' + DATA.BANKS[g.bank].length + ')')), st.btns.join(' | '));
    // every module: a quiz button with the right count, and the new ones each carry a drawing
    const cards = await p.evaluate(() => [...document.querySelectorAll('#view-orient details.mod')].map(d => ({ id: d.getAttribute('data-mod'), quiz: (d.querySelector('[data-quiz]') || {}).textContent, pics: d.querySelectorAll('svg.pic, svg.howto-pic, svg.stations, svg.stack').length, pill: d.querySelector('.mod-p').textContent })));
    for (const m of DATA.MODS) {
      const c = cards.find(x => x.id === m.id), n = m.q.length + (m.seq ? 1 : 0);
      check(`module ${m.id} offers its quiz with the right count`, !!c && c.quiz === `Quiz me on this (${n})` && c.pill === `${n} to quiz`, c && c.quiz + ' / ' + c.pill);
    }
    const OLD = ['values', 'food', 'uniform', 'pl', 'floor', 'fifo', 'temps', 'sani', 'pests', 'produce', 'cut', 'wrap', 'bag', 'register'];
    const bare = cards.filter(c => !OLD.includes(c.id) && c.pics === 0 && !['slmind'].includes(c.id)).map(c => c.id);
    check('every new module has a picture beside the words', bare.length === 0, bare.join(','));
    // a jump chip opens on its station
    await p.click('#view-orient .jump a[data-jump="g-grill"]'); await p.waitForTimeout(700);
    const gy = await p.evaluate(() => document.getElementById('g-grill').getBoundingClientRect().top);
    check('the grill chip brings the grill heading up under the tabs', gy > 40 && gy < 330, gy);
    check('jumping does not leave the tab', await vis(p, '#view-orient') && (await p.evaluate(() => location.hash)) === '#orient');
    // the hot subs are drawn into their module
    await p.click('#o-chick2 summary');
    const sp = await p.evaluate(() => [...document.querySelectorAll('#o-chick2 .sub-pics .sub-card')].map(c => c.querySelector('.tag').textContent + ':' + c.querySelectorAll('svg.stack .ly').length).join(','));
    check('the 26 and the 44 are drawn in their module, lid and all', sp === '26:7,44:7', sp);
    // a station quiz runs its whole bank
    await p.click('#view-orient .grp-row [data-bank="bread"]');
    check('a station button starts that station\'s quiz', await vis(p, '#view-drill') && (await txt(p, '#q-area .prog .mono')) === `1 of ${DATA.BANKS.bread.length}` && /Quiz, Bread/.test(await txt(p, '#q-area .ctx')), await txt(p, '#q-area .ctx'));
    await clickBtn(p, 'Stop');
    // the Line tab sends you to the grill quiz
    await tab(p, 'line');
    check('the Line tab tells the hot sub in the grill video\'s order', /The lid first, if the sub has one/.test(await txt(p, '#view-line')) && /Lettuce to finish/.test(await txt(p, '#view-line')));
    await p.click('#view-line [data-bank="grill"]');
    check('the Line tab\'s grill button starts the grill quiz', (await txt(p, '#q-area .prog .mono')) === `1 of ${DATA.BANKS.grill.length}`, await txt(p, '#q-area .prog .mono'));
    await clickBtn(p, 'Stop');
    // the put-in-order games that live inside the modules
    const seqKeys = Object.keys(DATA.SEQS).filter(k => !DATA.SEQS[k].visual);
    await tab(p, 'orient');
    for (const k of seqKeys) {
      const host = await p.evaluate(key => { const e = document.querySelector('[data-seq="' + key + '"]'); if (!e) return null; e.closest('details').open = true; return '#' + e.id; }, k);
      if (!check(`${k}: its game is on the page`, !!host, k)) continue;
      const steps = DATA.SEQS[k].steps;
      for (const stp of steps.slice().reverse()) await tapChip(p, stp, host);
      await clickBtn(p, 'Check', host);
      check(`${k}: steps in reverse are marked wrong`, await p.evaluate(h => { const f = document.querySelector(h + ' .fb'); return !!f && !f.hidden && f.classList.contains('bad'); }, host));
      await clickBtn(p, 'Shuffle again', host);
      for (const stp of steps) await tapChip(p, stp, host);
      const nums = await p.evaluate(h => [...document.querySelectorAll(h + ' .pool button.placed .idx')].map(i => +i.textContent).sort((a, b) => a - b).join(','), host);
      check(`${k}: each step is numbered where it sits`, nums === steps.map((_, i) => i + 1).join(','), nums);
      await clickBtn(p, 'Check', host);
      check(`${k}: the right order is accepted`, (await txt(p, host + ' .fb b')) === DATA.SEQS[k].okText, await txt(p, host + ' .fb'));
      check(`${k}: getting it right goes on the schedule`, await p.evaluate(key => !!JSON.parse(localStorage.getItem('jm-sched-v1') || '{}')['seq:' + key], k));
    }
    const ovt = await overflow(p); check('training has no sideways scroll with the games played', ovt <= 0, ovt);
    // module quizzes: every question, plus the order game where the module has one
    const modsToRun = QUICK ? DATA.MODS.filter(m => ['steak', 'regsafe'].includes(m.id)) : (name === 'chromium' ? DATA.MODS : DATA.MODS.filter(m => m.seq || ['timetemp', 'chick2', 'thick'].includes(m.id)));
    for (const m of modsToRun) {
      await tab(p, 'orient');
      await p.evaluate(id => { const d = document.getElementById('o-' + id); d.open = true; d.querySelector('[data-quiz]').click(); }, m.id);
      const total = m.q.length + (m.seq ? 1 : 0);
      const first = await txt(p, '#q-area .prog .mono');
      const r = await runToEnd(p, true);
      check(`module quiz ${m.id}: ${total} cards, all right ends clean`, first === `1 of ${total}` && r.end === 'summary' && (await txt(p, '#q-area h2')) === 'Clean run' && (r.kinds.bank || 0) === m.q.length && (r.kinds.game || 0) === (m.seq ? 1 : 0), first + ' ' + JSON.stringify(r));
    }
    // a miss in a module quiz is listed with its why
    await tab(p, 'orient');
    await p.evaluate(() => { const d = document.getElementById('o-thick'); d.open = true; d.querySelector('[data-quiz]').click(); });
    await runToEnd(p, i => i !== 0);
    check('a missed training question is listed with the answer and why', (await txt(p, '#q-area h2')) === 'Done' && (await p.evaluate(() => document.querySelectorAll('#q-area ul.plain li').length)) === 1);
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }
  S('today');
  {
    const p = await open(browser);
    check('first visit: welcome card, intro open', (await txt(p, '#st-title')) === 'Ten minutes a day' && await p.evaluate(() => document.getElementById('j-first').open));
    await p.click('#study-today [data-today]');
    check('a first session is ten cards', await vis(p, '#view-drill') && (await txt(p, '#q-area .prog .mono')) === '1 of 10', await txt(p, '#q-area .prog .mono'));
    check('it opens by teaching Mike\'s Way, title on screen under the tabs', (await cardKind(p)) === 'teach' && (await txt(p, '#q-area .q-name')) === "Mike's Way, in order" && await p.evaluate(() => document.querySelector('#q-area .q-name').getBoundingClientRect().top >= document.querySelector('.tabs').getBoundingClientRect().bottom));
    let teaches = 0, subsTaught = [], facts = 0;
    for (let i = 0; i < 40; i++) {
      const k = await cardKind(p);
      if (k === 'summary') break;
      if (k === 'teach') {
        teaches++;
        if (await vis(p, '#q-area .sub-card')) { subsTaught.push(await txt(p, '#q-area .sub-card .tag')); check('a new sub is shown with its picture before the question', await vis(p, '#q-area .sub-card svg.stack')); }
        if (await vis(p, '#q-area .fact')) facts++;
        await clickBtn(p, 'Got it, ask me');
        const g = await p.evaluate(() => { const q = document.querySelector('#q-area .q-label, #q-area .q-name'); const t = document.querySelector('.tabs').getBoundingClientRect().bottom; const vis = [...document.querySelectorAll('#q-area .q-label, #q-area .q-name')].filter(e => e.getClientRects().length)[0]; return { top: vis ? vis.getBoundingClientRect().top : -1, tabs: t, focus: !!document.activeElement && !!document.activeElement.closest('#q-area') }; });
        check('after Got it, the question sits under the tabs and has the focus', g.top >= g.tabs - 1 && g.top < 400 && g.focus, JSON.stringify(g));
        check('the lesson steps aside when the question comes', !(await vis(p, '#q-area .teach-note')));
      }
      await answer(p, i % 4 !== 2);
    }
    check('everything new is taught first: ten lessons', teaches === 10, teaches);
    check('subs arrive in ladder order', subsTaught.join(',') === '3,2,5,13', subsTaught.join(','));
    check('five facts come with them', facts === 5, facts);
    check('session reaches its summary', (await cardKind(p)) === 'summary');
    check('the summary does not say come back tomorrow while more is waiting', !/come back tomorrow/i.test(await txt(p, '#q-area')), await txt(p, '#q-area'));
    const sched1 = await p.evaluate(() => JSON.parse(localStorage.getItem('jm-sched-v1') || '{}'));
    check('ten items are now on the schedule', Object.keys(sched1).length === 10, Object.keys(sched1).length);
    check('the button now offers another session', (await txt(p, '#today-btn')) === 'Start another session', await txt(p, '#today-btn'));
    await tab(p, 'study');
    check('study card counts what there is to review, not everything unseen', /^(\d+ to review today|Ready for the next ones)$/.test(await txt(p, '#st-title')), await txt(p, '#st-title'));
    // right twice in one sitting must not lock anything
    await startRun(p, 'num', 'italian'); await runToEnd(p, true); await clickBtn(p, 'Run it again'); await runToEnd(p, true);
    check('right twice in one sitting locks nothing', (await txt(p, '#ready-board')) === '0 of 47 locked in', await txt(p, '#ready-board'));
    check('but the meter shows it as right once', (await p.evaluate(() => parseFloat(document.getElementById('ready-once').style.width))) > 0 && /right once so far/.test(await txt(p, '#ready-line')), await txt(p, '#ready-line'));
    // everything right once, then "two days later", then right again: that is what locks in
    await startRun(p, 'num', 'all'); await runToEnd(p, true);
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('jm-sched-v1')); Object.keys(s).forEach(k => { s[k].due = Date.now() - 1000; }); localStorage.setItem('jm-sched-v1', JSON.stringify(s)); });
    await p.reload(); await p.waitForTimeout(200);
    check('progress survives a reload', Object.keys(await p.evaluate(() => JSON.parse(localStorage.getItem('jm-sched-v1')))).length >= 18);
    check('intro is folded once you have started', !(await p.evaluate(() => document.getElementById('j-first').open)));
    await startRun(p, 'num', 'all'); await runToEnd(p, true);
    const board = await txt(p, '#ready-board');
    check('right on two different days locks all 18 subs in', board === '18 of 47 locked in', board);
    check('readiness percent moved', (await txt(p, '#ready-pct')) === '38%', await txt(p, '#ready-pct'));
    await tab(p, 'study');
    check('family cards show mastery', /4 of 4 locked in\. You've got this family/.test(await txt(p, '#cold-families .mastery')), await txt(p, '#cold-families .mastery'));
    // reset asks twice
    await tab(p, 'drill'); await p.click('#reset-stats');
    check('reset asks for a second tap', /Tap again/.test(await txt(p, '#reset-stats')));
    await p.click('#reset-stats');
    check('reset clears progress', (await txt(p, '#ready-board')) === '0 of 47 locked in' && (await p.evaluate(() => localStorage.getItem('jm-sched-v1'))) === '{}');
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }

  // ---------- 7. walkthroughs and listening, with a stand-in voice ----------
  S('walkthrough');
  {
    const p = await open(browser);
    await tab(p, 'orient'); await p.click('#o-wrap summary');
    check('wrap has nine pictures', (await p.evaluate(() => document.querySelectorAll('#o-wrap ol.howto li svg.howto-pic').length)) === 9);
    await p.click('#o-wrap [data-walk="wrap"]');
    check('walkthrough opens before step 1', /before step 1/.test(await txt(p, '#sheet .walk-step')), await txt(p, '#sheet .walk-step'));
    check('its picture is playing', await p.evaluate(() => document.querySelector('#sheet .walk svg.howto-pic').classList.contains('play')));
    const walkFits = () => p.evaluate(() => { const b = [...document.querySelectorAll('#sheet .walk-ctl .btn')].pop().getBoundingClientRect(), t = document.querySelector('#sheet .walk-title').getBoundingClientRect(), bar = document.querySelector('#sheet-handle').getBoundingClientRect(); return { btnB: b.bottom, vh: innerHeight, titleT: t.top, barB: bar.bottom }; });
    await p.waitForTimeout(450);   // let the sheet finish sliding up before measuring it
    let wf = await walkFits(); check('walkthrough: Next is on screen on the first screen', wf.btnB <= wf.vh + 1 && wf.titleT >= wf.barB - 1, JSON.stringify(wf));
    for (let i = 1; i <= 8; i++) {
      await p.evaluate(() => { const s = document.querySelector('.sheet-panel'); s.scrollTop = s.scrollHeight; });
      await clickBtn(p, 'Next', '#sheet'); check(`step ${i} of 8`, new RegExp(`step ${i} of 8`).test(await txt(p, '#sheet .walk-step')), await txt(p, '#sheet .walk-step'));
      wf = await walkFits(); check(`step ${i}: opens from its title with Next on screen`, wf.btnB <= wf.vh + 1 && wf.titleT >= wf.barB - 1, JSON.stringify(wf));
    }
    check('focus follows Next', await p.evaluate(() => document.activeElement && document.activeElement.textContent === 'Done'));
    check('last step offers Done', await clickBtn(p, 'Done', '#sheet') && await p.evaluate(() => document.getElementById('sheet').hidden));
    // tap a picture to open that step
    await p.click('#o-wrap ol.howto li:nth-child(4) figure');
    check('tapping a picture opens that step', /step 3 of 8/.test(await txt(p, '#sheet .walk-step')), await txt(p, '#sheet .walk-step'));
    await p.evaluate(() => { window.__spoken.length = 0; });
    await p.click('#sheet .walk .say-btn');
    check('Read it speaks the step', await p.waitForFunction(() => window.__spoken.join(' ').includes('Step 3.'), null, { timeout: 2000 }).then(() => true, () => false), await p.evaluate(() => window.__spoken.join(' ')));
    await p.keyboard.press('Escape');
    // the grill has its own walkthrough: nine steps, no "before step 1"
    await p.click('#o-steak summary');
    check('the #17 has nine pictures', (await p.evaluate(() => document.querySelectorAll('#o-steak ol.howto li svg.howto-pic').length)) === 9);
    await p.click('#o-steak [data-walk="steak"]');
    check('grill walkthrough opens at step 1 of 9 under its own name', /A #17 on the grill, step 1 of 9/.test(await txt(p, '#sheet .walk-step')), await txt(p, '#sheet .walk-step'));
    await p.waitForTimeout(450);
    for (let i = 2; i <= 9; i++) { await clickBtn(p, 'Next', '#sheet'); wf = await walkFits(); check(`grill step ${i}: Next on screen, title under the bar`, new RegExp(`step ${i} of 9`).test(await txt(p, '#sheet .walk-step')) && wf.btnB <= wf.vh + 1 && wf.titleT >= wf.barB - 1, JSON.stringify(wf)); }
    check('grill walkthrough steps match the put-in-order game', (await p.evaluate(() => [...document.querySelectorAll('#o-steak ol.howto li .ht b')].map(b => b.textContent.replace(/\.$/, '')).join('|'))) === DATA.SEQS.steak.steps.join('|'));
    await clickBtn(p, 'Done', '#sheet');
    // hands-free from the top: reads, waits, moves on by itself to the end
    await p.click('#o-cut summary'); await p.click('#o-cut [data-walk="cut"]');
    await p.evaluate(() => { window.__spoken.length = 0; });
    await p.click('#walk-hands');
    check('hands-free asks to keep the screen on', await p.waitForFunction(() => window.__wl >= 1, null, { timeout: 2000 }).then(() => true, () => false));
    const done = await p.waitForFunction(() => /That's all of it/.test((document.querySelector('#sheet .walk-status') || {}).textContent || ''), null, { timeout: 15000 }).then(() => true, () => false);
    check('hands-free reads both cutting steps and stops at the end', done && await p.evaluate(() => window.__spoken.join(' ').includes('Step 1.') && window.__spoken.join(' ').includes('Step 2.')), await p.evaluate(() => window.__spoken.join(' | ').slice(0, 200)));
    check('screen lock is released at the end', (await p.evaluate(() => window.__wlr)) >= 1);
    await p.keyboard.press('Escape');
    const bad = await p.evaluate(TAP_AUDIT); check('orientation tap targets are 44px', bad.length === 0, bad.slice(0, 6).join(' | '));
    // motion switch
    await p.click('#motion-toggle');
    check('motion switch stops the pictures', await p.evaluate(() => document.body.classList.contains('nomotion')) && (await p.evaluate(() => { const s = document.querySelector('#o-wrap ol.howto li:nth-child(4) svg'); s.classList.add('play'); return s.getAnimations ? s.getAnimations({ subtree: true }).length : 0; })) === 0);
    await p.reload(); await p.waitForTimeout(200);
    check('motion choice is remembered', await p.evaluate(() => document.body.classList.contains('nomotion') && !document.getElementById('motion-toggle').checked));
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }
  S('listen');
  {
    const p = await open(browser);
    await startRun(p, 'listen', 'italian');
    check('listen card shows', (await cardKind(p)) === 'listen' && (await txt(p, '#q-area .listen-play')) === 'Play');
    await clickBtn(p, '3 seconds');
    await p.click('#q-area .listen-play');
    check('it says a number first', await p.waitForFunction(() => /^Number \d+\.$/.test(window.__spoken[0] || ''), null, { timeout: 2000 }).then(() => true, () => false), await p.evaluate(() => window.__spoken.join(' | ')));
    check('screen is kept on', (await p.evaluate(() => window.__wl)) >= 1);
    check('answer is hidden while you think', await p.evaluate(() => document.querySelector('#q-area .listen-ans').classList.contains('wait')));
    check('then it tells you', await p.waitForFunction(() => window.__spoken.length >= 2 && !document.querySelector('#q-area .listen-ans').classList.contains('wait'), null, { timeout: 6000 }).then(() => true, () => false), await p.evaluate(() => window.__spoken.join(' | ')));
    check('and moves to the next sub by itself', await p.waitForFunction(() => window.__spoken.filter(s => /^Number \d+\.$/.test(s)).length >= 2, null, { timeout: 8000 }).then(() => true, () => false));
    await p.click('#q-area .listen-play');
    check('Pause stops it and lets the screen sleep', (await txt(p, '#q-area .listen-play')) === 'Play' && (await p.evaluate(() => window.__wlr)) >= 1);
    const n = await p.evaluate(() => window.__spoken.length); await p.waitForTimeout(700);
    check('nothing more is said after Pause', (await p.evaluate(() => window.__spoken.length)) === n);
    await p.click('#q-area .listen-play'); await tab(p, 'study');
    await p.waitForTimeout(300); const n2 = await p.evaluate(() => window.__spoken.length); await p.waitForTimeout(3600);
    check('leaving the Drill tab stops it', (await p.evaluate(() => window.__spoken.length)) === n2);
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }

  // ---------- 8. the bad days: no voice, no storage, no motion, no script ----------
  S('no voice');
  {
    const p = await open(browser, { init: NO_SPEECH });
    await startRun(p, 'listen', 'italian');
    check('Play is off and it says why', await p.evaluate(() => document.querySelector('#q-area .listen-play').disabled) && /no built-in voice/.test(await txt(p, '#q-area .listen-note')));
    await tab(p, 'study'); await p.click('#glance [data-sub="13"]');
    check('no read-aloud button where there is no voice', (await p.evaluate(() => document.querySelectorAll('#sheet .say-btn').length)) === 0);
    await clickBtn(p, 'Close', '#sheet');
    await tab(p, 'orient'); await p.click('#o-cut summary'); await p.click('#o-cut [data-walk="cut"]');
    check('walkthrough still works without a voice', await clickBtn(p, 'Next', '#sheet') && (await p.evaluate(() => document.querySelectorAll('#sheet #walk-hands').length)) === 0);
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }
  S('no storage');
  {
    const p = await open(browser, { init: BAD_STORAGE });
    check('page loads with storage blocked', await vis(p, '#view-study') && (await p.evaluate(() => document.querySelectorAll('#view-study .row-sub[data-sub]').length)) === 19);
    await startRun(p, 'num', 'italian'); const r = await runToEnd(p, true);
    check('a round still works with storage blocked', r.end === 'summary', JSON.stringify(r));
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }
  S('reduced motion');
  {
    const p = await open(browser, { reduced: true });
    await p.click('#glance [data-sub="13"]');
    check('sheet picture does not animate', !(await p.evaluate(() => document.querySelector('#sheet svg.stack').classList.contains('build'))));
    await clickBtn(p, 'Close', '#sheet');
    await tab(p, 'orient'); await p.click('#o-wrap summary'); await p.waitForTimeout(300);
    check('how-to pictures hold still', (await p.evaluate(() => { let n = 0; document.querySelectorAll('#o-wrap svg.howto-pic').forEach(s => { s.classList.add('play'); if (s.getAnimations) n += s.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length; }); return n; })) === 0);
    check('still pictures are complete', await p.evaluate(() => { const s = document.querySelector('#o-wrap ol.howto li:nth-child(4) svg'); return s.getBoundingClientRect().height > 100; }));
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }
  S('no script');
  {
    const p = await open(browser, { js: false, init: null });
    const st = await p.evaluate(() => ({
      rows: document.querySelectorAll('.row-sub[data-sub]').length, pics: document.querySelectorAll('.row-sub[data-sub] svg.stack').length,
      line: document.getElementById('view-line').getClientRects().length > 0, orient: document.getElementById('view-orient').getClientRects().length > 0,
      drill: document.getElementById('view-drill').getClientRects().length > 0, tabs: document.querySelector('.tabs').getClientRects().length > 0,
      howto: document.querySelectorAll('ol.howto svg.howto-pic').length, note: !!document.querySelector('noscript'),
      tpics: document.querySelectorAll('#view-orient svg.pic').length, mods: document.querySelectorAll('#view-orient details.mod').length,
      games: [...document.querySelectorAll('[data-seq]')].filter(e => e.getClientRects().length).length,
      today: document.getElementById('study-today').getClientRects().length > 0, over: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }));
    check('preview without script shows every sub with its picture', st.rows === 19 && st.pics === 19, JSON.stringify(st));
    check('preview shows the line and orientation, and hides what needs script', st.line && st.orient && !st.drill && !st.tabs && !st.today, JSON.stringify(st));
    check('preview keeps the how-to pictures', st.howto === 24, st.howto);
    check('preview keeps every training module and its diagrams, and hides the games', st.mods === DATA.MODS.length && st.tpics === 37 && st.games === 0, JSON.stringify(st));
    check('preview has no sideways scroll', st.over <= 0, st.over);
    await p.__close();
  }

  // ---------- 9. dark mode and contrast (computed colors, one engine is enough) ----------
  if (name === 'chromium') {
    for (const scheme of ['light', 'dark']) {
      S('contrast ' + scheme);
      const p = await open(browser, { scheme });
      for (const t of ['study', 'line', 'drill', 'orient']) {
        await tab(p, t);
        if (t === 'orient') await p.evaluate(() => document.querySelectorAll('#view-orient details').forEach(d => { d.open = true; }));
        if (t === 'drill') { await p.click('#deck-seg button[data-deck="italian"]'); await p.click('#mode-seg [data-mode="num"]'); await answer(p, false); await p.click('#mode-seg [data-mode="build"]'); await tapChip(p, 'Onions'); await clickBtn(p, 'Check'); }
        await p.waitForTimeout(900);   // let the fade-in and button transitions finish, or the colors read mid-blend
        const bad = await p.evaluate(CONTRAST_AUDIT);
        check(`${t} text contrast`, bad.length === 0, bad.length + ' low: ' + bad.slice(0, 5).join(' | '));
      }
      await tab(p, 'study'); await p.click('#glance [data-sub="8"]');
      await p.waitForTimeout(900);
      let bad = await p.evaluate(CONTRAST_AUDIT); check('sub sheet contrast', bad.length === 0, bad.slice(0, 5).join(' | '));
      await clickBtn(p, 'Close', '#sheet');
      await tab(p, 'drill'); await p.click('#mode-seg [data-mode="order"]');
      await p.waitForTimeout(900);
      bad = await p.evaluate(CONTRAST_AUDIT); check('order ticket contrast', bad.length === 0, bad.slice(0, 5).join(' | '));
      await p.click('#mode-seg [data-mode="listen"]');
      await p.waitForTimeout(900);
      bad = await p.evaluate(CONTRAST_AUDIT); check('listen contrast', bad.length === 0, bad.slice(0, 5).join(' | '));
      const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
      check('body paints its own background', !/rgba\(0, 0, 0, 0\)|transparent/.test(bg), bg);
      await p.__close();
    }
  }
  await browser.close();
}

function staticChecks() {
  scope = 'files';
  const D1 = String.fromCharCode(0x2014), D2 = String.fromCharCode(0x2013);   // built from their codes so this file never holds one
  const DASH = new RegExp('[' + D1 + D2 + ']'), DASH_CTX = new RegExp('.{0,30}[' + D1 + D2 + '].{0,30}');
  const dir = path.dirname(SITE);
  const files = ['index.html', 'sw.js', 'manifest.webmanifest'].map(f => [f, fs.readFileSync(path.join(dir, f), 'utf8')]);
  const art = path.resolve(ROOT, 'dist/artifact.html');
  if (fs.existsSync(art)) files.push(['artifact.html', fs.readFileSync(art, 'utf8')]);
  for (const [f, s] of files) {
    check(f + ' has no em or en dashes', !DASH.test(s), (s.match(DASH_CTX) || [''])[0]);
    check(f + ' has no mail, sms or phone links', !/href=["'](mailto|sms|tel):/i.test(s));
  }
  // the quiz bank itself: every answer is one of four distinct choices, and its length doesn't give it away
  const allQ = Object.keys(DATA.BANKS).flatMap(b => DATA.BANKS[b]);
  check('every quiz answer is one of four distinct choices', allQ.every(q => q.o.length === 4 && new Set(q.o).size === 4 && q.o.includes(q.a)));
  const longest = allQ.filter(q => q.o.every(x => x === q.a || x.length < q.a.length)).length;
  check('the right answer is the longest choice no more often than chance allows', longest <= allQ.length * 0.3, longest + ' of ' + allQ.length);
  for (const b of Object.keys(DATA.BANKS)) {
    const qs = DATA.BANKS[b], l = qs.filter(q => q.o.every(x => x === q.a || x.length < q.a.length)).length;
    check(`${b}: the right answer's length gives nothing away, long or short`, l <= qs.length * 0.34 && (qs.length < 20 || l >= qs.length * 0.08), l + ' of ' + qs.length);
  }
  check('no two questions share an id or their wording', new Set(allQ.map(q => q.id)).size === allQ.length && new Set(allQ.map(q => q.q)).size === allQ.length);
  check('every question says why', allQ.every(q => q.why && q.why.length > 8));
  const home = {}; DATA.MODS.forEach(m => m.q.forEach(id => { home[id] = (home[id] || 0) + 1; }));
  const bankOf = {}; Object.keys(DATA.BANKS).forEach(b => DATA.BANKS[b].forEach(q => { bankOf[q.id] = b; }));
  const stray = allQ.filter(q => bankOf[q.id] !== 'amounts' && home[q.id] !== 1).map(q => q.id);
  check('every training question belongs to exactly one module', stray.length === 0, stray.join(','));
  check('every module draws from its own station\'s bank', DATA.MODS.every(m => m.q.length > 0 && m.q.every(id => bankOf[id] === m.bank) && (!m.seq || !!DATA.SEQS[m.seq])));
  check('every station has a bank and every bank but sprinkling has a station', DATA.GROUPS.every(g => !!DATA.BANKS[g.bank]) && Object.keys(DATA.BANKS).filter(b => b !== 'amounts').every(b => DATA.GROUPS.some(g => g.bank === b)));
  check('no put-in-order game repeats a step', Object.keys(DATA.SEQS).every(k => new Set(DATA.SEQS[k].steps).size === DATA.SEQS[k].steps.length && DATA.SEQS[k].recap));
  // a hot sub's amounts: the giant is double the regular wherever both are numbers
  const dbl = Object.keys(DATA.HOT_AMT.regular).filter(k => { const r = DATA.HOT_AMT.regular[k], g = DATA.HOT_AMT.giant[k], n = x => (x.match(/[\d.]+/g) || []).map(Number); if (/Tomatoes/.test(k)) return !(n(r)[0] === 3 && n(g)[0] === 5); return n(r).some((v, i) => Math.abs(n(g)[i] - 2 * v) > 1e-9); });
  check('hot sub giants double the regular (tomatoes go 3 to 5)', dbl.length === 0, dbl.join(','));
  check('every hot sub on the board is built lid, grill, cheese, finish', DATA.numbered.filter(x => x.type === 'hot').every(x => Array.isArray(x.lid) && Array.isArray(x.sauce) && Array.isArray(x.finish) && DATA.hotOrder(x).length === new Set(DATA.hotOrder(x)).size));
  const idx = files[0][1];
  const ext = (idx.match(/(?:src|href)=["']https?:\/\/[^"']+/g) || []);
  check('site loads nothing from another server', ext.length === 0, ext.slice(0, 3).join(' '));
  check('site carries its own fonts', (idx.match(/font\/woff2;base64,/g) || []).length >= 4);
  check('site registers its offline worker', /serviceWorker/.test(idx) && /register\(/.test(idx));
  if (VERSION) check('worker cache is named for this version', files[1][1].includes(VERSION), VERSION);
  for (const icon of ['icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png']) check(icon + ' exists', fs.existsSync(path.join(dir, icon)));
  if (files[3]) {
    const a = files[3][1];
    check('artifact has a short title at the top', /<title>[^<]{3,40}<\/title>/.test(a.slice(0, 2000)));
    check('artifact carries no doctype or body tag of its own', !/<!doctype|<body|<html/i.test(a));
    const aext = (a.match(/(?:src|href)=["']https?:\/\/[^"']+/g) || []).filter(u => !/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u));
    check('artifact loads only Google Fonts from outside', aext.length === 0, aext.slice(0, 3).join(' '));
    check('artifact is well under the size limit', a.length < 2 * 1024 * 1024, a.length);
  }
}

(async () => {
  const t0 = Date.now();
  staticChecks();
  for (const e of ENGINES) {
    const before = passed, f0 = failures.length;
    try { await engineSuite(e); } catch (err) { scope = e; check('suite ran to the end', false, err.stack || err.message); }
    console.log(`${e}: ${passed - before} passed, ${failures.length - f0} failed`);
  }
  const secs = Math.round((Date.now() - t0) / 1000);
  if (failures.length) { console.log(`CHECKS_FAILED ${failures.length} of ${passed + failures.length} (${secs}s)`); failures.forEach(f => console.log(' - ' + f)); process.exit(1); }
  console.log(`ALL_CHECKS_PASSED ${passed} checks, engines: ${ENGINES.join(' ')} (${secs}s)`);
})();
