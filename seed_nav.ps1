$loginBody = '{"email":"medvastr@gmail.com","password":"Medvastr@123"}'
$loginResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json'
$token = $loginResp.data.token
Write-Host "Token acquired"

$headers = @{ 'Authorization' = "Bearer $token"; 'Content-Type' = 'application/json' }

# Check existing
$existing = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/nav' -Headers $headers
Write-Host "Existing nav items: $($existing.Count)"

if ($existing.Count -eq 0) {
    $navItems = @(
        @{ label='MEN'; href='/products?gen=MEN'; itemType='MEGA_MENU'; gender='men'; displayOrder=1; active=$true },
        @{ label='WOMEN'; href='/products?gen=WOMEN'; itemType='MEGA_MENU'; gender='women'; displayOrder=2; active=$true },
        @{ label='SURGICAL WEAR'; href='/products?cat=surgical-wear'; itemType='MEGA_MENU'; categorySlug='surgical-wear'; displayOrder=3; active=$true },
        @{ label='BULK ORDER'; href='/bulk-orders'; itemType='MEGA_MENU'; categorySlug='bulk-order'; displayOrder=4; active=$true },
        @{ label='ABOUT US'; href='/about'; itemType='LINK'; displayOrder=5; active=$true },
        @{ label='BLOGS'; href='/blog'; itemType='LINK'; displayOrder=6; active=$true },
        @{ label='CONTACT US'; href='/contact'; itemType='LINK'; displayOrder=7; active=$true }
    )
    foreach ($item in $navItems) {
        $body = $item | ConvertTo-Json
        Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/nav' -Method POST -Headers $headers -Body $body | Out-Null
        Write-Host "Added: $($item.label)"
    }
} else {
    Write-Host "Nav items already exist:"
    $existing | ForEach-Object { Write-Host "  - $($_.label)  [$($_.itemType)]" }
}
