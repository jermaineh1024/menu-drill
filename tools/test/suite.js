// node tools/test/suite.js [--site dist/site/index.html] [--engines chromium,webkit,firefox] [--version 2026-11-09d] [--quick] [--allow-unrecorded]
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
const ALLOW_UNRECORDED = args.includes('--allow-unrecorded');   // after the page's words change, before the changed pieces are recorded again
// the recorded voice: the fingerprints the built site lists, and the files beside it
const AUDIO_DIR = path.join(path.dirname(SITE), 'audio');
const AUDIO_KEYS = ((fs.readFileSync(SITE, 'utf8').match(/window\.JM_AUDIO=\{base:"audio\/",keys:"([0-9a-f ]*)"\}/) || [])[1] || '').split(' ').filter(Boolean);
const HAS_KEY = new Set(AUDIO_KEYS);

// the page's own data, loaded straight from the source file, so the tests know the right answers without scraping
// (every file named 1x-*.js is data: the board, the stations, then the crew, shift lead and manager courses, in page order)
const DATA_FILES = fs.readdirSync(path.resolve(ROOT, 'src/js')).filter(f => /^1\d[a-z]?-[\w-]+\.js$/.test(f)).sort();
const DATA = new Function(DATA_FILES.map(f => fs.readFileSync(path.resolve(ROOT, 'src/js', f), 'utf8')).join('\n') +
  '; return {SUBS, MW, TOP_EXTRAS, LID_ORDER, numbered, BANKS, MODS, SEQS, DECKS, MODES, hotOrder, HOT_AMT, GROUPS, HOWTO_NAME, LEVELS, BANK_LABEL};')();
const subByN = n => DATA.numbered.find(s => String(s.n) === String(n));
const subByName = name => DATA.SUBS.find(s => s.name === name);
const itemsOf = s => s.type === 'cold' ? s.cheese.concat(s.meats, s.fixed, s.mw ? DATA.MW : [], s.lid || []) : DATA.hotOrder(s);
const ALLQ = {}; Object.keys(DATA.BANKS).forEach(b => DATA.BANKS[b].forEach(q => { ALLQ[q.q] = q; }));
// levels: every station belongs to one, and its bank, its cards and its put-in-order games go with it
const lvOfBank = b => { const g = DATA.GROUPS.find(x => x.bank === b); return g ? (g.level || 1) : 0; };
const bankOfQ = q => Object.keys(DATA.BANKS).find(b => DATA.BANKS[b].includes(q));
const modsAt = n => DATA.MODS.filter(m => lvOfBank(m.bank) === n);
const groupsAt = n => DATA.GROUPS.filter(g => (g.level || 1) === n);
const seqLevel = k => { const m = DATA.MODS.find(x => x.seq === k); return m ? lvOfBank(m.bank) : 0; };
// what the "Training facts" bar counts at a level (0: every level): that level's questions and games. The board and the sprinkling amounts have a bar of their own.
const factsAt = n => Object.keys(DATA.BANKS).filter(b => b !== 'amounts' && (!n || !lvOfBank(b) || lvOfBank(b) === n)).reduce((a, b) => a + DATA.BANKS[b].length, 0)
  + Object.keys(DATA.SEQS).filter(k => !DATA.SEQS[k].board && (!n || !seqLevel(k) || seqLevel(k) === n)).length;
// the diagrams: every file the picture tools drew, and every place the page asks for one
const INC = path.resolve(ROOT, 'src/include');
const PIC_FILES = fs.readdirSync(INC).filter(f => /^pic-[\w-]+\.html$/.test(f)).map(f => f.replace('.html', ''));
const SRC_HTML = [path.resolve(ROOT, 'src/body.html')].concat(fs.readdirSync(INC).filter(f => /^train-[\w-]+\.html$/.test(f)).map(f => path.join(INC, f))).map(f => fs.readFileSync(f, 'utf8')).join('\n');
const PIC_USES = (SRC_HTML.match(/<!--#include pic-[\w-]+-->/g) || []).length;

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
  window.__used = [];
  const synth = {
    speaking: false, pending: false, _t: null, _l: [],
    getVoices() { return (window.__voiceList || []).map(v => Object.assign({}, v)); },   // a fresh object for each voice on every call, as Chrome does
    addEventListener(t, fn) { if (t === 'voiceschanged') this._l.push(fn); }, removeEventListener() {},
    resume() {},
    cancel() { window.__cancels++; clearTimeout(this._t); this.speaking = false; },
    speak(u) {
      window.__spoken.push(u.text); window.__used.push({ voice: u.voice ? u.voice.name : null, lang: u.lang, rate: u.rate }); this.speaking = true;
      const self = this;
      const gap = window.__fast ? 0 : (window.__slow ? 350 : 25);   // flat out to read whole cards, slow to catch it mid-sentence
      this._t = setTimeout(() => { if (u.onstart) u.onstart(); self._t = setTimeout(() => { self.speaking = false; if (u.onend) u.onend(); }, gap); }, gap ? 5 : 0);
    }
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  window.__voicesArrive = list => { window.__voiceList = list; synth._l.forEach(fn => fn()); };   // a device that hands over its voices late
  window.__wl = 0; window.__wlr = 0;
  try { Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => { window.__wl++; return { release() { window.__wlr++; }, addEventListener() {} }; } } }); } catch (e) {}
};
const NO_SPEECH = () => {
  Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: undefined, configurable: true });
};
// watches the page's audio player: which file each play() asked for, how fast, and what became of it
const MEDIA_SPY = () => {
  window.__speechLog = []; window.__media = [];
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    const el = this; window.__lastAudio = el;
    window.__media.push({ src: String(el.src).split('/').pop(), rate: null, events: [] });
    if (!el.__spied) {
      el.__spied = true;
      ['playing', 'ended', 'error', 'pause'].forEach(ev => el.addEventListener(ev, () => { const cur = window.__media[window.__media.length - 1]; cur.events.push(ev); if (ev === 'playing') cur.rate = el.playbackRate; }));
    }
    return play.apply(this, arguments);
  };
};
// a site whose recordings went missing: every one of them answers "not found"
const LOST_AUDIO = () => { let a; Object.defineProperty(window, 'JM_AUDIO', { get() { return a; }, set(v) { a = Object.assign({}, v, { base: 'audio-that-is-not-there/' }); } }); };
const NO_AUDIO = () => { try { Object.defineProperty(window, 'JM_AUDIO', { get() { return undefined; }, set() {} }); } catch (e) {} };
// what a phone might lend a page: a joke voice, two good ones, a British one, an old synthesizer, an online one, an old desktop one, one in Spanish, and one listed twice
const VOICES = [
  { name: 'Albert', lang: 'en-US', localService: true, voiceURI: 'com.apple.speech.synthesis.voice.Albert' },
  { name: 'Samantha', lang: 'en-US', localService: true, voiceURI: 'com.apple.voice.compact.en-US.Samantha' },
  { name: 'Ava (Premium)', lang: 'en-US', localService: true, voiceURI: 'com.apple.voice.premium.en-US.Ava' },
  { name: 'Daniel', lang: 'en-GB', localService: true, voiceURI: 'com.apple.voice.compact.en-GB.Daniel' },
  { name: 'Eddy (English (US))', lang: 'en-US', localService: true, voiceURI: 'com.apple.eloquence.en-US.Eddy' },
  { name: 'Google US English', lang: 'en-US', localService: false, voiceURI: 'Google US English' },
  { name: 'Microsoft David - English (United States)', lang: 'en-US', localService: true, voiceURI: 'Microsoft David - English (United States)' },
  { name: 'M\u00f3nica', lang: 'es-ES', localService: true, voiceURI: 'com.apple.voice.compact.es-ES.Monica' },
  { name: 'Samantha', lang: 'en-US', localService: true, voiceURI: 'com.apple.voice.compact.en-US.Samantha' }
];
const VOICE_ROWS = ['Ava (Premium)', 'Samantha', 'Google US English', 'Daniel', 'David'];   // best first; the joke, the synthesizer and the Spanish one left out
const BAD_STORAGE = () => {
  Storage.prototype.setItem = function () { throw new Error('QuotaExceededError'); };
  Storage.prototype.getItem = function () { throw new Error('SecurityError'); };
};

async function open(browser, o = {}) {
  const ctx = await browser.newContext({
    viewport: o.viewport || { width: 390, height: 664 }, colorScheme: o.scheme || 'light',
    reducedMotion: o.reduced ? 'reduce' : 'no-preference', javaScriptEnabled: o.js !== false, hasTouch: !!o.touch,
    ...(o.at || o.clockAt ? { timezoneId: 'America/New_York' } : {})
  });
  const page = await ctx.newPage();
  if (o.at) await page.clock.setFixedTime(new Date(o.at));   // the clock reads this time; timers still run
  if (o.clockAt) await page.clock.install({ time: new Date(o.clockAt) });   // a clock that starts here, keeps ticking, and can be jumped forward
  page.__errs = []; page.__ext = [];
  page.on('pageerror', e => page.__errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') page.__errs.push('console: ' + m.text()); });
  page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) page.__ext.push(r.url()); });
  if (o.voices) await page.addInitScript(list => { window.__voiceList = list; }, o.voices);   // the voices this pretend device lends a page
  if (o.init !== null) await page.addInitScript(o.init || SPEECH_MOCK);
  // Most sections test the words and the device's own voice, so the recordings are switched off for them. The recorded voice has sections of its own.
  if (o.js !== false) await page.addInitScript(o.lostAudio ? LOST_AUDIO : (o.recorded ? MEDIA_SPY : NO_AUDIO));
  if (o.js !== false && o.lostAudio) await page.addInitScript(MEDIA_SPY);
  if (o.store) await page.addInitScript(kv => { try { Object.keys(kv).forEach(k => localStorage.setItem(k, kv[k])); } catch (e) {} }, o.store);
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
// Training shows one level, and one open card, at a time. The page-wide audits want all of it on screen:
// turn "One card open at a time" off with its own switch, press "Show every level", then open every card.
const showAllTraining = async p => {
  await p.evaluate(() => {
    const f = document.getElementById('focus-toggle'); if (f && f.checked) f.click();
    const all = document.getElementById('path-all'); if (all && all.getAttribute('aria-pressed') !== 'true') all.click();
    document.querySelectorAll('#view-orient details').forEach(d => { d.open = true; });
  });
  await p.waitForTimeout(150);
};
const pickLevel = async (p, n) => {
  if (n === 'all') await p.evaluate(() => { const all = document.getElementById('path-all'); if (all.getAttribute('aria-pressed') !== 'true') all.click(); });
  else await p.click(`#path .lv[data-level="${n}"]`);
  await p.waitForTimeout(120);
};
const startRun = async (p, mode, deck) => { await tab(p, 'drill'); if (deck) await p.click(`#deck-seg button[data-deck="${deck}"]`); if (mode) await p.click(`#mode-seg [data-mode="${mode}"]`); };

// ---- page-wide audits, run inside the page ----
const TAP_AUDIT = () => {
  const bad = [];
  document.querySelectorAll('button, [role=button], [role=checkbox], summary, a[href], label.switch, .tab, input[type=text]').forEach(el => {
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
        await showAllTraining(p);
        const seen = await p.evaluate(() => { const ds = [...document.querySelectorAll('#view-orient details')]; return [ds.length, ds.filter(d => d.open).length, ds.filter(d => !d.getClientRects().length).length]; });
        check('every training card is open and on screen for the audits', seen[0] === seen[1] && seen[2] === 0 && seen[0] >= DATA.MODS.length + 2, seen.join(' / '));
        const out = await p.evaluate(() => [...document.querySelectorAll('#view-orient details.card > svg, #view-orient details.card .howto-pic, #view-orient details.card svg.stack')].filter(s => { const r = s.getBoundingClientRect(), c = s.closest('details').getBoundingClientRect(); return r.left < c.left + 9 || r.right > c.right - 9; }).map(s => s.getAttribute('class')));
        check('orientation drawings stay inside their card', out.length === 0, out.join(' '));
      }
      const ov = await overflow(p); check(t + ' has no sideways scroll', ov <= 0, ov + 'px');
      const wideT = await p.evaluate(() => [...document.querySelectorAll('.tbl-wrap')].filter(e => e.getClientRects().length && e.scrollWidth > e.clientWidth + 1).map(e => ((e.closest('details, .card') || {}).id || '?') + ' ' + e.scrollWidth + '>' + e.clientWidth));
      check(t + ': no table has to be scrolled sideways', wideT.length === 0, wideT.join(' | '));
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
      if (t === 'orient') await showAllTraining(p);
      else await p.evaluate(v => { document.querySelectorAll('#view-' + v + ' details').forEach(d => { d.open = true; }); }, t);
      await p.waitForTimeout(200);
      const out = await p.evaluate(PIC_AUDIT);
      pics += out.pics; labels += out.labels;
      check(t + ': no picture label is cut by its picture or sits on another label', out.res.length === 0, out.res.slice(0, 5).join(' | '));
    }
    check('the picture audit saw the pictures', pics >= 138 && labels >= 1400, pics + ' pictures, ' + labels + ' labels');
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
    await tab(p, 'orient'); await p.click('#ease-card summary'); await p.click('#motion-toggle');
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
    check('every station has its heading and a jump chip, in the course order', st.groups.length >= 18 && st.groups.join() === DATA.GROUPS.map(g => 'g-' + g.id).join() && st.jumps.join() === st.groups.join(), st.groups + ' / ' + st.jumps);
    check('each station button counts its questions', st.btns.length === DATA.GROUPS.length && DATA.GROUPS.every((g, i) => st.btns[i].startsWith(g.bank + ':') && st.btns[i].endsWith('(' + DATA.BANKS[g.bank].length + ')')), st.btns.join(' | '));
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
    // the put-in-order games that live inside the modules, at every level
    const seqKeys = Object.keys(DATA.SEQS).filter(k => !DATA.SEQS[k].visual);
    await tab(p, 'orient'); await pickLevel(p, 'all');
    for (const k of seqKeys) {
      const host = await p.evaluate(key => { const e = document.querySelector('[data-seq="' + key + '"]'); if (!e) return null; e.closest('details').open = true; return '#' + e.id; }, k);
      if (!check(`${k}: its game is on the page`, !!host, k)) continue;
      await p.waitForTimeout(60);
      check(`${k}: its chips are on screen to tap`, await p.evaluate(h => { const b = document.querySelector(h + ' .pool button'); return !!b && b.getClientRects().length > 0; }, host));
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
  // ---------- 6a. the path: crew, shift lead, manager ----------
  S('levels');
  {
    const p = await open(browser, { hash: '#orient' });
    const look = () => p.evaluate(() => {
      const v = document.getElementById('view-orient'), on = e => !!e && e.getClientRects().length > 0;
      let stored = 'blocked'; try { stored = localStorage.getItem('jm-level'); } catch (e) {}
      return {
        show: v.getAttribute('data-show'),
        mods: [...v.querySelectorAll(':scope > details.mod')].filter(on).map(d => d.getAttribute('data-mod')).sort().join(),
        heads: [...v.querySelectorAll('.level-head')].filter(on).map(e => e.id).join(),
        chips: [...v.querySelectorAll('.jump a')].filter(on).map(a => a.getAttribute('data-jump')).join(),
        grps: [...v.querySelectorAll('.section-title.grp')].filter(on).map(e => e.id).join(),
        pressed: [...document.querySelectorAll('#path .lv')].map(b => b.getAttribute('aria-pressed')).join(),
        counts: [...document.querySelectorAll('#path .lv .lv-c')].map(e => e.textContent).join('|'),
        now: document.getElementById('path-now').textContent,
        all: document.getElementById('path-all').textContent + ':' + document.getElementById('path-all').getAttribute('aria-pressed'),
        words: on(document.getElementById('o-words')), stored
      };
    });
    const ids = n => modsAt(n).map(m => m.id).sort().join(), gids = n => groupsAt(n).map(g => 'g-' + g.id).join();
    let s = await look();
    check('a first visit opens on the crew level, and nothing is stored until you pick', s.show === '1' && s.pressed === 'true,false,false' && s.stored === null, JSON.stringify(s).slice(0, 240));
    check('level 1 shows the crew cards and only those', s.mods === ids(1) && s.heads === 'lv-1' && !s.words, s.heads + ' ' + s.mods.slice(0, 120));
    check('level 1 offers the crew stations as headings and jump chips', s.chips === gids(1) && s.grps === gids(1), s.chips + ' / ' + s.grps);
    check('each level button counts its cards', s.counts === [1, 2, 3].map(n => '0 of ' + modsAt(n).length).join('|'), s.counts);
    check('the line under the buttons says what is showing', s.now === 'Showing level 1: Crew. Work every station.' && s.all === 'Show every level:false', s.now + ' / ' + s.all);
    const names = await p.evaluate(() => [...document.querySelectorAll('#path .lv')].map(b => b.getAttribute('aria-label')).join(' | '));
    check('a level button says its name, its job and its count', /^Level 1, Crew\. Work every station\. 0 of \d+ cards locked in\. Showing now\. \| Level 2, Shift lead\. Run a shift\. 0 of \d+ cards locked in\. Show this level\. \| Level 3, Manager\. Run the store\./.test(names), names);

    await p.focus('#path .lv[data-level="2"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
    check('pressed from the keyboard, the level button keeps the focus', await p.evaluate(() => { const b = document.querySelector('#path .lv[data-level="2"]'); return document.activeElement === b && b.getAttribute('aria-pressed') === 'true'; }));
    check('the level buttons are a named group', (await p.evaluate(() => document.getElementById('path').getAttribute('role') + ':' + document.getElementById('path').getAttribute('aria-label'))) === 'group:Pick a level');
    s = await look();
    check('picking Shift lead shows its cards and only those', s.show === '2' && s.mods === ids(2) && s.heads === 'lv-2' && s.chips === gids(2) && s.grps === gids(2) && s.pressed === 'false,true,false', JSON.stringify(s).slice(0, 300));
    check('the pick is kept on this device', s.stored === '2', s.stored);
    const hy = await p.evaluate(() => { const r = document.getElementById('lv-2').getBoundingClientRect(), t = document.querySelector('.tabs').getBoundingClientRect(); return { top: Math.round(r.top), tabs: Math.round(t.bottom), vh: innerHeight }; });
    check('and its band is brought up under the tabs', hy.top >= hy.tabs - 2 && hy.top < hy.vh - 120, JSON.stringify(hy));
    let ov = await overflow(p); check('level 2 has no sideways scroll', ov <= 0, ov);

    await p.evaluate(() => window.scrollTo(0, 0)); await pickLevel(p, 3); await p.waitForTimeout(900);
    s = await look();
    check('picking Manager shows its cards and the plain-English word list', s.show === '3' && s.mods === ids(3) && s.heads === 'lv-3' && s.chips === gids(3) && s.words && s.now === 'Showing level 3: Manager. Run the store.', JSON.stringify(s).slice(0, 300));
    ov = await overflow(p); check('level 3 has no sideways scroll', ov <= 0, ov);
    const bad = await p.evaluate(TAP_AUDIT); check('level 3 tap targets are 44px', bad.length === 0, bad.slice(0, 6).join(' | '));

    await pickLevel(p, 'all');
    s = await look();
    check('Show every level lays out all three, one after the other', s.show === 'all' && s.mods === DATA.MODS.map(m => m.id).sort().join() && s.heads === 'lv-1,lv-2,lv-3' && s.chips === DATA.GROUPS.map(g => 'g-' + g.id).join() && s.pressed === 'false,false,false' && s.all === 'Back to one level:true' && s.now === 'Showing every level, one after the other.', JSON.stringify(s).slice(0, 300));
    await p.evaluate(() => document.getElementById('path-all').click()); s = await look();
    check('Back to one level returns to the crew level', s.show === '1' && s.mods === ids(1) && s.all === 'Show every level:false', s.show + ' ' + s.all);

    await p.evaluate(() => window.scrollTo(0, 0)); await pickLevel(p, 3); await p.reload(); await p.waitForTimeout(250);
    s = await look();
    check('the level is still picked after a reload', s.show === '3' && s.pressed === 'false,false,true' && s.mods === ids(3), s.show + ' ' + s.pressed);
    // a link inside a card can point into another level (the trainer's card sends you to the crew check lists): it shows that level, then lands on its target
    await p.evaluate(() => window.scrollTo(0, 0)); await pickLevel(p, 2);
    await p.click('#o-trainer summary'); await p.click('#o-trainer a[data-jump="g-check"]'); await p.waitForTimeout(900);
    s = await look();
    const gy = await p.evaluate(() => { const r = document.getElementById('g-check').getBoundingClientRect(); return { top: Math.round(r.top), on: r.height > 0, vh: innerHeight }; });
    check('a link into another level switches to that level and lands on its target', s.show === '1' && s.stored === '1' && gy.on && gy.top > 0 && gy.top < gy.vh - 60, s.show + ' ' + JSON.stringify(gy));
    const links = await p.evaluate(() => [...document.querySelectorAll('#view-orient details a[href]')].map(a => a.getAttribute('data-jump') + ':' + !!document.getElementById(a.getAttribute('data-jump') || '-')).join());
    check('every link inside a card points at something on the page', links.split(',').every(x => /:true$/.test(x)), links);

    // a card locked in (every question right on two different days) counts on its level's button
    const small = modsAt(2).slice().sort((a, b) => (a.q.length + (a.seq ? 1 : 0)) - (b.q.length + (b.seq ? 1 : 0)))[0];
    const quizIt = async () => { await tab(p, 'orient'); await p.evaluate(id => { const d = document.getElementById('o-' + id); d.open = true; d.querySelector('[data-quiz]').click(); }, small.id); return runToEnd(p, true); };
    await quizIt();
    await p.evaluate(() => { const sc = JSON.parse(localStorage.getItem('jm-sched-v1')); Object.keys(sc).forEach(k => { sc[k].due = Date.now() - 1000; }); localStorage.setItem('jm-sched-v1', JSON.stringify(sc)); });
    await p.reload(); await p.waitForTimeout(250);
    await quizIt(); await tab(p, 'orient');
    const c2 = await p.evaluate(id => { const b = document.querySelector('#path .lv[data-level="2"]'); return { count: b.querySelector('.lv-c').textContent, bar: parseFloat(b.querySelector('.bar i').style.width), pill: document.querySelector('#o-' + id + ' .mod-p').textContent, label: b.getAttribute('aria-label') }; }, small.id);
    check('a card locked in counts on its level button', c2.count === `1 of ${modsAt(2).length}` && c2.pill === 'Locked in' && c2.bar > 0 && c2.label.includes('1 of ' + modsAt(2).length + ' cards locked in'), JSON.stringify(c2));
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }

  // ---------- 6b. one card open at a time ----------
  S('one card at a time');
  {
    const p = await open(browser, { hash: '#orient' });
    const openMods = () => p.evaluate(() => [...document.querySelectorAll('#view-orient details.mod[open]')].map(d => d.id).join());
    check('"One card open at a time" starts switched on, in a settings card that starts folded', await p.evaluate(() => document.getElementById('focus-toggle').checked && !document.getElementById('ease-card').open));
    await p.click('#o-values summary'); await p.waitForTimeout(200);
    check('a tap opens a card', (await openMods()) === 'o-values', await openMods());
    // put the next card's title mid-screen, tap it, and see that it has not moved under the finger even though the card above it folded
    await p.evaluate(() => { const r = document.querySelector('#o-food summary').getBoundingClientRect(); window.scrollBy(0, r.top - 320); }); await p.waitForTimeout(250);
    const before = await p.evaluate(() => Math.round(document.querySelector('#o-food summary').getBoundingClientRect().top));
    await p.click('#o-food summary'); await p.waitForTimeout(400);
    const after = await p.evaluate(() => Math.round(document.querySelector('#o-food summary').getBoundingClientRect().top));
    check('opening the next card folds the one before', (await openMods()) === 'o-food', await openMods());
    check('and the card you tapped stays where your finger is', Math.abs(before - 320) <= 3 && Math.abs(after - before) <= 3, before + ' -> ' + after);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.click('#ease-card summary'); await p.click('#focus-toggle');
    check('the switch turns it off, and that is kept on this device', !(await p.evaluate(() => document.getElementById('focus-toggle').checked)) && (await p.evaluate(() => localStorage.getItem('jm-focus'))) === 'off');
    await p.click('#o-values summary'); await p.waitForTimeout(250);
    check('switched off, two cards can be open together', (await openMods()) === 'o-values,o-food', await openMods());
    await p.reload(); await p.waitForTimeout(250);
    check('still off after a reload', !(await p.evaluate(() => document.getElementById('focus-toggle').checked)));
    await p.click('#o-values summary'); await p.click('#o-uniform summary'); await p.waitForTimeout(250);
    check('and two cards still stay open', (await openMods()) === 'o-values,o-uniform', await openMods());
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }

  // ---------- 6c. the check lists you can tick ----------
  S('check lists');
  {
    const p = await open(browser, { hash: '#orient' });
    const LIST = 'ul.ticks[data-check="sprinkler"]';
    const T = () => p.evaluate(sel => {
      const ul = document.querySelector(sel), rows = [...ul.children], foot = ul.nextElementSibling;
      return { n: rows.length, roles: rows.every(li => li.getAttribute('role') === 'checkbox' && li.tabIndex === 0), on: rows.map((li, i) => li.getAttribute('aria-checked') === 'true' ? i : -1).filter(i => i >= 0).join(),
        count: foot.querySelector('.ticks-n').textContent, clear: !foot.querySelector('button').hidden, group: ul.getAttribute('role') + ':' + ul.getAttribute('aria-label'),
        minH: Math.min(...rows.map(li => li.getBoundingClientRect().height)), store: localStorage.getItem('jm-ticks-v1') };
    }, LIST);
    await p.click('#o-cksprk summary'); await p.waitForTimeout(200);
    let t = await T();
    check('a check list is a named group of tick boxes, none ticked to start', t.n === 11 && t.roles && t.on === '' && t.count === '0 of 11 ticked' && !t.clear && t.group === 'group:Sprinkler check', JSON.stringify(t));
    check('tick rows are big enough to tap', t.minH >= 43.5, t.minH);
    await p.click(LIST + ' li:nth-child(1)');
    await p.focus(LIST + ' li:nth-child(3)'); await p.keyboard.press('Space');
    t = await T();
    check('a tap ticks a line, and so does the space bar', t.on === '0,2' && t.count === '2 of 11 ticked' && t.clear, JSON.stringify(t));
    check('ticks are kept on this device', t.store === '{"sprinkler":[0,2]}', t.store);
    await p.reload(); await p.waitForTimeout(250); await p.click('#o-cksprk summary'); await p.waitForTimeout(200);
    t = await T(); check('ticks are still there after a reload', t.on === '0,2' && t.count === '2 of 11 ticked', JSON.stringify(t));
    await p.click(LIST + ' li:nth-child(1)');
    t = await T(); check('a second tap takes a tick off', t.on === '2' && t.count === '1 of 11 ticked', JSON.stringify(t));
    await clickBtn(p, 'Clear these ticks', '#o-cksprk');
    t = await T(); check('Clear these ticks empties that list', t.on === '' && t.count === '0 of 11 ticked' && !t.clear && t.store === '{}', JSON.stringify(t));
    const lists = await p.evaluate(() => [...document.querySelectorAll('ul.ticks')].map(u => ({ key: u.getAttribute('data-check'), live: u.classList.contains('live'), foot: !!u.nextElementSibling && u.nextElementSibling.classList.contains('ticks-foot'), name: u.getAttribute('aria-label') })));
    check('every check list on the page works the same way, each under its own name', lists.length >= 9 && lists.every(l => l.key && l.live && l.foot && l.name) && new Set(lists.map(l => l.key)).size === lists.length, JSON.stringify(lists).slice(0, 300));
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }

  // ---------- 6d. the practice math: each box starts on the video's own numbers ----------
  S('practice math');
  {
    const p = await open(browser, { hash: '#orient' });
    await pickLevel(p, 3);
    const show = key => p.evaluate(k => { document.querySelector('.calc[data-calc="' + k + '"]').closest('details').open = true; }, key);
    const rows = key => p.evaluate(k => [...document.querySelectorAll('.calc[data-calc="' + k + '"] .calc-out > *')].map(e => e.classList.contains('calc-t') ? 'note: ' + e.textContent : e.querySelector('span').textContent + ' = ' + e.querySelector('b').textContent), key);
    const WANT = {
      order: ['On hand now, in cases = 0.25', 'Used since the last order = 1.25 cases', "Order 1: you'd have 1.25 = no cushion", "Order 2: you'd have 2.25 = has a cushion", "Order 3: you'd have 3.25 = has a cushion", 'note: Having only what you used last time may not be enough. Leave room for a busy week or a damaged case.'],
      cogu: ['Working inventory = $12,000', 'Cost of goods used = $6,500', 'As a percent of sales = 28%'],
      goal: ['Goal (theoretical + 2) = 27.71%', 'Over goal by = 0.37 points', 'note: High. Look for red variances: too much going out.'],
      forecast: ['4-week average = $17,535', 'Last year plus 5% = $17,492.02', 'note: Then adjust for the time of year, the 10-day weather, local events and big catering orders.'],
      labor: ['Labor percent = 14.92%', 'note: Too high? Go back to the shift lines. Try a quarter hour later start or earlier finish.'],
      loaf: ['Average sales per loaf = $16.50', 'Average bread per day = 143 loaves', '10 more loaves a day adds = $1,155 a week', 'The week becomes = $17,655'],
      week: ['Average bread per day = 143', 'Average sales per loaf = $16.50', 'Variance (actual minus theoretical) = 2.37 points', "note: Circle food cost: it's more than 2 points over theoretical."]
    };
    const found = await p.evaluate(() => [...document.querySelectorAll('.calc[data-calc]')].map(c => c.getAttribute('data-calc')).sort().join());
    check('all seven practice boxes are on the page', found === Object.keys(WANT).sort().join(), found);
    for (const k of Object.keys(WANT)) {
      await show(k); await p.waitForTimeout(60);
      const got = await rows(k);
      check(`${k}: the example works out to the video's numbers`, got.join(' | ') === WANT[k].join(' | '), got.join(' | '));
    }
    await show('labor'); await p.waitForTimeout(80);
    const S_IN = '#calc-labor-s';
    await p.fill(S_IN, '3000');
    check('typing a new number moves the answer', (await rows('labor'))[0] === 'Labor percent = 11.19%', (await rows('labor'))[0]);
    await p.fill(S_IN, '$2,250');
    check('a dollar sign and a comma are read as the number', (await rows('labor'))[0] === 'Labor percent = 14.92%', (await rows('labor'))[0]);
    await p.fill(S_IN, 'abc');
    check('a slip of the thumb gets a plain note, never a broken number', (await rows('labor')).join() === 'note: Sales has to be more than 0.', (await rows('labor')).join());
    await clickBtn(p, 'Back to the example', '.calc[data-calc="labor"]');
    check('Back to the example puts the video numbers back', (await rows('labor'))[0] === 'Labor percent = 14.92%' && (await p.inputValue(S_IN)) === '2250', await p.inputValue(S_IN));
    const wild = await p.evaluate(() => { const bad = []; document.querySelectorAll('.calc[data-calc]').forEach(c => { for (const v of ['', '0', '-5', '1e9', '0.001', '7,5', '..', '1/2']) { c.querySelectorAll('input').forEach(i => { i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); }); const t = c.querySelector('.calc-out').textContent; if (!t || /NaN|Infinity|undefined|null/.test(t)) bad.push(c.getAttribute('data-calc') + ' with "' + v + '": ' + t.slice(0, 80)); } }); return bad; });
    check('no box ever shows NaN or Infinity, whatever is typed', wild.length === 0, wild.join(' | '));
    const inputs = await p.evaluate(() => [...document.querySelectorAll('.calc input')].map(i => ({ id: i.id, lab: !!document.querySelector('label[for="' + i.id + '"]') && document.querySelector('label[for="' + i.id + '"]').textContent.trim().length > 3, fs: parseFloat(getComputedStyle(i).fontSize), mode: i.getAttribute('inputmode') })));
    check('every number box has a label, a number keypad, and type big enough that an iPhone does not zoom in', inputs.length === 24 && new Set(inputs.map(i => i.id)).size === 24 && inputs.every(i => i.lab && i.fs >= 16 && i.mode === 'decimal'), JSON.stringify(inputs.filter(i => !(i.lab && i.fs >= 16 && i.mode === 'decimal'))).slice(0, 200) + ' of ' + inputs.length);
    const ov = await overflow(p); check('practice math has no sideways scroll', ov <= 0, ov);
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }

  // ---------- 6e. the day by the clock: the box follows the time of day ----------
  S('day clock');
  {
    const day = '2026-11-10T', zone = ':00-05:00';
    const p = await open(browser, { hash: '#orient', at: day + '14:30' + zone });
    await pickLevel(p, 2);
    await p.click('#o-dayclock summary'); await p.waitForTimeout(200);
    const now = () => p.evaluate(() => { const t = document.querySelector('#day-now .now-t'), d = document.querySelector('#day-now .now-d'); return { t: t ? t.textContent : '', d: d ? d.textContent : '', lit: [...document.querySelectorAll('.dayparts dt.now')].map(x => x.id).join(), shown: document.getElementById('day-now').getClientRects().length > 0 }; });
    let n = await now();
    check('at 2:30 in the afternoon the box says mid-day, says what happens then, and marks that part', n.shown && n.t === "It's 2:30 p.m. On the example clock this is mid-day." && /^The mid-day checklist/.test(n.d) && n.lit === 'dp-mid', JSON.stringify(n));
    for (const [at, starts, lit] of [
      ['07:59', "It's 7:59 a.m. On the example clock the store is closed.", ''], ['08:00', "It's 8:00 a.m. On the example clock this is opening time.", 'dp-open'], ['10:59', "It's 10:59 a.m. On the example clock this is opening time.", 'dp-open'],
      ['11:00', "It's 11:00 a.m. On the example clock this is the lunch rush.", 'dp-lunch'], ['12:00', "It's 12:00 p.m. On the example clock this is the lunch rush.", 'dp-lunch'], ['14:00', "It's 2:00 p.m. On the example clock this is mid-day.", 'dp-mid'],
      ['17:45', "It's 5:45 p.m. On the example clock this is the dinner rush.", 'dp-dinner'], ['19:00', "It's 7:00 p.m. On the example clock this is close-down time.", 'dp-close'], ['21:14', "It's 9:14 p.m. On the example clock this is close-down time.", 'dp-close'],
      ['21:15', "It's 9:15 p.m. On the example clock the store is closed.", ''], ['00:05', "It's 12:05 a.m. On the example clock the store is closed.", '']]) {
      await p.clock.setFixedTime(new Date(day + at + zone));
      await p.evaluate(() => { document.getElementById('o-dayclock').open = false; }); await p.waitForTimeout(60);
      await p.evaluate(() => { document.getElementById('o-dayclock').open = true; }); await p.waitForTimeout(120);
      n = await now();
      check(`the clock box at ${at}`, n.t === starts && n.lit === lit && (lit ? n.d.length > 10 : n.d === ''), JSON.stringify(n));
    }
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
    // left open, the box keeps time by itself: the lid closes at 1:59 and opens again at 2:00
    const q = await open(browser, { hash: '#orient', clockAt: day + '13:59' + zone });
    await pickLevel(q, 2); await q.click('#o-dayclock summary'); await q.waitForTimeout(250);
    const t1 = await q.evaluate(() => document.querySelector('#day-now .now-t').textContent);
    await q.clock.pauseAt(new Date(day + '14:00:30-05:00')); await q.waitForTimeout(150);
    const t2 = await q.evaluate(() => ({ t: document.querySelector('#day-now .now-t').textContent, lit: [...document.querySelectorAll('.dayparts dt.now')].map(x => x.id).join() }));
    check('left open, the box moves on with the clock without a tap', t1 === "It's 1:59 p.m. On the example clock this is the lunch rush." && t2.t === "It's 2:00 p.m. On the example clock this is mid-day." && t2.lit === 'dp-mid', t1 + ' -> ' + JSON.stringify(t2));
    check('no script errors with the clock jumped', q.__errs.length === 0, q.__errs.join(' | '));
    await q.__close();
  }

  // ---------- 6f. every card can be read out loud ----------
  S('read aloud');
  {
    const p = await open(browser, { hash: '#orient' });
    const cards = await p.evaluate(() => [...document.querySelectorAll('#view-orient > details.card:not(.ease-card)')].map(d => ({ id: d.id, n: d.querySelectorAll('.say-btn').length, label: (d.querySelector('.say-btn span') || {}).textContent })));
    check('every training card has a Read this card to me button', cards.length === DATA.MODS.length + 1 && cards.every(c => c.n === 1 && c.label === 'Read this card to me'), cards.filter(c => c.n !== 1).map(c => c.id).join() + ' of ' + cards.length);
    check('the settings card says so, and has no such button itself', (await p.evaluate(() => document.getElementById('listen-note').textContent)) === 'Every card has a button that reads it to you. ' && (await p.evaluate(() => document.querySelectorAll('#ease-card .say-btn').length)) === 0);
    const said = () => p.evaluate(() => window.__spoken.slice());
    // at a talking pace: the button becomes Stop, and Stop stops it
    await p.click('#o-food summary'); await p.waitForTimeout(150);
    const title = await p.evaluate(() => document.querySelector('#o-food summary h2').textContent.replace(/\s+/g, ' ').trim());
    await p.evaluate(() => { window.__slow = true; window.__spoken.length = 0; });
    await p.click('#o-food .say-btn');
    check('the button turns into Stop while the card is read', (await txt(p, '#o-food .say-btn')) === 'Stop' && (await p.getAttribute('#o-food .say-btn', 'aria-pressed')) === 'true', await txt(p, '#o-food .say-btn'));
    check('the reading starts with the card\'s title', await p.waitForFunction(t => window.__spoken[0] === t + '.', title, { timeout: 2000 }).then(() => true, () => false), JSON.stringify((await said()).slice(0, 2)));
    await p.click('#o-food .say-btn');
    const n1 = (await said()).length; await p.waitForTimeout(800);
    check('Stop stops it, and the button offers to read again', (await said()).length === n1 && (await txt(p, '#o-food .say-btn')) === 'Read this card to me' && (await p.evaluate(() => window.__cancels)) >= 1, n1 + ' then ' + (await said()).length);
    // folding the card, leaving the level, leaving the tab: each one quiets the voice, because its Stop button is gone from the screen
    const stopsWhen = async (what, act) => {
      await p.evaluate(() => { document.getElementById('o-food').open = true; }); await p.waitForTimeout(120);
      await p.click('#o-food .say-btn'); await p.waitForTimeout(150);
      const on = await p.getAttribute('#o-food .say-btn', 'aria-pressed'), c0 = await p.evaluate(() => window.__cancels);
      await act(); await p.waitForTimeout(200);
      const n = (await said()).length; await p.waitForTimeout(800);
      check(`${what} stops the reading`, on === 'true' && (await p.evaluate(() => window.__cancels)) > c0 && (await said()).length === n && (await p.evaluate(() => document.querySelector('#o-food .say-btn').getAttribute('aria-pressed'))) === 'false', on + ' ' + n + ' then ' + (await said()).length);
    };
    await stopsWhen('folding the card', () => p.click('#o-food summary'));
    await stopsWhen('picking another level', async () => { await p.evaluate(() => window.scrollTo(0, 0)); await pickLevel(p, 2); });
    await p.evaluate(() => window.scrollTo(0, 0)); await pickLevel(p, 1); await p.waitForTimeout(700);
    await stopsWhen('leaving the Training tab', () => tab(p, 'study'));
    await tab(p, 'orient'); await p.evaluate(() => { window.__slow = false; });
    // flat out: what a whole card says
    const readCard = async id => {
      await p.evaluate(i => { window.__fast = true; window.__spoken.length = 0; const d = document.getElementById(i); d.open = true; d.querySelector('.say-btn').click(); }, id);
      const ok = await p.waitForFunction(i => document.querySelector('#' + i + ' .say-btn').getAttribute('aria-pressed') === 'false', id, { timeout: 20000 }).then(() => true, () => false);
      const out = await said(); await p.evaluate(() => { window.__fast = false; });
      return ok ? out : [];
    };
    await pickLevel(p, 'all');
    const mid = await readCard('o-midday'), chick = await readCard('o-chick2'), steak = await readCard('o-steak'), slash = await readCard('o-slash');
    check('a two-column table is read a row at a time, with degrees and parts per million said as words', mid.includes('Walk-in cooler: 36 to 41 degrees.') && mid.some(x => /200 to 500 parts per million/.test(x)) && !/°|ppm/.test(mid.join(' ')), mid.slice(6, 12).join(' | '));
    check('a wider table names its columns', chick.join(' ').includes('Cheese slices. Regular: 3. Giant: 6.'), chick.join(' ').slice(0, 300));
    check('how-to steps are read by number, and an amount like 1.25 ounces is said in one piece', steak.includes('Step 3.') && steak.some(x => /spread out 1\.25 ounces of onions/.test(x)) && steak.some(x => /^Spread 0\.75 ounces of peppers/.test(x)), steak.slice(12, 20).join(' | '));
    check('the practice math stays out of the reading, and the card\'s own numbers stay in', slash.includes('1.5 minus 0.25 left means 1.25 cases used.') && !/Try it|Back to the example|On hand now/.test(slash.join(' ')), slash.join(' | ').slice(-300));
    const which = QUICK ? ['o-wrap', 'o-words'] : (name === 'chromium' ? cards.map(c => c.id) : ['o-wrap', 'o-words', 'o-where', 'o-trainer', 'o-cksprk', 'o-dayclock']);
    const slips = [];
    for (const id of which) {
      const out = await readCard(id);
      if (!out.length) { slips.push(id + ': nothing was read'); continue; }
      const head = (await p.evaluate(i => document.querySelector('#' + i + ' summary h2').textContent.replace(/\s+/g, ' ').trim(), id)).replace(/#(\d)/g, 'number $1');
      if (out[0].replace(/[.?!]$/, '') !== head.replace(/[.?!]$/, '')) slips.push(id + ': starts with "' + out[0] + '"');
      const text = out.join(' '), seen = new Set();
      const odd = text.match(/undefined|NaN|\bnull\b|[<>°½¼¾#]|\.\.|\s[.,]|::|[.?!]["”]\.|Quiz me on this|Read this card|\d+ of \d+ ticked|Walk me through|\ban number\b/);
      if (odd) slips.push(id + ': says "' + odd[0] + '"');
      out.forEach(x => { if (x.length >= 28 && seen.has(x) && x !== 'Grill: chicken, then cheese.') slips.push(id + ': says twice "' + x.slice(0, 50) + '"'); seen.add(x); });
    }
    check(`${which.length} cards read through: each starts with its title, says nothing twice, and reads out no button or stray sign`, slips.length === 0, slips.slice(0, 6).join(' | '));
    // the grill walkthrough reads its amounts in one piece too
    await pickLevel(p, 'all'); await p.evaluate(() => { document.getElementById('o-steak').open = true; }); await p.waitForTimeout(100);
    await p.click('#o-steak [data-walk="steak"]'); await p.waitForTimeout(450);
    await clickBtn(p, 'Next', '#sheet'); await clickBtn(p, 'Next', '#sheet');
    await p.evaluate(() => { window.__spoken.length = 0; }); await p.click('#sheet .walk .say-btn');
    check('the walkthrough says "1.25 ounces" in one piece', await p.waitForFunction(() => window.__spoken.some(x => /1\.25 ounces of onions/.test(x)), null, { timeout: 3000 }).then(() => true, () => false), JSON.stringify(await said()));
    await p.keyboard.press('Escape');
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
  }

  // ---------- 6g. the level reaches the Drill tab: the training bar, the quiz list, the daily session ----------
  S('level and session');
  {
    const p = await open(browser, { hash: '#orient' });
    const ready = async () => { await tab(p, 'drill'); return (await txt(p, '#ready-orient-label')) + ' | ' + (await txt(p, '#ready-orient')) + ' | ' + (await txt(p, '#ready-board')); };
    let r = await ready();
    check('the training bar starts on the crew level', r === `Training facts, crew level | 0 of ${factsAt(1)} locked in | 0 of 47 locked in`, r);
    const ql = await p.evaluate(() => [...document.querySelectorAll('#quiz-list > *')].map(e => e.classList.contains('qz-h') ? '## ' + e.textContent : e.querySelector('[data-bank]').getAttribute('data-bank')).join());
    const wantQl = Object.keys(DATA.BANKS).filter(b => !lvOfBank(b)).concat(...DATA.LEVELS.map(L => ['## Level ' + L.n + ': ' + L.title].concat(Object.keys(DATA.BANKS).filter(b => lvOfBank(b) === L.n)))).join();
    check('the quiz list is grouped by level, with every quiz in it', ql === wantQl && ql.split(',').filter(x => !x.startsWith('##')).length === Object.keys(DATA.BANKS).length, ql);
    await tab(p, 'orient'); await pickLevel(p, 3);
    r = await ready();
    check('pick Manager and the bar counts the manager facts, while the board bar stays as it was', r === `Training facts, manager level | 0 of ${factsAt(3)} locked in | 0 of 47 locked in`, r);
    await tab(p, 'orient'); await pickLevel(p, 'all');
    r = await ready();
    check('with every level showing, the bar counts them all', r === `Training facts, every level | 0 of ${factsAt(0)} locked in | 0 of 47 locked in` && factsAt(0) === factsAt(1) + factsAt(2) + factsAt(3), r);
    await tab(p, 'orient'); await p.evaluate(() => window.scrollTo(0, 0)); await pickLevel(p, 3);
    // a session at manager level: the menu still comes, and the new facts beside it are manager facts
    await tab(p, 'drill'); await p.click('#today-btn');
    check('a first session at manager level is still ten cards', (await txt(p, '#q-area .prog .mono')) === '1 of 10', await txt(p, '#q-area .prog .mono'));
    const factLv = [];
    for (let i = 0; i < 40; i++) {
      const k = await cardKind(p);
      if (k === 'summary') break;
      if (k === 'teach' && await vis(p, '#q-area .fact')) {
        await clickBtn(p, 'Got it, ask me');
        const q = ALLQ[await txt(p, '#q-area .q-text')];
        factLv.push(q ? lvOfBank(bankOfQ(q)) : -1);
      }
      await answer(p, true);
    }
    check('its five new facts are manager facts', factLv.join() === '3,3,3,3,3', factLv.join());
    // what you have met comes back whatever level is showing
    await p.evaluate(() => { const sc = JSON.parse(localStorage.getItem('jm-sched-v1')); Object.keys(sc).forEach(k => { sc[k].due = Date.now() - 1000; }); localStorage.setItem('jm-sched-v1', JSON.stringify(sc)); });
    await p.reload(); await p.waitForTimeout(250);
    await tab(p, 'orient'); await p.evaluate(() => window.scrollTo(0, 0)); await pickLevel(p, 1); await tab(p, 'study');
    check('back on the crew level, the manager facts you met are still due for review', (await txt(p, '#st-title')) === '10 to review today', await txt(p, '#st-title'));
    await p.click('#study-today [data-today]');
    let back = 0, fresh = [];
    for (let i = 0; i < 60; i++) {
      const k = await cardKind(p);
      if (k === 'summary') break;
      if (k === 'teach' && await vis(p, '#q-area .fact')) { await clickBtn(p, 'Got it, ask me'); const q = ALLQ[await txt(p, '#q-area .q-text')]; fresh.push(q ? lvOfBank(bankOfQ(q)) : -1); }
      else if (k === 'bank') { const q = ALLQ[await txt(p, '#q-area .q-text')]; if (q && lvOfBank(bankOfQ(q)) === 3) back++; }
      await answer(p, true);
    }
    check('and the next session brings all five back, with new facts that are not manager facts beside them', back === 5 && fresh.length >= 1 && fresh.every(l => l === 0 || l === 1), back + ' back, new at levels ' + fresh.join());
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
    await p.click('#ease-card summary'); await p.click('#motion-toggle');
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

  // ---------- 7b. picking one of the device's voices ----------
  S('voices');
  {
    const voiceBtn = async p => { await tab(p, 'orient'); await p.evaluate(() => { document.getElementById('ease-card').open = true; window.scrollTo(0, 0); }); await p.waitForTimeout(100); };
    const rows = p => p.evaluate(() => [...document.querySelectorAll('#sheet .vrow')].map(b => ({ t: b.querySelector('b').textContent, note: (b.querySelector('span') || {}).textContent || '', on: b.getAttribute('aria-pressed') === 'true' })));
    const tapRow = (p, title) => p.evaluate(t => { const b = [...document.querySelectorAll('#sheet .vrow')].find(x => x.querySelector('b').textContent === t); if (!b) return false; b.click(); return true; }, title);
    const used = p => p.evaluate(() => window.__used[window.__used.length - 1] || null);
    const p = await open(browser, { voices: VOICES });
    await voiceBtn(p);
    check('the page picks the best voice the device has, and says which', (await txt(p, '#voice-row [data-voice-open]')) === 'Voice: Ava (Premium). Change', await txt(p, '#voice-row [data-voice-open]'));
    await p.click('#voice-row [data-voice-open]'); await p.waitForTimeout(350);
    const r0 = await rows(p);
    check('the sheet lists the English voices best first, each once, without the joke voice, the old synthesizer or the Spanish one', (await txt(p, '#sheet-title')) === 'Pick a voice' && r0.map(r => r.t).join('|') === ['Let the page choose'].concat(VOICE_ROWS).join('|'), r0.map(r => r.t).join('|'));
    check('it starts on Let the page choose, and says what each voice needs', r0[0].on && r0.filter(r => r.on).length === 1 && r0[3].note === 'needs the internet' && r0[4].note === 'British', JSON.stringify(r0));
    let bad = await p.evaluate(TAP_AUDIT); check('voice sheet tap targets are 44px', bad.length === 0, bad.slice(0, 6).join(' | '));
    check('voice sheet has no sideways scroll', (await overflow(p)) <= 0);
    await p.evaluate(() => { window.__slow = true; window.__spoken.length = 0; });
    await tapRow(p, 'Samantha');
    check('tapping a voice says a sample line in it', await p.waitForFunction(() => window.__spoken.length > 0, null, { timeout: 2000 }).then(() => true, () => false) && (await used(p)).voice === 'Samantha' && /^Number 13, the Original Italian/.test(await p.evaluate(() => window.__spoken[0])), JSON.stringify(await used(p)));
    const r1 = await rows(p);
    check('and keeps it: the row is marked, it is saved on the device, and the button names it', r1.find(r => r.t === 'Samantha').on && r1.filter(r => r.on).length === 1 && (await p.evaluate(() => localStorage.getItem('jm-voice'))) === 'Samantha|en-US', JSON.stringify(r1.filter(r => r.on)) + ' ' + await p.evaluate(() => localStorage.getItem('jm-voice')));
    const c0 = await p.evaluate(() => window.__cancels);
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    check('putting the sheet away stops the sample', (await p.evaluate(() => window.__cancels)) > c0);
    check('every voice button on the page now names the new voice', (await txt(p, '#voice-row [data-voice-open]')) === 'Voice: Samantha. Change', await txt(p, '#voice-row [data-voice-open]'));
    await p.evaluate(() => { window.__slow = false; window.__spoken.length = 0; });
    await p.click('#o-food summary'); await p.waitForTimeout(150); await p.click('#o-food .say-btn');
    await p.waitForFunction(() => window.__spoken.length > 0, null, { timeout: 2000 }).catch(() => {});
    let u = await used(p);
    check('cards are then read in that voice, at an easy pace', !!u && u.voice === 'Samantha' && u.lang === 'en-US' && Math.abs(u.rate - 0.92) < 0.001, JSON.stringify(u));
    await p.click('#o-food .say-btn');
    // slower
    await p.evaluate(() => window.scrollTo(0, 0)); await p.click('#voice-row [data-voice-open]'); await p.waitForTimeout(350);
    await clickBtn(p, 'Slower', '#sheet'); await tapRow(p, 'Daniel');
    await p.waitForFunction(() => window.__used.length && window.__used[window.__used.length - 1].voice === 'Daniel', null, { timeout: 2000 }).catch(() => {});
    u = await used(p);
    check('Slower slows it down, a British voice speaks British, and both are remembered', !!u && u.voice === 'Daniel' && u.lang === 'en-GB' && Math.abs(u.rate - 0.78) < 0.001 && (await p.evaluate(() => localStorage.getItem('jm-voice-slow'))) === '1', JSON.stringify(u));
    await clickBtn(p, 'Normal', '#sheet');
    await p.evaluate(() => { document.querySelector('#sheet .voice-tips summary').click(); }); await p.waitForTimeout(150);
    check('the sheet says plainly what to do when no voice sounds good', await vis(p, '#sheet .voice-tips dl') && /Enhanced or Premium/.test(await txt(p, '#sheet .voice-tips')) && (await overflow(p)) <= 0);
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    await p.reload(); await p.waitForTimeout(300);
    await voiceBtn(p);
    check('the choice is still there after a reload', (await txt(p, '#voice-row [data-voice-open]')) === 'Voice: Daniel. Change', await txt(p, '#voice-row [data-voice-open]'));
    await p.click('#voice-row [data-voice-open]'); await p.waitForTimeout(350);
    await tapRow(p, 'Let the page choose');
    await p.waitForFunction(() => window.__used.length && window.__used[window.__used.length - 1].voice === 'Ava (Premium)', null, { timeout: 2000 }).catch(() => {});
    check('Let the page choose hands the choice back', (await used(p)).voice === 'Ava (Premium)' && (await p.evaluate(() => localStorage.getItem('jm-voice'))) === '' && (await rows(p))[0].on, JSON.stringify(await used(p)));
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    // the Listen card has the same button
    await startRun(p, 'listen', 'italian');
    check('the Listen card names the voice too, and opens the same sheet', (await txt(p, '#q-area [data-voice-open]')) === 'Voice: Ava (Premium). Change' && (await p.click('#q-area [data-voice-open]'), await p.waitForTimeout(350), (await txt(p, '#sheet-title')) === 'Pick a voice'), await txt(p, '#q-area [data-voice-open]'));
    await p.keyboard.press('Escape');
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();
    // a device that hands its voices over late, one with none to offer, and a choice that has since gone
    const q = await open(browser);
    await voiceBtn(q);
    check('with no list yet the button says built in', (await txt(q, '#voice-row [data-voice-open]')) === 'Voice: built in. Change', await txt(q, '#voice-row [data-voice-open]'));
    await q.click('#voice-row [data-voice-open]'); await q.waitForTimeout(350);
    check('a device with one voice gets a plain Hear it button', (await rows(q)).length === 0 && /one built-in voice/.test(await txt(q, '#sheet')) && await clickBtn(q, 'Hear it', '#sheet') && await q.waitForFunction(() => window.__spoken.length > 0 && window.__used[0].voice === null, null, { timeout: 2000 }).then(() => true, () => false));
    await q.keyboard.press('Escape'); await q.waitForTimeout(250);
    await q.evaluate(list => window.__voicesArrive(list), VOICES); await q.waitForTimeout(150);
    check('when the voices arrive late, the button catches up', (await txt(q, '#voice-row [data-voice-open]')) === 'Voice: Ava (Premium). Change', await txt(q, '#voice-row [data-voice-open]'));
    check('no script errors', q.__errs.length === 0, q.__errs.join(' | '));
    await q.__close();
    const g = await open(browser, { voices: VOICES, store: { 'jm-voice': 'Zoe (Enhanced)|en-US' } });
    await voiceBtn(g);
    check('a chosen voice that is no longer on the device falls back to the best one', (await txt(g, '#voice-row [data-voice-open]')) === 'Voice: Ava (Premium). Change', await txt(g, '#voice-row [data-voice-open]'));
    await g.__close();
  }

  // ---------- 7c. the recorded voice ----------
  S('recorded voice');
  if (!AUDIO_KEYS.length) check('the site was built with its recordings', ALLOW_UNRECORDED, 'no recordings beside the site: run tools/voice/record.py and build again, or pass --allow-unrecorded');
  else {
    const rows = p => p.evaluate(() => [...document.querySelectorAll('#sheet .vrow')].map(b => ({ t: b.querySelector('b').textContent, on: b.getAttribute('aria-pressed') === 'true' })));
    const tapRow = (p, title) => p.evaluate(t => { const b = [...document.querySelectorAll('#sheet .vrow')].find(x => x.querySelector('b').textContent === t); if (!b) return false; b.click(); return true; }, title);
    const last = p => p.evaluate(() => ({ m: window.__media[window.__media.length - 1] || null, n: window.__media.length, log: window.__speechLog[window.__speechLog.length - 1] || null, paused: window.__lastAudio ? window.__lastAudio.paused : null, spoken: window.__spoken ? window.__spoken.length : -1 }));
    const heard = (p, ev, ms) => p.waitForFunction(e => { const m = window.__media[window.__media.length - 1]; return !!m && m.events.includes(e); }, ev, { timeout: ms || 5000 }).then(() => true, () => false);
    const p = await open(browser, { recorded: true, voices: VOICES });
    // can this engine put sound out at all? (a browser with no sound device says so by failing a moment after it starts)
    const canHear = await p.evaluate(key => new Promise(res => {
      const a = new Audio('audio/' + key + '.mp3'); let done = false;
      const end = v => { if (!done) { done = true; try { a.pause(); } catch (e) {} res(v); } };
      a.addEventListener('error', () => end(false)); a.addEventListener('timeupdate', () => { if (a.currentTime > 0.3) end(true); });
      a.play().catch(() => end(false)); setTimeout(() => end(false), 5000);
    }), AUDIO_KEYS[0]);
    if (name !== 'firefox') check('this engine can play the recordings', canHear);
    await p.evaluate(() => { window.__media.length = 0; });
    const spoken = await p.evaluate(() => window.__jmSpoken());
    const HAS_LIST = spoken.filter(x => HAS_KEY.has(x.key));
    const pick = (kind, id) => HAS_LIST.find(x => x.kind === kind && (id === undefined || x.id === String(id)));
    check('the button says the page is reading in its recorded voice', (await p.evaluate(() => { document.getElementById('ease-card').open = true; return document.querySelector('#voice-row [data-voice-open]').textContent; })) === 'Voice: recorded. Change');
    // a sub, read from its sheet
    const sub13 = pick('sub', 13);
    if (!sub13) check('the Original Italian has a recording', ALLOW_UNRECORDED, 'sub 13 is not recorded');
    else {
      await tab(p, 'study'); await p.click('#glance [data-sub="13"]'); await p.waitForTimeout(350);
      await p.click('#sheet .say-btn');
      let st = await last(p);
      check('Read it to me asks for the recording of exactly those words', !!st.log && st.log.recorded === true && st.log.key === sub13.key && !!st.m && st.m.src === sub13.key + '.mp3', JSON.stringify(st).slice(0, 260));
      if (canHear) {
        check('the recording plays, the button turns into Stop, and the device\'s own voice stays quiet', await heard(p, 'playing') && (await txt(p, '#sheet .say-btn')) === 'Stop' && (await last(p)).spoken === 0, JSON.stringify(await last(p)).slice(0, 260));
        await p.waitForTimeout(400); await p.click('#sheet .say-btn'); await p.waitForTimeout(250);
        st = await last(p);
        check('Stop stops the recording', st.paused === true && (await txt(p, '#sheet .say-btn')) === 'Read it to me', JSON.stringify(st).slice(0, 200));
        await p.click('#sheet .say-btn'); await heard(p, 'playing');
        await clickBtn(p, 'Close', '#sheet'); await p.waitForTimeout(300);
        check('closing the sheet stops it too', (await last(p)).paused === true);
      } else {
        check('with nowhere to send sound, the page says so and stops', await p.waitForFunction(() => /No sound/.test(document.querySelector('#sheet .say-btn').textContent), null, { timeout: 4000 }).then(() => true, () => false) && (await last(p)).paused === true, await txt(p, '#sheet .say-btn'));
        await clickBtn(p, 'Close', '#sheet'); await p.waitForTimeout(300);
      }
    }
    // hands-free: Listen plays one recording after another with no tap in between
    const deck = DATA.DECKS.find(d => d.key === 'italian').ids, asks = deck.map(id => pick('ask', id + '-number')), tells = deck.map(id => pick('tell', id + '-number'));
    if (asks.some(x => !x) || tells.some(x => !x)) check('the Italian subs have their Listen recordings', ALLOW_UNRECORDED, 'some are not recorded');
    else if (canHear) {
      await startRun(p, 'listen', 'italian'); await clickBtn(p, '3 seconds');
      await p.evaluate(() => { window.__media.length = 0; window.__speechLog.length = 0; });
      await p.click('#q-area .listen-play');
      const askOk = await heard(p, 'ended', 6000); let st = await last(p);
      check('Listen says the number from its recording', askOk && asks.some(a => a.key + '.mp3' === st.m.src) && /^Number \d+\.$/.test(st.log.text), JSON.stringify(st).slice(0, 240));
      const tellStarted = await p.waitForFunction(() => window.__media.length >= 2 && window.__media[1].events.includes('playing'), null, { timeout: 8000 }).then(() => true, () => false);
      st = await last(p);
      check('then tells you, from the next recording, with no tap', tellStarted && tells.some(a => a.key + '.mp3' === st.m.src) && !(await p.evaluate(() => document.querySelector('#q-area .listen-ans').classList.contains('wait'))), JSON.stringify(st).slice(0, 240));
      if (!QUICK) check('and goes on to the next sub by itself', await p.waitForFunction(() => window.__media.length >= 3 && window.__media[2].events.includes('playing'), null, { timeout: 25000 }).then(() => true, () => false), JSON.stringify(await p.evaluate(() => window.__media)).slice(0, 300));
      await p.click('#q-area .listen-play'); await p.waitForTimeout(250);
      check('Pause stops the recording, and the device\'s own voice never spoke', (await last(p)).paused === true && (await last(p)).spoken === 0 && (await txt(p, '#q-area .listen-play')) === 'Play');
    }
    // a training card and a walkthrough step
    const card = pick('card', 'o-wrap') || HAS_LIST.find(x => x.kind === 'card'), step = pick('step', 'wrap-1');
    if (!card || !step) check('a training card and a walkthrough step have recordings', ALLOW_UNRECORDED, 'not recorded yet');
    else {
      await tab(p, 'orient'); await pickLevel(p, 'all');
      await p.evaluate(id => { const d = document.getElementById(id); d.open = true; d.scrollIntoView(); }, card.id); await p.waitForTimeout(200);
      await p.evaluate(id => { document.querySelector('#' + id + ' .say-btn').click(); }, card.id);
      let st = await last(p);
      check('a card is read from its recording', st.log.recorded === true && st.log.key === card.key && st.m.src === card.key + '.mp3', JSON.stringify(st).slice(0, 220));
      if (canHear) {
        await heard(p, 'playing');
        await p.evaluate(id => { document.getElementById(id).open = false; }, card.id); await p.waitForTimeout(300);
        check('folding the card stops the recording', (await last(p)).paused === true && (await p.evaluate(id => document.querySelector('#' + id + ' .say-btn').getAttribute('aria-pressed'), card.id)) === 'false');
      } else await p.evaluate(id => { document.getElementById(id).open = false; }, card.id);
      await p.evaluate(() => { const d = document.getElementById('o-wrap'); d.open = true; d.querySelector('[data-walk="wrap"]').click(); }); await p.waitForTimeout(450);
      await clickBtn(p, 'Next', '#sheet'); await p.waitForTimeout(250);
      await p.click('#sheet .walk .say-btn');
      st = await last(p);
      check('a walkthrough step is read from its recording', st.log.recorded === true && st.log.key === step.key && st.m.src === step.key + '.mp3', JSON.stringify(st).slice(0, 220));
      await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    }
    // the voice sheet: the recorded voice first, the device's own voices after it
    await tab(p, 'orient');
    await p.evaluate(() => { document.getElementById('ease-card').open = true; window.scrollTo(0, 0); window.__media.length = 0; window.__spoken.length = 0; });
    await p.click('#voice-row [data-voice-open]'); await p.waitForTimeout(350);
    const r0 = await rows(p);
    check('the voice sheet offers the recorded voice first, then this device\'s best, then each voice', r0.map(r => r.t).join('|') === ['The recorded voice', "This device's best voice"].concat(VOICE_ROWS).join('|') && r0[0].on && r0.filter(r => r.on).length === 1, JSON.stringify(r0));
    let bad = await p.evaluate(TAP_AUDIT); check('voice sheet tap targets are 44px', bad.length === 0, bad.slice(0, 6).join(' | '));
    const sample = pick('sample');
    if (sample && canHear) {
      await clickBtn(p, 'Slower', '#sheet'); await tapRow(p, 'The recorded voice');
      check('its sample is the recording, and Slower plays it slower', await heard(p, 'playing') && (await last(p)).m.src === sample.key + '.mp3' && Math.abs((await last(p)).m.rate - 0.85) < 0.001, JSON.stringify(await last(p)).slice(0, 220));
      await clickBtn(p, 'Normal', '#sheet'); await tapRow(p, 'The recorded voice');
      check('Normal plays it at its own pace', await p.waitForFunction(() => { const m = window.__media[window.__media.length - 1]; return m.events.includes('playing') && m.rate === 1; }, null, { timeout: 5000 }).then(() => true, () => false), JSON.stringify(await last(p)).slice(0, 220));
    }
    const n0 = (await last(p)).n;
    await tapRow(p, "This device's best voice");
    await p.waitForFunction(() => window.__spoken.length > 0, null, { timeout: 2000 }).catch(() => {});
    check('This device\'s best voice switches the recordings off: the sample comes from the device, and the choice is kept', (await last(p)).n === n0 && (await p.evaluate(() => window.__used[window.__used.length - 1].voice)) === 'Ava (Premium)' && (await p.evaluate(() => localStorage.getItem('jm-voice'))) === 'device' && (await rows(p))[1].on && (await rows(p)).filter(r => r.on).length === 1 && (await last(p)).paused !== false, JSON.stringify(await last(p)).slice(0, 200));
    await tapRow(p, 'Samantha');
    await p.waitForFunction(() => window.__used[window.__used.length - 1].voice === 'Samantha', null, { timeout: 2000 }).catch(() => {});
    check('one voice by name works here too', (await p.evaluate(() => window.__used[window.__used.length - 1].voice)) === 'Samantha' && (await rows(p)).find(r => r.t === 'Samantha').on && (await last(p)).n === n0);
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    check('the button names the voice in use', (await txt(p, '#voice-row [data-voice-open]')) === 'Voice: Samantha. Change', await txt(p, '#voice-row [data-voice-open]'));
    await p.click('#voice-row [data-voice-open]'); await p.waitForTimeout(350);
    await tapRow(p, 'The recorded voice'); await p.waitForTimeout(200);
    check('going back to the recorded voice is one tap', (await p.evaluate(() => localStorage.getItem('jm-voice'))) === '' && (await rows(p))[0].on && (await last(p)).n === n0 + 1);
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    check('and the button says recorded again', (await txt(p, '#voice-row [data-voice-open]')) === 'Voice: recorded. Change');
    // no signal: the device's own voice reads at once, inside the tap
    if (sub13) {
      await p.context().setOffline(true); await p.waitForTimeout(150);
      const off = await p.evaluate(() => navigator.onLine);
      if (name === 'chromium') check('the pretend phone is offline', off === false);
      if (off === false) {
        await tab(p, 'study'); await p.click('#glance [data-sub="13"]'); await p.waitForTimeout(350);
        await p.evaluate(() => { window.__spoken.length = 0; }); const n1 = (await last(p)).n;
        await p.click('#sheet .say-btn');
        check('with no signal the device\'s voice reads it at once, with no wait for a recording', await p.waitForFunction(() => window.__spoken.length > 0, null, { timeout: 1500 }).then(() => true, () => false) && (await last(p)).n === n1 && (await last(p)).log.recorded === false, JSON.stringify(await last(p)).slice(0, 200));
        await p.click('#sheet .say-btn'); await clickBtn(p, 'Close', '#sheet');
        await p.context().setOffline(false); await p.waitForTimeout(250);
        await p.click('#glance [data-sub="13"]'); await p.waitForTimeout(350); await p.click('#sheet .say-btn');
        check('back on line, the recording is used again', (await last(p)).log.recorded === true && (await last(p)).n === n1 + 1);
        await p.click('#sheet .say-btn').catch(() => {}); await clickBtn(p, 'Close', '#sheet');
      } else await p.context().setOffline(false);
    }
    check('no script errors', p.__errs.length === 0, p.__errs.join(' | '));
    await p.__close();

    // a recording that will not arrive: the device's voice says the same words, and takes over for a while
    if (sub13) {
      const q = await open(browser, { recorded: true, lostAudio: true, voices: VOICES });
      await q.click('#glance [data-sub="13"]'); await q.waitForTimeout(350);
      await q.click('#sheet .say-btn');
      const fell = await q.waitForFunction(() => window.__spoken.length > 0, null, { timeout: 9000 }).then(() => true, () => false);
      check('when a recording does not arrive, the device\'s voice reads the same words', fell && (await q.evaluate(() => window.__media.length)) === 1 && /^Number 13\./.test(await q.evaluate(() => window.__spoken[0])), JSON.stringify(await q.evaluate(() => ({ m: window.__media, s: window.__spoken.slice(0, 1) }))).slice(0, 240));
      await q.waitForFunction(() => document.querySelector('#sheet .say-btn').getAttribute('aria-pressed') === 'false', null, { timeout: 8000 }).catch(() => {});
      await q.evaluate(() => { window.__spoken.length = 0; }); await q.click('#sheet .say-btn');
      check('and the next tap goes straight to the device\'s voice, without trying the recording again', await q.waitForFunction(() => window.__spoken.length > 0, null, { timeout: 1500 }).then(() => true, () => false) && (await q.evaluate(() => window.__media.length)) === 1);
      const lostErrs = q.__errs.filter(e => !/audio-that-is-not-there|ERR_FILE_NOT_FOUND|Failed to load resource|NS_ERROR|not found|NotSupportedError|404/i.test(e));
      check('no script errors', lostErrs.length === 0, lostErrs.join(' | '));
      await q.__close();
    }
    // a browser with no voice of its own still gets the recorded one
    if (sub13) {
      const v = await open(browser, { recorded: true, init: NO_SPEECH });
      await v.click('#glance [data-sub="13"]'); await v.waitForTimeout(350);
      check('with no voice of its own, a browser still gets a Read it to me button', (await v.evaluate(() => document.querySelectorAll('#sheet .say-btn').length)) === 1);
      await v.click('#sheet .say-btn');
      if (canHear) check('and the recording plays', await heard(v, 'playing') && (await txt(v, '#sheet .say-btn')) === 'Stop');
      else check('and with nowhere to send sound it says so', await v.waitForFunction(() => /No sound/.test(document.querySelector('#sheet .say-btn').textContent), null, { timeout: 4000 }).then(() => true, () => false));
      await clickBtn(v, 'Close', '#sheet'); await v.waitForTimeout(250);
      await tab(v, 'orient'); await v.evaluate(() => { document.getElementById('ease-card').open = true; window.scrollTo(0, 0); }); await v.click('#voice-row [data-voice-open]'); await v.waitForTimeout(350);
      const vr = await rows(v);
      check('its voice sheet offers the recorded voice and nothing it cannot do', vr.length === 1 && vr[0].t === 'The recorded voice' && vr[0].on && (await v.evaluate(() => document.querySelectorAll('#sheet .voice-tips').length)) === 0, JSON.stringify(vr));
      await v.keyboard.press('Escape');
      check('no script errors', v.__errs.length === 0, v.__errs.join(' | '));
      await v.__close();
    }
    // every fixed thing the page can say has its recording, and every listed recording is on disk
    if (name === 'chromium') {
      const missing = spoken.filter(x => !HAS_KEY.has(x.key));
      const kinds = {}; missing.forEach(x => { kinds[x.kind] = (kinds[x.kind] || 0) + 1; });
      check(`every fixed thing the page says has a recording (${spoken.length - missing.length} of ${spoken.length})`, missing.length === 0 || ALLOW_UNRECORDED, JSON.stringify(kinds) + ' are not recorded: run tools/voice/record.py and build again, or pass --allow-unrecorded');
      if (missing.length && ALLOW_UNRECORDED) console.log(`  note: ${missing.length} of ${spoken.length} pieces have no recording and will be read by the device's own voice ${JSON.stringify(kinds)}`);
      const small = AUDIO_KEYS.filter(k => { try { return fs.statSync(path.join(AUDIO_DIR, k + '.mp3')).size < 3000; } catch (e) { return true; } });
      check('every recording the site lists is on disk, and is not an empty file', small.length === 0, small.slice(0, 5).join(' '));
      check('the list covers cards, subs, Listen, walkthrough steps, games and quiz lessons', ['card', 'sub', 'ask', 'tell', 'step', 'game', 'lesson', 'sample'].every(kd => spoken.some(x => x.kind === kd)) && spoken.length > 1000, spoken.length);
    }
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
    check('no voice button where there is no voice', (await p.evaluate(() => [...document.querySelectorAll('[data-voice-open]')].filter(b => b.getClientRects().length).length)) === 0 && await p.evaluate(() => document.getElementById('voice-row').hidden));
    check('no card offers to read itself where there is no voice, and the settings card does not promise it', (await p.evaluate(() => document.querySelectorAll('#view-orient .say-btn').length)) === 0 && (await p.evaluate(() => document.getElementById('listen-note').textContent)) === '');
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
    check('preview keeps every training module and its diagrams, and hides the games', st.mods === DATA.MODS.length && st.tpics === PIC_USES && st.games === 0, JSON.stringify(st) + ' want ' + PIC_USES);
    await p.evaluate(() => document.querySelectorAll('#view-orient details').forEach(d => { d.open = true; }));
    const lv = await p.evaluate(() => { const on = e => !!e && e.getClientRects().length > 0, v = document.getElementById('view-orient'); return {
      heads: [...v.querySelectorAll('.level-head')].filter(on).length, shown: [...v.querySelectorAll(':scope > details.mod')].filter(on).length, path: on(document.getElementById('path')), ease: on(document.getElementById('ease-card')),
      title: on(document.querySelector('#path-card h2')), words: on(document.getElementById('o-words')), ticks: [...document.querySelectorAll('ul.ticks')].filter(u => on(u) && !u.querySelector('[role]')).length, over: document.documentElement.scrollWidth - document.documentElement.clientWidth, calcs: [...document.querySelectorAll('.calc')].filter(on).length, now: on(document.getElementById('day-now')) }; });
    check('preview shows all three levels one after the other, with the check lists as plain lists', lv.heads === 3 && lv.shown === DATA.MODS.length && lv.title && lv.words && lv.ticks >= 9 && lv.over <= 0, JSON.stringify(lv));
    check('preview hides what cannot work without script: the level buttons, the switches, the practice math, the clock box', !lv.path && !lv.ease && lv.calcs === 0 && !lv.now, JSON.stringify(lv));
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
        if (t === 'orient') { await showAllTraining(p); await p.evaluate(() => { document.querySelector('ul.ticks.live li').click(); }); }
        if (t === 'drill') { await p.click('#deck-seg button[data-deck="italian"]'); await p.click('#mode-seg [data-mode="num"]'); await answer(p, false); await p.click('#mode-seg [data-mode="build"]'); await tapChip(p, 'Onions'); await clickBtn(p, 'Check'); }
        await p.waitForTimeout(900);   // let the fade-in and button transitions finish, or the colors read mid-blend
        const bad = await p.evaluate(CONTRAST_AUDIT);
        check(`${t} text contrast`, bad.length === 0, bad.length + ' low: ' + bad.slice(0, 5).join(' | '));
      }
      await pickLevel(p, 'all'); await p.click('#path-all'); await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(900);
      let bad = await p.evaluate(CONTRAST_AUDIT); check('training contrast with one level picked', bad.length === 0, bad.length + ' low: ' + bad.slice(0, 5).join(' | '));
      await tab(p, 'study'); await p.click('#glance [data-sub="8"]');
      await p.waitForTimeout(900);
      bad = await p.evaluate(CONTRAST_AUDIT); check('sub sheet contrast', bad.length === 0, bad.slice(0, 5).join(' | '));
      await clickBtn(p, 'Close', '#sheet');
      await tab(p, 'drill'); await p.click('#mode-seg [data-mode="order"]');
      await p.waitForTimeout(900);
      bad = await p.evaluate(CONTRAST_AUDIT); check('order ticket contrast', bad.length === 0, bad.slice(0, 5).join(' | '));
      await p.click('#mode-seg [data-mode="listen"]');
      await p.waitForTimeout(900);
      bad = await p.evaluate(CONTRAST_AUDIT); check('listen contrast', bad.length === 0, bad.slice(0, 5).join(' | '));
      await tab(p, 'orient'); await p.evaluate(() => { document.getElementById('ease-card').open = true; window.scrollTo(0, 0); }); await p.click('#voice-row [data-voice-open]');
      await p.waitForTimeout(900);
      bad = await p.evaluate(CONTRAST_AUDIT); check('voice sheet contrast', bad.length === 0, bad.slice(0, 5).join(' | '));
      await p.evaluate(() => { document.querySelector('#sheet .voice-tips summary').click(); }); await p.waitForTimeout(300);
      bad = await p.evaluate(CONTRAST_AUDIT); check('voice tips contrast', bad.length === 0, bad.slice(0, 5).join(' | '));
      await p.keyboard.press('Escape'); await p.waitForTimeout(300);
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
  check('every station sits in a level, and the levels run crew, shift lead, manager', DATA.LEVELS.map(L => L.n).join() === '1,2,3' && DATA.GROUPS.every(g => [1, 2, 3].includes(g.level)) && DATA.GROUPS.map(g => g.level).join('') === DATA.GROUPS.map(g => g.level).sort().join(''), DATA.GROUPS.map(g => g.id + g.level).join(' '));
  check('every level has cards, and every put-in-order game belongs to a card', [1, 2, 3].every(n => modsAt(n).length > 0) && Object.keys(DATA.SEQS).every(k => DATA.SEQS[k].board || seqLevel(k) > 0));
  check('every quiz has a name for the quiz list', Object.keys(DATA.BANKS).every(b => typeof DATA.BANK_LABEL[b] === 'string' && DATA.BANK_LABEL[b].length > 2));
  const unused = PIC_FILES.filter(n => !SRC_HTML.includes('<!--#include ' + n + '-->'));
  check('every diagram the tools drew is on the page', PIC_FILES.length >= 85 && unused.length === 0, unused.join(' '));
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
  check('the offline worker leaves the recordings to the browser', /indexOf\('\/audio\/'\) >= 0\) return;/.test(files[1][1]));
  if (files[3]) check('the copy for claude.ai carries no list of recordings, so it reads with the device\'s voice', !/window\.JM_AUDIO=\{/.test(files[3][1]) && /window\.JM_AUDIO=\{base:"audio\/"/.test(idx) === (AUDIO_KEYS.length > 0));
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
