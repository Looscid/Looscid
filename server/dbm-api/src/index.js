// dbm-api: the Looscid server, Looscid Protocol v0 (Nov 7 2026). Spec: docs/protocol.md in the Looscid repo.
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
// Endpoints (v0):
//   GET  /health                         -> { ok, protocol, tables }
//   GET  /feed?limit=&before=&viewer=    -> public Dreams (not replies), ranked by the "algo" below
//   GET  /dreams/:pubkey?limit=&before=  -> one person's Dreams and replies, newest first
//   GET  /export?after=&limit=           -> the original signed events, oldest first, for backup or another server
//   POST /ingest   body: a signed event (kind 1 Dream, kind 1010 edit, kind 5 delete, kind 6/16 ReDream)
//   POST /report   body: a signed kind 1984 event: ["e", <dream id>, <reason>], signed in the last 10 minutes
//   POST /block    body: a signed kind 21984 event: ["p", <pubkey>], ["action", "block" | "unblock"], last 10 minutes
//   POST /forget   body: a signed kind 21985 event: ["action", "delete-my-data"], last 10 minutes -> erases everything
//                  this server holds for that key (Dreams, events, ReDreams, blocks, reports they made, the user row)
// CORS: only https://looscid.github.io gets the allow headers.

import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

const ORIGIN = "https://looscid.github.io";
const PROTOCOL = "looscid/0";
const MAX_TEXT = 20000;
const MAX_BODY = 65536;          // relays take up to 64 KB, so do we
const FRESH_SEC = 600;           // reports and blocks must be signed within the last 10 minutes
const HIDE_AT = 3;               // 3 different people report a Dream -> it is hidden from the feed
const LIMITS = {                 // simple rate limits: [max actions, per this many seconds]
  ingest: [30, 600], report: [20, 3600], block: [60, 3600], forget: [5, 3600], ip: [200, 600],
};

/* ---------- small helpers ---------- */
function cors(req) {
  const h = { "Vary": "Origin" };
  if (req.headers.get("Origin") === ORIGIN) {
    h["Access-Control-Allow-Origin"] = ORIGIN;
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
    .bind(ev.id, ev.pubkey, ev.kind, ev.created_at, JSON.stringify(ev)).run();
}
// Returns { ok, what } or { ok:false, error }.
async function ingest(env, ev) {
  const t = Date.now();
  if (ev.created_at > now() + 600) return { ok: false, error: "from the future" };
  if (ev.kind === 1) {
    const isLooscid = tagsOf(ev, "looscid").length || tagsOf(ev, "t").some((x) => String(x[1]).toLowerCase() === "looscid");
    if (!isLooscid) return { ok: false, error: "not a Looscid Dream (needs the tag [\"looscid\", \"0\"])" };
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
      reply ? reply[1] : null, q && isHex(q[1], 64) ? q[1] : null, ev.created_at * 1000, ev.created_at * 1000, JSON.stringify(tags)).run();
    await keep(env, ev);
    return { ok: true, what: "dream", id: ev.id };
  }
  if (ev.kind === 1010) { // an edit: only the Dream's own author can change its text
    const e = tagsOf(ev, "e").find((x) => isHex(x[1], 64));
    if (!e) return { ok: false, error: "edit has no e tag" };
    const r = await env.DB.prepare("UPDATE dreams SET text = ?1, updated_at = ?2 WHERE id = ?3 AND user_id = ?4 AND deleted_at IS NULL AND (updated_at IS NULL OR updated_at <= ?2)")
      .bind(ev.content.slice(0, MAX_TEXT), ev.created_at * 1000, e[1], ev.pubkey).run();
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
      .bind(ev.id, e[1], ev.pubkey, ev.created_at * 1000).run();
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
  (SELECT COUNT(*) FROM dreams r WHERE r.reply_to = d.id AND r.deleted_at IS NULL AND r.status = 'ok') AS replies,
  (SELECT COUNT(*) FROM reposts p WHERE p.dream_id = d.id) AS redreams,
  (SELECT COUNT(*) FROM dreams q WHERE q.quote_of = d.id AND q.deleted_at IS NULL AND q.status = 'ok') AS quotes
FROM dreams d
WHERE d.reply_to IS NULL AND d.deleted_at IS NULL AND d.status = 'ok'
  AND d.created_at > ?1 - 30 * 86400000
  AND (?2 IS NULL OR d.user_id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?2))
ORDER BY d.created_at DESC LIMIT 500`;
const BOOST_CAP = 6 * 3600000, REPLY_BOOST = 20 * 60000, SHARE_BOOST = 40 * 60000;
function out(r) {
  let tags = []; try { tags = JSON.parse(r.tags || "[]"); } catch (e) {}
  return { id: r.id, nid: r.id, pk: r.pk, text: r.text, created: r.created_at, cw: r.cw || undefined, tags,
    reply_to: r.reply_to || undefined, quote_of: r.quote_of || undefined,
    replies: r.replies || 0, redreams: r.redreams || 0, quotes: r.quotes || 0, score: r.score };
}

async function feed(req, env, url) {
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "30", 10) || 30));
  const before = parseInt(url.searchParams.get("before") || "", 10);
  const viewer = url.searchParams.get("viewer");
  const rows = (await env.DB.prepare(FEED_SQL).bind(Date.now(), isHex(viewer, 64) ? viewer : null).all()).results;
  for (const r of rows) r.score = r.created_at + Math.min(BOOST_CAP, r.replies * REPLY_BOOST + (r.redreams + r.quotes) * SHARE_BOOST);
  rows.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
  const page = rows.filter((r) => !Number.isFinite(before) || r.score < before).slice(0, limit);
  const next = page.length === limit ? page[page.length - 1].score : null;
  return json(req, { ok: true, algo: "newest first, small boost for replies/redreams/quotes (max 6h)", dreams: page.map(out), next });
}

async function userDreams(req, env, url, pk) {
  if (!isHex(pk, 64)) return json(req, { ok: false, error: "use the 64-character hex public key" }, 400);
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "50", 10) || 50));
  const before = parseInt(url.searchParams.get("before") || "", 10);
  const rows = (await env.DB.prepare(
    "SELECT id, user_id AS pk, text, cw, reply_to, quote_of, created_at, updated_at, tags FROM dreams " +
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
  const c = await env.DB.prepare("SELECT COUNT(DISTINCT reporter_id) AS n FROM reports WHERE dream_id = ?1").bind(d.id).first();
  let hidden = false;
  if (c.n >= HIDE_AT) { await env.DB.prepare("UPDATE dreams SET status = 'hidden' WHERE id = ?1").bind(d.id).run(); hidden = true; }
  return json(req, { ok: true, reported: d.id, hidden });
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
        if (path === "/feed") return feed(req, env, url);
        if (path === "/export") return exportEvents(req, env, url);
        const m = path.match(/^\/dreams\/([^/]+)$/);
        if (m) return userDreams(req, env, url, decodeURIComponent(m[1]).toLowerCase());
        return json(req, { ok: false, error: "not found" }, 404);
      }
      if (req.method === "POST" && ["/ingest", "/report", "/block", "/forget"].includes(path)) {
        if (!(await allowed(env, await ipKey(req), LIMITS.ip))) return json(req, { ok: false, error: "slow down" }, 429);
        const { ev, error } = await readEvent(req);
        if (error) return json(req, { ok: false, error }, error === "too big" ? 413 : 400);
        const kind = path.slice(1);
        if (!(await allowed(env, kind + ":" + ev.pubkey, LIMITS[kind]))) return json(req, { ok: false, error: "slow down" }, 429);
        if (path === "/ingest") { const r = await ingest(env, ev); return json(req, r, r.ok ? 200 : 400); }
        if (path === "/report") return report(req, env, ev);
        if (path === "/forget") return forget(req, env, ev);
        return block(req, env, ev);
      }
      return json(req, { ok: false, error: req.method === "GET" || req.method === "POST" ? "not found" : "method not allowed" }, req.method === "GET" || req.method === "POST" ? 404 : 405);
    } catch (e) {
      return json(req, { ok: false, error: "server error", detail: String((e && e.message) || e).slice(0, 200) }, 500);
    }
  },
};
