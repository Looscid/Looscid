# Looscid server

**The Looscid home server. Looscid runs on Rem.**

> **Retired, Nov 7 2026.** This Rem v0 home server (it ran at looscidserver.sites.tab.bot) is no longer used. Looscid's one
> server is now **rem** at https://rem.thebntlovver.workers.dev (code in [rem/](rem/)). The code below stays for reference
> and for anyone who wants to run their own v0 home.

This folder is the server, inside the Looscid repo (it used to be its own repo, github.com/Looscid/looscidserver,
now archived). The app it serves is this repo's `app/` folder, the same app as https://looscid.github.io/Looscid/.

Looscid is an accessible social app built for screen reader users first. This is its home server: the
place where Dreamors meet. Looscid is **local-first, syncs through the Looscid server**: your LooscidID
(your key) and your copy of everything stay on your device and work offline, and the server is the meeting
spot that keeps copies, so friends get your Dreams and Chats while you are away and a new device gets
everything back.

Live home: none (retired). It was https://looscidserver.sites.tab.bot/

## What it does

- **Rem**, an open protocol (spec: [docs/protocol.md](../docs/protocol.md); this home speaks Rem v0, Appendix A there). Any app can be a Rem client. CORS is open.
- Every Dream, like, follow and Chat is signed by its author's LooscidID (the same kind of key as Nostr, so
  Nostr keys work). The server checks every signature and cannot forge anything.
- Dreams with content warnings, "read aloud as" text, replies, quotes, ReDreams, likes, edits with history,
  deletes, polls and scheduled Dreams.
- Dreamline (you + people you follow, newest first, no algorithm) and Discover.
- New Dreams and Inbox items arrive instantly over one WebSocket (the Rem live stream). Nothing jumps around:
  clients show "3 new Dreams" and the reader chooses.
- Chats between mutuals, end-to-end encrypted (NIP-44 v2), delivered even when the other person is offline.
- Image uploads: alt text is required, and location and camera data are stripped from photos.
- Search for people and Dreams, trending tags, link cards (fetched safely, never from private networks).
- Sync for multi-device, full export, opt-in import of Dreams you made before joining.
- Teen-safe: invite-only with an invite tree, 13+, no email, phone or location collected, blocks that work
  both ways, reports, moderators and admins (offered by invite, accepted in notifications), a mod page.
- Backups: an owner-only download of the database and media, plus a safety copy every 6 hours.
- The real Looscid app at `/`, the same app as https://looscid.github.io/Looscid/ (bottom tabs and all). It starts
  in Local mode; Settings, LooscidID, Looscid server signs in to this server and turns on sync.
- The classic web client at `/classic/` (VoiceOver first: one heading per Dream, real buttons, one polite live
  region, dark and light), with the owner's Mod page at `/classic/mod`.

## Run your own home

Needs Node 20 or newer, `tar` and `curl`. No other dependencies to install.

```sh
git clone https://github.com/Looscid/Looscid
cd Looscid/server
sh scripts/setup-sqlite.sh          # fetches SQLite's native file for your Node version
sh scripts/fetch-app.sh             # copies the Looscid app (pinned commit in scripts/app-commit.txt) into webapp/
REM_PUBLIC_HOST=localhost:8080 node server/main.mjs
```

`webapp/` isn't in git. Without it the classic client is served at `/` as well. To move to a newer app, put its
commit in `scripts/app-commit.txt`, run `sh scripts/fetch-app.sh` again and restart. `sh scripts/fetch-app.sh here`
copies the app from your own clone (`../app`) instead, as it is right now.

Then open http://localhost:8080/. Settings are environment variables (see `server/config.mjs`):

| variable | what |
|---|---|
| `REM_PUBLIC_HOST` | the address people use, without `https://` |
| `PORT` | port to listen on (8080) |
| `REM_DATA` | folder for the database and media (`~/looscidserver-data`) |
| `REM_OWNER_HANDLE` | the reserved owner handle (`2three1y`) |
| `REM_OWNER_INVITE_SHA256` | sha256 of your secret owner code (see PROTOCOL.md, Owner) |
| `REM_BACKUP_KEY_SHA256` | sha256 of a key that may download backups |
| `REM_INVITES_PER_USER`, `REM_INVITE_WAIT_DAYS` | invites a member earns, and after how many days (3, 7) |

Make an owner code and its hash: `CODE=$(head -c 12 /dev/urandom | base32 | tr -d =); echo $CODE; printf %s "$CODE" | sha256sum`.
Then bind your LooscidID as owner: `curl -X POST -H "X-Rem-Owner-Code: $CODE" -H 'Content-Type: application/json' -d '{"pubkey":"npub1..."}' https://<home>/rem/v0/admin/owner`.

Tests: `node test/core.test.mjs test/nip44.vectors.json` (keys, phrases, signatures, the official NIP-44 vectors)
and `node test/smoke.mjs <home-url> <secrets.json>` (57 end-to-end checks; it cleans up after itself).

## Layout

- `public/js/rem-core.js` the protocol rules shared by server and clients (objects, signatures, LooscidID, recovery phrase, NIP-44).
- `public/js/rem-client.js` a small client library. `public/app.js` the classic web client (served at `/classic/`).
- `webapp/` the Looscid app (a copy of this repo's `app/`), made by `scripts/fetch-app.sh` (not in git).
- `server/` the home: `main.mjs` (HTTP + routes), `rem.mjs` (rules), `db.mjs` (SQLite), `live.mjs` (WebSocket),
  `media.mjs` (image cleaning), `linkcard.mjs` (safe link cards), `config.mjs` (settings).

## Credits

See [CREDITS.md](CREDITS.md): noble-secp256k1 (MIT), better-sqlite3 (MIT), the BIP-39 wordlist (MIT).

The server folder is MIT licensed ([LICENSE](LICENSE)); the rest of the Looscid repo has its own license.
Made by 2three1y. Co-written with Tab.
