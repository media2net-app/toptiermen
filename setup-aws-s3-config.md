# AWS S3 Setup Guide - Video Uploads

## 🚀 Stap-voor-Stap Setup Instructies

### **Stap 1: AWS Account & S3 Bucket Aanmaken**

#### **1.1 AWS Console Toegang**
1. Ga naar [AWS Console](https://console.aws.amazon.com/)
2. Log in met je AWS account
3. Zoek naar "S3" in de services

#### **1.2 S3 Bucket Aanmaken**
1. Klik op "Create bucket"
2. **Bucket name:** `toptiermen-videos` (moet uniek zijn)
3. **Region:** `Europe (Ireland) eu-west-1`
4. **Object Ownership:** `ACLs enabled`
5. **Block Public Access:** `Uncheck all` (voor publieke video's)
6. **Bucket Versioning:** `Enable`
7. **Tags:** Voeg toe: `Project: TopTierMen`, `Purpose: Video Storage`
8. Klik "Create bucket"

#### **1.3 CORS Policy Instellen**
1. Ga naar je bucket → "Permissions" tab
2. Scroll naar "Cross-origin resource sharing (CORS)"
3. Klik "Edit" en voeg toe:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### **Stap 2: IAM User & Permissions**

#### **2.1 IAM User Aanmaken**
1. Ga naar AWS Console → IAM
2. Klik "Users" → "Create user"
3. **User name:** `toptiermen-s3-upload`
4. **Access type:** `Programmatic access`
5. Klik "Next: Permissions"

#### **2.2 Permissions Toevoegen**
1. Klik "Attach policies directly"
2. Zoek naar "S3" en selecteer:
   - `AmazonS3FullAccess` (voor testing)
   - OF maak custom policy (zie hieronder)

#### **2.3 Custom Policy (Aanbevolen)**
Maak een nieuwe policy met deze JSON:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl",
                "s3:GetObjectAcl",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::toptiermen-videos",
                "arn:aws:s3:::toptiermen-videos/*"
            ]
        }
    ]
}
```

#### **2.4 Access Keys Ophalen**
1. Na het aanmaken van de user
2. Ga naar "Security credentials" tab
3. Klik "Create access key"
4. **Use case:** `Application running outside AWS`
5. **Confirmation:** `I understand...`
6. **Sla de credentials op:**
   - Access Key ID
   - Secret Access Key

### **Stap 3: Environment Variables Configureren**

#### **3.1 .env.local Bestand Aanmaken**
Maak een `.env.local` bestand aan in de root van je project:

```bash
# Supabase Configuration (bestaand)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AWS S3 Configuration (NIEUW)
AWS_ACCESS_KEY_ID=AKIA...your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=eu-west-1
S3_BUCKET_NAME=toptiermen-videos
```

#### **3.2 Vercel Environment Variables (voor productie)**
1. Ga naar Vercel Dashboard → je project
2. Settings → Environment Variables
3. Voeg dezelfde variabelen toe

### **Stap 4: Testing & Verificatie**

#### **4.1 Development Server Starten**
```bash
npm run dev
```

#### **4.2 Environment Check**
1. Ga naar `http://localhost:3000/test-auth`
2. Klik "Check Environment"
3. Controleer of alle AWS variabelen "Set" zijn

#### **4.3 Video Upload Testen**
1. Ga naar Admin Dashboard → Academy
2. Probeer een video te uploaden
3. Controleer of de upload succesvol is

### **Stap 5: Bucket Lifecycle & Cost Optimization**

#### **5.1 Lifecycle Rules**
1. Ga naar je S3 bucket → "Management" tab
2. Klik "Create lifecycle rule"
3. **Rule name:** `video-cleanup`
4. **Lifecycle rule scope:** `Apply to all objects`
5. **Lifecycle actions:**
   - **Transition to IA:** 30 days
   - **Transition to Glacier:** 90 days
   - **Expire current versions:** 365 days

#### **5.2 Cost Monitoring**
1. Ga naar AWS Console → Billing
2. Stel budget alerts in voor S3 kosten
3. Monitor usage via CloudWatch

### **🔧 Troubleshooting**

#### **Probleem: "Access Denied"**
- Controleer IAM permissions
- Verifieer bucket policy
- Controleer CORS settings

#### **Probleem: "CORS Error"**
- Controleer CORS policy in S3 bucket
- Verifieer allowed origins
- Test met browser developer tools

#### **Probleem: "File Too Large"**
- Controleer file size limit (500MB)
- Verifieer bucket settings
- Check network connection

#### **Probleem: "Invalid Credentials"**
- Controleer environment variables
- Verifieer AWS credentials
- Test met AWS CLI

### **📊 Monitoring & Maintenance**

#### **CloudWatch Metrics**
- Monitor bucket usage
- Set up alerts voor errors
- Track upload/download metrics

#### **Cost Optimization**
- Implement lifecycle policies
- Monitor storage usage
- Optimize file sizes

#### **Security**
- Regular access key rotation
- Monitor access logs
- Review permissions quarterly

### **✅ Checklist**

- [ ] S3 bucket aangemaakt
- [ ] CORS policy geconfigureerd
- [ ] IAM user aangemaakt
- [ ] Access keys gegenereerd
- [ ] Environment variables geconfigureerd
- [ ] Development server getest
- [ ] Video upload getest
- [ ] Production environment geconfigureerd
- [ ] Monitoring ingesteld
- [ ] Documentation bijgewerkt

### **🎯 Volgende Stappen Na Setup**

1. **Performance Testing** - Test upload snelheden
2. **Error Handling** - Verbeter error messages
3. **CDN Integration** - CloudFront voor snellere delivery
4. **Video Processing** - Thumbnail generatie
5. **Analytics** - Upload/playback metrics