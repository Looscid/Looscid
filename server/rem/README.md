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

## Website previews: `GET /preview?url=<address>` (Nov 8 2026)

A profile's website shows a preview card in the app (title and description). The app is a static site and can't read
other websites, so Rem reads the page and answers only `{ ok, url, title, description, site }`, as plain text. The code is
`src/preview.js`, with the safety rules written at the top: http and https on the normal ports only, private, internal and
reserved addresses refused (also when a name points to one, checked with a DNS lookup, and on every redirect), at most 3
redirects, a 5 second timeout, only the first 256 KB of an HTML page read, and 120 previews per hour per visitor. It needs
no new table, no secret and no new binding. If Rem doesn't have it yet, the app just shows the website as a plain link.

How to deploy it (the same way Rem is always deployed):
1. `cd server/rem && npm install && npm run build` (makes `dist/worker.js`, with `src/preview.js` bundled in).
2. Cloudflare dashboard, Workers & Pages, `rem`, Edit code. Replace everything with `dist/worker.js` and press Deploy.
   (Or `npx wrangler deploy dist/worker.js --name rem` with the `DB` binding kept.) The D1 binding stays as it is.
3. Check it: `https://rem.thebntlovver.workers.dev/preview?url=https://looscid.github.io/Looscid/About/` answers
   `"ok":true` with the About page's title, and `?url=http://127.0.0.1/` answers `"private address"`.
