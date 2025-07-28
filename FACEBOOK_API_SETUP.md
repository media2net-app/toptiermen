# Facebook Ad Library API Setup

## Overzicht
Deze integratie maakt het mogelijk om automatisch Facebook advertenties van concurenten op te halen en te analyseren in het marketing dashboard.

## Vereisten

### 1. Facebook Developer Account
- Ga naar [Facebook for Developers](https://developers.facebook.com/)
- Maak een nieuwe app aan of gebruik een bestaande
- Vraag toegang aan tot de **Ad Library API**

### 2. API Toegang
- **App ID** en **App Secret** van je Facebook app
- **Access Token** met de juiste permissions
- Goedkeuring van Facebook voor Ad Library API gebruik

## Configuratie

### 1. Environment Variables
Voeg de volgende variabelen toe aan je `.env.local` bestand:

```env
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
```

### 2. Access Token Genereren
1. Ga naar [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Selecteer je app
3. Voeg de volgende permissions toe:
   - `ads_read`
   - `ads_management`
4. Genereer een access token

### 3. API Permissions
Zorg ervoor dat je app de volgende permissions heeft:
- **Ad Library API** toegang
- **Ads Read** permission
- **Business Management** access (indien nodig)

## Gebruik

### Automatische Import
1. Ga naar de **Concurentie** pagina in het marketing dashboard
2. Klik op de **Globe** icoon naast een concurent
3. Het systeem zoekt automatisch naar Facebook advertenties
4. Gevonden advertenties worden geïmporteerd en getoond

### API Endpoints

#### GET `/api/marketing/facebook-ads`
Parameters:
- `competitor`: Naam van de concurent
- `country`: Land code (default: NL)
- `days`: Aantal dagen terug (default: 30)
- `pageIds`: Comma-separated lijst van Facebook page IDs

#### POST `/api/marketing/facebook-ads`
Body:
```json
{
  "competitorName": "FitnessPro Nederland",
  "country": "NL",
  "pageIds": ["123456789", "987654321"]
}
```

## Beperkingen

### Facebook API Limieten
- **Rate limiting**: Facebook heeft strikte rate limits
- **Data beschikbaarheid**: Niet alle advertenties zijn zichtbaar
- **Geografische beperkingen**: Sommige data is land-specifiek

### Privacy & Compliance
- **GDPR compliance**: Zorg voor juiste data handling
- **Facebook Terms**: Volg Facebook's gebruiksvoorwaarden
- **Data retention**: Implementeer juiste data retention policies

## Troubleshooting

### Veelvoorkomende Problemen

1. **"API not configured" error**
   - Controleer of `FACEBOOK_ACCESS_TOKEN` is ingesteld
   - Verifieer dat de token geldig is

2. **"No ads found"**
   - Controleer of de concurent naam correct is
   - Verifieer of er actieve advertenties zijn
   - Controleer geografische instellingen

3. **Rate limiting errors**
   - Implementeer exponential backoff
   - Cache resultaten waar mogelijk
   - Respecteer Facebook's rate limits

### Debug Tips
- Controleer de browser console voor errors
- Verifieer API responses in Network tab
- Test API calls direct in Graph API Explorer

## Veiligheid

### Best Practices
- **Never expose access tokens** in client-side code
- **Use environment variables** voor alle API keys
- **Implement proper error handling**
- **Log API usage** voor monitoring
- **Regular token rotation** voor security

### Data Protection
- **Encrypt sensitive data** in transit en at rest
- **Implement access controls** voor API endpoints
- **Regular security audits** van API usage
- **Compliance monitoring** voor GDPR/privacy laws

## Toekomstige Uitbreidingen

### Mogelijke Features
- **Instagram Ads** integratie
- **Google Ads** API integratie
- **LinkedIn Ads** monitoring
- **Automatische rapportage**
- **Competitive analysis** dashboards
- **Alert system** voor nieuwe ads

### Performance Optimalisatie
- **Caching layer** voor API responses
- **Background jobs** voor data sync
- **Incremental updates** in plaats van full sync
- **Data aggregation** voor analytics 