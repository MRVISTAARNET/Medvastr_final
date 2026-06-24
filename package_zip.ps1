$ErrorActionPreference = "Stop"
$ROOT = "C:\Users\Admin\Desktop\Final_Medvastr"
$BACKEND = "$ROOT\backend"
$JAR_PATH = "$BACKEND\target\backend-0.0.1-SNAPSHOT.jar"
$PROC_PATH = "$BACKEND\Procfile"
$OUT_ZIP_ROOT = "$ROOT\medvastr-prod-final.zip"
$OUT_ZIP_BACKEND = "$BACKEND\medvastr-prod-final.zip"

Write-Host "Starting zip packaging..." -ForegroundColor Cyan

if (-not (Test-Path $JAR_PATH)) {
    Write-Host "ERROR: Fat JAR not found at $JAR_PATH" -ForegroundColor Red
    exit 1
}

# Clean existing zip files
if (Test-Path $OUT_ZIP_ROOT) { Remove-Item $OUT_ZIP_ROOT -Force }
if (Test-Path $OUT_ZIP_BACKEND) { Remove-Item $OUT_ZIP_BACKEND -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open($OUT_ZIP_ROOT, 'Create')

# Helper function to add a file to zip with custom entry name using forward slashes
function Add-FileToZip($zipArchive, $filePath, $entryPath) {
    # Ensure entry path uses forward slashes
    $ep = $entryPath -replace '\\', '/'
    Write-Host "Adding: $filePath -> $ep"
    $entry = $zipArchive.CreateEntry($ep, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead($filePath)
    $fileStream.CopyTo($entryStream)
    $fileStream.Close()
    $entryStream.Close()
}

# 1. Add application.jar
Add-FileToZip $archive $JAR_PATH "application.jar"

# 2. Add Procfile
if (Test-Path $PROC_PATH) {
    Add-FileToZip $archive $PROC_PATH "Procfile"
} else {
    Write-Host "WARNING: Procfile not found in backend!" -ForegroundColor Yellow
}

# 3. Add .ebextensions recursively
$ebextDir = "$BACKEND\.ebextensions"
if (Test-Path $ebextDir) {
    Get-ChildItem -Path $ebextDir -Recurse -File | ForEach-Object {
        $relPath = $_.FullName.Substring($ebextDir.Length + 1)
        Add-FileToZip $archive $_.FullName ".ebextensions/$relPath"
    }
}

# 4. Add .platform recursively
$platformDir = "$BACKEND\.platform"
if (Test-Path $platformDir) {
    Get-ChildItem -Path $platformDir -Recurse -File | ForEach-Object {
        $relPath = $_.FullName.Substring($platformDir.Length + 1)
        Add-FileToZip $archive $_.FullName ".platform/$relPath"
    }
}

$archive.Dispose()

# Copy to backend directory as well
Copy-Item $OUT_ZIP_ROOT $OUT_ZIP_BACKEND
Write-Host "Successfully packaged ZIP to root and backend!" -ForegroundColor Green

# Print ZIP contents for validation
Write-Host "`nVerifying final ZIP contents:" -ForegroundColor Yellow
$vz = [System.IO.Compression.ZipFile]::OpenRead($OUT_ZIP_ROOT)
foreach ($entry in $vz.Entries) {
    $sizeKB = [math]::Round($entry.Length / 1KB, 1)
    Write-Host "  $($entry.FullName) ($sizeKB KB)"
}
$vz.Dispose()
