// node tools/test/planted.js  -> proves the suite can fail: breaks a copy of the site sixteen ways and expects each to be caught
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
  ['a clock box that starts mid-day an hour late', s => s.replace('{id:"dp-mid", from:14, to:17,', '{id:"dp-mid", from:15, to:17,'), 'at 2:30 in the afternoon the box says mid-day']
];

function runPlant(i) {
  const [name, mutate, expect] = plants[i];
  return new Promise(resolve => {
    const dir = TMP(i);
    fs.rmSync(dir, { recursive: true, force: true }); fs.cpSync(SRC, dir, { recursive: true });
    const f = path.join(dir, 'index.html'); const before = fs.readFileSync(f, 'utf8'); const after = mutate(before);
    if (after === before) { fs.rmSync(dir, { recursive: true, force: true }); return resolve({ i, name, applied: false }); }
    fs.writeFileSync(f, after);
    let out = '';
    const c = spawn('node', [path.join(__dirname, 'suite.js'), '--site', f, '--engines', 'chromium', '--quick'], { env: process.env });
    c.stdout.on('data', d => { out += d; }); c.stderr.on('data', () => {});
    c.on('close', status => {
      fs.rmSync(dir, { recursive: true, force: true });
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
