/* Looscid bridge: loaded by every NexOS page in this folder. It does nothing unless the page is
   open inside Looscid (a same-site parent with Looscid's live region), and it never writes NexOS's own
   saved settings. Inside Looscid:
   - Looscid's settings arrive by postMessage ({looscid: "settings"}) when the page loads and each time
     they change: Sounds on/off and master volume, Calm mode, Reduce Motion, Flash safety, theme,
     high contrast and text size. Each page applies the ones it has a control for.
   - Every Web Audio context the page makes goes through one gain Looscid controls (Sounds off = silent),
     and <audio> elements follow it too.
   - Focus, typing and switches are sent to Looscid, which plays its own pitch cues, earcons and
     keyboard clicks, so a NexOS app sounds like the rest of Looscid. NexOS Web's own interface sounds
     are handed to Looscid's earcon set too ({nexos: "earcon", name}).
   - Escape (outside a text field, when the app didn't use it) goes back to Looscid's NexOS apps list. */
(function () {
  "use strict";
  var LW = null;
  try {
    var w = window;
    while (w.parent && w.parent !== w) {
      w = w.parent;
      if (w.location.origin !== location.origin) break;
      if (w.document.getElementById("looscid-live")) { LW = w; break; }
    }
  } catch (e) { LW = null; }
  if (!LW) return;
  var d = document.documentElement, S = null;
  d.classList.add("in-looscid");
  function post(m) { try { LW.postMessage(m, location.origin); } catch (e) {} }
  function level() { return !S ? 1 : (S.sound ? Math.max(0, Math.min(1, (+S.volume || 0) / 40)) : 0); }

  // Sound: one Looscid-controlled gain in front of every AudioContext's speakers.
  var gains = [];
  var AC = window.AudioContext || window.webkitAudioContext;
  if (AC && !AC.__looscid) {
    var Orig = AC;
    var Wrapped = function () {
      var c = new (Function.prototype.bind.apply(Orig, [null].concat([].slice.call(arguments))))();
      try { var g = c.createGain(); g.gain.value = level(); g.connect(c.destination); Object.defineProperty(c, "destination", { value: g, configurable: true }); gains.push(g); } catch (e) {}
      return c;
    };
    Wrapped.prototype = Orig.prototype; Wrapped.__looscid = true;
    window.AudioContext = Wrapped; if (window.webkitAudioContext) window.webkitAudioContext = Wrapped;
  }
  function media(m) { if (!m) return; try { m.muted = level() === 0; } catch (e) {} }
  document.addEventListener("play", function (e) { media(e.target); }, true);

  var css = document.createElement("style");
  css.id = "looscid-bridge-style";
  css.textContent =
    "html.lc-rm *,html.lc-rm *::before,html.lc-rm *::after,html.lc-flash *,html.lc-flash *::before,html.lc-flash *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" +
    "html.lc-hc :focus-visible{outline:3px solid #ffd400!important;outline-offset:2px!important}" +
    "html.lc-hc{--lc-hc:1}";
  (document.head || d).appendChild(css);

  // Calm mode: inside Looscid, Looscid's Calm mode (or Reduce Motion) decides; NexOS's own saved choice is left alone.
  var ownCalm = window.calmMode;
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  window.calmMode = function () { return S ? !!(S.calm || S.reduceMotion || mq.matches) : (ownCalm ? ownCalm() : true); };

  function apply() {
    if (!S) return;
    gains.forEach(function (g) { try { g.gain.value = level(); } catch (e) {} });
    Array.prototype.forEach.call(document.querySelectorAll("audio,video"), media);
    d.classList.toggle("lc-rm", !!S.reduceMotion);
    d.classList.toggle("lc-flash", !!S.flashSafety);
    d.classList.toggle("lc-hc", !!S.highContrast);
    d.setAttribute("data-looscid-theme", S.theme || "dark");
    var ts = Math.max(0, Math.min(2, +S.textSize || 0));
    d.style.fontSize = ts ? (100 + ts * 15) + "%" : "";
    if (window.__psSync) window.__psSync(false);
    try { window.dispatchEvent(new StorageEvent("storage", { key: "calm-mode" })); } catch (e) {}
    window.__looscidSettings = S;
    try { document.dispatchEvent(new CustomEvent("looscid:settings", { detail: S })); } catch (e) {}
  }
  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || e.source !== LW || !e.data || e.data.looscid !== "settings") return;
    S = e.data.settings || null; apply();
  });

  // Looscid's sounds for moving around: pitch cues by kind, keyboard clicks, open/close, on/off.
  function kindOf(el) {
    if (!el || !el.closest) return null;
    if (el.closest('a[href], [role="link"]')) return ["link"];
    var role = el.getAttribute("role") || "", tag = el.tagName;
    if (/^H[1-6]$/.test(tag) || role === "heading") return ["heading", role === "heading" ? +(el.getAttribute("aria-level") || 2) : +tag[1]];
    var it = el.closest('[role="menuitem"], [role="menuitemradio"], [role="option"], li > button');
    if (it) { var box = it.closest('[role="menu"], [role="listbox"], ul, ol'); if (box) { var all = Array.prototype.slice.call(box.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="option"], li > button')); var i = all.indexOf(it); if (i >= 0 && all.length > 1) return ["position", [i, all.length]]; } }
    if (role === "switch" || (tag === "INPUT" && (el.type === "checkbox" || el.type === "radio"))) return ["toggle", (el.getAttribute("aria-checked") === "true" || el.checked) ? "on" : "off"];
    if (tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable || (tag === "INPUT" && !/^(button|submit|reset|range|color|file|hidden|image)$/.test(el.type)) || /^(textbox|searchbox|combobox)$/.test(role)) return ["field"];
    if (tag === "BUTTON" || role === "button" || role === "tab" || (tag === "INPUT" && /^(button|submit|reset)$/.test(el.type))) return ["button"];
    return null;
  }
  function isEdit(el) { return !!(el && (el.tagName === "TEXTAREA" || el.isContentEditable || (el.tagName === "INPUT" && !/^(button|submit|reset|range|color|file|hidden|image|checkbox|radio)$/.test(el.type)))); }
  document.addEventListener("focusin", function (e) { var k = kindOf(e.target); if (k) post({ nexos: "cue", kind: k[0], detail: k[1] }); }, true);
  var nx = function () { return window.__looscid && window.__looscid.ui ? window.__looscid : null; }; // NexOS Web's sound tables (web/script.js)
  var ownKeys = function () { return !!nx(); }; // NexOS Web clicks its own keys (handed over below)
  document.addEventListener("keydown", function (e) {
    if (!isEdit(e.target) || e.ctrlKey || e.metaKey || e.altKey || ownKeys()) return;
    if (e.key.length !== 1 && !/^(Backspace|Delete|Enter)$/.test(e.key)) return;
    post({ nexos: "key" });
  }, true);
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest && e.target.closest('button, [role="button"], [role="switch"], input[type="checkbox"]');
    if (!t) return;
    var before = t.getAttribute("aria-expanded"), sw = t.getAttribute("role") === "switch" || t.type === "checkbox";
    setTimeout(function () {
      if (sw) { post({ nexos: "cue", kind: "toggle", detail: (t.getAttribute("aria-checked") === "true" || t.checked) ? "on" : "off", force: true }); return; }
      var after = t.getAttribute("aria-expanded");
      if (before !== null && after !== null && before !== after) post({ nexos: "cue", kind: after === "true" ? "open" : "close", force: true });
    }, 30);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key !== "Escape" && e.key !== "Esc") || e.defaultPrevented || isEdit(e.target)) return;
    if (window.__nexosEmbed || document.getElementById("stars")) return; // NexOS's own embed bridge handles Insomnia
    post({ nexos: "escape" });
  });

  // NexOS Web's interface sounds -> Looscid's earcon set (the app's music, alarms and piano notes stay its own).
  function handOver() {
    var MAP = { key: "key", space: "key", backspace: "key", tab: "focus", arrow: "focus", enter: "run", run: "run", confirm: "run",
      back: "close", home: "close", down: "close", up: "open", danger: "error", nav: "focus", apps: "open", files: "open", terminal: "open",
      settings: "open", store: "open", aboutapp: "open", about: "open", help: "open" };
    var SMAP = { error: "error", update: "send", install: "send", uninstall: "close", win: "run" };
    function wrap(obj, map) {
      Object.keys(obj).forEach(function (k) {
        var f = obj[k]; if (typeof f !== "function" || f.__looscid) return;
        var g = function () {
          if (k === "on" || k === "off") { post({ nexos: "cue", kind: "toggle", detail: k, force: true }); return; }
          var n = map[k];
          if (!n) return f.apply(this, arguments);
          if (n === "key") post({ nexos: "key" }); else post({ nexos: "earcon", name: n });
        };
        g.__looscid = true; obj[k] = g;
      });
    }
    var n = nx(); if (!n) return;
    try { wrap(n.ui, MAP); } catch (e) {}
    try { if (n.sfx) wrap(n.sfx, SMAP); } catch (e) {}
  }
  // web/script.js is deferred like this file and runs first; DOMContentLoaded covers any other order.
  handOver(); document.addEventListener("DOMContentLoaded", handOver);
  post({ nexos: "hello", title: document.title });
})();
