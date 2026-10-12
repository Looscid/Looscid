// NexOS real kernel in the browser: v86 boots nexos-i686.iso, and the
// kernel's serial console (COM1) is wired to an accessible log and a text box.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const statusEl = $("status"), log = $("log"), cmd = $("cmd"), live = $("live");
  const soundBox = $("sound"), vol = $("vol"), volOut = $("vol-out");
  const PROMPT = "nexos> ";
  let emulator = null, ready = false;

  function setStatus(text) { if (statusEl.textContent !== text) statusEl.textContent = text; }

  // ---------- serial output -> accessible log ----------
  // Bytes are gathered and shown one block per command (when NexOS prints its
  // prompt, or after a short pause), so a screen reader hears each reply once.
  let pending = "", flushTimer = 0, afterPrompt = false;
  function addEntry(text, withPrompt) {
    const pre = document.createElement("pre");
    pre.className = "entry";
    if (withPrompt) {
      const p = document.createElement("span");
      p.className = "prompt"; p.setAttribute("aria-hidden", "true"); p.textContent = PROMPT;
      pre.appendChild(p);
    }
    pre.appendChild(document.createTextNode(text));
    log.appendChild(pre);
    while (log.childElementCount > 300) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }
  function clean(s) {
    s = s.replace(/\r/g, "");
    let out = "";
    for (const ch of s) {
      if (ch === "\b") out = out.slice(0, -1);
      else if (ch === "\x1b" || ch === "\x07") continue;
      else out += ch;
    }
    return out;
  }
  function flush() {
    clearTimeout(flushTimer); flushTimer = 0; firstPending = 0;
    if (!pending) return;
    lastFlush = performance.now();
    let text = clean(pending); pending = "";
    let endsWithPrompt = false;
    if (text.endsWith(PROMPT)) { text = text.slice(0, -PROMPT.length); endsWithPrompt = true; }
    text = text.replace(/\n+$/, "");
    if (text.trim()) addEntry(text, afterPrompt);
    if (endsWithPrompt) {
      afterPrompt = true;
      if (!ready) { ready = true; setStatus("Ready. NexOS is waiting for a command."); log.setAttribute("aria-busy", "false"); document.documentElement.setAttribute("data-nexos", "ready"); }
    } else if (text.trim()) {
      afterPrompt = false;
    }
  }
  // Throttle for screen readers: one entry after a 250 ms pause, but never sooner than
  // 700 ms after the last entry, and never holding text back for more than 1.5 s.
  let lastFlush = 0, firstPending = 0;
  function scheduleFlush() {
    const now = performance.now();
    if (!firstPending) firstPending = now;
    const wait = Math.max(250, 700 - (now - lastFlush));
    const due = Math.min(now + wait, firstPending + 1500);
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, Math.max(0, due - now));
  }
  function onSerialByte(b) {
    pending += String.fromCharCode(b);
    if (pending.endsWith(PROMPT)) { flush(); return; }
    scheduleFlush();
  }

  // ---------- typing into serial ----------
  function send(text) {
    if (!emulator) return;
    unlockAudio();
    emulator.serial0_send(text);
  }
  // Enter sends the line. Braille displays (VoiceOver on iOS and macOS) don't
  // always deliver Enter as a normal key press or a form submit: it may come as
  // a keydown with only keyCode 13, a NumpadEnter code, an insertLineBreak /
  // insertParagraph input event, or a stray newline in the box. Every one of
  // those sends exactly once; a second trigger for the same press is dropped.
  const LINE_TYPES = { insertLineBreak: 1, insertParagraph: 1 };
  const hasNL = (s) => typeof s === "string" && /[\r\n]/.test(s);
  const stripNL = (s) => s.replace(/[\r\n]+/g, "");
  let lastLine = { t: -1e9, src: "" };
  function isEnterKey(e) {
    return e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter" ||
      e.keyCode === 13 || e.which === 13;
  }
  function sendLine(src) {
    const now = performance.now();
    if (cmd.value && hasNL(cmd.value)) cmd.value = stripNL(cmd.value);
    // The same Enter seen by a second path (e.g. keydown, then submit) a moment
    // later finds the box already emptied by the first: that's one press, not two.
    // New text in the box means a new command, so it always goes.
    if (src !== lastLine.src && now - lastLine.t < 300 && !cmd.value) return false;
    lastLine = { t: now, src };
    if (live.checked) { send("\r"); cmd.value = ""; }
    else { send(cmd.value + "\r"); cmd.value = ""; }
    if (document.activeElement !== cmd) cmd.focus();
    return true;
  }
  $("send-form").addEventListener("submit", (e) => {
    e.preventDefault();
    sendLine("submit");
  });
  cmd.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    if (isEnterKey(e)) {
      e.preventDefault(); // also stops the implicit submit, so one send
      if (!e.repeat) sendLine("key");
      return;
    }
    if (!live.checked) return;
    let k = null;
    if (e.key === "Backspace") k = "\b";
    else if (e.key === "Escape") k = "\x1b";
    else if (e.key && e.key.length === 1) k = e.key;
    if (k !== null) { e.preventDefault(); send(k); }
  });
  // A keypress Enter only arrives if keydown didn't handle it (keydown's
  // preventDefault suppresses it); some assistive input sends only this.
  cmd.addEventListener("keypress", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isEnterKey(e)) { e.preventDefault(); sendLine("keypress"); }
  });
  cmd.addEventListener("beforeinput", (e) => {
    if (LINE_TYPES[e.inputType] || (e.inputType === "insertText" && hasNL(e.data))) {
      if (e.cancelable) e.preventDefault();
      if (e.inputType === "insertText" && e.data && !live.checked) {
        const before = stripNL(e.data.split(/[\r\n]/)[0]);
        if (before) cmd.value += before;
      }
      sendLine("beforeinput");
    }
  });
  cmd.addEventListener("input", (e) => {
    if (LINE_TYPES[e.inputType] || hasNL(e.data) || hasNL(cmd.value)) {
      sendLine("input");
    }
  });
  document.querySelectorAll("button[data-key]").forEach((btn) => {
    btn.addEventListener("click", () => send(btn.dataset.key));
  });

  // ---------- PC speaker -> Web Audio ----------
  // v86 emulates the PC speaker hardware (PIT channel 2 + port 0x61) and
  // reports it as events. We play those through our own chain:
  // square oscillator -> volume -> limiter -> speakers, created only after
  // the first click or key press (browsers block sound before that).
  let ac = null, osc = null, gate = null, master = null;
  let spkOn = false, spkFreq = 0;
  const saved = (() => { try { return JSON.parse(localStorage.getItem("nexos-real-sound") || "{}"); } catch (e) { return {}; } })();
  if (typeof saved.on === "boolean") soundBox.checked = saved.on;
  if (typeof saved.vol === "number") vol.value = String(saved.vol);
  volOut.textContent = vol.value + "%";
  function save() { try { localStorage.setItem("nexos-real-sound", JSON.stringify({ on: soundBox.checked, vol: +vol.value })); } catch (e) {} }
  function masterLevel() { return soundBox.checked ? 0.22 * (+vol.value / 100) : 0; }
  function unlockAudio() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    osc = ac.createOscillator(); osc.type = "square"; osc.frequency.value = 440;
    const soften = ac.createBiquadFilter(); soften.type = "lowpass"; soften.frequency.value = 7000;
    gate = ac.createGain(); gate.gain.value = 0;
    master = ac.createGain(); master.gain.value = masterLevel();
    const limiter = ac.createDynamicsCompressor();
    limiter.threshold.value = -10; limiter.knee.value = 0; limiter.ratio.value = 20;
    limiter.attack.value = 0.002; limiter.release.value = 0.08;
    osc.connect(soften).connect(gate).connect(master).connect(limiter).connect(ac.destination);
    osc.start();
    applySpeaker();
  }
  function applySpeaker() {
    if (!ac) return;
    const t = ac.currentTime;
    if (spkFreq > 0) osc.frequency.setValueAtTime(Math.min(spkFreq, 20000), t);
    gate.gain.setTargetAtTime(spkOn && spkFreq > 0 ? 1 : 0, t, 0.003);
    clearTimeout(quietTimer);
    if (spkOn && spkFreq > 0) { if (ac.state === "suspended" && !document.hidden) ac.resume().catch(() => {}); }
    else quietTimer = setTimeout(() => { if (ac && ac.state === "running" && !(spkOn && spkFreq > 0)) ac.suspend().catch(() => {}); }, 15000);
  }
  let quietTimer = null;
  soundBox.addEventListener("change", () => { save(); if (master) master.gain.setTargetAtTime(masterLevel(), ac.currentTime, 0.01); });
  vol.addEventListener("input", () => { volOut.textContent = vol.value + "%"; save(); if (master) master.gain.setTargetAtTime(masterLevel(), ac.currentTime, 0.01); });
  ["pointerdown", "keydown"].forEach((ev) => document.addEventListener(ev, unlockAudio, { capture: true }));

  // ---------- scale the VGA screen to fit (no horizontal scroll) ----------
  const wrap = $("screen-wrap"), screen = $("screen");
  function fit() {
    const w = screen.scrollWidth || 720, h = screen.scrollHeight || 400;
    const s = Math.min(1, wrap.clientWidth / w);
    screen.style.transform = "scale(" + s + ")";
    wrap.style.height = Math.ceil(h * s) + "px";
  }
  window.addEventListener("resize", fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(screen);

  // ---------- boot ----------
  if (typeof WebAssembly !== "object" || typeof V86 !== "function") {
    setStatus("Sorry, this browser can't run the emulator (it needs WebAssembly).");
    return;
  }
  log.setAttribute("aria-busy", "true");
  setStatus("Starting NexOS. This is a big download, about 3.5 MB, so it can take a minute.");
  emulator = new V86({
    wasm_path: "v86/v86.wasm",
    memory_size: 64 * 1024 * 1024,
    vga_memory_size: 2 * 1024 * 1024,
    bios: { url: "v86/seabios.bin" },
    vga_bios: { url: "v86/vgabios.bin" },
    cdrom: { url: "nexos-i686.iso" },
    screen_container: screen,
    autostart: true,
    disable_keyboard: true,
    disable_mouse: true,
    disable_speaker: true,
  });
  emulator.add_listener("serial0-output-byte", onSerialByte);
  // Download progress, spoken at most every 4 seconds so the status doesn't chatter.
  let lastProgress = 0, downloaded = false;
  emulator.add_listener("download-progress", (e) => {
    const now = performance.now();
    if (downloaded || now - lastProgress < 4000 || !e || !e.lengthComputable || !e.total) return;
    lastProgress = now;
    setStatus("Downloading NexOS, file " + (e.file_index + 1) + " of " + e.file_count + ", " + Math.round(100 * e.loaded / e.total) + " percent.");
  });
  emulator.add_listener("download-error", () => {
    setStatus("The download failed. Check your connection, then use Back and open the kernel again.");
  });
  emulator.add_listener("emulator-ready", () => {
    downloaded = true;
    if (!ready) setStatus("Downloaded. Booting NexOS, this takes about half a minute. The console below will say when it's ready.");
  });
  emulator.add_listener("pcspeaker-enable", () => { spkOn = true; applySpeaker(); });
  emulator.add_listener("pcspeaker-disable", () => { spkOn = false; applySpeaker(); });
  emulator.add_listener("pcspeaker-update", (d) => { spkFreq = d[0] === 3 && d[1] > 0 ? 1193182 / d[1] : 0; applySpeaker(); });
  emulator.add_listener("screen-set-size", () => setTimeout(fit, 0));
  // Battery: pause the emulated PC while the tab is hidden, and let the sound engine sleep while the speaker is quiet.
  let pausedByHide = false;
  document.addEventListener("visibilitychange", () => {
    try {
      if (document.hidden) { if (emulator.is_running && emulator.is_running()) { emulator.stop(); pausedByHide = true; } if (ac && ac.state === "running") ac.suspend().catch(() => {}); }
      else if (pausedByHide) { pausedByHide = false; emulator.run(); }
    } catch (e) {}
  });
  document.addEventListener("calmchange", () => setTimeout(fit, 0));

  // ---------- Stop and Back (Looscid port) ----------
  const stopBtn = $("stop"), backBtn = $("back");
  let stoppedByUser = false;
  function quiet() { spkOn = false; if (gate && ac) gate.gain.setValueAtTime(0, ac.currentTime); if (ac && ac.state === "running") ac.suspend().catch(() => {}); }
  stopBtn.addEventListener("click", () => {
    try {
      if (!stoppedByUser) {
        emulator.stop(); quiet(); stoppedByUser = true; pausedByHide = false;
        stopBtn.textContent = "Start NexOS again";
        setStatus("Stopped. NexOS is paused and silent. Start NexOS again to carry on where you left off.");
      } else {
        emulator.run(); stoppedByUser = false;
        stopBtn.textContent = "Stop NexOS";
        setStatus(ready ? "Running again. NexOS is waiting for a command." : "Running again. Still booting NexOS.");
      }
    } catch (e) {}
  });
  // Back: inside Looscid (an embedded frame) it asks Looscid to go back; on its own it goes to
  // ?back= (same site only), else the page you came from on this site, else NexOS Web.
  function backTarget() {
    try {
      const q = new URLSearchParams(location.search).get("back");
      if (q) { const u = new URL(q, location.href); if (u.origin === location.origin) return u.href; }
    } catch (e) {}
    try { if (document.referrer && new URL(document.referrer).origin === location.origin) return document.referrer; } catch (e) {}
    return new URL("../web/", location.href).href;
  }
  backBtn.addEventListener("click", () => {
    try { emulator.stop(); quiet(); } catch (e) {}
    if (window.parent !== window) {
      try {
        window.parent.postMessage({ nexos: "back", from: "real" }, location.origin);
        setTimeout(() => { if (!document.hidden) setStatus("Stopped. Use the Back button above this page to leave the kernel."); }, 800);
        return;
      } catch (e) {}
    }
    location.href = backTarget();
  });
  setTimeout(fit, 0);
  window.nexosEmulator = emulator;
})();
