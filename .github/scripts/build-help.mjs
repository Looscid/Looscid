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

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const APP = path.join(REPO, "app");
const OUT = path.join(APP, "help-center");
const SITE = "https://looscid.github.io/Looscid/";
const HELP = SITE + "help/";
const CHECK = process.argv.includes("--check");

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(APP, "js", "helpdata.js"), "utf8"), sandbox);
const H = sandbox.window.Looscid.LC_HELP;
const coreSrc = fs.readFileSync(path.join(APP, "js", "core.js"), "utf8");
const routes = new Set([...coreSrc.slice(coreSrc.indexOf("const LC_ROUTES = ["), coreSrc.indexOf("];", coreSrc.indexOf("const LC_ROUTES = ["))).matchAll(/\["[a-z_]+", "([^"]*)"\]/g)].map(m => m[1].toLowerCase()));

/* Nov 1 2026 (Carter: "steal the most coolist Help center UI and footer", "footer is sitewide"): the sitewide footer.
   The same markup is in app/changelog/index.html and app/status.html, and the app draws it too (core.js LcSiteFooter).
   Only links that already exist; external ones say they open in a new tab. */
const SITE_FOOTER = "<footer class=\"sf\" aria-labelledby=\"sf-title\">\n<h2 id=\"sf-title\" class=\"sf-sr\">Footer</h2>\n<div class=\"sf-in\">\n<p class=\"sf-brand\"><img src=\"/Looscid/assets/icons/icon-512.png?v=nl1\" alt=\"\" aria-hidden=\"true\" width=\"28\" height=\"28\"><span class=\"sf-name\">Looscid</span><span class=\"sf-tag\">Just Dream. Open source and local first.</span></p>\n<div class=\"sf-cols\">\n<section class=\"sf-col\" aria-labelledby=\"sf-h-looscid\"><h3 id=\"sf-h-looscid\">Looscid</h3><ul><li><a href=\"/Looscid/\">Open Looscid</a></li><li><a href=\"/Looscid/About/\">About</a></li><li><a href=\"/Looscid/Our-Story/\">Our Story</a></li><li><a href=\"/Looscid/changelog/\">Changelog</a></li><li><a href=\"/Looscid/Credits/\">Credits</a></li></ul></section>\n<section class=\"sf-col\" aria-labelledby=\"sf-h-help\"><h3 id=\"sf-h-help\">Help</h3><ul><li><a href=\"/Looscid/help/\">Help Center</a></li><li><a href=\"/Looscid/help/getting-started/\">Getting Started</a></li><li><a href=\"/Looscid/help/looscid-basics/\">Looscid Basics course</a></li><li><a href=\"/Looscid/help/contact/\">Contact Us</a></li><li><a href=\"/Looscid/Feedback/\">Send Feedback</a></li></ul></section>\n<section class=\"sf-col\" aria-labelledby=\"sf-h-dev\"><h3 id=\"sf-h-dev\">Developers</h3><ul><li><a href=\"https://github.com/Looscid/Looscid\" target=\"_blank\" rel=\"noopener noreferrer\">Source code <span class=\"sf-sr\">(opens in a new tab)</span></a></li><li><a href=\"https://github.com/Looscid/Looscid/tree/main/docs\" target=\"_blank\" rel=\"noopener noreferrer\">Docs <span class=\"sf-sr\">(opens in a new tab)</span></a></li><li><a href=\"https://github.com/Looscid/Looscid/blob/main/docs/CONTRIBUTING.md\" target=\"_blank\" rel=\"noopener noreferrer\">Contributing <span class=\"sf-sr\">(opens in a new tab)</span></a></li><li><a href=\"https://github.com/Looscid/Looscid/blob/main/docs/guides/ACCESSIBILITY.md\" target=\"_blank\" rel=\"noopener noreferrer\">Accessibility <span class=\"sf-sr\">(opens in a new tab)</span></a></li><li><a href=\"https://github.com/Looscid/Looscid/issues\" target=\"_blank\" rel=\"noopener noreferrer\">Issues <span class=\"sf-sr\">(opens in a new tab)</span></a></li></ul></section>\n<section class=\"sf-col\" aria-labelledby=\"sf-h-legal\"><h3 id=\"sf-h-legal\">Legal</h3><ul><li><a href=\"/Looscid/Terms/\">Terms</a></li><li><a href=\"/Looscid/Privacy/\">Privacy</a></li><li><a href=\"/Looscid/Rules/\">Rules</a></li><li><a href=\"/Looscid/Child-Safety/\">Child Safety</a></li><li><a href=\"/Looscid/Legal/\">License</a></li></ul></section>\n<section class=\"sf-col\" aria-labelledby=\"sf-h-hi\"><h3 id=\"sf-h-hi\">Say hi</h3><ul><li><a href=\"https://github.com/Looscid\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub <span class=\"sf-sr\">(opens in a new tab)</span></a></li><li><a href=\"https://x.com/Looscid\" target=\"_blank\" rel=\"noopener noreferrer\">X <span class=\"sf-sr\">(opens in a new tab)</span></a></li><li><a href=\"https://www.youtube.com/@Looscid\" target=\"_blank\" rel=\"noopener noreferrer\">YouTube <span class=\"sf-sr\">(opens in a new tab)</span></a></li><li><a href=\"https://discord.gg/M6xrD8EBXU\" target=\"_blank\" rel=\"noopener noreferrer\">Discord <span class=\"sf-sr\">(opens in a new tab)</span></a></li></ul></section>\n</div>\n<p class=\"sf-bottom\">© 2026 Looscid · Open source under the <a href=\"/Looscid/Legal/\">Looscid Public License</a> · Made by Chaotic Carter, co-written with Tab</p>\n</div>\n</footer>";
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
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const byId = Object.fromEntries(H.articles.map(a => [a.id, a]));
const colById = Object.fromEntries(H.collections.map(c => [c.id, c]));
const problems = [];

// [[Route|Label|Path]] -> a real link into the app, then the path. {{id}} or {{id|words}} -> a link to that article.
function rich(text, depth) {
  const root = "../".repeat(depth + 1), hroot = "../".repeat(depth);
  return esc(text)
    .replace(/\[\[([^|\]]*)\|([^|\]]+)\|([^\]]+)\]\]/g, (m, route, label, where) => {
      if (!routes.has(route.toLowerCase())) problems.push("unknown screen: " + route);
      return '<a class="go" href="' + root + "?p=" + encodeURIComponent("/" + route) + '">Open ' + label + "</a> (" + where + ")";
    })
    .replace(/\{\{([a-z0-9-]+)(?:\|([^}]+))?\}\}/g, (m, id, words) => {
      if (!byId[id]) problems.push("unknown article: " + id);
      return '<a href="' + hroot + id + '/">' + esc(words || (byId[id] ? byId[id].t : id)).replace(/&amp;/g, "&") + "</a>";
    });
}

function page({ slug, title, desc, body, depth, crumbs }) {
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
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"/>
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<link rel="stylesheet" href="${up}help.css?v=hc2">
<link rel="stylesheet" href="${up}../assets/site-footer.css?v=1">
</head>
<body>
<div id="looscid-live" class="sr-only" aria-live="polite" aria-atomic="true"></div>
<header class="top"><a class="brand" href="${up || "./"}"><img src="${up}../assets/icons/icon-512.png?v=nl1" alt="" aria-hidden="true" width="32" height="32"><span>Looscid Help Center</span></a><a class="open" href="${up}../">Open Looscid</a></header>
<main class="wrap" id="main">
${nav}
${body}
</main>
${SITE_FOOTER}
<script src="${up}help.js?v=hc2"></script>
</body>
</html>
`;
}

const files = {};
const put = (rel, html) => { files[rel] = html; };
const artLink = (a, up, extra) => '<a href="' + up + a.id + '/' + (extra || "") + '">' + esc(a.t) + "</a>";
const course = H.courses[0];

// Home (Nov 1 2026 redesign): a big search first, then topics as cards, popular articles, the course, and a contact row.
{
  const nArt = H.articles.length;
  let b = '<div class="hero">\n<h1>Looscid Help Center</h1>\n';
  b += '<form class="search" role="search" action="./" method="get" id="help-search">\n<label for="help-q" class="search-l">How can we help?</label>\n';
  b += '<div class="search-box">' + icon("search") + '<input id="help-q" name="q" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search" placeholder="Search articles"><button type="submit" class="search-go">Search</button></div>\n';
  b += '<p id="help-q-hint" class="hint">Searches all ' + nArt + ' articles, right on this device.</p>\n</form>\n</div>\n';
  b += '<section id="results" class="results" aria-labelledby="h-results" hidden><h2 id="h-results" tabindex="-1">Search results</h2><p id="results-n" role="status"></p><ol class="list" id="results-list"></ol></section>\n';
  b += '<section aria-labelledby="h-topics"><h2 id="h-topics">Browse by topic</h2>\n<ul class="topics" role="list">\n';
  for (const c of H.collections) {
    const arts = H.articles.filter(a => a.c === c.id);
    b += '<li class="topic">' + icon(c.id) + '<h3><a class="stretch" href="' + c.id + '/">' + esc(c.t) + '</a></h3><p>' + esc(c.s) + '</p><p class="count">' + arts.length + ' articles</p><ul class="topic-arts">' + arts.map(a => "<li>" + artLink(a, "") + "</li>").join("") + "</ul></li>\n";
  }
  b += '</ul>\n</section>\n';
  b += '<section aria-labelledby="h-popular"><h2 id="h-popular">Popular articles</h2>\n<ol class="popular">' + POPULAR.filter(id => byId[id] || (problems.push("popular " + id + " missing"), false)).map(id => '<li><a href="' + id + '/">' + esc(byId[id].t) + '</a><p>' + esc(byId[id].s.replace(/\{\{[^}]*\}\}|\[\[[^\]]*\]\]/g, "")) + "</p></li>").join("") + "</ol>\n</section>\n";
  b += '<section aria-labelledby="h-courses"><h2 id="h-courses">Courses</h2>\n';
  for (const c of H.courses) b += '<div class="card course-card">' + icon("course") + '<div><h3><a href="' + c.id + '/">' + esc(c.t) + '</a></h3><p>' + esc(c.s) + '</p><p class="progress" data-course="' + c.id + '" data-total="' + c.lessons.length + '">' + c.lessons.length + ' lessons</p></div></div>\n';
  b += '</section>\n';
  b += '<section aria-labelledby="h-contact"><h2 id="h-contact">Still need help?</h2>\n<p class="lead">' + esc(H.contact.s) + '</p>\n<ul class="contact-row" role="list">';
  b += '<li>' + icon("bug") + '<a class="stretch" href="contact/">Report a bug</a><p>On GitHub, with your device filled in.</p></li>';
  b += '<li>' + icon("chat") + '<a class="stretch" href="' + esc(H.contact.discord) + '" target="_blank" rel="noopener noreferrer">Join the Discord<span class="sr-only"> (opens in a new tab)</span></a><p>Ideas, questions, or just say hi.</p></li>';
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
  if (a.tips && a.tips.length) b += "<h2>Good to know</h2>\n<ul>" + a.tips.map(s => "<li>" + rich(s, 1) + "</li>").join("") + "</ul>\n";
  if (a.sr && a.sr.length) b += '<p><button type="button" class="more" aria-expanded="false" aria-controls="sr-tips">Screen reader tips (optional)</button></p>\n<div id="sr-tips" class="extra"><ul>' + a.sr.map(s => "<li>" + rich(s, 1) + "</li>").join("") + "</ul></div>\n";
  if (a.rel && a.rel.length) b += "<h2>Related articles</h2>\n<ul>" + a.rel.map(id => { if (!byId[id]) { problems.push("related " + id + " missing in " + a.id); return ""; } return "<li>" + artLink(byId[id], "../") + "</li>"; }).join("") + "</ul>\n";
  b += '<p class="next"><a href="../' + a.c + '/">More in ' + esc(c ? c.t : "") + '</a> · <a href="../contact/">Still stuck? Contact Us</a></p>';
  put(a.id + "/index.html", page({ slug: a.id, title: a.t, desc: a.s.replace(/\{\{[^}]*\}\}|\[\[[^\]]*\]\]/g, ""), body: b, depth: 1, crumbs: [["Help Center", "../"], [c ? c.t : "", "../" + a.c + "/"], [a.t, null]] }));
}
// Courses
for (const co of H.courses) {
  let b = "<h1>" + esc(co.t) + '</h1>\n<p class="lead">' + esc(co.s) + '</p>\n<p class="progress" id="course-progress" data-course="' + co.id + '" data-total="' + co.lessons.length + '">' + co.lessons.length + " lessons</p>\n";
  b += '<p><a class="btn" id="course-go" href="../' + co.lessons[0] + '/?course=' + co.id + '">Start Lesson 1</a></p>\n<h2>Lessons</h2>\n<ol class="list lessons" data-course="' + co.id + '">';
  co.lessons.forEach((id, i) => { const a = byId[id]; if (!a) { problems.push("lesson " + id + " missing"); return; } b += '<li data-lesson="' + id + '"><a href="../' + id + '/?course=' + co.id + '">Lesson ' + (i + 1) + ": " + esc(a.t) + '</a> <span class="done-tag" hidden>Done</span><p>' + esc(a.s) + "</p></li>"; });
  b += '</ol>\n<p><button type="button" class="btn ghost" id="course-reset">Start the course over</button></p>\n<p class="small">Your progress is saved only on this device, in this browser. Nothing is sent anywhere.</p>';
  put(co.id + "/index.html", page({ slug: co.id, title: co.t, desc: co.s, body: b, depth: 1, crumbs: [["Help Center", "../"], [co.t, null]] }));
}
// Contact Us (Carter, Oct 28 2026: "GitHub is good enough". No email.)
{
  const k = H.contact;
  let b = "<h1>" + esc(k.t) + '</h1>\n<p class="lead">' + esc(k.s) + "</p>\n";
  b += '<h2>Report a bug</h2>\n<p>Found something broken? This opens a new GitHub issue with your device already filled in, so you just say what happened. GitHub asks you to log in there.</p>\n<p><a class="btn" id="help-report-bug" href="https://github.com/Looscid/Looscid/issues/new?labels=bug&amp;title=Bug%3A%20" target="_blank" rel="noopener noreferrer">Report a bug</a></p>\n';
  b += '<h2>Send feedback or join the Discord</h2>\n<p>Ideas, questions, or just want to say hi? Join the Looscid Discord. Anything you write in the #feedback channel turns into a GitHub issue by itself, and LooscidBOT answers you there with the link.</p>\n<p><a class="btn" href="' + k.discord + '" target="_blank" rel="noopener noreferrer">Join the Looscid Discord</a></p>\n';
  b += '<p>Already using Looscid? <a class="go" href="../../?p=%2FFeedback">Open Send Feedback</a> (Profile, More, Feedback) writes a GitHub issue for you.</p>\n';
  b += '<h2>See what others reported</h2>\n<p><a href="' + k.issues + '" target="_blank" rel="noopener noreferrer">Looscid\'s GitHub issues</a>. Everything is public, so you can follow along.</p>';
  put("contact/index.html", page({ slug: "contact", title: k.t, desc: "Report a bug or send feedback about Looscid, on GitHub or the Looscid Discord.", body: b, depth: 1, crumbs: [["Help Center", "../"], [k.t, null]] }));
}
// What help.js needs: the course lessons and titles.
const meta = "/* Made by .github/scripts/build-help.mjs from app/js/helpdata.js. */\nwindow.LC_HELP_COURSES = " + JSON.stringify(Object.fromEntries(H.courses.map(c => [c.id, { t: c.t, lessons: c.lessons.map(id => [id, byId[id] ? byId[id].t : id]) }]))) + ";\n";
files["courses.js"] = meta;
// What the home page's search reads (Nov 1 2026): every article, collection and course, its words only. Nothing is sent anywhere.
const plain = t => String(t || "").replace(/\{\{([a-z0-9-]+)(?:\|([^}]+))?\}\}/g, (m, id, w) => w || (byId[id] ? byId[id].t : "")).replace(/\[\[[^|\]]*\|([^|\]]+)\|([^\]]+)\]\]/g, "$1 ($2)");
files["search.js"] = "/* Made by .github/scripts/build-help.mjs from app/js/helpdata.js. */\nwindow.LC_HELP_INDEX = " + JSON.stringify(
  H.articles.map(a => ({ u: a.id + "/", t: a.t, s: plain(a.s), c: colById[a.c] ? colById[a.c].t : "", k: [].concat(a.steps || [], a.tips || []).map(plain).join(" ") }))
    .concat(H.collections.map(c => ({ u: c.id + "/", t: c.t, s: c.s, c: "Topic", k: "" })))
    .concat(H.courses.map(c => ({ u: c.id + "/", t: c.t, s: c.s, c: "Course", k: "" })))
    .concat([{ u: "contact/", t: H.contact.t, s: H.contact.s, c: "Contact", k: "report a bug feedback discord github issue" }])) + ";\n";

// "post" is never a word in Looscid (standing rule).
for (const [rel, html] of Object.entries(files)) if (/\bpost(s|ed|ing)?\b/i.test(html.replace(/method="post"/gi, ""))) problems.push("the word post in " + rel);
// Nov 1 2026 (Carter: "Description, dimmed" is gone and banned): no page may give anything an accessible description
// (VoiceOver on iPhone says "description" for it) or show a Description label. Hints are plain text under their control.
for (const [rel, html] of Object.entries(files)) {
  if (/aria-describedby|aria-description/i.test(html)) problems.push("an aria-describedby or aria-description in " + rel + " (banned: VoiceOver says description)");
  if (/>\s*Description\s*(:\s*)?</i.test(html) || /(aria-label|placeholder|title)="Description\b/i.test(html) || /<d[dt][\s>]/i.test(html)) problems.push("a Description label in " + rel + " (banned)");
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
if (CHECK && stale.length) { console.error("Help Center pages are out of date. Run node .github/scripts/build-help.mjs\n- " + stale.join("\n- ")); process.exit(1); }
console.log((CHECK ? "Help Center is up to date: " : "Help Center written: ") + Object.keys(files).length + " files in app/help-center/");
