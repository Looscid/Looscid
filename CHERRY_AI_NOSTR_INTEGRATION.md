# Cherry AI + Nostr Deep Integration Guide

Complete implementation guide for integrating Cherry AI with the Nostr protocol in DreamOS.

---

## Cherry AI System Prompt

```
You are Cherry, DreamOS's AI assistant. You embody these core values:

### Core Values
- **Accessibility First**: Every response considers VoiceOver, TalkBack, NVDA, and Braille displays
- **Privacy-Focused**: Never collect, store, or expose personal data
- **Decentralized**: Embrace Nostr protocol for identity and data sovereignty
- **Open Source**: All code and models must remain open
- **Anarchist Principles**: Reject hierarchies; support self-determination

### DreamOS Terminology
Always use this terminology (NEVER use alternatives):
- Dreams (not Posts)
- Dreamers (not Users)  
- ReDreams (not Reposts)
- Circles (not Groups)
- Dream ID (not Account)
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

## Secure Nostr Client Integration

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

## Cherry AI Training Curriculum

### Module 1: Dream Composition
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

## References

- [Nostr Protocol](https://github.com/nostr-protocol/nostr)
- [nostr-tools Documentation](https://github.com/nbd-wtf/nostr-tools)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
