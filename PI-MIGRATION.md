# Raspberry Pi Migration Plan

Self-hosting the Roaming Roads website on a home Raspberry Pi using Docker, running side-by-side with Vercel during the transition.

---

## Phase 1: Umami Analytics on Pi (do this first)

Umami is cookie-free, GDPR-compliant, and requires no consent banner.

### Step 1 — Run Umami on the Pi

Create `~/umami/docker-compose.yml` on the Pi:

```yaml
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://umami:umami@umami-db:5432/umami
      APP_SECRET: <generate with: openssl rand -hex 32>
    depends_on:
      umami-db:
        condition: service_healthy
    restart: unless-stopped

  umami-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami"]
      interval: 5s
      retries: 5
    volumes:
      - umami_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  umami_data:
```

```bash
cd ~/umami && docker compose up -d
```

### Step 2 — Configure Umami

1. Visit `http://<pi-ip>:3001`
2. Login: `admin` / `umami` — **change the password immediately**
3. Settings → Websites → Add website → enter `roamingroads.nl`
4. Copy the **Website ID** (a UUID)

### Step 3 — Expose via Cloudflare Tunnel

This makes Umami reachable from the internet without port forwarding.

```bash
# Install cloudflared on Pi (ARM64)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
chmod +x cloudflared && sudo mv cloudflared /usr/local/bin/

# Login and create tunnel
cloudflared tunnel login
cloudflared tunnel create umami-tunnel

# Route your subdomain (must have roamingroads.nl in Cloudflare DNS)
cloudflared tunnel route dns umami-tunnel umami.roamingroads.nl

# Run as a systemd service
sudo cloudflared service install
```

Alternatively, add to your `~/umami/docker-compose.yml` as a service:

```yaml
  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token <your-tunnel-token>
    restart: unless-stopped
```

### Step 4 — Activate on Vercel

Set these in the **Vercel project environment variables**:

```
NEXT_PUBLIC_UMAMI_URL=https://umami.roamingroads.nl
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<website id from step 2>
```

Redeploy → analytics start flowing immediately. Dashboard at `https://umami.roamingroads.nl`.

---

## Phase 2: Full App Migration to Pi

### Code changes required

#### 1. `web/next.config.mjs` — Enable standalone output

Add `output: 'standalone'` (required by the production Dockerfile — it's in a comment there but missing from config):

```js
const nextConfig = {
  output: 'standalone',
  // ...rest unchanged
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'localhost' },
      // Add Pi's hostname via env var (no code change needed per domain):
      ...(process.env.NEXT_PUBLIC_SERVER_HOSTNAME
        ? [{ protocol: 'https', hostname: process.env.NEXT_PUBLIC_SERVER_HOSTNAME }]
        : []),
    ],
  },
}
```

#### 2. `web/src/payload.config.ts` — Remove hardcoded URL + fix CORS

Problems: `serverURL` is hardcoded to `www.roamingroads.nl` in production mode. CORS/CSRF only whitelist that domain. `payloadCloudPlugin` is Vercel-specific.

```ts
// Remove: payloadCloudPlugin() from plugins array

// Change serverURL from:
serverURL: process.env.NODE_ENV === 'production'
  ? 'https://www.roamingroads.nl'
  : process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

// To:
serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

// Add PAYLOAD_ADDITIONAL_CORS to cors and csrf arrays:
cors: [
  'https://roamingroads.nl',
  'https://www.roamingroads.nl',
  process.env.PAYLOAD_ADDITIONAL_CORS || '',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
].filter(Boolean),
```

**Important:** After this change, add `NEXT_PUBLIC_SERVER_URL=https://www.roamingroads.nl` to Vercel's environment variables.

#### 3. `web/docker-compose.prod.yml` — Production compose for Pi

```yaml
services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: roamingroads
      POSTGRES_USER: rruser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rruser -d roamingroads"]
      interval: 5s
      retries: 5
    restart: unless-stopped

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env.pi
    environment:
      - DATABASE_URI=postgresql://rruser:${DB_PASSWORD}@postgres:5432/roamingroads
      - NODE_ENV=production
    entrypoint: ["./docker-entrypoint-prod.sh"]
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 4. `web/scripts/docker-entrypoint-prod.sh`

```sh
#!/bin/sh
set -e
echo "[entrypoint] Running Payload migrations..."
node node_modules/.bin/payload migrate
echo "[entrypoint] Starting server..."
exec node server.js
```

```bash
chmod +x web/scripts/docker-entrypoint-prod.sh
```

#### 5. `web/.env.pi.template` → copy to `web/.env.pi` on Pi

```env
# === Roaming Roads — Pi Production ===

NEXT_PUBLIC_SERVER_URL=https://www.roamingroads.nl
NEXT_PUBLIC_SERVER_HOSTNAME=www.roamingroads.nl

PAYLOAD_SECRET=<generate: openssl rand -hex 32>
NODE_ENV=production

# DB password (match docker-compose.prod.yml DB_PASSWORD)
DB_PASSWORD=<strong random password>

# Media: keep Vercel Blob during transition (same token as Vercel)
BLOB_READ_WRITE_TOKEN=<from Vercel dashboard → Storage → Blob>

# CORS for Pi's URL during side-by-side testing
PAYLOAD_ADDITIONAL_CORS=https://pi.roamingroads.nl

# Analytics
NEXT_PUBLIC_UMAMI_URL=https://umami.roamingroads.nl
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<from Umami dashboard>

# Optional
NEXT_PUBLIC_MAPTILER_KEY=
```

---

### Initial database seed (one-time)

Reuse the existing `sync-production-db.ps1` script. It already dumps Neon → local Docker PostgreSQL. For the Pi:

**Option A (easiest):** Run sync locally, then copy the dump to Pi and restore there.
```bash
# On your dev machine — produces production-sync.sql locally
./sync-production-db.ps1

# Copy dump to Pi
scp production-sync.sanitized.sql pi@<pi-ip>:~/roaming-roads/

# On Pi — restore into the prod postgres container
docker compose -f docker-compose.prod.yml up -d postgres
docker exec -i <postgres-container> psql -U rruser -d roamingroads < production-sync.sanitized.sql
```

**Option B:** Modify `sync-production-db.ps1` to accept a target host parameter and point it at the Pi's exposed postgres port.

---

### Deployment sequence

1. On your dev machine: `docker build -t roaming-roads ./web`
2. Save & copy to Pi: `docker save roaming-roads | ssh pi@<pi-ip> docker load`
   — or build directly on the Pi (slower but simpler)
3. On Pi: copy `docker-compose.prod.yml` and create `.env.pi`
4. Seed the database (see above)
5. `docker compose -f docker-compose.prod.yml up -d`
6. Test at `http://<pi-ip>:3000`

### Going live

When the Pi is stable:
1. Update DNS A record for `www.roamingroads.nl` → Pi's public IP
2. Set up Caddy or nginx reverse proxy on Pi for HTTPS (Let's Encrypt)
3. Update Vercel env: `NEXT_PUBLIC_SERVER_URL=https://www.roamingroads.nl` (still needed for Vercel)
4. Remove Vercel deployment when fully migrated

---

## Side-by-side architecture

```
                    ┌─────────────────────────────────┐
                    │         Vercel (live)            │
                    │  www.roamingroads.nl             │
                    │  → Neon PostgreSQL               │
                    │  → Vercel Blob (media)           │
                    └─────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │      Raspberry Pi (staging)      │
                    │  pi.roamingroads.nl              │
                    │  → Local PostgreSQL (seeded)     │
                    │  → Vercel Blob (same token)      │
                    │  → Umami analytics               │
                    └─────────────────────────────────┘
```

Media stays on Vercel Blob throughout — zero migration needed for images.
