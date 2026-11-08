# Looscid Roadmap

## Product identity and vision

Looscid is a privacy-respecting, local-first operating system experience for Dreamors: accessible by design, interoperable through open protocols, and sovereign in identity and data ownership. The application should remain useful without an account, network connection, build service, or proprietary runtime. Do not de-bloat: preserve robust functionality, accessibility, terminology, and local-first behavior as capabilities expand.

## Architecture

The current shell uses semantic HTML and CSS with locally vendored React and ReactDOM 18.2.0 and pre-compiled JSX, with no build step or bundler. `app/index.html` provides the React mount point and polite live region and loads the vendored libraries and `app/js/` modules; those modules render the semantic landmarks and native controls and provide DOM behavior, local state, validation, navigation, and rendering. `app/styles.css` provides responsive presentation. Focus management, live regions, roving tabindex, mandatory image Alt text, and accessible validation are required.

## Phase 1 — completed

- [x] Semantic HTML/CSS shell with locally vendored React and ReactDOM 18.2.0 and pre-compiled JSX (no build step or bundler), onboarding, local accessibility preferences, localStorage profile/settings/drafts/Dreams.
- [x] Feed and Discover views with accessible main navigation and Feed tabs; Discover trending tiles support Enter/Space activation and section tabs support Left/Right with wrap plus Home/End.
- [x] Composer with photo attachments and Alt-text fields; publishing is text-only and requires confirmation to omit attachments.
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

Primary hosting is GitHub Pages at `https://looscid.github.io/Looscid/`. Deployment remains a reviewed static application with locally vendored React and ReactDOM runtime dependencies and no required build service.

## Social

X: @Looscid

## Circles and Discord

The public version of this list is the top of the roadmap and changelog page on the site (app/changelog/, looscid.github.io/Looscid/changelog/): Now, Next and Later, then the changelog as Done. Keep the two in step.

Now: the Looscid Discord has its own channels for 13 languages, optional faith channels (only Dreamors with both that language and that faith see them; LooscidBOT syncs the combined roles), and LooscidBOT holiday messages for each language and faith, with no pings (starting November 8, 2026).

Next:

- LooscidID profiles: sign up, log in, and an optional language and "what you celebrate" on the profile.
- Exploring: the Dreamor's Nostr key as the LooscidID itself, so there is no password to store.
- Discord Linked Roles: a Dreamor connects their LooscidID in Discord, Looscid tells Discord their language and faith, and Discord gives the roles. Change it in Looscid once and Discord follows.
- A Looscid Circle as a Linked Roles requirement (role settings, Links, add Looscid).
- Import from Discord: a Settings button that takes the Dreamor's own Discord data download.
- Server copy: LooscidBOT saves a server's channels, roles, permissions and join questions to one file, and a Looscid Circle imports it. The bot uses its own role (Read Message History for messages), never a person's account.
- Friend suggestions: opt-in, only when both Dreamors linked their LooscidID, suggestion only, never added automatically. Adding a friend directly never depends on anyone (no Admin, no setting): two Dreamors can always add each other themselves.

Later: move from the Discord into Looscid itself, with Circles for every language and faith. LooscidBOT's holiday code comes along.

## Pins, feeds and the More menu

Planned on November 7, 2026. Checkboxes mark planned work; nothing in this section is shipped yet unless it says so. The public version is in the Next list on the roadmap and changelog page (app/changelog/); keep the two in step.

Design rule: no new pages for new features. A new feature lives where the Dreamor already is (the options menus, the feeds, settings and the Commandbar they already use), not on a page of its own.

Shipped today, for context: a Circle, Dreamor, hashtag, thread or List can be pinned as a feed tab on Home and unpinned from that tab, and a Dreamor's profile can be added to the tab bar. Pins below grows that into one system for everything.

### Pins

- [ ] Pin anything: Dreams, Dreamors, hashtags, apps, Cherry chats and actions (like the Commandbar).
- [ ] Pin from every item's options button (the way that works with VoiceOver, since a website can't add rotor actions), by long press, or from the Commandbar.
- [ ] Where a pin goes, chosen when you pin: as a feed tab (Dreamors and hashtags only; Cherry chats are not feeds), in the quick menu, or just saved in your pins.
- [ ] Quick menu: one menu button, not a row of links, so VoiceOver passes it in one swipe. It shows your top pins (about six) and "See all pins". That list is where you see everything you pinned; it's the menu growing, not a new page.
- [ ] Rearrange (move left or right) or unpin a feed tab from that feed tab's More menu, and from feed settings.
- [ ] Pinned Dreams work like bookmarks, to come back to later.
- [ ] Pin folders: group your pins, like "music" or "games".
- [ ] Pin suggestions from Cherry, opt-in only: "You open this profile a lot. Pin it?"
- [ ] Commandbar commands: `pins` goes through all your pins, `pin @name`, `unpin #tag`, and moving feed tabs (`move #tag left`).
- [ ] Privacy: pins are private by default, and pinned chats are always private. An optional public pin list on your profile, where you choose what's on it; pinning something never puts it there on its own.
- [ ] Apps: no separate Apps section. Pin an app for quick access.

### Feeds menu

- [ ] One Feeds menu that holds your feeds, Circles and places in one spot. It ties into the Pins quick menu, so a pinned feed is one choice away from either.

### Tabs

- Create always stays the middle tab, whatever else is added. Five or six tabs is fine. Where this differs from the older Navigation notes under Discover below, this wins.

### More menu

- [ ] The classic More layout: a profile card on top, and a one-line description under each item, with the new items and groups added on top of it. Keep the groups (Profile, Looscid, About and account).
- [x] One-line descriptions under each item in the profile's More menu (Dreamor Options), read as part of the item's name.
  Completed on November 7, 2026.

### Settings styles

- [ ] Settings styles: let Dreamors pick how Settings is laid out, with the same settings in every style.
- [ ] Classic: one long list.
- [ ] Sections: grouped with headings and a search box on top. Build this one first.
- [ ] Sidebar: Sections on wide screens.
- [ ] The style you pick never changes unless you change it.

### Who sees your Dream

- [ ] Pick who sees each Dream: Public, Dreamors you follow, My people, or Only me.
- [ ] Set your default audience in Settings, so every new Dream starts with it. Change it on any Dream, anytime.
- [ ] My people: your own close list. The name isn't final, but it can't be "Circles", since Circles are groups. People aren't told when you add or remove them.
- [ ] Adding to My people: your mutuals are suggested at the top, with tabs for Mutuals, Following and Followers.
- [ ] Private mode: everything you make stays only with you until you turn it off.
- [ ] Privacy checkup in Settings → Privacy: a short walk through your privacy settings, one step at a time.
- [ ] The audience picker reads clearly with VoiceOver: each choice is one swipe, with its name and a one-line description.

### Cherry

- [ ] A new Cherry design, made by 2three1y.

### On every device

Carter, November 8, 2026: every change should show up everywhere; local first is for backups. These follow your LooscidID key through Rem, and this device keeps its own copy as the backup.

- [x] Likes sync, and each Dream on Rem shows how many people liked it.
- [x] ReDreams sync, and Rem counts them on each Dream.
- [x] Pinned Dreams sync. Private: only your own key can read them.
- [x] Mutes sync: muted Dreamors, muted threads and Not interested. Private: only your own key can read them.
- [x] Threads you follow sync. Private: only your own key can read them.
- [ ] Next: blocked words, blocked Circles, Dreamor notes, settings and drafts.

### Looscid apps

Carter, November 8, 2026: real Looscid apps, Android first. We build them in the open, so anyone can build them too.

- [ ] Android app first, built in Kotlin, open source (AGPL), in its own repo: Looscid/Looscid-Android. It starts as an app that opens Looscid, then we make the screens native one at a time.
- [ ] iOS app after that, built in Swift, in its own repo: Looscid/Looscid-iOS. You install it by sideloading.
- Updates:
  - [ ] Looscid updates itself when you open it. Most updates arrive instantly.
  - [ ] When the app itself needs an update, a "Looscid needs an update" alert pops up. Just tap to update.
  - [ ] An update screen with what's new that you can open anytime. It updates apps inside Looscid too.
- [ ] Get Looscid from open-source Android app stores.
- [ ] Apps page: each app links to where you can get it.
- Braille displays:
  - [ ] Enter submits one-line fields.
  - [ ] In the message box, Enter sends and Shift+Enter makes a new line. A Settings checkbox, "Enter sends messages", controls this.
  - [ ] Enter activates buttons, opens menus and checks boxes.
  - [ ] Enter runs the swipe action you're on, like Like Dream.
  - [ ] All of this works on any braille display.
- [ ] Works on privacy-focused Android phones with no Google services.

### Safety and privacy

- [ ] A "Friends of Friends" choice for who can see a Dream.
- [x] Moderators give a reason when they remove a Dream.
- [x] Blocklists.
- [x] Removals are public: the line in a removed Dream's place says whether a Circle's mods or a Looscid admin removed it, and why.
- [x] A public Mod log: every removal with its date, the Dream (never its words), moderator or admin, and the reason. It's in each Circle's About tab and in the Help Center.
- [x] Deleting your own Dream: with no replies it's just gone; with replies, one "Dream deleted" line stays so the thread still makes sense.

## Discover: navigation and refine decisions

These decisions guide the next navigation, Feed, Discover, and catalog changes; checkboxes distinguish shipped work from planned work.

- [x] DiscoverPage extracted into `discover.js`, with the inline definition removed from `index.html` (PR #23).
  Completed on September 28, 2026 at 1:39 AM.
- [x] Main decorative emoji sweep in user-facing strings (`62d1619`). Guest Terms and Admin Panel icon strings were also replaced; the Accessibility icon child kept its existing `aria-label`.
  Completed on September 25, 2026 at 9:56 AM.
- [ ] Five-tab navigation, Local-to-Nearby rename, and Discover Refine structure are not shipped; Sense rename is shipped.

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
- A time/recency group (Any time, Today, This week, This month) is optional: Tomo's suggestion, not 2three1y's, and cuttable.
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
