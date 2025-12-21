# Script to strictly BACKUP production Neon database to a local SQL file.
# It does NOT restore to local.

Write-Host "Backing up production database..." -ForegroundColor Green

# Load production database configuration
if (-not (Test-Path ".env.production")) {
    Write-Host "ERROR: .env.production file not found!" -ForegroundColor Red
    exit 1
}

# Read and parse .env.production file
$envContent = Get-Content ".env.production" | Where-Object { $_ -match "^[^#].*=" }
$envVars = @{}
foreach ($line in $envContent) {
    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) {
        $envVars[$parts[0].Trim()] = $parts[1].Trim()
    }
}

$PROD_HOST = $envVars["PRODUCTION_DB_HOST"]
$PROD_NAME = $envVars["PRODUCTION_DB_NAME"] 
$PROD_USER = $envVars["PRODUCTION_DB_USER"]
$PROD_PASS = $envVars["PRODUCTION_DB_PASSWORD"]
$PROD_SSL = $envVars["PRODUCTION_DB_SSL"]

if (-not ($PROD_HOST -and $PROD_NAME -and $PROD_USER -and $PROD_PASS)) {
    Write-Host "ERROR: Missing required production database configuration!" -ForegroundColor Red
    exit 1
}

$PROD_CONNECTION = "postgresql://${PROD_USER}:${PROD_PASS}@${PROD_HOST}/${PROD_NAME}?sslmode=${PROD_SSL}"
$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$backupFile = "production-backup-${timestamp}.sql"

Write-Host "Creating backup: $backupFile" -ForegroundColor Yellow

# Create the dump
# Use --no-owner and --no-acl to avoid cloud-specific role issues in any future restore
docker run --rm --network host postgres:17 pg_dump --no-owner --no-acl "$PROD_CONNECTION" > $backupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Backup created at $backupFile" -ForegroundColor Green
}
else {
    Write-Host "ERROR: Failed to create production dump" -ForegroundColor Red
    exit 1
}
