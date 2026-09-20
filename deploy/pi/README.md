# Hosting on the Raspberry Pi

The site is a static export (`web/out/`) — the Pi just serves files, there's
no Node runtime or database. Deploys are built and pushed from home over the
LAN; there is no CI deploy and no public SSH exposure.

The Pi (`192.168.68.74`, user `pi`) already runs a `cloudflared` tunnel shared
by its other services, so this compose file does **not** start its own. Caddy
publishes on host port `8081`, and the existing tunnel routes to it at
`http://172.17.0.1:8081` — the same docker-bridge-gateway pattern umami,
homepage and wallos already use on this Pi.

```
home machine: pnpm build → tar over ssh (LAN)
                     │
                     ▼
   Pi: Caddy :8081  ←── existing cloudflared ──→ roamingroads.nl
        serves ~/roamingroads/site/current
```

## One-time setup on the Pi

1. Docker and Compose are already installed.
2. Copy this directory to `~/roamingroads/` on the Pi and make sure
   `~/roamingroads/site/current` exists and is owned by `pi` (otherwise Docker
   creates it as root and deploys can't write to it).
3. `docker compose up -d` in `~/roamingroads/`.
4. In the [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/),
   open the **existing** tunnel and add public hostnames
   `roamingroads.nl` and `www.roamingroads.nl` → `http://172.17.0.1:8081`.
   Adding the hostname repoints DNS away from Vercel — that's the cutover.

## Deploying

```bash
deploy/pi/deploy.sh
```

Builds `web/` and ships `web/out/` to `~/roamingroads/site/current` on the Pi.
Caddy picks up the new files on the next request — no restart needed. Override
`PI_HOST` / `PI_USER` / `PI_PATH` as env vars if anything moves.

GitHub Actions only runs lint/typecheck/tests (`.github/workflows/test.yml`) —
it never builds or deploys.
