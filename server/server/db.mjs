// SQLite storage. One file in the data folder (outside the site folder, so republishing never touches it).
// Uses better-sqlite3 (MIT), vendored under vendor/better-sqlite3 with its native file in .native/.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { config } from './config.mjs';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const Database = require(path.join(root, 'vendor/better-sqlite3/lib/index.js'));
const abi = process.versions.modules;
const nativeBinding = process.env.REM_SQLITE_NATIVE || path.join(root, '.native', `better_sqlite3-node-v${abi}.node`);
if (!fs.existsSync(nativeBinding)) throw new Error(`SQLite native file missing for Node ABI ${abi}: run "sh scripts/setup-sqlite.sh" (looked for ${nativeBinding})`);

fs.mkdirSync(config.dataDir, { recursive: true, mode: 0o700 });
fs.mkdirSync(path.join(config.dataDir, 'media'), { recursive: true });
export const dbPath = path.join(config.dataDir, 'looscid.db');
export const db = new Database(dbPath, { nativeBinding });
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 3000');
db.pragma('cache_size = -8000'); // ~8 MB page cache, the box is small

db.exec(`
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS dreamors (
  pubkey TEXT PRIMARY KEY, handle TEXT UNIQUE NOT NULL, name TEXT NOT NULL DEFAULT '', bio TEXT NOT NULL DEFAULT '',
  pronouns TEXT NOT NULL DEFAULT '', avatar TEXT, chats_from TEXT NOT NULL DEFAULT 'mutuals',
  role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, invite_code TEXT, created INTEGER NOT NULL,
  suspended INTEGER NOT NULL DEFAULT 0, profile_at INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS objects (
  seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT UNIQUE NOT NULL, type TEXT NOT NULL, by TEXT NOT NULL,
  at INTEGER NOT NULL, raw TEXT NOT NULL, to_pk TEXT, received INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS objects_by ON objects(by, seq);
CREATE INDEX IF NOT EXISTS objects_to ON objects(to_pk, seq);
CREATE TABLE IF NOT EXISTS dreams (
  id TEXT PRIMARY KEY, by TEXT NOT NULL, at INTEGER NOT NULL, text TEXT NOT NULL DEFAULT '', cw TEXT, speak TEXT, lang TEXT,
  audience TEXT NOT NULL, reply_to TEXT, quote TEXT, media TEXT, poll TEXT, link TEXT, tags TEXT,
  post_at INTEGER, published INTEGER NOT NULL DEFAULT 0, pub_at INTEGER, edited_at INTEGER, edits INTEGER NOT NULL DEFAULT 0,
  deleted INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, imported INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS dreams_by ON dreams(by, pub_at);
CREATE INDEX IF NOT EXISTS dreams_reply ON dreams(reply_to);
CREATE INDEX IF NOT EXISTS dreams_sched ON dreams(published, post_at);
CREATE TABLE IF NOT EXISTS feed (pseq INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, dream TEXT NOT NULL, by TEXT NOT NULL, at INTEGER NOT NULL, obj TEXT NOT NULL UNIQUE);
CREATE INDEX IF NOT EXISTS feed_by ON feed(by, pseq);
CREATE INDEX IF NOT EXISTS feed_dream ON feed(dream);
CREATE TABLE IF NOT EXISTS redreams (id TEXT PRIMARY KEY, by TEXT NOT NULL, of TEXT NOT NULL, at INTEGER NOT NULL, UNIQUE(by, of));
CREATE TABLE IF NOT EXISTS reacts (id TEXT PRIMARY KEY, by TEXT NOT NULL, of TEXT NOT NULL, r TEXT NOT NULL, at INTEGER NOT NULL, UNIQUE(by, of));
CREATE INDEX IF NOT EXISTS reacts_of ON reacts(of);
CREATE INDEX IF NOT EXISTS redreams_of ON redreams(of);
CREATE TABLE IF NOT EXISTS follows (by TEXT NOT NULL, who TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY(by, who));
CREATE INDEX IF NOT EXISTS follows_who ON follows(who);
CREATE TABLE IF NOT EXISTS blocks (by TEXT NOT NULL, who TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY(by, who));
CREATE TABLE IF NOT EXISTS votes (by TEXT NOT NULL, of TEXT NOT NULL, choice INTEGER NOT NULL, at INTEGER NOT NULL, PRIMARY KEY(by, of));
CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, by TEXT NOT NULL, to_pk TEXT NOT NULL, at INTEGER NOT NULL, raw TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS chats_pair ON chats(by, to_pk, at);
CREATE INDEX IF NOT EXISTS chats_to ON chats(to_pk, at);
CREATE TABLE IF NOT EXISTS alerts (seq INTEGER PRIMARY KEY AUTOINCREMENT, to_pk TEXT NOT NULL, kind TEXT NOT NULL, actor TEXT NOT NULL, ref TEXT, at INTEGER NOT NULL, seen INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS alerts_to ON alerts(to_pk, seq);
CREATE TABLE IF NOT EXISTS invites (code TEXT PRIMARY KEY, by TEXT NOT NULL, created INTEGER NOT NULL, used_by TEXT, used_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS invites_by ON invites(by);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, pubkey TEXT NOT NULL, created INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, by TEXT NOT NULL, target_kind TEXT NOT NULL, target TEXT NOT NULL, reason TEXT NOT NULL,
  note TEXT, evidence TEXT, at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'open', resolved_by TEXT, resolved_at INTEGER, resolution TEXT);
CREATE TABLE IF NOT EXISTS media (sha TEXT PRIMARY KEY, by TEXT NOT NULL, mime TEXT NOT NULL, ext TEXT NOT NULL, bytes INTEGER NOT NULL, w INTEGER, h INTEGER, alt TEXT, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS link_cards (url TEXT PRIMARY KEY, title TEXT, description TEXT, site TEXT, ok INTEGER NOT NULL, fetched INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS import_flags (id TEXT PRIMARY KEY, by TEXT NOT NULL, reason TEXT NOT NULL, detail TEXT, at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS owner_claims (pubkey TEXT PRIMARY KEY, name TEXT, at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS role_invites (id TEXT PRIMARY KEY, to_pk TEXT NOT NULL, role TEXT NOT NULL, by TEXT NOT NULL, at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', answered_at INTEGER);
CREATE TABLE IF NOT EXISTS mod_log (seq INTEGER PRIMARY KEY AUTOINCREMENT, by TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, note TEXT, at INTEGER NOT NULL);
CREATE VIRTUAL TABLE IF NOT EXISTS dreams_fts USING fts5(id UNINDEXED, text, cw, tokenize = 'unicode61 remove_diacritics 2');
CREATE VIRTUAL TABLE IF NOT EXISTS dreamors_fts USING fts5(pubkey UNINDEXED, handle, name, bio, tokenize = 'unicode61 remove_diacritics 2');
`);
db.prepare(`INSERT OR IGNORE INTO meta (k, v) VALUES ('schema', '1')`).run();

export const one = (sql, ...a) => db.prepare(sql).get(...a);
export const all = (sql, ...a) => db.prepare(sql).all(...a);
export const run = (sql, ...a) => db.prepare(sql).run(...a);
export const tx = (fn) => db.transaction(fn);
