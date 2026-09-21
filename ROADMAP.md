# Looscid Roadmap

## Product identity and vision

Looscid is the permanent name of the application and sovereign local-first environment.

Looscid is a privacy-respecting operating system experience for Dreamors: local by default, accessible by design, interoperable through open protocols, and sovereign in identity and data ownership. The application should remain useful without an account, network connection, build service, or proprietary runtime.

Looscid terminology is part of the product contract and should remain stable across the UI, source, documentation, and accessibility announcements.

## Architecture

The rewrite is pure semantic vanilla HTML, CSS, and modern JavaScript.

- `index.html` provides semantic landmarks, forms, headings, native controls, accessible relationships, and discrete UI blocks.
- `styles.css` provides responsive presentation without a framework.
- `app.js` provides native DOM behavior, local-first state, validation, navigation, and rendering without a framework.
- Zero build step.
- Zero dependencies.
- Double newlines separate all discrete blocks and semantic elements in source.
- Screen-reader optimized focus management moves focus to the active page or onboarding heading and announces state changes through live regions.
- Roving `tabindex` is used for Feed view tabs so keyboard, VoiceOver, and Braille users have one active tab stop at a time.
- Native semantic controls are preferred over simulated widgets.
- Images are never published without alternative text: adding images requires Alt text.

## Phase 1 — completed

- [x] Dependency-free vanilla shell: `index.html`, `styles.css`, and `app.js`.
- [x] First-time startup and onboarding intro screen with LooscidID/display name setup.
- [x] Local accessibility preferences for reduced motion and larger text.
- [x] Optional public Nostr npub setup, with explicit protection against entering secret keys.
- [x] LocalStorage persistence for profile, settings, drafts, onboarding completion, and local Dreams.
- [x] Returning visits skip onboarding and open directly to Feed.
- [x] Strict accessibility mandate: “Adding images requires Alt text.”
- [x] Composer enforcement prevents image publication when Alt text is empty.
- [x] Accessible image validation alerts, described fields, focus correction, and status announcements.
- [x] Startup principles and onboarding guidance explicitly require mandatory image descriptions.
- [x] Discrete block source layout with double-newline separation.
- [x] Focus management and roving `tabindex` behavior for screen-reader, keyboard, VoiceOver, and Braille navigation.

## Phase 2 — immediate next milestones

- [ ] Port the Apps tab / AppsPage artifact from React/Vite into an accessible vanilla DOM view.
- [ ] Scaffold semantic Alerts with Mentions, Interactions, and System Logs as a native `role="tablist"` interface.
- [ ] Create native DOM factories for Feed and Discover, separating local Dreams from Nostr relay Dreams.
- [ ] Unify About and Settings sections into one consistent semantic navigation and preferences model.
- [ ] Add Nostr relay pool management with connection state, relay preferences, and local-first failure handling.
- [ ] Integrate NIP-04 and NIP-44 encryption flows without exposing secret keys in source or UI logs.
- [ ] Deploy the dependency-free static application through GitHub Pages.

## Phase 2A — cross-platform shell and App Store integration

This work expands Looscid without de-bloating it. Existing functionality, accessibility behavior, local-first guarantees, terminology, and robust failure handling must remain intact. New platform integrations are additive and capability-driven; they must never replace working local behavior or assume a single distribution channel.

- [ ] Develop the cross-platform shell structure for the Linux-compatible semantic shell, with clear adapters for filesystem, process execution, environment detection, notifications, and permission boundaries.
- [ ] Define a platform capability matrix covering Linux distributions, desktop environments, browsers, and supported shell/runtime versions. Detect capabilities rather than relying on distribution-name assumptions.
- [ ] Add safe detection for external app stores and package managers, including native Linux sources such as `apt`, `dnf`, `pacman`, `zypper`, Flatpak, Snap, and AppImage where available.
- [ ] Design the App Store integration layer around provider adapters: discovery, metadata, install/update/uninstall actions, availability checks, and clear user confirmation before mutations.
- [ ] Keep provider integrations optional and isolated. A missing store, package manager, permission, network connection, or runtime must produce an accessible explanation and preserve the rest of Looscid.
- [ ] Normalize external app metadata into a stable Looscid model while retaining provider identity, source URL, version, license, permissions, architecture, and integrity information.
- [ ] Add dry-run and read-only discovery modes before enabling installation or update actions; never execute package-manager commands silently.
- [ ] Add tests for detection, adapter selection, command construction, cancellation, failure recovery, accessibility announcements, and offline/local-only behavior.
- [ ] Document security boundaries, trust decisions, signatures/checksums, sandboxing, and rollback expectations for every App Store provider.

### Proposed next steps

1. Write the semantic shell interfaces and capability contracts first, independent of any Linux distribution or package manager.
2. Implement read-only environment detection and a provider registry with mock adapters.
3. Build the App Store integration layer around discovery and metadata normalization before adding mutating operations.
4. Add explicit confirmation, dry-run output, cancellation, and rollback/error states for install, update, and uninstall flows.
5. Validate with accessible keyboard, screen-reader, Braille, offline, restricted-permission, and missing-provider scenarios.
6. Integrate real providers incrementally while keeping the no-dependency static shell and all existing functionality available.

## Phase 3 — sovereign platform expansion

- [ ] Nostr-first authentication, signup, extension signing, and connection of an existing LooscidID to a Nostr npub.
- [ ] Guest mode with a shared read-only Nostr guest account.
- [ ] Full Circles, contacts, messaging, mail, file explorer, and Dream collaboration experiences.
- [ ] Cherry project context, chat, tagging, and Alerts integration.
- [ ] Fediverse and Mastodon interoperability.
- [ ] End-to-end encrypted messages and files.
- [ ] iOS native Swift companion application.
- [ ] VoiceOver custom actions and BrailleNote Touch Plus / KeySoft release testing.

## Accessibility standards

- Every interaction uses a native button, link, input, or other semantic element.
- Every image requires meaningful alternative text before publication. Decorative imagery must be explicitly marked as decorative rather than silently omitted.
- Validation errors are programmatically associated with their fields and announced through live regions.
- Focus is moved intentionally after route changes, onboarding transitions, validation failures, and menu dismissal.
- Roving `tabindex` keeps composite controls efficient for keyboard, VoiceOver, and Braille navigation.
- Reduced motion is respected through `prefers-reduced-motion` and the local preference.
- Labels use concise, first-letter-navigation-friendly language and VoiceOver-friendly pauses.
- Test targets include iPhone with VoiceOver, HumanWare Braille displays, BrailleNote Touch Plus with KeySoft, Android tablet with TalkBack, keyboard-only navigation, and high zoom.

## Security and data ownership

- No secrets in source, static assets, or demo content.
- Never request or store a secret Nostr key in the onboarding form.
- LocalStorage is used for local-first profile, preference, draft, and Dream state.
- Relay credentials and encryption material must be handled through secure user-controlled APIs when those integrations are added.
- Branch protection and review remain required before changes reach `main`.
- App Store adapters must not execute commands without explicit user intent, visible command/action summaries, and an opportunity to cancel.

## Terminology (never break these)

| Use | Never use |
|-----|-----------|
| Dreams | Posts |
| Dreamors | Users |
| ReDreams | Reposts |
| Circles | Groups |
| LooscidID | Account |
| Feed | Home tab |
| Alerts | Notifications |
| Login | Sign In |
| Cherry | Claude or any other AI |

## Hosting

Primary hosting is GitHub Pages.

- Target URL: `https://looscid.github.io/Looscid/`
- Deployment target: the dependency-free static application.
- Deployment must not introduce a required build service or runtime dependency.
- Automatic deployment should publish the reviewed static files from the selected branch.

## Social

X: @Looscid
