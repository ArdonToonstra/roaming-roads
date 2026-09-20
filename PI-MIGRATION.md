# Raspberry Pi Migration Plan

Self-hosting the Roaming Roads website on a home Raspberry Pi using Docker.

The site is now a fully static export (Payload CMS, Postgres, and Vercel
Blob have all been removed — content lives as YAML in `web/content/`, edited
via git; media lives in `web/public/media/`, kept out of git and rsynced as
part of each deploy — see `web/content/README.md`). That makes this simpler
than the original plan: there's no database to run or seed, and no Node
server to keep alive on the Pi — just static files behind Caddy.

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
      DATABASE_URL: postgresql://umami:<same password as below>@umami-db:5432/umami
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
      POSTGRES_PASSWORD: <generate with: openssl rand -hex 32>
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

This makes Umami reachable from the internet without port forwarding. The
same tunnel is reused for the site itself in Phase 2 below — you only need
to set this up once.

```bash
# Install cloudflared on Pi (ARM64)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
chmod +x cloudflared && sudo mv cloudflared /usr/local/bin/

# Login and create tunnel
cloudflared tunnel login
cloudflared tunnel create roamingroads

# Route subdomains (roamingroads.nl must already be in Cloudflare DNS)
cloudflared tunnel route dns roamingroads umami.roamingroads.nl
```

Add it as a service in `~/umami/docker-compose.yml`:

```yaml
  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token <your-tunnel-token>
    restart: unless-stopped
```

### Step 4 — Set the analytics env vars

Once the site is deployed (Phase 2), add these to `web/.env` so
`deploy/pi/deploy.sh` picks them up on the next build:

```
NEXT_PUBLIC_UMAMI_URL=https://umami.roamingroads.nl
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<website id from step 2>
```

Dashboard at `https://umami.roamingroads.nl`.

---

## Phase 2: Static Site on the Pi

Everything needed for this lives in `deploy/pi/` (Caddy + Cloudflare Tunnel
compose setup, plus `deploy.sh`). Deploys are built and pushed from home,
not CI. Summary:

1. `deploy/pi/deploy.sh` runs `pnpm build` (static export, `output: 'export'`
   in `next.config.mjs`) locally — no ARM cross-compilation needed, it's
   plain HTML/CSS/JS/images.
2. It `rsync`s `web/out/` straight to the Pi over the local network (SSH,
   your own login — no Cloudflare Tunnel needed for this, that's only for
   public traffic).
3. On the Pi, Caddy serves those files directly; `cloudflared` routes
   `roamingroads.nl` / `www.roamingroads.nl` to it. No Node process, no
   database, nothing to keep running besides Caddy and cloudflared.

GitHub Actions (`.github/workflows/test.yml`) only runs lint/typecheck/tests
on push — it never builds or deploys.

See `deploy/pi/README.md` for the one-time setup (SSH access, Cloudflare
Tunnel hostname) and `deploy/pi/docker-compose.yml` / `deploy/pi/Caddyfile`
for the Pi-side config.

### Architecture

```
                   Home machine (on demand)
                    → pnpm build (static export)
                    → rsync over SSH, local network
                            │
                            ▼
                  ┌───────────────────────────┐
                  │       Raspberry Pi         │
                  │  Caddy — serves web/out/   │
                  │  cloudflared — the tunnel  │
                  │  Umami — analytics         │
                  └───────────────────────────┘
                            │
                cloudflared tunnel (no open ports)
                            │
                            ▼
              roamingroads.nl / www.roamingroads.nl
```
