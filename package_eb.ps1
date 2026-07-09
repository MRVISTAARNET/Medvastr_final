# Elastic Beanstalk Packaging Script for Windows (.NET ZipArchive for absolute path safety)
$ErrorActionPreference = "Stop"

# Load .NET Compression Assemblies
[System.Reflection.Assembly]::LoadWithPartialName("System.IO.Compression") | Out-Null
[System.Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem") | Out-Null

$root = "c:\Users\Admin\Desktop\Final_Medvastr"
$zipPath = "$root\medvastr-backend-eb.zip"
$backendDir = "$root\backend"
$jarSrc = "$backendDir\target\backend-0.0.1-SNAPSHOT.jar"
$stage = "$root\_eb_stage"

# Step 1: Clean build the Spring Boot application synchronously
Write-Host "Building backend Spring Boot application..."
Set-Location $backendDir
# Execute maven build synchronously
& .\mvnw.cmd clean package -DskipTests
Set-Location $root

# Verify JAR exists and is not empty
if (-not (Test-Path $jarSrc)) {
    Write-Error "Error: Backend JAR not found at $jarSrc!"
    exit 1
}

$jarSize = (Get-Item $jarSrc).Length
if ($jarSize -lt 10MB) {
    Write-Error "Error: JAR file size is too small ($($jarSize) bytes). Repackaging might have failed!"
    exit 1
}
$jarSizeMB = [math]::Round($jarSize / 1MB, 1)
Write-Host "JAR built successfully: $jarSrc ($jarSizeMB MB)"

# Step 2: Set up staging folder
Write-Host "Staging deployment files..."
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory $stage | Out-Null

# Copy files
Copy-Item $jarSrc "$stage\application.jar"
Copy-Item "$backendDir\Procfile" "$stage\Procfile"
if (Test-Path "$backendDir\.ebextensions") {
    Copy-Item "$backendDir\.ebextensions" "$stage\.ebextensions" -Recurse
}

# Step 3: Create ZIP archive using .NET to force Linux-friendly forward slashes (/)
Write-Host "Zipping deployment package..."
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$stream = New-Object System.IO.FileStream($zipPath, [System.IO.FileMode]::Create)
$zip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create)

$files = Get-ChildItem -Path $stage -Recurse | Where-Object { -not $_.PSIsContainer }
foreach ($file in $files) {
    $relative = $file.FullName.Substring($stage.Length + 1).Replace("\", "/")
    
    $entry = $zip.CreateEntry($relative)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead($file.FullName)
    $fileStream.CopyTo($entryStream)
    
    $fileStream.Close()
    $entryStream.Close()
}
$zip.Dispose()
$stream.Close()

# Step 4: Clean up staging folder
Remove-Item $stage -Recurse -Force

# Step 5: Verify Zip contents
Write-Host "Verifying ZIP contents..."
$zipVerify = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$zipVerify.Entries | ForEach-Object {
    Write-Host "   - $($_.FullName)"
}
$zipVerify.Dispose()

$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
Write-Host "--------------------------------------------------------"
Write-Host "Elastic Beanstalk Deploy Bundle Created successfully!"
Write-Host "Location: $zipPath"
Write-Host "Size: $zipSize MB"
Write-Host "--------------------------------------------------------"
