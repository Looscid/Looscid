// Every setting in one place. Environment variables override the defaults.
import path from 'node:path';
import os from 'node:os';
import { PROTOCOL } from '../public/js/rem-core.js';

const env = process.env;
const num = (k, d) => (env[k] !== undefined && env[k] !== '' ? Number(env[k]) : d);

export const config = {
  protocol: PROTOCOL,
  appName: env.REM_APP_NAME || 'Looscid',
  host: env.REM_PUBLIC_HOST || 'localhost:8080',           // the public address people use (no https://)
  port: num('PORT', 8080),
  dataDir: env.REM_DATA || path.join(os.homedir(), 'looscidserver-data'),
  publicRead: env.REM_PUBLIC_READ === '1',                  // off: only signed-in members can read
  minAge: 13,
  invites: {
    perUser: num('REM_INVITES_PER_USER', 3),                // invites a member earns
    waitDays: num('REM_INVITE_WAIT_DAYS', 7),               // ...after this many days
    staffMax: 50,                                           // unused codes an owner/mod can hold at once
  },
  limits: {
    text: 1000, cw: 200, speak: 1000, alt: 1500, name: 50, bio: 300, pronouns: 30,
    media: 4, imageBytes: 5 * 1024 * 1024, pollOptions: 4, pollOption: 80,
    pollMaxMs: 7 * 864e5, scheduleMaxMs: 30 * 864e5, chatBox: 90000, clockSkewMs: 10 * 60e3,
    objectBytes: 64 * 1024, reportNote: 1000,
  },
  rate: {                      // per hour unless said
    dreamsNew: 20, dreams: 60, followsPerDay: 50, media: 30, chats: 300, reports: 30,
    newAccountDays: 7,
  },
  ownerHandle: (env.REM_OWNER_HANDLE || '2three1y').toLowerCase(), // reserved: only the owner invite can claim it
  ownerPubkey: (env.REM_OWNER_PUBKEY || '').toLowerCase(),  // optional: pin the owner handle to one LooscidID (hex)
  ownerInviteSha256: env.REM_OWNER_INVITE_SHA256 || '',     // sha256 of the one-time owner invite
  backupKeySha256: env.REM_BACKUP_KEY_SHA256 || '',         // sha256 of the key that may download backups
  sessionDays: 30,
};
config.publicUrl = (config.host.startsWith('localhost') ? 'http://' : 'https://') + config.host;
