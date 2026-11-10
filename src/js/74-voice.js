
/* ---------- pick a voice ----------
   On the public site the page has a recorded voice of its own. Everywhere else, and for anything not recorded, it reads with
   whichever voice the phone or computer lends it. This sheet lists the recorded voice first, then the device's English ones,
   best first. Tapping one says a sample line in it and keeps it; the choice stays on this device. */
var voiceSampling = false;
var VOICE_SAMPLE = "Number 13, the Original Italian. Provolone, ham, prosciuttini, capicola, salami and pepperoni.";
/* "Microsoft Aria Online (Natural) - English (United States)" is shown as "Aria (Natural)"; other names are shown as they are */
function voiceTitle(v){ return String(v.name || "").replace(/^Microsoft\s+/, "").replace(/\s+Online\b/, "").replace(/\s+-\s+English.*$/, ""); }
function voiceNote(v){
  var bits = [], lang = String(v.lang || "").replace("_", "-").toLowerCase();
  var from = {"en-gb":"British", "en-au":"Australian", "en-ie":"Irish", "en-za":"South African", "en-in":"Indian", "en-nz":"New Zealand", "en-ca":"Canadian", "en-sg":"Singaporean"}[lang];
  if (from) bits.push(from);
  if (v.localService === false) bits.push("needs the internet");
  return bits.join(", ");
}
function voiceLabel(){
  if (Voice.mode() === "recorded") return "Voice: recorded. Change";
  var v = Voice.current();
  return "Voice: " + (v ? voiceTitle(v) : "built in") + ". Change";
}
function fillVoice(){
  stopListen();
  var list = Voice.list(), rec = Voice.hasRecorded(), dev = Voice.hasDevice();
  sheetBody.appendChild(h("div", {class:"sheet-head"}, h("div", {}, [h("h2", {id:"sheet-title", text:"Pick a voice"}), h("span", {class:"pill", text:"Read aloud"})])));
  sheetBody.appendChild(h("p", {text:rec
    ? (dev ? "The recorded voice is the natural one. The rest are the voices this device lends to a web page. Tap one to hear it. The last one you tap is the one the page keeps."
           : "This page reads in a recorded voice. Tap it to hear it.")
    : (list.length ? "These are the voices this device lends to a web page. Tap one to hear it. The last one you tap is the one the page keeps."
                   : "This device reads with its one built-in voice and doesn't let a page pick another.")}));
  var status = h("p", {class:"fine voice-status", "aria-live":"polite"});
  var box = h("div", {class:"voice-list", role:"group", "aria-label":"Voices"}), rows = [];
  /* a row is the recorded voice (v is null where there are recordings), the device's best voice ("device", or null where
     there are no recordings), or one voice by name */
  function mark(){
    var mode = Voice.mode(), cur = Voice.current();
    rows.forEach(function(r){
      var on = r.v === null ? (mode === "recorded" || mode === "auto") : (r.v === "device" ? mode === "device" : (mode === "pick" && Voice.same(r.v, cur)));
      r.b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function hear(v){
    sayReset(); stopListen(); walkPause();
    status.textContent = "";
    voiceSampling = true;
    var opt = {
      onend:function(){ voiceSampling = false; },
      onfail:function(kind){
        voiceSampling = false;
        status.textContent = kind === "silent" ? "No sound came out. Check the volume, or try another voice." : "That voice didn't answer. Try another one.";
      }};
    if (v && v !== "device") opt.voice = v;   /* one voice by name; otherwise the page says it the way it now would */
    Voice.speak(speakable(VOICE_SAMPLE), opt);
  }
  function row(v, title, note){
    var b = h("button", {class:"vrow", "aria-pressed":"false"}, [h("b", {text:title}), note ? h("span", {text:note}) : null]);
    b.addEventListener("click", function(){ Voice.use(v); mark(); hear(v); });
    rows.push({b:b, v:v});
    box.appendChild(b);
  }
  if (rec || list.length){
    if (rec){
      row(null, "The recorded voice", dev ? "Natural, and the same on every device. Needs the internet. With no signal, the device's voice steps in." : "Natural, and the same on every device. Needs the internet.");
      if (dev) row("device", "This device's best voice", "Works with no signal.");
    } else row(null, "Let the page choose", "It takes the best one it finds here.");
    list.forEach(function(v){ row(v, voiceTitle(v), voiceNote(v)); });
    sheetBody.appendChild(box);
    mark();
  } else {
    sheetBody.appendChild(h("div", {class:"row"}, h("button", {class:"btn ghost", text:"Hear it", onclick:function(){ hear(null); }})));
  }
  sheetBody.appendChild(status);
  /* how fast it talks */
  var speed = h("div", {class:"seg tight", role:"group", "aria-label":"Speed"});
  [{v:false, t:"Normal"}, {v:true, t:"Slower"}].forEach(function(op){
    speed.appendChild(h("button", {"aria-pressed":op.v === Voice.isSlow() ? "true" : "false", text:op.t, onclick:function(){
      Voice.setSlow(op.v);
      each(speed.children, function(b, k){ b.setAttribute("aria-pressed", (k === 1) === Voice.isSlow() ? "true" : "false"); });
    }}));
  });
  sheetBody.appendChild(h("div", {class:"ctl-row"}, [h("span", {class:"ctl-label", text:"Speed"}), speed]));
  /* what to do when none of the device's voices is good: said plainly, because a page cannot fix this by itself */
  if (dev) sheetBody.appendChild(h("details", {class:"voice-tips"}, [
    h("summary", {text:rec ? "The device's voices sound bad?" : "None of them sound good?"}),
    h("p", {text:"A page can only borrow the voices a device already has, and some devices keep their best ones to themselves. A better one is often a free download:"}),
    h("dl", {class:"dl words"}, [
      h("dt", {text:"iPhone or iPad"}), h("dd", {text:"Settings, Accessibility, then Read & Speak (some say Spoken Content), Voices, English. Download one marked Enhanced or Premium, then close this page and open it again. If it isn't in the list above after that, Apple isn't lending that one to web pages."}),
      h("dt", {text:"Android"}), h("dd", {text:"Open Settings and search for Text-to-speech. In the speech engine's own settings, install the English voice data."}),
      h("dt", {text:"Windows"}), h("dd", {text:"Open this page in Microsoft Edge. Its voices marked Natural are far better than the ones other browsers get. They need the internet."}),
      h("dt", {text:"Mac"}), h("dd", {text:"System Settings, Accessibility, then Read & Speak (some say Spoken Content), System voice, Manage Voices. Download an English one marked Enhanced or Premium."})
    ])
  ]));
}
/* Every fixed thing the page can say, with the fingerprint its recording is filed under. The tests ask for this list, and so
   does the tool that makes the recordings; nothing on the page itself uses it. */
function allSpoken(){
  var out = [];
  function add(kind, id, text){ out.push({kind:kind, id:String(id), text:text, key:Voice.key(text)}); }
  each(document.querySelectorAll("#view-orient > details.card:not(.ease-card)"), function(card){ add("card", card.id, cardText(card)); });
  SUBS.forEach(function(s){
    add("sub", s.id, sayText(s));
    if (s.lto) return;
    [false, true].forEach(function(nameFirst){
      add("ask", s.id + (nameFirst ? "-name" : "-number"), listenAsk(s, nameFirst));
      add("tell", s.id + (nameFirst ? "-name" : "-number"), listenTell(s, nameFirst));
    });
  });
  Object.keys(HOWTO_NAME).forEach(function(k){ howtoSteps(k).forEach(function(st){ add("step", k + "-" + st.num, walkSay(st)); }); });
  Object.keys(SEQS).forEach(function(k){ add("game", k, seqSay(SEQS[k])); });
  Object.keys(BANKS).forEach(function(b){ BANKS[b].forEach(function(q){ add("lesson", q.id, lessonSay(q)); }); });
  SHIFTS.forEach(function(s){ s.steps.forEach(function(st, i){ add("shift", s.id + "-" + (i + 1), shiftSay(st)); add("shiftwhy", s.id + "-" + (i + 1), shiftWhy(st)); }); });
  add("sample", "voice", speakable(VOICE_SAMPLE));
  return out;
}
/* every "change the voice" button on the page says which voice is in use, and stays right when the list arrives late */
function refreshVoiceButtons(){
  each(document.querySelectorAll("[data-voice-open]"), function(b){ b.textContent = voiceLabel(); });
}
function initVoiceUI(){
  var row = $("voice-row");
  if (!Voice.ok){ if (row) row.hidden = true; return; }
  refreshVoiceButtons();
  Voice.onChange(refreshVoiceButtons);
}
