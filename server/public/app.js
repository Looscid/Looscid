// Looscid home: a small web client for this server. VoiceOver first.
// Local-first: your LooscidID stays on this device, a copy of everything you made is kept here (IndexedDB),
// you can read what you have and write while offline (it sends when you are back), and you can export it all.
import { RemClient, rem } from './js/rem-client.js?v=20261101d';
import * as backup from './js/looscid-backup.js?v=20261101d';

const $ = (s) => document.querySelector(s);
const view = $('#view'), title = $('#title'), announceEl = $('#announce'), statusEl = $('#status');
const LS = { key: 'looscid.sk', token: 'looscid.token', cursor: 'looscid.syncCursor', outbox: 'looscid.outbox', theme: 'looscid.theme', cache: 'looscid.cache.' };
let me = null, staff = false, ws = null, pending = { dreamline: [], discover: [] }, currentView = '', home = { owner_claimed: true };
const client = new RemClient({ home: '' });

// ---------- tiny helpers ----------
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'text') el.textContent = v;
    else if (k === 'cls') el.className = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return el;
}
let announceTimer;
function say(msg) { clearTimeout(announceTimer); announceEl.textContent = ''; announceTimer = setTimeout(() => { announceEl.textContent = msg; }, 60); }
function status(msg) { statusEl.hidden = !msg; statusEl.textContent = msg || ''; }
const ago = (t) => { const s = Math.round((Date.now() - t) / 1000); if (s < 0) { const m = Math.round(-s / 60); if (m < 60) return `in ${m} minute${m === 1 ? '' : 's'}`; const hr = Math.round(m / 60); return hr <= 48 ? `in ${hr} hour${hr === 1 ? '' : 's'}` : `on ${new Date(t).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`; } if (s < 60) return 'just now'; const m = Math.round(s / 60); if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`; const hr = Math.round(m / 60); if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`; return new Date(t).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); };
const plural = (n, w, many) => `${n} ${n === 1 ? w : many || w + 's'}`;
function setView(name, heading) {
  currentView = name; title.textContent = heading; document.title = `${heading} · Looscid`;
  view.replaceChildren(); window.scrollTo(0, 0);
  for (const a of document.querySelectorAll('#nav a')) a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + name) || a.removeAttribute('aria-current');
  for (const a of document.querySelectorAll('#nav a')) if (a.getAttribute('href') === '#' + name) a.setAttribute('aria-current', 'page');
  title.setAttribute('tabindex', '-1');
}
const focusTitle = () => title.focus();
function errBox(e) { return h('p', { cls: 'error', role: 'alert' }, e.message || String(e)); }

// ---------- local store (IndexedDB) ----------
let dbp;
function idb() {
  dbp ||= new Promise((res, rej) => { const r = indexedDB.open('looscid', 1); r.onupgradeneeded = () => r.result.createObjectStore('objects', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  return dbp;
}
async function storeObjects(list) { if (!list.length) return; const d = await idb(); await new Promise((res, rej) => { const t = d.transaction('objects', 'readwrite'); for (const o of list) t.objectStore('objects').put(o); t.oncomplete = res; t.onerror = () => rej(t.error); }); }
async function allObjects() { const d = await idb(); return new Promise((res, rej) => { const r = d.transaction('objects').objectStore('objects').getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function clearLocal() { const d = await idb(); await new Promise((res) => { const t = d.transaction('objects', 'readwrite'); t.objectStore('objects').clear(); t.oncomplete = res; }); }
async function syncDown() {
  let cur = Number(localStorage.getItem(LS.cursor) || 0), r, n = 0;
  do { r = await client.get('/sync', { since: cur }); await storeObjects(r.objects); n += r.objects.length; cur = r.cursor; localStorage.setItem(LS.cursor, cur); } while (r.more);
  return n;
}

// ---------- sending (with an offline outbox) ----------
const outbox = () => JSON.parse(localStorage.getItem(LS.outbox) || '[]');
async function send(type, body) {
  const o = await client.sign(type, body);
  await storeObjects([o]);
  try { const r = await client.req('POST', '/objects', o); return { ...r, object: o }; }
  catch (e) {
    if (e.code === 'offline' && type !== 'chat') { localStorage.setItem(LS.outbox, JSON.stringify([...outbox(), o])); say('You are offline. Saved on this device, it will send when you are back online.'); return { queued: true, object: o }; }
    throw e;
  }
}
async function flushOutbox() {
  const list = outbox(); if (!list.length) return; const left = [];
  for (const o of list) { try { await client.req('POST', '/objects', o); } catch (e) { if (e.code === 'offline') left.push(o); else if (e.code === 'bad_time') { try { await client.req('POST', '/objects', await client.sign(o.type, o.body)); } catch {} } } }
  localStorage.setItem(LS.outbox, JSON.stringify(left));
  if (list.length > left.length) say(`${plural(list.length - left.length, 'saved item')} sent.`);
}
window.addEventListener('online', () => { flushOutbox(); connectLive(); });

// ---------- live stream ----------
function connectLive() {
  if (!client.token || (ws && ws.readyState <= 1)) return;
  ws = client.live(onLive);
  ws.onclose = () => { ws = null; if (client.token) setTimeout(connectLive, 4000); };
}
function onLive(m) {
  if (m.op === 'item' && (m.stream === 'dreamline' || m.stream === 'discover')) {
    if (m.item.by.pubkey === me?.pubkey && m.event !== 'redream.new') return;
    pending[m.stream].push(m.item);
    if (currentView === m.stream) showNewButton(m.stream);
  } else if (m.op === 'alert') {
    bumpAlerts(1);
    if (m.alert.kind === 'chat') { if (currentView === 'chat:' + m.alert.actor.pubkey) return; say(`New Chat message from ${m.alert.actor.name}.`); }
    else say(alertText(m.alert));
  } else if (m.op === 'chat') {
    storeObjects([m.object]);
    const other = m.object.by === me.pubkey ? m.object.body.to : m.object.by;
    if (currentView === 'chat:' + other && m.object.by !== me.pubkey) appendChat(m.object, true);
  } else if (m.op === 'update') { const old = document.getElementById('d-' + m.item.id); if (old) old.replaceWith(dreamEl(m.item)); }
  else if (m.op === 'remove') { document.getElementById('d-' + m.id)?.remove(); }
}
function showNewButton(stream) {
  const n = pending[stream].length; let b = $('#new-btn');
  const label = `${plural(n, 'new Dream')}. Show ${n === 1 ? 'it' : 'them'}`;
  if (!b) { b = h('button', { id: 'new-btn', cls: 'new-btn primary', onclick: () => { const list = $('#feed-list'); const items = pending[stream].splice(0); for (const it of items) list.prepend(dreamEl(it)); b.remove(); say(`Showing ${plural(items.length, 'new Dream')}.`); list.querySelector('article')?.querySelector('h3 a')?.focus(); } }); $('#feed-top')?.append(b); }
  b.textContent = label;
  if (n === 1 || n % 5 === 0) say(`${plural(n, 'new Dream')} in ${stream === 'dreamline' ? 'Dreamline' : 'Discover'}.`);
}
let unseen = 0;
function bumpAlerts(n, set) { unseen = set ? n : unseen + n; const a = $('#alerts-link'); a.replaceChildren('Inbox', unseen ? h('span', { cls: 'badge' }, h('span', { cls: 'sr-only' }, ', '), String(unseen), h('span', { cls: 'sr-only' }, ' new')) : ''); }

// ---------- Dreams ----------
function nameLink(d) { return h('a', { href: '#@' + d.handle }, d.name, ' ', h('span', { cls: 'handle' }, '@' + d.handle)); }
function dreamEl(it) {
  const hid = 'h-' + it.id.slice(0, 12) + Math.random().toString(36).slice(2, 5);
  const a = h('article', { cls: 'dream', id: 'd-' + it.id, 'aria-labelledby': hid, lang: it.lang || null });
  a.append(h('h3', { id: hid }, nameLink(it.by)));
  const meta = [it.redreamed_by ? `ReDreamed by ${it.redreamed_by.name}. ` : '', it.reply_to_handle ? `Reply to @${it.reply_to_handle}. ` : '', it.scheduled_for ? `Scheduled, posts ${ago(it.scheduled_for)}. ` : ago(it.at), it.edited_at ? ', edited' : '', it.audience === 'followers' ? ', followers only' : '', it.imported ? ', imported' : ''].join('');
  a.append(h('p', { cls: 'meta' }, h('a', { href: '#dream/' + it.id }, meta)));
  const body = h('div', {});
  if (it.text) body.append(h('p', { cls: 'text' }, it.speak ? h('span', { 'aria-hidden': 'true' }, it.text) : it.text, it.speak ? h('span', { cls: 'sr-only' }, it.speak) : null));
  for (const m of it.media || []) body.append(h('div', { cls: 'media' }, h('img', { src: m.url, alt: m.alt, width: m.w, height: m.h, loading: 'lazy' })));
  if (it.link) body.append(h('a', { cls: 'linkcard', href: it.link.url, rel: 'noopener noreferrer nofollow', target: '_blank' }, `Link: ${it.link.title || it.link.url}`, it.link.description ? h('span', {}, it.link.description) : null, h('span', {}, it.link.site || '')));
  if (it.quoted) body.append(h('blockquote', { cls: 'card' }, h('p', {}, `Quoting ${it.quoted.by.name}: `, it.quoted.cw ? `(content warning: ${it.quoted.cw})` : it.quoted.text)));
  if (it.poll) body.append(pollEl(it));
  if (it.cw) {
    const btn = h('button', { 'aria-expanded': 'false', onclick: () => { const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); btn.textContent = open ? 'Show Dream' : 'Hide Dream'; body.hidden = open; } }, 'Show Dream');
    body.hidden = true; a.append(h('p', { cls: 'cw' }, `Content warning: ${it.cw} `, btn));
  }
  a.append(body);
  const acts = h('div', { cls: 'actions' });
  const likeBtn = h('button', { 'aria-pressed': String(!!it.me?.liked), onclick: async () => {
    try { if (it.me.liked) { await send('delete', { of: it.me.like_id }); it.me.liked = false; it.counts.likes--; } else { const r = await send('react', { of: it.id, r: 'like' }); it.me.liked = true; it.me.like_id = r.object.id; it.counts.likes++; }
      likeBtn.setAttribute('aria-pressed', String(it.me.liked)); likeBtn.textContent = `Like, ${plural(it.counts.likes, 'like')}`; say(it.me.liked ? 'Liked' : 'Like removed'); } catch (e) { say(e.message); } } }, `Like, ${plural(it.counts.likes, 'like')}`);
  acts.append(h('button', { onclick: () => replyTo(it, a) }, `Reply, ${plural(it.counts.replies, 'reply', 'replies')}`), likeBtn);
  if (it.audience === 'public' && it.by.pubkey !== me?.pubkey) {
    const rd = h('button', { 'aria-pressed': String(!!it.me?.redreamed), onclick: async () => {
      try { if (it.me.redreamed) { await send('delete', { of: it.me.redream_id }); it.me.redreamed = false; it.counts.redreams--; } else { const r = await send('redream', { of: it.id }); it.me.redreamed = true; it.me.redream_id = r.object.id; it.counts.redreams++; }
        rd.setAttribute('aria-pressed', String(it.me.redreamed)); rd.textContent = `ReDream, ${it.counts.redreams}`; say(it.me.redreamed ? 'ReDreamed' : 'ReDream removed'); } catch (e) { say(e.message); } } }, `ReDream, ${it.counts.redreams}`);
    acts.append(rd);
  }
  const more = h('details', {}, h('summary', {}, 'More'));
  const moreBox = h('div', { cls: 'actions' });
  if (it.by.pubkey === me?.pubkey) {
    moreBox.append(h('button', { onclick: () => editDream(it, a) }, 'Edit'), h('button', { cls: 'danger', onclick: async () => { if (!confirm('Delete this Dream?')) return; try { await send('delete', { of: it.id }); a.remove(); say('Dream deleted'); focusTitle(); } catch (e) { say(e.message); } } }, 'Delete'));
  } else {
    moreBox.append(h('button', { onclick: () => reportForm(it.id, a, 'Dream') }, 'Report Dream'));
  }
  more.append(moreBox); acts.append(more);
  a.append(acts);
  return a;
}
function pollEl(it) {
  const p = it.poll; const fs = h('fieldset', {}, h('legend', {}, p.closed ? `Poll, closed. ${plural(p.total, 'vote')}` : `Poll, ${plural(p.total, 'vote')}, closes ${ago(p.closes_at)}`));
  if (p.closed || p.my_choice !== null && p.my_choice !== undefined) {
    fs.append(h('ul', { cls: 'plain' }, p.options.map((o, i) => h('li', {}, `${o.text}: ${plural(o.votes, 'vote')}${p.total ? `, ${Math.round(o.votes / p.total * 100)} percent` : ''}${p.my_choice === i ? ' (your vote)' : ''}`))));
    return fs;
  }
  const name = 'poll-' + it.id.slice(0, 10);
  p.options.forEach((o, i) => fs.append(h('label', { cls: 'check' }, h('input', { type: 'radio', name, value: i }), o.text)));
  fs.append(h('button', { onclick: async () => { const c = fs.querySelector('input:checked'); if (!c) return say('Pick an option first.'); try { await send('vote', { of: it.id, choice: Number(c.value) }); say('Vote counted'); const fresh = await client.get('/objects/' + it.id); fs.replaceWith(pollEl(fresh.item)); } catch (e) { say(e.message); } } }, 'Vote'));
  return fs;
}
function replyTo(it, art) {
  if (art.querySelector('form')) return art.querySelector('textarea').focus();
  const f = composer({ replyTo: it, onDone: (r) => { f.remove(); say('Reply posted'); } });
  art.append(f); f.querySelector('textarea').focus();
}
function editDream(it, art) {
  const ta = h('textarea', { id: 'edit-' + it.id, maxlength: 1000 }); ta.value = it.text;
  const f = h('form', { onsubmit: async (e) => { e.preventDefault(); try { await send('edit', { of: it.id, text: ta.value }); it.text = ta.value; it.edited_at = Date.now(); art.replaceWith(dreamEl(it)); say('Edited'); } catch (er) { f.append(errBox(er)); } } },
    h('label', { for: 'edit-' + it.id }, 'Edit your Dream'), ta, h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, 'Save edit'), h('button', { type: 'button', onclick: () => f.remove() }, 'Cancel')));
  art.append(f); ta.focus();
}
function reportForm(target, where, what) {
  if (where.querySelector('.report')) return;
  const sel = h('select', { id: 'rr-' + target.slice(0, 8) }, ['spam', 'bullying', 'sexual', 'self_harm', 'violence', 'other'].map((r) => h('option', { value: r }, r.replace('_', ' '))));
  const note = h('textarea', { id: 'rn-' + target.slice(0, 8), maxlength: 1000 });
  const f = h('form', { cls: 'report card', onsubmit: async (e) => { e.preventDefault(); try { await send('report', { of: target, reason: sel.value, note: note.value || undefined }); f.replaceWith(h('p', {}, 'Reported. A moderator will look at it. Thank you.')); say('Reported'); } catch (er) { f.append(errBox(er)); } } },
    h('label', { for: sel.id }, `Why are you reporting this ${what}?`), sel, h('label', { for: note.id }, 'Anything else moderators should know (optional)'), note,
    h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, 'Send report'), h('button', { type: 'button', onclick: () => f.remove() }, 'Cancel')));
  where.append(f); sel.focus();
}

// ---------- composer ----------
let composerN = 0;
function composer({ replyTo, onDone } = {}) {
  const n = ++composerN; const id = (s) => `c${n}-${s}`;
  const ta = h('textarea', { id: id('text'), maxlength: 1000, 'aria-describedby': id('count') });
  const count = h('p', { id: id('count'), cls: 'hint' }, '1000 characters left');
  ta.addEventListener('input', () => { count.textContent = `${1000 - [...ta.value].length} characters left`; });
  const cw = h('input', { type: 'text', id: id('cw'), maxlength: 200 });
  const speak = h('textarea', { id: id('speak'), maxlength: 1000, rows: 2 });
  const aud = h('select', { id: id('aud') }, h('option', { value: 'public' }, 'Everyone on this home'), h('option', { value: 'followers' }, 'Only my followers'));
  const when = h('input', { type: 'datetime-local', id: id('when') });
  const pollOpts = [1, 2, 3, 4].map((i) => h('input', { type: 'text', id: id('p' + i), maxlength: 80 }));
  const file = h('input', { type: 'file', id: id('file'), accept: 'image/jpeg,image/png,image/webp' });
  const alt = h('textarea', { id: id('alt'), maxlength: 1500, rows: 2, 'aria-describedby': id('alt-hint') });
  const errs = h('div', {});
  const f = h('form', { cls: 'card', onsubmit: async (e) => {
    e.preventDefault(); errs.replaceChildren(); const btn = f.querySelector('button.primary'); btn.disabled = true;
    try {
      const body = { text: ta.value, audience: aud.value };
      if (cw.value.trim()) body.cw = cw.value.trim();
      if (speak.value.trim()) body.speak = speak.value.trim();
      if (replyTo) body.reply_to = replyTo.id;
      if (when.value) body.post_at = new Date(when.value).getTime();
      const opts = pollOpts.map((p) => p.value.trim()).filter(Boolean);
      if (opts.length === 1) throw new Error('A poll needs at least 2 options.');
      if (opts.length >= 2) body.poll = { options: opts, closes_at: Date.now() + 864e5 };
      if (file.files[0]) {
        if (!alt.value.trim()) { alt.focus(); throw new Error('Add alt text: describe what is in the image so everyone can know what it shows.'); }
        say('Uploading image…');
        const m = await client.upload(file.files[0], alt.value.trim());
        body.media = [{ url: m.url, alt: m.alt }];
      }
      const r = await send('dream', body);
      say(r.queued ? 'Saved on this device. It will post when you are online.' : r.scheduled_for ? `Scheduled for ${new Date(r.scheduled_for).toLocaleString('en-US')}.` : 'Dream posted');
      f.reset(); count.textContent = '1000 characters left';
      onDone?.(r);
    } catch (er) { errs.append(errBox(er)); } finally { btn.disabled = false; }
  } },
    h('label', { for: id('text') }, replyTo ? `Reply to ${replyTo.by.name}` : 'Your Dream'), ta, count,
    h('details', {}, h('summary', {}, 'Image, content warning, poll and more'),
      h('label', { for: id('file') }, 'Image (JPEG, PNG or WebP, up to 5 MB)'), file,
      h('label', { for: id('alt') }, 'Alt text for the image (required with an image)'), h('p', { id: id('alt-hint'), cls: 'hint' }, 'Describe what is in the image. Location and camera details are removed from photos.'), alt,
      h('label', { for: id('cw') }, 'Content warning (optional)'), cw,
      h('label', { for: id('speak') }, 'How it should be read aloud (optional)'), speak,
      h('label', { for: id('aud') }, 'Who can see it'), aud,
      replyTo ? null : h('label', { for: id('when') }, 'Post later (optional)'), replyTo ? null : when,
      replyTo ? null : h('fieldset', {}, h('legend', {}, 'Poll (optional, 2 to 4 options, open for 1 day)'), pollOpts.map((p, i) => [h('label', { for: p.id }, `Option ${i + 1}`), p]))),
    errs, h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, replyTo ? 'Post reply' : 'Post Dream')));
  return f;
}

// ---------- views ----------
async function feedView(kind) {
  const label = kind === 'dreamline' ? 'Dreamline' : 'Discover';
  setView(kind, label);
  if (kind === 'dreamline') view.append(h('h2', { cls: 'sr-only' }, 'Write a Dream'), composer({ onDone: (r) => { if (r.object && !r.queued && !r.scheduled_for) loadInto(true); } }));
  view.append(h('h2', {}, kind === 'dreamline' ? 'Dreams from you and people you follow' : 'Everyone on this home'));
  const top = h('div', { id: 'feed-top' }); const list = h('div', { id: 'feed-list' }); const moreBtn = h('button', { hidden: true }, 'Load more Dreams');
  view.append(top, list, moreBtn);
  let next = null;
  async function loadInto(reset) {
    try {
      const r = await client.get('/feed/' + kind, reset ? {} : { before: next });
      if (reset) { list.replaceChildren(); pending[kind] = []; $('#new-btn')?.remove(); localStorage.setItem(LS.cache + kind, JSON.stringify(r)); }
      for (const it of r.items) list.append(dreamEl(it));
      next = r.next; moreBtn.hidden = !next;
      if (reset && !r.items.length) list.append(h('p', {}, kind === 'dreamline' ? 'Nothing here yet. Post a Dream, or follow people from Discover or Search.' : 'No public Dreams yet.'));
      return r.items.length;
    } catch (e) {
      if (e.code === 'offline' && reset) { const c = JSON.parse(localStorage.getItem(LS.cache + kind) || 'null'); status('You are offline. Showing the last copy saved on this device.'); if (c) for (const it of c.items) list.append(dreamEl(it)); }
      else list.append(errBox(e));
    }
  }
  moreBtn.onclick = async () => { const before = list.children.length; const n = await loadInto(false); say(`${plural(n || 0, 'more Dream')} loaded.`); list.children[before]?.querySelector('h3 a')?.focus(); };
  await loadInto(true);
}
async function threadView(id) {
  setView('dream', 'Dream');
  try {
    const t = await client.get(`/dreams/${id}/thread`);
    if (t.ancestors.length) { view.append(h('h2', {}, 'Earlier in the conversation')); for (const a of t.ancestors) view.append(dreamEl(a)); }
    view.append(h('h2', {}, 'The Dream'), dreamEl(t.dream));
    view.append(h('h2', {}, `Replies (${t.replies.length})`)); for (const r of t.replies) view.append(dreamEl(r));
  } catch (e) { view.append(errBox(e)); }
}
async function profileView(handle) {
  setView(handle === me.handle ? 'me' : 'profile', 'Profile');
  try {
    const { dreamor: d, counts: c } = await client.get('/dreamors/' + encodeURIComponent(handle));
    title.textContent = `${d.name}, @${d.handle}`; document.title = `${d.name} · Looscid`;
    const box = h('section', { cls: 'card', 'aria-label': 'About' },
      d.pronouns ? h('p', { cls: 'meta' }, d.pronouns) : null, d.bio ? h('p', { cls: 'text' }, d.bio) : null,
      h('p', { cls: 'meta' }, `${plural(c.dreams, 'Dream')}, ${plural(c.followers, 'follower')}, following ${c.following}. Joined ${ago(d.joined)}.${d.role ? ' ' + (d.role === 'owner' ? 'Owner of this home.' : 'Moderator.') : ''}`),
      h('p', { cls: 'meta' }, `Address: ${d.address}`));
    view.append(box);
    if (d.pubkey !== me.pubkey) {
      const acts = h('div', { cls: 'actions' });
      const fb = h('button', { 'aria-pressed': String(d.you.following), onclick: async () => { try { await send(d.you.following ? 'unfollow' : 'follow', { who: d.pubkey }); d.you.following = !d.you.following; fb.setAttribute('aria-pressed', String(d.you.following)); fb.textContent = d.you.following ? 'Following' : 'Follow'; say(d.you.following ? `Following ${d.name}` : `Unfollowed ${d.name}`); } catch (e) { say(e.message); } } }, d.you.following ? 'Following' : 'Follow');
      acts.append(fb);
      if (d.you.follows_you) acts.append(h('p', { cls: 'meta' }, 'Follows you.'));
      if (d.you.mutual) acts.append(h('a', { cls: 'btn', href: '#chat/' + d.pubkey }, `Chat with ${d.name}`));
      acts.append(h('button', { cls: 'danger', onclick: async () => { const b = d.you.blocked; if (!b && !confirm(`Block ${d.name}? You will not see each other and they cannot follow or Chat with you. They are not told.`)) return; try { await send(b ? 'unblock' : 'block', { who: d.pubkey }); say(b ? 'Unblocked' : 'Blocked'); profileView(handle); } catch (e) { say(e.message); } } }, d.you.blocked ? 'Unblock' : 'Block'));
      acts.append(h('button', { onclick: () => reportForm(d.pubkey, view, 'account') }, 'Report account'));
      view.append(acts);
    }
    view.append(h('h2', {}, 'Dreams'));
    const r = await client.get(`/dreamors/${d.pubkey}/dreams`);
    for (const it of r.items) view.append(dreamEl(it));
    if (!r.items.length) view.append(h('p', {}, 'No Dreams yet.'));
  } catch (e) { view.append(errBox(e)); }
}
async function searchView(q = '') {
  setView('search', 'Search');
  const inp = h('input', { type: 'search', id: 'q', value: q, autocomplete: 'off' });
  const res = h('div', {});
  const f = h('form', { role: 'search', onsubmit: async (e) => { e.preventDefault(); history.replaceState(null, '', '#search/' + encodeURIComponent(inp.value)); await run(); } },
    h('label', { for: 'q' }, 'Search people and Dreams'), inp, h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, 'Search')));
  view.append(f, res);
  async function run() {
    res.replaceChildren(); if (!inp.value.trim()) return;
    try {
      const r = await client.get('/search', { q: inp.value });
      res.append(h('h2', {}, `People (${r.dreamors.length})`), h('ul', { cls: 'plain' }, r.dreamors.map((d) => h('li', {}, h('a', { href: '#@' + d.handle }, `${d.name} @${d.handle}`), d.bio ? ` — ${d.bio}` : ''))));
      res.append(h('h2', {}, `Dreams (${r.dreams.length})`)); for (const it of r.dreams) res.append(dreamEl(it));
      say(`${plural(r.dreamors.length, 'person', 'people')} and ${plural(r.dreams.length, 'Dream')} found.`);
    } catch (e) { res.append(errBox(e)); }
  }
  // trending under the box
  try {
    const t = await client.get('/trending');
    if (t.tags.length || t.dreams.length) {
      view.append(h('h2', {}, 'Trending today'));
      if (t.tags.length) view.append(h('ul', { cls: 'plain' }, t.tags.map((x) => h('li', {}, h('a', { href: '#search/' + encodeURIComponent(x.tag) }, `#${x.tag}`), `, ${plural(x.count, 'Dream')}`))));
      for (const it of t.dreams.slice(0, 5)) view.append(dreamEl(it));
    }
  } catch {}
  if (q) await run(); else inp.focus();
}
async function alertsView() {
  setView('alerts', 'Inbox');
  try {
    const r = await client.get('/alerts');
    const ul = h('ul', { cls: 'plain' });
    for (const a of r.items) {
      let extra;
      if (a.kind === 'role_invite' && a.role_invite?.status === 'pending') {
        const answer = (accept) => async () => { try { await send('role_answer', { invite: a.role_invite.id, accept }); say(accept ? `You are now ${a.role_invite.role === 'admin' ? 'an admin' : 'a moderator'}.` : 'Invite declined.'); if (accept) await boot(); alertsView(); } catch (e) { say(e.message); } };
        extra = h('div', { cls: 'actions' }, h('button', { cls: 'primary', onclick: answer(true) }, 'Accept'), h('button', { onclick: answer(false) }, 'Decline'));
      } else extra = a.dream ? h('a', { href: '#dream/' + a.dream.id }, 'Open the Dream') : a.kind === 'chat' ? h('a', { href: '#chat/' + a.actor.pubkey }, 'Open the Chat') : h('a', { href: '#@' + a.actor.handle }, `Open ${a.actor.name}'s profile`);
      ul.append(h('li', { cls: 'card' }, h('p', {}, alertText(a), ' ', h('span', { cls: 'meta' }, ago(a.at))), extra));
    }
    view.append(r.items.length ? ul : h('p', {}, 'Nothing in your Inbox yet.'));
    await client.req('POST', '/alerts/seen'); bumpAlerts(0, true);
  } catch (e) { view.append(errBox(e)); }
}
function alertText(a) {
  const n = a.actor.name;
  if (a.kind === 'role_invite') return `${n} invited you to be ${a.role_invite?.role === 'admin' ? 'an admin' : 'a moderator'} of this home.${a.role_invite && a.role_invite.status !== 'pending' ? ` You ${a.role_invite.status} it.` : ''}`;
  if (a.kind === 'role_answer') return `${n} ${a.role_invite?.status || 'answered'} your ${a.role_invite?.role === 'admin' ? 'admin' : 'moderator'} invite.`;
  return { like: `${n} liked your Dream.`, redream: `${n} ReDreamed your Dream.`, reply: `${n} replied to your Dream.`, mention: `${n} mentioned you.`, follow: `${n} followed you.`, chat: `${n} sent you a Chat message.`, quote: `${n} quoted your Dream.` }[a.kind] || `${n}: ${a.kind}`;
}
async function chatsView() {
  setView('chats', 'Chats');
  view.append(h('p', { cls: 'hint' }, 'Chats are for mutuals (you follow each other). They are end-to-end encrypted: the server keeps a locked copy so they arrive even when you are offline, but it cannot read them. It can see who chats with whom and when.'));
  try {
    const r = await client.get('/chats');
    view.append(r.items.length ? h('ul', { cls: 'plain' }, r.items.map((c) => h('li', {}, h('a', { href: '#chat/' + c.with.pubkey }, `${c.with.name} @${c.with.handle}`), `, last message ${ago(c.last_at)}`))) : h('p', {}, 'No Chats yet. Open a mutual\'s profile to start one.'));
  } catch (e) { view.append(errBox(e)); }
}
async function appendChat(o, announce) {
  const log = $('#chatlog'); if (!log) return;
  let m; try { m = await client.openChat(o); } catch { m = { text: '(could not open this message)', from: o.by, at: o.at }; }
  const mine = m.from === me.pubkey;
  log.append(h('li', { cls: mine ? 'mine' : '' }, h('span', { cls: 'sr-only' }, mine ? 'You: ' : 'Them: '), m.text, h('span', { cls: 'sr-only' }, `, ${ago(m.at)}`)));
  if (announce) say(`New message: ${m.text}`);
}
async function chatView(pk) {
  setView('chat:' + pk, 'Chat');
  try {
    const { dreamor: d } = await client.get('/dreamors/' + pk);
    title.textContent = `Chat with ${d.name}`;
    const log = h('ol', { id: 'chatlog', cls: 'chatlog', 'aria-label': 'Messages, oldest first' }); view.append(log);
    const r = await client.get('/chats/' + pk); await storeObjects(r.items);
    for (const o of r.items) await appendChat(o);
    if (!r.items.length) log.append(h('li', {}, 'No messages yet.'));
    const ta = h('textarea', { id: 'chat-text', rows: 3, maxlength: 4000 });
    const f = h('form', { onsubmit: async (e) => { e.preventDefault(); if (!ta.value.trim()) return; try { const res = await client.sendChat(pk, ta.value); await storeObjects([res.object]); await appendChat(res.object); ta.value = ''; say('Sent'); } catch (er) { say(er.message); f.append(errBox(er)); } } },
      h('label', { for: 'chat-text' }, `Message to ${d.name}`), ta, h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, 'Send')));
    view.append(f);
  } catch (e) { view.append(errBox(e)); }
}
async function settingsView() {
  setView('settings', 'Settings');
  // profile
  const { me: m } = await client.get('/me').catch(() => ({ me }));
  const nm = h('input', { type: 'text', id: 's-name', value: m.name || '', maxlength: 50 }), bio = h('textarea', { id: 's-bio', maxlength: 300 }), pr = h('input', { type: 'text', id: 's-pro', value: m.pronouns || '', maxlength: 30 });
  bio.value = m.bio || '';
  view.append(h('h2', {}, 'Your profile'), h('form', { cls: 'card', onsubmit: async (e) => { e.preventDefault(); try { await send('profile', { name: nm.value, bio: bio.value, pronouns: pr.value, chats_from: 'mutuals' }); say('Profile saved'); } catch (er) { say(er.message); } } },
    h('label', { for: 's-name' }, 'Display name'), nm, h('label', { for: 's-bio' }, 'Bio'), bio, h('label', { for: 's-pro' }, 'Pronouns (optional)'), pr, h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, 'Save profile'))));
  // key backup
  const sk = client.sk; const phraseBox = h('div', {});
  view.append(h('h2', {}, 'Your LooscidID'), h('section', { cls: 'card', 'aria-label': 'LooscidID backup' },
    h('p', {}, 'Your LooscidID is your account. It lives on this device and is never sent to the server. Back it up: with it you can sign in on any device and everything syncs back. Without it, nobody can get your account back.'),
    h('p', { cls: 'meta' }, `Public key (safe to share): ${rem.npubEncode(me.pubkey)}`),
    h('div', { cls: 'actions' },
      h('button', { onclick: async () => { phraseBox.replaceChildren(h('p', {}, 'Your 24-word recovery phrase. Write it down or save it in your password manager. Anyone with these words can be you.'), h('p', { cls: 'phrase', tabindex: '-1', id: 'phrase' }, await rem.keyToPhrase(sk)), h('button', { onclick: () => phraseBox.replaceChildren() }, 'Hide recovery phrase')); $('#phrase').focus(); } }, 'Show recovery phrase'),
      h('button', { onclick: async () => { try { await navigator.clipboard.writeText(rem.nsecEncode(sk)); say('Secret key copied. Paste it somewhere safe.'); } catch { say('Copying did not work here. Use Show recovery phrase instead.'); } } }, 'Copy secret key (nsec)'),
      h('button', { onclick: async () => download('looscidid-backup.json', { kind: 'LooscidID backup', npub: rem.npubEncode(me.pubkey), nsec: rem.nsecEncode(sk), recovery_phrase: await rem.keyToPhrase(sk), home: location.host, made: new Date().toISOString(), note: 'Keep this file private. Anyone with it can sign in as you.' }) }, 'Download key backup file')),
    phraseBox));
  // backup file (Oct 31 2026, Carter's idea: one file with everything AND the key, locked with a passcode)
  view.append(h('h2', { id: 'backup-h' }, 'Backup file'), backupSection());
  // data
  view.append(h('h2', {}, 'Your data'), h('section', { cls: 'card', 'aria-label': 'Your data' },
    h('p', {}, 'Looscid is local-first and syncs through the Looscid server. This device keeps its own copy of everything you made, and you can take it all with you.'),
    h('div', { cls: 'actions' },
      h('button', { onclick: async () => { try { const n = await syncDown(); say(`Synced. ${plural(n, 'new item')}.`); } catch (e) { say(e.message); } } }, 'Sync now'),
      h('button', { onclick: async () => { const objs = await allObjects(); download(`looscid-${me.handle}-export.json`, { exported_at: new Date().toISOString(), home: location.host, me, objects: objs }); say(`Exported ${plural(objs.length, 'item')}.`); } }, 'Export everything (works offline)'))));
  // invites
  const invBox = h('div', {});
  view.append(h('h2', {}, 'Invites'), h('section', { cls: 'card', 'aria-label': 'Invites' }, invBox));
  async function loadInv() {
    try {
      const r = await client.get('/invites'); invBox.replaceChildren();
      invBox.append(h('p', {}, r.opens_at ? `You get ${r.per_user} invites after your first ${r.wait_days} days (on ${new Date(r.opens_at).toLocaleDateString('en-US')}).` : `Invites left: ${r.left}.`));
      if (r.left > 0) invBox.append(h('button', { cls: 'primary', onclick: async () => { try { const c = await client.req('POST', '/invites'); say(`New invite code ${c.code.split('').join(' ')}`); loadInv(); } catch (e) { say(e.message); } } }, 'Make an invite code'));
      if (r.invites.length) invBox.append(h('ul', { cls: 'plain' }, r.invites.map((i) => h('li', {}, h('span', { cls: 'phrase' }, i.code), i.used ? ` used by @${i.used_by?.handle || 'someone'}` : i.revoked ? ' revoked' : ' not used yet', !i.used && !i.revoked ? [' ', h('a', { href: `${location.origin}/#join=${i.code}` }, 'invite link')] : null))));
    } catch (e) { invBox.append(errBox(e)); }
  }
  loadInv();
  // theme + sign out
  const th = h('select', { id: 's-theme', onchange: () => { localStorage.setItem(LS.theme, th.value); applyTheme(); say('Theme changed'); } }, h('option', { value: '' }, 'Same as my device'), h('option', { value: 'dark' }, 'Dark'), h('option', { value: 'light' }, 'Light'));
  th.value = localStorage.getItem(LS.theme) || '';
  view.append(h('h2', {}, 'Look and sign out'), h('section', { cls: 'card', 'aria-label': 'Look and sign out' }, h('label', { for: 's-theme' }, 'Theme'), th,
    h('div', { cls: 'actions' }, h('button', { cls: 'danger', onclick: async () => { if (!confirm('Sign out and remove your LooscidID and copy from this device? Make sure you backed up your recovery phrase first.')) return; await client.req('POST', '/auth/logout').catch(() => {}); for (const k of Object.keys(localStorage)) if (k.startsWith('looscid.')) localStorage.removeItem(k); await clearLocal().catch(() => {}); location.hash = ''; location.reload(); } }, 'Sign out of this device'))));
}
// ---------- backup file (.looscid) ----------
// One file with your profile, Dreams, replies, Chats, likes, follows, settings AND your LooscidID key, locked with a
// passcode you choose (PBKDF2 + AES-GCM, see js/looscid-backup.js). The same file opens in the Looscid app.
function passFields(prefix, confirm) {
  const p1 = h('input', { type: 'password', id: prefix + '-pass', autocomplete: confirm ? 'new-password' : 'current-password', 'aria-describedby': prefix + '-pass-hint' });
  const p2 = confirm ? h('input', { type: 'password', id: prefix + '-pass2', autocomplete: 'new-password' }) : null;
  const els = [h('label', { for: prefix + '-pass' }, 'Passcode for the file'),
    h('p', { id: prefix + '-pass-hint', cls: 'hint' }, confirm ? 'At least 8 characters. Four short words work well. Nobody can recover it if you forget it.' : 'The passcode you chose when you saved the file.'), p1];
  if (p2) els.push(h('label', { for: prefix + '-pass2' }, 'Type the passcode again'), p2);
  return { p1, p2, els };
}
function myDreamsPlain(objs) {
  const gone = new Set(objs.filter((o) => o.type === 'delete' && o.by === me.pubkey).map((o) => o.body.of));
  const edits = {}; for (const o of objs) if (o.type === 'edit' && o.by === me.pubkey && (!edits[o.body.of] || edits[o.body.of].at < o.at)) edits[o.body.of] = o;
  return objs.filter((o) => o.type === 'dream' && o.by === me.pubkey && !gone.has(o.id)).sort((a, b) => a.at - b.at).map((o) => {
    const e = edits[o.id], b = o.body || {};
    const d = { id: o.id, at: o.at, text: e ? e.body.text : b.text || '', audience: b.audience === 'followers' ? 'followers' : 'public' };
    const cw = e ? e.body.cw : b.cw; if (cw) d.cw = cw; if (b.reply_to) d.reply_to = b.reply_to; return d;
  });
}
function backupSection() {
  const box = h('section', { cls: 'card', 'aria-labelledby': 'backup-h' });
  const f = passFields('bk', true); const err = h('div', {});
  box.append(
    h('p', {}, 'One file with everything: your profile, Dreams, replies, Chats, likes, follows, settings, and your LooscidID key. It opens here or in the Looscid app, on any device.'),
    h('p', { cls: 'warn', id: 'bk-warn' }, h('strong', {}, 'This file contains your key. '), 'Anyone who has the file and its passcode can be you, so keep it private. It is locked with a passcode you choose, and nobody can recover a forgotten passcode, not even this server.'),
    h('h3', {}, 'Save backup file'),
    h('form', { 'aria-describedby': 'bk-warn', onsubmit: async (e) => {
      e.preventDefault(); err.replaceChildren();
      const bad = backup.passcodeProblem(f.p1.value); if (bad) { err.append(h('p', { cls: 'error', role: 'alert' }, bad)); f.p1.focus(); return; }
      if (f.p1.value !== f.p2.value) { err.append(h('p', { cls: 'error', role: 'alert' }, "The two passcodes don't match. Type them again.")); f.p2.focus(); return; }
      const btn = e.submitter || e.target.querySelector('button'); btn.disabled = true; say('Making your backup file. This takes a few seconds.');
      try {
        let objs; try { const ex = await client.get('/export'); objs = ex.objects; await storeObjects(objs); } catch (x) { if (x.code !== 'offline') throw x; objs = await allObjects(); }
        const { me: m } = await client.get('/me').catch(() => ({ me }));
        const data = { from: 'home', key: { nsec: rem.nsecEncode(client.sk), pubkey: client.pubkey },
          profile: { name: m.name, handle: m.handle, bio: m.bio || '', pronouns: m.pronouns || '' }, server: { home: location.host, handle: m.handle },
          dreams: myDreamsPlain(objs), rem_objects: objs, app: null, home: { settings: { theme: localStorage.getItem(LS.theme) || '' } } };
        const text = await backup.lockBackup(data, f.p1.value);
        const name = backup.backupFileName(m.handle);
        backup.downloadBackup(name, text);
        f.p1.value = ''; f.p2.value = '';
        const msg = `Backup file saved as ${name}: ${plural(data.dreams.length, 'Dream')} and ${plural(objs.length, 'item')} in all. Keep it private.`;
        err.append(h('p', { cls: 'ok', tabindex: '-1' }, msg)); say(msg);
      } catch (x) { err.append(h('p', { cls: 'error', role: 'alert' }, x.message || String(x))); }
      finally { btn.disabled = false; }
    } }, ...f.els, err, h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, 'Save backup file'))),
    h('h3', {}, 'Restore from backup file'),
    restoreForm('s'));
  return box;
}
// What a file brings back on this home: Dreams and replies (with their original times), follows, likes, profile, theme.
async function restoreToHome(d, sk) {
  const pk = rem.pubkeyOf(sk);
  const objs = [];
  for (const o of Array.isArray(d.rem_objects) ? d.rem_objects : []) { try { if (o && o.by === pk && (await rem.verifyObject(o))) objs.push(o); } catch {} }
  const gone = new Set(objs.filter((o) => o.type === 'delete').map((o) => o.body.of));
  const dreams = objs.filter((o) => o.type === 'dream' && !gone.has(o.id)).sort((a, b) => a.at - b.at);
  const out = { imported: 0, skipped: 0, refused: 0, follows: 0, likes: 0 };
  for (let i = 0; i < dreams.length; i += 200) {
    const r = await client.req('POST', '/import', { objects: dreams.slice(i, i + 200) });
    out.imported += r.imported.length; out.skipped += r.skipped.length; out.refused += r.refused.length + r.needs_alt.length;
  }
  // newest edit of each Dream, signed again now (edits can't keep an old time)
  const edits = {}; for (const o of objs) if (o.type === 'edit' && (!edits[o.body.of] || edits[o.body.of].at < o.at)) edits[o.body.of] = o;
  for (const [of, e] of Object.entries(edits)) { if (gone.has(of)) continue; try { const cur = (await client.get('/objects/' + of)).item; if (cur && cur.text !== e.body.text) await client.send('edit', { of, text: e.body.text, cw: e.body.cw || undefined }); } catch {} }
  // follows and likes as they were last: signed again now with your key
  const fol = {}; for (const o of objs.filter((x) => x.type === 'follow' || x.type === 'unfollow').sort((a, b) => a.at - b.at)) fol[o.body.who] = o.type === 'follow';
  for (const [who, on] of Object.entries(fol)) if (on && who !== pk) { try { await client.send('follow', { who }); out.follows++; } catch {} }
  const likes = {}; for (const o of objs.filter((x) => x.type === 'react').sort((a, b) => a.at - b.at)) if (!gone.has(o.id)) likes[o.body.of] = true;
  for (const of of Object.keys(likes)) { try { const r = await client.send('react', { of, r: 'like' }); if (!r.duplicate) out.likes++; } catch {} }
  // profile, only when this home has none yet
  try {
    const { me: m } = await client.get('/me'); const p = d.profile || {};
    if ((!m.bio && p.bio) || ((!m.name || m.name === m.handle) && p.name && p.name !== m.name)) await client.send('profile', { name: p.name || m.name, bio: p.bio || m.bio || '', pronouns: p.pronouns || m.pronouns || '', chats_from: m.chats_from || 'mutuals' });
  } catch {}
  await storeObjects(objs).catch(() => {});
  if (d.home && d.home.settings && typeof d.home.settings.theme === 'string') { localStorage.setItem(LS.theme, d.home.settings.theme); applyTheme(); }
  const parts = [out.imported || !out.skipped ? `${plural(out.imported, 'Dream')} put back` : `your ${plural(out.skipped, 'Dream')} were already here`];
  if (out.skipped && out.imported) parts.push(`${out.skipped} already here`);
  if (out.follows) parts.push(plural(out.follows, 'follow'));
  if (out.likes) parts.push(plural(out.likes, 'like'));
  if (out.refused) parts.push(`${out.refused} couldn't go on this home (replies to Dreams that aren't here, or too long)`);
  return 'Backup restored: ' + parts.join(', ') + '.';
}
function restoreForm(prefix) {
  const file = h('input', { type: 'file', id: prefix + '-rfile', 'aria-describedby': prefix + '-rfile-hint' });
  const f = passFields(prefix + 'r', false); const err = h('div', {}); const joinBox = h('div', {});
  const form = h('form', { onsubmit: async (e) => {
    e.preventDefault(); err.replaceChildren(); joinBox.replaceChildren();
    if (!file.files || !file.files[0]) { err.append(h('p', { cls: 'error', role: 'alert' }, 'Choose your backup file first. It ends in .looscid.')); file.focus(); return; }
    const btn = e.submitter || form.querySelector('button'); btn.disabled = true; say('Opening your backup file.');
    try {
      const d = await backup.unlockBackup(await file.files[0].text(), f.p1.value);
      if (!d.key || !d.key.nsec) throw new Error('This backup file was saved without a key, so it can only be restored on the device that has your LooscidID.');
      const sk = await rem.parseSecret(d.key.nsec);
      if (client.token && me && me.pubkey) {
        if (rem.pubkeyOf(sk) !== me.pubkey) throw new Error('This backup file belongs to a different LooscidID. Sign out first, then restore it from the welcome page.');
        const msg = await restoreToHome(d, sk); f.p1.value = ''; err.append(h('p', { cls: 'ok', tabindex: '-1' }, msg)); say(msg); return;
      }
      client.setKey(sk);
      try { const r = await client.login(); const msg = await restoreToHome(d, sk); await signedIn(sk, r.token); setTimeout(() => { status(msg); say(msg); }, 1200); return; }
      catch (x) { if (x.code !== 'not_member') throw x; }
      // Not a member of this home yet: join with an invite, using the key from the file.
      const code = h('input', { type: 'text', id: prefix + '-rj-code', autocomplete: 'off', autocapitalize: 'characters' });
      const handle = h('input', { type: 'text', id: prefix + '-rj-handle', autocapitalize: 'none', value: (d.server && d.server.handle) || (d.profile && String(d.profile.handle || '').replace(/^@/, '')) || '' });
      const age = h('input', { type: 'checkbox', id: prefix + '-rj-age' }); const jErr = h('div', {});
      joinBox.append(h('p', { id: prefix + '-rj-msg', tabindex: '-1' }, 'Your backup file is open. Its LooscidID is not a member of this home yet. Join with an invite code to bring your things here.'),
        h('label', { for: prefix + '-rj-code' }, 'Invite code'), code, h('label', { for: prefix + '-rj-handle' }, 'Handle'), handle,
        h('label', { cls: 'check', for: prefix + '-rj-age' }, age, 'I am 13 or older'), jErr,
        h('div', { cls: 'actions' }, h('button', { type: 'button', cls: 'primary', onclick: async (ev) => {
          jErr.replaceChildren(); ev.target.disabled = true;
          try {
            if (!age.checked) { age.focus(); throw new Error('Check the box to confirm you are 13 or older.'); }
            const r = await client.join({ invite: code.value, handle: handle.value, name: (d.profile && d.profile.name) || handle.value });
            const msg = await restoreToHome(d, sk); await signedIn(sk, r.token); setTimeout(() => { status(msg); say(msg); }, 1200);
          } catch (x) { jErr.append(h('p', { cls: 'error', role: 'alert' }, x.message || String(x))); }
          finally { ev.target.disabled = false; }
        } }, 'Join and restore')));
      $('#' + prefix + '-rj-msg').focus();
    } catch (x) { err.append(h('p', { cls: 'error', role: 'alert' }, x.message || String(x))); f.p1.focus(); }
    finally { btn.disabled = false; }
  } },
    h('p', { cls: 'hint' }, 'Bring everything back from a .looscid backup file, made here or in the Looscid app. It signs this device in with the key inside the file.'),
    h('label', { for: prefix + '-rfile' }, 'Backup file'), h('p', { id: prefix + '-rfile-hint', cls: 'hint' }, 'The file ends in .looscid.'), file,
    ...f.els, err, h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, 'Restore from backup file')), joinBox);
  return form;
}
function download(name, data) { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' })), download: name }); document.body.append(a); a.click(); a.remove(); }

async function modView() {
  setView('mod', 'Moderation');
  if (!staff) return view.append(h('p', {}, 'Only moderators can open this page.'));
  try {
    const st = await client.get('/mod/stats');
    view.append(h('p', { cls: 'meta' }, `${plural(st.dreamors, 'Dreamor')}, ${plural(st.dreams, 'Dream')}, ${plural(st.open_reports, 'open report')}. Server memory ${st.memory_mb} MB.`));
    const r = await client.get('/mod/reports');
    view.append(h('h2', {}, `Open reports (${r.items.length})`));
    for (const rep of r.items) {
      const card = h('section', { cls: 'card', 'aria-label': `Report about a ${rep.kind}` });
      card.append(h('h3', {}, `${rep.reason.replace('_', ' ')} report about a ${rep.kind}`), h('p', { cls: 'meta' }, `From @${rep.by?.handle || 'someone'}, ${ago(rep.at)}.`), rep.note ? h('p', {}, `Note: ${rep.note}`) : null);
      const acts = h('div', { cls: 'actions' });
      const act = (target, action, label) => h('button', { onclick: async () => { try { await client.req('POST', '/mod/action', { target, action, note: 'via mod page' }); say(`${label}: done`); modView(); } catch (e) { say(e.message); } } }, label);
      if (rep.dream) { card.append(h('p', {}, `Dream by @${rep.dream.by.handle}: ${rep.dream.text || '(no text)'}`), rep.dream.hidden ? h('p', { cls: 'meta' }, 'This Dream is hidden.') : null); acts.append(act(rep.dream.id, rep.dream.hidden ? 'unhide' : 'hide', rep.dream.hidden ? 'Unhide Dream' : 'Remove Dream'), act(rep.dream.by.pubkey, 'suspend', `Suspend @${rep.dream.by.handle}`)); }
      if (rep.dreamor) { card.append(h('p', {}, `Account @${rep.dreamor.handle}${rep.dreamor.suspended ? ' (suspended)' : ''}`)); acts.append(act(rep.dreamor.pubkey, rep.dreamor.suspended ? 'unsuspend' : 'suspend', rep.dreamor.suspended ? 'Unsuspend' : `Suspend @${rep.dreamor.handle}`)); }
      if (rep.kind === 'chat') { card.append(h('p', {}, rep.evidence ? `Chat message from @${rep.chat_from?.handle}: ${rep.evidence.body?.text} (${rep.evidence_verified ? 'signature checked, it is real' : 'could not be verified'})` : 'Chat message (no copy attached).')); if (rep.chat_from) acts.append(act(rep.chat_from.pubkey, 'suspend', `Suspend @${rep.chat_from.handle}`)); }
      acts.append(act(rep.id, 'resolve', 'Mark report done'));
      card.append(acts); view.append(card);
    }
    if (!r.items.length) view.append(h('p', {}, 'No open reports.'));
    // role invites (admins and moderators are invited, and accept in their Inbox)
    const rh = h('input', { type: 'text', id: 'role-handle', autocomplete: 'off', autocapitalize: 'none' });
    const rr = h('select', { id: 'role-role' }, h('option', { value: 'mod' }, 'Moderator'), me.role === 'owner' ? h('option', { value: 'admin' }, 'Admin') : null);
    const rmsg = h('div', {});
    view.append(h('h2', {}, 'Invite a moderator or admin'), h('form', { cls: 'card', onsubmit: async (e) => { e.preventDefault(); rmsg.replaceChildren(); try { const r = await client.req('POST', '/mod/action', { target: rh.value.trim().replace(/^@/, '').toLowerCase(), action: 'invite_role', role: rr.value }); rmsg.append(h('p', {}, `Invite sent to @${r.to}. It shows up in their Inbox with Accept and Decline.`)); say('Role invite sent'); } catch (er) { rmsg.append(errBox(er)); } } },
      h('label', { for: 'role-handle' }, 'Their handle'), rh, h('label', { for: 'role-role' }, 'Role'), rr, rmsg, h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, 'Send role invite'))));
    const lg = await client.get('/mod/log');
    view.append(h('h2', {}, 'Role invites and moderation log'));
    view.append(lg.role_invites.length ? h('ul', { cls: 'plain' }, lg.role_invites.map((x) => h('li', {}, `@${x.to} invited as ${x.role} by @${x.by}, ${x.status}, ${ago(x.at)}`, x.status === 'accepted' ? [' ', h('button', { onclick: async () => { try { await client.req('POST', '/mod/action', { target: x.to, action: 'revoke_role' }); say(`Role taken away from @${x.to}`); modView(); } catch (e) { say(e.message); } } }, `Take role away from @${x.to}`)] : null))) : h('p', {}, 'No role invites yet.'));
    if (lg.log.length) view.append(h('details', {}, h('summary', {}, `Moderation log (${lg.log.length})`), h('ul', { cls: 'plain' }, lg.log.map((x) => h('li', {}, `${ago(x.at)}: @${x.by} ${x.action.replace(/_/g, ' ')} ${x.target.length === 64 ? '' : x.target}${x.note ? ` (${x.note})` : ''}`)))));
    const t = await client.get('/mod/tree');
    view.append(h('h2', {}, 'Members and who invited them'));
    const byInv = (pk) => t.dreamors.find((x) => x.pubkey === pk);
    view.append(h('ul', { cls: 'plain' }, t.dreamors.map((d) => h('li', {}, `@${d.handle}${d.role !== 'member' ? ` (${d.role})` : ''}${d.suspended ? ', suspended' : ''}, invited by ${d.invited_by ? '@' + (byInv(d.invited_by)?.handle || 'someone') : 'nobody (founder)'}, invited ${d.invites_used}`))));
  } catch (e) { view.append(errBox(e)); }
}

// ---------- signed-out: sign in / join ----------
function welcomeView(prefill = '') {
  setView('welcome', 'Looscid home');
  view.append(h('p', {}, 'Looscid runs on Rem. Local-first, syncs through the Looscid server: your LooscidID and your copy of everything stay on your device, and the server is the meeting spot so friends get your Dreams and Chats.'));
  view.append(h('p', {}, 'This home is invite-only and for people 13 and older. It does not ask for your email, phone number or location.'));
  view.append(h('section', { cls: 'card', 'aria-labelledby': 'why-h' }, h('h2', { id: 'why-h' }, 'Why Looscid has a server, and what it means for you'),
    h('ul', {},
      h('li', {}, 'Why: Looscid now has its own home, the Looscid server, so friends can find you, Chats reach you even when you are offline, and your Dreams follow you to any device.'),
      h('li', {}, 'Your Dreams still live on your device first and work offline.'),
      h('li', {}, 'Nothing uploads unless you say yes, and your LooscidID signs everything, so nobody can fake your Dreams.'),
      h('li', {}, 'You can export everything or stop syncing at any time in Settings.'))));
  // sign in
  const key = h('textarea', { id: 'in-key', rows: 3, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-describedby': 'in-key-hint' });
  const inErr = h('div', {});
  view.append(h('h2', {}, 'Sign in with your LooscidID'), h('form', { cls: 'card', onsubmit: async (e) => {
    e.preventDefault(); inErr.replaceChildren();
    try { const sk = await rem.parseSecret(key.value); client.setKey(sk); const r = await client.login(); await signedIn(sk, r.token); }
    catch (er) { inErr.append(errBox(er)); }
  } }, h('label', { for: 'in-key' }, 'Recovery phrase or secret key'), h('p', { id: 'in-key-hint', cls: 'hint' }, 'Paste your 24-word recovery phrase or your nsec key. It stays on this device.'), key, inErr, h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, 'Sign in'))));
  // restore from a backup file (made in the Looscid app or on this site)
  view.append(h('h2', { id: 'restore-h' }, 'Restore from a backup file'), h('section', { cls: 'card', 'aria-labelledby': 'restore-h' }, restoreForm('w')));
  // join
  const code = h('input', { type: 'text', id: 'j-code', value: prefill, autocomplete: 'off', autocapitalize: 'characters' });
  const handle = h('input', { type: 'text', id: 'j-handle', autocomplete: 'username', autocapitalize: 'none', 'aria-describedby': 'j-handle-hint' });
  const name = h('input', { type: 'text', id: 'j-name', maxlength: 50 });
  const own = h('textarea', { id: 'j-own', rows: 2, autocomplete: 'off', spellcheck: 'false', 'aria-describedby': 'j-own-hint' });
  const age = h('input', { type: 'checkbox', id: 'j-age' });
  const jErr = h('div', {});
  view.append(h('h2', {}, 'Join with an invite'), h('form', { cls: 'card', onsubmit: async (e) => {
    e.preventDefault(); jErr.replaceChildren();
    try {
      if (!age.checked) { age.focus(); throw new Error('Check the box to confirm you are 13 or older.'); }
      const sk = own.value.trim() ? await rem.parseSecret(own.value) : rem.newSecretKey();
      client.setKey(sk);
      const r = await client.join({ invite: code.value, handle: handle.value, name: name.value });
      await signedIn(sk, r.token, !own.value.trim());
    } catch (er) { jErr.append(errBox(er)); jErr.querySelector('p')?.focus?.(); }
  } },
    h('label', { for: 'j-code' }, 'Invite code'), code,
    h('label', { for: 'j-handle' }, 'Handle'), h('p', { id: 'j-handle-hint', cls: 'hint' }, '2 to 20 letters, numbers or underscores. People find you by it.'), handle,
    h('label', { for: 'j-name' }, 'Display name'), name,
    h('details', {}, h('summary', {}, 'I already have a LooscidID (from the Looscid app or Nostr)'), h('label', { for: 'j-own' }, 'Your recovery phrase or nsec key (optional)'), h('p', { id: 'j-own-hint', cls: 'hint' }, 'Leave empty and a new LooscidID is made for you on this device.'), own),
    h('label', { cls: 'check', for: 'j-age' }, age, 'I am 13 or older'),
    jErr, h('div', { cls: 'actions' }, h('button', { cls: 'primary' }, 'Join'))));
}
async function signedIn(sk, token, isNewKey) {
  localStorage.setItem(LS.key, rem.toHex(sk)); localStorage.setItem(LS.token, token);
  client.setKey(sk); client.token = token;
  await boot();
  if (isNewKey) { location.hash = '#settings'; say('Welcome! Back up your LooscidID now: choose Show recovery phrase.'); }
  else { location.hash = '#dreamline'; }
}

// ---------- start ----------
function applyTheme() { const t = localStorage.getItem(LS.theme); if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; }
async function boot() {
  const r = await client.get('/me');
  me = r.me; me.role = r.me.role || 'member'; staff = r.staff;
  $('#nav').hidden = false; $('#mod-link').hidden = !staff;
  connectLive(); flushOutbox();
  syncDown().catch(() => {});
  client.get('/alerts', { limit: 1 }).then((a) => bumpAlerts(a.unseen, true)).catch(() => {});
}
async function route() {
  const hsh = decodeURIComponent(location.hash.slice(1));
  status('');
  if (!client.token) { const j = /^join=(.+)$/.exec(hsh); welcomeView(j ? j[1] : ''); return focusTitle(); }
  if (!me) return;
  let x;
  if (!hsh || hsh === 'dreamline') await feedView('dreamline');
  else if (hsh === 'discover') await feedView('discover');
  else if ((x = /^search(?:\/(.*))?$/.exec(hsh))) await searchView(x[1] || '');
  else if (hsh === 'alerts') await alertsView();
  else if (hsh === 'chats') await chatsView();
  else if ((x = /^chat\/([0-9a-f]{64})$/.exec(hsh))) await chatView(x[1]);
  else if (hsh === 'me') await profileView(me.handle);
  else if ((x = /^@(.+)$/.exec(hsh))) await profileView(x[1]);
  else if ((x = /^dream\/([0-9a-f]{64})$/.exec(hsh))) await threadView(x[1]);
  else if (hsh === 'settings') await settingsView();
  else if (hsh === 'mod') await modView();
  else await feedView('dreamline');
  focusTitle();
}
window.addEventListener('hashchange', route);
applyTheme();
(async () => {
  const skHex = localStorage.getItem(LS.key), token = localStorage.getItem(LS.token);
  if (skHex && token) {
    client.setKey(rem.fromHex(skHex)); client.token = token;
    try { await boot(); }
    catch (e) {
      if (e.code === 'sign_in') { try { const r = await client.login(); localStorage.setItem(LS.token, r.token); await boot(); } catch { client.token = null; } }
      else if (e.code === 'offline') { me = { pubkey: client.pubkey, handle: 'me', name: 'me' }; $('#nav').hidden = false; status('You are offline. You can read what is saved on this device and write Dreams; they send when you are back.'); }
      else client.token = null;
    }
  }
  if (/^(\/classic)?\/mod(\/|$)/.test(location.pathname) && client.token) location.hash = '#mod';
  await route();
})();
