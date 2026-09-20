# Hosting on the Raspberry Pi

The site is a static export (`web/out/`) — the Pi just needs to serve files,
there's no Node runtime or database involved. Deploys are built and pushed
from home, straight over the local network — no CI, no public SSH exposure
for deploys. The Pi runs Caddy to serve the site and `cloudflared` to expose
it publicly, via the compose file in this directory.

This reuses the same Cloudflare Tunnel approach as the Umami analytics setup
in `PI-MIGRATION.md` — no ports are forwarded on the router, and the Pi is
never directly reachable from the internet for *serving* the site. Deploys
go over the LAN instead, so they don't need the tunnel at all.

## One-time setup on the Pi

1. Install Docker and Docker Compose on the Pi if not already present.
2. Copy this `deploy/pi/` directory to the Pi, e.g. `~/roamingroads/`.
3. Make sure you can `ssh` into the Pi from your home machine with your own
   user (key-based auth recommended: `ssh-copy-id pi@raspberrypi.local`).
   That's the account `deploy.sh` rsyncs over — no separate deploy user needed
   since this never leaves your LAN.
4. In the [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/),
   create a tunnel (or reuse the one from the Umami setup) and add a public
   hostname `roamingroads.nl` / `www.roamingroads.nl` → `http://web:80` (the
   `web` service in this compose file, reached over the tunnel's internal
   Docker network). Copy the tunnel token into `.env` next to this compose
   file:
   ```
   TUNNEL_TOKEN=<tunnel token from the Cloudflare dashboard>
   ```
5. Update the DNS records for `roamingroads.nl` / `www.roamingroads.nl` in
   Cloudflare DNS to be proxied CNAMEs pointing at the tunnel (the dashboard
   does this automatically when you add the public hostname above).
6. `docker compose up -d` in this directory.

## Deploying

From your home machine, with `web/.env` set up (`NEXT_PUBLIC_MAPTILER_KEY`,
and the Umami vars once that's live — see `PI-MIGRATION.md`):

```bash
deploy/pi/deploy.sh
```

Edit the `PI_HOST` / `PI_USER` / `PI_PATH` variables at the top of that
script once for your setup. It runs `pnpm build` in `web/` and `rsync`s
`web/out/` into `~/roamingroads/site/current/` on the Pi; Caddy serves
whatever is there — no restart needed, the next request just picks up the
new files.

GitHub Actions only runs lint/typecheck/tests on push (see
`.github/workflows/test.yml`) — it never builds or deploys.
