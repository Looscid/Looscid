--- a/app/js/remsync.js
+++ b/app/js/remsync.js
@@ -116,7 +116,7 @@
    device (Rem v1 only holds public Dreams). Dreams that already have a signed id (Dreamed to Rem or Nostr before) are
    left as they are. Edits and deletes of Dreams on Rem already go out from js/nostr.js. onlyKeys = "d:<id>"/"r:<id>"
    keys you picked, or null for everything. */
-function isPublic(d) { return !d.aud || d.aud === "everyone" || d.aud === "public"; }
+function isPublic(d) { return !!d && !d.draft && (!d.aud || d.aud === "everyone" || d.aud === "public") && (!d.audience || d.audience === "everyone" || d.audience === "public"); }
 function remCounts(pk) {
   const ds = localDreams(pk), rs = localReplies(pk), all = ds.concat(rs);
   return { dreams: ds.length, replies: rs.length, on: all.filter(function (d) { return isHex64(d.nid); }).length, pub: all.filter(isPublic).length };
@@ -140,17 +140,19 @@
     const pk = st.pubkey;
     const res = { sent: 0, already: 0, refused: 0, messages: [], noParent: 0, tooLong: 0, edits: 0, priv: 0, queued: 0, okD: 0, okR: 0, old: 0, okKeys: [] };
     const fa = forgotAt();
+    const remOk = new Set(Array.isArray(cfg().remOk) ? cfg().remOk : []);
     const items = localDreams(pk).map(function (d) { return { k: "d:" + d.id, d: d }; }).concat(localReplies(pk).map(function (r) { return { k: "r:" + r.id, d: r }; }))
       .filter(function (it) { return !onlyKeys || onlyKeys.has(it.k); });
     let i = 0;
     for (const it of items) {
       i++;
       if (!isPublic(it.d)) { res.priv++; continue; }
+      if (remOk.has(it.k)) { res.already++; continue; }
       if (isHex64(it.d.nid)) { res.already++; continue; }
       if (fa && atOf(it.d) <= fa) { res.old++; continue; } // you deleted your Rem data after this one: it stays here
       if (N.isPending && N.isPending(it.d.id)) continue; // waiting for your passcode in js/nostr.js's queue: it goes from there
       const fresh = (it.k[0] === "d" ? localDreams(pk) : localReplies(pk)).find(function (x2) { return String(x2.id) === String(it.d.id); }) || it.d;
-      const r = await N.publishToRem(Object.assign({}, fresh, { created: atOf(fresh) }));
+      const r = await N.publishToRem(Object.assign({}, fresh, { aud: "public", audience: "public", created: atOf(fresh) }));
       if (r.already) res.already++;
       else if (r.wait) res.noParent++;
       else if (r.ok) { res.sent++; if (it.k[0] === "d") res.okD++; else res.okR++; res.okKeys.push(it.k); }
