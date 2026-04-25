# DreamOS Roadmap

## In Progress
- Vite migration (refactor/vite-build branch)

## UI Fixes (next after migration)
- Fix "For You" text rendering issue in feed tabs
- Report and Block move to Profile More button — remove from Dream options
- Remove "More Actions" label from Dream options menu
- Dream options menu becomes collapsible/expandable like a More button pattern
- All option menus open fullscreen except small confirmations
- Settings uses tab design not buttons
- Website feel not app feel — proper web layout, not just a mobile shell

## Authentication (Nostr-first)
- Nostr is the primary login and signup method
- Browser extension support (Alby, nos2x) for signing
- Manual nsec entry as fallback
- Guest mode uses a shared read-only Nostr guest account
- Google and Apple remain as secondary options
- Connect existing Dream ID to a Nostr npub

## Features Planned
- Full Atab1pro OS experience — every app built from the spec
- Shifting tab bar per app (like FAXO)
- Cherry Projects — folders Cherry can edit, persistent chat context
- Cherry side menu — chat switcher, pinned chats, new chat button
- Cherry in Alerts tab Chats subtab
- @Cherry tagging in Dreams and chats — public or private response
- Unified file explorer — Cherry, Chat, Dreams tabs
- Attach menu — Files (project then device), Photos (native picker), GIFs
- Full contacts app
- Phone app with real dialer UI (WebRTC for Dreamor-to-Dreamor calls)
- DB Mail — full compose, inbox, reply
- Developer portal — third parties submit mini apps (WeChat-style)
- Nostr integration — login, signup, connect existing account, relay support
- Fediverse / Mastodon integration
- End-to-end encrypted messages
- Cherry own trained model
- iOS native Swift app
- Custom actions for VoiceOver (swipe up pattern)
- BrailleNote Touch Plus / KeySoft tested on every release

## Security
- Vite build — no secrets in source
- All keys in environment variables
- Cloudflare secrets for deployment
- Branch protection on main
- No personal info in demo content

## Accessibility Standards
- Every button a real button element (EDBT rendering on BrailleNote)
- aria-label comma-pause pattern for VoiceOver
- Reduce Motion respected via prefers-reduced-motion
- Fullscreen option menus for clean Braille navigation
- First-letter navigation friendly labels
- Test devices: iPhone + HumanWare Braille display, BrailleNote Touch Plus (KeySoft), Android tablet (TalkBack)

## Terminology (never break these)
| Use | Never |
|---|---|
| Dreams | Posts |
| Dreamors | Users |
| ReDreams | Reposts |
| Circles | Groups |
| Dream ID | Account |
| Feed | Home tab |
| Alerts | Notifications |
| Login | Sign In |
| Cherry | Claude or any other AI |

