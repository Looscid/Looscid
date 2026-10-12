# Vendored code

Looscid has no build step and loads no code from a CDN. The files here are committed as they are.

## nostr-tools-2.25.2-nip17.min.js

The Nostr crypto Looscid needs, and nothing else: keys, event signing and checking (secp256k1 Schnorr), nip19 (npub, nsec), nip49 (ncryptsec: scrypt plus XChaCha20-Poly1305), and since build 151 nip44 (encryption), nip59 (gift wrap) and nip17 (private direct messages). Build 151 renamed the file (it was nostr-tools-2.25.2.min.js) so no browser keeps the old copy without nip17. nostr-tools-2.25.2.min.js is back as a byte-for-byte copy of the new file (Oct 12): a page opened before the rename still asks for the old name, and when that file was gone it said "Couldn't load the Nostr tools" when adding a key. Never delete a vendored file a released page may still ask for; add the new name beside it. It is loaded only when you use a Nostr feature (js/nostr.js loads it), so first load stays the same size.

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

## react-18.2.0.production.min.js and react-dom-18.2.0.production.min.js

React and React DOM 18.2.0, the UMD production builds, copied unchanged from the npm packages (react-18.2.0.tgz and react-dom-18.2.0.tgz, folder umd/). Until the security pass of Oct 12, 2026 they loaded from cdn.jsdelivr.net with no integrity check; now they come from this site only, and index.html loads them with `integrity=` so a changed file is refused. The version is in the file name, so a new version gets a new name and no phone keeps an old copy.

- SHA-256: react 4b4969fa4ef3594324da2c6d78ce8766fbbc2fd121fff395aedf997db0a99a06, react-dom 21758ed084cd0e37e735722ee4f3957ea960628a29dfa6c3ce1a1d47a2d6e4f7 (the same bytes npm and jsDelivr serve).
- integrity (SHA-384): react sha384-tMH8h3BGESGckSAVGZ82T9n90ztNXxvdwvdM6UoR56cYcf+0iGXBliJ29D+wZ/x8, react-dom sha384-bm7MnzvK++ykSwVJ2tynSE5TRdN+xL418osEVF2DE/L/gfWHj91J2Sphe582B1Bh. If you ever replace a file, update both attributes in index.html (preload and script).
- License: MIT, in LICENSE in this folder.

## qrcode-generator-1.4.4.js

QR Code Generator for JavaScript 1.4.4 by Kazuhiko Arase, the file qrcode.js copied unchanged from the npm package (qrcode-generator-1.4.4.tgz). Since build 152 (prep, #99 part 4) it draws the QR code under a profile's Dreamor options; app/js/more.js loads it only when a QR code is shown, from this site, with an integrity check.

- SHA-256: 18ae399f81182bc9de916e9c77b195df20cc58d6f2d55a62b085a299f1bf1780
- integrity (SHA-384): sha384-8FWZA6BGMXhsfO+BLtrJK0We6gg5o1JyO8xQm6peWDEUs17ACA5ziE/NIAkl9z2k. If you ever replace the file, update LC_QR_SRI in app/js/more.js.
- License: MIT, in LICENSE in this folder. "QR Code" is a registered trademark of DENSO WAVE INCORPORATED.
