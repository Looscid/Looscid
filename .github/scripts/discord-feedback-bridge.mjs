// Discord #feedback -> GitHub issues bridge (LooscidBOT). Runs from .github/workflows/discord-feedback-bridge.yml.
// Each new message in the Discord channel becomes one GitHub issue (or a comment on an open issue that already tracks
// the same thing), and LooscidBOT answers in a thread under the message with the link.
// No state file: a message counts as done once LooscidBOT has posted an issue link in its thread.
// Messages older than DISCORD_BUGS_START_ID (a Discord message ID, repo variable) are ignored, so old history is never imported.
// Plain Node 20, no packages.

const env = process.env;
const DISCORD_TOKEN = env.DISCORD_BOT_TOKEN;
const CHANNEL = env.DISCORD_BUGS_CHANNEL_ID;
const START = env.DISCORD_BUGS_START_ID || "0";
const GH_TOKEN = env.GH_TOKEN;
const REPO = env.GITHUB_REPOSITORY || "Looscid/Looscid";
const DRY = env.DRY_RUN === "true";
const D = "https://discord.com/api/v10";
const G = "https://api.github.com";

if (!DISCORD_TOKEN || !CHANNEL || !GH_TOKEN) {
  console.log("Missing DISCORD_BOT_TOKEN, DISCORD_BUGS_CHANNEL_ID or GH_TOKEN. Nothing to do.");
  process.exit(DISCORD_TOKEN && CHANNEL ? 1 : 0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function discord(method, path, body) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(D + path, {
      method,
      headers: { Authorization: "Bot " + DISCORD_TOKEN, "Content-Type": "application/json", "User-Agent": "LooscidBOT (https://github.com/Looscid/Looscid, 1)" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) { const j = await res.json().catch(() => ({})); await sleep(Math.ceil((j.retry_after || 1) * 1000) + 250); continue; }
    const text = await res.text();
    if (!res.ok) throw new Error(`Discord ${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
    return text ? JSON.parse(text) : null;
  }
  throw new Error(`Discord ${method} ${path} kept rate limiting`);
}

async function gh(method, path, body) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(G + path, {
      method,
      headers: { Authorization: "Bearer " + GH_TOKEN, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "LooscidBOT" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if ((res.status === 403 || res.status === 429) && /rate limit/i.test(text)) { await sleep(20000); continue; }
    if (!res.ok) throw new Error(`GitHub ${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
    return text ? JSON.parse(text) : null;
  }
  throw new Error(`GitHub ${method} ${path} kept rate limiting`);
}

// ---------- labels ----------
const LABELS = {
  discord: { name: "from Discord", color: "5865F2", description: "Reported in the Looscid Discord, opened by LooscidBOT" },
  bug: { name: "bug", color: "d73a4a", description: "Something isn't working" },
  feature: { name: "enhancement", color: "a2eeef", description: "New feature or request" },
  feedback: { name: "feedback", color: "c5def5", description: "General feedback about Looscid" },
};
async function ensureLabels() {
  const have = new Set((await gh("GET", `/repos/${REPO}/labels?per_page=100`)).map((l) => l.name.toLowerCase()));
  for (const l of Object.values(LABELS)) {
    if (have.has(l.name.toLowerCase())) continue;
    console.log(`Creating label "${l.name}"`);
    if (!DRY) await gh("POST", `/repos/${REPO}/labels`, l);
  }
}

// ---------- reading a report ----------
const BUG_RE = /\b(crash\w*|broke\w*|bug\w*|glitch\w*|errors?|freez\w*|frozen|stuck|fail\w*|wrong|blank|lag\w*|hangs?|not working|not work|doesn'?t work|does not work|isn'?t working|is not working|won'?t (load|open|work|send|play|show)|can'?t (open|load|send|log ?in|sign ?in|see|hear|find|tap|click)|stopped working|nothing happens|does nothing|doesn'?t (load|open|show|play|send|respond|save)|not (loading|showing|opening|responding|saving)|keeps? (closing|crashing|reloading))\b/i;
const SR_BUG_RE = /\b(voice ?over|screen ?reader|talkback|nvda|jaws|narrator|braille)\b[^.!?\n]{0,60}\b(wrong|doesn'?t|does not|skips?|silent|not|twice|repeats?|reads)\b/i;
const FEATURE_RE = /\b(add|adding|could you|can you (add|make)|please make|make it|wish|would be (cool|nice|great|awesome|good)|it would be|idea|feature|suggest\w*|request|option to|should have|support for|i want|let us)\b/i;
function classify(text) {
  if (BUG_RE.test(text) || SR_BUG_RE.test(text)) return "bug";
  if (FEATURE_RE.test(text)) return "feature";
  return "feedback";
}
function findBuild(text) {
  const m = text.match(/\bbuild\s*#?\s*(\d{2,4})\b/i) || text.match(/\b(20\d\d\.\d+\.\d+)\b/) || text.match(/\b\(\s*(\d{3})\s*\)/);
  return m ? m[1] : "";
}
function findDevice(text) {
  const found = [];
  const re = /\b(iphone(\s?\d+\w*)?|ipad|ios|android|pixel|samsung|galaxy|mac(book)?|macos|windows|linux|chromebook|chrome ?os|safari|chrome|firefox|edge|brave|opera)\b/gi;
  for (const m of text.matchAll(re)) { const v = m[0]; if (!found.some((f) => f.toLowerCase() === v.toLowerCase())) found.push(v); }
  return found.join(", ");
}
function findScreenReader(text) {
  const m = text.match(/\b(voice ?over|talkback|nvda|jaws|narrator|braille( display)?|screen ?reader)\b/i);
  return m ? m[0] : "";
}
function hasSteps(text) {
  return /(^|\n)\s*(\d+[.)]|[-*•])\s+\S/.test(text) || /\b(steps?|when i|after i|if i|every time i|whenever i|then i|first i)\b/i.test(text);
}

// ---------- duplicate check ----------
const STOP = new Set(("a an and are as at be been but by can could did do does doesnt dont for from get got had has have he her his how i if im in into is isnt it its ive just like me my no not now of on or our out please so some still that the their them then there this to too u up us very was wasnt we were what when where which while who why will with wont would you your yes yeah hey hi hello thanks thank lol " +
  "looscid app bug bugs issue issues problem report reported discord happen happens happened thing things also really maybe pretty kinda sorta").split(/\s+/));
function tokens(text) {
  const out = new Set();
  for (let w of String(text).toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[’']/g, "").split(/[^\p{L}\p{N}]+/u)) {
    if (w.length < 3 || STOP.has(w) || /^\d+$/.test(w)) continue;
    if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
    else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
    else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
    if (w.length >= 3 && !STOP.has(w)) out.add(w);
  }
  return out;
}
function issueText(issue) {
  // Leave out the template lines and the build/device footer so they don't count as a match.
  const body = String(issue.body || "").split(/\n---\n/)[0].replace(/\*\*[^*]+\*\*/g, " ").replace(/_[^_\n]+_/g, " ");
  return { title: tokens(issue.title.replace(/^(bug|feature request|feedback):/i, "")), all: tokens(issue.title + " " + body.slice(0, 2000)) };
}
async function findSimilar(text, selfMessageId) {
  const m = tokens(text);
  if (m.size < 3) return { strong: null, possible: null };
  const words = [...m].sort((a, b) => b.length - a.length).slice(0, 6);
  const q = `repo:${REPO} is:issue is:open ${words.join(" OR ")}`;
  const res = await gh("GET", `/search/issues?per_page=20&q=${encodeURIComponent(q)}`);
  let strong = null, possible = null;
  for (const issue of res.items || []) {
    if (issue.pull_request) continue;
    if (String(issue.body || "").includes(selfMessageId)) continue;
    const t = issueText(issue);
    let shared = 0; for (const w of m) if (t.all.has(w)) shared++;
    let titleHits = 0; for (const w of t.title) if (m.has(w)) titleHits++;
    const union = m.size + t.all.size - shared;
    const jacc = union ? shared / union : 0, cover = shared / m.size, titleCover = t.title.size ? titleHits / t.title.size : 0;
    const score = cover + jacc + titleCover;
    console.log(`  compare #${issue.number}: shared ${shared}, cover ${cover.toFixed(2)}, jaccard ${jacc.toFixed(2)}, title ${titleCover.toFixed(2)}`);
    // Strict on purpose: merging two different bugs is worse than one extra issue.
    if (m.size >= 4 && shared >= 4 && cover >= 0.6 && (titleCover >= 0.6 || jacc >= 0.4)) {
      if (!strong || score > strong.score) strong = { issue, score };
    } else if (shared >= 3 && cover >= 0.35) {
      if (!possible || score > possible.score) possible = { issue, score };
    }
  }
  return { strong: strong && strong.issue, possible: possible && possible.issue };
}

// ---------- writing ----------
const quote = (text) => text.split("\n").map((l) => "> " + l).join("\n");
function titleFor(kind, text) {
  const first = text.replace(/\s+/g, " ").trim();
  const short = first.length > 70 ? first.slice(0, 67).replace(/\s+\S*$/, "") + "..." : first;
  return ({ bug: "Bug: ", feature: "Feature request: ", feedback: "Feedback: " })[kind] + short;
}
function reporterLine(m, link) {
  const a = m.author;
  const name = a.global_name && a.global_name !== a.username ? `${a.global_name} (@${a.username})` : `@${a.username}`;
  return `Reported on Discord by ${name} in #${CHANNEL_NAME}: ${link}`;
}
function attachmentsLine(m) {
  return (m.attachments || []).length ? "\nAttachments: " + m.attachments.map((x) => `[${x.filename}](${x.url})`).join(", ") : "";
}
function bodyFor(kind, m, text, link, info, related) {
  const footer = [
    "---",
    "Build: " + (info.build || "not given"),
    "Device: " + (info.device || "not given"),
    reporterLine(m, link) + attachmentsLine(m),
    related ? `Possibly related: #${related.number}` : "",
    "",
    `<sub>Opened by LooscidBOT from the Looscid Discord. Discord message ID: ${m.id}</sub>`,
  ].filter((l, i, arr) => l !== "" || i === arr.length - 2);
  if (kind !== "bug") return [quote(text), "", ...footer].join("\n");
  return [
    "**What happened?**", quote(text), "",
    "**What did you expect to happen?**", "_Not given in the Discord report._", "",
    "**How can I make it happen again?**", info.steps ? "_See the report above._" : "_Not given yet. LooscidBOT asked for the steps in the Discord thread._", "",
    "**Screen reader or braille display (if any):**", info.sr || "_Not given._", "",
    ...footer,
  ].join("\n");
}
function missingAsk(info) {
  const miss = [];
  if (!info.build) miss.push("your Looscid build (About shows it)");
  if (!info.device) miss.push("your device and browser");
  if (!info.steps) miss.push("the steps to make it happen");
  if (!miss.length) return "";
  const list = miss.length === 1 ? miss[0] : miss.slice(0, -1).join(", ") + " and " + miss[miss.length - 1];
  return `\nCould you reply here with ${list}? That makes it a lot faster to fix.`;
}

let CHANNEL_NAME = "feedback";
let BOT_ID = "";
let GUILD = "";

async function alreadyHandled(m) {
  if (!m.thread) return { done: false, threadId: null };
  const msgs = await discord("GET", `/channels/${m.thread.id}/messages?limit=50`);
  const done = msgs.some((x) => x.author.id === BOT_ID && /github\.com\/[^/\s]+\/[^/\s]+\/issues\/\d+/.test(x.content));
  return { done, threadId: m.thread.id };
}

async function existingIssueFor(messageId) {
  // A run that died between opening the issue and replying in Discord: find what it opened instead of opening it twice.
  const recent = await gh("GET", `/repos/${REPO}/issues?state=all&labels=${encodeURIComponent(LABELS.discord.name)}&sort=created&direction=desc&per_page=50`);
  return recent.find((i) => String(i.body || "").includes(messageId)) || null;
}

async function handle(m) {
  const text = (m.content || "").trim();
  const link = `https://discord.com/channels/${GUILD}/${CHANNEL}/${m.id}`;
  const { done, threadId: existingThread } = await alreadyHandled(m);
  if (done) return;
  console.log(`Message ${m.id} from @${m.author.username}: ${JSON.stringify(text.slice(0, 120))}`);

  const kind = classify(text);
  const info = { build: findBuild(text), device: findDevice(text), sr: findScreenReader(text), steps: hasSteps(text) };
  console.log(`  kind ${kind}, build "${info.build}", device "${info.device}", steps ${info.steps}`);

  let threadId = existingThread;
  if (!threadId) {
    const name = (titleFor(kind, text).slice(0, 95)) || "Report";
    console.log(`  creating thread "${name}"`);
    if (!DRY) threadId = (await discord("POST", `/channels/${CHANNEL}/messages/${m.id}/threads`, { name, auto_archive_duration: 10080 })).id;
  }

  let reply;
  const prior = await existingIssueFor(m.id);
  if (prior) {
    console.log(`  already opened as #${prior.number}`);
    reply = `Thanks! This is on GitHub now: ${prior.html_url}`;
  } else {
    const { strong, possible } = await findSimilar(text, m.id);
    if (strong) {
      const comments = await gh("GET", `/repos/${REPO}/issues/${strong.number}/comments?per_page=100`);
      if (!comments.some((c) => String(c.body || "").includes(m.id))) {
        const a = m.author;
        const who = a.global_name && a.global_name !== a.username ? `${a.global_name} (@${a.username})` : `@${a.username}`;
        const body = `Also reported on Discord by ${who}: ${link}\n\n${quote(text)}${attachmentsLine(m)}\n\n<sub>Added by LooscidBOT. Discord message ID: ${m.id}</sub>`;
        console.log(`  strong match #${strong.number}: adding a comment`);
        if (!DRY) await gh("POST", `/repos/${REPO}/issues/${strong.number}/comments`, { body });
      }
      reply = `Already tracked: ${strong.html_url}. Added your report to it.`;
    } else {
      const labels = [LABELS.discord.name, LABELS[kind].name];
      const issue = { title: titleFor(kind, text), body: bodyFor(kind, m, text, link, info, possible), labels };
      console.log(`  opening issue "${issue.title}" [${labels.join(", ")}]${possible ? `, possibly related #${possible.number}` : ""}`);
      const made = DRY ? { html_url: "(dry run)", number: 0 } : await gh("POST", `/repos/${REPO}/issues`, issue);
      reply = `Thanks! I opened GitHub issue #${made.number} for this: ${made.html_url}`;
      if (kind === "bug") reply += missingAsk(info);
    }
  }
  console.log(`  thread reply: ${JSON.stringify(reply)}`);
  if (!DRY) await discord("POST", `/channels/${threadId}/messages`, { content: reply, flags: 4, allowed_mentions: { parse: [] } });
}

async function main() {
  const channel = await discord("GET", `/channels/${CHANNEL}`);
  CHANNEL_NAME = channel.name; GUILD = channel.guild_id;
  BOT_ID = (await discord("GET", "/users/@me")).id;
  const msgs = await discord("GET", `/channels/${CHANNEL}/messages?limit=100`);
  const todo = msgs
    .filter((m) => BigInt(m.id) > BigInt(START))
    .filter((m) => !m.author.bot && !m.webhook_id && m.type === 0) // plain messages only: no bots, no replies, no system messages
    .filter((m) => {
      const words = (m.content || "").trim().split(/\s+/).filter(Boolean).length;
      if (!m.content && !(m.attachments || []).length) { console.log(`Message ${m.id} has no text (is the Message Content intent on?). Skipped.`); return false; }
      return words >= 4 || (m.attachments || []).length > 0; // "same", "thanks" and other chat don't become issues
    })
    .sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
  console.log(`#${CHANNEL_NAME}: ${msgs.length} recent messages, ${todo.length} to look at${DRY ? " (dry run: nothing is written)" : ""}.`);
  if (!todo.length) return;
  await ensureLabels();
  let failed = 0;
  for (const m of todo) {
    try { await handle(m); } catch (e) { failed++; console.log(`  FAILED: ${e.message}`); }
  }
  if (failed) { console.log(`${failed} message(s) failed; they are tried again next run.`); process.exit(1); }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
