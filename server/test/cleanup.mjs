// Removes every account on a home (for test homes): node test/cleanup.mjs <home> <owner-code> <owner-nsec>
import { RemClient, rem } from '../public/js/rem-client.js';
const [home, code, nsec] = process.argv.slice(2);
const A = new RemClient({ home, sk: await rem.parseSecret(nsec) }); await A.login();
const hdr = { headers: { 'X-Rem-Owner-Code': code } };
const t = await A.get('/mod/tree');
const order = [...t.dreamors.filter((d) => d.role !== 'owner'), ...t.dreamors.filter((d) => d.role === 'owner')];
for (const d of order) { await A.req('POST', '/admin/remove', { pubkey: d.pubkey }, hdr); console.log('removed @' + d.handle); }
console.log(JSON.stringify(await A.req('POST', '/admin/wipe-empty', {}, hdr)));
console.log('owner_claimed:', (await new RemClient({ home }).get('/')).owner_claimed);
