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

Write-Host "Step 1: Starting local PostgreSQL database..." -ForegroundColor Yellow
docker compose up -d postgres

Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

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
docker run --rm --network host postgres:17 pg_dump $dumpOptions "$PROD_CONNECTION" > production-sync.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create production dump" -ForegroundColor Red
    exit 1
}

Write-Host "Step 3: Clearing local database..." -ForegroundColor Yellow
$containerID = docker compose ps -q postgres
docker exec -i $containerID psql -U rruser -d roamingroads -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

Write-Host "Step 4: Loading production data into local database..." -ForegroundColor Yellow
Get-Content production-sync.sql | docker exec -i $containerID psql -U rruser -d roamingroads

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Production sync completed successfully!" -ForegroundColor Green
    Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
    Remove-Item production-sync.sql -ErrorAction SilentlyContinue
    
    Write-Host "Your local database now matches production!" -ForegroundColor Cyan
    Write-Host "  - Start CMS: docker compose up" -ForegroundColor White
    Write-Host "  - Access admin: http://localhost:3000/admin" -ForegroundColor White
    Write-Host "  - Generate migrations when needed: npx payload migrate:create" -ForegroundColor White
} else {
    Write-Host "ERROR: Failed to load production data into local database" -ForegroundColor Red
    Write-Host "Try running with -SchemaOnly to sync just the structure first" -ForegroundColor Yellow
    exit 1
}