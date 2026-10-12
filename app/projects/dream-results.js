/* Dream Results (Looscid Round 6.6, Projects): after Memeprojects shows a result, a "Dream Results" button appears
   right after it. Pressing it asks Looscid to open the Dream composer with the result filled in. Nothing is sent:
   you read it, change it if you like, and press Dream yourself. Outside Looscid this file does nothing. */
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
  // Security pass (Oct 2026): sandboxed inside Looscid, the page can't look at Looscid, so it waits for Looscid's settings
  // message (looscid-bridge.js turns it into a "looscid:settings" event) before it shows the button. open.html sends none.
  var waitForLooscid = false;
  try { if (!LW && self.origin === "null" && window.top !== window) { LW = window.top; waitForLooscid = !window.__looscidSettings; } } catch (e) {}
  if (!LW) return;
  var IDS = ["verdict", "evaluation-result"];
  function text(el) { return String(el.innerText || el.textContent || "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim(); }
  function sync(el) {
    var btn = document.getElementById(el.id + "-dream");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button"; btn.id = el.id + "-dream"; btn.className = "dream-results"; btn.textContent = "Dream Results"; btn.hidden = true;
      btn.addEventListener("click", function () {
        var t = text(el); if (!t) return;
        try { LW.postMessage({ nexos: "dream", text: t, from: "Memeprojects" }, location.origin); } catch (e) {}
      });
      // After the result, never inside it: the result is a live region, the button is not.
      el.parentNode.insertBefore(btn, el.nextSibling);
    }
    btn.hidden = !text(el);
  }
  function start() {
    var st = document.createElement("style");
    st.textContent = ".dream-results{margin-top:.75rem}";
    (document.head || document.documentElement).appendChild(st);
    IDS.forEach(function (id) {
      var el = document.getElementById(id); if (!el) return;
      sync(el);
      new MutationObserver(function () { sync(el); }).observe(el, { childList: true, subtree: true, characterData: true });
    });
  }
  function ready() { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start(); }
  if (waitForLooscid) document.addEventListener("looscid:settings", function once() { document.removeEventListener("looscid:settings", once); ready(); }); else ready();
})();
