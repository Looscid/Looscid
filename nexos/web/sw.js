/* NexOS Web offline cache, ported into Looscid (nexos/web/): network first, falling back to the cached copy.
   Same-origin only. It only clears its own "nexos-web-" caches, so it never touches anything else on the site. */
const CACHE = "nexos-web-looscid-v1";
const FILES = ["./", "index.html", "styles.css", "script.js", "../apps/nexos-embed.js", "../apps/easyconvert/jszip.min.js", "../apps/insomnia/index.html", "../apps/insomnia/styles.css", "../apps/insomnia/script.js"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.indexOf("nexos-web") === 0 && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then((m) => m || caches.match("index.html"))));
});
