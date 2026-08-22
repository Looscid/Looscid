# Looscid Accessibility Guide

Comprehensive accessibility documentation for Looscid covering web and iOS platforms.

---

## Table of Contents
- Web Accessibility
- iOS Accessibility
- VoiceOver Implementation
- Button Naming & Numbering
- Best Practices

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
    <button class="menu-item" role="menuitem" data-action="edit">✏️ Edit</button>
    <button class="menu-item" role="menuitem" data-action="share">📤 Share</button>
    <button class="menu-item" role="menuitem" data-action="delete">🗑️ Delete</button>
  </div>
</div>
```

### ARIA Attributes Reference

- `aria-haspopup="menu"` — Indicates the button triggers a menu
- `aria-expanded="false"` — Announces menu state (open/closed)
- `aria-controls="menu-list"` — Links button to controlled element
- `aria-label="More options"` — Descriptive label for screen readers
- `role="menu"` — Semantic role for popup container
- `aria-labelledby="more-button"` — Links menu to trigger button

**Looscid pattern:** Use a trailing comma in aria-labels for VoiceOver pause (e.g. `aria-label="Save Dream,"`).

---

## iOS Accessibility

### VoiceOver Support

```swift
button.accessibilityLabel = "More options"
button.accessibilityHint = "Double tap to open menu"
button.accessibilityIdentifier = "moreButton"
```

### VoiceOver Pitch

- Default pitch: `1.0`
- Higher pitch (`1.5 - 2.0`): Important alerts
- Lower pitch (`0.5 - 0.8`): Errors, warnings

---

## Button Naming & Numbering

1. **Be Descriptive**: "Save Draft" not "OK"
2. **Include Context**: "Delete Dream" not "Delete"
3. **Show Progress**: "Continue (2 of 5)" for multi-step flows
4. **Avoid Redundancy**: Don't say "Save Button" on a button

---

## Screen Reader Testing Checklist

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

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple VoiceOver Documentation](https://www.apple.com/accessibility/voiceover/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

See also: `ACCESSIBILITY_MENU_BUTTON.md` for the full menu popup implementation guide.
