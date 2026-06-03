Write-Host "Building Backend JAR..." -ForegroundColor Cyan
./mvnw clean package -DskipTests

Write-Host "Creating deployment ZIP..." -ForegroundColor Cyan

$source_jar  = Resolve-Path "target/backend-0.0.1-SNAPSHOT.jar"
$deploy_zip  = Join-Path (Get-Location).Path "medvastr-deploy-fixed.zip"
$eb_env_cfg  = Resolve-Path ".ebextensions/01_environment.config"
$nginx_cfg   = Resolve-Path ".platform/nginx/conf.d/proxy.conf"

# Remove old zip if exists
if (Test-Path $deploy_zip) { Remove-Item $deploy_zip -Force }

# Load .NET ZIP library
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipStream = [System.IO.File]::Open($deploy_zip, [System.IO.FileMode]::Create)
$archive   = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create, $true)

function Add-ToZip {
    param($archive, $diskPath, $zipEntry, $compress)
    $level = if ($compress) {
        [System.IO.Compression.CompressionLevel]::Optimal
    } else {
        [System.IO.Compression.CompressionLevel]::NoCompression
    }
    $entry = $archive.CreateEntry($zipEntry, $level)
    $entryStream = $entry.Open()
    $fileStream  = [System.IO.File]::OpenRead($diskPath)
    $fileStream.CopyTo($entryStream)
    $fileStream.Close()
    $entryStream.Close()
    Write-Host "  Added: $zipEntry (compress=$compress)"
}

# application.jar MUST be stored uncompressed (STORE = NoCompression).
# Java's JVM cannot execute a double-DEFLATE-compressed JAR.
Add-ToZip $archive $source_jar "application.jar" $false

# Config files can be compressed normally
Add-ToZip $archive $eb_env_cfg  ".ebextensions/01_environment.config" $true
Add-ToZip $archive $nginx_cfg   ".platform/nginx/conf.d/proxy.conf"   $true

$archive.Dispose()
$zipStream.Close()

Write-Host ""
Write-Host "Done! Upload medvastr-deploy-fixed.zip to AWS Elastic Beanstalk." -ForegroundColor Green
Write-Host "File: $deploy_zip" -ForegroundColor Yellow
