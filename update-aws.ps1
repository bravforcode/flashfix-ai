# ========================================
# FlashFix AI - AWS Update Script
# อัปเดทไฟล์และ invalidate CloudFront cache
# ========================================

param(
    [string]$ConfigFile = "deployment-info.json"
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 FlashFix AI - Update Deployment" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# อ่านข้อมูล deployment
if (-not (Test-Path $ConfigFile)) {
    Write-Host "✗ ไม่พบไฟล์ $ConfigFile" -ForegroundColor Red
    Write-Host "  กรุณารัน deploy-aws.ps1 ก่อน" -ForegroundColor Yellow
    exit 1
}

$config = Get-Content $ConfigFile | ConvertFrom-Json
$BucketName = $config.BucketName
$DistributionId = $config.DistributionId

Write-Host "📦 Bucket: $BucketName" -ForegroundColor White
Write-Host "🌐 Distribution: $DistributionId" -ForegroundColor White
Write-Host ""

# อัปโหลดไฟล์
Write-Host "📤 อัปโหลดไฟล์ใหม่..." -ForegroundColor Yellow

$files = @(
    @{Path="FlashFix-AI-Production.html"; ContentType="text/html"; Key="index.html"},
    @{Path="flashfix.html"; ContentType="text/html"; Key="flashfix.html"},
    @{Path="api-ai.js"; ContentType="application/javascript"; Key="api/ai.js"}
)

$uploadedFiles = @()

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        aws s3 cp $file.Path "s3://$BucketName/$($file.Key)" `
            --content-type $file.ContentType `
            --cache-control "max-age=300"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $($file.Path)" -ForegroundColor Green
            $uploadedFiles += "/$($file.Key)"
        }
    }
}

# Invalidate CloudFront cache
Write-Host ""
Write-Host "🔄 ล้าง CloudFront Cache..." -ForegroundColor Yellow

$invalidationPaths = ($uploadedFiles + "/*") | ConvertTo-Json -Compress

$invalidationConfig = @"
{
    "Paths": {
        "Quantity": $($uploadedFiles.Count + 1),
        "Items": $(($uploadedFiles + "/*") | ConvertTo-Json)
    },
    "CallerReference": "update-$(Get-Date -Format 'yyyyMMddHHmmss')"
}
"@

$invalidationConfig | Out-File -FilePath "invalidation.json" -Encoding utf8

$invalidation = aws cloudfront create-invalidation `
    --distribution-id $DistributionId `
    --invalidation-batch file://invalidation.json | ConvertFrom-Json

Remove-Item "invalidation.json"

Write-Host "✓ Invalidation ID: $($invalidation.Invalidation.Id)" -ForegroundColor Green
Write-Host ""
Write-Host "✅ อัปเดทสำเร็จ!" -ForegroundColor Green
Write-Host "⏰ รอ 2-3 นาทีเพื่อให้ cache ถูกล้าง" -ForegroundColor Yellow
Write-Host "🌐 URL: $($config.URL)" -ForegroundColor Cyan
