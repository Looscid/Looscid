# Looscid Roadmap

## Product identity and vision

Looscid is a privacy-respecting, local-first operating system experience for Dreamors: accessible by design, interoperable through open protocols, and sovereign in identity and data ownership. The application should remain useful without an account, network connection, build service, or proprietary runtime. Do not de-bloat: preserve robust functionality, accessibility, terminology, and local-first behavior as capabilities expand.

## Architecture

The rewrite is pure semantic vanilla HTML, CSS, and modern JavaScript with zero build step and zero dependencies. `index.html` provides semantic landmarks and native controls; `styles.css` provides responsive presentation; `app.js` provides DOM behavior, local state, validation, navigation, and rendering. Focus management, live regions, roving tabindex, mandatory image Alt text, and accessible validation are required.

## Phase 1 — completed

- [x] Dependency-free vanilla shell, onboarding, local accessibility preferences, localStorage profile/settings/drafts/Dreams.
- [x] Feed and Discover views with accessible navigation and feed tabs.
- [x] Composer enforcement: adding images requires Alt text.
- [x] Focus management, live announcements, and keyboard/VoiceOver/Braille navigation patterns.

## Phase 2 — immediate next milestones

- [ ] Port the Apps tab / AppsPage artifact from React/Vite into accessible vanilla DOM.
- [ ] Scaffold semantic Alerts with Mentions, Interactions, and System Logs.
- [ ] Create native DOM factories for Feed and Discover, separating local Dreams from Nostr relay Dreams.
- [ ] Unify About and Settings into one semantic navigation and preferences model.
- [ ] Add Nostr relay pool management and NIP-04/NIP-44 encryption without exposing secret keys.
- [ ] Deploy the dependency-free static application through GitHub Pages.

## Custom AI Integrations

Looscid must support user-selected AI providers without locking users to one model or vendor.

- [ ] Design an adapter interface for custom AI models, including Claude and other user-configured providers.
- [ ] Let users add provider endpoints, model identifiers, capability declarations, and local preferences through accessible Settings.
- [ ] Keep credentials in secure user-controlled storage; never place secrets in source, manifests, logs, or shared registry data.
- [ ] Support local/offline models where available and degrade gracefully when a provider is unavailable.
- [ ] Expose provider identity and data-sharing behavior clearly before a request is sent.
- [ ] Cherry integration is a work in progress; keep its integration isolated behind the assistant adapter so it does not constrain custom AI support.

## Phase 2A — cross-platform shell and App Store integration

This work is additive and must not de-bloat Looscid or replace working local behavior.

- [ ] Develop Linux-compatible semantic shell adapters for filesystem, process execution, environment detection, notifications, and permissions.
- [ ] Detect capabilities across Linux distributions, desktop environments, browsers, and runtimes.
- [ ] Detect apt, dnf, pacman, zypper, Flatpak, Snap, AppImage, and other external stores through isolated provider adapters.
- [ ] Support GitHub-based App Stores: repository releases, release assets, tags, packages, topics, metadata, and custom manifests.
- [ ] Discover `looscid-manifest.json`, `.looscid/manifest.json`, release manifests, and configured manifest URLs deterministically.
- [ ] Build a manifest discovery engine that validates metadata, resolves versions/assets, captures licenses/permissions/checksums, and preserves provenance.
- [ ] Create a native Looscid App Store as a decentralized manifest registry using GitHub repositories as hosts; registries can be mirrored, forked, reviewed, and combined.
- [ ] Require read-only discovery, dry runs, explicit confirmation, cancellation, integrity checks, and rollback/error states before mutations.

### Draft Looscid manifest schema

Versioned JSON manifests should include `schema`, `id`, `name`, `summary`, `description`, `icon`, `homepage`, `publisher`, `license`, `categories`, `keywords`, `locales`, `permissions`, `platforms`, `versions`, `source`, `install`, `integrity`, and `security`. Manifests are untrusted input until validated; every result retains its source and commit/release pin.

### Proposed next steps

1. Define semantic shell interfaces and capability contracts.
2. Implement read-only detection and mock provider adapters.
3. Implement the manifest schema, validator, GitHub discovery, and normalized app model.
4. Add registry indexes, release/assets adapters, checksum verification, caching, and offline behavior.
5. Build publish, mirror, fork, review, combine, and refresh flows for decentralized registries.
6. Add accessible confirmation, dry-run, cancellation, rollback, and failure recovery.
7. Add custom AI provider adapters and Cherry integration without coupling the core shell to one provider.

## Phase 3 — sovereign platform expansion

- [ ] Nostr-first authentication, guest mode, extension signing, and existing LooscidID connection.
- [ ] Full Circles, contacts, messaging, mail, file explorer, and Dream collaboration.
- [ ] Cherry context, chat, tagging, and Alerts integration.
- [ ] Fediverse/Mastodon interoperability and end-to-end encrypted messages/files.
- [ ] iOS Swift companion application and VoiceOver/BrailleNote Touch Plus testing.

## Accessibility and security standards

Every interaction uses a semantic native control. Images require meaningful Alt text. Errors are associated and announced. Focus moves intentionally after route changes, onboarding, validation, and dismissal. Reduced motion and larger text preferences are respected. Test keyboard-only, VoiceOver, Braille, TalkBack, offline, restricted-permission, invalid-manifest, and unavailable-provider scenarios. Never expose secrets. App Store and AI adapters require explicit user intent, visible data/action summaries, and cancellation opportunities.

## Terminology (never break these)

| Use | Never use |
|-----|-----------|
| Dreams | Posts |
| Dreamors | Users |
| Redreams | Reposts |
| Circles | Groups |
| LooscidID | Account |
| Feed | Home tab |
| Alerts | Notifications |
| Login | Sign In |
| Cherry | Claude or any other AI |

## Hosting

Primary hosting is GitHub Pages at `https://looscid.github.io/Looscid/`. Deployment remains a reviewed dependency-free static application with no required build service or runtime dependency.

## Social

X: @Looscid

## Discover: navigation and refine decisions

These decisions guide the next navigation, Feed, Discover, and catalog changes; checkboxes distinguish shipped work from planned work.

- [x] DiscoverPage extracted into `discover.js`, with the inline definition removed from `index.html` (PR #23).
  Completed on September 28, 2026 at 1:39 AM.
- [x] Main decorative emoji sweep in user-facing strings (`62d1619`). Guest Terms and Admin Panel icon strings were also replaced; the Accessibility icon child kept its existing `aria-label`.
  Completed on September 25, 2026 at 9:56 AM.
- [ ] Five-tab navigation, Local-to-Nearby rename, Discover Refine structure, and Sense rename are not shipped.

### Navigation

- Keep five persistent tabs, in order: Feed, Discover, Cherry, Alerts, More. Cherry occupies the center slot because she is a destination for history, a new chat, and projects, not an action.
- Create is not a tab. It is a top-level action button outside the tab row that opens the create menu. Promote Alerts to a top-level tab instead of burying it inside More.
- Call the first tab Feed. Launchpad and the app-launcher idea were considered and dropped: a launcher would duplicate Discover's catalog and need install state, opt-in per tile, and an accessible name per tile.

### Feed and Nearby

- Feed means subscribed content from people and circles the user follows; Discover covers everyone the user has not followed. Discover needs search and filters; Feed does not. Feed has Following and Nearby sub-tabs.
- Rename Local to Nearby: it surfaces dreams around the user, not on-device dreams, so Local promised something it never delivered. Nearby uses the browser geolocation prompt (allow, allow once, deny), without custom permission UI.
- On denial show a contextual dead end: `Location is off. To see dreams nearby, allow location access.` Provide `Allow location` and an origin-based return link naming its destination, such as `Go to Following` or `Go to For You`; never just `Back`.
- Make the denial message a polite live region so denial is announced instead of leaving focus in an empty pane. `Allow once` is temporary; when it lapses Nearby returns to the un-granted state, and copy must cover prompting again, not only denial.

### Discover Refine menu

- `Refine` is a plain button with no heading on the toggle. On expansion, the panel opens with a real heading and a one-line description such as `Narrow what shows in Discover`, followed by groups.
- Groups use headings and plain descriptions with no length cap. A heading is not a label; every control retains its own accessible name.
- Under `Filters`, separate `Content` (Apps, Games, Images, Videos) from `People` (Dreamors, Circles), rather than mixing content and people.
- `Price` uses radios `All`, `Free`, `Paid`, defaulting to `All`; never-selected is not a landing state. `Paid` reveals `Lifetime` and `Subscription` checkboxes; `Free` hides them. These are checkboxes, not radios: an app can sell both a lifetime unlock and a monthly subscription, and both may be on.
- Visible chip text: `Lifetime`; accessible name: `Lifetime, one-time purchase`. `Media` includes Has media and Verified.
- A time/recency group (Any time, Today, This week, This month) is optional: Tomo's suggestion, not Alhasan's, and cuttable.
- Move the results line with the filters: `Showing 14 of 22 apps` (pattern `Showing X of Y apps`). Empty state: `Nothing matches those filters` plus a `Clear filters` link. Apply button: `Show 14 results`.
- Tile announcement, in one sentence: `Looscid Music, App, free with subscription, press to open`.

### Catalog rules

- Call Circles `Circles` everywhere; `Groups` is not a synonym. Restaurant apps are out of the catalog entirely: they are transactions, not surfaces users return to.
- Reject an app if it is a transaction users finish and never return to (rideshare, grocery, food delivery); keep anything with a feed, inbox, or community.
- Give each catalog entry a real record: category, price type, display/plate text, and destination. Paid and Refine filters query these records rather than bespoke per-app code. Keep a short rejected list with reasons so the cut is not re-litigated for each app.
- Do not say `Get 100 subscriptions`, which reads as signing the user up. Say what is inside, e.g. `free to install, 3 subscriptions inside`.

### Accessibility rules

- Shorten what is seen, never what is announced. Preserve existing `aria-*`, `role`, `tabindex`, and handlers.
- No decorative emoji outside DreamLabs. Turn standalone emoji into short, readable plain text.
