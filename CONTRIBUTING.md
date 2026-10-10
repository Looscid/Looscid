# Contributing to Looscid

Welcome, and thank you for being here. Looscid is an open source project built with care, and we're glad you want to be part of it. Before you get started, take a few minutes to read this document. It'll help you understand what we're building and how we build it together.

---

## Language and terminology

We have our own language here. Please read TERMINOLOGY.md before anything else. Dreams, Redreams, Replies, Circles and Dreamors are the words of this platform and they belong everywhere — in code, in comments, in UI text and in documentation. It's a small thing that means a lot to us.

---

## Accessibility

Looscid was built by a blind Dreamor. Accessibility isn't something we added — it's something we started with. We ask every contributor to keep that spirit alive.

That means meaningful ARIA labels on interactive elements, logical heading structure, touch targets that are easy to reach and color never being the only way something communicates meaning.

We know not everyone has access to a screen reader for testing. If that's you, do your best and flag it in your pull request. We'd rather you contribute and be honest about what you couldn't test than not contribute at all. We'll work through it together.

---

## Code

Keep it clean and readable. Comment your reasoning. If something might confuse someone coming to the code fresh, a short explanation goes a long way.

---

## Documentation conventions

When two or more docs cover the same subject, bring them into one file. Keep each original source filename as a real Markdown heading (`##` or `###`) so its anchor works, not as bold text. Put a short line saying what was combined right below the top heading. Docs that only look alike but cover different subjects should stay separate.

While merging, fix verified stale terms: Gabriel to Cherry, Dream Board and Dream Board Mobile to Looscid, Local to Nearby, and inline DiscoverPage to discover.js. Never edit quoted copy, sample strings or legal terms. Use relative links, never absolute GitHub blob URLs. Preserve accessibility-relevant copy and attributes exactly, including `role`, `tabindex`, focus handlers and `aria-*`.

Never merge legal text. If `license.txt` and `LICENSE` differ in substance, keep them separate and let Alhasan decide.

---

## The spirit of this project

Looscid exists to prove something. We hope you feel that when you build with us.
