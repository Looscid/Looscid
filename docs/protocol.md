# Looscid Protocol v0 (the Looscid server on Cloudflare)

Short, open spec for how Looscid Dreams are stored and moved. Version 0, Nov 7 2026.
The server that speaks it is `dbm-api` (code in `server/dbm-api/`), with a Cloudflare D1 database behind it.

> Note: `server/PROTOCOL.md` describes **Rem**, the older Looscid server protocol (looscidserver.sites.tab.bot).
> Rem and this protocol use the same LooscidID keys but different JSON shapes. Rem sync in the app is unchanged.

## 1. The idea in plain words

- **The Looscid server is the home of public Dreams.** Every Dream with Audience Everyone is saved there.
- **Everything is signed.** Each Dream is a small JSON *event* signed with your LooscidID key. The server checks
  the signature before it keeps anything, so it can't make up Dreams for you and nobody can fake yours.
- **Your data can leave.** The server keeps the original signed events, and anyone can download them
  (`GET /export`) and check them, back them up, or load them into another Looscid server.
- **Nostr is an optional bridge.** Looscid events use the same envelope and the same keys as Nostr. When you turn on
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
  "tags": [["client", "Looscid"], ["t", "looscid"], ["looscid", "0"]],
  "content": "I dreamed I could fly over Detroit",
  "sig": "<128 hex: BIP-340 Schnorr signature of id>"
}
```

**Signing** (identical to Nostr NIP-01, so one key and one signature work for both):

1. Serialize `[0, pubkey, created_at, kind, tags, content]` as compact JSON (UTF-8, no extra spaces).
2. `id` = lowercase hex sha256 of that string.
3. `sig` = BIP-340 Schnorr signature of the 32-byte `id`, with the LooscidID secret key.

The server recomputes `id` and checks `sig` (with the audited `@noble/curves` library). Anything else gets a 400.

**The protocol tag** `["looscid", "0"]` marks an event as Looscid Protocol version 0. The server also accepts the
older `["t", "looscid"]` tag, so Looscid Dreams that are already on Nostr can be imported.

## 3. Kinds

| kind | what it is | tags |
|---|---|---|
| 1 | a Dream (or a reply) | `["looscid","0"]`; replies: `["e", <dream id>, <relay hint>, "root"/"reply"]`; quote: `["q", <dream id>]`; content warning: `["content-warning", <text>]`; people: `["p", <pubkey>]` |
| 1010 | an edit of your own Dream | `["e", <dream id>]`; `content` is the new text |
| 5 | a deletion of your own Dreams | `["e", <dream id>]` for each one. The server erases the text and the original event |
| 6, 16 | a ReDream | `["e", <dream id>]` |
| 1984 | a report (not stored as an event, not exported) | `["e", <dream id>, <reason>]`, reason is `spam`, `mean`, `unsafe` or `other` |
| 21984 | block / unblock (not exported) | `["p", <pubkey>]`, `["action", "block" or "unblock"]` |
| 21985 | delete everything the server has for my key | `["action", "delete-my-data"]` |

Reports, blocks and "delete my data" must be signed within the last 10 minutes, so an old one can't be replayed.

## 4. API (v0)

Base: `https://dbm-api.thebntlovver.workers.dev`. JSON in, JSON out. Browsers may call it only from
`https://looscid.github.io` (CORS).

| method | path | does |
|---|---|---|
| GET | `/health` | `{ ok, protocol: "looscid/0", tables }` |
| GET | `/feed?limit=30&before=<score>&viewer=<pubkey>` | public Dreams (not replies), ranked (below). `viewer` leaves out people that key blocked. `next` is the `before` for the next page |
| GET | `/dreams/<pubkey>?limit=50&before=<ms>` | one person's Dreams and replies, newest first |
| GET | `/export?after=<seq>&limit=200&author=<pubkey>` | the original signed events, oldest first. `next` is the `after` for the next page |
| POST | `/ingest` | body: a signed event (kinds 1, 1010, 5, 6, 16) |
| POST | `/report` | body: a signed kind 1984 event. 3 different people reporting the same Dream hides it |
| POST | `/block` | body: a signed kind 21984 event |
| POST | `/forget` | body: a signed kind 21985 event. Erases that key's Dreams, events, ReDreams, blocks and reports |

**Limits:** 30 Dreams per key per 10 minutes, 20 reports and 60 blocks per key per hour, 200 writes per network
address per 10 minutes (the address is only kept as a daily-salted hash). Events up to 64 KB, text up to 20,000
characters. Over a limit: 429.

**The feed algorithm, in plain words:** newest first, plus a small boost for conversation. Each reply counts as if
the Dream were 20 minutes newer, each ReDream or Quote as if 40 minutes newer, with at most 6 hours of boost. Hidden,
deleted and blocked Dreams are left out. It only looks at the last 30 days.

## 5. Running your own Looscid server

The server is one file (`server/dbm-api/src/index.js`) plus `server/dbm-api/schema.sql`.

1. Make a Cloudflare D1 database and run `schema.sql` in it.
2. Make a Worker, bind the database as `DB`, and deploy the bundled code (`npm run build` in `server/dbm-api`, then
   paste `dist/worker.js` into the dashboard editor or use wrangler).
3. Copy the data over: page through `GET /export` on the old server and `POST /ingest` every event to the new one.
   Every event is signed by its author, so the new server checks them all again and nothing can be changed on the
   way.

## 6. Versioning

- Every event carries `["looscid", "<version>"]`. This document is version `0`.
- New kinds or new optional tags can be added in a minor update; old servers ignore what they don't know.
- Anything that changes how an event is signed or what an existing kind means is a new version (`["looscid","1"]`),
  and servers say which versions they speak in `GET /health` (`protocol`).
