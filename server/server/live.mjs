// The Rem live stream: one WebSocket per signed-in device (RFC 6455, written small, no library).
// Text frames only, 64 KB max, server pings every 30 s so idle proxies keep the line open.
import crypto from 'node:crypto';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX = 64 * 1024;

export class Socket {
  constructor(sock) {
    this.sock = sock; this.buf = Buffer.alloc(0); this.frags = []; this.closed = false; this.alive = true;
    this.onmessage = () => {}; this.onclose = () => {};
    sock.setNoDelay(true);
    sock.on('data', (d) => this._data(d));
    sock.on('close', () => this._closed());
    sock.on('error', () => this._closed());
  }
  _closed() { if (!this.closed) { this.closed = true; this.onclose(); } }
  _data(d) {
    this.buf = Buffer.concat([this.buf, d]);
    if (this.buf.length > MAX + 16) return this.close(1009);
    while (this.buf.length >= 2) {
      const b0 = this.buf[0], b1 = this.buf[1]; const fin = b0 & 0x80, op = b0 & 0x0f, masked = b1 & 0x80;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; const hi = this.buf.readUInt32BE(2); len = this.buf.readUInt32BE(6); if (hi) return this.close(1009); off = 10; }
      if (!masked) return this.close(1002);
      if (len > MAX) return this.close(1009);
      if (this.buf.length < off + 4 + len) return;
      const mask = this.buf.subarray(off, off + 4); const payload = Buffer.from(this.buf.subarray(off + 4, off + 4 + len));
      for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
      this.buf = this.buf.subarray(off + 4 + len);
      if (op === 0x8) return this.close(1000);
      if (op === 0x9) { this._send(0xa, payload); continue; }
      if (op === 0xa) { this.alive = true; continue; }
      if (op === 0x1 || op === 0x0) {
        this.frags.push(payload);
        if (this.frags.reduce((n, f) => n + f.length, 0) > MAX) return this.close(1009);
        if (fin) { const msg = Buffer.concat(this.frags).toString('utf8'); this.frags = []; this.alive = true; try { this.onmessage(msg); } catch {} }
        continue;
      }
      if (op === 0x2) return this.close(1003);
    }
  }
  _send(op, payload) {
    if (this.closed) return;
    const len = payload.length; let head;
    if (len < 126) head = Buffer.from([0x80 | op, len]);
    else if (len < 65536) { head = Buffer.alloc(4); head[0] = 0x80 | op; head[1] = 126; head.writeUInt16BE(len, 2); }
    else { head = Buffer.alloc(10); head[0] = 0x80 | op; head[1] = 127; head.writeUInt32BE(0, 2); head.writeUInt32BE(len, 6); }
    try { this.sock.write(Buffer.concat([head, payload])); } catch { this._closed(); }
  }
  send(obj) { this._send(0x1, Buffer.from(JSON.stringify(obj))); }
  ping() { this._send(0x9, Buffer.alloc(0)); }
  close(code = 1000) {
    if (this.closed) return;
    const p = Buffer.alloc(2); p.writeUInt16BE(code); this._send(0x8, p);
    this.sock.end(); this.sock.destroy(); this._closed();
  }
}

export function accept(req, sock) {
  const key = req.headers['sec-websocket-key'];
  if (!key || (req.headers.upgrade || '').toLowerCase() !== 'websocket') { sock.end('HTTP/1.1 400 Bad Request\r\n\r\n'); return null; }
  const acceptKey = crypto.createHash('sha1').update(key + GUID).digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acceptKey + '\r\n\r\n');
  return new Socket(sock);
}
