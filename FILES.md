# Files

Looscid has no build step. The browser loads plain files in a fixed order: no modules, no bundler, nothing to install.

## What lives where

| File | What it holds |
|---|---|
| `index.html` | The frame only: meta tags, the startup screen, the live region `#looscid-live`, the script tags in load order, and the mount at the end. |
| `css/app.css` | The app's styles. |
| `css/a11y.css` | Startup screen, Commandbar, earcon cues and Settings > Accessibility styles (`<link id="lc-a11y-css">`). |
| `js/core.js` | Shared state and preferences (`dbm_` storage keys), icons, sounds (earcons, pitch cues), navigation and routing (`App`, the frame), Alerts storage, the update check and version, shared screens and helpers, and the plain DOM helpers (`lcEl`, `lcPatch`, `lcPlainScreen`). |
| `js/nostr.js` | Dreams on Nostr (Round 6.4): your Nostr key (plain, or locked with a passcode as NIP-49), relays, sending Dreams with a retry queue, and reading your own Dreams back. **Plain JavaScript.** It loads the crypto from `js/vendor/` only when a Nostr feature is used. |
| `js/vendor/` | Vendored code, committed as is: `nostr-tools-2.25.2.min.js` (keys, signing, nip19, nip49), its `LICENSE`, and a `README.md` with how it was built. |
| `js/discover.js` | The Discover tab. **Plain JavaScript.** |
| `js/circles.js` | Circles: create a Circle, a Circle's page, its admin settings, the Circles list. Still React. |
| `js/feed.js` | The Feed (Home) tab. Still React. |
| `js/create.js` | Create (New Dream), attachments, symbols and Drafts. Still React. |
| `js/alerts.js` | The Alerts tab and messages. **Plain JavaScript.** |
| `js/more.js` | The More tab and everything it opens: Settings, LooscidID pages, About, Apps, Admin, policies. Still React. |
| `js/cherry.js` | Cherry, the assistant overlay. Still React. |
| `nexos/` | NexOS and its apps, unchanged. |

## Load order

1. React and ReactDOM (UMD). They go once the last React tab is rewritten.
2. `js/core.js`
3. `js/nostr.js` (small; `js/vendor/nostr-tools-2.25.2.min.js` is added later, only when Nostr is used)
4. The tabs: `js/discover.js`, `js/circles.js`, `js/feed.js`, `js/create.js`, `js/alerts.js`, `js/more.js`
5. `js/cherry.js`
6. The mount: a short inline script at the end of `index.html` that starts the app.

## One namespace

Each file is wrapped in `(function (Looscid) { ... })(window.Looscid = window.Looscid || {});`. It shares what it defines by putting it on `window.Looscid`, and it reads what earlier files shared from there. Nothing else goes on `window`, so files cannot clash.

- A file may copy names from an earlier file at its top (`const { announce, lcSet } = Looscid;`).
- A name from a later file is read when it is used, as `Looscid.Name`, because that file has not loaded yet when this one starts.
- State that changes while the app runs (for example `Looscid.A11Y_NOW`, `Looscid.LC_NAV` and `Looscid.LC_FEED`) is always read and written as `Looscid.Name`, so every file sees the same value.

## Plain JavaScript tabs

A plain tab builds its screen with `lcEl(tag, props, ...children)`, which returns real DOM elements. It redraws with `lcPatch(host, newScreen)`, which updates the screen in place: nodes that stay keep their focus, their text caret and the screen reader's position. `lcPatch` only removes attributes it set itself, so braille labels added by other code stay.

`lcPlainScreen(name, start)` lets the frame show a plain tab while the frame itself is still React. Once the last React tab is rewritten, the frame and `lcPlainScreen` become plain code too.

Accessibility markup is copied verbatim from the React version: every `aria-*`, `role`, `tabindex`, focus move and the live region. A render check compares each plain tab with Round 6, node by node and including focus, before the React copy is deleted.
