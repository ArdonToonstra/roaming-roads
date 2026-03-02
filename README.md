# Roaming Roads

A personal travel content platform built with Payload CMS and Next.js — documenting road trips and adventures around the world.

## Architecture

A single Next.js application containing both the frontend website and the CMS:

- **`/web`** — Main application (Next.js 16 + Payload 3)
  - **`src/app/(frontend)`** — Public-facing travel website
  - **`src/app/(payload)`** — Admin panel and CMS API (`/admin`, `/api`)

## Local Development

**Prerequisites:** Node.js ≥ 20.9, pnpm, Docker

1. **Start the database:**
   ```bash
   cd web
   docker compose up -d
   ```

2. **Configure environment:**
   ```bash
   cp .env.local.template .env.local
   # Fill in PAYLOAD_SECRET (any random string for local dev)
   ```

3. **Install and run:**
   ```bash
   pnpm install
   pnpm dev
   ```

   - Website: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

## Deployment

The app is deployed on Vercel with a [Neon](https://neon.tech) PostgreSQL database and [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for media storage.

### Required environment variables

```env
# Database (Neon)
DATABASE_URI=postgresql://user:pass@host.neon.tech/db?sslmode=require

# Payload
PAYLOAD_SECRET=your-32-char-secret-key
NEXT_PUBLIC_SERVER_URL=https://your-domain.vercel.app

# Media storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Optional — better map tiles in the admin interface
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
```

## Collections

| Collection | Description |
|------------|-------------|
| **Trips** | Travel itineraries with day-by-day itinerary blocks (full days, waypoints, points) |
| **Countries** | Destination info, travel tips, safety levels, visa requirements |
| **Accommodations** | Lodging with type, location, and media |
| **Media** | Photos and videos stored in Vercel Blob |
| **Users** | CMS admin accounts |

## API

Payload exposes REST and GraphQL endpoints automatically:

- **REST:** `/api/[collection]`
- **GraphQL:** `/api/graphql`
- **Admin:** `/admin`
