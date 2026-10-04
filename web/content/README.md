# Content

Roaming Roads has no CMS or database — all content lives here as YAML files,
edited directly in git. Media referenced from it lives under
`public/media/` (regenerated from `media-originals/` by
`scripts/fetch-media.ts` — see that file and `media-originals/`'s note in
`.gitignore`).

## Layout

- `countries/<slug>.yml` — one file per country, keyed by filename (e.g.
  `kyrgyzstan.yml`). Trips and accommodations reference countries by this
  slug rather than embedding a copy, so a country's facts (capital, visa
  info, safety level, ...) only need updating in one place.
- `accommodations/<slug>.yml` — one file per accommodation, slug derived
  from the name. Trips reference accommodations by this slug the same way.
- `trips/<slug>.yml` — one file per trip. `countries` and
  `featuredAccommodations` are arrays of slugs from the files above; an
  itinerary block's `accommodation` field is a single slug. Everything else
  (description, activities, itinerary, ...) lives directly in the trip file.
- `media.yml` — every referenced upload's metadata (dimensions, alt text),
  keyed by filename. Any `coverImage`/`gallery`/`highlightsMedia` field
  elsewhere is just that filename; `src/lib/data.ts` resolves it into a full
  media object at build time.

See `web/src/types/content.ts` for the exact shape each loaded document
ends up in (relations and media already resolved) — that file is the source
of truth for what components can render.

## Adding or editing a trip

1. Add any new photos to `media-originals/`, run
   `pnpm tsx scripts/fetch-media.ts` to add them to `public/media/`, then
   reference them by filename from the trip YAML and add an entry to
   `media.yml`.
2. Create or edit `trips/<slug>.yml`. Copy an existing trip as a starting
   point — the filename is the slug.
3. `activities`, `importantPreparations`, and accommodation/country
   descriptions are plain Markdown strings, rendered via `RichText.tsx`.
4. Run `pnpm dev` to preview locally, then commit and push — the GitHub
   Actions workflow rebuilds and deploys the static site automatically.

A trip's `status` controls visibility: `draft` trips never build in
production, `coming_soon` trips render as a locked preview, and `published`
trips are fully live.
