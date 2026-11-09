/* Looscid, js/remlists.js: your lists on every device. Plain script, loaded after js/net.js and js/core.js.

   Nov 8 2026 (Carter: "every single change should be everywhere ... local first is a good idea for data backups, but a
   bad idea for syncing and finding things"). These follow your LooscidID key through Rem (js/net.js, POST /list and
   POST /mine), so a change on one device shows up on the others:
     Likes (looscid_liked), ReDreams (looscid_redreams), pinned Dreams (looscid_pinned_dreams), muted Dreamors
     (looscid_muted_dreamors), muted threads (looscid_muted_threads), Not interested (looscid_not_interested),
     threads you follow (looscid_thread_subs). (Disliked Dreams synced here for one day, Nov 8 2026; dislikes are gone.)
   Who can see what:
     - Public: that your key liked or ReDreamed a Dream. Rem only shows the counts on each Dream.
     - Private: pins, mutes, Not interested, followed threads, liked searches, and the small copy kept with each like and
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
  // Nov 9 2026 (Carter: "Dislikes should be removed"): the private "dislikes" list is gone. It isn't read or sent any more.

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
    // Nov 9 2026 (Carter: "Dislikes should be removed"): old dislikes quietly disappear. If Rem still has your private
    // "dislikes" list from Nov 8, this takes them off Rem too (a normal signed remove, the same as any list change).
    if (srv && Array.isArray(srv.dislikes) && srv.dislikes.length) { try { await send("dislikes", "remove", srv.dislikes.filter(function (it) { return it && okRef(it.ref); }).map(function (it) { return [it.ref]; })); } catch (e) {} }
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
/* --- Follows on Rem (Nov 9 2026) ---
   Carter: "nothing on this app should save to device. Everything should depend on Rem." Who you follow lives on Rem now
   (js/net.js followWrite / followsMine / followInfo), so the person you follow and everyone else sees the new count.
   - Press Follow: the button and the counts change right away, from this device's copy (looscid_following, now only a
     cache). Then the follow goes to Rem, signed with your key. If Rem can't be reached, it's tried again (3, 10 and 30
     seconds, then every 15 seconds). After 3 misses in a row, Looscid says so once: "I couldn't save your follows on Rem yet."
   - The first sync with your key (it runs the next time your key is unlocked) moves follows that were only on this
     device up to Rem, once. After that, Rem is the truth: a follow or unfollow from another device shows up here too.
   - Counts come from Rem. Rem's count either has you in it or not, and this device knows which (what Rem had for you
     when the count came), so the count is never off by one and you're never counted twice: 10 -> 11 the moment you
     press Follow, and 11 stays 11 when Rem answers.
   - Your "Who can see my followers and following" setting goes with each follow, so Rem only lists you when it says Everyone.
   - Only people with a LooscidID or Nostr key can be followed on Rem. No key (guest mode), a locked key or a signer
     extension: follows stay on this device until a key is ready.
   Stored on this device: looscid_rem_follows { pk, snap: [hex keys Rem had at the last sync], who }. */
const FOL_KEY = "looscid_rem_follows", FOLLOW_LS = "looscid_following", WHO_OK = ["everyone", "followers", "me"];
const B32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
// An npub (bech32, NIP-19) as its hex key, or "".
function npubHex(s) {
  s = String(s || "").toLowerCase(); if (s.indexOf("npub1") !== 0) return "";
  const d = []; for (const ch of s.slice(5)) { const v = B32.indexOf(ch); if (v < 0) return ""; d.push(v); }
  const w = d.slice(0, -6); let acc = 0, bits = 0; const out = [];
  for (const v of w) { acc = (acc << 5) | v; bits += 5; while (bits >= 8) { bits -= 8; out.push((acc >> bits) & 255); } acc &= (1 << bits) - 1; }
  return out.length === 32 ? out.map(function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join("") : "";
}
// A follow id ("npub:<hex>", "nostr:<hex>", "nostr:npub1...") or a person as a hex key, or "" (not on Rem).
function folHex(x) {
  if (x && typeof x === "object") { if (isHex64(x.pk)) return String(x.pk).toLowerCase(); x = x.id; }
  const s = String(x == null ? "" : x), m = /^(?:npub|nostr):(.+)$/.exec(s), v = m ? m[1] : "";
  return isHex64(v) ? v.toLowerCase() : npubHex(v);
}
function folLocal() { const a = lsJson(FOLLOW_LS, []), m = new Map(); (Array.isArray(a) ? a : []).forEach(function (id) { const h = folHex(id); if (h && !m.has(h)) m.set(h, id); }); return m; }
function folCfg(pk) { const c = lsJson(FOL_KEY, null); return c && typeof c === "object" && c.pk === pk ? c : { pk: pk, snap: null }; }
function whoNow() { const w = (Looscid.A11Y_NOW || {}).whoLists; return WHO_OK.indexOf(w) >= 0 ? w : "everyone"; }
const CNT = new Map(), PEOPLE = new Map(), WANT = new Map(), PENDING = new Set(), GEN = new Map();
let mine = null; // { followers: [{ pk, at }], following: [...] } from the last signed read
function tick() { try { window.dispatchEvent(new CustomEvent("looscid:follow", { detail: { rem: true } })); } catch (e) {} }
function confirmedHas(h) { const s = st(); if (!isHex64(s.pubkey)) return false; const c = folCfg(String(s.pubkey).toLowerCase()); return Array.isArray(c.snap) && c.snap.indexOf(h) >= 0; }
function setCount(h, b) { if (!b || typeof b.followers !== "number") return; CNT.set(h, { followers: b.followers, following: b.following || 0, mine: confirmedHas(h), at: Date.now() }); }
let fBusy = false, fAgain = false, fFails = 0, fTold = false, fTmr = null;
async function folSend(action, list, who, me) {
  const done = [], skipped = [];
  for (let i = 0; i < list.length; i += 500) {
    const part = list.slice(i, i + 500); part.forEach(function (h) { PENDING.add(h); GEN.set(h, (GEN.get(h) || 0) + 1); });
    const r = await Looscid.lcNet.followWrite(action, part, who);
    if (!r.ok && !(r.status === 403 && r.body && r.body.skipped)) return { ok: false, done: done, skipped: skipped };
    const skip = new Set((r.body && r.body.skipped) || []);
    if (r.body && r.body.them) { setCount(r.body.them.pubkey, r.body.them); const e = CNT.get(r.body.them.pubkey); if (e) e.mine = action === "follow" && !skip.has(r.body.them.pubkey); }
    if (me && r.body && typeof r.body.following === "number") { const e = CNT.get(me); if (e) e.following = r.body.following; }
    part.forEach(function (h) { if (skip.has(h)) skipped.push(h); else done.push(h); });
  }
  return { ok: true, done: done, skipped: skipped };
}
async function folSync(pull) {
  if (!ready() || !Looscid.lcNet.followWrite) return;
  if (fBusy) { fAgain = fAgain || (pull ? "pull" : "push"); return; }
  fBusy = true; let ok = true, dirty = false;
  try {
    const me = st().pubkey.toLowerCase(), c = folCfg(me), first = !Array.isArray(c.snap), who = whoNow();
    if (c.paused) return; // after "Delete my Rem data": follows stay on this device until "Sync my lists again"
    const snap0 = new Set(first ? [] : c.snap), loc0 = folLocal();
    dirty = c.who !== who && !first; loc0.forEach(function (id, h) { if (!snap0.has(h)) dirty = true; }); snap0.forEach(function (h) { if (!loc0.has(h)) dirty = true; });
    let srv = null;
    if (pull || first) { srv = await Looscid.lcNet.followsMine(); if (!srv) { ok = false; return; } mine = { followers: srv.followers || [], following: srv.following || [] };
      CNT.set(me, { followers: mine.followers.length, following: mine.following.length, mine: false, at: Date.now() }); }
    // Rem suddenly has none of your follows while this device remembers some: your Rem data was probably deleted from
    // another device. Keep them here and stop syncing follows here, the same as your lists.
    if (srv && !first && !(srv.following || []).length && c.snap.length) { lsSet(FOL_KEY, { pk: me, snap: null, paused: true }); return; }
    const before = new Set(first ? [] : c.snap), loc = folLocal();
    const have = srv ? new Set((srv.following || []).map(function (x) { return x.pk; })) : new Set(before);
    const add = [], del = [];
    loc.forEach(function (id, h) { if (h !== me && !before.has(h) && !have.has(h)) add.push(h); }); // first sync: everything only on this device goes up, once
    before.forEach(function (h) { if (!loc.has(h) && have.has(h)) del.push(h); });
    let sentWho = c.who || null, blockedMe = [];
    if (add.length) { const r = await folSend("follow", add, who, me); if (r.ok) { r.done.forEach(function (h) { have.add(h); }); blockedMe = r.skipped || []; sentWho = who; } else ok = false; }
    if (del.length && ok) { const r = await folSend("unfollow", del, who, me); if (r.ok) { r.done.forEach(function (h) { have.delete(h); }); sentWho = who; } else ok = false; }
    if (ok && sentWho !== who) { const r = await Looscid.lcNet.followWrite("who", [], who); if (r.ok) sentWho = who; else ok = false; }
    // What changed on your other devices (on the first sync: everything Rem has that this device doesn't).
    const gain = [], lose = new Set(blockedMe);
    have.forEach(function (h) { if (!loc.has(h) && !before.has(h)) gain.push(h); });
    before.forEach(function (h) { if (loc.has(h) && !have.has(h) && del.indexOf(h) < 0) lose.add(h); });
    lsSet(FOL_KEY, { pk: me, snap: Array.from(have), who: sentWho, at: Date.now() });
    if (gain.length || lose.size) {
      let arr = lsJson(FOLLOW_LS, []); if (!Array.isArray(arr)) arr = [];
      const now = new Set(arr.map(folHex).filter(Boolean));
      arr = arr.filter(function (id) { const h = folHex(id); return !h || !lose.has(h); });
      gain.forEach(function (h) { if (!now.has(h)) arr.push("npub:" + h); });
      lsSet(FOLLOW_LS, arr);
      try { window.dispatchEvent(new CustomEvent("looscid-following-synced")); } catch (e) {}
    }
    add.concat(del).forEach(function (h) { PENDING.delete(h); });
  } catch (e) { ok = false; }
  finally {
    fBusy = false; PENDING.clear();
    if (ok) { fTold = false; fFails = 0; tick(); }
    else if (ready() && dirty) { fFails++;
      if (fFails >= 3 && !fTold) { fTold = true; try { (Looscid.announce || function () {})("I couldn't save your follows on Rem yet. Looscid will keep trying."); } catch (e) {} }
      if (fFails <= 3) { clearTimeout(fTmr); fTmr = setTimeout(function () { folSync(false); }, [3000, 10000, 30000][fFails - 1]); } }
    if (fAgain) { const p = fAgain === "pull"; fAgain = false; setTimeout(function () { folSync(p); }, 400); }
  }
}
let folT = null;
window.addEventListener("looscid:follow", function (e) { if (e && e.detail && e.detail.rem) return; clearTimeout(folT); folT = setTimeout(function () { folSync(false); }, 300); });
window.addEventListener("online", function () { folSync(true); });
document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") folSync(true); });
setInterval(function () { if (document.visibilityState === "visible") folSync(Date.now() % 120000 < 15000); }, 15000);
let fTries = 0; (function folStart() { if (ready()) { folSync(true); return; } if (++fTries < 40) setTimeout(folStart, 3000); })();
// Counts and lists from Rem, fetched in the background (at most once a minute per person). A count that comes back
// while a follow of theirs is on its way is thrown away and asked for again after, so it can't count you twice.
function want(h, kind) {
  const k = kind + ":" + h, last = WANT.get(k) || 0; if (Date.now() - last < 60000) return; WANT.set(k, Date.now());
  const g = GEN.get(h) || 0;
  Looscid.lcNet.followInfo(h, kind === "counts" ? null : kind).then(function (b) {
    if (!b) { WANT.delete(k); return; }
    if (PENDING.has(h) || (GEN.get(h) || 0) !== g) { WANT.delete(k); return; }
    setCount(h, b);
    if (kind !== "counts") PEOPLE.set(k, { people: (b.people || []).map(function (x) { return x.pk; }), hidden: b.hidden || 0 });
    tick();
  });
}
function person(h) {
  const U = Looscid.USERS || [], u = U.find(function (x) { return folHex(x) === h; }); if (u) return u;
  let np = ""; try { np = Looscid.lcNpub ? Looscid.lcNpub(h) : ""; } catch (e) {}
  const short = String(np || h).slice(0, 14), name = Looscid.lcNostrName ? Looscid.lcNostrName(h, np) : "";
  return { id: "npub:" + h, pk: h, npub: np || undefined, name: name || short, handle: "@" + short, net: "looscid" };
}
Looscid.lcRemFollows = {
  hex: folHex,
  sync: function () { return folSync(true); },
  // { followers, following, mine } for a person, or null (not on Rem, or no count yet).
  count: function (user) { const h = folHex(user); if (!h || !Looscid.lcNet || !Looscid.lcNet.followInfo) return null; want(h, "counts"); return CNT.get(h) || null; },
  // Your own followers count on Rem, or null.
  myFollowers: function () { const s = st(); if (!isHex64(s.pubkey)) return null; const h = String(s.pubkey).toLowerCase(); if (!mine) want(h, "counts"); const e = CNT.get(h); return e ? e.followers : null; },
  myFollowerPeople: function () { return mine ? mine.followers.map(function (x) { return person(x.pk); }) : null; },
  // The people Rem lists for someone (kind "followers" | "following"), or null while it loads.
  people: function (user, kind) { const h = folHex(user); if (!h) return null; want(h, kind); const p = PEOPLE.get(kind + ":" + h); return p ? p.people.map(person) : null; },
  hidden: function (user, kind) { const h = folHex(user), p = h && PEOPLE.get(kind + ":" + h); return p ? p.hidden : 0; },
};
Looscid.lcLists = {
  LISTS: LISTS.map(function (L) { return L.name; }),
  sync: function () { return sync(true); },
  paused: function () { const s = st(); return isHex64(s.pubkey) && !!cfg(String(s.pubkey).toLowerCase()).paused; },
  pause: function () { const s = st(); if (isHex64(s.pubkey)) { lsSet(SYNC_KEY, { pk: String(s.pubkey).toLowerCase(), snap: null, paused: true }); lsSet(FOL_KEY, { pk: String(s.pubkey).toLowerCase(), snap: null, paused: true }); } },
  resume: function () { const s = st(); if (isHex64(s.pubkey)) { lsSet(SYNC_KEY, { pk: String(s.pubkey).toLowerCase(), snap: null }); lsSet(FOL_KEY, { pk: String(s.pubkey).toLowerCase(), snap: null }); sync(true); folSync(true); } },
};
})(window.Looscid = window.Looscid || {});
