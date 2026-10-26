# Looscid

Accessibility first, always.

Looscid is a social app built for VoiceOver, braille and keyboard from day one. It brings back the customization and freedom other apps took away. It's open source, so that power stays with the people who use it.

**Works today:** Dreams and Replies, Discover, Alerts, Soundpacks and settings backup, right in your browser.
**Not yet:** the full OS and Work mode.

**Try it:** [looscid.github.io/Looscid](https://looscid.github.io/Looscid)

**Our words:** Dreams, Redreams, Dreamors and the rest are explained in [TERMINOLOGY.md](docs/guides/TERMINOLOGY.md).

## Official version

`main` is the shipped Looscid line, and the site is built from it. Its [version.json](app/version.json) is authoritative: **Looscid 2026.128.53 (181)**. Versions are YEAR.FEATURES.FIXES (BUILD): feature updates add something, fix updates only fix things, and builds count every update.

The old `main` line (retired October 14, 2026) and combined branch counters are deprecated, not inherited into the product version. Documentation-only consolidation does not renumber the shipped version.

<details><summary>Branches</summary>

- `main`: the only branch. It is the shipped product, and GitHub Pages publishes its `app/` folder.
- October 14, 2026: the old `main` line was retired and `preview` was renamed to `main`. `MainV1`, `main-reset`, `rewrite/vanilla-phase-1`, `refactor/terminology-rename`, `refactor/discover-extraction` and `refactor/vite-build` were deleted after their useful docs were merged into `docs/`.

</details>
