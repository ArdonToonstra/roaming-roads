# Pi Migration — remaining steps

Picking this up later: the Pi already serves the site. What's left is the DNS
cutover and tearing down Vercel.

## Done

- Payload, Postgres and Vercel Blob are out of the app. Content is YAML in
  `web/content/`, media is webp in `web/public/media/`.
- Pi (`192.168.68.74`, user `pi`) serves the static export with Caddy on host
  port `8081`, from `~/roamingroads/site/current`. `restart: unless-stopped`
  and docker is enabled at boot, so it survives a reboot.
- `deploy/pi/deploy.sh` builds and ships the site over the LAN (~35s).
- Umami and a `cloudflared` tunnel were already running on the Pi and are
  shared with its other services — the site reuses that tunnel rather than
  starting a second one. Analytics is baked into the build already.

Verify any time with: `curl -I http://192.168.68.74:8081/`

## Step 1 — Point roamingroads.nl at the Pi

This is the cutover. Everything else is cleanup.

`roamingroads.nl` currently resolves to Vercel (`216.198.79.1`,
`64.29.17.65`), and `roamingroads.nl` redirects to `www.roamingroads.nl`.

1. In Cloudflare DNS, **delete the existing A records** for `roamingroads.nl`
   and `www` that point at Vercel. The tunnel needs to create proxied CNAMEs
   on those names and will conflict with the A records otherwise.
2. In the [Zero Trust dashboard](https://one.dash.cloudflare.com/) →
   Networks → Tunnels, open the **existing** tunnel (the one already running
   on the Pi — don't create a new one) and add two public hostnames:
   - `roamingroads.nl` → `http://172.17.0.1:8081`
   - `www.roamingroads.nl` → `http://172.17.0.1:8081`

   `172.17.0.1` is the docker bridge gateway; it's how the tunnel container
   reaches Caddy's published port. Same pattern umami/homepage/wallos use.
3. Check it: `curl -I https://roamingroads.nl` — the `Server: Vercel` header
   should be gone, and pages should load.
4. Confirm hits are landing in Umami at https://umami.roamingroads.nl.

Rollback if anything looks wrong: delete the two public hostnames and put the
Vercel A records back. Keep Vercel alive until you've done step 2.

## Step 2 — Live for a few days before deleting anything

Cloudflare caches static assets at the edge, so the Pi's upstream only serves
cache misses. Watch that pages, images and the maps all work from outside the
house (phone on mobile data is the easy test).

## Step 3 — Back up the media before killing Vercel Blob

**Do this before step 4.** `web/media-originals/` (529 files, 313 MB) is
gitignored and is the *only* full-resolution copy — the Pi has just the
downsampled webp. `web/content/.media-sources.json` holds the Blob URLs, and
`scripts/fetch-media.ts` can re-pull them, but only while the Blob store still
exists. Once you delete it, this folder is irreplaceable.

Copy `web/media-originals/` to an external disk or cloud backup first.

## Step 4 — Decommission Vercel

Only after steps 1–3:

1. Delete the Blob store.
2. Delete the Postgres database, if the Payload one is still around.
3. Delete (or pause) the Vercel project.
4. Locally: `rm -rf web/.vercel` — a gitignored link to the project.

## Step 5 — Repo cleanup

Dead weight from the Payload/npm era, safe to remove once Vercel is gone:

- `web/package-lock.json` — tracked alongside `pnpm-lock.yaml`. The project
  uses pnpm; two lockfiles is a trap. Delete it.
- `web/scripts/export-content.ts` and `web/scripts/fetch-media.ts` — one-shot
  migration scripts. `export-content.ts` says so itself. Keep `fetch-media.ts`
  until the Blob store is gone, then delete both.
- `web/.env` — still carries `DATABASE_URI`, `DATABASE_URL`, `PAYLOAD_SECRET`,
  `COOKIE_SECRET`, `NODE_ENV` and `PORT`. Only `NEXT_PUBLIC_MAPTILER_KEY` and
  the two `NEXT_PUBLIC_UMAMI_*` vars are still used.
- `.gitignore` lines 36 and 72 reference Payload paths that no longer exist.

## Ongoing

Deploying after a content change:

```bash
deploy/pi/deploy.sh
```

Note there is no off-site backup of the site itself, but everything except
media is in git, and media originals are covered by step 3.
