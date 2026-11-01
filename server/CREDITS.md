# Credits

## Vendored code

- **noble-secp256k1** v3.2.0 by Paul Miller, MIT License. `public/js/vendor/noble-secp256k1.js`, license in `public/js/vendor/noble-secp256k1.LICENSE.txt`. https://github.com/paulmillr/noble-secp256k1. BIP-340 Schnorr signatures (the same math as Nostr) and ECDH for Chats.
- **better-sqlite3** v12.4.1 by Joshua Wise and contributors, MIT License. The JavaScript part is in `vendor/better-sqlite3/` (license in `vendor/better-sqlite3/LICENSE`). Its prebuilt native file (which includes SQLite, public domain) is downloaded by `scripts/setup-sqlite.sh`. https://github.com/WiseLibs/better-sqlite3
- **BIP-39 English wordlist**, from the Bitcoin BIPs repository (BIP-39 is under the MIT License). `public/js/vendor/bip39-english.js`. Used for the 24-word recovery phrase.
- **NIP-44 v2 test vectors** by Paul Miller (paulmillr/nip44), used only by the tests: `test/nip44.vectors.json`.

Everything else (the Rem protocol, the server, the WebSocket, the image cleaner, the link-card fetcher, NIP-44 encryption code, the web client) was written for Looscid.

## Standards it follows

- Nostr NIP-01 key format and BIP-340 signatures, NIP-19 (npub/nsec), NIP-44 v2 (Chat encryption).
- RFC 6455 (WebSocket).

## Made by

2three1y. Co-written with Tab.
