Write-Host "Building Backend JAR..."
./mvnw clean package -DskipTests

Write-Host "Creating deployment ZIP with Nginx config..."
$source_jar = "target/backend-0.0.1-SNAPSHOT.jar"
$platform_dir = ".platform"
$deploy_zip = "medvastr-deploy.zip"

if (Test-Path $deploy_zip) {
    Remove-Item $deploy_zip
}

# Create a staging directory to zip properly
$staging = "deploy-staging"
if (Test-Path $staging) {
    Remove-Item $staging -Recurse -Force
}
New-Item -ItemType Directory -Path $staging | Out-Null

Copy-Item $source_jar -Destination $staging/application.jar
Copy-Item $platform_dir -Destination $staging/ -Recurse

Compress-Archive -Path "$staging/*" -DestinationPath $deploy_zip

Remove-Item $staging -Recurse -Force

Write-Host "Done! Please upload medvastr-deploy.zip to AWS Elastic Beanstalk." -ForegroundColor Green
