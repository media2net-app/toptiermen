# 🚀 Vercel Deployment Guide - Top Tier Men

## 📋 **Stap 1: Vercel Project Setup**

### 1.1 **Import Project**
1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik op **"New Project"**
3. Import je GitHub repository: `toptiermen`
4. Selecteer de repository en klik **"Import"**

### 1.2 **Framework Detection**
- Vercel detecteert automatisch **Next.js**
- Build Command: `prisma generate && next build`
- Output Directory: `.next`
- Install Command: `npm install`

## 🔧 **Stap 2: Environment Variables Instellen**

### 2.0 **Prisma Accelerate Setup**
Je project gebruikt nu **Prisma Accelerate** voor optimale database performance:

```bash
# Install Prisma Accelerate extension
npm install @prisma/extension-accelerate
```

**Prisma Client configuratie:**
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())
```

### 2.1 **Database URL**
1. Ga naar je project in Vercel Dashboard
2. Klik op **"Settings"** → **"Environment Variables"**
3. Voeg toe:

```
Name: DATABASE_URL
Value: prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19DUWlrdv8xano1dTFaT1NPVHlPdFQiLCJhcGlfa2V5IjoiMDFLMUFEN0syWVg3WTRHUFpTNTNTUDNDSlYiLCJ0ZW5hbnRfaWQiOiI3OWY2ODI1YzRlMWMwMDYxY2ZiNDIzODJiZjFjMjU1MjA5ZDhhNjUwNzhjZDc0YjlkMzY5MDJiY2NlYTExOGVmIiwiaW50ZXJuYWxfc2VjcmV0IjoiMTkxNDlkMTktNzBkZi00NTgyLTkyY2EtYjM1NjM0ZTRjNmY2In0.MTbX6uugEweLry85QmbtUEdVZyjl1y2Hm3E_AW49Odo
Environment: Production, Preview, Development
```

### 2.2 **NextAuth Secret**
```
Name: NEXTAUTH_SECRET
Value: [GENERATE_NEW_SECRET]
Environment: Production, Preview, Development
```

**Genereer een nieuwe secret:**
```bash
openssl rand -base64 32
```

### 2.3 **NextAuth URL**
```
Name: NEXTAUTH_URL
Value: https://your-domain.vercel.app
Environment: Production, Preview, Development
```

**Voor development:**
```
Name: NEXTAUTH_URL
Value: http://localhost:3000
Environment: Development
```

## 🗄️ **Stap 3: Prisma Database Setup**

### 3.1 **Database Push**
```bash
# In je lokale project
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19DUWlrdv8xano1dTFaT1NPVHlPdFQiLCJhcGlfa2V5IjoiMDFLMUFEN0syWVg3WTRHUFpTNTNTUDNDSlYiLCJ0ZW5hbnRfaWQiOiI3OWY2ODI1YzRlMWMwMDYxY2ZiNDIzODJiZjFjMjU1MjA5ZDhhNjUwNzhjZDc0YjlkMzY5MDJiY2NlYTExOGVmIiwiaW50ZXJuYWxfc2VjcmV0IjoiMTkxNDlkMTktNzBkZi00NTgyLTkyY2EtYjM1NjM0ZTRjNmY2In0.MTbX6uugEweLry85QmbtUEdVZyjl1y2Hm3E_AW49Odo" npx prisma db push
```

### 3.2 **Seed Database**
```bash
node scripts/simple-migration.js
```

## 🚀 **Stap 4: Deploy**

### 4.1 **Automatic Deployment**
1. Commit en push je wijzigingen naar GitHub
2. Vercel deployt automatisch
3. Ga naar **"Deployments"** tab om de status te volgen

### 4.2 **Manual Deployment**
```bash
# Installeer Vercel CLI
npm i -g vercel

# Login en deploy
vercel login
vercel --prod
```

## 🔍 **Stap 5: Verify Deployment**

### 5.1 **Check Build Logs**
1. Ga naar **"Deployments"** in Vercel Dashboard
2. Klik op de laatste deployment
3. Controleer de build logs voor errors

### 5.2 **Test Database Connection**
```bash
# Test de live database
curl https://your-domain.vercel.app/api/test-live-db
```

### 5.3 **Test Login**
1. Ga naar `https://your-domain.vercel.app/login`
2. Test login met:
   - Email: `chiel@media2net.nl`
   - Password: `W4t3rk0k3r^`

## 🛠️ **Stap 6: Custom Domain (Optioneel)**

### 6.1 **Add Domain**
1. Ga naar **"Settings"** → **"Domains"**
2. Voeg je custom domain toe
3. Update DNS records volgens Vercel instructies

### 6.2 **Update NextAuth URL**
```
Name: NEXTAUTH_URL
Value: https://your-custom-domain.com
```

## 🔧 **Troubleshooting**

### **Build Errors**
```bash
# Check Prisma schema
npx prisma validate

# Regenerate Prisma client
npx prisma generate

# Check environment variables
vercel env ls
```

### **Database Connection Issues**
1. Controleer DATABASE_URL in Vercel
2. Test database connectie lokaal
3. Check Prisma Accelerate status

### **NextAuth Issues**
1. Controleer NEXTAUTH_SECRET
2. Update NEXTAUTH_URL voor nieuwe domain
3. Check browser console voor errors

## 📊 **Monitoring**

### **Vercel Analytics**
1. Ga naar **"Analytics"** tab
2. Monitor performance en errors
3. Check function logs

### **Database Monitoring**
1. Ga naar Prisma Dashboard
2. Monitor query performance
3. Check connection pool status

## ✅ **Success Checklist**

- [ ] Project geïmporteerd in Vercel
- [ ] Environment variables ingesteld
- [ ] Database schema gepusht
- [ ] Database geseed met data
- [ ] Build succesvol
- [ ] Login werkt
- [ ] Admin dashboard toegankelijk
- [ ] Custom domain geconfigureerd (optioneel)

## 🎉 **Je bent live!**

Je applicatie draait nu op Vercel met:
- ✅ **Prisma PostgreSQL** database
- ✅ **NextAuth.js** authenticatie
- ✅ **Automatic deployments** via GitHub
- ✅ **Global CDN** voor snelle laadtijden
- ✅ **SSL certificaten** automatisch

**URL:** `https://your-project.vercel.app` 