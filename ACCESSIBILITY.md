# Looscid Accessibility

Combined from `ACCESSIBILITY.md` (guide) and `ACCESSIBILITY_MENU_BUTTON.md` (menu implementation).

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
- Where Feditext uses VoiceOver hints (content warning, characters left, changing accounts), Looscid uses visible words or plain paragraphs instead, because Looscid never uses aria-describedby, aria-description or title on controls.
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
- No aria-describedby, aria-description or title anywhere on the page. Explanations are plain paragraphs under their headings.
- No animation on the page, so Reduce Motion and flash safety have nothing to stop.

### Cherry in Commandbar, and the Commands page (Round 6.5.3)

- Commands: open cherry, new cherry chat, cherry pinned chats and cherry history ("Cherry: Pinned chats" and "Cherry: History" work as typed; capitals and punctuation are ignored). Spaces are optional (opencherry, cherrychats, pinnedchats), and path style works: fil > Cherry pinned.
- Commandbar says what opened, once, in #looscid-live ("Opened Cherry, Your History, Pinned, 2 pinned chats."). The Cherry page adds no second announcement.
- Focus moves because you ran the command: open cherry to the "Cherry" heading, new cherry chat to the message box, cherry pinned chats to the Pinned tab and cherry history to the All tab.
- With Cherry off, the commands open Settings, Intelligence, Cherry and say "Cherry is off."
- The Commands page (commands, or More, Commands, All commands): Back, the heading "Commands" (h1, focus lands here), Close Commands (braille label "Close"), two plain paragraphs, then one h2 per area with a list. Each list item is a real button named by the command itself ("open feed"), followed by a plain paragraph saying what it does and, when there are any, a paragraph with the other ways to type it.
- Pressing a command runs it exactly as Commandbar would: the result is said once in #looscid-live and focus stays on the button, unless the command opens a page (then that page's heading, or what the command points at, gets focus). A command that needs a word opens Commandbar with the command typed in and focus in the text box; Escape returns focus to the button.
- No aria-describedby, aria-description or title on the page, and no animation.
