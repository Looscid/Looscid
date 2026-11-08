# rem: the Rem server on Cloudflare

Rem, the Looscid protocol, version 1 (spec: `docs/protocol.md`). A Cloudflare Worker with a D1 database bound as `DB`.
Live at https://rem.thebntlovver.workers.dev/health (Worker "rem", D1 database "looscid-db"). CORS: only
https://looscid.github.io (plus the test preview https://looscid-preview.sites.tab.bot while it still runs).
It was called `dbm-api` until Nov 7 2026; that name is retired.

- `src/index.js`: the whole server, with comments in plain words (endpoints, signature checks, the feed algorithm).
  `/ingest` takes Rem v1 events and, for older data, signed Rem v0 objects (checked like the v0 home checks them).
- `schema.sql`: the D1 tables. Run it once in a new database.
- Build: `npm install && npm run build`, then deploy `dist/worker.js` (dashboard editor or wrangler).

Migration from the Rem v0 home (Nov 7 2026): the old home (looscidserver.sites.tab.bot) held 1 Dreamor, 2 Dreams
and 0 follows. One Dream had been deleted by its author (left deleted). The other is a Followers Dream, and Rem only
holds public Dreams, so `/ingest` refused it ("only public Rem v0 Dreams are taken here"). The profile there had no
signed object to carry over. So nothing moved, and nothing needed re-signing. A full backup of the old home was kept.

No secrets are needed: every write is signed, and the server checks each signature itself. Server errors never send
details back (they go to the Worker's log).
Signatures are checked with [@noble/curves](https://github.com/paulmillr/noble-curves) (MIT), bundled into the build.
