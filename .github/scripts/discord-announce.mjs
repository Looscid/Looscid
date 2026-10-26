// Looscid Discord announcements (runs in GitHub Actions, no packages, no outside services).
// Sends plain-text announcements to the Discord #announcements channel through the
// DISCORD_ANNOUNCE_WEBHOOK secret. Three kinds:
//   youtube  - new videos on youtube.com/@Looscid (public RSS feed, checked every 30 minutes)
//   release  - a new Looscid build on main (app/version.json build goes up)
//   manual   - a message (and optional link) typed into "Run workflow" (for example a new tweet)
// What was already announced lives in .github/announce-state.json so nothing repeats.
import fs from 'node:fs';

const STATE_FILE = '.github/announce-state.json';
const YT_CHANNEL = 'UC90ej7VEjNGYAUlwSG_4UVQ'; // youtube.com/@Looscid
const YT_FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL}`;
const CHANGELOG_PAGE = 'https://looscid.github.io/Looscid/changelog/';
const WEBHOOK = process.env.DISCORD_ANNOUNCE_WEBHOOK || '';
const DRY = process.env.DRY_RUN === '1';

const readState = () => {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return {}; }
};
const writeState = (s) => fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2) + '\n');

// Discord allows 2000 characters; stay well under it.
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

async function announce(text) {
  const content = clip(text.trim(), 1900);
  if (DRY) { console.log('[dry run] would announce:\n' + content); return; }
  if (!WEBHOOK) throw new Error('DISCORD_ANNOUNCE_WEBHOOK secret is missing');
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(WEBHOOK + '?wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // allowed_mentions: no @everyone/@here/role pings from feed text.
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });
    if (res.ok) { console.log('Announced: ' + content.split('\n')[0]); return; }
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') || 2);
      await new Promise((r) => setTimeout(r, Math.ceil(wait * 1000)));
      continue;
    }
    throw new Error(`Discord answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  throw new Error('Discord kept rate limiting');
}

const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, '&');

async function youtube(state) {
  let xml;
  try {
    const res = await fetch(YT_FEED, { headers: { 'User-Agent': 'Looscid-announcements' } });
    if (!res.ok) { console.log(`YouTube feed answered ${res.status}; trying again next run.`); return false; }
    xml = await res.text();
  } catch (e) { console.log('YouTube feed unreachable; trying again next run: ' + e.message); return false; }
  const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    id: (e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1],
    title: decode(((e.match(/<title>([^<]*)<\/title>/) || [])[1] || '').trim()),
    published: (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '',
  })).filter((v) => v.id);
  // First run ever: remember what is already there and announce nothing.
  if (!Array.isArray(state.youtube_seen)) {
    state.youtube_seen = videos.map((v) => v.id);
    console.log(`Seeded ${videos.length} existing videos; nothing announced.`);
    return true;
  }
  const fresh = videos.filter((v) => !state.youtube_seen.includes(v.id))
    .sort((a, b) => a.published.localeCompare(b.published));
  let changed = false;
  for (const v of fresh) {
    await announce(`New video: ${v.title || 'Looscid'} https://www.youtube.com/watch?v=${v.id}`);
    state.youtube_seen.push(v.id);
    changed = true;
  }
  state.youtube_seen = state.youtube_seen.slice(-100);
  if (!fresh.length) console.log('No new videos.');
  return changed;
}

// The newest CHANGELOG.md entry as one plain sentence-ish line (links reduced to their text).
function changelogSummary() {
  let md = '';
  try { md = fs.readFileSync('CHANGELOG.md', 'utf8'); } catch { return ''; }
  const m = md.match(/^## [^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
  if (!m) return '';
  const lines = m[1].split('\n').map((l) => l.trim())
    .filter((l) => l && !/^Released /.test(l) && !/^#/.test(l));
  const bullets = lines.filter((l) => /^[-*] /.test(l));
  const use = bullets.length ? bullets : lines;
  return use.map((l) => l.replace(/^[-*] /, ''))
    .map((l) => l.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, ''))
    .join(' ');
}

async function release(state) {
  const v = JSON.parse(fs.readFileSync('app/version.json', 'utf8'));
  const build = Number(v.build);
  if (typeof state.last_build !== 'number') {
    state.last_build = build;
    console.log(`Seeded build ${build}; nothing announced.`);
    return true;
  }
  if (!(build > state.last_build)) { console.log(`Build ${build} was already announced.`); return false; }
  const summary = clip(changelogSummary() || v.notes || '', 1200);
  // Round 7.43 (Carter: "Never abandon the old version text"): build 191's exact text, with the codename in front and a colon.
  const old = `Looscid ${v.version} (build ${build})`;
  await announce(`${v.codename ? `${v.codename}: ${old}` : old} is live: ${summary} ${CHANGELOG_PAGE}`);
  state.last_build = build;
  return true;
}

async function manual() {
  const message = (process.env.ANNOUNCE_MESSAGE || '').trim();
  const url = (process.env.ANNOUNCE_URL || '').trim();
  if (!message && !url) throw new Error('Type a message (and optionally a link) to announce.');
  await announce([message, url].filter(Boolean).join(' '));
}

const mode = process.argv[2] || 'all';
const state = readState();
let changed = false;
if (mode === 'manual') await manual();
if (mode === 'youtube' || mode === 'all') changed = (await youtube(state)) || changed;
if (mode === 'release' || mode === 'all') changed = (await release(state)) || changed;
if (changed) { writeState(state); console.log('State updated.'); }
