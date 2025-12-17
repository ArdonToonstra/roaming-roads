# Roaming Roads

A travel content management platform built with Payload CMS and Next.js.

## Architecture

This project is now a single Next.js application containing both the frontend and the CMS:

- **`/web`** - Main application (Next.js 15 + Payload 3.0)
  - **`src/app/(frontend)`** - Public facing travel website
  - **`src/app/(payload)`** - Admin panel and CMS API

## Deployment

### Vercel Setup

The application (`/web`) is deployed as a full-stack Next.js application on Vercel with:
- **Backend**: Payload CMS with PostgreSQL database
- **Frontend**: Next.js App Router
- **Admin**: Accessible at `/admin`
- **API**: GraphQL/REST endpoints at `/api`

### Environment Variables

Required for Vercel deployment:

```env
# Database
DATABASE_URI=postgresql://user:pass@host:port/database
POSTGRES_URL=your_vercel_postgres_url

# Payload
PAYLOAD_SECRET=your-32-char-secret-key
NEXT_PUBLIC_SERVER_URL=https://your-domain.vercel.app

# Optional - for file uploads
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

### Local Development

1. **Start the Database**:
   ```bash
   cd web
   docker compose up -d postgres
   ```

2. **Run the Application**:
   ```bash
   pnpm dev
   ```
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

## Content API

Once deployed, the Payload CMS provides:
- **GraphQL**: `https://your-domain.vercel.app/api/graphql`
- **REST**: `https://your-domain.vercel.app/api/[collection]`
- **Admin Panel**: `https://your-domain.vercel.app/admin`

## Collections

- **Trips** - Travel itineraries with day-by-day breakdowns
- **Countries** - Destination information and travel requirements  
- **Activities** - Adventure activities and experiences
- **Accommodations** - Lodging options with amenities
- **Media** - Photos and videos with GPS metadata
