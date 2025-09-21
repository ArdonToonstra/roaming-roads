Project Plan: Travel Itinerary Website Rebuild
Objective: Rebuild the Blazor-based travel itinerary website using a modern, flexible, and cost-effective tech stack. The new site will be a visually rich, content-driven platform, similar in concept to Polarsteps, but focused on displaying pre-made travel routes.

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

- Payload CMS (local): the CMS lives in `roaming-routes-cms/`. Start it from that folder with `npm run dev` after creating a `.env` that contains `DATABASE_URL`, `PAYLOAD_SECRET` and other settings.
- Postgres + PostGIS: the CMS requires a Postgres database with the `postgis` extension. For local development the easiest approach is Docker:

```powershell
docker run --name rr-postgres -e POSTGRES_PASSWORD=<your_password> -e POSTGRES_USER=rruser -e POSTGRES_DB=roamingroutes -p 5432:5432 -d postgis/postgis:15-3.4
```

- After starting Postgres, update `roaming-routes-cms/.env` with the matching `DATABASE_URL` (example: `postgresql://rruser:<your_password>@127.0.0.1:5432/roamingroutes`).
- Start the CMS: `npm run dev` from `roaming-routes-cms/`. Watch logs for DB connection and PostGIS extension messages.

Content workflow
----------------

- Add trips and media through the Payload admin UI at `http://localhost:3000/admin`.
- The legacy Blazor app is kept in `legacy-blazor/` for reference when modelling collections and UI.

If you want, I can add a `docker-compose.yml` to run PostGIS + the CMS together with a small wait-for-db step.