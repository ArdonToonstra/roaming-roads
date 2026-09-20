#!/usr/bin/env bash
# Build the site and rsync it straight to the Pi over the local network.
# Run from anywhere; edit PI_HOST/PI_USER/PI_PATH below once for your setup.
set -euo pipefail

PI_HOST="raspberrypi.local"
PI_USER="pi"
PI_PATH="~/roamingroads/site/current/"

cd "$(dirname "$0")/../../web"
pnpm build
rsync -az --delete out/ "$PI_USER@$PI_HOST:$PI_PATH"
echo "Deployed to $PI_HOST"
