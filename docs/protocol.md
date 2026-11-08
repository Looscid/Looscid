# Rem, the Looscid protocol, version 1

Looscid runs on **Rem**. This is the one public spec for it: any app can be a Rem client, and anyone can run a Rem
server. Version 1, Nov 7 2026.

Rem v1 merges the two Looscid protocols that existed before (Carter, Nov 7 2026: "Merge Rem with the other
protocol"): the first Rem (version 0, the Rem home that ran at looscidserver.sites.tab.bot, now retired) and the Nostr-style
"Looscid Protocol v0" of the Cloudflare server. The name stays **Rem**. The shape is the Nostr-style signed event,
so a Rem v1 Dream can be cross-posted to Nostr **as is**, with the same signature. The keys are the same as always:
your **LooscidID**, a secp256k1 key pair (the same kind Nostr uses).

**Rem v0 still works.** A Rem v1 server takes signed Rem v0 objects too, checks their own signature exactly like the
v0 home does, and stores them next to v1 events (section 7). Nothing anyone signed before has to be signed again.

The Rem server is `rem` at https://rem.thebntlovver.workers.dev (code in `server/rem/`), a Cloudflare Worker
with a D1 database. It was called `dbm-api` until Nov 7 2026. Since Nov 7 2026 (Carter: one product, one
destination) it is the only Rem server Looscid uses. The first Rem home (v0, `server/server/`) is retired; its spec
stays in Appendix A for anyone checking old v0 objects.

## 1. The idea in plain words

- **Rem is the home of public Dreams.** Every Dream with Audience Everyone is saved on a Rem server.
- **Everything is signed.** Each Dream is a small JSON *event* signed with your LooscidID key. The server checks
  the signature before it keeps anything, so it can't make up Dreams for you and nobody can fake yours.
- **Your data can leave.** The server keeps the original signed events, and anyone can download them
  (`GET /export`) and check them, back them up, or load them into another Rem server.
- **Nostr is an optional bridge.** Rem v1 events use the same envelope and the same keys as Nostr. When you turn on
  "Also share my Dreams to Nostr" (Settings, LooscidID, Connectionbase), the app sends the *same signed event* to your
  Nostr relays too. It's off by default. People who already used Nostr before Nov 7 2026 keep it on.
  Mastodon and Bluesky bridges are coming later.

## 2. An event

```json
{
  "id": "<64 hex: sha256 of the serialized event>",
  "pubkey": "<64 hex: the author's LooscidID public key (x-only secp256k1)>",
  "created_at": 1794091200,
  "kind": 1,
  "tags": [["client", "Looscid"], ["t", "looscid"], ["looscid", "1"]],
  "content": "I dreamed I could fly over Detroit",
  "sig": "<128 hex: BIP-340 Schnorr signature of id>"
}
```

**Signing** (identical to Nostr NIP-01, so one key and one signature work for both):

1. Serialize `[0, pubkey, created_at, kind, tags, content]` as compact JSON (UTF-8, no extra spaces).
2. `id` = lowercase hex sha256 of that string.
3. `sig` = BIP-340 Schnorr signature of the 32-byte `id`, with the LooscidID secret key.

The server recomputes `id` and checks `sig` (with the audited `@noble/curves` library). Anything else gets a 400.

**The version tag** `["looscid", "1"]` marks a Looscid Dream on Rem version 1. The server also accepts
`["looscid", "0"]` (events signed before the merge) and the plain `["t", "looscid"]` tag, so Looscid Dreams that are
already on Nostr can be imported. `created_at` is in seconds.

## 3. Kinds

| kind | what it is | tags |
|---|---|---|
| 1 | a Dream (or a reply) | `["looscid","1"]`; replies: `["e", <dream id>, <relay hint>, "root"/"reply"]`; quote: `["q", <dream id>]`; content warning: `["content-warning", <text>]`; people: `["p", <pubkey>]` |
| 1010 | an edit of your own Dream | `["e", <dream id>]`; `content` is the new text |
| 5 | a deletion of your own Dreams | `["e", <dream id>]` for each one. The server erases the text and the original event |
| 6, 16 | a ReDream | `["e", <dream id>]` |
| 1984 | a report (not stored as an event, not exported) | `["e", <dream id>, <reason>]`, reason is `spam`, `mean`, `unsafe` or `other` |
| 21984 | block / unblock (not exported) | `["p", <pubkey>]`, `["action", "block" or "unblock"]` |
| 21985 | delete everything the server has for my key | `["action", "delete-my-data"]` |
| 21987 | add to or remove from one of your lists (not exported) | `["list", <name>]`, `["action", "add" or "remove"]`, `["i", <item>, <saved copy, optional>]` (1 to 200) |
| 21988 | read all your lists back (not stored) | `["action", "read-my-lists"]` |
| 21989 | a problem report for Looscid's own issue tracker (stored as a report, not exported) | `["type", "bug" or "idea"]`, `["title", <up to 120 characters>]`, `["app", <app name>]`, `["version", <version>]`; `content` is what happened (up to 4000 characters) |
| 21990 | agree or disagree with a report (not exported) | `["e", <report id>]`, `["vote", "agree", "disagree" or "none"]`, `["visibility", "private" or "public"]` (private when missing) |
| 21991 | a Looscid mod's status change, reply or close on a report (not exported) | `["e", <report id>]`, `["status", "new", "working", "fixed" or "closed"]` (optional); `content` is the reply, or the reason when closing |
| 21992 | a private report for the Report Center (stored as a report thread, not exported) | `["type", "dream", "profile", "circle" or "child"]`, `["reason", "spam", "mean", "unsafe", "child_safety" or "other"]` (`child` is always `child_safety`), `["target", <Dream id, person's key or handle, or Circle id>]` (not needed for `child`), `["label", <what it is, in words>]` (optional), `["circle", <Circle id>]` (optional); `content` is more info (up to 2000 characters) |
| 21993 | read your own reports back (not stored) | `["action", "read-my-reports"]`; a Looscid mod adds `["scope", "all"]` (and `["status", <status>]`, optional) to read every report |
| 21994 | a message on a report thread (not exported) | `["e", <report id>]`; `content` is the message (up to 2000 characters); a Looscid mod may add `["status", "new", "looking", "done" or "closed"]` and `["as", "mod"]` |

Reports, blocks and "delete my data" must be Rem v1 events signed within the last 10 minutes, so an old one can't be
replayed. A Dream id is its event id (or its v0 object id), so ids can't clash between people or versions.

## 4. API

Base: `https://rem.thebntlovver.workers.dev`. JSON in, JSON out. Browsers may call it only from
`https://looscid.github.io` (and the test preview `https://looscid-preview.sites.tab.bot` while it still runs) (CORS).

| method | path | does |
|---|---|---|
| GET | `/health` | `{ ok, protocol: "rem/1", tables, issues: true }` (`issues`: this server has the issue tracker) |
| GET | `/feed?limit=30&before=<score>&viewer=<pubkey>&sort=new` | public Dreams (not replies), ranked (below). `sort=new` is pure time, no boost. `viewer` leaves out people that key blocked, and says whether that key `liked` or `redreamed` each Dream. Each Dream has `likes`, `redreams`, `replies` and `quotes` counts. `next` is the `before` for the next page. Each Dream carries `ev`, its original signed event, so an app can check the signature itself |
| GET | `/dreams/<pubkey>?limit=50&before=<ms>` | one person's Dreams and replies, newest first |
| GET | `/export?after=<seq>&limit=200&author=<pubkey>` | the original signed events and v0 objects, oldest first. `next` is the `after` for the next page. A v0 object is the one with `"rem": 0` |
| POST | `/ingest` | body: a signed Rem v1 event (kinds 1, 1010, 5, 6, 16) or a signed Rem v0 object (types `dream`, `edit`, `delete`, `redream`) |
| POST | `/report` | body: a signed kind 1984 event. Reports are weighted (trusted reporters, below); a total of 3 hides the Dream |
| POST | `/block` | body: a signed kind 21984 event |
| POST | `/forget` | body: a signed kind 21985 event. Erases that key's Dreams, events, v0 objects, ReDreams, blocks, reports and lists |
| POST | `/list` | body: a signed kind 21987 event, signed in the last 10 minutes, used once. Lists: `likes` and `redreams` (public: only counts come out), and the private `liked_other`, `pins`, `muted_dreamors`, `muted_threads`, `not_interested`, `threads` and `dislikes` (Nov 8 2026: disliked Dreams, up to 1000; Rem never counts or shows them, only `/mine` gives them back to you). A ReDream of a Dream on Rem also counts as a ReDream |
| POST | `/mine` | body: a signed kind 21988 event, signed in the last 10 minutes, used once. Answers every list of that key, with each item's saved copy. It's the only way to read the private lists |
| GET | `/issues?status=all&limit=50&before=<ms>` | Looscid's own issue tracker, public, no key: reports newest first, each with `id`, `by` (the reporter's key), `type`, `title`, `body`, `app`, `version`, `status`, `close_reason`, `agree` and `disagree` counts and `replies` (each `by: "Looscid mods"`, `text`, `status`, `at`). `status` is `all`, `open` (not closed), `new`, `working`, `fixed` or `closed`. `next` is the `before` for the next page |
| GET | `/issues/<id>` | one report, the same shape |
| POST | `/issues` | body: a signed kind 21989 event, signed in the last 10 minutes, used once. Answers the new report. 10 reports per key per day |
| POST | `/issues/vote` | body: a signed kind 21990 event, signed in the last 10 minutes, used once. One vote per key per report; a new one replaces the old one and `none` takes it back. Answers the new `agree` and `disagree` counts |
| POST | `/issues/moderate` | body: a signed kind 21991 event from a key in the Looscid mods list (`/moderators`), signed in the last 10 minutes, used once. Anyone else gets 403. Closing needs a reason. Answers the report |
| POST | `/reports` | the Report Center. body: a signed kind 21992 event, signed in the last 10 minutes, used once. Answers `{ ok, report, hidden }`; a report is `{ id, type, target, label, circle, reason, body, status, created_at, updated_at, messages: [{ id, from: "you" or "Looscid mods", text, status, at }] }`. A Dream report on a Dream in the index also counts like `/report` (same weights, same hiding). You can't report your own Dream or yourself. 20 per key per day |
| POST | `/reports/read` | body: a signed kind 21993 event, signed in the last 10 minutes, used once. Answers `{ ok, statuses, reports }` with only that key's reports, newest first. With `["scope", "all"]` from a Looscid mod: every report, each with `by` (the reporter's key, for mods only); anyone else gets 403 |
| POST | `/reports/reply` | body: a signed kind 21994 event, signed in the last 10 minutes, used once. Only the reporter (up to 50 messages per report) and Looscid mods can write; anyone else gets 403. Only mods set the status. A mod's message shows as "Looscid mods". Answers the report |

**Trusted reporters.** A report counts 1 when the reporter's key is trusted, and 0.25 when it isn't. A key is trusted
when the server first saw it at least 7 days ago (its own clock, `users.created_at`, never a date inside a signed
event) AND it has at least 3 Dreams on this server. A Dream is hidden when its reports add up to 3 or more. So 3
trusted people hide a Dream, 3 brand-new keys don't (0.75), and it would take 12 new keys. Each report answers with
the `weight` it got.

**Verified.** An app shows "Verified" next to a Dreamor's name when the Dream's `ev` checks out: its id and Schnorr
signature are valid, it is signed by the Dream's key, and its words match. Rem v0 Dreams and edited Dreams aren't
checked that way, so they show no badge.

**Your lists.** Pins, mutes, Not interested, followed threads and liked searches are private: no route shows them, and
`/mine` only answers a read signed by the same key in the last 10 minutes. Every list write and read is good once (the
server remembers its id for 20 minutes), so a copied request can't be replayed. That you liked or ReDreamed a Dream is
public, like on Nostr, but only the counts come out.

**Looscid's own issue tracker** (Nov 8 2026). Reports live on Rem and nowhere else. Reading them needs no key. Reporting,
voting and mod actions are signed with the person's own key, like every other write, and each signed request works once.
Everything is plain text: Rem keeps the words as typed (control characters out) and apps show them as text, never as
HTML. Votes are private unless the voter's event says `public`; only the counts come out. Mod replies and status
changes are public and say "Looscid mods", never which key. `/forget` also erases that key's reports, the votes and mod
replies on them, its own votes and, for a mod, its replies. Tables: `issues`, `issue_votes`, `issue_replies` (made by
the code itself).

**The Report Center** (Nov 8 2026). Reports about Dreams, people, Circles and child safety are private: no GET route
lists them, a reporter reads only their own (a read signed by their key, good once), and only Looscid mods (the
`/moderators` keys) read them all. Nothing public says who reported what; the public mod log is unchanged. Each report
is a thread: the reporter can add to it, and mods answer as "Looscid mods" (never which key) and set the status: `new`,
`looking`, `done` or `closed`. Everything is plain text. `/forget` also erases that key's reports, every message on
them, and every message that key wrote. Tables: `report_threads`, `report_messages` (made by the code itself).

**Limits:** 30 Dreams per key per 10 minutes, 20 reports and 60 blocks per key per hour, 300 list writes and 240 list reads per key per hour, 10 problem reports per key per day (20 an hour), 300 votes and 200 mod actions on reports per key per hour, 20 Report Center reports per key per day (30 an hour), 240 report reads and 120 report messages per key per hour, 200 writes per network
address per 10 minutes (the address is only kept as a daily-salted hash). Events up to 64 KB, text up to 20000
characters. Over a limit: 429. A server error is a plain `{ "ok": false, "error": "server error" }` (details stay in
the server's own log).

**The feed algorithm, in plain words:** newest first, plus a small boost for conversation. Each reply counts as if
the Dream were 20 minutes newer, each ReDream or Quote as if 40 minutes newer, with at most 6 hours of boost. Hidden,
deleted and blocked Dreams are left out. It only looks at the last 30 days.

## 5. Running your own Rem server

The server is one file (`server/rem/src/index.js`) plus `server/rem/schema.sql`.

1. Make a Cloudflare D1 database and run `schema.sql` in it.
2. Make a Worker, bind the database as `DB`, and deploy the bundled code (`npm run build` in `server/rem`, then
   paste `dist/worker.js` into the dashboard editor or use wrangler).
3. Copy the data over: page through `GET /export` on the old server and `POST /ingest` every event to the new one.
   Every event and v0 object is signed by its author, so the new server checks them all again and nothing can be
   changed on the way.

## 6. Versioning

- Every v1 Dream carries `["looscid", "1"]`. This document is Rem version `1`.
- New kinds or new optional tags can be added in a minor update; old servers ignore what they don't know.
- Anything that changes how an event is signed or what an existing kind means is a new version (`["looscid","2"]`),
  and servers say which version they speak in `GET /health` (`protocol`, here `rem/1`).

## 7. Rem v0 objects (still accepted)

Rem v0 is the first Rem (Oct 31 2026). A v0 object looks like this:

```json
{ "rem": 0, "type": "dream", "by": "<64 hex pubkey>", "at": 1794091200000,
  "body": { "text": "I dreamed I could fly", "audience": "public" },
  "id": "<64 hex>", "sig": "<128 hex>" }
```

- `id` = sha256 of the **canonical JSON** of `[0, by, at, type, body]`: object keys sorted at every depth, no spaces,
  arrays kept in order. `at` is in **milliseconds**.
- `sig` = BIP-340 Schnorr signature of the 32-byte `id` by `by`. Same keys, same math as v1; only the envelope differs.
- A Rem v1 server checks a v0 object exactly like the v0 home's `verifyObject()` (`server/public/js/rem-core.js`),
  then stores it in the same tables as v1 events. The original object is kept as it was signed, so `/export`
  hands it back unchanged and anyone can still check it.
- A v1 server takes the v0 types that make sense on a public index: `dream` (public only), `edit`, `delete`,
  `redream`. Everything else (`follow`, `react`, `chat`, `vote`, `profile`, `report`, ...) isn't taken.

### v0 to v1 field mapping

| Rem v0 | Rem v1 |
|---|---|
| `rem: 0` | the tag `["looscid", "1"]` (a stored v0 Dream gets `["looscid", "0"]`) |
| `by` | `pubkey` |
| `at` (milliseconds) | `created_at` (seconds; `floor(at / 1000)`) |
| `type: "dream"` | `kind: 1` |
| `type: "edit"`, `body.of`, `body.text` | `kind: 1010`, `["e", of]`, `content` |
| `type: "delete"`, `body.of` | `kind: 5`, `["e", of]` |
| `type: "redream"`, `body.of` | `kind: 6`, `["e", of]` |
| `body.text` | `content` |
| `body.reply_to` | `["e", <id>, "", "reply"]` |
| `body.quote` | `["q", <id>]` |
| `body.cw` | `["content-warning", <text>]` |
| `body.tags` | `["t", <tag>]` each |
| `body.audience: "public"` | public (Rem v1 only holds public Dreams) |
| `body.audience: "followers"` | not taken by a v1 server (Rem v1 only holds public Dreams) |
| `body.media`, `body.poll`, `body.speak` | not carried yet |
| `id`: sha256 of canonical `[0, by, at, type, body]` | `id`: sha256 of `[0, pubkey, created_at, kind, tags, content]` |
| `sig`: Schnorr of `id` | `sig`: Schnorr of `id` (same) |

A v0 object can't be turned into a v1 event without a new signature (the id is computed differently), so a v1 server
keeps the v0 original. When the app sends a Dream again with Rem v1, it signs a fresh v1 event with the same key.

## Appendix A: the first Rem home (v0)

This is the v0 home's own spec (it was `server/PROTOCOL.md`), kept here so there is one Rem document.
The v0 home (it ran at looscidserver.sites.tab.bot) was retired on Nov 7 2026. What moved and what
didn't is in the migration note in `server/rem/README.md`.

Looscid runs on Rem. This is the public spec: any app can be a Rem client, not just the Looscid app.
Everything here is what the server in this repo actually does.

The name lives in one place in code (`PROTOCOL` in `public/js/rem-core.js`): `name` is what people read,
`key` is the envelope field, `base` is the API path, `live` is the WebSocket path.

### A1. The idea

- **Key-first identity.** Your **LooscidID** is a secp256k1 key pair, the same kind Nostr uses. Any Nostr key
  works as a LooscidID, and every LooscidID has an npub. The secret key stays on your device.
- **Everything is a signed object.** A Dream, a like, a follow, a Chat: each is a small JSON object signed by the
  LooscidID that made it. The server checks every signature and cannot make or change objects for you.
- **Local-first, syncs through the Looscid server.** Clients keep their own copy and work offline. The home server
  is the meeting spot: it keeps copies so friends get your things while you are away, and so a new device gets
  everything back (`GET /sync`).
- **A home is accountable.** Invite-only, 13+, blocks that work both ways, reports and moderators.
- **Accessibility is in the protocol.** Images without alt text are refused by the server. Content warnings and
  "how to read this aloud" are fields, not hacks.

### A2. Objects

```json
{ "rem": 0,
  "type": "dream",
  "by": "<32-byte public key, hex>",
  "at": 1761948000000,
  "body": { "text": "hello", "audience": "public" },
  "id": "<sha256 hex>",
  "sig": "<64-byte BIP-340 Schnorr signature, hex>" }
```

- `id` = sha256 of the UTF-8 bytes of `canonical([0, by, at, type, body])`.
- **canonical JSON**: like `JSON.stringify`, but the keys of every object (at every depth) are sorted, no spaces,
  `undefined` values left out. Arrays keep their order.
- `sig` = BIP-340 Schnorr signature of the 32 bytes of `id`, by the key `by` (same math as Nostr events).
- `at` is Unix time in milliseconds and must be within 10 minutes of the server's clock
  (except for `/import`, below).
- Max 64 KB per object.

#### Types and bodies

| type | body | notes |
|---|---|---|
| `profile` | `{ name, bio, pronouns, avatar?: media, chats_from: "mutuals"\|"nobody" }` | newest `at` wins |
| `dream` | `{ text, cw?, speak?, lang?, audience: "public"\|"followers", reply_to?, quote?, media?: [media], poll?: { options: [2-4 strings], closes_at }, tags?, post_at? }` | `post_at` = scheduled (up to 30 days) |
| `redream` | `{ of: dreamId }` | public Dreams only |
| `react` | `{ of: dreamId, r: "like" }` | v0: like only |
| `edit` | `{ of: dreamId, text, cw?, speak? }` | your own Dreams; history kept |
| `delete` | `{ of: objectId }` | a Dream, react, redream, vote or Chat of yours |
| `follow` / `unfollow` | `{ who: pubkey }` | |
| `block` / `unblock` | `{ who: pubkey }` | private; also removes follows both ways |
| `vote` | `{ of: dreamId, choice: index }` | one vote per poll, can change until it closes |
| `chat` | `{ to: pubkey, box: "<NIP-44 v2 payload>" }` | mutuals only, see Chats |
| `report` | `{ of: dreamId \| pubkey \| chatId, reason, note?, evidence? }` | reasons: spam, bullying, sexual, self_harm, violence, other |
| `role_answer` | `{ invite: roleInviteId, accept: true\|false }` | answers an admin/moderator invite |
| `leave` | `{}` | deletes your account and everything you made on this home |

`media` = `{ url, alt, mime?, w?, h? }`. `url` must be an image uploaded to this home (`POST /media`) by you.
`alt` is required (1-1500 characters). Limits: text 1000 characters, content warning 200, 4 images, 5 MB per image.

#### Accessibility fields

- `alt` is required on every image. Without it the server answers `422 {"code":"alt_required"}`.
- `cw` is a content warning. Clients show the warning first and hide the rest until it is opened.
- `speak` is how the Dream should be read aloud. If it is missing and the text has links or emoji runs, the
  server adds `speak_hint` to items (links become "link to site", runs of 3+ same emoji are counted).
- Events carry names a client can attach sounds (earcons) to: `dream.new`, `reply.new`, `like.new`,
  `redream.new`, `follow.new`, `chat.new`, `alert.mention`, `role.invite`, `role.answer`.
- Clients should never move focus or insert above the reader when something arrives live: show
  "3 new Dreams" and let the person choose.

### A3. HTTP API

Base: `https://<home>/rem/v0`. JSON in and out. CORS is open (`*`) so any web client can connect.
Sign-in uses a Bearer token, never cookies. Errors are `{ "ok": false, "code": "...", "message": "..." }`;
`message` is plain English that a screen reader can read as-is.

Discovery: `GET /.well-known/looscid` (and `GET /rem/v0/`) gives the protocol, limits, invite rules and paths.

#### Joining and signing in

- `POST /join` `{ invite, handle, name?, pubkey, age_ok: true, sig }` → `{ token, expires, me }`
  `sig` signs the text `rem-join:<home>:<INVITE>:<handle>` (sha256 of the UTF-8 text, Schnorr-signed).
  Handles: 2-20 of a-z, 0-9, _. The owner's handle is reserved (see Owner).
- `POST /auth/challenge` `{ pubkey }` → `{ nonce, sign }`
- `POST /auth/login` `{ pubkey, nonce, sig }` → `{ token, expires, me }` where `sig` signs the text in `sign`
  (`rem-login:<home>:<nonce>`). Tokens last 30 days; the server keeps only their hash.
- `POST /auth/logout`, `GET /me`

#### Writing

- `POST /objects` a signed object → `{ ok: true, id, seq }` (must be signed by the signed-in LooscidID).
- `POST /media` the image bytes as the body, `Content-Type: image/jpeg|png|webp`, alt text in the
  `X-Rem-Alt` header (URL-encoded); or `multipart/form-data` with `file` and `alt`.
  → `{ media: { url, mime, alt, w, h } }`. The server keeps only the image data: location (GPS), camera, dates,
  XMP and comments are removed. JPEG keeps only its orientation.

#### Reading

Lists are paged: `?before=<next>&limit=20` → `{ items, next }`.

- `GET /feed/dreamline` Dreams and ReDreams from you and people you follow, newest first, no algorithm.
- `GET /feed/discover` public Dreams on this home.
- `GET /objects/:id`, `GET /dreams/:id/thread`, `GET /dreams/:id/history` (original + edits).
- `GET /dreamors/:handle-or-pubkey` and `/dreamors/:handle-or-pubkey/dreams`.
- `GET /notifications` (same as `/alerts`), `POST /alerts/seen`.
- `GET /chats`, `GET /chats/:pubkey` (signed, encrypted Chat objects; decrypt on the device).
- `GET /search?q=&type=all|dreams|dreamors`, `GET /trending` (tags and most-active public Dreams, 24 hours).
- `GET /invites`, `POST /invites` → `{ code, invite_link }`.
- `GET /sync?since=<cursor>` every object you made, plus Chats and deletes addressed to you, oldest first →
  `{ objects, cursor, more }`. This is how a new device gets everything back: sign in, call `/sync` from 0.
- `GET /export` the same, as one download.

Items look like `{ id, by: { pubkey, npub, handle, name, ... }, at, text, cw, speak, speak_hint, media, link,
poll, counts: { replies, redreams, likes }, me: { liked, redreamed }, ... }`.

Reads need sign-in on this home (it is members-only) unless the home sets `public_read`.

#### Importing Dreams you already have (opt-in)

`POST /import` `{ objects: [signed dream objects] }` (up to 200 per request). For people who used Looscid on
their device before joining the server. Nothing is uploaded unless the person chooses it in their app.

- Each Dream must be signed by the signed-in LooscidID and keeps its original `at` (any past time since 2020).
- Same `id` already on the server = skipped (safe to retry).
- Replies keep their thread: a Dream with `reply_to` (or `quote`) is imported only when that Dream is already on the
  server (send parents first; one request is handled in order). Otherwise it comes back in `refused` with code
  `parent_missing` and stays on the device. It is never turned into a loose Dream.
- Imported Dreams appear on the profile in their original time order; they are not pushed into anyone's
  Dreamline as new.
- A Dream whose images have no alt text is **not dropped silently**: it comes back in `needs_alt` and stays
  in `GET /import/flags` until the person adds alt text, signs again and imports again, or dismisses it
  (`POST /import/flags/dismiss { id }`).
- Images must be uploaded with `/media` first (so the server can check and clean them).

Answer: `{ imported: [ids], skipped: [...], needs_alt: [{ id, images, message }], refused: [{ id, code, message }] }`.

#### Backup file (`.looscid`)

The Looscid app and this web client save and restore the same backup file (`public/js/looscid-backup.js`): your profile,
Dreams, replies, Chats, likes, follows, settings and your LooscidID key in one file, locked with a passcode you choose.
Outside: `{ "looscid_backup": 1, "kdf": { "name": "PBKDF2", "hash": "SHA-256", "iterations": 600000, "salt" },
"cipher": { "name": "AES-GCM", "iv" }, "data" }` (base64; AES-GCM 256-bit with additional data `looscid-backup-v1`).
Inside: `{ looscid_backup_data: 1, from: "app"|"home", key: { nsec, pubkey }, profile, server, dreams, rem_objects, app, home }`.
Nothing is readable without the passcode, and nobody can recover a forgotten one. Restoring on a home signs in with the
key, imports the signed Dreams (`/import`, original times) and signs follows and likes again with the same key.

### A4. The live stream (WebSocket)

`wss://<home>/rem/v0/live`. Send `{"op":"auth","token":"..."}` first (within 15 s).

Client → server:
- `{"op":"sub","streams":["dreamline","discover","alerts","chats"]}` (all four by default)
- `{"op":"send","ref":"x","object":{...}}` same as `POST /objects`, answered by `ok` or `err` with the same `ref`
- `{"op":"ping"}`

Server → client:
- `{"op":"hello","me":{...},"unseen_alerts":3}`
- `{"op":"item","stream":"dreamline"|"discover","event":"dream.new"|"reply.new"|"redream.new","item":{...}}`
- `{"op":"update","item":{...}}` (an edit, a link card arrived, a poll changed), `{"op":"remove","id":"..."}`
- `{"op":"alert","event":"like.new",...,"alert":{...}}`
- `{"op":"chat","event":"chat.new","object":{...}}`, `{"op":"chat_deleted","id":"..."}`
- `{"op":"ok",...}`, `{"op":"err","code","message"}`, `{"op":"pong"}`

The server pings every 30 seconds. Reconnect with a short delay if the line drops; then fetch the lists again.

### A5. Chats

- Only between mutuals (you both follow each other), never with someone you blocked or who blocked you, and not
  if the other person turned Chats off.
- End-to-end encrypted with **NIP-44 v2** (the same as Nostr): conversation key from ECDH of the two LooscidIDs,
  ChaCha20 + HMAC-SHA256, padded.
- The plaintext inside `box` is itself a signed object: `{ type: "chat_message", body: { to, text } }` signed by
  the sender. So a person who reports a Chat can attach it as `evidence`, and moderators can check it is real
  without being able to read anyone's Chats.
- The server stores the locked box so it arrives when the other person is offline. It can see who chats with
  whom and when, not what they say.

### A6. Safety on a home

- Invite-only. Each code makes one account. Members earn 3 invites after 7 days (both numbers are settings);
  the owner, admins and moderators can make more. The home remembers who invited whom.
- 13+ only (a checkbox). No email, phone, birthday or location is asked for or stored. IP addresses are used only
  in memory for rate limits and never written down.
- Blocks work both ways: no seeing each other's Dreams, replies, follows, mentions or Chats. They are not told.
- Rate limits: 20 Dreams an hour for accounts newer than 7 days (60 after), 50 follows a day, 30 uploads an hour.
- Reports go to the moderators' queue.

#### Roles

`owner` (one per home), `admin`, `mod`, `member`. Roles are **offered, never forced**:

1. The owner (any role) or an admin (moderator only) calls `POST /mod/action { action: "invite_role", target:
   handle-or-pubkey, role: "admin"|"mod" }`.
2. The person gets a `role_invite` notification (live, and in `/notifications`) with the invite id.
3. They answer with a signed `role_answer { invite, accept }`. Accepting grants the role.
4. The owner can take a role away: `{ action: "revoke_role", target }`. Everything is in `GET /mod/log`.

#### Moderation (owner, admins, moderators)

- `GET /mod/reports?status=open|resolved`, `GET /mod/stats`, `GET /mod/tree` (members and who invited them),
  `GET /mod/log`.
- `POST /mod/action { target, action, note? }` with `action`: `hide` / `unhide` (a Dream), `suspend` /
  `unsuspend` (an account), `revoke_invites`, `resolve` / `reopen` (a report), `invite_role`, `revoke_role`,
  `remove_account` (owner only).

#### Owner

The owner's handle (default `2three1y`, a setting) is reserved. Nobody gets it by asking: a join with that
handle and no owner code is only written down as a pending claim. The person running the home holds an owner
code (the server keeps only its hash) and binds the handle to a LooscidID:

- `GET /admin/owner-claims` (header `X-Rem-Owner-Code`) lists pending claims with their npubs.
- `POST /admin/owner { pubkey: npub-or-hex, name? }` (same header) makes that LooscidID the owner. If it is not a
  member yet, the account is created. `replace: true` moves ownership to a new key (for a lost key).
- Joining with the owner code as the invite and the owner handle also works, once.
- `GET /admin/backup` (owner token or the `X-Rem-Backup-Key` header): a `.tar.gz` with a consistent copy of the
  database (`VACUUM INTO`) and all media.

### A7. Nostr

A LooscidID is a Nostr key, so the same person can use both. The bridge (importing old Looscid Nostr notes,
mirroring public Dreams out, a read-only Nostr relay on the home) is planned for later and is off in v0.

### A8. Later

Federation between homes (`/rem/v1/inbox`, signed by the sending home), circles, private accounts with follow
requests, mutes, audio Dreams, moving an account to a new key, a Nostr bridge.
