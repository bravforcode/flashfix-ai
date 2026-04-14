# 🚀 AWS Deployment Guide - FlashFix AI

## คู่มือการ Deploy บน AWS สำหรับ Windows

ระบบนี้จะ host เว็บใน **Private S3 Bucket** และใช้ **CloudFront** ในการ deliver content

---

## 📋 สิ่งที่ต้องเตรียม

1. **AWS Account** พร้อม credentials ที่มีสิทธิ์:
   - S3: CreateBucket, PutObject, PutBucketPolicy
   - CloudFront: CreateDistribution, CreateCloudFrontOriginAccessIdentity
   
2. **AWS CLI** ติดตั้งบน Windows
   - ดาวน์โหลด: https://aws.amazon.com/cli/
   - ตรวจสอบ: `aws --version`

3. **PowerShell** (มีใน Windows อยู่แล้ว)

---

## 🔧 ขั้นตอนการติดตั้ง AWS CLI

### 1. ดาวน์โหลดและติดตั้ง
```powershell
# ดาวน์โหลด AWS CLI MSI installer
# https://awscli.amazonaws.com/AWSCLIV2.msi
```

### 2. ตั้งค่า AWS Credentials
```powershell
aws configure
```

ใส่ข้อมูล:
- AWS Access Key ID: `[YOUR_ACCESS_KEY]`
- AWS Secret Access Key: `[YOUR_SECRET_KEY]`
- Default region: `ap-southeast-1` (Singapore)
- Default output format: `json`

---

## 🚀 การ Deploy

### 1. Deploy ครั้งแรก
```powershell
# รันสคริปต์ deploy
.\deploy-aws.ps1
```


**พารามิเตอร์ที่ปรับได้:**
```powershell
# กำหนดชื่อ bucket และ region
.\deploy-aws.ps1 -BucketName "my-flashfix" -Region "us-east-1"

# ใช้ AWS profile อื่น
.\deploy-aws.ps1 -Profile "production"
```

**สคริปต์จะทำอะไรบ้าง:**
- ✅ สร้าง Private S3 Bucket
- ✅ อัปโหลดไฟล์ HTML และ JS
- ✅ สร้าง CloudFront Origin Access Identity (OAI)
- ✅ ตั้งค่า Bucket Policy ให้ CloudFront เข้าถึงได้
- ✅ สร้าง CloudFront Distribution
- ✅ บันทึกข้อมูลใน `deployment-info.json`

**ระยะเวลา:** 10-15 นาที (CloudFront ต้องใช้เวลา propagate)

---

### 2. อัปเดทไฟล์

เมื่อแก้ไขโค้ดและต้องการอัปเดท:

```powershell
.\update-aws.ps1
```

สคริปต์จะ:
- ✅ อัปโหลดไฟล์ใหม่ไปยัง S3
- ✅ Invalidate CloudFront cache
- ⏰ รอ 2-3 นาที cache จะถูกล้าง

---

### 3. ลบ Resources

เมื่อต้องการลบทุกอย่าง:

```powershell
# แสดง confirmation prompt
.\destroy-aws.ps1

# ลบทันทีโดยไม่ถาม
.\destroy-aws.ps1 -Force
```

สคริปต์จะ:
- ✅ Disable CloudFront Distribution
- ✅ ลบ Distribution
- ✅ ลบไฟล์ใน S3
- ✅ ลบ S3 Bucket
- ✅ ลบไฟล์ `deployment-info.json`

---

## 📊 ตรวจสอบสถานะ

### ดูสถานะ CloudFront
```powershell
# อ่านจาก deployment-info.json
$config = Get-Content deployment-info.json | ConvertFrom-Json
$distId = $config.DistributionId

# ตรวจสอบสถานะ
aws cloudfront get-distribution --id $distId --query "Distribution.Status"
```

สถานะที่เป็นไปได้:
- `InProgress` - กำลัง deploy
- `Deployed` - พร้อมใช้งาน

### ดูรายการไฟล์ใน S3
```powershell
$bucketName = $config.BucketName
aws s3 ls "s3://$bucketName" --recursive
```

---

## 🔒 Security Features

1. **Private S3 Bucket**
   - Block public access ทั้งหมด
   - เข้าถึงได้เฉพาะผ่าน CloudFront

2. **Origin Access Identity (OAI)**
   - CloudFront ใช้ OAI ในการเข้าถึง S3
   - ไม่มีใครเข้าถึง S3 โดยตรงได้

3. **HTTPS Only**
   - CloudFront redirect HTTP → HTTPS อัตโนมัติ

---

## 🌐 Custom Domain (Optional)

หากต้องการใช้ domain ของคุณเอง:

### 1. เตรียม SSL Certificate ใน ACM
```powershell
# ต้องสร้างใน us-east-1 region
aws acm request-certificate `
    --domain-name "flashfix.yourdomain.com" `
    --validation-method DNS `
    --region us-east-1
```

### 2. แก้ไข CloudFront Distribution
```powershell
# เพิ่ม Alternate Domain Names (CNAMEs)
# และ SSL Certificate ARN
```

### 3. ตั้งค่า DNS
```
CNAME flashfix.yourdomain.com → d1234abcd.cloudfront.net
```

---

## 💰 ค่าใช้จ่าย (ประมาณการ)

### Free Tier (12 เดือนแรก)
- CloudFront: 1 TB data transfer ฟรี
- S3: 5 GB storage ฟรี

### หลัง Free Tier
- CloudFront: ~$0.085/GB (Asia Pacific)
- S3 Storage: ~$0.025/GB/month
- S3 Requests: ~$0.0004/1000 requests

**ตัวอย่าง:** เว็บขนาด 5 MB, 1000 visitors/เดือน
- Data transfer: 5 GB × $0.085 = $0.43
- Storage: $0.025
- **รวม: ~$0.50/เดือน**

---

## 🐛 Troubleshooting

### ปัญหา: AWS CLI ไม่ทำงาน
```powershell
# ตรวจสอบ PATH
$env:PATH -split ';' | Select-String "AWS"

# ลองรัน
aws --version
```

### ปัญหา: Credentials ไม่ถูกต้อง
```powershell
# ตรวจสอบ credentials
aws sts get-caller-identity

# ตั้งค่าใหม่
aws configure
```

### ปัญหา: Bucket name ซ้ำ
```powershell
# เปลี่ยนชื่อ bucket
.\deploy-aws.ps1 -BucketName "flashfix-ai-$(Get-Random)"
```

### ปัญหา: CloudFront ช้า
- CloudFront ใช้เวลา 10-15 นาที ในการ deploy
- ตรวจสอบสถานะด้วย `aws cloudfront get-distribution`

---

## 📁 ไฟล์ที่สร้างขึ้น

- `deploy-aws.ps1` - สคริปต์ deploy ครั้งแรก
- `update-aws.ps1` - สคริปต์อัปเดทไฟล์
- `destroy-aws.ps1` - สคริปต์ลบ resources
- `deployment-info.json` - ข้อมูล deployment (เก็บไว้ใช้ update/destroy)

---

## ✅ Checklist

- [ ] ติดตั้ง AWS CLI แล้ว
- [ ] รัน `aws configure` แล้ว
- [ ] ทดสอบ `aws sts get-caller-identity` ผ่าน
- [ ] รัน `.\deploy-aws.ps1` สำเร็จ
- [ ] เปิด URL จาก `deployment-info.json` ได้
- [ ] ทดสอบอัปเดทด้วย `.\update-aws.ps1`

---

**หมายเหตุ:** เก็บไฟล์ `deployment-info.json` ไว้ดี เพราะใช้สำหรับ update และ destroy
