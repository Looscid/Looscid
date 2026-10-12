# Vendored code

Looscid has no build step and loads nothing from a CDN for Nostr. The files here are committed as they are.

## nostr-tools-2.25.2.min.js

The Nostr crypto Looscid needs, and nothing else: keys, event signing and checking (secp256k1 Schnorr), nip19 (npub, nsec) and nip49 (ncryptsec: scrypt plus XChaCha20-Poly1305). It is loaded only when you use a Nostr feature (js/nostr.js loads it), so first load stays the same size.

- Packages, pinned: nostr-tools 2.25.2, @noble/curves 2.0.1, @noble/hashes 2.0.1, @noble/ciphers 2.1.1, @scure/base 2.0.0. These are audited libraries by Paul Miller (noble, scure); nostr-tools is the reference Nostr library.
- Licenses: LICENSE in this folder (Unlicense for nostr-tools, MIT for the rest).
- Built once with esbuild 0.24.0: `esbuild entry.js --bundle --minify --format=iife --target=es2019 --legal-comments=eof`, from this entry file:

```js
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent, getEventHash } from "nostr-tools/pure";
import * as nip19 from "nostr-tools/nip19";
import * as nip49 from "nostr-tools/nip49";
window.NostrTools = Object.freeze({ generateSecretKey, getPublicKey, finalizeEvent, verifyEvent, getEventHash, nip19: Object.freeze(Object.assign({}, nip19)), nip49: Object.freeze(Object.assign({}, nip49)), version: "2.25.2" });
```

- SHA-256 of the esbuild output (the file minus its first comment line): 47e80f62aa64c4260659774076bf256bc546c23dd78ab7eb5ef64cb96ad29a5c
