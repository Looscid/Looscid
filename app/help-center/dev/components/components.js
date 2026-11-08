/* Looscid component library pages (Nov 8 2026). Two jobs, nothing else, and no network:
   1. the "Copy code" buttons: copy the code block under them and say "Copied" once (the page's polite live region);
   2. size each demo frame to fit its demo, so there's no scrolling inside a frame. */
(function () {
  "use strict";
  var live = document.getElementById("looscid-live");
  function say(msg) { if (!live) return; live.textContent = ""; setTimeout(function () { live.textContent = msg; }, 60); }
  function fallbackCopy(text) {
    var t = document.createElement("textarea");
    t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(t); return ok;
  }
  Array.prototype.forEach.call(document.querySelectorAll(".cl-copy"), function (btn) {
    var code = document.getElementById(btn.getAttribute("data-copy"));
    if (!code) return;
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var text = code.textContent;
      var done = function () { say("Copied"); btn.focus(); };
      var fail = function () { say(fallbackCopy(text) ? "Copied" : "Couldn't copy. Select the code and copy it yourself."); btn.focus(); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail); else fail();
    });
  });
  function fit(f) {
    try { var d = f.contentDocument; if (d && d.body) f.style.height = Math.max(60, Math.ceil(d.body.getBoundingClientRect().height) + 4) + "px"; } catch (e) {}
  }
  Array.prototype.forEach.call(document.querySelectorAll("iframe.cl-frame"), function (f) {
    f.addEventListener("load", function () { fit(f); setTimeout(function () { fit(f); }, 400); });
  });
})();
