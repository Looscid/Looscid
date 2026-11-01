// A small Rem client: talks to one Looscid home. Works in browsers and Node 22+ (global fetch + WebSocket).
// Third-party apps are welcome to use it, or to write their own from PROTOCOL.md.
import * as rem from './rem-core.js';
export { rem };

export class RemError extends Error { constructor(code, message, status) { super(message); this.code = code; this.status = status; } }

export class RemClient {
  constructor({ home = '', sk = null, token = null } = {}) {
    this.home = home.replace(/\/$/, ''); this.sk = sk; this.token = token; this.pubkey = sk ? rem.pubkeyOf(sk) : null;
  }
  setKey(sk) { this.sk = sk; this.pubkey = rem.pubkeyOf(sk); }
  async req(method, path, body, extra = {}) {
    const headers = { ...(extra.headers || {}) };
    if (this.token) headers.Authorization = 'Bearer ' + this.token;
    let payload = body;
    if (body !== undefined && !(body instanceof Blob) && !(body instanceof ArrayBuffer) && !ArrayBuffer.isView(body)) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
    let res;
    try { res = await fetch(this.home + rem.PROTOCOL.base + path, { method, headers, body: payload }); }
    catch { throw new RemError('offline', 'Could not reach the Looscid server. You may be offline.', 0); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new RemError(data.code || 'http_' + res.status, data.message || `The server answered ${res.status}.`, res.status);
    return data;
  }
  get(path, params) { const q = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null)) : ''; return this.req('GET', path + q); }
  async join({ invite, handle, name }) {
    const sig = await rem.signText(`${rem.PROTOCOL.key}-join:${await this.hostName()}:${invite.trim().toUpperCase()}:${handle.toLowerCase().replace(/^@/, '')}`, this.sk);
    const r = await this.req('POST', '/join', { invite, handle, name, pubkey: this.pubkey, age_ok: true, sig });
    this.token = r.token; return r;
  }
  async hostName() { if (!this._host) this._host = (await this.get('/')).home; return this._host; }
  async login() {
    const c = await this.req('POST', '/auth/challenge', { pubkey: this.pubkey });
    const r = await this.req('POST', '/auth/login', { pubkey: this.pubkey, nonce: c.nonce, sig: await rem.signText(c.sign, this.sk) });
    this.token = r.token; return r;
  }
  async sign(type, body) { return rem.signObject(type, body, this.sk); }
  async send(type, body) { const o = await this.sign(type, body); const r = await this.req('POST', '/objects', o); return { ...r, object: o }; }
  async upload(file, alt, mime) {
    const blob = file instanceof Blob ? file : new Blob([file], { type: mime || 'application/octet-stream' });
    return (await this.req('POST', '/media', blob, { headers: { 'Content-Type': blob.type || mime || 'application/octet-stream', 'X-Rem-Alt': encodeURIComponent(alt || '') } })).media;
  }
  // ---- Chats (end-to-end encrypted with NIP-44 v2; the inner message is itself signed) ----
  async chatKey(other) { this._ck ||= new Map(); if (!this._ck.has(other)) this._ck.set(other, await rem.conversationKey(this.sk, other)); return this._ck.get(other); }
  async sendChat(to, text) {
    const inner = await rem.signObject('chat_message', { to, text }, this.sk);
    const box = await rem.nip44Encrypt(JSON.stringify(inner), await this.chatKey(to));
    return this.send('chat', { to, box });
  }
  async openChat(o) {
    const other = o.by === this.pubkey ? o.body.to : o.by;
    const inner = JSON.parse(await rem.nip44Decrypt(o.body.box, await this.chatKey(other)));
    const ok = inner.by === o.by && inner.type === 'chat_message' && (await rem.verifyObject(inner));
    return { id: o.id, from: o.by, to: o.body.to, at: o.at, text: ok ? inner.body.text : '(this message could not be verified)', verified: ok, inner };
  }
  // ---- live stream ----
  live(onmsg, { streams } = {}) {
    const url = this.home.replace(/^http/, 'ws') + rem.PROTOCOL.live;
    const ws = new WebSocket(url.startsWith('ws') ? url : (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + rem.PROTOCOL.live);
    ws.onopen = () => { ws.send(JSON.stringify({ op: 'auth', token: this.token })); if (streams) ws.send(JSON.stringify({ op: 'sub', streams })); };
    ws.onmessage = (e) => { try { onmsg(JSON.parse(e.data)); } catch {} };
    return ws;
  }
}
