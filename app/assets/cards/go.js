/* Per-page link cards (Oct 26 2026, Carter: "Could we do cards for every Looscid page"). Each page's folder, like
   Discover/, holds a small page that only exists so X, iMessage and Discord can read that page's own link card
   (they can't run the app). For people, this sends you straight into the app on that page (?p=, the same way 404.html
   does), and the app puts the real address back. The page to open is in the data-lc-go attribute on <html>. */
(function () {
  var go = document.documentElement.getAttribute("data-lc-go");
  if (!go || !/^[A-Za-z0-9\/\-]+$/.test(go)) go = "";
  location.replace("/Looscid/" + (go ? "?p=" + encodeURIComponent("/" + go) : "") + location.hash);
})();
