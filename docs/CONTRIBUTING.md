# Contributing to Looscid

Welcome, and thank you for being here. Looscid is an open source project built with care, and we're glad you want to be part of it. Before you get started, take a few minutes to read this document. It'll help you understand what we're building and how we build it together.

---

## Language and terminology

We have our own language here. Please read [TERMINOLOGY.md](guides/TERMINOLOGY.md) before anything else. Dreams, Redreams, Replies, Circles and Dreamors are the words of this platform and they belong everywhere — in code, in comments, in UI text and in documentation. It's a small thing that means a lot to us.

---

## Accessibility

Looscid was built by a blind Dreamor. Accessibility isn't something we added — it's something we started with. We ask every contributor to keep that spirit alive.

That means meaningful ARIA labels on interactive elements, logical heading structure, touch targets that are easy to reach and color never being the only way something communicates meaning.

We know not everyone has access to a screen reader for testing. If that's you, do your best and flag it in your pull request. We'd rather you contribute and be honest about what you couldn't test than not contribute at all. We'll work through it together.

### Building it accessibly

Moved here from the old accessibility guide on Nov 8 2026. What Looscid promises people, and how it works with screen readers, is on [About Looscid](https://looscid.github.io/Looscid/About/). This part is the how-to for anyone writing code or words for Looscid. Every UI piece, with working demos, is in the [component library](https://looscid.github.io/Looscid/help/dev/components/).

#### Checklist for every screen

- [ ] All images have descriptive alt text
- [ ] Form fields have associated labels
- [ ] Links describe their purpose
- [ ] Buttons have accessible names
- [ ] Error messages are announced
- [ ] Live regions use `aria-live` (Looscid has one, `#looscid-live`)
- [ ] Focus is managed properly, and only moves when you act
- [ ] Color is not the only indicator, and color contrast is enough
- [ ] Keyboard works everywhere (Arrow keys, Home, End and Escape in menus and tabs)
- [ ] High contrast and Reduce Motion are respected
- [ ] Tested with screen readers (VoiceOver, TalkBack, NVDA, JAWS, Orca) and braille displays like the BrailleNote Touch Plus

How to test: use a screen reader, use only the keyboard, zoom to 200%, turn on high contrast, and turn on Reduce Motion.

#### Button naming and numbering

1. **Be Descriptive**: "Save Draft" not "OK"
2. **Include Context**: "Delete Dream" not "Delete"
3. **Show Progress**: "Continue (2 of 5)" for multi-step flows
4. **Avoid Redundancy**: Don't say "Save Button" on a button

**Looscid pattern:** Use a trailing comma in aria-labels for VoiceOver pause (e.g. `aria-label="Save Dream,"`).

#### Writing funny (from Commitment to Humor)

I want Looscid to be funny: quick, dry, a little chaotic, and never mean.

- Funny never costs clarity. A joke can wrap an instruction, it cannot replace one.
- Never punch down. No jokes at the user's expense, none about disability, none that assume sight.
- Errors can be funny, but they still say what went wrong and what to do next.
- Cherry gets the most personality. System strings, security notices and legal text stay plain.
- Accessibility text stays literal. Labels, alt text and announcements say exactly what they mean, because a screen reader cannot hear a joke about a button, it needs the button's name.
- When in doubt, land the meaning first, then the joke.

#### The composer (Round 6.5)

One composer for New Dream, Reply and Quote.

- Order in Reply mode: the heading "Reply to Maya", the heading "Replying to Maya" with the Dream as one plain paragraph, then the text box. Focus starts in the text box, so one swipe left (or VO+Left, or panning back on braille) reads the Dream.
- After the text box: the Notify checkboxes (a fieldset with the legend "Notify"), the content warning text when it's on, attachments with their alt text fields, the link preview line, the toolbar (Photo, Poll, Audience, Content warning, Insert symbol, characters left, + Dream), Hear Dream, Read back my reply, Ask Cherry, then Reply and Close.
- The send button's name is its visible word: Dream, or Reply. No aria-label says anything different.
- No hints: the composer uses visible words or plain paragraphs instead (content warning, characters left, changing accounts), so its controls say what they do. Looscid never uses aria-description, aria-describedby or title (see Hints).
- The content warning field comes after the text box, not above it, so the Dream you answer stays the one thing right before your text.
- Announcements go only through #looscid-live: what you sent ("Reply dreamed."), the characters-left count once at 20 left and once over, and Nostr results. Focus moves only when you act: opening, sending, closing, adding another Dream, turning on a content warning, and taking an alt text suggestion.

#### The Cherry page (Round 6.5.2)

Cherry is a page, not a dialog. It is built screen-reader first: the page is a stream of announcements, and focus only moves when you act.

- Order: Back, the heading "Cherry" (h1), Close Cherry (braille label "Close"), New Chat, a plain paragraph about Cherry, then the chat (an h2 with the chat's title), Your History (h2) and What Cherry did (h2).
- Each message is a list item that starts with "You:" or "Cherry:", so it reads the same in speech and on braille.
- The message box is "Message Cherry". Enter sends from a keyboard, and from a braille display's Enter (beforeinput insertParagraph or insertLineBreak), the same as other Looscid text boxes. The Send button works too.
- Announcements go only through #looscid-live: each answer once, as "Cherry: ...", and settings changes in their own words. Also "New chat started.", "Pinned <title>.", "Unpinned <title>.", "Opened <title>, N messages." and "Undone: ...".
- Focus moves only when you act: opening the page (to the h1), New Chat (to the message box), opening a chat from Your History (to its heading), and unpinning a chat in Pinned (to the next pinned chat's button, or to the Pinned tab). Cherry's answers never move focus.
- Your History has a tablist named "Your History" with the tabs All and Pinned, each with its count. Arrow keys, Home and End move between the tabs; only the selected tab is in the Tab order. The tab panel is labelled by the selected tab.
- Pin and Unpin are buttons named with the chat's title ("Pin What is Looscid?"), so the list makes sense when you move by buttons.
- No aria-description or title anywhere on the page, and no hints: every control says what it does. Explanations are plain paragraphs under their headings.
- No animation on the page, so Reduce Motion and flash safety have nothing to stop.

#### Cherry in Commandbar, and the Commands page (Round 6.5.3)

- Commands: open cherry, new cherry chat, cherry pinned chats and cherry history ("Cherry: Pinned chats" and "Cherry: History" work as typed; capitals and punctuation are ignored). Spaces are optional (opencherry, cherrychats, pinnedchats), and path style works: fil > Cherry pinned.
- Commandbar says what opened, once, in #looscid-live ("Opened Cherry, Your History, Pinned, 2 pinned chats."). The Cherry page adds no second announcement.
- Focus moves because you ran the command: open cherry to the "Cherry" heading, new cherry chat to the message box, cherry pinned chats to the Pinned tab and cherry history to the All tab.
- With Cherry off, the commands open Settings, Intelligence, Cherry and say "Cherry is off."
- The Commands page (commands, or More, Commands, All commands): Back, the heading "Commands" (h1, focus lands here), Close Commands (braille label "Close"), two plain paragraphs, then one h2 per area with a list. Each list item is a real button named by the command itself ("open feed"), followed by a plain paragraph saying what it does and, when there are any, a paragraph with the other ways to type it.
- Pressing a command runs it exactly as Commandbar would: the result is said once in #looscid-live and focus stays on the button, unless the command opens a page (then that page's heading, or what the command points at, gets focus). A command that needs a word opens Commandbar with the command typed in and focus in the text box; Escape returns focus to the button.
- No aria-description or title on the page, no hints (each command's button is followed by a paragraph saying what it does), and no animation.

#### Menus, sheets and dialogs (Round 7)

- Every menu, sheet and dialog is truly modal: while one is open, everything outside it is hidden from VoiceOver, braille and the keyboard, and when it closes focus goes back to the button that opened it. The live announcer (#looscid-live) always stays reachable.
- No menu, sheet, dialog, pop-up, More, Create, Commandbar, Circle sheet, Cherry dialog or onboarding screen has aria-describedby or any other hint of its own (hints go only on controls; see Hints (Round 7)). VoiceOver on iPhone reads a container's description as "description" and repeats it on every move inside it, so containers never get one. Their name and role say what they are; Escape or a two-finger scrub closes them.
- No definition lists (dl, dt, dd) anywhere. WebKit names a <dd> "description" and VoiceOver says it after every value, so label-and-value pairs (profile About and fields, the LooscidID data summary, Built-in shortcuts, the welcome glossary) are plain list rows that read "Label: value". The colon is for VoiceOver and braille only, so the look is unchanged.

#### The profile (Round 7)

- Order: Back, the avatar (hidden), Direct message and Follow (someone else's profile) or Edit profile (yours), the name (h1), the @handle line, then the Dreamor options pop-up button, the note, fields, bio, the Following and Followers buttons and the tabs. There is no "Dreams (N) • Joined" line: the Dreams tab says how many, and About has Date joined.
- Dreamor options is a real pop-up menu button, like every other action menu: it opens with focus on the first item, Escape or a two-finger scrub closes it, choosing an item closes it, and focus goes back to the button. It never remembers being open.
- Someone else's profile: Follow or Unfollow, Message, Ask Cherry for a summary, Share (the phone's share sheet, which has Copy), Copy username, Hide or Show Redreams, Add note, Mute, Block, Report. Your own: Edit profile, Share, Copy username, View as others see it, Settings. An item that isn't ready yet stays in the list, unavailable, with the reason.
- View as others see it shows your profile without your own controls, with focus on your name and a "Done viewing as others" button (Back works too) that returns focus to Dreamor options.
- The About tab's heading is "About" and the display name, or "About this LooscidID" when there isn't one.
- "<name> just published" is said once, only for a Dream with a real time from the last few minutes.

#### Create Circle (Round 7)

- Each step's heading is an h2 that says where you are: "New Circle, Step 1 of 3", "Circle Settings, Step 2 of 3", "Circle Rules, Step 3 of 3". When the step changes (Next or Back), focus moves to that heading.
- Icon, Category and Privacy are radio groups: each choice is a radio button with its checked state, Arrow keys move and choose, and only the chosen one is in the Tab order. A Privacy choice's name includes its sub-line ("Public, Anyone can find and join"); nothing is read through a description.
- No asterisks: the name field is required (VoiceOver says "required") and the visible labels say "(required)". No arrows in the Next buttons, no slashes in the step count, and the rule numbers are hidden (each field is "Rule 1", "Rule 2"...).
- Escape or a two-finger scrub closes the sheet, like every other sheet.

#### Hints (Round 7)

Updated Nov 8 2026. The Oct 11 rule said a hint was aria-describedby on the one control that needs it. Since Nov 1 2026 that's banned (VoiceOver on iPhone says "description" for it, and the Validate workflow fails a push that brings it back).

- A hint is a short plain sentence, ending with a period, written right under the control it's for. No aria-describedby, no aria-description, no title.
- Hints go only on controls whose action isn't obvious from their name and role. Never on containers (menus, sheets, dialogs, More, Create, Commandbar, Circle sheets, Cherry dialogs, onboarding, lists, Dream rows, tab lists or tabs), and never on obvious controls such as Like, Back, Close, Share, Mute, Block, Follow, menu items, text fields or tabs.
- A disabled item says only its short name ("Message"); the sentence under it says why it isn't available yet.


#### For the native apps (Swift)

Samples from the old guide, for when Looscid has native apps.

##### VoiceOver Support

```swift
button.accessibilityLabel = "More options"
button.accessibilityHint = "Double tap to open menu"
button.accessibilityIdentifier = "moreButton"
```

##### VoiceOver Pitch

- Default pitch: `1.0`
- Higher pitch (`1.5 - 2.0`): Important alerts
- Lower pitch (`0.5 - 0.8`): Errors, warnings

##### VoiceOver Accessibility Sounds

```swift
import UIKit
import AVFoundation

enum AccessibilitySound {
  // Standard VoiceOver sounds
  static let popover: UInt32 = 1000
  static let dismiss: UInt32 = 1001
  static let activate: UInt32 = 1104
}

class AccessibilitySoundManager {
  static let shared = AccessibilitySoundManager()
  
  func playPopoverSound() {
    AudioServicesPlaySystemSound(AccessibilitySound.popover)
  }
  
  func playDismissSound() {
    AudioServicesPlaySystemSound(AccessibilitySound.dismiss)
  }
  
  func playActivateSound() {
    AudioServicesPlaySystemSound(AccessibilitySound.activate)
  }
}
```

##### SwiftUI Menu Button Component

```swift
import SwiftUI

struct AccessibleMenuButton: View {
  @State private var isMenuOpen = false
  @State private var focusedItem: MenuItem?
  
  let items: [MenuItem]
  var onSelect: (MenuItem) -> Void
  
  struct MenuItem: Identifiable, Equatable {
    let id: String
    let title: String
    let icon: String
    let action: () -> Void
    
    static func == (lhs: MenuItem, rhs: MenuItem) -> Bool {
      lhs.id == rhs.id
    }
  }
  
  var body: some View {
    ZStack(alignment: .topTrailing) {
      // More button
      Button(action: toggleMenu) {
        Image(systemName: "ellipsis")
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(.purple)
          .padding(10)
          .contentShape(Rectangle())
      }
      .accessibilityLabel("More options")
      .accessibilityHint("Double-tap to open menu")
      .accessibilityAddTraits(.isButton)
      .onAccessibilityActivate {
        isMenuOpen.toggle()
        if isMenuOpen {
          AccessibilitySoundManager.shared.playPopoverSound()
        }
        return true
      }
      
      // Menu popup
      if isMenuOpen {
        VStack(alignment: .leading, spacing: 0) {
          ForEach(items) { item in
            MenuItemView(
              item: item,
              isFocused: focusedItem?.id == item.id,
              onSelect: {
                onSelect(item)
                item.action()
                closeMenu()
              }
            )
          }
        }
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .shadow(radius: 8)
        .padding(.top, 8)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Menu")
        .onExitCommand {
          closeMenu()
        }
      }
    }
  }
  
  private func toggleMenu() {
    isMenuOpen.toggle()
    if isMenuOpen {
      AccessibilitySoundManager.shared.playPopoverSound()
    } else {
      AccessibilitySoundManager.shared.playDismissSound()
    }
  }
  
  private func closeMenu() {
    isMenuOpen = false
    AccessibilitySoundManager.shared.playDismissSound()
    UIAccessibility.post(notification: .announcement, argument: "Menu closed")
  }
}

struct MenuItemView: View {
  let item: AccessibleMenuButton.MenuItem
  let isFocused: Bool
  let onSelect: () -> Void
  
  @AccessibilityFocusState private var isFocused_
  
  var body: some View {
    Button(action: onSelect) {
      HStack(spacing: 12) {
        Image(systemName: item.icon)
          .foregroundColor(.purple)
        Text(item.title)
          .foregroundColor(.primary)
        Spacer()
      }
      .padding(12)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(isFocused ? Color.purple.opacity(0.1) : Color.clear)
    }
    .accessibilityLabel(item.title)
    .accessibilityElement(children: .ignore)
    .onTapGesture {
      onSelect()
      AccessibilitySoundManager.shared.playActivateSound()
    }
    .accessibilityFocused($isFocused_, equals: true)
  }
}

// Preview
struct AccessibleMenuButton_Previews: PreviewProvider {
  static var previews: some View {
    AccessibleMenuButton(
      items: [
        .init(id: "edit", title: "Edit", icon: "pencil", action: {}),
        .init(id: "share", title: "Share", icon: "share", action: {}),
        .init(id: "delete", title: "Delete", icon: "trash", action: {})
      ],
      onSelect: { _ in }
    )
  }
}
```

#### Resources

- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## Code

Keep it clean and readable. Comment your reasoning. If something might confuse someone coming to the code fresh, a short explanation goes a long way.

---

## Documentation conventions

When two or more docs cover the same subject, bring them into one file. Keep each original source filename as a real Markdown heading (`##` or `###`) so its anchor works, not as bold text. Put a short line saying what was combined right below the top heading. Docs that only look alike but cover different subjects should stay separate.

While merging, fix verified stale terms: Gabriel to Cherry, Dream Board and Dream Board Mobile to Looscid, Local to Nearby, and inline DiscoverPage to discover.js. Never edit quoted copy, sample strings or legal terms. Use relative links, never absolute GitHub blob URLs. Preserve accessibility-relevant copy and attributes exactly, including `role`, `tabindex`, focus handlers and `aria-*`.

Never merge legal text. If `license.txt` and `LICENSE` differ in substance, keep them separate and let 2three1y decide.

Looscid is open source under the GNU AGPL-3.0 ([LICENSE](../LICENSE)). Anything you contribute is shared under that same license. Code from AGPL, GPL-3.0, MIT, BSD, Apache-2.0 and other compatible licenses can come in, as long as its license and credit come with it.

---

## The spirit of this project

Looscid exists to prove something. We hope you feel that when you build with us.
