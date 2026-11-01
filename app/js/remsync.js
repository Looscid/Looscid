/* Looscid, js/remsync.js: the Looscid server and the backup file (Oct 31 2026, Carter: "where would I find these options?"
   and "make a file that holds all this information, with the key"). Plain script, loaded after more.js.

   1. Settings, LooscidID, Looscid server: sign in to the Looscid server (Rem, https://looscidserver.sites.tab.bot) with the
      same key as your LooscidID, or join with an invite code. Then a one-time choice, "Put your Dreams on the server?":
      All my Dreams, Let me pick, or Not now. Nothing uploads without that tap. Your Dreams and replies are signed here
      with your key and sent to the server's import (original dates kept, never sent twice). After that, new Dreams sync
      on their own, and signing in on another device brings back everything filed under your LooscidID.
   2. Settings, LooscidID, Backup file: one .looscid file with your profile, Dreams, replies, chats, likes, follows,
      settings AND your key, locked with a passcode you choose (PBKDF2 + AES-GCM, js/rem/looscid-backup.js). The same
      file opens on the Looscid server's website. Restoring brings it all back and locks it to the key in the file.

   Stored on this device (localStorage looscid_server, removed by Delete local data): the server address, your handle
   there, a sign-in token for that server (never put in a backup file), your choice, and which Dreams are on the server.
   The crypto files (js/rem/) load only when this is used. No CDN. */
(function (Looscid) {
"use strict";
const lh = React.createElement, useState = React.useState, useEffect = React.useEffect;
const SRV_KEY = "looscid_server";
const DEFAULT_HOME = "https://looscidserver.sites.tab.bot";
const RESTORED_KEY = "looscid_restored_note";
// Kept out of a backup file's app copy: the key goes in its own field, and sign-in tokens never go in a file.
const NO_BACKUP = ["looscid_nostr_sk", "looscid_nostr_ncryptsec", "looscid_sessions", "looscid_oauth_pending", "looscid_identity", RESTORED_KEY];
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
    .catch(function (e) { modsP = null; const er = new Error("Couldn't load the Looscid server tools. Check your connection, reload Looscid, and try again."); er.code = "load"; throw er; });
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
  if (st.mode === "signer") throw err("signer", "Your key is in a signer extension, which can't sign for the Looscid server yet. Add your key to this device in Keys and IDs to use the server.");
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

/* --- the server ---------------------------------------------------------------------- */
async function connect() {
  const m = await mods(), sk = await needSk(), c = cfg();
  const cl = new m.RemClient({ home: c.home || DEFAULT_HOME, sk: sk, token: c.token || null });
  if (c.pubkey && c.pubkey !== cl.pubkey) { saveCfg({ token: null, pubkey: null, handle: null, map: {}, sig: {}, cursor: 0, optin: null, optinAt: null, del: [] }); cl.token = null; }
  return { m: m, sk: sk, cl: cl };
}
async function authed() {
  const x = await connect();
  if (!x.cl.token) { const r = await x.cl.login(); saveCfg({ token: r.token, pubkey: x.cl.pubkey, handle: r.me.handle }); }
  return x;
}
async function call(x, fn) {
  try { return await fn(); }
  catch (e) { if (e.code !== "sign_in") throw e; const r = await x.cl.login(); x.cl.token = r.token; saveCfg({ token: r.token, handle: r.me.handle }); return await fn(); }
}
async function signIn(home) {
  if (home) { const h = String(home).trim().replace(/\/+$/, ""); if (!/^(https:\/\/[^\s/]+|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/i.test(h)) throw err("bad_home", "The server address must start with https:// and have no path, like " + DEFAULT_HOME + "."); if (h !== (cfg().home || DEFAULT_HOME)) saveCfg({ home: h, token: null, cursor: 0, map: {}, sig: {}, optin: null }); }
  const x = await connect();
  const r = await x.cl.login();
  saveCfg({ home: cfg().home || DEFAULT_HOME, token: r.token, pubkey: x.cl.pubkey, handle: r.me.handle });
  const got = await pull().catch(function () { return { added: 0 }; });
  return { handle: r.me.handle, got: got };
}
async function join(invite, handle, name) {
  const x = await connect();
  const r = await x.cl.join({ invite: String(invite || "").trim(), handle: String(handle || "").trim(), name: String(name || "").trim() || undefined });
  saveCfg({ home: cfg().home || DEFAULT_HOME, token: r.token, pubkey: x.cl.pubkey, handle: r.me.handle });
  const got = await pull().catch(function () { return { added: 0 }; });
  return { handle: r.me.handle, got: got };
}
async function signOut() {
  const c = cfg();
  try { if (c.token) await fetch((c.home || DEFAULT_HOME) + "/rem/v0/auth/logout", { method: "POST", headers: { Authorization: "Bearer " + c.token } }); } catch (e) {}
  saveCfg({ token: null });
}
let busyUp = false;
/* Put Dreams on the server: onlyKeys = the Dreams you picked, or null for every Dream not there yet.
   Dreams from the last few minutes go out as new (friends see them in their Dreamline); older ones go through the
   server's import, which keeps their original date and skips anything already there. */
async function upload(onlyKeys, onProgress) {
  if (busyUp) throw err("busy", "Already sending your Dreams. Try again in a moment.");
  busyUp = true;
  try {
    const x = await authed(), pk = x.cl.pubkey;
    const plan = await planLocal(x.m, pk, onlyKeys);
    const c = cfg(), map = Object.assign({}, c.map || {}), sig = Object.assign({}, c.sig || {});
    const todo = plan.items.filter(function (it) { return !map[it.k]; });
    const res = { sent: 0, already: 0, refused: 0, messages: [], noParent: plan.noParent, tooLong: plan.tooLong, edits: 0 };
    // Dreams that were edited on this device after they went to the server: an edit, signed now.
    for (const it of plan.items) {
      if (!map[it.k]) continue;
      const now = await x.m.rem.objectId({ by: pk, at: it.at, type: "dream", body: it.body });
      if (sig[it.k] && sig[it.k] !== now) { try { await call(x, function () { return x.cl.send("edit", { of: map[it.k], text: it.body.text, cw: it.body.cw }); }); res.edits++; } catch (e) {} }
      sig[it.k] = now;
    }
    const fresh = todo.filter(function (it) { return it.at > Date.now() - 8 * 60000; }), old = todo.filter(function (it) { return it.at <= Date.now() - 8 * 60000; });
    const done = function (it, id) { map[it.k] = id; sig[it.k] = id; };
    for (let i = 0; i < old.length; i += 100) {
      const chunk = old.slice(i, i + 100), objs = [];
      for (const it of chunk) objs.push(await x.m.rem.signObject("dream", it.body, x.sk, it.at));
      const r = await call(x, function () { return x.cl.req("POST", "/import", { objects: objs }); });
      const byId = {}; chunk.forEach(function (it, j) { byId[objs[j].id] = it; });
      (r.imported || []).forEach(function (id) { if (byId[id]) { done(byId[id], id); res.sent++; } });
      (r.skipped || []).forEach(function (s) { const id = s.id || s; if (byId[id]) { done(byId[id], id); res.already++; } });
      (r.refused || []).concat(r.needs_alt || []).forEach(function (f) { res.refused++; if (f.message && res.messages.indexOf(f.message) < 0) res.messages.push(f.message); });
      saveCfg({ map: map, sig: sig });
      if (onProgress) onProgress(Math.min(i + chunk.length, todo.length), todo.length);
    }
    for (const it of fresh) {
      // signed with the Dream's own time (within the server's 10 minutes), so the same Dream always has the same id
      try { const o = await x.m.rem.signObject("dream", it.body, x.sk, it.at); const r = await call(x, function () { return x.cl.req("POST", "/objects", o); }); done(it, r.id); if (r.duplicate) res.already++; else res.sent++; }
      catch (e) { if (e.code === "offline") throw e; res.refused++; if (e.message && res.messages.indexOf(e.message) < 0) res.messages.push(e.message); }
    }
    // Dreams deleted on this device after they went to the server: deleted there too.
    const del = (cfg().del || []).slice(), keep = [];
    const tomb = lsJson("looscid_dreams", []).filter(function (d) { return d && d.deleted && map["d:" + d.id]; }).map(function (d) { return "d:" + d.id; });
    for (const k of del.concat(tomb)) {
      if (!map[k]) continue;
      try { await call(x, function () { return x.cl.send("delete", { of: map[k] }); }); delete map[k]; delete sig[k]; }
      catch (e) { if (e.code === "offline") keep.push(k); else { delete map[k]; delete sig[k]; } }
    }
    saveCfg({ map: map, sig: sig, del: keep, lastSync: Date.now() });
    return res;
  } finally { busyUp = false; }
}
/* Bring back everything filed under your LooscidID on the server (a new device, or Dreams you made somewhere else).
   Every object is checked against your key before it's kept. */
async function pull() {
  const x = await authed(), pk = x.cl.pubkey, rem = x.m.rem;
  let c = cfg(), cur = Number(c.cursor) || 0, r; const objs = [];
  do { r = await call(x, function () { return x.cl.get("/sync", { since: cur, limit: 500 }); }); for (const o of r.objects || []) objs.push(o); cur = r.cursor; } while (r.more && objs.length < 20000);
  const map = Object.assign({}, cfg().map || {}), sig = Object.assign({}, cfg().sig || {});
  const rev = {}; Object.keys(map).forEach(function (k) { rev[map[k]] = k; });
  const dreams = lsJson("looscid_dreams", []), replies = lsJson("looscid_replies", []);
  const D = Array.isArray(dreams) ? dreams : [], R = Array.isArray(replies) ? replies : [];
  const addD = [], addR = []; let edited = 0, removed = 0;
  const findLocal = function (k) { const id = k.slice(2); const list = k[0] === "d" ? D : R; return list.find(function (x2) { return String(x2.id) === id; }); };
  for (const o of objs) {
    if (!o || o.by !== pk) continue;
    let ok = false; try { ok = await rem.verifyObject(o); } catch (e) {}
    if (!ok) continue;
    const b = o.body || {};
    if (o.type === "dream") {
      if (rev[o.id] || typeof b.text !== "string" || b.post_at) continue;
      const rec = { id: o.id, text: b.text, created: o.at, likes: 0 };
      if (b.cw) rec.cw = b.cw; if (b.audience === "followers") rec.aud = "followers";
      if (b.reply_to) {
        const pkey = rev[b.reply_to]; let replyTo = b.reply_to, rtr;
        if (pkey && pkey[0] === "r") { const pr = findLocal(pkey) || addR.find(function (x2) { return "r:" + x2.id === pkey; }); if (pr) { replyTo = pr.replyTo; rtr = pr.id; } }
        else if (pkey) { replyTo = findLocal(pkey) ? findLocal(pkey).id : pkey.slice(2); }
        rec.replyTo = replyTo; if (rtr != null) rec.replyToReply = rtr;
        addR.push(rec); map["r:" + o.id] = o.id; rev[o.id] = "r:" + o.id;
        sig["r:" + o.id] = await rem.objectId({ by: pk, at: o.at, type: "dream", body: remBody(rec, b.reply_to) });
      } else { rec.redreams = 0; rec.quotes = 0; addD.push(rec); map["d:" + o.id] = o.id; rev[o.id] = "d:" + o.id; sig["d:" + o.id] = await rem.objectId({ by: pk, at: o.at, type: "dream", body: remBody(rec) }); }
    } else if (o.type === "edit" && rev[b.of] && typeof b.text === "string") {
      const k = rev[b.of], loc = findLocal(k) || addD.concat(addR).find(function (x2) { return x2.id === b.of; });
      if (loc && loc.text !== b.text) { loc.text = b.text; if (b.cw) loc.cw = b.cw; else delete loc.cw; edited++;
        try { sig[k] = await rem.objectId({ by: pk, at: atOf(loc), type: "dream", body: remBody(loc, k[0] === "r" ? ((loc.replyToReply != null && map["r:" + loc.replyToReply]) || map["d:" + loc.replyTo] || (isHex64(loc.replyTo) ? loc.replyTo : null)) : null) }); } catch (e) {} }
    } else if (o.type === "delete" && rev[b.of]) {
      const k = rev[b.of], id = k.slice(2), list = k[0] === "d" ? D : R, i = list.findIndex(function (x2) { return String(x2.id) === id; });
      if (i >= 0) { list.splice(i, 1); removed++; }
      [addD, addR].forEach(function (a) { const j = a.findIndex(function (x2) { return String(x2.id) === id; }); if (j >= 0) a.splice(j, 1); });
      delete map[k]; delete sig[k]; delete rev[b.of];
    }
  }
  const byNew = function (a, b) { return (+b.created || 0) - (+a.created || 0); };
  if (addD.length || edited || removed) lsSetJ("looscid_dreams", D.concat(addD).sort(byNew).slice(0, 1000));
  if (addR.length || edited || removed) lsSetJ("looscid_replies", R.concat(addR).sort(byNew).slice(0, 2000));
  saveCfg({ map: map, sig: sig, cursor: cur, lastPull: Date.now() });
  if (addD.length) try { window.dispatchEvent(new CustomEvent("looscid-dreams-fetched", { detail: { ids: addD.map(function (d) { return d.id; }) } })); } catch (e) {}
  if (addR.length || edited || removed) try { window.dispatchEvent(new Event("looscid-replies")); } catch (e) {}
  return { added: addD.length, replies: addR.length, edited: edited, removed: removed };
}

/* --- keeping it in sync --------------------------------------------------------------- */
// A Dream you delete here is deleted on the server too (the next time Looscid syncs).
window.addEventListener("looscid-dream-deleted", function (e) {
  const id = e && e.detail && e.detail.id; if (id == null) return; const c = cfg(), k = "d:" + id;
  if (c.map && c.map[k]) { const del = (c.del || []).filter(function (x2) { return x2 !== k; }); del.push(k); saveCfg({ del: del }); setTimeout(tick, 1500); }
});
let tickT = null;
function syncOn() { const c = cfg(), st = keyState(); return !!(c.token && c.pubkey && st.mode === "key" && st.pubkey === c.pubkey && (c.optin === "all" || c.optin === "pick")); }
async function tick() {
  clearTimeout(tickT); tickT = setTimeout(tick, 45000);
  if (!syncOn() || !navigator.onLine) return;
  const c = cfg();
  try {
    if (c.optin === "all") await upload(null);
    else { const pk = c.pubkey, after = c.optinAt || 0, keys = new Set(); localDreams(pk).forEach(function (d) { if (atOf(d) > after) keys.add("d:" + d.id); }); localReplies(pk).forEach(function (r) { if (atOf(r) > after) keys.add("r:" + r.id); }); if (keys.size || (c.del || []).length) await upload(keys); }
    if (!c.lastPull || Date.now() - c.lastPull > 5 * 60000) await pull();
  } catch (e) { /* quiet: the Looscid server page shows the state, and the next tick tries again */ if (e && e.code === "busy") { clearTimeout(tickT); tickT = setTimeout(tick, 3000); } }
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
    lh('input', { id: id + "-kp", className: "inp", type: "password", autoComplete: "current-password", autoCapitalize: "off", spellCheck: false, value: p, "aria-describedby": id + "-why", onChange: function (ev) { setP(ev.target.value); } }),
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
  const [joinOpen, setJoinOpen] = useState(false), [inv, setInv] = useState(""), [handle, setHandle] = useState(""), [name, setName] = useState(""), [age, setAge] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false), [home, setHome] = useState(cfg().home || DEFAULT_HOME);
  const [pick, setPick] = useState(null);
  const st = keyState(), c = cfg();
  const connected = !!(c.token && c.pubkey && st.pubkey && c.pubkey === st.pubkey);
  const done = function (t, focusId) { setEr(""); setMsg(t); say(t); focusSoon(focusId || "srv-msg"); };
  const fail = function (e) { const t = (e && e.message) || String(e); setMsg(""); setEr(t); say(t); focusSoon("srv-msg-err"); };
  const run = async function (fn) { setBusy(true); setEr(""); setMsg(""); try { await fn(); } catch (e) { fail(e); } finally { setBusy(false); } };
  const gotText = function (g) { const n = (g && g.added || 0) + (g && g.replies || 0); return n ? " Got " + plural(n, "Dream") + " back from the server." : ""; };
  const upText = function (r) {
    const bits = [r.sent || !r.already ? plural(r.sent, "Dream") + " put on the server" : "Your Dreams were already on the server"];
    if (r.already && r.sent) bits.push(r.already + " already there");
    if (!r.sent && !r.already && !r.noParent && !r.tooLong && !r.refused) return "All your Dreams are already on the server.";
    if (r.noParent) bits.push(plural(r.noParent, "reply", "replies") + " stay on this device because they answer Dreams that aren't on the server");
    if (r.tooLong) bits.push(r.tooLong + " too long for the server (1000 characters) stay on this device");
    if (r.refused) bits.push(r.refused + " the server didn't take" + (r.messages[0] ? " (" + r.messages[0] + ")" : ""));
    return bits.join(", ") + ".";
  };
  const progress = function (n, of) { setMsg("Uploading " + n + " of " + of + "…"); };
  const intro = lh('p', { className: "lid-help" }, "Put your Dreams on the Looscid server, so they follow you to any device and friends can find you. You sign in with the same key as your LooscidID, and every Dream is signed with it, so nobody can fake yours. Nothing uploads until you choose.");
  let body;
  if (st.mode === "none" || st.mode === "view") body = lh(React.Fragment, null,
    lh('p', { className: "lid-help" }, "This device doesn't have your LooscidID key yet. Make a key or add yours in Keys and IDs, or bring everything back from a backup file."),
    go && lh(Btn, { onClick: function () { go("keys"); } }, "Open Keys and IDs"),
    go && lh(Btn, { onClick: function () { go("backup"); } }, "Open Backup file"));
  else if (st.mode === "signer") body = lh('p', { className: "lid-help" }, "Your key is in a signer extension, which can't sign for the Looscid server yet. To use the server, add your key to this device in Keys and IDs.");
  else if (st.mode === "locked") body = lh(UnlockKey, { id: "srv", why: "Your key is locked with a passcode. Unlock it to sign in to the Looscid server." });
  else if (!connected) body = lh(React.Fragment, null,
    lh('p', { className: "lid-help", id: "srv-where" }, "Not signed in. Server: " + hostOf(home) + "."),
    lh(Btn, { id: "srv-signin", disabled: busy, "aria-describedby": "srv-where", onClick: function () { run(async function () {
      try { const r = await signIn(home); setJoinOpen(false); done("Signed in as @" + r.handle + "." + gotText(r.got), "srv-msg"); }
      catch (e) { if (e.code === "not_member") { setJoinOpen(true); setEr(""); setMsg("Your key isn't on this server yet. Join with an invite code below."); say("Your key isn't on this server yet. Join with an invite code."); focusSoon("srv-join-h"); } else throw e; }
    }); } }, "Sign in to the Looscid server"),
    !joinOpen && lh(Btn, { disabled: busy, onClick: function () { setJoinOpen(true); focusSoon("srv-join-h"); } }, "Join with an invite code"),
    joinOpen && lh('section', { "aria-labelledby": "srv-join-h" },
      lh('h3', { className: "lid-label", id: "srv-join-h", tabIndex: -1 }, "Join with an invite code"),
      lh('p', { className: "lid-help" }, "The server is invite-only and for people 13 and older. It never asks for your email, phone number or location. Your key stays on this device."),
      lh('label', { htmlFor: "srv-inv", className: "lid-label" }, "Invite code"),
      lh('input', { id: "srv-inv", className: "inp", type: "text", autoComplete: "off", autoCapitalize: "characters", spellCheck: false, value: inv, onChange: function (e) { setInv(e.target.value); } }),
      lh('label', { htmlFor: "srv-handle", className: "lid-label" }, "Handle"),
      lh('input', { id: "srv-handle", className: "inp", type: "text", autoComplete: "username", autoCapitalize: "none", spellCheck: false, value: handle, "aria-describedby": "srv-handle-d", onChange: function (e) { setHandle(e.target.value); } }),
      lh('p', { className: "lid-help", id: "srv-handle-d" }, "2 to 20 letters, numbers or underscores. People find you by it."),
      lh('label', { htmlFor: "srv-name", className: "lid-label" }, "Display name (optional)"),
      lh('input', { id: "srv-name", className: "inp", type: "text", maxLength: 50, value: name, onChange: function (e) { setName(e.target.value); } }),
      lh('label', { className: "lc-radio" + (age ? " on" : "") }, lh('input', { type: "checkbox", id: "srv-age", checked: age, onChange: function () { setAge(!age); } }), lh('span', null, "I'm 13 or older")),
      lh(Btn, { disabled: busy, onClick: function () {
        if (!age) { fail(new Error("Check the box to confirm you're 13 or older.")); return; }
        run(async function () { const r = await join(inv, handle, name); setJoinOpen(false); done("Joined as @" + r.handle + "." + gotText(r.got), "srv-msg"); });
      } }, "Join the Looscid server")),
    lh(Btn, { "aria-expanded": homeOpen ? "true" : "false", "aria-controls": "srv-home-box", onClick: function () { setHomeOpen(!homeOpen); } }, "Change server address"),
    homeOpen && lh('div', { id: "srv-home-box" },
      lh('label', { htmlFor: "srv-home", className: "lid-label" }, "Server address"),
      lh('input', { id: "srv-home", className: "inp", type: "url", autoComplete: "url", autoCapitalize: "none", spellCheck: false, value: home, onChange: function (e) { setHome(e.target.value); } })));
  else if (pick) {
    const pk = c.pubkey, map = c.map || {};
    const rows = localDreams(pk).map(function (d) { return { k: "d:" + d.id, t: d.text, at: atOf(d), reply: false }; })
      .concat(localReplies(pk).map(function (r) { return { k: "r:" + r.id, t: r.text, at: atOf(r), reply: true }; }))
      .filter(function (x2) { return !map[x2.k]; }).sort(function (a, b) { return b.at - a.at; });
    const when = function (t) { try { return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); } catch (e) { return ""; } };
    body = lh('fieldset', { className: "lid-panel", style: { border: 0, padding: 0, margin: 0 } },
      lh('legend', { className: "lid-label", id: "srv-pick-h", tabIndex: -1 }, "Choose Dreams to put on the server"),
      rows.length ? null : lh('p', { className: "lid-help" }, "Every Dream on this device is already on the server."),
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
        done(upText(r) + " New Dreams you post will sync too.", "srv-msg");
      }); } }, "Put " + plural(pick.size, "chosen Dream") + " on the server"),
      lh(Btn, { onClick: function () { setPick(null); focusSoon("srv-status"); } }, "Cancel"));
  } else {
    const n = counts(c.pubkey);
    const statusText = c.optin === "all" ? "Syncing is on: all your Dreams, and new ones as you post them."
      : c.optin === "pick" ? "Syncing is on for the Dreams you picked, and new ones as you post them."
      : c.optin === "none" ? "Your Dreams stay on this device. Nothing uploads." : null;
    body = lh(React.Fragment, null,
      lh('p', { className: "lid-help", id: "srv-status", tabIndex: -1 }, "Signed in as @" + c.handle + " on " + hostOf(c.home || DEFAULT_HOME) + ". " + (n.on ? plural(n.on, "Dream") + " of " + (n.dreams + n.replies) + " on this device " + (n.on === 1 ? "is" : "are") + " on the server." : "")),
      c.optin == null ? lh('section', { "aria-labelledby": "srv-optin-h" },
        lh('h3', { className: "lid-label", id: "srv-optin-h", tabIndex: -1 }, "Put your Dreams on the server?"),
        lh('p', { className: "lid-help" }, "You have " + plural(n.dreams, "Dream") + " and " + plural(n.replies, "reply", "replies") + " on this device" + (n.on ? ", and " + (n.on === n.dreams + n.replies ? "all of them are" : n.on + " are") + " already on the server" : "") + ". They're signed with your key and keep their original dates. Nothing uploads unless you choose, and new Dreams you post sync only after you choose All my Dreams or Let me pick."),
        lh(Btn, { disabled: busy, onClick: function () { run(async function () { saveCfg({ optin: "all", optinAt: Date.now() }); const r = await upload(null, progress); done(upText(r) + " New Dreams you post will sync too.", "srv-msg"); }); } }, "All my Dreams"),
        lh(Btn, { disabled: busy, onClick: function () { setPick(new Set()); focusSoon("srv-pick-h"); } }, "Let me pick"),
        lh(Btn, { disabled: busy, onClick: function () { saveCfg({ optin: "none" }); done("OK. Your Dreams stay on this device. You can change this here any time.", "srv-status"); } }, "Not now"))
      : lh('p', { className: "lid-help" }, statusText),
      c.optin != null && lh(Btn, { disabled: busy, onClick: function () { run(async function () {
        let r = null; if (c.optin === "all") r = await upload(null, progress); else if (c.optin === "pick") { const keys = new Set(); localDreams(c.pubkey).forEach(function (d) { if (atOf(d) > (c.optinAt || 0)) keys.add("d:" + d.id); }); localReplies(c.pubkey).forEach(function (x2) { if (atOf(x2) > (c.optinAt || 0)) keys.add("r:" + x2.id); }); r = await upload(keys, progress); }
        const g = await pull(); done("Synced." + (r && (r.sent || r.edits) ? " " + plural(r.sent, "Dream") + " sent." : "") + gotText(g), "srv-msg");
      }); } }, "Sync now"),
      c.optin === "none" && lh(Btn, { disabled: busy, onClick: function () { saveCfg({ optin: null }); focusSoon("srv-optin-h"); } }, "Put my Dreams on the server"),
      (c.optin === "all" || c.optin === "pick") && lh(Btn, { disabled: busy, onClick: function () { setPick(new Set()); focusSoon("srv-pick-h"); } }, "Choose more Dreams"),
      (c.optin === "all" || c.optin === "pick") && lh(Btn, { disabled: busy, onClick: function () { saveCfg({ optin: "none" }); done("Syncing is off. Dreams already on the server stay there; new ones stay on this device.", "srv-status"); } }, "Stop syncing"),
      lh(Btn, { disabled: busy, onClick: function () { run(async function () { await signOut(); done("Signed out of the Looscid server on this device. Your Dreams stay here.", "srv-signin"); }); } }, "Sign out of the server"));
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
    lh('p', { className: "lid-help" }, "One file with everything: your profile, Dreams, replies, chats, likes, follows, settings, and your LooscidID key. It opens in Looscid or on the Looscid server's website, on any device."),
    lh('p', { className: "lid-warn", id: "bk-warn" }, "This file contains your key. Anyone who has the file and its passcode can Dream as you, so keep it private. It's locked with a passcode you choose, and nobody can recover a forgotten passcode."),
    lh('h3', { className: "lid-label", id: "bk-save-h" }, "Save backup file"),
    st.mode === "locked" && withKey ? lh(UnlockKey, { id: "bk", why: "Your key is locked with a passcode. Unlock it so it can go in the file." }) : null,
    noKeyHere ? lh('p', { className: "lid-help" }, st.mode === "signer" ? "Your key is in a signer extension, so it can't go in the file. Everything else can." : "This device doesn't have a key yet, so the file won't have one.") :
      lh('label', { className: "lc-radio" + (withKey ? " on" : "") }, lh('input', { type: "checkbox", id: "bk-withkey", checked: withKey, "aria-describedby": "bk-withkey-d", onChange: function () { setWithKey(!withKey); } }), lh('span', null, "Put my key in the file (recommended)")),
    noKeyHere ? null : lh('p', { className: "lid-help", id: "bk-withkey-d" }, withKey ? "With your key, the file brings back everything on a new device by itself." : "Without your key, you'll need your key (or recovery phrase) too when you restore."),
    lh('label', { htmlFor: "bk-pass", className: "lid-label" }, "Passcode for the file"),
    lh('input', { id: "bk-pass", className: "inp", type: "password", autoComplete: "new-password", autoCapitalize: "off", spellCheck: false, value: p1, "aria-describedby": "bk-pass-d", onChange: function (e) { setP1(e.target.value); } }),
    lh('p', { className: "lid-help", id: "bk-pass-d" }, "At least 8 characters. Four short words work well, like: blue lamp river jump. Nobody can recover it if you forget it."),
    lh('label', { htmlFor: "bk-pass2", className: "lid-label" }, "Type the passcode again"),
    lh('input', { id: "bk-pass2", className: "inp", type: "password", autoComplete: "new-password", autoCapitalize: "off", spellCheck: false, value: p2, onChange: function (e) { setP2(e.target.value); } }),
    lh(Btn, { id: "bk-save", disabled: busy, "aria-describedby": "bk-warn", onClick: async function () {
      const m = await mods().catch(function (e) { fail(e); return null; }); if (!m) return;
      const bad = m.backup.passcodeProblem(p1); if (bad) { fail(new Error(bad), "bk-pass"); return; }
      if (p1 !== p2) { fail(new Error("The two passcodes don't match. Type them again."), "bk-pass2"); return; }
      setBusy(true); setEr(""); setMsg("Making your backup file. This takes a few seconds."); say("Making your backup file");
      try { const r = await makeBackup(p1, withKey && !noKeyHere); setP1(""); setP2(""); done("Backup file saved as " + r.name + ", with " + plural(r.dreams, "Dream") + (r.withKey ? " and your key" : ", without your key") + ". Keep it private."); }
      catch (e) { fail(e); } finally { setBusy(false); }
    } }, "Save backup file"),
    lh('h3', { className: "lid-label", id: "bk-restore-h" }, "Restore from backup file"),
    lh('p', { className: "lid-help", id: "bk-file-d" }, "Bring everything back from a .looscid file, made here or on the Looscid server's website. Your key from the file is saved on this device, locked with the file's passcode."),
    lh('label', { htmlFor: "bk-file", className: "lid-label" }, "Backup file"),
    lh('input', { id: "bk-file", ref: fileRef, className: "inp", type: "file", "aria-describedby": "bk-file-d", onChange: function (e) { setFileName(e.target.files && e.target.files[0] ? e.target.files[0].name : ""); } }),
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
  const c = cfg(), on = !!(c.token && c.handle);
  return { on: on, sync: on && (c.optin === "all" || c.optin === "pick"), handle: c.handle || "", host: hostOf(c.home || DEFAULT_HOME), last: Math.max(+c.lastSync || 0, +c.lastPull || 0) };
}
function modeText(m) {
  m = m || modeNow();
  if (m.sync) return "Mode: Looscid server. Synced to " + m.host + " as @" + m.handle + ". " + (m.last ? "Last synced " + agoText(m.last) + "." : "Not synced yet.");
  if (m.on) return "Mode: Local only. Your Dreams live on this device. You're signed in to " + m.host + " as @" + m.handle + ", but syncing is off.";
  return "Mode: Local only. Your Dreams live on this device.";
}
let lastModeKey = modeNow().sync ? "server" : "local", modeSayT = null;
window.addEventListener("looscid-server", function () {
  const k = modeNow().sync ? "server" : "local"; if (k === lastModeKey) return; lastModeKey = k;
  clearTimeout(modeSayT); modeSayT = setTimeout(function () { say(k === "server" ? "Mode is now Looscid server." : "Mode is now Local only."); }, 1800);
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
    if (v === "server") { if (props.navigate) props.navigate("settings_account", { tab: "server" }); }
    else say("Staying in Local mode. The Looscid server is in Settings, LooscidID, whenever you want it.");
  };
  const onKey = function (e) {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); pick("local"); return; }
    if (Looscid.lcTrapTab) Looscid.lcTrapTab(e, boxRef.current);
  };
  return lh(AskOverlay, null,
    lh('div', { className: "lc-q", role: "dialog", "aria-modal": "true", "aria-labelledby": "lc-srv-ask-t", ref: boxRef, onKeyDown: onKey },
      lh('h2', { id: "lc-srv-ask-t", tabIndex: -1, ref: hRef, className: "lc-q-h lc-q-t" }, "You're using Looscid in Local mode"),
      lh('div', { className: "lc-q-intro" },
        lh('p', null, "Want to switch to the Looscid server? It keeps your Dreams synced on all your devices with your LooscidID."),
        lh('p', null, "Nothing goes on the server until you sign in and choose which Dreams to put there. You can switch any time in Settings, LooscidID, Looscid server.")),
      lh('div', { className: "lc-q-btns" },
        lh('button', { type: "button", className: "btn bp lc-big", onClick: function () { pick("server"); } }, "Switch to server"),
        lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { pick("local"); } }, "Stay local"))));
}
// The overlay makes everything behind the question unreachable while it's open (same as the first-run question).
function AskOverlay(props) {
  const ref = React.useRef(null);
  if (Looscid.useInertBehind) Looscid.useInertBehind(ref);
  return lh('div', { className: "lc-q-ov", ref: ref }, props.children);
}
Looscid.lcServer = { cfg: cfg, signIn: signIn, join: join, signOut: signOut, upload: upload, pull: pull, tick: tick, makeBackup: makeBackup, openBackup: openBackup, restoreBackup: restoreBackup, mode: modeNow, DEFAULT_HOME: DEFAULT_HOME };
Looscid.LcServerPanel = LcServerPanel;
Looscid.LcModeLine = LcModeLine;
Looscid.LcServerAsk = LcServerAsk;
Looscid.lcModeText = modeText;
Looscid.LcBackupPanel = LcBackupPanel;
})(window.Looscid = window.Looscid || {});
