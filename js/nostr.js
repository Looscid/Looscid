/* Looscid, js/nostr.js: Dreams on Nostr (Round 6.4). Plain JavaScript, no build step.
   There is no Looscid server. Your Dreams go straight from this device to Nostr relays you choose,
   signed here (or by your signer), and come back from those relays on any device that has your key.

   What is stored on this device (localStorage), and never in Settings backup:
   - dbm_nostr_sk          your secret key as hex, only when you chose no passcode
   - dbm_nostr_ncryptsec   your secret key locked with your passcode (NIP-49), instead of the one above
   - dbm_nostr_relays      your relay list, when you changed it
   - dbm_nostr_queue       Dreams waiting to reach relays (signed notes, or Dreams waiting for your passcode)
   - dbm_nostr_hidden      ids of Nostr notes you removed here, so they don't come back on the next fetch
   Round 6.5: replies to a Dream that's on Nostr go out as NIP-10 replies ("e" tags marked root and reply,
   "p" tags for the people in the thread), a Quote carries a NIP-18 "q" tag, and a content warning goes
   as a NIP-36 "content-warning" tag. Reading back keeps each note's author key and these tags, so a reply
   finds its Dream on a new device. Replies are saved in dbm_replies (see js/core.js).
   An unlocked key lives only in this file's memory until the page closes or reloads.
   The crypto (js/vendor/nostr-tools-2.25.2.min.js) loads only when a Nostr feature is used. */
(function (Looscid) {
"use strict";
const SK_KEY = "dbm_nostr_sk", ENC_KEY = "dbm_nostr_ncryptsec", RELAYS_KEY = "dbm_nostr_relays", QUEUE_KEY = "dbm_nostr_queue", HIDDEN_KEY = "dbm_nostr_hidden";
const IDENTITY_KEY = "looscid_identity", IDS_KEY = "dbm_linked_ids", DREAMS_KEY = "dbm_dreams", REPLIES_KEY = "dbm_replies";
const KEEP_TAGS = ["e", "p", "q", "content-warning"];
const DEFAULT_RELAYS = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net", "wss://relay.nostr.band"];
const VENDOR_SRC = "js/vendor/nostr-tools-2.25.2.min.js";
const TAGS = [["client", "Looscid"], ["t", "looscid"]];
const RETRY_MS = [30000, 120000, 600000, 1800000];
let memSk = null;          // Uint8Array, the unlocked key for this session only
let toolsP = null, retryTimer = null, busyQueue = false;

function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
function lsJson(k, d) { try { const v = JSON.parse(lsGet(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
function emit() { try { window.dispatchEvent(new Event("looscid-nostr")); } catch (e) {} }
function toHex(b) { return Array.from(b, function (x) { return x.toString(16).padStart(2, "0"); }).join(""); }
function fromHex(h) { const o = new Uint8Array(h.length / 2); for (let i = 0; i < o.length; i++) o[i] = parseInt(h.substr(i * 2, 2), 16); return o; }
const isHex64 = function (s) { return /^[0-9a-f]{64}$/i.test(String(s || "")); };

// The crypto library, from this site only. No CDN.
function load() {
  if (window.NostrTools && window.NostrTools.nip49) return Promise.resolve(window.NostrTools);
  if (toolsP) return toolsP;
  toolsP = new Promise(function (resolve, reject) {
    const s = document.createElement("script");
    s.src = VENDOR_SRC; s.async = true;
    s.onload = function () { window.NostrTools && window.NostrTools.nip49 ? resolve(window.NostrTools) : (toolsP = null, reject(new Error("missing"))); };
    s.onerror = function () { toolsP = null; reject(new Error("load")); };
    document.head.appendChild(s);
  });
  return toolsP;
}

/* --- Relays ------------------------------------------------------------------------- */
function cleanRelay(u) {
  const s = String(u || "").trim().replace(/\/+$/, "");
  if (/^wss:\/\/[a-z0-9.-]+(:\d{1,5})?(\/[^\s]*)?$/i.test(s)) return s.toLowerCase().replace(/^(wss:\/\/[^/]+)/, function (m) { return m.toLowerCase(); });
  if (/^ws:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?(\/[^\s]*)?$/i.test(s)) return s; // for people running a relay on their own machine
  return null;
}
function relays() {
  const l = lsJson(RELAYS_KEY, null);
  if (Array.isArray(l)) { const c = l.map(cleanRelay).filter(Boolean); if (c.length) return c.filter(function (x, i) { return c.indexOf(x) === i; }); }
  return DEFAULT_RELAYS.slice();
}
function setRelays(list) {
  const c = (list || []).map(cleanRelay).filter(Boolean).filter(function (x, i, a) { return a.indexOf(x) === i; });
  lsSet(RELAYS_KEY, c.length ? JSON.stringify(c) : null); emit(); return relays();
}
function resetRelays() { lsSet(RELAYS_KEY, null); emit(); return relays(); }
function usingDefaultRelays() { return !Array.isArray(lsJson(RELAYS_KEY, null)); }

/* --- Key state ---------------------------------------------------------------------- */
function identity() { const i = lsJson(IDENTITY_KEY, null); return i && i.provider === "nostr" && isHex64(i.pubkey) ? i : null; }
function linkedPubkey() {
  const ids = lsJson(IDS_KEY, []);
  const n = Array.isArray(ids) ? ids.find(function (x) { return x && x.kind === "nostr" && isHex64(x.hex); }) : null;
  return n ? n.hex.toLowerCase() : null;
}
/* mode: "signer" (NIP-07), "key" (key here, ready), "locked" (key here, passcode needed),
   "view" (only a public key: your Dreams load, nothing is sent), "none". */
function state() {
  const idn = identity();
  const enc = lsGet(ENC_KEY), plain = lsGet(SK_KEY);
  let mode = "none";
  if (idn && idn.method === "nip07") mode = "signer";
  else if (idn && enc) mode = memSk ? "key" : "locked";
  else if (idn && plain && isHex64(plain)) mode = "key";
  const pk = (mode !== "none" && idn) ? idn.pubkey.toLowerCase() : linkedPubkey();
  if (mode === "none" && pk) mode = "view";
  return { mode: mode, pubkey: pk || null, npub: (mode !== "none" && idn && idn.npub) || null, encrypted: !!(idn && enc), canDream: mode === "signer" || mode === "key" || mode === "locked", queued: queue().length };
}
function currentSk() {
  if (memSk && lsGet(ENC_KEY)) return memSk;
  const plain = lsGet(SK_KEY);
  return plain && isHex64(plain) ? fromHex(plain.toLowerCase()) : null;
}
function setIdentityFor(NT, pk, method, extra) {
  const v = Object.assign({ provider: "nostr", method: method, pubkey: pk, npub: NT.nip19.npubEncode(pk), at: Date.now() }, extra || {});
  // Looscid.setIdentity (core.js) also lists it as a login method.
  if (Looscid.setIdentity) Looscid.setIdentity(v); else lsSet(IDENTITY_KEY, JSON.stringify(v));
  return v;
}
function storeSk(NT, sk, passcode) {
  if (passcode) { lsSet(ENC_KEY, NT.nip49.encrypt(sk, passcode, 16, 0x02)); lsSet(SK_KEY, null); }
  else { lsSet(SK_KEY, toHex(sk)); lsSet(ENC_KEY, null); }
  memSk = passcode ? sk : null;
}
// Decode what someone typed: nsec1..., 64 hex characters, or an ncryptsec1... with its passcode.
function parseKey(NT, raw, passcode) {
  const v = String(raw || "").trim();
  if (!v) return { err: "Type or paste your nsec key first." };
  if (/^npub1/i.test(v)) return { err: "That's a public key (npub). Your secret key starts with nsec1." };
  if (/^ncryptsec1/i.test(v)) {
    if (!passcode) return { err: "That key is locked with a passcode. Type its passcode in the Passcode field too." };
    try { return { sk: NT.nip49.decrypt(v, passcode), enc: v }; } catch (e) { return { err: "That passcode doesn't unlock this key. Nothing was saved." }; }
  }
  try { const d = NT.nip19.decode(v); if (d.type === "nsec" && d.data && d.data.length === 32) return { sk: d.data }; } catch (e) {}
  if (isHex64(v)) return { sk: fromHex(v.toLowerCase()) };
  return { err: "That isn't a valid nsec key. It starts with nsec1 and is 63 characters long. Nothing was saved." };
}
async function importKey(raw, passcode) {
  let NT; try { NT = await load(); } catch (e) { return { err: "Couldn't load the Nostr tools. Check your connection and try again." }; }
  const p = parseKey(NT, raw, passcode);
  if (p.err) return p;
  const pk = NT.getPublicKey(p.sk);
  if (p.enc) { lsSet(ENC_KEY, p.enc); lsSet(SK_KEY, null); memSk = p.sk; } else storeSk(NT, p.sk, passcode);
  const idn = setIdentityFor(NT, pk, "local", { imported: true });
  emit(); kick(); return { ok: true, npub: idn.npub, pubkey: pk };
}
async function createKey(passcode) {
  let NT; try { NT = await load(); } catch (e) { return { err: "Couldn't load the Nostr tools. Check your connection and try again." }; }
  const sk = NT.generateSecretKey(), pk = NT.getPublicKey(sk);
  storeSk(NT, sk, passcode);
  const idn = setIdentityFor(NT, pk, "local");
  emit(); return { ok: true, nsec: NT.nip19.nsecEncode(sk), npub: idn.npub, pubkey: pk };
}
async function useSigner() {
  if (!window.nostr || typeof window.nostr.getPublicKey !== "function") return { err: "No Nostr signer was found in this browser." };
  let NT; try { NT = await load(); } catch (e) { return { err: "Couldn't load the Nostr tools. Check your connection and try again." }; }
  let pk; try { pk = await window.nostr.getPublicKey(); } catch (e) { return { err: "Your signer said no, or was closed. Nothing was saved." }; }
  if (!isHex64(pk)) return { err: "Your signer didn't share a valid public key. Nothing was saved." };
  lsSet(SK_KEY, null); lsSet(ENC_KEY, null); memSk = null;
  const idn = setIdentityFor(NT, pk.toLowerCase(), "nip07");
  emit(); kick(); return { ok: true, npub: idn.npub, pubkey: pk.toLowerCase() };
}
async function unlock(passcode) {
  const enc = lsGet(ENC_KEY); if (!enc) return { err: "There's no locked key on this device." };
  if (!passcode) return { err: "Type your passcode first." };
  let NT; try { NT = await load(); } catch (e) { return { err: "Couldn't load the Nostr tools. Check your connection and try again." }; }
  let sk; try { sk = NT.nip49.decrypt(enc, passcode); } catch (e) { return { err: "That passcode isn't right. Try again." }; }
  const idn = identity();
  if (idn && NT.getPublicKey(sk) !== idn.pubkey) return { err: "That passcode opened a different key. Nothing changed." };
  memSk = sk; emit();
  const n = queue().filter(function (q) { return q.draft; }).length; kick();
  return { ok: true, waiting: n };
}
async function setPasscode(passcode) {
  const sk = currentSk(); if (!sk) return { err: "Unlock your key first." };
  if (!passcode) return { err: "Type a passcode first." };
  let NT; try { NT = await load(); } catch (e) { return { err: "Couldn't load the Nostr tools. Check your connection and try again." }; }
  storeSk(NT, sk, passcode); emit(); return { ok: true };
}
function removePasscode() {
  if (!lsGet(ENC_KEY)) return { err: "Your key has no passcode." };
  if (!memSk) return { err: "Unlock your key first." };
  lsSet(SK_KEY, toHex(memSk)); lsSet(ENC_KEY, null); memSk = null; emit(); return { ok: true };
}
// Remove the key (and signer link) from this device. Your Dreams stay on this device.
function forget() {
  lsSet(SK_KEY, null); lsSet(ENC_KEY, null); memSk = null;
  const idn = identity();
  if (idn) {
    const m = (Looscid.getMethods ? Looscid.getMethods() : []).find(function (x) { return x.provider === "nostr"; });
    if (m && Looscid.removeMethod) Looscid.removeMethod(m.id); else lsSet(IDENTITY_KEY, null);
    lsSet(IDENTITY_KEY, null);
  }
  // Dreams still waiting to be signed can't be signed any more.
  saveQueue(queue().filter(function (q) { return q.ev; }));
  emit(); return { ok: true };
}
function nsecNow() { const sk = currentSk(); return sk && window.NostrTools ? window.NostrTools.nip19.nsecEncode(sk) : null; }

/* --- Talking to relays (plain WebSocket, NIP-01) ------------------------------------ */
function relaySend(url, ev, ms) {
  return new Promise(function (resolve) {
    let ws, done = false;
    const end = function (ok) { if (done) return; done = true; clearTimeout(t); try { ws && ws.close(); } catch (e) {} resolve(ok); };
    const t = setTimeout(function () { end(false); }, ms || 8000);
    try { ws = new WebSocket(url); } catch (e) { end(false); return; }
    ws.onopen = function () { try { ws.send(JSON.stringify(["EVENT", ev])); } catch (e) { end(false); } };
    ws.onmessage = function (m) { let d; try { d = JSON.parse(m.data); } catch (e) { return; }
      if (Array.isArray(d) && d[0] === "OK" && d[1] === ev.id) end(d[2] === true || /^duplicate:/.test(String(d[3] || ""))); };
    ws.onerror = function () { end(false); }; ws.onclose = function () { end(false); };
  });
}
function relayReq(url, filter, ms) {
  return new Promise(function (resolve) {
    let ws, done = false; const got = [], sub = "lc" + Math.random().toString(36).slice(2, 10);
    const end = function () { if (done) return; done = true; clearTimeout(t); try { ws && ws.readyState === 1 && ws.send(JSON.stringify(["CLOSE", sub])); } catch (e) {} try { ws && ws.close(); } catch (e) {} resolve(got); };
    const t = setTimeout(end, ms || 8000);
    try { ws = new WebSocket(url); } catch (e) { end(); return; }
    ws.onopen = function () { try { ws.send(JSON.stringify(["REQ", sub, filter])); } catch (e) { end(); } };
    ws.onmessage = function (m) { let d; try { d = JSON.parse(m.data); } catch (e) { return; }
      if (!Array.isArray(d) || d[1] !== sub) return;
      if (d[0] === "EVENT" && d[2] && typeof d[2] === "object") { if (got.length < 1000) got.push(d[2]); }
      else if (d[0] === "EOSE" || d[0] === "CLOSED") end(); };
    ws.onerror = end; ws.onclose = end;
  });
}
async function sendToRelays(ev, list) {
  const res = await Promise.all(list.map(function (u) { return relaySend(u, ev).then(function (ok) { return { u: u, ok: ok }; }); }));
  return { ok: res.filter(function (r) { return r.ok; }).map(function (r) { return r.u; }), failed: res.filter(function (r) { return !r.ok; }).map(function (r) { return r.u; }) };
}

/* --- Queue: Dreams that didn't reach every relay yet --------------------------------- */
function queue() { const q = lsJson(QUEUE_KEY, []); return Array.isArray(q) ? q : []; }
function saveQueue(q) { lsSet(QUEUE_KEY, q.length ? JSON.stringify(q.slice(-200)) : null); }
function schedule() {
  clearTimeout(retryTimer); retryTimer = null;
  const q = queue(); if (!q.length) return;
  const next = Math.min.apply(null, q.map(function (x) { return x.next || 0; }));
  retryTimer = setTimeout(processQueue, Math.max(1000, next - Date.now()));
}
// After signing: the saved Dream or reply learns its note id, author key and threading tags (Round 6.5).
function tagNid(dreamRef, nid, ev) {
  [DREAMS_KEY, REPLIES_KEY].some(function (key) {
    const a = lsJson(key, []); if (!Array.isArray(a)) return false;
    const d = a.find(function (x) { return x && String(x.id) === String(dreamRef); });
    if (!d) return false;
    d.nid = nid;
    if (ev) { d.pk = ev.pubkey; const t = keepTags(ev.tags); if (t.length) d.tags = t; else delete d.tags; }
    lsSet(key, JSON.stringify(a)); return true;
  });
}
function keepTags(tags) {
  return (Array.isArray(tags) ? tags : []).filter(function (t) { return Array.isArray(t) && KEEP_TAGS.indexOf(t[0]) >= 0 && typeof t[1] === "string"; }).map(function (t) { return t.slice(0, 5).map(String); }).slice(0, 50);
}
// A Dream or reply saved on this device, by its Looscid id.
function findLocal(ref) {
  if (ref == null) return null; const k = String(ref); let out = null;
  [DREAMS_KEY, REPLIES_KEY].some(function (key) { const a = lsJson(key, []); if (!Array.isArray(a)) return false; out = a.find(function (x) { return x && String(x.id) === k; }) || null; return !!out; });
  return out;
}
function findByNid(nid) {
  let out = null;
  [DREAMS_KEY, REPLIES_KEY].some(function (key) { const a = lsJson(key, []); if (!Array.isArray(a)) return false; out = a.find(function (x) { return x && x.nid === nid; }) || null; return !!out; });
  return out;
}
// Is this Dream waiting to reach Nostr (signed later, after your passcode)?
function isPending(ref) { return queue().some(function (q) { return q.draft && String(q.draft.dreamRef) === String(ref); }); }
async function sign(tpl) {
  const st = state();
  if (st.mode === "signer") {
    const ev = await window.nostr.signEvent(Object.assign({ pubkey: st.pubkey }, tpl));
    const NT = await load();
    if (!ev || ev.pubkey !== st.pubkey || !NT.verifyEvent(ev)) throw new Error("bad signature");
    return ev;
  }
  const sk = currentSk(); if (!sk) return null;
  const NT = await load();
  return NT.finalizeEvent(tpl, sk);
}
/* The note for a Dream. d.parentRef: the Dream or reply it answers (NIP-10). d.quoteRef: the Dream it quotes
   (NIP-18). d.cw: a content warning (NIP-36). d.notifyPks: extra people to notify. Returns null when the
   Dream it answers isn't on Nostr yet (it waits, and is tried again). */
function dreamTemplate(d, NT, myPk) {
  const tags = TAGS.map(function (t) { return t.slice(); });
  let content = String(d.text || "");
  const hint = relays()[0] || "";
  const ps = [];
  const addP = function (pk) { if (isHex64(pk) && ps.indexOf(pk.toLowerCase()) < 0) ps.push(pk.toLowerCase()); };
  if (d.parentRef != null) {
    const par = findLocal(d.parentRef);
    if (!par || !isHex64(par.nid)) return null;
    const ppk = isHex64(par.pk) ? par.pk : myPk;
    const pt = Array.isArray(par.tags) ? par.tags : [];
    const rootTag = pt.find(function (t) { return t[0] === "e" && t[3] === "root" && isHex64(t[1]); }) || pt.find(function (t) { return t[0] === "e" && isHex64(t[1]) && !t[3]; });
    if (rootTag && rootTag[1] !== par.nid) {
      const rl = findByNid(rootTag[1]);
      const rpk = isHex64(rootTag[4]) ? rootTag[4] : rl ? (isHex64(rl.pk) ? rl.pk : myPk) : null;
      tags.push(rpk ? ["e", rootTag[1], rootTag[2] || hint, "root", rpk] : ["e", rootTag[1], rootTag[2] || hint, "root"]);
      tags.push(ppk ? ["e", par.nid, hint, "reply", ppk] : ["e", par.nid, hint, "reply"]);
    } else {
      tags.push(ppk ? ["e", par.nid, hint, "root", ppk] : ["e", par.nid, hint, "root"]);
    }
    // NIP-10: the author of what you answer, plus everyone it already tagged.
    addP(ppk); pt.forEach(function (t) { if (t[0] === "p") addP(t[1]); });
  }
  (d.notifyPks || []).forEach(addP);
  ps.forEach(function (pk) { tags.push(["p", pk]); });
  if (d.quoteRef != null) {
    const q = findLocal(d.quoteRef);
    if (q && isHex64(q.nid)) {
      const qpk = isHex64(q.pk) ? q.pk : myPk;
      tags.push(qpk ? ["q", q.nid, hint, qpk] : ["q", q.nid, hint]);
      try { if (NT && NT.nip19) content += "\n\nnostr:" + NT.nip19.neventEncode({ id: q.nid, relays: hint ? [hint] : [], author: qpk || undefined }); } catch (e) {}
    }
  }
  if (d.cw && String(d.cw).trim()) tags.push(["content-warning", String(d.cw).trim().slice(0, 200)]);
  return { kind: 1, created_at: Math.floor((+d.created || Date.now()) / 1000), tags: tags, content: content };
}
async function signDream(d) {
  const NT = await load();
  const tpl = dreamTemplate(d, NT, state().pubkey);
  if (!tpl) return { wait: true };
  return { ev: await sign(tpl) };
}
const DRAFT_KEYS = ["parentRef", "quoteRef", "cw", "notifyPks"];
async function processQueue() {
  if (busyQueue) return; busyQueue = true;
  try {
    let q = queue(); const now = Date.now(); const out = [];
    for (let i = 0; i < q.length; i++) {
      let it = q[i];
      if ((it.next || 0) > now + 500 && !it.kick) { out.push(it); continue; }
      delete it.kick;
      if (!it.ev && it.draft) {
        let ev = null; try { const r = await signDream(it.draft); ev = r.ev || null; } catch (e) {}
        if (!ev) { out.push(it); continue; }  // still locked (waits for the passcode), or what it answers isn't on Nostr yet
        tagNid(it.draft.dreamRef, ev.id, ev);
        it = { ev: ev, dreamRef: it.draft.dreamRef, todo: relays(), tries: 0 };
      }
      if (!it.ev) continue;
      const r = await sendToRelays(it.ev, it.todo && it.todo.length ? it.todo : relays());
      if (r.failed.length) { it.todo = r.failed; it.tries = (it.tries || 0) + 1; it.next = Date.now() + RETRY_MS[Math.min(it.tries - 1, RETRY_MS.length - 1)]; out.push(it); }
    }
    // Anything added while this ran stays too.
    const cur = queue(); cur.forEach(function (c) { if (!q.some(function (x) { return x === c || (x.ev && c.ev && x.ev.id === c.ev.id) || (x.draft && c.draft && x.draft.dreamRef === c.draft.dreamRef); })) out.push(c); });
    saveQueue(out);
  } finally { busyQueue = false; schedule(); emit(); }
}
function kick() { const q = queue(); if (!q.length) return; q.forEach(function (x) { x.kick = true; }); saveQueue(q); setTimeout(processQueue, 50); }

// One calm announcement, after "Dream dreamed." has been heard.
function sayLater(msg) {
  const wait = Math.max(0, 1600 - (Date.now() - (Looscid.LC_ANN_AT || 0)));
  setTimeout(function () { if (Looscid.announce) Looscid.announce(msg); }, wait);
}
/* Publish one Dream you just made with Audience Everyone. Returns a summary; announces once. */
async function publishDream(d, opts) {
  const st = state();
  if (!st.canDream || !d || !String(d.text || "").trim()) return { skipped: true };
  const quiet = opts && opts.quiet;
  if (st.mode === "locked") {
    const dr = { dreamRef: d.id, text: d.text, created: d.created || Date.now() };
    DRAFT_KEYS.forEach(function (k) { if (d[k] != null) dr[k] = d[k]; });
    const q = queue(); q.push({ draft: dr, at: Date.now() }); saveQueue(q); emit();
    if (!quiet) sayLater("Saved on this device. Enter your passcode to send it to relays.");
    return { queued: true, locked: true };
  }
  let ev = null, wait = false;
  try { const r = await signDream(d); ev = r.ev || null; wait = !!r.wait; } catch (e) { ev = null; }
  if (wait) { if (!quiet) sayLater("Saved on this device. The Dream it answers isn't on Nostr, so it stays here."); return { skipped: true, reason: "parent" }; }
  if (!ev) { if (!quiet) sayLater("Saved on this device. Your signer didn't sign it, so it wasn't sent."); return { error: "sign" }; }
  tagNid(d.id, ev.id, ev);
  const list = relays();
  const r = await sendToRelays(ev, list);
  if (r.failed.length) { const q = queue(); q.push({ ev: ev, dreamRef: d.id, todo: r.failed, tries: 1, next: Date.now() + RETRY_MS[0] }); saveQueue(q); schedule(); }
  emit();
  if (!quiet) sayLater(r.ok.length ? "Dreamed to " + r.ok.length + " of " + list.length + " relays." : "Saved on this device. Couldn't reach relays, will retry.");
  return { ev: ev, ok: r.ok.length, total: list.length };
}

/* --- Reading your own Dreams back (any device) ------------------------------------- */
function hidden() { const h = lsJson(HIDDEN_KEY, []); return Array.isArray(h) ? h : []; }
function hide(nid) { if (!isHex64(nid)) return; const h = hidden(); if (h.indexOf(nid) < 0) { h.push(nid); lsSet(HIDDEN_KEY, JSON.stringify(h.slice(-2000))); } }
async function fetchOwn() {
  const st = state(); if (!st.pubkey) return { added: 0 };
  let NT; try { NT = await load(); } catch (e) { return { added: 0, error: "load" }; }
  const pk = st.pubkey, list = relays();
  const filter = { kinds: [1], authors: [pk], "#t": ["looscid"], limit: 500 };
  const all = await Promise.all(list.map(function (u) { return relayReq(u, filter); }));
  const seen = new Set(), hid = new Set(hidden());
  const saved = lsJson(DREAMS_KEY, []); const savedArr = Array.isArray(saved) ? saved : [];
  const savedR = lsJson(REPLIES_KEY, []); const savedRArr = Array.isArray(savedR) ? savedR : [];
  savedArr.concat(savedRArr).forEach(function (s) { if (s && s.nid) seen.add(s.nid); if (s && typeof s.id === "string" && isHex64(s.id)) seen.add(s.id); });
  const fresh = [], freshR = [];
  all.forEach(function (evs) { evs.forEach(function (ev) {
    if (!ev || seen.has(ev.id) || hid.has(ev.id)) return;
    if (ev.kind !== 1 || ev.pubkey !== pk || typeof ev.content !== "string") return;
    if (!Array.isArray(ev.tags) || !ev.tags.some(function (t) { return t && t[0] === "t" && t[1] === "looscid"; })) return;
    let ok = false; try { ok = NT.verifyEvent(ev); } catch (e) {}
    if (!ok) return;
    seen.add(ev.id);
    // Round 6.5: keep the author key and the threading tags (they were dropped in 6.4).
    const tags = keepTags(ev.tags);
    const rec = { id: ev.id, nid: ev.id, pk: ev.pubkey, text: ev.content.slice(0, 20000), created: ev.created_at * 1000, likes: 0 };
    if (tags.length) rec.tags = tags;
    const cwT = tags.find(function (t) { return t[0] === "content-warning"; }); if (cwT) rec.cw = cwT[1] || "Content warning";
    const es = tags.filter(function (t) { return t[0] === "e" && isHex64(t[1]); });
    if (es.length) {
      const root = es.find(function (t) { return t[3] === "root"; }) || es[0];
      const par = es.find(function (t) { return t[3] === "reply"; }) || root;
      rec._root = root[1]; rec._par = par[1];
      freshR.push(rec);
    } else { rec.redreams = 0; rec.quotes = 0; fresh.push(rec); }
  }); });
  if (fresh.length) {
    const merged = savedArr.concat(fresh).sort(function (a, b) { return (+b.created || 0) - (+a.created || 0); });
    lsSet(DREAMS_KEY, JSON.stringify(merged.slice(0, 1000)));
    try { window.dispatchEvent(new CustomEvent("looscid-dreams-fetched", { detail: { ids: fresh.map(function (f) { return f.id; }) } })); } catch (e) {}
  }
  if (freshR.length) {
    // A reply hangs under the Dream it belongs to (found by note id); a reply to a reply also knows that reply.
    const allR = savedRArr.concat(freshR);
    freshR.forEach(function (r) {
      const rootLocal = findByNid(r._root);
      r.replyTo = rootLocal ? rootLocal.id : r._root;
      if (r._par !== r._root) { const pl = allR.find(function (x) { return x.nid === r._par; }); r.replyToReply = pl ? pl.id : r._par; }
      delete r._root; delete r._par;
    });
    const mergedR = savedRArr.concat(freshR).sort(function (a, b) { return (+b.created || 0) - (+a.created || 0); });
    lsSet(REPLIES_KEY, JSON.stringify(mergedR.slice(0, 2000)));
    try { window.dispatchEvent(new Event("looscid-replies")); } catch (e) {}
  }
  if (!fresh.length && !freshR.length) return { added: 0, relaysAnswered: all.filter(function (a) { return a.length; }).length };
  return { added: fresh.length, replies: freshR.length };
}

// On start: read your Dreams back and send anything waiting. Quiet: no announcement, no focus moves.
function start() {
  const st = state();
  if (!st.pubkey && !queue().length) return;
  setTimeout(function () {
    if (st.pubkey) fetchOwn().catch(function () {});
    if (queue().length && st.canDream) processQueue();
  }, 1200);
}
window.addEventListener("online", function () { if (queue().length) kick(); });
if (document.readyState === "complete") start(); else window.addEventListener("load", start);

Looscid.lcNostr = { DEFAULT_RELAYS: DEFAULT_RELAYS.slice(), VENDOR_SRC: VENDOR_SRC, load: load, state: state, relays: relays, setRelays: setRelays, resetRelays: resetRelays, usingDefaultRelays: usingDefaultRelays, cleanRelay: cleanRelay,
  importKey: importKey, createKey: createKey, useSigner: useSigner, unlock: unlock, setPasscode: setPasscode, removePasscode: removePasscode, forget: forget, nsecNow: nsecNow,
  publishDream: publishDream, fetchOwn: fetchOwn, isPending: isPending, nidOf: function (ref) { const d = findLocal(ref); return d && isHex64(d.nid) ? d.nid : null; }, dreamTemplate: dreamTemplate, processQueue: processQueue, queue: queue, hide: hide };
})(window.Looscid = window.Looscid || {});
