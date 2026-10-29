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
<html lang="en" data-help-root="${up}">
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
<meta property="og:image" content="${SITE}assets/cards/help.png?v=195">
<meta property="og:image:secure_url" content="${SITE}assets/cards/help.png?v=195">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Looscid Help Center">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@Looscid">
<meta name="twitter:title" content="${esc(full)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}assets/cards/help.png?v=195">
<meta name="twitter:image:alt" content="Looscid Help Center">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/png" sizes="32x32" href="${SITE}assets/icons/favicon-32.png">
<link rel="apple-touch-icon" href="${SITE}assets/icons/apple-touch-icon.png">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"/>
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<link rel="stylesheet" href="${up}help.css">
</head>
<body>
<div id="looscid-live" class="sr-only" aria-live="polite" aria-atomic="true"></div>
<header class="top"><a class="brand" href="${up || "./"}"><img src="${up}../assets/icons/icon-512.png" alt="" aria-hidden="true" width="32" height="32"><span>Looscid Help Center</span></a><a class="open" href="${up}../">Open Looscid</a></header>
<main class="wrap" id="main">
${nav}
${body}
</main>
<footer class="foot"><p><a href="${up}contact/">Contact Us</a> · <a href="${up}">Help Center</a> · <a href="${up}../changelog/">Changelog</a> · <a href="${up}../">Open Looscid</a></p><p>Co-written with Tab</p></footer>
<script src="${up}help.js"></script>
</body>
</html>
`;
}

const files = {};
const put = (rel, html) => { files[rel] = html; };
const artLink = (a, up, extra) => '<a href="' + up + a.id + '/' + (extra || "") + '">' + esc(a.t) + "</a>";
const course = H.courses[0];

// Home
{
  let b = '<h1>Looscid Help Center</h1>\n<p class="lead">Step-by-step help for Looscid, for everyone, on any phone or computer. New to Looscid? Start with the Looscid Basics course.</p>\n';
  b += '<section aria-labelledby="h-courses"><h2 id="h-courses">Courses</h2>\n';
  for (const c of H.courses) b += '<div class="card"><h3><a href="' + c.id + '/">' + esc(c.t) + '</a></h3><p>' + esc(c.s) + '</p><p class="progress" data-course="' + c.id + '" data-total="' + c.lessons.length + '">' + c.lessons.length + ' lessons</p></div>\n';
  b += '</section>\n<section aria-labelledby="h-cols"><h2 id="h-cols">Collections</h2>\n';
  for (const c of H.collections) {
    b += '<div class="card"><h3><a href="' + c.id + '/">' + esc(c.t) + '</a></h3><p>' + esc(c.s) + '</p><ul>' + H.articles.filter(a => a.c === c.id).map(a => "<li>" + artLink(a, "") + "</li>").join("") + "</ul></div>\n";
  }
  b += '</section>\n<section aria-labelledby="h-contact"><h2 id="h-contact">Contact Us</h2><p>' + esc(H.contact.s) + ' <a href="contact/">Report a bug or send feedback</a>.</p></section>';
  put("index.html", page({ slug: "", title: "Looscid Help Center", desc: "Step-by-step help for Looscid: make your LooscidID, write Dreams, chat, and set things up. Courses, collections and Contact Us.", body: b, depth: 0 }));
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
  b += '<h2>Report a bug</h2>\n<p>Found something broken? This opens a new GitHub issue with your device already filled in, so you just say what happened. GitHub asks you to log in there.</p>\n<p><a class="btn" id="help-report-bug" href="https://github.com/Looscid/Looscid/issues/new?labels=bug&amp;title=Bug%3A%20" target="_blank" rel="noopener noreferrer">Report a bug<span class="sr-only">, opens a new GitHub issue in a new tab</span></a></p>\n';
  b += '<h2>Send feedback or join the Discord</h2>\n<p>Ideas, questions, or just want to say hi? Join the Looscid Discord. Anything you write in the #feedback channel turns into a GitHub issue by itself, and LooscidBOT answers you there with the link.</p>\n<p><a class="btn" href="' + k.discord + '" target="_blank" rel="noopener noreferrer">Join the Looscid Discord<span class="sr-only">, opens in a new tab</span></a></p>\n';
  b += '<p>Already using Looscid? <a class="go" href="../../?p=%2FFeedback">Open Send Feedback</a> (Profile, More, Feedback) writes a GitHub issue for you.</p>\n';
  b += '<h2>See what others reported</h2>\n<p><a href="' + k.issues + '" target="_blank" rel="noopener noreferrer">Looscid\'s GitHub issues<span class="sr-only">, opens in a new tab</span></a>. Everything is public, so you can follow along.</p>';
  put("contact/index.html", page({ slug: "contact", title: k.t, desc: "Report a bug or send feedback about Looscid, on GitHub or the Looscid Discord.", body: b, depth: 1, crumbs: [["Help Center", "../"], [k.t, null]] }));
}
// What help.js needs: the course lessons and titles.
const meta = "/* Made by .github/scripts/build-help.mjs from app/js/helpdata.js. */\nwindow.LC_HELP_COURSES = " + JSON.stringify(Object.fromEntries(H.courses.map(c => [c.id, { t: c.t, lessons: c.lessons.map(id => [id, byId[id] ? byId[id].t : id]) }]))) + ";\n";
files["courses.js"] = meta;

// "post" is never a word in Looscid (standing rule).
for (const [rel, html] of Object.entries(files)) if (/\bpost(s|ed|ing)?\b/i.test(html.replace(/method="post"/gi, ""))) problems.push("the word post in " + rel);
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
