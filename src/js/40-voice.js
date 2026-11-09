
/* ---------- the phone's own voice (free, works offline) ----------
   Everything spoken goes through Voice.speak. Text is split into sentences because some browsers cut a long
   utterance off after about fifteen seconds, and so a watchdog can tell "nothing came out" from "still talking". */
var VOICE_KEY = "jm-voice-slow";
var Voice = (function(){
  var synth = null;
  try { if (typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined") synth = window.speechSynthesis; } catch(e){}
  var token = 0, voice = null, keep = null, slow = loadRaw(VOICE_KEY) === "1";
  var PREFER = ["Samantha", "Ava", "Allison", "Evan", "Google US English", "Microsoft Aria", "Microsoft Jenny", "Microsoft Zira"];
  function pickVoice(){
    var list = [];
    try { list = synth.getVoices() || []; } catch(e){}
    var en = list.filter(function(v){ return /^en[-_]US/i.test(v.lang) && !/compact/i.test(v.name); });
    voice = null;
    for (var i = 0; i < PREFER.length && !voice; i++){
      for (var j = 0; j < en.length; j++){ if (en[j].name.indexOf(PREFER[i]) === 0){ voice = en[j]; break; } }
    }
    if (!voice) voice = en.filter(function(v){ return v.localService; })[0] || en[0] || null;
  }
  if (synth){
    pickVoice();
    try { if (synth.addEventListener) synth.addEventListener("voiceschanged", pickVoice); else synth.onvoiceschanged = pickVoice; } catch(e){}
  }
  function sentences(text){
    var parts = String(text).match(/[^.!?]+[.!?]+["”']?|[^.!?]+$/g) || [String(text)];
    return parts.map(function(p){ return p.replace(/^\s+|\s+$/g, ""); }).filter(function(p){ return p.length > 0; });
  }
  function stop(){
    token++;
    if (synth){ try { synth.cancel(); } catch(e){} }
  }
  /* opt: onstart, onend, onfail(kind) where kind is "none" (no voice on this device), "silent" (nothing came out) or the engine's error */
  function speak(text, opt){
    opt = opt || {};
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
      u.lang = "en-US"; u.rate = slow ? 0.78 : 0.92;
      if (voice) u.voice = voice;
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
    ok:!!synth, speak:speak, stop:stop,
    isSlow:function(){ return slow; },
    setSlow:function(v){ slow = !!v; store(VOICE_KEY, slow ? "1" : "0"); }
  };
})();
document.addEventListener("visibilitychange", function(){ if (document.hidden){ Voice.stop(); stopListen(); walkPause(); } });

/* how the names are said out loud */
function speakable(t){
  return String(t).replace(/Cappacuolo/gi, "capicola").replace(/Prosciuttini/gi, "pro shoo tee nee").replace(/#(\d)/g, "number $1").replace(/\bLTO\b/g, "limited time")
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
    parts.push("On the grill: " + (sub.protein ? [sub.protein] : []).concat(sub.grill).join(", ") + ". " + sub.cheese.join(", ") + " melted on top.");
    if (sub.after.length) parts.push("Then " + sub.after.join(", ") + ".");
  }
  return parts.join(" ");
}
function sayText(sub){
  var t = (sub.lto ? sub.name + "." : "Number " + sub.n + ". " + sub.name + ".") + " " + sayContents(sub);
  if (sub.type === "cold" && sub.mw) t += " Mike's Way is " + MW.join(", ").toLowerCase() + ".";
  if (sub.delta) t += " " + sub.delta;
  return speakable(t);
}
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
