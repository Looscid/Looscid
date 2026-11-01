
import { RemClient, rem } from '../public/js/rem-client.js';
const [home, code] = process.argv.slice(2);
const A = new RemClient({ home, sk: rem.newSecretKey() });
try { await A.join({ invite: '', handle: '2three1y', name: 'Test Owner' }); } catch {}
await A.req('POST', '/admin/owner', { pubkey: A.pubkey, name: 'Test Owner' }, { headers: { 'X-Rem-Owner-Code': code } });
await A.login();
const invs = []; for (let i = 0; i < 3; i++) invs.push((await A.req('POST', '/invites')).code);
console.log(JSON.stringify({ owner_nsec: rem.nsecEncode(A.sk), owner_pk: A.pubkey, invites: invs }));
