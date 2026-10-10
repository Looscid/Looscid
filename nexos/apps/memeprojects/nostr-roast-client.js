/**
 * Lightweight, dependency-free Nostr roast client.
 *
 * Lease protocol (application-level):
 *   Kind 20000: lease heartbeat/grant, tags: ["d", leaseId], ["exp", unixSeconds]
 *   Kind 1: roast, tags: ["d", leaseId], optional ["exp", unixSeconds]
 *   Kind 20000 or 1 with ["revoke", leaseId] revokes a lease.
 *
 * Signature verification is deliberately injected: pass verifyEvent from nostr-tools
 * (or another NIP-01 implementation) for production use. Unverified events are ignored
 * when verification is enabled. No framework, bundler, or dependency is required.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.NostrRoast = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var LEASE_KIND = 20000;
  var ROAST_KIND = 1;
  var DEFAULT_RELAYS = ["wss://relay.damus.io", "wss://nos.lol"];
  var DEFAULT_CACHE_KEY = "nostr-roasts-v1";

  function tag(event, name) {
    var found = (event.tags || []).find(function (item) { return item[0] === name; });
    return found && found[1];
  }

  function numericTag(event, name) {
    var value = Number(tag(event, name));
    return Number.isFinite(value) ? value : null;
  }

  function validEvent(event) {
    return event && typeof event.id === "string" && typeof event.pubkey === "string" &&
      Array.isArray(event.tags) && typeof event.content === "string" && Number.isFinite(event.created_at);
  }

  function safeRead(key, storage) {
    try { return JSON.parse(storage.getItem(key) || "null"); } catch (_) { return null; }
  }

  function safeWrite(key, value, storage) {
    try { storage.setItem(key, JSON.stringify(value)); } catch (_) { /* private mode/quota */ }
  }

  function RoastClient(options) {
    options = options || {};
    this.relays = (options.relays || DEFAULT_RELAYS).filter(Boolean);
    this.leaseId = options.leaseId || "default";
    this.pubkey = options.pubkey || null;
    this.verifyEvent = options.verifyEvent || null;
    this.cacheKey = options.cacheKey || DEFAULT_CACHE_KEY;
    this.storage = options.storage || (typeof localStorage !== "undefined" ? localStorage : null);
    this.heartbeatGraceMs = options.heartbeatGraceMs || 15000;
    this.onRoast = options.onRoast || function () {};
    this.onStatus = options.onStatus || function () {};
    this.sockets = [];
    this.roasts = [];
    this.lease = { expiresAt: 0, revoked: false };
    this.closed = false;
  }

  RoastClient.prototype._accepted = async function (event) {
    if (!validEvent(event)) return false;
    if (this.verifyEvent) {
      try { if (!(await this.verifyEvent(event))) return false; } catch (_) { return false; }
    }
    return !this.pubkey || event.pubkey === this.pubkey;
  };

  RoastClient.prototype._isCurrent = function (event) {
    var id = tag(event, "d");
    return id === this.leaseId || (!id && this.leaseId === "default");
  };

  RoastClient.prototype._handle = async function (event) {
    if (!(await this._accepted(event)) || !this._isCurrent(event)) return;
    var revoked = tag(event, "revoke");
    if (revoked === this.leaseId) {
      this.lease.revoked = true;
      this.lease.expiresAt = 0;
      this.onStatus("revoked");
      return;
    }
    var expiry = numericTag(event, "exp");
    if (event.kind === LEASE_KIND) {
      this.lease.revoked = false;
      if (expiry) this.lease.expiresAt = expiry * 1000;
      else this.lease.expiresAt = Date.now() + this.heartbeatGraceMs;
      this.onStatus("live");
      return;
    }
    if (event.kind === ROAST_KIND && !this.lease.revoked &&
        (!expiry || expiry * 1000 > Date.now())) {
      var roast = { id: event.id, text: event.content, createdAt: event.created_at * 1000, event: event };
      this.roasts = [roast].concat(this.roasts.filter(function (item) { return item.id !== roast.id; })).slice(0, 100);
      if (this.storage) safeWrite(this.cacheKey, this.roasts, this.storage);
      this.onRoast(roast, false);
    }
  };

  RoastClient.prototype._subscribe = function (socket) {
    var filter = { kinds: [LEASE_KIND, ROAST_KIND], "#d": [this.leaseId], limit: 100 };
    if (this.pubkey) filter.authors = [this.pubkey];
    socket.send(JSON.stringify(["REQ", "nostr-roast-" + Math.random().toString(36).slice(2), filter]));
  };

  RoastClient.prototype.connect = function () {
    var self = this;
    this.closed = false;
    this.relays.forEach(function (url) {
      var socket;
      try { socket = new WebSocket(url); } catch (_) { return; }
      socket.onopen = function () { self._subscribe(socket); self.onStatus("connected"); };
      socket.onmessage = function (message) {
        try {
          var packet = JSON.parse(message.data);
          if (packet[0] === "EVENT") self._handle(packet[2]);
          if (packet[0] === "EOSE" && !self.roasts.length) self._loadCache();
        } catch (_) { /* malformed relay data is non-fatal */ }
      };
      socket.onerror = function () { self.onStatus("relay-error"); };
      socket.onclose = function () { if (!self.closed) self.onStatus("disconnected"); };
      self.sockets.push(socket);
    });
    this._loadCache();
    this._expiryTimer = setInterval(function () {
      if (!self.lease.revoked && self.lease.expiresAt && Date.now() >= self.lease.expiresAt) {
        self.lease.revoked = true;
        self.onStatus("expired");
        self._loadCache();
      }
    }, Math.max(1000, Math.floor(this.heartbeatGraceMs / 2)));
    return this;
  };

  RoastClient.prototype._loadCache = function () {
    var cached = this.storage && safeRead(this.cacheKey, this.storage);
    if (!Array.isArray(cached)) return;
    this.roasts = cached.filter(function (item) { return item && item.text; });
    this.roasts.forEach(function (roast) { this.onRoast(roast, true); }, this);
    if (this.roasts.length) this.onStatus("cached");
  };

  RoastClient.prototype.close = function () {
    this.closed = true;
    clearInterval(this._expiryTimer);
    this.sockets.forEach(function (socket) { try { socket.close(); } catch (_) {} });
    this.sockets = [];
    this.onStatus("closed");
  };

  RoastClient.prototype.getRoasts = function () { return this.roasts.slice(); };
  RoastClient.KINDS = { LEASE: LEASE_KIND, ROAST: ROAST_KIND };
  RoastClient.tag = tag;
  return RoastClient;
});
