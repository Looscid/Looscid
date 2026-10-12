/* Looscid app guard (security pass, Oct 2026). Loaded FIRST by every page under os/ and projects/, before any of the
   page's own code. Those pages share Looscid's web address, so outside a sandbox they could read Looscid's storage,
   including your Nostr key. Two jobs:
   1. Opened on its own (or framed without the sandbox), the page reopens at once inside open.html, which shows it in a
      sandboxed frame. Nothing of the page's own code runs first.
   2. Inside the sandbox the browser blocks localStorage (it throws). This puts in a stand-in with the same methods, so the
      apps keep their saved settings: the data arrives as the frame's window name (js/apphost.js) and each change goes to
      Looscid, which keeps it in its own key, looscid_appdata. sessionStorage is a stand-in too, kept in memory. */
(function () {
  "use strict";
  var sandboxed = false;
  try { sandboxed = self.origin === "null"; } catch (e) {}
  if (!sandboxed && typeof self.origin !== "string") { try { void window.localStorage.length; } catch (e) { sandboxed = true; } }
  if (!sandboxed) {
    var m = /^(.*?\/)(os|projects)\//.exec(location.pathname), base = m ? m[1] : "/";
    location.replace(base + "open.html?u=" + encodeURIComponent(location.pathname + location.search + location.hash));
    document.write('<plaintext hidden style="display:none">'); // the rest of this page is never parsed, so none of its scripts run
    return;
  }
  var TOP = window.top !== window ? window.top : null, data = {};
  try { var n = String(window.name || ""); if (n.indexOf("lcstore:") === 0) { var o = JSON.parse(n.slice(8)); if (o && typeof o === "object") data = o; } } catch (e) { data = {}; }
  function keep() { try { window.name = "lcstore:" + JSON.stringify(data); } catch (e) {} } // later pages in this frame start from here
  function send(m) { if (!TOP) return; m.looscid = "appstore"; try { TOP.postMessage(m, location.origin); } catch (e) {} }
  function make(d, persist) {
    var api = {
      getItem: function (k) { k = String(k); return Object.prototype.hasOwnProperty.call(d, k) ? d[k] : null; },
      setItem: function (k, v) { k = String(k); v = String(v); d[k] = v; if (persist) { keep(); var s = {}; s[k] = v; send({ set: s }); } },
      removeItem: function (k) { k = String(k); if (!Object.prototype.hasOwnProperty.call(d, k)) return; delete d[k]; if (persist) { keep(); send({ del: [k] }); } },
      clear: function () { Object.keys(d).forEach(function (k) { delete d[k]; }); if (persist) { keep(); send({ clear: true }); } },
      key: function (i) { var ks = Object.keys(d); return i >= 0 && i < ks.length ? ks[i] : null; }
    };
    Object.defineProperty(api, "length", { get: function () { return Object.keys(d).length; } });
    if (typeof Proxy !== "function") return api;
    return new Proxy(api, {
      get: function (t, p) { if (p in t || typeof p !== "string") return t[p]; return t.getItem(p); },
      set: function (t, p, v) { if (p in t) return false; t.setItem(p, v); return true; },
      deleteProperty: function (t, p) { t.removeItem(p); return true; },
      has: function (t, p) { return p in t || Object.prototype.hasOwnProperty.call(d, p); }
    });
  }
  var LS = make(data, true), SS = make({}, false);
  try { Object.defineProperty(window, "localStorage", { configurable: true, enumerable: true, get: function () { return LS; } }); } catch (e) {}
  try { Object.defineProperty(window, "sessionStorage", { configurable: true, enumerable: true, get: function () { return SS; } }); } catch (e) {}
  // Changes made by another open app frame (Looscid passes them on): apply, and tell the page the way the browser would.
  window.addEventListener("message", function (e) {
    var m = e.data; if (!TOP || e.source !== TOP || e.origin !== location.origin || !m || m.looscid !== "appstore-sync") return;
    var ch = [];
    if (m.clear) { Object.keys(data).forEach(function (k) { delete data[k]; }); ch.push(null); }
    if (m.set && typeof m.set === "object") Object.keys(m.set).forEach(function (k) { if (typeof m.set[k] === "string") { data[k] = m.set[k]; ch.push(k); } });
    if (Array.isArray(m.del)) m.del.forEach(function (k) { delete data[k]; ch.push(k); });
    keep();
    ch.forEach(function (k) { try { window.dispatchEvent(new StorageEvent("storage", { key: k, newValue: k === null ? null : (data[k] === undefined ? null : data[k]) })); } catch (x) {} });
  });
  window.__lcStoreName = function () { return "lcstore:" + JSON.stringify(data); }; // for frames this page opens (NexOS Web's apps)
  send({ hello: true });
})();
