/* Looscid, js/sitefooter.js: THE footer. One source for every page (Nov 8 2026, Carter: "the footer on the Help Center
   and component library pages becomes the one footer on every page of the app").
   - The app draws it from this list (core.js LcSiteFooter), at the end of every scrolling page.
   - The website pages (Help Center, the component library, the changelog, the status page, Page not found) get the same
     markup written in by .github/scripts/build-help.mjs, which reads this file. Run it again after a change here
     (node .github/scripts/build-help.mjs); the Validate check fails when a page is out of date.
   Six groups, each with its own heading: Important (About Looscid, first), Get help, Project, Looscid, Legal and Say hi. Links to other sites carry a
   title hint ("Go to GitHub"). Every link is in one group only. Plain script, no framework; nothing is sent anywhere. */
(function (Looscid) {
"use strict";
// Each link: [words, address, the app page it opens inside Looscid (optional)]. ext: the other site's name.
const GROUPS = [
  // Nov 8 2026 (Carter, 5:47 and 5:54 PM: it's Important, part of Looscid, and the page IS About Looscid): its own group, first,
  // so About Looscid is one of the first links a screen reader reaches in the footer. Why Looscid? is part of it now.
  { id: "important", t: "Important", links: [["About Looscid", "/Looscid/About/", "settings_about"]] },
  { id: "help", t: "Get help", links: [["Looscid Home", "/Looscid/", "feed"], ["Help Home", "/Looscid/help/", "helpcenter"], ["Getting Started", "/Looscid/help/getting-started/"],
    ["Looscid Basics course", "/Looscid/help/looscid-basics/"], ["Accessibility", "/Looscid/help/dev/accessibility/"], ["Report Center", "/Looscid/Report/", "report_center"],
    ["Contact Us", "/Looscid/help/contact/"], ["Send Feedback", "/Looscid/Feedback/", "feedback"]] },
  { id: "project", t: "Project", links: [["Roadmap &amp; Changelog", "/Looscid/changelog/"], ["Status", "/Looscid/status.html"], ["Docs", "/Looscid/help/#h-building"],
    ["Contributing", "/Looscid/help/dev/contributing/"], { t: "Source code", href: "https://github.com/Looscid/Looscid", ext: "GitHub" }, { t: "Issues", href: "https://github.com/Looscid/Looscid/issues", ext: "GitHub" }] },
  { id: "looscid", t: "Looscid", links: [["Our Story", "/Looscid/Our-Story/", "hour_story"], ["Credits", "/Looscid/Credits/", "credits"]] },
  { id: "legal", t: "Legal", links: [["Terms", "/Looscid/Terms/", "terms"], ["Privacy", "/Looscid/Privacy/", "privacy"], ["Rules", "/Looscid/Rules/", "guidelines"],
    ["Child Safety", "/Looscid/Child-Safety/", "child_safety"], ["License", "/Looscid/Legal/", "legal"]] },
  { id: "hi", t: "Say hi", links: [{ t: "GitHub", href: "https://github.com/Looscid", ext: "GitHub" }, { t: "X", href: "https://x.com/Looscid", ext: "X" },
    { t: "YouTube", href: "https://www.youtube.com/@Looscid", ext: "YouTube" }, { t: "Discord", href: "https://discord.gg/M6xrD8EBXU", ext: "Discord" }] },
];
// One link as { t, href, page, ext } (t is written as HTML: only &amp; is ever in it).
function link(x) { return Array.isArray(x) ? { t: x[0], href: x[1], page: x[2] || null, ext: null } : { t: x.t, href: x.href, page: x.page || null, ext: x.ext || null }; }
const LOGO_ALT = "Looscid logo: a white open ring with a dot in the middle, on blue";
const LICENSE = { t: "GNU AGPL-3.0", href: "/Looscid/help/dev/license/" };
const MADE_BY = "Made by Chaotic Carter, co-written with Tab";
// The words of the bottom line, from the build: "© 2025–2026 Looscid · Open source under the GNU AGPL-3.0 · Made by ... · Looscid 2026.138.57 (195)".
function copyLine(endYear) { return "\u00a9 2025\u2013" + endYear + " Looscid"; }
// The footer as HTML, for the website pages (the build writes it in). o: { endYear, build } (build: "Looscid 2026.138.57 (195)").
function html(o) {
  const li = function (x) { const l = link(x); return '<li><a href="' + l.href + '"' + (l.ext ? ' title="Go to ' + l.ext + '" target="_blank" rel="noopener noreferrer"' : "") + ">" + l.t + "</a></li>"; };
  const col = function (g) { return '<section class="sf-col" aria-labelledby="sf-h-' + g.id + '"><h2 id="sf-h-' + g.id + '">' + g.t + "</h2><ul>" + g.links.map(li).join("") + "</ul></section>"; };
  return "<footer class=\"sf\">\n<div class=\"sf-in\">\n<p class=\"sf-brand\"><img src=\"/Looscid/assets/icons/icon-512.png?v=nl1\" alt=\"" + LOGO_ALT + "\" role=\"img\" aria-label=\"" + LOGO_ALT + "\" width=\"28\" height=\"28\"><span class=\"sf-name\" aria-hidden=\"true\">Looscid</span></p>\n<div class=\"sf-cols\">\n" +
    GROUPS.map(col).join("\n") + "\n</div>\n<p class=\"sf-bottom\">" + copyLine(o.endYear).replace("\u00a9", "©").replace("\u2013", "–") + " <span aria-hidden=\"true\">·</span> Open source under the <a href=\"" + LICENSE.href + "\">" + LICENSE.t + "</a> <span aria-hidden=\"true\">·</span> " + MADE_BY + " <span aria-hidden=\"true\">·</span> " + o.build + "</p>\n</div>\n</footer>";
}
Looscid.LC_FOOTER = { groups: GROUPS, link: link, html: html, copyLine: copyLine, LOGO_ALT: LOGO_ALT, LICENSE: LICENSE, MADE_BY: MADE_BY };
})(window.Looscid = window.Looscid || {});
