/* NexOS embed bridge: loaded only by the app copies under apps/ when they run inside NexOS Web.
   Standalone sites never load this file. It hides the app's own photosensitivity notice (NexOS shows one at the top),
   follows the NexOS Calm mode switch live, wraps long code lines, and hands Escape back to NexOS. */
(function () {
  "use strict";
  var inNexos = false;
  try { inNexos = window.parent !== window && window.parent.location.origin === location.origin && !!window.parent.__looscid; } catch (e) { inNexos = false; }
  if (!inNexos) return;
  var d = document.documentElement;
  d.classList.add("in-nexos");
  var st = document.createElement("style");
  st.textContent = "html.in-nexos #ps-notice{display:none!important}" +
    "html.in-nexos pre{white-space:pre-wrap!important;overflow-wrap:anywhere!important;word-break:break-word;max-width:100%}" +
    "html.in-nexos code{overflow-wrap:anywhere;word-break:break-word}" +
    "html.in-nexos body{overflow-x:hidden}";
  (document.head || d).appendChild(st);
  function post(type, extra) { try { var m = { nexos: type }; for (var k in (extra || {})) m[k] = extra[k]; window.parent.postMessage(m, location.origin); } catch (e) {} }
  // Calm mode is one setting for the whole site (localStorage "calm-mode"): follow the NexOS switch while open.
  window.addEventListener("storage", function (e) {
    if (e.key !== "calm-mode" && e.key !== null) return;
    if (window.__psSync) window.__psSync(false);
    // A moving starfield started before Calm mode was turned on stops at once.
    var calm = window.calmMode ? window.calmMode() : true, s = document.getElementById("stars");
    if (calm && s && !s.hidden) { try { s.dispatchEvent(new MouseEvent("click", { bubbles: true })); } catch (x) {} }
  });
  // Escape: an open Insomnia window or the screensaver handles it first (they stop it or prevent it). Otherwise it closes the app in NexOS.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" && e.key !== "Esc") return;
    if (e.defaultPrevented) return;
    var s = document.getElementById("stars");
    if (s && !s.hidden) return;
    e.preventDefault(); post("escape");
  });
  // Is a soundscape playing? (Insomnia OS) NexOS keeps the app loaded while one plays, so it can keep you company.
  window.__nexosEmbed = {
    soundscape: function () {
      var a = window.__psAudio, live = a && a.state && a.state() === "running";
      var ch = Array.prototype.some.call(document.querySelectorAll("input[data-ch]"), function (i) { return +i.value > 0; });
      return !!(live && ch);
    }
  };
  document.addEventListener("DOMContentLoaded", function () { if (window.__psSync) window.__psSync(false); post("ready", { title: document.title }); });
})();
