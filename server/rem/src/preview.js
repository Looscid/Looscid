// rem: GET /preview?url=<address>, the website preview behind a profile's website card (Nov 8 2026, Carter approved in
// Dreamor Council: "Website preview on profile"). The Looscid site is static and a browser can't read other websites, so
// Rem reads the page and answers ONLY its title, description and site name, as plain text:
//   { "ok": true, "url": "<where it ended up>", "title": "...", "description": "...", "site": "..." }
// Safety (this is a server fetching an address someone gave it, so it must not be tricked into calling places it shouldn't,
// which is called SSRF, server-side request forgery):
// - http and https only, on the normal ports (80 and 443), no user:password@ in the address;
// - no IP addresses or names for private, internal, loopback, link-local, carrier, multicast or reserved networks
//   (10.x, 127.x, 169.254.x, 172.16-31.x, 192.168.x, 100.64-127.x, ::1, fc00::/7, fe80::/10 and the rest), no "localhost",
//   no single-word names and no .local, .internal, .lan, .home.arpa;
// - the name is looked up first (DNS over HTTPS) and refused if ANY of its addresses is private (a name that points inside);
// - redirects are followed by hand, at most 3, and every hop is checked the same way;
// - a 5 second timeout for the whole thing, and at most 256 KB of the page is read (the title is near the top);
// - only HTML pages (text/html or application/xhtml+xml) are read; nothing else comes back;
// - no cookies or credentials are sent, and the page's words are cleaned and cut short before they're answered.
// A Cloudflare Worker can't reach private networks anyway; these checks are here so that never depends on the host.

const TIMEOUT_MS = 5000, MAX_BYTES = 256 * 1024, MAX_HOPS = 3;
const UA = "LooscidPreview/1.0 (+https://looscid.github.io/Looscid/)";
const DOH = "https://cloudflare-dns.com/dns-query";

// ---- addresses ----
function v4ToInt(s) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s); if (!m) return null;
  const p = m.slice(1).map(Number); if (p.some((x) => x > 255)) return null;
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3];
}
const V4_BLOCKED = [ // [first address, prefix length]
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
  ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24],
  ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
].map(([a, n]) => [v4ToInt(a), n]);
export function privateV4(s) {
  const x = v4ToInt(s); if (x === null) return true; // not a clean IPv4 address: refuse
  return V4_BLOCKED.some(([base, n]) => (n === 0 ? true : (x >>> (32 - n)) === (base >>> (32 - n))));
}
function v6Words(s) {
  s = s.replace(/^\[|\]$/g, "").toLowerCase(); if (s.includes("%")) return null; // zone ids: refuse
  let tail = [];
  const v4 = /(\d{1,3}(?:\.\d{1,3}){3})$/.exec(s);
  if (v4) { const x = v4ToInt(v4[1]); if (x === null) return null; tail = [x >>> 16, x & 0xffff]; s = s.slice(0, -v4[1].length); if (s.endsWith(":") && !s.endsWith("::")) s = s.slice(0, -1); }
  const parts = s.split("::"); if (parts.length > 2) return null;
  const head = parts[0] ? parts[0].split(":") : [], back = parts.length === 2 && parts[1] ? parts[1].split(":") : [];
  const want = 8 - tail.length, fill = parts.length === 2 ? want - head.length - back.length : 0;
  if (fill < 0 || (parts.length === 1 && head.length !== want)) return null;
  const words = head.concat(Array(fill).fill("0"), back).map((w) => (/^[0-9a-f]{1,4}$/.test(w) ? parseInt(w, 16) : NaN)).concat(tail);
  return words.length === 8 && words.every((w) => Number.isInteger(w)) ? words : null;
}
export function privateV6(s) {
  const w = v6Words(s); if (!w) return true;
  if (w.every((x) => x === 0)) return true;                                  // ::
  if (w.slice(0, 7).every((x) => x === 0) && w[7] === 1) return true;        // ::1
  if (w.slice(0, 5).every((x) => x === 0) && (w[5] === 0xffff || w[5] === 0)) // ::ffff:a.b.c.d and ::a.b.c.d
    return privateV4([w[6] >>> 8, w[6] & 255, w[7] >>> 8, w[7] & 255].join("."));
  if (w[0] === 0x64 && w[1] === 0xff9b) return privateV4([w[6] >>> 8, w[6] & 255, w[7] >>> 8, w[7] & 255].join(".")); // NAT64
  if ((w[0] & 0xfe00) === 0xfc00) return true;  // fc00::/7 unique local
  if ((w[0] & 0xffc0) === 0xfe80) return true;  // fe80::/10 link-local
  if ((w[0] & 0xffc0) === 0xfec0) return true;  // fec0::/10 old site-local
  if ((w[0] & 0xff00) === 0xff00) return true;  // ff00::/8 multicast
  if (w[0] === 0x2001 && w[1] === 0x0db8) return true; // documentation
  if (w[0] === 0x2002) return privateV4([w[1] >>> 8, w[1] & 255, w[2] >>> 8, w[2] & 255].join(".")); // 6to4
  if (w[0] === 0x2001 && w[1] === 0) return true; // Teredo
  if (w[0] === 0x100 && w[1] === 0 && w[2] === 0 && w[3] === 0) return true; // discard-only
  return false;
}
const isV4 = (h) => /^\d{1,3}(\.\d{1,3}){3}$/.test(h);
const isV6 = (h) => h.startsWith("[") || h.includes(":");
// Names that only mean something inside a network.
function badName(h) {
  if (!h || h.length > 253) return true;
  if (!h.includes(".")) return true; // single-word names like "localhost" or "router"
  return /(^|\.)(localhost|local|localdomain|internal|intranet|lan|home|corp|private|home\.arpa|in-addr\.arpa|ip6\.arpa|onion|test|invalid|example)$/i.test(h.replace(/\.$/, ""));
}

// Checks one address. Answers { ok: true, url } or { ok: false, error }.
export function checkUrl(raw) {
  let u; try { u = new URL(String(raw || "").trim()); } catch (e) { return { ok: false, error: "bad url" }; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return { ok: false, error: "only http and https" };
  if (u.username || u.password) return { ok: false, error: "bad url" };
  if (u.port && !((u.protocol === "http:" && u.port === "80") || (u.protocol === "https:" && u.port === "443"))) return { ok: false, error: "only normal ports" };
  const h = u.hostname.toLowerCase().replace(/\.$/, ""); // the URL parser already turns 0x7f.1 or 2130706433 into 127.0.0.1
  if (isV4(h)) { if (privateV4(h)) return { ok: false, error: "private address" }; }
  else if (isV6(h)) { if (privateV6(h)) return { ok: false, error: "private address" }; }
  else if (badName(h)) return { ok: false, error: "private address" };
  u.hash = "";
  return { ok: true, url: u.toString(), host: h, ip: isV4(h) || isV6(h) };
}

// Looks the name up and refuses it if any A or AAAA answer is private (or if nothing answers).
async function resolvesPublic(host, signal) {
  let any = false;
  for (const type of ["A", "AAAA"]) {
    const r = await fetch(DOH + "?name=" + encodeURIComponent(host) + "&type=" + type, { headers: { Accept: "application/dns-json" }, signal });
    if (!r.ok) throw new Error("dns");
    const j = await r.json();
    for (const a of j.Answer || []) {
      if (a.type === 1) { any = true; if (privateV4(String(a.data))) return false; }
      if (a.type === 28) { any = true; if (privateV6(String(a.data))) return false; }
    }
  }
  return any;
}

// ---- reading the page ----
async function readCapped(res) {
  if (!res.body) return "";
  const reader = res.body.getReader(), chunks = []; let n = 0;
  while (n < MAX_BYTES) {
    const { done, value } = await reader.read(); if (done) break;
    chunks.push(value); n += value.byteLength;
    // The title and description live in <head>; once it's closed there's nothing more to read.
    if (n > 4096 && /<\/head>|<body[\s>]/i.test(new TextDecoder().decode(value))) break;
  }
  try { await reader.cancel(); } catch (e) {}
  const all = new Uint8Array(Math.min(n, MAX_BYTES)); let at = 0;
  for (const c of chunks) { const take = Math.min(c.byteLength, all.length - at); if (take <= 0) break; all.set(c.subarray(0, take), at); at += take; }
  const cs = /charset=["']?([\w-]+)/i.exec(res.headers.get("content-type") || "");
  try { return new TextDecoder(cs ? cs[1] : "utf-8").decode(all); } catch (e) { return new TextDecoder().decode(all); }
}
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "\u2026", mdash: "\u2014", ndash: "\u2013", rsquo: "\u2019", lsquo: "\u2018", rdquo: "\u201d", ldquo: "\u201c", middot: "\u00b7", copy: "\u00a9", reg: "\u00ae", trade: "\u2122" };
function decode(s) {
  return String(s || "").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") { const c = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return c > 0 && c < 0x110000 && !(c >= 0xd800 && c <= 0xdfff) ? String.fromCodePoint(c) : ""; }
    return ENT[e.toLowerCase()] !== undefined ? ENT[e.toLowerCase()] : m;
  });
}
function clean(s, max) {
  let t = decode(String(s || "").replace(/<[^>]*>/g, " ")).replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, " ").replace(/\s+/g, " ").trim();
  if (t.length > max) t = t.slice(0, max - 1).replace(/\s+\S*$/, "") + "\u2026";
  return t;
}
function attr(tag, name) { const m = new RegExp("\\b" + name + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i").exec(tag); return m ? (m[2] ?? m[3] ?? m[4] ?? "") : null; }
export function parseMeta(html) {
  const head = String(html || "").slice(0, MAX_BYTES).replace(/<!--[\s\S]*?-->/g, "").replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const meta = {};
  for (const m of head.matchAll(/<meta\b[^>]*>/gi)) {
    const key = (attr(m[0], "property") || attr(m[0], "name") || "").toLowerCase().trim(), val = attr(m[0], "content");
    if (key && val != null && meta[key] === undefined) meta[key] = val;
  }
  const t = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(head);
  return {
    title: clean(meta["og:title"] || meta["twitter:title"] || (t ? t[1] : ""), 200),
    description: clean(meta["og:description"] || meta["twitter:description"] || meta["description"] || "", 300),
    site: clean(meta["og:site_name"] || meta["application-name"] || "", 80),
  };
}

// ---- the endpoint ----
export async function preview(raw) {
  const first = checkUrl(raw); if (!first.ok) return { status: 400, body: first };
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    let at = first;
    for (let hop = 0; hop <= MAX_HOPS; hop++) {
      if (!at.ip && !(await resolvesPublic(at.host, ctl.signal))) return { status: 400, body: { ok: false, error: "private address" } };
      const res = await fetch(at.url, { method: "GET", redirect: "manual", signal: ctl.signal,
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1", "Accept-Language": "en-US,en;q=0.8" } });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        try { await res.body?.cancel(); } catch (e) {}
        if (hop === MAX_HOPS) return { status: 502, body: { ok: false, error: "too many redirects" } };
        let next; try { next = new URL(res.headers.get("location"), at.url).toString(); } catch (e) { return { status: 502, body: { ok: false, error: "bad redirect" } }; }
        at = checkUrl(next); if (!at.ok) return { status: 400, body: at };
        continue;
      }
      if (!res.ok) { try { await res.body?.cancel(); } catch (e) {} return { status: 502, body: { ok: false, error: "site answered " + res.status } }; }
      const type = (res.headers.get("content-type") || "").toLowerCase();
      if (!/text\/html|application\/xhtml\+xml/.test(type)) { try { await res.body?.cancel(); } catch (e) {} return { status: 200, body: { ok: false, error: "not a web page" } }; }
      const m = parseMeta(await readCapped(res));
      if (!m.title) return { status: 200, body: { ok: false, error: "no title" } };
      return { status: 200, body: { ok: true, url: at.url, title: m.title, description: m.description, site: m.site }, cache: true };
    }
    return { status: 502, body: { ok: false, error: "too many redirects" } };
  } catch (e) {
    return { status: 504, body: { ok: false, error: ctl.signal.aborted ? "timed out" : "couldn't reach the site" } };
  } finally { clearTimeout(timer); }
}
