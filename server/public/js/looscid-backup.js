// Looscid backup file (.looscid): one file with your profile, Dreams, replies, chats, likes, follows, settings
// AND your LooscidID key, locked with a passcode you choose. Used by the Looscid app and by the Looscid home web client,
// so a file saved on one opens on the other. Made for Looscid; no outside libraries, no CDN: only the browser's WebCrypto.
//
// The file is JSON on the outside:
//   { "looscid_backup": 1, "note": "...", "kdf": { "name": "PBKDF2", "hash": "SHA-256", "iterations": 600000, "salt": "<base64>" },
//     "cipher": { "name": "AES-GCM", "iv": "<base64>" }, "data": "<base64>" }
// "data" is the whole backup (below), encrypted with AES-GCM (256-bit key) derived from the passcode with PBKDF2-SHA-256.
// Nothing about you is readable without the passcode: not your name, not your key, not even how many Dreams you have.
// The passcode is never saved anywhere, so it can't be recovered. A wrong passcode simply fails to open the file.
//
// Inside (after the passcode opens it):
//   { looscid_backup_data: 1, made: <ms>, from: "app" | "home", key: { nsec, pubkey } | null,
//     profile: { name, handle, bio, ... }, server: { home, handle } | null,
//     dreams: [{ id, at, text, cw?, audience, reply_to? }],      // plain copy of your Dreams and replies
//     rem_objects: [signed Rem objects],                          // signed with your key, so a Looscid home can take them back
//     app: { "<localStorage key>": "<value>", ... } | null,      // the Looscid app's own data (settings, chats, likes, follows...)
//     home: { settings } | null }
export const BACKUP_VERSION = 1;
export const ITERATIONS = 600000; // PBKDF2 rounds (OWASP 2023 advice for SHA-256): slows down anyone guessing passcodes
const AAD = new TextEncoder().encode('looscid-backup-v1');
const NOTE = 'Looscid backup file. It holds your LooscidID key, locked with your passcode. Keep it private. Nobody can recover a forgotten passcode.';

const b64 = (bytes) => { let s = ''; const b = new Uint8Array(bytes); for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (str) => { const s = atob(String(str || '')); const o = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) o[i] = s.charCodeAt(i); return o; };

export class BackupError extends Error { constructor(code, message) { super(message); this.code = code; } }

// The most common passcodes (the same list the Looscid app uses for your key's passcode).
const WEAK = ["password", "passcode", "12345678", "123456789", "1234567890", "87654321", "qwertyui", "qwertyuiop", "asdfghjk", "11111111", "00000000", "iloveyou", "letmein1", "looscid1", "looscid123", "nostrkey", "abcdefgh", "password1", "trustno1", "sunshine", "princess", "football", "baseball", "superman", "whatever"];
// Plain-words passcode check, the same rules everywhere: at least 8 characters and not an easy guess.
export function passcodeProblem(p) {
  const s = String(p || '');
  const tip = ' Four short words work well, like: blue lamp river jump.';
  if (!s) return 'Type a passcode first.';
  if (s.length < 8) return 'That passcode is too short. Use at least 8 characters.' + tip;
  if (/^(.)\1+$/.test(s)) return 'That passcode is one character repeated, which is easy to guess.' + tip;
  const low = s.toLowerCase();
  let up = true, down = true;
  for (let i = 1; i < low.length; i++) { const d = low.charCodeAt(i) - low.charCodeAt(i - 1); if (d !== 1) up = false; if (d !== -1) down = false; }
  if (up || down) return 'That passcode is a simple sequence, like 12345678, which is easy to guess.' + tip;
  if (WEAK.includes(low)) return 'That passcode is one of the most common ones, so it is easy to guess.' + tip;
  if (new Set(low).size < 4) return 'That passcode uses too few different characters, so it is easy to guess.' + tip;
  return null;
}

async function deriveKey(passcode, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(passcode).normalize('NFKC')), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

// Lock a backup object with a passcode. Returns the file's text.
export async function lockBackup(data, passcode) {
  if (!crypto || !crypto.subtle) throw new BackupError('no_crypto', 'This browser cannot lock files. Open Looscid in Safari, Chrome, Edge or Firefox over https.');
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passcode, salt, ITERATIONS);
  const plain = new TextEncoder().encode(JSON.stringify(Object.assign({ looscid_backup_data: BACKUP_VERSION, made: Date.now() }, data)));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: AAD }, key, plain);
  return JSON.stringify({ looscid_backup: BACKUP_VERSION, note: NOTE, kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: b64(salt) }, cipher: { name: 'AES-GCM', iv: b64(iv) }, data: b64(ct) });
}

// Read the outside of a file (no passcode needed). Throws a BackupError with plain words if it isn't a Looscid backup.
export function readBackupFile(text) {
  let f; try { f = JSON.parse(String(text || '').replace(/^\uFEFF/, '')); } catch (e) { throw new BackupError('not_backup', 'That file is not a Looscid backup file. Choose the file that ends in .looscid.'); }
  if (!f || typeof f !== 'object' || f.looscid_backup == null || !f.kdf || !f.cipher || typeof f.data !== 'string') {
    if (f && (f.app === 'Looscid' || f.objects)) throw new BackupError('export_file', 'That is a data export, not a backup file. Choose the file that ends in .looscid.');
    throw new BackupError('not_backup', 'That file is not a Looscid backup file. Choose the file that ends in .looscid.');
  }
  if (f.looscid_backup > BACKUP_VERSION) throw new BackupError('newer', 'This backup was made by a newer Looscid. Update Looscid, then try again.');
  if (f.kdf.name !== 'PBKDF2' || f.kdf.hash !== 'SHA-256' || f.cipher.name !== 'AES-GCM') throw new BackupError('not_backup', 'This backup file uses a lock this Looscid does not know.');
  const it = Number(f.kdf.iterations);
  if (!Number.isInteger(it) || it < 100000 || it > 10000000) throw new BackupError('not_backup', 'This backup file looks damaged.');
  return f;
}

// Open a backup file with its passcode. Returns the backup object. A wrong passcode throws code "wrong_passcode".
export async function unlockBackup(text, passcode) {
  const f = readBackupFile(text);
  if (!passcode) throw new BackupError('no_passcode', 'Type the passcode for this backup file first.');
  let plain;
  try {
    const key = await deriveKey(passcode, unb64(f.kdf.salt), Number(f.kdf.iterations));
    plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(f.cipher.iv), additionalData: AAD }, key, unb64(f.data));
  } catch (e) { throw new BackupError('wrong_passcode', "That passcode doesn't open this backup file. Nothing was changed. Check it and try again."); }
  let d; try { d = JSON.parse(new TextDecoder().decode(plain)); } catch (e) { throw new BackupError('damaged', 'This backup file opened but looks damaged. Nothing was changed.'); }
  if (!d || d.looscid_backup_data == null) throw new BackupError('damaged', 'This backup file opened but looks damaged. Nothing was changed.');
  return d;
}

// A safe file name: "<handle>.looscid".
export function backupFileName(handle) {
  const h = String(handle || '').replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30);
  return (h || 'looscid-backup') + '.looscid';
}

// Save text as a file download (works on iPhone Safari: it asks where to save it, or saves to Downloads in Files).
export function downloadBackup(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/octet-stream' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener'; a.style.display = 'none';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
