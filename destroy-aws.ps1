# ========================================
# FlashFix AI - AWS Cleanup Script
# ลบ CloudFront และ S3 Bucket
# ========================================

param(
    [string]$ConfigFile = "deployment-info.json",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "🗑️  FlashFix AI - Cleanup AWS Resources" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# อ่านข้อมูล deployment
if (-not (Test-Path $ConfigFile)) {
    Write-Host "✗ ไม่พบไฟล์ $ConfigFile" -ForegroundColor Red
    exit 1
}

$config = Get-Content $ConfigFile | ConvertFrom-Json
$BucketName = $config.BucketName
$DistributionId = $config.DistributionId

Write-Host "⚠️  จะลบ resources ต่อไปนี้:" -ForegroundColor Yellow
Write-Host "  • CloudFront Distribution: $DistributionId" -ForegroundColor White
Write-Host "  • S3 Bucket: $BucketName" -ForegroundColor White
Write-Host ""

if (-not $Force) {
    $confirm = Read-Host "ยืนยันการลบ? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "ยกเลิก" -ForegroundColor Yellow
        exit 0
    }
}

# Disable CloudFront distribution
Write-Host ""
Write-Host "🔄 Disable CloudFront Distribution..." -ForegroundColor Yellow

$dist = aws cloudfront get-distribution --id $DistributionId | ConvertFrom-Json
$etag = $dist.ETag
$distConfig = $dist.Distribution.DistributionConfig
$distConfig.Enabled = $false

$distConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "dist-config.json" -Encoding utf8

aws cloudfront update-distribution `
    --id $DistributionId `
    --distribution-config file://dist-config.json `
    --if-match $etag | Out-Null

Remove-Item "dist-config.json"

Write-Host "✓ Distribution ถูก disable แล้ว" -ForegroundColor Green
Write-Host "⏰ รอให้ status เป็น Deployed (5-10 นาที)..." -ForegroundColor Yellow

# รอให้ distribution ถูก disable
$maxWait = 600 # 10 minutes
$waited = 0
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 30
    $waited += 30
    
    $status = aws cloudfront get-distribution --id $DistributionId --query "Distribution.Status" --output text
    Write-Host "  Status: $status ($waited/$maxWait วินาที)" -ForegroundColor Gray
    
    if ($status -eq "Deployed") {
        break
    }
}

# ลบ CloudFront distribution
Write-Host ""
Write-Host "🗑️  ลบ CloudFront Distribution..." -ForegroundColor Yellow

$dist = aws cloudfront get-distribution --id $DistributionId | ConvertFrom-Json
$etag = $dist.ETag

aws cloudfront delete-distribution --id $DistributionId --if-match $etag

Write-Host "✓ ลบ Distribution สำเร็จ" -ForegroundColor Green

# ลบไฟล์ใน S3
Write-Host ""
Write-Host "🗑️  ลบไฟล์ใน S3..." -ForegroundColor Yellow

aws s3 rm "s3://$BucketName" --recursive

Write-Host "✓ ลบไฟล์สำเร็จ" -ForegroundColor Green

# ลบ S3 bucket
Write-Host ""
Write-Host "🗑️  ลบ S3 Bucket..." -ForegroundColor Yellow

aws s3api delete-bucket --bucket $BucketName

Write-Host "✓ ลบ Bucket สำเร็จ" -ForegroundColor Green

# ลบไฟล์ config
Remove-Item $ConfigFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ ลบ resources ทั้งหมดสำเร็จ!" -ForegroundColor Green
