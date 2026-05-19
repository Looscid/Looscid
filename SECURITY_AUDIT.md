# DreamOS Security Audit & Implementation Guide

Comprehensive security review and implementation checklist for DreamOS.

---

## 🔒 Security Assessment

### Current Status: ✅ STRONG FOUNDATION

The codebase demonstrates excellent security practices. Below are recommendations for enhancement.

---

## Web-Based Security

### 1. Content Security Policy (CSP)

```html
<!-- index.html -->
<meta 
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://relay.nostr.* wss://relay.nostr.*;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
    object-src 'none';
  "
>
```

### 2. Input Validation & Sanitization

```javascript
/**
 * Sanitize user input for menu items and content
 * Prevents XSS attacks
 */

const SecurityUtils = {
  // HTML entity encoding
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  },

  // Validate and sanitize Nostr event content
  sanitizeNostrContent(content) {
    // Remove script tags and dangerous attributes
    const div = document.createElement('div');
    div.textContent = content; // Use textContent, not innerHTML
    
    // Additional validation
    if (content.length > 300000) {
      throw new Error('Content exceeds maximum size');
    }
    
    return div.innerHTML;
  },

  // Validate Nostr public key (npub)
  validateNostrPublicKey(pubkey) {
    // Nostr public keys are 64 hex characters
    return /^[0-9a-f]{64}$/i.test(pubkey);
  },

  // Validate Nostr event signature
  validateEventSignature(event, signature) {
    // Use nostr-tools for verification
    return nostrTools.verifySignature(event, signature);
  },

  // Sanitize URLs to prevent javascript: attacks
  sanitizeUrl(url) {
    try {
      const parsed = new URL(url);
      // Only allow http, https, and nostr protocols
      if (!['http:', 'https:', 'nostr:'].includes(parsed.protocol)) {
        return null;
      }
      return url;
    } catch {
      return null;
    }
  }
};

// Usage in menu button
class SecureMenuButton extends MenuButton {
  onItemSelect(item) {
    const action = item.getAttribute('data-action');
    
    // Validate action
    const allowedActions = ['edit', 'delete', 'report'];
    if (!allowedActions.includes(action)) {
      console.error('Invalid action:', action);
      return;
    }

    this.button.dispatchEvent(
      new CustomEvent('menu-action', {
        detail: { 
          action,
          timestamp: Date.now(),
          token: this.getCsrfToken()
        }
      })
    );

    this.close();
  }

  getCsrfToken() {
    // Implement CSRF token retrieval
    return document.querySelector('meta[name="csrf-token"]').content;
  }
}
```

### 3. CSRF Protection

```html
<!-- Every form should include CSRF token -->
<form method="POST" action="/api/menu-action">
  <input 
    type="hidden" 
    name="csrf_token" 
    value="<%= csrfToken %>"
  >
  <!-- Form fields -->
</form>
```

```javascript
// Add CSRF token to all API requests
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/dream/edit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ /* data */ })
});
```

### 4. Rate Limiting

```javascript
/**
 * Client-side rate limiting for menu actions
 * Server-side enforcement is mandatory
 */

class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  isAllowed() {
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    );

    if (this.requests.length >= this.maxRequests) {
      console.warn('Rate limit exceeded');
      return false;
    }

    this.requests.push(now);
    return true;
  }
}

const menuActionLimiter = new RateLimiter(10, 60000); // 10 actions per minute

// In menu button handler
onItemSelect(item) {
  if (!menuActionLimiter.isAllowed()) {
    this.announceToScreenReader('Too many requests. Please wait.');
    return;
  }
  
  // Process action...
}
```

### 5. Dependency Security

```json
{
  "devDependencies": {
    "snyk": "^1.1259.0",
    "npm-audit-resolver": "^3.0.0"
  },
  "scripts": {
    "security:check": "npm audit && snyk test",
    "security:fix": "npm audit fix && snyk fix"
  }
}
```

---

## Nostr Protocol Security

### 1. Secure Relay Connection

```javascript
/**
 * Secure Nostr relay connection with validation
 */

import * as nostrTools from 'nostr-tools';

class SecureNostrClient {
  constructor(relayUrls = []) {
    this.relayUrls = relayUrls.map(url => this.validateRelayUrl(url));
    this.pool = new nostrTools.SimplePool();
  }

  validateRelayUrl(url) {
    try {
      const parsed = new URL(url);
      
      // Only allow WSS (encrypted WebSocket)
      if (parsed.protocol !== 'wss:') {
        throw new Error('Relays must use WSS protocol');
      }

      // Validate hostname
      if (!parsed.hostname.includes('.')) {
        throw new Error('Invalid relay hostname');
      }

      return url;
    } catch (error) {
      console.error('Invalid relay URL:', url, error);
      return null;
    }
  }

  async publishEvent(content, kind = 1) {
    try {
      // Get user's private key (from secure storage)
      const privkey = await this.getPrivateKey();
      
      if (!privkey) {
        throw new Error('Private key not available');
      }

      // Create event
      const event = {
        content,
        kind,
        tags: [],
        created_at: Math.floor(Date.now() / 1000)
      };

      // Sign event
      const signedEvent = nostrTools.finalizeEvent(event, privkey);

      // Validate signature
      if (!nostrTools.verifyEvent(signedEvent)) {
        throw new Error('Event signature verification failed');
      }

      // Publish to relays
      return await this.pool.publish(
        this.relayUrls.filter(url => url !== null),
        signedEvent
      );
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  async getPrivateKey() {
    // Implement secure retrieval from localStorage or wallet
    // NEVER log or expose private keys
    // Consider using IndexedDB with encryption
    try {
      const encrypted = localStorage.getItem('nostr_privkey_encrypted');
      if (!encrypted) return null;
      
      // Decrypt using WebCrypto API
      return await this.decryptPrivateKey(encrypted);
    } catch (error) {
      console.error('Error retrieving private key');
      return null;
    }
  }

  async decryptPrivateKey(encrypted) {
    // Use WebCrypto API for encryption/decryption
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(16),
        iterations: 100000,
        hash: 'SHA-256'
      },
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(this.userPassword),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      ),
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt...
    return decrypted;
  }
}
```

### 2. Event Validation

```javascript
/**
 * Comprehensive Nostr event validation
 */

class NostrEventValidator {
  static validate(event) {
    const errors = [];

    // Check required fields
    if (!event.id || typeof event.id !== 'string') {
      errors.push('Invalid or missing event ID');
    }

    if (typeof event.pubkey !== 'string' || !/^[0-9a-f]{64}$/i.test(event.pubkey)) {
      errors.push('Invalid public key');
    }

    if (typeof event.created_at !== 'number') {
      errors.push('Invalid created_at timestamp');
    }

    if (typeof event.kind !== 'number') {
      errors.push('Invalid event kind');
    }

    if (!Array.isArray(event.tags)) {
      errors.push('Invalid tags');
    }

    if (typeof event.content !== 'string') {
      errors.push('Invalid content');
    }

    // Check timestamp is not too far in future/past
    const now = Math.floor(Date.now() / 1000);
    const maxClockSkew = 300; // 5 minutes
    
    if (Math.abs(now - event.created_at) > maxClockSkew) {
      errors.push('Event timestamp too far from current time');
    }

    // Check content size
    if (event.content.length > 300000) {
      errors.push('Event content exceeds maximum size');
    }

    // Validate signature
    if (!nostrTools.verifyEvent(event)) {
      errors.push('Invalid signature');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

---

## iOS Security

### 1. Keychain Storage for Credentials

```swift
import Security
import Foundation

class SecureKeychainManager {
  static let shared = SecureKeychainManager()
  
  enum KeychainError: Error {
    case itemNotFound
    case conversionError
    case unexpectedStatus(OSStatus)
  }
  
  // Store private key securely
  func storePrivateKey(_ privateKey: String, account: String) throws {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: account,
      kSecAttrService as String: "com.dreamos.nostr",
      kSecValueData as String: privateKey.data(using: .utf8)!,
      kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    ]
    
    let status = SecItemAdd(query as CFDictionary, nil)
    
    guard status == errSecSuccess else {
      throw KeychainError.unexpectedStatus(status)
    }
  }
  
  // Retrieve private key
  func retrievePrivateKey(account: String) throws -> String {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: account,
      kSecAttrService as String: "com.dreamos.nostr",
      kSecReturnData as String: true
    ]
    
    var result: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    
    guard status == errSecSuccess else {
      throw KeychainError.itemNotFound
    }
    
    guard let data = result as? Data,
          let privateKey = String(data: data, encoding: .utf8) else {
      throw KeychainError.conversionError
    }
    
    return privateKey
  }
  
  // Delete private key
  func deletePrivateKey(account: String) throws {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: account,
      kSecAttrService as String: "com.dreamos.nostr"
    ]
    
    let status = SecItemDelete(query as CFDictionary)
    
    guard status == errSecSuccess || status == errSecItemNotFound else {
      throw KeychainError.unexpectedStatus(status)
    }
  }
}
```

### 2. Certificate Pinning for API Calls

```swift
import Foundation
import CryptoKit

class CertificatePinningDelegate: NSObject, URLSessionDelegate {
  let pinnedCertificates: [SecCertificate]
  
  init(certificatePath: String) throws {
    guard let certificateData = try? Data(contentsOf: URL(fileURLWithPath: certificatePath)) else {
      fatalError("Certificate file not found")
    }
    
    guard let certificate = SecCertificateCreateWithData(
      nil,
      certificateData as CFData
    ) else {
      fatalError("Invalid certificate format")
    }
    
    self.pinnedCertificates = [certificate]
  }
  
  func urlSession(
    _ session: URLSession,
    didReceive challenge: URLAuthenticationChallenge,
    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
  ) {
    guard let serverTrust = challenge.protectionSpace.serverTrust else {
      completionHandler(.cancelAuthenticationChallenge, nil)
      return
    }
    
    // Verify certificate is in pinned list
    let policyCount = SecTrustGetCertificateCount(serverTrust)
    
    for i in 0..<policyCount {
      if let certificate = SecTrustGetCertificateAtIndex(serverTrust, i) {
        if pinnedCertificates.contains(certificate) {
          completionHandler(.useCredential, URLCredential(trust: serverTrust))
          return
        }
      }
    }
    
    completionHandler(.cancelAuthenticationChallenge, nil)
  }
}
```

---

## Cherry AI Security

### 1. Secure Prompt Injection Prevention

```javascript
/**
 * Prevent prompt injection attacks in Cherry AI
 */

class CherrySecurityLayer {
  constructor() {
    this.systemPromptHashWhitelist = new Set();
  }

  validateAIPrompt(userInput) {
    // Detect common injection patterns
    const injectionPatterns = [
      /ignore.*previous.*instruction/i,
      /disregard.*system.*prompt/i,
      /forget.*everything.*about/i,
      /you.*are.*now/i,
      /act.*as.*if/i,
      /pretend.*to.*be/i
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(userInput)) {
        return {
          valid: false,
          reason: 'Potential prompt injection detected'
        };
      }
    }

    // Check for suspiciously long inputs
    if (userInput.length > 50000) {
      return {
        valid: false,
        reason: 'Input exceeds safe length'
      };
    }

    return { valid: true };
  }

  // Sanitize Cherry AI responses
  sanitizeAIResponse(response) {
    // Ensure response doesn't contain executable code
    const dangerousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /onerror=/gi,
      /onclick=/gi
    ];

    let sanitized = response;
    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    return sanitized;
  }

  // Audit AI actions
  auditAIAction(action, context) {
    const record = {
      action,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      model: 'cherry',
      hash: this.hashAction(action)
    };

    // Send to audit log (encrypted)
    this.logAudit(record);
  }

  hashAction(action) {
    // Use subtle crypto for hashing
    return crypto.subtle.digest('SHA-256', 
      new TextEncoder().encode(JSON.stringify(action))
    );
  }
}
```

### 2. Rate Limiting for AI Requests

```javascript
class CherryRateLimiter {
  constructor() {
    this.limits = new Map();
    this.maxRequests = 100;
    this.windowMs = 3600000; // 1 hour
  }

  isAllowed(userId) {
    const now = Date.now();
    const userRecord = this.limits.get(userId) || {
      requests: [],
      lastReset: now
    };

    // Reset if window expired
    if (now - userRecord.lastReset > this.windowMs) {
      userRecord.requests = [];
      userRecord.lastReset = now;
    }

    // Check limit
    if (userRecord.requests.length >= this.maxRequests) {
      return false;
    }

    userRecord.requests.push(now);
    this.limits.set(userId, userRecord);

    return true;
  }
}
```

---

## Security Checklist

- [ ] CSP headers configured
- [ ] CSRF tokens implemented
- [ ] Input sanitization in place
- [ ] Rate limiting enabled
- [ ] Nostr signatures verified
- [ ] Private keys encrypted
- [ ] HTTPS/WSS enforced
- [ ] Dependency audits passing
- [ ] XSS prevention tested
- [ ] SQL injection protections active
- [ ] AI prompt injection prevention
- [ ] Audit logging enabled
- [ ] Certificate pinning (mobile)
- [ ] Keychain integration (iOS)
- [ ] Security headers configured
- [ ] Penetration testing completed

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Nostr Security Considerations](https://github.com/nostr-protocol/nostr)
- [Apple Security Documentation](https://developer.apple.com/security/)
- [Web Security Academy](https://portswigger.net/web-security)
