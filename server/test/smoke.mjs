// End-to-end check of a Looscid home: node test/smoke.mjs <home-url> <owner-or-invite-code-file-json>
// Makes throwaway accounts, exercises every feature, prints a line per check. Used on the live address too.
import fs from 'node:fs';
import { RemClient, rem } from '../public/js/rem-client.js';
const home = process.argv[2]; const secrets = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
let pass = 0, failn = 0; const out = [];
const ok = (c, m, extra = '') => { (c ? pass++ : failn++); out.push(`${c ? 'PASS' : 'FAIL'} ${m}${extra ? ' — ' + extra : ''}`); console.log(out[out.length - 1]); };
const expectErr = async (p, code, m) => { try { await p; ok(false, m, 'no error'); } catch (e) { ok(e.code === code, m, e.code + ': ' + e.message); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = Math.random().toString(36).slice(2, 7);

// owner (test mode: the smoke test may run with a throwaway owner on a fresh local home)
const A = new RemClient({ home, sk: rem.newSecretKey() });
const B = new RemClient({ home, sk: rem.newSecretKey() });
const C = new RemClient({ home, sk: rem.newSecretKey() });
const wk = await A.get('/'); ok(wk.protocol === 'rem/0', 'discovery /rem/v0', JSON.stringify({ protocol: wk.protocol, owner_claimed: wk.owner_claimed }));
// Owner flow: asking for the reserved owner handle only files a pending claim; the owner code binds it.
const ownerHdr = { headers: { 'X-Rem-Owner-Code': secrets.owner_code } };
await expectErr(A.join({ invite: '', handle: secrets.owner_handle, name: 'Test Owner' }), 'owner_claim_pending', 'owner handle cannot be grabbed (claim only filed)');
await expectErr(A.req('GET', '/admin/owner-claims'), 'owner_code', 'owner tools refuse without the owner code');
const claims = await A.req('GET', '/admin/owner-claims', undefined, ownerHdr); ok(claims.items.some((c) => c.pubkey === A.pubkey), 'pending claim listed for the owner code');
const bound = await A.req('POST', '/admin/owner', { pubkey: rem.npubEncode(A.pubkey) }, ownerHdr); ok(bound.owner.role === 'owner' && bound.owner.handle === secrets.owner_handle, 'owner code binds the handle to that key');
await A.login(); const staff = A; ok((await A.get('/me')).staff === true, 'bound owner signs in as admin');
const inv1 = (await staff.req('POST', '/invites')).code; const inv2 = (await staff.req('POST', '/invites')).code;
ok(/^[A-Z0-9]{10}$/.test(inv1), 'staff makes invites');
await expectErr(new RemClient({ home, sk: rem.newSecretKey() }).join({ invite: 'NOPE123456', handle: 'zz' + rnd, name: 'x' }), 'bad_invite', 'join refused with a wrong invite');
await expectErr((async () => { const X = new RemClient({ home, sk: rem.newSecretKey() }); const sig = await rem.signText('x', X.sk); return X.req('POST', '/join', { invite: inv1, handle: 't' + rnd, pubkey: X.pubkey, age_ok: false, sig }); })(), 'age', 'join refused without 13+ box');
await expectErr(new RemClient({ home, sk: rem.newSecretKey() }).join({ invite: inv1, handle: '2three1y', name: 'x' }), 'handle_taken', 'owner handle reserved');
const rb = await B.join({ invite: inv1, handle: 'tb_' + rnd, name: 'Test B' }); ok(rb.token && rb.me.handle === 'tb_' + rnd, 'B joins with invite');
await expectErr(new RemClient({ home, sk: rem.newSecretKey() }).join({ invite: inv1, handle: 'tx' + rnd, name: 'x' }), 'invite_used', 'used invite refused');
const rc = await C.join({ invite: inv2, handle: 'tc_' + rnd, name: 'Test C' }); ok(!!rc.token, 'C joins');
ok((await B.get('/invites')).left === 0, 'new member has 0 invites until 7 days');

// live stream for C (C follows B; B posts; C should get it instantly)
const got = []; const wsC = C.live((m) => got.push(m));
await sleep(1500);
await C.send('follow', { who: B.pubkey }); await B.send('follow', { who: C.pubkey });
ok((await C.get('/dreamors/' + B.pubkey)).dreamor.you.mutual === true, 'B and C are mutuals');
const t0 = Date.now();
const d1 = await B.send('dream', { text: `Hello Looscid #remtest ${rnd} https://example.com`, audience: 'public', speak: 'Hello Looscid' });
const dCard = await C.send('dream', { text: `Link card test https://example.com`, audience: 'public' });
ok(!!d1.id, 'B posts a Dream');
let liveItem; for (let i = 0; i < 40 && !(liveItem = got.find((m) => m.op === 'item' && m.item.id === d1.id)); i++) await sleep(100);
ok(!!liveItem, 'C gets the Dream live over the WebSocket', liveItem ? `${Date.now() - t0} ms, stream ${liveItem.stream}, event ${liveItem.event}` : 'nothing');
const feedC = await C.get('/feed/dreamline'); ok(feedC.items.some((x) => x.id === d1.id), 'Dream in C\'s Dreamline');
await C.send('react', { of: d1.id, r: 'like' });
const reply = await C.send('dream', { text: `@tb_${rnd} nice one`, reply_to: d1.id, audience: 'public' });
const th = await B.get(`/dreams/${d1.id}/thread`); ok(th.replies.some((r) => r.id === reply.id) && th.dream.counts.likes === 1, 'thread shows reply + like');
const al = await B.get('/alerts'); ok(['like', 'reply', 'mention', 'follow'].every((k) => al.items.some((a) => a.kind === k)), 'B alerts: like, reply, mention, follow', al.items.map((a) => a.kind).join(','));
// edit + delete
await B.send('edit', { of: d1.id, text: `Hello Looscid, edited #remtest ${rnd}` });
let upd; for (let i = 0; i < 20 && !(upd = got.find((m) => m.op === 'update' && m.item.id === d1.id && m.item.edits)); i++) await sleep(100);
ok((await C.get('/objects/' + d1.id)).item.text.includes('edited') && !!upd, 'edit shows up (and live update)');
const hist = await C.get(`/dreams/${d1.id}/history`); ok(hist.edits.length === 1 && hist.original.body.text.startsWith('Hello Looscid #remtest'), 'edit history kept');
const d2 = await B.send('dream', { text: 'delete me ' + rnd, audience: 'public' });
await B.send('delete', { of: d2.id });
await expectErr(C.get('/objects/' + d2.id), 'not_found', 'deleted Dream is gone');
// search
const s1 = await C.get('/search', { q: 'edited ' + rnd }); ok(s1.dreams.some((x) => x.id === d1.id), 'search finds Dreams');
const s2 = await C.get('/search', { q: 'tb_' + rnd.slice(0, 3) }); ok(s2.dreamors.some((x) => x.pubkey === B.pubkey), 'search finds people (prefix)');
// image upload: refusal without alt, accept with alt, EXIF stripped
const jpg = fs.readFileSync(new URL('./fixtures/gps.jpg', import.meta.url));
await expectErr(B.upload(jpg, '', 'image/jpeg'), 'alt_required', 'upload without alt text refused');
const med = await B.upload(jpg, 'A small orange square, test image', 'image/jpeg'); ok(!!med.url, 'upload with alt accepted', `${med.w}x${med.h}, ${med.bytes} bytes`);
const img = Buffer.from(await (await fetch(home + med.url)).arrayBuffer());
ok(!img.includes(Buffer.from('TestCamera')) && jpg.includes(Buffer.from('TestCamera')) && img.length < jpg.length, 'EXIF/GPS stripped from the stored file', `${jpg.length} -> ${img.length} bytes`);
await expectErr(B.send('dream', { text: 'pic', media: [{ url: med.url, alt: '' }], audience: 'public' }), 'alt_required', 'Dream with image but no alt refused');
const d3 = await B.send('dream', { text: 'with a picture', media: [{ url: med.url, alt: 'A small orange square' }], audience: 'public', cw: 'bright orange' });
ok((await C.get('/objects/' + d3.id)).item.media[0].alt === 'A small orange square', 'Dream with image + alt + content warning');
// poll + scheduled
const pd = await B.send('dream', { text: 'Best feature? ' + rnd, audience: 'public', poll: { options: ['Chats', 'Search'], closes_at: Date.now() + 3600e3 } });
await C.send('vote', { of: pd.id, choice: 1 });
const pv = (await C.get('/objects/' + pd.id)).item.poll; ok(pv.options[1].votes === 1 && pv.my_choice === 1, 'poll vote counted');
const sd = await B.send('dream', { text: 'scheduled ' + rnd, audience: 'public', post_at: Date.now() + 20000 });
ok(sd.scheduled_for > Date.now(), 'Dream scheduled');
await expectErr(C.get('/objects/' + sd.id), 'not_found', 'scheduled Dream hidden until its time');
// chats: mutual only, delivered to an offline user
wsC.close(); await sleep(500);
const ch = await B.sendChat(C.pubkey, 'secret hi ' + rnd); ok(!!ch.id, 'B Chats C while C is offline');
await expectErr((async () => { const X = new RemClient({ home, sk: rem.newSecretKey() }); return X.send('chat', { to: C.pubkey, box: 'x' }); })(), 'sign_in', 'Chat needs sign-in');
const C2 = new RemClient({ home, sk: C.sk }); await C2.login(); // device switch for C
const conv = await C2.get('/chats/' + B.pubkey); const opened = await C2.openChat(conv.items[0]);
ok(opened.text === 'secret hi ' + rnd && opened.verified, 'C (back online, new device) reads the Chat, signature verified');
ok(!JSON.stringify(conv).includes('secret hi'), 'server only holds ciphertext');
// non-mutual chat refused
await C.send('unfollow', { who: B.pubkey });
await expectErr(B.sendChat(C.pubkey, 'hey'), 'mutuals_only', 'Chat to a non-mutual refused');
// block works both ways
await C.send('block', { who: B.pubkey });
await expectErr(B.get('/objects/' + reply.id), 'not_found', 'blocked: B cannot see C\'s Dreams');
await expectErr(B.send('follow', { who: C.pubkey }), 'blocked', 'blocked: B cannot follow C');
await C.send('unblock', { who: B.pubkey });
// report -> mod queue -> hide
const rp = await C.send('report', { of: d3.id, reason: 'other', note: 'test report ' + rnd });
const q = await staff.get('/mod/reports'); const mine = q.items.find((x) => x.id === rp.id); ok(!!mine && mine.dream && mine.dream.id === d3.id, 'report reaches the mod queue');
await staff.req('POST', '/mod/action', { target: d3.id, action: 'hide', note: 'test' });
await expectErr(C.get('/objects/' + d3.id), 'not_found', 'mod hide removes the Dream');
await staff.req('POST', '/mod/action', { target: rp.id, action: 'resolve', note: 'test done' });
await expectErr(B.get('/mod/reports'), 'staff_only', 'mod page refused to non-mods');
// role invites: offered in Alerts, accepted there, revocable by the owner
const ri = await staff.req('POST', '/mod/action', { target: 'tc_' + rnd, action: 'invite_role', role: 'mod' });
const ca = await C.get('/notifications'); const inv = ca.items.find((a) => a.kind === 'role_invite');
ok(!!inv && inv.role_invite.status === 'pending', 'role invite arrives in notifications');
await C.send('role_answer', { invite: inv.role_invite.id, accept: true });
ok((await C.get('/me')).staff === true && (await C.get('/mod/reports')).items !== undefined, 'accepting the role makes C a moderator');
ok((await staff.get('/mod/log')).role_invites.some((x) => x.status === 'accepted'), 'role invite logged on the mod page');
await staff.req('POST', '/mod/action', { target: C.pubkey, action: 'revoke_role' });
ok((await C.get('/me')).staff === false, 'owner revokes the role');
// trending
const tr = await C.get('/trending'); ok(tr.tags.some((t) => t.tag === 'remtest'), 'trending tags count', JSON.stringify(tr.tags.slice(0, 3)));
// sync: device switch for B — a fresh client with only the key gets everything back
const B2 = new RemClient({ home, sk: B.sk }); await B2.login(); let all = [], cur = 0, r;
do { r = await B2.get('/sync', { since: cur }); all.push(...r.objects); cur = r.cursor; } while (r.more);
const types = [...new Set(all.map((o) => o.type))].sort();
ok(all.every((o) => o.by === B.pubkey || o.body.to === B.pubkey) && types.includes('dream') && types.includes('chat') && types.includes('follow'), 'device switch: sync returns all of B\'s objects', `${all.length} objects, types ${types.join(',')}`);
ok((await Promise.all(all.map((o) => rem.verifyObject(o)))).every(Boolean), 'every synced object verifies (server cannot forge)');
// forged object refused
const forged = await B.sign('dream', { text: 'real', audience: 'public' }); forged.body.text = 'forged';
await expectErr(B.req('POST', '/objects', forged), 'bad_signature', 'forged object refused');
// import (opt-in) with one image missing alt
const old1 = await rem.signObject('dream', { text: 'an old local Dream ' + rnd, audience: 'public' }, B.sk, Date.now() - 30 * 864e5);
const old2 = await rem.signObject('dream', { text: 'old pic', media: [{ url: med.url, alt: '' }], audience: 'public' }, B.sk, Date.now() - 20 * 864e5);
const im = await B.req('POST', '/import', { objects: [old1, old2, old1] });
ok(im.imported.length === 1 && im.needs_alt.length === 1 && im.skipped.length === 1, 'import: 1 in, 1 flagged for alt text, duplicate skipped', JSON.stringify({ i: im.imported.length, n: im.needs_alt.length, s: im.skipped.length }));
ok((await B.get('/import/flags')).items.length === 1, 'import flag listed for the user to fix');
const prof = await C.get(`/dreamors/${B.pubkey}/dreams`); ok(prof.items.some((x) => x.id === old1.id && x.imported), 'imported Dream on profile at its old time');
// import keeps replies in their thread; a reply to a Dream that isn't on the server is refused (never turned into a loose Dream)
const oldReply = await rem.signObject('dream', { text: 'an old local reply ' + rnd, audience: 'public', reply_to: old1.id }, B.sk, Date.now() - 29 * 864e5);
const orphan = await rem.signObject('dream', { text: 'a reply to a Nostr Dream', audience: 'public', reply_to: 'ab'.repeat(32) }, B.sk, Date.now() - 28 * 864e5);
const im2 = await B.req('POST', '/import', { objects: [oldReply, orphan] });
ok(im2.imported.length === 1 && im2.refused.length === 1 && im2.refused[0].code === 'parent_missing', 'import: a reply keeps its thread, a reply to a missing Dream is refused', JSON.stringify(im2));
const th2 = await C.get(`/dreams/${old1.id}/thread`); ok((th2.replies || []).some((x) => x.id === oldReply.id), 'imported reply shows in its thread');
// scheduled publishes
await sleep(Math.max(0, sd.scheduled_for - Date.now()) + 11000);
ok(!!(await C.get('/objects/' + sd.id)).item, 'scheduled Dream published on time');
const card = (await C.get('/objects/' + dCard.id)).item.link; ok(!!(card && card.title), 'link card fetched for the Dream', JSON.stringify(card || null));
// clean up: remove the test accounts (the owner one too), so the home is fresh again
if (!process.env.KEEP) { for (const pk of [B.pubkey, C.pubkey, A.pubkey]) await A.req('POST', '/admin/remove', { pubkey: pk }, ownerHdr);
  const w = await A.req('POST', '/admin/wipe-empty', {}, ownerHdr); const after = await new RemClient({ home }).get('/'); ok(after.owner_claimed === false && w.ok, 'test accounts and their data removed, owner handle reserved again'); }
console.log(`\n${pass} passed, ${failn} failed`);
if (process.env.REPORT) fs.writeFileSync(process.env.REPORT, out.join('\n') + `\n${pass} passed, ${failn} failed\n`);
process.exit(failn ? 1 : 0);
