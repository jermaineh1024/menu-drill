// node tools/test/planted.js  -> proves the suite can fail: breaks a copy of the site twenty-one ways and expects each to be caught
// Each broken copy gets its own folder and its own quick run of the suite, two at a time.
const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '../..'); const SRC = path.join(ROOT, 'dist/site');
const TMP = n => path.join(ROOT, 'dist/planted-' + n);
const DASH = String.fromCharCode(0x2014);
const plants = [
  ['a dash in the copy', s => s.replace('<h2>Practice on your own</h2>', '<h2>Practice ' + DASH + ' on your own</h2>'), 'has no em or en dashes'],
  ['a card wider than the phone', s => s.replace('</style>', '.card{min-width:520px!important}</style>'), 'no sideways scroll'],
  ['Mike\'s Way in the wrong order', s => s.replace("var MW = ['Onions','Lettuce','Tomatoes'", "var MW = ['Lettuce','Onions','Tomatoes'"), 'right build is accepted'],
  ['buttons too small to tap', s => s.replace('</style>', '.btn{min-height:30px!important;padding:2px 8px!important}</style>'), 'tap targets are 44px'],
  ['grey text too pale to read', s => s.replace('--muted:#4F6076', '--muted:#B4BEC8'), 'text contrast'],
  ['a script error on tap', s => s.replace('</body>', '<script>document.addEventListener("click",function(){throw new Error("planted")})</script></body>'), 'no script errors'],
  ['a hot sub that accepts any order', s => s.replace('if (sg < maxStage){', 'if (sg < -9){'), 'the lid dressed after the meat is caught'],
  ['a quiz with the wrong answer keyed', s => s.replace('a:"Coins, then bills"', 'a:"Bills, then coins"'), 'quiz feedback matches the answer'],
  ['a training module with no quiz behind it', s => s.replace('{id:"regsafe", bank:"wrap"', '{id:"regsaf", bank:"wrap"'), 'module regsafe offers its quiz'],
  ['a picture label pushed past its picture\'s edge', s => s.replace('<text x="4" y="14" class="pl-s">Top line', '<text x="-6" y="14" class="pl-s">Top line'), 'no picture label is cut by its picture'],
  // the full course
  ['a level that lets the other levels show', s => s.replace('#view-orient[data-show="2"] > [data-lv]:not([data-lv="2"]),', '#view-orient[data-show="x"] > [data-lv]:not([data-lv="2"]),'), 'picking Shift lead shows its cards and only those'],
  ['practice math that adds 3 points where the video adds 2', s => s.replace('var g = v.t + 2,', 'var g = v.t + 3,'), "goal: the example works out to the video's numbers"],
  ['a check list that forgets its ticks', s => s.replace('var ticks = load(TICKS_KEY, {}) || {};', 'var ticks = {};'), 'ticks are still there after a reload'],
  ['a voice that cuts 1.25 ounces in two', s => s.replace('re = /[.!?]+["”\')\\]]*(?=\\s+[^a-z\\s]|\\s*$)/g', 're = /[.!?]+/g'), 'an amount like 1.25 ounces is said in one piece'],
  ['a manager session that teaches sprinkling first', s => s.replace('if (levelNow() > 1){', 'if (levelNow() > 9){'), 'its five new facts are manager facts'],
  ['a clock box that starts mid-day an hour late', s => s.replace('{id:"dp-mid", from:14, to:17,', '{id:"dp-mid", from:15, to:17,'), 'at 2:30 in the afternoon the box says mid-day'],
  // the voice
  ['a voice picker that takes the first voice the device lists', s => s.replace('return (fine.length ? fine : en).sort(rank);', 'return (fine.length ? fine : en);'), 'the page picks the best voice the device has, and says which'],
  ['recordings filed under the wrong fingerprint', s => s.replace('a = Math.imul(a ^ c, 0x01000193);', 'a = Math.imul(a ^ c, 0x01000195);'), 'every fixed thing the page says has a recording'],
  ['a missing recording that leaves you in silence', s => s.replace('if (synth) speakDevice(text, opt); else if (opt.onfail) opt.onfail("silent");', 'if (opt.onfail) opt.onfail("silent");'), "when a recording does not arrive, the device's voice reads the same words"],
  ['a Slower button the recorded voice ignores', s => s.replace('player.defaultPlaybackRate = player.playbackRate = slow ? 0.85 : 1;', 'player.defaultPlaybackRate = player.playbackRate = 1;'), 'its sample is the recording, and Slower plays it slower'],
  ['a phone with no signal left waiting for a recording', s => s.replace('if (navigator.onLine === false) return false;', 'if (navigator.onLine === 7) return false;'), "with no signal the device's voice reads it at once"]
];

// a broken copy is thrown away when its run is over; the link to the recordings goes first, so nothing can reach through it
function clear(dir) {
  try { if (fs.lstatSync(path.join(dir, 'audio')).isSymbolicLink()) fs.unlinkSync(path.join(dir, 'audio')); } catch (e) {}
  fs.rmSync(dir, { recursive: true, force: true });
}

function runPlant(i) {
  const [name, mutate, expect] = plants[i];
  return new Promise(resolve => {
    const dir = TMP(i);
    clear(dir); fs.cpSync(SRC, dir, { recursive: true, filter: f => path.basename(f) !== 'audio' });
    if (fs.existsSync(path.join(ROOT, 'audio'))) fs.symlinkSync(path.join('..', '..', 'audio'), path.join(dir, 'audio'));   // the recordings are shared, never copied
    const f = path.join(dir, 'index.html'); const before = fs.readFileSync(f, 'utf8'); const after = mutate(before);
    if (after === before) { clear(dir); return resolve({ i, name, applied: false }); }
    fs.writeFileSync(f, after);
    let out = '';
    const c = spawn('node', [path.join(__dirname, 'suite.js'), '--site', f, '--engines', 'chromium', '--quick'], { env: process.env });
    c.stdout.on('data', d => { out += d; }); c.stderr.on('data', () => {});
    c.on('close', status => {
      clear(dir);
      resolve({ i, name, applied: true, status, ok: status === 1 && out.includes(expect) && out.includes('CHECKS_FAILED') });
    });
  });
}

(async () => {
  const results = new Array(plants.length); let next = 0;
  const worker = async () => { while (next < plants.length) { const i = next++; results[i] = await runPlant(i); } };
  await Promise.all([worker(), worker()]);
  let caught = 0;
  for (const r of results) {
    if (!r.applied) { console.log('PLANT_DID_NOT_APPLY', r.name); continue; }
    console.log((r.ok ? 'caught   ' : 'MISSED   ') + r.name + ' (exit ' + r.status + ')');
    if (r.ok) caught++;
  }
  console.log(caught === plants.length ? `PLANTED_ALL_CAUGHT ${caught} of ${plants.length}` : `PLANTED_MISSED ${plants.length - caught} of ${plants.length}`);
  process.exit(caught === plants.length ? 0 : 1);
})();
