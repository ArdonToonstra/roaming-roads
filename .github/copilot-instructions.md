# Roaming Roads AI Assistant Instructions

Welcome! This guide will help you understand the Roaming Roads project structure, architecture, and development workflows.

## Big Picture: Modern Travel Blog Platform

This repository contains a modern travel blog platform built with a headless CMS architecture:

1.  **`cms/`**: The **backend and admin interface** using **Payload CMS** (Next.js-based headless CMS)
2.  **`frontend/`**: The **user-facing website** built with **Next.js (React/TypeScript)**

The architecture separates content management from content presentation, allowing for flexible deployment and scaling.

---

## 🚀 Backend: `cms/` (Payload CMS)

The CMS provides a headless backend with both admin interface and API endpoints.

### Key Concepts & Architecture

-   **Payload CMS**: A Node.js-based headless CMS that provides GraphQL and REST APIs. Configuration is code-first.
-   **Database**: Uses a cloud PostgreSQL database with PostGIS for location data
-   **Data Models**: Content structure defined in TypeScript files within `cms/src/collections/` (e.g., `Trips.ts`, `Countries.ts`, `Media.ts`)
-   **Admin Interface**: Available at `http://localhost:3000/admin` for content management
-   **API Endpoints**: REST API at `/api/trips`, `/api/countries`, etc.

### Developer Workflow

The local CMS environment connects to the production database and is managed with Docker.

**To start the CMS development server:**

1.  Navigate to the CMS directory: `cd cms`
2.  Run Docker Compose: `docker compose up`

This starts the CMS at `http://localhost:3000` (admin at `/admin`, API at `/api/*`).

### Key Files

-   `cms/docker-compose.yml`: Defines the local development services
-   `cms/src/payload.config.ts`: Main Payload CMS configuration
-   `cms/src/collections/Trips.ts`: Trip data model and access controls
-   `cms/src/collections/Countries.ts`: Country data model
-   `cms/src/collections/Media.ts`: Media/image management
-   `cms/src/blocks/`: Reusable content blocks (FullDay, WayPoint)

### Access Control

All collections follow this pattern:
- **Read access**: Public (allows frontend API access)  
- **Write access**: Authenticated users only (CMS admin users)

---

## 🎨 Frontend: `frontend/` (Next.js)

The user-facing website that consumes data from the CMS API.

### Key Concepts & Architecture

-   **Next.js 15**: React framework with App Router and Turbopack
-   **Styling**: Tailwind CSS v4 with custom design tokens
-   **Data Fetching**: Fetches from CMS API endpoints (`http://localhost:3000/api/*`)
-   **Fonts**: Loaded with `next/font` (Lato, Poppins)

### Developer Workflow

**To start the frontend development server:**

1.  Navigate to the frontend directory: `cd frontend`  
2.  Install dependencies: `pnpm install`
3.  Start dev server: `pnpm dev`

Frontend runs at `http://localhost:3001`.

### Key Files

-   `frontend/src/app/`: Next.js app router pages
-   `frontend/src/app/trips/page.tsx`: Trips listing page
-   `frontend/src/app/trips/[slug]/page.tsx`: Trip detail pages
-   `frontend/src/lib/api.ts`: CMS API client
-   `frontend/src/lib/config.ts`: Environment configuration
-   `frontend/src/types/payload.ts`: TypeScript types for CMS data
-   `frontend/src/app/globals.css`: Tailwind CSS and design tokens
-   `frontend/tailwind.config.js`: Tailwind configuration

### Data Flow

1. **Content Creation**: Editors create/edit content via CMS admin (`/admin`)
2. **API Access**: Frontend fetches data via REST API (`/api/trips`, etc.)
3. **Rendering**: Frontend renders trips, countries, and media
4. **Deployment**: CMS deployed to Vercel, Frontend deployed separately

### Environment Setup

- **CMS**: Connects to production PostgreSQL database (cloud)
- **Frontend**: Connects to CMS API endpoints for data
- **Local Development**: Both services run locally, CMS uses production DB

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

**IMPORTANT**: Local Docker connects to **production database**. Be extremely careful with schema changes.

### Migration Strategy

**For Schema Changes:**
1. **Test locally first** - Make schema changes in code
2. **Generate migration** - `docker exec cms-payload-1 npx payload migrate:create`
3. **Review migration files** - Check SQL in `src/migrations/`
4. **Run migration carefully** - `docker exec cms-payload-1 npx payload migrate`
5. **Deploy to Vercel** - Push code changes

### Database Reset (Emergency Only)
Only if you need to reset local development state:
```powershell
docker compose down
docker volume rm cms_postgres_data  # Only affects local Docker volume
docker compose up
```
**WARNING**: This does NOT affect production database.

### Migration Commands
```powershell
# Check migration status
docker exec cms-payload-1 npx payload migrate:status

# Create new migration
docker exec cms-payload-1 npx payload migrate:create

# Run pending migrations
docker exec cms-payload-1 npx payload migrate

# Generate import map for rich text
docker exec cms-payload-1 npx payload generate:importmap
```

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Schema auto-applied in dev | Run migration or accept auto-changes |
| RichText component missing | `generate:importmap` |
| Migration conflicts | Review and modify migration SQL |
| Access control issues | Check user authentication |
| API 400/403 errors | Verify access rules and auth state |

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

