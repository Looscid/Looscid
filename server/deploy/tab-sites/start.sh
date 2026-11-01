#!/bin/sh
# Looscid home server on Tab's site box. The database and media live OUTSIDE the site folder, in
# $HOME/looscidserver-data, so republishing never touches accounts, Dreams or Chats.
cd "$(dirname "$0")/app"
export REM_DATA="$HOME/looscidserver-data"
mkdir -p "$REM_DATA"; chmod 700 "$REM_DATA"
export REM_PUBLIC_HOST="looscidserver.sites.tab.bot"
export REM_OWNER_INVITE_SHA256="$(cat ../bootstrap/owner.sha256)"
export REM_BACKUP_KEY_SHA256="$(cat ../bootstrap/backup.sha256)"
export PORT=8080 NODE_ENV=production
# SQLite's native file ships in small pieces; put it back together once (checked by its sha256).
N=.native/better_sqlite3-node-v115.node
if [ ! -f "$N" ] || [ "$(sha256sum "$N" | cut -d' ' -f1)" != "$(cat "$N.sha256")" ]; then
  cat "$N".part* > "$N.tmp" && mv -f "$N.tmp" "$N"
fi
LOG="$REM_DATA/server.log"
[ -f "$LOG" ] && [ "$(wc -c < "$LOG")" -gt 5000000 ] && mv -f "$LOG" "$LOG.1"
echo "$(date -u +%FT%TZ) start $(node --version) data=$(du -sh "$REM_DATA" | cut -f1) free=$(df -h "$HOME" | tail -1 | awk '{print $4}')" | tee -a "$LOG"
node --max-old-space-size=192 server/main.mjs 2>&1 | tee -a "$LOG"
