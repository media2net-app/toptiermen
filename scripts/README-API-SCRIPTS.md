# Facebook API Advertentie Scripts

Deze scripts maken het mogelijk om Facebook advertenties programmatisch aan te maken via de Facebook Graph API.

## 📋 Vereisten

1. **Facebook Access Token** met `ads_management` permissie
2. **Facebook Ad Account ID**
3. **Facebook Page ID** (voor creatives)
4. **Lead Form ID** (voor LEADS campagnes)

## 🔧 Setup

1. Zorg ervoor dat je `.env.local` bestand de volgende variabelen bevat:
```env
FACEBOOK_ACCESS_TOKEN=your_access_token_here
FACEBOOK_AD_ACCOUNT_ID=your_ad_account_id_here
```

2. Installeer dependencies:
```bash
npm install
```

## 📁 Beschikbare Scripts

### 1. `api-create-campaign.js`
Maakt een Facebook campagne aan.

**Gebruik:**
```bash
node scripts/api-create-campaign.js
```

**Configuratie:**
```javascript
const campaignConfig = {
  name: 'TTM - API Test Campagne',
  objective: 'OUTCOME_LEADS', // of OUTCOME_TRAFFIC, OUTCOME_ENGAGEMENT, etc.
  status: 'PAUSED',
  daily_budget: 5000, // €50 (in centen)
  bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
};
```

### 2. `api-create-adset.js`
Maakt een Facebook advertentieset aan.

**Gebruik:**
```bash
node scripts/api-create-adset.js <CAMPAIGN_ID>
```

       **Configuratie:**
       ```javascript
       const adSetConfig = {
         name: 'TTM - API Test Ad Set',
         status: 'PAUSED',
         daily_budget: 5000,
         billing_event: 'IMPRESSIONS',
         optimization_goal: 'LEADS',
         targeting: {
           age_min: 25,
           age_max: 45,
           genders: [1], // 1 = male (Top Tier Men richt zich exclusief op mannen)
    geo_locations: {
      countries: ['NL'],
      location_types: ['home']
    },
    interests: [
      { id: '6002714396372', name: 'Fitness' },
      { id: '6002714396373', name: 'Personal development' }
    ]
  }
};
```

### 3. `api-create-ad.js`
Maakt een Facebook advertentie aan (inclusief creative).

**Gebruik:**
```bash
node scripts/api-create-ad.js <ADSET_ID>
```

**Configuratie:**
```javascript
const adConfig = {
  name: 'TTM - API Test Ad',
  status: 'PAUSED',
  creative: {
    name: 'TTM - API Test Creative',
    title: 'Word een Top Tier Man',
    body: 'Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk.',
    object_story_spec: {
      page_id: 'YOUR_PAGE_ID', // Vervang met echte Page ID
      link_data: {
        link: 'https://platform.toptiermen.eu/prelaunch',
        message: 'Schrijf je in voor de wachtlijst'
      }
    }
  }
};
```

### 4. `api-complete-workflow.js`
Maakt een complete advertentie workflow aan: Campagne → Advertentieset → Creative → Advertentie.

**Gebruik:**
```bash
node scripts/api-complete-workflow.js
```

## 🎯 Beschikbare Campagne Doelen

- `OUTCOME_LEADS` - Lead generatie
- `OUTCOME_TRAFFIC` - Website verkeer
- `OUTCOME_ENGAGEMENT` - Betrokkenheid
- `OUTCOME_AWARENESS` - Bewustwording
- `OUTCOME_SALES` - Verkoop

## 🎯 Beschikbare Optimalisatie Doelen

- `LEADS` - Voor lead generatie campagnes
- `LINK_CLICKS` - Voor traffic campagnes
- `POST_ENGAGEMENT` - Voor engagement campagnes
- `REACH` - Voor awareness campagnes
- `CONVERSIONS` - Voor sales campagnes

## 🔧 Aanpassingen

### Campaign Configuratie Aanpassen
```javascript
const { createCampaign } = require('./api-create-campaign.js');

const customConfig = {
  name: 'Mijn Custom Campagne',
  objective: 'OUTCOME_TRAFFIC',
  daily_budget: 10000 // €100
};

createCampaign(customConfig);
```

### Ad Set Targeting Aanpassen
```javascript
const { createAdSet } = require('./api-create-adset.js');

const customTargeting = {
  targeting: {
    age_min: 18,
    age_max: 35,
    geo_locations: {
      countries: ['NL', 'BE'],
      location_types: ['home', 'recent']
    },
    interests: [
      { id: '6002714396372', name: 'Fitness' }
    ]
  }
};

createAdSet('CAMPAIGN_ID', customTargeting);
```

### Ad Creative Aanpassen
```javascript
const { createAd } = require('./api-create-ad.js');

const customCreative = {
  creative: {
    title: 'Mijn Custom Titel',
    body: 'Mijn custom beschrijving',
    object_story_spec: {
      page_id: 'YOUR_PAGE_ID',
      link_data: {
        link: 'https://mijnwebsite.nl',
        message: 'Mijn custom message'
      }
    }
  }
};

createAd('ADSET_ID', customCreative);
```

## 🚨 Belangrijke Opmerkingen

1. **Page ID**: Vervang altijd `YOUR_PAGE_ID` met je echte Facebook Page ID
2. **Lead Form ID**: Voor LEADS campagnes heb je een lead formulier ID nodig
3. **Permissions**: Zorg ervoor dat je access token de juiste permissies heeft
4. **Budget**: Budgets worden in centen opgegeven (5000 = €50)
5. **Status**: Nieuwe campagnes worden standaard op PAUSED gezet

## 🔗 Handige Links

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis/)
- [Campaign Objectives](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/objective)
- [Targeting Options](https://developers.facebook.com/docs/marketing-api/targeting)

## 📊 Monitoring

Na het aanmaken van advertenties kun je de prestaties monitoren via:
- Facebook Ads Manager
- Facebook Analytics
- Custom reporting via de API

## 🛠 Troubleshooting

### Veelvoorkomende Fouten

1. **"Missing permissions"**: Controleer je access token permissies
2. **"Object does not exist"**: Controleer of alle IDs correct zijn
3. **"Invalid targeting"**: Controleer je targeting configuratie
4. **"Budget too low"**: Verhoog het dagelijkse budget

### Debug Tips

1. Controleer altijd de response van de API
2. Gebruik de Facebook Graph API Explorer voor testing
3. Controleer je access token in de Facebook Developer Console
4. Verifieer alle IDs in Facebook Business Manager
