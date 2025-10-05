Project Plan: Travel Itinerary Website Rebuild
Objective: Rebuild the Blazor-based travel itinerary website using a modern, flexible, and cost-effective tech stack. The new site will be a visually rich, content-driven platform, similar in concept to Polarsteps, but focused on displaying pre-made travel roads.

Status: In Progress 🚀

1. Core Technology Stack
This project will be built using the following technologies:

Backend (CMS): Payload CMS

Frontend Framework: Next.js (React & TypeScript)

Styling: Tailwind CSS

UI Components: Shadcn/ui

Animations: Framer Motion

Deployment:

Frontend: Firebase Hosting

Backend: Google Cloud Run

Database: Google Cloud SQL (PostgreSQL)

2. Project Phases & Tasks
This project follows a "local-first" development approach. We will build and test the entire application locally before deploying anything.

Phase 1: Local Backend Setup (Payload CMS)
Goal: Get a fully functional CMS running on your local machine with a content API.

1.1: Initialize Payload Project: Set up a new Payload CMS project locally.

1.2: Define Collections:

Create a Trips collection (src/collections/Trips.ts) based on the kyrgyzstan.yaml structure.

Create a Media collection (src/collections/Media.ts) for image/video uploads.

1.3: Populate Initial Content:

Start the local Payload server.

Manually create the "Kyrgyzstan Adventure" trip in the admin UI. This provides the necessary data for frontend development.

Phase 2: Local Frontend Setup (Next.js)
Goal: Create a basic, structured Next.js project on your local machine.

2.1: Initialize Next.js Project: Create a new Next.js app with TypeScript and Tailwind CSS.

2.2: Project Structure:

Create standard folders: /app, /components, /lib, /public.

Inside /components, create subfolders for ui (Shadcn) and shared (custom components).

2.3: Install & Configure UI Libraries:

Run shadcn-ui init and add initial components like Button and Card.

Install Framer Motion with npm install framer-motion.

Phase 3: Full-Stack Local Development & Integration
Goal: Build the complete, interactive website on your local machine by connecting the frontend to the local backend.

3.1: Connect Frontend to Local API:

Configure your Next.js application to fetch data from your local Payload server's API endpoint (e.g., http://localhost:3000/api/...).

3.2: Build Homepage - Trip Gallery (/app/page.tsx):

Fetch all documents from the trips collection.

Create a TripCard.tsx component to display trip summary info.

Render a grid of TripCard components, each linking to its detail page.

3.3: Build Trip Detail Page (/app/trips/[slug]/page.tsx):

Create a dynamic route to handle individual trips by slug.

Use generateStaticParams to pre-build pages for each trip.

Fetch a single trip's data from Payload based on the slug.

Build the Header, Itinerary, and Map sections for the page.

3.4: Add Polish & Animations:

Implement page transitions with Framer Motion.

Add scroll-triggered animations for itinerary items.

Refine the responsive design for all screen sizes.

Phase 4: Deployment
Goal: Deploy the completed application to the cloud, making it publicly accessible.

4.1: Deploy Backend (Payload CMS to Google Cloud):

Create a Dockerfile in the root of your Payload project.

Set up a Google Cloud SQL (PostgreSQL) instance and save the credentials.

Push the Docker image of your Payload app to Google Artifact Registry.

Deploy the container to Google Cloud Run, configuring environment variables to connect to your Cloud SQL database. Note the live API URL.

4.2: Deploy Frontend (Next.js to Firebase):

Update your Next.js application's API endpoint to use the live Google Cloud Run URL.

Set up a new project in the Firebase Console.

Initialize Firebase Hosting in your Next.js project.

Run next build and next export to generate the static site output.

Deploy the static files to Firebase Hosting by running firebase deploy.

4.3: Final Testing:

Thoroughly test the live website to ensure the frontend on Firebase can correctly communicate with the backend on Cloud Run.

3. Blazor Migration Notes
The .razor and C# files from the old project are kept in a /legacy-blazor folder for reference only. They will not be used directly. The migration process involves:

Rebuilding Components: Every .razor component will be rebuilt as a React .tsx component.

Translating Logic: C# logic will be rewritten in TypeScript.

Data Model Reference: The structure of C# models can be used as a reference when building Payload collections and TypeScript interfaces.

Local development notes
-----------------------

### Quick start (Docker Compose - Recommended)
```powershell
cd roaming-routes-cms
docker compose up
```
This starts both Postgres + PostGIS and the Payload CMS together. The CMS will be available at `http://localhost:3000`.

### Manual setup (alternative)
- Payload CMS (local): the CMS lives in `roaming-routes-cms/`. Start it from that folder with `npm run dev` after creating a `.env` that contains `DATABASE_URL`, `PAYLOAD_SECRET` and other settings.
- Postgres + PostGIS: the CMS requires a Postgres database with the `postgis` extension. For local development you can use Docker:

```powershell
docker run --name rr-postgres -e POSTGRES_PASSWORD=z8ZWOUcPaXKgiAn0sATYNb7N61Lth0JyLbH -e POSTGRES_USER=rruser -e POSTGRES_DB=roamingroutes -p 5432:5432 -d postgis/postgis:15-3.4
```

- After starting Postgres, update `roaming-routes-cms/.env` with the matching `DATABASE_URL` (example: `postgresql://rruser:z8ZWOUcPaXKgiAn0sATYNb7N61Lth0JyLbH@127.0.0.1:5432/roamingroutes`).
- Start the CMS: `npm run dev` from `roaming-routes-cms/`. Watch logs for DB connection and PostGIS extension messages.

Content workflow
----------------

- Add trips and media through the Payload admin UI at `http://localhost:3000/admin`.
- The legacy Blazor app is kept in `legacy-blazor/` for reference when modelling collections and UI.

If you want, I can add a `docker-compose.yml` to run PostGIS + the CMS together with a small wait-for-db step.

Schema & Migrations (Payload + Postgres)
---------------------------------------

During early schema iteration you will see interactive prompts from Payload asking how to handle new enums, renamed columns, etc. To avoid getting into a half-applied state ("constraint does not exist" / data loss warnings), follow these guidelines:

1. Fast iteration (throw‑away data) strategy
	- Prefer wiping the dev database instead of forcing complex diffs while the model is still changing daily.
	- Commands (PowerShell):
	  ```powershell
	  docker compose down
	  docker volume rm cms_postgres_data
	  docker compose up
	  ```
	- This guarantees a clean schema that matches the current code.

2. Converting field types safely
	- Array of objects  -> multi-select: expect enum rename prompts. Choose the option that *renames* the old enum to the new one (preserves values) instead of creating a brand new enum, to avoid leaving orphan enum types.
	- text -> richText: Postgres cannot automatically cast `text` to `jsonb`. Either reset the DB (fast) or perform a manual migration with a USING clause.

3. Enum prompts
	- Create enum: use when the value set is truly new.
	- Rename enum: use when you refactored a field (e.g. renamed or changed structure) but the underlying set of values is identical.
	- Do NOT map unrelated enums across collections (e.g. don’t rename an activities enum to a countries enum) – it will corrupt other schemas.

4. Column rename prompts (order / _order / month → value)
	- When converting an array-of-objects field to a `select` with `hasMany`, you’ll often see `_order` -> `order` and `month` -> `value`. Prefer renaming so ordering and values are preserved.
	- Remove obsolete columns (e.g. `reason`) unless you plan to keep that data elsewhere.

5. Locked documents relation constraint errors
	- Error like: `DROP CONSTRAINT "payload_locked_documents_rels_activities_fk" ... does not exist` means a previous diff partially applied.
	- Easiest fix in early dev: reset the DB (see step 1).
	- If you must keep data: recreate the missing FK then restart.

6. Moving to durable migrations (when schema stabilizes)
	- Generate migration files instead of relying on interactive push diffs:
	  ```powershell
	  docker exec -it cms-payload-1 npx payload generate:migration
	  docker exec -it cms-payload-1 npx payload migrate
	  ```
	- Commit the generated files (usually in `src/migrations`).

7. Rich text / import map issues
	- If you see `PayloadComponent not found ... generate:importmap`, run:
	  ```powershell
	  docker exec -it cms-payload-1 npx payload generate:importmap
	  ```
	- We bake this into `docker-compose.yml` (`npx payload generate:importmap && npm run dev`).

8. Interactive terminal reliability
	- `stdin_open: true` and `tty: true` are set for the `payload` service so you can answer prompts.
	- If arrow keys don’t work: `docker attach cms-payload-1` or run a one-off interactive container:
	  ```powershell
	  docker compose run --service-ports payload sh -c "npm install && npm run dev"
	  ```

Decision cheat sheet
--------------------
| Scenario | Recommended Action |
|----------|--------------------|
| Early heavy schema churn | Reset DB volume |
| Convert array-of-objects to multi-select | Rename old enum & columns |
| Change text → richText | Reset DB or custom cast migration |
| Orphan enum types piling up | Reset DB or drop unused enums manually |
| FK constraint missing in locked documents table | Reset DB (preferred) or recreate FK |

Manual FK recreation example (only if preserving data):
```sql
ALTER TABLE payload_locked_documents_rels
ADD CONSTRAINT payload_locked_documents_rels_activities_fk
FOREIGN KEY (activities_id) REFERENCES activities(id) ON DELETE CASCADE;
```

When in doubt during early development: reset, don’t wrestle. Once the model stabilizes, switch to generated migrations for reproducible environments (staging/production).