# Content

Roaming Roads has no CMS or database — all content lives here as JSON files,
edited directly in git. Images live alongside the site's other static assets
under `web/public/images/`.

## Layout

- `countries.json` — array of countries, keyed by `id` (the country's ISO
  3166-1 alpha-3 code, e.g. `"KGZ"`). Trips reference countries by this id
  rather than embedding a copy, so a country's facts (capital, visa info,
  safety level, ...) only need updating in one place.
- `accommodations.json` — array of accommodations, keyed by `id` (a slug
  derived from the name, e.g. `"yak-yurt-camp"`). Trips reference
  accommodations by this id the same way.
- `trips/<slug>.json` — one file per trip. `countries` and
  `featuredAccommodations` are arrays of ids from the files above; an
  itinerary block's `accommodation` field is a single id. Everything else
  (cover image, gallery images, description, activities, ...) lives directly
  in the trip file.

See `web/src/types/content.ts` for the exact shape of each type — that file
is the source of truth.

## Adding or editing a trip

1. Add any new images to `web/public/images/trips/<slug>/` and reference them
   from the trip JSON with a path like `/images/trips/<slug>/photo.jpg`.
2. Create or edit `trips/<slug>.json`. Copy an existing trip as a starting
   point — the `id` field just needs to be unique (it can match the slug).
3. `activities`, `importantPreparations`, and accommodation/country
   descriptions are plain Markdown strings, rendered via `RichText.tsx`.
4. Run `pnpm dev` to preview locally, then commit and push — the GitHub
   Actions workflow rebuilds and deploys the static site automatically.

A trip's `status` controls visibility: `draft` trips never build in
production, `coming_soon` trips render as a locked preview, and `published`
trips are fully live.
