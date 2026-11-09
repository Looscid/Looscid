/* Looscid, js/remsync.js: Rem sync and the backup file. Plain script, loaded after more.js.

   Nov 7 2026 (Carter: "Merge Rem with the other protocol"): there is one Looscid protocol now, Rem (docs/protocol.md,
   Rem v1). This file's Rem part lives on the Rem screen in LooscidID (Nov 8 2026, its own screen: RemSettings in js/more.js).
   1. Nov 9 2026 (Carter: "local mode should be discontinued immediately"): Local mode and the one-time choice (All my
      Dreams, Let me pick, Not now) are gone. Cooked Dreams always go on Rem. With your key on this device, every Dream and
      reply with Audience Everyone that isn't on Rem yet, older ones too, is signed here with your key as a Rem v1 event,
      with its original date, and sent to the Rem server (js/net.js, https://rem.thebntlovver.workers.dev) on the next open.
      Older Dreams that went to Nostr before Rem existed are copied to Rem exactly as they were signed (read back from your
      relays). Sharing is per Dream: Followers only, My Circles and Only this device Dreams stay on this device, and
      Uncooked Dreams (drafts, looscid_drafts) are never read here at all. After Delete my Rem data, nothing older than
      that goes back up. The first time older Dreams go up, a notice says so, with Learn more about Rem (LcRemSynced).
   2. Nov 7 2026 (Carter: "one product, one destination"): the older Rem home (Rem v0, Oct 31 2026) is retired. Rem is
      rem.thebntlovver.workers.dev only. Its sign-in, invite and read-back are gone from the app.
   3. Settings, LooscidID, Backup file: one .looscid file with your profile, Dreams, replies, chats, likes, follows,
      settings AND your key, locked with a passcode you choose (PBKDF2 + AES-GCM, js/rem/looscid-backup.js). The same
      file opens in Looscid on any device. Restoring brings it all back and locks it to the key in the file.

   Stored on this device (localStorage looscid_server, removed by Delete local data): when you last synced, which older
   Dreams are confirmed on Rem (remOk), what the first sync put there (synced), and when you deleted your Rem data (forgotAt). Old sign-ins to the retired Rem v0 home are cleared on load. The crypto files (js/rem/) load only when this is used. No CDN. */
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
// Nov 9 2026: after Delete my Rem data (or when Rem had nothing for you anymore and your lists stopped syncing here), Dreams
// from before that moment are never sent back up. New Dreams after it go up like always.
function forgotAt() {
  const c = cfg(); if (+c.forgotAt) return +c.forgotAt;
  try { if (Looscid.lcLists && Looscid.lcLists.paused && Looscid.lcLists.paused()) { const t = Date.now(); saveCfg({ forgotAt: t }); return t; } } catch (e) {}
  return 0;
}
function markForgot() { saveCfg({ forgotAt: Date.now(), remOk: [] }); }
async function upload(onlyKeys, onProgress) {
  if (busyUp) throw err("busy", "Already sending your Dreams. Try again in a moment.");
  const N = Looscid.lcNostr; if (!N || !N.publishToRem) throw err("load", "Couldn't load the Rem tools. Reload Looscid and try again.");
  const st = keyState();
  if (st.mode === "locked") throw err("locked", "Unlock your key first: type its passcode above.");
  if (!st.canDream) throw err("nokey", "This device doesn't have your LooscidID key yet. Make a key or add yours in Keys and IDs, or restore a backup file.");
  busyUp = true;
  try {
    const pk = st.pubkey;
    const res = { sent: 0, already: 0, refused: 0, messages: [], noParent: 0, tooLong: 0, edits: 0, priv: 0, queued: 0, okD: 0, okR: 0, old: 0, okKeys: [] };
    const fa = forgotAt();
    const items = localDreams(pk).map(function (d) { return { k: "d:" + d.id, d: d }; }).concat(localReplies(pk).map(function (r) { return { k: "r:" + r.id, d: r }; }))
      .filter(function (it) { return !onlyKeys || onlyKeys.has(it.k); });
    let i = 0;
    for (const it of items) {
      i++;
      if (!isPublic(it.d)) { res.priv++; continue; }
      if (isHex64(it.d.nid)) { res.already++; continue; }
      if (fa && atOf(it.d) <= fa) { res.old++; continue; } // you deleted your Rem data after this one: it stays here
      if (N.isPending && N.isPending(it.d.id)) continue; // waiting for your passcode in js/nostr.js's queue: it goes from there
      const fresh = (it.k[0] === "d" ? localDreams(pk) : localReplies(pk)).find(function (x2) { return String(x2.id) === String(it.d.id); }) || it.d;
      const r = await N.publishToRem(Object.assign({}, fresh, { created: atOf(fresh) }));
      if (r.already) res.already++;
      else if (r.wait) res.noParent++;
      else if (r.ok) { res.sent++; if (it.k[0] === "d") res.okD++; else res.okR++; res.okKeys.push(it.k); }
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
// Nov 9 2026 (Carter: "local mode should be discontinued immediately"): no choice to make anymore. Your key on this device
// (unlocked) is all Rem sync needs.
function syncOn() { const st = keyState(); return !!(st.canDream && st.mode !== "locked"); }
// Your own Dreams and replies on this device, as { k: "d:<id>" or "r:<id>", d }.
function mineItems(pk) { return localDreams(pk).map(function (d) { return { k: "d:" + d.id, d: d }; }).concat(localReplies(pk).map(function (r) { return { k: "r:" + r.id, d: r }; })); }
/* Older Dreams that already have a signed id: they went to Nostr (before Rem existed) or to Rem, but this device doesn't know
   which. Once per open: ask Rem which of yours it has (GET /dreams/<your key>, read only). The ones it doesn't have are read
   back from your Nostr relays (the original signed Dream, checked) and sent to Rem exactly as they were signed, so their id
   doesn't change. One that isn't on any relay either, two opens in a row, is signed again for Rem with its first date. */
let nidDone = false;
async function backfillNid(pk) {
  const res = { okD: 0, okR: 0, missing: 0 };
  if (nidDone) return res;
  const L = Looscid.lcNet, N = Looscid.lcNostr; if (!L || !L.API || !L.ingest || !N) return res;
  const c = cfg(), ok = new Set(Array.isArray(c.remOk) ? c.remOk : []), fa = forgotAt();
  const cand = mineItems(pk).filter(function (it) { return isHex64(it.d.nid) && isPublic(it.d) && !ok.has(it.k) && !(fa && atOf(it.d) <= fa); });
  if (!cand.length) { nidDone = true; return res; }
  const onRem = new Set(); let before = "", pages = 0;
  while (pages++ < 30) {
    let b = null;
    try { const r = await fetch(L.API + "/dreams/" + pk + "?limit=100" + (before ? "&before=" + before : ""), { cache: "no-store", credentials: "omit" }); if (r.ok) b = await r.json(); } catch (e) {}
    if (!b || !Array.isArray(b.dreams)) return res; // Rem didn't answer: try again on the next tick
    b.dreams.forEach(function (x2) { if (x2 && x2.id) onRem.add(String(x2.id).toLowerCase()); });
    if (!b.next) break; before = String(b.next);
  }
  // Dreams a Looscid admin removed, or that are hidden after reports, are on Rem too: they're left exactly as they are.
  let modOk = false;
  try { const r = await fetch(L.API + "/moderation/" + pk, { cache: "no-store", credentials: "omit" }); if (r.ok) { const b = await r.json(); (b.items || []).forEach(function (x2) { if (x2 && x2.dream_id) onRem.add(String(x2.dream_id).toLowerCase()); }); modOk = true; } } catch (e) {}
  const todo = [];
  cand.forEach(function (it) { if (onRem.has(String(it.d.nid).toLowerCase())) ok.add(it.k); else todo.push(it); });
  const miss = Object.assign({}, c.nidMiss || {});
  if (todo.length) {
    let evs = {}; try { if (N.fetchByIds) evs = await N.fetchByIds(todo.map(function (it) { return it.d.nid; })); } catch (e) {}
    for (const it of todo) {
      const ev = evs[String(it.d.nid).toLowerCase()];
      let sent = false;
      if (ev) { const s = await L.ingest(ev); sent = !!(s && s.ok); } // a busy Rem keeps it in js/net.js's queue
      else if (modOk && (miss[it.k] = (miss[it.k] || 0) + 1) >= 2) {
        const p = await N.publishToRem(Object.assign({}, it.d, { nid: undefined, created: atOf(it.d) }));
        sent = !!(p && p.ok);
      }
      if (sent) { ok.add(it.k); delete miss[it.k]; if (it.k[0] === "d") res.okD++; else res.okR++; } else res.missing++;
    }
  }
  saveCfg({ remOk: Array.from(ok).slice(-5000), nidMiss: miss });
  nidDone = true;
  return res;
}
// The first time older Dreams go up, Looscid says so once (LcRemSynced). What went up is kept for About Rem.
const NOTE_EVT = "looscid-rem-synced";
function noteSync(a, b) {
  const d = (a.okD || 0) + (b.okD || 0), r = (a.okR || 0) + (b.okR || 0);
  if (!(d + r)) return;
  const c = cfg(), was = c.synced && typeof c.synced === "object" ? c.synced : null;
  const s = { at: was ? was.at : Date.now(), dreams: (was ? +was.dreams || 0 : 0) + d, replies: (was ? +was.replies || 0 : 0) + r };
  saveCfg({ synced: s });
  if (c.noteShown) return;
  saveCfg({ noteShown: Date.now() });
  try { window.dispatchEvent(new CustomEvent(NOTE_EVT, { detail: s })); } catch (e) {}
}
async function syncAll() {
  const pk = keyState().pubkey;
  const a = await upload(null);
  // What Rem just took is on Rem: backfillNid doesn't need to look for it again.
  if (a.okKeys.length) { const ok = new Set(Array.isArray(cfg().remOk) ? cfg().remOk : []); a.okKeys.forEach(function (k) { ok.add(k); }); saveCfg({ remOk: Array.from(ok).slice(-5000) }); }
  let b = { okD: 0, okR: 0, missing: 0 };
  try { b = await backfillNid(pk); } catch (e) {}
  noteSync(a, b);
  return { a: a, b: b };
}
async function tick() {
  clearTimeout(tickT); tickT = setTimeout(tick, 45000);
  if (!navigator.onLine) return;
  try {
    if (!syncOn()) return;
    await syncAll();
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
  const st = keyState(), c = cfg();
  const done = function (t, focusId) { setEr(""); setMsg(t); say(t); focusSoon(focusId || "srv-msg"); };
  const fail = function (e) { const t = (e && e.message) || String(e); setMsg(""); setEr(t); say(t); focusSoon("srv-msg-err"); };
  const run = async function (fn) { setBusy(true); setEr(""); setMsg(""); try { await fn(); } catch (e) { fail(e); } finally { setBusy(false); } };
  const upText = function (r, more) {
    const sent = r.sent + more;
    const bits = [sent ? plural(sent, "Dream") + " put on Rem" : "Everything set to Everyone is already on Rem"];
    if (r.noParent) bits.push(plural(r.noParent, "reply", "replies") + " wait on this device until the Dreams they answer are on Rem");
    if (r.tooLong) bits.push(r.tooLong + " too long stay on this device");
    if (r.refused) bits.push(r.refused + " Rem didn't take" + (r.messages[0] ? " (" + r.messages[0] + ")" : ""));
    if (r.priv) bits.push(plural(r.priv, "Dream") + " set to Followers only, My Circles or Only this device stay on this device");
    if (r.old) bits.push(r.old + " from before you deleted your Rem data stay on this device");
    if (r.queued) bits.push(r.queued + " wait on this device and go when Rem is reachable");
    return bits.join(", ") + ".";
  };
  // Nov 9 2026 (Carter: "local mode should be discontinued immediately"): no Local mode, no choice to make. This says what
  // happens and has Sync now for when you don't want to wait.
  const intro = lh('p', { className: "lid-help" }, "Cooked Dreams always go on Rem, so they follow you to any device and other Dreamors can find them. Each one is signed with your LooscidID key, so nobody can fake yours. Uncooked Dreams (drafts) stay on this device.");
  let body;
  const pk = st.pubkey;
  if (st.mode === "none" || st.mode === "view") body = lh(React.Fragment, null,
    lh('p', { className: "lid-help" }, "This device doesn't have your LooscidID key yet, so your Dreams can't go on Rem yet. Make a key or add yours in Keys and IDs, or bring everything back from a backup file."),
    go && lh(Btn, { onClick: function () { go("keys"); } }, "Open Keys and IDs"),
    go && lh(Btn, { onClick: function () { go("backup"); } }, "Open Backup file"));
  else if (st.mode === "locked") body = lh(UnlockKey, { id: "srv", why: "Your key is locked with a passcode. Unlock it so your Dreams can go on Rem." });
  else {
    const n = remCounts(pk), kept = n.dreams + n.replies - n.pub;
    body = lh(React.Fragment, null,
      lh('p', { className: "lid-help", id: "srv-status", tabIndex: -1 }, "Syncing is on. " + (n.pub ? plural(n.pub, "Dream") + " on this device " + (n.pub === 1 ? "is" : "are") + " set to Everyone, so " + (n.pub === 1 ? "it goes" : "they go") + " on Rem by themselves, older ones too." : "When you Dream to Everyone, it goes on Rem by itself.")),
      kept > 0 ? lh('p', { className: "lid-help" }, plural(kept, "Dream") + " set to Followers only, My Circles or Only this device stay on this device. That's each Dream's own choice.") : null,
      lh(Btn, { disabled: busy, onClick: function () { run(async function () {
        nidDone = false;
        const r = await syncAll();
        done(upText(r.a, (r.b.okD || 0) + (r.b.okR || 0)), "srv-msg");
      }); } }, "Sync now"));
  }
  return lh('div', { className: "lid-panel" }, intro, body, lh(Note, { msg: msg, err: er, id: "srv-msg" }));
}

function LcBackupPanel({ go, inDl }) {
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
  const H = inDl ? 'h3' : 'h2';
  return lh('div', { className: "lid-panel" },
    inDl ? null : lh('p', { className: "lid-help" }, "One file with everything: your profile, Dreams, replies, chats, likes, follows, settings, and your LooscidID key. It opens in Looscid on any device."),
    lh('p', { className: "lid-warn", id: "bk-warn" }, "This file contains your key. Anyone who has the file and its passcode can Dream as you, so keep it private. It's locked with a passcode you choose, and nobody can recover a forgotten passcode."),
    lh(H, { className: "lid-label", id: "bk-save-h" }, "Save backup file"),
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
    lh(H, { className: "lid-label", id: "bk-restore-h" }, "Restore from backup file"),
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

/* --- The Rem line (Oct 31 2026, it was the Mode line). Nov 9 2026: Local mode is gone, so there's no mode to say anymore;
   the line on the Rem screen says if your Dreams are syncing and when they last did. */
function agoText(t) {
  const s = Math.round((Date.now() - t) / 1000); if (s < 45) return "just now";
  const m = Math.round(s / 60); if (m < 60) return plural(m, "minute") + " ago";
  const h = Math.round(m / 60); if (h < 24) return plural(h, "hour") + " ago";
  const d = Math.round(h / 24); if (d < 7) return plural(d, "day") + " ago";
  return "on " + new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function modeNow() {
  // Nov 9 2026: Local mode is gone. This only says if your Dreams can sync right now (they need your key, unlocked).
  const c = cfg(), st = keyState(), sync = syncOn();
  return { on: sync, sync: sync, why: sync ? "" : st.mode === "locked" ? "locked" : "nokey", handle: "", host: "Rem", last: +c.lastSync || 0 };
}
function modeText(m) {
  m = m || modeNow();
  if (m.sync) return "Your cooked Dreams sync to Rem. " + (m.last ? "Last synced " + agoText(m.last) + "." : "Not synced yet.");
  if (m.why === "locked") return "Your key is locked. Unlock it so your Dreams can sync to Rem.";
  return "Make a LooscidID key so your Dreams can go on Rem.";
}
function LcModeLine(props) {
  const [, tick] = useState(0);
  useEffect(function () { const f = function () { tick(function (n) { return n + 1; }); }; window.addEventListener("looscid-server", f); const iv = setInterval(f, 60000);
    return function () { window.removeEventListener("looscid-server", f); clearInterval(iv); }; }, []);
  const m = modeNow();
  return lh('p', { className: "lc-mode-line " + (m.sync ? "lc-mode-server" : "lc-mode-off"), style: Object.assign({ margin: "8px 16px", padding: "10px 12px", borderRadius: 12, borderLeft: "4px solid " + (m.sync ? "#10b981" : "#a78bfa"), background: "rgba(127,127,127,.12)", fontSize: 14, lineHeight: 1.45, fontWeight: 600 }, props && props.style) }, modeText(m));
}
/* --- "Your Dreams were synced to Rem" (Nov 9 2026, Carter: "people get a notification that their dreams were synced to
   ram. They get to learn more about RAM with a learn more about RAM button that's collapsed and they could revisit the RAM
   thing at a later date"). It replaces the old "You're using Looscid in Local mode" question.
   - Shown once, the first time older Dreams go up (noteSync). It's a card above the tab bar, not a dialog: focus never moves.
   - The words are in a polite live region (role status) that's on the page from the start, so screen readers read them
     when they arrive without cutting anything off.
   - Learn more about Rem is a real button with aria-expanded, collapsed at first. It opens LcAboutRem: what Rem is and
     what got synced, in plain words. The same words are on the Rem screen's About Rem section, linked from here, so you
     can come back to it anytime. Got it closes the card. */
function aboutRemBits(s) {
  const out = [];
  if (s && (s.dreams || s.replies)) {
    const what = [s.dreams ? plural(s.dreams, "Dream") : "", s.replies ? plural(s.replies, "reply", "replies") : ""].filter(Boolean).join(" and ");
    let when = ""; try { when = new Date(s.at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); } catch (e) {}
    out.push((when ? "On " + when + ", I" : "I") + " put " + what + " from this device on Rem. They're the older ones set to Everyone that weren't there yet. Each one kept its first date and is signed with your LooscidID key, so nobody can fake it.");
  }
  return out;
}
function LcAboutRem(props) {
  const s = props.synced || null, idp = props.idp || "rem-about";
  return lh('div', { className: "lc-about-rem" },
    lh('p', { className: "lid-help", id: idp + "-what" }, "Rem is Looscid's own server. It's where cooked Dreams live, so your Dreams show up on all your devices and other Dreamors can find them in the feed. It's open source, and you can download your Dreams from it anytime."),
    aboutRemBits(s).map(function (t, i) { return lh('p', { key: i, className: "lid-help" }, t); }),
    lh('p', { className: "lid-help" }, "What stays on this device: your Uncooked Dreams (drafts), and any Dream set to Followers only, My Circles or Only this device. Sharing is up to each Dream. Changing it on one never changes your other Dreams."),
    lh('p', { className: "lid-help" }, "Want a Dream off Rem? Delete it, and it's deleted on Rem too. You can also delete everything Rem has for you on the Rem screen."),
    props.children || null);
}
function LcRemSynced(props) {
  const [note, setNote] = useState(null), [msg, setMsg] = useState(""), [open, setOpen] = useState(false);
  useEffect(function () {
    let t = null, tries = 0;
    const f = function (e) { const s = e && e.detail; if (!s) return;
      // Another dialog is open (setup, a question): everything behind it is hidden from screen readers, so wait until it closes.
      if (document.querySelector('[role="dialog"],[role="alertdialog"],[aria-modal="true"]') && tries++ < 150) { t = setTimeout(function () { f(e); }, 2000); return; }
      setOpen(false); setNote(s);
      // A short wait after the card shows, so the live region's new words are read once, not skipped.
      t = setTimeout(function () { setMsg("Your Dreams were synced to Rem."); }, 300); };
    window.addEventListener(NOTE_EVT, f);
    return function () { window.removeEventListener(NOTE_EVT, f); clearTimeout(t); };
  }, []);
  const close = function () { setNote(null); setMsg(""); setOpen(false); };
  const big = { minHeight: 44, minWidth: 44 };
  const toRem = lh('a', { className: "lc-link", id: "lc-remnote-about", href: Looscid.lcPathFor ? Looscid.lcPathFor("settings_rem") : "#", style: { display: "inline-flex", alignItems: "center", minHeight: 44 },
    onClick: function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; e.preventDefault(); close(); if (props.navigate) props.navigate("settings_rem");
      setTimeout(function () { const h = document.getElementById("rem-h-about"); if (h) h.focus(); }, 500); } }, "About Rem, anytime");
  return lh('div', { id: "lc-remnote", className: note ? "lc-remnote" : undefined, style: note ? { position: "fixed", left: 12, right: 12, bottom: "calc(80px + env(safe-area-inset-bottom, 0px))", zIndex: 60, maxWidth: 560, margin: "0 auto", maxHeight: "60vh", overflowY: "auto", padding: "12px 14px", borderRadius: 14, background: "var(--sf, var(--bg, #1c1c1e))", color: "var(--tx, #fff)", border: "2px solid #34c759", boxShadow: "0 6px 24px rgba(0,0,0,.35)" } : undefined },
    // On the page from the start, empty, so its words are read when they arrive (role status is a polite live region).
    lh('p', { role: "status", id: "lc-remnote-msg", className: note ? undefined : "sr-only", style: note ? { margin: "0 0 6px", fontWeight: 700, fontSize: 16 } : undefined }, msg),
    note ? lh(React.Fragment, null,
      lh('button', { type: "button", id: "lc-remnote-more-btn", className: "btn bgb", style: big, "aria-expanded": open ? "true" : "false", "aria-controls": "lc-remnote-more", onClick: function () { setOpen(!open); } }, "Learn more about Rem"),
      lh('div', { id: "lc-remnote-more", hidden: !open, style: { marginTop: 8 } }, open ? lh(LcAboutRem, { synced: note, idp: "lc-remnote" }, lh('p', { className: "lid-help", style: { margin: 0 } }, toRem)) : null),
      lh('div', { style: { marginTop: 8 } }, lh('button', { type: "button", id: "lc-remnote-ok", className: "btn bp", style: big, onClick: close }, "Got it"))) : null);
}
Looscid.lcServer = { cfg: cfg, remCounts: remCounts, upload: upload, tick: tick, syncAll: syncAll, markForgot: markForgot, makeBackup: makeBackup, openBackup: openBackup, restoreBackup: restoreBackup, mode: modeNow };
Looscid.LcServerPanel = LcServerPanel;
Looscid.LcModeLine = LcModeLine;
Looscid.LcRemSynced = LcRemSynced;
Looscid.LcAboutRem = LcAboutRem;
Looscid.lcRemSynced = function () { const s = cfg().synced; return s && typeof s === "object" ? s : null; };
Looscid.lcModeText = modeText;
Looscid.LcBackupPanel = LcBackupPanel;
})(window.Looscid = window.Looscid || {});
