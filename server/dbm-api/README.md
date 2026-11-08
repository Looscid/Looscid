# dbm-api: the Rem server on Cloudflare

Rem, the Looscid protocol, version 1 (spec: `docs/protocol.md`). A Cloudflare Worker with a D1 database bound as `DB`.
Live at https://dbm-api.thebntlovver.workers.dev/health (CORS: only https://looscid.github.io and the branch test
preview https://looscid-preview.sites.tab.bot).

- `src/index.js`: the whole server, with comments in plain words (endpoints, signature checks, the feed algorithm).
  `/ingest` takes Rem v1 events and, for older data, signed Rem v0 objects (checked like the v0 home checks them).
- `schema.sql`: the D1 tables. Run it once in a new database.
- Build: `npm install && npm run build`, then deploy `dist/worker.js` (dashboard editor or wrangler).

No secrets are needed: every write is signed, and the server checks each signature itself. Server errors never send
details back (they go to the Worker's log).
Signatures are checked with [@noble/curves](https://github.com/paulmillr/noble-curves) (MIT), bundled into the build.
