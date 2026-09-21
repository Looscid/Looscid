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
- [ ] Gabriel is a work in progress and is being built by a friend; keep its integration isolated behind the assistant adapter so it does not constrain custom AI support.

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
7. Add custom AI provider adapters and Gabriel integration without coupling the core shell to one provider.

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
| ReDreams | Reposts |
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
