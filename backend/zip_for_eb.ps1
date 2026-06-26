Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = "..\medvastr-prod-final.zip"
If (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

# Add application.jar
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "target\backend-0.0.1-SNAPSHOT.jar", "application.jar")

# Add Procfile
if (Test-Path "Procfile") {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "Procfile", "Procfile")
}

# Add .ebextensions
if (Test-Path ".ebextensions") {
    $files = Get-ChildItem -Path ".ebextensions" -File -Recurse
    foreach ($file in $files) {
        $relPath = ".ebextensions/" + $file.Name
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relPath)
    }
}

# Add .platform
if (Test-Path ".platform") {
    $files = Get-ChildItem -Path ".platform" -File -Recurse
    foreach ($file in $files) {
        # Calculate relative path inside .platform, e.g., .platform/nginx/conf.d/elasticbeanstalk/00_application.conf
        $relPath = $file.FullName.Substring((Get-Item ".platform").FullName.Length + 1).Replace("\", "/")
        $relPath = ".platform/" + $relPath
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relPath)
    }
}

$zip.Dispose()
Write-Host "Created $zipPath successfully with Linux-compatible slashes!"
