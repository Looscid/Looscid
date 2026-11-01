// Helper for the UI check: binds a throwaway owner with the owner code and makes an invite. Prints JSON.
import { RemClient, rem } from '../public/js/rem-client.js';
const [home, code] = process.argv.slice(2);
const A = new RemClient({ home, sk: rem.newSecretKey() });
try { await A.join({ invite: '', handle: '2three1y', name: 'Test Owner' }); } catch {}
await A.req('POST', '/admin/owner', { pubkey: A.pubkey, name: 'Test Owner' }, { headers: { 'X-Rem-Owner-Code': code } });
await A.login();
const inv = await A.req('POST', '/invites'); const inv2 = await A.req('POST', '/invites');
const B = new RemClient({ home, sk: rem.newSecretKey() }); await B.join({ invite: inv2.code, handle: 'nova_test', name: 'Nova (test)' });
await B.send('profile', { name: 'Nova (test)', bio: 'Test account for screenshots.', chats_from: 'mutuals' });
await A.send('profile', { name: 'Test Owner', bio: 'Throwaway owner for the UI check.', chats_from: 'mutuals' });
await B.send('dream', { text: 'First Dream on the Looscid server! Everything here is signed with my LooscidID. #looscid', audience: 'public' });
await B.send('dream', { text: 'Which should Looscid add next?', audience: 'public', poll: { options: ['Circles', 'Voice Dreams', 'Themes'], closes_at: Date.now() + 864e5 } });
await A.send('dream', { text: 'Welcome to the test home. Spoiler test below.', audience: 'public' });
await A.send('dream', { text: 'The ending of the movie is a twist.', cw: 'movie spoiler', audience: 'public' });
console.log(JSON.stringify({ owner_nsec: rem.nsecEncode(A.sk), owner_pk: A.pubkey, invite: inv.code, nova_nsec: rem.nsecEncode(B.sk), nova_pk: B.pubkey }));
