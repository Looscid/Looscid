/* Title hints on links in Looscid's static pages (Nov 1 2026, Carter, 3:23 PM: "no hints on the some Links").
   Every <a> without a title gets one, Ableton style: the link's own words stay its name, and the title says something
   different, so VoiceOver reads it as the hint after a pause. Never aria-describedby, never a Description label.
   Outside links: "Go to GitHub". Links that stay inside Looscid: "Goes to Settings", "Opens this article", "Goes back to
   Help Center". The rules are the same as core.js (lcTipPlace, lcTipInside), which does this for the app itself.
   build-help.mjs runs every Help Center page through hintLinks; the other site pages were stamped with it once
   (node .github/scripts/link-hints.mjs <file...>), so a new link on them needs a title written by hand, or a re-run. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LC_TIP_SITES = [
  [/(^|\.)(x|twitter)\.com$/, "X"], [/(^|\.)discord\.(gg|com)$/, "Discord"], [/(^|\.)github\.com$/, "GitHub"], [/(^|\.)github\.io$/, ""],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"], [/(^|\.)tiktok\.com$/, "TikTok"], [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)reddit\.com$/, "Reddit"], [/(^|\.)bsky\.app$/, "Bluesky"], [/(^|\.)facebook\.com$/, "Facebook"], [/(^|\.)threads\.net$/, "Threads"],
  [/(^|\.)twitch\.tv$/, "Twitch"], [/(^|\.)spotify\.com$/, "Spotify"], [/(^|\.)soundcloud\.com$/, "SoundCloud"], [/(^|\.)apple\.com$/, "Apple"],
  [/(^|\.)fonts\.google\.com$/, "Google Fonts"], [/(^|\.)fontawesome\.com$/, "Font Awesome"], [/(^|\.)cybertip\.org$/, "the CyberTipline"],
  [/(^|\.)openfontlicense\.org$/, "the Open Font License site"], [/(^|\.)seabios\.org$/, "SeaBIOS"], [/(^|\.)njump\.me$/, "njump"],
  [/(^|\.)primal\.net$/, "Primal"], [/(^|\.)nostr\.(com|how)$/, "Nostr"], [/(^|\.)wikipedia\.org$/, "Wikipedia"],
  [/mastodon|mstdn|fosstodon|hachyderm|mas\.to$/, "Mastodon"], [/(^|\.)mail\.tab\.bot$/, "email"],
];
const LC_TIP_PAGES = { "": "Home", dev: "the Dev Menu", help: "Help Center", "help-center": "Help Center", looscidid: "LooscidID", theme: "Appearance" };
function lcTipInside(u, here, name, raw, help) {
  if (/^#./.test(raw || "")) return "Jumps to that part of this page";
  const strip = function (p) { return p.replace(/^\/looscid(?=\/|$)/i, "").replace(/\/index\.html?$/i, "/").replace(/\.html?$/i, ""); };
  let p = strip(u.pathname); const q = u.searchParams.get("p");
  if (q && (p === "/" || p === "")) p = q;
  const segs = p.split("/").filter(Boolean).map(function (s) { try { return decodeURIComponent(s); } catch (e) { return s; } });
  const hp = strip(here.pathname).split("/").filter(Boolean), inHelp = hp.length && /^help(-center)?$/.test(hp[0]);
  if (!segs.length) {
    if (u.searchParams.get("u")) return "Opens their profile";
    let other = false; u.searchParams.forEach(function (v, k) { if (!/^(v|p|utm_.*)$/.test(k)) other = true; });
    return other ? "Opens it in Looscid" : "Goes to Home";
  }
  const s0 = segs[0].toLowerCase(), last = segs[segs.length - 1], lk = last.toLowerCase();
  if (s0 === "help" || s0 === "help-center") {
    if (segs.length === 1) return !inHelp ? "Goes to Help Center" : hp.length === 1 ? "Goes to the top of Help Center" : "Goes back to Help Center";
    const slug = segs[1].toLowerCase(), h = help || {};
    if (slug === "contact") return "Goes to Contact Us";
    if (u.searchParams.get("course")) return /^start\b/i.test(name || "") ? "Starts the course" : "Opens this lesson";
    if ((h.topics || []).indexOf(slug) >= 0) return "Opens this topic";
    if ((h.courses || []).indexOf(slug) >= 0) return "Opens this course";
    return "Opens this article";
  }
  if (s0 === "changelog") return "Goes to the changelog";
  if (s0 === "status") return "Goes to the status page";
  if (s0 === "os" || s0 === "projects") return segs.length === 1 && s0 === "os" ? "Goes to Looscid OS" : "Opens this app";
  if (s0 === "open") return "Goes to Home";
  const label = segs.length === 1 && lk === "alerts" ? "Inbox" : Object.prototype.hasOwnProperty.call(LC_TIP_PAGES, lk) ? LC_TIP_PAGES[lk] : last.replace(/[-_]+/g, " ");
  return "Goes to " + label + (s0 === "settings" && segs.length > 1 ? " settings" : "");
}
const FILE_DL = /\.(nvda-addon|apk|zip|wav|mp3|ogg|oga|flac|m4a|aac|gz|tgz|bz2|xz|7z|rar|bin|exe|msi|dmg|pkg|deb|rpm|iso|img)$/i;
const FILE_OPEN = /\.(txt|md|pdf|json|csv|xml)$/i;
function placeHint(u) {
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  if (FILE_DL.test(u.pathname)) return "Downloads the file";
  for (let i = 0; i < LC_TIP_SITES.length; i++) {
    if (LC_TIP_SITES[i][0].test(host)) {
      if (LC_TIP_SITES[i][1]) return "Go to " + LC_TIP_SITES[i][1];
      return host === "2three1y.github.io" ? "Go to Carter's website" : "Go to " + host;
    }
  }
  return "Go to " + host;
}
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", rsquo: "\u2019", lsquo: "\u2018", ldquo: "\u201c", rdquo: "\u201d", hellip: "\u2026", middot: "\u00b7" };
const dec = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENT[e.toLowerCase()] !== undefined ? ENT[e.toLowerCase()] : m));
const attr = (attrs, n) => { const m = new RegExp("\\s" + n + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)')", "i").exec(attrs); return m ? dec(m[2] !== undefined ? m[2] : m[3]) : null; };
export function linkName(attrs, inner) {
  const al = attr(attrs, "aria-label"); if (al && al.trim()) return al.replace(/\s+/g, " ").trim();
  let s = inner.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
  for (let k = 0; k < 3; k++) s = s.replace(/<(\w+)\b[^>]*\saria-hidden="true"[^>]*>(?:(?!<\1\b)[\s\S])*?<\/\1>/gi, " ");
  s = s.replace(/<img\b([^>]*)>/gi, (m, a) => / aria-hidden="true"/i.test(a) ? " " : " " + (attr(a, "alt") || "") + " ");
  s = s.replace(/<svg\b([^>]*)>[\s\S]*?<\/svg>/gi, (m, a) => " " + (attr(a, "aria-label") || "") + " ");
  return dec(s.replace(/<[^>]+>/g, " ")).replace(/[\ue000-\uf8ff]/g, "").replace(/\s+/g, " ").trim();
}
const norm = s => String(s || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
const isLooscid = u => u.hostname === "looscid.github.io" && /^\/looscid(\/|$)/i.test(u.pathname);
const samePage = (a, b) => a.origin === b.origin && a.pathname.replace(/index\.html?$/i, "") === b.pathname.replace(/index\.html?$/i, "") && a.search === b.search;
// What one link's hint is. opts: { help: {topics, courses}, ids: Set of ids on the page, titleOf(url) -> the target page's title }
export function linkHint(raw, name, pageUrl, opts) {
  opts = opts || {}; raw = String(raw || "").trim(); if (!raw) return null;
  const here = new URL(pageUrl);
  const hashRoute = () => /^(open|back|continue|go)\b/i.test(name) || !name ? "Goes to that page" : "Goes to " + name;
  if (raw === "#" || /^#top$/i.test(raw)) return "Goes to the top of this page";
  if (raw[0] === "#") return opts.ids && !opts.ids.has(raw.slice(1)) ? hashRoute() : "Jumps to that part of this page";
  if (/^mailto:/i.test(raw)) return "Writes an email";
  if (/^tel:/i.test(raw)) return "Calls this number";
  let u; try { u = new URL(raw, here); } catch (e) { return null; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (samePage(u, here) && u.hash) return hashRoute();
  const inside = isLooscid(u) || u.origin === here.origin;
  if (!inside) return placeHint(u);
  if (FILE_DL.test(u.pathname)) return "Downloads the file";
  if (FILE_OPEN.test(u.pathname)) return "Opens the file";
  let rel = isLooscid(u) ? u.pathname.replace(/^\/looscid/i, "").split("/").filter(Boolean) : null, tu = u;
  const pq = u.searchParams.get("p");
  if (rel && !rel.length && pq && pq[0] === "/") { tu = new URL("/Looscid" + pq.replace(/\/?$/, "/"), u.origin); rel = tu.pathname.replace(/^\/looscid/i, "").split("/").filter(Boolean); }
  // Carter's other projects inside the repo (os/, projects/) and pages that are not Looscid's: the page's own title.
  if (!rel || (rel.length > 1 && /^(os|projects)$/i.test(rel[0]))) {
    const t = opts.titleOf && opts.titleOf(u);
    if (t && norm(t) !== norm(name) && norm("Goes to " + t) !== norm(name)) return "Goes to " + t;
    return rel && (rel.length > 2 || /^projects$/i.test(rel[0])) ? "Opens this app" : "Opens this page";
  }
  // A Looscid page with its own link card page: that page's title is the page's name in the app ("Appearance").
  const s0 = (rel[0] || "").toLowerCase();
  if (rel.length && !/^(help|help-center|changelog|status|status\.html|os|projects|open\.html|404\.html)$/.test(s0) && /^[A-Z]/.test(rel[0])) {
    const t = opts.titleOf && opts.titleOf(tu);
    if (t && norm("Goes to " + t) !== norm(name)) return "Goes to " + t;
  }
  return lcTipInside(u, here, name, raw, opts.help);
}
const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
// Adds the hints to one page's HTML. Links that already have a title keep it.
export function hintLinks(html, pageUrl, opts) {
  opts = Object.assign({}, opts || {});
  if (!opts.ids) opts.ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (m, attrs, inner) => {
    if (/\stitle\s*=/i.test(attrs)) return m;
    const raw = attr(attrs, "href"); if (raw === null) return m;
    const name = linkName(attrs, inner);
    let tip = linkHint(raw, name, pageUrl, opts);
    if (!tip || !name || norm(tip) === norm(name)) return m;
    return "<a" + attrs.replace(/(\shref\s*=\s*("[^"]*"|'[^']*'))/i, '$1 title="' + esc(tip) + '"') + ">" + inner + "</a>";
  });
}
// node .github/scripts/link-hints.mjs <file...>: stamps those files in place (app/ pages, as served at looscid.github.io/Looscid/).
const here = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === here) {
  const APP = path.resolve(path.dirname(here), "..", "..", "app");
  const titleOf = u => {
    if (!isLooscid(u)) return null;
    let f = path.join(APP, decodeURIComponent(u.pathname.replace(/^\/looscid\/?/i, "")));
    if (!/\.html?$/i.test(f)) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) return null;
    const m = /<title>([^<]*)<\/title>/i.exec(fs.readFileSync(f, "utf8"));
    return m ? dec(m[1]).replace(/\s+[-|\u2013\u2014]\s+.*$/, "").trim() || null : null;
  };
  let n = 0;
  for (const f of process.argv.slice(2)) {
    const abs = path.resolve(f), relp = path.relative(APP, abs).split(path.sep).join("/");
    const url = abs.startsWith(APP + path.sep) ? "https://looscid.github.io/Looscid/" + relp.replace(/(^|\/)index\.html$/, "$1") : "https://looscid-server.local/" + path.basename(abs).replace(/^index\.html$/, "");
    const before = fs.readFileSync(abs, "utf8"), after = hintLinks(before, url, { titleOf });
    if (after !== before) { fs.writeFileSync(abs, after); n++; }
  }
  console.log("link hints written in " + n + " files");
}
