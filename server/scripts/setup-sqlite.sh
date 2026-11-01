#!/bin/sh
# Fetches the prebuilt SQLite native file for better-sqlite3 12.4.1 (MIT) that matches this Node version,
# checks it, and puts it in .native/. Only needed once per Node major version.
set -e
cd "$(dirname "$0")/.."
V=12.4.1
ABI=$(node -p process.versions.modules)
case "$(uname -m)" in x86_64) ARCH=x64 ;; aarch64|arm64) ARCH=arm64 ;; *) echo "Unsupported CPU: $(uname -m)"; exit 1 ;; esac
OS=$(node -p process.platform)
mkdir -p .native
OUT=".native/better_sqlite3-node-v$ABI.node"
[ -f "$OUT" ] && { echo "Already there: $OUT"; exit 0; }
URL="https://github.com/WiseLibs/better-sqlite3/releases/download/v$V/better-sqlite3-v$V-node-v$ABI-$OS-$ARCH.tar.gz"
echo "Downloading $URL"
TMP=$(mktemp -d)
curl -fsSL "$URL" -o "$TMP/b.tgz"
tar -xzf "$TMP/b.tgz" -C "$TMP"
cp "$TMP/build/Release/better_sqlite3.node" "$OUT"
rm -rf "$TMP"
# Known-good checksums (linux x64) for the Node versions the home was tested on:
case "$ABI-$OS-$ARCH" in
  115-linux-x64) WANT=2e3ad2928d4ee94f4cc0e67f5e76eb7fe00fa16747b66ed2446930e60bda0957 ;;
  127-linux-x64) WANT=74ab8380917903b45ed535e56fbc1350cdd5c9f1082ded1eb5536667dc7aa700 ;;
  *) WANT="" ;;
esac
if [ -n "$WANT" ] && [ "$(sha256sum "$OUT" | cut -d' ' -f1)" != "$WANT" ]; then echo "Checksum mismatch, removing $OUT"; rm -f "$OUT"; exit 1; fi
echo "Ready: $OUT"
