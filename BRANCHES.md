# Dream Board Mobile — Branch Strategy

## Branch Structure

### `main`
Always deployable. What Dreamors see at dream-board-mobile.pages.dev.
Nothing merges here unless it is tested and ready.

### `dev`  
Active development branch. Features merge here first.
Deployed to a preview URL for testing before going to main.

### Feature branches (branch off `dev`)
Named clearly for what they contain:

- `feature/phone-ui` — Phone app dialer and call screen
- `feature/db-mail-ui` — DB Mail compose and inbox
- `feature/cherry-file` — Cherry's own component files
- `feature/file-explorer` — Unified file explorer with Cherry/Chat/Dreams tabs
- `feature/contacts-app` — Full contacts manager
- `feature/developer-portal` — Mini app submission system for third parties
- `feature/os-shell` — Full Atab1pro OS experience, shifting tab bar
- `feature/cherry-projects` — Projects, side menu, chat switcher
- `feature/settings-tabs` — Tabbed settings redesign
- `feature/accessibility-ios` — Custom actions, swipe pickers, context menus
- `refactor/vite-build` — Migration from single HTML to Vite build system (current)

## Rules

1. Never push directly to main
2. Feature branches always come off dev
3. Test on real devices before merging — iPhone VoiceOver, BrailleNote Touch, Android tablet
4. Every merge to main triggers an automatic Cloudflare Pages deploy
5. Secrets live in GitHub repository secrets, never in code

## Testing Devices

- iPhone with VoiceOver + NLS eReader HumanWare Braille display (primary)
- BrailleNote Touch (Android, KeySoft)
- Android tablet with TalkBack (secondary)

