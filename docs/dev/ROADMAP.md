# the looscid roadmap

## what looscid even is

we're building a private, local-first, whole-os kinda experience for Dreamors. accessible from day one, works with open protocols, and ur identity n ur data are urs, period. looscid should still be useful with no LooscidID, no wifi, no build service and nothing locked down. and we don't de-bloat, damn it: as we add stuff, we keep the real features, the accessibility, our words and the local-first stuff solid.

## how it's built

right now it's plain semantic HTML n CSS, with React and ReactDOM 18.2.0 saved right in the repo and JSX that's already compiled. no build step, no bundler. `app/index.html` has the spot React mounts into plus a polite live region, and it loads those libraries and the `app/js/` modules. those modules draw the landmarks and the native controls, and handle the DOM stuff, local state, checking what u type, getting around and drawing everything. `app/styles.css` makes it fit any screen. focus management, live regions, roving tabindex, required Alt text on images and accessible error messages are non-negotiable.

## phase 1: done

- [x] the semantic HTML/CSS shell with React and ReactDOM 18.2.0 saved in the repo and pre-compiled JSX (no build step, no bundler), onboarding, ur accessibility settings saved on ur device, and ur profile, settings, drafts n Dreams in localStorage.
- [x] Feed and Discover, with main nav and Feed tabs that actually work w a screen reader. trending tiles in Discover open with Enter or Space, and section tabs move with Left/Right (they wrap around) plus Home/End.
- [x] the composer, with photo attachments and Alt text fields. Dreams go out text only for now, so we ask u to confirm before we leave the attachments off.
- [x] focus management, live announcements, and getting around with a keyboard, VoiceOver or braille.

## phase 2: what's up next

- [ ] move the Apps tab (the AppsPage thing) from React/Vite over to accessible vanilla DOM.
- [ ] set up Alerts for real, with Mentions, Interactions and System Logs.
- [ ] build native DOM pieces for Feed and Discover, and keep ur local Dreams separate from Dreams from Nostr relays.
- [ ] merge About and Settings into one way to get around and one set of settings.
- [ ] let u manage ur Nostr relays and add NIP-04/NIP-44 encryption, without ever showing ur secret key.
- [ ] put the whole app on GitHub Pages, no dependencies needed.

## ur AI, ur pick

we wanna let u pick ur own AI, not lock u into one model or one company.

- [ ] build one plug-in shape for custom AI models, for whatever provider u set up.
- [ ] let u add a provider's endpoint, model name, what it can do and ur own preferences, all in accessible Settings.
- [ ] keep ur keys in secure storage u control. secrets never go in the code, manifests, logs or shared registry stuff. ever.
- [ ] run local/offline models when u have em, and keep working fine when a provider's down.
- [ ] show u clearly who the provider is and what data they get, before anything gets sent.
- [ ] Cherry's still a work in progress. we keep her behind the assistant plug-in, so she never gets in the way of custom AI.

## phase 2A: works everywhere + app stores

all of this gets added on top. we're not de-bloating looscid or ripping out stuff that already works on ur device.

- [ ] Linux-friendly shell pieces for files, running processes, figuring out where we're running, notifications and permissions.
- [ ] figure out what's available across Linux distros, desktops, browsers and runtimes.
- [ ] spot apt, dnf, pacman, zypper, Flatpak, Snap, AppImage and other outside stores, each through its own separate adapter.
- [ ] support App Stores that live on GitHub: releases, release files, tags, packages, topics, metadata and custom manifests.
- [ ] find `looscid-manifest.json`, `.looscid/manifest.json`, release manifests and manifest URLs u set, the same way every single time.
- [ ] a manifest finder that checks the metadata, picks the right versions n files, grabs licenses/permissions/checksums, and remembers where everything came from.
- [ ] our own Looscid App Store: a decentralized manifest registry that lives in GitHub repos. anyone can mirror, fork, review and combine registries.
- [ ] before anything changes on ur device: look-only discovery, dry runs, u say yes first, u can cancel, integrity checks, and rollback n error states.

### the manifest format (draft)

manifests are versioned JSON with `schema`, `id`, `name`, `summary`, `description`, `icon`, `homepage`, `publisher`, `license`, `categories`, `keywords`, `locales`, `permissions`, `platforms`, `versions`, `source`, `install`, `integrity` and `security`. we don't trust a manifest til it's checked, and every result keeps where it came from plus its commit/release pin.

### what we do next, in order

1. figure out the shell interfaces and what each capability promises.
2. do look-only detection and fake provider adapters first.
3. build the manifest format, the checker, GitHub discovery and one clean app model.
4. add registry indexes, release/file adapters, checksum checks, caching and offline mode.
5. build publish, mirror, fork, review, combine and refresh for decentralized registries.
6. add accessible confirm, dry run, cancel, rollback and getting back on track after errors.
7. add custom AI provider adapters and Cherry, without tying the core shell to one provider.

## phase 3: going big (and fully ours)

- [ ] Nostr-first login, guest mode, signing with an extension, and connecting a LooscidID u already have.
- [ ] full Circles, contacts, messaging, mail, a file explorer, and making Dreams together.
- [ ] Cherry hooked into context, chat, tagging and Alerts.
- [ ] working with Mastodon and the fediverse, plus end-to-end encrypted messages n files.
- [ ] an iOS companion app in Swift, tested with VoiceOver and the BrailleNote Touch Plus.
- [x] our own issue tracker: report bugs or ideas right in looscid, agree or disagree, mods reply. no outside companies.

## accessibility + security (no shortcuts)

every single thing u touch is a real native control. images need Alt text that actually means something. errors are tied to their field and announced. focus moves on purpose after u change pages, finish onboarding, hit an error or close something. we respect reduced motion and bigger text. we test with keyboard only, VoiceOver, braille, TalkBack, offline, limited permissions, broken manifests and providers that are down. secrets never get shown. App Store and AI adapters only do stuff when u mean it, show u what data and actions are involved, and always let u cancel.

## our words (never break these)

| say this | never say this |
|-----|-----|
| Dreams | Posts |
| Dreamors | Users |
| Redreams | Reposts |
| Circles | Groups |
| LooscidID | Account |
| Feed | Home tab |
| Alerts | Notifications |
| Login | Sign In |
| Cherry | the name of any other AI |

## where we live

we're on GitHub Pages at `https://looscid.github.io/Looscid/`. it stays a checked-over static app with React and ReactDOM saved in the repo, and no build service needed.

## find us

X: @Looscid

## circles + the discord

the public version of this list is at the top of the roadmap and changelog page on the site (app/changelog/, looscid.github.io/Looscid/changelog/): out now, up next and someday, then the changelog as done. keep the two in sync.

out now: the Looscid Discord has its own channels for 13 languages, optional faith channels (only Dreamors with that language AND that faith see em, and LooscidBOT syncs the combined roles), and LooscidBOT holiday messages for each language n faith, no pings (since November 8, 2026).

up next:

- LooscidID profiles: sign up, log in, and add ur language and "what you celebrate" if u want.
- we're looking into it: ur Nostr key being ur LooscidID itself, so there's no password to store.
- Discord Linked Roles: u connect ur LooscidID in Discord, we tell Discord ur language n faith, and Discord gives u the roles. change it in looscid once and Discord follows.
- a Looscid Circle as a Linked Roles requirement (role settings, Links, add Looscid).
- import from Discord: a Settings button that takes ur own Discord data download.
- server copy: LooscidBOT saves a server's channels, roles, permissions and join questions to one file, and a Looscid Circle imports it. the bot uses its own role (Read Message History for messages), never anyone's personal login.
- friend suggestions: opt-in, only when both of u linked ur LooscidID, just a suggestion, never added for u. adding a friend urself never depends on anyone (no Admin, no setting): u and another Dreamor can always add each other.

someday: we move from the Discord into looscid itself, with Circles for every language n faith. LooscidBOT's holiday code comes with us.

## pins, feeds + the more menu

we planned this on November 7, 2026. checkboxes are planned stuff; nothing here is out yet unless it says so. the public version is in the up next list on the roadmap and changelog page (app/changelog/), keep em in sync.

our rule: no new pages for new features. new stuff goes where u already are (the options menus, the feeds, settings and the Commandbar u already use), not on some page of its own.

already out, for context: u can pin a Circle, Dreamor, hashtag, thread or List as a feed tab on Home and unpin it from that tab, and add a Dreamor's profile to the tab bar. pins below turns that into one system for everything.

### pins

- [ ] pin anything: Dreams, Dreamors, hashtags, apps, Cherry chats and actions (like the Commandbar).
- [ ] pin from any item's options button (that's the way that works w VoiceOver, since a website can't add rotor actions), with a long press, or from the Commandbar.
- [ ] u pick where a pin goes when u pin it: a feed tab (Dreamors and hashtags only, Cherry chats aren't feeds), the quick menu, or just saved in ur pins.
- [ ] quick menu: one menu button, not a row of links, so VoiceOver gets past it in one swipe. it shows ur top pins (like six) and "See all pins". that list is where u see everything u pinned. it's the menu growing, not a new page.
- [ ] move a feed tab left or right, or unpin it, from that tab's More menu and from feed settings.
- [ ] pinned Dreams work like bookmarks, so u can come back to em later.
- [ ] pin folders: group ur pins, like "music" or "games".
- [ ] pin suggestions from Cherry, only if u opt in: "You open this profile a lot. Pin it?"
- [ ] Commandbar commands: `pins` goes through all ur pins, `pin @name`, `unpin #tag`, and moving feed tabs (`move #tag left`).
- [ ] privacy: pins are private by default, and pinned chats are always private. if u want, there's a public pin list on ur profile, and u pick what's on it. pinning something never puts it there by itself.
- [ ] apps: no separate Apps section. just pin an app for quick access.

### feeds menu

- [ ] one Feeds menu with ur feeds, Circles and places all in one spot. it ties into the pins quick menu, so a pinned feed is one pick away from either.

### tabs

- Create always stays the middle tab, no matter what else we add. five or six tabs is fine. if this clashes with the older navigation notes under Discover below, this one wins.

### more menu

- [ ] the classic More layout: ur profile card on top and a one-line description under each item, with the new items and groups added on top. we keep the groups (Profile, Looscid, About and account).
- [x] one-line descriptions under each item in the profile's More menu (Dreamor Options), read as part of the item's name.
  done November 7, 2026.

### settings styles

- [ ] settings styles: u pick how Settings is laid out, and every style has the same settings.
- [ ] Classic: one long list.
- [ ] Sections: grouped with headings and a search box on top. we build this one first.
- [ ] Sidebar: Sections, but on wide screens.
- [ ] the style u pick never changes unless u change it.

### who sees ur Dream

- [ ] pick who sees each Dream: Public, Dreamors you follow, My people, or Only me.
- [ ] set ur default audience in Settings, so every new Dream starts with it. change it on any Dream, anytime.
- [ ] My people: ur own close list. the name isn't final, but it can't be "Circles", since Circles are groups. nobody gets told when u add or remove them.
- [ ] adding to My people: ur mutuals show up first, with tabs for Mutuals, Following and Followers.
- [ ] private mode: everything u make stays just with u til u turn it off.
- [ ] privacy checkup in Settings → Privacy: a quick walk through ur privacy settings, one step at a time.
- [ ] the audience picker reads clean with VoiceOver: each choice is one swipe, with its name and a one-line description.

### cherry

- [ ] a fresh new Cherry design, made by 2three1y.

### on every device

we decided on November 8, 2026: every change shows up everywhere, and local first is for backups. this stuff follows ur LooscidID key through Rem, and ur device keeps its own copy as the backup.

- [x] likes sync, and each Dream on Rem shows how many ppl liked it.
- [x] ReDreams sync, and Rem counts em on each Dream.
- [x] pinned Dreams sync. private: only ur own key can read em.
- [x] mutes sync: muted Dreamors, muted threads and Not interested. private: only ur own key can read em.
- [x] threads u follow sync. private: only ur own key can read em.
- [ ] next up: blocked words, blocked Circles, Dreamor notes, settings and drafts.

### looscid apps (real ones)

we're making real looscid apps, android first (we decided November 8, 2026). we build em in the open, so anyone can build em too.

- [ ] android app is coming first, built in kotlin, open source (AGPL), in its own repo: Looscid/Looscid-Android. it opens looscid first, then we make screens native one by one.
- [ ] ios app comes after, in swift, works all the way back to ios 15 (where looscid started), in its own repo: Looscid/Looscid-iOS. u install it by sideloading.
- [ ] on ios 15, the app tells u once which features don't work there, and a Help Center page lists em.

#### updates

- [ ] looscid updates itself when u open it. most updates land instantly.
- [ ] when the app itself needs an update, a "Looscid needs an update" alert pops up. tap it n ur done.
- [ ] an update screen with what's new that u can open whenever. it updates the apps inside looscid too.

#### braille displays

- [ ] Enter submits one-line fields.
- [ ] in the message box, Enter sends and Shift+Enter makes a new line. a Settings checkbox, "Enter sends messages", controls it.
- [ ] Enter hits buttons, opens menus and checks boxes.
- [ ] Enter runs the swipe action ur on, like Like Dream.
- [ ] all of it works on any braille display, not just the fancy ones.

#### more app stuff

- [ ] get looscid from open-source android app stores.
- [ ] apps page: every app links to where u can get it.
- [ ] works on privacy-focused android phones with no Google services.
- [ ] ur looscid key stays locked up safe in ur phone's secure storage.
- [ ] real notifications for Alerts.
- [ ] share to looscid from other apps.
- [ ] a home screen shortcut to start a Dream.
- [ ] read stuff out loud with any voice that's already on ur phone.
- [ ] read-aloud built in: the app can read Dreams out loud with its own voice. it's a Settings checkbox, off by default, so it never talks over ur screen reader.
- [ ] a "Read Dream aloud" swipe action on every Dream, so if u use a screen reader u can hear a Dream in one swipe.
- [ ] a voice shop inside looscid where u download as many voices as u want. voices from other makers are labeled with who made em. using these voices across ur whole phone needs ios 16+, so that one goes on the "doesn't work on ios 15" list.
- [ ] our own offline voices, open n shareable.

### safety + privacy

- [ ] a "Friends of Friends" choice for who can see a Dream.
- [x] mods give a reason when they take down a Dream.
- [x] blocklists.
- [x] removals are public: the line where a removed Dream used to be says whether a Circle's mods or a looscid admin took it down, and why.
- [x] a public Mod log: every removal with its date, the Dream (never its words), the mod or admin, and the reason. it's in each Circle's About tab and in the Help Center.
- [x] deleting ur own Dream: no replies, it's just gone. with replies, one "Dream deleted" line stays so the thread still makes sense.

## discover: how we're doing nav + refine

these calls steer the next nav, Feed, Discover and catalog changes. checkboxes show what's out vs what's still planned.

- [x] DiscoverPage moved into `discover.js`, and the inline version got cut from `index.html` (PR #23).
  done September 28, 2026 at 1:39 AM.
- [x] the big decorative emoji cleanup in on-screen text (`62d1619`). Guest Terms and Admin Panel icon text got swapped too; the Accessibility icon kept its existing `aria-label`.
  done September 25, 2026 at 9:56 AM.
- [ ] five-tab nav, renaming Local to Nearby, and the Discover Refine setup aren't out yet. the Sense rename is out.

### navigation

- five tabs that always stay, in this order: Feed, Discover, Cherry, Alerts, More. Cherry gets the middle spot cuz she's a place u go for history, a new chat and projects, not an action.
- Create isn't a tab. it's its own action button outside the tab row that opens the create menu. Alerts moves up to a real tab instead of hiding inside More.
- the first tab is called Feed. we thought about Launchpad and an app launcher and dropped em: a launcher would copy Discover's catalog and need install state, opt-in per tile and an accessible name per tile.

### feed + nearby

- Feed is stuff from ppl and circles u follow; Discover is everyone u haven't followed yet. Discover needs search and filters, Feed doesn't. Feed has Following and Nearby sub-tabs.
- rename Local to Nearby: it shows dreams around u, not dreams saved on ur device, so "Local" promised something it never did. Nearby uses the browser's normal location prompt (allow, allow once, deny), no custom permission screen.
- if u say no, show a dead end that makes sense: `Location is off. To see dreams nearby, allow location access.` give `Allow location` and a link back to where u came from that names it, like `Go to Following` or `Go to For You`. never just `Back`.
- make the denial message a polite live region so it gets announced, instead of leaving focus in an empty pane. `Allow once` doesn't last; when it runs out, Nearby goes back to not allowed, and the wording has to cover asking again, not just the no.

### discover refine menu

- `Refine` is a plain button, no heading on the toggle. when it opens, the panel starts with a real heading and one line like `Narrow what shows in Discover`, then the groups.
- groups get headings and plain explanations, as long as they need to be. a heading isn't a label; every control keeps its own accessible name.
- under `Filters`, split `Content` (Apps, Games, Images, Videos) from `People` (Dreamors, Circles), don't mix stuff and ppl.
- `Price` uses radios `All`, `Free`, `Paid`, starting on `All`; nothing picked is never where u land. `Paid` shows `Lifetime` and `Subscription` checkboxes; `Free` hides em. they're checkboxes, not radios: an app can sell a lifetime unlock AND a monthly sub, and both can be on.
- the chip says `Lifetime`; its accessible name is `Lifetime, one-time purchase`. `Media` has Has media and Verified.
- a time group (Any time, Today, This week, This month) is optional: Tomo's idea, not 2three1y's, and we can cut it.
- the results line moves with the filters: `Showing 14 of 22 apps` (pattern `Showing X of Y apps`). nothing found: `Nothing matches those filters` plus a `Clear filters` link. apply button: `Show 14 results`.
- what a tile says, in one sentence: `Looscid Music, App, free with subscription, press to open`.

### catalog rules

- Circles are `Circles` everywhere; `Groups` isn't a synonym. restaurant apps are out of the catalog completely: they're transactions, not places u come back to.
- skip an app if it's a transaction u finish and never come back to (rideshare, grocery, food delivery); keep anything with a feed, inbox or community.
- every catalog entry gets a real record: category, price type, display/plate text and where it goes. Paid and Refine filters read those records, no one-off code per app. we keep a short rejected list with reasons, so we don't fight about every app all over again.
- don't say `Get 100 subscriptions`, it sounds like we're signing u up. say what's inside, like `free to install, 3 subscriptions inside`.

### accessibility rules

- shorten what u see, never what gets announced. keep the existing `aria-*`, `role`, `tabindex` and handlers.
- no decorative emoji outside DreamLabs. turn emoji that stand alone into short plain text.
