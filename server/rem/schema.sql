-- Rem v1 (docs/protocol.md): the whole D1 schema for rem (step 1 tables + step 2 changes). Run it once in a new D1 database.
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
-- Nov 8 2026: moderation (POST /moderate, GET /moderation/<key>, GET /modlog). The code also makes it itself.
CREATE TABLE IF NOT EXISTS moderations (dream_id TEXT PRIMARY KEY, mod_id TEXT NOT NULL, action TEXT NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL);
-- Nov 8 2026: Circle mod removals (signed by the remover; a Circle is its mod key + its id; never hides a Dream on Rem).
CREATE TABLE IF NOT EXISTS circle_moderations (mod_id TEXT NOT NULL, circle_id TEXT NOT NULL, dream_ref TEXT NOT NULL, circle_name TEXT NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (mod_id, circle_id, dream_ref));
-- Nov 8 2026: your lists on every device (POST /list, POST /mine). likes and redreams are public as counts; every other list and every saved copy is private (only a read signed by the same key). The code also makes it itself.
CREATE TABLE IF NOT EXISTS lists (user_id TEXT NOT NULL, list TEXT NOT NULL, ref TEXT NOT NULL, data TEXT, created_at INTEGER NOT NULL, PRIMARY KEY (user_id, list, ref));
CREATE INDEX IF NOT EXISTS lists_ref ON lists(list, ref);
-- Nov 8 2026: Looscid's own issue tracker (GET/POST /issues, POST /issues/vote, POST /issues/moderate). Plain text only. A vote's
-- visibility is private unless the voter says public; only counts come out. The code also makes these itself.
CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, app TEXT, version TEXT, status TEXT NOT NULL DEFAULT 'new', close_reason TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS issues_status ON issues(status, created_at);
CREATE INDEX IF NOT EXISTS issues_user ON issues(user_id);
CREATE TABLE IF NOT EXISTS issue_votes (issue_id TEXT NOT NULL, user_id TEXT NOT NULL, vote INTEGER NOT NULL, visibility TEXT NOT NULL DEFAULT 'private', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (issue_id, user_id));
CREATE INDEX IF NOT EXISTS issue_votes_user ON issue_votes(user_id);
CREATE TABLE IF NOT EXISTS issue_replies (id TEXT PRIMARY KEY, issue_id TEXT NOT NULL, mod_id TEXT NOT NULL, status TEXT, text TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS issue_replies_issue ON issue_replies(issue_id, created_at);
-- Nov 8 2026: the Report Center (POST /reports, /reports/read, /reports/reply). Private: no GET route; only the reporter's
-- own signed read and Looscid mods (MODS) read a report. Plain text only. The code also makes these itself.
CREATE TABLE IF NOT EXISTS report_threads (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL, target TEXT, label TEXT, circle TEXT, reason TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS report_threads_user ON report_threads(user_id, created_at);
CREATE INDEX IF NOT EXISTS report_threads_status ON report_threads(status, updated_at);
CREATE TABLE IF NOT EXISTS report_messages (id TEXT PRIMARY KEY, report_id TEXT NOT NULL, from_mod INTEGER NOT NULL, author_id TEXT NOT NULL, status TEXT, text TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS report_messages_report ON report_messages(report_id, created_at);
CREATE INDEX IF NOT EXISTS report_messages_author ON report_messages(author_id);
