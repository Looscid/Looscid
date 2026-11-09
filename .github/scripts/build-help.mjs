#!/usr/bin/env node
/* Build 195 (Carter, Oct 28 2026): makes the Help Center website from app/js/helpdata.js, the same words the app's Help Center
   shows. Run it after changing helpdata.js:   node .github/scripts/build-help.mjs
   It writes plain pages into app/help-center/. GitHub Pages serves them at looscid.github.io/Looscid/help/ (pages.yml copies
   help-center to help when it publishes; the folder isn't called help in the repo because app/Help/ already exists, and on
   Mac and Windows help and Help would be the same folder). Every collection, article, course and Contact Us has its own
   address: /help/getting-started/, /help/make-a-looscidid/, /help/looscid-basics/, /help/contact/.
   --check: change nothing; fail if a page is missing or out of date (the Validate workflow runs this). No packages needed. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { hintLinks } from "./link-hints.mjs";
import { mdToHtml } from "./md-to-html.mjs";
import { buildComponents, COMPONENTS_INTRO } from "./components.mjs"; // Nov 8 2026: the component library, /help/dev/components/

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const APP = path.join(REPO, "app");
const OUT = path.join(APP, "help-center");
const SITE = "https://looscid.github.io/Looscid/";
const HELP = SITE + "help/";
const CHECK = process.argv.includes("--check");
const REM = "https://rem.thebntlovver.workers.dev"; // Nov 8 2026: Looscid's server, for the public mod log (Mod log) and the report list (Report a problem)

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(APP, "js", "helpdata.js"), "utf8"), sandbox);
const H = sandbox.window.Looscid.LC_HELP;
const coreSrc = fs.readFileSync(path.join(APP, "js", "core.js"), "utf8");
const routes = new Set([...coreSrc.slice(coreSrc.indexOf("const LC_ROUTES = ["), coreSrc.indexOf("];", coreSrc.indexOf("const LC_ROUTES = ["))).matchAll(/\["[a-z0-9_]+", "([^"]*)"\]/g)].map(m => m[1].toLowerCase()));
// Nov 8 2026 (Carter: "/more/settings links"): core.js also gives every settings screen an address under More, like
// More/Settings/General (built from the Settings/... routes, so it isn't written out in the list above).
[...routes].filter(r => /^settings(\/|$)/.test(r)).forEach(r => routes.add("more/" + r));

/* Nov 1 2026 (Carter: "steal the most coolist Help center UI and footer", "footer is sitewide"): the sitewide footer.
   The same markup is in app/changelog/index.html and app/status.html, and the app draws it too (core.js LcSiteFooter).
   Only links that already exist; external ones say they open in a new tab. */
/* Nov 1 2026 (Carter, 2:43 PM): links to other sites carry a title hint, "Go to GitHub", the way Ableton's footer does.
   The link text stays the name, so VoiceOver reads the title as a hint after a pause. No aria-describedby. */
/* Nov 7 2026 (Carter approved: Get help and Project columns, the build in the bottom line): the footer has five groups,
   each with its own h2 so VoiceOver can jump by heading: Get help, Project, Looscid, Legal and Say hi. Nothing was taken
   away; every link is in one group only. The build comes from app/version.json, the file the app's update check reads,
   written the way the app writes it ("Looscid 2026.138.57 (195)"). This builder also writes the footer into
   app/changelog/index.html and app/status.html, so a new build only needs this script run again (--check catches it). */
const VJ = JSON.parse(fs.readFileSync(path.join(APP, "version.json"), "utf8"));
/* Nov 7 2026 (Carter: Looscid's birthday is Jan 27, 2025, the repo's first day, so the copyright runs "like other companies"): from 2025 to the build's year.
   The end year is the first part of version.json's YEAR.FEATURES.FIXES, so it moves with a new build and --check gives the same answer on any day. */
const COPY_END = String(VJ.version).split(".")[0];
const BUILD_TEXT = "Looscid " + VJ.version + " (" + VJ.build + ")";
/* Nov 8 2026 (Carter: one footer for the whole app): the footer comes from app/js/sitefooter.js, the same file the app draws
   it from, so there's one source. This builder only writes it into the website pages. */
const sfBox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(APP, "js", "sitefooter.js"), "utf8"), sfBox);
const SITE_FOOTER = sfBox.window.Looscid.LC_FOOTER.html({ endYear: COPY_END, build: BUILD_TEXT });
// The Help Center home's topic icons (decoration only; the words say everything).
const ICONS = {
  "getting-started": '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
  "dreams": '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
  "chats-circles-cherry": '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c.6-3 2.6-5 5-5s4.4 2 5 5M11 19c.6-3 2.6-5 5-5s4.4 2 5 5"/>',
  "settings-privacy-backup": '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  "course": '<path d="M3 7l9-4 9 4-9 4z"/><path d="M7 9v5c0 1.7 2.2 3 5 3s5-1.3 5-3V9"/>',
  "bug": '<path d="M9 7a3 3 0 016 0"/><rect x="7" y="7" width="10" height="12" rx="5"/><path d="M12 11v8M3 13h4M17 13h4M4 7l3 2M20 7l-3 2M4 19l3-2M20 19l-3-2"/>',
  "chat": '<path d="M4 5h16v11H9l-5 4z"/>',
  "heart": '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
  "search": '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
};
const icon = k => '<svg class="ic" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + ICONS[k] + "</svg>";
// Popular articles on the home page (chosen by hand; nothing is tracked).
const POPULAR = ["make-a-looscidid", "write-a-dream", "start-a-chat", "find-settings", "backup", "privacy"];
/* Nov 7 2026 (Carter: one place for docs, the Help Center, "Using Looscid" and "Building Looscid"): the repo's own docs,
   each made into a page at /help/dev/<slug>/ from its Markdown file. Edit the .md file, then run this script again (the
   Validate check fails if a page is out of date). Only Source code and Issues still go to GitHub. */
const DOCS = [
  { slug: "contributing", file: "docs/CONTRIBUTING.md", t: "Contributing", s: "How to help build Looscid, and how we work together." },
  { slug: "terminology", file: "docs/guides/TERMINOLOGY.md", t: "Terminology", s: "Looscid's own words: Dream, ReDream, Circle and Dreamor." },
  { slug: "roadmap", file: "docs/dev/ROADMAP.md", t: "Developer roadmap", s: "what I'm building, how it's built and what's coming, for devs." },
  { slug: "files", file: "docs/dev/FILES.md", t: "Files", s: "What every file in the app holds, and the order the browser loads them in." },
  { slug: "nostr-architecture", file: "docs/dev/NOSTR_ARCHITECTURE.md", t: "Nostr and Cherry", s: "How Looscid uses Nostr, and how Cherry fits in." },
  { slug: "announcements", file: "docs/dev/ANNOUNCEMENTS.md", t: "Discord announcements", s: "How the Looscid Discord's #announcements channel gets its messages." },
  { slug: "cherry-upgrade", file: "docs/dev/cherry-upgrade.md", t: "Cherry upgrade spec", s: "A proposal for Cherry's next version." },
  { slug: "dream-delete", file: "docs/dev/dream-delete.md", t: "Dream delete spec", s: "A proposal for deleting a Dream." },
  { slug: "references", file: "docs/dev/REFERENCES.md", t: "Development references", s: "Projects we learned from, with credit." },
  { slug: "security", file: "docs/SECURITY.md", t: "Security", s: "How to report a security problem, privately." },
  { slug: "license", file: "LICENSE", t: "GNU AGPL-3.0", s: "Looscid's license, the GNU Affero General Public License v3.0, in full." },
];
const docByFile = Object.fromEntries(DOCS.map(d => [d.file, d]));
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const byId = Object.fromEntries(H.articles.map(a => [a.id, a]));
const colById = Object.fromEntries(H.collections.map(c => [c.id, c]));
const problems = [];

// [[Route|Label|Path]] -> a real link into the app, then the path. {{id}} or {{id|words}} -> a link to that article.
function rich(text, depth) {
  const root = "../".repeat(depth + 1), hroot = "../".repeat(depth);
  return esc(text)
    // Nov 8 2026 (Carter: "don't give people where to change things help them and give links"): [[Route|Words]], with no
    // path, is a link with just those words ("Turn on passcode lock"); [[Route|Label|Path]] still reads "Open Label (Path)".
    .replace(/\[\[([^|\]]*)\|([^|\]]+)(?:\|([^\]]+))?\]\]/g, (m, route, label, where) => {
      if (!routes.has(route.toLowerCase())) problems.push("unknown screen: " + route);
      // Nov 8 2026: a screen with its own page (like More/Settings/General/) gets that real address; any other goes in as ?p=.
      const real = route && fs.existsSync(path.join(APP, ...route.split("/"), "index.html"));
      const href = root + (real ? route + "/" : "?p=" + encodeURIComponent("/" + route));
      return where === undefined ? '<a class="go" href="' + href + '">' + label + "</a>"
        : '<a class="go" href="' + href + '">Open ' + label + "</a> (" + where + ")";
    })
    .replace(/\{\{([a-z0-9-]+)(?:\|([^}]+))?\}\}/g, (m, id, words) => {
      if (!byId[id]) problems.push("unknown article: " + id);
      return '<a href="' + hroot + id + '/">' + esc(words || (byId[id] ? byId[id].t : id)).replace(/&amp;/g, "&") + "</a>";
    });
}

function page({ slug, title, desc, body, depth, crumbs, connect }) {
  const url = HELP + (slug ? slug + "/" : "");
  const full = slug ? title + " - Looscid Help Center" : "Looscid Help Center";
  const up = "../".repeat(depth);
  const nav = crumbs && crumbs.length ? '<nav class="crumbs" aria-label="Breadcrumb"><ol>' + crumbs.map(c => "<li>" + (c[1] ? '<a href="' + c[1] + '">' + esc(c[0]) + "</a>" : '<span aria-current="page">' + esc(c[0]) + "</span>") + "</li>").join("") + "</ol></nav>" : "";
  return `<!DOCTYPE html>
<html lang="en-US" data-help-root="${up}">
<head>
<meta charset="UTF-8"/>
<title>${esc(full)}</title>
<!-- Made by .github/scripts/build-help.mjs from app/js/helpdata.js. Edit those, not this page. Link previews come first. -->
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Looscid">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}assets/cards/help.png?v=nl1">
<meta property="og:image:secure_url" content="${SITE}assets/cards/help.png?v=nl1">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Looscid logo (a white open ring with a dot in the middle, on blue) above the words “Help - Looscid”">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@Looscid">
<meta name="twitter:title" content="${esc(full)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}assets/cards/help.png?v=nl1">
<meta name="twitter:image:alt" content="Looscid logo (a white open ring with a dot in the middle, on blue) above the words “Help - Looscid”">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/png" sizes="32x32" href="${SITE}assets/icons/favicon-32.png?v=nl1">
<link rel="apple-touch-icon" href="${SITE}assets/icons/apple-touch-icon.png?v=nl1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; connect-src 'self'${connect ? " " + connect : ""}; object-src 'none'; base-uri 'self'; form-action 'self'"/>
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<link rel="stylesheet" href="${up}help.css?v=hc7">
<link rel="stylesheet" href="${up}../assets/site-footer.css?v=2">
</head>
<body>
<div id="looscid-live" class="sr-only" aria-live="polite" aria-atomic="true"></div>
<header class="top"><a class="brand" href="${up || "./"}" aria-label="Looscid Help Center, logo: a white open ring with a dot in the middle, on blue"><img src="${up}../assets/icons/icon-512.png?v=nl1" alt="Looscid logo: a white open ring with a dot in the middle, on blue" role="img" aria-label="Looscid logo: a white open ring with a dot in the middle, on blue" width="32" height="32"><span><span aria-hidden="true">Looscid</span> Help Center</span></a>${gotoMenu(up)}</header>
<main class="wrap" id="main">
${nav}
${body}
</main>
${SITE_FOOTER}
<script src="${up}help.js?v=hc6"></script>
</body>
</html>
`;
}

// Nov 7 2026 (Carter: "a Go To menu pop up button. Go to Help Home or Looscid Home. Back link is not there because it's just
// a link to the previous page you came from"): the top bar has one "Go to" button that shows two plain links. Without
// scripts the button stays hidden and both links just sit in the top bar. help.js turns it into the menu: a real button
// with aria-expanded (like Screen reader tips), Escape closes it and puts focus back on the button, a tap outside closes it.
// Not role="menu": VoiceOver reads plain links in a list, swipe right to reach them. No Back item on purpose.
function gotoMenu(up) {
  const home = up ? "" : ' aria-current="page"';
  return '<div class="goto"><button type="button" class="goto-btn" aria-expanded="false" aria-controls="goto-list" hidden>Go to<svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button><ul class="goto-list" id="goto-list"><li><a href="' + (up || "./") + '"' + home + '>Help Home</a></li><li><a href="' + up + '../">Looscid Home</a></li></ul></div>';
}

const files = {};
/* Nov 1 2026 (Carter, 3:23 PM: "no hints on the some Links or alt tex on the logo"): every link on every page gets a title
   hint that differs from its name ("Opens this article", "Goes back to Help Center", "Go to GitHub"); see link-hints.mjs.
   The logo reads "Looscid": in the header the word Looscid beside it is hidden from VoiceOver, so the link still reads
   "Looscid Help Center", and in the footer the word Looscid is hidden, so the logo says it once.
   4:03 PM ("Describe it lol"): the logo's name says what it looks like, "Looscid logo: a white open ring with a dot in the
   middle, on blue" (same words as core.js LC_LOGO_ALT), so the header link starts with "Looscid logo" and ends "Help Center". */
const HINT_HELP = { topics: H.collections.map(c => c.id), courses: H.courses.map(c => c.id) };
const put = (rel, html) => { files[rel] = /\.html$/.test(rel) ? hintLinks(html, HELP + rel.replace(/index\.html$/, ""), { help: HINT_HELP }) : html; };
const artLink = (a, up, extra) => '<a href="' + up + a.id + '/' + (extra || "") + '">' + esc(a.t) + "</a>";
const course = H.courses[0];

// Home (Nov 1 2026 redesign): a big search first, then topics as cards, popular articles, the course, and a contact row.
{
  const nArt = H.articles.length;
  let b = '<div class="hero">\n<h1>Looscid Help Center</h1>\n';
  b += '<form class="search" role="search" action="./" method="get" id="help-search">\n<label for="help-q" class="search-l">How can we help?</label>\n';
  b += '<div class="search-box">' + icon("search") + '<input id="help-q" name="q" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search" placeholder="Search articles"><button type="submit" class="search-go" title="Finds articles that match">Search</button></div>\n';
  b += '<p id="help-q-hint" class="hint">Searches all ' + nArt + ' articles, right on this device.</p>\n</form>\n</div>\n';
  b += '<section id="results" class="results" aria-labelledby="h-results" hidden><h2 id="h-results" tabindex="-1">Search results</h2><p id="results-n" role="status"></p><ol class="list" id="results-list"></ol></section>\n';
  // Nov 7 2026: the home page has two parts, Using Looscid (the guides) and Building Looscid (the repo's docs).
  b += '<section aria-labelledby="h-using"><h2 id="h-using">Using Looscid</h2>\n<p class="lead">Step-by-step guides for everyone: make your LooscidID, write Dreams, chat, and set things up.</p>\n';
  // Nov 7 2026 (Carter): the welcome screen and tour again, any time, at its one official spot (/welcome). Nothing is reset.
  b += '<p><a href="../welcome/" title="Opens the welcome screen again">Replay the welcome tour</a></p>\n';
  b += '<section aria-labelledby="h-topics"><h3 id="h-topics">Browse by topic</h3>\n<ul class="topics" role="list">\n';
  for (const c of H.collections) {
    const arts = H.articles.filter(a => a.c === c.id);
    b += '<li class="topic">' + icon(c.id) + '<h4><a class="stretch" href="' + c.id + '/">' + esc(c.t) + '</a></h4><p>' + esc(c.s) + '</p><p class="count">' + arts.length + ' articles</p><ul class="topic-arts">' + arts.map(a => "<li>" + artLink(a, "") + "</li>").join("") + "</ul></li>\n";
  }
  b += '</ul>\n</section>\n';
  b += '<section aria-labelledby="h-popular"><h3 id="h-popular">Popular articles</h3>\n<ol class="popular">' + POPULAR.filter(id => byId[id] || (problems.push("popular " + id + " missing"), false)).map(id => '<li><a href="' + id + '/">' + esc(byId[id].t) + '</a><p>' + esc(byId[id].s.replace(/\{\{[^}]*\}\}|\[\[[^\]]*\]\]/g, "")) + "</p></li>").join("") + "</ol>\n</section>\n";
  b += '<section aria-labelledby="h-courses"><h3 id="h-courses">Courses</h3>\n';
  for (const c of H.courses) b += '<div class="card course-card">' + icon("course") + '<div><h4><a href="' + c.id + '/">' + esc(c.t) + '</a></h4><p>' + esc(c.s) + '</p><p class="progress" data-course="' + c.id + '" data-total="' + c.lessons.length + '">' + c.lessons.length + ' lessons</p></div></div>\n';
  b += '</section>\n</section>\n';
  b += '<section aria-labelledby="h-building"><h2 id="h-building">Building Looscid</h2>\n<p class="lead">For developers and anyone curious: how Looscid is made, its words, its rules for accessibility, and what\'s planned. The code itself is on GitHub.</p>\n';
  b += '<ul class="list">' + DOCS.map(d => '<li><a href="dev/' + d.slug + '/">' + esc(d.t) + '</a><p>' + esc(d.s) + '</p></li>').join("") + '<li><a href="dev/components/">Components</a><p>' + esc(COMPONENTS_INTRO) + '</p></li></ul>\n';
  b += '<p><a href="https://github.com/Looscid/Looscid" title="Go to GitHub" target="_blank" rel="noopener noreferrer">Source code</a> <span aria-hidden="true">·</span> <a href="https://github.com/Looscid/Looscid/issues" title="Go to GitHub" target="_blank" rel="noopener noreferrer">Issues</a> <span aria-hidden="true">·</span> <a href="../changelog/">Roadmap and changelog</a> <span aria-hidden="true">·</span> <a href="../Rules/">Rules</a></p>\n</section>\n';
  b += '<section aria-labelledby="h-contact"><h2 id="h-contact">Still need help?</h2>\n<p class="lead">' + esc(H.contact.s) + '</p>\n<ul class="contact-row" role="list">';
  b += '<li>' + icon("bug") + '<a class="stretch" href="report-a-problem/">Report a problem</a><p>Right in Looscid. Agree or disagree with other reports.</p></li>';
  b += '<li>' + icon("bug") + '<a class="stretch" href="contact/">Report a bug</a><p>On GitHub, with your device filled in.</p></li>';
  b += '<li>' + icon("chat") + '<a class="stretch" href="' + esc(H.contact.discord) + '" title="Go to Discord" target="_blank" rel="noopener noreferrer">Join the Discord</a><p>Ideas, questions, or just say hi.</p></li>';
  b += '<li>' + icon("heart") + '<a class="stretch" href="../?p=%2FFeedback">Send Feedback in Looscid</a><p>Profile, More, Feedback.</p></li>';
  b += '</ul>\n</section>';
  put("index.html", page({ slug: "", title: "Looscid Help Center", desc: "Step-by-step help for Looscid: make your LooscidID, write Dreams, chat, and set things up. Search, topics, courses and Contact Us.", body: b, depth: 0 }));
}
// Collections
for (const c of H.collections) {
  const arts = H.articles.filter(a => a.c === c.id);
  let b = "<h1>" + esc(c.t) + '</h1>\n<p class="lead">' + esc(c.s) + "</p>\n<h2>Articles in this collection</h2>\n<ol class=\"list\">" + arts.map(a => "<li>" + artLink(a, "../") + "<p>" + esc(a.s) + "</p></li>").join("") + "</ol>\n";
  b += "<h2>Other collections</h2>\n<ul>" + H.collections.filter(x => x.id !== c.id).map(x => '<li><a href="../' + x.id + '/">' + esc(x.t) + "</a></li>").join("") + "</ul>";
  put(c.id + "/index.html", page({ slug: c.id, title: c.t, desc: c.s, body: b, depth: 1, crumbs: [["Help Center", "../"], [c.t, null]] }));
}
// Articles
for (const a of H.articles) {
  const c = colById[a.c]; if (!c) problems.push("article " + a.id + " has no collection " + a.c);
  let b = '<div id="course-bar" class="course" hidden></div>\n<h1>' + esc(a.t) + '</h1>\n<p class="lead">' + rich(a.s, 1) + "</p>\n";
  b += '<h2>Steps</h2>\n<ol class="steps">' + a.steps.map(s => "<li>" + rich(s, 1) + "</li>").join("") + "</ol>\n";
  /* Nov 8 2026 (Carter: a public mod log, moderator or admin): live "modlog" puts Looscid's mod log under the steps.
     help.js reads it from Rem (GET /modlog, public, no key) and writes one line per removal; without scripts the line
     below says where else to read it. Only this page may connect to Rem (its connect-src). */
  if (a.live === "modlog") b += '<section aria-labelledby="h-modlog"><h2 id="h-modlog">Looscid mod log</h2>\n<p id="modlog-status" role="status">The mod log loads here with JavaScript on. It is also in the app: Help Center, Mod log.</p>\n<ol id="modlog-list" class="list" data-rem="' + REM + '" hidden></ol>\n</section>\n';
  /* Nov 8 2026 (Carter: our own issue tracker, public, agree or disagree, no other companies): live "issues" puts the
     public report list under the steps. help.js reads it from Rem (GET /issues, public, no key, nothing sent), one
     heading per report so it reads in one swipe. Reporting and voting need your Looscid key, so they're in the app. */
  if (a.live === "issues") b += '<section aria-labelledby="h-issues"><h2 id="h-issues">Reports</h2>\n<p>To report a problem, or agree or disagree with one, open it in Looscid: <a href="../../?p=%2FHelp">Help Center, Report a problem</a>. It uses your Looscid key.</p>\n<p class="field"><label for="issues-filter">Show</label><br/><select id="issues-filter" class="select"><option value="all">Everything</option><option value="open">Still open</option><option value="new">New</option><option value="working">Working on it</option><option value="fixed">Fixed</option><option value="closed">Closed</option></select></p>\n<p id="issues-status" role="status">The report list loads here with JavaScript on. It is also in the app: Help Center, Report a problem.</p>\n<ol id="issues-list" class="list issues" data-rem="' + REM + '" hidden></ol>\n</section>\n';
  if (a.tips && a.tips.length) b += "<h2>Good to know</h2>\n<ul>" + a.tips.map(s => "<li>" + rich(s, 1) + "</li>").join("") + "</ul>\n";
  if (a.sr && a.sr.length) b += '<p><button type="button" class="more" aria-expanded="false" aria-controls="sr-tips" title="Shows tips for screen readers">Screen reader tips (optional)</button></p>\n<div id="sr-tips" class="extra"><ul>' + a.sr.map(s => "<li>" + rich(s, 1) + "</li>").join("") + "</ul></div>\n";
  if (a.rel && a.rel.length) b += "<h2>Related articles</h2>\n<ul>" + a.rel.map(id => { if (!byId[id]) { problems.push("related " + id + " missing in " + a.id); return ""; } return "<li>" + artLink(byId[id], "../") + "</li>"; }).join("") + "</ul>\n";
  b += '<p class="next"><a href="../' + a.c + '/">More in ' + esc(c ? c.t : "") + '</a> <span aria-hidden="true">·</span> <a href="../contact/">Still stuck? Contact Us</a></p>';
  put(a.id + "/index.html", page({ slug: a.id, title: a.t, desc: a.s.replace(/\{\{[^}]*\}\}|\[\[[^\]]*\]\]/g, ""), body: b, depth: 1, connect: a.live === "modlog" || a.live === "issues" ? REM : "", crumbs: [["Help Center", "../"], [c ? c.t : "", "../" + a.c + "/"], [a.t, null]] }));
}
// Courses
for (const co of H.courses) {
  let b = "<h1>" + esc(co.t) + '</h1>\n<p class="lead">' + esc(co.s) + '</p>\n<p class="progress" id="course-progress" data-course="' + co.id + '" data-total="' + co.lessons.length + '">' + co.lessons.length + " lessons</p>\n";
  b += '<p><a class="btn" id="course-go" href="../' + co.lessons[0] + '/?course=' + co.id + '">Start Lesson 1</a></p>\n<h2>Lessons</h2>\n<ol class="list lessons" data-course="' + co.id + '">';
  co.lessons.forEach((id, i) => { const a = byId[id]; if (!a) { problems.push("lesson " + id + " missing"); return; } b += '<li data-lesson="' + id + '"><a href="../' + id + '/?course=' + co.id + '">Lesson ' + (i + 1) + ": " + esc(a.t) + '</a> <span class="done-tag" hidden>Done</span><p>' + esc(a.s) + "</p></li>"; });
  b += '</ol>\n<p><button type="button" class="btn ghost" id="course-reset" title="Clears your course progress">Start the course over</button></p>\n<p class="small">Your progress is saved only on this device, in this browser. Nothing is sent anywhere.</p>';
  put(co.id + "/index.html", page({ slug: co.id, title: co.t, desc: co.s, body: b, depth: 1, crumbs: [["Help Center", "../"], [co.t, null]] }));
}
// The docs (Nov 7 2026): each one's Markdown made into a page. A link to another doc goes to its page; a link to any other
// file in the repo goes to that file on GitHub (it's source code). The LICENSE is plain text, so its ALL CAPS lines are its headings.
for (const d of DOCS) {
  let md = fs.readFileSync(path.join(REPO, d.file), "utf8");
  /* Nov 7 2026 (Carter: Looscid is AGPL-3.0 now): LICENSE is the GNU text, unmodified, so GitHub can tell what it is. Its lines
     are indented, so they're trimmed here (only on the page). The title is a heading, its part titles (Preamble, TERMS AND CONDITIONS)
     are h2s and the numbered sections ("0. Definitions.") are h3s, so VoiceOver can jump section by section. */
  if (d.file === "LICENSE") md = md.split("\n").map(l => l.trim()).join("\n").replace(/^GNU AFFERO GENERAL PUBLIC LICENSE\n/, "# GNU Affero General Public License\n").replace(/^(Preamble|TERMS AND CONDITIONS|END OF TERMS AND CONDITIONS|How to Apply These Terms to Your New Programs)$/gm, "## $1").replace(/^(\d{1,2})\. ([A-Z][^\n]*\.)$/gm, "### $1. $2");
  const dir = path.posix.dirname(d.file);
  const linkFor = href => {
    if (/^(https?:|mailto:|#)/i.test(href)) return href;
    const [p, frag] = href.split("#"), target = path.posix.normalize(path.posix.join(dir, p)).replace(/\/$/, "");
    const doc = docByFile[target];
    if (doc) return (doc.slug === d.slug ? "" : "../" + doc.slug + "/") + (frag ? "#" + frag : "");
    if (target === "CHANGELOG.md") return "../../../changelog/";
    if (target === "docs/ABOUT.md") return "../../../About/" + (frag ? "#" + frag : ""); // Nov 8 2026: About Looscid, its own page at /About/
    return "https://github.com/Looscid/Looscid/" + (/\.[a-z0-9]+$/i.test(target) ? "blob" : "tree") + "/main/" + target + (frag ? "#" + frag : "");
  };
  const r = mdToHtml(md, { linkFor });
  const t = r.title || d.t;
  const b = "<h1>" + esc(t) + '</h1>\n<p class="lead">' + esc(d.s) + '</p>\n<div class="doc">\n' + r.html + '\n</div>\n<p class="next"><a href="../../#h-building">More in Building Looscid</a> <span aria-hidden="true">·</span> <a href="https://github.com/Looscid/Looscid/issues" title="Go to GitHub" target="_blank" rel="noopener noreferrer">Issues</a></p>';
  put("dev/" + d.slug + "/index.html", page({ slug: "dev/" + d.slug, title: t, desc: d.s, body: b, depth: 2, crumbs: [["Help Center", "../../"], ["Building Looscid", "../../#h-building"], [t, null]] }));
}
/* Nov 8 2026 (Carter, 5:47 to 5:56 PM: "Not part of the Help Center. Part of Looscid", "No separate links to click. All necessary
   things, all in one", and "The page IS About Looscid"): About Looscid is one all-in-one page, made from docs/ABOUT.md.
   - /About/ (app/About/index.html) is the website page, with the site's page shell (like the changelog and the status page) and
     the one footer, not the Help Center's template.
   - app/js/aboutdata.js carries the same words for the app's own About Looscid screen (Settings, About Looscid; js/more.js), so
     the two never drift apart.
   - /Why/ (where it lived for a few minutes) and /help/why-looscid/ (where it started) stay as small pages that take you to /About/. */
const ABOUT_URL = SITE + "About/";
const whyFiles = {};
{
  const md = fs.readFileSync(path.join(REPO, "docs/ABOUT.md"), "utf8");
  const linkFor = href => {
    if (/^(https?:|mailto:|#)/i.test(href)) return href;
    const [p, frag] = href.split("#"), target = path.posix.normalize(path.posix.join("docs", p)).replace(/\/$/, "");
    const doc = docByFile[target];
    if (doc) return "/Looscid/help/dev/" + doc.slug + "/" + (frag ? "#" + frag : "");
    return "https://github.com/Looscid/Looscid/" + (/\.[a-z0-9]+$/i.test(target) ? "blob" : "tree") + "/main/" + target + (frag ? "#" + frag : "");
  };
  const r = mdToHtml(md, { linkFor });
  const t = r.title || "About Looscid", s = "Looscid is for everyone. Why I'm building it, who it's built for, the research behind it, and how to help.";
  const full = t + " - Looscid";
  const og = SITE + "assets/looscid-og.png?v=nl1", ogAlt = "Looscid logo (a white open ring with a dot in the middle, on blue) above the words “Looscid - Just Dream”";
  let h = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8"/>
<title>${esc(full)}</title>
<!-- Made by .github/scripts/build-help.mjs from docs/ABOUT.md. Edit that, not this page. -->
<meta name="description" content="${esc(s)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Looscid">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(s)}">
<meta property="og:url" content="${ABOUT_URL}">
<meta property="og:image" content="${og}">
<meta property="og:image:secure_url" content="${og}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${ogAlt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@Looscid">
<meta name="twitter:title" content="${esc(full)}">
<meta name="twitter:description" content="${esc(s)}">
<meta name="twitter:image" content="${og}">
<meta name="twitter:image:alt" content="${ogAlt}">
<link rel="canonical" href="${ABOUT_URL}">
<link rel="icon" type="image/png" sizes="32x32" href="${SITE}assets/icons/favicon-32.png?v=nl1">
<link rel="apple-touch-icon" href="${SITE}assets/icons/apple-touch-icon.png?v=nl1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'none'"/>
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="/Looscid/assets/site-footer.css?v=2">
<style>
*,*::before,*::after{box-sizing:border-box}
:root{--bg:#07050f;--sf:#100d1e;--bd:rgba(255,255,255,.1);--tx:#ede9fe;--tx2:#c9bde3;--ac:#6d28d9;--ac3:#d8b4fe}
html{background:var(--bg)}
body{margin:0;font-family:'DM Sans',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--tx);font-size:18px;line-height:1.65}
a{color:var(--ac3);text-decoration:underline;text-underline-offset:3px}
a:focus-visible{outline:3px solid #fff;outline-offset:3px;border-radius:4px}
.skip{position:absolute;left:-9999px;top:0;background:var(--ac);color:#fff;padding:12px 16px;font-weight:700;z-index:10}
.skip:focus{left:0}
header{border-bottom:1px solid var(--bd)}
.hd{max-width:720px;margin:0 auto;padding:8px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.brand{display:inline-flex;align-items:center;gap:10px;font-weight:700;font-size:20px}
.brand img{display:block;width:32px;height:32px;border-radius:22%}
.hd a{display:inline-flex;align-items:center;min-height:44px;min-width:44px;padding:0 8px}
main{max-width:720px;margin:0 auto;padding:28px 20px 48px}
h1{font-family:'DM Serif Display',Georgia,serif;font-size:40px;line-height:1.2;margin:0 0 12px}
.lead{font-size:20px;color:var(--tx2);margin:0 0 24px}
h2{font-family:'DM Serif Display',Georgia,serif;font-size:26px;line-height:1.3;margin:36px 0 10px}
p,ul{margin:0 0 14px}
ul{padding-left:24px}
li{margin:4px 0}
li>a{display:inline-flex;align-items:center;min-height:44px}
main p a{padding:10px 0}
.next{margin-top:36px;padding-top:16px;border-top:1px solid var(--bd)}
.next a{display:inline-flex;align-items:center;min-height:44px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>
<header>
<div class="hd"><span class="brand"><img src="/Looscid/assets/icons/icon-512.png?v=nl1" alt="Looscid logo" width="32" height="32"><span aria-hidden="true">Looscid</span></span><a href="/Looscid/">Open Looscid</a></div>
</header>
<main id="main">
<h1>${esc(t)}</h1>
${r.html}
</main>
${SITE_FOOTER}
</body>
</html>
`;
  whyFiles["About/index.html"] = hintLinks(h, ABOUT_URL, { help: HINT_HELP });
  // The app's About Looscid screen shows the same words (js/more.js reads Looscid.LC_ABOUT). Plain data, nothing runs.
  whyFiles["js/aboutdata.js"] = "/* Made by .github/scripts/build-help.mjs from docs/ABOUT.md (Nov 8 2026). Edit that, then run the script. The app's About Looscid screen shows this. */\n" +
    "(function () { var L = window.Looscid = window.Looscid || {}; L.LC_ABOUT = " + JSON.stringify({ t: t, s: s, html: hintLinks(r.html, ABOUT_URL, { help: HINT_HELP }) }) + "; })();\n";
  // The old addresses: small pages that take you to /About/ (the link works with nothing loaded; the refresh is right away).
  const moved = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8"/>
<title>About Looscid has a new home - Looscid</title>
<!-- Made by .github/scripts/build-help.mjs. Why Looscid? is part of About Looscid now, at /About/ (Nov 8 2026). -->
<meta name="description" content="${esc(s)}">
<link rel="canonical" href="${ABOUT_URL}">
<meta http-equiv="refresh" content="0; url=/Looscid/About/">
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>html,body{margin:0;background:#07050f;color:#ede9fe;font:18px/1.5 system-ui,-apple-system,sans-serif}main{padding:24px}a{color:#d8b4fe;font-weight:700;display:inline-flex;align-items:center;min-height:44px}</style>
</head>
<body>
<main>
<h1>Why Looscid? is part of About Looscid now</h1>
<p><a href="/Looscid/About/" title="Goes to About Looscid">Go to About Looscid</a></p>
</main>
</body>
</html>
`;
  whyFiles["Why/index.html"] = moved;
  put("why-looscid/index.html", moved);
  /* Nov 8 2026 (Carter, 6:36 PM: "The Accessibility page should be merged in the Why Looscid"): the accessibility guide is
     part of About Looscid now. What it promises people went to /About/; the how-to for people building Looscid went to
     Contributing (docs/CONTRIBUTING.md, Building it accessibly). /help/dev/accessibility/ takes you there, and an old
     #part lands on the same part in its new home. The web menu code sample is gone: the component library's Pop-up menu
     is the real one. Without scripts, the refresh goes to the top of About and the links below say where each part went. */
  const A = "/Looscid/About/", C = "/Looscid/help/dev/contributing/", M = "/Looscid/help/dev/components/popup-menu/";
  const A11Y_MAP = {
    "my-commitment": A + "#my-commitment", "commitments": A + "#my-commitment", "commitment-to-accessibility": A + "#my-commitment",
    "commitment-to-fairness": A + "#if-you-get-banned", "accessibility": A + "#every-screen-reader", "table-of-contents": A + "#every-screen-reader",
    "web-accessibility": A + "#every-screen-reader", "screen-reader-testing-checklist": A + "#screen-reader-checklist",
    "accessibility-checklist": A + "#screen-reader-checklist", "testing-recommendations": A + "#how-to-test",
    "commitment-to-humor": C + "#writing-funny-from-commitment-to-humor", "button-naming-numbering": C + "#button-naming-and-numbering",
    "ios-accessibility": C + "#for-the-native-apps-swift", "ios-swiftui-implementation": C + "#for-the-native-apps-swift",
    "resources": C + "#resources",
  };
  for (const id of ["voiceover-support", "voiceover-pitch", "voiceover-accessibility-sounds", "swiftui-menu-button-component", "the-composer-round-6-5",
    "the-cherry-page-round-6-5-2", "cherry-in-commandbar-and-the-commands-page-round-6-5-3", "menus-sheets-and-dialogs-round-7", "the-profile-round-7",
    "create-circle-round-7", "hints-round-7"]) A11Y_MAP[id] = C + "#" + id;
  for (const id of ["html-structure-for-accessible-menu-popups", "aria-attributes-reference", "accessibility-menu", "web-implementation-github-style-menu",
    "html-structure", "css-styling", "javascript-implementation"]) A11Y_MAP[id] = M;
  put("dev/accessibility/index.html", `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8"/>
<title>Accessibility is part of About Looscid now - Looscid</title>
<!-- Made by .github/scripts/build-help.mjs. The accessibility guide is part of About Looscid now, at /About/ (Nov 8 2026). -->
<meta name="description" content="${esc(s)}">
<link rel="canonical" href="${ABOUT_URL}">
<script>(function(){var m=${JSON.stringify(A11Y_MAP)};var h=decodeURIComponent((location.hash||"").slice(1));location.replace(m[h]||"${A}");})();</script>
<meta http-equiv="refresh" content="0; url=${A}">
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>html,body{margin:0;background:#07050f;color:#ede9fe;font:18px/1.5 system-ui,-apple-system,sans-serif}main{padding:24px}a{color:#d8b4fe;font-weight:700;display:inline-flex;align-items:center;min-height:44px}</style>
</head>
<body>
<main>
<h1>Accessibility is part of About Looscid now</h1>
<ul>
<li><a href="${A}#my-commitment">What I promise you</a></li>
<li><a href="${A}#every-screen-reader">Works with every screen reader</a></li>
<li><a href="${A}#accessibility-settings">Settings that help</a></li>
<li><a href="${A}#report-an-accessibility-bug">Found an accessibility bug?</a></li>
<li><a href="${C}#building-it-accessibly">Building it accessibly, for devs</a></li>
</ul>
</main>
</body>
</html>
`);
}
// Nov 8 2026: the component library (.github/scripts/components.mjs): an index and one page per component, with demos.
buildComponents({ page, put, esc });
// Contact Us (Carter, Oct 28 2026: "GitHub is good enough". No email.)
{
  const k = H.contact;
  let b = "<h1>" + esc(k.t) + '</h1>\n<p class="lead">' + esc(k.s) + "</p>\n";
  // Nov 8 2026: the Report Center first; GitHub and Discord below stay as backups (Carter).
  b += '<h2>Report a Dream, a person, a Circle or child safety</h2>\n<p>The Report Center in Looscid has every kind of report in one place, and My reports shows what happened to each one. Reports are private, only you and the Looscid mods see them.</p>\n<p><a class="btn" id="help-report-center" href="../../Report/">Open the Report Center</a></p>\n';
  b += '<h2>Report a bug</h2>\n<p>Found something broken? This opens a new GitHub issue with your device already filled in, so you just say what happened. GitHub asks you to log in there.</p>\n<p><a class="btn" id="help-report-bug" href="https://github.com/Looscid/Looscid/issues/new?labels=bug&amp;title=Bug%3A%20" title="Go to GitHub" target="_blank" rel="noopener noreferrer">Report a bug</a></p>\n';
  b += '<h2>Send feedback or join the Discord</h2>\n<p>Ideas, questions, or just want to say hi? Join the Looscid Discord. Anything you write in the #feedback channel turns into a GitHub issue by itself, and LooscidBOT answers you there with the link.</p>\n<p><a class="btn" href="' + k.discord + '" title="Go to Discord" target="_blank" rel="noopener noreferrer">Join the Looscid Discord</a></p>\n';
  b += '<p>Already using Looscid? <a class="go" href="../../?p=%2FFeedback">Open Send Feedback</a> (Profile, More, Feedback) writes a GitHub issue for you.</p>\n';
  b += '<h2>See what others reported</h2>\n<p><a href="' + k.issues + '" title="Go to GitHub" target="_blank" rel="noopener noreferrer">Looscid\'s GitHub issues</a>. Everything is public, so you can follow along.</p>';
  put("contact/index.html", page({ slug: "contact", title: k.t, desc: "Report a bug or send feedback about Looscid, on GitHub or the Looscid Discord.", body: b, depth: 1, crumbs: [["Help Center", "../"], [k.t, null]] }));
}
// What help.js needs: the course lessons and titles.
const meta = "/* Made by .github/scripts/build-help.mjs from app/js/helpdata.js. */\nwindow.LC_HELP_COURSES = " + JSON.stringify(Object.fromEntries(H.courses.map(c => [c.id, { t: c.t, lessons: c.lessons.map(id => [id, byId[id] ? byId[id].t : id]) }]))) + ";\n";
files["courses.js"] = meta;
// What the home page's search reads (Nov 1 2026): every article, collection and course, its words only. Nothing is sent anywhere.
const plain = t => String(t || "").replace(/\{\{([a-z0-9-]+)(?:\|([^}]+))?\}\}/g, (m, id, w) => w || (byId[id] ? byId[id].t : "")).replace(/\[\[[^|\]]*\|([^|\]]+)(?:\|([^\]]+))?\]\]/g, (m, l, w) => w === undefined ? l : l + " (" + w + ")");
files["search.js"] = "/* Made by .github/scripts/build-help.mjs from app/js/helpdata.js. */\nwindow.LC_HELP_INDEX = " + JSON.stringify(
  H.articles.map(a => ({ u: a.id + "/", t: a.t, s: plain(a.s), c: colById[a.c] ? colById[a.c].t : "", k: [].concat(a.steps || [], a.tips || []).map(plain).join(" ") }))
    .concat(H.collections.map(c => ({ u: c.id + "/", t: c.t, s: c.s, c: "Topic", k: "" })))
    .concat(H.courses.map(c => ({ u: c.id + "/", t: c.t, s: c.s, c: "Course", k: "" })))
    .concat([{ u: "contact/", t: H.contact.t, s: H.contact.s, c: "Contact", k: "report a bug feedback discord github issue" }])) + ";\n";

// The same footer on the changelog and the status page (Nov 7 2026). Only the footer is replaced; the rest of each page is its own.
const SITE_PAGES = { "changelog/index.html": SITE + "changelog/", "status.html": SITE + "status.html", "404.html": SITE + "404.html" }; // Nov 8 2026: Page not found too
const siteFiles = {};
for (const [rel, url] of Object.entries(SITE_PAGES)) {
  const old = fs.readFileSync(path.join(APP, rel), "utf8");
  if (!/<footer class="sf"[\s\S]*?<\/footer>/.test(old)) { problems.push("no site footer in app/" + rel); continue; }
  siteFiles[rel] = old.replace(/<footer class="sf"[\s\S]*?<\/footer>/, () => hintLinks(SITE_FOOTER, url, { help: HINT_HELP }));
}

// "post" is never a word in Looscid (standing rule).
// The docs pages (dev/) are the repo's docs as they're written: TERMINOLOGY.md itself names the word, and code samples use it.
for (const [rel, html] of Object.entries(files)) if (!rel.startsWith("dev/") && /\bpost(s|ed|ing)?\b/i.test(html.replace(/method="post"/gi, ""))) problems.push("the word post in " + rel);
// Nov 1 2026 (Carter: "Description, dimmed" is gone and banned): no page may give anything an accessible description
// (VoiceOver on iPhone says "description" for it) or show a Description label. Hints are plain text under their control.
for (const [rel, html] of Object.entries(files)) {
  // A doc page may talk about the ban in its words (written as text); it may never have the attribute itself.
  const isDoc = rel.startsWith("dev/");
  if (isDoc ? /<[a-z][^>]*\saria-describ/i.test(html) : /aria-describedby|aria-description/i.test(html)) problems.push("an aria-describedby or aria-description in " + rel + " (banned: VoiceOver says description)");
  // Nov 2 2026 (Carter's approved TalkBack format): links are plain, with no hidden "(opens in a new tab)" text.
  if (/opens in a new tab/i.test(html)) problems.push("hidden \"(opens in a new tab)\" link text in " + rel + " (banned: links stay plain)");
  if ((!isDoc && />\s*Description\s*(:\s*)?</i.test(html)) || /(aria-label|placeholder|title)="Description\b/i.test(html) || /<d[dt][\s>]/i.test(html)) problems.push("a Description label in " + rel + " (banned)");
}
// Nov 8 2026: the same rules for About Looscid (/About/, the app's copy) and /Why/ (no "post", no accessible descriptions, no hidden link text, one h1).
for (const [rel, html] of Object.entries(whyFiles)) {
  if (/\bpost(s|ed|ing)?\b/i.test(html.replace(/method="post"/gi, ""))) problems.push("the word post in app/" + rel);
  if (/aria-describedby|aria-description|opens in a new tab/i.test(html)) problems.push("a banned description or hidden link text in app/" + rel);
  if (/\.html$/.test(rel) && (html.match(/<h1[\s>]/g) || []).length !== 1) problems.push("app/" + rel + " needs exactly one h1");
}
if (problems.length) { console.error("Help Center problems:\n- " + [...new Set(problems)].join("\n- ")); process.exit(1); }

let stale = [];
for (const [rel, html] of Object.entries(files)) {
  const f = path.join(OUT, rel);
  const old = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
  if (old === html) continue;
  if (CHECK) { stale.push(rel); continue; }
  fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html);
}
for (const [rel, html] of Object.entries(siteFiles)) {
  const f = path.join(APP, rel);
  if (fs.readFileSync(f, "utf8") === html) continue;
  if (CHECK) { stale.push("../" + rel); continue; }
  fs.writeFileSync(f, html);
}
for (const [rel, html] of Object.entries(whyFiles)) {
  const f = path.join(APP, rel);
  if (fs.existsSync(f) && fs.readFileSync(f, "utf8") === html) continue;
  if (CHECK) { stale.push("../" + rel); continue; }
  fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html);
}
if (CHECK && stale.length) { console.error("Help Center pages are out of date. Run node .github/scripts/build-help.mjs\n- " + stale.join("\n- ")); process.exit(1); }
console.log((CHECK ? "Help Center is up to date: " : "Help Center written: ") + Object.keys(files).length + " files in app/help-center/");
