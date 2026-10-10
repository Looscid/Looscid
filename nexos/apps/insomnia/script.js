/* Insomnia OS — made by Tab at 4 AM. MIT licensed. */
(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
// Calm mode (photosensitivity notice at the top, on by default) or the system Reduce Motion setting: nothing moves.
const calm = () => reduceMotion() || !!(window.calmMode && window.calmMode());
const store = {
  get(k, d) { try { const v = localStorage.getItem("insomnia-os:" + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("insomnia-os:" + k, JSON.stringify(v)); } catch {} }
};
const announcer = $("#announcer");
let annTimer;
function announce(msg) {
  clearTimeout(annTimer);
  announcer.textContent = "";
  annTimer = setTimeout(() => { announcer.textContent = msg; }, 60);
}

/* ================= Your name (optional, local only, always set via textContent) ================= */
const NAME_MAX = 40;
const cleanName = s => String(s || "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
let userName = cleanName(store.get("name", ""));
const named = (withName, without) => userName ? withName.replace("{name}", userName) : without;
function renderName() {
  $("#night-name").textContent = named("Goodnight, {name}", "Goodnight, friend");
  const greet = $("#boot-greet");
  greet.textContent = userName ? "Welcome back, " + userName + "." : "";
  greet.hidden = !userName || !$("#name-boot").hidden;
  $("#name-about-in").value = userName;
  $("#name-about-status").textContent = userName ? "Saved as " + userName + "." : "No name saved. Insomnia OS will say friend.";
}
function setName(v) { userName = cleanName(v); store.set("name", userName); store.set("name-asked", true); renderName(); }
const nameBoot = $("#name-boot");
if (!store.get("name-asked", false)) nameBoot.hidden = false;
nameBoot.addEventListener("submit", e => {
  e.preventDefault(); setName($("#name-boot-in").value); nameBoot.hidden = true; renderName();
  announce(userName ? "Nice to meet you, " + userName + ". Press to boot when you're ready." : "No name saved. Press to boot when you're ready.");
  $("#boot-btn").focus();
});
$(".name-skip", nameBoot).addEventListener("click", () => {
  store.set("name-asked", true); nameBoot.hidden = true; renderName();
  announce("Skipped. You can add a name later in Read Me.txt."); $("#boot-btn").focus();
});
$("#name-about").addEventListener("submit", e => {
  e.preventDefault(); setName($("#name-about-in").value);
  announce(userName ? "Name saved. I'll call you " + userName + "." : "Name cleared.");
});
$(".name-clear", $("#name-about")).addEventListener("click", () => { setName(""); announce("Name cleared. I'll just say friend."); $("#name-about-in").focus(); });
renderName();

/* ================= Audio engine (all synthesized, nothing before a gesture) ================= */
const A = {
  LIM: { th: -6, knee: 6, ratio: 4, makeup: 0.9 }, // compressor settings (v2 was a -3 dB brickwall only)
  ctx: null, master: null, vol: null, sfx: null, amb: null, ch: {}, levels: {rain:0, fan:0, whir:0, crick:0},
  muted: store.get("muted", false), clicks: true,
  volume: Math.min(150, Math.max(0, +store.get("volume", 100) || 0)), // master volume, 0–150 %
  AMB: 2.2, // ambience bus (v1: 1, v2: 1.55): another +3 dB, the limiter keeps it clean
  SFX: 1.02, // chime bus (v1: 0.5, v2: 0.72): another +3 dB
  volGain(pct) { return Math.pow(pct/100, 1.5); }, // perceptual curve; 150% ≈ +5 dB
  init() {
    if (this.ctx) { this.wake(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = this.ctx = new AC();
    // sources -> amb / sfx -> master (mute) -> vol (master volume) -> limiter -> ceiling -> speakers
    this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : 1;
    this.vol = c.createGain(); this.vol.gain.value = this.volGain(this.volume);
    const lim = c.createDynamicsCompressor(); // gentle glue compressor + limiter, so louder still sounds clean
    lim.threshold.value = this.LIM.th; lim.knee.value = this.LIM.knee; lim.ratio.value = this.LIM.ratio; lim.attack.value = 0.01; lim.release.value = 0.25;
    const ceil = c.createGain(); ceil.gain.value = this.LIM.makeup; // make-up gain after the compressor
    // Safety soft-clipper: transparent below 0.6, rounds off anything above, hard ceiling at about -1.2 dBFS. Nothing can clip.
    const safe = c.createWaveShaper(), n = 2049, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1, ax = Math.abs(x); curve[i] = ax <= 0.6 ? x : Math.sign(x) * (0.6 + 0.33 * Math.tanh((ax - 0.6) / 0.33)); }
    safe.curve = curve; safe.oversample = "4x";
    this.master.connect(this.vol).connect(lim).connect(ceil).connect(safe).connect(c.destination);
    this.sfx = c.createGain(); this.sfx.gain.value = this.SFX; this.sfx.connect(this.master);
    this.amb = c.createGain(); this.amb.gain.value = this.AMB; this.amb.connect(this.master);
    this.white = this.noiseBuffer("white"); this.brown = this.noiseBuffer("brown"); this.pink = this.noiseBuffer("pink");
    this.buildRain(); this.buildFan(); this.buildWhir(); this.buildCrickets();
    this.scheduler = setInterval(() => this.tick(), 90);
    this.armSleep();
  },
  // Battery: with no soundscape playing, the sound engine and its scheduler sleep after 20 s of quiet and whenever the tab is hidden.
  // A soundscape you started keeps playing in the background on purpose (it's for falling asleep).
  wake() {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    if (!this.scheduler) this.scheduler = setInterval(() => this.tick(), 90);
    this.lastUse = Date.now(); this.armSleep();
  },
  armSleep() { clearTimeout(this.sleepT); this.sleepT = setTimeout(() => this.sleepIfIdle(), 20000); },
  sleepIfIdle(now) {
    if (!this.ctx) return;
    if (this.ambActive() || (!now && Date.now() - (this.lastUse || 0) < 19000)) { this.armSleep(); return; }
    clearInterval(this.scheduler); this.scheduler = null;
    if (this.ctx.state === "running") this.ctx.suspend().catch(() => {});
  },
  noiseBuffer(kind) {
    const c = this.ctx, len = c.sampleRate * 3, buf = c.createBuffer(2, len, c.sampleRate);
    for (let chn = 0; chn < 2; chn++) {
      const d = buf.getChannelData(chn); let last = 0, b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === "white") d[i] = w * 0.5;
        else if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
        else { b0=.99886*b0+w*.0555179; b1=.99332*b1+w*.0750759; b2=.969*b2+w*.153852; b3=.8665*b3+w*.3104856; b4=.55*b4+w*.5329522; b5=-.7616*b5-w*.016898; d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.1; b6=w*.115926; }
      }
    }
    return buf;
  },
  loop(buf) { const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = Math.random(); s.start(0, Math.random()*2); return s; },
  chan(name) { const g = this.ctx.createGain(); g.gain.value = 0; g.connect(this.amb); this.ch[name] = g; return g; },
  buildRain() {
    const c = this.ctx, out = this.chan("rain");
    const hiss = this.loop(this.pink), hp = c.createBiquadFilter(), lp = c.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 500; lp.type = "lowpass"; lp.frequency.value = 7000;
    const hg = c.createGain(); hg.gain.value = 0.9; hiss.connect(hp).connect(lp).connect(hg).connect(out);
    const rum = this.loop(this.brown), rl = c.createBiquadFilter(); rl.type = "lowpass"; rl.frequency.value = 260;
    const rg = c.createGain(); rg.gain.value = 0.55; rum.connect(rl).connect(rg).connect(out);
    this.rainOut = out;
  },
  drop(t) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.white;
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800 + Math.random()*3800; bp.Q.value = 6;
    const g = c.createGain(), p = c.createStereoPanner ? c.createStereoPanner() : null;
    const v = 0.15 + Math.random()*0.35;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t+0.002); g.gain.exponentialRampToValueAtTime(0.0008, t+0.05+Math.random()*0.05);
    s.connect(bp).connect(g);
    if (p) { p.pan.value = Math.random()*1.6-0.8; g.connect(p).connect(this.rainOut); } else g.connect(this.rainOut);
    s.start(t, Math.random()*2, 0.12);
  },
  buildFan() {
    const c = this.ctx, out = this.chan("fan");
    const n = this.loop(this.brown), lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
    const ng = c.createGain(); ng.gain.value = 1.1; n.connect(lp).connect(ng).connect(out);
    const air = this.loop(this.pink), bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 0.7;
    const ag = c.createGain(); ag.gain.value = 0.25; air.connect(bp).connect(ag).connect(out);
    [57, 114].forEach((f, i) => { const o = c.createOscillator(); o.frequency.value = f; const g = c.createGain(); g.gain.value = i ? 0.02 : 0.05; o.connect(g).connect(out); o.start(); });
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.18; lg.gain.value = 0.18; lfo.connect(lg).connect(ng.gain); lfo.start();
  },
  buildWhir() {
    const c = this.ctx, out = this.chan("whir");
    const n = this.loop(this.pink), bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 650; bp.Q.value = 3;
    const ng = c.createGain(); ng.gain.value = 0.9; n.connect(bp).connect(ng).connect(out);
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 60; lfo.connect(lg).connect(bp.frequency); lfo.start();
    const spin = c.createOscillator(); spin.type = "triangle"; spin.frequency.value = 120; const sl = c.createBiquadFilter(); sl.type="lowpass"; sl.frequency.value=400;
    const sg = c.createGain(); sg.gain.value = 0.06; spin.connect(sl).connect(sg).connect(out); spin.start();
    const whine = c.createOscillator(); whine.frequency.value = 5400; const wg = c.createGain(); wg.gain.value = 0.0035; whine.connect(wg).connect(out); whine.start();
    this.whirOut = out;
  },
  seek(t) { // hard drive chatter
    const c = this.ctx, k = 2 + Math.floor(Math.random()*6);
    for (let i = 0; i < k; i++) {
      const tt = t + i*(0.03 + Math.random()*0.06), s = c.createBufferSource(); s.buffer = this.white;
      const hp = c.createBiquadFilter(); hp.type = "bandpass"; hp.frequency.value = 2500 + Math.random()*1500; hp.Q.value = 2;
      const g = c.createGain(); g.gain.setValueAtTime(0.35, tt); g.gain.exponentialRampToValueAtTime(0.001, tt+0.012);
      s.connect(hp).connect(g).connect(this.whirOut); s.start(tt, Math.random()*2, 0.02);
    }
  },
  buildCrickets() { this.crickOut = this.chan("crick"); this.crickets = [{next:0, f:4300, pan:-0.6, rate:0.9},{next:0.4, f:4650, pan:0.55, rate:1.15},{next:0.9, f:3950, pan:0.1, rate:1.6}]; },
  chirp(t, cr) {
    const c = this.ctx, o = c.createOscillator(); o.frequency.value = cr.f;
    const g = c.createGain(); g.gain.value = 0;
    const p = c.createStereoPanner ? c.createStereoPanner() : null;
    for (let i = 0; i < 3; i++) { const s = t + i*0.045; g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.12, s+0.008); g.gain.linearRampToValueAtTime(0, s+0.03); }
    o.connect(g); if (p) { p.pan.value = cr.pan; g.connect(p).connect(this.crickOut); } else g.connect(this.crickOut);
    o.start(t); o.stop(t + 0.2);
  },
  tick() {
    const c = this.ctx; if (!c || c.state !== "running") return;
    const now = c.currentTime, ahead = now + 0.2, L = this.levels;
    if (L.rain > 0) { const n = Math.round(1 + L.rain/12 * Math.random()); for (let i=0;i<n;i++) this.drop(now + 0.05 + Math.random()*0.09); }
    if (L.whir > 0 && Math.random() < 0.03) this.seek(now + 0.05);
    if (L.crick > 0) this.crickets.forEach(cr => {
      if (cr.next < now) cr.next = now + Math.random()*0.3;
      while (cr.next < ahead) { this.chirp(cr.next, cr); cr.next += cr.rate * (0.85 + Math.random()*0.3) + (Math.random() < 0.1 ? 2 : 0); }
    });
  },
  setLevel(name, pct) {
    this.levels[name] = pct;
    if (pct > 0) this.wake();
    if (!this.ch[name]) return;
    const gain = Math.pow(pct/100, 2) * (name === "crick" ? 0.8 : 1);
    this.ch[name].gain.setTargetAtTime(gain, this.ctx.currentTime, 0.12);
  },
  ambActive() { return Object.values(this.levels).some(v => v > 0); },
  fadeAmbience(sec) { if (this.amb) this.amb.gain.setTargetAtTime(0.0001, this.ctx.currentTime, sec/4); },
  restoreAmbience() { if (this.amb) this.amb.gain.setTargetAtTime(this.AMB, this.ctx.currentTime, 0.2); },
  setVolume(pct) { this.volume = pct; store.set("volume", pct); if (this.vol) this.vol.gain.setTargetAtTime(this.volGain(pct), this.ctx.currentTime, 0.05); },
  setMuted(m) { this.muted = m; store.set("muted", m); if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.03); },
  tone(f, t, dur, {type="sine", vol=0.25, glide=null, attack=0.005} = {}) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t+dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t+attack); g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.connect(g).connect(this.sfxBus || this.sfx); o.start(t); o.stop(t+dur+0.05);
  },
  echoBus() {
    if (this.sfxBus) return this.sfxBus;
    const c = this.ctx, inp = c.createGain(), d = c.createDelay(1), fb = c.createGain(), wet = c.createGain(), lp = c.createBiquadFilter();
    d.delayTime.value = 0.23; fb.gain.value = 0.38; wet.gain.value = 0.45; lp.type="lowpass"; lp.frequency.value = 2600;
    inp.connect(this.sfx); inp.connect(d); d.connect(lp).connect(fb).connect(d); lp.connect(wet).connect(this.sfx);
    return (this.sfxBus = inp);
  },
  play(name) {
    if (!this.ctx || this.muted) return;
    this.wake();
    if (!this.clicks && ["click","open","close","tick"].includes(name)) return;
    this.echoBus();
    const t = this.ctx.currentTime + 0.01;
    switch (name) {
      case "click": this.tone(1400, t, 0.03, {type:"square", vol:0.06}); break;
      case "tick": this.tone(900, t, 0.02, {type:"square", vol:0.03}); break;
      case "open": this.tone(660, t, 0.09, {type:"triangle", vol:0.14}); this.tone(990, t+0.06, 0.12, {type:"triangle", vol:0.12}); break;
      case "close": this.tone(880, t, 0.08, {type:"triangle", vol:0.12}); this.tone(587, t+0.05, 0.12, {type:"triangle", vol:0.1}); break;
      case "ding": this.tone(1318, t, 0.6, {vol:0.18}); this.tone(1976, t, 0.4, {vol:0.06}); break;
      case "boot": // warm major-seventh bloom, Db - Ab - C - F. Round 4: louder (about +5 dB) and fuller, with an octave shimmer, a low fifth and a longer tail
        [[277.2,0],[415.3,.18],[523.3,.36],[698.5,.54],[1046.5,.78]].forEach(([f,d]) => { this.tone(f, t+d, 3.2-d, {vol:0.2, attack:0.04}); this.tone(f*2.001, t+d, 1.8, {vol:0.04, attack:0.04}); });
        this.tone(138.6, t, 3.6, {type:"triangle", vol:0.15, attack:0.3}); this.tone(207.7, t+0.1, 3.3, {vol:0.06, attack:0.35}); break;
      case "goodnight": // Round 4: louder (about +5 dB) and fuller, each note doubled an octave up, a low fifth under the final C, longer sustain
        [[784,0],[659.3,.35],[523.3,.7],[392,1.05],[261.6,1.5]].forEach(([f,d]) => { this.tone(f, t+d, 2.9, {vol:0.2, attack:0.03}); this.tone(f*2.001, t+d, 1.5, {vol:0.035, attack:0.03}); });
        this.tone(130.8, t+1.5, 4, {type:"triangle", vol:0.14, attack:0.4}); this.tone(196, t+1.5, 3.6, {vol:0.06, attack:0.4}); break;
      case "baa": {
        const c = this.ctx, o = c.createOscillator(), vib = c.createOscillator(), vg = c.createGain(), f1 = c.createBiquadFilter(), f2 = c.createBiquadFilter(), g = c.createGain();
        const base = 200 + Math.random()*90;
        o.type = "sawtooth"; o.frequency.setValueAtTime(base*1.15, t); o.frequency.linearRampToValueAtTime(base, t+0.12); o.frequency.linearRampToValueAtTime(base*0.92, t+0.6);
        vib.frequency.value = 7.5; vg.gain.value = base*0.06; vib.connect(vg).connect(o.frequency);
        f1.type = "bandpass"; f1.frequency.setValueAtTime(700, t); f1.frequency.linearRampToValueAtTime(1000, t+0.25); f1.Q.value = 4;
        f2.type = "bandpass"; f2.frequency.value = 2400; f2.Q.value = 6;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t+0.05); g.gain.setValueAtTime(0.45, t+0.4); g.gain.exponentialRampToValueAtTime(0.001, t+0.7);
        o.connect(f1).connect(g); o.connect(f2).connect(g); g.connect(this.sfx);
        o.start(t); vib.start(t); o.stop(t+0.75); vib.stop(t+0.75); break;
      }
    }
  }
};

/* ================= Boot ================= */
const bootBtn = $("#boot-btn"), bootLog = $("#boot-log");
const lines = ["Insomnia BIOS v4.00 AM", "Checking melatonin........ NOT FOUND", "Counting sheep drivers..... OK", "Mounting /dev/rain......... OK", "Loading cozy.sys........... OK", "Starting desktop…"];
bootBtn.addEventListener("click", async () => {
  if (!nameBoot.hidden) { const typed = cleanName($("#name-boot-in").value); if (typed) setName(typed); else store.set("name-asked", true); nameBoot.hidden = true; renderName(); }
  A.init(); A.play("boot");
  bootBtn.disabled = true; bootBtn.textContent = "Booting…";
  announce("Booting Insomnia OS.");
  if (!reduceMotion()) {
    const log = lines.slice(); log.splice(4, 0, userName ? "Loading profile............ " + userName.toUpperCase() : "Loading profile............ GUEST");
    for (const l of log) { bootLog.textContent += l + "\n"; await new Promise(r => setTimeout(r, 330)); }
    await new Promise(r => setTimeout(r, 300));
  }
  $("#boot").hidden = true; $("#os").hidden = false;
  icons[0].focus();
  announce(named("Hi {name}. ", "") + "Insomnia OS is ready. " + icons.length + " icons on the desktop. Use arrow keys to move between them, Enter to open.");
});

/* ================= Desktop icons (roving tabindex) ================= */
const icons = $$(".icon");
icons.forEach((btn, i) => {
  btn.addEventListener("keydown", e => {
    let j = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") j = (i + 1) % icons.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") j = (i - 1 + icons.length) % icons.length;
    else if (e.key === "Home") j = 0; else if (e.key === "End") j = icons.length - 1;
    if (j !== null) { e.preventDefault(); icons.forEach(b => b.tabIndex = -1); icons[j].tabIndex = 0; icons[j].focus(); A.play("tick"); }
  });
  btn.addEventListener("focus", () => { icons.forEach(b => b.tabIndex = -1); btn.tabIndex = 0; });
  btn.addEventListener("click", () => {
    if (btn.dataset.open) openWin(btn.dataset.open, btn);
    else if (btn.dataset.action === "stars") startStars(btn);
  });
});

/* ================= Window manager ================= */
const desk = $("#desktop"), taskList = $("#task-list");
let z = 10; const openers = {};
const small = () => matchMedia("(max-width:640px)").matches;
function winTitle(w) { return $(".wtitle", w).textContent.trim(); }
function place(w, x, y) {
  const r = desk.getBoundingClientRect(), ww = w.offsetWidth, wh = w.offsetHeight;
  x = Math.max(0, Math.min(x, r.width - Math.min(ww, r.width)));
  y = Math.max(0, Math.min(y, r.height - 40));
  w.style.left = x + "px"; w.style.top = y + "px"; w.dataset.x = x; w.dataset.y = y;
}
function activate(w) {
  $$(".win").forEach(o => o.classList.toggle("active", o === w));
  w.style.zIndex = ++z;
  $$("button", taskList).forEach(b => b.setAttribute("aria-current", b.dataset.win === w.id ? "true" : "false"));
}
function openWin(id, opener) {
  const w = document.getElementById(id);
  if (opener) openers[id] = opener;
  if (w.hidden) {
    w.hidden = false;
    if (!small()) place(w, +w.dataset.x, +w.dataset.y);
    if (!calm()) { w.classList.remove("opening"); void w.offsetWidth; w.classList.add("opening"); }
    const li = document.createElement("li"), b = document.createElement("button");
    b.type = "button"; b.dataset.win = id; b.textContent = winTitle(w);
    b.addEventListener("click", () => { A.play("click"); focusWin(w); });
    li.appendChild(b); taskList.appendChild(li);
    A.play("open");
    announce(winTitle(w).replace(/^\S+\s/, "") + " window opened.");
  }
  focusWin(w);
}
function focusWin(w) {
  activate(w);
  const first = w.dataset.focus ? $(w.dataset.focus, w) : $(".wbody button, .wbody input, .wbody textarea", w);
  (first || $(".wclose", w)).focus();
}
function closeWin(w) {
  if (w.hidden) return;
  w.hidden = true; w.classList.remove("active");
  const b = $(`button[data-win="${w.id}"]`, taskList); if (b) b.parentElement.remove();
  A.play("close");
  announce(winTitle(w).replace(/^\S+\s/, "") + " window closed.");
  const back = openers[w.id] || icons[0];
  back.focus();
}
$$(".win").forEach(w => {
  $(".wclose", w).addEventListener("click", () => closeWin(w));
  w.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); closeWin(w); } });
  w.addEventListener("focusin", () => { if (!w.classList.contains("active")) activate(w); });
  w.addEventListener("pointerdown", () => { if (!w.classList.contains("active")) activate(w); });
  // keyboard move
  const mv = $(".wmove", w);
  mv.addEventListener("keydown", e => {
    const step = e.shiftKey ? 60 : 12, d = {ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step]}[e.key];
    if (!d) return; e.preventDefault();
    place(w, +w.dataset.x + d[0], +w.dataset.y + d[1]);
  });
  mv.addEventListener("click", () => announce("Use the arrow keys to move the window. Hold Shift for bigger steps."));
  // pointer drag
  const tb = $(".titlebar", w);
  tb.addEventListener("pointerdown", e => {
    if (small() || e.target.closest(".wclose")) return;
    const sx = e.clientX, sy = e.clientY, ox = +w.dataset.x, oy = +w.dataset.y;
    tb.setPointerCapture(e.pointerId); tb.style.cursor = "grabbing";
    const move = ev => place(w, ox + ev.clientX - sx, oy + ev.clientY - sy);
    const up = () => { tb.removeEventListener("pointermove", move); tb.removeEventListener("pointerup", up); tb.removeEventListener("pointercancel", up); tb.style.cursor = ""; };
    tb.addEventListener("pointermove", move); tb.addEventListener("pointerup", up); tb.addEventListener("pointercancel", up);
  });
});
$(".sd-no").addEventListener("click", () => closeWin($("#win-shutdown")));
window.addEventListener("resize", () => { if (!small()) $$(".win:not([hidden])").forEach(w => place(w, +w.dataset.x, +w.dataset.y)); });

/* ================= Soundscape ================= */
const savedMix = store.get("mix", {});
$$(".chan input[data-ch]").forEach(inp => {
  const ch = inp.dataset.ch, out = document.getElementById("o-" + ch);
  const name = inp.labels[0].textContent.trim();
  const update = (save = true) => {
    const v = +inp.value; out.textContent = v + "%";
    inp.setAttribute("aria-valuetext", v === 0 ? "off" : v + " percent");
    A.setLevel(ch, v); if (save) { savedMix[ch] = v; store.set("mix", savedMix); }
  };
  if (savedMix[ch] != null) inp.value = savedMix[ch];
  inp.addEventListener("input", () => { A.init(); update(); });
  update(false);
});
/* Master volume (0–150 %, remembered) */
const masterInp = $("#v-master"), masterOut = $("#o-master");
const renderMaster = () => {
  const v = +masterInp.value; masterOut.textContent = v + "%";
  masterInp.setAttribute("aria-valuetext", v === 0 ? "silent" : v + " percent");
};
masterInp.value = A.volume; renderMaster();
masterInp.addEventListener("input", () => { A.init(); A.setVolume(+masterInp.value); renderMaster(); });
const presets = { storm:{rain:70, fan:25, whir:45, crick:0}, summer:{rain:0, fan:30, whir:0, crick:55}, lab:{rain:20, fan:40, whir:60, crick:10}, off:{rain:0, fan:0, whir:0, crick:0} };
$$("[data-preset]").forEach(b => b.addEventListener("click", () => {
  A.init(); A.play("click");
  const p = presets[b.dataset.preset];
  Object.entries(p).forEach(([ch, v]) => { const inp = $(`input[data-ch="${ch}"]`); inp.value = v; inp.dispatchEvent(new Event("input")); });
  announce(b.dataset.preset === "off" ? "All sounds off." : b.textContent.replace(/^\S+\s/, "") + " preset: " + Object.entries(p).filter(([,v]) => v).map(([k,v]) => ({rain:"rain",fan:"fan hum",whir:"computer whir",crick:"crickets"})[k] + " " + v + "%").join(", ") + ".");
}));

/* ================= Mute + generic click sounds ================= */
const muteBtn = $("#mute");
function renderMute() { muteBtn.setAttribute("aria-pressed", String(A.muted)); muteBtn.firstElementChild.textContent = A.muted ? "🔇" : "🔊"; muteBtn.title = A.muted ? "Sound is muted" : "Mute all sound"; }
renderMute();
muteBtn.addEventListener("click", () => { A.setMuted(!A.muted); renderMute(); if (!A.muted) A.play("click"); announce(A.muted ? "All sound muted." : "Sound on."); });
document.addEventListener("mousedown", e => {
  if (performance.now() < swallowClicksUntil && !e.target.closest("#stars")) e.preventDefault();
}, true);
document.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b || b === muteBtn) return;
  if (b.matches(".wclose, [data-preset], #sheep-btn, #boot-btn, #sd-yes, .icon, .tasks button, #stars")) return;
  A.play("click");
});

/* ================= Sheep.exe ================= */
let sheep = store.get("sheep", 0);
const sheepCount = $("#sheep-count"), sheepMsg = $("#sheep-msg"), sprite = $("#sheep-sprite");
const sheepLog = $("#sheep-log"), sheepLive = [$("#sheep-live-a"), $("#sheep-live-b")];
const LOG_MAX = 6;
const phrases = [
  "jumped the fence",
  "cleared it with style",
  "tiptoed over the fence",
  "hopped over in perfect silence",
  "did a little spin mid-air. Showing off",
  "tripped, got up, pretended nothing happened",
  "said baa in a classic system voice",
  "jumped wearing tiny noise-cancelling headphones",
  "brought you a warm glass of milk",
  "found the new ramp and rolled over",
  "jumped, then synced locally. No cloud needed",
  "floated over like a little cloud",
  "whispered you've got this{name}",
  "started a group chat with the other sheep. It's on mute",
  "stopped to stretch first. Safety",
  "jumped in slow motion, very dramatic",
  "wore pajamas for the occasion",
  "yawned halfway over. Contagious",
  "cleared the fence and took a bow",
  "brought a tiny pillow, just in case",
  "landed softly on a pile of laundry",
  "paused to look at the moon, then jumped",
  "hummed a lullaby on the way over",
  "jumped and forgot why. Classic 3 AM",
  "counted you back, to be fair",
  "politely asked if you're sleepy yet",
  "rebooted mid-jump. Back online",
  "jumped over the fence and a small puddle",
  "left a note: sleep well{name}",
  "jumped in fuzzy slippers",
  "cleared the fence on the second try. Growth",
  "flopped over like a beanbag",
  "brought snacks for the sheep union",
  "did a quiet little moonwalk over",
  "jumped and set an alarm for noon",
  "wrapped itself in a blanket burrito, then rolled over",
  "turned the brightness down for you",
  "jumped over, then tucked in the fence",
  "read the fence a bedtime story first",
  "drifted over like it had nowhere to be",
  "hopped over with a cup of chamomile",
  "wanted to say the stars look nice tonight",
  "jumped and whispered, almost there",
  "practiced its jump all day for this",
  "tiptoed so the crickets wouldn't wake",
  "jumped over the fence and a sleeping cat",
  "made it over and immediately napped",
  "cleared the fence with zero lag",
  "jumped in airplane mode",
  "carried a tiny night light",
  "jumped and did a small, sleepy wave",
  "slid under the fence instead. Creative",
  "jumped while softly saying goodnight",
  "brought the fluffiest wool in the flock",
  "hopped over and dimmed the stars a little",
  "took the scenic route over",
  "jumped, then closed 47 browser tabs",
  "cleared it like a pro gymnast. 9.8",
  "gave the fence a gentle high five",
  "jumped over and fluffed your pillow",
  "floated across on a dream",
  "hopped over in a cozy sweater",
  "jumped to the rhythm of the rain",
  "jumped and said the night is on your side{name}"
];
const milestones = { 1:"The first sheep. A historic moment.", 10:"10 sheep! The flock is warming up.", 25:"25 sheep. Your eyelids feel slightly heavier?", 50:"50 sheep! The sheep union has requested snacks.", 100:"100 sheep! Achievement unlocked: Shepherd of the Night.", 200:"200 sheep. At this point they're counting you.", 404:"Sheep 404 not found. It went to sleep. You could too.", 500:"500 sheep. Okay, legend. Bed. Now." };
const tens = ["{n} sheep! The flock keeps growing.", "{n} sheep. Slow breath in, slow breath out.", "{n} sheep and counting. The fence is getting sleepy too.", "{n} sheep! Nice rhythm.", "{n} sheep. The moon says hi.", "{n} sheep. Your pillow is getting jealous.", "{n} sheep. The crickets are impressed.", "{n} sheep! A round number. The flock cheers quietly."];
// Shuffle bag: every line is used once before any line comes back, and never the same line twice in a row.
let bag = [], lastPhrase = -1, liveTurn = 0;
function nextPhrase() {
  if (!bag.length) {
    bag = phrases.map((_, i) => i);
    for (let k = bag.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [bag[k], bag[j]] = [bag[j], bag[k]]; }
    if (bag.length > 1 && bag[bag.length - 1] === lastPhrase) { const j = Math.floor(Math.random() * (bag.length - 1)); [bag[bag.length - 1], bag[j]] = [bag[j], bag[bag.length - 1]]; }
  }
  return bag.pop();
}
function sheepLine(n) {
  const i = nextPhrase();
  lastPhrase = i;
  const num = n.toLocaleString();
  let line = "Sheep " + num + " " + phrases[i].replace("{name}", userName ? ", " + userName : "") + ".";
  const m = milestones[n] || (n % 10 === 0 ? tens[(n / 10) % tens.length].replace("{n}", num) : "");
  return { line, milestone: m };
}
function sheepAnnounce(text) {
  // Two polite regions, used in turn: the new text always lands in a freshly emptied region, so every count is read.
  const next = sheepLive[liveTurn % 2], other = sheepLive[(liveTurn + 1) % 2]; liveTurn++;
  other.textContent = ""; next.textContent = "";
  setTimeout(() => { next.textContent = text; }, 30);
}
function renderSheep() { sheepCount.textContent = sheep.toLocaleString(); }
renderSheep();
$("#sheep-btn").addEventListener("click", () => {
  A.init(); sheep++; store.set("sheep", sheep); renderSheep(); A.play("baa");
  const { line, milestone } = sheepLine(sheep);
  const li = document.createElement("li");
  const main = document.createElement("span"); main.textContent = line;
  const icon = document.createElement("span"); icon.setAttribute("aria-hidden", "true"); icon.textContent = milestone ? " 🎉" : " 🐑";
  li.append(main, icon);
  if (milestone) { const ms = document.createElement("strong"); ms.className = "milestone"; ms.textContent = " " + milestone; li.append(ms); li.classList.add("is-milestone"); }
  sheepLog.prepend(li);
  while (sheepLog.children.length > LOG_MAX) sheepLog.lastElementChild.remove();
  sheepMsg.hidden = true;
  sheepAnnounce(line + (milestone ? " " + milestone : ""));
  if (!calm()) { sprite.classList.remove("jump"); void sprite.offsetWidth; sprite.classList.add("jump"); }
});
$("#sheep-reset").addEventListener("click", () => {
  sheep = 0; store.set("sheep", 0); renderSheep(); sheepLog.textContent = ""; sheepMsg.hidden = false;
  sheepMsg.textContent = "The flock has been released back into the wild. Counter at zero.";
  announce("Sheep counter reset to zero.");
});

/* ================= 4am Thoughts (local-first) ================= */
const notes = $("#notes"), notesStatus = $("#notes-status");
notes.value = store.get("notes", "");
let saveT;
notes.addEventListener("input", () => {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    store.set("notes", notes.value);
    const t = new Date().toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
    notesStatus.textContent = `Saved locally at ${t} · ${notes.value.length} characters · nothing leaves this device`;
  }, 400);
});
$("#notes-dl").addEventListener("click", () => {
  const blob = new Blob([notes.value], {type:"text/plain"}), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "4am-thoughts.txt"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  announce("Downloaded 4am-thoughts.txt.");
});
$("#notes-clear").addEventListener("click", () => {
  if (!notes.value) { announce("Already empty."); return; }
  A.play("ding");
  if (confirm("Clear your 4am thoughts? This can't be undone.")) { notes.value = ""; store.set("notes", ""); notesStatus.textContent = "Cleared. Fresh page."; announce("Notes cleared."); }
  notes.focus();
});

/* ================= Starfield screensaver ================= */
const stars = $("#stars"), cv = $("#stars-canvas");
let starRAF = null, starReturn = null;
function startStars(opener) {
  starReturn = opener; stars.hidden = false; stars.focus();
  A.play("open");
  const ctx = cv.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
  const size = () => { cv.width = innerWidth*dpr; cv.height = innerHeight*dpr; };
  size(); window.addEventListener("resize", size);
  const N = 420, pts = Array.from({length:N}, () => ({x:(Math.random()*2-1), y:(Math.random()*2-1), z:Math.random()}));
  const still = calm();
  const draw = () => {
    const w = cv.width, h = cv.height, cx = w/2, cy = h/2;
    ctx.fillStyle = still ? "#000" : "rgba(0,0,0,0.35)"; ctx.fillRect(0,0,w,h);
    for (const p of pts) {
      if (!still) { p.z -= 0.0035; if (p.z <= 0.01) { p.x = Math.random()*2-1; p.y = Math.random()*2-1; p.z = 1; } }
      const k = still ? 1 : 1/p.z, sx = still ? (p.x*0.5+0.5)*w : cx + p.x*cx*k*0.35, sy = still ? (p.y*0.5+0.5)*h : cy + p.y*cy*k*0.35;
      if (sx < 0 || sx > w || sy < 0 || sy > h) continue;
      const r = still ? 0.6 + p.z*1.4 : (1 - p.z) * 2.6 * dpr, a = still ? 0.4 + p.z*0.6 : 1 - p.z;
      ctx.fillStyle = `rgba(${220 + (p.x*30|0)},${215},255,${a})`; ctx.beginPath(); ctx.arc(sx, sy, r*dpr*0.8, 0, 6.283); ctx.fill();
    }
    if (!still) starRAF = requestAnimationFrame(draw);
  };
  ctx.fillStyle = "#000"; ctx.fillRect(0,0,cv.width,cv.height); draw();
  stars._size = size;
  announce("Starfield screensaver running. Tap, double tap or press any key to wake.");
  starsArmed = false; setTimeout(() => { starsArmed = true; }, 250);
}
/* The whole overlay is one native <button>: a sighted tap, a VoiceOver/TalkBack double tap (a click on the
   focused button), a mouse click, pointerup or any key all close it. */
let starsArmed = false, swallowClicksUntil = 0;
function stopStars(e) {
  if (stars.hidden || !starsArmed) return;
  if (e) e.preventDefault();
  starsArmed = false;
  // the touch/key that closed it must not also press whatever is underneath (ghost click / Space keyup)
  swallowClicksUntil = performance.now() + 450;
  cancelAnimationFrame(starRAF); window.removeEventListener("resize", stars._size);
  stars.hidden = true; A.play("close"); announce("Screensaver closed.");
  const back = starReturn || $('[data-action="stars"]') || icons[0];
  back.focus(); setTimeout(() => { if (document.activeElement !== back && stars.hidden) back.focus(); }, 60);
}
// Stop the touch's compatibility mousedown from landing on whatever is under the finger once the overlay hides
// (that would steal focus from the Starfield icon on iOS/Android). The click itself still fires for VoiceOver.
stars.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") e.preventDefault(); });
stars.addEventListener("click", stopStars);
stars.addEventListener("pointerup", stopStars);
stars.addEventListener("keydown", stopStars);
document.addEventListener("click", e => {
  if (performance.now() < swallowClicksUntil && !e.target.closest("#stars")) { e.preventDefault(); e.stopPropagation(); }
}, true);

/* ================= Shut down ================= */
const night = $("#night"), nightSound = $("#night-sound");
$("#sd-yes").addEventListener("click", () => {
  A.init();
  const keep = $("#sd-keep").checked && A.ambActive();
  A.play("goodnight");
  if (!keep) A.fadeAmbience(3);
  closeWin($("#win-shutdown"));
  night.hidden = false; void night.offsetWidth; night.classList.add("show");
  if (keep) { nightSound.innerHTML = ""; const b = document.createElement("button"); b.className = "btn"; b.type = "button"; b.textContent = "🔇 Stop the soundscape"; b.addEventListener("click", () => { A.fadeAmbience(2); nightSound.textContent = "Soundscape fading out. Sweet dreams."; announce("Soundscape fading out."); $("#reboot").focus(); }); nightSound.append("The soundscape keeps playing softly. ", b); }
  else nightSound.textContent = "";
  setTimeout(() => { $("#os").hidden = true; }, calm() ? 0 : 1200);
  night.focus();
  announce(named("Goodnight, {name}.", "Goodnight.") + " It's now safe to turn off your brain.");
});
$("#reboot").addEventListener("click", () => {
  night.classList.remove("show"); night.hidden = true; $("#os").hidden = false;
  A.restoreAmbience(); A.play("boot"); icons[0].focus(); announce("Insomnia OS restarted.");
});

/* ================= Clock ================= */
const clock = $("#clock");
const tickClock = () => { clock.textContent = new Date().toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}); };
tickClock(); setInterval(tickClock, 10000);
window.__sheepPhrases = phrases.length;
window.__psAudio = { state: () => A.ctx && A.ctx.state, scheduler: () => !!A.scheduler, idleNow: () => { A.lastUse = 0; A.sleepIfIdle(); } };
document.addEventListener("visibilitychange", () => { if (document.hidden) A.sleepIfIdle(true); else if (A.ctx && A.ambActive()) A.wake(); });
})();
