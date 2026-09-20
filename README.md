# Roaming Roads

A personal travel content site built with Next.js — documenting road trips
and adventures around the world. No CMS, no database: content is static
JSON + images, edited directly in git.

## Architecture

A single Next.js application, exported as a static site (`output: 'export'`):

- **`/web`** — the Next.js 16 app
  - **`src/app/(frontend)`** — every page (there's no admin panel or API)
  - **`content/`** — trips, countries, accommodations as JSON (see
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

See `web/content/README.md`. In short: trips are one JSON file each under
`web/content/trips/`, referencing countries and accommodations by id from
`web/content/countries.json` / `web/content/accommodations.json`. Push to
`main` and the site rebuilds and redeploys automatically.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds the static export on
every push to `main` and ships it to the Raspberry Pi over SSH through a
Cloudflare Tunnel. See `deploy/pi/README.md` for the one-time Pi setup and
required repository secrets.
