#!/usr/bin/env sh
set -e
# Minimal entrypoint for the CMS container used by docker-compose.
# Runs install once, generates the rich text import map, then execs the dev server
# so PID 1 is the Node process (reduces duplicate log output from shells).

echo "[cms] running entrypoint: install -> generate importmap -> dev"
# Use npm ci when lockfile is present to keep installs deterministic and quieter
if [ -f "./package-lock.json" ] || [ -f "./pnpm-lock.yaml" ]; then
  npm ci --silent || npm install --silent
else
  npm install --silent
fi

# Generate import map required by Payload rich text once
npx payload generate:importmap --silent || true

# Replace the shell with the dev server process to avoid shell double-logging
exec npm run dev
