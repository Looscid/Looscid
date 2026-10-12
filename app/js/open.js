/* open.html: shows one Looscid app or project in a sandboxed frame (security pass, Oct 2026). See js/appguard.js. */
(function () {
  "use strict";
  // Never inside someone else's frame (clickjacking): if framed, hide and reload as the whole page.
  if (window.top !== window.self) { document.documentElement.style.display = "none"; try { window.top.location = window.self.location.href; } catch (e) {} return; }
  var NAMES = { "os/apps/insomnia/": "Insomnia", "os/apps/memeprojects/": "Memeprojects", "os/apps/easyconvert/": "Easyconvert", "os/web/": "Desktop",
    "os/real/": "Kernel", "os/": "Looscid OS", "projects/lyricfinder/": "Lyric Finder", "projects/easyconvert/": "Easyconvert", "projects/codetranslator/": "Code Translator",
    "projects/soundvault/": "Soundvault", "projects/vibework/": "Vibework", "projects/myweb/": "MyWEB", "projects/reactor-toolbar/": "Reactor Toolbar" };
  var base = location.pathname.replace(/[^\/]*$/, ""), want = "", url = null;
  try { want = new URLSearchParams(location.search).get("u") || ""; } catch (e) {}
  try { url = new URL(want, location.origin); } catch (e) { url = null; }
  var rel = url ? url.pathname.slice(base.length) : "";
  var ok = !!url && url.origin === location.origin && url.pathname.indexOf(base) === 0 && /^(os|projects)\//.test(rel) && !/(^|\/)\.\.?(\/|$)|%2e|\\/i.test(url.pathname);
  var h = document.getElementById("lc-open-h"), main = document.querySelector("main"), msg = document.getElementById("msg");
  if (!ok) { msg.textContent = "That isn't a Looscid app."; msg.hidden = false; return; }
  var best = ""; Object.keys(NAMES).forEach(function (k) { if (rel.indexOf(k) === 0 && k.length > best.length) best = k; });
  var name = best ? NAMES[best] : "Looscid app";
  h.textContent = name; document.title = name + " - Looscid";
  var f = document.createElement("iframe");
  f.setAttribute("sandbox", window.LooscidAppHost.SANDBOX);
  f.setAttribute("allow", "autoplay; clipboard-write");
  f.title = name + ", part of Looscid";
  f.name = window.LooscidAppHost.storeName();
  f.src = url.pathname + url.search + url.hash;
  main.appendChild(f);
  // The app's own Back (Kernel) goes back to Looscid.
  window.addEventListener("message", function (e) { if (window.LooscidAppHost.fromApp(e) && e.data && e.data.nexos === "back") location.href = "./"; });
})();
