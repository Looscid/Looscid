// dbm-api: the Rem server on Cloudflare. Rem, the Looscid protocol, version 1 (Nov 7 2026). Spec: docs/protocol.md.
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
  ingest: [30, 600], report: [20, 3600], block: [60, 3600], forget: [5, 3600], ip: [200, 600],
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
  (SELECT COUNT(*) FROM dreams q WHERE q.quote_of = d.id AND q.deleted_at IS NULL AND q.status = 'ok') AS quotes
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
    replies: r.replies || 0, redreams: r.redreams || 0, quotes: r.quotes || 0, score: r.score, ev: parseEv(r.ev) };
}

async function feed(req, env, url) {
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "30", 10) || 30));
  const before = parseInt(url.searchParams.get("before") || "", 10);
  const viewer = url.searchParams.get("viewer");
  const newest = url.searchParams.get("sort") === "new"; // ?sort=new: pure time, no boost ("Newest" in the app)
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
  await env.DB.batch([
    B("DELETE FROM pins WHERE user_id = ?1"), B("DELETE FROM alerts WHERE user_id = ?1"),
    B("DELETE FROM reposts WHERE user_id = ?1"), B("DELETE FROM reports WHERE reporter_id = ?1"),
    B("DELETE FROM blocks WHERE blocker_id = ?1"), B("DELETE FROM events WHERE pubkey = ?1"),
    B("DELETE FROM reports WHERE dream_id IN (SELECT id FROM dreams WHERE user_id = ?1)"),
    B("DELETE FROM reposts WHERE dream_id IN (SELECT id FROM dreams WHERE user_id = ?1)"),
    B("DELETE FROM pins WHERE dream_id IN (SELECT id FROM dreams WHERE user_id = ?1)"),
    B("DELETE FROM dreams WHERE user_id = ?1"), B("DELETE FROM users WHERE id = ?1"),
  ]);
  return json(req, { ok: true, forgot: pk });
}

/* ---------- router ---------- */
// "return await" (not just "return") so an error inside a handler is caught below and never leaks.
export default {
  async fetch(req, env) {
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, "") || "/";
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
    try {
      if (req.method === "GET") {
        if (path === "/health") {
          const r = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name").all();
          return json(req, { ok: true, protocol: PROTOCOL, tables: r.results.map((t) => t.name) });
        }
        if (path === "/feed") return await feed(req, env, url);
        if (path === "/export") return await exportEvents(req, env, url);
        const m = path.match(/^\/dreams\/([^/]+)$/);
        if (m) return await userDreams(req, env, url, decodeURIComponent(m[1]).toLowerCase());
        return json(req, { ok: false, error: "not found" }, 404);
      }
      if (req.method === "POST" && ["/ingest", "/report", "/block", "/forget"].includes(path)) {
        if (!(await allowed(env, await ipKey(req), LIMITS.ip))) return json(req, { ok: false, error: "slow down" }, 429);
        const { ev, error } = await readEvent(req);
        if (error) return json(req, { ok: false, error }, error === "too big" ? 413 : 400);
        const kind = path.slice(1);
        if (ev._v0 && path !== "/ingest") return json(req, { ok: false, error: "reports, blocks and delete-my-data need a fresh Rem v1 event" }, 400);
        if (!(await allowed(env, kind + ":" + ev.pubkey, LIMITS[kind]))) return json(req, { ok: false, error: "slow down" }, 429);
        if (path === "/ingest") { const r = await ingest(env, ev); return json(req, r, r.ok ? 200 : 400); }
        if (path === "/report") return await report(req, env, ev);
        if (path === "/forget") return await forget(req, env, ev);
        return await block(req, env, ev);
      }
      return json(req, { ok: false, error: req.method === "GET" || req.method === "POST" ? "not found" : "method not allowed" }, req.method === "GET" || req.method === "POST" ? 404 : 405);
    } catch (e) {
      // The details go to the Worker's own log only, never into the reply.
      console.error("dbm-api error", req.method, path, (e && e.stack) || e);
      return json(req, { ok: false, error: "server error" }, 500);
    }
  },
};
