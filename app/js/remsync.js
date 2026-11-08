/* Looscid, js/remsync.js: Rem sync and the backup file. Plain script, loaded after more.js.

   Nov 7 2026 (Carter: "Merge Rem with the other protocol"): there is one Looscid protocol now, Rem (docs/protocol.md,
   Rem v1). This file's Rem page lives inside Settings, LooscidID, Connectionbase, under the heading Rem.
   1. Put your Dreams on Rem: a one-time choice, All my Dreams, Let me pick, or Not now. Nothing uploads without that tap.
      Public Dreams and replies (Audience Everyone) are signed here with your key as Rem v1 events, with their original
      dates, and sent to the Rem server (js/net.js, https://rem.thebntlovver.workers.dev). No sign-in needed. After that,
      they sync on their own.
   2. Nov 7 2026 (Carter: "one product, one destination"): the older Rem home (Rem v0, Oct 31 2026) is retired. Rem is
      rem.thebntlovver.workers.dev only. Its sign-in, invite and read-back are gone from the app.
   3. Settings, LooscidID, Backup file: one .looscid file with your profile, Dreams, replies, chats, likes, follows,
      settings AND your key, locked with a passcode you choose (PBKDF2 + AES-GCM, js/rem/looscid-backup.js). The same
      file opens in Looscid on any device. Restoring brings it all back and locks it to the key in the file.

   Stored on this device (localStorage looscid_server, removed by Delete local data): your choice and when you last
   synced. Old sign-ins to the retired Rem v0 home are cleared on load. The crypto files (js/rem/) load only when this is used. No CDN. */
(function (Looscid) {
"use strict";
const lh = React.createElement, useState = React.useState, useEffect = React.useEffect;
const SRV_KEY = "looscid_server";
const RESTORED_KEY = "looscid_restored_note";
// Kept out of a backup file's app copy: the key goes in its own field, and sign-in tokens never go in a file.
// Nov 8 2026: looscid_rem_lists (js/remlists.js) is only sync bookkeeping, so a restored file merges with Rem and loses nothing.
const NO_BACKUP = ["looscid_nostr_sk", "looscid_nostr_ncryptsec", "looscid_sessions", "looscid_oauth_pending", "looscid_identity", RESTORED_KEY, "looscid_rem_lists"];
const isHex64 = function (s) { return /^[0-9a-f]{64}$/i.test(String(s || "")); };
const REM_BASE = (function () {
  try { const s = document.currentScript && document.currentScript.src; if (s) return new URL("rem/", s).href; } catch (e) {}
  try { return new URL("js/rem/", location.origin + (window.LOOSCID_BASE || "/")).href; } catch (e) {}
  return "js/rem/";
})();
let modsP = null;
function mods() {
  if (!modsP) modsP = Promise.all([import(REM_BASE + "rem-client.js"), import(REM_BASE + "looscid-backup.js")])
    .then(function (a) { return { RemClient: a[0].RemClient, rem: a[0].rem, backup: a[1] }; })
    .catch(function (e) { modsP = null; const er = new Error("Couldn't load the Rem tools. Check your connection, reload Looscid, and try again."); er.code = "load"; throw er; });
  return modsP;
}
function say(t) { try { if (Looscid.announce) Looscid.announce(t); } catch (e) {} }
function lsJson(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
function lsSetJ(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function cfg() { const c = lsJson(SRV_KEY, null); return c && typeof c === "object" && !Array.isArray(c) ? c : {}; }
function emit() { try { window.dispatchEvent(new Event("looscid-server")); } catch (e) {} }
function saveCfg(patch) { const c = Object.assign(cfg(), patch); lsSetJ(SRV_KEY, c); emit(); return c; }
function hostOf(u) { try { return new URL(u).host; } catch (e) { return String(u || ""); } }
function plural(n, w, many) { return n + " " + (n === 1 ? w : (many || w + "s")); }
function err(code, t) { const e = new Error(t); e.code = code; return e; }
// Nov 7 2026 (Carter: one product, one destination): the Rem v0 home is retired. Forget any old sign-in to it on this
// device (its address, token, handle and Dream map). Your choice for Rem and your Dreams stay.
(function () { const c = cfg(), old = ["token", "home", "handle", "map", "sig", "cursor", "lastPull"]; if (old.some(function (k) { return k in c; })) { old.forEach(function (k) { delete c[k]; }); lsSetJ(SRV_KEY, c); } })();

/* --- your key --------------------------------------------------------------------- */
function keyState() { const N = Looscid.lcNostr; return N ? N.state() : { mode: "none" }; }
async function getSk() {
  const N = Looscid.lcNostr; if (!N || N.state().mode !== "key") return null;
  const NT = await N.load(); const nsec = N.nsecNow(); if (!nsec) return null;
  const d = NT.nip19.decode(nsec); return d && d.type === "nsec" ? d.data : null;
}
async function needSk() {
  const st = keyState();
  if (st.mode === "locked") throw err("locked", "Unlock your key first: type its passcode above.");
  if (st.mode === "signer") throw err("signer", "Your key is in a signer extension, which can't do this. Add your key to this device in Keys and IDs to use it.");
  const sk = await getSk(); if (!sk) throw err("nokey", "This device doesn't have your LooscidID key yet. Make a key or add yours in Keys and IDs, or restore a backup file.");
  return sk;
}

/* --- your Dreams, as Rem objects ---------------------------------------------------- */
function atOf(d) {
  let t = +d.created;
  if (!(t > 1577836800000)) { if (typeof d.id === "number" && d.id > 1577836800000) t = d.id; else return 0; }
  t = Math.round(t); return t > Date.now() + 60000 ? 0 : t;
}
function mine(d, pk) { return !d.pk || !pk || String(d.pk).toLowerCase() === pk; }
function localDreams(pk) { return lsJson("looscid_dreams", []).filter(function (d) { return d && !d.deleted && d.id != null && typeof d.text === "string" && d.text.trim() && atOf(d) && mine(d, pk); }).sort(function (a, b) { return atOf(a) - atOf(b); }); }
function localReplies(pk) { return lsJson("looscid_replies", []).filter(function (r) { return r && r.id != null && r.replyTo != null && typeof r.text === "string" && r.text.trim() && atOf(r) && mine(r, pk); }).sort(function (a, b) { return atOf(a) - atOf(b); }); }
function remBody(d, parentRid) {
  const b = { text: String(d.text), audience: (!d.aud || d.aud === "everyone" || d.aud === "public") ? "public" : "followers" };
  if (d.cw && String(d.cw).trim()) b.cw = String(d.cw).trim().slice(0, 200);
  if (parentRid) b.reply_to = parentRid;
  return b;
}
/* Every Dream and reply on this device as a Rem Dream: { k: "d:<id>" or "r:<id>", d, body, at, id }. A reply goes with the
   Dream it answers (reply_to) when that Dream is on the server or goes in the same batch; otherwise it waits (noParent). */
async function planLocal(m, pk, onlyKeys) {
  const c = cfg(), map = c.map || {}, prov = {}, out = []; let noParent = 0, tooLong = 0;
  for (const d of localDreams(pk)) {
    const k = "d:" + d.id; if (onlyKeys && !onlyKeys.has(k)) continue;
    if (String(d.text).length > 1000) { tooLong++; continue; }
    const body = remBody(d), at = atOf(d), id = map[k] || await m.rem.objectId({ by: pk, at: at, type: "dream", body: body });
    prov[k] = id; out.push({ k: k, d: d, body: body, at: at, id: id });
  }
  for (const r of localReplies(pk)) {
    const k = "r:" + r.id; if (onlyKeys && !onlyKeys.has(k)) continue;
    const pr = r.replyToReply != null ? "r:" + r.replyToReply : null, pd = "d:" + r.replyTo;
    const parent = (pr && (prov[pr] || map[pr])) || prov[pd] || map[pd] || (map[k] && isHex64(r.replyTo) ? String(r.replyTo).toLowerCase() : null);
    if (!parent) { noParent++; continue; }
    if (String(r.text).length > 1000) { tooLong++; continue; }
    const body = remBody(r, parent), at = atOf(r), id = map[k] || await m.rem.objectId({ by: pk, at: at, type: "dream", body: body });
    prov[k] = id; out.push({ k: k, d: r, body: body, at: at, id: id });
  }
  return { items: out, noParent: noParent, tooLong: tooLong };
}
function counts(pk) {
  const map = cfg().map || {}; const ds = localDreams(pk), rs = localReplies(pk);
  const on = ds.filter(function (d) { return map["d:" + d.id]; }).length + rs.filter(function (r) { return map["r:" + r.id]; }).length;
  return { dreams: ds.length, replies: rs.length, on: on };
}

let busyUp = false;
/* Nov 7 2026 (Carter: "Merge Rem with the other protocol"): Put Dreams on Rem = Rem v1. Each Dream and reply on this
   device with Audience Everyone is signed now with your key and its original time (js/nostr.js publishToRem) and sent to
   the Rem server (js/net.js, rem). No sign-in: your key is enough. Followers and Circles Dreams stay on this
   device (Rem v1 only holds public Dreams). Dreams that already have a signed id (Dreamed to Rem or Nostr before) are
   left as they are. Edits and deletes of Dreams on Rem already go out from js/nostr.js. onlyKeys = "d:<id>"/"r:<id>"
   keys you picked, or null for everything. */
function isPublic(d) { return !d.aud || d.aud === "everyone" || d.aud === "public"; }
function remCounts(pk) {
  const ds = localDreams(pk), rs = localReplies(pk), all = ds.concat(rs);
  return { dreams: ds.length, replies: rs.length, on: all.filter(function (d) { return isHex64(d.nid); }).length, pub: all.filter(isPublic).length };
}
async function upload(onlyKeys, onProgress) {
  if (busyUp) throw err("busy", "Already sending your Dreams. Try again in a moment.");
  const N = Looscid.lcNostr; if (!N || !N.publishToRem) throw err("load", "Couldn't load the Rem tools. Reload Looscid and try again.");
  const st = keyState();
  if (st.mode === "locked") throw err("locked", "Unlock your key first: type its passcode above.");
  if (!st.canDream) throw err("nokey", "This device doesn't have your LooscidID key yet. Make a key or add yours in Keys and IDs, or restore a backup file.");
  busyUp = true;
  try {
    const pk = st.pubkey;
    const res = { sent: 0, already: 0, refused: 0, messages: [], noParent: 0, tooLong: 0, edits: 0, priv: 0, queued: 0 };
    const items = localDreams(pk).map(function (d) { return { k: "d:" + d.id, d: d }; }).concat(localReplies(pk).map(function (r) { return { k: "r:" + r.id, d: r }; }))
      .filter(function (it) { return !onlyKeys || onlyKeys.has(it.k); });
    let i = 0;
    for (const it of items) {
      i++;
      if (!isPublic(it.d)) { res.priv++; continue; }
      if (isHex64(it.d.nid)) { res.already++; continue; }
      const fresh = (it.k[0] === "d" ? localDreams(pk) : localReplies(pk)).find(function (x2) { return String(x2.id) === String(it.d.id); }) || it.d;
      const r = await N.publishToRem(Object.assign({}, fresh, { created: atOf(fresh) }));
      if (r.already) res.already++;
      else if (r.wait) res.noParent++;
      else if (r.ok) res.sent++;
      else if (r.queued) { res.sent++; res.queued++; }
      else { res.refused++; const m = r.refused || (r.err === "size" ? "too big (64 KB max)" : ""); if (m && res.messages.indexOf(m) < 0) res.messages.push(m); }
      if (onProgress && i % 5 === 0) onProgress(i, items.length);
    }
    saveCfg({ lastSync: Date.now() });
    return res;
  } finally { busyUp = false; }
}

/* --- keeping it in sync --------------------------------------------------------------- */
let tickT = null;
// Rem sync needs only your key and your choice (All my Dreams or Let me pick).
function syncOn() { const c = cfg(), st = keyState(); return !!(st.canDream && st.mode !== "locked" && (c.optin === "all" || c.optin === "pick")); }
async function tick() {
  clearTimeout(tickT); tickT = setTimeout(tick, 45000);
  if (!navigator.onLine) return;
  const c = cfg();
  try {
    if (!syncOn()) return;
    if (c.optin === "all") await upload(null);
    else { const pk = keyState().pubkey, after = c.optinAt || 0, keys = new Set(); localDreams(pk).forEach(function (d) { if (atOf(d) > after) keys.add("d:" + d.id); }); localReplies(pk).forEach(function (r) { if (atOf(r) > after) keys.add("r:" + r.id); }); if (keys.size || (c.del || []).length) await upload(keys); }
  } catch (e) { /* quiet: the Rem page shows the state, and the next tick tries again */ if (e && e.code === "busy") { clearTimeout(tickT); tickT = setTimeout(tick, 3000); } }
}
window.addEventListener("online", function () { setTimeout(tick, 2000); });
window.addEventListener("looscid-nostr", function () { setTimeout(tick, 3000); });
setTimeout(tick, 6000);
// After a restore, Looscid reloads; say what came back once it's open again.
setTimeout(function () { try { const n = sessionStorage.getItem(RESTORED_KEY); if (n) { sessionStorage.removeItem(RESTORED_KEY); say(n); } } catch (e) {} }, 3500);

/* --- the backup file ------------------------------------------------------------------ */
async function makeBackup(passcode, withKey) {
  const m = await mods(); const N = Looscid.lcNostr, st = keyState();
  let sk = null;
  if (withKey) { if (st.mode === "locked") throw err("locked", "Unlock your key first: type its passcode above."); sk = await getSk(); }
  const pk = sk ? m.rem.pubkeyOf(sk) : (st.pubkey || null);
  const app = {};
  try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf("looscid_") === 0 && NO_BACKUP.indexOf(k) < 0) app[k] = localStorage.getItem(k); }); } catch (e) {}
  if (app[SRV_KEY]) { try { const s = JSON.parse(app[SRV_KEY]); delete s.token; app[SRV_KEY] = JSON.stringify(s); } catch (e) { delete app[SRV_KEY]; } }
  const prof = (Looscid.getLocalProfile && Looscid.getLocalProfile()) || {};
  const c = cfg();
  const plan = pk ? await planLocal(m, pk, null) : { items: [] };
  const remObjects = [];
  if (sk) for (const it of plan.items) remObjects.push(await m.rem.signObject("dream", it.body, sk, it.at));
  const data = { from: "app",
    key: sk ? { nsec: m.rem.nsecEncode(sk), pubkey: pk } : null,
    profile: { name: prof.displayName || prof.name || "", handle: String(prof.handle || "").replace(/^@/, ""), bio: prof.bio || "", website: prof.website || "" },
    server: c.handle && c.home ? { home: hostOf(c.home), handle: c.handle } : null,
    dreams: plan.items.map(function (it) { const o = { id: it.id, local_id: it.d.id, at: it.at, text: it.body.text, audience: it.body.audience }; if (it.body.cw) o.cw = it.body.cw; if (it.body.reply_to) o.reply_to = it.body.reply_to; return o; }),
    rem_objects: remObjects, app: app, home: null };
  const text = await m.backup.lockBackup(data, passcode);
  const name = m.backup.backupFileName(c.handle || data.profile.handle);
  m.backup.downloadBackup(name, text);
  return { name: name, dreams: data.dreams.length, withKey: !!data.key };
}
async function openBackup(file, passcode) {
  const m = await mods();
  if (!file) throw err("nofile", "Choose your backup file first. It ends in .looscid.");
  const text = await file.text();
  const d = await m.backup.unlockBackup(text, passcode);
  let pk = null;
  if (d.key && d.key.nsec) { const sk = await m.rem.parseSecret(d.key.nsec); pk = m.rem.pubkeyOf(sk); }
  return { d: d, pk: pk, sameKey: !!(pk && keyState().pubkey === pk), deviceHasKey: !!keyState().pubkey && keyState().mode !== "view" };
}
// Put a backup back: the key (locked here with the file's passcode), then everything else, then Looscid reloads.
async function restoreBackup(opened, passcode) {
  const m = await mods(), d = opened.d, N = Looscid.lcNostr;
  const parts = [];
  if (d.key && d.key.nsec) {
    if (!N) throw err("nokey", "Couldn't load the key tools. Reload Looscid and try again.");
    const r = await N.importKey(d.key.nsec, passcode);
    if (r.err && !r.same) throw err("key", "Your key couldn't be saved: " + r.err + " Nothing was changed.");
    parts.push(r.same ? "your key was already here" : "your key, locked with the file's passcode");
  } else if (!keyState().pubkey) parts.push("no key (the file was saved without one)");
  let nd = 0, nr = 0;
  if (d.app && typeof d.app === "object") {
    const mergeList = function (k, incoming) {
      let have = lsJson(k, []); if (!Array.isArray(have)) have = [];
      let inc = []; try { inc = JSON.parse(incoming); } catch (e) {} if (!Array.isArray(inc)) inc = [];
      const ids = new Set(have.map(function (x2) { return x2 && String(x2.id); }));
      const add = inc.filter(function (x2) { return x2 && !ids.has(String(x2.id)); });
      lsSetJ(k, have.concat(add).sort(function (a, b) { return (+b.created || 0) - (+a.created || 0); }).slice(0, k === "looscid_dreams" ? 1000 : 2000));
      return add.filter(function (x2) { return !x2.deleted; }).length;
    };
    Object.keys(d.app).forEach(function (k) {
      if (k.indexOf("looscid_") !== 0 || NO_BACKUP.indexOf(k) >= 0 || typeof d.app[k] !== "string") return;
      if (k === "looscid_dreams") { nd += mergeList(k, d.app[k]); return; }
      if (k === "looscid_replies") { nr += mergeList(k, d.app[k]); return; }
      if (k === SRV_KEY) { try { const s = JSON.parse(d.app[k]); delete s.token; if (opened.pk && s.pubkey && s.pubkey !== opened.pk) return; lsSetJ(k, s); } catch (e) {} return; }
      try { localStorage.setItem(k, d.app[k]); } catch (e) {}
    });
    // Nov 1 2026: the file's login list must not drop this device's Nostr login (your key stays here, and its npub shows on your profile).
    try { const idn = Looscid.getIdentity && Looscid.getIdentity(); if (idn && idn.provider === "nostr" && Looscid.getMethods && !Looscid.getMethods().some(function (x2) { return x2 && x2.provider === "nostr"; })) Looscid.setIdentity(idn); } catch (e) {}
  } else {
    // A file from the Looscid server's website: its Dreams and replies become Dreams on this device (already on the server).
    const map = Object.assign({}, cfg().map || {}), sig = Object.assign({}, cfg().sig || {});
    let D = lsJson("looscid_dreams", []), R = lsJson("looscid_replies", []); if (!Array.isArray(D)) D = []; if (!Array.isArray(R)) R = [];
    const have = new Set(D.concat(R).map(function (x2) { return x2 && String(x2.id); }));
    const isReply = {}; (d.dreams || []).forEach(function (x2) { if (x2.reply_to) isReply[x2.id] = x2; });
    (d.dreams || []).forEach(function (x2) {
      if (!x2 || !isHex64(x2.id) || typeof x2.text !== "string" || have.has(x2.id)) return;
      const rec = { id: x2.id, text: x2.text, created: x2.at, likes: 0 }; if (x2.cw) rec.cw = x2.cw; if (x2.audience === "followers") rec.aud = "followers";
      if (x2.reply_to) {
        let root = x2.reply_to, rtr; const p = isReply[root]; if (p) { rtr = p.id; let q = p, n = 0; while (q && q.reply_to && n++ < 20) { root = q.reply_to; q = isReply[root]; } }
        rec.replyTo = root; if (rtr) rec.replyToReply = rtr; R.push(rec); map["r:" + x2.id] = x2.id; sig["r:" + x2.id] = x2.id; nr++;
      } else { rec.redreams = 0; rec.quotes = 0; D.push(rec); map["d:" + x2.id] = x2.id; sig["d:" + x2.id] = x2.id; nd++; }
    });
    const byNew = function (a, b) { return (+b.created || 0) - (+a.created || 0); };
    lsSetJ("looscid_dreams", D.sort(byNew).slice(0, 1000)); lsSetJ("looscid_replies", R.sort(byNew).slice(0, 2000));
    const srv = d.server && d.server.home ? { home: "https://" + String(d.server.home).replace(/^https?:\/\//, "").replace(/\/.*$/, ""), handle: d.server.handle, pubkey: opened.pk } : {};
    saveCfg(Object.assign(srv, { map: map, sig: sig, token: null }));
    const p = d.profile || {}, lp = (Looscid.getLocalProfile && Looscid.getLocalProfile()) || null;
    if (lp && (p.name || p.bio)) { try { const nm = String(p.name || lp.displayName); localStorage.setItem("looscid_local_profile", JSON.stringify(Object.assign({}, lp, { displayName: nm, name: nm, bio: p.bio || lp.bio || "", handle: p.handle ? "@" + String(p.handle).replace(/^@/, "") : lp.handle, initials: nm.trim().slice(0, 1).toUpperCase() || lp.initials }))); } catch (e) {} }
  }
  parts.unshift(plural(nd, "Dream") + " and " + plural(nr, "reply", "replies"));
  const note = "Backup restored: " + parts.join(", ") + ".";
  try { sessionStorage.setItem(RESTORED_KEY, note); } catch (e) {}
  return note;
}

/* --- the pages ------------------------------------------------------------------------ */
function useBump() {
  const [, set] = useState(0);
  useEffect(function () { const f = function () { set(function (n) { return n + 1; }); }; ["looscid-server", "looscid-nostr", "looscid-replies", "looscid-dreams-fetched"].forEach(function (e) { window.addEventListener(e, f); });
    return function () { ["looscid-server", "looscid-nostr", "looscid-replies", "looscid-dreams-fetched"].forEach(function (e) { window.removeEventListener(e, f); }); }; }, []);
}
function focusSoon(id) { setTimeout(function () { const el = document.getElementById(id); if (el) el.focus(); }, 60); }
function Btn(props) { return lh('button', Object.assign({ type: "button", className: "btn bgb lid-wide" }, props), props.children); }
function Note({ msg, err, id }) {
  return lh(React.Fragment, null,
    msg ? lh('p', { className: "lid-saved", id: id || undefined, tabIndex: -1 }, msg) : null,
    err ? lh('p', { className: "lid-warn", id: id ? id + "-err" : undefined, tabIndex: -1 }, err) : null);
}
// The key's passcode, when the key on this device is locked.
function UnlockKey({ id, why }) {
  const [p, setP] = useState(""); const [e, setE] = useState(""); const [busy, setBusy] = useState(false);
  return lh('div', null,
    lh('p', { className: "lid-help", id: id + "-why" }, why),
    lh('label', { htmlFor: id + "-kp", className: "lid-label" }, "Your key's passcode"),
    lh('input', { id: id + "-kp", className: "inp", type: "password", autoComplete: "current-password", autoCapitalize: "off", spellCheck: false, value: p, onChange: function (ev) { setP(ev.target.value); } }),
    e ? lh('p', { className: "lid-warn", id: id + "-ke", tabIndex: -1 }, e) : null,
    lh(Btn, { disabled: busy, onClick: async function () {
      setBusy(true); setE("");
      const r = await Looscid.lcNostr.unlock(p); setBusy(false);
      if (r.err) { setE(r.err); say(r.err); focusSoon(id + "-ke"); } else { setP(""); say("Key unlocked"); }
    } }, "Unlock key"));
}

function LcServerPanel({ go }) {
  useBump();
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(""), [er, setEr] = useState("");
  const [pick, setPick] = useState(null);
  const st = keyState(), c = cfg();
  const done = function (t, focusId) { setEr(""); setMsg(t); say(t); focusSoon(focusId || "srv-msg"); };
  const fail = function (e) { const t = (e && e.message) || String(e); setMsg(""); setEr(t); say(t); focusSoon("srv-msg-err"); };
  const run = async function (fn) { setBusy(true); setEr(""); setMsg(""); try { await fn(); } catch (e) { fail(e); } finally { setBusy(false); } };
  const upText = function (r) {
    const bits = [r.sent || !r.already ? plural(r.sent, "Dream") + " put on Rem" : "Your Dreams were already on Rem"];
    if (r.already && r.sent) bits.push(r.already + " already there");
    if (!r.sent && !r.already && !r.noParent && !r.tooLong && !r.refused) return "All your public Dreams are already on Rem.";
    if (r.noParent) bits.push(plural(r.noParent, "reply", "replies") + " wait on this device until the Dreams they answer are on Rem");
    if (r.tooLong) bits.push(r.tooLong + " too long stay on this device");
    if (r.refused) bits.push(r.refused + " Rem didn't take" + (r.messages[0] ? " (" + r.messages[0] + ")" : ""));
    if (r.priv) bits.push(plural(r.priv, "Followers or Circles Dream") + " stay on this device");
    if (r.queued) bits.push(r.queued + " wait on this device and go when Rem is reachable");
    return bits.join(", ") + ".";
  };
  const progress = function (n, of) { setMsg("Uploading " + n + " of " + of + "…"); };
  const intro = lh('p', { className: "lid-help" }, "Put your Dreams on Rem so they follow you to any device and friends can find you. Every Dream is signed with your LooscidID key, so nobody can fake yours. Nothing older uploads until you choose.");
  let body;
  const pk = st.pubkey;
  if (st.mode === "none" || st.mode === "view") body = lh(React.Fragment, null,
    lh('p', { className: "lid-help" }, "This device doesn't have your LooscidID key yet. Make a key or add yours in Keys and IDs, or bring everything back from a backup file."),
    go && lh(Btn, { onClick: function () { go("keys"); } }, "Open Keys and IDs"),
    go && lh(Btn, { onClick: function () { go("backup"); } }, "Open Backup file"));
  else if (st.mode === "locked") body = lh(UnlockKey, { id: "srv", why: "Your key is locked with a passcode. Unlock it to put your Dreams on Rem." });
  else {
    let remPart;
    if (pick) {
      const rows = localDreams(pk).map(function (d) { return { k: "d:" + d.id, t: d.text, at: atOf(d), reply: false, d: d }; })
        .concat(localReplies(pk).map(function (r) { return { k: "r:" + r.id, t: r.text, at: atOf(r), reply: true, d: r }; }))
        .filter(function (x2) { return !isHex64(x2.d.nid) && isPublic(x2.d); }).sort(function (a, b) { return b.at - a.at; });
      const when = function (t) { try { return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); } catch (e) { return ""; } };
      remPart = lh('fieldset', { className: "lid-panel", style: { border: 0, padding: 0, margin: 0 } },
        lh('legend', { className: "lid-label", id: "srv-pick-h", tabIndex: -1 }, "Choose Dreams to put on Rem"),
        rows.length ? null : lh('p', { className: "lid-help" }, "Every public Dream on this device is already on Rem."),
        lh(Btn, { onClick: function () { const all = rows.length && rows.every(function (r) { return pick.has(r.k); }); setPick(new Set(all ? [] : rows.map(function (r) { return r.k; }))); say(all ? "None selected" : "All " + rows.length + " selected"); } }, rows.length && rows.every(function (r) { return pick.has(r.k); }) ? "Select none" : "Select all"),
        lh('ul', { className: "lid-links", style: { listStyle: "none", paddingLeft: 0 } }, rows.map(function (r) {
          const t = r.t.replace(/\s+/g, " ").trim(), short = t.length > 90 ? t.slice(0, 90) + "…" : t;
          return lh('li', { key: r.k }, lh('label', { className: "lc-radio" + (pick.has(r.k) ? " on" : "") },
            lh('input', { type: "checkbox", checked: pick.has(r.k), onChange: function () { const n = new Set(pick); if (n.has(r.k)) n.delete(r.k); else n.add(r.k); setPick(n); } }),
            lh('span', null, (r.reply ? "Reply: " : "") + short + ", " + when(r.at))));
        })),
        lh(Btn, { disabled: busy || !pick.size, onClick: function () { run(async function () {
          const r = await upload(pick, progress);
          saveCfg({ optin: cfg().optin === "all" ? "all" : "pick", optinAt: cfg().optinAt || Date.now() }); setPick(null);
          done(upText(r) + " New Dreams you make go to Rem too.", "srv-msg");
        }); } }, "Put " + plural(pick.size, "chosen Dream") + " on Rem"),
        lh(Btn, { onClick: function () { setPick(null); focusSoon("srv-status"); } }, "Cancel"));
    } else {
      const n = remCounts(pk);
      const statusText = c.optin === "all" ? "Syncing is on: all your public Dreams, and new ones as you make them."
        : c.optin === "pick" ? "Syncing is on for the Dreams you picked, and new ones as you make them."
        : c.optin === "none" ? "Your older Dreams stay on this device. New public Dreams still go to Rem." : null;
      remPart = lh(React.Fragment, null,
        lh('p', { className: "lid-help", id: "srv-status", tabIndex: -1 }, n.on ? plural(n.on, "Dream") + " of " + (n.dreams + n.replies) + " on this device " + (n.on === 1 ? "is" : "are") + " on Rem." : "None of the Dreams on this device are on Rem yet."),
        c.optin == null ? lh('section', { "aria-labelledby": "srv-optin-h" },
          lh('h3', { className: "lid-label", id: "srv-optin-h", tabIndex: -1 }, "Put your Dreams on Rem?"),
          lh('p', { className: "lid-help" }, "You have " + plural(n.dreams, "Dream") + " and " + plural(n.replies, "reply", "replies") + " on this device, and " + n.pub + " of them " + (n.pub === 1 ? "is" : "are") + " public (Audience Everyone). Public ones can go on Rem, signed with your key, with their original dates. Followers and Circles Dreams stay on this device. Nothing uploads unless you choose."),
          lh(Btn, { disabled: busy, onClick: function () { run(async function () { saveCfg({ optin: "all", optinAt: Date.now() }); const r = await upload(null, progress); done(upText(r) + " New Dreams you make go to Rem too.", "srv-msg"); }); } }, "All my Dreams"),
          lh(Btn, { disabled: busy, onClick: function () { setPick(new Set()); focusSoon("srv-pick-h"); } }, "Let me pick"),
          lh(Btn, { disabled: busy, onClick: function () { saveCfg({ optin: "none" }); done("OK. Your older Dreams stay on this device. You can change this here any time.", "srv-status"); } }, "Not now"))
        : lh('p', { className: "lid-help" }, statusText),
        (c.optin === "all" || c.optin === "pick") && lh(Btn, { disabled: busy, onClick: function () { run(async function () {
          let r = null; if (c.optin === "all") r = await upload(null, progress); else { const keys = new Set(); localDreams(pk).forEach(function (d) { if (atOf(d) > (c.optinAt || 0)) keys.add("d:" + d.id); }); localReplies(pk).forEach(function (x2) { if (atOf(x2) > (c.optinAt || 0)) keys.add("r:" + x2.id); }); r = await upload(keys, progress); }
          done("Synced." + (r && r.sent ? " " + plural(r.sent, "Dream") + " sent to Rem." : " Nothing new to send."), "srv-msg");
        }); } }, "Sync now"),
        c.optin === "none" && lh(Btn, { disabled: busy, onClick: function () { saveCfg({ optin: null }); focusSoon("srv-optin-h"); } }, "Put my Dreams on Rem"),
        (c.optin === "all" || c.optin === "pick") && lh(Btn, { disabled: busy, onClick: function () { setPick(new Set()); focusSoon("srv-pick-h"); } }, "Choose more Dreams"),
        (c.optin === "all" || c.optin === "pick") && lh(Btn, { disabled: busy, onClick: function () { saveCfg({ optin: "none" }); done("Syncing is off. Dreams already on Rem stay there.", "srv-status"); } }, "Stop syncing"));
    }
    body = remPart;
  }
  return lh('div', { className: "lid-panel" }, intro, body, lh(Note, { msg: msg, err: er, id: "srv-msg" }));
}

function LcBackupPanel({ go }) {
  useBump();
  const [p1, setP1] = useState(""), [p2, setP2] = useState(""), [withKey, setWithKey] = useState(true);
  const [rp, setRp] = useState(""), [fileName, setFileName] = useState(""); const fileRef = React.useRef(null);
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(""), [er, setEr] = useState(""), [confirm, setConfirm] = useState(null);
  const st = keyState();
  const done = function (t) { setEr(""); setMsg(t); say(t); focusSoon("bk-msg"); };
  const fail = function (e, focusId) { const t = (e && e.message) || String(e); setMsg(""); setEr(t); say(t); focusSoon(focusId || "bk-msg-err"); };
  const finishRestore = async function (opened, pass) {
    setBusy(true);
    try { const note = await restoreBackup(opened, pass); setRp(""); done(note + " Looscid reloads now."); setTimeout(function () { location.reload(); }, 2500); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };
  const noKeyHere = st.mode === "none" || st.mode === "view" || st.mode === "signer";
  return lh('div', { className: "lid-panel" },
    lh('p', { className: "lid-help" }, "One file with everything: your profile, Dreams, replies, chats, likes, follows, settings, and your LooscidID key. It opens in Looscid on any device."),
    lh('p', { className: "lid-warn", id: "bk-warn" }, "This file contains your key. Anyone who has the file and its passcode can Dream as you, so keep it private. It's locked with a passcode you choose, and nobody can recover a forgotten passcode."),
    lh('h2', { className: "lid-label", id: "bk-save-h" }, "Save backup file"),
    st.mode === "locked" && withKey ? lh(UnlockKey, { id: "bk", why: "Your key is locked with a passcode. Unlock it so it can go in the file." }) : null,
    noKeyHere ? lh('p', { className: "lid-help" }, st.mode === "signer" ? "Your key is in a signer extension, so it can't go in the file. Everything else can." : "This device doesn't have a key yet, so the file won't have one.") :
      lh('label', { className: "lc-radio" + (withKey ? " on" : "") }, lh('input', { type: "checkbox", id: "bk-withkey", checked: withKey, onChange: function () { setWithKey(!withKey); } }), lh('span', null, "Put my key in the file (recommended)")),
    noKeyHere ? null : lh('p', { className: "lid-help", id: "bk-withkey-d" }, withKey ? "With your key, the file brings back everything on a new device by itself." : "Without your key, you'll need your key (or recovery phrase) too when you restore."),
    lh('label', { htmlFor: "bk-pass", className: "lid-label" }, "Passcode for the file"),
    lh('input', { id: "bk-pass", className: "inp", type: "password", autoComplete: "new-password", autoCapitalize: "off", spellCheck: false, value: p1, onChange: function (e) { setP1(e.target.value); } }),
    lh('p', { className: "lid-help", id: "bk-pass-d" }, "At least 8 characters. Four short words work well, like: blue lamp river jump. Nobody can recover it if you forget it."),
    lh('label', { htmlFor: "bk-pass2", className: "lid-label" }, "Type the passcode again"),
    lh('input', { id: "bk-pass2", className: "inp", type: "password", autoComplete: "new-password", autoCapitalize: "off", spellCheck: false, value: p2, onChange: function (e) { setP2(e.target.value); } }),
    lh(Btn, { id: "bk-save", disabled: busy, onClick: async function () {
      const m = await mods().catch(function (e) { fail(e); return null; }); if (!m) return;
      const bad = m.backup.passcodeProblem(p1); if (bad) { fail(new Error(bad), "bk-pass"); return; }
      if (p1 !== p2) { fail(new Error("The two passcodes don't match. Type them again."), "bk-pass2"); return; }
      setBusy(true); setEr(""); setMsg("Making your backup file. This takes a few seconds."); say("Making your backup file");
      try { const r = await makeBackup(p1, withKey && !noKeyHere); setP1(""); setP2(""); done("Backup file saved as " + r.name + ", with " + plural(r.dreams, "Dream") + (r.withKey ? " and your key" : ", without your key") + ". Keep it private."); }
      catch (e) { fail(e); } finally { setBusy(false); }
    } }, "Save backup file"),
    lh('h2', { className: "lid-label", id: "bk-restore-h" }, "Restore from backup file"),
    lh('p', { className: "lid-help", id: "bk-file-d" }, "Bring everything back from a .looscid file made in Looscid. Your key from the file is saved on this device, locked with the file's passcode."),
    lh('label', { htmlFor: "bk-file", className: "lid-label" }, "Backup file"),
    lh('input', { id: "bk-file", ref: fileRef, className: "inp", type: "file", onChange: function (e) { setFileName(e.target.files && e.target.files[0] ? e.target.files[0].name : ""); } }),
    lh('label', { htmlFor: "bk-rpass", className: "lid-label" }, "Passcode for the file"),
    lh('input', { id: "bk-rpass", className: "inp", type: "password", autoComplete: "current-password", autoCapitalize: "off", spellCheck: false, value: rp, onChange: function (e) { setRp(e.target.value); } }),
    lh(Btn, { id: "bk-restore", disabled: busy, onClick: async function () {
      const f = fileRef.current && fileRef.current.files && fileRef.current.files[0];
      if (!f) { fail(new Error("Choose your backup file first. It ends in .looscid."), "bk-file"); return; }
      if (!rp) { fail(new Error("Type the passcode for this backup file first."), "bk-rpass"); return; }
      setBusy(true); setEr(""); setMsg("Opening your backup file…"); say("Opening your backup file");
      let opened = null;
      try { opened = await openBackup(f, rp); } catch (e) { setBusy(false); fail(e, e && e.code === "wrong_passcode" ? "bk-msg-err" : undefined); return; }
      setBusy(false);
      if (opened.pk && opened.deviceHasKey && !opened.sameKey) { setMsg(""); setConfirm(opened); return; }
      finishRestore(opened, rp);
    } }, "Restore from backup file"),
    confirm && Looscid.AlertDialog && lh(Looscid.AlertDialog, { title: "Replace the key on this device?",
      message: "This backup file has a different LooscidID than this device. Restoring saves the file's key here instead, and its Dreams join the ones already here. Save a backup of this device first if you want to keep its key.",
      confirmLabel: "Replace and restore", onCancel: function () { setConfirm(null); focusSoon("bk-restore"); }, onConfirm: function () { const o = confirm; setConfirm(null); finishRestore(o, rp); } }),
    lh(Note, { msg: msg, err: er, id: "bk-msg" }));
}

/* --- Mode: Local only or Looscid server (Oct 31 2026, Carter: "how would you know if you're using the local version or
   the server based version"). One plain line at the top of More, the LooscidID home page, Looscid server and Settings.
   A change of mode is announced once, politely, a moment after the change so it doesn't cut off the other message. */
function agoText(t) {
  const s = Math.round((Date.now() - t) / 1000); if (s < 45) return "just now";
  const m = Math.round(s / 60); if (m < 60) return plural(m, "minute") + " ago";
  const h = Math.round(m / 60); if (h < 24) return plural(h, "hour") + " ago";
  const d = Math.round(h / 24); if (d < 7) return plural(d, "day") + " ago";
  return "on " + new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function modeNow() {
  // Nov 7 2026: "Rem" mode = your Dreams sync to Rem (you chose All my Dreams or Let me pick).
  const c = cfg(), sync = syncOn();
  return { on: sync, sync: sync, handle: "", host: "Rem", last: +c.lastSync || 0 };
}
function modeText(m) {
  m = m || modeNow();
  if (m.sync) return "Mode: Rem. Your public Dreams sync to Rem. " + (m.last ? "Last synced " + agoText(m.last) + "." : "Not synced yet.");
  return "Mode: Local. Your Dreams live on this device, and new public Dreams also go to Rem.";
}
let lastModeKey = modeNow().sync ? "server" : "local", modeSayT = null;
window.addEventListener("looscid-server", function () {
  const k = modeNow().sync ? "server" : "local"; if (k === lastModeKey) return; lastModeKey = k;
  clearTimeout(modeSayT); modeSayT = setTimeout(function () { say(k === "server" ? "Mode is now Rem." : "Mode is now Local."); }, 1800);
});
function LcModeLine(props) {
  const [, tick] = useState(0);
  useEffect(function () { const f = function () { tick(function (n) { return n + 1; }); }; window.addEventListener("looscid-server", f); const iv = setInterval(f, 60000);
    return function () { window.removeEventListener("looscid-server", f); clearInterval(iv); }; }, []);
  const m = modeNow();
  return lh('p', { className: "lc-mode-line " + (m.sync ? "lc-mode-server" : "lc-mode-local"), style: Object.assign({ margin: "8px 16px", padding: "10px 12px", borderRadius: 12, borderLeft: "4px solid " + (m.sync ? "#10b981" : "#a78bfa"), background: "rgba(127,127,127,.12)", fontSize: 14, lineHeight: 1.45, fontWeight: 600 }, props && props.style) }, modeText(m));
}
/* --- "Switch to the Looscid server?" (Nov 1 2026, Carter: "a prompt appears that you are using the local version of
   Looscid. Do you want to upgrade to server?"). Shown once, to people in Local mode who aren't signed in to a server, after
   first-run setup and never on top of another dialog. Switch to server opens Settings, LooscidID, Looscid server (nothing
   syncs until you sign in and choose your Dreams there); Stay local, or Escape, keeps Local mode. Either way it's remembered
   (localStorage looscid_server_ask) and never shown again on its own; the option stays in Settings. */
const ASK_KEY = "looscid_server_ask";
function askDone() { try { return !!localStorage.getItem(ASK_KEY); } catch (e) { return true; } }
function LcServerAsk(props) {
  const [show, setShow] = useState(false);
  const hRef = React.useRef(null), boxRef = React.useRef(null);
  useEffect(function () {
    if (askDone() || modeNow().on) return;
    const t = setTimeout(function () {
      if (askDone() || modeNow().on) return;
      if (document.querySelector('[role="dialog"],[role="alertdialog"],[aria-modal="true"]')) return; // another dialog is open: ask on the next visit
      setShow(true);
    }, 2500);
    return function () { clearTimeout(t); };
  }, []);
  useEffect(function () { if (show && hRef.current) hRef.current.focus(); }, [show]);
  if (!show) return null;
  const pick = function (v) {
    try { localStorage.setItem(ASK_KEY, v); } catch (e) {}
    setShow(false);
    if (v === "server") { if (props.navigate) props.navigate("settings_account", { tab: "connectionbase" }); }
    else say("Staying in Local mode. Rem is in Settings, LooscidID, Connectionbase, whenever you want it.");
  };
  const onKey = function (e) {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); pick("local"); return; }
    if (Looscid.lcTrapTab) Looscid.lcTrapTab(e, boxRef.current);
  };
  return lh(AskOverlay, null,
    lh('div', { className: "lc-q", role: "dialog", "aria-modal": "true", "aria-labelledby": "lc-srv-ask-t", ref: boxRef, onKeyDown: onKey },
      lh('h2', { id: "lc-srv-ask-t", tabIndex: -1, ref: hRef, className: "lc-q-h lc-q-t" }, "You're using Looscid in Local mode"),
      lh('div', { className: "lc-q-intro" },
        lh('p', null, "Want to put your Dreams on Rem? It keeps your public Dreams synced on all your devices with your LooscidID."),
        lh('p', null, "Your older Dreams go on Rem only after you choose which ones. You can change this any time in Settings, LooscidID, Connectionbase.")),
      lh('div', { className: "lc-q-btns" },
        lh('button', { type: "button", className: "btn bp lc-big", onClick: function () { pick("server"); } }, "Put my Dreams on Rem"),
        lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { pick("local"); } }, "Stay local"))));
}
// The overlay makes everything behind the question unreachable while it's open (same as the first-run question).
function AskOverlay(props) {
  const ref = React.useRef(null);
  if (Looscid.useInertBehind) Looscid.useInertBehind(ref);
  return lh('div', { className: "lc-q-ov", ref: ref }, props.children);
}
Looscid.lcServer = { cfg: cfg, remCounts: remCounts, upload: upload, tick: tick, makeBackup: makeBackup, openBackup: openBackup, restoreBackup: restoreBackup, mode: modeNow };
Looscid.LcServerPanel = LcServerPanel;
Looscid.LcModeLine = LcModeLine;
Looscid.LcServerAsk = LcServerAsk;
Looscid.lcModeText = modeText;
Looscid.LcBackupPanel = LcBackupPanel;
})(window.Looscid = window.Looscid || {});
