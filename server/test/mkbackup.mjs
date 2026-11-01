
import * as backup from '../public/js/looscid-backup.js';
import { rem } from '../public/js/rem-client.js';
import fs from 'node:fs';
const [out, pass] = process.argv.slice(2);
const sk = rem.newSecretKey(), pk = rem.pubkeyOf(sk), t = Date.now();
const d1 = await rem.signObject('dream', { text: 'Node-made old Dream ' + t, audience: 'public' }, sk, t - 40 * 864e5);
const r1 = await rem.signObject('dream', { text: 'Node-made reply ' + t, audience: 'public', reply_to: d1.id }, sk, t - 39 * 864e5);
const text = await backup.lockBackup({ from: 'app', key: { nsec: rem.nsecEncode(sk), pubkey: pk }, profile: { name: 'Join Test', handle: 'jt' + String(t).slice(-5), bio: 'restored bio' }, server: null,
  dreams: [{ id: d1.id, at: d1.at, text: d1.body.text, audience: 'public' }, { id: r1.id, at: r1.at, text: r1.body.text, audience: 'public', reply_to: d1.id }], rem_objects: [d1, r1], app: { looscid_dreams: JSON.stringify([{ id: d1.at, text: d1.body.text, created: d1.at }]) }, home: null }, pass);
fs.writeFileSync(out, text); console.log(JSON.stringify({ pk, handle: 'jt' + String(t).slice(-5) }));
