// rem: the Rem server on Cloudflare (https://rem.thebntlovver.workers.dev). Rem, the Looscid protocol, version 1 (Nov 7 2026). Spec: docs/protocol.md.
// Nov 7 2026 (Carter: "Merge Rem with the other protocol"): there is ONE Looscid protocol now, Rem. Rem v1 is the
// Nostr-style signed event below. Older Rem v0 objects ({rem:0, type, by, at, body, id, sig}, from the first Rem server)
// are still taken at POST /ingest: their own signature is checked exactly like the Rem v0 server does, then they are
// stored in the same tables. The original v0 object is kept as it was signed, so it can still be checked by anyone.
//
// How Looscid stores Dreams, in plain words:
//   * Looscid has its own open protocol. Every Dream is a small JSON "event" signed with the person's own
//     LooscidID key (secp256k1 Schnorr, the same kind of key Nostr uses). This server and its D1 database are
//     the home of Looscid Dreams.
//   * The server never trusts what it is sent. Every write must be signed by the person's own key, and the server
//     checks the signature itself before it stores anything. No passwords, no secrets, no age/school/location.
//   * Everything public can be exported as the original signed events (GET /export), so anyone can check them,
//     move them, or run their own Looscid server from the same data.
//   * Nostr is an optional bridge: when someone turns on "Also post to Nostr", the app also sends the same signed
//     Dream to Nostr relays. The server itself never posts anywhere.
//
// Endpoints (Rem v1):
//   GET  /health                         -> { ok, protocol, tables }
//   GET  /feed?limit=&before=&viewer=&sort= -> public Dreams (not replies), ranked by the "algo" below (sort=new: pure time).
//                                        Each Dream carries "ev", its original signed event, so apps can check it.
//   GET  /dreams/:pubkey?limit=&before=  -> one person's Dreams and replies, newest first
//   GET  /export?after=&limit=           -> the original signed events, oldest first, for backup or another server
//   POST /ingest   body: a signed Rem v1 event (kind 1 Dream, kind 1010 edit, kind 5 delete, kind 6/16 ReDream),
//                  or a signed Rem v0 object (type dream, edit, delete or redream)
//   POST /report   body: a signed kind 1984 event: ["e", <dream id>, <reason>], signed in the last 10 minutes.
//                  Reports are weighted (trusted reporters, below); a total of 3 hides the Dream.
//   POST /block    body: a signed kind 21984 event: ["p", <pubkey>], ["action", "block" | "unblock"], last 10 minutes
//   POST /forget   body: a signed kind 21985 event: ["action", "delete-my-data"], last 10 minutes -> erases everything
//                  this server holds for that key (Dreams, events, ReDreams, blocks, reports they made, the user row)
// Moderation (Nov 8 2026; MODS = the Looscid admins' keys, a plain-text Worker variable):
//   GET  /moderators                     -> { ok, moderators: [hex keys] }
//   GET  /moderation/:pubkey             -> that Dreamor's removed or report-hidden Dreams, with the reason
//   GET  /modlog?limit=&before=          -> the public mod log: every removal, newest first (Dream id, "admin", reason, when; never the words)
//   POST /moderate body: a signed kind 21986 event: ["e", <dream id>], ["action", "remove" | "restore"], ["reason", text]
// Your lists on every device (Nov 8 2026; table lists, made by the code itself):
//   POST /list     body: a signed kind 21987 event: ["list", name], ["action", "add" | "remove"], ["i", ref, data?] x 1-200,
//                  last 10 minutes, used once. Lists: likes, redreams (public: only counts come out, in /feed), and the
//                  private ones: liked_other, pins, muted_dreamors, muted_threads, not_interested, threads, dislikes.
//   POST /mine     body: a signed kind 21988 event: ["action", "read-my-lists"], last 10 minutes, used once -> every list of
//                  that key with each item's saved copy. This is the only way to read the private lists.
//   GET  /feed     each Dream also says "likes", and with ?viewer= whether that key "liked" or "redreamed" it.
// Looscid's own issue tracker (Nov 8 2026; tables issues, issue_votes, issue_replies, made by the code itself):
//   GET  /issues?status=&limit=&before=  -> public reports, newest first, with agree/disagree counts and mod replies
//   GET  /issues/:id                     -> one report
//   POST /issues          body: a signed kind 21989 event: ["type", "bug" | "idea"], ["title", text], ["app"]?, ["version"]?,
//                         content = what happened. Last 10 minutes, used once, 10 per key per day.
//   POST /issues/vote     body: a signed kind 21990 event: ["e", id], ["vote", "agree" | "disagree" | "none"], ["visibility"]?
//   POST /issues/moderate body: a signed kind 21991 event from a MODS key: ["e", id], ["status", s]?, content = reply/reason
// CORS: only https://looscid.github.io (and the test preview https://looscid-preview.sites.tab.bot) get the allow headers.

import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

// The live app, plus the test preview of the d1-feed branch (Nov 7 2026, so Carter can try it on his iPhone).
const ORIGINS = ["https://looscid.github.io", "https://looscid-preview.sites.tab.bot"];
const PROTOCOL = "rem/1";        // Rem, the Looscid protocol, version 1 (docs/protocol.md). Rem v0 objects are still taken.
const MAX_TEXT = 20000;
const MAX_BODY = 65536;          // relays take up to 64 KB, so do we
const FRESH_SEC = 600;           // reports and blocks must be signed within the last 10 minutes
const HIDE_AT = 3;               // reports with a total weight of 3 or more -> the Dream is hidden from the feed
// Trusted reporters (Carter, Nov 7 2026), in plain words: a report from a key Rem has known for at least 7 days AND that
// has at least 3 Dreams on Rem counts as 1. Any other report counts as 0.25. A Dream is hidden when its reports add up
// to 3 or more. So 3 brand-new keys can't hide a Dream (3 x 0.25 = 0.75); it takes 3 trusted people, or 12 new keys.
// "Known for 7 days" uses the time Rem FIRST SAW the key (users.created_at, the server's own clock), not a date inside
// a signed event, because anyone can sign an event with an old date.
const TRUST_AGE_MS = 7 * 86400000, TRUST_DREAMS = 3, WEIGHT_TRUSTED = 1, WEIGHT_NEW = 0.25;
const LIMITS = {                 // simple rate limits: [max actions, per this many seconds]
  ingest: [30, 600], report: [20, 3600], block: [60, 3600], forget: [5, 3600], moderate: [120, 3600], ip: [200, 600],
  list: [300, 3600], mine: [240, 3600], // Nov 8 2026: your lists (POST /list, POST /mine)
  issues: [20, 3600], issue: [10, 86400], issue_vote: [300, 3600], issue_mod: [200, 3600], // Nov 8 2026: issue tracker (issue = reports per key per day)
};

/* ---------- small helpers ---------- */
function cors(req) {
  const h = { "Vary": "Origin" };
  const o = req.headers.get("Origin");
  if (ORIGINS.includes(o)) {
    h["Access-Control-Allow-Origin"] = o;
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}
function json(req, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors(req) },
  });
}
const isHex = (s, n) => typeof s === "string" && s.length === n && /^[0-9a-f]+$/.test(s);
const now = () => Math.floor(Date.now() / 1000);
const tag = (ev, name) => ev.tags.find((t) => Array.isArray(t) && t[0] === name);
const tagsOf = (ev, name) => ev.tags.filter((t) => Array.isArray(t) && t[0] === name);
const KEEP_TAGS = ["e", "p", "q", "t", "content-warning", "client", "looscid"];

/* ---------- Nostr signature check (NIP-01) ----------
   The event id is the sha256 of [0, pubkey, created_at, kind, tags, content]; the signature is a BIP-340 Schnorr
   signature of that id by the pubkey. Both are checked here, with the audited @noble/curves library. */
function verifyEvent(ev) {
  try {
    if (!ev || typeof ev !== "object") return false;
    if (!isHex(ev.id, 64) || !isHex(ev.pubkey, 64) || !isHex(ev.sig, 128)) return false;
    if (!Number.isInteger(ev.kind) || !Number.isInteger(ev.created_at) || typeof ev.content !== "string") return false;
    if (!Array.isArray(ev.tags) || !ev.tags.every((t) => Array.isArray(t) && t.every((x) => typeof x === "string"))) return false;
    const ser = JSON.stringify([0, ev.pubkey, ev.created_at, ev.kind, ev.tags, ev.content]);
    const id = bytesToHex(sha256(new TextEncoder().encode(ser)));
    if (id !== ev.id) return false;
    return schnorr.verify(ev.sig, ev.id, ev.pubkey);
  } catch (e) { return false; }
}

/* ---------- Rem v0 objects (the first Rem server, server/server/rem.mjs + public/js/rem-core.js) ----------
   A v0 object is { rem: 0, type, by, at (ms), body, id, sig }. Its id is the sha256 of the canonical JSON of
   [0, by, at, type, body] (object keys sorted at every depth, no spaces), and sig is a BIP-340 Schnorr signature of
   that id by "by". This is the same check as verifyObject() in rem-core.js, line for line. */
function canonical(v) {
  if (v === null || typeof v !== "object") {
    if (typeof v === "number" && !Number.isFinite(v)) throw new Error("Numbers must be finite");
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  return "{" + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ":" + canonical(v[k])).join(",") + "}";
}
function verifyRemV0(o) {
  try {
    if (!o || typeof o !== "object" || !isHex(o.by, 64) || !isHex(o.id, 64) || !isHex(o.sig, 128)) return false;
    const id = bytesToHex(sha256(new TextEncoder().encode(canonical([0, o.by, o.at, o.type, o.body]))));
    if (id !== o.id) return false;
    return schnorr.verify(o.sig, o.id, o.by);
  } catch (e) { return false; }
}
const V0_KINDS = { dream: 1, edit: 1010, delete: 5, redream: 6 };
// Turns a checked v0 object into the same shape as a v1 event, so one ingest() stores both. The original object rides
// along in _v0 (that's what gets kept and exported), and _ms keeps the exact v0 time in milliseconds.
function fromRemV0(o) {
  if (!Number.isInteger(o.at) || o.at < 0) return { error: "Rem v0 object has no valid time (at)" };
  const b = o.body && typeof o.body === "object" && !Array.isArray(o.body) ? o.body : null;
  if (!b) return { error: "Rem v0 object has no body" };
  const kind = V0_KINDS[o.type];
  if (!kind) return { error: "Rem v0 type \"" + String(o.type).slice(0, 30) + "\" isn't taken here (only dream, edit, delete, redream)" };
  const tags = [["looscid", "0"]];
  let content = "";
  if (o.type === "dream") {
    if (b.audience && b.audience !== "public") return { error: "only public Rem v0 Dreams are taken here" };
    content = typeof b.text === "string" ? b.text : "";
    if (isHex(b.reply_to, 64)) tags.push(["e", b.reply_to, "", "reply"]);
    if (isHex(b.quote, 64)) tags.push(["q", b.quote]);
    if (typeof b.cw === "string" && b.cw.trim()) tags.push(["content-warning", b.cw.slice(0, 200)]);
    if (Array.isArray(b.tags)) for (const t of b.tags.slice(0, 10)) if (typeof t === "string" && t) tags.push(["t", t.slice(0, 40)]);
  } else {
    if (!isHex(b.of, 64)) return { error: "Rem v0 " + o.type + " needs body.of (a 64-character id)" };
    tags.push(["e", b.of]);
    if (o.type === "edit") content = typeof b.text === "string" ? b.text : "";
  }
  return { ev: { id: o.id, pubkey: o.by, created_at: Math.floor(o.at / 1000), kind, tags, content, _ms: o.at, _v0: o } };
}

/* ---------- rate limit: one counter row per key per time window, in D1 ---------- */
async function allowed(env, key, [max, per]) {
  const t = now(), win = t - (t % per);
  const row = await env.DB.prepare(
    "INSERT INTO rate (k, window_start, n) VALUES (?1, ?2, 1) " +
    "ON CONFLICT(k) DO UPDATE SET n = CASE WHEN window_start = ?2 THEN n + 1 ELSE 1 END, window_start = ?2 RETURNING n"
  ).bind(key, win).first();
  return !row || row.n <= max;
}
async function ipKey(req) {
  const ip = req.headers.get("CF-Connecting-IP") || "?";
  const day = new Date().toISOString().slice(0, 10); // salted by the day so nothing long-lived identifies anyone
  return "ip:" + bytesToHex(sha256(new TextEncoder().encode(day + "|" + ip))).slice(0, 16);
}

/* ---------- storing events ---------- */
async function upsertUser(env, pk, t) {
  await env.DB.prepare("INSERT INTO users (id, created_at, updated_at) VALUES (?1, ?2, ?2) ON CONFLICT(id) DO UPDATE SET updated_at = ?2")
    .bind(pk, t).run();
}
// The original signed event is kept, so it can be exported and checked by anyone later.
async function keep(env, ev) {
  await env.DB.prepare("INSERT INTO events (id, pubkey, kind, created_at, json) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT(id) DO NOTHING")
    .bind(ev.id, ev.pubkey, ev.kind, ev.created_at, JSON.stringify(ev._v0 || ev)).run(); // a v0 object is kept exactly as signed
}
// Returns { ok, what } or { ok:false, error }.
async function ingest(env, ev) {
  const t = Date.now(), ms = ev._ms ?? ev.created_at * 1000; // ms: the event's own time, in milliseconds
  if (ev.created_at > now() + 600) return { ok: false, error: "from the future" };
  if (ev.kind === 1) {
    const isLooscid = tagsOf(ev, "looscid").length || tagsOf(ev, "t").some((x) => String(x[1]).toLowerCase() === "looscid");
    if (!isLooscid) return { ok: false, error: "not a Looscid Dream (needs the tag [\"looscid\", \"1\"])" };
    if (!ev.content.trim()) return { ok: false, error: "empty" };
    const es = tagsOf(ev, "e").filter((x) => isHex(x[1], 64));
    const reply = es.find((x) => x[3] === "reply") || es.find((x) => x[3] === "root") || (es.length ? es[es.length - 1] : null);
    const q = tag(ev, "q"), cw = tag(ev, "content-warning");
    const tags = ev.tags.filter((x) => KEEP_TAGS.includes(x[0])).slice(0, 50);
    await upsertUser(env, ev.pubkey, t);
    await env.DB.prepare(
      "INSERT INTO dreams (id, user_id, text, audience, cw, reply_to, quote_of, nostr_id, created_at, updated_at, tags) " +
      "VALUES (?1, ?2, ?3, 'public', ?4, ?5, ?6, ?1, ?7, ?8, ?9) ON CONFLICT(id) DO NOTHING"
    ).bind(ev.id, ev.pubkey, ev.content.slice(0, MAX_TEXT), cw ? (cw[1] || "Content warning") : null,
      reply ? reply[1] : null, q && isHex(q[1], 64) ? q[1] : null, ms, ms, JSON.stringify(tags)).run();
    await keep(env, ev);
    return { ok: true, what: "dream", id: ev.id, rem: ev._v0 ? 0 : 1 };
  }
  if (ev.kind === 1010) { // an edit: only the Dream's own author can change its text
    const e = tagsOf(ev, "e").find((x) => isHex(x[1], 64));
    if (!e) return { ok: false, error: "edit has no e tag" };
    const r = await env.DB.prepare("UPDATE dreams SET text = ?1, updated_at = ?2 WHERE id = ?3 AND user_id = ?4 AND deleted_at IS NULL AND (updated_at IS NULL OR updated_at <= ?2)")
      .bind(ev.content.slice(0, MAX_TEXT), ms, e[1], ev.pubkey).run();
    if (r.meta.changes) await keep(env, ev);
    return { ok: true, what: "edit", changed: r.meta.changes };
  }
  if (ev.kind === 5) { // a deletion: only the author's own Dreams. The text and the original event are really erased.
    const ids = tagsOf(ev, "e").map((x) => x[1]).filter((x) => isHex(x, 64)).slice(0, 100);
    let changed = 0;
    for (const id of ids) {
      const r = await env.DB.prepare("UPDATE dreams SET deleted_at = ?1, text = '', tags = '[]' WHERE id = ?2 AND user_id = ?3 AND deleted_at IS NULL").bind(t, id, ev.pubkey).run();
      if (r.meta.changes) {
        changed += r.meta.changes;
        // instr() instead of LIKE: D1 caps LIKE patterns at 50 bytes, and an id is 64
        await env.DB.prepare("DELETE FROM events WHERE pubkey = ?1 AND (id = ?2 OR (kind = 1010 AND instr(json, ?3) > 0))").bind(ev.pubkey, id, '"' + id + '"').run();
      }
    }
    if (changed) await keep(env, ev);
    return { ok: true, what: "delete", changed };
  }
  if (ev.kind === 6 || ev.kind === 16) { // a ReDream: counted only when it points at a Dream we already index
    const e = tagsOf(ev, "e").find((x) => isHex(x[1], 64));
    if (!e) return { ok: false, error: "redream has no e tag" };
    const d = await env.DB.prepare("SELECT id FROM dreams WHERE id = ?1").bind(e[1]).first();
    if (!d) return { ok: false, error: "that Dream isn't in the index" };
    await upsertUser(env, ev.pubkey, t);
    await env.DB.prepare("INSERT INTO reposts (id, dream_id, user_id, created_at) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(id) DO NOTHING")
      .bind(ev.id, e[1], ev.pubkey, ms).run();
    await keep(env, ev);
    return { ok: true, what: "redream" };
  }
  return { ok: false, error: "kind not accepted" };
}

/* ---------- the feed "algo", in plain words ----------
   Newer Dreams come first. Then each Dream gets a small boost for conversation:
     every reply  = the Dream counts as if it were posted 20 minutes later,
     every ReDream or Quote = as if posted 40 minutes later,
   and the total boost is capped at 6 hours, so nothing old can sit on top forever.
   Hidden (reported) and deleted Dreams are left out, and so is anyone the viewer blocked.
   score = created_at (ms) + min(6 h, replies*20 min + (redreams+quotes)*40 min)                              */
const FEED_SQL = `
SELECT d.id, d.user_id AS pk, d.text, d.cw, d.quote_of, d.created_at, d.updated_at, d.tags,
  (SELECT e.json FROM events e WHERE e.id = d.id) AS ev,
  (SELECT COUNT(*) FROM dreams r WHERE r.reply_to = d.id AND r.deleted_at IS NULL AND r.status = 'ok') AS replies,
  (SELECT COUNT(*) FROM reposts p WHERE p.dream_id = d.id) AS redreams,
  (SELECT COUNT(*) FROM dreams q WHERE q.quote_of = d.id AND q.deleted_at IS NULL AND q.status = 'ok') AS quotes,
  (SELECT COUNT(*) FROM lists l WHERE l.list = 'likes' AND l.ref = d.id) AS likes,
  (?2 IS NOT NULL AND EXISTS (SELECT 1 FROM lists l WHERE l.list = 'likes' AND l.ref = d.id AND l.user_id = ?2)) AS you_liked,
  (?2 IS NOT NULL AND EXISTS (SELECT 1 FROM reposts p WHERE p.dream_id = d.id AND p.user_id = ?2)) AS you_redreamed
FROM dreams d
WHERE d.reply_to IS NULL AND d.deleted_at IS NULL AND d.status = 'ok'
  AND d.created_at > ?1 - 30 * 86400000
  AND (?2 IS NULL OR d.user_id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?2))
ORDER BY d.created_at DESC LIMIT 500`;
const BOOST_CAP = 6 * 3600000, REPLY_BOOST = 20 * 60000, SHARE_BOOST = 40 * 60000;
// The original signed event (or Rem v0 object), so an app can check the signature itself ("Verified").
function parseEv(j) { if (!j) return undefined; try { return JSON.parse(j); } catch (e) { return undefined; } }
function out(r) {
  let tags = []; try { tags = JSON.parse(r.tags || "[]"); } catch (e) {}
  return { id: r.id, nid: r.id, pk: r.pk, text: r.text, created: r.created_at, cw: r.cw || undefined, tags,
    reply_to: r.reply_to || undefined, quote_of: r.quote_of || undefined,
    replies: r.replies || 0, redreams: r.redreams || 0, quotes: r.quotes || 0, score: r.score, ev: parseEv(r.ev),
    // Nov 8 2026: likes (from lists), and with ?viewer= whether that key liked or ReDreamed it (both are public)
    likes: r.likes || 0, liked: r.you_liked ? true : undefined, redreamed: r.you_redreamed ? true : undefined };
}

async function feed(req, env, url) {
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "30", 10) || 30));
  const before = parseInt(url.searchParams.get("before") || "", 10);
  const viewer = url.searchParams.get("viewer");
  const newest = url.searchParams.get("sort") === "new"; // ?sort=new: pure time, no boost ("Newest" in the app)
  await listsTable(env);
  const rows = (await env.DB.prepare(FEED_SQL).bind(Date.now(), isHex(viewer, 64) ? viewer : null).all()).results;
  for (const r of rows) r.score = newest ? r.created_at : r.created_at + Math.min(BOOST_CAP, r.replies * REPLY_BOOST + (r.redreams + r.quotes) * SHARE_BOOST);
  rows.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
  const page = rows.filter((r) => !Number.isFinite(before) || r.score < before).slice(0, limit);
  const next = page.length === limit ? page[page.length - 1].score : null;
  return json(req, { ok: true, algo: newest ? "newest first" : "newest first, small boost for replies/redreams/quotes (max 6h)", dreams: page.map(out), next });
}

async function userDreams(req, env, url, pk) {
  if (!isHex(pk, 64)) return json(req, { ok: false, error: "use the 64-character hex public key" }, 400);
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "50", 10) || 50));
  const before = parseInt(url.searchParams.get("before") || "", 10);
  const rows = (await env.DB.prepare(
    "SELECT id, user_id AS pk, text, cw, reply_to, quote_of, created_at, updated_at, tags, (SELECT e.json FROM events e WHERE e.id = dreams.id) AS ev FROM dreams " +
    "WHERE user_id = ?1 AND deleted_at IS NULL AND status = 'ok' AND created_at < ?2 ORDER BY created_at DESC LIMIT ?3"
  ).bind(pk, Number.isFinite(before) ? before : 9e15, limit).all()).results;
  const next = rows.length === limit ? rows[rows.length - 1].created_at : null;
  return json(req, { ok: true, dreams: rows.map(out), next });
}

/* ---------- export: the original signed events, oldest first ----------
   Reports and blocks are not exported (they are private moderation data), and neither are hidden or deleted Dreams. */
async function exportEvents(req, env, url) {
  const after = parseInt(url.searchParams.get("after") || "0", 10) || 0;
  const limit = Math.max(1, Math.min(500, parseInt(url.searchParams.get("limit") || "200", 10) || 200));
  const author = (url.searchParams.get("author") || "").toLowerCase(); // ?author=<pubkey> = one person's own events
  const rows = (await env.DB.prepare(
    "SELECT seq, json FROM events WHERE seq > ?1 AND (?3 IS NULL OR pubkey = ?3) AND id NOT IN (SELECT id FROM dreams WHERE status <> 'ok' OR deleted_at IS NOT NULL) ORDER BY seq LIMIT ?2"
  ).bind(after, limit, isHex(author, 64) ? author : null).all()).results;
  return json(req, { ok: true, protocol: PROTOCOL, events: rows.map((r) => JSON.parse(r.json)), next: rows.length === limit ? rows[rows.length - 1].seq : null });
}

/* ---------- reports and blocks: signed by the person doing it ---------- */
async function readEvent(req) {
  const len = parseInt(req.headers.get("Content-Length") || "0", 10);
  if (len > MAX_BODY) return { error: "too big" };
  const raw = await req.text();
  if (raw.length > MAX_BODY) return { error: "too big" };
  let ev; try { ev = JSON.parse(raw); } catch (e) { return { error: "not JSON" }; }
  if (ev && ev.event) ev = ev.event; // accepts {event: {...}} too
  if (ev && typeof ev === "object" && !Array.isArray(ev) && "rem" in ev) { // a Rem v0 object
    if (ev.rem !== 0) return { error: "unknown Rem version (this server takes Rem v1 events and Rem v0 objects)" };
    if (!verifyRemV0(ev)) return { error: "bad signature" };
    const n = fromRemV0(ev);
    return n.error ? { error: n.error } : { ev: n.ev };
  }
  if (!verifyEvent(ev)) return { error: "bad signature" };
  return { ev };
}
const fresh = (ev) => Math.abs(now() - ev.created_at) <= FRESH_SEC;

async function report(req, env, ev) {
  if (ev.kind !== 1984 || !fresh(ev)) return json(req, { ok: false, error: "needs a fresh kind 1984 report event" }, 400);
  const e = tagsOf(ev, "e").find((x) => isHex(x[1], 64));
  if (!e) return json(req, { ok: false, error: "no Dream id (e tag)" }, 400);
  const d = await env.DB.prepare("SELECT id, user_id FROM dreams WHERE id = ?1").bind(e[1]).first();
  if (!d) return json(req, { ok: false, error: "that Dream isn't in the index" }, 404);
  if (d.user_id === ev.pubkey) return json(req, { ok: false, error: "you can't report your own Dream" }, 400);
  const reason = String(e[2] || ev.content || "other").slice(0, 200);
  await env.DB.prepare("INSERT INTO reports (id, dream_id, reporter_id, reason, created_at) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT DO NOTHING")
    .bind(ev.id, d.id, ev.pubkey, reason, Date.now()).run();
  // Add up the weight of every different reporter of this Dream (see "Trusted reporters" at the top).
  const rows = (await env.DB.prepare(
    "SELECT r.reporter_id, u.created_at AS first_seen, (SELECT COUNT(*) FROM dreams x WHERE x.user_id = r.reporter_id AND x.deleted_at IS NULL AND x.status = 'ok') AS dreams " +
    "FROM reports r LEFT JOIN users u ON u.id = r.reporter_id WHERE r.dream_id = ?1 GROUP BY r.reporter_id"
  ).bind(d.id).all()).results;
  const weightOf = (r) => (r.first_seen != null && Date.now() - r.first_seen >= TRUST_AGE_MS && r.dreams >= TRUST_DREAMS ? WEIGHT_TRUSTED : WEIGHT_NEW);
  const total = rows.reduce((n, r) => n + weightOf(r), 0);
  const mine = rows.find((r) => r.reporter_id === ev.pubkey);
  let hidden = false;
  if (total >= HIDE_AT) { await env.DB.prepare("UPDATE dreams SET status = 'hidden' WHERE id = ?1").bind(d.id).run(); hidden = true; }
  return json(req, { ok: true, reported: d.id, hidden, weight: mine ? weightOf(mine) : WEIGHT_NEW });
}

async function block(req, env, ev) {
  if (ev.kind !== 21984 || !fresh(ev)) return json(req, { ok: false, error: "needs a fresh kind 21984 block event" }, 400);
  const p = tagsOf(ev, "p").find((x) => isHex(x[1], 64));
  if (!p || p[1] === ev.pubkey) return json(req, { ok: false, error: "no person to block (p tag)" }, 400);
  const action = (tag(ev, "action") || [])[1] === "unblock" ? "unblock" : "block";
  if (action === "unblock") await env.DB.prepare("DELETE FROM blocks WHERE blocker_id = ?1 AND blocked_id = ?2").bind(ev.pubkey, p[1]).run();
  else await env.DB.prepare("INSERT INTO blocks (blocker_id, blocked_id, created_at) VALUES (?1, ?2, ?3) ON CONFLICT DO NOTHING").bind(ev.pubkey, p[1], Date.now()).run();
  return json(req, { ok: true, [action === "block" ? "blocked" : "unblocked"]: p[1] });
}

async function forget(req, env, ev) {
  if (ev.kind !== 21985 || !fresh(ev) || (tag(ev, "action") || [])[1] !== "delete-my-data") return json(req, { ok: false, error: "needs a fresh kind 21985 event with [\"action\", \"delete-my-data\"]" }, 400);
  const pk = ev.pubkey, B = (sql) => env.DB.prepare(sql).bind(pk);
  await modTable(env); // so the cleanup line below works on a database that never had a removal
  await circleModTable(env);
  await listsTable(env);
  await issuesTable(env);
  await env.DB.batch([
    B("DELETE FROM pins WHERE user_id = ?1"), B("DELETE FROM alerts WHERE user_id = ?1"),
    B("DELETE FROM reposts WHERE user_id = ?1"), B("DELETE FROM reports WHERE reporter_id = ?1"),
    B("DELETE FROM blocks WHERE blocker_id = ?1"), B("DELETE FROM events WHERE pubkey = ?1"),
    B("DELETE FROM reports WHERE dream_id IN (SELECT id FROM dreams WHERE user_id = ?1)"),
    B("DELETE FROM moderations WHERE dream_id IN (SELECT id FROM dreams WHERE user_id = ?1)"),
    B("DELETE FROM circle_moderations WHERE mod_id = ?1"), B("DELETE FROM lists WHERE user_id = ?1"),
    B("DELETE FROM reposts WHERE dream_id IN (SELECT id FROM dreams WHERE user_id = ?1)"),
    B("DELETE FROM pins WHERE dream_id IN (SELECT id FROM dreams WHERE user_id = ?1)"),
    B("DELETE FROM issue_votes WHERE user_id = ?1"), B("DELETE FROM issue_votes WHERE issue_id IN (SELECT id FROM issues WHERE user_id = ?1)"),
    B("DELETE FROM issue_replies WHERE issue_id IN (SELECT id FROM issues WHERE user_id = ?1)"), B("DELETE FROM issue_replies WHERE mod_id = ?1"),
    B("DELETE FROM issues WHERE user_id = ?1"),
    B("DELETE FROM dreams WHERE user_id = ?1"), B("DELETE FROM users WHERE id = ?1"),
  ]);
  return json(req, { ok: true, forgot: pk });
}

/* ---------- moderation (Nov 8 2026) ---------- */
// Looscid admins remove a Dream with a reason, and the Dreamor who made it sees that reason (app: js/modreasons.js).
// MODS is a plain-text Worker variable: comma-separated hex public keys of Looscid admins. The moderations table is
// made by the code itself (CREATE TABLE IF NOT EXISTS), so an older database needs no console step.
const mods = (env) => String(env.MODS || "").split(",").map((s) => s.trim().toLowerCase()).filter((s) => /^[0-9a-f]{64}$/.test(s));
async function modTable(env) {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS moderations (dream_id TEXT PRIMARY KEY, mod_id TEXT NOT NULL, action TEXT NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL)").run();
}
// POST /moderate  body: a signed kind 21986 event: ["e", <Dream id>], ["action", "remove" | "restore"], ["reason", text]; fresh (10 min)
async function moderate(req, env, ev) {
  if (ev.kind !== 21986 || !fresh(ev)) return json(req, { ok: false, error: "needs a fresh kind 21986 moderation event" }, 400);
  if ((tag(ev, "scope") || [])[1] === "circle") return await circleModerate(req, env, ev);
  if (!mods(env).includes(ev.pubkey)) return json(req, { ok: false, error: "not a Looscid moderator" }, 403);
  const e = tag(ev, "e"), action = (tag(ev, "action") || [])[1] === "restore" ? "restore" : "remove";
  const reason = String(((tag(ev, "reason") || [])[1]) || ev.content || "").replace(/\s+/g, " ").trim();
  if (!e || !/^[0-9a-f]{64}$/.test(e[1] || "")) return json(req, { ok: false, error: "no Dream (e tag)" }, 400);
  if (action === "remove" && (!reason || reason.length >= 1024)) return json(req, { ok: false, error: "a reason (1-1023 characters) is required" }, 400);
  const d = await env.DB.prepare("SELECT id FROM dreams WHERE id = ?1").bind(e[1]).first();
  if (!d) return json(req, { ok: false, error: "no such Dream" }, 404);
  await modTable(env);
  if (action === "restore") {
    await env.DB.batch([env.DB.prepare("DELETE FROM moderations WHERE dream_id = ?1").bind(d.id), env.DB.prepare("UPDATE dreams SET status = 'ok' WHERE id = ?1").bind(d.id)]);
  } else {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO moderations (dream_id, mod_id, action, reason, created_at) VALUES (?1, ?2, 'remove', ?3, ?4) ON CONFLICT(dream_id) DO UPDATE SET mod_id = ?2, reason = ?3, created_at = ?4").bind(d.id, ev.pubkey, reason, Date.now()),
      env.DB.prepare("UPDATE dreams SET status = 'hidden' WHERE id = ?1").bind(d.id),
    ]);
  }
  return json(req, { ok: true, [action === "remove" ? "removed" : "restored"]: d.id });
}
// GET /moderation/<pubkey>: that Dreamor's removed or report-hidden Dreams, with the reason, so the author sees why.
// Circle mod removals (Nov 8 2026, Carter: "every single change should be everywhere"). Circles live on their owner's
// devices, so Rem can't check who runs one. A Circle removal is a signed claim by the remover's key about the remover's own
// Circle: the Circle is (mod key, circle id), so nobody can log a removal in someone else's Circle. It never hides a Dream
// on Rem (only Looscid admins in MODS do that); it's kept so the remover's other devices and the public log see it.
// ["scope","circle"], ["circle", id], ["circle_name", name], ["e", dream ref: a Rem id or the app's own id], ["action",
// "remove"|"restore"], ["reason", why]. Restore takes the row out. The table is made here, the first time it's needed.
var CIRCLE_REF = /^[A-Za-z0-9_.:-]{1,64}$/;
async function circleModTable(env) {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS circle_moderations (mod_id TEXT NOT NULL, circle_id TEXT NOT NULL, dream_ref TEXT NOT NULL, circle_name TEXT NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (mod_id, circle_id, dream_ref))").run();
}
async function circleModerate(req, env, ev) {
  const e = tag(ev, "e"), action = (tag(ev, "action") || [])[1] === "restore" ? "restore" : "remove";
  const circle = String((tag(ev, "circle") || [])[1] || ""), name = String((tag(ev, "circle_name") || [])[1] || "").replace(/\s+/g, " ").trim();
  const reason = String((tag(ev, "reason") || [])[1] || ev.content || "").replace(/\s+/g, " ").trim();
  const ref = e ? String(e[1] || "") : "";
  if (!CIRCLE_REF.test(ref)) return json(req, { ok: false, error: "no Dream (e tag)" }, 400);
  if (!CIRCLE_REF.test(circle)) return json(req, { ok: false, error: "no Circle (circle tag)" }, 400);
  await circleModTable(env);
  if (action === "restore") {
    await env.DB.prepare("DELETE FROM circle_moderations WHERE mod_id = ?1 AND circle_id = ?2 AND dream_ref = ?3").bind(ev.pubkey, circle, ref).run();
    return json(req, { ok: true, restored: ref, scope: "circle", circle_id: circle });
  }
  if (!name || name.length > 100) return json(req, { ok: false, error: "a Circle name (1-100 characters) is required" }, 400);
  if (!reason || reason.length >= 1024) return json(req, { ok: false, error: "a reason (1-1023 characters) is required" }, 400);
  await env.DB.prepare("INSERT INTO circle_moderations (mod_id, circle_id, dream_ref, circle_name, reason, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT(mod_id, circle_id, dream_ref) DO UPDATE SET circle_name = ?4, reason = ?5, created_at = ?6").bind(ev.pubkey, circle, ref, name, reason, Date.now()).run();
  return json(req, { ok: true, removed: ref, scope: "circle", circle_id: circle });
}
async function moderationOf(req, env, pk) {
  await modTable(env);
  const r = await env.DB.prepare("SELECT d.id AS dream_id, substr(d.text, 1, 80) AS text, m.reason, m.created_at AS at FROM dreams d LEFT JOIN moderations m ON m.dream_id = d.id WHERE d.user_id = ?1 AND d.status = 'hidden' AND d.deleted_at IS NULL ORDER BY d.created_at DESC LIMIT 100").bind(pk).all();
  return json(req, { ok: true, items: r.results.map((x) => x.reason ? { dream_id: x.dream_id, status: "removed", reason: x.reason, at: x.at, text: x.text } : { dream_id: x.dream_id, status: "hidden", reason: "Hidden after reports while it's checked", text: x.text }) });
}
// GET /modlog: Looscid's public mod log (Nov 8 2026, Carter: "my removal reasons are public with a public mod log,
// moderator or admin"). Every removal, newest first: the Dream's id (never its words), who removed it ("admin": the
// keys in MODS are Looscid admins), the reason and when. Anyone can read it, no key needed. ?limit= (1-200, 100 by
// default) and ?before=<ms> page through it. A Dream put back (restore) leaves the log.
async function modlog(req, env, url) {
  // Nov 8 2026: ?scope=circle (Circle mods' removals) or ?scope=all (both, newest first); ?circle=<id> and ?mod=<key>
  // narrow the Circle ones. Each of those items says scope, circle_id, circle_name and mod (the remover's key). With no
  // scope and no circle, the answer is exactly what it was before: Looscid admins' removals only.
  const scope = url.searchParams.get("scope") || (url.searchParams.get("circle") || url.searchParams.get("mod") ? "circle" : "");
  if (scope === "circle" || scope === "all") return await modlogScoped(req, env, url, scope);
  await modTable(env);
  const limit = Math.max(1, Math.min(200, parseInt(url.searchParams.get("limit") || "100", 10) || 100));
  const before = parseInt(url.searchParams.get("before") || "", 10);
  const rows = (await env.DB.prepare("SELECT dream_id, reason, created_at FROM moderations WHERE action = 'remove' AND created_at < ?1 ORDER BY created_at DESC LIMIT ?2").bind(Number.isFinite(before) ? before : 9e15, limit).all()).results;
  return json(req, { ok: true, items: rows.map((r) => ({ dream_id: r.dream_id, action: "remove", by: "admin", reason: r.reason, at: r.created_at })), next: rows.length === limit ? rows[rows.length - 1].created_at : null });
}
async function modlogScoped(req, env, url, scope) {
  await modTable(env);
  await circleModTable(env);
  const limit = Math.max(1, Math.min(200, parseInt(url.searchParams.get("limit") || "100", 10) || 100));
  const b = parseInt(url.searchParams.get("before") || "", 10), before = Number.isFinite(b) ? b : 9e15;
  const circle = url.searchParams.get("circle"), mod = String(url.searchParams.get("mod") || "").toLowerCase();
  let sql = "SELECT mod_id, circle_id, dream_ref, circle_name, reason, created_at FROM circle_moderations WHERE created_at < ?1", args = [before];
  if (circle) { sql += " AND circle_id = ?" + (args.length + 1); args.push(circle); }
  if (/^[0-9a-f]{64}$/.test(mod)) { sql += " AND mod_id = ?" + (args.length + 1); args.push(mod); }
  sql += " ORDER BY created_at DESC LIMIT ?" + (args.length + 1); args.push(limit);
  const cs = (await env.DB.prepare(sql).bind(...args).all()).results.map((r) => ({ dream_id: r.dream_ref, action: "remove", by: "moderator", scope: "circle", circle_id: r.circle_id, circle_name: r.circle_name, mod: r.mod_id, reason: r.reason, at: r.created_at }));
  let items = cs;
  if (scope === "all" && !circle && !mod) {
    const ss = (await env.DB.prepare("SELECT dream_id, reason, created_at FROM moderations WHERE action = 'remove' AND created_at < ?1 ORDER BY created_at DESC LIMIT ?2").bind(before, limit).all()).results.map((r) => ({ dream_id: r.dream_id, action: "remove", by: "admin", scope: "site", reason: r.reason, at: r.created_at }));
    items = ss.concat(cs).sort((x, y) => y.at - x.at).slice(0, limit);
  }
  return json(req, { ok: true, items, next: items.length === limit ? items[items.length - 1].at : null });
}

/* ---------- router ---------- */
// "return await" (not just "return") so an error inside a handler is caught below and never leaks.
/* ---------- your lists on every device (Nov 8 2026) ---------- */
// Carter: "every single change should be everywhere". Likes, ReDreams, pinned Dreams, mutes ("Not interested" too) and
// threads you follow follow your LooscidID key to every device. One table, lists: one row per key, list and item.
//   Public: that a key liked or ReDreamed a Dream. Only counts come out (GET /feed "likes", "redreams"), and a ReDream
//   of a Dream on Rem is also a row in reposts, so the old ReDream count and the feed boost see it.
//   Private: pins, liked_other (liked searches and other non-Dream things), muted_dreamors, muted_threads,
//   not_interested, threads, dislikes (Nov 8 2026: only you ever see what you disliked), and the small copy ("data")
//   kept with every item. They only come back through POST /mine:
//   a read signed by the same key in the last 10 minutes. Every signed list write or read works once (its id is kept
//   in the rate table for 20 minutes), so a copied request can't be replayed. No other route ever reads them.
const LISTS = { likes: 1000, liked_other: 500, redreams: 1000, pins: 20, muted_dreamors: 500, muted_threads: 500, not_interested: 500, threads: 200, dislikes: 1000 };
const LIST_REF = /^[^\u0000-\u001f\u007f]{1,128}$/;
const LIST_DATA_MAX = 4000;
let listsReady = null;
function listsTable(env) {
  if (!listsReady) listsReady = env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS lists (user_id TEXT NOT NULL, list TEXT NOT NULL, ref TEXT NOT NULL, data TEXT, created_at INTEGER NOT NULL, PRIMARY KEY (user_id, list, ref))"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS lists_ref ON lists(list, ref)"),
  ]).catch((e) => { listsReady = null; throw e; });
  return listsReady;
}
async function once(env, ev) {
  const t = now();
  await env.DB.prepare("DELETE FROM rate WHERE k LIKE 'once:%' AND window_start < ?1").bind(t - 2 * FRESH_SEC).run();
  const row = await env.DB.prepare("INSERT INTO rate (k, window_start, n) VALUES (?1, ?2, 1) ON CONFLICT(k) DO UPDATE SET n = n + 1 RETURNING n").bind("once:" + ev.id, t).first();
  return !!row && row.n === 1;
}
// POST /list: a signed kind 21987 event: ["list", name], ["action", "add" | "remove"], ["i", ref, data?] (1 to 200).
async function listWrite(req, env, ev) {
  if (ev.kind !== 21987 || !fresh(ev)) return json(req, { ok: false, error: "needs a fresh kind 21987 list event" }, 400);
  const list = (tag(ev, "list") || [])[1], action = (tag(ev, "action") || [])[1];
  if (!Object.prototype.hasOwnProperty.call(LISTS, list)) return json(req, { ok: false, error: "unknown list" }, 400);
  if (action !== "add" && action !== "remove") return json(req, { ok: false, error: 'action must be "add" or "remove"' }, 400);
  const seen = new Set(), items = [];
  for (const x of tagsOf(ev, "i")) if (LIST_REF.test(x[1] || "") && !seen.has(x[1])) { seen.add(x[1]); items.push(x); }
  if (!items.length || items.length > 200) return json(req, { ok: false, error: "needs 1 to 200 items (i tags)" }, 400);
  if (!(await once(env, ev))) return json(req, { ok: false, error: "this signed event was already used" }, 409);
  await listsTable(env);
  const pk = ev.pubkey, t = Date.now(), S = [];
  if (action === "add") {
    const have = new Set((await env.DB.prepare("SELECT ref FROM lists WHERE user_id = ?1 AND list = ?2").bind(pk, list).all()).results.map((r) => r.ref));
    if (have.size + items.filter((x) => !have.has(x[1])).length > LISTS[list]) return json(req, { ok: false, error: "that list is full (" + LISTS[list] + " at most)" }, 400);
    for (const x of items) {
      const data = typeof x[2] === "string" && x[2].length <= LIST_DATA_MAX ? x[2] : null;
      S.push(env.DB.prepare("INSERT INTO lists (user_id, list, ref, data, created_at) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT(user_id, list, ref) DO UPDATE SET data = COALESCE(excluded.data, data)").bind(pk, list, x[1], data, t));
      if (list === "redreams" && isHex(x[1], 64)) S.push(env.DB.prepare(
        "INSERT OR IGNORE INTO reposts (id, dream_id, user_id, created_at) SELECT ?1, ?2, ?3, ?4 WHERE EXISTS (SELECT 1 FROM dreams WHERE id = ?2) AND NOT EXISTS (SELECT 1 FROM reposts WHERE dream_id = ?2 AND user_id = ?3)"
      ).bind(bytesToHex(sha256(new TextEncoder().encode("rem-list-redream|" + pk + "|" + x[1]))), x[1], pk, t));
    }
  } else {
    for (const x of items) {
      S.push(env.DB.prepare("DELETE FROM lists WHERE user_id = ?1 AND list = ?2 AND ref = ?3").bind(pk, list, x[1]));
      if (list === "redreams" && isHex(x[1], 64)) {
        S.push(env.DB.prepare("DELETE FROM events WHERE pubkey = ?1 AND kind IN (6, 16) AND id IN (SELECT id FROM reposts WHERE user_id = ?1 AND dream_id = ?2)").bind(pk, x[1]));
        S.push(env.DB.prepare("DELETE FROM reposts WHERE user_id = ?1 AND dream_id = ?2").bind(pk, x[1]));
      }
    }
  }
  await env.DB.batch(S);
  return json(req, { ok: true, list, action, items: items.length });
}
// POST /mine: a signed kind 21988 event: ["action", "read-my-lists"], last 10 minutes, used once -> all your lists.
async function listsMine(req, env, ev) {
  if (ev.kind !== 21988 || !fresh(ev) || (tag(ev, "action") || [])[1] !== "read-my-lists") return json(req, { ok: false, error: 'needs a fresh kind 21988 event with ["action", "read-my-lists"]' }, 400);
  if (!(await once(env, ev))) return json(req, { ok: false, error: "this signed event was already used" }, 409);
  await listsTable(env);
  const rows = (await env.DB.prepare("SELECT list, ref, data, created_at FROM lists WHERE user_id = ?1 ORDER BY created_at DESC, ref").bind(ev.pubkey).all()).results;
  const lists = {}; for (const k of Object.keys(LISTS)) lists[k] = [];
  for (const r of rows) if (lists[r.list]) lists[r.list].push({ ref: r.ref, data: r.data == null ? undefined : r.data, at: r.created_at });
  return json(req, { ok: true, pubkey: ev.pubkey, lists });
}
/* ---------- Looscid's own issue tracker (Nov 8 2026, Carter: "public ... so people can agree or disagree", "it's all
   based on our own thing cause I don't wanna be depended on other companies") ----------
   Tables (made by the code itself, on first use): issues, issue_votes, issue_replies.
   POST /issues          a signed kind 21989 event: ["type", "bug" | "idea"], ["title", text], ["app", name]?, ["version", v]?;
                         content = what happened. Last 10 minutes, used once, 10 reports per key per day.
   POST /issues/vote     a signed kind 21990 event: ["e", issue id], ["vote", "agree" | "disagree" | "none"],
                         ["visibility", "private" | "public"]? (private when missing). One vote per key per report; a new
                         vote replaces the old one, "none" takes it back. Only the counts come out, never who voted.
   POST /issues/moderate a signed kind 21991 event from a Looscid mod (MODS): ["e", issue id], ["status", s]?, content = a
                         reply or the reason. Closing needs a reason. Anyone else gets 403. Shown in public as "Looscid mods".
   GET  /issues?status=&limit=&before=   GET /issues/<id>
   Everything is plain text: Rem stores the words as typed and apps put them on screen as text, never as HTML. */
const ISSUE_STATUS = ["new", "working", "fixed", "closed"];
const ISSUE_TITLE_MAX = 120, ISSUE_BODY_MAX = 4e3, ISSUE_REPLY_MAX = 2e3;
let issuesReady = null;
function issuesTable(env) {
  if (!issuesReady) issuesReady = env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, app TEXT, version TEXT, status TEXT NOT NULL DEFAULT 'new', close_reason TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS issues_status ON issues(status, created_at)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS issues_user ON issues(user_id)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS issue_votes (issue_id TEXT NOT NULL, user_id TEXT NOT NULL, vote INTEGER NOT NULL, visibility TEXT NOT NULL DEFAULT 'private', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (issue_id, user_id))"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS issue_votes_user ON issue_votes(user_id)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS issue_replies (id TEXT PRIMARY KEY, issue_id TEXT NOT NULL, mod_id TEXT NOT NULL, status TEXT, text TEXT NOT NULL, created_at INTEGER NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS issue_replies_issue ON issue_replies(issue_id, created_at)"),
  ]).catch((e) => { issuesReady = null; throw e; });
  return issuesReady;
}
// Plain text only: control characters out (new lines and tabs stay in the words), spaces trimmed.
const issueText = (s, lines) => String(s == null ? "" : s).replace(lines ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g : /[\u0000-\u001f\u007f]+/g, lines ? "" : " ").trim();
const issueChars = (s) => Array.from(s).length;
const ISSUE_SQL = "SELECT i.id, i.user_id, i.type, i.title, i.body, i.app, i.version, i.status, i.close_reason, i.created_at, i.updated_at, " +
  "(SELECT COUNT(*) FROM issue_votes v WHERE v.issue_id = i.id AND v.vote = 1) AS agree, " +
  "(SELECT COUNT(*) FROM issue_votes v WHERE v.issue_id = i.id AND v.vote = -1) AS disagree FROM issues i";
function issueOut(r, replies) {
  return { id: r.id, by: r.user_id, type: r.type, title: r.title, body: r.body, app: r.app || null, version: r.version || null,
    status: r.status, close_reason: r.close_reason || null, created_at: r.created_at, updated_at: r.updated_at,
    agree: r.agree || 0, disagree: r.disagree || 0,
    replies: (replies || []).map((x) => ({ by: "Looscid mods", text: x.text, status: x.status || null, at: x.created_at })) };
}
async function repliesFor(env, ids) {
  const out = {}; if (!ids.length) return out;
  const rows = (await env.DB.prepare("SELECT issue_id, status, text, created_at FROM issue_replies WHERE issue_id IN (" + ids.map((_, i) => "?" + (i + 1)).join(",") + ") ORDER BY created_at").bind(...ids).all()).results;
  for (const r of rows) (out[r.issue_id] = out[r.issue_id] || []).push(r);
  return out;
}
async function issuesList(req, env, url) {
  await issuesTable(env);
  const st = url.searchParams.get("status") || "all";
  if (!["all", "open"].concat(ISSUE_STATUS).includes(st)) return json(req, { ok: false, error: "status is all, open, new, working, fixed or closed" }, 400);
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "50", 10) || 50));
  const before = parseInt(url.searchParams.get("before") || "", 10);
  const where = [], args = [];
  if (st === "open") where.push("i.status != 'closed'"); else if (st !== "all") { args.push(st); where.push("i.status = ?" + args.length); }
  if (Number.isFinite(before)) { args.push(before); where.push("i.created_at < ?" + args.length); }
  args.push(limit);
  const rows = (await env.DB.prepare(ISSUE_SQL + (where.length ? " WHERE " + where.join(" AND ") : "") + " ORDER BY i.created_at DESC LIMIT ?" + args.length).bind(...args).all()).results;
  const reps = await repliesFor(env, rows.map((r) => r.id));
  return json(req, { ok: true, statuses: ISSUE_STATUS, issues: rows.map((r) => issueOut(r, reps[r.id])), next: rows.length === limit ? rows[rows.length - 1].created_at : null });
}
async function issueOne(req, env, id) {
  await issuesTable(env);
  const r = await env.DB.prepare(ISSUE_SQL + " WHERE i.id = ?1").bind(id).first();
  if (!r) return json(req, { ok: false, error: "no such report" }, 404);
  const reps = await repliesFor(env, [id]);
  return json(req, { ok: true, issue: issueOut(r, reps[id]) });
}
async function issueNew(req, env, ev) {
  if (ev.kind !== 21989 || !fresh(ev)) return json(req, { ok: false, error: "needs a fresh kind 21989 report event" }, 400);
  const type = (tag(ev, "type") || [])[1];
  if (type !== "bug" && type !== "idea") return json(req, { ok: false, error: "type is bug or idea" }, 400);
  const title = issueText((tag(ev, "title") || [])[1], false), body = issueText(ev.content, true);
  if (!title) return json(req, { ok: false, error: "a report needs a title" }, 400);
  if (issueChars(title) > ISSUE_TITLE_MAX) return json(req, { ok: false, error: "title is up to 120 characters" }, 400);
  if (issueChars(body) > ISSUE_BODY_MAX) return json(req, { ok: false, error: "what happened is up to 4000 characters" }, 400);
  const app = issueText((tag(ev, "app") || [])[1], false).slice(0, 40) || null, version = issueText((tag(ev, "version") || [])[1], false).slice(0, 40) || null;
  await issuesTable(env);
  if (!await once(env, ev)) return json(req, { ok: false, error: "already used" }, 409);
  if (!await allowed(env, "issueday:" + ev.pubkey, LIMITS.issue)) return json(req, { ok: false, error: "that's 10 reports today, try again tomorrow" }, 429);
  const t = Date.now();
  const r = await env.DB.prepare("INSERT INTO issues (id, user_id, type, title, body, app, version, status, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'new', ?8, ?8) ON CONFLICT(id) DO NOTHING").bind(ev.id, ev.pubkey, type, title, body, app, version, t).run();
  if (!r.meta || !r.meta.changes) return json(req, { ok: false, error: "already used" }, 409);
  return await issueOne(req, env, ev.id);
}
async function issueVote(req, env, ev) {
  if (ev.kind !== 21990 || !fresh(ev)) return json(req, { ok: false, error: "needs a fresh kind 21990 vote event" }, 400);
  const e = (tag(ev, "e") || [])[1], vote = (tag(ev, "vote") || [])[1], vis = (tag(ev, "visibility") || [])[1] || "private";
  if (!isHex(e, 64)) return json(req, { ok: false, error: "no report (e tag)" }, 400);
  if (!["agree", "disagree", "none"].includes(vote)) return json(req, { ok: false, error: "vote is agree, disagree or none" }, 400);
  if (vis !== "private" && vis !== "public") return json(req, { ok: false, error: "visibility is private or public" }, 400);
  await issuesTable(env);
  const it = await env.DB.prepare("SELECT id FROM issues WHERE id = ?1").bind(e).first();
  if (!it) return json(req, { ok: false, error: "no such report" }, 404);
  if (!await once(env, ev)) return json(req, { ok: false, error: "already used" }, 409);
  const t = Date.now();
  if (vote === "none") await env.DB.prepare("DELETE FROM issue_votes WHERE issue_id = ?1 AND user_id = ?2").bind(e, ev.pubkey).run();
  else await env.DB.prepare("INSERT INTO issue_votes (issue_id, user_id, vote, visibility, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?5) ON CONFLICT(issue_id, user_id) DO UPDATE SET vote = ?3, visibility = ?4, updated_at = ?5").bind(e, ev.pubkey, vote === "agree" ? 1 : -1, vis, t).run();
  const c = await env.DB.prepare("SELECT SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END) AS agree, SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END) AS disagree FROM issue_votes WHERE issue_id = ?1").bind(e).first();
  return json(req, { ok: true, id: e, vote, agree: c && c.agree || 0, disagree: c && c.disagree || 0 });
}
async function issueModerate(req, env, ev) {
  if (ev.kind !== 21991 || !fresh(ev)) return json(req, { ok: false, error: "needs a fresh kind 21991 event" }, 400);
  if (!mods(env).includes(ev.pubkey)) return json(req, { ok: false, error: "not a Looscid moderator" }, 403);
  const e = (tag(ev, "e") || [])[1], st = (tag(ev, "status") || [])[1] || null, text = issueText(ev.content, true);
  if (!isHex(e, 64)) return json(req, { ok: false, error: "no report (e tag)" }, 400);
  if (st && !ISSUE_STATUS.includes(st)) return json(req, { ok: false, error: "status is new, working, fixed or closed" }, 400);
  if (!st && !text) return json(req, { ok: false, error: "needs a status, a reply, or both" }, 400);
  if (st === "closed" && !text) return json(req, { ok: false, error: "closing a report needs a reason" }, 400);
  if (issueChars(text) > ISSUE_REPLY_MAX) return json(req, { ok: false, error: "a reply is up to 2000 characters" }, 400);
  await issuesTable(env);
  const it = await env.DB.prepare("SELECT id FROM issues WHERE id = ?1").bind(e).first();
  if (!it) return json(req, { ok: false, error: "no such report" }, 404);
  if (!await once(env, ev)) return json(req, { ok: false, error: "already used" }, 409);
  const t = Date.now(), q = [env.DB.prepare("INSERT INTO issue_replies (id, issue_id, mod_id, status, text, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT(id) DO NOTHING").bind(ev.id, e, ev.pubkey, st, text, t)];
  if (st) q.push(env.DB.prepare("UPDATE issues SET status = ?2, close_reason = ?3, updated_at = ?4 WHERE id = ?1").bind(e, st, st === "closed" ? text : null, t));
  else q.push(env.DB.prepare("UPDATE issues SET updated_at = ?2 WHERE id = ?1").bind(e, t));
  await env.DB.batch(q);
  return await issueOne(req, env, e);
}
async function issueRoute(req, env, path) {
  if (!await allowed(env, await ipKey(req), LIMITS.ip)) return json(req, { ok: false, error: "slow down" }, 429);
  const { ev, error } = await readEvent(req);
  if (error) return json(req, { ok: false, error }, error === "too big" ? 413 : 400);
  if (ev._v0) return json(req, { ok: false, error: "reports and votes need a fresh Rem v1 event" }, 400);
  const k = path === "/issues" ? "issues" : path === "/issues/vote" ? "issue_vote" : "issue_mod";
  if (!await allowed(env, k + ":" + ev.pubkey, LIMITS[k])) return json(req, { ok: false, error: "slow down" }, 429);
  if (path === "/issues") return await issueNew(req, env, ev);
  if (path === "/issues/vote") return await issueVote(req, env, ev);
  return await issueModerate(req, env, ev);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, "") || "/";
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
    try {
      if (req.method === "GET") {
        if (path === "/health") {
          const r = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name").all();
          return json(req, { ok: true, protocol: PROTOCOL, tables: r.results.map((t) => t.name), issues: true });
        }
        if (path === "/feed") return await feed(req, env, url);
        if (path === "/export") return await exportEvents(req, env, url);
        if (path === "/moderators") return json(req, { ok: true, moderators: mods(env) });
        if (path === "/modlog") return await modlog(req, env, url);
        if (path === "/issues") return await issuesList(req, env, url);
        const im = path.match(/^\/issues\/([0-9a-f]{64})$/i);
        if (im) return await issueOne(req, env, im[1].toLowerCase());
        const mm = path.match(/^\/moderation\/([0-9a-f]{64})$/i);
        if (mm) return await moderationOf(req, env, mm[1].toLowerCase());
        const m = path.match(/^\/dreams\/([^/]+)$/);
        if (m) return await userDreams(req, env, url, decodeURIComponent(m[1]).toLowerCase());
        return json(req, { ok: false, error: "not found" }, 404);
      }
      if (req.method === "POST" && ["/issues", "/issues/vote", "/issues/moderate"].includes(path)) return await issueRoute(req, env, path);
      if (req.method === "POST" && ["/ingest", "/report", "/block", "/forget", "/moderate", "/list", "/mine"].includes(path)) {
        if (!(await allowed(env, await ipKey(req), LIMITS.ip))) return json(req, { ok: false, error: "slow down" }, 429);
        const { ev, error } = await readEvent(req);
        if (error) return json(req, { ok: false, error }, error === "too big" ? 413 : 400);
        const kind = path.slice(1);
        if (ev._v0 && path !== "/ingest") return json(req, { ok: false, error: "reports, blocks and delete-my-data need a fresh Rem v1 event" }, 400);
        if (!(await allowed(env, kind + ":" + ev.pubkey, LIMITS[kind]))) return json(req, { ok: false, error: "slow down" }, 429);
        if (path === "/ingest") { const r = await ingest(env, ev); return json(req, r, r.ok ? 200 : 400); }
        if (path === "/report") return await report(req, env, ev);
        if (path === "/forget") return await forget(req, env, ev);
        if (path === "/moderate") return await moderate(req, env, ev);
        if (path === "/list") return await listWrite(req, env, ev);
        if (path === "/mine") return await listsMine(req, env, ev);
        return await block(req, env, ev);
      }
      return json(req, { ok: false, error: req.method === "GET" || req.method === "POST" ? "not found" : "method not allowed" }, req.method === "GET" || req.method === "POST" ? 404 : 405);
    } catch (e) {
      // The details go to the Worker's own log only, never into the reply.
      console.error("rem error", req.method, path, (e && e.stack) || e);
      return json(req, { ok: false, error: "server error" }, 500);
    }
  },
};
