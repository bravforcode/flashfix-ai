# ========================================
# FlashFix AI - AWS Deployment Script
# Private S3 + CloudFront Distribution
# ========================================

param(
    [string]$BucketName = "flashfix-ai-private",
    [string]$Region = "ap-southeast-1",
    [string]$Profile = "default"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 FlashFix AI - AWS Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบ AWS CLI
Write-Host "📋 ตรวจสอบ AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version
    Write-Host "✓ AWS CLI: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ไม่พบ AWS CLI กรุณาติดตั้งก่อน: https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

# ตรวจสอบ credentials
Write-Host "🔑 ตรวจสอบ AWS Credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --profile $Profile 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Invalid credentials"
    }
    Write-Host "✓ AWS Account: $(($identity | ConvertFrom-Json).Account)" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS Credentials ไม่ถูกต้อง กรุณารันคำสั่ง: aws configure" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 กำลังสร้าง S3 Bucket..." -ForegroundColor Yellow

# สร้าง S3 bucket (private)
$bucketExists = aws s3api head-bucket --bucket $BucketName --profile $Profile 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Bucket '$BucketName' มีอยู่แล้ว" -ForegroundColor Green
} else {
    aws s3api create-bucket `
        --bucket $BucketName `
        --region $Region `
        --create-bucket-configuration LocationConstraint=$Region `
        --profile $Profile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ สร้าง Bucket สำเร็จ" -ForegroundColor Green
    } else {
        Write-Host "✗ สร้าง Bucket ไม่สำเร็จ" -ForegroundColor Red
        exit 1
    }
}

# Block public access (private bucket)
Write-Host "🔒 ตั้งค่า Private Access..." -ForegroundColor Yellow
aws s3api put-public-access-block `
    --bucket $BucketName `
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" `
    --profile $Profile

Write-Host "✓ Bucket เป็น Private แล้ว" -ForegroundColor Green

Write-Host ""
Write-Host "📤 อัปโหลดไฟล์..." -ForegroundColor Yellow

# อัปโหลดไฟล์
$files = @(
    @{Path="FlashFix-AI-Production.html"; ContentType="text/html"; Key="index.html"},
    @{Path="flashfix.html"; ContentType="text/html"; Key="flashfix.html"},
    @{Path="api-ai.js"; ContentType="application/javascript"; Key="api/ai.js"}
)

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        aws s3 cp $file.Path "s3://$BucketName/$($file.Key)" `
            --content-type $file.ContentType `
            --profile $Profile
        Write-Host "  ✓ $($file.Path) → $($file.Key)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ ไม่พบไฟล์: $($file.Path)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🌐 สร้าง CloudFront Distribution..." -ForegroundColor Yellow

# สร้าง Origin Access Identity (OAI)
$oaiId = aws cloudfront list-cloud-front-origin-access-identities --query "CloudFrontOriginAccessIdentityList.Items[?Comment=='FlashFix-AI-OAI'].Id" --output text --profile $Profile

if ([string]::IsNullOrEmpty($oaiId)) {
    Write-Host "  📝 สร้าง Origin Access Identity..." -ForegroundColor Yellow
    $oaiResult = aws cloudfront create-cloud-front-origin-access-identity `
        --cloud-front-origin-access-identity-config "CallerReference=$(Get-Date -Format 'yyyyMMddHHmmss'),Comment=FlashFix-AI-OAI" `
        --profile $Profile | ConvertFrom-Json
    
    $oaiId = $oaiResult.CloudFrontOriginAccessIdentity.Id
    Write-Host "  ✓ OAI ID: $oaiId" -ForegroundColor Green
} else {
    Write-Host "  ✓ ใช้ OAI ที่มีอยู่: $oaiId" -ForegroundColor Green
}

# สร้าง bucket policy เพื่อให้ CloudFront เข้าถึงได้
$bucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontOAI",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity $oaiId"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BucketName/*"
        }
    ]
}
"@

$bucketPolicy | Out-File -FilePath "bucket-policy.json" -Encoding utf8
aws s3api put-bucket-policy --bucket $BucketName --policy file://bucket-policy.json --profile $Profile
Remove-Item "bucket-policy.json"
Write-Host "✓ ตั้งค่า Bucket Policy สำเร็จ" -ForegroundColor Green

Write-Host ""
Write-Host "⏳ กำลังสร้าง CloudFront Distribution (ใช้เวลา 10-15 นาที)..." -ForegroundColor Yellow
Write-Host "   คุณสามารถปิดหน้าต่างนี้และตรวจสอบสถานะใน AWS Console ได้" -ForegroundColor Gray

# สร้าง CloudFront distribution config
$distributionConfig = @"
{
    "CallerReference": "flashfix-$(Get-Date -Format 'yyyyMMddHHmmss')",
    "Comment": "FlashFix AI Distribution",
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BucketName",
                "DomainName": "$BucketName.s3.$Region.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": "origin-access-identity/cloudfront/$oaiId"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BucketName",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "Compress": true,
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        }
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100",
    "ViewerCertificate": {
        "CloudFrontDefaultCertificate": true
    }
}
"@

$distributionConfig | Out-File -FilePath "distribution-config.json" -Encoding utf8

try {
    $distribution = aws cloudfront create-distribution --distribution-config file://distribution-config.json --profile $Profile | ConvertFrom-Json
    $distributionId = $distribution.Distribution.Id
    $domainName = $distribution.Distribution.DomainName
    
    Remove-Item "distribution-config.json"
    
    Write-Host ""
    Write-Host "✅ Deployment สำเร็จ!" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 ข้อมูล Deployment:" -ForegroundColor Cyan
    Write-Host "  • S3 Bucket: $BucketName" -ForegroundColor White
    Write-Host "  • Region: $Region" -ForegroundColor White
    Write-Host "  • CloudFront ID: $distributionId" -ForegroundColor White
    Write-Host "  • URL: https://$domainName" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⏰ CloudFront กำลัง deploy (10-15 นาที)" -ForegroundColor Yellow
    Write-Host "   ตรวจสอบสถานะ: aws cloudfront get-distribution --id $distributionId --profile $Profile" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 บันทึกข้อมูลนี้ไว้:" -ForegroundColor Cyan
    
    $deploymentInfo = @{
        BucketName = $BucketName
        Region = $Region
        DistributionId = $distributionId
        URL = "https://$domainName"
        DeployedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    
    $deploymentInfo | ConvertTo-Json | Out-File -FilePath "deployment-info.json" -Encoding utf8
    Write-Host "  ✓ บันทึกใน deployment-info.json" -ForegroundColor Green
    
} catch {
    Write-Host "✗ สร้าง CloudFront Distribution ไม่สำเร็จ" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Remove-Item "distribution-config.json" -ErrorAction SilentlyContinue
    exit 1
}
