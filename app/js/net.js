/* Looscid net.js: Rem (the Looscid protocol, Rem v1, and its server) and bridges.
   Plain script (not a module). Everything it shares goes on window.Looscid.lcNet; see docs/protocol.md.

   Nov 7 2026 (Carter: "Merge Rem with the other protocol"): one protocol, Rem. Rem is the home of public Dreams. Each Dream you
   make with Audience Everyone is a small JSON event signed with your LooscidID key and sent to the server, which checks
   the signature before it keeps it. Nostr is a bridge you can turn on in Settings, LooscidID, Connectionbase
   ("Also share my Dreams to Nostr"): then the same signed Dream also goes to your Nostr relays. Mastodon and Bluesky are coming soon.
   "Put your Dreams on Rem" is in js/remsync.js, shown in Connectionbase under Rem. The older Rem v0 home is retired (Nov 7 2026).

   localStorage keys:
   - looscid_bridges         which bridges are on, like {"nostr": true}. Missing means: Nostr stays on if you already
                             used Nostr (Dreams with a Nostr id, a relay list or a send queue), and is off for new people.
   - looscid_net_queue       signed events waiting to reach Rem (offline, server busy)
   - looscid_net_blocks      people you blocked on the server: {handle: pubkey}, so Unblock in Privacy reaches it too
   - looscid_nostr_crossposted  Nostr ids of Dreams that really went to Nostr (so deleting one asks relays too) */
(function (Looscid) {
const API = "https://rem.thebntlovver.workers.dev"; // Rem, the one Looscid server (Cloudflare Worker "rem" + D1 "looscid-db")
const PROTOCOL_TAG = ["looscid", "1"]; // Rem v1 (docs/protocol.md)
const BRIDGES_KEY = "looscid_bridges", QUEUE_KEY = "looscid_net_queue", BLOCKS_KEY = "looscid_net_blocks", XPOST_KEY = "looscid_nostr_crossposted";
// Bridges: add a row here when a new one is built. "soon" rows show as Coming soon and can't be turned on.
const BRIDGES = [
  { id: "nostr", label: "Nostr", note: "Your public Dreams also go to your Nostr relays, signed with the same key. Relays are run by other people, so a Dream sent there can't be fully deleted." },
  { id: "mastodon", label: "Mastodon", soon: true },
  { id: "bluesky", label: "Bluesky", soon: true },
];
const normH = function (h) { return Looscid.lcHandle ? Looscid.lcHandle(String(h || "")) : String(h || "").replace(/^@/, "").toLowerCase(); };
const isHex64 = function (s) { return typeof s === "string" && /^[0-9a-f]{64}$/i.test(s); };
function lsJson(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
function lsSave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

/* --- Bridges --- */
function usedNostrBefore() {
  try {
    if (localStorage.getItem("looscid_nostr_relays")) return true;
    if ((lsJson("looscid_nostr_queue", []) || []).length) return true;
    return ["looscid_dreams", "looscid_replies"].some(function (k) { const a = lsJson(k, []); return Array.isArray(a) && a.some(function (d) { return d && isHex64(d.nid); }); });
  } catch (e) { return false; }
}
function bridges() {
  let v = lsJson(BRIDGES_KEY, null);
  if (!v || typeof v !== "object") { v = { nostr: usedNostrBefore() }; lsSave(BRIDGES_KEY, v); } // existing Nostr users keep it on
  return v;
}
function bridgeOn(id) { const b = BRIDGES.find(function (x) { return x.id === id; }); return !!(b && !b.soon && bridges()[id]); }
function setBridge(id, on) {
  const b = BRIDGES.find(function (x) { return x.id === id; }); if (!b || b.soon) return false;
  const v = Object.assign({}, bridges()); v[id] = !!on; lsSave(BRIDGES_KEY, v);
  window.dispatchEvent(new CustomEvent("looscid:bridges")); return true;
}
function markCrossposted(nid) { if (!isHex64(nid)) return; const l = lsJson(XPOST_KEY, []); if (l.indexOf(nid) < 0) { l.push(nid); lsSave(XPOST_KEY, l.slice(-5000)); } }
function wasCrossposted(nid) { return lsJson(XPOST_KEY, []).indexOf(String(nid || "").toLowerCase()) >= 0; }

/* --- Talking to the server --- */
async function call(method, path, body) {
  const r = await fetch(API + path, { method: method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  let j = null; try { j = await r.json(); } catch (e) {}
  return { status: r.status, ok: r.ok && !!(j && j.ok), body: j };
}
// Sends one signed event to /ingest. Network trouble keeps it in a queue that's tried again later.
async function ingest(ev, noQueue) {
  if (!ev || !isHex64(ev.id)) return { ok: false };
  try {
    const r = await call("POST", "/ingest", ev);
    if (r.ok || (r.status >= 400 && r.status < 500 && r.status !== 429)) return r; // a 4xx is final (bad event), not retried
    if (!noQueue) enqueue(ev); return r;
  } catch (e) { if (!noQueue) enqueue(ev); return { ok: false, offline: true }; }
}
function enqueue(ev) { const q = lsJson(QUEUE_KEY, []); if (!q.some(function (x) { return x.id === ev.id; })) { q.push(ev); lsSave(QUEUE_KEY, q.slice(-200)); } }
let flushing = false;
async function flush() {
  if (flushing) return; flushing = true;
  try {
    const q = lsJson(QUEUE_KEY, []), left = [];
    for (let i = 0; i < q.length; i++) { const r = await ingest(q[i], true); if (!r.ok && (r.offline || r.status >= 500 || r.status === 429)) left.push(q[i]); }
    const now = lsJson(QUEUE_KEY, []); now.forEach(function (x) { if (!q.some(function (y) { return y.id === x.id; })) left.push(x); });
    lsSave(QUEUE_KEY, left);
  } finally { flushing = false; }
}
window.addEventListener("online", function () { flush(); });
setTimeout(flush, 4000);

/* --- Signing small "actions" (report, block, delete my data) with your own key --- */
async function signAction(tpl) {
  const N = Looscid.lcNostr; if (!N || !N.sign) throw new Error("nokey");
  const st = N.state(); if (!st.canDream) throw new Error("nokey"); if (st.mode === "locked") throw new Error("locked");
  const ev = await N.sign(Object.assign({ created_at: Math.floor(Date.now() / 1000), content: "" }, tpl));
  if (!ev) throw new Error("nokey"); return ev;
}
function whyText(e) {
  const m = e && e.message;
  return m === "locked" ? "Your key is locked. Enter your passcode in Settings, LooscidID first." : m === "nokey" ? "You need a LooscidID key for this. Make one in Settings, LooscidID." : "Couldn't reach Rem. Try again in a bit.";
}

/* --- Feed --- */
async function feed(opts) {
  opts = opts || {};
  const me = Looscid.lcNostr && Looscid.lcNostr.state ? Looscid.lcNostr.state().pubkey : null;
  const q = "?limit=" + (opts.limit || 50) + (opts.before ? "&before=" + opts.before : "") + (opts.sort === "new" ? "&sort=new" : "") + (isHex64(me || "") ? "&viewer=" + me : "");
  const r = await call("GET", "/feed" + q);
  if (!r.ok) throw new Error("feed");
  return r.body.dreams || [];
}
async function userDreams(pk) { const r = await call("GET", "/dreams/" + encodeURIComponent(pk)); if (!r.ok) throw new Error("dreams"); return r.body.dreams || []; }

/* --- Report, block --- */
const REPORT_REASONS = [["spam", "Spam"], ["mean", "Mean or bullying"], ["unsafe", "Unsafe or harmful"], ["other", "Something else"]];
async function report(nid, authorPk, reason) {
  try {
    const tags = [["e", String(nid).toLowerCase(), reason || "other"]]; if (isHex64(authorPk || "")) tags.push(["p", authorPk.toLowerCase()]);
    const ev = await signAction({ kind: 1984, tags: tags.concat([PROTOCOL_TAG]) });
    const r = await call("POST", "/report", ev);
    if (r.ok) return { ok: true, say: "Reported. Thanks for keeping Looscid safe." + (r.body.hidden ? " This Dream is now hidden while it's checked." : "") };
    return { ok: false, say: r.status === 404 ? "This Dream isn't on Rem, so it can't be reported there." : (r.body && r.body.error === "you can't report your own Dream") ? "You can't report your own Dream." : "Couldn't send the report. Try again in a bit." };
  } catch (e) { return { ok: false, say: whyText(e) }; }
}
async function sendBlock(pk, unblock) {
  try { const ev = await signAction({ kind: 21984, tags: [["p", pk.toLowerCase()], ["action", unblock ? "unblock" : "block"], PROTOCOL_TAG] }); const r = await call("POST", "/block", ev); return { ok: r.ok }; }
  catch (e) { return { ok: false, err: e.message }; }
}
// Blocking someone whose key we know: saved on this device (Privacy, Blocked Dreamors) and on the server, so their Dreams
// stay out of your Looscid feed.
function block(pk, handle) {
  if (!isHex64(pk || "")) return Promise.resolve({ ok: false });
  const m = lsJson(BLOCKS_KEY, {}); if (handle) { m[normH(handle)] = pk.toLowerCase(); lsSave(BLOCKS_KEY, m); }
  return sendBlock(pk, false);
}
function unblockHandle(handle) {
  const h = normH(handle), m = lsJson(BLOCKS_KEY, {}), pk = m[h];
  if (!pk) return Promise.resolve({ ok: false }); delete m[h]; lsSave(BLOCKS_KEY, m);
  return sendBlock(pk, true);
}
function blockedPk(handle) { return lsJson(BLOCKS_KEY, {})[normH(handle)] || null; }
// Nov 8 2026: moderation reasons (js/modreasons.js). A mod's removal goes to Rem as a signed kind 21986 event with the
// reason, and your own removed Dreams come back with theirs. A Rem without these answers 404, and that's fine: the
// removal still shows on this device.
// Nov 8 2026: circle = { id, name } sends a Circle mod's removal (["scope","circle"]); nid is then the Dream's Rem id or
// the app's own id for it. Rem keeps it under your key and that Circle; it never hides the Dream on Rem.
async function moderate(nid, action, reason, circle) {
  const ref = circle ? String(nid) : String(nid).toLowerCase();
  const extra = circle ? [["scope", "circle"], ["circle", String(circle.id)], ["circle_name", String(circle.name || "Circle").slice(0, 100)]] : [];
  try { const ev = await signAction({ kind: 21986, content: String(reason || ""), tags: extra.concat([["e", ref], ["action", action === "restore" ? "restore" : "remove"], ["reason", String(reason || "")], PROTOCOL_TAG]) });
    const r = await call("POST", "/moderate", ev); return { ok: r.ok, status: r.status }; } catch (e) { return { ok: false }; }
}
async function moderators() {
  const me = Looscid.lcNostr && Looscid.lcNostr.state ? Looscid.lcNostr.state().pubkey : null; if (!isHex64(me || "")) return [];
  const r = await call("GET", "/moderators"); return r.ok && Array.isArray(r.body.moderators) ? r.body.moderators : [];
}
// Nov 8 2026: the public mod log (GET /modlog, no key needed). null when Rem doesn't have it (404) or can't be reached.
// scope "all" (Nov 8 2026) also brings Circle mods' removals (each says scope, circle_id, circle_name and mod).
async function modlog(limit, scope) {
  const r = await call("GET", "/modlog?limit=" + Math.max(1, Math.min(200, +limit || 100)) + (scope === "all" || scope === "circle" ? "&scope=" + scope : "")); return r.ok && Array.isArray(r.body.items) ? r.body.items : null;
}
async function moderationFor(pk) {
  const me = pk || (Looscid.lcNostr && Looscid.lcNostr.state ? Looscid.lcNostr.state().pubkey : null); if (!isHex64(me || "")) return [];
  const r = await call("GET", "/moderation/" + encodeURIComponent(me)); return r.ok && Array.isArray(r.body.items) ? r.body.items : [];
}

/* --- Your lists on every device (Nov 8 2026, js/remlists.js) --- */
// Likes, ReDreams, pins, mutes and followed threads. A write is a signed kind 21987 event; reading them back is a signed
// kind 21988 event (POST /mine), so nobody but your own key can read the private ones. Each signed request works once.
// items: [[ref, data?], ...]. Answers { ok, status } (404 = a Rem without lists, so nothing changes on this device).
async function listWrite(list, action, items) {
  const tags = [["list", String(list)], ["action", action === "remove" ? "remove" : "add"]];
  (items || []).forEach(function (x) { tags.push(typeof x[1] === "string" ? ["i", String(x[0]), x[1]] : ["i", String(x[0])]); });
  try { const ev = await signAction({ kind: 21987, tags: tags.concat([PROTOCOL_TAG]) }); const r = await call("POST", "/list", ev); return { ok: r.ok, status: r.status, error: r.body && r.body.error }; }
  catch (e) { return { ok: false, err: e.message }; }
}
// Every list of yours on Rem, { likes: [{ ref, data, at }], pins: [...], ... }, or null (no key, offline or an older Rem).
async function listsMine() {
  try { const ev = await signAction({ kind: 21988, tags: [["action", "read-my-lists"], PROTOCOL_TAG] }); const r = await call("POST", "/mine", ev);
    return r.ok && r.body.lists && typeof r.body.lists === "object" ? r.body.lists : null; }
  catch (e) { return null; }
}

/* --- My data --- */
async function exportMine() {
  const st = Looscid.lcNostr && Looscid.lcNostr.state ? Looscid.lcNostr.state() : {};
  if (!isHex64(st.pubkey || "")) return { ok: false, say: "You need a LooscidID key first." };
  let after = 0, all = [];
  try {
    for (let i = 0; i < 50; i++) { const r = await call("GET", "/export?limit=500&author=" + st.pubkey + "&after=" + after); if (!r.ok) throw new Error("x"); all = all.concat(r.body.events || []); if (!r.body.next) break; after = r.body.next; }
  } catch (e) { return { ok: false, say: "Couldn't reach Rem. Try again in a bit." }; }
  const file = { protocol: "rem/1", exported_at: new Date().toISOString(), pubkey: st.pubkey, events: all };
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }));
  a.download = "looscid-dreams-" + new Date().toISOString().slice(0, 10) + ".json"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  return { ok: true, say: "Downloaded " + all.length + (all.length === 1 ? " signed event" : " signed events") + " from Rem." };
}
async function forgetMe() {
  try { const ev = await signAction({ kind: 21985, tags: [["action", "delete-my-data"], PROTOCOL_TAG] }); const r = await call("POST", "/forget", ev);
    if (r.ok && Looscid.lcLists) Looscid.lcLists.pause(); // Nov 8 2026: your lists stop syncing here, so they aren't sent right back
    return r.ok ? { ok: true, say: "Deleted. Rem no longer has your Dreams, blocks, reports, likes, ReDreams, pins, mutes, followed threads, problem reports or votes on them. Everything on this device stays, and your lists stop syncing here until you turn it back on." } : { ok: false, say: "Couldn't delete it. Try again in a bit." }; }
  catch (e) { return { ok: false, say: whyText(e) }; }
}
async function health() { try { const r = await call("GET", "/health"); return r.ok; } catch (e) { return false; } }


/* --- Settings, LooscidID, Connectionbase (Nov 7 2026, Carter: bridges live in LooscidID under "Connectionbase") ---
   Only the connections: Rem (the home of your public Dreams: Put your Dreams on Rem, from
   js/remsync.js), then the bridges Nostr, Mastodon (soon) and Bluesky (soon). Download my Dreams and Delete my Rem data
   are on the LooscidID page itself (LcRemData below, Carter Nov 7 6:10 PM).
   Same markup as the other LooscidID pages: h2.lid-label headings, lid-help text, lid-wide buttons, real checkboxes. */
function LcConnectionbase({ go }) {
  const lh = React.createElement, useState = React.useState, useEffect = React.useEffect;
  const [, setTick] = useState(0), [up, setUp] = useState(null), [msg, setMsg] = useState("");
  useEffect(function () { let live = true; health().then(function (ok) { if (live) setUp(ok); }); return function () { live = false; }; }, []);
  useEffect(function () { const f = function () { setTick(function (n) { return n + 1; }); }; window.addEventListener("looscid:bridges", f); return function () { window.removeEventListener("looscid:bridges", f); }; }, []);
  const say = function (t) { setMsg(t); if (Looscid.announce) Looscid.announce(t); };
  const st = Looscid.lcNostr && Looscid.lcNostr.state ? Looscid.lcNostr.state() : { canDream: false };
  return lh(React.Fragment, null,
    lh('h2', { className: "lid-label", id: "cb-server-h" }, "Rem"),
    lh('p', { className: "lid-help" }, "Rem is the Looscid protocol and its server: the home of your public Dreams. Each Dream with Audience Everyone is signed with your LooscidID key and saved on Rem, which checks the signature first. It's open source, so your Dreams can be downloaded and moved anytime."),
    lh('p', { className: "lid-help", role: "status" }, up === null ? "Checking Rem." : up ? "Rem is online." : "Couldn't reach Rem right now. Dreams wait on this device and go when it's back."),
    !st.canDream ? lh('p', { className: "lid-help" }, "Make a LooscidID key to Dream to Rem.") : null,
    Looscid.LcServerPanel ? lh(Looscid.LcServerPanel, { go: go }) : null,
    lh('h2', { className: "lid-label", id: "cb-bridges-h" }, "Bridges"),
    lh('p', { className: "lid-help" }, "Bridges also share your public Dreams to other networks. They're off unless you turn them on."),
    lh('fieldset', { className: "lc-fs", id: "cb-bridges" },
      lh('legend', { className: "lc-fs-l" }, "Share my Dreams to"),
      lh('div', { className: "lc-radios lc-radios-col" }, BRIDGES.map(function (b) {
        const on = !b.soon && bridgeOn(b.id);
        return lh('label', { key: b.id, className: "lc-radio" + (on ? " on" : "") },
          lh('input', { type: "checkbox", id: "cb-bridge-" + b.id, checked: on, disabled: !!b.soon,
            onChange: function () { setBridge(b.id, !on); say(b.label + (on ? " is off. New Dreams go to Rem only." : " is on. New public Dreams also go to " + b.label + ".")); } }),
          lh('span', null, b.soon ? b.label + ": Coming soon" : "Also share my Dreams to " + b.label));
      }))),
    BRIDGES.filter(function (b) { return !b.soon && b.note; }).map(function (b) { return lh('p', { key: b.id, className: "lid-help" }, b.label + ": " + b.note); }),
    msg ? lh('p', { className: "lid-help", role: "status" }, msg) : null);
}

/* --- On the LooscidID page itself: Download my Dreams, Delete my Rem data (Carter, Nov 7 6:10 PM) --- */
function LcRemData() {
  const lh = React.createElement, useState = React.useState;
  const [msg, setMsg] = useState(""), [busy, setBusy] = useState(false), [asking, setAsking] = useState(false);
  const say = function (t) { setMsg(t); if (Looscid.announce) Looscid.announce(t); };
  const run = function (p) { setBusy(true); p.then(function (r) { setBusy(false); say(r.say); }, function () { setBusy(false); say("Something went wrong. Try again."); }); };
  return lh('section', { className: "lid-panel lid-i27-card", "aria-labelledby": "lid-remdata-h" },
    lh('h2', { className: "lid-label", id: "lid-remdata-h" }, "Your Dreams on Rem"),
    lh('p', { className: "lid-help" }, "Download every Dream Rem has for your key, as the original signed file, or delete all of it."),
    lh('button', { type: "button", className: "btn bgb lid-wide", disabled: busy, onClick: function () { run(exportMine()); } }, "Download my Dreams"),
    asking ? lh(React.Fragment, null,
        lh('p', { className: "lid-help", id: "cb-forget-q" }, "Delete everything Rem has for your key? That's your Dreams, ReDreams, blocks and reports there, and your synced likes, pins, mutes and followed threads. Dreams on this device stay, and copies on Nostr relays aren't touched. This can't be undone."),
        lh('button', { type: "button", className: "btn bgb lid-wide", disabled: busy, onClick: function () { setAsking(false); run(forgetMe()); } }, "Yes, delete my Rem data"),
        lh('button', { type: "button", className: "btn bgb lid-wide", onClick: function () { setAsking(false); say("Nothing was deleted."); } }, "Cancel"))
      : lh('button', { type: "button", className: "btn bgb lid-wide", disabled: busy, onClick: function () { setAsking(true); } }, "Delete my Rem data"),
    // Nov 8 2026: after Delete my Rem data, your lists stop syncing on this device until you turn it back on here.
    Looscid.lcLists && Looscid.lcLists.paused() ? lh(React.Fragment, null,
      lh('p', { className: "lid-help" }, "Your likes, ReDreams, pins, mutes and followed threads aren't syncing on this device right now, so they stay only here."),
      lh('button', { type: "button", className: "btn bgb lid-wide", disabled: busy, onClick: function () { Looscid.lcLists.resume(); say("Your lists sync again. What's on this device is added to Rem, and changes show up on your other devices."); } }, "Sync my lists again")) : null,
    msg ? lh('p', { className: "lid-help", role: "status" }, msg) : null);
}

Looscid.lcNet = { API: API, PROTOCOL_TAG: PROTOCOL_TAG, BRIDGES: BRIDGES, bridges: bridges, bridgeOn: bridgeOn, setBridge: setBridge, markCrossposted: markCrossposted, wasCrossposted: wasCrossposted,
  ingest: ingest, flush: flush, feed: feed, userDreams: userDreams, listWrite: listWrite, listsMine: listsMine, REPORT_REASONS: REPORT_REASONS, report: report, block: block, unblockHandle: unblockHandle, blockedPk: blockedPk, moderate: moderate, modlog: modlog, moderationFor: moderationFor, moderators: moderators,
  exportMine: exportMine, forgetMe: forgetMe, health: health, LcConnectionbase: LcConnectionbase, LcRemData: LcRemData };
})(window.Looscid = window.Looscid || {});
