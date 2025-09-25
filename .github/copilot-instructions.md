# Roaming Routes AI Assistant Instructions

Welcome! This guide will help you understand the Roaming Routes project structure, architecture, and development workflows.

## Big Picture: A Tale of Two Stacks

This repository contains two separate applications in a monorepo structure:

1.  **`roaming-routes-cms/`**: The **current, active project**. It's a headless setup using **Next.js (React/TypeScript)** for the frontend and **Payload CMS** for the backend.
2.  **`legacy-blazor/`**: The **original application**, built with **.NET 8 Blazor WASM**. It is kept for reference, especially for its data models and UI structure. **New development should happen in `roaming-routes-cms`**.

The overall goal is to rebuild the Blazor-based website using the modern Next.js and Payload CMS stack.

---

## 🚀 Current Project: `roaming-routes-cms` (Next.js + Payload)

This is a headless CMS architecture. The Payload backend provides a content API that the Next.js frontend consumes.

### Key Concepts & Architecture

-   **Backend (Payload CMS)**: A Node.js-based CMS that provides a GraphQL and REST API. Configuration is code-first.
-   **Frontend (Next.js)**: A React framework for building the user-facing website. It fetches data from the Payload API at build time and client-side.
-   **Data Models**: The content structure is defined in TypeScript files within `roaming-routes-cms/src/collections/`. These models (e.g., `Trips.ts`) are based on the YAML files found in the `legacy-blazor` project.
-   **Content Management**: Content (trips, media, etc.) is managed through the Payload admin panel, which runs locally at `http://localhost:3000/admin`.

### Developer Workflow

The entire local environment (Payload CMS, Postgres database with PostGIS) is managed with Docker.

**To start the local development server:**

1.  Navigate to the CMS directory: `cd roaming-routes-cms`
2.  Run Docker Compose: `docker compose up`

This will start the CMS, which will be accessible at `http://localhost:3000`.

### Key Files

-   `roaming-routes-cms/docker-compose.yml`: Defines the local development services (Postgres, Payload).
-   `roaming-routes-cms/src/payload.config.ts`: The main configuration file for the Payload CMS, where collections and globals are defined.
-   `roaming-routes-cms/src/collections/Trips.ts`: Defines the data structure for "Trips". A key file to understand the content model.
-   `roaming-routes-cms/src/app/(frontend)/page.tsx`: The Next.js homepage, demonstrating how data is fetched and rendered.

---

## 📚 Reference Project: `legacy-blazor`

This is the original Blazor application. Do not add new features here. Use it as a reference for business logic and data structures when building out the new `roaming-routes-cms` application.

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
