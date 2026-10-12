# Vendored code

Looscid has no build step and loads nothing from a CDN for Nostr. The files here are committed as they are.

## nostr-tools-2.25.2-nip17.min.js

The Nostr crypto Looscid needs, and nothing else: keys, event signing and checking (secp256k1 Schnorr), nip19 (npub, nsec), nip49 (ncryptsec: scrypt plus XChaCha20-Poly1305), and since build 151 nip44 (encryption), nip59 (gift wrap) and nip17 (private direct messages). Build 151 renamed the file (it was nostr-tools-2.25.2.min.js) so no browser keeps the old copy without nip17. It is loaded only when you use a Nostr feature (js/nostr.js loads it), so first load stays the same size.

- Packages, pinned: nostr-tools 2.25.2, @noble/curves 2.0.1, @noble/hashes 2.0.1, @noble/ciphers 2.1.1, @scure/base 2.0.0. These are audited libraries by Paul Miller (noble, scure); nostr-tools is the reference Nostr library.
- Licenses: LICENSE in this folder (Unlicense for nostr-tools, MIT for the rest).
- Built once with esbuild 0.24.0: `esbuild entry.js --bundle --minify --format=iife --target=es2019 --legal-comments=eof`, from this entry file:

```js
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent, getEventHash } from "nostr-tools/pure";
import * as nip19 from "nostr-tools/nip19";
import * as nip49 from "nostr-tools/nip49";
import * as nip44 from "nostr-tools/nip44";
import * as nip59 from "nostr-tools/nip59";
import * as nip17 from "nostr-tools/nip17";
window.NostrTools = Object.freeze({ generateSecretKey, getPublicKey, finalizeEvent, verifyEvent, getEventHash, nip19: Object.freeze(Object.assign({}, nip19)), nip49: Object.freeze(Object.assign({}, nip49)), nip44: Object.freeze(Object.assign({}, nip44)), nip59: Object.freeze(Object.assign({}, nip59)), nip17: Object.freeze(Object.assign({}, nip17)), version: "2.25.2" });
```

- SHA-256 of the esbuild output (the file minus its first comment line): 1acf1760e2f962dc50bfcc734333d44e5af8cc8c11cde8702d1b407a18d9eba6 (the build 150 file without nip44, nip59 and nip17 was 47e80f62aa64c4260659774076bf256bc546c23dd78ab7eb5ef64cb96ad29a5c; the same toolchain still reproduces it byte for byte)
