# Looscid

**Just Dream**

Looscid is a social app for everyone, on any phone or computer, with touch, mouse, keyboard or a screen reader. It brings back the customization and freedom other apps took away. It's open source, so that power stays with the people who use it.

**Works today:** Dreams and Replies, Discover, Alerts, Soundpacks and settings backup, right in your browser.
**Not yet:** the full OS and Work mode.

**Try it:** [looscid.github.io/Looscid](https://looscid.github.io/Looscid)

**Our words:** Dreams, Redreams, Dreamors and the rest are explained in [TERMINOLOGY.md](docs/guides/TERMINOLOGY.md).

## Server

Looscid's server is **Rem** at https://rem.thebntlovver.workers.dev, a Cloudflare Worker with its own D1 database. Its code is in [server/rem/](server/rem/), and the protocol, Rem, is [docs/protocol.md](docs/protocol.md). Looscid is one product at one address: https://looscid.github.io/Looscid/. The older Rem v0 home server in [server/](server/) is retired (Nov 7 2026); its code stays here for reference. The server folder is MIT licensed. It used to be its own repo, now archived at [Looscid/looscidserver](https://github.com/Looscid/looscidserver).

## Community

- Discord: [Join the Looscid Discord](https://discord.gg/M6xrD8EBXU)

## Official version

`main` is the shipped Looscid line, and the site is built from it. Its [version.json](app/version.json) is authoritative: **Recipe Card: Looscid 2026.138.57 (195)**. Every build has a codename, added in front of the version with a colon. Versions are YEAR.FEATURES.FIXES (BUILD): feature updates add something, fix updates only fix things, and builds count every update.

The old `main` line (retired October 14, 2026) and combined branch counters are deprecated, not inherited into the product version. Documentation-only consolidation does not renumber the shipped version.

<details><summary>Branches</summary>

Where each Looscid app lives:

- Web app: [Looscid/Looscid](https://github.com/Looscid/Looscid), branch `main`. GitHub Pages publishes its `app/` folder.
- Android app: [Looscid/Looscid-Android](https://github.com/Looscid/Looscid-Android), branch `DEV`.
- iOS app: coming later, in its own repo, Looscid/Looscid-iOS.

Builds so far: web 195, Android 1, iOS 0 (196 total).

</details>

Heads up on versions: the 2026.FEATURES.FIXES (BUILD) style is just for the web beta. Till launch, the Android and iOS apps stay at 0.x, and the number in parentheses is each app's own build count. When Looscid launches, web, Android and iOS all hit 1.0 together.

## License

Looscid is open source under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0-or-later). Anyone can use it, change it and share it, companies too. The one catch: if you share a changed version or run it for other people, your version has to be open source under the AGPL too.

Copyright (C) 2025-present Looscid

The [server/](server/) folder (the retired Rem v0 home server) keeps its own MIT license. The names Looscid, LooscidID, Dreamors, Redreams, Cherry and Circles are Looscid's trademarks: the license covers the code, not the names.

Moderation reasons (a mod who removes a Dream has to say why, and the Dreamor sees it) are adapted from [Communities](https://github.com/danielbingham/communities) by Daniel Bingham, under the AGPL-3.0. Its copyright and license notice stay at the top of [app/js/modreasons.js](app/js/modreasons.js), and it's in the in-app Credits too.

Created by [2three1y](https://looscid.github.io/Looscid/).
