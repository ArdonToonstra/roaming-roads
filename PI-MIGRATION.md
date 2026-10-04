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
- A `cloudflared` tunnel is already running on the Pi, shared with its other
  services. It serves `*.donit.be`, which **is** on Cloudflare DNS — so the
  tunnel pattern is proven and working. The site reuses that tunnel rather
  than starting a second one.
- Umami runs on the Pi (`localhost:3001`) and the tracking snippet with
  website id `f48b4b4f-…` is baked into the build.

Verify any time with: `curl -I http://192.168.68.74:8081/`

## Live status — the cutover is complete

As of 2026-10-04 the Pi serves the site publicly:

- `roamingroads.nl` and `www.roamingroads.nl` → tunnel → Caddy on the Pi.
  Verified by the `X-Content-Type-Options` / `Referrer-Policy` headers Caddy
  sets, the absence of any `x-vercel-*` header, and `/trips/nicaragua/`
  returning 200 *with* the trailing slash (Vercel used to 308 it away).
- All 13 trips return 200, including the five South America guides that only
  exist in the Pi build. Missing pages return a real 404.
- `umami.roamingroads.nl` works and is recording pageviews again.
- Cloudflare caches the images at the edge (`cf-cache-status: HIT`), so the
  Pi's upstream serves very little.

**Vercel is no longer in the serving path**, but the project and its data are
still there — continue at step 3.

## ~~Step 0 — Move roamingroads.nl to Cloudflare DNS~~ ✅ DONE (2026-10-04)

**Nothing else can happen until this is done.** `roamingroads.nl` is currently
on Vercel's nameservers:

```
roamingroads.nl  NS  ns1.vercel-dns.com / ns2.vercel-dns.com
```

A Cloudflare Tunnel public hostname is a CNAME to `<uuid>.cfargotunnel.com`,
which only resolves inside Cloudflare DNS with proxying on. So the tunnel
cannot route `roamingroads.nl` while Vercel holds the zone. This is also why
`umami.roamingroads.nl` has never worked — it currently resolves to Vercel and
returns `DEPLOYMENT_NOT_FOUND`, so the analytics script 404s and **no stats are
being collected today**.

`donit.be` is already on Cloudflare (`cesar`/`dorthy.ns.cloudflare.com`) and
its tunnel hostnames work, so this is the same setup, just for a second zone.

1. Add `roamingroads.nl` as a site in Cloudflare (free plan) and let it import
   the existing DNS records.
2. Check the imported records against Vercel's — especially MX/TXT, so email
   and domain verification keep working.
3. Change the nameservers at the registrar to the pair Cloudflare gives you.
   If the domain is registered *through Vercel*, do this in the Vercel domain
   settings; otherwise at your .nl registrar.
4. Wait for propagation (usually under an hour) and confirm:
   `nslookup -type=NS roamingroads.nl` shows the Cloudflare pair.

Note there is a wildcard `*.roamingroads.nl` pointing at Vercel — a bogus
subdomain resolves and hits Vercel today. Drop it during the import, or at
least before step 4, so stale subdomains don't keep pointing at a dead host.

## ~~Step 1 — Point roamingroads.nl at the Pi~~ ✅ DONE (2026-10-04)

This is the cutover. Everything else is cleanup.

Once the zone is on Cloudflare (step 0):

1. In Cloudflare DNS, **delete the imported A records** for `roamingroads.nl`
   and `www` that point at Vercel (`216.198.79.1`, `64.29.17.65`). The tunnel
   needs to create proxied CNAMEs on those names and will conflict otherwise.
2. In the [Zero Trust dashboard](https://one.dash.cloudflare.com/) →
   Networks → Tunnels, open the **existing** tunnel (the one already running
   on the Pi — don't create a new one) and add two public hostnames:
   - `roamingroads.nl` → `http://172.17.0.1:8081`
   - `www.roamingroads.nl` → `http://172.17.0.1:8081`
   - `umami.roamingroads.nl` → `http://172.17.0.1:3001` (fixes analytics,
     which has never worked — see step 0)

   `172.17.0.1` is the docker bridge gateway; it's how the tunnel container
   reaches Caddy's published port. Same pattern umami/homepage/wallos use.
3. Check it: `curl -I https://roamingroads.nl` — the `Server: Vercel` header
   should be gone, and pages should load.
4. Confirm https://umami.roamingroads.nl loads and that
   `https://umami.roamingroads.nl/script.js` returns 200 — the site already
   requests it on every page, so analytics starts working the moment it does.

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

## Optional — stop downsampling the images

`scripts/fetch-media.ts` resizes everything to `MAX_WIDTH = 1400`. Measured
against the actual library, that buys very little:

| | size |
|---|---|
| current (1400px webp) | 128 MB |
| full resolution, still webp | 149 MB |
| raw originals (jpeg) | 327 MB |

The originals top out at 2048px wide (median 960px), and 326 of 529 images are
already under 1400px so the resize never touches them. Most of the 327 → 128 MB
saving is the JPEG → WebP re-encode, not the downsampling. Keeping full
resolution costs **+21 MB (+16%)** on a Pi with 6.2 GB free.

Meanwhile the layout goes up to `max-w-7xl` (1280 CSS px), which is 2560px on a
2× display — so the 203 downsized images are the ones most likely to look soft
as heroes.

To change it: set `MAX_WIDTH = 2048` in `scripts/fetch-media.ts`, delete
`public/media/`, and re-run `pnpm tsx scripts/fetch-media.ts`. It re-derives
from `media-originals/` and only downloads from Blob when an original is
missing, so this works offline and after Vercel is gone.

The real win would be `srcset` (say 800 + 1600) so phones stop downloading
desktop-sized images — there is only one size for everyone today. More work;
worth it only if mobile page weight becomes a complaint.

## Ongoing

Deploying after a content change:

```bash
deploy/pi/deploy.sh
```

Note there is no off-site backup of the site itself, but everything except
media is in git, and media originals are covered by step 3.
