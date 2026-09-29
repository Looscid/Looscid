# Nostr Feedback

A Looscid nsec identity receives feedback as a NIP-17 DM, not NIP-04. The worker replies as Looscid. The sender uses plain `/edit`, `/delete`, and `/publish` commands. A submitted entry stays private until its sender confirms `/publish`; that reply consents to their question entering the public feedback section.

The nsec is NEVER in the repository, in a document, or pasted into chat. It lives as a Worker secret environment variable; only `worker.js` holds it.

## Commands and events

Events are immutable. `/edit` publishes a replaceable kind 30078 event keyed by a `d` tag, reusing the same tag to overwrite the prior version. `/delete` publishes a NIP-09 kind 5 deletion request; relays may honor it, so deletion is a request, not a guarantee. `/publish` is explicit consent before broadcasting.

Accept command DMs only from the exact npub that submitted the entry. Rate-limit per npub and validate command syntax before acting.

## Open questions

Which relay set? Is the feedback section a replaceable event per author or a single aggregate list? What is the nsec rotation plan if it leaks?
