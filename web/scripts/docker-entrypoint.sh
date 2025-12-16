#!/usr/bin/env sh
set -e
# Optimized entrypoint for CMS hot reloading development

echo "[cms] 🚀 Starting Payload CMS with hot reloading..."

# Fast dependency check and install
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.pnpm/lock.yaml" ]; then
  echo "[cms] 📦 Installing dependencies (first time or after changes)..."
  
  if [ -f "./pnpm-lock.yaml" ]; then
    # Try frozen lockfile first, fall back to regular install if lockfile is outdated
    echo "[cms] 🔒 Attempting frozen lockfile install..."
    if ! pnpm install --frozen-lockfile --prefer-offline 2>/dev/null; then
      echo "[cms] 🔄 Lockfile outdated, updating dependencies..."
      pnpm install
    fi
  elif [ -f "./package-lock.json" ]; then
    npm ci || npm install
  else
    npm install
  fi
  
  echo "[cms] ✅ Dependencies installed!"
else
  echo "[cms] ✅ Dependencies up-to-date, skipping install"
fi

# Generate import map (quick operation)
echo "[cms] 🔧 Generating import map..."
npx payload generate:importmap || echo "[cms] ⚠️  Import map generation skipped"

# Start dev server
echo "[cms] 🔥 Starting dev server with hot reloading on port 3000..."
echo "[cms] 💡 Edit files and see changes automatically reload!"
echo "[cms] 📖 Admin: http://localhost:3000/admin"

# Execute the dev server (replaces shell process for clean shutdown)
exec npm run dev
