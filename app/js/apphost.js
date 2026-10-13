/* Looscid app host (security pass, Oct 2026).
   Every page under os/ and projects/ (Looscid OS, the Apps and the Projects) lives on the same web address as Looscid, and
   the browser gives one storage to one address. So before this, any of those pages could read your Nostr key. Now Looscid
   opens them in a sandboxed frame (no allow-same-origin): each runs as an anonymous origin with no access to Looscid's
   storage, cookies or pages. js/appguard.js, loaded first by each of those pages, gives them a stand-in localStorage.
   This file is the other half, used by Looscid (index.html) and by open.html:
   - SANDBOX: the sandbox flags for those frames.
   - storeName(): the apps' saved data, handed to a frame as its window name, so it is there before the app's code runs.
   - The apps' saved data lives in ONE key, looscid_appdata, apart from everything else. A frame can only add, change or
     remove entries in that key; it can never read or write any other key. The first time, it is filled from the keys the
     apps used before (looscid:*, insomnia-os:*, easyconvert.*, calm-mode, nexos-real-sound, myweb-theme), which stay as
     they are. It is not in Settings backup, the same as before. */
(function () {
  "use strict";
  var KEY = "looscid_appdata", MAX = 4 * 1024 * 1024;
  var SANDBOX = "allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-pointer-lock";
  var SEED = /^(looscid:|insomnia-os:|easyconvert\.|calm-mode$|nexos-real-sound$|myweb-theme$)/;
  var data = null, peers = [], timer = 0;
  function write() { try { var s = JSON.stringify(data); if (s.length <= MAX) localStorage.setItem(KEY, s); } catch (e) {} }
  function load() {
    if (data) return data;
    var raw = null; try { raw = localStorage.getItem(KEY); } catch (e) {}
    try { data = raw ? JSON.parse(raw) : null; } catch (e) { data = null; }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      data = {};
      try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && SEED.test(k)) data[k] = localStorage.getItem(k); } } catch (e) {}
      write();
    }
    return data;
  }
  /* Round 9 (2three1y, Oct 13): Looscid's Time format (12- or 24-hour) is handed to each app as a read-only entry,
     "looscid:time-format", so Looscid OS clocks follow it. It is never written to looscid_appdata. */
  function timeFormat() { var tf = "12"; ["looscid_a11y", "looscid_settings"].forEach(function (k) { try { var o = JSON.parse(localStorage.getItem(k) || "null"); if (o && (o.timeFormat === "24" || o.timeFormat === "12")) tf = o.timeFormat; } catch (e) {} }); return tf; }
  function storeName() { var d = Object.assign({}, load()); d["looscid:time-format"] = timeFormat(); return "lcstore:" + JSON.stringify(d); }
  // A message from a Looscid app framed (at any depth) inside this window: sandboxed ("null") or, for an older copy, same site.
  function fromApp(e) {
    try { return !!e.source && e.source !== window && e.source.top === window && (e.origin === "null" || e.origin === location.origin); } catch (x) { return false; }
  }
  window.addEventListener("message", function (e) {
    var m = e.data; if (!m || typeof m !== "object" || m.looscid !== "appstore" || !fromApp(e)) return;
    var d = load(), set = {}, del = [], clear = m.clear === true;
    if (peers.indexOf(e.source) < 0) peers.push(e.source);
    if (clear) Object.keys(d).forEach(function (k) { delete d[k]; });
    if (m.set && typeof m.set === "object") Object.keys(m.set).forEach(function (k) { if (typeof m.set[k] === "string" && k.length <= 200) { d[k] = m.set[k]; set[k] = m.set[k]; } });
    if (Array.isArray(m.del)) m.del.forEach(function (k) { if (typeof k === "string") { delete d[k]; del.push(k); } });
    if (!clear && !Object.keys(set).length && !del.length) return; // hello
    clearTimeout(timer); timer = setTimeout(write, 200);
    peers = peers.filter(function (w) { try { return !w.closed; } catch (x) { return false; } });
    // Other open app frames see the change (the app data only; targetOrigin "*" because a sandboxed frame has no origin to name).
    peers.forEach(function (w) { if (w === e.source) return; try { w.postMessage({ looscid: "appstore-sync", set: set, del: del, clear: clear }, "*"); } catch (x) {} });
  });
  window.addEventListener("pagehide", function () { if (timer) { clearTimeout(timer); write(); } });
  window.LooscidAppHost = Object.freeze({ SANDBOX: SANDBOX, KEY: KEY, storeName: storeName, fromApp: fromApp });
})();
