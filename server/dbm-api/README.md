# dbm-api: the Looscid server on Cloudflare

Looscid Protocol v0 (spec: `docs/protocol.md`). A Cloudflare Worker with a D1 database bound as `DB`.
Live at https://dbm-api.thebntlovver.workers.dev/health (CORS: only https://looscid.github.io).

- `src/index.js`: the whole server, with comments in plain words (endpoints, signature check, the feed algorithm).
- `schema.sql`: the D1 tables. Run it once in a new database.
- Build: `npm install && npm run build`, then deploy `dist/worker.js` (dashboard editor or wrangler).

No secrets are needed: every write is a signed event, and the server checks each signature itself.
Signatures are checked with [@noble/curves](https://github.com/paulmillr/noble-curves) (MIT), bundled into the build.
