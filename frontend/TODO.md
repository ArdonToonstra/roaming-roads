# Frontend TODO / Roadmap

Status legend: (P0 = critical, P1 = high, P2 = normal, P3 = nice-to-have)

## P0 – Stabilize Build & Styling
- [ ] Remove duplicate Tailwind config (decide: keep `tailwind.config.js`, delete `.ts`)
- [ ] Ensure `globals.css` only contains one `@import 'tailwindcss';` at top
- [ ] Switch fonts fully to `next/font` (Lato + Poppins) and remove any Google CSS imports
- [ ] Verify color utilities (`bg-background`, `text-foreground`, `bg-primary`, etc.) compile
- [ ] Add a sample component using each semantic color for visual regression sanity

## P1 – Data Integration
- [ ] Create a lightweight client to fetch Trips from Payload CMS (REST or GraphQL)
- [ ] Implement `/trips` list page consuming real data
- [ ] Implement `/trips/[slug]` pulling itinerary blocks (FullDay, WayPoint)
- [ ] Graceful loading + error states
- [ ] Basic caching strategy (ISR or fetch cache options)

## P1 – Mapping & Geo
- [ ] Decide on map library (Leaflet vs MapLibre GL)
- [ ] Create Map component
- [ ] Render waypoints polyline + markers per day
- [ ] Lazy load map assets below the fold

## P1 – Media & Images
- [ ] Implement responsive `<Image />` usage for trip hero/media
- [ ] Define media aspect ratio utilities (e.g. 16:9, 3:2, square)
- [ ] Add blur-up placeholders (optional)

## P2 – Design System Enhancements
- [ ] Extract button, card, badge components using semantic tokens
- [ ] Add dark mode toggle (next-themes) & define dark palette tokens
- [ ] Typography scale audit (body, lead, small, meta)
- [ ] Spacing & container utilities (content max-width)

## P2 – Testing
- [ ] Add Playwright smoke test for home, trips list, one trip page
- [ ] Add Vitest component test for navigation & trip card
- [ ] Snapshot test for semantic color tokens (guard regressions)

## P2 – Performance & A11y
- [ ] Add Lighthouse CI script (local) baseline
- [ ] Ensure accessible nav landmark roles
- [ ] Color contrast validation for primary/foreground combos
- [ ] Prefetch critical routes

## P3 – Content & SEO
- [ ] Add metadata generation per trip (OG tags, twitter card)
- [ ] JSON-LD structured data for travel itinerary
- [ ] RSS / Atom feed for new trips

## P3 – Tooling & DX
- [ ] Enforce design token usage via ESLint custom rule (optional)
- [ ] Pre-commit hook: lint + typecheck fast
- [ ] Storybook or Ladle for isolated component development

## Backlog / Ideas
- [ ] Offline reading mode (Service Worker + trip caching)
- [ ] Map clustering for large waypoint sets
- [ ] User-selectable units (km vs miles)

## Verification Checklist (Run After Major Styling Changes)
```powershell
pnpm run dev
Start-Sleep 2
curl http://localhost:3000 -UseBasicParsing | Select-String "Roaming" | Out-Null
Write-Host "Home OK"
```

## Notes
Keep this file pruned—convert completed items to a CHANGELOG or delete to stay lean.
