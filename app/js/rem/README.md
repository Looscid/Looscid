# app/js/rem

The Rem client that the Looscid server uses, copied from [2three1y/looscidserver](https://github.com/2three1y/looscidserver)
`public/js/` (MIT), so the app signs Dreams for the server with the same code the server checks them with.

- `rem-core.js`, `rem-client.js`: Rem objects, ids, signatures (BIP-340 Schnorr, the same math as Nostr), the LooscidID helpers and the client.
- `vendor/noble-secp256k1.js` (MIT, Paul Miller; license next to it) and `vendor/bip39-english.js` (the BIP-39 word list).
- `looscid-backup.js`: the `.looscid` backup file (PBKDF2-SHA-256 + AES-GCM with WebCrypto). The same file is in the server's `public/js/`.

Loaded only when Settings, LooscidID, Looscid server or Backup file is used (`app/js/remsync.js`). No CDN.
