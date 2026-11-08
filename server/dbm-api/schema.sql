-- Rem v1 (docs/protocol.md): the whole D1 schema for dbm-api (step 1 tables + step 2 changes). Run it once in a new D1 database.
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, handle TEXT UNIQUE, display_name TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS dreams (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), text TEXT NOT NULL, audience TEXT, cw TEXT, reply_to TEXT, quote_of TEXT, nostr_id TEXT, created_at INTEGER NOT NULL, updated_at INTEGER, deleted_at INTEGER, status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'hidden')), tags TEXT);
CREATE INDEX IF NOT EXISTS dreams_user ON dreams(user_id, created_at);
CREATE TABLE IF NOT EXISTS pins (user_id TEXT NOT NULL REFERENCES users(id), dream_id TEXT NOT NULL REFERENCES dreams(id), pinned_at INTEGER NOT NULL, PRIMARY KEY (user_id, dream_id));
CREATE TABLE IF NOT EXISTS alerts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), type TEXT NOT NULL, text TEXT, from_user TEXT, dream_id TEXT, unread INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS alerts_user ON alerts(user_id, created_at);
CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, pubkey TEXT NOT NULL, kind INTEGER NOT NULL, created_at INTEGER NOT NULL, json TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS events_pubkey ON events(pubkey, seq);
CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, dream_id TEXT NOT NULL, reporter_id TEXT NOT NULL, reason TEXT, created_at INTEGER NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS reports_once ON reports(dream_id, reporter_id);
CREATE TABLE IF NOT EXISTS blocks (blocker_id TEXT NOT NULL, blocked_id TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (blocker_id, blocked_id));
CREATE TABLE IF NOT EXISTS reposts (id TEXT PRIMARY KEY, dream_id TEXT NOT NULL, user_id TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS reposts_dream ON reposts(dream_id);
CREATE TABLE IF NOT EXISTS rate (k TEXT PRIMARY KEY, window_start INTEGER NOT NULL, n INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS dreams_feed ON dreams(status, deleted_at, created_at);
CREATE INDEX IF NOT EXISTS dreams_reply ON dreams(reply_to);
CREATE INDEX IF NOT EXISTS dreams_quote ON dreams(quote_of);
