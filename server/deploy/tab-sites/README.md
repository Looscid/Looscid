# Hosting on Tab's sites (how looscidserver.sites.tab.bot runs)

Folder layout that gets published:

```
start.sh           this file's copy
tab-site.json      {"kind":"server","start":"sh start.sh","port":8080}
bootstrap/owner.sha256   sha256 of the owner code (the code itself is never on the server)
bootstrap/backup.sha256  sha256 of the backup key
app/               the repo (without .git and test/), plus .native/ with the SQLite native file in <900 KB pieces
```

The database and media live in `$HOME/looscidserver-data`, outside the site folder, so republishing never touches
them. They are lost only if the hosting machine itself is replaced, which is why a backup is pulled off the machine
every night (`GET /rem/v0/admin/backup`).
