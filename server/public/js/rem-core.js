// Rem core: the shared rules of Rem, the Looscid protocol, used by the server AND by clients.
// Runs in browsers and in Node 20+ (needs globalThis.crypto.subtle).
// Objects, ids and signatures (BIP-340 Schnorr, the same math as Nostr), LooscidID helpers
// (npub/nsec, the 24-word recovery phrase) and NIP-44 v2 encryption for Chats.
// Cryptography: vendored noble-secp256k1 (MIT, Paul Miller). Everything else written for Looscid.
import { schnorr, getSharedSecret, utils } from './vendor/noble-secp256k1.js';
import WORDS from './vendor/bip39-english.js';

// The protocol's name lives here and only here, so it can be renamed in one place.
// Rename the protocol here: name is what people read; key is the envelope field; base is the API path.
export const PROTOCOL = { name: 'Rem', key: 'rem', version: 0, base: '/rem/v0', live: '/rem/v0/live' };

const enc = new TextEncoder();
const dec = new TextDecoder();
const subtle = globalThis.crypto.subtle;

export const toHex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
export const fromHex = (h) => {
  if (typeof h !== 'string' || h.length % 2 || /[^0-9a-f]/i.test(h)) throw new Error('Not valid hex');
  const o = new Uint8Array(h.length / 2);
  for (let i = 0; i < o.length; i++) o[i] = parseInt(h.substr(i * 2, 2), 16);
  return o;
};
export const isHex = (s, bytes) => typeof s === 'string' && s.length === bytes * 2 && /^[0-9a-f]+$/.test(s);
const concat = (...arrs) => {
  const out = new Uint8Array(arrs.reduce((n, a) => n + a.length, 0));
  let i = 0; for (const a of arrs) { out.set(a, i); i += a.length; }
  return out;
};
export const sha256 = async (bytes) => new Uint8Array(await subtle.digest('SHA-256', typeof bytes === 'string' ? enc.encode(bytes) : bytes));
const b64 = (u8) => { let s = ''; for (const x of u8) s += String.fromCharCode(x); return btoa(s); };
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

// ---------- canonical JSON ----------
// Keys of every object are sorted (at every depth), no spaces. Arrays keep their order.
export function canonical(v) {
  if (v === null || typeof v !== 'object') {
    if (typeof v === 'number' && !Number.isFinite(v)) throw new Error('Numbers must be finite');
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  return '{' + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
}
// id = sha256 of canonical([0, by, at, type, body])
export const objectId = async (o) => toHex(await sha256(canonical([0, o.by, o.at, o.type, o.body])));

// ---------- LooscidID (keys) ----------
export const newSecretKey = () => utils.randomSecretKey();
export const pubkeyOf = (sk) => toHex(schnorr.getPublicKey(sk));

export async function signObject(type, body, sk, at = Date.now()) {
  const o = { [PROTOCOL.key]: PROTOCOL.version, type, by: pubkeyOf(sk), at, body };
  o.id = await objectId(o);
  o.sig = toHex(await schnorr.signAsync(fromHex(o.id), sk));
  return o;
}
export async function verifyObject(o) {
  try {
    if (!o || typeof o !== 'object' || !isHex(o.by, 32) || !isHex(o.id, 32) || !isHex(o.sig, 64)) return false;
    if ((await objectId(o)) !== o.id) return false;
    return await schnorr.verifyAsync(fromHex(o.sig), fromHex(o.id), fromHex(o.by));
  } catch { return false; }
}
// Sign / verify a short text message (used for sign-in and joining).
export async function signText(text, sk) { return toHex(await schnorr.signAsync(await sha256(text), sk)); }
export async function verifyText(sig, text, pubkey) {
  try { return isHex(sig, 64) && isHex(pubkey, 32) && await schnorr.verifyAsync(fromHex(sig), await sha256(text), fromHex(pubkey)); }
  catch { return false; }
}

// ---------- bech32 / NIP-19 (npub, nsec) ----------
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
function polymod(values) {
  let chk = 1;
  for (const v of values) {
    const top = chk >>> 25; chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((top >>> i) & 1) chk ^= GEN[i];
  }
  return chk >>> 0;
}
const hrpExpand = (hrp) => [...[...hrp].map((c) => c.charCodeAt(0) >> 5), 0, ...[...hrp].map((c) => c.charCodeAt(0) & 31)];
function convertBits(data, from, to, pad) {
  let acc = 0, bits = 0; const out = []; const maxv = (1 << to) - 1;
  for (const value of data) { acc = (acc << from) | value; bits += from; while (bits >= to) { bits -= to; out.push((acc >> bits) & maxv); } }
  if (pad) { if (bits > 0) out.push((acc << (to - bits)) & maxv); }
  else if (bits >= from || ((acc << (to - bits)) & maxv)) throw new Error('Bad padding');
  return out;
}
export function bech32Encode(hrp, bytes) {
  const data = convertBits(bytes, 8, 5, true);
  const mod = polymod([...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0]) ^ 1;
  const cs = []; for (let i = 0; i < 6; i++) cs.push((mod >>> (5 * (5 - i))) & 31);
  return hrp + '1' + [...data, ...cs].map((d) => CHARSET[d]).join('');
}
export function bech32Decode(str) {
  const s = str.trim().toLowerCase(); const pos = s.lastIndexOf('1');
  if (pos < 1 || pos + 7 > s.length) throw new Error('That is not a valid key code');
  const hrp = s.slice(0, pos);
  const data = [...s.slice(pos + 1)].map((c) => { const i = CHARSET.indexOf(c); if (i < 0) throw new Error('That key code has a character that does not belong'); return i; });
  if (polymod([...hrpExpand(hrp), ...data]) !== 1) throw new Error('That key code has a typo (checksum failed)');
  return { prefix: hrp, bytes: new Uint8Array(convertBits(data.slice(0, -6), 5, 8, false)) };
}
export const npubEncode = (hex) => bech32Encode('npub', fromHex(hex));
export const nsecEncode = (sk) => bech32Encode('nsec', sk);
export function npubDecode(s) { const d = bech32Decode(s); if (d.prefix !== 'npub' || d.bytes.length !== 32) throw new Error('That is not an npub'); return toHex(d.bytes); }

// ---------- recovery phrase ----------
// 24 BIP-39 English words that spell the secret key itself (256 bits + 8-bit checksum).
// Note: this encodes the key directly; it is not NIP-06 (which derives a key from a phrase).
export async function keyToPhrase(sk) {
  if (sk.length !== 32) throw new Error('A secret key is 32 bytes');
  const cs = (await sha256(sk))[0];
  let bits = ''; for (const b of sk) bits += b.toString(2).padStart(8, '0');
  bits += cs.toString(2).padStart(8, '0');
  const out = []; for (let i = 0; i < 24; i++) out.push(WORDS[parseInt(bits.slice(i * 11, i * 11 + 11), 2)]);
  return out.join(' ');
}
export async function phraseToKey(phrase) {
  const words = phrase.toLowerCase().replace(/[^a-z ]+/g, ' ').trim().split(/\s+/);
  if (words.length !== 24) throw new Error(`A recovery phrase is 24 words. I found ${words.length}.`);
  let bits = '';
  for (let i = 0; i < 24; i++) {
    const n = WORDS.indexOf(words[i]);
    if (n < 0) throw new Error(`Word ${i + 1}, "${words[i]}", is not on the recovery word list. Check its spelling.`);
    bits += n.toString(2).padStart(11, '0');
  }
  const sk = new Uint8Array(32); for (let i = 0; i < 32; i++) sk[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  if ((await sha256(sk))[0] !== parseInt(bits.slice(256), 2)) throw new Error('The words are all real, but the phrase does not check out. One word may be wrong or out of order.');
  return sk;
}
// Accept anything a person might paste: 24 words, nsec1..., or 64 hex characters.
export async function parseSecret(input) {
  const s = String(input || '').trim();
  if (/^nsec1/i.test(s)) { const d = bech32Decode(s); if (d.prefix !== 'nsec' || d.bytes.length !== 32) throw new Error('That nsec is not complete'); return d.bytes; }
  if (/^[0-9a-f]{64}$/i.test(s)) return fromHex(s.toLowerCase());
  if (/\s/.test(s)) return phraseToKey(s);
  throw new Error('Paste your 24-word recovery phrase or your nsec key.');
}

// ---------- NIP-44 v2 (end-to-end encrypted Chats) ----------
async function hmac(key, ...msgs) {
  const k = await subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await subtle.sign('HMAC', k, concat(...msgs)));
}
async function hkdfExpand(prk, info, len) {
  let t = new Uint8Array(0), out = new Uint8Array(0);
  for (let i = 1; out.length < len; i++) { t = await hmac(prk, t, info, new Uint8Array([i])); out = concat(out, t); }
  return out.slice(0, len);
}
function chacha20(key, nonce, data, counter = 0) {
  const k = new Uint32Array(8), n = new Uint32Array(3);
  const dv = new DataView(key.buffer, key.byteOffset, 32); for (let i = 0; i < 8; i++) k[i] = dv.getUint32(i * 4, true);
  const nv = new DataView(nonce.buffer, nonce.byteOffset, 12); for (let i = 0; i < 3; i++) n[i] = nv.getUint32(i * 4, true);
  const out = new Uint8Array(data.length); const st = new Uint32Array(16), x = new Uint32Array(16); const ks = new Uint8Array(64);
  const rotl = (v, c) => (v << c) | (v >>> (32 - c));
  const qr = (a, b, c, d) => { x[a] += x[b]; x[d] = rotl(x[d] ^ x[a], 16); x[c] += x[d]; x[b] = rotl(x[b] ^ x[c], 12); x[a] += x[b]; x[d] = rotl(x[d] ^ x[a], 8); x[c] += x[d]; x[b] = rotl(x[b] ^ x[c], 7); };
  for (let pos = 0; pos < data.length; pos += 64, counter++) {
    st.set([0x61707865, 0x3320646e, 0x79622d32, 0x6b206574, ...k, counter >>> 0, ...n]); x.set(st);
    for (let r = 0; r < 10; r++) { qr(0, 4, 8, 12); qr(1, 5, 9, 13); qr(2, 6, 10, 14); qr(3, 7, 11, 15); qr(0, 5, 10, 15); qr(1, 6, 11, 12); qr(2, 7, 8, 13); qr(3, 4, 9, 14); }
    const kv = new DataView(ks.buffer); for (let i = 0; i < 16; i++) kv.setUint32(i * 4, (x[i] + st[i]) >>> 0, true);
    for (let i = 0; i < 64 && pos + i < data.length; i++) out[pos + i] = data[pos + i] ^ ks[i];
  }
  return out;
}
const padLen = (len) => {
  if (len <= 32) return 32;
  const next = 1 << (Math.floor(Math.log2(len - 1)) + 1);
  const chunk = next <= 256 ? 32 : next / 8;
  return chunk * (Math.floor((len - 1) / chunk) + 1);
};
export async function conversationKey(sk, pubkeyHex) {
  const shared = getSharedSecret(sk, fromHex('02' + pubkeyHex)).slice(1, 33);
  return hmac(enc.encode('nip44-v2'), shared);
}
async function messageKeys(ck, nonce) {
  const k = await hkdfExpand(ck, nonce, 76);
  return { ck: k.slice(0, 32), cn: k.slice(32, 44), hk: k.slice(44, 76) };
}
export async function nip44Encrypt(plaintext, ck, nonce = globalThis.crypto.getRandomValues(new Uint8Array(32))) {
  const pt = enc.encode(plaintext);
  if (pt.length < 1 || pt.length > 65535) throw new Error('Message is too long or empty');
  const padded = new Uint8Array(2 + padLen(pt.length)); padded[0] = pt.length >> 8; padded[1] = pt.length & 255; padded.set(pt, 2);
  const { ck: key, cn, hk } = await messageKeys(ck, nonce);
  const ct = chacha20(key, cn, padded);
  const mac = await hmac(hk, nonce, ct);
  return b64(concat(new Uint8Array([2]), nonce, ct, mac));
}
export async function nip44Decrypt(payload, ck) {
  const d = unb64(payload);
  if (d[0] !== 2 || d.length < 99) throw new Error('Unknown message format');
  const nonce = d.slice(1, 33), ct = d.slice(33, d.length - 32), mac = d.slice(d.length - 32);
  const { ck: key, cn, hk } = await messageKeys(ck, nonce);
  const want = await hmac(hk, nonce, ct);
  let diff = 0; for (let i = 0; i < 32; i++) diff |= want[i] ^ mac[i];
  if (diff) throw new Error('Message failed its integrity check');
  const padded = chacha20(key, cn, ct);
  const len = (padded[0] << 8) | padded[1];
  if (len < 1 || 2 + len > padded.length || padded.length !== 2 + padLen(len)) throw new Error('Bad padding');
  return dec.decode(padded.slice(2, 2 + len));
}

// ---------- reading aloud ----------
// A plain "speak hint": URLs become "link to <site>", and runs of 3+ identical emoji are collapsed.
export function speakHint(text) {
  if (!text) return '';
  let s = text.replace(/https?:\/\/[^\s<>"]+/g, (u) => { try { return 'link to ' + new URL(u).hostname.replace(/^www\./, ''); } catch { return 'link'; } });
  s = s.replace(/(\p{Extended_Pictographic}\uFE0F?)\1{2,}/gu, (m, e) => `${e} times ${[...m.matchAll(/\p{Extended_Pictographic}/gu)].length}`);
  return s;
}
