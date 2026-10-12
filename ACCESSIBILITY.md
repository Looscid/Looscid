# Looscid Accessibility

Combined from `COMMITMENTS.md` (commitments), `ACCESSIBILITY.md` (guide) and `ACCESSIBILITY_MENU_BUTTON.md` (menu implementation).

## Commitments

### Commitment to Accessibility

I am blind. That is not why I build accessible software. I build it because everyone deserves to use the things I make, and because I know exactly what happens when they cannot.

My mission is to give everyone the power to create and share without barriers, including people with disabilities.

Accessibility is not a feature I bolt on at the end. It is the foundation everything else stands on, from the first line of design to release.

I build with people with and without lived experience of disability, because accessible design is not something done for people, it is something built with them.

I stand with the ADA and WCAG. They are not a checklist to pass. They are the floor, not the ceiling, and I treat them as where the work starts, never where it ends.

My work never stops. When an update breaks accessibility, I treat that regression as a bug and I fix it.

I commit to screen reader support across iOS, Android, and the BrailleNote and Monarch.

### Commitment to Fairness

I am committed to fairness. If you get suspended, you get the right to speak. You can make your case, and you will be heard, because a suspension is not a gag order. That has been true for Dream Board Mobile and DreamOS, and it stays true here. Fairness is one of the reasons Looscid is different, and I will not trade it away.

### Commitment to Humor

I want Looscid to be funny the way Discord is funny: quick, dry, a little chaotic, and never mean.

- Funny never costs clarity. A joke can wrap an instruction, it cannot replace one.
- Never punch down. No jokes at the user's expense, none about disability, none that assume sight.
- Errors can be funny, but they still say what went wrong and what to do next.
- Cherry gets the most personality. System strings, security notices and legal text stay plain.
- Accessibility text stays literal. Labels, alt text and announcements say exactly what they mean, because a screen reader cannot hear a joke about a button, it needs the button's name.
- When in doubt, land the meaning first, then the joke.

## Accessibility

Comprehensive accessibility documentation for Looscid covering web and iOS platforms.

---

### Table of Contents
- Web Accessibility
- iOS Accessibility
- VoiceOver Implementation
- Button Naming & Numbering
- Best Practices

---

### Web Accessibility

#### HTML Structure for Accessible Menu Popups

```html
<div class="menu-container">
  <button 
    id="more-button"
    class="menu-button"
    aria-haspopup="menu"
    aria-expanded="false"
    aria-controls="menu-list"
    aria-label="More options"
  >
    <span aria-hidden="true">⋯</span>
  </button>

  <div
    id="menu-list"
    class="menu-popup"
    role="menu"
    aria-labelledby="more-button"
    hidden
  >
    <button class="menu-item" role="menuitem" data-action="edit">✏️ Edit</button>
    <button class="menu-item" role="menuitem" data-action="share">📤 Share</button>
    <button class="menu-item" role="menuitem" data-action="delete">🗑️ Delete</button>
  </div>
</div>
```

#### ARIA Attributes Reference

- `aria-haspopup="menu"` — Indicates the button triggers a menu
- `aria-expanded="false"` — Announces menu state (open/closed)
- `aria-controls="menu-list"` — Links button to controlled element
- `aria-label="More options"` — Descriptive label for screen readers
- `role="menu"` — Semantic role for popup container
- `aria-labelledby="more-button"` — Links menu to trigger button

**Looscid pattern:** Use a trailing comma in aria-labels for VoiceOver pause (e.g. `aria-label="Save Dream,"`).

---

### iOS Accessibility

#### VoiceOver Support

```swift
button.accessibilityLabel = "More options"
button.accessibilityHint = "Double tap to open menu"
button.accessibilityIdentifier = "moreButton"
```

#### VoiceOver Pitch

- Default pitch: `1.0`
- Higher pitch (`1.5 - 2.0`): Important alerts
- Lower pitch (`0.5 - 0.8`): Errors, warnings

---

### Button Naming & Numbering

1. **Be Descriptive**: "Save Draft" not "OK"
2. **Include Context**: "Delete Dream" not "Delete"
3. **Show Progress**: "Continue (2 of 5)" for multi-step flows
4. **Avoid Redundancy**: Don't say "Save Button" on a button

---

### Screen Reader Testing Checklist

- [ ] All images have descriptive alt text
- [ ] Form fields have associated labels
- [ ] Links describe their purpose
- [ ] Buttons have accessible names
- [ ] Error messages are announced
- [ ] Live regions use `aria-live`
- [ ] Focus is managed properly
- [ ] Color is not the only indicator
- [ ] Tested with VoiceOver, BrailleNote Touch Plus, TalkBack

---

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple VoiceOver Documentation](https://www.apple.com/accessibility/voiceover/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

See also: `ACCESSIBILITY_MENU_BUTTON.md` for the full menu popup implementation guide.

## Accessibility Menu

Comprehensive guide for implementing accessible menu popup buttons in Looscid for both web and iOS platforms.

---

### Web Implementation (GitHub-Style Menu)

#### HTML Structure

```html
<div class="menu-container">
  <button 
    id="more-button"
    class="menu-button"
    aria-haspopup="menu"
    aria-expanded="false"
    aria-controls="menu-list"
    aria-label="More options"
  >
    <span aria-hidden="true">⋯</span>
  </button>

  <div
    id="menu-list"
    class="menu-popup"
    role="menu"
    aria-labelledby="more-button"
    hidden
  >
    <button
      class="menu-item"
      role="menuitem"
      data-action="edit"
    >
      ✏️ Edit
    </button>
    <button
      class="menu-item"
      role="menuitem"
      data-action="share"
    >
      📤 Share
    </button>
    <button
      class="menu-item"
      role="menuitem"
      data-action="delete"
    >
      🗑️ Delete
    </button>
  </div>
</div>
```

#### CSS Styling

```css
.menu-container {
  position: relative;
  display: inline-block;
}

.menu-button {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 18px;
  color: #e9d5ff;
  transition: all 0.2s ease;
  font-weight: 600;
}

.menu-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.menu-button:focus {
  outline: 2px solid #6d28d9;
  outline-offset: 2px;
}

.menu-button[aria-expanded="true"] {
  background: rgba(109, 40, 217, 0.2);
  border-color: #6d28d9;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .menu-button {
    transition: none;
  }
  .menu-popup {
    animation: none;
  }
}

.menu-popup {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #161228;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  min-width: 180px;
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-popup:hidden {
  display: none;
}

.menu-item {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: #ede9fe;
  font-size: 14px;
  transition: background 0.15s ease;
  font-family: inherit;
}

.menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

.menu-item:hover {
  background: rgba(109, 40, 217, 0.2);
}

.menu-item:focus {
  outline: 2px solid #6d28d9;
  outline-offset: -2px;
  background: rgba(109, 40, 217, 0.3);
}

/* High contrast mode support */
@media (prefers-contrast: more) {
  .menu-button {
    border-width: 2px;
  }
  .menu-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .menu-popup {
    background: #0a0810;
    border-color: rgba(255, 255, 255, 0.1);
  }
}
```

#### JavaScript Implementation

```javascript
class AccessibleMenuButton {
  constructor(buttonId, menuId) {
    this.button = document.getElementById(buttonId);
    this.menu = document.getElementById(menuId);
    this.menuItems = this.menu.querySelectorAll('[role="menuitem"]');
    this.isOpen = false;
    this.focusedIndex = -1;

    this.init();
  }

  init() {
    // Button click
    this.button.addEventListener('click', () => this.toggle());

    // Menu item clicks
    this.menuItems.forEach((item, index) => {
      item.addEventListener('click', (e) => this.handleItemSelect(e, index));
      item.addEventListener('keydown', (e) => this.handleItemKeydown(e, index));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.button.contains(e.target) && !this.menu.contains(e.target)) {
        this.close();
      }
    });

    // Keyboard on button
    this.button.addEventListener('keydown', (e) => this.handleButtonKeydown(e));
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.focusedIndex = -1;
    
    this.announceToScreenReader('Menu opened');
  }

  close() {
    this.isOpen = false;
    this.menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
    this.button.focus();
    
    this.announceToScreenReader('Menu closed');
  }

  handleButtonKeydown(e) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.open();
      this.focusItem(0);
    } else if (e.key === 'Escape') {
      this.close();
    }
  }

  handleItemKeydown(e, index) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusItem(Math.min(index + 1, this.menuItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusItem(Math.max(index - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        this.focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        this.focusItem(this.menuItems.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.handleItemSelect(e, index);
        break;
    }
  }

  focusItem(index) {
    this.focusedIndex = index;
    this.menuItems[index].focus();
  }

  handleItemSelect(e, index) {
    const action = this.menuItems[index].getAttribute('data-action');
    this.announceToScreenReader(`${action} selected`);
    
    // Dispatch custom event
    this.button.dispatchEvent(
      new CustomEvent('menu-action', {
        detail: { action, index }
      })
    );

    this.close();
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
}

// Initialize
const menu = new AccessibleMenuButton('more-button', 'menu-list');

// Listen for menu actions
document.getElementById('more-button').addEventListener('menu-action', (e) => {
  console.log('Action:', e.detail.action);
});
```

---

### iOS SwiftUI Implementation

#### VoiceOver Accessibility Sounds

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

#### SwiftUI Menu Button Component

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

---

### Accessibility Checklist

- [x] ARIA attributes implemented
- [x] Keyboard navigation (arrows, home, end, escape)
- [x] Screen reader announcements
- [x] Focus management
- [x] High contrast support
- [x] Reduced motion support
- [x] VoiceOver compatibility (iOS)
- [x] TalkBack compatibility (Android)
- [x] NVDA compatibility (Windows)
- [x] JAWS compatibility (Windows)
- [x] Color not sole indicator
- [x] Sufficient color contrast

---

### Testing Recommendations

1. **Screen Readers**: Test with NVDA, JAWS (Windows); VoiceOver (macOS/iOS)
2. **Keyboard**: Navigate entire menu with keyboard only
3. **Zoom**: Test at 200% zoom level
4. **Color**: Verify readability in high contrast mode
5. **Motion**: Test with reduced motion enabled


---

### The composer (Round 6.5)

One composer for New Dream, Reply and Quote, laid out like Feditext's composer, with Looscid's rules where they differ.

- Order in Reply mode: the heading "Reply to Maya", the heading "Replying to Maya" with the Dream as one plain paragraph, then the text box. Focus starts in the text box, so one swipe left (or VO+Left, or panning back on braille) reads the Dream.
- After the text box: the Notify checkboxes (a fieldset with the legend "Notify"), the content warning text when it's on, attachments with their alt text fields, the link preview line, the toolbar (Photo, Poll, Audience, Content warning, Insert symbol, characters left, + Dream), Hear Dream, Read back my reply, Ask Cherry, then Reply and Close.
- The send button's name is its visible word: Dream, or Reply. No aria-label says anything different.
- Where Feditext uses VoiceOver hints (content warning, characters left, changing accounts), Looscid uses visible words or plain paragraphs instead: the composer's controls say what they do. Looscid never uses aria-description or title, and aria-describedby only for a real hint on a control whose action isn't obvious (see Hints (Round 7)).
- Feditext puts its content warning field above the text. Looscid puts it after the text box, so the Dream you answer stays the one thing right before your text.
- Announcements go only through #looscid-live: what you sent ("Reply dreamed."), the characters-left count once at 20 left and once over, and Nostr results. Focus moves only when you act: opening, sending, closing, adding another Dream, turning on a content warning, and taking an alt text suggestion.

### The Cherry page (Round 6.5.2)

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

### Cherry in Commandbar, and the Commands page (Round 6.5.3)

- Commands: open cherry, new cherry chat, cherry pinned chats and cherry history ("Cherry: Pinned chats" and "Cherry: History" work as typed; capitals and punctuation are ignored). Spaces are optional (opencherry, cherrychats, pinnedchats), and path style works: fil > Cherry pinned.
- Commandbar says what opened, once, in #looscid-live ("Opened Cherry, Your History, Pinned, 2 pinned chats."). The Cherry page adds no second announcement.
- Focus moves because you ran the command: open cherry to the "Cherry" heading, new cherry chat to the message box, cherry pinned chats to the Pinned tab and cherry history to the All tab.
- With Cherry off, the commands open Settings, Intelligence, Cherry and say "Cherry is off."
- The Commands page (commands, or More, Commands, All commands): Back, the heading "Commands" (h1, focus lands here), Close Commands (braille label "Close"), two plain paragraphs, then one h2 per area with a list. Each list item is a real button named by the command itself ("open feed"), followed by a plain paragraph saying what it does and, when there are any, a paragraph with the other ways to type it.
- Pressing a command runs it exactly as Commandbar would: the result is said once in #looscid-live and focus stays on the button, unless the command opens a page (then that page's heading, or what the command points at, gets focus). A command that needs a word opens Commandbar with the command typed in and focus in the text box; Escape returns focus to the button.
- No aria-description or title on the page, no hints (each command's button is followed by a paragraph saying what it does), and no animation.

### Menus, sheets and dialogs (Round 7)

- Every menu, sheet and dialog is truly modal: while one is open, everything outside it is hidden from VoiceOver, braille and the keyboard, and when it closes focus goes back to the button that opened it. The live announcer (#looscid-live) always stays reachable.
- No menu, sheet, dialog, pop-up, More, Create, Commandbar, Circle sheet, Cherry dialog or onboarding screen has aria-describedby or any other hint of its own (hints go only on controls; see Hints (Round 7)). VoiceOver on iPhone reads a container's description as "description" and repeats it on every move inside it, so containers never get one. Their name and role say what they are; Escape or a two-finger scrub closes them.
- No definition lists (dl, dt, dd) anywhere. WebKit names a <dd> "description" and VoiceOver says it after every value, so label-and-value pairs (profile About and fields, the LooscidID data summary, Built-in shortcuts, the welcome glossary) are plain list rows that read "Label: value". The colon is for VoiceOver and braille only, so the look is unchanged.

### The profile (Round 7)

- Order: Back, the avatar (hidden), Direct message and Follow (someone else's profile) or Edit profile (yours), the name (h1), the @handle line, then the Dreamor options pop-up button, the note, fields, bio, the Following and Followers buttons and the tabs. There is no "Dreams (N) • Joined" line: the Dreams tab says how many, and About has Date joined.
- Dreamor options is a real pop-up menu button, like every other action menu: it opens with focus on the first item, Escape or a two-finger scrub closes it, choosing an item closes it, and focus goes back to the button. It never remembers being open.
- Someone else's profile: Follow or Unfollow, Message, Ask Cherry for a summary, Share, Copy LooscidID link, Hide or Show Redreams, Add note, Mute, Block, Report. Your own: Edit profile, Share, Copy LooscidID link, View as others see it, Settings. An item that isn't ready yet stays in the list, unavailable, with the reason.
- View as others see it shows your profile without your own controls, with focus on your name and a "Done viewing as others" button (Back works too) that returns focus to Dreamor options.
- The About tab's heading is "About" and the display name, or "About this LooscidID" when there isn't one.
- "<name> just published" is said once, only for a Dream with a real time from the last few minutes.

### Create Circle (Round 7)

- Each step's heading is an h2 that says where you are: "New Circle, Step 1 of 3", "Circle Settings, Step 2 of 3", "Circle Rules, Step 3 of 3". When the step changes (Next or Back), focus moves to that heading.
- Icon, Category and Privacy are radio groups: each choice is a radio button with its checked state, Arrow keys move and choose, and only the chosen one is in the Tab order. A Privacy choice's name includes its sub-line ("Public, Anyone can find and join"); nothing is read through a description.
- No asterisks: the name field is required (VoiceOver says "required") and the visible labels say "(required)". No arrows in the Next buttons, no slashes in the step count, and the rule numbers are hidden (each field is "Rule 1", "Rule 2"...).
- Escape or a two-finger scrub closes the sheet, like every other sheet.

### Hints (Round 7)

Alhasan (Oct 11, 2026): hints like a Swift app's, only where they help.

- A hint is aria-describedby on the one control that needs it, pointing at a short sentence that ends with a period. On iPhone, VoiceOver reads it after a short pause as that control's hint, it follows VoiceOver's own Hints setting, and a braille display shows it. Desktop screen readers may read it right away.
- Hints are allowed on controls whose action isn't obvious from their name and role. They are never allowed on containers (menus, sheets, dialogs, More, Create, Commandbar, Circle sheets, Cherry dialogs, onboarding, lists, Dream rows, tab lists or tabs), and never on obvious controls such as Like, Back, Close, Share, Mute, Block, Follow, menu items, text fields or tabs.
- Every sentence lives once in one hidden holder outside the app (#lc-hints), reused by id (lcHint in core.js). The modal manager leaves the holder alone.
- A disabled item says only its short name ("Report"); why it's unavailable is its hint ("Not available yet: Looscid has nowhere to send reports yet.").

| Control | Hint |
|---|---|
| A Dream's replies count ("3 replies") | Opens the thread. |
| A Dream's Redreams count | Opens Redream and Quote. |
| A Dream's More button | Opens actions for this Dream. |
| More, Read this Dream | Reads this Dream aloud. |
| More, Hear thread | Reads the whole thread aloud. |
| More, Report (unavailable) | Not available yet: Looscid has nowhere to send reports yet. |
| Expand thread / Collapse thread | Shows the Dreams above and every reply. / Shows only this Dream. |
| Profile, Following and Followers counts | Opens the list. |
| Profile, Direct message and Dreamor options, Message (unavailable) | Not available yet: direct messages aren't ready yet. |
| Dreamor options, Report (unavailable) | Not available yet: Looscid has nowhere to send reports yet. |
| Dreamor options, Ask Cherry for a summary (while Cherry is off) | Not available while Cherry is off. Turn it on in Settings, Intelligence. |
| Create, an option that isn't in Looscid yet ("Custom Feed") | Not available in Looscid yet. |
