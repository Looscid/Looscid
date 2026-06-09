# DreamOS — Nostr Architecture

DreamOS is built on Nostr as its foundation.
Your nsec key IS your Dream ID.
Everything syncs across every device automatically.
No central server owns your data. Ever.

---

## How It Works

When you create a Dream ID you generate a Nostr keypair.
Your public key (npub) is your identity across all of DreamOS
and the entire Nostr network simultaneously.
Your private key (nsec) never leaves your device.

Jack Dorsey can log into DreamOS with his nsec key.
His follows, his content, his identity — all there instantly.
Anyone on Nostr can do the same.

---

## Nostr NIPs DreamOS Uses

### Identity and Login
- **NIP-01** — Core protocol. Events, signatures, keypairs.
  Your Dream ID is a NIP-01 keypair.
- **NIP-07** — Browser extension support.
  Alby and nos2x users sign in with one tap.
- **NIP-19** — npub and nsec encoding.
  Human readable key format.

### Dreams (Social Posts)
- **NIP-01 kind:1** — Short text notes. These are Dreams.
- **NIP-10** — Reply threading. Comments on Dreams.
- **NIP-18** — Reposts. These are ReDreams.
- **NIP-36** — Sensitive content tagging.
- **NIP-94** — File attachments. Images, audio, video in Dreams.

### Private Messages (Chats)
- **NIP-17** — Private direct messages with gift wrap encryption.
  True E2E encryption. Nobody can read your chats except you.
  This replaces the old NIP-04 which had weaknesses.
- **NIP-59** — Gift wrap. The encryption layer for NIP-17.

### Profiles
- **NIP-01 kind:0** — Profile metadata.
  Name, bio, picture, website, npub — all stored on Nostr relays.
  Your profile follows you everywhere.

### Follows and Social Graph
- **NIP-02 kind:3** — Contact lists. Who you follow.
  Your following list is on Nostr. Works across all clients.

### Circles (Groups)
- **NIP-29** — Relay-based groups. Moderated communities.
  This powers DreamOS Circles.

### Live Streaming
- **NIP-53 kind:30311** — Live activities.
  DreamOS live streams are Nostr live events.
  Anyone on Nostr can see when you go live.

### Audio Rooms (Calls and Nests)
- **Nostr Nests + NIP-53** — Decentralized audio rooms.
  Powered by MoQ (Media over QUIC) for real-time audio.
  DreamOS phone calls and audio rooms use this.
  kind:30312 for rooms, kind:1311 for live chat,
  kind:10312 for presence (who is in the room).

### Alerts and Notifications
- **NIP-27** — Mentions. @YourHandle in a Dream.
- **NIP-65 kind:10002** — Relay lists.
  DreamOS knows which relays to check for your alerts.

### Zaps (Future — Tipping Dreamors)
- **NIP-57** — Lightning zaps.
  Send sats to a Dreamor directly from DreamOS.
  No payment processor. No middleman.

### Cherry AI on Nostr
- **NIP-90** — Data Vending Machines.
  Cherry can interact with Nostr-native AI services.
  Future: Cherry requests AI tasks via Nostr events,
  gets results back the same way.

---

## DreamOS Relay List

DreamOS connects to these relays by default.
Dreamors can add their own.

- wss://relay.damus.io
- wss://relay.nostr.band
- wss://nos.lol
- wss://relay.snort.social
- wss://purplepag.es
- wss://relay.primal.net

---

## The Atab1pro as a Nostr Device

The physical Atab1pro device would be the first accessible
device where your nsec key IS the device identity.

- Boot the device = your Nostr key is loaded
- Every app that supports Nostr connects automatically
- Cherry uses your key for agent actions on your behalf
- Calls, messages, Dreams — all signed with your key
- No username. No password. No company owns your account.

---

## What Changes About DreamOS

Not much changes in how it feels. Everything changes underneath.

- Dreams are stored on Nostr relays, not our server
- Your profile lives on Nostr, not our database
- Your follows are your Nostr contacts
- Your chats are NIP-17 encrypted messages
- Your calls are Nostr Nests audio rooms
- Your live streams are NIP-53 live events

DreamOS becomes a Nostr client that looks and feels like
a full operating system. The best Nostr client ever built.
Accessible first. Open source. Free for life.

---

## Open Source Libraries We Use

All MIT licensed or public domain.

- **nostr-tools** (github.com/nbd-wtf/nostr-tools)
  Core Nostr client library. Events, signing, relay connections.

- **nostr-protocol/nostr** (github.com/nostr-protocol/nostr)
  The protocol specification itself. Reference for all NIPs.

- **Nostr Nests** (github.com/nostrnests/nests)
  Audio rooms. Powers DreamOS calls and live audio.
  MIT licensed. We integrate their MoQ audio transport.

- **awesome-nostr** (github.com/aljazceru/awesome-nostr)
  Reference list of Nostr libraries and tools.

---

## Credit

DreamOS is built on top of the work of the Nostr community.
We credit everyone whose code or protocol we use.
We contribute back where we can.
That is what open source means.

