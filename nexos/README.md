# NexOS, ported into Looscid

This folder is NexOS, copied into Looscid so Looscid no longer links out to another site.

**Where it came from:** [github.com/2three1y/nexos](https://github.com/2three1y/nexos), branch `gh-pages`,
commit `0c2fb6b85493f1e9af9cd6a9ffda3d4df65a1ceb` (October 8, 2026,
"Hyperpop beat remake: no voice, FL-style FX hits ..."). The NexOS repository is unchanged; this is a copy.

NexOS and Looscid are both by Alhasan Altameemi (2three1y). NexOS is MIT licensed, see `LICENSE`.
The original NexOS README is kept as `NEXOS-README.md`, and the app list as `APPS.md`.

## What is here

| Folder | What it is | Served at |
| --- | --- | --- |
| `real/` | The real NexOS kernel in the browser: `nexos-i686.iso` booted by the v86 emulator (`real/v86/`, BSD-2-Clause, see `real/v86/LICENSE`) | `/Looscid/nexos/real/` |
| `web/` | NexOS Web, the desktop (index.html, script.js, styles.css, sw.js) | `/Looscid/nexos/web/` |
| `apps/insomnia/` | Insomnia OS | `/Looscid/nexos/apps/insomnia/` |
| `apps/memeprojects/` | Meme Projects (MIT, see its `LICENSE`), with `lib/` | `/Looscid/nexos/apps/memeprojects/` |
| `apps/easyconvert/` | Easyconvert, now with its own page (`index.html`, `easyconvert.js`, `easyconvert.css`) plus JSZip (MIT, `JSZIP-LICENSE.txt`) | `/Looscid/nexos/apps/easyconvert/` |
| `apps/nexos-embed.js` | The small bridge the apps load when they run inside the NexOS Web desktop | |
| `beat/` | The NexOS beats (`.m4a`) and `genres.json` | `/Looscid/nexos/beat/` |
| `index.html` | A plain list of all of the above | `/Looscid/nexos/` |

Left out: the kernel's Rust source (`kernel/`, `userland/`, `.cargo/`, `boot/`, `build.sh`, `Makefile`, Cargo files).
The built ISO is what runs; build it yourself from the NexOS repository with `make iso32`.

## Changes from the original

- `web/`: the desktop moved one folder down, so its links to `apps/`, `beat/` and `real/` now start with `../`.
  Its offline cache (`sw.js`) uses the new paths and only ever clears its own `nexos-web-` caches.
- `real/`: a Back button and a Stop NexOS button (Stop pauses the emulated PC and its sound; press again to carry on).
  The status line says "Starting NexOS. This is a big download" while it downloads, with progress at most every 4 seconds.
  The console mirror of the serial port (polite live log) is throttled to one entry per pause, at most about one every 0.7 seconds.
  Back: inside Looscid it posts `{ nexos: "back" }` to Looscid; on its own page it goes to `?back=` (same site only),
  then the page you came from on this site, then NexOS Web.
- `apps/easyconvert/`: Easyconvert used to live only inside the NexOS Web desktop. It now also has its own page,
  the same converter, so Looscid can open it directly.
- `apps/insomnia/`: the desktop now starts below the photosensitivity notice. On a phone the notice used to cover the
  desktop icons, so a tap on Soundscape hit the notice instead (seen on Pixel 7 and iPhone 15 sizes).
- Everything else is byte for byte the same as the commit above.
