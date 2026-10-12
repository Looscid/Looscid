# Files

Looscid has no build step. The browser loads plain files in a fixed order: no modules, no bundler, nothing to install.

Everything the site loads lives in `app/`, which GitHub Pages publishes as https://looscid.github.io/Looscid/ (no /app in the address). The docs live in `docs/`.

## What lives where

| File | What it holds |
|---|---|
| `app/index.html` | The frame only: meta tags, the startup screen, the live region `#looscid-live`, the script tags in load order, and the mount at the end. |
| `app/404.html` | Real page addresses (#69): GitHub Pages serves it for any address under /Looscid/ that isn't a file, and it sends that address into the app as `?p=<path>`. `LC_ROUTES` in `app/js/core.js` maps each page to its address (case never matters); `index.html` sets a `<base>` so files always load from the app folder. |
| `app/css/app.css` | The app's styles. |
| `app/css/a11y.css` | Startup screen, Commandbar, earcon cues and Settings > Accessibility styles (`<link id="lc-a11y-css">`). |
| `app/js/core.js` | Shared state and preferences (`looscid_` storage keys), icons, sounds (earcons, pitch cues), navigation and routing (`App`, the frame), Alerts storage, the update check and version, shared screens and helpers, and the plain DOM helpers (`lcEl`, `lcPatch`, `lcPlainScreen`). |
| `app/js/nostr.js` | Dreams on Nostr (Round 6.4): your Nostr key (plain, or locked with a passcode as NIP-49), relays, sending Dreams with a retry queue, and reading your own Dreams back. **Plain JavaScript.** It loads the crypto from `app/js/vendor/` only when a Nostr feature is used. |
| `app/js/vendor/` | Vendored code, committed as is: `nostr-tools-2.25.2-nip17.min.js` (keys, signing, nip19, nip49, and since build 151 nip44, nip59 and nip17 for private messages), its `LICENSE`, and a `README.md` with how it was built. |
| `app/js/discover.js` | The Discover tab. **Plain JavaScript.** |
| `app/js/circles.js` | Circles: create a Circle, a Circle's page, its admin settings, the Circles list. Still React. |
| `app/js/feed.js` | The Feed (Home) tab. Still React. |
| `app/js/create.js` | Create, and the composer for New Dream, Reply and Quote (`LcComposer`, Round 6.5), attachments with the alt text helper, symbols and Drafts. Still React. Saved replies (`looscid_replies`), the Replies page and link previews are in `app/js/core.js`. |
| `app/js/alerts.js` | The Alerts tab and messages. **Plain JavaScript.** |
| `app/js/more.js` | The More tab and everything it opens: Settings, LooscidID pages, About, Apps, Admin, policies. Still React. |
| `app/js/cherry.js` | Cherry, the assistant, on its own page (Round 6.5.2): the chat, New Chat, Your History (All and Pinned, saved in `looscid_cherry_chats`) and What Cherry did. The page is **plain JavaScript**; the model picker in Settings, Intelligence is still React. Cherry's answers (`cherryRespond`) live here too. |
| `app/js/commands.js` | The Commands page (Round 6.5.3): every Commandbar command grouped by area, each a button that runs it through Commandbar's own runner. **Plain JavaScript.** The commands themselves (`LC_COMMANDS`, `LC_EXACT`, `lcRun`) stay in `app/js/core.js`. |
| `app/js/projects.js` | Projects (Round 6.6): 2three1y's own projects (`LC_PROJECTS`), the project page with Back and Close, the Commandbar words (projects, open and a project, lyrics and a song) and Dream Results from Memeprojects. **Plain JavaScript.** |
| `app/js/helpcenter.js` | Help (Round 6.6): `help` (the top commands), an area and `help` (cherry help), `help list`, `new dream`, and the Help Center page. **Plain JavaScript.** |
| `app/js/liked.js` | Liked (build 147): `LikedView`, one component for everything you like (Dreams, Circles, Apps, Marketplace, Chats, Searches, with an Images filter), used by your profile's Liked tab. Its store, `looscid_liked`, is in `app/js/core.js`. Still React, like the profile. |
| `app/projects/` | The ported projects, one folder each with its own `LICENSE`, plus `dream-results.js` (the Dream Results button inside Memeprojects). |
| `app/os/` | Looscid OS and its apps (it started as NexOS; the old `/Looscid/nexos/` addresses redirect here through `app/404.html`). Memeprojects also loads `app/projects/dream-results.js`. |

## Load order

1. React and ReactDOM (UMD). They go once the last React tab is rewritten.
2. `app/js/core.js`
3. `app/js/nostr.js` (small; `app/js/vendor/nostr-tools-2.25.2-nip17.min.js` is added later, only when Nostr is used)
4. The tabs: `app/js/discover.js`, `app/js/circles.js`, `app/js/feed.js`, `app/js/create.js`, `app/js/alerts.js`, `app/js/more.js`
5. `app/js/cherry.js` (Round 6.5.2: same place in the order; the frame shows its page with `case "cherry"` in `app/js/core.js`)
6. `app/js/commands.js` (Round 6.5.3: new, right after `app/js/cherry.js`; the frame shows its page with `case "commands"` in `app/js/core.js`)
7. `app/js/projects.js` (Round 6.6: new, right after `app/js/commands.js`; the frame shows a project with `case "project"` in `app/js/core.js`)
8. `app/js/helpcenter.js` (Round 6.6: new, right after `app/js/projects.js`; the frame shows its page with `case "helpcenter"` in `app/js/core.js`)
9. `app/js/liked.js` (build 147: new, right after `app/js/helpcenter.js`; the profile's Liked tab renders `Looscid.LikedView`)
10. The mount: a short inline script at the end of `app/index.html` that starts the app.

## One namespace

Each file is wrapped in `(function (Looscid) { ... })(window.Looscid = window.Looscid || {});`. It shares what it defines by putting it on `window.Looscid`, and it reads what earlier files shared from there. Nothing else goes on `window`, so files cannot clash.

- A file may copy names from an earlier file at its top (`const { announce, lcSet } = Looscid;`).
- A name from a later file is read when it is used, as `Looscid.Name`, because that file has not loaded yet when this one starts.
- State that changes while the app runs (for example `Looscid.A11Y_NOW`, `Looscid.LC_NAV` and `Looscid.LC_FEED`) is always read and written as `Looscid.Name`, so every file sees the same value.

## Plain JavaScript tabs

A plain tab builds its screen with `lcEl(tag, props, ...children)`, which returns real DOM elements. It redraws with `lcPatch(host, newScreen)`, which updates the screen in place: nodes that stay keep their focus, their text caret and the screen reader's position. `lcPatch` only removes attributes it set itself, so braille labels added by other code stay.

`lcPlainScreen(name, start)` lets the frame show a plain tab while the frame itself is still React. Once the last React tab is rewritten, the frame and `lcPlainScreen` become plain code too.

Accessibility markup is copied verbatim from the React version: every `aria-*`, `role`, `tabindex`, focus move and the live region. A render check compares each plain tab with Round 6, node by node and including focus, before the React copy is deleted.
