/* NexOS Web: a browser twin of the NexOS operating system. MIT licensed. Network: only its own files (beat styles, apps, and the status command's site check). */
(() => {
"use strict";
const VERSION = "0.6.1", BUILD_DATE = "October 8, 2026";
const $ = (s) => document.querySelector(s);
const form = $("#cmd-form"), appForm = $("#app-form");
let logEl = $("#log"), input = $("#cmd"), choicesEl = $("#choices");
const modeNameEl = $("#mode-name"), promptEl = $("#prompt"), labelText = $("#cmd-label-text");
const appH = $("#app-h"), appInputLabel = $("#app-input-label"), launcherEl = $("#launcher");
// Two places an app can run: the Terminal (command line) and the app window (buttons first).
// Each keeps its own output, buttons, text field and current app.
const CTX = {
  terminal: { name: "terminal", log: $("#log"), choices: $("#choices"), input: $("#cmd"), mode: null, lastKey: "" },
  app: { name: "app", log: $("#app-log"), choices: $("#app-choices"), input: $("#app-input"), mode: null, lastKey: "", appId: null },
};
let cur = CTX.terminal;
const bootTime = Date.now();

/* ---------- storage ---------- */
const K = (k) => "looscid:" + k;
const load = (k, d) => { try { const v = localStorage.getItem(K(k)); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(K(k), JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } };

/* ---------- output ---------- */
const MAX_ENTRIES = 150;
let pending = null; // lines collected for the current command
function line(text, cls) { (pending || (pending = [])).push([String(text), cls || ""]); }
function flush(echo) {
  if (!pending && !echo) return;
  const div = document.createElement("div");
  div.className = "entry new";
  if (echo !== undefined && echo !== null) {
    const e = document.createElement("p"); e.className = "echo"; e.setAttribute("aria-hidden", "true");
    e.textContent = promptText() + " " + echo; div.appendChild(e);
  }
  for (const [t, c] of (pending || [])) { const p = document.createElement("p"); if (c) p.className = c; p.textContent = t; div.appendChild(p); }
  pending = null;
  logEl.appendChild(div);
  while (logEl.children.length > MAX_ENTRIES) logEl.removeChild(logEl.firstElementChild);
  logEl.scrollTop = logEl.scrollHeight;
}
// standalone announcement (timers etc.); when its window is closed, the polite status line carries it instead
function say(text, cls) { line(text, cls); flush(); if (logEl.closest("[hidden]")) { const s = document.querySelector("#status"); if (s) { s.textContent = ""; setTimeout(() => { s.textContent = text; }, 30); } } }

/* ---------- sound (Web Audio, created on first gesture only) ---------- */
let ac = null, master = null, sfx = null, amb = null;
let volume = load("volume", 100), muted = load("muted", false);
function ensureAudio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    ac = new AC();
    ({ master, sfx, amb } = makeChain(ac));
    applyVolume();
    unlockIOS();
  }
  if (ac.state === "suspended") ac.resume().catch(() => {});
  noteSound();
  return ac;
}
// Battery: the audio engine sleeps after 20 s of silence and while the tab is hidden (unless a soundscape or the beat is playing).
var lastSoundAt = 0, idleSleep = null;
function audioBusy() { try { return !!ambient || (typeof beatPlaying === "function" && beatPlaying()); } catch (e) { return false; } }
function noteSound() { lastSoundAt = Date.now(); clearTimeout(idleSleep); idleSleep = setTimeout(sleepIfIdle, 20000); }
function sleepIfIdle() { if (ac && ac.state === "running" && !audioBusy() && Date.now() - lastSoundAt >= 19000) ac.suspend().catch(() => {}); else if (ac && audioBusy()) noteSound(); }
window.__psAudio = { state: () => ac && ac.state, idleNow: () => { lastSoundAt = 0; sleepIfIdle(); } };
document.addEventListener("visibilitychange", () => { if (!ac) return; if (document.hidden) { if (!audioBusy()) ac.suspend().catch(() => {}); } else if (audioBusy() && ac.state === "suspended") ac.resume().catch(() => {}); });
// master -> limiter -> out; every sound (buttons, keys, chimes, soundscapes) goes through it.
function makeChain(c) {
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -8; limiter.knee.value = 0; limiter.ratio.value = 20;
  limiter.attack.value = 0.002; limiter.release.value = 0.12;
  const out = c.createGain(); out.gain.value = 0.9;
  const m = c.createGain(), s = c.createGain(), a = c.createGain(); s.gain.value = 1.0; a.gain.value = 0.9;
  s.connect(m); a.connect(m); m.connect(limiter); limiter.connect(out); out.connect(c.destination);
  return { master: m, sfx: s, amb: a };
}
// iOS: a silent media element moves Web Audio to the playback category, so the ring/silent switch doesn't mute it.
function unlockIOS() {
  try {
    const sr = 8000, n = 800, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
    const a = new Audio(URL.createObjectURL(new Blob([buf], { type: "audio/wav" })));
    a.setAttribute("playsinline", ""); a.volume = 0.01;
    const p = a.play(); if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
const gainFor = (v) => (v / 100) * 1.6; // 100% is already loud; the limiter keeps the top clean
function applyVolume(delay) {
  if (!master) return;
  const g = muted ? 0 : gainFor(volume);
  master.gain.setTargetAtTime(g, ac.currentTime + (delay || 0), 0.02);
}
let tBase = null, voices = 0; // tBase is only set while rendering offline; voices counts every sound actually started
const now = () => (tBase == null ? ac.currentTime : tBase);
function tone(freq, at, dur, o = {}) {
  if (!ac || muted) return;
  voices++;
  const t = now() + (at || 0);
  const osc = ac.createOscillator(), g = ac.createGain();
  osc.type = o.type || "square"; osc.frequency.setValueAtTime(freq, t);
  if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
  const peak = o.gain == null ? 0.32 : o.gain, a = o.attack || 0.006, r = o.release || 0.06;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.setValueAtTime(peak, t + Math.max(a, dur - r)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(o.bus || sfx); osc.start(t); osc.stop(t + dur + 0.02);
}
const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // midi -> Hz
const SFX = {
  boot()      { [60, 64, 67, 72].forEach((m, i) => tone(NOTE(m), i * 0.09, 0.22, { type: "triangle", gain: 0.4 })); tone(NOTE(84), 0.36, 0.5, { type: "sine", gain: 0.25 }); },
  key()       { tone(1800, 0, 0.018, { type: "square", gain: 0.06 }); },
  install()   { [72, 76, 79, 84].forEach((m, i) => tone(NOTE(m), i * 0.085, 0.2, { type: "square", gain: 0.22 })); tone(NOTE(88), 0.34, 0.55, { type: "triangle", gain: 0.38 }); },
  uninstall() { tone(NOTE(76), 0, 0.2, { type: "square", gain: 0.24 }); tone(NOTE(67), 0.22, 0.34, { type: "square", gain: 0.24, release: 0.15 }); }, // falling pair
  error()     { tone(110, 0, 0.13, { type: "square", gain: 0.3 }); tone(110, 0.19, 0.13, { type: "square", gain: 0.3 }); }, // low double buzz
  update()    { [67, 72, 79].forEach((m, i) => tone(NOTE(m), i * 0.07, 0.15, { type: "square", gain: 0.2 })); },
  alarm()     { for (let r = 0; r < 4; r++) [84, 88, 91].forEach((m, i) => tone(NOTE(m), r * 0.5 + i * 0.09, 0.12, { type: "square", gain: 0.26 })); },
  win()       { [72, 76, 79, 84, 79, 84].forEach((m, i) => tone(NOTE(m), i * 0.1, i === 5 ? 0.5 : 0.12, { type: "square", gain: 0.24 })); },
  sheep()     { tone(520, 0, 0.09, { type: "triangle", gain: 0.3, slide: 780 }); tone(660, 0.1, 0.16, { type: "triangle", gain: 0.24, slide: 440 }); },
  blip()      { tone(880, 0, 0.06, { type: "square", gain: 0.14 }); },
  note(m)     { tone(NOTE(m), 0, 0.42, { type: "triangle", gain: 0.42, release: 0.25 }); tone(NOTE(m + 12), 0, 0.25, { type: "sine", gain: 0.08 }); },
};
const sfxLog = []; // which sound last played (system sounds by name, button and key sounds as "ui:<id>"), for tests
const logSfx = (k) => { sfxLog.push(k); if (sfxLog.length > 300) sfxLog.shift(); };
for (const k of Object.keys(SFX)) { const f = SFX[k]; SFX[k] = (...a) => { logSfx(k); return f(...a); }; }

/* ---------- button and key sounds: one family, every button its own voice ---------- */
const noiseCache = new WeakMap();
function whiteNoise() { let b = noiseCache.get(ac); if (!b) { const n = Math.floor(ac.sampleRate * 0.5); b = ac.createBuffer(1, n, ac.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; noiseCache.set(ac, b); } return b; }
// A short burst of filtered noise: the "click" in key clicks, page flicks and whooshes.
function click(freq, at, dur, gain, o = {}) {
  if (!ac || muted) return;
  voices++;
  const t = now() + (at || 0), s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = whiteNoise(); f.type = "bandpass"; f.Q.value = o.q || 1.4; f.frequency.setValueAtTime(freq, t);
  if (o.slide) f.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(sfx); s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.02);
}
const SCALE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76]; // 0..9 on a major scale
const APP_MOTIF = { // each app's own two- or three-note signature, played by its button
  notes: [[76, 81], "triangle"], calc: [[84, 84], "square"], clock: [[88, 83], "sine"], sysinfo: [[72, 79], "square"],
  insomnia: [[79, 74], "sine", 0.14], easyconvert: [[67, 74, 79], "square", 0.06], memes: [[84, 79, 88], "triangle", 0.09], hello: [[72, 76], "triangle"], piano: [[72, 76, 79], "triangle"], guess: [[81, 76, 81], "square"], morse: [[93, 93, 93], "sine"],
};
const UI = {
  // typing (the "sound keys" setting turns these off; Enter's chime stays)
  key()       { click(2600 + Math.random() * 900, 0, 0.014, 0.16, { q: 2 }); },
  space()     { click(1100, 0, 0.022, 0.2, { q: 1.6 }); },
  backspace() { click(1500, 0, 0.012, 0.14); tone(560, 0, 0.035, { type: "triangle", gain: 0.12, attack: 0.002, release: 0.02, slide: 380 }); },
  tab()       { tone(2400, 0, 0.014, { type: "sine", gain: 0.07, attack: 0.002, release: 0.01 }); },
  arrow()     { tone(1800, 0, 0.014, { type: "sine", gain: 0.06, attack: 0.002, release: 0.01 }); },
  calcdigit(d){ click(2800, 0, 0.012, 0.12, { q: 2 }); tone(NOTE(SCALE[d] + 24), 0, 0.03, { type: "sine", gain: 0.08, attack: 0.002, release: 0.02 }); },
  calcop()    { click(1700, 0, 0.012, 0.14); tone(NOTE(67), 0, 0.04, { type: "square", gain: 0.06, attack: 0.002, release: 0.02 }); tone(NOTE(74), 0.035, 0.03, { type: "square", gain: 0.05, attack: 0.002, release: 0.02 }); },
  enter()     { click(800, 0, 0.03, 0.22, { slide: 300 }); tone(NOTE(84), 0.03, 0.18, { type: "sine", gain: 0.24, release: 0.14 }); tone(NOTE(96), 0.03, 0.1, { type: "sine", gain: 0.06 }); }, // carriage return + bell
  // buttons
  run()       { tone(NOTE(81), 0, 0.045, { type: "square", gain: 0.11 }); tone(NOTE(88), 0.045, 0.07, { type: "square", gain: 0.11 }); },
  nav()       { click(2400, 0, 0.01, 0.12); tone(1200, 0, 0.025, { type: "triangle", gain: 0.16, attack: 0.002, release: 0.02 }); },
  confirm()   { tone(NOTE(86), 0, 0.07, { type: "square", gain: 0.12 }); tone(NOTE(98), 0, 0.05, { type: "sine", gain: 0.05 }); },
  back()      { tone(190, 0, 0.1, { type: "sine", gain: 0.42, attack: 0.002, release: 0.07, slide: 85 }); click(420, 0, 0.025, 0.25); },
  on()        { tone(NOTE(72), 0, 0.05, { type: "triangle", gain: 0.22 }); tone(NOTE(79), 0.06, 0.08, { type: "triangle", gain: 0.22 }); },
  off()       { tone(NOTE(79), 0, 0.05, { type: "triangle", gain: 0.22 }); tone(NOTE(72), 0.06, 0.08, { type: "triangle", gain: 0.22 }); },
  up()        { tone(480, 0, 0.09, { type: "triangle", gain: 0.2, slide: 960 }); },
  down()      { tone(960, 0, 0.09, { type: "triangle", gain: 0.2, slide: 480 }); },
  danger()    { tone(NOTE(79), 0, 0.16, { type: "square", gain: 0.12, slide: NOTE(64) }); tone(NOTE(67), 0.17, 0.08, { type: "square", gain: 0.1 }); },
  help()      { tone(NOTE(76), 0, 0.06, { type: "sine", gain: 0.24 }); tone(NOTE(83), 0.07, 0.1, { type: "sine", gain: 0.24, slide: NOTE(86) }); },
  store()     { click(3000, 0, 0.012, 0.15); tone(NOTE(88), 0, 0.05, { type: "square", gain: 0.1 }); tone(NOTE(93), 0.05, 0.14, { type: "triangle", gain: 0.26, release: 0.1 }); },
  apps()      { tone(1000, 0, 0.02, { type: "triangle", gain: 0.16 }); tone(1340, 0.045, 0.02, { type: "triangle", gain: 0.16 }); tone(1680, 0.09, 0.02, { type: "triangle", gain: 0.16 }); },
  files()     { click(1800, 0, 0.06, 0.2, { slide: 3200 }); tone(700, 0.02, 0.03, { type: "triangle", gain: 0.1 }); },
  terminal()  { click(5200, 0, 0.02, 0.12, { q: 2 }); [60, 67, 72].forEach((m, i) => tone(NOTE(m), 0.01 + i * 0.05, 0.04, { type: "square", gain: 0.1, attack: 0.002, release: 0.02 })); tone(NOTE(84), 0.17, 0.05, { type: "square", gain: 0.07 }); }, // CRT power-on blip, then a cursor beep
  aboutapp()  { tone(NOTE(72), 0, 0.06, { type: "square", gain: 0.1 }); tone(NOTE(79), 0.07, 0.3, { type: "sine", gain: 0.22, release: 0.24 }); tone(NOTE(91), 0.07, 0.18, { type: "sine", gain: 0.06 }); }, // the old System Info blip into the About bell
  settings()  { click(2000, 0, 0.012, 0.22, { q: 3 }); click(2600, 0.05, 0.012, 0.2, { q: 3 }); tone(NOTE(76), 0.05, 0.05, { type: "triangle", gain: 0.14 }); }, // two dial clicks
  home()      { tone(NOTE(84), 0, 0.05, { type: "triangle", gain: 0.18 }); tone(NOTE(79), 0.05, 0.05, { type: "triangle", gain: 0.18 }); tone(NOTE(72), 0.1, 0.09, { type: "triangle", gain: 0.2, release: 0.07 }); }, // three steps down to Home
  about()     { tone(NOTE(79), 0, 0.28, { type: "sine", gain: 0.22, release: 0.22 }); tone(NOTE(91), 0, 0.16, { type: "sine", gain: 0.06 }); },
  clear()     { click(600, 0, 0.18, 0.22, { slide: 5000, q: 0.8 }); },
  fill()      { tone(1500, 0, 0.045, { type: "sine", gain: 0.12, slide: 2300 }); },
  page()      { click(3400, 0, 0.05, 0.18, { slide: 1200 }); },
  compose()   { click(4200, 0, 0.07, 0.1, { q: 3 }); tone(NOTE(84), 0, 0.06, { type: "sine", gain: 0.1, slide: NOTE(88) }); },
  refresh()   { tone(700, 0, 0.05, { type: "triangle", gain: 0.14, slide: 1400 }); tone(700, 0.06, 0.05, { type: "triangle", gain: 0.14, slide: 1400 }); },
  newgame()   { [76, 72, 79, 84].forEach((m, i) => tone(NOTE(m), i * 0.035, 0.03, { type: "square", gain: 0.09 })); },
  ticktock()  { click(3200, 0, 0.012, 0.3, { q: 4 }); click(2100, 0.17, 0.012, 0.3, { q: 4 }); },
  timerset()  { for (let i = 0; i < 4; i++) click(1600 + i * 400, i * 0.04, 0.012, 0.26, { q: 3 }); },
  swstart()   { tone(NOTE(88), 0, 0.07, { type: "square", gain: 0.12 }); },
  swstop()    { tone(NOTE(88), 0, 0.045, { type: "square", gain: 0.12 }); tone(NOTE(88), 0.08, 0.045, { type: "square", gain: 0.12 }); },
  swreset()   { tone(NOTE(88), 0, 0.12, { type: "square", gain: 0.1, slide: NOTE(76) }); },
  lap()       { click(2200, 0, 0.014, 0.34, { q: 3 }); tone(NOTE(93), 0, 0.03, { type: "square", gain: 0.08 }); },
  equals()    { tone(NOTE(79), 0, 0.06, { type: "triangle", gain: 0.24 }); tone(NOTE(84), 0.065, 0.13, { type: "triangle", gain: 0.24, release: 0.08 }); },
  higher()    { tone(880, 0, 0.08, { type: "square", gain: 0.14, slide: 1320 }); },
  lower()     { tone(880, 0, 0.08, { type: "square", gain: 0.14, slide: 587 }); },
  num(n)      { const m = SCALE[n % 10] + 12 + 12 * Math.floor(n / 10); click(2600, 0, 0.008, 0.1); tone(NOTE(m), 0, 0.06, { type: "triangle", gain: 0.26, attack: 0.003, release: 0.04 }); },
  pick(v)     { tone(300 * Math.pow(5, (Math.min(100, Math.max(1, v)) - 1) / 99), 0, 0.06, { type: "square", gain: 0.11 }); }, // guess buttons: low numbers sound low
  read(n)     { click(3400, 0, 0.05, 0.18, { slide: 1200 }); tone(NOTE(SCALE[(n - 1) % 10] + 12), 0.03, 0.05, { type: "sine", gain: 0.14 }); },
  app(id)     { const [ns, type, gap] = APP_MOTIF[id] || [[72, 79], "triangle"]; const g = gap || 0.07; ns.forEach((m, i) => tone(NOTE(m), i * g, i === ns.length - 1 ? 0.1 : g * 0.8, { type, gain: type === "square" ? 0.11 : 0.22 })); },
  vol(v)      { tone(300 + v * 6, 0, 0.06, { type: "sine", gain: 0.2 }); }, // pitch follows the slider; loudness follows the volume itself
};
const KEY_IDS = new Set(["key", "space", "backspace", "tab", "arrow", "calcdigit", "calcop"]);
let keySounds = load("key_sounds", true), lastKeyAt = 0;
// play(id, arg): every button and key sound goes through here, so each is logged by id and follows mute, volume and the limiter.
function play(id, arg) {
  if (KEY_IDS.has(id)) { if (!keySounds) return; const t = performance.now(); if (t - lastKeyAt < 15) return; lastKeyAt = t; }
  logSfx("ui:" + id + (arg !== undefined ? ":" + arg : ""));
  if (!ac || muted) return;
  try { UI[id](arg); } catch (e) {}
}
// Which sound a quick button makes, from its label and command.
function soundFor(label, cmd, isFill) {
  const l = label.toLowerCase(), c = (cmd || "").trim().toLowerCase();
  let m;
  if (isFill) return ["fill"];
  if (c === "q" || /^quit/.test(l) || l === "skip" || l === "back" || l === "cancel") return ["back"];
  if (c === "h" || c === "help") return ["help"];
  if ((m = label.match(/^(\d+)\.\s/))) {
    return ["num", +m[1]];
  }
  if ((m = label.match(/^Guess (\d+)$/))) return ["pick", +m[1]];
  if ((m = label.match(/^Read (\d+)$/))) return ["read", +m[1]];
  if (/^Read \S/.test(label)) return ["page"];
  if (c === "sysinfo" || c === "about" || c === "open sysinfo" || /^about this nexos$/.test(l) || /^open about this nexos$/.test(l)) return ["aboutapp"];
  if (c === "terminal") return ["terminal"];
  if (/^(uninstall|delete)\b/.test(l) || l === "cancel timer") return ["danger"];
  if ((m = label.match(/^Open (.+)$/))) { const a = catalog.find((x) => x.name === m[1]); return a ? ["app", a.id] : ["confirm"]; }
  if (/^(install|update)\b/.test(l) || c === "ans * 2" || c === "s" || c === "r" && mode && mode.label === "Piano") return ["confirm"];
  if (!mode) { const a = catalog.find((x) => x.id === c); if (a) return ["app", a.id]; }
  if (c === "sound on" || c === "sound off") return null; // the mute toggle plays its own up/down pair
  if (c === "+") return ["up"];
  if (c === "-") return ["down"];
  if (c === "store") return ["store"];
  if (c === "apps" || c === "installed") return ["apps"];
  if (c === "ls" || c === "files") return ["files"];
  if (c === "about") return ["about"];
  if (c === "clear") return ["clear"];
  if (/^timer /.test(c)) return ["timerset"];
  if (c === "n") return ["newgame"];
  if (c === "r") return ["refresh"];
  return ["nav"];
}
let booted = false;
function gesture() { ensureAudio(); if (!booted) { booted = true; SFX.boot(); } }

/* ambient soundscapes for Insomnia */
let ambient = null;
function noiseBuffer(kind) {
  const len = ac.sampleRate * 2, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
  return b;
}
function noiseSrc(kind, filters, gain) {
  const s = ac.createBufferSource(); s.buffer = noiseBuffer(kind); s.loop = true;
  let node = s;
  for (const [type, f, q] of filters) { const bq = ac.createBiquadFilter(); bq.type = type; bq.frequency.value = f; if (q) bq.Q.value = q; node.connect(bq); node = bq; }
  const g = ac.createGain(); g.gain.value = gain; node.connect(g); g.connect(amb); s.start();
  return { stop() { try { s.stop(); } catch (e) {} g.disconnect(); } };
}
function stopAmbient() { if (ambient) { ambient.stop(); ambient = null; } }
const AMBIENTS = {
  rain: { name: "Rain", start() {
    const n = noiseSrc("white", [["highpass", 500], ["lowpass", 4500]], 0.32);
    let alive = true;
    const drop = () => { if (!alive) return; if (!muted) tone(2000 + Math.random() * 3000, 0, 0.02, { type: "sine", gain: 0.05 + Math.random() * 0.08, bus: amb }); setTimeout(drop, 30 + Math.random() * 160); };
    drop(); return { stop() { alive = false; n.stop(); } };
  } },
  fan: { name: "Fan", start() {
    const n = noiseSrc("brown", [["lowpass", 500]], 0.7);
    const hum = ac.createOscillator(), hg = ac.createGain(); hum.type = "sine"; hum.frequency.value = 118; hg.gain.value = 0.035; hum.connect(hg); hg.connect(amb); hum.start();
    return { stop() { n.stop(); try { hum.stop(); } catch (e) {} } };
  } },
  crickets: { name: "Crickets", start() {
    const n = noiseSrc("brown", [["lowpass", 300]], 0.12); // soft night air
    let alive = true;
    const chirp = (f, pan) => { if (!alive) return; if (!muted) for (let i = 0; i < 3; i++) tone(f, i * 0.045, 0.03, { type: "sine", gain: 0.13, bus: amb, attack: 0.004, release: 0.012 }); setTimeout(() => chirp(f, pan), 700 + Math.random() * 900); };
    chirp(4400); setTimeout(() => chirp(3900), 350);
    return { stop() { alive = false; n.stop(); } };
  } },
  oldpc: { name: "Old PC", start() {
    const n = noiseSrc("white", [["bandpass", 900, 0.7]], 0.12);
    const hum = ac.createOscillator(), hf = ac.createBiquadFilter(), hg = ac.createGain();
    hum.type = "sawtooth"; hum.frequency.value = 60; hf.type = "lowpass"; hf.frequency.value = 240; hg.gain.value = 0.07;
    hum.connect(hf); hf.connect(hg); hg.connect(amb); hum.start();
    let alive = true;
    const seek = () => { if (!alive) return; if (!muted) { const k = 1 + Math.floor(Math.random() * 5); for (let i = 0; i < k; i++) tone(120 + Math.random() * 80, i * 0.05, 0.025, { type: "square", gain: 0.12, bus: amb }); } setTimeout(seek, 600 + Math.random() * 2600); };
    seek(); return { stop() { alive = false; n.stop(); try { hum.stop(); } catch (e) {} } };
  } },
  brahms: { name: "Brahms lullaby", start() {
    // [midi, beats]; 0 = rest
    const M = [[64,.5],[64,.5],[67,1.5],[64,.5],[64,.5],[67,1.5],[64,.5],[67,.5],[72,1],[71,1],[69,1],[69,1],[67,1],
      [62,.5],[64,.5],[65,1],[62,1],[62,.5],[64,.5],[65,1.5],[62,.5],[65,.5],[71,.5],[69,.5],[67,1],[71,1],[72,2],[0,1.5]];
    const beat = 0.62; let alive = true, i = 0;
    const step = () => { if (!alive) return; const [m, b] = M[i]; i = (i + 1) % M.length;
      if (m && !muted) { tone(NOTE(m), 0, b * beat * 0.95, { type: "triangle", gain: 0.3, bus: amb, attack: 0.03, release: Math.min(0.4, b * beat * 0.5) }); tone(NOTE(m - 12), 0, b * beat * 0.95, { type: "sine", gain: 0.12, bus: amb, attack: 0.05, release: 0.3 }); }
      setTimeout(step, b * beat * 1000); };
    step(); return { stop() { alive = false; } };
  } },
};
function startAmbient(id) { ensureAudio(); stopAmbient(); if (!ac) return false; ambient = AMBIENTS[id].start(); ambient.id = id; return true; }

/* ---------- file system ---------- */
const DEFAULT_FS = {
  "readme.txt": "Welcome to NexOS Web. Type help to see commands, or store to open the App Store.",
  "about.txt": "NexOS is a hobby operating system. Its kernel is written in Rust for 64-bit x86 PCs.",
  "keys.txt": "Shortcuts: Up and Down arrows recall commands. In every app, h is help and q quits.",
};
let fs = load("fs", null) || Object.assign({}, DEFAULT_FS);
const saveFs = () => save("fs", fs);

/* ---------- App Store catalog ---------- */
const CATALOG_REV = 6;
const DEFAULT_CATALOG = [
  { id: "notes",    name: "Notes",           version: "1.0", size: "12 KB", category: "Productivity", pre: true,  desc: "Write, read and delete short notes. Saved on this device." },
  { id: "calc",     name: "Calculator",      version: "1.0", size: "8 KB",  category: "Utilities",    pre: true,  desc: "Type a sum like 12 * (3 + 4) and hear the answer." },
  { id: "clock",    name: "Clock",           version: "1.0", size: "10 KB", category: "Utilities",    pre: true,  desc: "Time, a countdown timer with an alarm chime, and a stopwatch." },
  { id: "sysinfo",  name: "About this NexOS", version: "1.1", size: "6 KB", category: "System",      pre: true,  system: true, desc: "What NexOS is, its version, system info (browser, screen, memory, uptime, apps, sound) and credits. Part of the system.", notes: "System Info and About are now one app." },
  { id: "insomnia", name: "Insomnia OS",     version: "1.3", size: "70 KB", category: "Relax",        pre: true,  window: true, desc: "The full Insomnia OS, the same as its own site: a soundscape mixer, Sheep.exe, the 4am notepad, a starfield screensaver and Shut Down.", notes: "Now the full Insomnia OS, with over 60 sheep lines that never repeat until every one has been used." },
  { id: "hello",    name: "Hello",           version: "1.0", size: "2 KB",  category: "Developer",    pre: true,  desc: "Says hello. In the real NexOS it is the first program that runs in ring 3." },
  { id: "piano",    name: "Piano",           version: "1.0", size: "7 KB",  category: "Music",        pre: false, desc: "A keyboard piano. Keys 1 to 8 play a scale and each note is said by name. Plus and minus change octave, s plays Ode to Joy, r replays." },
  { id: "guess",    name: "Guess the Number", version: "1.0", size: "5 KB", category: "Games",        pre: false, desc: "I pick a number from 1 to 100. You guess, I say higher or lower." },
  { id: "morse",    name: "Morse Code",      version: "1.0", size: "6 KB",  category: "Learning",     pre: false, desc: "Type a word and hear it beeped in Morse code, with the dits and dahs spelled out." },
  { id: "easyconvert", name: "Easyconvert",  version: "1.0", size: "100 KB", category: "Utilities",   pre: true,  window: true, desc: "Convert text files to TXT, DOCX, JSON, HTML and more, right in your browser. Nothing is uploaded." },
  { id: "memes",    name: "Meme Projects",   version: "1.0", size: "60 KB", category: "Fun",          pre: true,  window: true, desc: "The Meme Projects chaos tool suite, the same as its own site." },
];
let catalog = load("catalog_rev", 0) === CATALOG_REV ? load("catalog", DEFAULT_CATALOG) : DEFAULT_CATALOG;
save("catalog", catalog); save("catalog_rev", CATALOG_REV);
let installed = load("installed", null);
if (!installed) { installed = {}; for (const a of catalog) if (a.pre) installed[a.id] = a.version; installed.insomnia = "1.2"; }
if (!load("mig4", false)) { if (!("hello" in installed)) installed.hello = "1.0"; save("mig4", true); }
if (!load("mig6", false)) { for (const id of ["easyconvert", "memes"]) if (!(id in installed)) installed[id] = "1.0"; save("mig6", true); }
const saveInstalled = () => save("installed", installed);
saveInstalled();
const appMeta = (id) => catalog.find((a) => a.id === id);
const isInstalled = (id) => Object.prototype.hasOwnProperty.call(installed, id);
const hasUpdate = (id) => isInstalled(id) && installed[id] !== appMeta(id).version;
const ALIASES = { calculator: "calc", timer: "clock", stopwatch: "clock", "keyboard": "piano", "keyboard piano": "piano", info: "sysinfo", "system": "sysinfo", "system info": "sysinfo", about: "sysinfo", "about this nexos": "sysinfo", sheep: "insomnia", "insomnia os": "insomnia", "easy convert": "easyconvert", convert: "easyconvert", converter: "easyconvert", meme: "memes", memeprojects: "memes", "meme projects": "memes", game: "guess", number: "guess" };
function findApp(word) {
  if (!word) return null;
  const w = word.toLowerCase().trim();
  if (/^\d+$/.test(w)) return catalog[+w - 1] || null;
  const id = ALIASES[w] || w;
  return appMeta(id) || catalog.find((a) => a.name.toLowerCase() === w) || catalog.find((a) => a.name.toLowerCase().startsWith(w)) || null;
}

/* ---------- user name (optional) ---------- */
let userName = load("name", "");
const named = () => load("asked_name", false);

/* ---------- modes ---------- */
let mode = null; // null = shell; otherwise an app object
function promptText() { return mode ? mode.prompt : "nexos>"; }
function setMode(m) {
  mode = m;
  if (cur === CTX.app) {
    const name = m ? m.label : (appMeta(CTX.app.appId) || { name: "App" }).name;
    appH.textContent = name; appInputLabel.textContent = "Type in " + name;
    return;
  }
  promptEl.textContent = promptText();
  labelText.textContent = m ? "Command, in " + m.label : "Command";
  modeNameEl.textContent = m ? m.label : "Shell";
}
let closeAfterRun = false, afterClose = null;
function quitApp(msg) {
  if (mode && mode.onQuit) mode.onQuit();
  setMode(null);
  if (cur === CTX.app) { closeAfterRun = true; return; } // quitting in the app window goes back to Home
  line(msg || "Back to the nexos shell.", "dimt");
}
function useCtx(c) {
  if (c === cur) return;
  cur.mode = mode; cur.lastKey = lastChoiceKey;
  cur = c; mode = c.mode; lastChoiceKey = c.lastKey;
  logEl = c.log; choicesEl = c.choices; input = c.input;
}
const STD = "h for help, q to quit.";

/* ---- Name prompt ---- */
const NameAsk = {
  label: "Name", prompt: "name>",
  start() { line("What should I call you? Type a name and press Enter, or type skip.", "hi"); },
  input(raw) {
    const t = raw.trim();
    save("asked_name", true);
    if (/^(help|store|ls|apps|about|clear)$/i.test(t)) { setMode(null); line("Skipped the name for now. You can set one later with: name your-name", "dimt"); return shell(t); }
    if (!t || /^(skip|s|q|quit|no)$/i.test(t)) { setMode(null); line("No problem. You can set one later with: name your-name", "dimt"); return; }
    setName(t); setMode(null);
  },
  choices() { return [{ label: "Skip", cmd: "skip" }]; },
};
function setName(t) {
  userName = t.replace(/[\u0000-\u001f]/g, "").slice(0, 40).trim();
  save("name", userName); save("asked_name", true);
  line(userName ? "Nice to meet you, " + userName + "." : "Name cleared.", "ok");
}

/* ---- App Store ---- */
const Store = {
  label: "App Store", prompt: "store>", sel: null,
  start() { this.sel = null; line("App Store. " + catalog.length + " apps. " + updatesLine(), "hi"); this.list(); line("Type a number for details, or: search word, installed, updates. " + STD, "dimt"); },
  help() {
    line("App Store help:", "hi");
    line("A number: details for that app.");
    line("list: all apps. search word: find apps.");
    line("info, install, uninstall, update, open: act on an app, by name or number.");
    line("installed: your apps. updates: apps with a new version.");
    line("q: back to the shell.");
  },
  list(items) {
    const list = items || catalog;
    if (!list.length) { line("No apps match."); return; }
    for (const a of list) line((catalog.indexOf(a) + 1) + ". " + a.name + ", " + status(a));
  },
  input(raw) {
    const t = raw.trim(), [w, ...rest] = t.split(/\s+/), arg = rest.join(" ");
    const lw = (w || "").toLowerCase();
    if (!t) { line("Type a number, or h for help."); return; }
    if (/^\d+$/.test(t)) { const a = catalog[+t - 1]; if (!a) return err("There's no app number " + t + ". Pick 1 to " + catalog.length + "."); this.sel = a; info(a); return; }
    if (lw === "list" || lw === "l" || lw === "back") { this.sel = null; this.list(); return; }
    if (lw === "search" || lw === "find") { if (!arg) { line("Type search and a word, for example: search game"); return; } return search(arg); }
    if (lw === "installed") { this.sel = null; return listInstalled(); }
    if (lw === "updates") { this.sel = null; return listUpdates(); }
    if (["info", "install", "uninstall", "remove", "update", "open", "run"].includes(lw)) {
      if (lw === "update" && /^all$/i.test(arg)) return updateAll();
      const a = arg ? findApp(arg) : this.sel;
      if (!a) return err(arg ? "No app called " + arg + "." : "Which app? Add a name or number, for example: " + lw + " guess");
      this.sel = a;
      return storeAction(lw, a);
    }
    const a = findApp(t); if (a) { this.sel = a; info(a); return; }
    err("I don't know " + t + " here. Type h for help.");
  },
  choices() {
    if (this.sel) {
      const a = this.sel, c = [];
      if (!isInstalled(a.id)) c.push({ label: "Install " + a.name, cmd: "install " + a.id });
      else { c.push({ label: "Open " + a.name, cmd: "open " + a.id }); if (hasUpdate(a.id)) c.push({ label: "Update " + a.name, cmd: "update " + a.id }); c.push({ label: "Uninstall " + a.name, cmd: "uninstall " + a.id }); }
      c.push({ label: "Back to list", cmd: "list" }, { label: "Quit store", cmd: "q" });
      return c;
    }
    return catalog.map((a, i) => ({ label: (i + 1) + ". " + a.name, cmd: String(i + 1) }))
      .concat([{ label: "Search", fill: "search " }, { label: "Installed", cmd: "installed" }, { label: "Updates", cmd: "updates" }, { label: "Help", cmd: "h" }, { label: "Quit store", cmd: "q" }]);
  },
};
function status(a) { return !isInstalled(a.id) ? "not installed" : hasUpdate(a.id) ? "update available" : "installed"; }
function updatesLine() { const n = catalog.filter((a) => hasUpdate(a.id)).length; return n ? n + (n === 1 ? " update" : " updates") + " available." : "Everything is up to date."; }
function info(a) {
  line(a.name + ", version " + a.version + ". " + a.category + ", " + a.size + ".", "hi");
  line(a.desc);
  if (isInstalled(a.id)) line(hasUpdate(a.id) ? "Installed: version " + installed[a.id] + ". Update available: " + (a.notes || "fixes and polish.") : "Installed. Open it with the command: " + a.id);
  else line("Not installed. Type install to get it.");
}
function search(q) {
  const s = q.toLowerCase(), r = catalog.filter((a) => (a.name + " " + a.desc + " " + a.category + " " + a.id).toLowerCase().includes(s));
  line(r.length + (r.length === 1 ? " app matches " : " apps match ") + q + (r.length ? ":" : "."));
  Store.list(r.length ? r : []);
  if (r.length === 1) Store.sel = r[0];
}
function listInstalled() {
  const r = catalog.filter((a) => isInstalled(a.id));
  line(r.length + " apps installed:");
  r.forEach((a) => line(a.name + " " + installed[a.id] + ", command: " + a.id));
}
function listUpdates() {
  const r = catalog.filter((a) => hasUpdate(a.id));
  if (!r.length) { line("Everything is up to date."); return; }
  r.forEach((a) => line(a.name + ": " + installed[a.id] + " to " + a.version + ". " + (a.notes || "")));
  line("Type update all, or update and a name.");
}
function storeAction(act, a) {
  if (act === "info") return info(a);
  if (act === "install") {
    if (isInstalled(a.id)) { SFX.error(); line(a.name + " is already installed."); return; }
    installed[a.id] = a.version; saveInstalled(); SFX.install();
    line("Installed " + a.name + " " + a.version + ". Open it with the command: " + a.id, "ok"); return;
  }
  if (act === "uninstall" || act === "remove") {
    if (!isInstalled(a.id)) { SFX.error(); line(a.name + " isn't installed."); return; }
    if (a.system) { SFX.error(); line(a.name + " is part of the system, so it can't be uninstalled."); return; }
    delete installed[a.id]; saveInstalled(); SFX.uninstall();
    line("Uninstalled " + a.name + "." + (a.id === "notes" ? " Your notes are kept." : ""), "warm"); return;
  }
  if (act === "update") {
    if (!isInstalled(a.id)) { SFX.error(); line(a.name + " isn't installed."); return; }
    if (!hasUpdate(a.id)) { line(a.name + " is up to date."); return; }
    installed[a.id] = a.version; saveInstalled(); SFX.update();
    line("Updated " + a.name + " to " + a.version + ".", "ok"); return;
  }
  if (act === "open" || act === "run") return launch(a.id);
}
function updateAll() {
  const r = catalog.filter((a) => hasUpdate(a.id));
  if (!r.length) { line("Everything is up to date."); return; }
  r.forEach((a) => { installed[a.id] = a.version; }); saveInstalled(); SFX.update();
  line("Updated " + r.map((a) => a.name).join(", ") + ".", "ok");
}
function err(msg) { SFX.error(); line(msg, "err"); }

/* ---- Notes ---- */
let notes = load("notes", []);
const Notes = {
  label: "Notes", prompt: "notes>", writing: false,
  start() { this.writing = false; line("Notes. You have " + plural(notes.length, "note") + ". 1 list, 2 new note, r and a number reads, d and a number deletes. " + STD); },
  help() { line("Notes help:", "hi"); line("1 or l: list notes. 2 or n: write a new note."); line("n followed by text saves it at once, like: n buy milk"); line("r 2: read note 2. d 2: delete note 2."); line("q: back to the shell."); },
  input(raw) {
    const t = raw.trim();
    if (this.writing) { this.writing = false; if (!t) { line("Cancelled. Nothing saved."); return; } return addNote(t); }
    const m = t.match(/^(\S+)\s*(.*)$/) || ["", "", ""], w = m[1].toLowerCase(), arg = m[2];
    if (w === "1" || w === "l" || w === "list") { play("page"); return listNotes(); }
    if (w === "2" || w === "n" || w === "new") { if (arg) return addNote(arg); this.writing = true; play("compose"); line("Type your note and press Enter. Leave it empty to cancel."); return; }
    if (w === "r" || w === "read") { const i = +arg - 1; if (!notes[i]) return err("No note number " + (arg || "given") + "."); play("read", i + 1); line("Note " + (i + 1) + ": " + notes[i].text); return; }
    if (w === "d" || w === "delete") { const i = +arg - 1; if (!notes[i]) return err("No note number " + (arg || "given") + "."); notes.splice(i, 1); save("notes", notes); SFX.uninstall(); line("Deleted note " + (i + 1) + ". " + plural(notes.length, "note") + " left.", "warm"); return; }
    err("Type 1 to list, 2 for a new note, or h for help.");
  },
  choices() {
    if (this.writing) return [{ label: "Cancel", cmd: "" }];
    const c = [{ label: "1. List notes", cmd: "1" }, { label: "2. New note", cmd: "2" }];
    notes.slice(0, 6).forEach((n, i) => c.push({ label: "Read " + (i + 1), cmd: "r " + (i + 1) }));
    if (notes.length) c.push({ label: "Delete " + notes.length + " (last)", cmd: "d " + notes.length });
    return c.concat([{ label: "Help", cmd: "h" }, { label: "Quit", cmd: "q" }]);
  },
};
function addNote(t) { notes.push({ text: t.slice(0, 2000), at: Date.now() }); save("notes", notes); SFX.update(); line("Saved as note " + notes.length + ".", "ok"); }
function listNotes() { if (!notes.length) { line("No notes yet. Type 2 to write one."); return; } line(plural(notes.length, "note") + ":"); notes.forEach((n, i) => line((i + 1) + ". " + n.text.slice(0, 60) + (n.text.length > 60 ? "..." : ""))); }
const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");

/* ---- Calculator ---- */
let lastAns = 0;
function calcEval(src) {
  const s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/\bx\b/gi, "*").replace(/\bans\b/gi, "(" + lastAns + ")").replace(/,/g, "");
  let i = 0;
  const peek = () => { while (s[i] === " ") i++; return s[i]; };
  const num = () => { const m = s.slice(i).match(/^\d*\.?\d+(e[+-]?\d+)?/i); if (!m) throw new Error("I expected a number"); i += m[0].length; return parseFloat(m[0]); };
  const factor = () => { const c = peek(); if (c === "-") { i++; return -factor(); } if (c === "+") { i++; return factor(); } if (c === "(") { i++; const v = expr(); if (peek() !== ")") throw new Error("A bracket is missing"); i++; return post(v); } return post(num()); };
  const post = (v) => { if (peek() === "%") { i++; return v / 100; } return v; };
  const power = () => { const b = factor(); if (peek() === "^") { i++; return Math.pow(b, power()); } return b; };
  const term = () => { let v = power(); for (;;) { const c = peek(); if (c === "*") { i++; v *= power(); } else if (c === "/") { i++; const d = power(); if (d === 0) throw new Error("You can't divide by zero"); v /= d; } else return v; } };
  const expr = () => { let v = term(); for (;;) { const c = peek(); if (c === "+") { i++; v += term(); } else if (c === "-") { i++; v -= term(); } else return v; } };
  const v = expr(); if (peek() !== undefined) throw new Error("I didn't understand " + s.slice(i)); return v;
}
const fmt = (v) => (Math.abs(v) >= 1e15 || (Math.abs(v) < 1e-9 && v !== 0)) ? v.toExponential(6) : String(+v.toPrecision(12));
const Calc = {
  label: "Calculator", prompt: "calc>",
  start() { line("Calculator. Type a sum like 12 * (3 + 4) and press Enter. " + STD); },
  help() { line("Calculator help:", "hi"); line("Use + - * / ^ (power), % and brackets."); line("ans is the last answer, like: ans * 2"); line("q: back to the shell."); },
  input(raw) { const t = raw.trim(); if (!t) { line("Type a sum, like 2 + 2."); return; } try { const v = calcEval(t); if (!isFinite(v)) throw new Error("That number is too big"); lastAns = v; play("equals"); line(t + " = " + fmt(v), "hi"); } catch (e) { err(e.message + ". Try something like 12 * 3."); } },
  choices() { return [{ label: "Type a sum", fill: "" }, { label: "ans × 2", cmd: "ans * 2" }, { label: "Help", cmd: "h" }, { label: "Quit", cmd: "q" }]; },
};

/* ---- Clock / Timer / Stopwatch ---- */
let timer = null, sw = { start: 0, acc: 0, running: false, laps: 0 };
const spoken = (ms) => { let s = Math.round(ms / 1000); const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60; const p = []; if (h) p.push(plural(h, "hour")); if (m) p.push(plural(m, "minute")); if (s || !p.length) p.push(plural(s, "second")); return p.join(" "); };
const swNow = () => sw.acc + (sw.running ? Date.now() - sw.start : 0);
function parseDuration(t) {
  const m = t.match(/^(\d+(?:\.\d+)?)\s*(s|sec|secs|seconds?|m|min|mins|minutes?|h|hours?)?$/i); if (!m) return null;
  const n = parseFloat(m[1]), u = (m[2] || "m").toLowerCase()[0];
  return n * (u === "s" ? 1000 : u === "h" ? 3600000 : 60000);
}
function startTimer(ms) {
  if (timer) clearTimeout(timer.id);
  timer = { end: Date.now() + ms, ms, id: setTimeout(() => { const d = timer.ms; timer = null; SFX.alarm(); say("Timer done: " + spoken(d) + ". Ding!", "hi"); renderChoices(); }, ms) };
  play("timerset");
  line("Timer set for " + spoken(ms) + ". I'll chime when it's done, even if you leave the app.", "ok");
}
const Clock = {
  label: "Clock", prompt: "clock>",
  start() { line("Clock. 1 time, 2 timer, 3 stopwatch start or stop, 4 lap, 5 reset. " + STD); },
  help() { line("Clock help:", "hi"); line("1 or t: say the time and date."); line("2 or timer 5m: a timer. Use s, m or h, like timer 90s."); line("c: cancel the timer. left: time remaining."); line("3: start or stop the stopwatch. 4: lap. 5: reset."); line("q: back to the shell."); },
  input(raw) {
    const t = raw.trim().toLowerCase(), m = t.match(/^(\S+)\s*(.*)$/) || ["", "", ""], w = m[1], arg = m[2];
    if (w === "1" || w === "t" || w === "time") { const d = new Date(); play("ticktock"); line("It's " + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + ", " + d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }) + ".", "hi"); return; }
    if (w === "2" || w === "timer") { if (!arg) { line("How long? For example: timer 5m, timer 30s, timer 1h."); return; } const ms = parseDuration(arg); if (!ms || ms > 86400000) return err("I couldn't read " + arg + ". Try timer 5m."); return startTimer(ms); }
    if (w === "c" || w === "cancel") { if (!timer) { line("No timer is running."); return; } clearTimeout(timer.id); timer = null; SFX.uninstall(); line("Timer cancelled."); return; }
    if (w === "left") { line(timer ? spoken(timer.end - Date.now()) + " left." : "No timer is running."); return; }
    if (w === "3" || w === "sw" || w === "stopwatch") { if (sw.running) { sw.acc = swNow(); sw.running = false; play("swstop"); line("Stopwatch stopped at " + spoken(sw.acc) + ".", "hi"); } else { sw.start = Date.now(); sw.running = true; play("swstart"); line(sw.acc ? "Stopwatch resumed." : "Stopwatch started.", "ok"); } return; }
    if (w === "4" || w === "lap") { if (!sw.running) { line("Start the stopwatch first with 3."); return; } sw.laps++; play("lap"); line("Lap " + sw.laps + ": " + spoken(swNow()) + "."); return; }
    if (w === "5" || w === "reset") { sw = { start: 0, acc: 0, running: false, laps: 0 }; play("swreset"); line("Stopwatch reset to zero."); return; }
    if (/^\d/.test(t)) { const ms = parseDuration(t); if (ms) return startTimer(ms); }
    err("Type 1 for the time, 2 for a timer, 3 for the stopwatch, or h for help.");
  },
  choices() {
    const c = [{ label: "1. Time", cmd: "1" }, { label: "Timer 1 min", cmd: "timer 1m" }, { label: "Timer 5 min", cmd: "timer 5m" }, { label: "Timer: type length", fill: "timer " }];
    if (timer) c.push({ label: "Time left", cmd: "left" }, { label: "Cancel timer", cmd: "c" });
    c.push({ label: sw.running ? "3. Stop stopwatch" : "3. Start stopwatch", cmd: "3" });
    if (sw.running) c.push({ label: "4. Lap", cmd: "4" });
    if (sw.acc && !sw.running) c.push({ label: "5. Reset", cmd: "5" });
    return c.concat([{ label: "Help", cmd: "h" }, { label: "Quit", cmd: "q" }]);
  },
};

/* ---- Piano (store only, matches NexOS v0.4) ---- */
const KEYS = { "1": [0, "C"], "2": [2, "D"], "3": [4, "E"], "4": [5, "F"], "5": [7, "G"], "6": [9, "A"], "7": [11, "B"], "8": [12, "high C"] };
const ODE = "3345 5432 1123 322 3345 5432 1123 211";
const noteStatus = $("#note-status");
function sayNote(t) { if (!noteStatus) return; noteStatus.textContent = ""; setTimeout(() => { noteStatus.textContent = t; }, 30); }
let pianoTimers = [];
function stopSong() { pianoTimers.forEach(clearTimeout); pianoTimers = []; }
function playSeq(seq, base, gap = 0.3) {
  stopSong(); let t = 0; const played = [];
  for (const ch of seq) { if (KEYS[ch]) { const m = base + KEYS[ch][0]; pianoTimers.push(setTimeout(() => SFX.note(m), t * 1000)); played.push(KEYS[ch][1]); t += gap; } else if (ch === " ") t += gap * 0.5; }
  return played;
}
const Piano = {
  label: "Piano", prompt: "piano>", keyMode: true, octave: 4, recent: "",
  base() { return 12 * (this.octave + 1); },
  start() { this.recent = ""; line("Piano. Keys 1 to 8 play C D E F G A B and high C, and each note is said by name. Plus and minus change octave. s plays Ode to Joy, r replays what you played. " + STD); },
  help() { line("Piano help:", "hi"); line("1 to 8: play a note right away. Type several, like 1 2 3, and press Enter for a tune."); line("+ and -: octave up or down. s: Ode to Joy. r: replay. q: back to the shell."); },
  setOctave(d) { const o = Math.max(2, Math.min(6, this.octave + d)); if (o === this.octave) { err("Octave " + o + " is as " + (d > 0 ? "high" : "low") + " as it goes."); return; } this.octave = o; SFX.note(this.base()); line("Octave " + o + ".", "ok"); },
  input(raw) {
    const t = raw.trim().toLowerCase();
    if (t === "s" || t === "song") { playSeq(ODE, this.base()); line("Playing Ode to Joy.", "hi"); return; }
    if (t === "r" || t === "replay") { if (!this.recent) { err("Nothing to replay yet. Play some notes first."); return; } const p = playSeq(this.recent, this.base()); line("Replaying " + p.join(" ") + ".", "hi"); return; }
    if (t === "+" || t === "up") return this.setOctave(1);
    if (t === "-" || t === "down") return this.setOctave(-1);
    if (!t) { line("Press a key from 1 to 8 to play a note."); return; }
    if (/^[1-8\s]+$/.test(t)) { this.recent = t.replace(/\s+/g, ""); const p = playSeq(t, this.base()); line("Played " + p.join(" ") + ".", "hi"); return; }
    err("Keys 1 to 8 play notes. Type h for help.");
  },
  key(k) {
    if (KEYS[k]) { SFX.note(this.base() + KEYS[k][0]); this.recent = (this.recent + k).slice(-32); sayNote(KEYS[k][1]); return true; }
    return false;
  },
  onQuit() { stopSong(); if (noteStatus) noteStatus.textContent = ""; },
  choices() { return Object.keys(KEYS).map((k) => ({ label: k + " " + KEYS[k][1], note: k })).concat([{ label: "Octave up", cmd: "+" }, { label: "Octave down", cmd: "-" }, { label: "Ode to Joy", cmd: "s" }, { label: "Replay", cmd: "r" }, { label: "Help", cmd: "h" }, { label: "Quit", cmd: "q" }]); },
};

/* ---- Hello (preinstalled, matches NexOS v0.4) ---- */
const Hello = {
  label: "Hello", oneShot: true,
  run() {
    line("Hello" + (userName ? ", " + userName : "") + "! I'm the Hello app.", "hi");
    line("In the real NexOS, Hello is the first NexOS program that runs in ring 3, as pid 1. Here in the web twin, it runs as JavaScript.");
    line("Up for " + spoken(Date.now() - bootTime) + "." + (cur === CTX.terminal ? " Back to the nexos shell." : ""), "dimt");
  },
};

/* ---- System Info ---- */
function storageBytes() { let n = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("looscid:")) n += k.length + (localStorage.getItem(k) || "").length; } } catch (e) {} return n * 2; }
function browserName() {
  const u = navigator.userAgent || "";
  const plat = /iPhone/.test(u) ? "iPhone" : /iPad/.test(u) ? "iPad" : /Android/.test(u) ? "Android" : /Mac OS X|Macintosh/.test(u) ? "Mac" : /Windows/.test(u) ? "Windows" : /CrOS/.test(u) ? "ChromeOS" : /Linux/.test(u) ? "Linux" : "an unknown system";
  const v = (re) => { const m = u.match(re); return m ? " " + m[1] : ""; };
  const b = /Edg\//.test(u) ? "Edge" + v(/Edg\/(\d+)/) : /OPR\//.test(u) ? "Opera" + v(/OPR\/(\d+)/) : /FxiOS/.test(u) ? "Firefox" + v(/FxiOS\/(\d+)/)
    : /Firefox\//.test(u) ? "Firefox" + v(/Firefox\/(\d+)/) : /CriOS/.test(u) ? "Chrome" + v(/CriOS\/(\d+)/) : /Chrome\//.test(u) ? "Chrome" + v(/Chrome\/(\d+)/)
    : /Safari\//.test(u) ? "Safari" + v(/Version\/(\d+(?:\.\d+)?)/) : "an unknown browser";
  return b + " on " + plat;
}
// One source for About this NexOS: the window from Home, and the about and sysinfo commands.
function aboutInfo() {
  const appsN = catalog.filter((a) => isInstalled(a.id)).length;
  const mem = navigator.deviceMemory ? "about " + navigator.deviceMemory + " GB, as reported by the browser" : "not reported by this browser";
  const dpr = window.devicePixelRatio || 1;
  return {
    what: [
      "NexOS Web " + VERSION + " is a web twin of NexOS. It is not the real kernel and not an emulator.",
      "The real NexOS kernel, v0.5.0, is written in Rust and runs on 64-bit and 32-bit x86 PCs, in QEMU or on real hardware, and plays its sounds on the PC speaker. It can also boot for real in your browser, from the Boot the real kernel link on the Home screen (the real/ page).",
      "This page mirrors the same nexos shell, App Store and apps in plain HTML and JavaScript. Use it with buttons from Home, or open Terminal for the command line.",
      "Every button and key has its own short, classic-style sound. Everything stays on this device: no network requests and no tracking, and it works offline.",
    ],
    facts: [
      ["Version", "NexOS Web " + VERSION + ", a web twin of NexOS v0.5.0"],
      ["Browser", browserName()],
      ["Screen", screen.width + " by " + screen.height + " pixels, window " + window.innerWidth + " by " + window.innerHeight + (dpr > 1 ? ", " + Math.round(dpr * 10) / 10 + " times density" : "")],
      ["Memory", mem],
      ["Processor cores", navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : "not reported by this browser"],
      ["Uptime", spoken(Date.now() - bootTime)],
      ["Apps installed", appsN + " of " + catalog.length],
      ["Files and notes", plural(Object.keys(fs).length, "file") + ", " + plural(notes.length, "note") + ", " + Math.max(1, Math.round(storageBytes() / 1024)) + " KB stored in this browser"],
      ["Sound", (muted ? "muted" : "on") + ", volume " + volume + " percent, typing clicks " + (keySounds ? "on" : "off") + ", ambient " + (ambient ? AMBIENTS[ambient.id].name : "off")],
      ["Network", (navigator.onLine ? "online" : "offline") + ", but NexOS Web never uses the network"],
    ],
    credits: [
      "NexOS and NexOS Web are open source under the MIT license, made by the NexOS project.",
      "Every sound is synthesized live with Web Audio. There are no recorded samples.",
      "Source code and authors: github.com/2three1y/nexos",
    ],
  };
}
function printAbout() {
  const a = aboutInfo();
  line("About this NexOS", "hi");
  a.what.forEach((t) => line(t));
  line("System info:", "hi");
  a.facts.forEach(([k, v]) => line(k + ": " + v + "."));
  line("Credits:", "hi");
  a.credits.forEach((t, i) => line(t, i === a.credits.length - 1 ? "info" : ""));
  if (cur === CTX.terminal) line("Tip: About this NexOS is also an app on the Home screen.", "dimt");
}
const SysInfo = { label: "About this NexOS", oneShot: true, run() { printAbout(); } };

/* ---- Files ---- */
const Files = {
  label: "Files", prompt: "files>", sel: null,
  names() { return Object.keys(fs).sort(); },
  start() { this.sel = null; line("Files.", "hi"); this.list(); line("Type a number to read a file, or a name and some text to save one, like: todo.txt buy milk. " + STD, "dimt"); },
  list() { const f = this.names(); if (!f.length) { line("No files. Type a name and some text to save one."); return; } line(plural(f.length, "file") + ":"); f.forEach((n, i) => line((i + 1) + ". " + n)); },
  help() { line("Files help:", "hi"); line("A number: read that file. l: list files."); line("name.txt and text: save a file. d and a number: delete that file."); line("q: quit."); },
  input(raw) {
    const t = raw.trim(), f = this.names(); let m;
    if (!t || /^(l|list|ls)$/i.test(t)) { this.sel = null; return this.list(); }
    if (/^\d+$/.test(t)) { const n = f[+t - 1]; if (!n) return err("There's no file number " + t + "."); this.sel = n; line(n + ":", "dimt"); line(fs[n]); return; }
    if ((m = t.match(/^(?:d|delete|rm)\s+(\d+)$/i))) { const n = f[+m[1] - 1]; if (!n) return err("There's no file number " + m[1] + "."); delete fs[n]; saveFs(); this.sel = null; SFX.uninstall(); line("Deleted " + n + ".", "warm"); return; }
    if ((m = t.match(/^(\S+)\s+([\s\S]+)$/))) return shell("write " + t);
    err("To save a file, type a name and some text, like: todo.txt buy milk.");
  },
  choices() {
    const f = this.names(), c = f.slice(0, 8).map((n, i) => ({ label: "Read " + n, cmd: String(i + 1) }));
    if (this.sel && f.includes(this.sel)) c.push({ label: "Delete " + this.sel, cmd: "d " + (f.indexOf(this.sel) + 1) });
    return c.concat([{ label: "New file", fill: "new.txt " }, { label: "Help", cmd: "h" }, { label: "Quit", cmd: "q" }]);
  },
};

/* ---- Insomnia ---- */
let sheep = load("sheep", 0);
// The same lines as Insomnia OS, dealt from a shuffle bag (see countSheep): none repeats until all have been used.
const SHEEP_LINES = [
  "Sheep {n} jumped the fence.",
  "Sheep {n} cleared it with style.",
  "Sheep {n} tiptoed over the fence.",
  "Sheep {n} hopped over in perfect silence.",
  "Sheep {n} did a little spin mid-air. Showing off.",
  "Sheep {n} tripped, got up, pretended nothing happened.",
  "Sheep {n} said baa in a classic system voice.",
  "Sheep {n} jumped wearing tiny noise-cancelling headphones.",
  "Sheep {n} brought you a warm glass of milk.",
  "Sheep {n} found the new ramp and rolled over.",
  "Sheep {n} jumped, then synced locally. No cloud needed.",
  "Sheep {n} floated over like a little cloud.",
  "Sheep {n} whispered you've got this.",
  "Sheep {n} started a group chat with the other sheep. It's on mute.",
  "Sheep {n} stopped to stretch first. Safety.",
  "Sheep {n} jumped in slow motion, very dramatic.",
  "Sheep {n} wore pajamas for the occasion.",
  "Sheep {n} yawned halfway over. Contagious.",
  "Sheep {n} cleared the fence and took a bow.",
  "Sheep {n} brought a tiny pillow, just in case.",
  "Sheep {n} landed softly on a pile of laundry.",
  "Sheep {n} paused to look at the moon, then jumped.",
  "Sheep {n} hummed a lullaby on the way over.",
  "Sheep {n} jumped and forgot why. Classic 3 AM.",
  "Sheep {n} counted you back, to be fair.",
  "Sheep {n} politely asked if you're sleepy yet.",
  "Sheep {n} rebooted mid-jump. Back online.",
  "Sheep {n} jumped over the fence and a small puddle.",
  "Sheep {n} left a note: sleep well.",
  "Sheep {n} jumped in fuzzy slippers.",
  "Sheep {n} cleared the fence on the second try. Growth.",
  "Sheep {n} flopped over like a beanbag.",
  "Sheep {n} brought snacks for the sheep union.",
  "Sheep {n} did a quiet little moonwalk over.",
  "Sheep {n} jumped and set an alarm for noon.",
  "Sheep {n} wrapped itself in a blanket burrito, then rolled over.",
  "Sheep {n} turned the brightness down for you.",
  "Sheep {n} jumped over, then tucked in the fence.",
  "Sheep {n} read the fence a bedtime story first.",
  "Sheep {n} drifted over like it had nowhere to be.",
  "Sheep {n} hopped over with a cup of chamomile.",
  "Sheep {n} wanted to say the stars look nice tonight.",
  "Sheep {n} jumped and whispered, almost there.",
  "Sheep {n} practiced its jump all day for this.",
  "Sheep {n} tiptoed so the crickets wouldn't wake.",
  "Sheep {n} jumped over the fence and a sleeping cat.",
  "Sheep {n} made it over and immediately napped.",
  "Sheep {n} cleared the fence with zero lag.",
  "Sheep {n} jumped in airplane mode.",
  "Sheep {n} carried a tiny night light.",
  "Sheep {n} jumped and did a small, sleepy wave.",
  "Sheep {n} slid under the fence instead. Creative.",
  "Sheep {n} jumped while softly saying goodnight.",
  "Sheep {n} brought the fluffiest wool in the flock.",
  "Sheep {n} hopped over and dimmed the stars a little.",
  "Sheep {n} took the scenic route over.",
  "Sheep {n} jumped, then closed 47 browser tabs.",
  "Sheep {n} cleared it like a pro gymnast. 9.8.",
  "Sheep {n} gave the fence a gentle high five.",
  "Sheep {n} jumped over and fluffed your pillow.",
  "Sheep {n} floated across on a dream.",
  "Sheep {n} hopped over in a cozy sweater.",
  "Sheep {n} jumped to the rhythm of the rain.",
  "Sheep {n} jumped and said the night is on your side.",
];
const MILESTONES = { 1: "Sheep 1 clears the fence. Gold medal.", 25: "25 sheep. The fence is filing a complaint.", 50: "50 sheep. Half of them are also awake.", 100: "100 sheep! The sheep are now counting you.", 250: "250 sheep. That's a whole wool startup.", 404: "Sheep 404 not found. It went to sleep. Maybe you should too.", 500: "500 sheep. Okay, legend. Try closing your eyes?" };
const THOUGHTS = [
  "Your pillow has a cool side. Go find it.", "Somewhere, a cat is asleep in a sunbeam. You could be next.", "Breathe in for 4, hold for 7, out for 8.",
  "Nothing you need to solve tonight will be solved tonight.", "The moon has been up all night too. You're in good company.", "Tomorrow's problems are asleep. Let them lie.",
  "Unclench your jaw. Drop your shoulders. There you go.", "Old computers hum because they're dreaming of floppy disks.", "Count backwards from 100 by sevens. Nobody finishes.",
  "Your blanket is a tiny house. You're safe in it.", "The stars don't rush. Neither do you.", "Every sheep you count is one you never have to count again.",
];
let lastSheepLine = -1, lastThought = -1;
let sheepDeck = [];
function sheepBag() { // shuffle bag: every line once before any comes back, never the same line twice in a row
  if (!sheepDeck.length) {
    sheepDeck = SHEEP_LINES.map((_, i) => i);
    for (let k = sheepDeck.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [sheepDeck[k], sheepDeck[j]] = [sheepDeck[j], sheepDeck[k]]; }
    const L = sheepDeck.length - 1; if (L > 0 && sheepDeck[L] === lastSheepLine) { const j = Math.floor(Math.random() * L); [sheepDeck[L], sheepDeck[j]] = [sheepDeck[j], sheepDeck[L]]; }
  }
  return sheepDeck.pop();
}
function pickDiff(arr, last) { if (arr.length < 2) return 0; let i; do { i = Math.floor(Math.random() * arr.length); } while (i === last); return i; }
function countSheep() {
  sheep++; save("sheep", sheep); SFX.sheep();
  let text;
  if (MILESTONES[sheep]) text = MILESTONES[sheep];
  else if (sheep % 50 === 0) text = sheep + " sheep! A round number. The flock cheers quietly.";
  else { lastSheepLine = sheepBag(); text = SHEEP_LINES[lastSheepLine].replace("{n}", sheep); }
  line(text + " 🐑", "hi");
}
const Insomnia = {
  label: "Insomnia", prompt: "insomnia>", sounds: false,
  start() { this.sounds = false; line("Insomnia. Can't sleep? 1 or Enter counts a sheep, 2 a sleepy thought, 3 sounds. " + STD); if (sheep) line("You've counted " + plural(sheep, "sheep").replace("sheeps", "sheep") + " so far.", "dimt"); },
  help() { line("Insomnia help:", "hi"); line("1, s, or just Enter: count a sheep."); line("2 or t: a sleepy thought."); line("3: sounds. Rain, Fan, Crickets, Old PC, Brahms lullaby."); line("0 stops the sound. z resets the sheep count."); line("q: back to the shell. Sound stops when you leave."); },
  input(raw) {
    const t = raw.trim().toLowerCase();
    if (this.sounds) {
      const pick = { "1": "rain", "2": "fan", "3": "crickets", "4": "oldpc", "5": "brahms", rain: "rain", fan: "fan", crickets: "crickets", "old pc": "oldpc", oldpc: "oldpc", brahms: "brahms", lullaby: "brahms" }[t];
      if (pick) { if (muted) line("Sound is muted. Type sound on in the shell, or use the Mute button.", "err"); else if (!startAmbient(pick)) return err("This browser can't play sound."); line("Playing " + AMBIENTS[pick].name + ". 0 stops it, b goes back.", "ok"); return; }
      if (t === "0" || t === "stop") { stopAmbient(); line("Sound stopped."); return; }
      if (t === "b" || t === "back" || t === "") { this.sounds = false; line("Back to Insomnia. 1 counts a sheep, 2 a thought, 3 sounds."); return; }
      return err("Pick 1 to 5, 0 to stop, or b to go back.");
    }
    if (t === "" || t === "1" || t === "s" || t === "sheep" || t === " ") return countSheep();
    if (t === "2" || t === "t" || t === "thought") { lastThought = pickDiff(THOUGHTS, lastThought); line(THOUGHTS[lastThought], "info"); return; }
    if (t === "3" || t === "sounds" || t === "sound") { this.sounds = true; line("Sounds: 1 Rain, 2 Fan, 3 Crickets, 4 Old PC, 5 Brahms lullaby. 0 stops, b goes back." + (ambient ? " Now playing: " + AMBIENTS[ambient.id].name + "." : "")); return; }
    if (t === "0" || t === "stop") { stopAmbient(); line("Sound stopped."); return; }
    if (t === "z" || t === "reset") { sheep = 0; save("sheep", 0); line("Sheep count reset to zero. Fresh flock."); return; }
    err("1 counts a sheep, 2 is a thought, 3 is sounds, h is help.");
  },
  onQuit() { const had = !!ambient; stopAmbient(); this.sounds = false; if (had) line("Sound stopped."); },
  quitMsg() { return "Back from Insomnia. You counted " + plural(sheep, "sheep").replace("sheeps", "sheep") + ". Goodnight" + (userName ? ", " + userName : "") + "."; },
  choices() {
    if (this.sounds) return [{ label: "1. Rain", cmd: "1" }, { label: "2. Fan", cmd: "2" }, { label: "3. Crickets", cmd: "3" }, { label: "4. Old PC", cmd: "4" }, { label: "5. Brahms lullaby", cmd: "5" }, { label: "0. Stop sound", cmd: "0" }, { label: "Back", cmd: "b" }];
    return [{ label: "1. Count a sheep", cmd: "1" }, { label: "2. Sleepy thought", cmd: "2" }, { label: "3. Sounds", cmd: "3" }].concat(ambient ? [{ label: "0. Stop sound", cmd: "0" }] : []).concat([{ label: "Help", cmd: "h" }, { label: "Quit", cmd: "q" }]);
  },
};

/* ---- Guess the Number (store only) ---- */
const Guess = {
  label: "Guess the Number", prompt: "guess>", lo: 1, hi: 100, n: 0, tries: 0,
  start() { this.newGame(); line("Guess the Number. I'm thinking of a number from 1 to 100. Type your guess. " + STD); },
  newGame() { this.n = 1 + Math.floor(Math.random() * 100); this.lo = 1; this.hi = 100; this.tries = 0; },
  help() { line("Guess help:", "hi"); line("Type a number from 1 to 100. I'll say higher or lower."); line("n: new game. q: back to the shell."); },
  input(raw) {
    const t = raw.trim().toLowerCase();
    if (t === "n" || t === "new") { this.newGame(); line("New game. A fresh number from 1 to 100."); return; }
    const g = parseInt(t, 10);
    if (!/^\d+$/.test(t) || g < 1 || g > 100) return err("Type a whole number from 1 to 100.");
    this.tries++;
    if (g === this.n) { SFX.win(); line(g + " is right! You got it in " + plural(this.tries, "try").replace("trys", "tries") + ". Type n to play again.", "ok"); this.newGame(); return; }
    if (g < this.n) { this.lo = Math.max(this.lo, g + 1); play("higher"); line(g + ": higher. Between " + this.lo + " and " + this.hi + "."); }
    else { this.hi = Math.min(this.hi, g - 1); play("lower"); line(g + ": lower. Between " + this.lo + " and " + this.hi + "."); }
  },
  choices() {
    const mid = Math.floor((this.lo + this.hi) / 2), q1 = Math.floor((this.lo + mid) / 2), q3 = Math.ceil((mid + this.hi) / 2);
    const set = [...new Set([q1, mid, q3])];
    return set.map((v) => ({ label: "Guess " + v, cmd: String(v) })).concat([{ label: "Type a guess", fill: "" }, { label: "New game", cmd: "n" }, { label: "Help", cmd: "h" }, { label: "Quit", cmd: "q" }]);
  },
};

/* ---- Morse Code (store only) ---- */
const MORSE = { a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----." };
const Morse = {
  label: "Morse Code", prompt: "morse>",
  start() { line("Morse Code. Type a word and press Enter to hear it. " + STD); },
  help() { line("Morse help:", "hi"); line("Type letters or numbers to hear them in Morse."); line("Dit is short, dah is long. q: back to the shell."); },
  input(raw) {
    const t = raw.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").slice(0, 40);
    if (!t) return err("Type a word with letters or numbers.");
    const u = 0.075; let at = 0; const words = [];
    for (const word of t.split(/\s+/)) {
      const letters = [];
      for (const ch of word) { const code = MORSE[ch]; if (!code) continue; for (const s of code) { tone(700, at, s === "." ? u : 3 * u, { type: "sine", gain: 0.4, attack: 0.004, release: 0.01 }); at += (s === "." ? u : 3 * u) + u; } at += 2 * u; letters.push(ch.toUpperCase() + " " + code.split("").map((s) => s === "." ? "dit" : "dah").join(" ")); }
      words.push(letters.join(", ")); at += 4 * u;
    }
    line(t.toUpperCase() + ": " + words.join(". Space. ") + ".", "hi");
  },
  choices() { return [{ label: "SOS", cmd: "sos" }, { label: "Hello", cmd: "hello" }, { label: "Type a word", fill: "" }, { label: "Help", cmd: "h" }, { label: "Quit", cmd: "q" }]; },
};

// Apps with their own window (not the command line): Insomnia OS and Meme Projects are their own sites' files, Easyconvert is native.
const WINDOW_APPS = { insomnia: "insomnia", easyconvert: "easyconvert", memes: "memes" };
let openAfterRun = null;
const APPS = { notes: Notes, calc: Calc, clock: Clock, piano: Piano, sysinfo: SysInfo, insomnia: Insomnia, hello: Hello, guess: Guess, morse: Morse };
function launch(id) {
  const a = appMeta(id);
  if (!a) return err("No app called " + id + ".");
  if (!isInstalled(id)) { err(a.name + " isn't installed. Get it with: store install " + id); return; }
  if (WINDOW_APPS[id]) { openAfterRun = id; line("Opening " + a.name + ".", "dimt"); return; }
  if (APPS[id].oneShot) { APPS[id].run(); return; }
  setMode(APPS[id]); APPS[id].start();
}


/* ---------- status: how this NexOS and the live site are doing, one short fact per line ---------- */
const STATUS_TIMEOUT = 5000;
function statusChecks() {
  return [
    ["Home page", "index.html"], ["System code", "script.js"], ["Styles", "styles.css"], ["Beat styles list", "../beat/genres.json"],
    ["Insomnia OS app", "../apps/insomnia/index.html"], ["Meme Projects app", "../apps/memeprojects/index.html"],
    [curGenre().label + " beat", genreFile(curGenre())],
  ];
}
// One check: a HEAD request, never cached (the service worker leaves HEAD alone, so this is the live site, not the offline copy).
function checkFile(name, path) {
  const t0 = performance.now(), ctl = window.AbortController ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctl) ctl.abort(); }, STATUS_TIMEOUT);
  const done = (ok, why) => { clearTimeout(timer); return { name, ok, why, ms: Math.round(performance.now() - t0) }; };
  let p;
  try { p = fetch(path + (path.includes("?") ? "&" : "?") + "status=" + Date.now(), { method: "HEAD", cache: "no-store", signal: ctl ? ctl.signal : undefined }); }
  catch (e) { return Promise.resolve(done(false, "could not check")); }
  return Promise.resolve(p).then((r) => (r && r.ok ? done(true) : done(false, "error " + (r ? r.status : "unknown"))),
    (e) => done(false, e && e.name === "AbortError" ? "timed out after " + STATUS_TIMEOUT / 1000 + " seconds" : navigator.onLine === false ? "offline" : "not reachable"));
}
function nexosStorage() {
  let items = 0, bytes = 0;
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && (k.startsWith("looscid:") || k === "calm-mode")) { items++; bytes += (k.length + (localStorage.getItem(k) || "").length) * 2; } } } catch (e) {}
  return { items, bytes };
}
const kb = (b) => (b < 1024 ? b + " bytes" : (b / 1024).toFixed(b < 10240 ? 1 : 0) + " KB");
function offlineCache() {
  const sw = navigator.serviceWorker, active = !!(sw && sw.controller);
  const keys = window.caches && caches.keys ? caches.keys().catch(() => []) : Promise.resolve([]);
  return keys.then((ks) => { const v = (ks || []).filter((k) => /^nexos-web-/.test(k)).sort().pop(); return { active, version: v ? v.replace("nexos-web-", "") : null }; });
}
let statusRunning = false;
function statusCmd() {
  if (statusRunning) { line("Already checking. The status is on its way."); return; }
  statusRunning = true;
  line("Checking NexOS status. This takes a few seconds.", "dimt");
  const online = navigator.onLine !== false;
  loadGenres().then(() => {
    const checks = statusChecks();
    return Promise.all([online ? Promise.all(checks.map(([n, p]) => checkFile(n, p))) : checks.map(([n]) => ({ name: n, ok: false, why: "offline", ms: 0 })), offlineCache()]);
  }).then(([res, cache]) => {
    const failed = res.filter((r) => !r.ok), slow = res.reduce((a, r) => (r.ms > a.ms ? r : a), res[0]);
    const avg = Math.round(res.reduce((a, r) => a + r.ms, 0) / res.length);
    const apps = catalog.filter((a) => isInstalled(a.id)).length, st = nexosStorage();
    const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    const calm = typeof window.calmMode === "function" ? window.calmMode() : document.documentElement.classList.contains("calm");
    line("NexOS status:", "hi");
    line("Version: NexOS Web " + VERSION + ", built " + BUILD_DATE + ".");
    line("Connection: " + (online ? "online." : "offline."));
    line("Offline cache: " + (cache.active && cache.version ? "installed, version " + cache.version + "." : cache.active ? "service worker active, cache not found." : cache.version ? "saved (version " + cache.version + "), service worker not active yet." : "not installed."));
    const sameWhy = failed.length > 1 && failed.every((r) => r.why === failed[0].why);
    if (!online) line("Site check: skipped while offline.");
    else if (failed.length === res.length && sameWhy) line("Site check: all " + res.length + " systems failed, " + failed[0].why + ".", "err");
    else if (!failed.length) line("Site check: all " + res.length + " systems OK. Average " + avg + " ms, slowest " + slow.name + " at " + slow.ms + " ms.", "ok");
    else {
      line("Site check: " + failed.length + " of " + res.length + " systems failed.", "err");
      failed.forEach((r) => line("Failed: " + r.name + ", " + r.why + ".", "err"));
      if (failed.length < res.length) line(res.length - failed.length + " others OK, average " + avg + " ms.");
    }
    line("Apps installed: " + apps + " of " + catalog.length + ".");
    line("Calm mode: " + (calm ? "on" : "off") + ". Reduce Motion: " + (reduce ? "on" : "off") + ".");
    line("Sound: " + (muted ? "muted" : "on") + ", volume " + volume + " percent.");
    line("Beat: " + curGenre().label + ", " + (beatPlaying() ? "playing." : "not playing."));
    line("Uptime: " + spoken(Date.now() - bootTime) + ".");
    line("Storage on this device: " + plural(st.items, "item") + ", about " + kb(st.bytes) + ".");
    const summary = !online ? "NexOS is running offline" + (cache.version ? " from the offline cache." : ". Some apps may not open.")
      : !failed.length ? "NexOS is healthy."
      : failed.length === res.length ? "NexOS can't reach the site right now. Try again in a minute."
      : "NexOS is running, but " + plural(failed.length, "system") + " failed the check.";
    line(summary, failed.length || !online ? "err" : "ok");
    if (failed.length) SFX.error(); else SFX.update();
  }).catch((e) => { line("Status check failed: " + (e && e.message ? e.message : "unknown error") + ".", "err"); })
    .then(() => { statusRunning = false; flushStatus(); });
}
// The report lands in the Terminal log (a polite live region). If Terminal was closed meanwhile, the polite status line carries the summary.
function flushStatus() {
  const lines = pending || [];
  const t = CTX.terminal, prev = { logEl, cur };
  logEl = t.log; flush(); logEl = prev.logEl;
  if (t.log.closest("[hidden]") && lines.length) { const s = $("#status"); s.textContent = ""; setTimeout(() => { s.textContent = lines[lines.length - 1][0]; }, 30); }
}

/* ---------- shell ---------- */
const HELP = [
  ["help", "this list"], ["ls", "list files"], ["cat file", "show a file"], ["write file text", "save a file"], ["rm file", "delete a file"],
  ["apps", "your installed apps"], ["store", "the App Store"], ["insomnia", "open Insomnia OS (insomnia lite is the old text version)"], ["easyconvert", "open Easyconvert, the file converter"], ["memes", "open Meme Projects"], ["sound", "on, off, test, list, keys on or off, or a volume like sound 120"],
  ["name", "set what I call you, or name clear"], ["about or sysinfo", "About this NexOS: what it is, system info and credits"], ["files", "the Files app"], ["beat", "play or stop the NexOS beat"], ["home", "close the terminal and go to the Home screen"], ["status", "how NexOS and the site are doing: version, connection, a live site check, apps, Calm mode, sound and storage"], ["settings or sound", "open Sound settings on Home, with Beat style and volume"], ["uptime", "time since boot"], ["echo text", "repeat text"], ["clear", "clear the screen"],
];
function shell(raw) {
  const t = raw.trim(); if (!t) { line("Type help to see commands."); return; }
  const [w0, ...rest] = t.split(/\s+/), w = w0.toLowerCase(), arg = rest.join(" ");
  switch (w) {
    case "help": case "?":
      line("Commands:", "hi"); HELP.forEach(([c, d]) => line(c + ": " + d));
      line("Apps: " + catalog.filter((a) => isInstalled(a.id)).map((a) => a.id).join(", ") + ". In every app, h is help and q quits.", "info"); return;
    case "ls": case "dir": { const f = Object.keys(fs).sort(); line(f.length ? plural(f.length, "file") + ": " + f.join(", ") + "." : "No files."); return; }
    case "cat": case "type": case "read": { if (!arg) return err("Which file? For example: cat readme.txt"); const f = fsName(arg); if (!(f in fs)) return err("No file called " + arg + ". Type ls to see files."); line(f + ":", "dimt"); line(fs[f]); return; }
    case "write": { const m = arg.match(/^(\S+)\s+([\s\S]+)$/); if (!m) return err("Use: write name.txt your text"); const f = fsName(m[1]); if (!/^[\w.-]{1,40}$/.test(f)) return err("File names can use letters, numbers, dots and dashes."); const existed = f in fs; fs[f] = m[2].slice(0, 5000); saveFs(); SFX.blip(); line((existed ? "Replaced " : "Saved ") + f + ".", "ok"); return; }
    case "rm": case "del": { const f = fsName(arg); if (!arg || !(f in fs)) return err("No file called " + (arg || "that") + "."); delete fs[f]; saveFs(); line("Deleted " + f + "."); return; }
    case "apps": { const r = catalog.filter((a) => isInstalled(a.id)); line(plural(r.length, "app") + " installed. Type a name to open it:", "hi"); r.forEach((a) => line(a.id + ": " + a.name + (hasUpdate(a.id) ? ", update in store" : ""))); return; }
    case "run": case "open": { const a = findApp(arg); if (!a) return err(arg ? "No app called " + arg + ". Type apps." : "Run which app? Type apps to see them."); return launch(a.id); }
    case "store": case "appstore": {
      if (!arg) { setMode(Store); Store.start(); return; }
      const [sw0, ...sr] = arg.split(/\s+/), s = sw0.toLowerCase(), sa = sr.join(" ");
      if (s === "list") return Store.list();
      if (s === "search") return sa ? search(sa) : err("Search for what? For example: store search game");
      if (s === "installed") return listInstalled();
      if (s === "updates") return listUpdates();
      if (s === "update" && /^all$/i.test(sa)) return updateAll();
      if (["info", "install", "uninstall", "remove", "update", "open"].includes(s)) { const a = findApp(sa); if (!a) return err(sa ? "No app called " + sa + " in the store." : "Which app? For example: store " + s + " guess"); return storeAction(s, a); }
      return err("Store commands: list, search, info, install, uninstall, update, installed.");
    }
    case "install": case "uninstall": case "update": { if (w === "update" && /^all$/i.test(arg)) return updateAll(); const a = findApp(arg); if (!a) return err("Which app? For example: " + w + " guess"); return storeAction(w, a); }
    case "sound": if (!arg) return openSoundFromShell(); // falls through to the sound commands
    case "mute": case "unmute": case "volume": case "beep": return soundCmd(w, arg);
    case "about": case "ver": case "version": case "sysinfo": printAbout(); return;
    case "status": case "health": statusCmd(); return;
    case "settings": case "setting": case "preferences": return openSoundFromShell();
    case "files": setMode(Files); Files.start(); return;
    case "beat": {
      const say = (t) => line(t, "ok");
      if (!arg) { beatToggle(say); return; }
      const g = arg.toLowerCase();
      if (g === "stop") { if (beatPlaying()) beatToggle(say); else line("The beat isn't playing."); return; }
      loadGenres().then(() => {
        if (g === "list" || g === "styles" || g === "genres") { line("Beat styles: " + beatGenres.map((x) => x.label + (x.id === curGenre().id ? " (chosen)" : "")).join(", ") + ". Type beat and a style to play it.", "info"); flush(); return; }
        const m = beatGenres.find((x) => x.id.toLowerCase() === g || x.label.toLowerCase() === g) || beatGenres.find((x) => x.label.toLowerCase().startsWith(g) || x.id.toLowerCase().startsWith(g));
        if (!m) { err("No beat style called " + arg + ". Type beat list."); flush(); return; }
        setGenre(m.id); if (beatPlaying()) stopBeatHook(); beatToggle(say); flush();
      });
      return;
    }
    case "home": case "launcher": if (cur === CTX.terminal) { closeAfterRun = true; line("Going to the Home screen.", "dimt"); } return;
    case "uptime": line("Up for " + spoken(Date.now() - bootTime) + "."); return;
    case "echo": line(arg); return;
    case "name": {
      if (!arg) { line(userName ? "I call you " + userName + ". Change it with name and a new name, or name clear." : "No name set. Type name and your name, like: name Sam"); return; }
      if (/^(clear|none|reset)$/i.test(arg)) { userName = ""; save("name", ""); line("Name cleared. I'll keep it neutral."); return; }
      setName(arg); return;
    }
    case "hi": line("Hi" + (userName ? ", " + userName : "") + "! Type help to see what I can do."); return;
    case "clear": case "cls": logEl.replaceChildren(); line("Screen cleared."); return;
    case "insomnia": if (/^lite$/i.test(arg)) { if (!isInstalled("insomnia")) return err("Insomnia OS isn't installed. Get it with: store install insomnia"); setMode(Insomnia); Insomnia.start(); return; } return launch("insomnia");
    case "easyconvert": case "memes": case "memeprojects": return launch(WINDOW_APPS[w] || "memes");
    case "exit": case "q": case "quit": line("You're at the nexos shell already. Close the tab to leave, or type help."); return;
  }
  const a = findApp(w) && (APPS[findApp(w).id] || WINDOW_APPS[findApp(w).id]) && !/^\d+$/.test(w) ? findApp(w) : null;
  if (a) return launch(a.id);
  err("Unknown command: " + w0 + ". Type help to see commands.");
}
const fsName = (s) => s.trim().toLowerCase();
function soundCmd(w, arg) {
  const a = (arg || "").toLowerCase();
  if (w === "mute" || a === "off") return setMuted(true, true);
  if (w === "unmute" || a === "on") return setMuted(false, true);
  if (w === "beep" || a === "test") { if (muted) { line("Sound is muted. Type sound on first."); return; } SFX.install(); line("Chime played at volume " + volume + " percent."); return; }
  const n = parseInt(w === "volume" ? a : a.replace(/^(vol|volume)\s*/, ""), 10);
  if (!isNaN(n)) { setVolume(n, true); return; }
  if (a === "stop") { stopAmbient(); line("Ambient sound stopped."); return; }
  if (a === "beat") { beatToggle((t) => line(t, "ok")); return; }
  const k = a.match(/^keys?\s*(on|off)?$/);
  if (k) { if (k[1]) setKeySounds(k[1] === "on", true); else line("Typing clicks are " + (keySounds ? "on" : "off") + ". Use sound keys on, or sound keys off."); return; }
  if (a === "list" || a === "s") { SOUND_LIST.forEach((x, i) => line((i ? "" : "Sounds: ") + x)); return; }
  line("Sound is " + (muted ? "muted" : "on") + ", volume " + volume + " percent, typing clicks " + (keySounds ? "on" : "off") + ". Use sound on, sound off, sound test, sound keys on or off, sound list, or sound 120 (0 to 150).");
}
var stopBeatHook = null; // set once the beat player exists
function setMuted(m, speak) {
  m = !!m;
  if (m && !muted && speak !== "silent") play("off"); // the down pair plays, then sound fades out
  muted = m; save("muted", muted); applyVolume(muted ? 0.16 : 0); if (muted) { stopAmbient(); if (stopBeatHook) stopBeatHook(); }
  muteBtn.setAttribute("aria-pressed", String(muted)); muteBtn.textContent = muted ? "Muted" : "Mute";
  if (speak) line(muted ? "Sound off." : "Sound on.", "ok");
  if (!muted && speak !== "silent") play("on");
}
const SOUND_LIST = [
  "Numbered buttons: a soft note that rises with the number, 1 low to 9 high.",
  "Each app's button: that app's own little tune.",
  "Run: a bright double blip. Enter: a typewriter return and bell.",
  "Home screen: Terminal powers on like an old screen with a cursor beep. About this NexOS: a square blip into a soft bell. Sound settings: two dial clicks. Close and Escape: a low thunk back to Home.",
  "Help: a rising question. App Store: a register ding. My apps: three clicks. Files: a paper flick. Clear screen: a whoosh.",
  "Install and Update buttons: a bright blip. Uninstall and Delete: a falling tone. Quit, Back and Skip: a low thunk.",
  "Sound on: up two notes. Sound off: down two notes. Octave up and down: a slide up or down.",
  "Typing: a soft key click, a deeper space bar, a tick for Backspace, and a faint tick for Tab and the arrow keys. In the Calculator, digits are tuned and operators click twice.",
  "Apps: Clock has a tick tock, a timer wind up, and stopwatch start, stop, lap and reset beeps. Notes flicks a page. Guess the Number slides up for higher and down for lower.",
  "Listen to the beat, in Sound settings on Home or the beat command, plays the NexOS beat made from these sounds. Beat style, next to it, or beat list and beat and a style in Terminal, picks which version plays.",
  "Insomnia OS, Easyconvert and Meme Projects: each one's button plays its own little tune. In Easyconvert, choosing files is a soft tick, Convert a bright double blip, a finished conversion three rising notes, Download a paper flick and Copy a short beep. Insomnia OS keeps its own chimes, baa, soundscapes and volume, the same as on its own site. Meme Projects is silent.",
  "Store and system sounds stay the same: rising chime for install, falling pair for uninstall, low double buzz for errors.",
];
function setKeySounds(on, speak) {
  keySounds = !!on; save("key_sounds", keySounds); keysEl.checked = keySounds;
  if (speak) { line("Typing clicks " + (keySounds ? "on" : "off") + ".", "ok"); play(keySounds ? "on" : "off"); }
}
function setVolume(n, speak) {
  volume = Math.max(0, Math.min(150, Math.round(n / 5) * 5)); save("volume", volume); applyVolume();
  volEl.value = volume; volOut.textContent = volume + "%"; volEl.setAttribute("aria-valuetext", volume ? volume + " percent" : "silent");
  if (speak) { play("vol", volume); line("Volume " + volume + " percent.", "ok"); }
}

/* ---------- choices (touch buttons) ---------- */
function shellChoices() {
  const c = [{ label: "Help", cmd: "help" }, { label: "App Store", cmd: "store" }, { label: "My apps", cmd: "apps" }];
  catalog.filter((a) => isInstalled(a.id)).forEach((a) => c.push({ label: a.name, cmd: a.id }));
  return c.concat([{ label: "Files", cmd: "files" }, { label: muted ? "Sound on" : "Sound off", cmd: muted ? "sound on" : "sound off" }, { label: "Clear screen", cmd: "clear" }]);
}
let lastChoiceKey = "";
function appIdleChoices() {
  const a = appMeta(CTX.app.appId);
  return (a ? [{ label: "Run " + a.name + " again", cmd: a.id }] : []).concat([{ label: "Close", cmd: "q" }]);
}
function renderChoices(focusLabel) {
  const list = mode ? mode.choices() : cur === CTX.app ? appIdleChoices() : shellChoices();
  const key = (mode ? mode.label : "shell") + "|" + list.map((c) => c.label).join("|");
  if (key !== lastChoiceKey) {
    lastChoiceKey = key;
    choicesEl.replaceChildren(...list.map((c) => {
      const li = document.createElement("li"), b = document.createElement("button");
      b.type = "button"; b.textContent = c.label;
      if (c.note !== undefined) { b.dataset.note = c.note; b.setAttribute("aria-label", "Note " + c.label); }
      else if (c.fill !== undefined) b.dataset.fill = c.fill;
      else b.dataset.cmd = c.cmd;
      li.appendChild(b); return li;
    }));
  }
  if (focusLabel !== undefined) {
    const btns = [...choicesEl.querySelectorAll("button")];
    const same = btns.find((b) => b.textContent === focusLabel);
    (same || btns[0] || input).focus();
  }
}
function onChoice(e) {
  const b = e.target.closest("button"); if (!b) return;
  gesture();
  if (b.dataset.note !== undefined) { mode && mode.key && mode.key(b.dataset.note); return; } // piano keys keep their notes
  const label = b.textContent, snd = soundFor(label, b.dataset.cmd, b.dataset.fill !== undefined);
  if (snd) play(snd[0], snd[1]);
  if (b.dataset.fill !== undefined) { input.value = b.dataset.fill; input.focus(); return; }
  const before = mode;
  if (run(b.dataset.cmd, true)) return; // the app closed and focus went back to Home
  if (cur === CTX.app && mode && mode !== before) { renderChoices(); appH.focus(); return; } // a new app opened in the window: announce its name
  renderChoices(label);
}
CTX.terminal.choices.addEventListener("click", onChoice);
CTX.app.choices.addEventListener("click", onChoice);

/* ---------- running a command ---------- */
const history = []; let hIdx = 0;
// Returns true when the command closed the view (then focus is already on Home).
function run(raw, fromButton) {
  const shown = raw === "" ? "(Enter)" : raw;
  try {
    const t = raw.trim().toLowerCase();
    if (mode && mode !== NameAsk && (t === "q" || t === "quit" || t === "exit")) { const msg = mode.quitMsg ? mode.quitMsg() : null; quitApp(msg); }
    else if (!mode && cur === CTX.app && (t === "q" || t === "quit" || t === "exit" || t === "close")) closeAfterRun = true;
    else if (mode && mode !== NameAsk && (t === "h" || t === "help" || t === "?")) mode.help();
    else if (mode) mode.input(raw);
    else shell(raw);
  } catch (e) { line("Something went wrong: " + e.message, "err"); }
  if (closeAfterRun) { closeAfterRun = false; pending = null; closeView(!fromButton); if (afterClose) { const f = afterClose; afterClose = null; f(); } return true; }
  if (openAfterRun) { const id = openAfterRun, from = view; openAfterRun = null; flush(shown); renderChoices(); openView("app:" + id); returnTo = from === "terminal" ? "terminal" : null; return true; }
  flush(shown);
  renderChoices();
  return false;
}
// One way in for every submit, so a braille display's Enter, a keyboard Enter, the on-screen Go key,
// a stray newline and the Run button all run the command exactly once.
let lastSubmitAt = -1e9;
function doSubmit(how) {
  const t = performance.now();
  if (t - lastSubmitAt < 250 && !input.value.replace(/[\r\n\s]+/g, "")) return; // the same Enter arriving by a second route (its text is already used)
  lastSubmitAt = t;
  gesture();
  play(how === "button" ? "run" : "enter");
  const raw = input.value.replace(/[\r\n]+/g, " ").replace(/\s+$/, ""); input.value = "";
  if (raw.trim()) { history.push(raw); if (history.length > 50) history.shift(); }
  hIdx = history.length;
  if (run(raw)) return;
  input.focus();
}
const isEnter = (e) => (e.key === "Enter" || e.keyCode === 13 || e.which === 13) && !e.isComposing && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey;
function onSubmit(e) { e.preventDefault(); doSubmit(e.submitter && e.submitter.type === "submit" ? "button" : "enter"); }
form.addEventListener("submit", onSubmit);
appForm.addEventListener("submit", onSubmit);
function onKeydown(e) {
  if (isEnter(e)) { e.preventDefault(); doSubmit("enter"); return; }
  if (/^Arrow/.test(e.key) && !e.altKey && !e.metaKey && !e.ctrlKey) play("arrow");
  if (e.key === "ArrowUp" && history.length) { e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx] || ""; }
  else if (e.key === "ArrowDown" && history.length) { e.preventDefault(); hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ""; }
  else if (mode && mode.keyMode && !e.ctrlKey && !e.metaKey && !e.altKey && input.value === "" && /^[0-9]$/.test(e.key)) { gesture(); if (mode.key(e.key)) e.preventDefault(); }
}
function onBeforeInput(e) {
  if (e.inputType === "insertLineBreak" || e.inputType === "insertParagraph" || (/^insert/.test(e.inputType || "") && /[\r\n]/.test(e.data || ""))) { e.preventDefault(); doSubmit("enter"); }
}
document.addEventListener("keydown", () => ensureAudio(), { once: true });
document.addEventListener("keydown", (e) => { if (e.key === "Tab" && !e.altKey && !e.metaKey && !e.ctrlKey) play("tab"); });
// Typing clicks come from the input event, so on-screen keyboards (iPhone, VoiceOver typing) click too.
function onInput(e) {
  if (/[\r\n]/.test(input.value) || /[\r\n]/.test(e.data || "")) { doSubmit("enter"); return; } // a newline slipped in (some braille displays and pastes)
  const it = e.inputType || "insertText", d = e.data || "";
  if (/^delete/.test(it)) return play("backspace");
  if (!/^insert/.test(it) || it === "insertLineBreak") return;
  const ch = d.slice(-1);
  if (ch === " ") return play("space");
  if (mode && mode.label === "Calculator") { if (/[0-9]/.test(ch)) return play("calcdigit", +ch); if (/[-+*\/x×÷^%()=]/.test(ch)) return play("calcop"); }
  play("key");
}
for (const el of [CTX.terminal.input, CTX.app.input]) { el.addEventListener("keydown", onKeydown); el.addEventListener("beforeinput", onBeforeInput); el.addEventListener("input", onInput); }

/* ---------- sound controls ---------- */
const volEl = $("#vol"), volOut = $("#vol-out"), muteBtn = $("#mute");
volEl.addEventListener("input", () => { setVolume(+volEl.value, false); });
volEl.addEventListener("change", () => { gesture(); play("vol", volume); });
const soundStatus = $("#sound-status");
function soundSay(t) { soundStatus.textContent = ""; setTimeout(() => { soundStatus.textContent = t; }, 30); }
muteBtn.addEventListener("click", () => { gesture(); setMuted(!muted, false); soundSay(muted ? "Sound off." : "Sound on."); renderChoices(); });
const keysEl = $("#key-sounds"); keysEl.checked = keySounds;
keysEl.addEventListener("change", () => { gesture(); setKeySounds(keysEl.checked, false); play(keySounds ? "on" : "off"); });
$("#test-sound").addEventListener("click", () => { gesture(); if (muted) { soundSay("Sound is muted. Press Mute to turn it back on."); return; } SFX.install(); });
setVolume(volume, false); setMuted(muted, "silent");

/* ---------- Home, views and focus ---------- */
// Home is a list of app buttons. Each opens a view: focus moves to the view's heading on open,
// and back to the button that opened it on close (Close button, or Escape).
const VIEWS = { home: $("#home"), terminal: $("#terminal-view"), app: $("#app-view"), about: $("#about-view"), insomnia: $("#insomnia-view"), easyconvert: $("#easyconvert-view"), memes: $("#memes-view") };
const HEADS = { home: $("#home-h"), terminal: $("#term-h"), app: appH, about: $("#about-h"), insomnia: $("#ins-h"), easyconvert: $("#ec-h"), memes: $("#memes-h") };
const FRAMES = { insomnia: $("#ins-frame"), memes: $("#memes-frame") }; // Insomnia OS and Meme Projects: their own sites' files, in a frame
let view = "home", opener = null, returnTo = null;
function leaveAppWindow() { if (view === "app") { if (mode && mode.onQuit) mode.onQuit(); mode = null; CTX.app.mode = null; useCtx(CTX.terminal); } }
function frameSoundscape(k) { try { const w = FRAMES[k] && FRAMES[k].contentWindow; return !!(w && w.__nexosEmbed && w.__nexosEmbed.soundscape()); } catch (e) { return false; } }
// Battery: a closed app's frame is unloaded (its timers, sounds and animation stop), except an Insomnia soundscape you left playing.
function unloadFrame(k) { const f = FRAMES[k]; if (f && f.getAttribute("src")) f.removeAttribute("src"); }
function launcherItems() {
  const c = [{ id: "terminal", label: "Terminal", desc: "command line" }, { id: "store", label: "App Store", desc: catalog.length + " apps" }];
  catalog.filter((a) => isInstalled(a.id) && a.id !== "sysinfo").forEach((a) => c.push({ id: "app:" + a.id, label: a.name }));
  c.push({ id: "files", label: "Files" }, { id: "about", label: "About this NexOS", desc: "and system info" });
  return c;
}
const staticLaunch = [...launcherEl.querySelectorAll("li.static")]; // plain links kept from the page (Boot the real kernel)
function renderLauncher() {
  launcherEl.replaceChildren(...launcherItems().map((it) => {
    const li = document.createElement("li"), b = document.createElement("button");
    b.type = "button"; b.dataset.open = it.id; b.textContent = it.label;
    if (it.desc) { const s = document.createElement("span"); s.className = "desc"; s.textContent = ", " + it.desc; b.appendChild(s); }
    li.appendChild(b); return li;
  }), ...staticLaunch);
}
function launcherSound(id) {
  if (id === "terminal") return ["terminal"]; if (id === "store") return ["store"]; if (id === "files") return ["files"];
  if (id === "sound") return ["settings"]; if (id === "about") return ["aboutapp"];
  return ["app", id.slice(4)];
}
function show(v) {
  for (const k in VIEWS) VIEWS[k].hidden = k !== v;
  view = v; document.body.dataset.view = v;
  if (v === "home" || v === "terminal") save("view", v);
}
let termGreeted = false;
function openView(id, focus = true) {
  opener = id;
  if (id === "terminal") {
    useCtx(CTX.terminal); show("terminal");
    if (!termGreeted) { termGreeted = true; greetLine(); }
    setMode(mode); renderChoices();
  } else if (id === "about") { renderAbout(); show("about"); }
  else if (WINDOW_APPS[id.slice(4)]) {
    const k = WINDOW_APPS[id.slice(4)];
    leaveAppWindow();
    if (FRAMES[k] && !FRAMES[k].getAttribute("src")) FRAMES[k].setAttribute("src", FRAMES[k].dataset.src);
    if (k === "easyconvert") EC.open();
    show(k);
  }
  else {
    useCtx(CTX.app); CTX.app.log.replaceChildren(); pending = null;
    const appId = id === "store" ? "store" : id === "files" ? "files" : id.slice(4);
    CTX.app.appId = appId === "store" || appId === "files" ? null : appId;
    mode = null;
    if (appId === "store") { setMode(Store); Store.start(); }
    else if (appId === "files") { setMode(Files); Files.start(); }
    else { setMode(null); launch(appId); }
    flush(); lastChoiceKey = ""; renderChoices();
    show("app");
  }
  if (focus) HEADS[view].focus();
}
function closeView(silent) {
  if (view === "home") return;
  leaveAppWindow();
  if (FRAMES[view]) {
    if (view === "insomnia" && frameSoundscape("insomnia")) { const s = $("#status"); s.textContent = ""; setTimeout(() => { s.textContent = "Your Insomnia OS soundscape keeps playing. Open Insomnia OS again to change or stop it."; }, 60); }
    else unloadFrame(view);
  }
  if (!silent) play("back");
  if (returnTo === "terminal") { returnTo = null; openView("terminal", false); input.focus(); return; }
  show("home"); renderLauncher();
  const b = opener && launcherEl.querySelector('[data-open="' + opener + '"]');
  (b || HEADS.home).focus();
}
launcherEl.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-open]"); if (!b) return;
  gesture(); const s = launcherSound(b.dataset.open); play(s[0], s[1]);
  returnTo = null; openView(b.dataset.open);
});
$(".skip").addEventListener("click", (e) => { e.preventDefault(); HEADS[view].focus(); }); // skip to the open view's heading
document.addEventListener("click", (e) => { const b = e.target.closest("[data-close]"); if (!b) return; gesture(); closeView(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && view !== "home" && !e.defaultPrevented) { e.preventDefault(); gesture(); closeView(); } });
// Escape pressed inside Insomnia OS or Meme Projects (when nothing inside used it) closes the app, the same as everywhere else.
window.addEventListener("message", (e) => {
  if (e.origin !== location.origin || !e.data || e.data.nexos !== "escape") return;
  const k = Object.keys(FRAMES).find((x) => FRAMES[x].contentWindow === e.source);
  if (k && view === k) { gesture(); closeView(); }
});

/* ---- Sound settings: a disclosure on Home, collapsed by default, remembered ---- */
const soundToggle = $("#sound-toggle"), soundPanel = $("#sound-panel");
function setSoundOpen(open, withSound) {
  soundToggle.setAttribute("aria-expanded", String(open)); soundPanel.hidden = !open; save("sound_open", open);
  if (withSound) play(open ? "settings" : "back");
}
setSoundOpen(load("sound_open", false), false);
soundToggle.addEventListener("click", () => { gesture(); setSoundOpen(soundPanel.hidden, true); });
// settings and sound (on their own) in Terminal: go Home, open Sound settings and land on Beat style.
function openSoundSettings() {
  setSoundOpen(true, true); loadGenres();
  const sel = $("#beat-genre"); (sel || soundToggle).focus();
  soundSay("Sound settings opened. You're on Beat style. Volume, Mute and Listen to the beat are here too.");
}
function openSoundFromShell() {
  if (cur !== CTX.terminal) { openSoundSettings(); return; }
  closeAfterRun = true; afterClose = openSoundSettings; line("Opening Sound settings.", "dimt");
}

/* ---- Listen to the beat: the NexOS beat, played through the same volume, mute and limiter ---- */
const BEAT_TITLE = "NexOS Morning to Night", beatAudio = $("#beat-audio"), beatBtn = $("#beat");
let beatNode = null;
// Beat styles: beat/genres.json lists [{ id, label, file, seconds }]. Without it, only the original beat is offered.
const BEAT_ORIGINAL = { id: "original", label: "Original", file: "../beat/nexos-beat.m4a", seconds: 69 };
let beatGenres = [BEAT_ORIGINAL], beatGenre = load("beat_genre", "original"), genresLoading = null;
const genreSel = $("#beat-genre");
const genreFile = (g) => (/:/.test(g.file) ? g.file : /^beat\//.test(g.file) ? "../" + g.file : /\//.test(g.file) ? g.file : "../beat/" + g.file);
const curGenre = () => beatGenres.find((g) => g.id === beatGenre) || beatGenres[0];
function renderGenres() {
  genreSel.replaceChildren(...beatGenres.map((g) => { const o = document.createElement("option"); o.value = g.id; o.textContent = g.label; return o; }));
  genreSel.value = curGenre().id;
}
function loadGenres() {
  if (genresLoading) return genresLoading;
  genresLoading = fetch("../beat/genres.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).then((list) => {
    if (!Array.isArray(list)) return;
    const ok = list.filter((g) => g && typeof g.id === "string" && typeof g.file === "string" && /^[\w-]{1,40}$/.test(g.id)).map((g) => ({ id: g.id, label: String(g.label || g.id).slice(0, 60), file: g.file, seconds: +g.seconds || 0 }));
    beatGenres = [BEAT_ORIGINAL].concat(ok.filter((g) => g.id !== "original"));
    const o = ok.find((g) => g.id === "original"); if (o) beatGenres[0] = Object.assign({}, BEAT_ORIGINAL, o, { label: o.label || "Original" });
  }).catch(() => {}).then(() => { renderGenres(); return beatGenres; });
  return genresLoading;
}
function setGenre(id, say) {
  const g = beatGenres.find((x) => x.id === id); if (!g) return false;
  const was = beatPlaying(); if (was) stopBeatHook();
  beatGenre = g.id; save("beat_genre", g.id); genreSel.value = g.id;
  if (say) say("Beat style: " + g.label + "." + (was ? " Press Listen to the beat to hear it." : ""));
  return true;
}
renderGenres();
function beatLength() { const g = curGenre(); return isFinite(beatAudio.duration) && beatAudio.duration > 0 ? spoken(beatAudio.duration * 1000) : g.seconds ? spoken(g.seconds * 1000) : "1 minute 9 seconds"; }
function beatPlaying() { return !beatAudio.paused && !beatAudio.ended; }
function setBeatUI(on) { beatBtn.setAttribute("aria-pressed", String(on)); beatBtn.textContent = on ? "Stop the beat" : "Listen to the beat"; }
function beatToggle(say) {
  gesture();
  if (beatPlaying()) { beatAudio.pause(); beatAudio.currentTime = 0; setBeatUI(false); play("back"); say("Stopped."); return; }
  if (muted) { say("Sound is muted. Turn sound on to hear the beat."); return; }
  const g = curGenre(), src = genreFile(g);
  if (beatAudio.getAttribute("src") !== src) { beatAudio.setAttribute("src", src); try { beatAudio.load(); } catch (e) {} }
  try { if (ac && !beatNode && ac.createMediaElementSource) { beatNode = ac.createMediaElementSource(beatAudio); beatNode.connect(amb); } } catch (e) { beatNode = null; }
  if (!beatNode) beatAudio.volume = Math.min(1, volume / 150);
  beatAudio.currentTime = 0;
  setBeatUI(true); say("Playing " + BEAT_TITLE + ", " + (g.id === "original" ? "" : g.label + ", ") + beatLength() + ".");
  const p = beatAudio.play();
  if (p && p.catch) p.catch(() => { setBeatUI(false); say("This browser couldn't play the beat."); });
}
stopBeatHook = () => { if (beatPlaying()) { beatAudio.pause(); beatAudio.currentTime = 0; setBeatUI(false); } };
beatAudio.addEventListener("ended", () => { setBeatUI(false); soundSay(BEAT_TITLE + " finished."); });
beatBtn.addEventListener("click", () => beatToggle(soundSay));
genreSel.addEventListener("change", () => { gesture(); play("nav"); setGenre(genreSel.value, soundSay); });
genreSel.addEventListener("focus", () => { loadGenres(); }, { once: true });
soundToggle.addEventListener("click", () => { if (!soundPanel.hidden) loadGenres(); });
if (!soundPanel.hidden) loadGenres();

/* ---- Easyconvert: a native port of the Easyconvert repo's default branch (same formats, same results, same file names) ---- */
// Everything runs in this browser: files are read with the File API and never uploaded. JSZip (for DOCX and ZIP) is a local copy, loaded on first use.
const EC = (() => {
  const ecIn = $("#ec-input"), ecFmt = $("#ec-format"), ecList = $("#ec-list"), ecStatus = $("#ec-status");
  let files = [], results = [], format = "txt", zipLoading = null;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function say(t) { ecStatus.textContent = ""; setTimeout(() => { ecStatus.textContent = t; }, 40); }
  function zip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    return zipLoading || (zipLoading = new Promise((ok, no) => { const s = document.createElement("script"); s.src = "../apps/easyconvert/jszip.min.js"; s.onload = () => ok(window.JSZip); s.onerror = () => { zipLoading = null; no(Error("the ZIP helper didn't load")); }; document.head.appendChild(s); }));
  }
  function save(n, d, t) { const a = document.createElement("a"), u = URL.createObjectURL(d instanceof Blob ? d : new Blob([d], { type: t })); a.href = u; a.download = n; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1e3); }
  async function docx(text) {
    const JSZip = await zip(), z = new JSZip(), body = text.split(/\r?\n/).map((x) => '<w:p><w:r><w:t xml:space="preserve">' + esc(x) + "</w:t></w:r></w:p>").join("");
    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body + "<w:sectPr/></w:body></w:document>";
    if (!body || !xml.includes("<w:t")) throw Error("DOCX text generation failed");
    z.file("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
    z.file("_rels/.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    z.file("word/_rels/document.xml.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>');
    z.file("word/document.xml", xml);
    return z.generateAsync({ type: "blob" });
  }
  async function convert(f) {
    const raw = await f.text();
    if (format === "docx") return { data: await docx(raw), type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", preview: raw };
    return { data: format === "json" ? JSON.stringify({ filename: f.name, content: raw }, null, 2) : raw, type: "text/plain", preview: raw };
  }
  const outName = (f) => f.name.replace(/\.[^.]+$/, "") + "." + (format === "docx" ? "docx" : format === "json" ? "json" : "txt");
  function render() {
    if (!files.length) { ecList.replaceChildren(Object.assign(document.createElement("p"), { textContent: "No files selected." })); return; }
    const ul = document.createElement("ul"); ul.className = "ec-files";
    files.forEach((f, i) => {
      const li = document.createElement("li"), b = document.createElement("button"), c = document.createElement("button"), d = document.createElement("button"), p = document.createElement("pre");
      const pid = "ec-pre-" + i;
      b.type = c.type = d.type = "button"; b.className = "ec-name"; b.textContent = f.name;
      b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", pid);
      b.onclick = () => { gesture(); p.hidden = !p.hidden; b.setAttribute("aria-expanded", String(!p.hidden)); play(p.hidden ? "back" : "page"); };
      c.innerHTML = 'Copy<span class="sr-only"> ' + esc(f.name) + "</span>";
      c.onclick = () => { gesture(); play("confirm"); const t = results[i] ? results[i].preview : ""; const done = () => say(t ? "Copied " + f.name + "." : "Convert first, then copy."); try { navigator.clipboard.writeText(t).then(done, () => say("Copy didn't work in this browser.")); } catch (e) { say("Copy didn't work in this browser."); } };
      d.innerHTML = 'Download<span class="sr-only"> ' + esc(f.name) + "</span>";
      d.onclick = () => { gesture(); const x = results[i]; if (!x) { SFX.error(); say("Convert first, then download."); return; } play("files"); save(outName(f), x.data, x.type); say("Downloading " + outName(f) + "."); };
      p.id = pid; p.hidden = true; p.tabIndex = 0; p.setAttribute("aria-label", "Preview of " + f.name); p.textContent = results[i] ? results[i].preview : "Not converted yet.";
      const row = document.createElement("div"); row.className = "ec-actions"; row.append(b, c, d);
      li.append(row, p); ul.appendChild(li);
    });
    ecList.replaceChildren(ul);
  }
  ecIn.addEventListener("change", (e) => { gesture(); files.push(...e.target.files); play("fill"); render(); say(plural(files.length, "file") + " selected."); });
  ecFmt.addEventListener("change", () => play("nav"));
  $("#ec-convert").addEventListener("click", async () => {
    gesture(); format = ecFmt.value; results = [];
    if (!files.length) { SFX.error(); say("Choose one or more files first."); return; }
    play("run");
    try { for (const f of files) results.push(await convert(f)); render(); SFX.update(); say("Conversion complete as " + format.toUpperCase()); }
    catch (e) { SFX.error(); say("Conversion failed: " + e.message); }
  });
  $("#ec-download-all").addEventListener("click", async () => {
    gesture();
    if (!results.length) { SFX.error(); say("Convert first, then download."); return; }
    try { const JSZip = await zip(), z = new JSZip(); results.forEach((x, i) => z.file(files[i].name.replace(/\.[^.]+$/, "") + "." + format, x.data)); play("files"); save("Easyconvert-converted-files.zip", await z.generateAsync({ type: "blob" }), "application/zip"); say("Downloading Easyconvert-converted-files.zip."); }
    catch (e) { SFX.error(); say("Download failed: " + e.message); }
  });
  render();
  return { open() {}, get state() { return { files: files.length, results: results.length, format }; }, outputs: () => results.map((r, i) => ({ name: files[i] && outName(files[i]), type: r.type })) };
})();

/* ---- About this NexOS window ---- */
const aboutBody = $("#about-body"), aboutStatus = $("#about-status");
function el(tag, text, attrs) { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; for (const k in (attrs || {})) n.setAttribute(k, attrs[k]); return n; }
function renderAbout() {
  const a = aboutInfo(), frag = document.createDocumentFragment();
  frag.appendChild(el("h3", "What NexOS is"));
  a.what.forEach((t) => frag.appendChild(el("p", t)));
  frag.appendChild(el("h3", "System info", { id: "sysinfo-h" }));
  const dl = el("dl", undefined, { class: "facts", "aria-labelledby": "sysinfo-h" });
  a.facts.forEach(([k, v]) => { const d = el("div"); d.appendChild(el("dt", k)); d.appendChild(el("dd", v)); dl.appendChild(d); });
  frag.appendChild(dl);
  frag.appendChild(el("h3", "Credits"));
  a.credits.slice(0, -1).forEach((t) => frag.appendChild(el("p", t)));
  const p = el("p", "Source code and authors: "), link = el("a", "github.com/2three1y/nexos", { href: "https://github.com/2three1y/nexos" }); p.appendChild(link); frag.appendChild(p);
  const r = el("p", "Try the actual kernel: "); r.appendChild(el("a", "the real NexOS kernel in your browser", { href: "../real/" })); frag.appendChild(r);
  aboutBody.replaceChildren(frag);
}
$("#about-refresh").addEventListener("click", () => { gesture(); play("refresh"); renderAbout(); aboutStatus.textContent = ""; setTimeout(() => { aboutStatus.textContent = "System info refreshed. Uptime " + spoken(Date.now() - bootTime) + "."; }, 30); });

/* ---------- start ---------- */
function greetLine() {
  const boot = CTX.terminal.log.querySelector(".boot");
  if (!boot) return;
  if (!named()) { setMode(NameAsk); const p = document.createElement("p"); p.className = "hi"; p.textContent = "What should I call you? Type a name and press Enter, or type skip."; boot.appendChild(p); }
  else if (userName) { const p = document.createElement("p"); p.className = "hi"; p.textContent = "Welcome back, " + userName + "."; boot.appendChild(p); }
}
renderLauncher();
if (load("view", "home") === "terminal") openView("terminal", false); else show("home");
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
// Render button/key sounds offline through the same limiter chain (used for the demo WAV and the peak test).
async function renderOffline(items, opts = {}) {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, rate = opts.rate || 44100, gap = opts.gap || 0.6;
  const off = new OAC(1, Math.ceil(rate * (items.length * gap + 0.5)), rate);
  const saved = { ac, master, sfx, amb, muted, tBase };
  try {
    ac = off; ({ master, sfx, amb } = makeChain(off)); master.gain.value = gainFor(opts.volume == null ? 100 : opts.volume); muted = false;
    items.forEach(([id, arg], i) => { tBase = i * gap + 0.05; (UI[id] || SFX[id])(arg); });
  } finally { ({ ac, master, sfx, amb, muted, tBase } = saved); }
  return off.startRendering();
}
window.__looscid = { run, sfxLog, ui: UI, sfx: SFX, /* Looscid port: lets looscid-bridge.js hand these sounds to Looscid's earcons when embedded */ renderOffline, soundIds: Object.keys(UI), get voices() { return voices; }, get keySounds() { return keySounds; }, get mode() { return mode ? mode.label : "Shell"; }, get view() { return view; }, openView, closeView, get audio() { return !!ac; } };
})();
