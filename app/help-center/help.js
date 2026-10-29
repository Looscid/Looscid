/* Looscid Help Center website (build 195). Plain script, no packages, nothing sent anywhere.
   - Collapsible extras (Screen reader tips): a button with aria-expanded, never inside a heading.
   - Courses: Lesson 1, 2, 3 with a Next button. Progress is saved only on this device (localStorage, looscid_help_progress),
     the same key the app's Help Center uses, so both show the same progress.
   - Report a bug: a new GitHub issue with the build and device filled in, like Report a bug in the app.
   The pages themselves are made by .github/scripts/build-help.mjs from app/js/helpdata.js. */
(function () {
  "use strict";
  var KEY = "looscid_help_progress";
  var ROOT = document.documentElement.getAttribute("data-help-root") || "";
  var live = document.getElementById("looscid-live");
  function say(t) { if (!live) return; live.textContent = ""; setTimeout(function () { live.textContent = t; }, 60); }
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function done(course) { var o = load(); return Array.isArray(o[course]) ? o[course] : []; }
  function mark(course, id) { var o = load(), d = Array.isArray(o[course]) ? o[course] : []; if (d.indexOf(id) < 0) d.push(id); o[course] = d; save(o); }

  // Collapsibles
  Array.prototype.forEach.call(document.querySelectorAll("button.more[aria-controls]"), function (b) {
    var t = document.getElementById(b.getAttribute("aria-controls")); if (!t) return;
    t.hidden = true;
    b.addEventListener("click", function () { var open = b.getAttribute("aria-expanded") === "true"; b.setAttribute("aria-expanded", open ? "false" : "true"); t.hidden = open; });
  });

  var COURSES = null;
  function withCourses(fn) {
    if (window.LC_HELP_COURSES) { fn(window.LC_HELP_COURSES); return; }
    var s = document.createElement("script"); s.src = ROOT + "courses.js";
    s.onload = function () { if (window.LC_HELP_COURSES) fn(window.LC_HELP_COURSES); };
    document.head.appendChild(s);
  }

  // Progress lines on the home and course pages
  function progressText(course, total) {
    var n = done(course).length; if (n > total) n = total;
    return n === 0 ? total + " lessons" : n >= total ? "All " + total + " lessons done" : n + " of " + total + " lessons done";
  }
  function paint() {
    Array.prototype.forEach.call(document.querySelectorAll(".progress[data-course]"), function (p) { p.textContent = progressText(p.getAttribute("data-course"), +p.getAttribute("data-total")); });
    var list = document.querySelector("ol.lessons[data-course]"); if (!list) return;
    var course = list.getAttribute("data-course"), d = done(course), items = list.querySelectorAll("li[data-lesson]"), firstOpen = -1;
    Array.prototype.forEach.call(items, function (li, i) {
      var isDone = d.indexOf(li.getAttribute("data-lesson")) >= 0, tag = li.querySelector(".done-tag");
      if (tag) tag.hidden = !isDone;
      if (!isDone && firstOpen < 0) firstOpen = i;
    });
    var go = document.getElementById("course-go");
    if (go && items.length) {
      if (firstOpen < 0) { go.textContent = "Course finished. Go over Lesson 1 again"; go.href = items[0].querySelector("a").getAttribute("href"); }
      else { go.textContent = (firstOpen === 0 && !d.length ? "Start" : "Continue with") + " Lesson " + (firstOpen + 1); go.href = items[firstOpen].querySelector("a").getAttribute("href"); }
    }
  }
  paint();
  var reset = document.getElementById("course-reset");
  if (reset) reset.addEventListener("click", function () {
    var list = document.querySelector("ol.lessons[data-course]"); if (!list) return;
    var o = load(); delete o[list.getAttribute("data-course")]; save(o); paint(); say("Progress cleared. The course starts at Lesson 1 again.");
  });

  // An article opened from a course: which lesson it is, and Previous and Next.
  var m = /[?&]course=([a-z0-9-]+)/.exec(location.search);
  var bar = document.getElementById("course-bar");
  if (m && bar) withCourses(function (all) {
    var co = all[m[1]]; if (!co) return;
    var here = (location.pathname.replace(/\/+$/, "").split("/").pop() || "");
    var idx = -1; co.lessons.forEach(function (l, i) { if (l[0] === here) idx = i; });
    if (idx < 0) return;
    var q = "?course=" + m[1], n = co.lessons.length, nav = document.createElement("nav");
    bar.textContent = co.t + ": Lesson " + (idx + 1) + " of " + n; bar.hidden = false;
    nav.className = "course-nav"; nav.setAttribute("aria-label", co.t + " lessons");
    function link(text, href, cls, onClick) { var a = document.createElement("a"); a.textContent = text; a.href = href; a.className = cls || ""; if (onClick) a.addEventListener("click", onClick); nav.appendChild(a); return a; }
    if (idx > 0) link("Previous lesson", "../" + co.lessons[idx - 1][0] + "/" + q, "btn ghost");
    if (idx < n - 1) link("Next: Lesson " + (idx + 2) + ", " + co.lessons[idx + 1][1], "../" + co.lessons[idx + 1][0] + "/" + q, "btn", function () { mark(m[1], here); });
    else link("Finish the course", "../" + m[1] + "/", "btn", function () { mark(m[1], here); });
    link("All lessons", "../" + m[1] + "/", "plain");
    var main = document.getElementById("main"); if (main) main.appendChild(nav);
  });

  // Report a bug: the same layout as Report a bug in the app (helpcenter.js, more.js lcBugReportUrl).
  var bug = document.getElementById("help-report-bug");
  if (bug) {
    var ua = navigator.userAgent || "unknown", ver = "";
    var make = function () {
      var body = ["**What happened?**", "", "", "**What did you expect to happen?**", "", "", "**How can I make it happen again?**", "1. ", "",
        "**Screen reader or braille display (if any):**", "", "", "---", ver || "Looscid (build not known, from the Help Center website)", "Device: " + ua, "Sent from the Help Center website"].join("\n");
      bug.href = "https://github.com/Looscid/Looscid/issues/new?labels=bug&title=" + encodeURIComponent("Bug: ") + "&body=" + encodeURIComponent(body);
    };
    make();
    try { fetch(ROOT + "../version.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) { if (j && j.label) { ver = j.label; make(); } }).catch(function () {}); } catch (e) {}
  }
})();
