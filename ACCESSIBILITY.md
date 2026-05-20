# DreamOS Accessibility Guide

Comprehensive accessibility documentation for DreamOS covering web and iOS platforms.

---

## Table of Contents
- [Web Accessibility](#web-accessibility)
- [iOS Accessibility](#ios-accessibility)
- [VoiceOver Implementation](#voiceover-implementation)
- [Button Naming & Numbering](#button-naming--numbering)
- [Best Practices](#best-practices)

---

## Web Accessibility

### HTML Structure for Accessible Menu Popups

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

### ARIA Attributes Reference

- `aria-haspopup="menu"` - Indicates the button triggers a menu
- `aria-expanded="false"` - Announces menu state (open/closed)
- `aria-controls="menu-list"` - Links button to controlled element
- `aria-label="More options"` - Descriptive label for screen readers
- `role="menu"` - Semantic role for popup container
- `aria-labelledby="more-button"` - Links menu to trigger button

---

## iOS Accessibility

### VoiceOver Support

VoiceOver is Apple's screen reader for iOS. Ensure all interactive elements are properly labeled:

```swift
// Swift Implementation
button.accessibilityLabel = "More options"
button.accessibilityHint = "Double tap to open menu"
button.accessibilityIdentifier = "moreButton"
```

### VoiceOver Pitch Change

VoiceOver can adjust speech pitch for different types of content:

```swift
// Adjust VoiceOver pitch for important alerts
UIAccessibility.post(notification: .announcement, 
                     argument: "Important alert")

// Use AVSpeechSynthesizer for custom pitch
let synth = AVSpeechSynthesizer()
let utterance = AVSpeechUtterance(string: "Custom message")
utterance.pitchMultiplier = 1.5 // Higher pitch (0.5 - 2.0)
utterance.rate = AVSpeechUtteranceDefaultSpeechRate
synth.speak(utterance)
```

**Pitch Adjustment Tips:**
- Default pitch: `1.0`
- Higher pitch (`1.5 - 2.0`): Important alerts, notifications
- Lower pitch (`0.5 - 0.8`): Errors, warnings
- Keep within `0.5 - 2.0` range for natural speech

---

## Button Naming & Numbering

### Web Implementation

Button numbering for multi-step processes:

```html
<!-- Step indicator pattern: "1 of 3" -->
<button aria-label="Previous step, 1 of 3">
  ← Back
</button>

<span aria-live="polite" aria-atomic="true">
  Step 1 of 3: Personal Information
</span>

<button aria-label="Next step, 2 of 3">
  Next →
</button>
```

### iOS Implementation

```swift
// Display button progress for accessibility
let progressLabel = "Button 1 of 3"
button.accessibilityLabel = "Continue"
button.accessibilityHint = progressLabel

// Page-based numbering
pageControl.accessibilityLabel = "Page \(current) of \(total)"
```

### Best Practices for Button Naming

1. **Be Descriptive**: Use action verbs
   - ✅ "Save Draft"
   - ❌ "OK"

2. **Include Context**: Add purpose when needed
   - ✅ "Delete Comment"
   - ❌ "Delete"

3. **Show Progress**: For multi-step flows
   - ✅ "Continue (2 of 5)"
   - ❌ "Continue"

4. **Avoid Redundancy**: Don't repeat role
   - ✅ `<button>Save</button>`
   - ❌ `<button>Save Button</button>`

---

## Semantic HTML

Always use semantic elements for better accessibility:

```html
<!-- Use semantic elements -->
<nav role="navigation">
  <button>Menu</button>
</nav>

<main role="main">
  <!-- Primary content -->
</main>

<aside role="complementary">
  <!-- Sidebar content -->
</aside>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

---

## Color Contrast

Ensure sufficient contrast for readability:

- **Large text**: Minimum 3:1 ratio
- **Normal text**: Minimum 4.5:1 ratio
- **UI components**: Minimum 3:1 ratio

**Testing**: Use WebAIM Contrast Checker or axe DevTools

---

## Keyboard Navigation

Implement full keyboard support:

```javascript
// Example: Menu keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenu();
  }
  if (e.key === 'ArrowDown') {
    focusNextMenuItem();
  }
  if (e.key === 'ArrowUp') {
    focusPreviousMenuItem();
  }
  if (e.key === 'Enter') {
    selectMenuItem();
  }
});
```

---

## Screen Reader Testing

### Testing Checklist

- [ ] All images have descriptive alt text
- [ ] Form fields have associated labels
- [ ] Links describe their purpose
- [ ] Buttons have accessible names
- [ ] Error messages are announced
- [ ] Live regions use `aria-live`
- [ ] Focus is managed properly
- [ ] Color is not the only indicator

### Tools

- **VoiceOver** (macOS/iOS)
- **NVDA** (Windows)
- **JAWS** (Windows)
- **axe DevTools** (Browser extension)
- **WAVE** (Browser extension)

---

## Focus Management

Always provide visible focus indicators:

```css
/* Ensure focus is visible */
button:focus,
a:focus,
input:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

/* Never remove focus outline without replacement */
*:focus {
  outline: 2px solid #4A90E2;
}
```

---

## Responsive Text

Ensure text is readable at all sizes:

```css
/* Use relative units */
body {
  font-size: 16px; /* 1rem */
  line-height: 1.5;
}

h1 {
  font-size: 2rem;
}

/* Support zoom up to 200% */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple VoiceOver Documentation](https://www.apple.com/accessibility/voiceover/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)

---

## Last Updated

This document is automatically updated when accessibility issues are detected or new standards are implemented.
