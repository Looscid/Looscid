/* Looscid, js/sitefooter.js: THE footer. One source for every page. */
(function (Looscid) {
"use strict";
// Each link: [words, address, the app page it opens inside Looscid (optional)]. ext: the other site's name.
const GROUPS = [
  { id: "make", t: "What I make", d: "Looscid itself, plus the small tools I build alongside it,", links: [["Looscid", "/Looscid/", "feed"], ["Help Center", "/Looscid/help/", "helpcenter"], { t: "2three1y", href: "https://2three1y.github.io/" }, { t: "chaoticmodel", href: "https://chaoticmodel.github.io/" }, { t: "Codetranslator", href: "https://github.com/2three1y/Codetranslator" }] },
  { id: "hi", t: "Say hi (contact)", d: "These are my official accounts,", links: [
    { t: "Discord", href: "https://discord.gg/M6xrD8EBXU" }, { t: "Reddit", href: "https://www.reddit.com/r/Looscid/" }, { t: "X", href: "https://x.com/Looscid" }, { t: "YouTube", href: "https://www.youtube.com/@Looscid" }, { t: "Looscid on GitHub", href: "https://github.com/Looscid/Looscid" }, { t: "Looscid GitHub organization", href: "https://github.com/Looscid" }
  ] },
  { id: "fine-print", t: "The fine print", d: "The boring-but-important bits,", links: [["Terms", "/Looscid/Terms/", "terms"], ["Privacy", "/Looscid/Privacy/", "privacy"], ["Licenses", "/Looscid/Legal/", "legal"], ["Credits", "/Looscid/Credits/", "credits"], ["External links", "/Looscid/external-links.html"], ["Status", "/Looscid/app/status.html"]] },
  { id: "about", t: "About", d: "How Looscid started and where it's going,", links: [["About Looscid", "/Looscid/About/", "settings_about"], ["Changelog", "/Looscid/changelog/"], ["Accessibility", "/Looscid/Accessibility/", "accessibility"]] },
];
function link(x) { return Array.isArray(x) ? { t: x[0], href: x[1], page: x[2] || null, ext: null } : { t: x.t, href: x.href, page: x.page || null, ext: x.ext || null }; }
const LOGO_ALT = "Looscid logo: a white open ring with a dot in the middle, on blue";
const LICENSE = { t: "GNU AGPL-3.0", href: "/Looscid/help/dev/license/" };
const MADE_BY = "Created by";
function copyLine(endYear) { return "© 2025–" + endYear + " Looscid"; }
function html(o) {
  const external = function(l) { try { const u=new URL(l.href, "https://looscid.github.io"); return /^https?:$/.test(u.protocol) && !/(^|\.)looscid\.github\.io$|(^|\.)looscid\.com$/i.test(u.hostname); } catch(e) { return false; } };
  const li = function (x) { const l = link(x), ext=external(l); return '<li><a href="' + l.href + '"' + (ext ? ' aria-label="' + l.t + ' — ' + l.href + '" target="_blank" rel="noopener noreferrer"' : "") + ">" + l.t + (ext ? ' (external)' : '') + "</a></li>"; };
  const col = function (g) { const id='sf-panel-'+g.id; return '<section class="sf-col"><button type="button" aria-expanded="false" aria-controls="'+id+'">'+g.t+'</button><div id="'+id+'" hidden><h2>'+g.t+'</h2><p>'+g.d+'</p><ul>' + g.links.map(li).join("") + '</ul></div></section>'; };
  return '<footer class="sf"><div class="sf-in"><p class="sf-intro">I\'m Carter. I build Looscid, an open, local-first home for Dreams.</p><p class="sf-brand"><img src="/Looscid/assets/icons/icon-512.png?v=nl1" alt="'+LOGO_ALT+'" role="img" aria-label="'+LOGO_ALT+'" width="28" height="28"><span class="sf-name" aria-hidden="true">Looscid</span></p><div class="sf-cols">'+GROUPS.map(col).join('')+'</div><p class="sf-bottom">Created by <a href="https://2three1y.github.io/">2three1y</a></p></div></footer>';
}
Looscid.LC_FOOTER = { groups: GROUPS, link: link, html: html, copyLine: copyLine, LOGO_ALT: LOGO_ALT, LICENSE: LICENSE, MADE_BY: MADE_BY };
})(window.Looscid = window.Looscid || {});
