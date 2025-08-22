# Facebook Video Ads Setup Instructions

## Handmatige Setup van Video Advertenties in Facebook Ads Manager

Da de Facebook Marketing API beperkingen heeft voor video upload van externe URLs, moet de video setup handmatig worden gedaan in Facebook Ads Manager.

### Stap 1: Toegang tot Facebook Ads Manager
1. Ga naar https://business.facebook.com/adsmanager
2. Selecteer Ad Account: **Top Tier Men ADS** (ID: 1465834431278978)

### Stap 2: Campagnes en Ad Sets zijn al aangemaakt
✅ **4 Campagnes**: TTM - Algemeen, Jongeren, Vaders, Zakelijk
✅ **11 Ad Sets**: Per campagne verschillende targeting
✅ **11 Ads**: Basis ads met Google links (moet worden vervangen)

### Stap 3: Update elke Ad met Video Content

#### Voor elke Ad:
1. Klik op de Ad naam
2. Ga naar "Creative" sectie
3. Klik "Edit"
4. Selecteer "Video" als creative type
5. Upload de juiste video (zie mapping hieronder)
6. Stel in:
   - **Primary Text**: "Transform jezelf met Top Tier Men"
   - **Headline**: "Ontdek Top Tier Men - [Target Audience]"
   - **Description**: "Join de community van mannen die hun leven transformeren"
   - **Call to Action**: "Learn More"
   - **Website URL**: https://platform.toptiermen.eu/prelaunch

### Stap 4: Video Mapping per Ad

#### Zakelijk Ads:
- **TTM - Zakelijk - Entrepreneurs & Leaders**: `TTM_Zakelijk_Prelaunch_Reel_01_V2.mov`
- **TTM - Zakelijk - Business Professionals**: `TTM_Zakelijk_Prelaunch_Reel_02_V2.mov`

#### Vaders Ads:
- **TTM - Vaders - Role Model & Success**: `TTM_Vader_Prelaunch_Reel_01_V2.mov`
- **TTM - Vaders - Family & Leadership**: `TTM_Vader_Prelaunch_Reel_02_V2.mov`

#### Jongeren Ads:
- **TTM - Jongeren - Social & Community**: `TTM_Jeugd_Prelaunch_Reel_01_V2.mov`
- **TTM - Jongeren - Fitness & Lifestyle**: `TTM_Jeugd_Prelaunch_Reel_02_V2.mov`

#### Algemeen Ads (5 ads):
- **TTM - Algemeen - Custom Audience**: `TTM_Het_Merk_Prelaunch_Reel_01_V2.mov`
- **TTM - Algemeen - Retargeting**: `TTM_Het_Merk_Prelaunch_Reel_02_V2.mov`
- **TTM - Algemeen - Lookalike**: `TTM_Het_Merk_Prelaunch_Reel_03_V2.mov`
- **TTM - Algemeen - Interest Based**: `TTM_Het_Merk_Prelaunch_Reel_04_V2.mov`
- **TTM - Algemeen - Awareness**: `TTM_Het_Merk_Prelaunch_Reel_01_V2.mov`

### Stap 5: Video Bestanden Locatie
Videos zijn beschikbaar via:
- **Supabase Storage**: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/
- **Dashboard**: http://localhost:3000/dashboard-marketing/advertentie-materiaal

### Stap 6: Test en Activatie
1. Controleer elke ad preview
2. Zet status van **PAUSED** naar **ACTIVE** wanneer klaar
3. Monitor performance in dashboard: http://localhost:3000/dashboard-marketing

### Stap 7: Verificatie
Na setup controleren in:
- **Facebook Ads Manager**: Ads tonen video content
- **Marketing Dashboard**: http://localhost:3000/dashboard-marketing/advertenties
- **API Test**: `curl "http://localhost:3000/api/facebook/get-ads"`

## Veelgestelde Vragen

### Q: Waarom kunnen we videos niet automatisch uploaden?
A: Facebook Marketing API heeft rate limits en timeouts voor video uploads van externe URLs. Handmatige upload via Ads Manager is betrouwbaarder.

### Q: Kan ik de video mapping aanpassen?
A: Ja, pas de mapping aan in `src/app/api/facebook/get-ads/route.ts` functie `getVideoForAdName()`.

### Q: Hoe monitor ik performance?
A: Gebruik het marketing dashboard op http://localhost:3000/dashboard-marketing voor real-time Facebook data.
