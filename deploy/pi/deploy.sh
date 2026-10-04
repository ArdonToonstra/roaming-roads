#!/usr/bin/env bash
# Build the site and ship it to the Pi over the local network.
set -euo pipefail

PI_HOST="${PI_HOST:-192.168.68.74}"
PI_USER="${PI_USER:-pi}"
PI_PATH="${PI_PATH:-roamingroads/site/current}"

cd "$(dirname "$0")/../../web"
pnpm build

# Next's static export nests the RSC segment files when built on Windows
# (path.relative yields backslashes in next/dist/export/index.js), but the
# client requests flat dotted names — every <Link> prefetch 404s otherwise:
#   about/__next.X/about/__PAGE__.txt -> about/__next.X.about.__PAGE__.txt
# ponytail: no-op on Linux builds or once Next fixes it (still there in 16.4 canary).
find out -type f -path '*/__next.*/*' | while IFS= read -r f; do
  dir="${f%%/__next.*}"
  rest="${f#"$dir"/}"
  mv "$f" "$dir/${rest//\//.}"
done
find out -depth -type d -path '*/__next.*' -empty -delete

# ponytail: tar over ssh, not rsync — Windows has no rsync. Ships the whole
# ~130MB every deploy; swap in `rsync -az --delete out/ host:path` if you ever
# deploy from a machine that has rsync. The site is briefly incomplete during
# the extract (a few seconds) — fine for a site deployed by hand.
tar -cz -C out . | ssh "$PI_USER@$PI_HOST" \
  "mkdir -p ~/$PI_PATH && find ~/$PI_PATH -mindepth 1 -delete && tar -xz -C ~/$PI_PATH"

echo "Deployed to $PI_HOST"
