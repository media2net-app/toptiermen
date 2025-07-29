# 🔄 Complete Supabase naar Prisma Migratie Guide

## 📋 Overzicht

Deze guide helpt je om je applicatie volledig te migreren van Supabase naar Prisma, inclusief:
- 🔐 Authenticatie (Supabase Auth → NextAuth.js)
- 🗄️ Database (Supabase Database → Prisma)
- 📁 File Storage (Supabase Storage → Vercel Blob)
- 🔒 Security (RLS → Prisma Middleware)
- 📧 Real-time (Supabase Real-time → WebSockets)

## 🚀 Stap 1: Environment Variables

### 1.1 Vercel Blob Storage Setup
1. Ga naar je Vercel Dashboard
2. Ga naar Storage → Create Store
3. Kies "Blob Store"
4. Kopieer de `BLOB_READ_WRITE_TOKEN`

### 1.2 Environment Variables
Voeg deze toe aan je `.env.local`:

```env
# Database
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your-blob-token-here"

# Keep Supabase for migration (remove after)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-key"
```

## 🗄️ Stap 2: Database Schema

### 2.1 Update Prisma Schema
Het schema is al bijgewerkt met:
- Password veld voor authenticatie
- Alle bestaande tabellen
- Correcte relaties

### 2.2 Push Schema naar Database
```bash
npx prisma db push
npx prisma generate
```

## 🔐 Stap 3: Authenticatie Setup

### 3.1 NextAuth.js Configuratie
- ✅ NextAuth API route: `/api/auth/[...nextauth]/route.ts`
- ✅ Registratie API: `/api/auth/register/route.ts`
- ✅ User API: `/api/users/[id]/route.ts`
- ✅ Type definitions: `/types/next-auth.d.ts`

### 3.2 Update Providers
Vervang `AuthProvider` door `NextAuthProvider` in je layout:

```tsx
// src/app/layout.tsx
import { NextAuthProvider } from '@/contexts/NextAuthContext';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <NextAuthProvider>
            {children}
          </NextAuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

## 📁 Stap 4: File Storage

### 4.1 Vercel Blob Setup
- ✅ Blob upload API: `/api/upload/blob/route.ts`
- ✅ BlobImageUpload component: `/components/BlobImageUpload.tsx`

### 4.2 Vervang Components
Vervang alle `ImageUpload` componenten door `BlobImageUpload`:

```tsx
// Oud
import ImageUpload from '@/components/ImageUpload';

// Nieuw
import BlobImageUpload from '@/components/BlobImageUpload';
```

## 🔄 Stap 5: Data Migratie

### 5.1 Database Migratie
```bash
# Migreer alle data van Supabase naar Prisma
node scripts/migrate-supabase-to-prisma.js
```

### 5.2 File Storage Migratie
```bash
# Migreer bestanden van Supabase Storage naar Vercel Blob
node scripts/migrate-storage-to-blob.js
```

## 🔧 Stap 6: Code Updates

### 6.1 Vervang Supabase Imports
Zoek en vervang alle Supabase imports:

```tsx
// Oud
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Nieuw
import { useNextAuth } from '@/contexts/NextAuthContext';
```

### 6.2 Update API Routes
Vervang alle Supabase API routes door Prisma routes:

```tsx
// Oud
import { supabase } from '@/lib/supabase-admin';

// Nieuw
import { prisma } from '@/lib/prisma';
```

### 6.3 Update Components
Update alle componenten die Supabase gebruiken:

```tsx
// Oud
const { user, signIn, signOut } = useAuth();

// Nieuw
const { user, signIn, signOut } = useNextAuth();
```

## 🧪 Stap 7: Testing

### 7.1 Test Authenticatie
1. Test registratie: `http://localhost:3000/register`
2. Test login: `http://localhost:3000/login`
3. Test logout functionaliteit

### 7.2 Test File Uploads
1. Test image uploads
2. Test file deletions
3. Verifieer dat bestanden correct worden opgeslagen

### 7.3 Test Database Operations
1. Test CRUD operaties
2. Test relaties tussen tabellen
3. Verifieer data integriteit

## 🚀 Stap 8: Deployment

### 8.1 Vercel Environment Variables
Voeg deze toe aan je Vercel project:

```env
DATABASE_URL="prisma+postgres://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
BLOB_READ_WRITE_TOKEN="your-blob-token"
```

### 8.2 Deploy
```bash
git add .
git commit -m "Complete Supabase to Prisma migration"
git push origin main
```

## 🧹 Stap 9: Cleanup

### 9.1 Verwijder Supabase Dependencies
```bash
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-shared
```

### 9.2 Verwijder Supabase Files
- Verwijder `src/lib/supabase.ts`
- Verwijder `src/lib/supabase-admin.ts`
- Verwijder `src/contexts/AuthContext.tsx`
- Verwijder `src/components/ImageUpload.tsx`

### 9.3 Update Environment Variables
Verwijder Supabase environment variables:
```env
# Verwijder deze
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## 📊 Migratie Checklist

### ✅ Database
- [ ] Prisma schema bijgewerkt
- [ ] Database gepusht
- [ ] Data gemigreerd
- [ ] Relaties getest

### ✅ Authenticatie
- [ ] NextAuth.js geconfigureerd
- [ ] Registratie API werkend
- [ ] Login/logout werkend
- [ ] Session management werkend

### ✅ File Storage
- [ ] Vercel Blob geconfigureerd
- [ ] Upload API werkend
- [ ] Files gemigreerd
- [ ] Components bijgewerkt

### ✅ Code Updates
- [ ] Imports bijgewerkt
- [ ] Components gemigreerd
- [ ] API routes bijgewerkt
- [ ] Types bijgewerkt

### ✅ Testing
- [ ] Authenticatie getest
- [ ] File uploads getest
- [ ] Database operaties getest
- [ ] Performance getest

### ✅ Deployment
- [ ] Environment variables geconfigureerd
- [ ] Gedeployed naar Vercel
- [ ] Live testing gedaan
- [ ] Monitoring ingesteld

## 🆘 Troubleshooting

### Probleem: NextAuth werkt niet
**Oplossing:**
1. Controleer `NEXTAUTH_SECRET` en `NEXTAUTH_URL`
2. Verifieer dat de database connectie werkt
3. Check de browser console voor errors

### Probleem: File uploads falen
**Oplossing:**
1. Controleer `BLOB_READ_WRITE_TOKEN`
2. Verifieer dat de upload API route correct is
3. Check file size limits

### Probleem: Database connectie faalt
**Oplossing:**
1. Controleer `DATABASE_URL`
2. Verifieer dat Prisma Client gegenereerd is
3. Check database permissions

## 🎉 Succes!

Na het voltooien van deze migratie heb je:
- ✅ Moderne Prisma database
- ✅ Veilige NextAuth.js authenticatie
- ✅ Snelle Vercel Blob storage
- ✅ Betere performance
- ✅ Eenvoudigere deployment
- ✅ Minder dependencies

Je applicatie is nu volledig gemigreerd van Supabase naar Prisma! 🚀 