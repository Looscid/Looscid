/* Looscid, js/remlists.js: your lists on every device. Plain script, loaded after js/net.js and js/core.js.

   Nov 8 2026 (Carter: "every single change should be everywhere ... local first is a good idea for data backups, but a
   bad idea for syncing and finding things"). These follow your LooscidID key through Rem (js/net.js, POST /list and
   POST /mine), so a change on one device shows up on the others:
     Likes (looscid_liked), ReDreams (looscid_redreams), pinned Dreams (looscid_pinned_dreams), muted Dreamors
     (looscid_muted_dreamors), muted threads (looscid_muted_threads), Not interested (looscid_not_interested),
     threads you follow (looscid_thread_subs) and, since Nov 8 2026, disliked Dreams (looscid_disliked, private).
   Who can see what:
     - Public: that your key liked or ReDreamed a Dream. Rem only shows the counts on each Dream.
     - Private: dislikes, pins, mutes, Not interested, followed threads, liked searches, and the small copy kept with each like and
       ReDream. Rem gives them back only to a read signed by your own key in the last 10 minutes, and each signed read
       works once. Nobody else can read them, not even with your public key.
   This device still keeps its own copy (that's the backup). The first sync with a key adds what's on this device to
   Rem, so nothing is lost. No key (guest mode), a locked key, a signer extension or no connection: everything stays on
   this device, exactly like before.
   Stored on this device: looscid_rem_lists { pk, snap: { list: [refs] }, paused } (what Rem had at the last sync). */
(function (Looscid) {
"use strict";
const SYNC_KEY = "looscid_rem_lists";
const isHex64 = function (s) { return /^[0-9a-f]{64}$/i.test(String(s == null ? "" : s)); };
function lsJson(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
// A Dream's Rem id when it has one (app ids "n:<hex>", or its nid), so likes and ReDreams count on Rem.
function dreamRef(id, nid) { const s = String(id == null ? "" : id), m = /^n:([0-9a-f]{64})$/i.exec(s);
  return isHex64(s) ? s.toLowerCase() : m ? m[1].toLowerCase() : isHex64(nid) ? String(nid).toLowerCase() : s; }
function dreamId(ref) { return isHex64(ref) ? "n:" + ref : ref; }
const LISTS = [
  { name: "likes", key: "looscid_liked", obj: true, max: 1000, ev: "looscid-liked", order: "at",
    pick: function (x) { return x.k === "dream" && x.id != null; }, ref: function (x) { return dreamRef(x.id, x.nid); },
    stub: function (r, at) { return { k: "dream", id: dreamId(r), at: at }; } },
  { name: "liked_other", key: "looscid_liked", obj: true, max: 500, ev: "looscid-liked", order: "at",
    pick: function (x) { return !!x.k && x.k !== "dream" && x.id != null; }, ref: function (x) { return String(x.k) + ":" + String(x.id); },
    stub: function (r, at) { const i = r.indexOf(":"); return { k: r.slice(0, i), id: r.slice(i + 1), at: at }; } },
  { name: "redreams", key: "looscid_redreams", obj: true, max: 1000, ev: "looscid-redreams", order: "at",
    pick: function (x) { return x.id != null; }, ref: function (x) { return dreamRef(x.id, x.nid); },
    stub: function (r, at) { return { id: dreamId(r), at: at }; } },
  { name: "pins", key: "looscid_pinned_dreams", max: 20, ev: "looscid:pinned" },
  // Nov 8 2026: disliked Dreams (js/dislikes.js). Private, like pins: only a read signed by your own key gets them back.
  { name: "dislikes", key: "looscid_disliked", obj: true, max: 1000, ev: "looscid-disliked", order: "at",
    pick: function (x) { return x.k === "dream" && x.id != null; }, ref: function (x) { return dreamRef(x.id, x.nid); },
    stub: function (r, at) { return { k: "dream", id: dreamId(r), at: at }; } },

  { name: "muted_dreamors", key: "looscid_muted_dreamors", max: 500, ev: "looscid:blocked" },
  { name: "muted_threads", key: "looscid_muted_threads", max: 500, ev: "looscid:mutedthreads" },
  { name: "not_interested", key: "looscid_not_interested", max: 500, ev: "looscid:notinterested" },
  { name: "threads", key: "looscid_thread_subs", obj: true, max: 200, ev: "looscid:threadsubs", order: "end",
    pick: function (x) { return x.root != null; }, ref: function (x) { return String(x.root); },
    stub: function (r, at) { return { root: r, nid: isHex64(r) ? r.toLowerCase() : null, label: "a thread", since: Math.floor(at / 1000) }; } },
];
const okRef = function (r) { return typeof r === "string" && r.length > 0 && r.length <= 128 && !/[\u0000-\u001f\u007f]/.test(r); };
// This device's items for one list: Map ref -> item (the stored object, or the string itself).
function localOf(L) {
  const a = lsJson(L.key, []), m = new Map(); if (!Array.isArray(a)) return m;
  a.forEach(function (x) {
    if (L.obj) { if (!x || typeof x !== "object" || !L.pick(x)) return; const r = L.ref(x); if (okRef(r) && !m.has(r)) m.set(r, x); }
    else { const s = String(x); if (okRef(s) && !m.has(s)) m.set(s, s); }
  });
  return m;
}
function dataOf(L, x) {
  if (!L.obj) return undefined;
  let s = JSON.stringify(x); if (s.length > 3900 && typeof x.text === "string") s = JSON.stringify(Object.assign({}, x, { text: x.text.slice(0, 800) }));
  return s.length > 3900 ? undefined : s;
}
function itemOf(L, it) {
  if (!L.obj) return it.ref;
  let x = null; try { x = it.data ? JSON.parse(it.data) : null; } catch (e) {}
  if (!x || typeof x !== "object" || !L.pick(x) || L.ref(x) !== it.ref) x = L.stub(it.ref, +it.at || Date.now());
  return x;
}
function st() { const N = Looscid.lcNostr; try { return N && N.state ? N.state() : {}; } catch (e) { return {}; } }
// Only with your own key on this device ("key" mode), so a signer extension never gets a stream of prompts.
function ready() { const s = st(); return !!(Looscid.lcNet && Looscid.lcNet.listsMine && s.mode === "key" && isHex64(s.pubkey)); }
function cfg(pk) { const c = lsJson(SYNC_KEY, null); return c && typeof c === "object" && c.pk === pk ? c : { pk: pk, snap: null }; }
// Up to 200 items and about 40 KB per signed write (Rem takes 64 KB).
function chunks(items) { const out = []; let cur = [], size = 0;
  items.forEach(function (x) { const n = String(x[0]).length + (x[1] ? x[1].length : 0) + 12; if (cur.length && (cur.length >= 200 || size + n > 40000)) { out.push(cur); cur = []; size = 0; } cur.push(x); size += n; });
  if (cur.length) out.push(cur); return out; }
async function send(name, action, items) { for (const c of chunks(items)) { const r = await Looscid.lcNet.listWrite(name, action, c); if (!r.ok) return false; } return true; }

let busy = false, again = false, lastPull = 0;
// One sync. pull = also read Rem (signed) and bring in what changed on your other devices.
async function sync(pull) {
  if (!ready()) return;
  if (busy) { again = again || (pull ? "pull" : "push"); return; }
  busy = true;
  try {
    const pk = st().pubkey.toLowerCase(), c = cfg(pk); if (c.paused) return;
    const first = !c.snap || typeof c.snap !== "object";
    let srv = null;
    if (pull || first) { srv = await Looscid.lcNet.listsMine(); if (!srv) return; lastPull = Date.now(); }
    const snap = first ? {} : c.snap;
    // Rem suddenly has nothing while this device remembers some: the Rem data was probably deleted from another
    // device. Keep everything here and stop syncing lists here (LooscidID, Rem, Your lists: "Sync my lists again").
    if (srv && !first && LISTS.every(function (L) { return !(srv[L.name] || []).length; }) && LISTS.some(function (L) { return (snap[L.name] || []).length; })) {
      lsSet(SYNC_KEY, { pk: pk, snap: null, paused: true }); return;
    }
    const next = {}, keys = {};
    for (const L of LISTS) {
      const loc = localOf(L), before = new Set(snap[L.name] || []);
      const have = srv ? new Map((srv[L.name] || []).filter(function (it) { return it && okRef(it.ref); }).map(function (it) { return [it.ref, it]; })) : new Map(Array.from(before).map(function (r) { return [r, { ref: r }]; }));
      const add = [], del = [];
      loc.forEach(function (x, r) { if (!before.has(r) && !have.has(r)) add.push([r, dataOf(L, x)]); });
      before.forEach(function (r) { if (!loc.has(r) && have.has(r)) del.push([r]); });
      const now = new Set(have.keys());
      const fit = add.slice(0, Math.max(0, L.max - now.size)); // past Rem's limit an item just stays on this device
      if (fit.length && await send(L.name, "add", fit)) fit.forEach(function (x) { now.add(x[0]); });
      if (del.length && await send(L.name, "remove", del)) del.forEach(function (x) { now.delete(x[0]); });
      // What changed on your other devices (on the first sync: everything Rem has that this device doesn't).
      const gain = [], lose = new Set();
      have.forEach(function (it, r) { if (!loc.has(r) && !before.has(r)) gain.push(it); });
      before.forEach(function (r) { if (loc.has(r) && !have.has(r)) lose.add(r); });
      if (gain.length || lose.size) { const k = keys[L.key] || (keys[L.key] = { arr: lsJson(L.key, []), ch: false, ev: L.ev, order: L.order, max: 0 });
        if (!Array.isArray(k.arr)) k.arr = [];
        if (lose.size) k.arr = k.arr.filter(function (x) { if (L.obj ? (x && typeof x === "object" && L.pick(x) && lose.has(L.ref(x))) : lose.has(String(x))) { k.ch = true; return false; } return true; });
        const add2 = gain.map(function (it) { return itemOf(L, it); });
        if (add2.length) { k.ch = true; k.arr = L.order === "end" ? k.arr.concat(add2) : add2.concat(k.arr); }
        k.max = Math.max(k.max, L.max); }
      next[L.name] = Array.from(now);
    }
    lsSet(SYNC_KEY, { pk: pk, snap: next, at: Date.now() });
    Object.keys(keys).forEach(function (key) { const k = keys[key]; if (!k.ch) return;
      if (k.order === "at") k.arr.sort(function (a, b) { return (+(b && b.at) || 0) - (+(a && a.at) || 0); });
      try { if (k.arr.length) localStorage.setItem(key, JSON.stringify(k.arr.slice(0, Math.max(k.max, 5)))); else localStorage.removeItem(key); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent(k.ev)); } catch (e) {} });
  } catch (e) { /* offline or Rem trouble: try again later; nothing on this device changes */ }
  finally { busy = false; if (again) { const p = again === "pull"; again = false; setTimeout(function () { sync(p); }, 800); } }
}
let tmr = null;
function soon() { clearTimeout(tmr); tmr = setTimeout(function () { sync(false); }, 1500); }
function pullIfStale(ms) { if (Date.now() - lastPull > ms) sync(true); }
const EVS = {}; LISTS.forEach(function (L) { EVS[L.ev] = 1; });
Object.keys(EVS).forEach(function (ev) { window.addEventListener(ev, soon); });
window.addEventListener("online", function () { sync(true); });
document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") pullIfStale(20000); });
setInterval(function () { if (document.visibilityState === "visible") { if (Date.now() - lastPull > 120000) sync(true); else sync(false); } }, 15000);
// First sync as soon as your key is ready (it can load a moment after the app).
let tries = 0; (function start() { if (ready()) { sync(true); return; } if (++tries < 40) setTimeout(start, 3000); })();
Looscid.lcLists = {
  LISTS: LISTS.map(function (L) { return L.name; }),
  sync: function () { return sync(true); },
  paused: function () { const s = st(); return isHex64(s.pubkey) && !!cfg(String(s.pubkey).toLowerCase()).paused; },
  pause: function () { const s = st(); if (isHex64(s.pubkey)) lsSet(SYNC_KEY, { pk: String(s.pubkey).toLowerCase(), snap: null, paused: true }); },
  resume: function () { const s = st(); if (isHex64(s.pubkey)) { lsSet(SYNC_KEY, { pk: String(s.pubkey).toLowerCase(), snap: null }); sync(true); } },
};
})(window.Looscid = window.Looscid || {});
