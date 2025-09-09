# Mollie Live Key Setup voor Echte Betalingen

## 🎯 Basic Tier - Echte Mollie Betaling (€49)

De Basic Tier pagina is nu geconfigureerd voor echte Mollie betalingen. Hier is hoe je de live key instelt:

## 📋 Stappen om Live Key te Configureren:

### 1. Mollie Dashboard
1. Ga naar [Mollie Dashboard](https://www.mollie.com/dashboard)
2. Log in met je Mollie account
3. Ga naar **Website Profiles** → **API Keys**

### 2. Live Key Ophalen
1. Selecteer je **Live** website profile
2. Kopieer de **Live API Key** (begint met `live_`)
3. **⚠️ BELANGRIJK**: Live keys zijn voor echte betalingen met echte geld!

### 3. Environment Variable Toevoegen
Voeg de volgende variabele toe aan je environment:

```bash
# Voor echte betalingen (LIVE)
MOLLIE_LIVE_KEY=live_your_actual_live_key_here

# Voor test betalingen (TEST)
MOLLIE_TEST_KEY=test_your_test_key_here
```

### 4. Vercel Deployment (Productie)
Als je deployed naar Vercel:
1. Ga naar Vercel Dashboard → Your Project → Settings → Environment Variables
2. Voeg toe: `MOLLIE_LIVE_KEY` met je echte live key
3. Deploy opnieuw

## 🔧 Huidige Configuratie:

- **Basic Tier Prijs**: €49 (minimaal 6 maanden)
- **Payment API**: `/api/payments/create-payment`
- **Mollie Integration**: Volledig geïntegreerd
- **Webhook**: `/api/payments/webhook`
- **Redirect**: Na betaling terug naar success pagina

## 🧪 Test vs Live:

### Test Mode (MOLLIE_TEST_KEY):
- Geen echte betalingen
- Test bedragen
- Geen echte geld transacties

### Live Mode (MOLLIE_LIVE_KEY):
- **ECHTE BETALINGEN**
- **ECHT GELD**
- Echte iDEAL, creditcard, etc.

## ⚠️ Waarschuwingen:

1. **Live keys = Echte geld!** Test altijd eerst met test keys
2. **€49 is de productie prijs** - minimaal 6 maanden commitment
3. **Webhook URL** moet publiek toegankelijk zijn voor Mollie
4. **SSL/HTTPS** vereist voor productie

## 🚀 Na Setup:

1. Start development server: `npm run dev`
2. Ga naar: `http://localhost:3000/pakketten/basic-tier`
3. Klik "Start je transformatie"
4. Je wordt doorgestuurd naar echte Mollie checkout
5. Test betaling van €49 met echte betaalmethode

## 📞 Support:

- Mollie Support: https://help.mollie.com/
- Mollie API Docs: https://docs.mollie.com/
- Test Cards: https://docs.mollie.com/payments/testing

---

**Status**: ✅ Klaar voor echte Mollie betalingen
**Volgende stap**: Voeg MOLLIE_LIVE_KEY toe aan environment variables
