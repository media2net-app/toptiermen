# 🚀 Vercel Analytics & Speed Insights Setup

## 📋 **Environment Variables Instellen**

Voeg deze variabelen toe aan je `.env.local` bestand:

```bash
# Vercel Analytics & Speed Insights
VERCEL_TOKEN=your_vercel_token_here
VERCEL_PROJECT_ID=your_project_id_here
```

## 🔑 **Vercel Token Ophalen**

1. **Ga naar [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Klik op je profiel (rechtsboven)**
3. **Ga naar "Settings"**
4. **Klik op "Tokens"**
5. **Maak een nieuwe token aan** met de naam "Top Tier Men Analytics"
6. **Kopieer de token** en plak deze in `VERCEL_TOKEN`

## 🆔 **Project ID Ophalen**

1. **Ga naar je project in Vercel Dashboard**
2. **Klik op "Settings"**
3. **Scroll naar "General"**
4. **Kopieer de "Project ID"** en plak deze in `VERCEL_PROJECT_ID`

## ✅ **Wat er nu beschikbaar is:**

### **Content Performance Tab:**
- **Vercel Analytics Widget** - Bezoekers, pagina views, bounce rate
- **Top pagina's, referrers, landen, apparaten**

### **Technical Performance Tab:**
- **Vercel Speed Insights Widget** - Core Web Vitals
- **Real Experience Score, CLS, FCP, LCP**
- **Performance per route en land**

### **Real-time Activiteit Tab:**
- **Vercel Analytics Widget** - Real-time data
- **Bezoekers trends en platform activiteit**

## 🎯 **Voordelen:**

1. **Real-time performance monitoring**
2. **Core Web Vitals tracking**
3. **Geografische performance analyse**
4. **Route-specifieke performance insights**
5. **Device en browser performance breakdown**

## 🔧 **Troubleshooting:**

- **Als je geen Vercel credentials hebt:** De widgets tonen mock data voor development
- **Als de API faalt:** Er wordt een error getoond met retry knop
- **Period selector:** Werkt met 7d, 30d, 90d (zoals in je dashboard)

## 🚀 **Volgende Stappen:**

1. **Voeg de environment variables toe**
2. **Herstart je development server**
3. **Test de nieuwe tabs in je admin dashboard**
4. **Geniet van real-time performance insights!**
