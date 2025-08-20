# Advertenties Bucket Setup - Video Upload Fix

## 🔧 **Probleem**
Video upload mislukt met error: "new row violates row-level security policy"

## ✅ **Oplossing**

### **Stap 1: Voer SQL Script Uit**
1. Ga naar je **Supabase Dashboard**
2. Ga naar **SQL Editor**
3. Voer het script `scripts/fix-advertenties-bucket-simple.sql` uit
4. Dit maakt de bucket en video_upload_logs tabel aan

### **Stap 2: Storage Policies Instellen via Dashboard**

#### **Ga naar Storage > Policies:**
1. Open je Supabase Dashboard
2. Ga naar **Storage** in het linker menu
3. Klik op **Policies** tab
4. Zoek de **advertenties** bucket

#### **Voeg deze policies toe:**

**1. Public Read Access:**
- **Policy Name**: `Public read access for advertenties`
- **Target Roles**: `public`
- **Policy Definition**: `bucket_id = 'advertenties'`
- **Operation**: `SELECT`

**2. Authenticated Upload:**
- **Policy Name**: `Authenticated users can upload advertenties`
- **Target Roles**: `authenticated`
- **Policy Definition**: `bucket_id = 'advertenties' AND auth.role() = 'authenticated'`
- **Operation**: `INSERT`

**3. Authenticated Update:**
- **Policy Name**: `Users can update their own advertenties`
- **Target Roles**: `authenticated`
- **Policy Definition**: `bucket_id = 'advertenties' AND auth.role() = 'authenticated'`
- **Operation**: `UPDATE`

**4. Authenticated Delete:**
- **Policy Name**: `Users can delete their own advertenties`
- **Target Roles**: `authenticated`
- **Policy Definition**: `bucket_id = 'advertenties' AND auth.role() = 'authenticated'`
- **Operation**: `DELETE`

### **Stap 3: Test de Upload**

Na het instellen van de policies:

1. Ga naar `http://localhost:6001/dashboard-marketing/advertentie-materiaal`
2. Probeer een video te uploaden
3. De upload zou nu moeten werken

### **Stap 4: Verificatie**

Als de upload nog steeds niet werkt:

1. **Check Bucket Existence:**
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'advertenties';
   ```

2. **Check Policies:**
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'objects' 
   AND policyname LIKE '%advertenties%';
   ```

3. **Check Video Upload Logs:**
   ```sql
   SELECT * FROM video_upload_logs ORDER BY created_at DESC LIMIT 5;
   ```

## 🔍 **Debugging**

### **Veelvoorkomende Problemen:**

1. **"must be owner of table objects"**
   - **Oplossing**: Gebruik Supabase Dashboard voor storage policies

2. **"signature verification failed"**
   - **Oplossing**: Controleer je service role key in `.env.local`

3. **"new row violates row-level security policy"**
   - **Oplossing**: Zorg dat alle 4 policies zijn ingesteld

### **Test Commands:**

```bash
# Test bucket existence
node scripts/test-advertenties-bucket.js

# Test video upload
curl -X POST http://localhost:6001/api/test-video-upload
```

## 📋 **Samenvatting**

1. ✅ Voer `fix-advertenties-bucket-simple.sql` uit
2. ✅ Stel 4 storage policies in via Dashboard
3. ✅ Test video upload
4. ✅ Verificeer functionaliteit

**De video upload zou nu moeten werken!** 🎥✅
