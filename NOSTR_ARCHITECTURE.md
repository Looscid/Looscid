# Nostr Architecture and Cherry AI Integration

Combined from `NOSTR_ARCHITECTURE.md` and `CHERRY_AI_NOSTR_INTEGRATION.md`. See [Nostr Feedback](docs/nostr-feedback.md).

## NOSTR_ARCHITECTURE.md

Looscid is built on Nostr as its foundation.
Your nsec key IS your Dream ID.
Everything syncs across every device automatically.
No central server owns your data. Ever.

---

### How It Works

When you create a Dream ID you generate a Nostr keypair.
Your public key (npub) is your identity across all of Looscid
and the entire Nostr network simultaneously.
Your private key (nsec) never leaves your device.

Jack Dorsey can log into Looscid with his nsec key.
His follows, his content, his identity — all there instantly.
Anyone on Nostr can do the same.

---

### What Works Today (Round 6.4)

Dreams on Nostr, with no server of ours:

- **Your key.** Settings, LooscidID, Keys and IDs, "Nostr key": use a signer (NIP-07), enter your nsec in a secure field, or create a new key. An optional passcode saves it locked as a **NIP-49** ncryptsec (scrypt plus XChaCha20-Poly1305). Without one it's saved unlocked under `dbm_nostr_sk` on this device. It's never in Settings backup.
- **Dreaming.** With Audience Everyone, a new Dream is a kind:1 note signed on your device, tagged `["client","Looscid"]` and `["t","looscid"]`, sent to your relays (default: relay.damus.io, nos.lol, relay.primal.net, relay.nostr.band; you can change the list). Relays that don't answer are retried. Audience "Only this device" never sends.
- **Reading back.** On start, Looscid asks your relays for your own kind:1 notes tagged `looscid`, checks each signature, and adds the ones it doesn't have yet. That's how your Dreams show on a new device.
- **Not yet:** a global feed, replies, ReDreams and profiles on Nostr, and deleting a Dream from relays (NIP-09).
- The code is `js/nostr.js`; the crypto is vendored in `js/vendor/` and loads only when you use Nostr.

---

### Nostr NIPs Looscid Uses

#### Identity and Login
- **NIP-01** — Core protocol. Events, signatures, keypairs.
  Your Dream ID is a NIP-01 keypair.
- **NIP-07** — Browser extension support.
  Alby and nos2x users sign in with one tap.
- **NIP-19** — npub and nsec encoding.
  Human readable key format.

#### Dreams (Social Posts)
- **NIP-01 kind:1** — Short text notes. These are Dreams.
- **NIP-10** — Reply threading. Comments on Dreams.
- **NIP-18** — Reposts. These are ReDreams.
- **NIP-36** — Sensitive content tagging.
- **NIP-94** — File attachments. Images, audio, video in Dreams.

#### Private Messages (Chats)
- **NIP-17** — Private direct messages with gift wrap encryption.
  True E2E encryption. Nobody can read your chats except you.
  This replaces the old NIP-04 which had weaknesses.
- **NIP-59** — Gift wrap. The encryption layer for NIP-17.

#### Profiles
- **NIP-01 kind:0** — Profile metadata.
  Name, bio, picture, website, npub — all stored on Nostr relays.
  Your profile follows you everywhere.

#### Follows and Social Graph
- **NIP-02 kind:3** — Contact lists. Who you follow.
  Your following list is on Nostr. Works across all clients.

#### Circles (Groups)
- **NIP-29** — Relay-based groups. Moderated communities.
  This powers Looscid Circles.

#### Live Streaming
- **NIP-53 kind:30311** — Live activities.
  Looscid live streams are Nostr live events.
  Anyone on Nostr can see when you go live.

#### Audio Rooms (Calls and Nests)
- **Nostr Nests + NIP-53** — Decentralized audio rooms.
  Powered by MoQ (Media over QUIC) for real-time audio.
  Looscid phone calls and audio rooms use this.
  kind:30312 for rooms, kind:1311 for live chat,
  kind:10312 for presence (who is in the room).

#### Alerts and Notifications
- **NIP-27** — Mentions. @YourHandle in a Dream.
- **NIP-65 kind:10002** — Relay lists.
  Looscid knows which relays to check for your alerts.

#### Zaps (Future — Tipping Dreamers)
- **NIP-57** — Lightning zaps.
  Send sats to a Dreamer directly from Looscid.
  No payment processor. No middleman.

#### Cherry AI on Nostr
- **NIP-90** — Data Vending Machines.
  Cherry can interact with Nostr-native AI services.
  Future: Cherry requests AI tasks via Nostr events,
  gets results back the same way.

---

### Looscid Relay List

Looscid connects to these relays by default.
Dreamers can add their own.

- wss://relay.damus.io
- wss://relay.nostr.band
- wss://nos.lol
- wss://relay.snort.social
- wss://purplepag.es
- wss://relay.primal.net

---

### The Atab1pro as a Nostr Device

The physical Atab1pro device would be the first accessible
device where your nsec key IS the device identity.

- Boot the device = your Nostr key is loaded
- Every app that supports Nostr connects automatically
- Cherry uses your key for agent actions on your behalf
- Calls, messages, Dreams — all signed with your key
- No username. No password. No company owns your account.

---

### What Changes About Looscid

Not much changes in how it feels. Everything changes underneath.

- Dreams are stored on Nostr relays, not our server
- Your profile lives on Nostr, not our database
- Your follows are your Nostr contacts
- Your chats are NIP-17 encrypted messages
- Your calls are Nostr Nests audio rooms
- Your live streams are NIP-53 live events

Looscid becomes a Nostr client that looks and feels like
a full operating system. The best Nostr client ever built.
Accessible first. Open source. Free for life.

---

### Open Source Libraries We Use

All MIT licensed or public domain.

- **nostr-tools** (github.com/nbd-wtf/nostr-tools)
  Core Nostr client library. Events, signing, relay connections.

- **nostr-protocol/nostr** (github.com/nostr-protocol/nostr)
  The protocol specification itself. Reference for all NIPs.

- **Nostr Nests** (github.com/nostrnests/nests)
  Audio rooms. Powers Looscid calls and live audio.
  MIT licensed. We integrate their MoQ audio transport.

- **awesome-nostr** (github.com/aljazceru/awesome-nostr)
  Reference list of Nostr libraries and tools.

---

### Credit

Looscid is built on top of the work of the Nostr community.
We credit everyone whose code or protocol we use.
We contribute back where we can.
That is what open source means.


## CHERRY_AI_NOSTR_INTEGRATION.md

Complete implementation guide for integrating Cherry AI with the Nostr protocol in Looscid.

---

### Cherry AI System Prompt

```
You are Cherry, Looscid's AI assistant. You embody these core values:

### Core Values
- **Accessibility First**: Every response considers VoiceOver, TalkBack, NVDA, and Braille displays
- **Privacy-Focused**: Never collect, store, or expose personal data
- **Decentralized**: Embrace Nostr protocol for identity and data sovereignty
- **Open Source**: All code and models must remain open
- **Anarchist Principles**: Reject hierarchies; support self-determination

### Looscid Terminology
Always use this terminology (NEVER use alternatives):
- Dreams (not Posts)
- Dreamers (not Users)  
- ReDreams (not Reposts)
- Circles (not Groups)
- LooscidID (not Account)
- Feed (not Home)
- Alerts (not Notifications)
- Login (not Sign In)

### Nostr Protocol Knowledge
You understand Nostr fundamentally:
- Events are JSON objects signed with private keys
- Relays store and distribute events
- No central authority controls the network
- User identity is their public key (npub)
- Content is censorship-resistant by design

### Cherry's Capabilities
1. **Dream Composition**: Help Dreamers write Dreams with accessibility in mind
2. **Relay Recommendations**: Suggest optimal relays based on geography/reliability
3. **Community Moderation**: Suggest Circle guidelines and content policies
4. **Accessibility Verification**: Ensure Dreams work with assistive technology
5. **Privacy Analysis**: Verify Dreams don't leak personal information
6. **Nostr Protocol Guidance**: Explain NIPs and relay specifications

### Cherry's Boundaries
- Never suggest centralized platforms
- Never recommend closed-source tools
- Never encourage surveillance
- Never violate user privacy
- Never suggest removing accessibility features

### Example Interactions

**User**: "Help me post a Dream about privacy"
**Cherry**: "Great! Let's make a Dream that's private-focused AND accessible. 
- Avoid using images without alt text
- Use clear headings with markdown (#)
- Keep sentences under 25 words for screen reader clarity
- Consider: Do you want this visible to all relays or specific ones?
- Your Dream will be published to Nostr - permanently public"

**User**: "What's a good relay?"
**Cherry**: "It depends on your needs:
- **Wss://relay.nostr.band** - Well-maintained, good uptime
- **Wss://nos.lol** - Community-focused, responsive
- For privacy: Run your own relay
- Always use WSS (encrypted), never WS"
```

---

### Secure Nostr Client Integration

```javascript
import * as nostrTools from 'nostr-tools';
import { SimplePool } from 'nostr-tools/pool';

class SecureNostrClient {
  constructor() {
    this.pool = new SimplePool();
    this.relays = new Set();
    this.eventCache = new Map();
    this.validators = new NostrEventValidator();
  }

  /**
   * Initialize relays (only WSS - encrypted WebSocket)
   */
  async initializeRelays(relayUrls) {
    for (const url of relayUrls) {
      try {
        const validated = this.validateRelayUrl(url);
        if (validated) {
          this.relays.add(validated);
          console.log('Relay connected:', validated);
        }
      } catch (error) {
        console.error('Failed to connect relay:', url, error);
      }
    }
  }

  validateRelayUrl(url) {
    try {
      const parsed = new URL(url);
      
      // Only WSS (encrypted)
      if (parsed.protocol !== 'wss:') {
        throw new Error('Relays must use WSS (wss://) for encryption');
      }
      
      // Valid hostname
      if (!parsed.hostname.includes('.')) {
        throw new Error('Invalid relay hostname');
      }
      
      return url;
    } catch (error) {
      throw new Error(`Invalid relay URL: ${error.message}`);
    }
  }

  /**
   * Publish a Dream (Nostr event kind 1)
   */
  async publishDream(content, tags = [], privkey) {
    try {
      // Validate content
      if (content.length > 300000) {
        throw new Error('Dream exceeds maximum size (300KB)');
      }

      if (!content.trim()) {
        throw new Error('Dream cannot be empty');
      }

      // Create event
      const event = {
        content,
        kind: 1, // Text note
        tags,
        created_at: Math.floor(Date.now() / 1000)
      };

      // Sign
      const signedEvent = nostrTools.finalizeEvent(event, privkey);

      // Validate signature
      if (!nostrTools.verifyEvent(signedEvent)) {
        throw new Error('Signature verification failed');
      }

      // Publish to relays
      const results = await this.pool.publish(
        Array.from(this.relays),
        signedEvent
      );

      return {
        success: true,
        eventId: signedEvent.id,
        publishedTo: results
      };
    } catch (error) {
      console.error('Failed to publish Dream:', error);
      throw error;
    }
  }

  /**
   * Create a Circle (Nostr event kind 34550)
   */
  async createCircle(name, description, privkey) {
    const event = {
      kind: 34550, // Relay metadata
      content: JSON.stringify({
        name,
        description,
        picture: '',
        banner: ''
      }),
      tags: [
        ['d', name.toLowerCase().replace(/\s+/g, '-')]
      ],
      created_at: Math.floor(Date.now() / 1000)
    };

    const signedEvent = nostrTools.finalizeEvent(event, privkey);
    
    return this.pool.publish(Array.from(this.relays), signedEvent);
  }

  /**
   * Subscribe to Feed (Dreamer public key)
   */
  subscribeToDreamer(pubkey, onDream) {
    const filter = {
      authors: [pubkey],
      kinds: [1],
      limit: 100
    };

    const sub = this.pool.sub(Array.from(this.relays), [filter]);
    
    sub.on('event', (event) => {
      if (this.validators.validate(event).valid) {
        onDream(event);
      }
    });

    return sub;
  }

  /**
   * Fetch Dreams from Feed with accessibility metadata
   */
  async fetchAccessibleFeed(filters = {}) {
    const defaultFilters = {
      kinds: [1],
      limit: 50,
      ...filters
    };

    const events = await this.pool.querySync(
      Array.from(this.relays),
      [defaultFilters]
    );

    return events
      .filter(e => this.validators.validate(e).valid)
      .map(event => this.enrichEventWithAccessibility(event));
  }

  enrichEventWithAccessibility(event) {
    return {
      ...event,
      accessibility: {
        hasAltText: event.tags.some(tag => tag[0] === 'alt'),
        hasHeadings: /#/.test(event.content),
        avgSentenceLength: this.calculateAvgSentenceLength(event.content),
        recommendations: this.generateAccessibilityRecommendations(event)
      }
    };
  }

  calculateAvgSentenceLength(content) {
    const sentences = content.match(/[.!?]+/g) || [];
    const words = content.split(/\s+/).length;
    return sentences.length > 0 ? Math.round(words / sentences.length) : words;
  }

  generateAccessibilityRecommendations(event) {
    const recommendations = [];
    
    if (!event.tags.some(tag => tag[0] === 'alt')) {
      recommendations.push('Add alt text for images');
    }
    
    const avgLength = this.calculateAvgSentenceLength(event.content);
    if (avgLength > 25) {
      recommendations.push('Consider shorter sentences for screen readers');
    }
    
    if (!/#/.test(event.content)) {
      recommendations.push('Add headings with # for structure');
    }

    return recommendations;
  }
}

// Nostr Event Validator
class NostrEventValidator {
  validate(event) {
    const errors = [];

    if (!event.id || typeof event.id !== 'string') {
      errors.push('Invalid event ID');
    }

    if (typeof event.pubkey !== 'string' || !/^[0-9a-f]{64}$/i.test(event.pubkey)) {
      errors.push('Invalid public key');
    }

    if (typeof event.created_at !== 'number') {
      errors.push('Invalid timestamp');
    }

    // Check timestamp sanity
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - event.created_at) > 300) { // 5 minute window
      errors.push('Event timestamp suspicious');
    }

    if (typeof event.content !== 'string') {
      errors.push('Invalid content');
    }

    if (!nostrTools.verifyEvent(event)) {
      errors.push('Invalid signature');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export { SecureNostrClient, NostrEventValidator };
```

---

### Cherry AI Training Curriculum

#### Module 1: Dream Composition
```javascript
const cherryPrompts = {
  dreamComposition: `
    Help the Dreamer write an accessible Dream:
    1. Check: Do they have alt text for images?
    2. Suggest: Break into paragraphs with headings
    3. Warn: Don't leak personal information to Nostr
    4. Recommend: Use simple, clear language
    5. Verify: Test with screen reader simulation
  `,
  
  relaySelection: `
    When asked about relays:
    1. Always recommend WSS (encrypted) only
    2. Suggest geographic distribution
    3. Explain relay trade-offs
    4. Never suggest centralized services
    5. Recommend running personal relay
  `,
  
  circleModeration: `
    When creating Circle guidelines:
    1. Respect Dreamer autonomy
    2. Suggest inclusive policies
    3. Include accessibility requirements
    4. Never recommend censorship tools
    5. Focus on community safety
  `
};
```

---

### References

- [Nostr Protocol](https://github.com/nostr-protocol/nostr)
- [nostr-tools Documentation](https://github.com/nbd-wtf/nostr-tools)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
