# Changelog

Looscid counts every update on the preview branch as YEAR.FEATURES.FIXES (BUILD). Fix updates only fix things; feature updates add something. Builds count every update.

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
- Words: Replies is the one word, everywhere: the Replies page, "No replies yet", "Sort replies", "Reply options" and braille labels. The Audience note now says "Visible to all Dreamers", and Redream is spelled one way.
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
- Docs: NOSTR_ARCHITECTURE.md says Dreamers instead of Dreamors.
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
