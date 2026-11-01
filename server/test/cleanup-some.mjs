
import { RemClient, rem } from '../public/js/rem-client.js';
const [home, code, nsec, ...pks] = process.argv.slice(2);
const A = new RemClient({ home, sk: await rem.parseSecret(nsec) }); await A.login();
const hdr = { headers: { 'X-Rem-Owner-Code': code } };
const t = await A.get('/mod/tree');
console.log('members before:', t.dreamors.map((d) => d.handle + ':' + d.pubkey.slice(0, 8)).join(', '));
const known = new Set(pks);
const others = t.dreamors.filter((d) => !known.has(d.pubkey));
if (others.length) { console.log('NOT removing, unknown members present:', others.map((d) => d.handle).join(', ')); }
for (const d of [...t.dreamors.filter((d) => known.has(d.pubkey) && d.role !== 'owner'), ...t.dreamors.filter((d) => known.has(d.pubkey) && d.role === 'owner')]) { await A.req('POST', '/admin/remove', { pubkey: d.pubkey }, hdr); console.log('removed @' + d.handle); }
if (!others.length) console.log(JSON.stringify(await A.req('POST', '/admin/wipe-empty', {}, hdr)));
console.log('owner_claimed:', (await new RemClient({ home }).get('/')).owner_claimed);
