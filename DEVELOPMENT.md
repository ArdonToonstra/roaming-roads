# Development Setup Guide

This guide explains how to run the Roaming Roads project locally for development.

## Architecture Overview

```
Frontend (Next.js)     CMS (Payload)        Database
Port 3001         ->   Port 3000       ->   Live Postgres DB
```

The recommended setup is:
- **Frontend**: Runs locally on port 3001
- **CMS**: Runs locally on port 3000 via Docker
- **Database**: Uses the live production database (shared with Vercel deployment)

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ & pnpm
- Git

## Setup Steps

### 1. Get Live Database Credentials

You'll need the actual live database connection string from your Vercel deployment. Update:

```bash
# In cms/.env.local
DATABASE_URI=postgres://username:password@your-live-db-host:5432/roamingroads
```

Replace with your actual production database credentials.

### 2. Start the CMS (with live database)

```powershell
cd cms
docker compose up
```

This starts:
- Local Payload CMS on http://localhost:3000 (no local database needed)
- Connected to your live Neon database via .env.local
- Admin panel at http://localhost:3000/admin

### 3. Start the Frontend

```powershell  
cd frontend
pnpm install
pnpm dev
```

This starts the Next.js frontend on http://localhost:3001

## Development Workflow

1. **CMS Changes**: Use the admin panel at localhost:3000/admin to manage content
2. **Frontend Development**: Edit files in `frontend/src`, auto-reloads on localhost:3001
3. **Data Flow**: Frontend fetches from local CMS → local CMS reads from live DB

## Environment Files

### `frontend/.env.local`
```
NEXT_PUBLIC_CMS_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### `cms/.env.local`  
```
DATABASE_URI=postgres://your-live-db-connection-here
ALLOWED_ORIGINS=http://localhost:3001
PORT=3000
```

## Troubleshooting

### Port Conflicts
- CMS must run on 3000, frontend on 3001
- Stop any other processes using these ports

### Database Connection Issues
- Verify live database credentials are correct
- Check if your IP needs to be whitelisted for database access
- Ensure DATABASE_URI format is correct: `postgres://user:pass@host:port/dbname`

### CORS Issues
- Ensure `ALLOWED_ORIGINS` in CMS includes `http://localhost:3001`
- Check browser developer tools for CORS errors

### API 403/404 Errors
- Verify CMS is running and accessible at localhost:3000
- Check that collections are properly configured
- Ensure frontend is pointing to correct CMS URL

## Alternative Setups

### Option A: Full Remote (Easiest)
```
Frontend -> Vercel CMS -> Live DB
```
Set `NEXT_PUBLIC_CMS_URL=https://roaming-roads-cms.vercel.app` in frontend/.env.local

### Option B: Full Local (Isolated)
```powershell
cd cms
docker compose -f docker-compose.local-db.yml up
```
This uses the full local setup with PostgreSQL container + local database.

### Option C: Hybrid (Recommended)
Local CMS + Live DB (this guide). Best for development with real data.