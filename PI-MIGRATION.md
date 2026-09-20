# Raspberry Pi Migration Plan

Self-hosting the Roaming Roads website on a home Raspberry Pi using Docker.

The site is now a fully static export (Payload CMS, Postgres, and Vercel
Blob have all been removed — content lives as JSON + images in `web/content/`
and `web/public/images/`, edited via git). That makes this simpler than the
original plan: there's no database to run or seed, and no Node server to
keep alive on the Pi — just static files behind Caddy.

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

Once the site is deployed (Phase 2), set these as GitHub repository secrets
so the build picks them up (see `deploy/pi/README.md`):

```
NEXT_PUBLIC_UMAMI_URL=https://umami.roamingroads.nl
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<website id from step 2>
```

Dashboard at `https://umami.roamingroads.nl`.

---

## Phase 2: Static Site on the Pi

Everything needed for this lives in `deploy/pi/` (Caddy + Cloudflare Tunnel
compose setup and full instructions) and `.github/workflows/deploy.yml` (the
build-and-deploy pipeline). Summary:

1. GitHub Actions builds the static export (`pnpm build`, `output: 'export'`
   in `next.config.mjs`) on every push to `main` — no ARM cross-compilation
   needed, it's plain HTML/CSS/JS/images.
2. It ships `web/out/` to the Pi over SSH, tunneled through the same
   Cloudflare Tunnel used for Umami above, via `rsync`.
3. On the Pi, Caddy serves those files directly; `cloudflared` routes
   `roamingroads.nl` / `www.roamingroads.nl` to it. No Node process, no
   database, nothing to keep running besides Caddy and cloudflared.

See `deploy/pi/README.md` for the one-time setup (Cloudflare Tunnel
hostnames, the restricted deploy SSH key, GitHub secrets) and
`deploy/pi/docker-compose.yml` / `deploy/pi/Caddyfile` for the Pi-side
config.

### Architecture

```
                  GitHub Actions (on push to main)
                    → pnpm build (static export)
                    → rsync over SSH via Cloudflare Tunnel
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
