// Checks rem-core against the official NIP-44 v2 vectors and round-trips keys, phrases and objects.
import fs from 'node:fs';
import * as rem from '../public/js/rem-core.js';
const v = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).v2;
let ok = 0, bad = 0; const t = (c, m) => { if (c) ok++; else { bad++; console.log('FAIL', m); } };
for (const x of v.valid.get_conversation_key) t(rem.toHex(await rem.conversationKey(rem.fromHex(x.sec1), x.pub2)) === x.conversation_key, 'ck');
for (const x of v.valid.encrypt_decrypt) {
  const ck = await rem.conversationKey(rem.fromHex(x.sec1), rem.pubkeyOf(rem.fromHex(x.sec2)));
  t(rem.toHex(ck) === x.conversation_key, 'ck2');
  t(await rem.nip44Encrypt(x.plaintext, ck, rem.fromHex(x.nonce)) === x.payload, 'enc ' + x.plaintext.slice(0, 20));
  t(await rem.nip44Decrypt(x.payload, ck) === x.plaintext, 'dec');
}
for (const x of v.invalid.decrypt) { let threw = false; try { await rem.nip44Decrypt(x.payload, rem.fromHex(x.conversation_key)); } catch { threw = true; } t(threw, 'invalid ' + x.note); }
const sk = rem.newSecretKey();
const ph = await rem.keyToPhrase(sk); t(ph.split(' ').length === 24, 'phrase');
t(rem.toHex(await rem.phraseToKey(ph)) === rem.toHex(sk), 'phrase roundtrip');
t(rem.toHex(await rem.parseSecret(rem.nsecEncode(sk))) === rem.toHex(sk), 'nsec');
const o = await rem.signObject('dream', { text: 'hi', audience: 'public', z: { b: 1, a: [2, 1] } }, sk);
t(await rem.verifyObject(o), 'verify'); t(!(await rem.verifyObject({ ...o, body: { ...o.body, text: 'hj' } })), 'tamper');
t(await rem.verifyText(await rem.signText('hello', sk), 'hello', rem.pubkeyOf(sk)), 'text sig');
t(rem.speakHint('look https://www.example.com/x 🔥🔥🔥🔥') === 'look link to example.com 🔥 times 4', 'speak ' + rem.speakHint('look https://www.example.com/x 🔥🔥🔥🔥'));
console.log('ok', ok, 'bad', bad); process.exit(bad ? 1 : 0);
