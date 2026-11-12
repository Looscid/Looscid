# the looscid roadmap

every idea shows the day I added it. when something ships or gets cut, it also goes in the landed and cut log at the bottom. no target dates, no promises.

## what looscid even is

I'm building a private, local-first, whole-os kinda experience for Dreamors. accessible from day one, works with open protocols, and ur identity n ur data are urs, period. looscid should still be useful with no LooscidID, no wifi, no build service and nothing locked down. and I don't de-bloat, damn it: as I add stuff, I keep the real features, the accessibility, looscid's words and the local-first stuff solid.

## how it's built

right now it's plain semantic HTML n CSS, with React and ReactDOM 18.2.0 saved right in the repo and JSX that's already compiled. no build step, no bundler. `app/index.html` has the spot React mounts into plus a polite live region, and it loads those libraries and the `app/js/` modules. those modules draw the landmarks and the native controls, and handle the DOM stuff, local state, checking what u type, getting around and drawing everything. `app/styles.css` makes it fit any screen. focus management, live regions, roving tabindex, required Alt text on images and accessible error messages are non-negotiable.

## phase 1: done

- [x] the semantic HTML/CSS shell with React and ReactDOM 18.2.0 saved in the repo and pre-compiled JSX (no build step, no bundler), onboarding, ur accessibility settings saved on ur device, and ur profile, settings, drafts n Dreams in localStorage. (added Sep 29, 2026)
- [x] Feed and Discover, with main nav and Feed tabs that actually work w a screen reader. trending tiles in Discover open with Enter or Space, and section tabs move with Left/Right (they wrap around) plus Home/End. (added Sep 29, 2026)
- [x] the composer, with photo attachments and Alt text fields. Dreams go out text only for now, so looscid asks u to confirm before it leaves the attachments off. (added Sep 29, 2026)
- [x] focus management, live announcements, and getting around with a keyboard, VoiceOver or braille. (added Sep 29, 2026)

## phase 2: what's up next

- [ ] move the Apps tab (the AppsPage thing) from React/Vite over to accessible vanilla DOM. (added Sep 29, 2026)
- [ ] set up Alerts for real, with Mentions, Interactions and System Logs. (added Sep 29, 2026)
- [ ] build native DOM pieces for Feed and Discover, and keep ur local Dreams separate from Dreams from Nostr relays. (added Sep 29, 2026)
- [ ] merge About and Settings into one way to get around and one set of settings. (added Sep 29, 2026)
- [ ] let u manage ur Nostr relays and add NIP-04/NIP-44 encryption, without ever showing ur secret key. (added Sep 29, 2026)
- [ ] put the whole app on GitHub Pages, no dependencies needed. (added Sep 29, 2026)

## ur AI, ur pick

I wanna let u pick ur own AI, not lock u into one model or one company.

- [ ] build one plug-in shape for custom AI models, for whatever provider u set up. (added Sep 29, 2026)
- [ ] let u add a provider's endpoint, model name, what it can do and ur own preferences, all in accessible Settings. (added Sep 29, 2026)
- [ ] keep ur keys in secure storage u control. secrets never go in the code, manifests, logs or shared registry stuff. ever. (added Sep 29, 2026)
- [ ] run local/offline models when u have em, and keep working fine when a provider's down. (added Sep 29, 2026)
- [ ] show u clearly who the provider is and what data they get, before anything gets sent. (added Sep 29, 2026)
- [ ] Cherry's still a work in progress. I keep her behind the assistant plug-in, so she never gets in the way of custom AI. (added Sep 29, 2026)

## phase 2A: works everywhere + app stores

all of this gets added on top. I'm not de-bloating looscid or ripping out stuff that already works on ur device.

- [ ] Linux-friendly shell pieces for files, running processes, figuring out where looscid's running, notifications and permissions. (added Sep 29, 2026)
- [ ] figure out what's available across Linux distros, desktops, browsers and runtimes. (added Sep 29, 2026)
- [ ] spot apt, dnf, pacman, zypper, Flatpak, Snap, AppImage and other outside stores, each through its own separate adapter. (added Sep 29, 2026)
- [ ] support App Stores that live on GitHub: releases, release files, tags, packages, topics, metadata and custom manifests. (added Sep 29, 2026)
- [ ] find `looscid-manifest.json`, `.looscid/manifest.json`, release manifests and manifest URLs u set, the same way every single time. (added Sep 29, 2026)
- [ ] a manifest finder that checks the metadata, picks the right versions n files, grabs licenses/permissions/checksums, and remembers where everything came from. (added Sep 29, 2026)
- [ ] looscid's own App Store: a decentralized manifest registry that lives in GitHub repos. anyone can mirror, fork, review and combine registries. (added Sep 29, 2026)
- [ ] before anything changes on ur device: look-only discovery, dry runs, u say yes first, u can cancel, integrity checks, and rollback n error states. (added Sep 29, 2026)

### the manifest format (draft)

manifests are versioned JSON with `schema`, `id`, `name`, `summary`, `description`, `icon`, `homepage`, `publisher`, `license`, `categories`, `keywords`, `locales`, `permissions`, `platforms`, `versions`, `source`, `install`, `integrity` and `security`. looscid doesn't trust a manifest til it's checked, and every result keeps where it came from plus its commit/release pin.

### what I do next, in order

1. figure out the shell interfaces and what each capability promises.
2. do look-only detection and fake provider adapters first.
3. build the manifest format, the checker, GitHub discovery and one clean app model.
4. add registry indexes, release/file adapters, checksum checks, caching and offline mode.
5. build publish, mirror, fork, review, combine and refresh for decentralized registries.
6. add accessible confirm, dry run, cancel, rollback and getting back on track after errors.
7. add custom AI provider adapters and Cherry, without tying the core shell to one provider.

## phase 3: going big (and fully looscid's own)

- [ ] Nostr-first login, guest mode, signing with an extension, and connecting a LooscidID u already have. (added Sep 29, 2026)
- [ ] full Circles, contacts, messaging, mail, a file explorer, and making Dreams together. (added Sep 29, 2026)
- [ ] Cherry hooked into context, chat, tagging and Alerts. (added Sep 29, 2026)
- [ ] working with Mastodon and the fediverse, plus end-to-end encrypted messages n files. (added Sep 29, 2026)
- [ ] an iOS companion app in Swift, tested with VoiceOver and the BrailleNote Touch Plus. (added Sep 29, 2026)
- [x] looscid's own issue tracker: report bugs or ideas right in looscid, agree or disagree, mods reply. no outside companies. (added Nov 8, 2026)

## thinking about it

these are ideas I'm thinking about. nothing here is being built yet. ideas move up when real people keep asking for em.

- [ ] one LooscidID on every device (phone, computer, BrailleNote). u can already bring ur own key, so this is about making that one identity just work everywhere, with ur key staying on ur device. (added Nov 11, 2026)
- [ ] a free verified badge, checked by real people, no paying. kinds: verified person, verified blind creator, and Verified Agent for Looscid For Agents. it can be taken away for pretending to be someone else or breaking the rules. (added Nov 11, 2026)
- [ ] ur custom profile tab order shows to people who visit ur profile. ur app bar order stays just urs. (added Nov 11, 2026)
- [ ] a character limit picker: a small popup with presets as checkboxes, like "280, like a tweet", plus a custom number. (added Nov 11, 2026)
- [ ] "want to turn it on?" prompts: if a Cherry feature is off, one tap turns the real setting on everywhere. (added Nov 11, 2026)
- [ ] settings sync brings ur LooscidID with it. naming idea: "Account" for ur account and "LooscidID" for ur identity. (added Nov 11, 2026)
- [ ] a Looscid model of our own. local first when ur browser or device can run it, and a server version only for devices that can't. (added Nov 11, 2026)
- [ ] Cherry Connectors: ask Cherry in chat to connect something, and she gives u a one-tap link. (added Nov 12, 2026)
- [ ] rename "What Cherry did" to "Actions". (added Nov 12, 2026)

## the backlog (ideas I'm saving for later)

these came out of the Dreamor Council on Nov 8, 2026. I'm not building any of it yet, I'm just writing it down so it doesn't get lost. if u wanna help with one, tell me.

### features I want to add

- [ ] Looscid Lite: a lighter Looscid for slow phones and slow internet. (added Nov 8, 2026)
- [ ] DB Journal: a private journal that lives in Looscid. (added Nov 8, 2026)
- [ ] work mode: a calmer Looscid for when I need to get stuff done. (added Nov 8, 2026)
- [ ] Cherry outing planner: Cherry helps u plan a day out. (added Nov 8, 2026)
- [ ] Cherry agent: Cherry does small jobs for u, and asks before she does anything. (added Nov 8, 2026)
- [ ] Google and X sign-in, as extra ways to make or get into a LooscidID. (added Nov 8, 2026)
- [ ] SMS Cherry: text Cherry from any phone. this one needs a server first. (added Nov 8, 2026)
- [ ] Siri: talk to Looscid with Siri. this one needs a native app first. (added Nov 8, 2026)
- [ ] Cherry's voice in the screen reader voice list, so u can pick her as ur reading voice. (added Nov 8, 2026)
- [ ] live audio rooms in Circles, where people can talk and listen together. (added Nov 8, 2026)
- [ ] build ur own mini app, right inside Looscid. (added Nov 8, 2026)
- [ ] achievements, for fun stuff u do in Looscid (never anything that pushes u to scroll more). (added Nov 8, 2026)
- [ ] a math mini app. (added Nov 8, 2026)
- [ ] share ur Dreams to Mastodon and Bluesky too. (added Nov 8, 2026)
- [ ] sign in with a Nostr signer, so ur key never has to touch Looscid. (added Nov 8, 2026)
- [ ] NIP-05 addresses, so ur LooscidID gets a short address that's easy to share. (added Nov 8, 2026)
- [ ] DMs and calls over Nostr. (added Nov 8, 2026)

### already on the roadmap above (still coming)

- [ ] moving the Apps tab over (phase 2). (added Nov 8, 2026)
- [ ] a relay pool plus encryption (phase 2). (added Nov 8, 2026)
- [ ] the App Store that lives in GitHub manifests (phase 2A). (added Nov 8, 2026)
- [ ] Nostr-first login (phase 3). (added Nov 8, 2026)
- [ ] the iOS companion app (phase 3). (added Nov 8, 2026)

### site ideas (their own projects)

- [ ] a music-making app (a DAW) that's built for screen readers first. (added Nov 8, 2026)
- [ ] Dream Radio: Dreams read out loud like a radio station. (added Nov 8, 2026)
- [ ] Cherry with a real AI model behind her. (added Nov 8, 2026)

### someday (big dreams)

- [ ] my own AI models. (added Nov 8, 2026)
- [ ] my own phone carrier. (added Nov 8, 2026)

## accessibility + security (no shortcuts)

every single thing u touch is a real native control. images need Alt text that actually means something. errors are tied to their field and announced. focus moves on purpose after u change pages, finish onboarding, hit an error or close something. looscid respects reduced motion and bigger text. I test with keyboard only, screen readers (VoiceOver, TalkBack, NVDA, JAWS, Orca), braille, offline, limited permissions, broken manifests and providers that are down. secrets never get shown. App Store and AI adapters only do stuff when u mean it, show u what data and actions are involved, and always let u cancel.

- [x] looscid's own component library for devs: every piece of looscid w live demos, the code to copy and how it works w voiceover. (added Nov 8, 2026)
- [x] one footer for the whole app, Help Center included, all from one file (app/js/sitefooter.js). (added Nov 8, 2026)
- [ ] the same footer in the Looscid OS apps and projects too (they're separate apps in a sandbox, so they still have their own). (added Nov 8, 2026)
- [ ] test with every major screen reader: VoiceOver, TalkBack, NVDA, JAWS and Orca. not just VoiceOver. (added Nov 8, 2026)
- [ ] find developers and testers who live with epilepsy, low vision, blindness and the other conditions looscid protects, and build looscid with them. (added Nov 8, 2026)
- [x] a "Why Looscid?" page for everyone, linked in the footer and the Help Center. (added Nov 8, 2026)

## looscid's words (never break these)

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

## where looscid lives

looscid's on GitHub Pages at `https://looscid.github.io/Looscid/`. it stays a checked-over static app with React and ReactDOM saved in the repo, and no build service needed.

## find looscid

X: @Looscid

## circles + the discord

the public version of this list is at the top of the roadmap and changelog page on the site (app/changelog/, looscid.github.io/Looscid/changelog/): out now, up next and someday, then the changelog as done. keep the two in sync.

out now: the Looscid Discord has its own channels for 13 languages, optional faith channels (only Dreamors with that language AND that faith see em, and LooscidBOT syncs the combined roles), and LooscidBOT holiday messages for each language n faith, no pings (since November 8, 2026).

up next:

- LooscidID profiles: sign up, log in, and add ur language and "what you celebrate" if u want. (added Nov 7, 2026)
- I'm looking into it: ur Nostr key being ur LooscidID itself, so there's no password to store. (added Nov 7, 2026)
- Discord Linked Roles: u connect ur LooscidID in Discord, looscid tells Discord ur language n faith, and Discord gives u the roles. change it in looscid once and Discord follows. (added Nov 7, 2026)
- a Looscid Circle as a Linked Roles requirement (role settings, Links, add Looscid). (added Nov 7, 2026)
- import from Discord: a Settings button that takes ur own Discord data download. (added Nov 7, 2026)
- server copy: LooscidBOT saves a server's channels, roles, permissions and join questions to one file, and a Looscid Circle imports it. the bot uses its own role (Read Message History for messages), never anyone's personal login. (added Nov 7, 2026)
- friend suggestions: opt-in, only when both of u linked ur LooscidID, just a suggestion, never added for u. adding a friend urself never depends on anyone (no Admin, no setting): u and another Dreamor can always add each other. (added Nov 7, 2026)

someday: looscid moves from the Discord into looscid itself, with Circles for every language n faith. LooscidBOT's holiday code comes too.

## pins, feeds + the more menu

I planned this on November 7, 2026. checkboxes are planned stuff; nothing here is out yet unless it says so. the public version is in the up next list on the roadmap and changelog page (app/changelog/), keep em in sync.

my rule: no new pages for new features. new stuff goes where u already are (the options menus, the feeds, settings and the Commandbar u already use), not on some page of its own.

already out, for context: u can pin a Circle, Dreamor, hashtag, thread or List as a feed tab on Home and unpin it from that tab, and add a Dreamor's profile to the tab bar. pins below turns that into one system for everything.

### pins

- [ ] pin anything: Dreams, Dreamors, hashtags, apps, Cherry chats and actions (like the Commandbar). (added Nov 7, 2026)
- [ ] pin from any item's options button (that's the way that works w VoiceOver, since a website can't add rotor actions), with a long press, or from the Commandbar. (added Nov 7, 2026)
- [ ] u pick where a pin goes when u pin it: a feed tab (Dreamors and hashtags only, Cherry chats aren't feeds), the quick menu, or just saved in ur pins. (added Nov 7, 2026)
- [ ] quick menu: one menu button, not a row of links, so VoiceOver gets past it in one swipe. it shows ur top pins (like six) and "See all pins". that list is where u see everything u pinned. it's the menu growing, not a new page. (added Nov 7, 2026)
- [ ] move a feed tab left or right, or unpin it, from that tab's More menu and from feed settings. (added Nov 7, 2026)
- [ ] pinned Dreams work like bookmarks, so u can come back to em later. (added Nov 7, 2026)
- [ ] pin folders: group ur pins, like "music" or "games". (added Nov 7, 2026)
- [ ] pin suggestions from Cherry, only if u opt in: "You open this profile a lot. Pin it?" (added Nov 7, 2026)
- [ ] Commandbar commands: `pins` goes through all ur pins, `pin @name`, `unpin #tag`, and moving feed tabs (`move #tag left`). (added Nov 7, 2026)
- [ ] privacy: pins are private by default, and pinned chats are always private. if u want, there's a public pin list on ur profile, and u pick what's on it. pinning something never puts it there by itself. (added Nov 7, 2026)
- [ ] apps: no separate Apps section. just pin an app for quick access. (added Nov 7, 2026)

### feeds menu

- [ ] one Feeds menu with ur feeds, Circles and places all in one spot. it ties into the pins quick menu, so a pinned feed is one pick away from either. (added Nov 7, 2026)

### tabs

- Create always stays the middle tab, no matter what else I add. five or six tabs is fine. if this clashes with the older navigation notes under Discover below, this one wins.

### more menu

- [ ] the classic More layout: ur profile card on top and a one-line description under each item, with the new items and groups added on top. I keep the groups (Profile, Looscid, About and account). (added Nov 7, 2026)
- [x] one-line descriptions under each item in the profile's More menu (Dreamor Options), read as part of the item's name. (added Nov 7, 2026)
  done November 7, 2026.

### settings styles

- [ ] settings styles: u pick how Settings is laid out, and every style has the same settings. (added Nov 7, 2026)
- [ ] Classic: one long list. (added Nov 7, 2026)
- [ ] Sections: grouped with headings and a search box on top. I build this one first. (added Nov 7, 2026)
- [ ] Sidebar: Sections, but on wide screens. (added Nov 7, 2026)
- [ ] the style u pick never changes unless u change it. (added Nov 7, 2026)

### who sees ur Dream

- [ ] pick who sees each Dream: Public, Dreamors you follow, My people, or Only me. (added Nov 8, 2026)
- [ ] set ur default audience in Settings, so every new Dream starts with it. change it on any Dream, anytime. (added Nov 8, 2026)
- [ ] My people: ur own close list. the name isn't final, but it can't be "Circles", since Circles are groups. nobody gets told when u add or remove them. (added Nov 8, 2026)
- [ ] adding to My people: ur mutuals show up first, with tabs for Mutuals, Following and Followers. (added Nov 8, 2026)
- [ ] private mode: everything u make stays just with u til u turn it off. (added Nov 8, 2026)
- [ ] privacy checkup in Settings → Privacy: a quick walk through ur privacy settings, one step at a time. (added Nov 8, 2026)
- [ ] the audience picker reads clean with screen readers like VoiceOver and TalkBack: each choice is one swipe, with its name and a one-line description. (added Nov 8, 2026)

### cherry

- [ ] a fresh new Cherry design, made by 2three1y. (added Nov 7, 2026)

### likes, Not interested + labels

- [x] Not interested on every Dream that isn't urs (More menu): hides it from ur Home feed and shows u less like it in For You. private, only u see it, w Undo. review or clear it in Settings, Privacy & Security, Not interested. (it replaced Dislike, Nov 9 2026.) (added Nov 9, 2026)
- [x] every Dream has the same full controls everywhere, replies too: Reply, Redream, Like, Share and More. (added Nov 9, 2026)
- [x] the Liked tab is ur like manager: a filter (Dreams, Cherry replies, bug reports and more) and tools to unlike one or clear all shown. (added Nov 8, 2026)
- [ ] sort ur likes (newest, oldest, by kind). (added Nov 8, 2026)
- [x] bug report votes can be private or public, ur choice: "Show my bug report votes publicly" in Settings, Privacy. off by default. (added Nov 8, 2026)
- [ ] a spot that shows public bug report votes by name (rn looscid only shows the counts). (added Nov 8, 2026)
- [ ] when Cherry makes a Dream, it gets an automatic "AI generated" label that can't be removed. people can add their own content labels too (like AI-made, sensitive or spoilers), and I'll add more over time. (added Nov 8, 2026)
- [ ] Calm mode (a Settings checkbox, off by default): Dreams w flashing lights get swapped for a placeholder w the description, even from people u follow. for flashing lights there's no "show anyway" button, period. (added Nov 8, 2026)
- [ ] Calm mode also puts videos w no sound or no description behind a placeholder, w a "show anyway" button. (added Nov 8, 2026)
- [ ] flash check: when a video is uploaded, looscid counts how fast the brightness flips (the 3-flashes-a-second rule) and adds the flashing lights label on its own. just math, no AI. (added Nov 8, 2026)
- [ ] Flash safety also catches strobe effects, not just flashing lights (thanks to feedback from r/Epilepsy). (added Nov 8, 2026)
- [ ] upload nudge: before u Dream a video or image, looscid asks "any flashing lights?" and "add a description". (added Nov 8, 2026)
- [ ] zero animation mode: one switch that kills all motion, autoplay and transitions. on by default if ur phone has reduce motion on (added Nov 8, 2026)
- [ ] anyone can suggest a label or write a description for a Dream. once enough people agree it sticks, and mods can add em too. (added Nov 8, 2026)

### on every device

I decided on November 8, 2026: every change shows up everywhere, and local first is for backups. this stuff follows ur LooscidID key through Rem, and ur device keeps its own copy as the backup.

- [x] likes sync, and each Dream on Rem shows how many ppl liked it. (added Nov 8, 2026)
- [x] ReDreams sync, and Rem counts em on each Dream. (added Nov 8, 2026)
- [x] pinned Dreams sync. private: only ur own key can read em. (added Nov 8, 2026)
- [x] mutes sync: muted Dreamors, muted threads and Not interested. private: only ur own key can read em. (added Nov 8, 2026)
- [x] threads u follow sync. private: only ur own key can read em. (added Nov 8, 2026)
- [ ] next up: blocked words, blocked Circles, Dreamor notes, settings and drafts. (added Nov 8, 2026)

### looscid apps (real ones)

I'm making real looscid apps, android first (I decided November 8, 2026). I build em in the open, so anyone can build em too.

- [ ] android app is coming first, built in kotlin, open source (AGPL), in its own repo: Looscid/Looscid-Android. it opens looscid first, then I make screens native one by one. (added Nov 8, 2026)
- [ ] ios app comes after, in swift, works all the way back to ios 15 (where looscid started), in its own repo: Looscid/Looscid-iOS. u install it by sideloading. (added Nov 8, 2026)
- [ ] on ios 15, the app tells u once which features don't work there, and a Help Center page lists em. (added Nov 8, 2026)

#### updates

- [ ] looscid updates itself when u open it. most updates land instantly. (added Nov 8, 2026)
- [ ] when the app itself needs an update, a "Looscid needs an update" alert pops up. tap it n ur done. (added Nov 8, 2026)
- [ ] an update screen with what's new that u can open whenever. it updates the apps inside looscid too. (added Nov 8, 2026)

#### braille displays

- [ ] Enter submits one-line fields. (added Nov 8, 2026)
- [ ] in the message box, Enter sends and Shift+Enter makes a new line. a Settings checkbox, "Enter sends messages", controls it. (added Nov 8, 2026)
- [ ] Enter hits buttons, opens menus and checks boxes. (added Nov 8, 2026)
- [ ] Enter runs the swipe action ur on, like Like Dream. (added Nov 8, 2026)
- [ ] all of it works on any braille display, not just the fancy ones. (added Nov 8, 2026)

#### more app stuff

- [ ] get looscid from open-source android app stores. (added Nov 8, 2026)
- [ ] apps page: every app links to where u can get it. (added Nov 8, 2026)
- [ ] works on privacy-focused android phones with no Google services. (added Nov 8, 2026)
- [ ] ur looscid key stays locked up safe in ur phone's secure storage. (added Nov 8, 2026)
- [ ] real notifications for Alerts. (added Nov 8, 2026)
- [ ] share to looscid from other apps. (added Nov 8, 2026)
- [ ] a home screen shortcut to start a Dream. (added Nov 8, 2026)
- [ ] read stuff out loud with any voice that's already on ur phone. (added Nov 8, 2026)
- [ ] read-aloud built in: the app can read Dreams out loud with its own voice. it's a Settings checkbox, off by default, so it never talks over ur screen reader. (added Nov 8, 2026)
- [ ] a "Read Dream aloud" swipe action on every Dream, so if u use a screen reader u can hear a Dream in one swipe. (added Nov 8, 2026)
- [ ] a voice shop inside looscid where u download as many voices as u want. voices from other makers are labeled with who made em. using these voices across ur whole phone needs ios 16+, so that one goes on the "doesn't work on ios 15" list. (added Nov 8, 2026)
- [ ] looscid's own offline voices, open n shareable. (added Nov 8, 2026)

### safety + privacy

- [ ] a "Friends of Friends" choice for who can see a Dream. (added Nov 7, 2026)
- [x] mods give a reason when they take down a Dream. (added Nov 7, 2026)
- [x] blocklists. (added Nov 7, 2026)
- [x] removals are public: the line where a removed Dream used to be says whether a Circle's mods or a looscid admin took it down, and why. (added Nov 7, 2026)
- [x] a public Modlog: every removal with its date, the Dream (never its words), the mod or admin, and the reason. it's in each Circle's About tab and in the Help Center. (added Nov 7, 2026)
- [x] deleting ur own Dream: no replies, it's just gone. with replies, one "Dream deleted" line stays so the thread still makes sense. (added Nov 7, 2026)
- [x] the Report Center: one place for every report (Dreams, people, Circles, bugs n ideas, child safety), w its own link, /Report. links like /Report/?dream= or ?profile= fill it in. (added Nov 8, 2026)
- [x] Report on a Dream, a profile or a Circle opens the Report Center already filled in. profile Report finally works. (added Nov 8, 2026)
- [x] a Child safety reason on every report, plus child safety reports that go straight to the looscid mods. (added Nov 8, 2026)
- [x] after u report, looscid says "ur report's submitted. check it in the Report Center anytime". (added Nov 8, 2026)
- [x] My reports: every report u made w its status. each one's a thread, so u can add more info and the mods reply back as Looscid mods. (added Nov 8, 2026)
- [x] an Alert in Alerts when the mods reply or ur report's status changes. (added Nov 8, 2026)
- [x] reports are private: only u n the looscid mods see them, and nothing public ever says who reported what. (added Nov 8, 2026)
- [ ] Circle mods see reports about their own Circle's Dreams (rn every report goes to the looscid mods). (added Nov 8, 2026)
- [ ] report Alerts even when looscid's closed (rn looscid checks for news while it's open). (added Nov 8, 2026)

## discover: how I'm doing nav + refine

these calls steer the next nav, Feed, Discover and catalog changes. checkboxes show what's out vs what's still planned.

- [x] DiscoverPage moved into `discover.js`, and the inline version got cut from `index.html` (PR #23). (added Sep 29, 2026)
  done September 28, 2026 at 1:39 AM.
- [x] the big decorative emoji cleanup in on-screen text (`62d1619`). Guest Terms and Admin Panel icon text got swapped too; the Accessibility icon kept its existing `aria-label`. (added Sep 29, 2026)
  done September 25, 2026 at 9:56 AM.
- [ ] five-tab nav, renaming Local to Nearby, and the Discover Refine setup aren't out yet. the Sense rename is out. (added Oct 20, 2026)

### navigation

- five tabs that always stay, in this order: Feed, Discover, Cherry, Alerts, More. Cherry gets the middle spot cuz she's a place u go for history, a new chat and projects, not an action.
- Create isn't a tab. it's its own action button outside the tab row that opens the create menu. Alerts moves up to a real tab instead of hiding inside More.
- the first tab is called Feed. I thought about Launchpad and an app launcher and dropped em: a launcher would copy Discover's catalog and need install state, opt-in per tile and an accessible name per tile.

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
- a time group (Any time, Today, This week, This month) is optional: Tomo's idea, not 2three1y's, and I can cut it.
- the results line moves with the filters: `Showing 14 of 22 apps` (pattern `Showing X of Y apps`). nothing found: `Nothing matches those filters` plus a `Clear filters` link. apply button: `Show 14 results`.
- what a tile says, in one sentence: `Looscid Music, App, free with subscription, press to open`.

### catalog rules

- Circles are `Circles` everywhere; `Groups` isn't a synonym. restaurant apps are out of the catalog completely: they're transactions, not places u come back to.
- skip an app if it's a transaction u finish and never come back to (rideshare, grocery, food delivery); keep anything with a feed, inbox or community.
- every catalog entry gets a real record: category, price type, display/plate text and where it goes. Paid and Refine filters read those records, no one-off code per app. I keep a short rejected list with reasons, so nobody fights about every app all over again.
- don't say `Get 100 subscriptions`, it sounds like looscid's signing u up. say what's inside, like `free to install, 3 subscriptions inside`.

### accessibility rules

- shorten what u see, never what gets announced. keep the existing `aria-*`, `role`, `tabindex` and handlers.
- no decorative emoji outside DreamLabs. turn emoji that stand alone into short plain text.

## landed and cut

this is the log. when something ships, it goes under landed. when I drop something, it goes under cut, with why. newest month first. every build's full notes are in the changelog.

### November 2026

#### landed

- Not interested on every Dream that isn't urs, private, w Undo (Nov 9, 2026)
- the same full controls on every Dream, replies too (Nov 9, 2026)
- looscid's own issue tracker (Nov 8, 2026)
- the component library for devs (Nov 8, 2026)
- one footer for the whole app, Help Center included (Nov 8, 2026)
- the "Why Looscid?" page (Nov 8, 2026)
- the Liked tab as ur like manager (Nov 8, 2026)
- private or public bug report votes, ur choice (Nov 8, 2026)
- likes, ReDreams, pinned Dreams, mutes and followed threads sync to every device (Nov 8, 2026)
- the Report Center at /Report, w My reports, report Alerts and a Child safety reason (Nov 8, 2026)
- Discord channels for 13 languages, optional faith channels and LooscidBOT holiday messages (Nov 8, 2026)
- one-line descriptions under each item in the profile's More menu (Nov 7, 2026)
- mods give a reason when they take down a Dream (Nov 7, 2026)
- blocklists (Nov 7, 2026)
- public removals and the public Modlog (Nov 7, 2026)
- deleting ur own Dream, w a "Dream deleted" line only when it has replies (Nov 7, 2026)

#### cut

- Dislike, on Dreams, Cherry replies and bug reports (cut Nov 9, 2026, a day after it landed). Not interested took its place: it's private and it actually changes ur feed.
- Local mode (cut Nov 9, 2026). Dreams always go on Rem now, ur drafts stay on ur device, and ur device keeps its own copy as a backup.

### October 2026

#### landed

- Sense, the new name for the screen reader settings (date unsure). the roadmap first said it was out on Oct 20, 2026.

#### cut

- nothing I know of.

### September 2026 and before

#### landed

- DiscoverPage moved into its own file, discover.js (Sep 28, 2026)
- the big decorative emoji cleanup in on-screen text (Sep 25, 2026)
- the semantic HTML/CSS shell, onboarding, and ur settings saved on ur device (date unsure). it was already done when this roadmap started on Sep 29, 2026.
- Feed and Discover, w tabs that work w a screen reader (date unsure)
- the composer, w photo attachments and Alt text fields (date unsure)
- focus management, live announcements, and getting around w a keyboard, VoiceOver or braille (date unsure)

#### cut

- Launchpad, an app launcher as the first tab (date unsure). it would copy Discover's catalog and need install state and a name for every tile. the first tab is Feed instead.
- restaurant apps in the Discover catalog (date unsure). they're things u finish and never come back to, not places u hang out.
