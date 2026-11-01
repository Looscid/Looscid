#!/bin/sh
# Copies the real Looscid app into webapp/, which the server serves at / (the classic client stays at /classic/).
# The server lives in the Looscid repo (github.com/Looscid/Looscid, folder server/), next to the app's own app/ folder.
# webapp/ is that app/ folder, finished the same way the app's GitHub Pages deploy does it
# (.github/workflows/pages.yml): CHANGELOG.md copied in, the Help Center copied to help/. Nothing in the app is changed.
#   sh scripts/fetch-app.sh            the pinned commit (scripts/app-commit.txt), downloaded from GitHub
#   sh scripts/fetch-app.sh <sha>      another commit (then put it in scripts/app-commit.txt)
#   sh scripts/fetch-app.sh here       the app/ in the repo this server folder sits in (your clone, as it is now)
#   sh scripts/fetch-app.sh <folder>   any local clone of Looscid/Looscid (for testing)
# Then republish. webapp/ is not in git (it's ~15 MB, a copy of ../app); this script rebuilds it.
set -eu
cd "$(dirname "$0")/.."
SRC="${1:-$(tr -d ' \n' < scripts/app-commit.txt)}"
[ "$SRC" = here ] && SRC=..
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
if [ -d "$SRC" ]; then
  from="$SRC"; commit=$(git -C "$SRC" rev-parse HEAD 2>/dev/null || echo local)
else
  curl -fsSL --max-time 100 "https://codeload.github.com/Looscid/Looscid/tar.gz/$SRC" | tar -xz -C "$tmp"
  from=$(ls -d "$tmp"/*/); commit="$SRC"
fi
[ -f "$from/app/index.html" ] || { echo "no app/index.html in $SRC" >&2; exit 1; }
rm -rf webapp.new
cp -R "$from/app" webapp.new
cp "$from/CHANGELOG.md" webapp.new/CHANGELOG.md
[ -d webapp.new/help-center ] && cp -R webapp.new/help-center webapp.new/help
echo "$commit" > webapp.new/APP_COMMIT
rm -rf webapp && mv webapp.new webapp
echo "webapp/ = Looscid app at $commit ($(find webapp -type f | wc -l) files)"
