# Hosting on the Raspberry Pi

The site is a static export (`web/out/`) — the Pi just needs to serve files,
there's no Node runtime or database involved. GitHub Actions builds the site
on every push to `main` and ships it to the Pi over SSH through a Cloudflare
Tunnel; the Pi runs Caddy to serve it and `cloudflared` to expose it, both
via the compose file in this directory.

This reuses the same Cloudflare Tunnel approach as the Umami analytics setup
in `PI-MIGRATION.md` — no ports are forwarded on the router, and the Pi is
never directly reachable from the internet.

## One-time setup on the Pi

1. Install Docker and Docker Compose on the Pi if not already present.
2. Copy this `deploy/pi/` directory to the Pi, e.g. `~/roamingroads/`.
3. Create a dedicated low-privilege `deploy` user whose only job is
   receiving `rsync` uploads into `~/roamingroads/site/current/`:
   ```bash
   sudo useradd -m -s /usr/sbin/nologin deploy
   sudo -u deploy mkdir -p /home/deploy/.ssh
   ```
   Generate an SSH key pair for GitHub Actions to use, and restrict it in
   `/home/deploy/.ssh/authorized_keys` with a forced command so the key can
   only run `rsync`, nothing else:
   ```
   command="rsync --server -logDtprze.iLsfx . /home/deploy/site/current",restrict ssh-ed25519 AAAA... github-actions-deploy
   ```
   Symlink or bind-mount `/home/deploy/site` to this directory's `site/`
   folder so the container sees the same files.
4. In the [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/),
   create a tunnel (or reuse the one from the Umami setup) and add:
   - Public hostnames `roamingroads.nl` and `www.roamingroads.nl` →
     `http://web:80` (the `web` service in this compose file, reached over
     the tunnel's internal Docker network).
   - A private TCP hostname, e.g. `ssh.roamingroads.nl` → `ssh://web:22`
     pointed instead at the Pi's own SSH port (`ssh://localhost:22`), gated
     behind a Cloudflare Access **service token** (Access → Service Auth) so
     only GitHub Actions' token can open it.
   Copy the tunnel token into `.env` next to this compose file:
   ```
   TUNNEL_TOKEN=<tunnel token from the Cloudflare dashboard>
   ```
5. Update the DNS records for `roamingroads.nl` / `www.roamingroads.nl` in
   Cloudflare DNS to be proxied CNAMEs pointing at the tunnel (the dashboard
   does this automatically when you add the public hostname above).
6. `docker compose up -d` in this directory.

## GitHub repository secrets

| Secret | Value |
|---|---|
| `DEPLOY_SSH_KEY` | Private half of the key pair created above |
| `PI_SSH_USER` | `deploy` |
| `CF_ACCESS_CLIENT_ID` | Service token Client ID (Access → Service Auth) |
| `CF_ACCESS_CLIENT_SECRET` | Service token Client Secret |
| `NEXT_PUBLIC_MAPTILER_KEY` | Optional — MapTiler API key |
| `NEXT_PUBLIC_UMAMI_URL` / `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Optional — once Umami is live |

See `.github/workflows/deploy.yml` for how these are used.

## Deploying

Just push to `main`. The workflow builds `web/out/` and `rsync`s it into
`~/roamingroads/site/current/` on the Pi; Caddy serves whatever is there —
no restart needed, the next request just picks up the new files.
