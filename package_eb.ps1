# Elastic Beanstalk Packaging Script for Windows (uses Java 'jar' tool to avoid backslash warning)
$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$zipName = "medvastr-backend-eb.zip"
$zipPath = "c:\Users\Admin\Desktop\Final_Medvastr\$zipName"
$jarSrc  = "c:\Users\Admin\Desktop\Final_Medvastr\backend\target\backend-0.0.1-SNAPSHOT.jar"

if (-not (Test-Path $jarSrc)) {
    Write-Error "Backend JAR not found at $jarSrc. Please run mvnw clean package first."
    exit 1
}

$stage = "c:\Users\Admin\Desktop\Final_Medvastr\_eb_stage"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory $stage | Out-Null

Copy-Item $jarSrc "$stage\application.jar"
Copy-Item "c:\Users\Admin\Desktop\Final_Medvastr\backend\Procfile" "$stage\Procfile"
Copy-Item "c:\Users\Admin\Desktop\Final_Medvastr\backend\.ebextensions" "$stage\.ebextensions" -Recurse

# Execute jar tool to create zip with correct forward slash headers
$oldLocation = Get-Location
Set-Location $stage
jar -c -M -f $zipPath *
Set-Location $oldLocation

Remove-Item $stage -Recurse -Force

$size = [math]::Round((Get-Item $zipPath).Length/1MB, 1)
Write-Host "--------------------------------------------------------"
Write-Host "✅ Elastic Beanstalk Deploy Bundle Created Successfully!"
Write-Host "📍 Location: $zipPath"
Write-Host "📦 Size: $size MB"
Write-Host "--------------------------------------------------------"
