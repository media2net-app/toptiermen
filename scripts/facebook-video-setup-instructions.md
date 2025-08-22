# Facebook Video Ads Setup Instructions

## Handmatige Setup van Video Advertenties in Facebook Ads Manager

Da de Facebook Marketing API beperkingen heeft voor video upload van externe URLs, moet de video setup handmatig worden gedaan in Facebook Ads Manager.

### ✅ Videos zijn hernoemd naar Dashboard Titels

**Alle videos zijn succesvol hernoemd in de Supabase bucket:**
- **Algemeen**: `algemeen_01.mp4`, `algemeen_02.mp4`, `algemeen_03.mp4`, `algemeen_04.mp4`, `algemeen_05.mp4`
- **Jongeren**: `jongeren_01.mp4`, `jongeren_02.mp4`
- **Vaders**: `vaders_01.mp4`, `vaders_02.mp4`
- **Zakelijk**: `zakelijk_01.mp4`, `zakelijk_02.mp4`

### Stap 1: Toegang tot Facebook Ads Manager
1. Ga naar https://business.facebook.com/adsmanager
2. Selecteer Ad Account: **Top Tier Men ADS** (ID: 1465834431278978)

### Stap 2: Campagnes en Ad Sets zijn al aangemaakt
✅ **4 Campagnes**: TTM - Algemeen, Jongeren, Vaders, Zakelijk
✅ **11 Ad Sets**: Per campagne verschillende targeting
✅ **11 Ads**: Basis ads met Google links (moet worden vervangen)

### Stap 3: Video Upload naar Facebook

#### Voor elke Ad Set:
1. Ga naar **Ad Library** → **Videos**
2. Klik **"Upload Video"**
3. Upload de juiste video uit de lijst hieronder
4. Stel in:
   - **Title**: `TTM Video - [video_name]`
   - **Description**: `Top Tier Men advertisement video`
   - **Published**: `No` (voor nu)

### Stap 4: Video Mapping per Ad Set

#### Zakelijk Ads:
- **TTM - Zakelijk - Entrepreneurs & Leaders**: Upload `zakelijk_01.mp4`
- **TTM - Zakelijk - Business Professionals**: Upload `zakelijk_02.mp4`

#### Vaders Ads:
- **TTM - Vaders - Role Model & Success**: Upload `vaders_01.mp4`
- **TTM - Vaders - Family & Leadership**: Upload `vaders_02.mp4`

#### Jongeren Ads:
- **TTM - Jongeren - Social & Community**: Upload `jongeren_01.mp4`
- **TTM - Jongeren - Fitness & Lifestyle**: Upload `jongeren_02.mp4`

#### Algemeen Ads (5 ads):
- **TTM - Algemeen - Custom Audience**: Upload `algemeen_01.mp4`
- **TTM - Algemeen - Retargeting**: Upload `algemeen_02.mp4`
- **TTM - Algemeen - Lookalike**: Upload `algemeen_03.mp4`
- **TTM - Algemeen - Interest Based**: Upload `algemeen_04.mp4`
- **TTM - Algemeen - Awareness**: Upload `algemeen_05.mp4`

### Stap 5: Video Bestanden Downloaden

**Videos zijn beschikbaar via:**
- **Supabase Storage**: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/
- **Dashboard**: http://localhost:3000/dashboard-marketing/advertentie-materiaal

**Directe links per video:**
- `algemeen_01.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/algemeen_01.mp4
- `algemeen_02.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/algemeen_02.mp4
- `algemeen_03.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/algemeen_03.mp4
- `algemeen_04.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/algemeen_04.mp4
- `algemeen_05.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/algemeen_05.mp4
- `jongeren_01.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/jongeren_01.mp4
- `jongeren_02.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/jongeren_02.mp4
- `vaders_01.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/vaders_01.mp4
- `vaders_02.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/vaders_02.mp4
- `zakelijk_01.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/zakelijk_01.mp4
- `zakelijk_02.mp4`: https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/advertenties/zakelijk_02.mp4

### Stap 6: Update elke Ad met Video Content

#### Voor elke Ad:
1. Klik op de Ad naam
2. Ga naar "Creative" sectie
3. Klik "Edit"
4. Selecteer "Video" als creative type
5. Kies de geüploade video (zie mapping hierboven)
6. Stel in:
   - **Primary Text**: "Transform jezelf met Top Tier Men"
   - **Headline**: "Ontdek Top Tier Men - [Target Audience]"
   - **Description**: "Join de community van mannen die hun leven transformeren"
   - **Call to Action**: "Learn More"
   - **Website URL**: https://platform.toptiermen.eu/prelaunch

### Stap 7: Test en Activatie
1. Controleer elke ad preview
2. Zet status van **PAUSED** naar **ACTIVE** wanneer klaar
3. Monitor performance in dashboard: http://localhost:3000/dashboard-marketing

### Stap 8: Verificatie
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

### Q: Wat als een video niet uploadt?
A: Probeer de video eerst te downloaden en dan lokaal te uploaden via Facebook Ads Manager interface.

### Q: Hoe weet ik welke video bij welke ad hoort?
A: Gebruik de mapping in Stap 4. De video naam komt overeen met de ad set naam.
