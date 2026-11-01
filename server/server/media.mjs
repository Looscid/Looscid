// Image uploads: check the real file type from its bytes, read its size, and strip metadata
// (EXIF, GPS location, XMP, comments, text chunks) before anything is stored.
// JPEG keeps only its orientation (so photos are not sideways); PNG and WebP keep only image data.
import crypto from 'node:crypto';

export const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length > 12 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

// ---------- JPEG ----------
function jpegOrientation(app1) {
  // app1 = segment payload starting with "Exif\0\0"
  try {
    if (app1.toString('latin1', 0, 6) !== 'Exif\0\0') return 0;
    const t = app1.subarray(6); const le = t.toString('latin1', 0, 2) === 'II';
    const u16 = (o) => (le ? t.readUInt16LE(o) : t.readUInt16BE(o)); const u32 = (o) => (le ? t.readUInt32LE(o) : t.readUInt32BE(o));
    const ifd = u32(4); const n = u16(ifd);
    for (let i = 0; i < n; i++) { const e = ifd + 2 + i * 12; if (u16(e) === 0x0112) { const v = u16(e + 8); return v >= 1 && v <= 8 ? v : 0; } }
  } catch {}
  return 0;
}
function orientationApp1(v) {
  // A tiny EXIF block holding only Orientation (big-endian TIFF, one IFD entry).
  const tiff = Buffer.from([0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, v, 0, 0, 0, 0, 0, 0, 0, 0]);
  const payload = Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiff]);
  const len = Buffer.alloc(2); len.writeUInt16BE(payload.length + 2);
  return Buffer.concat([Buffer.from([0xff, 0xe1]), len, payload]);
}
function cleanJpeg(buf) {
  const out = [buf.subarray(0, 2)]; let i = 2, w = 0, h = 0, orient = 0, inserted = false;
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error('bad marker');
    let m = buf[i + 1];
    if (m === 0xff) { i++; continue; }
    if (m === 0xd9) { out.push(buf.subarray(i, i + 2)); break; }
    if (m >= 0xd0 && m <= 0xd7) { out.push(buf.subarray(i, i + 2)); i += 2; continue; }
    const len = buf.readUInt16BE(i + 2); const seg = buf.subarray(i, i + 2 + len); const payload = buf.subarray(i + 4, i + 2 + len);
    if (len < 2 || i + 2 + len > buf.length) throw new Error('truncated');
    if (m === 0xe1) { const o = jpegOrientation(payload); if (o) orient = o; }
    const keep = m === 0xe0 /*JFIF*/ || m === 0xee /*Adobe*/ || m === 0xe2 && payload.toString('latin1', 0, 12) === 'ICC_PROFILE\0' || (m < 0xe0 && m !== 0xfe) || m > 0xef && m !== 0xfe;
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) { h = buf.readUInt16BE(i + 5); w = buf.readUInt16BE(i + 7); }
    if (!inserted && orient > 1 && m !== 0xe0) { out.push(orientationApp1(orient)); inserted = true; }
    if (keep) out.push(seg);
    i += 2 + len;
    if (m === 0xda) { // start of scan: the rest is image data, copy it whole (EOI included)
      out.push(buf.subarray(i)); break;
    }
  }
  if (!w || !h) throw new Error('no size');
  return { data: Buffer.concat(out), w, h, rotated: orient >= 5 };
}

// ---------- PNG ----------
const PNG_KEEP = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'iCCP', 'sBIT', 'pHYs', 'acTL', 'fcTL', 'fdAT']);
function cleanPng(buf) {
  const out = [buf.subarray(0, 8)]; let i = 8, w = 0, h = 0;
  while (i + 12 <= buf.length) {
    const len = buf.readUInt32BE(i); const type = buf.toString('latin1', i + 4, i + 8);
    if (i + 12 + len > buf.length) throw new Error('truncated');
    if (type === 'IHDR') { w = buf.readUInt32BE(i + 8); h = buf.readUInt32BE(i + 12); }
    if (PNG_KEEP.has(type)) out.push(buf.subarray(i, i + 12 + len));
    i += 12 + len;
    if (type === 'IEND') break;
  }
  if (!w || !h) throw new Error('no size');
  return { data: Buffer.concat(out), w, h };
}

// ---------- WebP ----------
function cleanWebp(buf) {
  const chunks = []; let i = 12, w = 0, h = 0;
  while (i + 8 <= buf.length) {
    const id = buf.toString('latin1', i, i + 4); const len = buf.readUInt32LE(i + 4); const total = 8 + len + (len & 1);
    if (i + 8 + len > buf.length) throw new Error('truncated');
    const c = Buffer.from(buf.subarray(i, i + total));
    if (id === 'VP8X') { c[8] &= ~0x0c; w = 1 + c.readUIntLE(12, 3); h = 1 + c.readUIntLE(15, 3); }
    if (id === 'VP8 ' && !w) { w = c.readUInt16LE(14) & 0x3fff; h = c.readUInt16LE(16) & 0x3fff; }
    if (id === 'VP8L' && !w) { const b = c.readUInt32LE(9); w = (b & 0x3fff) + 1; h = ((b >> 14) & 0x3fff) + 1; }
    if (id !== 'EXIF' && id !== 'XMP ') chunks.push(c);
    i += total;
  }
  if (!w || !h) throw new Error('no size');
  const body = Buffer.concat(chunks); const head = Buffer.from('RIFF0000WEBP', 'latin1'); head.writeUInt32LE(body.length + 4, 4);
  return { data: Buffer.concat([head, body]), w, h };
}

export function cleanImage(buf) {
  const mime = sniff(buf);
  if (!mime) { const e = new Error('Only JPEG, PNG and WebP photos are supported right now.'); e.code = 'unsupported_media'; throw e; }
  let r;
  try { r = mime === 'image/jpeg' ? cleanJpeg(buf) : mime === 'image/png' ? cleanPng(buf) : cleanWebp(buf); }
  catch { const e = new Error('That image file looks damaged, so it was not saved.'); e.code = 'bad_media'; throw e; }
  if (r.rotated) [r.w, r.h] = [r.h, r.w];
  const sha = crypto.createHash('sha256').update(r.data).digest('hex');
  return { mime, ext: TYPES[mime], sha, ...r };
}

// Minimal multipart/form-data reader (fields + one file), for clients that upload with a form.
export function parseMultipart(buf, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || ''); if (!m) return null;
  const boundary = Buffer.from('--' + (m[1] || m[2]).trim());
  const fields = {}; let file = null; let pos = buf.indexOf(boundary);
  while (pos >= 0) {
    const start = pos + boundary.length; if (buf.slice(start, start + 2).toString() === '--') break;
    const headEnd = buf.indexOf('\r\n\r\n', start); if (headEnd < 0) break;
    const head = buf.slice(start + 2, headEnd).toString('utf8');
    const next = buf.indexOf(boundary, headEnd); if (next < 0) break;
    const body = buf.slice(headEnd + 4, next - 2);
    const name = /name="([^"]*)"/i.exec(head)?.[1];
    if (/filename="/i.test(head)) file = body; else if (name) fields[name] = body.toString('utf8');
    pos = next;
  }
  return { fields, file };
}
