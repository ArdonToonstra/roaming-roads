# Script to sync production Neon database to local PostgreSQL
# Use this to get the latest production data for local development

param(
    [switch]$SchemaOnly,
    [switch]$DataOnly
)

Write-Host "Syncing production database to local development environment..." -ForegroundColor Green

# Load production database configuration
if (-not (Test-Path ".env.production")) {
    Write-Host "ERROR: .env.production file not found!" -ForegroundColor Red
    Write-Host "Please create .env.production with your production database details:" -ForegroundColor Yellow
    Write-Host "   1. Copy .env.production.template to .env.production" -ForegroundColor White
    Write-Host "   2. Fill in your actual production database connection details" -ForegroundColor White
    Write-Host "   3. Get details from: https://console.neon.tech/" -ForegroundColor White
    exit 1
}

Write-Host "Loading production database configuration..." -ForegroundColor Cyan

# Read and parse .env.production file
$envContent = Get-Content ".env.production" | Where-Object { $_ -match "^[^#].*=" }
$envVars = @{}
foreach ($line in $envContent) {
    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) {
        $envVars[$parts[0].Trim()] = $parts[1].Trim()
    }
}

# Build connection string from environment variables
$PROD_HOST = $envVars["PRODUCTION_DB_HOST"]
$PROD_NAME = $envVars["PRODUCTION_DB_NAME"] 
$PROD_USER = $envVars["PRODUCTION_DB_USER"]
$PROD_PASS = $envVars["PRODUCTION_DB_PASSWORD"]
$PROD_SSL = $envVars["PRODUCTION_DB_SSL"]

if (-not ($PROD_HOST -and $PROD_NAME -and $PROD_USER -and $PROD_PASS)) {
    Write-Host "ERROR: Missing required production database configuration!" -ForegroundColor Red
    Write-Host "Please check your .env.production file has all required fields" -ForegroundColor Yellow
    exit 1
}

$PROD_CONNECTION = "postgresql://${PROD_USER}:${PROD_PASS}@${PROD_HOST}/${PROD_NAME}?sslmode=${PROD_SSL}"

# --- NEW: stop payload service if running to avoid connection attempts during sync ---
Write-Host "Stopping CMS/payload service (if running) to avoid DB connection attempts..." -ForegroundColor Yellow
try {
    $payloadServiceId = docker compose ps -q payload 2>$null
    if ($payloadServiceId) {
        docker compose stop payload | Out-Null
        Write-Host "Stopped payload service." -ForegroundColor Cyan
    } else {
        Write-Host "No payload service running (or service name 'payload' not defined). Continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not determine/stop payload service. Continuing anyway..." -ForegroundColor Yellow
}

Write-Host "Step 1: Starting local PostgreSQL database..." -ForegroundColor Yellow
docker compose up -d postgres

# --- NEW: wait loop for host port to be open and for postgres inside container to be ready ---
$maxWaitSeconds = 120
$waitInterval = 2
$elapsed = 0

Write-Host "Waiting for PostgreSQL to accept connections on host port 5432..." -ForegroundColor Yellow
while ($elapsed -lt $maxWaitSeconds) {
    $conn = Test-NetConnection -ComputerName 127.0.0.1 -Port 5432 -WarningAction SilentlyContinue
    if ($conn.TcpTestSucceeded) { break }
    Start-Sleep -Seconds $waitInterval
    $elapsed += $waitInterval
}
if (-not $conn.TcpTestSucceeded) {
    Write-Host "WARNING: Host port 5432 did not open within $maxWaitSeconds seconds. The container may still be starting." -ForegroundColor Yellow
} else {
    Write-Host "Host port 5432 is open." -ForegroundColor Cyan
}

Write-Host "Waiting for Postgres inside container to report readiness (pg_isready)..." -ForegroundColor Yellow
$containerID = docker compose ps -q postgres
if (-not $containerID) {
    Write-Host "ERROR: Could not find running postgres container via 'docker compose ps -q postgres'." -ForegroundColor Red
    Write-Host "Make sure the 'postgres' service is defined in docker-compose and retry." -ForegroundColor Yellow
    exit 1
}

$elapsed = 0
$ready = $false
while ($elapsed -lt $maxWaitSeconds) {
    try {
        $check = docker exec -i $containerID pg_isready -U rruser -d roamingroads 2>$null
        if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    } catch {
        # ignore and retry
    }
    Start-Sleep -Seconds $waitInterval
    $elapsed += $waitInterval
}
if (-not $ready) {
    Write-Host "WARNING: pg_isready did not return ready within $maxWaitSeconds seconds. Continuing, but the DB may not be fully ready." -ForegroundColor Yellow
} else {
    Write-Host "Postgres inside container is ready." -ForegroundColor Cyan
}

# Determine dump options
$dumpOptions = ""
if ($SchemaOnly) {
    $dumpOptions = "--schema-only"
    Write-Host "Step 2: Creating schema-only dump from production..." -ForegroundColor Yellow
} elseif ($DataOnly) {
    $dumpOptions = "--data-only"
    Write-Host "Step 2: Creating data-only dump from production..." -ForegroundColor Yellow
} else {
    Write-Host "Step 2: Creating full database dump from production..." -ForegroundColor Yellow
}

# Create the dump
# Use --no-owner and --no-acl when dumping production Neon DB so the dump does not
# contain ALTER OWNER or GRANT statements that reference cloud-only roles like
# `neondb_owner` or `neon_superuser`. Restoring such statements into a local
# Postgres instance without those roles causes the errors the user reported.
# These flags are safe for development syncs where we don't need to preserve
# original ownership or role grants.
docker run --rm --network host postgres:17 pg_dump $dumpOptions --no-owner --no-acl "$PROD_CONNECTION" > production-sync.sql

# Some cloud Postgres providers (Neon) add provider-specific GUC settings
# such as `transaction_timeout` that don't exist in vanilla Postgres and
# will cause errors on restore (unrecognized configuration parameter).
# Strip those lines out before restoring.
Write-Host "Sanitizing dump: removing Neon-specific GUCs (e.g. transaction_timeout) ..." -ForegroundColor Yellow
$sanitizedPath = "production-sync.sanitized.sql"
Get-Content production-sync.sql | Where-Object { -not ($_ -match "^\s*SET\s+transaction_timeout\b") } | Set-Content $sanitizedPath

# Use sanitized file for restore
$restoreFile = $sanitizedPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create production dump" -ForegroundColor Red
    exit 1
}

Write-Host "Step 3: Clearing local database..." -ForegroundColor Yellow
docker exec -i $containerID psql -U rruser -d roamingroads -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

Write-Host "Step 4: Loading production data into local database..." -ForegroundColor Yellow
if (-not (Test-Path $restoreFile)) {
    Write-Host "Sanitized dump not found, falling back to original dump file..." -ForegroundColor Yellow
    $restoreFile = "production-sync.sql"
}

Get-Content $restoreFile | docker exec -i $containerID psql -U rruser -d roamingroads

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Production sync completed successfully!" -ForegroundColor Green
    Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
    Remove-Item production-sync.sql -ErrorAction SilentlyContinue
    Remove-Item production-sync.sanitized.sql -ErrorAction SilentlyContinue
    
    Write-Host "Your local database now matches production!" -ForegroundColor Cyan
    Write-Host "  - Start CMS: docker compose up" -ForegroundColor White
    Write-Host "  - Access admin: http://localhost:3000/admin" -ForegroundColor White
    Write-Host "  - Generate migrations when needed: npx payload migrate:create" -ForegroundColor White
    Write-Host ""
    Write-Host "NOTE: If you previously stopped the payload service, start it now:" -ForegroundColor Yellow
    Write-Host "  docker compose up -d" -ForegroundColor White
} else {
    Write-Host "ERROR: Failed to load production data into local database" -ForegroundColor Red
    Write-Host "Try running with -SchemaOnly to sync just the structure first" -ForegroundColor Yellow
    Write-Host "Temporary dump files preserved for diagnosis: production-sync.sql and production-sync.sanitized.sql" -ForegroundColor Yellow
    exit 1
}