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

### GitHub App Stores and the native Looscid App Store

- [ ] Support GitHub-based App Stores broadly: repository releases, release assets, tags, packages, topics, repository metadata, and custom manifest files hosted in repositories.
- [ ] Define deterministic manifest discovery conventions, including repository-level `looscid-manifest.json`, `.looscid/manifest.json`, release-attached manifests, and an explicitly configured manifest URL.
- [ ] Build a manifest-based discovery engine that reads repository metadata and manifests, validates schemas, resolves versions and platform assets, captures licenses/permissions/checksums, and reports source provenance.
- [ ] Create a native Looscid App Store as a decentralized manifest registry using GitHub repositories as hosts. Registries may be mirrored, forked, reviewed, and combined rather than depending on one central service.
- [ ] Define registry indexes that reference signed or checksum-pinned Looscid manifests, with repository owner, commit or release pin, update timestamp, trust metadata, and moderation/review information.
- [ ] Keep GitHub discovery and the native registry provider-adapter based, so the same normalized app model works offline from cached manifests and across future hosts.

### Draft Looscid manifest schema

A Looscid manifest is JSON and should be versioned, human-reviewable, and safe to cache. Initial fields:

- `schema`: manifest schema identifier and version.
- `id`: globally stable reverse-domain or publisher-qualified app identifier.
- `name`, `summary`, `description`, `icon`, `homepage`: human-facing metadata.
- `publisher`: display name, publisher ID, repository URL, and optional signing identity.
- `license`: SPDX identifier and license URL.
- `categories`, `keywords`, `locales`: discovery and localization metadata.
- `permissions`: declared capabilities with user-readable reasons.
- `platforms`: OS, architecture, runtime, and minimum-version compatibility.
- `versions`: release version, channel, published timestamp, release URL, assets, checksums, signatures, and changelog.
- `source`: canonical repository, manifest path, ref/release pin, and provenance.
- `install`: provider-specific read-only instructions or adapter references; no silently executed commands.
- `integrity`: required digest algorithm and asset digests.
- `security`: signing, sandbox, update, rollback, and vulnerability-disclosure metadata.

The discovery engine must reject invalid or ambiguous manifests, preserve the source and pin used for every result, distinguish metadata from executable actions, and require explicit confirmation before install/update/uninstall operations.

### Proposed next steps

1. Write semantic shell interfaces and capability contracts first, independent of any Linux distribution, GitHub host, or package manager.
2. Implement read-only environment detection and a provider registry with mock adapters.
3. Implement the manifest schema, validator, deterministic GitHub manifest discovery, and normalized app model.
4. Add GitHub release/assets and registry-index adapters with commit/release pinning, checksum verification, caching, and offline behavior.
5. Build the native decentralized registry flow: publish, mirror, fork, review, combine, and refresh manifests.
6. Add explicit confirmation, dry-run output, cancellation, and rollback/error states for install, update, and uninstall flows.
7. Validate with accessible keyboard, screen-reader, Braille, offline, restricted-permission, invalid-manifest, and missing-provider scenarios.
8. Integrate real providers incrementally while keeping the no-dependency static shell and all existing functionality available.

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
- GitHub manifests and registry indexes must be validated, provenance-pinned, checksum-verified where assets are available, and treated as untrusted input until verified.

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
