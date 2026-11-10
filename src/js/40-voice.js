
/* ---------- the phone's own voice (free, works offline) ----------
   Everything spoken goes through Voice.speak. Text is split into sentences because some browsers cut a long
   utterance off after about fifteen seconds, and so a watchdog can tell "nothing came out" from "still talking".
   A sentence ends at . ! or ? when a space and a new sentence follow, or when the text ends. The point in 1.25 and
   the dots in "9:15 a.m. as part of opening" end nothing, so a number or a time is never said in two halves. */
var VOICE_KEY = "jm-voice-slow", VOICE_PICK_KEY = "jm-voice";
var Voice = (function(){
  var synth = null;
  try { if (typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined") synth = window.speechSynthesis; } catch(e){}
  var token = 0, voice = null, keep = null, slow = loadRaw(VOICE_KEY) === "1";
  var all = [], picked = loadRaw(VOICE_PICK_KEY) || "", watchers = [];

  /* ----- which of the device's voices is easiest on the ear -----
     A page can only use the voices the phone or computer lends it, and the first one in that list is often the oldest.
     So every English voice gets a grade from its name and its id, and the best one is used unless you picked one yourself:
     6 Apple's "Premium"; 5 "Enhanced", "Natural", "Neural"; 4.5 the Siri voices; 4 the usual good ones by name;
     3.5 Google's online voices (fine, but silent with no signal); 2 a voice nobody has heard of; 1 the old Microsoft
     desktop voices; 0 the joke voices and the 1990s synthesizers, which are left out whenever there is anything else.
     American English comes first, since that is what the store speaks. */
  var JOKE = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|fred|good news|hysterical|jester|junior|kathy|organ|pipe organ|princess|ralph|superstar|trinoids|whisper|wobble|zarvox)\b/i;
  var OLD = /^(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)( \(|$)/i;
  var GOOD = ["ava", "zoe", "samantha", "evan", "allison", "susan", "nathan", "tom", "joelle", "noelle", "alex", "nicky", "aaron", "daniel", "karen", "moira", "tessa", "rishi", "serena", "kate", "oliver", "jamie", "stephanie", "matilda", "lee"];
  function idOf(v){ return v.name + "|" + v.lang; }
  function isUS(v){ return /^en[-_]us/i.test(v.lang || ""); }
  function known(v){ var n = String(v.name || "").toLowerCase(); for (var i = 0; i < GOOD.length; i++){ if (n.indexOf(GOOD[i]) === 0) return i; } return 99; }
  function grade(v){
    var n = String(v.name || "").toLowerCase(), s = n + " " + String(v.voiceURI || "").toLowerCase();
    if (JOKE.test(n) || OLD.test(n) || /eloquence|espeak/.test(s)) return 0;
    if (/premium/.test(s)) return 6;
    if (/enhanced|natural|neural/.test(s)) return 5;
    if (/siri/.test(s)) return 4.5;
    if (known(v) < 99) return 4;
    if (/^google /.test(n)) return 3.5;
    if (/^microsoft /.test(n)) return 1;
    return 2;
  }
  function rank(a, b){
    var d = (grade(b) + (isUS(b) ? 2 : 0)) - (grade(a) + (isUS(a) ? 2 : 0));
    if (d) return d;
    d = known(a) - known(b);
    if (d) return d;
    if (!!a.localService !== !!b.localService) return a.localService ? -1 : 1;   /* one that works with no signal first */
    return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
  }
  /* the English voices worth offering, best first; some phones list a voice twice, and it is shown once */
  function english(){
    var seen = {}, en = all.filter(function(v){ if (!/^en([-_]|$)/i.test(v.lang || "") || seen[idOf(v)]) return false; seen[idOf(v)] = 1; return true; });
    var fine = en.filter(function(v){ return grade(v) > 0; });
    return (fine.length ? fine : en).sort(rank);
  }
  function pickedVoice(list){
    if (!picked) return null;
    var name = picked.split("|")[0], i;
    for (i = 0; i < list.length; i++){ if (idOf(list[i]) === picked) return list[i]; }
    for (i = 0; i < list.length; i++){ if (list[i].name === name) return list[i]; }
    return null;   /* the voice you picked is gone from this device: the page chooses until it comes back */
  }
  function tell(){ watchers.forEach(function(fn){ try { fn(); } catch(e){} }); }

  /* ----- the recorded voice -----
     On the public site, every fixed thing the page says (a card, a sub, a walkthrough step, a quiz lesson) was recorded
     once in a natural voice: one small file each, named by a fingerprint of its exact words. When the words on the page
     change, the fingerprint no longer matches, and the device's own voice reads that piece until it is recorded again.
     The copy on claude.ai carries no recordings (JM_AUDIO is not set there), so it reads with the device's voice. */
  var REC = null, player = null;
  try {
    if (window.JM_AUDIO && window.JM_AUDIO.base && typeof Audio !== "undefined"){
      var probe = new Audio();
      if (probe.canPlayType && probe.canPlayType("audio/mpeg")){
        REC = {base:String(window.JM_AUDIO.base), has:{}};
        String(window.JM_AUDIO.keys || "").split(" ").forEach(function(k){ if (k) REC.has[k] = 1; });
        player = probe; player.preload = "auto";
      }
    }
  } catch(e){ REC = null; player = null; }
  /* the fingerprint: the words with their spacing tidied, run through two small hashes, written as 16 hex digits */
  function recKey(text){
    var s = String(text).replace(/\s+/g, " ").replace(/^ | $/g, ""), a = 0x811c9dc5, b = 0x9747b28c, i, c;
    for (i = 0; i < s.length; i++){
      c = s.charCodeAt(i);
      a = Math.imul(a ^ c, 0x01000193);
      b = Math.imul(b ^ (c + i), 0x5bd1e995); b ^= b >>> 13;
    }
    return ("0000000" + (a >>> 0).toString(16)).slice(-8) + ("0000000" + (b >>> 0).toString(16)).slice(-8);
  }
  /* With no signal a recording cannot arrive, and a phone only lets a voice start inside the tap that asked for it. So when the
     device says it is offline, or a recording just failed to arrive, the device's own voice is used at once, for two minutes. */
  var recDown = 0;
  try { window.addEventListener("online", function(){ recDown = 0; }); } catch(e){}
  function recorded(text){
    if (!REC || picked !== "" || !REC.has[recKey(text)]) return false;
    try { if (navigator.onLine === false) return false; } catch(e){}
    return Date.now() >= recDown;
  }
  function refresh(){
    try { all = Array.prototype.slice.call(synth.getVoices() || []); } catch(e){ all = []; }
    var list = english();
    voice = pickedVoice(list) || list[0] || null;
    tell();
  }
  if (synth){
    refresh();   /* some browsers hand over their voices a moment after the page loads */
    try { if (synth.addEventListener) synth.addEventListener("voiceschanged", refresh); else synth.onvoiceschanged = refresh; } catch(e){}
  }
  function sentences(text){
    var s = String(text), parts = [], from = 0, re = /[.!?]+["”')\]]*(?=\s+[^a-z\s]|\s*$)/g, m;
    while ((m = re.exec(s))){ parts.push(s.slice(from, m.index + m[0].length)); from = m.index + m[0].length; }
    if (from < s.length) parts.push(s.slice(from));
    return parts.map(function(p){ return p.replace(/^\s+|\s+$/g, ""); }).filter(function(p){ return p.length > 0; });
  }
  function stop(){
    token++;
    if (synth){ try { synth.cancel(); } catch(e){} }
    if (player){ try { player.pause(); } catch(e){} }
  }
  /* play the recording of these words; if it will not start (no signal, a missing file), the device's voice says them */
  function playRecorded(text, opt){
    var my = ++token, started = false, over = false;
    try { if (synth) synth.cancel(); } catch(e){}
    var at = -1, stuck = 0, beat = null;
    function drop(){ player.onplaying = player.onended = player.onerror = null; clearTimeout(dog); clearInterval(beat); }
    function fallback(){
      if (over || my !== token) return;
      over = true; drop();
      recDown = Date.now() + 120000;
      try { player.pause(); } catch(e){}
      if (synth) speakDevice(text, opt); else if (opt.onfail) opt.onfail("silent");
    }
    var dog = setTimeout(function(){ if (!started) fallback(); }, 6000);
    /* a recording that stops arriving part way would leave hands-free waiting for ever: twelve seconds with no progress ends it */
    beat = setInterval(function(){
      if (my !== token || over){ clearInterval(beat); return; }
      if (!started || player.paused) return;
      if (player.currentTime !== at){ at = player.currentTime; stuck = 0; return; }
      if (++stuck >= 4){ over = true; drop(); try { player.pause(); } catch(e){} if (opt.onfail) opt.onfail("silent"); }
    }, 3000);
    player.onplaying = function(){ if (my !== token || started) return; started = true; clearTimeout(dog); if (opt.onstart) opt.onstart(); };
    player.onended = function(){ if (my !== token || over) return; over = true; drop(); if (opt.onend) opt.onend(); };
    player.onerror = function(){
      if (my !== token || over) return;
      if (!started){ fallback(); return; }
      over = true; drop();
      try { player.pause(); } catch(e){}
      if (opt.onfail) opt.onfail("silent");   /* it cut out part way, or the device has nowhere to send sound: say so, never start over in another voice */
    };
    try {
      player.pause();
      player.src = REC.base + recKey(text) + ".mp3";
      player.defaultPlaybackRate = player.playbackRate = slow ? 0.85 : 1;
      var went = player.play();   /* inside the tap that asked for it, which is what phones require */
      if (went && went.catch) went.catch(function(){ if (!started) fallback(); });
    } catch(e){ fallback(); }
  }
  /* opt: onstart, onend, onfail(kind) where kind is "none" (no voice on this device), "silent" (nothing came out) or the engine's error;
     opt.voice says it in that voice just this once (to let you hear one before you keep it) */
  function speak(text, opt){
    opt = opt || {};
    try { if (window.__speechLog) window.__speechLog.push({text:String(text), key:recKey(text), recorded:!opt.voice && recorded(text)}); } catch(e){}   /* a list only the tests and the recording tool ask for */
    if (!opt.voice && recorded(text)) playRecorded(text, opt); else speakDevice(text, opt);
  }
  function speakDevice(text, opt){
    opt = opt || {};
    if (player){ try { player.pause(); } catch(e){} }
    if (!synth){ if (opt.onfail) opt.onfail("none"); return; }
    var busy = false;
    try { busy = synth.speaking || synth.pending; } catch(e){}
    var my = ++token, parts = sentences(text), i = 0, started = false;
    var dog = setTimeout(function(){
      if (my !== token || started) return;
      token++;
      try { synth.cancel(); } catch(e){}
      if (opt.onfail) opt.onfail("silent");
    }, 7000);
    function begun(){ if (!started){ started = true; clearTimeout(dog); if (opt.onstart) opt.onstart(); } }
    function next(){
      if (my !== token) return;
      if (i >= parts.length){ clearTimeout(dog); if (opt.onend) opt.onend(); return; }
      var u = new SpeechSynthesisUtterance(parts[i++]);
      var say = opt.voice || voice;
      u.lang = say && say.lang ? String(say.lang).replace("_", "-") : "en-US"; u.rate = slow ? 0.78 : 0.92;
      if (say) u.voice = say;
      u.onstart = begun;
      u.onend = function(){ if (my !== token) return; begun(); next(); };
      u.onerror = function(ev){
        if (my !== token) return;
        var kind = ev && ev.error;
        if (kind === "interrupted" || kind === "canceled") return;
        clearTimeout(dog); token++;
        if (opt.onfail) opt.onfail(kind || "error");
      };
      keep = u;   /* some engines drop the events of an utterance nobody still points at */
      try { synth.resume(); } catch(e){}
      synth.speak(u);
    }
    try {
      if (busy){ synth.cancel(); setTimeout(next, 90); }   /* an utterance queued in the same tick as cancel() can be lost */
      else next();                                         /* the first call stays inside the tap that asked for it */
    } catch(e){ clearTimeout(dog); if (opt.onfail) opt.onfail("error"); }
  }
  return {
    ok:!!synth || !!REC, speak:speak, stop:stop,
    isSlow:function(){ return slow; },
    setSlow:function(v){ slow = !!v; store(VOICE_KEY, slow ? "1" : "0"); },
    list:function(){ return synth ? english() : []; },          /* the voices on offer, best first */
    current:function(){ return voice; },                        /* the one in use; null means the device's own default */
    chosen:function(){ return synth ? pickedVoice(english()) : null; },   /* the one you picked, if it is still here */
    use:function(v){ picked = v === "device" ? "device" : (v ? idOf(v) : ""); store(VOICE_PICK_KEY, picked); if (synth) refresh(); else tell(); },   /* null: let the page choose; "device": this device's best voice, never the recording */
    hasRecorded:function(){ return !!REC; },
    hasDevice:function(){ return !!synth; },
    key:recKey,
    /* "pick": a voice you chose; "recorded": the recorded voice; "device": this device's best voice, by choice; "auto": the page chooses and there are no recordings */
    mode:function(){
      if (synth && picked && picked !== "device" && pickedVoice(english())) return "pick";
      if (REC && picked === "") return "recorded";
      return REC ? "device" : "auto";
    },
    onChange:function(fn){ watchers.push(fn); },
    same:function(a, b){ return !!a && !!b && idOf(a) === idOf(b); }   /* browsers hand out a fresh object for the same voice each time they are asked */
  };
})();
document.addEventListener("visibilitychange", function(){ if (document.hidden){ Voice.stop(); stopListen(); walkPause(); } });

/* how the names are said out loud */
function speakable(t){
  return String(t).replace(/Cappacuolo/gi, "capicola").replace(/Prosciuttini/gi, "pro shoo tee nee").replace(/\b([Aa])n #(\d)/g, "$1 number $2").replace(/#(\d)/g, "number $1").replace(/\bLTO\b/g, "limited time")
    .replace(/(^|[^\d.,])1 oz\b/g, function(m, a){ return a + "1 ounce"; })          /* one ounce, not "1 ounces" */
    .replace(/\b(an?) (\d[\d.]*) oz\b/g, "$1 $2 ounce")                              /* "a 4 ounce cup" */
    .replace(/(\d) oz\b/g, "$1 ounces").replace(/½ oz/g, "half an ounce");
}
function sayContents(sub){
  var parts = [];
  if (sub.type === "cold"){
    var core = sub.cheese.concat(sub.meats, sub.fixed);
    if (core.length) parts.push(core.join(", ") + ".");
    if (sub.mw) parts.push("Then Mike's Way.");
    if (sub.lid && sub.lid.length) parts.push(sub.lid.join(" and ") + " on the lid.");
  } else {
    hotParts(sub).forEach(function(p){
      if (p.label === "Cheese on top") parts.push(p.items.join(", ") + " melted on top.");
      else if (p.label === "To finish") parts.push(p.items.join(", ") + " to finish.");
      else parts.push(p.label + ": " + p.items.join(", ") + ".");
    });
  }
  return parts.join(" ");
}
function sayText(sub){
  var t = (sub.lto ? sub.name + "." : "Number " + sub.n + ". " + sub.name + ".") + " " + sayContents(sub);
  if (sub.type === "cold" && sub.mw) t += " Mike's Way is " + MW.join(", ").toLowerCase() + ".";
  if (sub.delta) t += " " + sub.delta;
  return speakable(t);
}
/* Every fixed thing the page says is put into words by one of these (and by sayText above and cardText on the Training tab),
   so a recording can be matched to the exact words. */
function listenAsk(s, nameFirst){ return sayable(nameFirst ? s.name + "." : "Number " + s.n + "."); }
function listenTell(s, nameFirst){ return sayable((nameFirst ? "Number " + s.n + ". " : s.name + ". ") + sayContents(s)); }
function fullStop(t){ t = String(t); return /[.!?:]["”')\]]*$/.test(t) ? t : t + "."; }   /* an answer that ends in "p.m." or "?" has its stop already */
function lessonSay(q){ return sayable(q.q + " " + fullStop(q.a) + " " + q.why); }
function seqSay(sq){ return sayable(fullStop(sq.title) + " " + sq.steps.map(fullStop).join(" ")); }
function walkSay(st){ return sayable((/^start$/i.test(st.num) ? "Before you start. " : "Step " + st.num + ". ") + st.title + ". " + st.text); }
var SPEAKER_ICON = "M3 9v6h4l5 4V5L7 9H3zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM12 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z";
var saying = null;   /* the button that is talking right now */
function sayReset(){ if (saying){ saying.setAttribute("aria-pressed", "false"); saying.lastChild.textContent = saying.getAttribute("data-label"); saying = null; } }
function sayButton(text, label){
  label = label || "Read it to me";
  if (!Voice.ok) return null;
  var icon = svgEl("svg", {viewBox:"0 0 24 24", "aria-hidden":"true"}); icon.appendChild(svgEl("path", {d:SPEAKER_ICON}));
  var b = h("button", {class:"say-btn", "aria-pressed":"false", "data-label":label}, [icon, h("span", {text:label})]);
  b.addEventListener("click", function(){
    if (saying === b){ Voice.stop(); sayReset(); return; }
    sayReset(); stopListen(); walkPause();
    saying = b; b.setAttribute("aria-pressed", "true"); b.lastChild.textContent = "Stop";
    Voice.speak(typeof text === "function" ? text() : text, {
      onend:function(){ if (saying === b) sayReset(); },
      onfail:function(kind){
        if (saying === b) sayReset();
        b.lastChild.textContent = kind === "silent" ? "No sound. Check the volume" : "No voice on this device";
        setTimeout(function(){ if (saying !== b) b.lastChild.textContent = label; }, 4000);
      }
    });
  });
  return b;
}

/* keep the screen on while something hands-free is running */
var Awake = {
  lock:null, want:false,
  on:function(){ this.want = true; this.ask(); },
  off:function(){ this.want = false; var l = this.lock; this.lock = null; if (l){ try { l.release(); } catch(e){} } },
  ask:function(){
    var self = this;
    try {
      if (!navigator.wakeLock || !navigator.wakeLock.request || self.lock) return;
      navigator.wakeLock.request("screen").then(function(l){
        if (!self.want){ try { l.release(); } catch(e){} return; }
        self.lock = l;
        try { l.addEventListener("release", function(){ if (self.lock === l) self.lock = null; }); } catch(e){}
      }, function(){});
    } catch(e){}
  }
};
document.addEventListener("visibilitychange", function(){ if (!document.hidden && Awake.want) Awake.ask(); });
