# Google Analytics API Setup Guide

## 📊 Huidige Status
De Google Analytics dashboard toont nu **realistische fallback data** met een duidelijke indicator wanneer de echte API niet beschikbaar is.

## 🔧 Echte Google Analytics API Configuratie

### Stap 1: Google Cloud Console Setup
1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project aan of selecteer een bestaand project
3. Enable de **Google Analytics Data API v1**

### Stap 2: Service Account Aanmaken
1. Ga naar **IAM & Admin** > **Service Accounts**
2. Klik op **Create Service Account**
3. Geef een naam: `google-analytics-api`
4. Klik op **Create and Continue**
5. Geef de rol: **Viewer** voor Google Analytics
6. Klik op **Done**

### Stap 3: Service Account Key Downloaden
1. Klik op de service account die je net hebt aangemaakt
2. Ga naar **Keys** tab
3. Klik op **Add Key** > **Create new key**
4. Selecteer **JSON**
5. Download het bestand en hernoem naar `google-analytics-key.json`

### Stap 4: Google Analytics Property ID
1. Ga naar [Google Analytics](https://analytics.google.com/)
2. Selecteer je property
3. Ga naar **Admin** > **Property Settings**
4. Kopieer de **Property ID** (begint met G-)

### Stap 5: Environment Variables
Voeg deze variabelen toe aan je `.env.local`:

```env
# Google Analytics Configuration
GA_PROPERTY_ID=G-YOUR_PROPERTY_ID_HERE
GOOGLE_APPLICATION_CREDENTIALS=./google-analytics-key.json
```

### Stap 6: Service Account Toegang Verlenen
1. Ga naar Google Analytics > **Admin** > **Property** > **Property Access Management**
2. Klik op **+** om een gebruiker toe te voegen
3. Voeg het service account email toe: `google-analytics-api@your-project.iam.gserviceaccount.com`
4. Geef **Viewer** rechten

## ✅ Resultaat
Na configuratie zal de dashboard:
- **Groene indicator** tonen: "Google Analytics API"
- **Echte live data** ophalen uit je Google Analytics account
- **Real-time active users** tonen
- **Historische data** voor verschillende tijdsperioden

## 🔄 Fallback Functionaliteit
Als de API niet beschikbaar is:
- **Gele indicator** toont: "Fallback Data (API unavailable)"
- **Realistische mock data** wordt getoond
- **Dashboard blijft functioneel**

## 📈 Beschikbare Metrics
- **Real-time:** Actieve gebruikers
- **Historisch:** Totaal gebruikers, page views, bounce rate
- **Sessie data:** Sessie duur, nieuwe vs terugkerende gebruikers
- **Top pagina's:** Meest bezochte pagina's
- **Traffic sources:** Direct, Google, Social Media, etc.
- **Device breakdown:** Desktop, Mobile, Tablet

## 🚨 Troubleshooting
- **"API unavailable"**: Controleer credentials en property ID
- **"No data"**: Controleer service account rechten in Google Analytics
- **"Authentication error"**: Controleer JSON key bestand pad
