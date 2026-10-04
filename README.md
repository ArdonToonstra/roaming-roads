# Roaming Roads

A personal travel content site built with Next.js — documenting road trips
and adventures around the world. No CMS, no database: content is static
YAML + images, edited directly in git.

## Architecture

A single Next.js application, exported as a static site (`output: 'export'`):

- **`/web`** — the Next.js 16 app
  - **`src/app/(frontend)`** — every page (there's no admin panel or API)
  - **`content/`** — trips, countries, accommodations as YAML (see
    `web/content/README.md` for the schema and how to add a trip)
  - **`public/images/`** — the site's images, alongside its other static
    assets

Hosting is on a Raspberry Pi behind a Cloudflare Tunnel — see
`PI-MIGRATION.md` and `deploy/pi/README.md`.

## Local Development

**Prerequisites:** Node.js ≥ 20.9, pnpm

```bash
cd web
cp .env.local.template .env.local
pnpm install
pnpm dev
```

Website: http://localhost:3000

## Adding or editing content

See `web/content/README.md`. In short: trips are one YAML file each under
`web/content/trips/`, referencing countries and accommodations by id from
`web/content/countries/` / `web/content/accommodations/`. Commit the change,
then run `deploy/pi/deploy.sh` to publish it.

## Deployment

Self-hosted on a Raspberry Pi behind a Cloudflare Tunnel. Deploys are manual
and run from home over the LAN:

```bash
deploy/pi/deploy.sh
```

This builds the static export and ships it to the Pi, where Caddy serves it.
GitHub Actions only runs lint/typecheck/tests — it does not deploy. See
`deploy/pi/README.md` for the Pi setup.
