// The Rem rules: who may do what, how each signed object changes the home, and how things are read back.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.mjs';
import { db, one, all, run, tx } from './db.mjs';
import { verifyObject, verifyText, isHex, npubEncode, npubDecode, speakHint, PROTOCOL } from '../public/js/rem-core.js';
import { fetchCard, firstUrl } from './linkcard.mjs';

const L = config.limits;
export class RemError extends Error { constructor(status, code, message) { super(message); this.status = status; this.code = code; } }
const fail = (status, code, message) => { throw new RemError(status, code, message); };
const now = () => Date.now();
export const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const str = (v, max, field, { required = false, min = 0 } = {}) => {
  if (v === undefined || v === null || v === '') { if (required) fail(422, 'missing_' + field, `The ${field} is missing.`); return null; }
  if (typeof v !== 'string') fail(422, 'bad_' + field, `The ${field} must be text.`);
  const n = [...v].length;
  if (n > max) fail(422, field + '_too_long', `The ${field} is too long: ${n} characters, the limit is ${max}.`);
  if (n < min) fail(422, field + '_too_short', `The ${field} is too short.`);
  return v;
};

// ---------- live hub (filled in by main.mjs) ----------
export const hub = { sockets: new Map(), send(pk, msg) { for (const s of this.sockets.get(pk) || []) if (s.streams.has(msg.stream || 'alerts') || !msg.stream) s.send(msg); }, each(fn) { for (const [pk, set] of this.sockets) for (const s of set) fn(pk, s); } };

// ---------- members ----------
export const member = (pk) => one('SELECT * FROM dreamors WHERE pubkey = ?', pk);
export const byHandle = (h) => one('SELECT * FROM dreamors WHERE handle = ?', String(h || '').toLowerCase().replace(/^@/, ''));
export const isStaff = (m) => !!m && (m.role === 'owner' || m.role === 'admin' || m.role === 'mod');
const ROLE_RANK = { member: 0, mod: 1, admin: 2, owner: 3 };
const follows = (a, b) => !!one('SELECT 1 FROM follows WHERE by = ? AND who = ?', a, b);
const blockedEither = (a, b) => !!one('SELECT 1 FROM blocks WHERE (by = ? AND who = ?) OR (by = ? AND who = ?)', a, b, b, a);
export const mutual = (a, b) => follows(a, b) && follows(b, a);

export function dreamorView(m, viewer) {
  if (!m) return null;
  const v = { pubkey: m.pubkey, npub: npubEncode(m.pubkey), handle: m.handle, address: `@${m.handle}@${config.host}`, name: m.name || m.handle, bio: m.bio, pronouns: m.pronouns,
    avatar: m.avatar ? JSON.parse(m.avatar) : null, role: m.role === 'member' ? undefined : m.role, joined: m.created };
  if (m.suspended) v.suspended = true;
  if (viewer && viewer !== m.pubkey) {
    v.you = { following: follows(viewer, m.pubkey), follows_you: follows(m.pubkey, viewer), blocked: !!one('SELECT 1 FROM blocks WHERE by = ? AND who = ?', viewer, m.pubkey) };
    v.you.mutual = v.you.following && v.you.follows_you;
  }
  return v;
}
export function counts(pk) {
  return {
    dreams: one('SELECT count(*) n FROM dreams WHERE by = ? AND deleted = 0 AND published = 1 AND hidden = 0', pk).n,
    followers: one('SELECT count(*) n FROM follows WHERE who = ?', pk).n,
    following: one('SELECT count(*) n FROM follows WHERE by = ?', pk).n,
  };
}

// ---------- seeing Dreams ----------
// v = viewer pubkey, staff = moderator view
export function canSee(d, v, staff = false) {
  if (!d || d.deleted) return false;
  if (d.by === v) return true;
  if (!d.published || (d.hidden && !staff)) return false;
  const a = member(d.by); if (!a || (a.suspended && !staff)) return false;
  if (v && blockedEither(v, d.by)) return false;
  if (d.audience === 'public') return !!v || config.publicRead;
  return !!v && follows(v, d.by);
}
const VIS = `d.deleted = 0 AND (d.published = 1 OR d.by = @v) AND (d.hidden = 0 OR @staff) AND (a.suspended = 0 OR @staff)
  AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.by = @v AND b.who = d.by) OR (b.who = @v AND b.by = d.by))
  AND (d.audience = 'public' OR d.by = @v OR EXISTS (SELECT 1 FROM follows x WHERE x.by = @v AND x.who = d.by))`;

export function dreamItem(d, v, staff = false) {
  const author = member(d.by);
  const media = d.media ? JSON.parse(d.media) : [];
  const item = {
    id: d.id, by: dreamorView(author), at: d.pub_at || d.at, audience: d.audience,
    text: d.text, cw: d.cw || undefined, speak: d.speak || undefined, speak_hint: d.speak ? undefined : (speakHint(d.text) !== d.text ? speakHint(d.text) : undefined),
    lang: d.lang || undefined, media: media.length ? media : undefined, reply_to: d.reply_to || undefined, quote: d.quote || undefined,
    tags: d.tags ? JSON.parse(d.tags) : undefined, link: d.link ? JSON.parse(d.link) : undefined,
    edited_at: d.edited_at || undefined, edits: d.edits || undefined,
    scheduled_for: d.published ? undefined : d.post_at,
    counts: {
      replies: one('SELECT count(*) n FROM dreams WHERE reply_to = ? AND deleted = 0 AND published = 1 AND hidden = 0', d.id).n,
      redreams: one('SELECT count(*) n FROM redreams WHERE of = ?', d.id).n,
      likes: one(`SELECT count(*) n FROM reacts WHERE of = ? AND r = 'like'`, d.id).n,
    },
  };
  if (d.reply_to) { const p = one('SELECT by FROM dreams WHERE id = ?', d.reply_to); const pm = p && member(p.by); if (pm) item.reply_to_handle = pm.handle; }
  if (v) item.me = { liked: !!one('SELECT 1 FROM reacts WHERE by = ? AND of = ?', v, d.id), redreamed: !!one('SELECT 1 FROM redreams WHERE by = ? AND of = ?', v, d.id) };
  if (v) { const r = one('SELECT id FROM reacts WHERE by = ? AND of = ?', v, d.id); if (r) item.me.like_id = r.id; const rd = one('SELECT id FROM redreams WHERE by = ? AND of = ?', v, d.id); if (rd) item.me.redream_id = rd.id; }
  if (d.poll) {
    const p = JSON.parse(d.poll); const votes = all('SELECT choice, count(*) n FROM votes WHERE of = ? GROUP BY choice', d.id);
    const total = votes.reduce((s, x) => s + x.n, 0);
    item.poll = { options: p.options.map((t, i) => ({ text: t, votes: votes.find((x) => x.choice === i)?.n || 0 })), closes_at: p.closes_at, closed: now() > p.closes_at, total };
    if (v) { const mv = one('SELECT choice FROM votes WHERE by = ? AND of = ?', v, d.id); item.poll.my_choice = mv ? mv.choice : null; }
  }
  if (staff && d.hidden) item.hidden = true;
  if (d.quote) { const q = one('SELECT * FROM dreams WHERE id = ?', d.quote); if (q && canSee(q, v, staff)) item.quoted = { id: q.id, by: dreamorView(member(q.by)), text: q.text, cw: q.cw || undefined }; }
  return item;
}

export function feed(kind, v, { before, limit = 20, pk, staff = false } = {}) {
  limit = Math.max(1, Math.min(50, Number(limit) || 20));
  const where = kind === 'dreamline' ? `(f.by = @v OR f.by IN (SELECT who FROM follows WHERE by = @v))`
    : kind === 'discover' ? `f.kind = 'dream' AND d.audience = 'public'` : `f.by = @pk`;
  const byTime = kind === 'profile';   // a profile lists by the Dream's own time, so imported older Dreams fall into place
  const rows = all(`SELECT f.pseq, f.kind, f.by fby, f.at fat, d.* FROM feed f JOIN dreams d ON d.id = f.dream JOIN dreamors a ON a.pubkey = d.by JOIN dreamors r ON r.pubkey = f.by
    WHERE ${where} AND ${byTime ? 'f.at' : 'f.pseq'} < @before AND ${byTime ? '1' : "f.kind != 'imported'"} AND (r.suspended = 0 OR @staff) AND d.published = 1
    AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.by = @v AND b.who = f.by) OR (b.who = @v AND b.by = f.by)) AND ${VIS}
    ORDER BY ${byTime ? 'f.at' : 'f.pseq'} DESC LIMIT @limit`, { v: v || '', pk: pk || '', before: Number(before) || 9e15, limit, staff: staff ? 1 : 0 });
  const items = rows.map((r) => {
    const it = dreamItem(r, v, staff); it.cursor = byTime ? r.fat : r.pseq; if (r.imported) it.imported = true;
    if (r.kind === 'redream') it.redreamed_by = dreamorView(member(r.fby));
    return it;
  });
  return { items, next: rows.length === limit ? (byTime ? rows[rows.length - 1].fat : rows[rows.length - 1].pseq) : null };
}

export function thread(id, v, staff) {
  const d = one('SELECT * FROM dreams WHERE id = ?', id);
  if (!canSee(d, v, staff)) fail(404, 'not_found', 'That Dream is not here, or you cannot see it.');
  const ancestors = []; let p = d;
  while (p.reply_to && ancestors.length < 10) { p = one('SELECT * FROM dreams WHERE id = ?', p.reply_to); if (!p || !canSee(p, v, staff)) break; ancestors.unshift(dreamItem(p, v, staff)); }
  const replies = all(`SELECT d.* FROM dreams d JOIN dreamors a ON a.pubkey = d.by WHERE d.reply_to = @id AND ${VIS} ORDER BY d.pub_at ASC LIMIT 200`, { id, v: v || '', staff: staff ? 1 : 0 })
    .filter((r) => r.published).map((r) => dreamItem(r, v, staff));
  return { dream: dreamItem(d, v, staff), ancestors, replies };
}

// ---------- rate limits (memory only; nothing about people is written down) ----------
const buckets = new Map();
export function rate(key, max, windowMs = 3600e3) {
  const t = now(); const list = (buckets.get(key) || []).filter((x) => t - x < windowMs);
  if (list.length >= max) fail(429, 'slow_down', 'That is a lot at once. Take a short break and try again in a little while.');
  list.push(t); buckets.set(key, list);
}
setInterval(() => { const t = now(); for (const [k, v] of buckets) if (!v.some((x) => t - x < 864e5)) buckets.delete(k); }, 600e3).unref();
const isNew = (m) => now() - m.created < config.rate.newAccountDays * 864e5;

// ---------- alerts ----------
const EVENT = { role_invite: 'role.invite', role_answer: 'role.answer', like: 'like.new', redream: 'redream.new', reply: 'reply.new', mention: 'alert.mention', follow: 'follow.new', chat: 'chat.new', quote: 'quote.new' };
export function alertView(a, v) {
  const out = { seq: a.seq, kind: a.kind, event: EVENT[a.kind], actor: dreamorView(member(a.actor)), at: a.at, seen: !!a.seen };
  if (a.ref && !['chat', 'role_invite', 'role_answer'].includes(a.kind)) { const d = one('SELECT * FROM dreams WHERE id = ?', a.ref); if (d && canSee(d, v)) out.dream = dreamItem(d, v); }
  if (a.kind === 'chat') out.chat_with = a.actor;
  if (a.kind === 'role_invite' || a.kind === 'role_answer') { const ri = one('SELECT * FROM role_invites WHERE id = ?', a.ref); if (ri) out.role_invite = { id: ri.id, role: ri.role, status: ri.status, to: ri.to_pk }; }
  return out;
}
function alert(to, kind, actor, ref) {
  if (to === actor || blockedEither(to, actor)) return;
  const at = now(); const r = run('INSERT INTO alerts (to_pk, kind, actor, ref, at) VALUES (?, ?, ?, ?, ?)', to, kind, actor, ref || null, at);
  const a = one('SELECT * FROM alerts WHERE seq = ?', r.lastInsertRowid);
  queueMicrotask(() => hub.send(to, { op: 'alert', stream: 'alerts', event: EVENT[kind], alert: alertView(a, to) }));
}

// ---------- publishing Dreams (now or when their scheduled time comes) ----------
function publish(id) {
  const d = one('SELECT * FROM dreams WHERE id = ?', id);
  if (!d || d.published || d.deleted) return;
  const at = now();
  tx(() => {
    run('UPDATE dreams SET published = 1, pub_at = ? WHERE id = ?', at, id);
    run('INSERT OR IGNORE INTO feed (kind, dream, by, at, obj) VALUES (?, ?, ?, ?, ?)', 'dream', id, d.by, at, id);
    run('INSERT INTO dreams_fts (id, text, cw) VALUES (?, ?, ?)', id, d.text, d.cw || '');
  })();
  if (d.reply_to) { const p = one('SELECT by FROM dreams WHERE id = ?', d.reply_to); if (p) alert(p.by, 'reply', d.by, id); }
  if (d.quote) { const q = one('SELECT by FROM dreams WHERE id = ?', d.quote); if (q) alert(q.by, 'quote', d.by, id); }
  const mentioned = new Set([...d.text.matchAll(/(?:^|[^\w@])@([a-z0-9_]{2,20})\b/gi)].map((m) => m[1].toLowerCase()));
  for (const h of mentioned) { const m = byHandle(h); if (m && canSee({ ...d, published: 1, pub_at: at }, m.pubkey)) alert(m.pubkey, 'mention', d.by, id); }
  broadcastDream(id, 'dream');
  const url = firstUrl(d.text);
  if (url) linkCard(id, url);
}
export function broadcastDream(id, kind, redreamBy) {
  const d = one('SELECT * FROM dreams WHERE id = ?', id); if (!d) return;
  hub.each((pk, s) => {
    if (!canSee(d, pk)) return;
    const actor = redreamBy || d.by;
    if (redreamBy && blockedEither(pk, redreamBy)) return;
    const item = dreamItem(d, pk); if (redreamBy) item.redreamed_by = dreamorView(member(redreamBy));
    const event = kind === 'redream' ? 'redream.new' : d.reply_to ? 'reply.new' : 'dream.new';
    if ((pk === actor || follows(pk, actor)) && s.streams.has('dreamline')) s.send({ op: 'item', stream: 'dreamline', event, item });
    if (!redreamBy && d.audience === 'public' && s.streams.has('discover')) s.send({ op: 'item', stream: 'discover', event, item });
  });
}
function broadcastUpdate(id, op = 'update') {
  const d = one('SELECT * FROM dreams WHERE id = ?', id); if (!d) return;
  hub.each((pk, s) => { if (op === 'remove') s.send({ op: 'remove', id }); else if (canSee(d, pk)) s.send({ op: 'update', item: dreamItem(d, pk) }); });
}
export function runScheduled() {
  for (const r of all('SELECT id FROM dreams WHERE published = 0 AND deleted = 0 AND post_at <= ?', now())) { try { publish(r.id); } catch (e) { console.error('schedule', e.message); } }
}
async function linkCard(id, url) {
  try {
    let c = one('SELECT * FROM link_cards WHERE url = ?', url);
    if (!c || now() - c.fetched > 864e5) {
      let card = null; try { card = await fetchCard(url); } catch {}
      run('INSERT OR REPLACE INTO link_cards (url, title, description, site, ok, fetched) VALUES (?, ?, ?, ?, ?, ?)', url, card?.title || null, card?.description || null, card?.site || null, card ? 1 : 0, now());
      c = one('SELECT * FROM link_cards WHERE url = ?', url);
    }
    const cur = one('SELECT text, deleted FROM dreams WHERE id = ?', id);
    if (!cur || cur.deleted || firstUrl(cur.text) !== url) return;   // the Dream changed while the page was being read
    if (c.ok) { run('UPDATE dreams SET link = ? WHERE id = ?', JSON.stringify({ url, title: c.title, description: c.description, site: c.site }), id); broadcastUpdate(id); }
  } catch (e) { console.error('linkcard', e.message); }
}

// ---------- validation helpers ----------
function mediaList(list, by) {
  if (list === undefined || list === null) return [];
  if (!Array.isArray(list) || list.length > L.media) fail(422, 'too_much_media', `A Dream can carry up to ${L.media} images.`);
  return list.map((m, i) => {
    if (!m || typeof m !== 'object') fail(422, 'bad_media', 'An attached image is not described correctly.');
    if (!m.alt || typeof m.alt !== 'string' || !m.alt.trim()) fail(422, 'alt_required', `Image ${i + 1} needs alt text: a short description of what is in it, so everyone can know what it shows.`);
    str(m.alt, L.alt, 'alt text');
    const mm = /\/media\/([0-9a-f]{64})\.(jpg|png|webp)$/.exec(m.url || '');
    const row = mm && one('SELECT * FROM media WHERE sha = ?', mm[1]);
    if (!row) fail(422, 'unknown_media', `Image ${i + 1} was not uploaded to this home first.`);
    if (row.by !== by) fail(403, 'not_your_media', `Image ${i + 1} was uploaded by someone else.`);
    return { url: `/media/${row.sha}.${row.ext}`, mime: row.mime, alt: m.alt.trim(), w: row.w, h: row.h };
  });
}
const getDream = (id) => (isHex(id, 32) ? one('SELECT * FROM dreams WHERE id = ?', id) : null);
const needMember = (pk, what = 'That Dreamor') => { const m = isHex(pk, 32) && member(pk); if (!m) fail(404, 'no_such_dreamor', `${what} is not a member of this home.`); return m; };

// ---------- accepting signed objects ----------
const TYPES = new Set(['role_answer', 'profile', 'dream', 'redream', 'react', 'edit', 'delete', 'follow', 'unfollow', 'block', 'unblock', 'vote', 'chat', 'report', 'leave']);

export async function acceptObject(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) fail(400, 'bad_object', 'That is not a Rem object.');
  if (JSON.stringify(o).length > L.objectBytes) fail(413, 'too_big', 'That object is too big.');
  if (o[PROTOCOL.key] !== PROTOCOL.version) fail(400, 'bad_version', `This home speaks ${PROTOCOL.name} version ${PROTOCOL.version}.`);
  if (!TYPES.has(o.type)) fail(400, 'unknown_type', `This home does not know the object type "${String(o.type).slice(0, 30)}".`);
  if (!o.body || typeof o.body !== 'object' || Array.isArray(o.body)) fail(400, 'bad_body', 'The object has no body.');
  if (!Number.isInteger(o.at) || Math.abs(now() - o.at) > L.clockSkewMs) fail(400, 'bad_time', "The object's time is too far from now. Check your device's clock.");
  if (!(await verifyObject(o))) fail(400, 'bad_signature', 'The signature does not match. The object was not signed by that LooscidID, or it was changed after signing.');
  const me = member(o.by);
  if (!me) fail(403, 'not_member', 'That LooscidID is not a member of this home. Join with an invite first.');
  if (me.suspended) fail(403, 'suspended', 'This LooscidID is suspended by the moderators.');
  const dup = one('SELECT seq FROM objects WHERE id = ?', o.id);
  if (dup) return { ok: true, id: o.id, seq: dup.seq, duplicate: true };
  const after = [];
  const res = tx(() => apply(o, me, after))();
  for (const f of after) { try { f(); } catch (e) { console.error('after', e); } }
  return { ok: true, id: o.id, ...res };
}

function log(o, toPk = null) {
  const r = run('INSERT INTO objects (id, type, by, at, raw, to_pk, received) VALUES (?, ?, ?, ?, ?, ?, ?)', o.id, o.type, o.by, o.at, JSON.stringify(o), toPk, now());
  return Number(r.lastInsertRowid);
}

function apply(o, me, after) {
  const b = o.body, by = o.by;
  switch (o.type) {
    case 'profile': {
      if (o.at <= me.profile_at) fail(409, 'stale_profile', 'A newer profile is already saved.');
      const name = str(b.name, L.name, 'name') || ''; const bio = str(b.bio, L.bio, 'bio') || ''; const pronouns = str(b.pronouns, L.pronouns, 'pronouns') || '';
      const chats = b.chats_from || 'mutuals';
      if (!['mutuals', 'nobody'].includes(chats)) fail(422, 'bad_chats_from', 'Chats can come from "mutuals" or "nobody" on this home.');
      let avatar = null;
      if (b.avatar) avatar = JSON.stringify(mediaList([b.avatar], by)[0]);
      run('UPDATE dreamors SET name = ?, bio = ?, pronouns = ?, avatar = ?, chats_from = ?, profile_at = ? WHERE pubkey = ?', name, bio, pronouns, avatar, chats, o.at, by);
      run('DELETE FROM dreamors_fts WHERE pubkey = ?', by); run('INSERT INTO dreamors_fts (pubkey, handle, name, bio) VALUES (?, ?, ?, ?)', by, me.handle, name, bio);
      return { seq: log(o) };
    }
    case 'dream': {
      rate('dream:' + by, isNew(me) ? config.rate.dreamsNew : config.rate.dreams);
      const text = str(b.text, L.text, 'text') || '';
      const media = mediaList(b.media, by);
      if (!text.trim() && !media.length) fail(422, 'empty', 'A Dream needs some text or an image.');
      const cw = str(b.cw, L.cw, 'content warning'); const speak = str(b.speak, L.speak, 'speak text'); const lang = str(b.lang, 10, 'language');
      const audience = b.audience || 'public';
      if (!['public', 'followers'].includes(audience)) fail(422, 'bad_audience', 'Audience can be "public" or "followers".');
      let reply = null, quote = null;
      if (b.reply_to) { reply = getDream(b.reply_to); if (!canSee(reply, by)) fail(404, 'not_found', 'The Dream you are replying to is not here, or you cannot see it.'); }
      if (b.quote) { quote = getDream(b.quote); if (!canSee(quote, by) || quote.audience !== 'public') fail(404, 'not_found', 'The Dream you are quoting is not here, or is not public.'); }
      let poll = null;
      if (b.poll) {
        const p = b.poll; if (!Array.isArray(p.options) || p.options.length < 2 || p.options.length > L.pollOptions) fail(422, 'bad_poll', `A poll has 2 to ${L.pollOptions} options.`);
        p.options.forEach((t, i) => str(t, L.pollOption, `poll option ${i + 1}`, { required: true }));
        const closes = Number(p.closes_at) || (o.at + 864e5);
        if (closes <= now() || closes - o.at > L.pollMaxMs) fail(422, 'bad_poll_time', 'A poll can stay open for up to 7 days.');
        poll = JSON.stringify({ options: p.options, closes_at: closes });
      }
      let tags = Array.isArray(b.tags) ? b.tags.slice(0, 10).map((t) => String(t).toLowerCase().replace(/[^\p{L}\p{N}_]/gu, '').slice(0, 40)).filter(Boolean) : [];
      for (const m of text.matchAll(/(?:^|\s)#([\p{L}\p{N}_]{1,40})/gu)) tags.push(m[1].toLowerCase());
      tags = [...new Set(tags)].slice(0, 10);
      let postAt = null;
      if (b.post_at !== undefined && b.post_at !== null) {
        postAt = Number(b.post_at);
        if (!Number.isInteger(postAt) || postAt - now() > L.scheduleMaxMs) fail(422, 'bad_schedule', 'A Dream can be scheduled up to 30 days ahead.');
        if (postAt <= now() + 15e3) postAt = null;
      }
      run(`INSERT INTO dreams (id, by, at, text, cw, speak, lang, audience, reply_to, quote, media, poll, tags, post_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        o.id, by, o.at, text, cw, speak, lang, audience, reply?.id || null, quote?.id || null, media.length ? JSON.stringify(media) : null, poll, tags.length ? JSON.stringify(tags) : null, postAt);
      const seq = log(o);
      if (!postAt) after.push(() => publish(o.id));
      return { seq, scheduled_for: postAt || undefined };
    }
    case 'redream': {
      const d = getDream(b.of); if (!canSee(d, by) || d.audience !== 'public') fail(404, 'not_found', 'That Dream is not here, or is not public, so it cannot be ReDreamed.');
      if (one('SELECT 1 FROM redreams WHERE by = ? AND of = ?', by, d.id)) fail(409, 'already', 'You already ReDreamed that.');
      const at = now();
      run('INSERT INTO redreams (id, by, of, at) VALUES (?, ?, ?, ?)', o.id, by, d.id, at);
      run('INSERT INTO feed (kind, dream, by, at, obj) VALUES (?, ?, ?, ?, ?)', 'redream', d.id, by, at, o.id);
      after.push(() => { alert(d.by, 'redream', by, d.id); broadcastDream(d.id, 'redream', by); });
      return { seq: log(o) };
    }
    case 'react': {
      if (b.r !== 'like') fail(422, 'bad_reaction', 'Only "like" reactions exist in this version.');
      const d = getDream(b.of); if (!canSee(d, by)) fail(404, 'not_found', 'That Dream is not here, or you cannot see it.');
      if (one('SELECT 1 FROM reacts WHERE by = ? AND of = ?', by, d.id)) fail(409, 'already', 'You already liked that.');
      run('INSERT INTO reacts (id, by, of, r, at) VALUES (?, ?, ?, ?, ?)', o.id, by, d.id, 'like', now());
      after.push(() => alert(d.by, 'like', by, d.id));
      return { seq: log(o) };
    }
    case 'edit': {
      const d = getDream(b.of); if (!d || d.deleted) fail(404, 'not_found', 'That Dream is not here.');
      if (d.by !== by) fail(403, 'not_yours', 'You can only edit your own Dreams.');
      const text = str(b.text, L.text, 'text') || '';
      if (!text.trim() && !d.media) fail(422, 'empty', 'A Dream needs some text or an image.');
      const cw = b.cw === undefined ? d.cw : str(b.cw, L.cw, 'content warning'); const speak = b.speak === undefined ? d.speak : str(b.speak, L.speak, 'speak text');
      run('UPDATE dreams SET text = ?, cw = ?, speak = ?, edited_at = ?, edits = edits + 1, link = NULL WHERE id = ?', text, cw, speak, now(), d.id);
      if (d.published) { run('DELETE FROM dreams_fts WHERE id = ?', d.id); run('INSERT INTO dreams_fts (id, text, cw) VALUES (?, ?, ?)', d.id, text, cw || ''); }
      after.push(() => { broadcastUpdate(d.id); const u = firstUrl(text); if (u && d.published) linkCard(d.id, u); });
      return { seq: log(o) };
    }
    case 'delete': {
      const target = isHex(b.of, 32) && one('SELECT * FROM objects WHERE id = ?', b.of);
      if (!target) fail(404, 'not_found', 'There is nothing with that id to delete.');
      if (target.by !== by) fail(403, 'not_yours', 'You can only delete your own things.');
      let toPk = null;
      if (target.type === 'dream') {
        run(`UPDATE dreams SET deleted = 1, text = '', cw = NULL, speak = NULL, media = NULL, poll = NULL, link = NULL WHERE id = ?`, target.id);
        run('DELETE FROM dreams_fts WHERE id = ?', target.id);
        after.push(() => broadcastUpdate(target.id, 'remove'));
      } else if (target.type === 'react') run('DELETE FROM reacts WHERE id = ?', target.id);
      else if (target.type === 'redream') run('DELETE FROM redreams WHERE id = ?', target.id), run('DELETE FROM feed WHERE obj = ?', target.id);
      else if (target.type === 'chat') { const c = one('SELECT * FROM chats WHERE id = ?', target.id); toPk = c?.to_pk || null; run('UPDATE chats SET deleted = 1, raw = ? WHERE id = ?', '{}', target.id); }
      else if (target.type === 'vote') run('DELETE FROM votes WHERE by = ? AND of = ?', by, JSON.parse(target.raw).body.of);
      else fail(422, 'cannot_delete', `A ${target.type} cannot be deleted. Use its opposite (for example unfollow or unblock).`);
      const seq = log(o, toPk);
      if (toPk) after.push(() => hub.send(toPk, { op: 'chat_deleted', stream: 'chats', id: target.id, by }));
      return { seq };
    }
    case 'follow': {
      const t = needMember(b.who);
      if (t.pubkey === by) fail(422, 'self', 'You cannot follow yourself.');
      if (blockedEither(by, t.pubkey)) fail(403, 'blocked', 'You cannot follow this Dreamor.');
      rate('follow:' + by, config.rate.followsPerDay, 864e5);
      const had = follows(by, t.pubkey);
      run('INSERT OR IGNORE INTO follows (by, who, at) VALUES (?, ?, ?)', by, t.pubkey, now());
      if (!had) after.push(() => alert(t.pubkey, 'follow', by));
      return { seq: log(o) };
    }
    case 'unfollow': { needMember(b.who); run('DELETE FROM follows WHERE by = ? AND who = ?', by, b.who); return { seq: log(o) }; }
    case 'block': {
      const t = needMember(b.who); if (t.pubkey === by) fail(422, 'self', 'You cannot block yourself.');
      run('INSERT OR IGNORE INTO blocks (by, who, at) VALUES (?, ?, ?)', by, t.pubkey, now());
      run('DELETE FROM follows WHERE (by = ? AND who = ?) OR (by = ? AND who = ?)', by, t.pubkey, t.pubkey, by);
      return { seq: log(o) };
    }
    case 'unblock': { needMember(b.who); run('DELETE FROM blocks WHERE by = ? AND who = ?', by, b.who); return { seq: log(o) }; }
    case 'vote': {
      const d = getDream(b.of); if (!canSee(d, by) || !d.poll) fail(404, 'not_found', 'That poll is not here.');
      const p = JSON.parse(d.poll); const c = Number(b.choice);
      if (now() > p.closes_at) fail(409, 'poll_closed', 'That poll is closed.');
      if (!Number.isInteger(c) || c < 0 || c >= p.options.length) fail(422, 'bad_choice', 'That is not one of the poll options.');
      run('INSERT OR REPLACE INTO votes (by, of, choice, at) VALUES (?, ?, ?, ?)', by, d.id, c, now());
      after.push(() => broadcastUpdate(d.id));
      return { seq: log(o) };
    }
    case 'chat': {
      const t = needMember(b.to, 'The person you are writing to');
      if (t.pubkey === by) fail(422, 'self', 'You cannot Chat with yourself.');
      if (typeof b.box !== 'string' || !b.box || b.box.length > L.chatBox) fail(422, 'bad_box', 'The Chat message is missing or too long.');
      if (blockedEither(by, t.pubkey)) fail(403, 'cannot_chat', 'You cannot Chat with this Dreamor.');
      if (!mutual(by, t.pubkey)) fail(403, 'mutuals_only', 'Chats are for mutuals: you both have to follow each other first.');
      if (t.chats_from === 'nobody') fail(403, 'chats_off', 'This Dreamor has Chats turned off.');
      rate('chat:' + by, config.rate.chats);
      run('INSERT INTO chats (id, by, to_pk, at, raw) VALUES (?, ?, ?, ?, ?)', o.id, by, t.pubkey, now(), JSON.stringify(o));
      const seq = log(o, t.pubkey);
      after.push(() => { hub.send(t.pubkey, { op: 'chat', stream: 'chats', event: 'chat.new', object: o }); hub.send(by, { op: 'chat', stream: 'chats', event: 'chat.sent', object: o }); alert(t.pubkey, 'chat', by, o.id); });
      return { seq };
    }
    case 'report': {
      rate('report:' + by, config.rate.reports);
      const reasons = ['spam', 'bullying', 'sexual', 'self_harm', 'violence', 'other'];
      if (!reasons.includes(b.reason)) fail(422, 'bad_reason', `Pick a reason: ${reasons.join(', ')}.`);
      const note = str(b.note, L.reportNote, 'note');
      let kind, target = b.of, evidence = null;
      if (!isHex(target, 32)) fail(422, 'bad_target', 'Report a Dream, a Dreamor or a Chat message.');
      if (getDream(target)) kind = 'dream';
      else if (member(target)) kind = 'dreamor';
      else if (one('SELECT 1 FROM chats WHERE id = ? AND to_pk = ?', target, by)) {
        kind = 'chat';
        if (b.evidence) evidence = JSON.stringify(b.evidence);   // the inner signed message, checked below (outside the transaction)
      } else fail(404, 'not_found', 'There is nothing with that id that you can report.');
      run('INSERT INTO reports (id, by, target_kind, target, reason, note, evidence, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', o.id, by, kind, target, b.reason, note, evidence, now());
      return { seq: log(o) };
    }
    case 'role_answer': {
      // The answer to a role invite (admin or moderator), signed by the invited Dreamor.
      const ri = typeof b.invite === 'string' && one('SELECT * FROM role_invites WHERE id = ?', b.invite);
      if (!ri || ri.to_pk !== by) fail(404, 'not_found', 'That role invite is not for you.');
      if (ri.status !== 'pending') fail(409, 'answered', `That invite was already ${ri.status}.`);
      if (typeof b.accept !== 'boolean') fail(422, 'bad_answer', 'Answer with accept: true or false.');
      const inviter = member(ri.by);
      if (b.accept && (!inviter || !isStaff(inviter) || ROLE_RANK[inviter.role] < ROLE_RANK[ri.role] + (inviter.role === 'owner' ? 0 : 1))) fail(409, 'expired', 'That invite no longer works: the person who sent it cannot give that role any more.');
      run('UPDATE role_invites SET status = ?, answered_at = ? WHERE id = ?', b.accept ? 'accepted' : 'declined', now(), ri.id);
      if (b.accept && ROLE_RANK[me.role] < ROLE_RANK[ri.role]) run('UPDATE dreamors SET role = ? WHERE pubkey = ?', ri.role, by);
      run('INSERT INTO mod_log (by, action, target, note, at) VALUES (?, ?, ?, ?, ?)', by, b.accept ? 'role_accepted' : 'role_declined', by, ri.role, now());
      after.push(() => alert(ri.by, 'role_answer', by, ri.id));
      return { seq: log(o), role: b.accept ? ri.role : me.role };
    }
    case 'leave': {
      if (me.role === 'owner') fail(403, 'owner_cannot_leave', 'The owner\'s LooscidID cannot leave. Hand ownership to someone first.');
      after.push(() => purge(by));
      return { seq: 0, left: true };
    }
  }
}

// ---------- importing a local Dreamer's existing Dreams (opt-in, chosen by them in the app) ----------
// Each Dream must be signed by the caller's own LooscidID and keeps its original time. Same id = already here (skipped).
// Dreams whose images have no alt text are NOT dropped silently: they come back in needs_alt and stay listed in
// GET /import/flags until the Dreamor fixes them (adds alt, signs again, imports again) or dismisses them.
export async function importDreams(m, objects) {
  if (!Array.isArray(objects) || !objects.length) fail(422, 'nothing', 'Send a list of signed Dreams under "objects".');
  if (objects.length > 200) fail(413, 'too_many', 'Import up to 200 Dreams per request. Send the rest in more requests.');
  rate('import:' + m.pubkey, 60);
  const out = { imported: [], skipped: [], needs_alt: [], refused: [] };
  for (const o of objects) {
    const id = o && o.id;
    try {
      if (!o || o.type !== 'dream' || o[PROTOCOL.key] !== PROTOCOL.version) fail(422, 'not_a_dream', 'Only Dreams can be imported.');
      if (o.by !== m.pubkey) fail(403, 'not_yours', 'You can only import Dreams signed by your own LooscidID.');
      if (!Number.isInteger(o.at) || o.at > now() + L.clockSkewMs || o.at < Date.UTC(2020, 0, 1)) fail(422, 'bad_time', 'That Dream has an impossible date.');
      if (!(await verifyObject(o))) fail(400, 'bad_signature', 'The signature does not match.');
      if (one('SELECT 1 FROM objects WHERE id = ?', o.id)) { out.skipped.push({ id, reason: 'already_here' }); continue; }
      const b = o.body || {};
      const imgs = Array.isArray(b.media) ? b.media : [];
      const missing = imgs.map((x, i) => (!x || !x.alt || !String(x.alt).trim() ? i + 1 : 0)).filter(Boolean);
      if (missing.length) {
        run('INSERT OR REPLACE INTO import_flags (id, by, reason, detail, at) VALUES (?, ?, ?, ?, ?)', o.id, m.pubkey, 'alt_required', JSON.stringify({ images: missing, text: String(b.text || '').slice(0, 140), at: o.at }), now());
        out.needs_alt.push({ id, images: missing, message: `Image ${missing.join(' and ')} needs alt text before this Dream can go on the server.` });
        continue;
      }
      const text = str(b.text, L.text, 'text') || ''; const media = mediaList(b.media, m.pubkey);
      if (!text.trim() && !media.length) fail(422, 'empty', 'That Dream is empty.');
      const audience = b.audience === 'followers' ? 'followers' : 'public';
      // Replies keep their place in the thread: the Dream they answer must already be here (send it first, in the same
      // request is fine: Dreams are handled in order). Without it, the reply is refused, never turned into a loose Dream.
      let replyTo = null, quoteOf = null;
      if (b.reply_to) { const p = getDream(b.reply_to); if (!p || !canSee(p, m.pubkey)) fail(404, 'parent_missing', 'The Dream this reply answers is not on the server, so the reply stays on your device.'); replyTo = p.id; }
      if (b.quote) { const q = getDream(b.quote); if (q && canSee(q, m.pubkey) && q.audience === 'public') quoteOf = q.id; else fail(404, 'parent_missing', 'The Dream this one quotes is not on the server, so it stays on your device.'); }
      const tags = [...new Set([...text.matchAll(/(?:^|\s)#([\p{L}\p{N}_]{1,40})/gu)].map((x) => x[1].toLowerCase()))].slice(0, 10);
      tx(() => {
        run(`INSERT INTO dreams (id, by, at, text, cw, speak, lang, audience, reply_to, quote, media, tags, published, pub_at, imported) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)`,
          o.id, m.pubkey, o.at, text, str(b.cw, L.cw, 'content warning'), str(b.speak, L.speak, 'speak text'), str(b.lang, 10, 'language'), audience, replyTo, quoteOf, media.length ? JSON.stringify(media) : null, tags.length ? JSON.stringify(tags) : null, o.at);
        run('INSERT INTO feed (kind, dream, by, at, obj) VALUES (?, ?, ?, ?, ?)', 'imported', o.id, m.pubkey, o.at, o.id);
        run('INSERT INTO dreams_fts (id, text, cw) VALUES (?, ?, ?)', o.id, text, b.cw || '');
        log(o); run('DELETE FROM import_flags WHERE id = ?', o.id);
      })();
      out.imported.push(id);
    } catch (e) { if (!(e instanceof RemError)) throw e; out.refused.push({ id, code: e.code, message: e.message }); }
  }
  return out;
}
export const importFlags = (m) => ({ items: all('SELECT id, reason, detail, at FROM import_flags WHERE by = ? ORDER BY at DESC', m.pubkey).map((r) => ({ id: r.id, reason: r.reason, ...JSON.parse(r.detail || '{}'), flagged_at: r.at })) });
export const dismissFlag = (m, id) => ({ ok: run('DELETE FROM import_flags WHERE id = ? AND by = ?', id, m.pubkey).changes > 0 });

// ---------- removing an account and everything it made ----------
export function purge(pk) {
  const media = all('SELECT sha, ext FROM media WHERE by = ?', pk);
  tx(() => {
    const ds = all('SELECT id FROM dreams WHERE by = ?', pk).map((r) => r.id);
    for (const id of ds) { run('DELETE FROM dreams_fts WHERE id = ?', id); run('DELETE FROM feed WHERE dream = ?', id); run('DELETE FROM reacts WHERE of = ?', id); run('DELETE FROM redreams WHERE of = ?', id); run('DELETE FROM votes WHERE of = ?', id); run('UPDATE dreams SET reply_to = NULL WHERE reply_to = ?', id); run('UPDATE dreams SET quote = NULL WHERE quote = ?', id); }
    run('DELETE FROM dreams WHERE by = ?', pk); run('DELETE FROM feed WHERE by = ?', pk); run('DELETE FROM reacts WHERE by = ?', pk); run('DELETE FROM redreams WHERE by = ?', pk);
    run('DELETE FROM votes WHERE by = ?', pk); run('DELETE FROM follows WHERE by = ? OR who = ?', pk, pk); run('DELETE FROM blocks WHERE by = ? OR who = ?', pk, pk);
    run('DELETE FROM chats WHERE by = ? OR to_pk = ?', pk, pk); run('DELETE FROM alerts WHERE to_pk = ? OR actor = ?', pk, pk); run('DELETE FROM sessions WHERE pubkey = ?', pk);
    run('DELETE FROM role_invites WHERE to_pk = ? OR by = ?', pk, pk); run('DELETE FROM reports WHERE by = ?', pk); run('DELETE FROM import_flags WHERE by = ?', pk); run('DELETE FROM objects WHERE by = ? OR to_pk = ?', pk, pk); run('DELETE FROM media WHERE by = ?', pk);
    run('DELETE FROM invites WHERE by = ? OR used_by = ?', pk, pk); run('DELETE FROM owner_claims WHERE pubkey = ?', pk);
    run('DELETE FROM dreamors_fts WHERE pubkey = ?', pk); run('DELETE FROM dreamors WHERE pubkey = ?', pk);
  })();
  for (const m of media) fs.rmSync(path.join(config.dataDir, 'media', `${m.sha}.${m.ext}`), { force: true });
  for (const s of hub.sockets.get(pk) || []) s.close(4001);
}

// ---------- joining, signing in ----------
const RESERVED = new Set(['admin', 'mod', 'mods', 'moderator', 'looscid', 'rem', 'tab', 'support', 'help', 'root', 'system', 'owner', 'staff', 'official', 'everyone', 'here']);
export function ownerClaims() {
  return { items: all('SELECT pubkey, name, at FROM owner_claims ORDER BY at').map((c) => ({ pubkey: c.pubkey, npub: npubEncode(c.pubkey), name: c.name, asked_at: c.at, member: !!member(c.pubkey) })) };
}
// Bind the reserved owner handle (and the owner role) to one LooscidID. Called with the owner code only.
export function bindOwner({ pubkey, name, replace }) {
  if (typeof pubkey === 'string' && pubkey.startsWith('npub1')) { try { pubkey = npubDecode(pubkey); } catch { fail(400, 'bad_pubkey', 'That npub has a typo.'); } }
  if (!isHex(pubkey, 32)) fail(400, 'bad_pubkey', 'Give the LooscidID as an npub or 64 hex characters.');
  const cur = one(`SELECT * FROM dreamors WHERE role = 'owner'`);
  if (cur && cur.pubkey === pubkey) return { ok: true, already: true, owner: dreamorView(cur) };
  if (cur && !replace) fail(409, 'owner_exists', `@${cur.handle} is already the owner. Send "replace": true to move ownership to this key (for example after a lost key).`);
  tx(() => {
    if (cur) { run(`UPDATE dreamors SET role = 'member', handle = ? WHERE pubkey = ?`, (cur.handle + '_old').slice(0, 20), cur.pubkey); run('DELETE FROM dreamors_fts WHERE pubkey = ?', cur.pubkey); }
    const squat = byHandle(config.ownerHandle); if (squat && squat.pubkey !== pubkey) fail(409, 'handle_taken', 'Someone else holds the owner handle. Remove that LooscidID first.');
    const m = member(pubkey);
    const claim = one('SELECT name FROM owner_claims WHERE pubkey = ?', pubkey);
    if (m) run(`UPDATE dreamors SET handle = ?, role = 'owner', suspended = 0 WHERE pubkey = ?`, config.ownerHandle, pubkey);
    else run(`INSERT INTO dreamors (pubkey, handle, name, role, invite_code, created) VALUES (?, ?, ?, 'owner', 'owner-bind', ?)`, pubkey, config.ownerHandle, str(name, L.name, 'name') || claim?.name || config.ownerHandle, now());
    const r = member(pubkey);
    run('DELETE FROM dreamors_fts WHERE pubkey = ?', pubkey); run('INSERT INTO dreamors_fts (pubkey, handle, name, bio) VALUES (?, ?, ?, ?)', pubkey, r.handle, r.name, r.bio);
    run('DELETE FROM owner_claims');
    run('INSERT INTO mod_log (by, action, target, note, at) VALUES (?, ?, ?, ?, ?)', 'owner-code', 'bind_owner', pubkey, cur ? 'replaced ' + cur.pubkey : null, now());
  })();
  return { ok: true, owner: dreamorView(member(pubkey)), next: 'Sign in with this LooscidID. It is the owner now.' };
}
// Clear leftovers (logs, link cards, test traces) on a home that has no members. Refuses otherwise.
export function wipeEmpty() {
  if (one('SELECT count(*) n FROM dreamors').n) fail(409, 'not_empty', 'This home has members. Nothing was wiped.');
  const tables = ['objects', 'dreams', 'feed', 'redreams', 'reacts', 'follows', 'blocks', 'votes', 'chats', 'alerts', 'invites', 'sessions', 'reports', 'media', 'link_cards', 'mod_log', 'import_flags', 'owner_claims', 'role_invites', 'dreams_fts', 'dreamors_fts'];
  const counts = {}; tx(() => { for (const t of tables) counts[t] = run(`DELETE FROM ${t}`).changes; })();
  const dir = path.join(config.dataDir, 'media'); for (const f of fs.readdirSync(dir)) fs.rmSync(path.join(dir, f), { force: true });
  db.exec('VACUUM');
  return { ok: true, cleared: counts };
}
export const ownerClaimed = () => !!one(`SELECT 1 FROM dreamors WHERE role = 'owner'`);
export function joinText(invite, handle) { return `${PROTOCOL.key}-join:${config.host}:${invite}:${handle}`; }
export function loginText(nonce) { return `${PROTOCOL.key}-login:${config.host}:${nonce}`; }
const challenges = new Map();
export function challenge(pubkey) {
  if (!isHex(pubkey, 32)) fail(400, 'bad_pubkey', 'That is not a LooscidID public key.');
  const nonce = crypto.randomBytes(16).toString('hex'); challenges.set(nonce, { pubkey, exp: now() + 5 * 60e3 });
  if (challenges.size > 5000) for (const [k, v] of challenges) if (v.exp < now()) challenges.delete(k);
  return { nonce, sign: loginText(nonce) };
}
export function newSession(pubkey) {
  const token = crypto.randomBytes(32).toString('base64url'); const exp = now() + config.sessionDays * 864e5;
  run('INSERT INTO sessions (token_hash, pubkey, created, expires) VALUES (?, ?, ?, ?)', sha(token), pubkey, now(), exp);
  run('DELETE FROM sessions WHERE expires < ?', now());
  return { token, expires: exp };
}
export async function login({ pubkey, nonce, sig }) {
  const c = challenges.get(nonce); challenges.delete(nonce);
  if (!c || c.pubkey !== pubkey || c.exp < now()) fail(401, 'bad_challenge', 'That sign-in attempt expired. Try again.');
  if (!(await verifyText(sig, loginText(nonce), pubkey))) fail(401, 'bad_signature', 'The signature does not match that LooscidID.');
  const m = member(pubkey); if (!m) fail(403, 'not_member', 'That LooscidID is not a member of this home yet. Join with an invite.');
  if (m.suspended) fail(403, 'suspended', 'This LooscidID is suspended by the moderators.');
  return { ...newSession(pubkey), me: dreamorView(m) };
}
export function session(token) {
  if (!token) return null;
  const s = one('SELECT * FROM sessions WHERE token_hash = ? AND expires > ?', sha(token), now());
  if (!s) return null;
  const m = member(s.pubkey); if (!m || m.suspended) return null;
  return m;
}
export async function join({ invite, handle, pubkey, age_ok, sig, name }) {
  if (age_ok !== true) fail(422, 'age', `${config.appName} is for people ${config.minAge} and older. Check the box to confirm you are ${config.minAge} or older.`);
  if (!isHex(pubkey, 32)) fail(400, 'bad_pubkey', 'That is not a LooscidID public key.');
  handle = String(handle || '').toLowerCase().replace(/^@/, '');
  if (!/^[a-z0-9_]{2,20}$/.test(handle)) fail(422, 'bad_handle', 'A handle is 2 to 20 characters: letters, numbers and underscores, no spaces.');
  if (RESERVED.has(handle)) fail(409, 'handle_taken', `The handle ${handle} is reserved. Pick another.`);
  if (byHandle(handle)) fail(409, 'handle_taken', `The handle ${handle} is taken. Pick another.`);
  if (member(pubkey)) fail(409, 'already_member', 'This LooscidID is already a member. Sign in instead.');
  invite = String(invite || '').trim().toUpperCase();
  const ownerCode = !!(config.ownerInviteSha256 && invite && sha(invite) === config.ownerInviteSha256);
  const ownerFree = !one(`SELECT 1 FROM dreamors WHERE role = 'owner'`);
  // The owner's handle is reserved: nobody gets it just by asking. Ways in: the owner invite code (kept off the
  // server, by whoever runs it), REM_OWNER_PUBKEY pinned to one key, or the admin "bind owner" call, which can
  // promote a pending claim. A claim without the code is only written down as pending.
  const ownerClaim = handle === config.ownerHandle && ownerFree && (ownerCode || (config.ownerPubkey && config.ownerPubkey === pubkey));
  if (ownerCode && handle !== config.ownerHandle) fail(422, 'owner_handle', `The owner invite claims the handle ${config.ownerHandle}.`);
  if (!(await verifyText(sig, joinText(invite, handle), pubkey))) fail(401, 'bad_signature', 'The join signature does not match that LooscidID.');
  const nameOk = str(name, L.name, 'name') || '';
  if (handle === config.ownerHandle && !ownerClaim) {
    if (!ownerFree) fail(409, 'handle_taken', `The handle ${handle} is taken. Pick another.`);
    run('INSERT OR REPLACE INTO owner_claims (pubkey, name, at) VALUES (?, ?, ?)', pubkey, nameOk, now());
    fail(403, 'owner_claim_pending', `The handle ${handle} is reserved for this home's owner. Your request was saved. Once the owner's helper confirms it is you, sign in with this same LooscidID.`);
  }
  let role = 'member', invitedBy = null;
  const isOwnerCode = ownerClaim;
  if (ownerCode && !ownerFree) fail(403, 'invite_used', 'The owner invite was already used.');
  if (isOwnerCode) role = 'owner';
  else {
    const inv = one('SELECT * FROM invites WHERE code = ?', invite);
    if (!inv || inv.revoked) fail(403, 'bad_invite', 'That invite code does not work. Check it, or ask for a new one.');
    if (inv.used_by) fail(403, 'invite_used', 'That invite code was already used. Each code makes one LooscidID.');
    const by = member(inv.by); if (!by || by.suspended) fail(403, 'bad_invite', 'That invite code does not work any more.');
    invitedBy = inv.by;
  }
  tx(() => {
    run('INSERT INTO dreamors (pubkey, handle, name, role, invited_by, invite_code, created) VALUES (?, ?, ?, ?, ?, ?, ?)', pubkey, handle, nameOk, role, invitedBy, isOwnerCode ? 'owner' : invite, now());
    if (!isOwnerCode) run('UPDATE invites SET used_by = ?, used_at = ? WHERE code = ?', pubkey, now(), invite);
    run('INSERT INTO dreamors_fts (pubkey, handle, name, bio) VALUES (?, ?, ?, ?)', pubkey, handle, nameOk, '');
  })();
  if (invitedBy) alert(invitedBy, 'follow', pubkey); // nudges the inviter that their friend arrived
  return { ...newSession(pubkey), me: dreamorView(member(pubkey)) };
}

// ---------- invites ----------
export function inviteState(m) {
  const mine = all('SELECT code, created, used_by, used_at, revoked FROM invites WHERE by = ? ORDER BY created DESC', m.pubkey)
    .map((i) => ({ code: i.code, created: i.created, used: !!i.used_by, used_by: i.used_by ? dreamorView(member(i.used_by)) : undefined, revoked: !!i.revoked }));
  let left, opensAt = null;
  if (isStaff(m)) left = config.invites.staffMax - mine.filter((i) => !i.used && !i.revoked).length;
  else {
    opensAt = m.created + config.invites.waitDays * 864e5;
    left = now() < opensAt ? 0 : Math.max(0, config.invites.perUser - mine.filter((i) => !i.revoked || i.used).length);
  }
  return { invites: mine, left: Math.max(0, left), opens_at: opensAt && opensAt > now() ? opensAt : undefined, per_user: config.invites.perUser, wait_days: config.invites.waitDays };
}
export function makeInvite(m) {
  const st = inviteState(m);
  if (st.left <= 0) fail(403, 'no_invites', st.opens_at ? `You get ${config.invites.perUser} invites after your first ${config.invites.waitDays} days.` : 'You have no invites left.');
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code = '';
  for (const b of crypto.randomBytes(10)) code += A[b % A.length];
  run('INSERT INTO invites (code, by, created) VALUES (?, ?, ?)', code, m.pubkey, now());
  return { code, invite_link: `${config.publicUrl}/#join=${code}` };
}

// ---------- reading lists ----------
export function alerts(m, { before, limit = 30 } = {}) {
  limit = Math.max(1, Math.min(50, Number(limit) || 30));
  const rows = all('SELECT * FROM alerts WHERE to_pk = ? AND seq < ? ORDER BY seq DESC LIMIT ?', m.pubkey, Number(before) || 9e15, limit)
    .filter((a) => !blockedEither(m.pubkey, a.actor) && member(a.actor));
  return { items: rows.map((a) => alertView(a, m.pubkey)), next: rows.length === limit ? rows[rows.length - 1].seq : null, unseen: one('SELECT count(*) n FROM alerts WHERE to_pk = ? AND seen = 0', m.pubkey).n };
}
export function chatList(m) {
  const rows = all(`SELECT CASE WHEN by = @me THEN to_pk ELSE by END who, max(at) last FROM chats WHERE (by = @me OR to_pk = @me) AND deleted = 0 GROUP BY who ORDER BY last DESC LIMIT 100`, { me: m.pubkey });
  return { items: rows.map((r) => ({ with: dreamorView(member(r.who), m.pubkey), last_at: r.last })) };
}
export function chatWith(m, other, { before, limit = 50 } = {}) {
  limit = Math.max(1, Math.min(100, Number(limit) || 50));
  const rows = all(`SELECT raw, at FROM chats WHERE deleted = 0 AND ((by = @me AND to_pk = @o) OR (by = @o AND to_pk = @me)) AND at < @before ORDER BY at DESC LIMIT @limit`, { me: m.pubkey, o: other, before: Number(before) || 9e15, limit });
  return { items: rows.map((r) => JSON.parse(r.raw)).reverse(), next: rows.length === limit ? rows[rows.length - 1].at : null };
}
export function sync(m, since = 0, limit = 500) {
  limit = Math.max(1, Math.min(1000, Number(limit) || 500));
  const rows = all('SELECT seq, raw FROM objects WHERE (by = @me OR to_pk = @me) AND seq > @since ORDER BY seq ASC LIMIT @limit', { me: m.pubkey, since: Number(since) || 0, limit });
  return { objects: rows.map((r) => JSON.parse(r.raw)), cursor: rows.length ? rows[rows.length - 1].seq : Number(since) || 0, more: rows.length === limit };
}
function ftsQuery(q) {
  const terms = String(q || '').normalize('NFKC').match(/[\p{L}\p{N}_]+/gu) || [];
  return terms.slice(0, 8).map((t) => `"${t.replace(/"/g, '')}"*`).join(' ');
}
export function search(q, v, staff, type = 'all') {
  const fq = ftsQuery(q); if (!fq) return { dreamors: [], dreams: [] };
  const out = {};
  if (type !== 'dreams') out.dreamors = all(`SELECT d.* FROM dreamors_fts f JOIN dreamors d ON d.pubkey = f.pubkey WHERE dreamors_fts MATCH ? AND (d.suspended = 0 OR ?) ORDER BY rank LIMIT 20`, fq, staff ? 1 : 0)
    .filter((m) => !v || !blockedEither(v, m.pubkey)).map((m) => dreamorView(m, v));
  if (type !== 'dreamors') out.dreams = all(`SELECT d.* FROM dreams_fts f JOIN dreams d ON d.id = f.id JOIN dreamors a ON a.pubkey = d.by WHERE dreams_fts MATCH @q AND d.published = 1 AND ${VIS} ORDER BY rank LIMIT 30`, { q: fq, v: v || '', staff: staff ? 1 : 0 })
    .map((d) => dreamItem(d, v, staff));
  return out;
}
export function trending(v, staff) {
  const since = now() - 864e5;
  const tags = {};
  for (const r of all(`SELECT d.tags FROM dreams d JOIN dreamors a ON a.pubkey = d.by WHERE d.tags IS NOT NULL AND d.published = 1 AND d.pub_at > ? AND d.audience = 'public' AND d.deleted = 0 AND d.hidden = 0 AND a.suspended = 0`, since))
    for (const t of JSON.parse(r.tags)) tags[t] = (tags[t] || 0) + 1;
  const top = all(`SELECT d.*, (SELECT count(*) FROM reacts r WHERE r.of = d.id AND r.at > @since) + 2 * (SELECT count(*) FROM redreams x WHERE x.of = d.id AND x.at > @since) + (SELECT count(*) FROM dreams y WHERE y.reply_to = d.id AND y.pub_at > @since AND y.deleted = 0) score
    FROM dreams d JOIN dreamors a ON a.pubkey = d.by WHERE d.audience = 'public' AND d.published = 1 AND d.pub_at > @old AND ${VIS} ORDER BY score DESC, d.pub_at DESC LIMIT 10`, { since, old: now() - 3 * 864e5, v: v || '', staff: staff ? 1 : 0 })
    .filter((d) => d.score > 0);
  return { window: '24 hours', tags: Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag, count]) => ({ tag, count })), dreams: top.map((d) => ({ ...dreamItem(d, v, staff), score: d.score })) };
}

// ---------- moderation ----------
export function reports(status = 'open') {
  return { items: all('SELECT * FROM reports WHERE status = ? ORDER BY at DESC LIMIT 200', status).map((r) => {
    const out = { id: r.id, kind: r.target_kind, target: r.target, reason: r.reason, note: r.note, at: r.at, status: r.status, by: dreamorView(member(r.by)), resolution: r.resolution || undefined };
    if (r.target_kind === 'dream') { const d = one('SELECT * FROM dreams WHERE id = ?', r.target); if (d) { out.dream = dreamItem(d, null, true); out.dream.hidden = !!d.hidden; out.dream.deleted = !!d.deleted; } }
    if (r.target_kind === 'dreamor') out.dreamor = dreamorView(member(r.target));
    if (r.target_kind === 'chat') {
      const c = one('SELECT by FROM chats WHERE id = ?', r.target); out.chat_from = c ? dreamorView(member(c.by)) : null;
      if (r.evidence) { try { out.evidence = JSON.parse(r.evidence); } catch {} }
    }
    return out;
  }) };
}
export async function checkEvidence(rep) {
  // A Chat report can carry the decrypted inner message. It is signed by the sender, so a moderator can trust it.
  if (!rep.evidence) return rep;
  const c = one('SELECT by FROM chats WHERE id = ?', rep.target);
  const e = rep.evidence;
  rep.evidence_verified = !!(c && e && e.by === c.by && e.type === 'chat_message' && (await verifyObject(e)));
  return rep;
}
export function modAction(staff, args) {
  const { target, action } = args; let { note } = args;
  note = str(note, 500, 'note');
  const ok = (extra = {}) => { run('INSERT INTO mod_log (by, action, target, note, at) VALUES (?, ?, ?, ?, ?)', staff.pubkey, action, String(target), note, now()); return { ok: true, action, target, ...extra }; };
  switch (action) {
    case 'hide': case 'unhide': {
      const d = getDream(target); if (!d) fail(404, 'not_found', 'No Dream with that id.');
      run('UPDATE dreams SET hidden = ? WHERE id = ?', action === 'hide' ? 1 : 0, d.id);
      if (action === 'hide') broadcastUpdate(d.id, 'remove');
      return ok();
    }
    case 'suspend': case 'unsuspend': {
      const m = needMember(target); if (m.role === 'owner') fail(403, 'owner', 'The owner cannot be suspended.');
      if (m.role === 'mod' && staff.role !== 'owner') fail(403, 'mods', 'Only the owner can suspend a moderator.');
      run('UPDATE dreamors SET suspended = ? WHERE pubkey = ?', action === 'suspend' ? 1 : 0, m.pubkey);
      if (action === 'suspend') { run('DELETE FROM sessions WHERE pubkey = ?', m.pubkey); for (const s of hub.sockets.get(m.pubkey) || []) s.close(4003); }
      return ok();
    }
    case 'revoke_invites': { const m = needMember(target); const r = run('UPDATE invites SET revoked = 1 WHERE by = ? AND used_by IS NULL', m.pubkey); return ok({ revoked: r.changes }); }
    case 'resolve': case 'reopen': {
      const r = one('SELECT * FROM reports WHERE id = ?', target); if (!r) fail(404, 'not_found', 'No report with that id.');
      run('UPDATE reports SET status = ?, resolved_by = ?, resolved_at = ?, resolution = ? WHERE id = ?', action === 'resolve' ? 'resolved' : 'open', staff.pubkey, now(), note, r.id);
      return ok();
    }
    case 'invite_role': {
      // Roles are offered, never forced: the Dreamor gets a notification and accepts or declines it.
      const role = args.role;
      if (!['admin', 'mod'].includes(role)) fail(422, 'bad_role', 'The role can be "admin" or "mod".');
      if (!(staff.role === 'owner' || (staff.role === 'admin' && role === 'mod'))) fail(403, 'not_allowed', role === 'admin' ? 'Only the owner can invite admins.' : 'Only the owner and admins can invite moderators.');
      const m = isHex(target, 32) ? needMember(target) : byHandle(target); if (!m) fail(404, 'no_such_dreamor', 'No Dreamor with that handle.');
      if (ROLE_RANK[m.role] >= ROLE_RANK[role]) fail(409, 'already', `@${m.handle} already has that role or a higher one.`);
      if (one(`SELECT 1 FROM role_invites WHERE to_pk = ? AND role = ? AND status = 'pending'`, m.pubkey, role)) fail(409, 'pending', `@${m.handle} already has a pending ${role} invite.`);
      const id = crypto.randomBytes(16).toString('hex');
      run('INSERT INTO role_invites (id, to_pk, role, by, at) VALUES (?, ?, ?, ?, ?)', id, m.pubkey, role, staff.pubkey, now());
      alert(m.pubkey, 'role_invite', staff.pubkey, id);
      return ok({ invite: id, to: m.handle, role });
    }
    case 'revoke_role': case 'unmake_mod': {
      const m = isHex(target, 32) ? needMember(target) : byHandle(target); if (!m) fail(404, 'no_such_dreamor', 'No Dreamor with that handle.');
      if (m.role === 'owner') fail(403, 'owner', 'The owner role cannot be taken away here.');
      if (!(staff.role === 'owner' || (staff.role === 'admin' && m.role === 'mod'))) fail(403, 'not_allowed', 'Only the owner can take away roles (admins can take away moderator).');
      run(`UPDATE dreamors SET role = 'member' WHERE pubkey = ?`, m.pubkey);
      run(`UPDATE role_invites SET status = 'revoked', answered_at = ? WHERE to_pk = ? AND status = 'pending'`, now(), m.pubkey);
      return ok({ handle: m.handle });
    }
    case 'remove_account': {
      if (staff.role !== 'owner') fail(403, 'owner_only', 'Only the owner can remove a LooscidID.');
      const m = needMember(target); if (m.role === 'owner') fail(403, 'owner', 'The owner\'s LooscidID cannot be removed.');
      purge(m.pubkey); return ok();
    }
    case 'rebind_key': {
      // A lost key: give the handle (and the account's place) to a new LooscidID, after the owner checked it is really them.
      if (staff.role !== 'owner') fail(403, 'owner_only', 'Only the owner can move a LooscidID to a new key.');
      fail(501, 'not_yet', 'Moving a LooscidID to a new key is planned for the next version.');
    }
    default: fail(422, 'bad_action', 'Unknown action.');
  }
}
export function modLog() {
  return {
    log: all('SELECT * FROM mod_log ORDER BY seq DESC LIMIT 200').map((r) => ({ by: member(r.by)?.handle || r.by, action: r.action, target: member(r.target)?.handle || r.target, note: r.note, at: r.at })),
    role_invites: all('SELECT * FROM role_invites ORDER BY at DESC LIMIT 100').map((r) => ({ id: r.id, to: member(r.to_pk)?.handle, role: r.role, by: member(r.by)?.handle, at: r.at, status: r.status, answered_at: r.answered_at })),
  };
}
export function inviteTree() {
  const rows = all('SELECT pubkey, handle, name, role, invited_by, created, suspended FROM dreamors ORDER BY created');
  return { dreamors: rows.map((r) => ({ pubkey: r.pubkey, handle: r.handle, name: r.name, role: r.role, invited_by: r.invited_by, joined: r.created, suspended: !!r.suspended,
    invites_used: one('SELECT count(*) n FROM invites WHERE by = ? AND used_by IS NOT NULL', r.pubkey).n })) };
}
export function stats() {
  const c = (t, w = '') => one(`SELECT count(*) n FROM ${t} ${w}`).n;
  return { dreamors: c('dreamors'), dreams: c('dreams', 'WHERE deleted = 0'), chats: c('chats'), media: c('media'), open_reports: c('reports', "WHERE status = 'open'"), objects: c('objects') };
}
