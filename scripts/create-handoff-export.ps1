# Creates Element-P2P-Handoff package with all source, assets, and config.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Dest = Join-Path $Root "Element-P2P-Handoff"

# Directories to copy wholesale
$dirs = @(
    "src",
    "public",
    "scripts",
    "guidelines",
    ".github"
)

# Individual root files (README.md excluded — handoff uses its own README)
$files = @(
    "index.html",
    "package.json",
    "package-lock.json",
    "pnpm-workspace.yaml",
    "vite.config.ts",
    "postcss.config.mjs",
    "default_shadcn_theme.css",
    "ATTRIBUTIONS.md",
    "SHARE-WITH-CLIENT.txt",
    "Share-with-client.bat",
    ".impeccable.md",
    ".gitignore"
)

# Handoff delivery path
$DeliveryDest = "E:\Element-P2P\Element-P2P-Handoff"
$DeliveryZip  = "E:\Element-P2P\Element-P2P-Handoff.zip"

Write-Host "Creating handoff package at: $Dest"

foreach ($dir in $dirs) {
    $src = Join-Path $Root $dir
    $target = Join-Path $Dest $dir
    if (Test-Path $src) {
        if (Test-Path $target) { Remove-Item $target -Recurse -Force }
        Copy-Item $src $target -Recurse -Force
        Write-Host "  Copied: $dir/"
    }
}

foreach ($file in $files) {
    $src = Join-Path $Root $file
    $target = Join-Path $Dest $file
    if (Test-Path $src) {
        Copy-Item $src $target -Force
        Write-Host "  Copied: $file"
    }
}

# Verify critical paths exist
$critical = @(
    "src\app\routes.ts",
    "src\app\pages\Dashboard.tsx",
    "src\app\pages\MainPurchaseRequestV2.tsx",
    "src\imports\Eluv8P2P-final-logo.svg",
    "package.json",
    "vite.config.ts",
    "HANDOFF.md",
    "MANIFEST.md"
)

$missing = @()
foreach ($path in $critical) {
    if (-not (Test-Path (Join-Path $Dest $path))) {
        $missing += $path
    }
}

if ($missing.Count -gt 0) {
    Write-Error "Missing critical files: $($missing -join ', ')"
}

# Count source files
$srcFiles = Get-ChildItem -Path (Join-Path $Dest "src") -Recurse -File
Write-Host ""
Write-Host "Handoff package ready."
Write-Host "  Source files: $($srcFiles.Count)"
Write-Host "  Location: $Dest"

# Sync to delivery folder (E:\Element-P2P)
if (Test-Path $DeliveryDest) { Remove-Item $DeliveryDest -Recurse -Force }
Copy-Item $Dest $DeliveryDest -Recurse -Force
if (Test-Path "$DeliveryDest\dist") { Remove-Item "$DeliveryDest\dist" -Recurse -Force }
if (Test-Path $DeliveryZip) { Remove-Item $DeliveryZip -Force }
Compress-Archive -Path $DeliveryDest -DestinationPath $DeliveryZip -CompressionLevel Optimal
Write-Host ""
Write-Host "Synced to: $DeliveryDest"
Write-Host "Zip created: $DeliveryZip"
