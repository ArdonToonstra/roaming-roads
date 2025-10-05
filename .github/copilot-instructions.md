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
