$ErrorActionPreference = "Stop"
$ROOT    = "C:\Users\Admin\Desktop\Final_Medvastr"
$BACKEND = "$ROOT\backend"
$TARGET  = "$BACKEND\target"
$DEPLOY_DIR = "$ROOT\deploy_ready"
$TS      = Get-Date -Format "yyyyMMdd-HHmm"
$ZIP_NAME = "medvastr-deploy-$TS.zip"
$ZIP_PATH = "$ROOT\$ZIP_NAME"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Medvastr - Elastic Beanstalk Deploy Builder"       -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Maven build ────────────────────────────────────────────
Write-Host "[1/4] Building Spring Boot fat JAR..." -ForegroundColor Yellow
Set-Location $BACKEND
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
cmd /c ".\mvnw.cmd clean package -DskipTests -q"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Maven build FAILED." -ForegroundColor Red
    exit 1
}
Write-Host "      OK - Build succeeded." -ForegroundColor Green

# ── 2. Locate fat JAR ─────────────────────────────────────────
$FAT_JAR = Get-ChildItem "$TARGET\*.jar" | Where-Object { $_.Name -notlike "*.original" } | Select-Object -First 1
if (-not $FAT_JAR) {
    Write-Host "ERROR: Fat JAR not found in $TARGET" -ForegroundColor Red
    exit 1
}

$jarName = $FAT_JAR.Name
$jarMB   = [math]::Round($FAT_JAR.Length / 1MB, 1)
Write-Host "      Fat JAR: $jarName ($jarMB MB)" -ForegroundColor Green

# Verify Spring Boot Main-Class in MANIFEST
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zc  = [System.IO.Compression.ZipFile]::OpenRead($FAT_JAR.FullName)
$me  = $zc.GetEntry("META-INF/MANIFEST.MF")
$r   = New-Object System.IO.StreamReader($me.Open())
$mf  = $r.ReadToEnd()
$r.Close()
$zc.Dispose()

if ($mf -notmatch "Main-Class: org.springframework.boot.loader") {
    Write-Host "ERROR: JAR is missing Spring Boot Main-Class! Wrong JAR selected." -ForegroundColor Red
    exit 1
}
Write-Host "      OK - Main-Class verified in MANIFEST.MF" -ForegroundColor Green

# ── 3. Assemble deploy directory ──────────────────────────────
Write-Host ""
Write-Host "[2/4] Assembling deployment package..." -ForegroundColor Yellow
if (Test-Path $DEPLOY_DIR) { Remove-Item $DEPLOY_DIR -Recurse -Force }
New-Item -ItemType Directory $DEPLOY_DIR | Out-Null
New-Item -ItemType Directory "$DEPLOY_DIR\.ebextensions" | Out-Null
New-Item -ItemType Directory "$DEPLOY_DIR\.platform\nginx\conf.d" | Out-Null

# Fat JAR renamed to application.jar
Copy-Item $FAT_JAR.FullName "$DEPLOY_DIR\application.jar"

# Procfile - explicit prod profile launch
$procContent = "web: java -Dserver.port=8080 -Dspring.profiles.active=prod -jar application.jar"
[System.IO.File]::WriteAllText("$DEPLOY_DIR\Procfile", $procContent)

# .ebextensions
$ebextContent = @"
option_settings:
  aws:elasticbeanstalk:application:environment:
    SPRING_PROFILES_ACTIVE: prod
"@
[System.IO.File]::WriteAllText("$DEPLOY_DIR\.ebextensions\01_environment.config", $ebextContent)

# nginx body size
[System.IO.File]::WriteAllText("$DEPLOY_DIR\.platform\nginx\conf.d\proxy.conf", "client_max_body_size 50M;")

Write-Host "      OK - Deploy directory ready." -ForegroundColor Green

# ── 4. Create ZIP with forward-slash paths ───────────────────
Write-Host ""
Write-Host "[3/4] Creating deployment ZIP..." -ForegroundColor Yellow
if (Test-Path $ZIP_PATH) { Remove-Item $ZIP_PATH -Force }

$za = [System.IO.Compression.ZipFile]::Open($ZIP_PATH, 'Create')

function Add-Entry($archive, $src, $entryPath) {
    $ep = $entryPath -replace '\\', '/'
    $entry = $archive.CreateEntry($ep, [System.IO.Compression.CompressionLevel]::Fastest)
    $es = $entry.Open()
    $fs = [System.IO.File]::OpenRead($src)
    $fs.CopyTo($es)
    $fs.Close()
    $es.Close()
}

Add-Entry $za "$DEPLOY_DIR\application.jar"                              "application.jar"
Add-Entry $za "$DEPLOY_DIR\Procfile"                                     "Procfile"
Add-Entry $za "$DEPLOY_DIR\.ebextensions\01_environment.config"          ".ebextensions/01_environment.config"
Add-Entry $za "$DEPLOY_DIR\.platform\nginx\conf.d\proxy.conf"            ".platform/nginx/conf.d/proxy.conf"

$za.Dispose()

$zipMB = [math]::Round((Get-Item $ZIP_PATH).Length / 1MB, 1)
Write-Host "      OK - ZIP created: $ZIP_NAME ($zipMB MB)" -ForegroundColor Green

# ── 5. Verify ZIP ────────────────────────────────────────────
Write-Host ""
Write-Host "[4/4] Verifying ZIP contents..." -ForegroundColor Yellow
$vz = [System.IO.Compression.ZipFile]::OpenRead($ZIP_PATH)
foreach ($e in $vz.Entries) {
    $eKB = [math]::Round($e.Length / 1KB, 1)
    Write-Host "        $($e.FullName)  ($eKB KB)" -ForegroundColor Gray
}
$vz.Dispose()

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " READY TO DEPLOY"                                   -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " ZIP: $ZIP_PATH"                                    -ForegroundColor Yellow
Write-Host ""
Write-Host " Upload via AWS Console:"                           -ForegroundColor White
Write-Host " EB > Medvastr-backend-env > Upload and deploy"    -ForegroundColor White
Write-Host ""
Write-Host " SMTP reminder: Check EB env vars are set to:"     -ForegroundColor White
Write-Host "   MAIL_HOST   = smtp.titan.email"                 -ForegroundColor Gray
Write-Host "   MAIL_PORT   = 587"                              -ForegroundColor Gray
Write-Host "   MAIL_SSL_ENABLE   = false"                      -ForegroundColor Gray
Write-Host "   MAIL_STARTTLS_ENABLE = true"                    -ForegroundColor Gray
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ROOT
