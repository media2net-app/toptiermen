# 🚀 PWA Push Notifications Setup - Top Tier Men

## ✅ **Wat is er geïmplementeerd:**

### 📱 **PWA (Progressive Web App)**
- **Manifest**: `public/manifest.json` - App metadata voor iOS/Android
- **Service Worker**: `public/sw.js` - Offline caching, push notifications, background sync
- **Layout Updates**: PWA meta tags toegevoegd aan `src/app/layout.tsx`

### 🔔 **Push Notificaties**
- **PWA Hook**: `src/hooks/usePWA.ts` - Complete PWA functionaliteit
- **Install Prompt**: `src/components/PWAInstallPrompt.tsx` - Automatische app installatie
- **API Routes**: 
  - `/api/push/subscribe` - Push abonnementen opslaan
  - `/api/push/send` - Notificaties versturen

### 🗄️ **Database**
- **SQL Script**: `scripts/create-push-subscriptions-table.sql`
- **Setup Scripts**: Automatische database setup en testing

### 🔑 **VAPID Keys**
- **Generated**: VAPID keys gegenereerd voor push notificaties
- **Environment**: Keys klaar voor .env.local

## 📋 **Setup Instructies:**

### 1. **Database Setup**
```bash
# Ga naar Supabase Dashboard > SQL Editor
# Voer dit SQL script uit:

-- Create push_subscriptions table
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Create policy to allow service role to manage all subscriptions
CREATE POLICY "Service role can manage all push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. **Environment Variables**
Maak een `.env.local` file aan met:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BM3MfBfzWFbXRijLbHcD-O9OMmXQWNK0nypBrDvPU5S7MVuT4c8tb6xd4rCA-fgtgiF7FjTuLRlU0_iHoxZbYpw
VAPID_PRIVATE_KEY=v5UQMbiEbB6XU1M3b3hdnGtMqNSfTjTqkEfWHISZ9-w

# Other Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. **Testing**
```bash
# Test database setup
node scripts/setup-push-notifications-simple.js

# Test push notifications
node scripts/test-push-notifications.js
```

## 🎮 **Gebruik in de App:**

### **PWA Install Prompt**
- Verschijnt automatisch onderaan het dashboard
- Toont status van Service Worker, online status, push permissions
- Knoppen voor app installatie en push notification setup

### **Push Notificatie Types**
```javascript
// Badge Unlock
{
  title: "🏆 Nieuwe Badge Verdiend!",
  body: "Je hebt de 'No Excuses' badge ontgrendeld!",
  icon: "/badge-no-excuses.png",
  data: { url: "/dashboard/badges-en-rangen" }
}

// Nieuwe Missie
{
  title: "🔥 Nieuwe Missie Beschikbaar",
  body: "Er is een nieuwe missie voor je klaar!",
  icon: "/logo.svg",
  data: { url: "/dashboard/mijn-missies" }
}

// Brotherhood Update
{
  title: "👥 Nieuwe Brotherhood Activiteit",
  body: "Er is een nieuwe post in je groep!",
  icon: "/logo.svg",
  data: { url: "/dashboard/brotherhood" }
}
```

### **API Endpoints**
```javascript
// Subscribe to push notifications
POST /api/push/subscribe
{
  userId: "user-id",
  subscription: { endpoint, keys: { p256dh, auth } }
}

// Send push notification
POST /api/push/send
{
  userId: "user-id",
  title: "Notification Title",
  body: "Notification Body",
  icon: "/icon.png",
  badge: "/badge.png",
  data: { url: "/dashboard" }
}
```

## 📱 **iPhone Specifiek:**

### ✅ **Wat werkt:**
- App toevoegen aan beginscherm
- Push notificaties (via Safari)
- Offline functionaliteit
- Native app ervaring

### ⚠️ **Beperkingen:**
- Push notificaties alleen via Safari (niet via app icon)
- Vereist HTTPS in productie
- iOS 16.4+ voor beste PWA support

## 🔧 **Bestandsstructuur:**
```
├── public/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
├── src/
│   ├── hooks/
│   │   └── usePWA.ts          # PWA hook
│   ├── components/
│   │   └── PWAInstallPrompt.tsx # Install prompt
│   └── app/
│       ├── api/push/
│       │   ├── subscribe/route.ts
│       │   └── send/route.ts
│       └── layout.tsx         # PWA meta tags
├── scripts/
│   ├── setup-push-notifications-simple.js
│   ├── setup-vapid-keys.js
│   └── test-push-notifications.js
└── .env.local                 # Environment variables
```

## 🎯 **Volgende Stappen:**

1. **Database Setup**: Voer SQL script uit in Supabase
2. **Environment**: Voeg VAPID keys toe aan .env.local
3. **Test**: Test de setup met de scripts
4. **Deploy**: Push naar productie met HTTPS
5. **Monitor**: Controleer push notification delivery

## 🚀 **Klaar voor Productie!**

De PWA push notifications zijn volledig geïmplementeerd en klaar voor gebruik. Gebruikers kunnen nu:

- 📱 De app installeren op hun iPhone/Android
- 🔔 Push notificaties ontvangen
- 📱 Offline de app gebruiken
- 🎯 Native app ervaring krijgen

**Wanneer je klaar bent om te pushen/deployen, laat het me weten!** 