# Security

Carried over from the old `SECURITY.md` on the retired `main` line and rewritten for the Looscid that ships today. The old file's sample code and server advice did not match this app, so only its purpose is kept: how to report a problem, and what protects Dreamors now.

## Reporting a vulnerability

- Please report security problems privately, not in a public issue or a Dream.
- Use GitHub's private vulnerability reporting: open the repository's Security tab and choose Report a vulnerability, or go straight to https://github.com/Looscid/Looscid/security/advisories/new
- Say what you found, how to reproduce it, and what a Dreamor could lose (their Nostr key, a sign-in, saved data).
- 2three1y reads every report. Please give a reasonable chance to fix it before you share details.

## What is supported

- The live site, https://looscid.github.io/Looscid/, built from the `main` branch.
- Older lines and retired branches get no security fixes.

## How Looscid protects Dreamors today

### Your keys and sign-ins

- Your Nostr key stays on your device. You can lock it with a passcode (NIP-49), which is the default, or use a signer extension (NIP-07) so the key never enters Looscid at all.
- Mastodon and Bluesky sign-ins are kept only on your device, sealed with your Nostr key's passcode when it has one.
- For Bluesky, use an app password, never your main password. Looscid never stores the password itself.
- Removing a locked key also signs out the Mastodon and Bluesky sign-ins sealed to it, and Looscid says so first.

### The page itself

- A strict Content-Security-Policy: scripts load only from Looscid itself, plus one inline script allowed by its hash; no plugins; forms and the base address stay on Looscid.
- React is served from Looscid itself with an integrity check, not from a CDN.
- A frame guard: when another website shows Looscid in a frame, the app does not start and shows one plain message with a link that opens Looscid on its own.

### Looscid OS apps and Projects

- They run in a sandboxed frame without same-origin access, so they cannot reach Looscid's storage or your Nostr key.
- Their saved data lives in one separate key, `looscid_appdata`.

## For contributors

- Never commit keys, passwords, tokens or anyone's private data.
- Keep the Content-Security-Policy hash and the inline script in `app/index.html` in step: change one, change the other.
- New outside code goes in `app/js/vendor/`, pinned to a version, with its license.
- More on where things live: [FILES.md](dev/FILES.md).
