# Google Analytics Setup voor Top Tier Men

## 📊 Service Account Credentials Ontvangen ✅

**Project ID**: `top-tier-men`  
**Service Account Email**: `google-analytics-api@top-tier-men.iam.gserviceaccount.com`  
**Status**: Credentials ontvangen en klaar voor implementatie

## 🔧 Setup Stappen

### 1. Environment Variables Configureren

Voeg de volgende environment variables toe aan je `.env.local` bestand:

```bash
# Google Analytics Service Account
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"top-tier-men","private_key_id":"[PRIVATE_KEY_ID]","private_key":"[PRIVATE_KEY]","client_email":"google-analytics-api@top-tier-men.iam.gserviceaccount.com","client_id":"[CLIENT_ID]","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/google-analytics-api%40top-tier-men.iam.gserviceaccount.com","universe_domain":"googleapis.com"}

# Google Analytics Property ID
GA_PROPERTY_ID=501630208

# Google Analytics Tracking ID (voor frontend)
NEXT_PUBLIC_GA_ID=G-YT2NR1LKHX
```

### 2. Google Analytics Interface Configuratie

#### **Stap 1: Service Account Toegang Verlenen**
1. Ga naar [Google Analytics](https://analytics.google.com/)
2. Selecteer je property: **Top Tier Men**
3. Ga naar **Admin** (tandwiel icoon onderaan links)
4. Klik op **Property Access Management** (onder Property kolom)
5. Klik op **+** om een gebruiker toe te voegen
6. Voeg het service account email toe: `google-analytics-api@top-tier-men.iam.gserviceaccount.com`
7. Geef **Viewer** rechten
8. Klik op **Add**

#### **Stap 2: Data Stream Verificatie**
1. Ga naar **Admin** > **Data Streams**
2. Controleer of de data stream voor `https://platform.toptiermen.eu` actief is
3. Kopieer de **Measurement ID** (begint met G-)
4. Verifieer dat deze overeenkomt met `G-YT2NR1LKHX`

#### **Stap 3: Enhanced Measurement Instellen**
1. Klik op je data stream
2. Scroll naar **Enhanced Measurement**
3. Zorg dat deze opties aan staan:
   - ✅ **Page views**
   - ✅ **Scrolls**
   - ✅ **Outbound clicks**
   - ✅ **Site search**
   - ✅ **Video engagement**
   - ✅ **File downloads**

#### **Stap 4: Custom Events Configureren**
1. Ga naar **Admin** > **Events**
2. Klik op **Create Event**
3. Maak events aan voor prelaunch tracking:
   - **Event Name**: `prelaunch_form_interaction`
   - **Matching Condition**: Page path contains `/prelaunch`
   - **Parameter**: `form_field` (voor email/naam velden)

#### **Stap 5: Conversion Tracking**
1. Ga naar **Admin** > **Conversions**
2. Klik op **New conversion event**
3. Maak een event aan:
   - **Event name**: `lead_submission`
   - **Event scope**: Event
   - **Description**: Prelaunch lead form submission

### 3. Google Analytics API Configuratie

De service account heeft toegang tot de volgende Google Analytics API's:
- **Google Analytics Data API v1** (GA4)
- **Google Analytics Admin API v1**
- **Google Analytics Reporting API v4**

### 3. Property ID Verificatie

**GA4 Property ID**: `G-YT2NR1LKHX`  
**Website**: `https://platform.toptiermen.eu`  
**Tracking Status**: ✅ Actief

## 🚀 Implementatie Status

### ✅ Voltooid:
- [x] Service account credentials ontvangen
- [x] Google Analytics tracking geïmplementeerd
- [x] Prelaunch analytics pagina gemaakt
- [x] Real-time data integratie voorbereid

### 🔄 In Progress:
- [ ] Environment variables configureren
- [ ] Google Analytics API koppeling testen
- [ ] Real-time data implementeren

### 📋 Volgende Stappen:
1. Environment variables toevoegen aan `.env.local`
2. Google Analytics API testen
3. Real-time data implementeren in prelaunch analytics
4. Demografie data toevoegen

## 🔐 Security Notes

⚠️ **BELANGRIJK**: 
- De service account credentials zijn gevoelige informatie
- Bewaar deze veilig en deel ze niet
- Gebruik environment variables voor productie
- Rotate credentials regelmatig

## 📊 Beschikbare Metrics

Met de Google Analytics API kunnen we de volgende data ophalen:

### Real-time Data:
- Actieve gebruikers
- Page views per minuut
- Top pagina's
- Traffic sources

### Historische Data:
- Gebruikers en sessies
- Page views en bounce rate
- Traffic sources breakdown
- Device en browser data
- Geografische data
- Demografie (leeftijd, geslacht)
- Interests en affinities

### E-commerce Data:
- Conversies en revenue
- Product performance
- Shopping behavior
- Checkout funnel

## 🎯 Prelaunch Specifieke Metrics

Voor de prelaunch pagina kunnen we tracken:
- **Conversie funnel**: Bezoek → Scroll → Form interactie → Lead
- **Traffic sources**: Facebook Ads vs organisch vs direct
- **Device breakdown**: Mobile vs desktop performance
- **Geografische data**: Nederlandse vs internationale bezoekers
- **Demografie**: Leeftijd en geslacht van bezoekers
- **Behavior flow**: Hoe gebruikers door de pagina navigeren

---

**Laatste update**: 24 augustus 2025  
**Status**: Service account credentials ontvangen, klaar voor implementatie
