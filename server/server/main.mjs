// The Looscid home server: HTTPS JSON API under /rem/v0, the Rem live stream (one WebSocket), uploaded media,
// the backup download, the Looscid app at / (webapp/) and the classic web client at /classic/ (public/).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { config } from './config.mjs';
import { db, dbPath, one, run } from './db.mjs';
import * as R from './rem.mjs';
import { cleanImage, parseMultipart } from './media.mjs';
import { accept } from './live.mjs';
import { fetchCard } from './linkcard.mjs';
import { PROTOCOL, isHex } from '../public/js/rem-core.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// public/ is the classic web client (with the owner's Mod tools), served at /classic/.
// webapp/ is the real Looscid app (github.com/Looscid/Looscid, the app/ folder at the commit in scripts/app-commit.txt),
// copied in by scripts/fetch-app.sh and served at /. Without webapp/, the classic client is served at / as before.
const pub = path.join(root, 'public');
const web = path.join(root, 'webapp');
const B = PROTOCOL.base;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.wasm': 'application/wasm', '.xml': 'application/xml', '.pdf': 'application/pdf' };
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Rem-Alt, X-Rem-Backup-Key, X-Rem-Owner-Code', 'Access-Control-Max-Age': '86400' };
const SEC = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Permissions-Policy': 'geolocation=(), camera=(), microphone=()' };
const started = Date.now();

function send(res, status, body, headers = {}) {
  const data = Buffer.from(JSON.stringify(body));
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': data.length, 'Cache-Control': 'no-store', ...CORS, ...SEC, ...headers });
  res.end(data);
}
const oops = (res, e) => {
  if (e instanceof R.RemError) return send(res, e.status, { ok: false, code: e.code, message: e.message });
  console.error(new Date().toISOString(), e);
  return send(res, 500, { ok: false, code: 'server_error', message: 'Something broke on the server. Try again in a moment.' });
};
function body(req, max = 256 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on('data', (c) => { n += c.length; if (n > max) { reject(new R.RemError(413, 'too_big', `That is too big. The limit is ${Math.round(max / 1024 / 1024 * 10) / 10} MB.`)); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
async function json(req) { const b = await body(req); try { return JSON.parse(b.toString('utf8') || '{}'); } catch { throw new R.RemError(400, 'bad_json', 'The request is not valid JSON.'); } }
const tokenOf = (req) => (/^Bearer\s+(\S+)$/i.exec(req.headers.authorization || '') || [])[1];
const who = (req) => R.session(tokenOf(req));
function need(req) { const m = who(req); if (!m) throw new R.RemError(401, 'sign_in', 'Sign in first.'); return m; }
function reader(req) { const m = who(req); if (!m && !config.publicRead) throw new R.RemError(401, 'sign_in', 'Sign in to read this home. It is members only.'); return m; }
const ipOf = (req) => req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '?';   // used only for in-memory rate limits, never stored

function wellKnown() {
  return { protocol: `${PROTOCOL.key}/${PROTOCOL.version}`, protocol_name: PROTOCOL.name, api: B, live: PROTOCOL.live, home: config.host, name: config.appName,
    invite_only: true, owner_handle: config.ownerHandle, owner_claimed: R.ownerClaimed(), min_age: config.minAge, public_read: config.publicRead, nostr_bridge: false, chats: 'mutuals_only, end-to-end encrypted (NIP-44 v2)',
    limits: config.limits, invites: config.invites, spec: 'https://github.com/2three1y/looscidserver/blob/main/PROTOCOL.md', software: 'looscidserver 0.1.0' };
}

async function api(req, res, url) {
  const p = url.pathname.slice(B.length) || '/'; const q = Object.fromEntries(url.searchParams); const M = req.method;
  let m;
  if (M === 'GET' && p === '/') return send(res, 200, wellKnown());
  if (M === 'POST' && p === '/join') { R.rate('join:' + ipOf(req), 30); /* friends at one school can share one address */ return send(res, 200, await R.join(await json(req))); }
  if (M === 'POST' && p === '/auth/challenge') { R.rate('auth:' + ipOf(req), 60); return send(res, 200, R.challenge((await json(req)).pubkey)); }
  if (M === 'POST' && p === '/auth/login') { R.rate('login:' + ipOf(req), 60); return send(res, 200, await R.login(await json(req))); }
  if (M === 'POST' && p === '/auth/logout') { const t = tokenOf(req); if (t) run('DELETE FROM sessions WHERE token_hash = ?', R.sha(t)); return send(res, 200, { ok: true }); }
  if (M === 'GET' && p === '/me') { m = need(req); return send(res, 200, { me: R.dreamorView(m), counts: R.counts(m.pubkey), chats_from: m.chats_from, staff: R.isStaff(m) }); }
  if (M === 'POST' && p === '/objects') { m = need(req); const o = await json(req); if (o.by !== m.pubkey) throw new R.RemError(403, 'wrong_signer', 'Signed by a different LooscidID than the one signed in.'); return send(res, 200, await R.acceptObject(o)); }
  if (M === 'POST' && p === '/media') return upload(req, res);
  if (M === 'GET' && (p === '/feed/dreamline' || p === '/feed/home')) { m = need(req); return send(res, 200, R.feed('dreamline', m.pubkey, { ...q, staff: R.isStaff(m) })); }
  if (M === 'GET' && p === '/feed/discover') { m = reader(req); return send(res, 200, R.feed('discover', m?.pubkey, { ...q, staff: R.isStaff(m) })); }
  let x;
  if (M === 'GET' && (x = /^\/objects\/([0-9a-f]{64})$/.exec(p))) {
    m = reader(req); const d = one('SELECT * FROM dreams WHERE id = ?', x[1]);
    if (d && R.canSee(d, m?.pubkey, R.isStaff(m))) return send(res, 200, { item: R.dreamItem(d, m?.pubkey, R.isStaff(m)) });
    const o = one('SELECT raw, by, to_pk FROM objects WHERE id = ?', x[1]);
    if (o && m && (o.by === m.pubkey || o.to_pk === m.pubkey)) return send(res, 200, { object: JSON.parse(o.raw) });
    throw new R.RemError(404, 'not_found', 'Nothing with that id that you can see.');
  }
  if (M === 'GET' && (x = /^\/dreams\/([0-9a-f]{64})\/thread$/.exec(p))) { m = reader(req); return send(res, 200, R.thread(x[1], m?.pubkey, R.isStaff(m))); }
  if (M === 'GET' && (x = /^\/dreams\/([0-9a-f]{64})\/history$/.exec(p))) {
    m = reader(req); const d = one('SELECT * FROM dreams WHERE id = ?', x[1]); if (!R.canSee(d, m?.pubkey, R.isStaff(m))) throw new R.RemError(404, 'not_found', 'That Dream is not here.');
    const edits = db.prepare(`SELECT raw FROM objects WHERE type = 'edit' AND by = ? AND json_extract(raw, '$.body.of') = ? ORDER BY seq`).all(d.by, d.id).map((r) => JSON.parse(r.raw));
    const orig = one('SELECT raw FROM objects WHERE id = ?', d.id); return send(res, 200, { original: orig ? JSON.parse(orig.raw) : null, edits });
  }
  if (M === 'GET' && (x = /^\/dreamors\/([^/]+)(\/dreams)?$/.exec(p))) {
    m = reader(req); const key = decodeURIComponent(x[1]); const t = isHex(key, 32) ? R.member(key) : R.byHandle(key);
    if (!t || (t.suspended && !R.isStaff(m))) throw new R.RemError(404, 'not_found', 'No Dreamor by that name here.');
    if (m && one('SELECT 1 FROM blocks WHERE by = ? AND who = ?', t.pubkey, m.pubkey)) throw new R.RemError(404, 'not_found', 'No Dreamor by that name here.');
    if (x[2]) return send(res, 200, R.feed('profile', m?.pubkey, { ...q, pk: t.pubkey, staff: R.isStaff(m) }));
    return send(res, 200, { dreamor: R.dreamorView(t, m?.pubkey), counts: R.counts(t.pubkey) });
  }
  if (M === 'GET' && (p === '/alerts' || p === '/notifications')) { m = need(req); return send(res, 200, R.alerts(m, q)); }
  if (M === 'POST' && p === '/alerts/seen') { m = need(req); run('UPDATE alerts SET seen = 1 WHERE to_pk = ?', m.pubkey); return send(res, 200, { ok: true }); }
  if (M === 'GET' && p === '/chats') { m = need(req); return send(res, 200, R.chatList(m)); }
  if (M === 'GET' && (x = /^\/chats\/([0-9a-f]{64})$/.exec(p))) { m = need(req); return send(res, 200, R.chatWith(m, x[1], q)); }
  if (M === 'GET' && p === '/sync') { m = need(req); return send(res, 200, R.sync(m, q.since, q.limit)); }
  if (M === 'GET' && p === '/export') {
    m = need(req); const all = []; let c = 0, r;
    do { r = R.sync(m, c, 1000); all.push(...r.objects); c = r.cursor; } while (r.more);
    return send(res, 200, { exported_at: Date.now(), home: config.host, protocol: `${PROTOCOL.key}/${PROTOCOL.version}`, me: R.dreamorView(m), objects: all }, { 'Content-Disposition': `attachment; filename="looscid-${m.handle}-export.json"` });
  }
  if (M === 'POST' && p === '/import') { m = need(req); const b = await jsonBig(req); return send(res, 200, await R.importDreams(m, b.objects)); }
  if (M === 'GET' && p === '/import/flags') { m = need(req); return send(res, 200, R.importFlags(m)); }
  if (M === 'POST' && p === '/import/flags/dismiss') { m = need(req); return send(res, 200, R.dismissFlag(m, (await json(req)).id)); }
  if (M === 'GET' && p === '/search') { m = reader(req); return send(res, 200, R.search(q.q, m?.pubkey, R.isStaff(m), q.type)); }
  if (M === 'GET' && p === '/trending') { m = reader(req); return send(res, 200, R.trending(m?.pubkey, R.isStaff(m))); }
  if (M === 'GET' && p === '/invites') { m = need(req); return send(res, 200, R.inviteState(m)); }
  if (M === 'POST' && p === '/invites') { m = need(req); return send(res, 200, R.makeInvite(m)); }
  if (p.startsWith('/mod/')) {
    m = who(req);
    const code = req.headers['x-rem-owner-code'];   // before the owner has claimed the home, the fallback owner code opens the mod tools
    if (!m && code && !R.ownerClaimed() && config.ownerInviteSha256 && R.sha(String(code).trim().toUpperCase()) === config.ownerInviteSha256) m = { pubkey: 'owner-code', role: 'owner' };
    if (!m) throw new R.RemError(401, 'sign_in', 'Sign in first.');
    if (!R.isStaff(m)) throw new R.RemError(403, 'staff_only', 'Only moderators can open this.');
    if (M === 'GET' && p === '/mod/reports') { const r = R.reports(q.status || 'open'); for (const it of r.items) await R.checkEvidence(it); return send(res, 200, r); }
    if (M === 'POST' && p === '/mod/action') return send(res, 200, R.modAction(m, await json(req)));
    if (M === 'GET' && p === '/mod/tree') return send(res, 200, R.inviteTree());
    if (M === 'GET' && p === '/mod/log') return send(res, 200, R.modLog());
    if (M === 'GET' && p === '/mod/linkcheck') { try { return send(res, 200, { ok: true, card: await fetchCard(String(q.url || '')) }); } catch (e) { return send(res, 200, { ok: false, why: e.message }); } }
    if (M === 'GET' && p === '/mod/stats') return send(res, 200, { ...R.stats(), memory_mb: Math.round(process.memoryUsage().rss / 1048576), up_since: started });
  }
  if (M === 'GET' && p === '/admin/backup') return backup(req, res);
  if (p === '/admin/owner' || p === '/admin/owner-claims' || p === '/admin/remove' || p === '/admin/wipe-empty') {
    // Only with the owner code (kept by whoever runs the home; the server holds only its hash).
    R.rate('ownercode:' + ipOf(req), 20);
    const code = String(req.headers['x-rem-owner-code'] || '').trim().toUpperCase();
    if (!code || !config.ownerInviteSha256 || R.sha(code) !== config.ownerInviteSha256) throw new R.RemError(403, 'owner_code', 'This needs the owner code.');
    if (M === 'GET' && p === '/admin/owner-claims') return send(res, 200, R.ownerClaims());
    if (M === 'POST' && p === '/admin/owner') return send(res, 200, R.bindOwner(await json(req)));
    if (M === 'POST' && p === '/admin/wipe-empty') return send(res, 200, R.wipeEmpty());
    if (M === 'POST' && p === '/admin/remove') { const b = await json(req); if (!isHex(b.pubkey, 32) || !R.member(b.pubkey)) throw new R.RemError(404, 'not_found', 'No such member.'); R.purge(b.pubkey); return send(res, 200, { ok: true, removed: b.pubkey }); }
  }
  throw new R.RemError(404, 'no_route', `There is no ${M} ${B}${p}.`);
}
async function jsonBig(req) { const b = await body(req, 8 * 1024 * 1024); try { return JSON.parse(b.toString('utf8')); } catch { throw new R.RemError(400, 'bad_json', 'The request is not valid JSON.'); } }

async function upload(req, res) {
  const m = need(req); R.rate('media:' + m.pubkey, config.rate.media);
  const ct = req.headers['content-type'] || '';
  const raw = await body(req, config.limits.imageBytes + 64 * 1024);
  let file = raw, alt = req.headers['x-rem-alt'] ? decodeURIComponent(String(req.headers['x-rem-alt'])) : '';
  if (/multipart\/form-data/i.test(ct)) { const mp = parseMultipart(raw, ct); if (!mp || !mp.file) throw new R.RemError(400, 'no_file', 'No file found in the upload.'); file = mp.file; alt = mp.fields.alt || alt; }
  alt = (alt || '').trim();
  if (!alt) throw new R.RemError(422, 'alt_required', 'Alt text is required: describe what is in the image so everyone can know what it shows.');
  if ([...alt].length > config.limits.alt) throw new R.RemError(422, 'alt_too_long', `Alt text can be up to ${config.limits.alt} characters.`);
  if (file.length > config.limits.imageBytes) throw new R.RemError(413, 'too_big', 'Images can be up to 5 MB.');
  const img = cleanImage(file);
  const dest = path.join(config.dataDir, 'media', `${img.sha}.${img.ext}`);
  if (!fs.existsSync(dest)) { fs.writeFileSync(dest + '.tmp', img.data); fs.renameSync(dest + '.tmp', dest); }
  const row = one('SELECT * FROM media WHERE sha = ?', img.sha);
  if (row && row.by !== m.pubkey) throw new R.RemError(409, 'media_exists', 'Someone else already uploaded this exact image. Use your own copy (even a tiny edit makes it yours).');
  if (!row) run('INSERT INTO media (sha, by, mime, ext, bytes, w, h, alt, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', img.sha, m.pubkey, img.mime, img.ext, img.data.length, img.w, img.h, alt, Date.now());
  return send(res, 200, { media: { url: `/media/${img.sha}.${img.ext}`, mime: img.mime, alt, w: img.w, h: img.h, bytes: img.data.length }, stripped: 'metadata removed (location, camera, dates)' });
}

async function backup(req, res) {
  const key = req.headers['x-rem-backup-key'];
  const m = who(req);
  const okKey = key && config.backupKeySha256 && crypto.timingSafeEqual(Buffer.from(R.sha(String(key))), Buffer.from(config.backupKeySha256));
  if (!okKey && !(m && m.role === 'owner')) throw new R.RemError(403, 'owner_only', 'Only the owner (or the backup key) can download backups.');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = fs.mkdtempSync(path.join(config.dataDir, 'backup-'));
  try {
    db.prepare('VACUUM INTO ?').run(path.join(dir, 'looscid.db'));
    fs.writeFileSync(path.join(dir, 'backup.json'), JSON.stringify({ made_at: new Date().toISOString(), home: config.host, protocol: `${PROTOCOL.key}/${PROTOCOL.version}`, ...R.stats() }, null, 1));
  } catch (e) { fs.rmSync(dir, { recursive: true, force: true }); throw e; }
  res.writeHead(200, { 'Content-Type': 'application/gzip', 'Content-Disposition': `attachment; filename="looscid-backup-${stamp}.tar.gz"`, 'Cache-Control': 'no-store', ...CORS });
  const tar = spawn('tar', ['-czf', '-', '-C', dir, 'looscid.db', 'backup.json', '-C', config.dataDir, 'media'], { stdio: ['ignore', 'pipe', 'ignore'] });
  tar.stdout.pipe(res);
  const done = () => fs.rmSync(dir, { recursive: true, force: true });
  tar.on('close', done); res.on('close', () => { tar.kill(); });
}

// The Looscid app's pages carry their own Content-Security-Policy (a meta tag), the same one they have on GitHub Pages;
// the header here only adds what a meta tag can't say: no other website may frame them.
const APP_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' };
function serveFile(req, res, file, cache, opts = {}) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      if (opts.notFound) return opts.notFound();
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SEC }); return res.end('Not found');
    }
    const ext = path.extname(file).toLowerCase();
    const etag = `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache, ETag: etag, 'Accept-Ranges': 'bytes', ...(opts.app ? APP_HEADERS : SEC) };
    if (ext === '.html') headers['Content-Security-Policy'] = opts.app ? "frame-ancestors 'self'" : `default-src 'self'; img-src 'self' data: blob:; connect-src 'self' wss://${config.host} ws://${config.host}; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`;
    const status = opts.status || 200;
    if (status === 200 && req.headers['if-none-match'] === etag) { res.writeHead(304, headers); return res.end(); }
    const range = status === 200 && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && (range[1] || range[2])) {
      let a = range[1] ? Number(range[1]) : Math.max(0, st.size - Number(range[2])), b = range[1] && range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1;
      if (a > b || a >= st.size) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}`, ...SEC }); return res.end(); }
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${a}-${b}/${st.size}`, 'Content-Length': b - a + 1 });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(file, { start: a, end: b }).pipe(res);
    }
    res.writeHead(status, { ...headers, 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

// A path inside a folder, or null if it would climb out of it.
function inside(dir, p) {
  const file = path.join(dir, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
  return file === dir || file.startsWith(dir + path.sep) ? file : null;
}
function redirect(res, to) { res.writeHead(302, { Location: to, 'Cache-Control': 'no-cache', ...SEC }); return res.end(); }

// The classic web client, at /classic/ (and /classic/mod for the Mod page).
function serveClassic(req, res, p) {
  if (p === '/' || p === '/mod' || p === '/mod/') p = '/index.html';
  const file = inside(pub, p);
  if (!file) return send(res, 404, { ok: false, code: 'not_found', message: 'Not found.' });
  return serveFile(req, res, file, 'no-cache');
}

// The Looscid app, at /. Works like GitHub Pages: a folder serves its index.html (a folder without its slash gets one),
// and any other unknown address gets the app's 404.html, which opens the app on that page (?p=...).
function serveApp(req, res, url, p) {
  const notFound = () => serveFile(req, res, path.join(web, '404.html'), 'no-cache', { app: true, status: 404 });
  const file = inside(web, p);
  if (!file) return notFound();
  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) {
      if (!p.endsWith('/')) return redirect(res, url.pathname + '/' + url.search);
      return serveFile(req, res, path.join(file, 'index.html'), 'no-cache', { app: true, notFound });
    }
    return serveFile(req, res, file, 'no-cache', { app: true, notFound });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (req.method === 'OPTIONS') { res.writeHead(204, { ...CORS }); return res.end(); }
    if (url.pathname === '/.well-known/looscid') return send(res, 200, wellKnown(), { 'Cache-Control': 'public, max-age=300' });
    if (url.pathname === '/healthz') return send(res, 200, { ok: true, up_s: Math.round((Date.now() - started) / 1000), rss_mb: Math.round(process.memoryUsage().rss / 1048576) });
    if (url.pathname === B || url.pathname.startsWith(B + '/')) return await api(req, res, url);
    let x;
    if ((x = /^\/media\/([0-9a-f]{64}\.(?:jpg|png|webp))$/.exec(url.pathname))) return serveFile(req, res, path.join(config.dataDir, 'media', x[1]), 'public, max-age=31536000, immutable');
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { ok: false, code: 'method', message: 'Not allowed.' });
    let p; try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, { ok: false, code: 'bad_path', message: 'That address is not valid.' }); }
    if (p === '/classic') return redirect(res, '/classic/' + url.search);
    if (p.startsWith('/classic/')) return serveClassic(req, res, p.slice('/classic'.length));
    if (!fs.existsSync(path.join(web, 'index.html'))) return serveClassic(req, res, p);
    if (p === '/mod' || p === '/mod/') return redirect(res, '/classic/mod' + url.search + url.hash);
    const lo = /^\/looscid(\/|$)/i.exec(p);
    if (lo) return redirect(res, '/' + url.pathname.slice(lo[0].length) + url.search);
    return serveApp(req, res, url, p);
  } catch (e) { return oops(res, e); }
});

// ---------- the live stream ----------
server.on('upgrade', (req, sock) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname !== PROTOCOL.live) { sock.end('HTTP/1.1 404 Not Found\r\n\r\n'); return; }
  const ws = accept(req, sock); if (!ws) return;
  ws.streams = new Set(['dreamline', 'discover', 'alerts', 'chats']); ws.me = null;
  const attach = (m) => { ws.me = m; if (!R.hub.sockets.has(m.pubkey)) R.hub.sockets.set(m.pubkey, new Set()); R.hub.sockets.get(m.pubkey).add(ws); ws.send({ op: 'hello', me: R.dreamorView(m), streams: [...ws.streams], unseen_alerts: one('SELECT count(*) n FROM alerts WHERE to_pk = ? AND seen = 0', m.pubkey).n }); };
  const qt = url.searchParams.get('token'); if (qt) { const m = R.session(qt); if (m) attach(m); else { ws.send({ op: 'err', code: 'sign_in', message: 'Sign in first.' }); ws.close(4001); return; } }
  const authTimer = setTimeout(() => { if (!ws.me) ws.close(4001); }, 15000);
  ws.onclose = () => { clearTimeout(authTimer); if (ws.me) { const set = R.hub.sockets.get(ws.me.pubkey); set?.delete(ws); if (set && !set.size) R.hub.sockets.delete(ws.me.pubkey); } };
  ws.onmessage = async (text) => {
    let msg; try { msg = JSON.parse(text); } catch { return ws.send({ op: 'err', code: 'bad_json', message: 'Send JSON.' }); }
    if (msg.op === 'ping') return ws.send({ op: 'pong', t: Date.now() });
    if (msg.op === 'auth') { const m = R.session(msg.token); if (!m) { ws.send({ op: 'err', code: 'sign_in', message: 'Sign in first.' }); return ws.close(4001); } if (!ws.me) attach(m); return; }
    if (!ws.me) return ws.send({ op: 'err', code: 'sign_in', message: 'Send {"op":"auth","token":"…"} first.' });
    if (msg.op === 'sub') { const ok = ['dreamline', 'discover', 'alerts', 'chats']; ws.streams = new Set((msg.streams || []).filter((s) => ok.includes(s))); return ws.send({ op: 'subbed', streams: [...ws.streams] }); }
    if (msg.op === 'send') {
      try { if (msg.object?.by !== ws.me.pubkey) throw new R.RemError(403, 'wrong_signer', 'Signed by a different LooscidID than the one signed in.'); const r = await R.acceptObject(msg.object); ws.send({ op: 'ok', ref: msg.ref, ...r }); }
      catch (e) { ws.send({ op: 'err', ref: msg.ref, code: e.code || 'server_error', message: e instanceof R.RemError ? e.message : 'Something broke on the server.' }); if (!(e instanceof R.RemError)) console.error(e); }
      return;
    }
    ws.send({ op: 'err', code: 'bad_op', message: 'Unknown op.' });
  };
});
setInterval(() => R.hub.each((pk, s) => { if (!s.alive) return s.close(1001); s.alive = false; s.ping(); }), 30000).unref();
setInterval(() => R.runScheduled(), 10000).unref();
// A safety copy of the database on the same disk every 6 hours (the off-box copy is the backup download).
setInterval(() => { try { const dir = path.join(config.dataDir, 'backups'); fs.mkdirSync(dir, { recursive: true }); const tmp = path.join(dir, 'looscid-latest.db.tmp'); fs.rmSync(tmp, { force: true }); db.prepare('VACUUM INTO ?').run(tmp); fs.renameSync(tmp, path.join(dir, 'looscid-latest.db')); } catch (e) { console.error('safety copy', e.message); } }, 6 * 3600e3).unref();

server.headersTimeout = 20000; server.requestTimeout = 60000; server.keepAliveTimeout = 65000;
server.listen(config.port, '0.0.0.0', () => console.log(`${config.appName} home (${PROTOCOL.name} v${PROTOCOL.version}) on :${config.port} for ${config.host}, data in ${config.dataDir}`));
const stop = () => { console.log('stopping'); server.close(); R.hub.each((pk, s) => s.close(1001)); try { db.close(); } catch {} process.exit(0); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
