# CMS Development Environment Guide

## Overview

The Roaming Roads CMS uses a **local-first development** approach to prevent production database issues and schema mismatches. This setup ensures safe development while providing easy production data synchronization.

## Architecture

- **Local Development**: PostgreSQL running in Docker container
- **Production**: Neon PostgreSQL database (hosted)
- **Sync Method**: One-way production → local sync via scripts

## Quick Start

### 1. Start Local Development Environment

```powershell
# Start the complete local stack (database + CMS)
docker compose up

# CMS will be available at: http://localhost:3000
# Admin interface: http://localhost:3000/admin
```

### 2. Configure Production Database Access (First Time Only)

```powershell
# Copy the template and configure production credentials
Copy-Item .env.production.template .env.production

# Edit .env.production with your actual Neon database details
# Get connection details from: https://console.neon.tech/
```

### 3. Sync Production Data (Optional)

If you need the latest production data for development:

```powershell
# Full sync (schema + data)
.\sync-production-db.ps1

# Schema only (structure without data)  
.\sync-production-db.ps1 -SchemaOnly

# Data only (assumes schema is already correct)
.\sync-production-db.ps1 -DataOnly
```

## Database Management

### Local Database
- **Host**: localhost:5432
- **Database**: roamingroads
- **User**: rruser
- **Password**: z8ZWOUcPaXKgiAn0sATYNb7N61Lth0JyLbH
- **Data**: Stored in Docker volume `postgres_data`

### Production Database (Read-Only Access)
- **Configuration**: Stored in `.env.production` (not in git)
- **Template**: Available in `.env.production.template`
- **Source**: Get details from [Neon Console](https://console.neon.tech/)
- **⚠️ NEVER connect directly for development**

## Schema Migrations

### Creating Migrations
When you modify Payload collections (in `src/collections/`):

```powershell
# 1. Start local environment
docker compose up -d

# 2. Generate migration from code changes
docker exec -it cms-payload-1 npx payload migrate:create

# 3. Run migration locally to test
docker exec -it cms-payload-1 npx payload migrate

# 4. Test your changes thoroughly
```

### Deploying Migrations
After testing locally:

```powershell
# 1. Commit your migration files to git
git add src/migrations/
git commit -m "Add migration for [feature]"

# 2. Deploy to Vercel
git push origin main

# 3. Migration will run automatically during Vercel build
```

### Migration Troubleshooting
If builds hang due to schema mismatch:

1. **Sync production to local**:
   ```powershell
   .\sync-production-db.ps1
   ```

2. **Generate sync migration**:
   ```powershell
   docker exec -it cms-payload-1 npx payload migrate:create
   ```

3. **Test locally before deploying**:
   ```powershell
   docker exec -it cms-payload-1 npx payload migrate
   ```

## File Structure

```
cms/
├── docker-compose.yml          # Local development stack (database + CMS)
├── sync-production-db.ps1      # Production sync script (safe to commit)
├── .env.local                  # Local environment (uses localhost database)
├── .env.production             # Production DB config (NOT in git)
├── .env.production.template    # Template for production config
├── src/
│   ├── collections/           # Data models (Trips, Countries, etc.)
│   ├── migrations/            # Database migration files
│   └── payload.config.ts      # Main CMS configuration
└── production-sync.sql        # Temporary sync files (auto-cleaned)
```

## Environment Variables

### .env.local (Local Development)
```bash
# Uses local PostgreSQL container
DATABASE_URI=postgresql://rruser:password@localhost:5432/roamingroads
NODE_ENV=development
PAYLOAD_SECRET=your_local_secret
# ... other local settings
```

### Vercel Environment (Production)
```bash
# Uses Neon PostgreSQL
DATABASE_URI=postgresql://neondb_owner:password@neon-host/neondb?sslmode=require
NODE_ENV=production
PAYLOAD_SECRET=your_production_secret
# ... other production settings
```

## Security Best Practices

### ✅ Safe Practices
- Always develop against local database
- Use sync script for production data
- Test migrations locally first
- Keep production credentials secure

### ❌ Avoid These Mistakes
- **Never** connect local development directly to production database
- **Never** run untested migrations against production
- **Never** commit production credentials to git (use .env.production)
- **Never** modify production database schema manually

## Common Commands

```powershell
# Start development environment
docker compose up

# Stop and clean up
docker compose down
docker volume rm cms_postgres_data  # Reset database

# Sync from production
.\sync-production-db.ps1

# Generate migration
docker exec -it cms-payload-1 npx payload migrate:create

# Run migration
docker exec -it cms-payload-1 npx payload migrate

# Check migration status  
docker exec -it cms-payload-1 npx payload migrate:status

# Access database directly
docker exec -it cms-postgres-1 psql -U rruser -d roamingroads
```

## Troubleshooting

### Build Hangs on Vercel
**Cause**: Schema mismatch between code and production database

**Solution**:
1. Sync production to local: `.\sync-production-db.ps1`
2. Generate migration: `docker exec -it cms-payload-1 npx payload migrate:create`  
3. Test locally: `docker exec -it cms-payload-1 npx payload migrate`
4. Deploy: `git push origin main`

### Container Won't Start
**Cause**: Port conflicts or volume issues

**Solution**:
```powershell
docker compose down
docker system prune -f
docker compose up
```

### Migration Fails Locally
**Cause**: Local database out of sync

**Solution**:
```powershell
.\sync-production-db.ps1 -SchemaOnly
docker exec -it cms-payload-1 npx payload migrate:create
```

---

## Next Steps

1. ✅ Local environment setup completed
2. 🔄 Sync production data if needed
3. 🛠️ Generate migration to fix schema mismatch
4. 🚀 Deploy to production with proper migrations