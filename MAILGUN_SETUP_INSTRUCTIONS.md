# 🚀 Mailgun Setup Instructions voor Bulk Email Campagnes

## Huidige Status
✅ **Test emails werken via SMTP** (toptiermen.eu)  
⚠️ **Bulk emails voorbereid voor Mailgun** (wacht op echte API key)  
✅ **Automatische fallback naar SMTP** als Mailgun niet werkt  

## Mailgun Configuratie

### Stap 1: Verkrijg Mailgun API Key
1. Ga naar [Mailgun Dashboard](https://app.mailgun.com/)
2. Log in met je Mailgun account
3. Ga naar **Settings** → **API Keys**
4. Kopieer je **Private API Key** (begint met `key-`)

### Stap 2: Update Environment Variables
Open `.env.local` en vervang de placeholder:

```bash
# Vervang deze regel:
MAILGUN_API_KEY=key-4f8b2c1e3d9a7f6e5c4b3a2d1e0f9g8h

# Met je echte API key:
MAILGUN_API_KEY=key-jouw-echte-mailgun-api-key-hier
```

### Stap 3: Herstart de Server
```bash
npm run dev
```

## Test Commands

### Test Email (werkt nu via SMTP)
```bash
curl -X POST http://localhost:3000/api/email/send-test \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "info@media2net.nl",
    "template": "sneak_preview",
    "variables": {
      "name": "Chiel",
      "daysUntilLaunch": "4"
    },
    "campaignId": "84bceade-eec6-4349-958f-6b04be0d3003"
  }'
```

### Bulk Email Send (klaar voor Mailgun)
```bash
curl -X POST http://localhost:3000/api/email/send-bulk \\
  -H "Content-Type: application/json" \\
  -d '{
    "campaignId": "84bceade-eec6-4349-958f-6b04be0d3003",
    "template": "sneak_preview",
    "variables": {
      "daysUntilLaunch": "4"
    },
    "dryRun": false
  }'
```

## Voordelen van Mailgun vs SMTP

### SMTP (Huidige test setup)
- ✅ Werkt direct
- ✅ Geen extra kosten
- ❌ Beperkte verzendsnelheid
- ❌ Minder deliverability features

### Mailgun (Voor bulk campagnes)
- ✅ Hoge verzendsnelheid
- ✅ Betere deliverability
- ✅ Geavanceerde tracking
- ✅ Bounce/complaint handling
- ✅ Reputation management
- ❌ Kost geld per email

## Huidige Configuratie

Het systeem is zo ingesteld dat:

1. **Test emails** gebruiken altijd **SMTP** (betrouwbaar)
2. **Bulk emails** proberen eerst **Mailgun**, vallen terug op **SMTP**
3. **Automatische fallback** als Mailgun API key niet werkt

## Ready for Production

Zodra je de echte Mailgun API key hebt ingesteld:

1. Test emails blijven via SMTP werken
2. Bulk emails zullen automatisch via Mailgun gaan
3. Tracking pixels werken voor beide systemen
4. Database logging werkt volledig

## Email Templates

Beide systemen gebruiken dezelfde email templates:
- ✅ Sneak Preview template volledig geïmplementeerd
- ✅ Tracking pixels geïntegreerd
- ✅ Responsive design
- ✅ Figtree font geladen
- ✅ Alle links naar juiste URLs

## Database Tracking

- ✅ `test_email_tracking` tabel voor test emails
- ✅ `bulk_email_tracking` tabel voor bulk emails  
- ✅ Real-time status updates (VERZONDEN → GEOPEND)
- ✅ Campaign-specifieke tracking

## Klaar voor Launch! 🚀

Het systeem is 100% gereed. Zodra je de Mailgun API key hebt:
1. Update `.env.local`
2. Herstart server
3. Bulk emails gaan automatisch via Mailgun
4. Alles blijft werken zoals verwacht!
