// node tools/test/planted.js  -> proves the suite can fail: breaks a copy of the site six ways and expects each to be caught
const fs = require('fs'); const path = require('path'); const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '../..'); const SRC = path.join(ROOT, 'dist/site');
const TMP = path.join(ROOT, 'dist/planted');
const DASH = String.fromCharCode(0x2014);
const plants = [
  ['a dash in the copy', s => s.replace('<h2>Practice on your own</h2>', '<h2>Practice ' + DASH + ' on your own</h2>'), 'has no em or en dashes'],
  ['a card wider than the phone', s => s.replace('</style>', '.card{min-width:520px!important}</style>'), 'no sideways scroll'],
  ['Mike\'s Way in the wrong order', s => s.replace("var MW = ['Onions','Lettuce','Tomatoes'", "var MW = ['Lettuce','Onions','Tomatoes'"), 'right build is accepted'],
  ['buttons too small to tap', s => s.replace('</style>', '.btn{min-height:30px!important;padding:2px 8px!important}</style>'), 'tap targets are 44px'],
  ['grey text too pale to read', s => s.replace('--muted:#4F6076', '--muted:#B4BEC8'), 'text contrast'],
  ['a script error on tap', s => s.replace('</body>', '<script>document.addEventListener("click",function(){throw new Error("planted")})</script></body>'), 'no script errors']
];
let caught = 0;
for (const [name, mutate, expect] of plants) {
  fs.rmSync(TMP, { recursive: true, force: true }); fs.cpSync(SRC, TMP, { recursive: true });
  const f = path.join(TMP, 'index.html'); const before = fs.readFileSync(f, 'utf8'); const after = mutate(before);
  if (after === before) { console.log('PLANT_DID_NOT_APPLY', name); continue; }
  fs.writeFileSync(f, after);
  const r = spawnSync('node', [path.join(__dirname, 'suite.js'), '--site', f, '--engines', 'chromium', '--quick'], { encoding: 'utf8', env: process.env, maxBuffer: 1 << 26 });
  const ok = r.status === 1 && r.stdout.includes(expect) && r.stdout.includes('CHECKS_FAILED');
  console.log((ok ? 'caught   ' : 'MISSED   ') + name + ' (exit ' + r.status + ')');
  if (ok) caught++;
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(caught === plants.length ? `PLANTED_ALL_CAUGHT ${caught} of ${plants.length}` : `PLANTED_MISSED ${plants.length - caught} of ${plants.length}`);
process.exit(caught === plants.length ? 0 : 1);
