# Roaming Roads

A travel content management platform built with Payload CMS and Next.js.

## Architecture

This is a monorepo with two main applications:

- **`/cms`** - Payload CMS (headless backend + admin panel)
- **`/frontend`** - Next.js frontend application *(coming soon)*

## Deployment

### Vercel Setup

The Payload CMS (`/cms`) is deployed as a full-stack Next.js application on Vercel with:
- **Backend**: Payload CMS with PostgreSQL database
- **Frontend**: Admin panel for content management
- **API**: GraphQL/REST endpoints for content consumption

### Environment Variables

Required for Vercel deployment:

```env
# Database
DATABASE_URI=postgresql://user:pass@host:port/database
POSTGRES_URL=your_vercel_postgres_url

# Payload
PAYLOAD_SECRET=your-32-char-secret-key
NEXT_PUBLIC_SERVER_URL=https://your-cms-domain.vercel.app

# Optional - for file uploads
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

### Local Development

1. **Start the CMS**:
   ```bash
   cd cms
   docker compose up
   ```
   Access at: http://localhost:3000

2. **Future Frontend** (when created):
   ```bash
   cd frontend
   npm run dev
   ```

## Content API

Once deployed, the Payload CMS provides:
- **GraphQL**: `https://your-cms.vercel.app/api/graphql`
- **REST**: `https://your-cms.vercel.app/api/[collection]`
- **Admin Panel**: `https://your-cms.vercel.app/admin`

## Collections

- **Trips** - Travel itineraries with day-by-day breakdowns
- **Countries** - Destination information and travel requirements  
- **Activities** - Adventure activities and experiences
- **Accommodations** - Lodging options with amenities
- **Media** - Photos and videos with GPS metadata
