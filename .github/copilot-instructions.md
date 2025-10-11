# Roaming Roads AI Assistant Instructions

Welcome! This guide will help you understand the Roaming Roads project structure, architecture, and development workflows.

## Big Picture: A Tale of Two Stacks

This repository contains two separate applications in a monorepo structure:

1.  **`roaming-roads-cms/`**: The **current, active project**. It's a headless setup using **Next.js (React/TypeScript)** for the frontend and **Payload CMS** for the backend.
2.  **`legacy-blazor/`**: The **original application**, built with **.NET 8 Blazor WASM**. It is kept for reference, especially for its data models and UI structure. **New development should happen in `roaming-roads-cms`**.

The overall goal is to rebuild the Blazor-based website using the modern Next.js and Payload CMS stack.

---

## 🚀 Current Project: `roaming-roads-cms` (Next.js + Payload)

This is a headless CMS architecture. The Payload backend provides a content API that the Next.js frontend consumes.

### Key Concepts & Architecture

-   **Backend (Payload CMS)**: A Node.js-based CMS that provides a GraphQL and REST API. Configuration is code-first.
-   **Frontend (Next.js)**: A React framework for building the user-facing website. It fetches data from the Payload API at build time and client-side.
-   **Data Models**: The content structure is defined in TypeScript files within `roaming-roads-cms/src/collections/`. These models (e.g., `Trips.ts`) are based on the YAML files found in the `legacy-blazor` project.
-   **Content Management**: Content (trips, media, etc.) is managed through the Payload admin panel, which runs locally at `http://localhost:3000/admin`.

### Developer Workflow

The entire local environment (Payload CMS, Postgres database with PostGIS) is managed with Docker.

**To start the local development server:**

1.  Navigate to the CMS directory: `cd roaming-roads-cms`
2.  Run Docker Compose: `docker compose up`

This will start the CMS, which will be accessible at `http://localhost:3000`.

### Key Files

-   `roaming-roads-cms/docker-compose.yml`: Defines the local development services (Postgres, Payload).
-   `roaming-roads-cms/src/payload.config.ts`: The main configuration file for the Payload CMS, where collections and globals are defined.
-   `roaming-roads-cms/src/collections/Trips.ts`: Defines the data structure for "Trips". A key file to understand the content model.
-   `roaming-roads-cms/src/app/(frontend)/page.tsx`: The Next.js homepage, demonstrating how data is fetched and rendered.

---

## 📚 Reference Project: `legacy-blazor`

This is the original Blazor application. Do not add new features here. Use it as a reference for business logic and data structures when building out the new `roaming-roads-cms` application.

### Key Concepts & Architecture

-   **Architecture**: A .NET 8 ASP.NET Core host serves a Blazor WebAssembly (WASM) frontend. The backend also provides a JSON API for the frontend.
-   **Data Workflow**: This project has a unique, file-based content workflow.
    1.  On application startup, the `DataSeeder.cs` service reads `.yaml` files from `legacy-blazor/RoamingRoutes/_contentCache/`.
    2.  It parses these YAML files and uses them to populate a local SQLite database.
    3.  The API controllers (`TripsController.cs`, etc.) read from this SQLite database to serve data to the Blazor frontend.
-   **Mapping**: The frontend uses Leaflet.js for interactive maps, controlled via .NET-to-JavaScript interop (`wwwroot/js/site.js`).

### Key Files

-   `legacy-blazor/RoamingRoutes/Data/DataSeeder.cs`: The logic for the YAML-to-SQLite data seeding process.
-   `legacy-blazor/RoamingRoutes/Controllers/TripsController.cs`: Example of a backend API endpoint.
-   `legacy-blazor/RoamingRoutes.Client/Pages/TripDetail.razor`: A primary frontend component for displaying trip details.
-   `legacy-blazor/RoamingRoutes.Client/wwwroot/js/site.js`: Contains the JavaScript functions for Leaflet map integration.
-   `legacy-blazor/RoamingRoutes/_contentCache/Trips/kyrgyzstan.yaml`: An example of the source data structure that informs the new Payload collections.

---

## 🧪 Schema Iteration & Migration Guidance (For AI + Contributors)

While the data model is still evolving, prefer fast, disposable workflows over intricate in-place migrations. Use this decision flow:

1. Did we radically change field types (array → select, text → richText, relationship reshapes)?
    - If YES and no critical content entered: reset DB volume.
    - If YES and content matters: generate a migration OR snapshot/export content first.

2. Enum rename prompt appears (old vs new enum name):
    - Choose RENAME when value set is identical.
    - Choose CREATE when it’s a truly new conceptual set.
    - Never map unrelated enums across collections.

3. Column prompts after refactor (e.g. `_order` → `order`, `month` → `value`): pick rename to preserve existing ordering & data.

4. RichText adoption: converting `text` → `richText` requires JSON (`jsonb`) column; Postgres cannot auto-cast. Easiest early: reset database. Production: write manual USING cast or content migration script.

5. Locked documents rels constraint error (`payload_locked_documents_rels_*_fk does not exist`): indicates partially applied push. Preferred fix early: reset volume. Advanced fix: recreate missing FK then retry.

### Reset Database (Dev Only)
```powershell
docker compose down
docker volume rm cms_postgres_data
docker compose up
```

### Generate Durable Migrations Once Stable
```powershell
docker exec -it cms-payload-1 npx payload generate:migration
docker exec -it cms-payload-1 npx payload migrate
```
Commit the generated `src/migrations/*` files.

### Import Map (Rich Text / Lexical)
If you see `PayloadComponent not found`:
```powershell
docker exec -it cms-payload-1 npx payload generate:importmap
```
`docker-compose.yml` auto-runs this now, but keep for reference.

### Interactive Prompts Tips
- `stdin_open: true` and `tty: true` are enabled for the `payload` service.
- If interaction fails: `docker attach cms-payload-1` or run a foreground dev container:
  ```powershell
  docker compose run --service-ports payload sh -c "npm install && npm run dev"
  ```

### Minimal Cheat Sheet
| Situation | Action |
|-----------|--------|
| Heavy schema churn | Reset DB |
| Enum same values, new name | Rename enum |
| Field array→multi-select | Rename enum + columns |
| text→richText | Reset or manual cast |
| FK constraint missing | Reset or recreate FK |
| RichText component missing | generate:importmap |

Keep answers concise for routine queries; expand only when user asks for deeper migration strategies.

---

## 🧵 Frontend (Next.js + Tailwind v4) Current State & Troubleshooting

> This section documents recent issues encountered while bringing up the standalone `frontend/` Next.js application (separate from `roaming-roads-cms/`) and the resolutions / preferred patterns going forward.

### Stack Snapshot

- Location: `frontend/`
- Framework: Next.js 15 (App Router, Turbopack)
- Styling: Tailwind CSS v4 (new single `@import 'tailwindcss';` entrypoint) + custom CSS variables
- Fonts: Loaded with `next/font` (replace any Google Fonts `@import` in CSS)
- Config files of interest:
    - `tailwind.config.js` (authoritative – keep only one Tailwind config; prefer JS OR TS, not both)
    - `postcss.config.mjs`
    - `src/app/globals.css`
    - `src/app/layout.tsx`

### Theme Strategy

We expose design tokens as CSS custom properties (HSL components – NOT `hsl(var(--token))` in the variable itself) and then map them in Tailwind:

```css
:root {
    --background: 30 50% 96%; /* H S L */
    --primary: 16 90% 64%;
    /* etc. */
}

body { background: hsl(var(--background)); }
```

Tailwind color extensions use `hsl(var(--token))` so utilities like `bg-background` work.

### Font Loading Pattern

Use `next/font/google` in `layout.tsx`:

```ts
import { Lato, Poppins } from 'next/font/google';
const lato = Lato({ subsets: ['latin'], weight: ['400','700'], variable: '--loaded-font-sans' });
const poppins = Poppins({ subsets: ['latin'], weight: ['700'], variable: '--loaded-font-heading' });

<body className={`${lato.variable} ${poppins.variable}`}>...</body>
```

Then in `globals.css` set fallbacks:

```css
--font-sans: var(--loaded-font-sans, ui-sans-serif, system-ui);
--font-heading: var(--loaded-font-heading, ui-sans-serif, system-ui);
```

Remove any `@import url('https://fonts.googleapis.com/...')` lines – they broke ordering (`@import` must appear before any other rules) and caused duplication when the file was repeatedly recreated.

### Common Issues & Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Cannot apply unknown utility class 'bg-background'` | Tailwind didn't see custom color mapping or config not loaded | Ensure a single `tailwind.config.(js|ts)` with `extend.colors.background: 'hsl(var(--background))'`. Remove duplicate config file (keep one). Restart dev server after adding config. |
| `@import rules must precede all rules` with huge line numbers (e.g. 900+) | Stale Turbopack cache held old concatenated `globals.css` copies | Delete `.next/` + restart. If persists, also remove `node_modules/.cache` and re-run `pnpm install`. |
| File showed few lines on disk but build referenced hundreds | Turbopack cache corruption | Full cache purge (see below) |
| Fonts not applying | Still using Google CSS imports | Switch to `next/font` variables, remove `@import` |

### Full Cache Purge Procedure

```powershell
Stop-Process -Name node -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
pnpm install
pnpm run dev
```

### Do NOT

- Keep both `tailwind.config.js` and `tailwind.config.ts` – pick one (JS currently primary). Remove the unused one to avoid ambiguity.
- Use `@apply bg-background` inside `globals.css` if the utility isn't recognized yet. Prefer direct CSS `background: hsl(var(--background));` during bootstrap.

### Recommended Cleanup (Actionable)

1. Delete `tailwind.config.ts` (JS version present) OR migrate entirely to TS – avoid duplicates.
2. Ensure `globals.css` only imports Tailwind once at top: `@import 'tailwindcss';`.
3. Replace any lingering Google Font imports with `next/font` usage.
4. Audit components for hard-coded colors; replace with semantic utilities (`bg-primary`, `text-foreground`).

---

## ✅ Frontend TODO (High-Level)

See `frontend/TODO.md` for the living, granular list. High-level themes:

1. Stabilize styling system (single Tailwind config, tokens, fonts)
2. Implement Trips listing & detail pages wired to CMS API
3. Add map rendering for waypoints (Leaflet / MapLibre)
4. Add image optimization & responsive components
5. Accessibility & performance pass (lighthouse baseline)
6. Content model sync (ensure Payload blocks mirror frontend renderers)
7. Add integration + e2e tests for critical routes

---

## 🔍 Quick Diagnosis Flow (Frontend Build Issues)

1. Build error mentions unknown utility → check Tailwind config loaded / duplication.
2. Line numbers far beyond file length → purge `.next/` cache.
3. Fonts flashing / layout shift → confirm `next/font` usage & variable classes on `<body>`.
4. Color mismatch → inspect computed style: ensure `hsl(var(--token))` not double-wrapped.

---

## 🧪 Minimal Verification Steps After Styling Changes

```powershell
pnpm run dev
Start-Sleep 2
curl http://localhost:3000 -UseBasicParsing | Select-String "Roaming" # sanity content check
```

If failure persists, run full purge (above) then retry.

---

## 🤖 AI Assistant Expectations (Frontend Scope)

- Prefer direct edits to `tailwind.config.js` over scattering design primitives.
- When adding a new semantic color / token, update both: CSS variable in `globals.css` + mapping in Tailwind config.
- Always restart dev server after adding or deleting Tailwind config files.

