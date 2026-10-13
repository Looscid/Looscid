# Changelog

Looscid counts every update on the preview branch as YEAR.FEATURES.FIXES (BUILD). Fix updates only fix things; feature updates add something. Builds count every update.

## Looscid 2026.117.33 (150): Round 7

Released October 12, 2026 at 8:18 PM (Eastern Time, 2026-10-13T00:18:10Z UTC)

Round 7: a feature update, asked for by 2three1y. Built in steps, one commit each.

- Every menu, sheet, dialog and pop-up is truly modal (2three1y: after the last item in Create, VoiceOver read Home and the status page behind it). While one is open, everything outside it is hidden from VoiceOver, braille and the keyboard; Tab and Shift+Tab stay inside a dialog; when it closes, focus goes back to the button that opened it. The live announcer still speaks. Covers Create, More, the Commandbar, pop-up menus, Dream options, alerts, Circle sheets and Reset. Escape now closes More too.
- Fix (2three1y, testing on iPhone): VoiceOver read a whole menu's contents as its hint. Every menu, sheet and dialog now has one short hint of its own: menus say Swipe to choose. Escape or a two-finger scrub closes; sheets and dialogs say Swipe to move through it. Escape or a two-finger scrub closes. Only the menu or dialog itself has a hint, never a button or other control.
- Braille roles like a BrailleNote (KeySoft): every button shows edbt instead of btn, a radio button shows ⠺⠿⠗ when it's on and ⠺⠤⠗ when it's off, and a checkbox shows ⠸⠿⠇ when it's on and ⠸⠤⠇ when it's off. BrailleNote is the new Button style on braille and the default (iPhone btn moves to it once). Braille only: nothing changes on screen, and speech still says button, radio button and checkbox with their state. Still to be checked on a real iPhone with a braille display.
- The settings page for screen readers and braille is called Sense now, everywhere: Settings, Accessibility, Find a setting, the Commandbar (open sense works, and the old words still work), Help Center and status. The tabs inside are the same.
- Pitch cues moved from the Verbosity tab to the Speech tab: the switch, the Pitch cue for checkboxes and Preview every pitch cue. Moved only: the cues, the settings and what they sound like are exactly the same.
- Settings are laid out like Feditext's Preferences: rows that follow each other join into one rounded group with thin lines between them, the value (On, Off) sits on the right in grey, and section headings are small and grey above their group. Only the look changed.
- Profiles: the header count is in parentheses, like Dreams (400), and it updates live. If the Dreamor publishes while you're on their profile (your own too), Looscid says “<their name> just published”. Focus never moves.
- Profiles: the header shows the exact moment you joined, like Joined Sunday, October 11, 2026 at 3:12 PM (Eastern Time), in your own time zone, the same as About. Older LooscidIDs that only kept the month now show the full date and time too.
- Profiles: the top button is called Dreamor options instead of More. Same list, same behavior.
- The Home tab before the feed tabs is gone: the feed tabs start at For You. If you were on Home, you land on For You.
- Thread view, like 2three1y's Feditext idea: opening a Dream's replies shows just that Dream. Expand thread shows the whole thread, the Dreams above it and every reply; the same button then says Collapse thread. The words change in place and focus stays on the button.
- Each Dream's options button is Feditext's More button now. Its pop-up starts with Feditext's items in Feditext's order: Like (Feditext's Bookmark), Mute, Block, and Report (coming soon) for someone else's Dream, then Looscid's own (Read, Hear thread, Translate, Share, profile, Ask Cherry). Closing it says Close More.
- Help in More is a real pop-up menu button now (2three1y, 4:36 PM): it opens a menu with Help Center and Commands. Up and Down move, Enter opens, Escape closes it and puts you back on Help. Commands isn't its own section in More anymore. Back from Commands puts you on Help.
- Liked: the Images only checkbox is gone. Liked has a Media tab (after Dreams) that starts with Show: Photos, GIFs and Videos, three checkboxes, all on; turn any off and Looscid says how many liked Dreams are left.
- Back sounds (2three1y: Liked's Back played no sound): every Back was checked. Liked, your own profile and Apps now go Back the same way Settings screens do: More opens again on the button you came from, with the same Back sound.
- Undo words: Unredream, Unquote Dream, and Unlike / Unliked, everywhere they appear (the old two-word Undo labels are gone).
- Memeprojects is one word everywhere now (2three1y: it is Memeprojects, not Meme Projects): Apps, Projects, the Commandbar (open memeprojects; the old words still work), Find a setting, Help Center, Credits and NexOS.
- Cherry has its own page called Cherry - DO IT YOUR WAY (More just links to it). The Try asking suggestions and the canned answer are gone: when Cherry doesn't understand, it says so and changes nothing. New Chat is at the top, then Your History with All and Pinned, then the chat you're in. Each chat has a Chat options pop-up menu: Pin or Unpin, Edit name, Project and Share access (both coming soon), Delete (asks first), New Chat, History and Close Menu. Capitals never matter to Cherry.
- Settings, Intelligence has three new pages for Cherry, kept apart from the feed settings: Memory (save chats in Your History on or off, Delete all chats), Tools (what Cherry may do for you, all on to start; a tool that's off is never run) and What Cherry did (everything Cherry did, with Undo; it used to be on the Cherry page).
- Credits and open source is rewritten in my own words: it starts with "This page is where I say thanks", my own projects have their own section, every license is a link to that project's real license, and every project has a link like "NexOS on GitHub" instead of a raw web address.
- Create Circle makes a real Circle now (2three1y: it just closed the sheet). It opens your new Circle with focus on its name and says "Circle created" once. Circles you make stay after a reload: they're kept on this device as looscid_circles, and Settings backup exports and imports them (older backups still import).
- The old Dream Board name is gone, even under the hood (2three1y): everything Looscid saves on your device is named looscid_ now. The first time you open this build, it moves your Dreams, Liked, Cherry chats, settings, Nostr key and Soundpacks over by itself and deletes the old copies. Nothing is lost, and older settings backups still import.
- Fix (2three1y: VoiceOver kept saying description on every item): the short hints on every menu, sheet and dialog are gone. VoiceOver read each one as "description" and repeated it on every move inside More, Create, menus, sheets and Circle steps. Menus and dialogs say only their name now; Escape or a two-finger scrub still closes them.
- Fix (2three1y: VoiceOver said description after every value): profile About and fields, Built-in shortcuts, the LooscidID data summary and the welcome glossary are plain list rows now, read as "Label: value". They looked like definition lists, which VoiceOver on iPhone calls "description". They look the same as before.
- Fix (2three1y): Dreamor options is a real pop-up menu now, after the name and @handle. It opens on the first item, closes with Escape or a two-finger scrub, closes after you choose, and never stays open from one profile to the next. Someone else's profile: Follow, Message, Ask Cherry for a summary, Share, Copy LooscidID link, Hide Redreams, Add note, Mute, Block, Report. Yours: Edit profile, Share, Copy LooscidID link, View as others see it, Settings. The header no longer repeats "Dreams (N)" and Joined, About says "About" and the name, and "just published" no longer fires for old Dreams.
- Fix (2three1y): Create Circle reads properly now. Each step's heading says "Step 1 of 3" and gets focus when you go to the next or previous step. Icon, Category and Privacy are radio buttons that say when they're checked, and Privacy reads its explanation as part of each choice. No more "star", "slash" or "right arrow", and Escape closes the sheet.
- Real hints, like a Swift app's (2three1y): only controls whose action isn't obvious get one, and VoiceOver reads it after a short pause, following your Hints setting. A Dream's replies count says "Opens the thread.", Redreams "Opens Redream and Quote.", More "Opens actions for this Dream.", Expand thread and Collapse thread say what they show, and the Following and Followers counts say "Opens the list." Unavailable items say just their name, with the reason as the hint. No hints on menus, dialogs, lists, tabs or obvious buttons like Like.
- Words, per 2three1y's rule: the status page now says "Publishing, viewing and interacting with Dreams", and the community rules say "Share authentic Dreams" and "Do not publish". Every word you read in Looscid uses publish or Dream, and so do the new hints.
- Restored the terminology guide and added the post rule.
- Cleaner repository: docs that covered the same subject are merged, docs live in docs/guides and docs/dev, and the app's files are in an app folder. Looscid's address and every page in it stay the same.
- Looscid says 2three1y everywhere now: About Looscid ("I'm 2three1y, a blind developer"), the project pages, the Commandbar and the docs. License copyright lines are unchanged for now.
- Credits looks like a normal credits page now: a centered roll grouped by role (Created by, Design references, Open-source libraries and licenses, Voices and sounds, Special thanks) with plain headings and lists. Every credit and license link is still there, and nothing scrolls by itself.
- More reads cleaner with VoiceOver: no item in More is a heading anymore. Each section and each item is one plain button or link in a list, so VoiceOver reads just its name and "button".
- The site footer is back, at the end of every page: Social (GitHub, X and YouTube), Legal (Terms, Privacy, Rules and a new Child Safety page), Values (our accessibility commitment) and Download. It is a real footer landmark with a heading per group, and it never covers anything.
- Edit profile opens again: when VoiceOver brings a control into view, it now lands below the page header instead of under it, so a double tap on Edit profile can no longer land on the Commandbar button.
- Commandbar lives in More now: "Open Commandbar" is a plain button there, and Control K or Command K still open it anywhere. The floating Commandbar button at the top is gone, so it can't catch taps meant for Edit profile or anything else.
- Discover is search and browsing only: Ask Cherry is gone from it (the Trending button, the Ask Cherry row above results, Draft on trending tags and Ask Cherry when nothing is found).
- Numbers are never shortened: Looscid and Cherry always show the whole number, like 19,637, never 19.6K. Cherry only reports trending tags that really exist.
- Save in Edit profile and in the Circle forms stays dimmed until you actually change something, and dims again if you undo it. VoiceOver still finds it and tells you why it's dimmed.
- Bios and Circle descriptions have no length limit and support Markdown: headings, lists, quotes, links, bold, italic, inline code and code blocks. Code blocks are their own readable block for VoiceOver and braille, and raw HTML never runs.
- More holds only Looscid features now. About Looscid, Credits, Legal and the social links live in the site footer at the end of every page, and their pages work as before.
- Every page has its own address now, like looscid.github.io/Looscid/Settings/Sense, and letter case doesn't matter (/settings/sense works too, and so does /@avatest for a profile). Every More item opens its own page: Settings is "Settings - Adjust your life", and Discover, Apps, Create, Alerts and Projects each have one. Help is still its pop-up menu.
- NexOS inside Looscid is Looscid OS now: the desktop, the Looscid terminal with its looscid> prompt, the boot text, the beats and the Looscid OS classic Soundpack (same sounds). Its pages moved to looscid.github.io/Looscid/os/, and old nexos addresses still open the same page there. Your saved settings and backups don't change.
- Shared Looscid links show a preview card now, with the Looscid logo and a short line about Looscid, on X, iMessage, Discord and other apps.
- Cherry says what she did, once ("Cherry followed Ava"), and shows it in the chat as a row like "Followed 1 Dreamor, Expand" that opens to the details. When there's nothing to act on, she says so instead of saying Done.
- Menus and sheets say only their name when they open, like Spring: More says "More", Create says "Create", and a pop-up menu says its name. Swipe or press Down to reach the items.
- The feed has For You, Following and Federated tabs now. Federated has Popular, Latest and Local, and you choose which networks it reads (Looscid and Nostr today). Local is Dreams from around you, and it stays off until you turn it on. For You has Show following with its own switches, For You and Following have a Sort (Latest or Popular), and you can pin a Circle, a person, a hashtag or a thread as its own tab.
- The tab bar comes before the footer now: swipe from the content to the tab bar, ending with More, and the footer is the very last thing on every page. And no more stray "Looscid, page" at the very end: what Looscid says no longer stays behind as text after it's spoken.
- Rotor Actions on Dreams and Cherry chats are gone: VoiceOver on iPhone doesn't offer them from web pages, so they only added noise. Like, Redream (with Quote inside), Reply and More stay as the buttons on every Dream, and Chat options still has Pin and Delete.
- No more Image Recognition offers from VoiceOver: every icon inside a button or row is hidden from screen readers now, since its button already says what it is. Avatars keep their names.
- Settings looks like Spring now: Sense is pinned alone at the top, every row says its current value after its name (like "Customizability, Dark theme" or "Intelligence, Cherry off"), and the new Settings, Tab Bar page lets you show or hide each tab and move it up or down with plain buttons. Tabs you pinned on the feed can be added as custom tabs. More is always last.
- Subscribe to thread: a Dream's More menu has Subscribe to thread (and Unsubscribe from thread). New replies in a thread you follow show up in Alerts as "New reply in a thread you follow", whether they reach Looscid directly or come from Nostr relays that tag the thread. On the web it's in the app only; the native apps can make it a push notification.
- Profiles: the second tab is just "Replies" now, and it shows only your replies, no top-level Dreams (those stay in the Dreams tab). When there are none it says "No Replies yet" and "Your Replies will show up here."
- Replies tab: each reply now says what it answers, first thing inside it, like "Replying to Tomo: " and the start of Tomo's Dream (or the reply it answers). When that Dream isn't on your device it says "Replying to @tomo". A hidden or blocked Dream shows no text, and one with a content warning shows the warning.
- Alerts is an Inbox now, laid out like Reddit's: one row of tabs (All, Unread, Messages, Replies, Mentions, Likes, Redreams, Quotes, New Dreamor), Send a message and Mark all read at the top, similar alerts grouped ("Liked by Ava and 3 others"), and a More button on every row with Reply, Mark read and Block. Replies has an "Only threads I follow" checkbox. Messages are real private messages on Nostr (NIP-17), end-to-end encrypted: write to anyone by their npub, and a new message is read out once without moving your focus. Likes, Redreams, Quotes, mentions, replies and new Dreamors come from Nostr too, with no server.
- Who can message me now really applies to private messages: a message from someone the setting doesn't allow stays hidden and silent on your device (the Messages tab says how many Dreamors are waiting, with a Message settings button), and changing the setting shows them. A conversation you started always shows.
- Home on small screens: only the feed tabs stay pinned at the top while you scroll. The title, welcome line and feed options scroll away, so they no longer cover the first Dream's buttons.
- Profile Tabs: put the tabs on profiles in your own order (Dreams, Replies, Redreams, Media, Liked, Mutual likes, About) in Settings, Profile Tabs, with plain Move up and Move down buttons like the Tab Bar. Also in a profile's options as Reorder tabs. Saved in your settings backup.
- Security: React now loads from Looscid itself, not from an outside code site, and the browser checks it wasn't changed.
- Dream options: Copy link, Open original on Nostr or Mastodon, Liked by and Redreamed by (who, from Nostr, each signature checked), and Dream info (when it was published, its network and the app it came from).
- Dream options: Pin to profile (up to 5 of your Dreams, shown first on your Dreams tab and read as "Pinned"), Mute this conversation (no more alerts from that thread) and, on For You, Not interested in this Dream (hides it there and moves you to the next Dream).
- Fixed: on Home, Federated, a Networks checkbox could open Create instead. The page used to scroll underneath the tab bar, so a control VoiceOver moved to could sit behind it, and a double tap landed on the tab bar's middle button, Create. Now every page ends at the top of the tab bar, so nothing is ever behind it.
- Adding a Nostr key works again. After the private messages update, a page that was already open asked for the old Nostr tools file, which was gone, so Create key, Save key and Use my signer said "Couldn't load the Nostr tools". The old file is back, and if the tools still can't load, the message now says why (offline, an older copy of Looscid that needs a reload, and so on).
- Edit Dream: change the text of your own Dream or reply from its options. It shows "Edited" everywhere, Edit history keeps every earlier version readable, and a Dream on Nostr gets its edit published there too (kind 1010, so apps that support edits show it). Edited Federated Dreams from Nostr show their author's edit as well.
- Inbox earcons: Messages, Replies, Mentions, Likes, Redreams, Quotes and New Dreamor each have their own new, gentle earcon instead of the plain Alert earcon. They follow the Alert switch, volume, Calm mode and quiet hours, and you can preview each one in Settings, Earcons, Event earcons, under Inbox earcons. No existing earcon changed.
- Security: Looscid OS apps and Projects now run in a locked-down sandbox, so none of them can reach your Nostr key. Their saved settings come along.
- Profile options: Share profile now shares the profile's LooscidID link, and there's a QR code (with the link written out and what scanning does, for anyone who can't see it), Copy username, and Open original profile on Nostr, Mastodon or Bluesky when the Dreamor is there.
- Lists: make your own lists of Dreamors in More, Lists, and each one is its own feed of their Dreams. Add someone from their profile's options with Add to list (a checkbox for each list, or make a new one right there). Rename, delete and remove people anytime. Only you see them, and they're in your settings backup.
- Lists are custom feeds you can pin: on a list's page, Pin to Home makes it a feed tab on Home, right after your other tabs, showing that list's Dreams. Unpin and reorder it like any pinned tab. You can also pin a list from Following, Pin a tab.
- Profiles have a Lists tab: yours shows all your lists and whether each is shown or only yours, and others see only the lists you choose with Show on my profile on each list's page. Move the tab in Settings, Profile Tabs.
- Security: your Nostr key is now locked with a passcode by default, and easy passcodes like 1234 aren't accepted. A key you saved before without one keeps working, and Looscid offers to lock it.
- Security: when your Nostr key has a passcode, your Mastodon and Bluesky sign-ins are locked with it too.
- Security: Looscid now refuses scripts that aren't its own files, and it won't run if another website tries to show it inside a hidden frame. You'll get a link to open it on its own instead.
- Security: smaller fixes. Notes dated in the future can't jump to the top anymore, names and message settings from Nostr must be properly signed, and Cherry's on-device models are off until their code ships with Looscid itself.
- Fixes from a careful check: messages from Nostr people you follow show again, Mute and Pin menu items now say Unmute and Unpin right after you use them, Dream info gives the real date and time for your own Dreams, and Inbox earcons play your Soundpack's Alert sound again when the pack has no Inbox earcons of its own. Also: Liked by and Redreamed by say how many Dreamors when they open, and a few buttons keep your focus while they're busy.
- Share now uses your phone's share sheet, for profiles and Dreams. It has Copy and, in Chrome, a QR code, so the separate Copy LooscidID link, QR code and Copy link items are gone. Cancelling the share sheet does nothing. Copy username and Open original profile stay.
- Share reply now opens your phone's share sheet with the reply's link, just like Share Dream. And your older Dreams show their real age on the card again instead of "just now"; a Dream whose time isn't known shows no time.
- Removing your Nostr key no longer leaves your Mastodon and Bluesky sign-ins locked for good: with the key unlocked they're kept, and with it locked Looscid tells you first that they'll be signed out. And when another website shows Looscid in a frame, you get only the short message and the Open Looscid on its own link, with no error boxes on top.

## Looscid 2026.116.33 (149): Round 6.8.1

Released October 11, 2026 at 4:18 AM (Eastern Time, 2026-10-11T08:18:22Z UTC)

A fix update, asked for by 2three1y after trying 148 on his iPhone: a weird comma on profiles, a bio like Feditext's, no position numbers in tab names, and Show radios on Media.

- The stray comma was on the profile header: visually hidden ", " pieces stood in for the bullet between "N Dreams" and "Joined", and sat before the "Follows you", "Muted" and "Blocked" capsules (and ", verified" after a verified field, ": " after Note, ", " in the Following and Followers rows and in Edit profile). VoiceOver on iPhone reads a hidden piece like that as its own stop, so it said "comma". They're all gone: each part is its own piece with a plain space, like Feditext, which hides its bullet and puts nothing in its place. The Cherry history tabs and Alerts tabs lost their hidden commas too.
- Bio, like Feditext's account bio: rich text in paragraphs, line breaks kept, links, mentions and hashtags as real links. A mention of a Dreamor Looscid knows opens their profile, @name@server opens it on that server, and a hashtag opens Discover searching for it. A bio that comes as HTML keeps only its paragraphs, line breaks and links.
- Fields, like Feditext's: a bordered table, the label on the left third and the value on the right, links live. A verified value has a green row and a checkmark, and is read "Verified" and the date.
- The LooscidID line, like Feditext's: @handle, then a lock for a private account (read "Locked account"), then the "Follows you" capsule, "Muted" and "Blocked". "Follows you" changes to "Mutuals" in place once you follow back: the same element, no announcement, focus stays.
- Following and Followers lists show Feditext's relationship on each row: Mutuals, Following or Follows you.
- Joined shows the full date and the time your LooscidID was made, in your own time zone, with its name: "Joined Wednesday, October 2, 2024 at 5:01 PM (Eastern Time)". A date stored without a time shows as a date only. The About tab's Date joined says the same.
- No position numbers in any tab name ("1/4", or "1 of 6" at High verbosity): iPhone already says "tab, 1 of 4". Removed from the profile tabs, the feed tabs, Discover and Circles. Profile tabs carry their count in parentheses: Dreams (106), Dreams & Replies, Redreams, Media, Liked, Mutual likes; About has none. The tab bar's Alerts reads "Alerts (3 unread)", Cherry's history tabs "All (5)".
- The profile Media tab has a Show radio group: Images, Videos or Both (Both to start, remembered on this device). It filters in place, says how many Dreams it shows, and focus stays on the radio, like the Redreams Show radios.
- The settings backup adds dbm_profile_media_show at the end. Older backups still import.

## Looscid 2026.116.32 (148): Round 6.8

Released October 10, 2026 at 11:45 PM (Eastern Time, 2026-10-11T03:45:29Z UTC)

A feature update, from 2three1y's spec sheet: Liked in More, Like Search, and Create.

- More has a Liked button, right under View your profile. It opens the Liked page: the same Liked as the Liked tab on your profile (one component, one store), with the tabs Dreams, Circles, Apps, Marketplace, Chats and Searches, and Images only as a filter, not a tab. The tabs are a real tablist (arrow keys, Home and End); every panel is in the page, shown or hidden, and labelled by its tab. Only you can see it.
- Like and Unlike, never Save or Bookmark, now also on Circles (in Discover and on the Circles page), on Apps (in More), and on Cherry chats. Cherry chats are in Chats, and they show there only while Cherry is on (Looscid has no Show Cherry setting). A Marketplace like is a listing; Marketplace isn't open yet, and the page says so.
- Like Search: a Like Search button on Discover search results, and "like search" in the Commandbar (the search you're on, or "like search" and the words; "unlike search" and the words removes one). It goes to Liked, Searches, with its filters.
- Each Liked Search has an Alerts switch, off to start. With it on, Looscid checks the search when it opens and whenever new Dreams arrive, across the networks you have connected (Nostr, Bluesky, Mastodon and the fediverse, or whichever you have), plus Dreams on this device. The entry says which ("Searching: Nostr, and Dreams on this device."), or, with none connected, that it searches Dreams on this device only. It says plainly: checked when Looscid is open, not while it's closed, because Looscid has no server.
- New matches go to Alerts, under From Looscid (if you hid that filter, it comes back), naming the network each Dream came from. A Dream never alerts twice. One polite line in the live region says so; focus never moves. Unlike Search removes the search and its Alerts.
- Create has exactly nine options: Dream, Circle, Custom Feed, App or Game (for developers), New Call, New Chat, New Chat with Cherry, Go Live and GIF. One implementation is used in two places, the Create tab and a Create section in More that expands in place, with the same description, the same options and the same names.
- The Create tab is a dialog with a Create heading that gets focus, then a real list. Escape closes it and puts focus back on Create.
- Dream opens New Dream (saved on this device, as before); Circle opens New Circle; New Chat with Cherry opens Cherry on a new chat. Custom Feed, App or Game, New Call, New Chat, Go Live and GIF say Unavailable in plain text: they stay in the list so VoiceOver and a braille display can find them, and pressing one says it's unavailable for now.
- Fixed: the Circles page could stop with an error when a Circle was listed.
- Liked Searches live in Liked (dbm_liked), on this device, like the rest of what you liked; the backup format is unchanged.

## Looscid 2026.115.32 (147): Round 6.7

Released October 10, 2026 at 10:44 PM (Eastern Time, 2026-10-11T02:44:37Z UTC)

A feature update, asked for by 2three1y: his profile page, rebuilt, and "liking is saving".

- Profiles are recreated from Feditext's profile (Feditext by Metabolist, GPL-3.0). Only its layout, order and controls are used; no Feditext code. In Feditext's order: the avatar, the buttons (Direct message, which says unavailable because Looscid has no direct messages to start yet, and Follow or Following; on your own profile, Edit profile), your name, your LooscidID with Follows you, Muted or Blocked, your Dreams count and Joined date, a private note, fields (website and links), bio, then Following and Followers buttons that open their own pages (Back returns to the button), then the tabs: Dreams, Dreams & Replies, Redreams and Media.
- 2three1y's own asks sit where Feditext's closest part is: a private Liked tab on your own profile, an About tab, Mutual likes on other people's profiles, and a More button at the top.
- More at the top of a profile is Feditext's profile menu as a button that expands in place (aria-expanded; Escape closes it and puts focus back on More; it remembers whether you left it open). Other people: Share, Hide Redreams or Show Redreams (when you follow them), Add note or Edit note, Mute or Unmute, Block or Unblock, and Report, which says unavailable because Looscid has nowhere to send reports yet. Yours: Share and Edit profile.
- Edit profile, on the profile and in its More, opens the same LooscidID editor as Settings, LooscidID: same fields, same save, same "Profile saved".
- Liking is saving: one store and one name, Liked (dbm_liked). The old Save in Dream options and on the Replies page is gone; Like is the one toggle. Every Dream you saved or liked before is in Liked, so nothing is lost. A like shows everywhere at once and stays after a reload. Your plain Redreams are kept on this device too, so the Redreams tab can show them.
- The Liked tab on your profile follows 2three1y's spec sheet: tabs Dreams, Circles, Apps, Marketplace, Chats and Searches, with Images only as a filter, not a tab. Every panel is in the page, shown or hidden, and labelled by its tab. A Dream you unlike there stays in the list until you leave, so focus doesn't jump. Cherry's chats show in Chats only while Cherry is on (Looscid has no Show Cherry setting). Marketplace isn't open yet, and the Liked page says so.
- Settings, Privacy, Liked tab: a Show on my profile box for each Liked tab, all off. "Even when off, people can see your likes on their own Dreams." With every box off, a visitor sees a Dream you liked only if they wrote it or liked it too; anyone else sees nothing. Each box you turn on shows that part to everyone.
- Other people's profiles: Mutual likes (Dreams you both liked), and their Liked tab only for what they made public or what the same rule lets you see. When their likes aren't public, it says so.
- About tab: About this account, like X's: your LooscidID with Copy LooscidID, Date joined (when your LooscidID was made), Account based in only if you set one, your connected Logins, your Nostr public key with a Copy button, and Verified only if true. Nothing is guessed, and an empty field is left out.
- The Redreams tab has a radio group, Show: Quotes only, Redreams only or Both (the default). It filters in place, says the count, keeps focus on the radio and remembers your choice.
- A Dream that tags you has Remove me from this Dream in its options: the mention stops being a link to you on this device, a line says "You removed yourself from this Dream.", and Add me back to this Dream undoes it (dbm_untagged).
- More has View your profile near the top.
- At High verbosity a profile tab says its position in one name, like "Dreams, 1 of 6".
- Projects, About Looscid and Help now speak in 2three1y's own voice: "My own projects", "I'm 2three1y, a blind developer".
- One link per place: the Projects section no longer repeats the GitHub link that's in Social, and Credits shows a planned project's repository link only once.
- Legal and Credits: "Profile design recreated from Feditext by Metabolist (GPL-3.0); no Feditext code is used."
- The settings backup adds dbm_profile_more_open, dbm_profile_rd_show and dbm_liked_public (the Liked tab switches) at the end. Older backups still import. What you liked stays on this device and isn't in the settings backup, like your Dreams.

## Looscid 2026.114.32 (146): Round 6.6.1

Released October 10, 2026 at 9:25 PM (Eastern Time, 2026-10-11T01:25:26Z UTC)

A fix update, asked for by 2three1y: Earcons broke up or didn't play on his iPhone, and names read with a stray comma, like "Block ,".

- Earcons on iPhone: the one sound engine now stays awake while Looscid is on screen. Before, it went to sleep 1.5 seconds after every sound, and on iPhone waking it again without a tap (a VoiceOver swipe isn't a tap to the page) failed or cut off the start of the sound.
- After iPhone pauses audio (screen lock, a call, Siri, another app), every tap, click or key press wakes the engine again, not only the very first tap. It still sleeps while Looscid is in the background, for the battery.
- Sounds that wait for the engine to wake play once each when it's back, and only if they're still fresh: no heap of late sounds. A little lookahead stops a sound starting mid-envelope with a click.
- Many earcons at once (fast swiping with the earcon on every swipe, a double-tap that opens something) no longer pile up into crackle: a focus tick, key click or pitch cue is skipped while 4 sounds are already ringing, anything while 8 are.
- Soundvault: each sound is fetched and decoded once when its host allows it. Otherwise it plays through an audio element that's readied inside a tap so iPhone lets it play later. If a sound fails, is blocked or hasn't started within a quarter second, Looscid's own sound for that event plays instead, never silence; a failed one is retried after a minute.
- Settings, Earcons: Test earcons plays a short sequence (open, send, like, the Enter key, a command, an alert) and says "Earcons playing." If the engine can't start, it says so.
- New switch in Settings, Earcons: Earcons when iPhone is on silent (off by default). iPhone mutes sounds from web pages on silent; on, Earcons play anyway. Music playing in another app may stop when an earcon plays.
- Every earcon, pitch cue and Soundpack sounds the same as before, at the same levels. Calm mode still never mutes them.
- Names with a stray comma: at High verbosity, menu items (Dream options, Redream or Quote, Send Feedback) read like "Redream , 1 of 2", because the position was a separate hidden piece. Now it's one name: "Redream, 1 of 2". The same fix for the unread count on the Alerts tabs and More sections, the counts on Cherry's history tabs, LooscidID on profiles, your profile info links, Messages, and Discover's trends.
- A shared helper, lcNameJoin, builds names from parts: empty parts are dropped and no part leaves a dangling comma or double space.

## Looscid 2026.114.31 (145): Round 6.6

Released October 10, 2026 (Eastern Time)

A feature update, asked for by 2three1y: his projects built into Looscid, and Earcons.

- Projects: More has a new Projects section near the end (the other sections keep their order). Press it to open it: a short description, then a button for each project. It remembers whether you left it open (dbm_more_projects_open, added to the settings backup; older backups still import).
- Twelve projects: Memeprojects, Lyric Finder, Vibework, Soundvault, Reactor Toolbar, Code Translator, Easyconvert and MyWEB run right inside Looscid. chaoticmodel, Yapper, Alex Classic and Agentsync say plainly what they are and what is Coming soon, with no fake controls. MyWEB's Nostr feedback and Code Translator's Python are partly Coming soon too.
- Each project page has Back and Close (braille: "Close"), its credits and a link to its repo. Projects that are Coming soon, or partly, say "Want to help build this? Contributions welcome." with a link like "Help build chaoticmodel on GitHub". The Projects section ends with Help build Looscid on GitHub.
- Memeprojects: after a result, Dream Results opens the Dream composer with the result filled in, and says "Dream composer filled." once. It never sends: you press Dream yourself.
- Commandbar: projects, open and a project's name (open lyric finder, open vibework), and lyrics and a song (lyrics imagine by john lennon). They are on the Commands page in a new Projects group.
- Music has a Lyrics section with Open Lyric Finder. Settings, Earcons, Soundpacks has Open Soundvault to find more sound packs.
- Sounds are now called Earcons: Settings, Earcons, with Command earcons and Keyboard earcons. Only the words changed; storage keys and backups are the same.
- Command earcons (on by default): every Commandbar command plays its own short two-note earcon. The area picks the voice and register, the command picks the notes, so related commands sound related and each one is its own. A command that fails, or one Commandbar doesn't know, plays the error earcon, the same one as before. On, off, help, clear and close keep their own sounds.
- Keyboard earcons (on by default): a click for each key you type in a text field (the composer, Commandbar, search, Cherry), with their own sounds for Space, Delete or Backspace, and Enter. Throttled and played off the typing path, so typing and braille input never lag.
- New opt-in sound pack, FastSM-inspired: soft, round blips, quick glides and airy swooshes, inspired by FastSMRW by masonasons (no code or audio copied; FastSMRW has no license, so every sound is made fresh with Web Audio). Looscid's own earcons stay the default.
- Both earcon switches follow the Earcons switch, the master volume and quiet hours, and still play in Calm mode. Settings, Earcons has previews for each.
- New file js/projects.js, loaded after js/commands.js, and the ported projects in projects/ (FILES.md has the order). Every project is credited in More, About, Credits and open source, with its license.
- Soundpacks (one word now) work everywhere. Before, a Soundpack other than Looscid only played on the tab bar and a few events (send, like, alerts), because everything else spoke with pitch cues only, and only NexOS classic added its chimes. Now one player gives every Soundpack its sounds for what you do to any element: opening and closing menus (Dream options, Redream or Quote, Escape), choosing from a menu, opening pages like Replies, switches and checkboxes on and off, and Back and Close. Keyboard earcons (with each pack's own Space, Delete and Enter where it has them) and command earcons (in each pack's voice) go through it too. The Looscid pack and every pitch cue are unchanged.
- Choosing a Soundpack switches everything to it right away, says "Soundpack: Insomnia." once in the live region, and stays after a restart. Moving to a choice plays a short preview of it, so you can hear a pack before you pick it.
- New Soundpack, Soundvault: sounds from the Soundvault catalog, loaded from where Soundvault links them when they play (nothing copied into Looscid); anything it doesn't have plays Looscid's own. The soundvault command switches to it; open soundvault still opens the project.
- help is now a short list of the top commands, ending "Type commands for all of them." An area and help reads just that area, the same areas as the Commands page: cherry help (or cherryhelp, or help cherry), projects help, earcons help, braille help, settings help, feed help. help list reads every command, like help used to. new dream opens the Dream composer, empty.
- Help Center: a new Help section at the end of More (the others keep their order), and the help center command. Short plain sections: Getting started, Commands, Cherry, Earcons and sounds, Accessibility, Projects, Legal, Backup and data, and Getting help (added after the first 145 push, same build): where Send Feedback is and what it does, with an Open Send Feedback button; Looscid's GitHub issues as a full link, https://github.com/Looscid/Looscid/issues; Help build Looscid on GitHub; and quick reminders (help, cherry help, commands). The Earcons and sounds section lists every Soundpack, Soundvault included. Back and Close Help Center (braille: "Close").
- One About Looscid page. More's About is now one button, About Looscid, that opens the page; there is no submenu. Send Feedback, Legal and the Welcome intro are buttons on the page, next to the version, What's new, System info and Credits. The page's inner "About Looscid" heading is now "Looscid in short".
- Legal, from the Legal button on About Looscid and the legal command: Terms, Privacy, Community rules, Looscid's license (LPL v1.0: no ads, no commercial use, with a link to it), and the open source credits and licenses, including the MIT notices and the FastSMRW note. Back from Terms, Privacy or Community rules returns to Legal.
- Back and Close are noted before the page changes, so the page they land on never plays the opening sound.
- Unchanged: existing earcons and pitch cues, Insomnia and NexOS, the backup format, Calm mode, flash safety and Reduce Motion.

## Looscid 2026.113.31 (144): Round 6.5.3

Released October 10, 2026 at 5:10 PM (Eastern Time, 2026-10-10T21:10:00Z UTC)

A feature update, asked for by 2three1y: Cherry in Commandbar, shortcuts without spaces, path style, and a Commands page.

- Four new Commandbar commands: open cherry, new cherry chat, cherry pinned chats and cherry history. Capitals, colons and extra spaces don't matter, so "Cherry: Pinned chats" and "Cherry: History" work as typed. Close words work too, like "go to cherry pinned" or "show cherry chats".
- open cherry opens the Cherry page, with focus on its heading like every other page.
- new cherry chat opens Cherry with a new, empty chat and puts focus in the message box. Your last chat stays in Your History.
- cherry pinned chats opens Your History on the Pinned tab, and cherry history on the All tab. Focus goes to that tab, and Commandbar says how many chats are there ("Opened Cherry, Your History, Pinned, 2 pinned chats.").
- Spaces are optional, terminal style: opencherry, cherrychats (All) and pinnedchats (Pinned) work, and so does every other "open" word without its spaces, like openfeed.
- Path style: fil > Cherry pinned opens Cherry's Pinned chats. fil or filter before the > means "find this"; Cherry > Pinned works too. If nothing matches, Commandbar says so and stays where you are.
- The Commands page lists every Commandbar command, grouped by area (Go to a place, Cherry, Commandbar, Feeds and Dreams, Screen reader and braille, Sounds and music, Settings), each with what it does and the other ways to type it. Every command is a real button: press it and it runs, exactly as if you typed it. A command that needs a word, like a feed's name, opens Commandbar with the command typed in, ready for the word.
- Open it with the commands command, or from More: Commands is the new last section, with All commands inside. The other sections keep their order. The page has Back and Close Commands (braille: "Close"); both return to where you opened it, and from More the menu opens again on All commands.
- help still reads the list of commands, and now ends with "Type commands for the Commands page."
- Each command is said once, in the one live region (#looscid-live). Focus only moves because you ran a command or pressed a button.
- If Cherry is off, the Cherry commands open Settings, Intelligence, Cherry, where you can turn it on, and say so.
- New file js/commands.js, loaded after js/cherry.js (FILES.md has the order).
- Unchanged: the Cherry page, the rest of More, the backup format, sounds, pitch cues, earcons, Calm mode, flash safety and Reduce Motion.

## Looscid 2026.112.31 (143): Round 6.5.2

Released October 10, 2026 at 4:15 PM (Eastern Time, 2026-10-10T20:15:00Z UTC)

A feature update: Cherry gets its own page, from 2three1y's blueprint.

- Cherry is a page now, not a pop-up over the app. Open Cherry in More, the Cherry button on Home, Ask Cherry on Discover, or Ask Cherry about this Dream all go to the same page. Focus lands on the "Cherry" heading.
- At the top: Back, then Close Cherry (braille: "Close"). Both take you back to where you opened Cherry; from More, the menu opens again on Open Cherry. Then New Chat.
- The chat: each message is a list item that starts with "You:" or "Cherry:". The message box is "Message Cherry"; Enter sends from a keyboard or a braille display, and so does the Send button. Try asking has the suggestion buttons.
- A stream of announcements: every answer from Cherry is said once in the one live region, as "Cherry: ...". Settings and feed changes are said once in their own words, as before ("High contrast is now off."). Focus stays in the message box; nothing in the background moves it.
- Your History: your chats with Cherry, newest first, with All and Pinned tabs (arrow keys, Home and End, or tap). Each chat has its title, when it was last used, how many messages, and a Pin or Unpin button. Opening a chat says "Opened <title>, N messages." and puts focus on its heading. Unpinning in Pinned moves focus to the next pinned chat, or to the Pinned tab.
- New Chat starts an empty chat, says "New chat started." and puts focus in the message box. Your last chat stays in Your History.
- What Cherry did: the actions Cherry took for you, each with Undo where it can be undone.
- Chats are saved on this device (dbm_cherry_chats): up to 50 chats plus every pinned one. They are added to Settings backup at the end of the list, so older backup files still import and the file format is the same.
- The words Cherry uses to match what you type still ignore capitals, extra spaces and curly quotes. "Find Circles" now finds Circles.
- The old pop-up, its made-up history list and its "Clear All" button that did nothing are gone.
- Unchanged: the More menu layout, sounds, pitch cues, earcons, Calm mode, flash safety and Reduce Motion.

## Looscid 2026.111.31 (142): Round 6.5.1

Released October 10, 2026 at 2:42 PM (Eastern Time, 2026-10-10T18:42:07Z UTC)

A fix update: Dreamor everywhere. A Dreamor is you, and Dreamors is the plural; Redream keeps its one spelling.

- Dreamor and Dreamors are back everywhere Round 6.5 and earlier rounds had changed them: the Audience note ("Visible to all Dreamors" and "Dreamors I follow"), Discover, Circles, Cherry, Blocked Dreamors, the admin pages, the status page and the docs.
- The welcome glossary still defines Dreamor, spelled D R E A M O R, and a new LooscidID still starts as Dreamor.
- LICENSE: the protected names are Dreamors™ and Redreams™ (one spelling, no capital D in the middle).
- Search: "dreamors i follow" and "block dreamor" find the right settings.
- Unchanged: storage keys, the Settings backup format, sounds, pitch cues, earcons, Calm mode, flash safety and Reduce Motion.

## Looscid 2026.111.30 (141): Round 6.5

Released October 10, 2026 at 1:50 PM (Eastern Time, 2026-10-10T17:50:27Z UTC)

A feature update: the new composer, Replies that stay, and Nostr threads. The composer's layout follows Feditext's composer (design inspiration only; no Feditext code or text is used).

- One composer for New Dream, Reply and Quote. The text box is still first, Dream (Reply in Reply mode) still comes right after the content, then Close. Ctrl+Enter or Command+Enter sends, Esc closes, focus lands on what you just wrote, and it's announced once: "Dream dreamed.", "Reply dreamed.", "Quote dreamed." or "Thread of 3 Dreams dreamed.".
- In a reply, the Dream you answer sits right before your text box as plain text under the heading "Replying to Maya", so one VoiceOver swipe left reads it. A Dream with a content warning shows the warning and a Show Dream button. Hear Dream reads it aloud with Looscid's read-aloud voice, and Read back my reply reads yours.
- The send button is read as just "Dream", or "Reply" in Reply mode. The Close button is "Close reply" (braille: "Close").
- Who gets notified is a Notify list of checkboxes (the author, the Dream's author and anyone it mentions; never you), not handles typed into your text.
- A reply starts with the Dream's Audience and content warning, and you can change both. If you change the Audience, a plain line under it says so.
- The toolbar follows Feditext's order: Photo, Poll, Audience, Content warning, Insert symbol, characters left, then + Dream (Add another Dream) to write a whole thread in one go. Each extra Dream has its own Remove button. Ask Cherry, Drafts, the passcode unlock and the Nostr notes stay.
- The characters-left count is never read on each key: once at 20 left, and once when you go over. A link counts as 23 characters.
- Replies are saved on this device (dbm_replies) and stay after a reload. A reply draft is kept per Dream, apart from your New Dream draft. Settings backup is unchanged.
- Nostr: a reply to a Dream that's on Nostr is a NIP-10 reply ("e" tags marked root and reply, with relay hint and author, and "p" tags). A Quote carries a NIP-18 "q" tag and a nostr:nevent link. A content warning goes as a NIP-36 "content-warning" tag. Followers only, My Circles and Only this device still never leave your device. Reading your Dreams back now keeps each note's author key and tags, so replies come back under their Dream on a new device.
- Alt text helper: each photo has a plain "Alt text for photo N" field and says "No alt text yet." until you write one. With Cherry turned on, Suggest alt text makes a start on this device from the photo's shape, colours and name, which you then edit. Nothing is sent anywhere.
- Link previews with no server: YouTube, Vimeo and Spotify links get their own player, which loads only when you press Play. Any other link gets a plain card with its domain. Looscid never fetches the linked page.
- Credits and open source: a new page in the menu (and from About) listing every project Looscid uses or learned from, with links and licenses, plus the repos planned next. It's in search too.
- Words: Replies is the one word, everywhere: the Replies page, "No replies yet", "Sort replies", "Reply options" and braille labels. The Audience note says "Visible to all Dreamors", and Redream is spelled one way.
- Same sounds, pitch cues, earcons, Calm mode, flash safety and Reduce Motion.

## Looscid 2026.110.30 (140): Round 6.4

Released October 10, 2026 at 12:52 PM (Eastern Time, 2026-10-10T16:52:30Z UTC)

A feature update: Dreams on Nostr, your key in a secure field with an optional passcode. Your Dreams can be seen anytime, from any device, by anyone. There's still no Looscid server.

- Settings, LooscidID, Keys and IDs has a "Nostr key" section with three ways in: use a signer (NIP-07, your key stays in the signer), enter your key in a secure field ("Your Nostr secret key (nsec)", with a Show key button), or create a new key. A new key is shown once, with a Copy key button and the words: "Save this key somewhere safe. It's the only way to get your Dreams on another device. Looscid can't recover it."
- An optional passcode saves your key locked (NIP-49 ncryptsec: scrypt and XChaCha20-Poly1305). Looscid asks for it once each time you open Looscid, before you Dream. Without a passcode the key is saved unlocked in this browser's storage, and the screen says so.
- Your npub with a Copy npub button, Remove key from this device (with a confirm), and your relay list, which you can change.
- With Audience Everyone and a key or signer, a new Dream is also a signed Nostr note (kind 1, tagged client Looscid and t looscid) sent to your relays. Looscid says once how it went, for example "Dreamed to 3 of 4 relays.", or "Saved on this device. Couldn't reach relays, will retry." Relays that didn't answer are tried again later.
- Audience has a new choice, Only this device, which never sends anything. The note under Audience says honestly where the Dream goes.
- When you open Looscid with your key, your own Dreams load back from the relays (checked signatures, no duplicates), so they show on a new device. With only your npub linked, they load read-only.
- The Nostr crypto is vendored in js/vendor (nostr-tools 2.25.2 with the audited noble libraries), loads only when you use Nostr, and never from a CDN.
- Your key is never in Settings backup. The backup format is unchanged and old backups import as before.
- Same sounds, pitch cues, earcons, Calm mode, flash safety and Reduce Motion.

## Looscid 2026.109.30 (139): Round 6.3

Released October 10, 2026 at 11:40 AM (Eastern Time, 2026-10-10T15:40:22Z UTC)

A fix update: Dreams are saved on your device, and the composer is easier with a keyboard and VoiceOver.

- Your Dreams stay after a reload. They're saved only on this device for now (the dbm_dreams key), and the composer says so under Audience. Likes, Redreams and bookmarks on them are kept too.
- The Privacy page lists Dreams among what's saved on this device. Settings backup is unchanged, and old backups import exactly as before.
- New Dream is a dialog with a "New Dream" heading. The text box comes first, then attachments, then the Dream button, then Close, and Tab stays inside.
- Control+Enter or Command+Enter dreams it, and Escape closes. Then focus moves to your new Dream, and Looscid says "Dream dreamed." once. Closing without dreaming puts focus back on Create.
- The attachment buttons say their word once (Photo, not Photo Photo).
- Docs: NOSTR_ARCHITECTURE.md terminology fixes.
- Same sounds, pitch cues, earcons, Calm mode, flash safety and Reduce Motion.

## Looscid 2026.109.29 (138): Round 6.2

Released October 10, 2026 at 10:33 AM (Eastern Time, 2026-10-10T14:33:35Z UTC)

A fix update: Looscid has its icon.

- Add to Home Screen on iPhone and Android shows the Looscid logo, a white L in a C ring on blue, named Looscid.
- The browser tab shows the logo too.
- Docs: NOSTR_ARCHITECTURE.md says Looscid instead of the old name DreamOS.
- Same words, sounds, pitch cues, settings, storage keys and accessibility.

## Looscid 2026.109.28 (137): Round 6.1

Released October 10, 2026 at 10:08 AM (Eastern Time, 2026-10-10T14:08:08Z UTC)

A fix update: nothing you see or hear changes.

- Looscid is split into files: index.html is only the frame, styles are in css/, and the code is in js/, one file per tab. FILES.md lists what lives where and the load order.
- Alerts and Discover are plain JavaScript with native HTML elements, no framework. The other tabs still use React and move over one at a time.
- Same words, sounds, pitch cues, settings, storage keys and accessibility. Settings backups from Round 6 import unchanged, and backups made now import into Round 6.

## Looscid 2026.109.27 (136): Round 6

Released October 10, 2026 at 8:41 AM (Eastern Time, 2026-10-10T12:41:40Z UTC)

- No extra descriptions: VoiceOver reads each control's name, role and state, and explanations are plain text under headings.
- Verbosity is a tab on Screen reader and braille.
- Apps are Looscid's own: Settings, Apps, and the Looscid App Store.
- Commandbar: the bar and full screen share one history.
- Alerts only for things that really happen, with settings for each.
- Louder sounds with a limiter, plus the Insomnia, NexOS and Hyper Synth packs.
- Privacy: sections that open one at a time, who can do what, Blocked and muted, Media and content.
- Reset: the last item in every settings list.
- Looscid checks for updates by itself and tells you when one is ready.
