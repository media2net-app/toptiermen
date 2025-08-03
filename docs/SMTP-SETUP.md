# SMTP Setup voor Top Tier Men Platform

## 🎯 Overzicht

Dit document legt uit hoe je SMTP-instellingen configureert voor het Top Tier Men platform, zodat je e-mails kunt verzenden voor de pre-launch campagne.

## 📧 SMTP Configuratie

### 1. Admin Interface

Ga naar de admin instellingen:
- Navigeer naar `/dashboard-admin/instellingen`
- Klik op de "Email Instellingen" tab
- Scroll naar de "SMTP Configuratie" sectie

### 2. Vereiste Velden

- **SMTP Host**: De SMTP server hostname (bijv. `smtp.gmail.com`)
- **SMTP Port**: De poort voor de SMTP server (meestal 587 of 465)
- **SMTP Gebruikersnaam**: Je e-mailadres
- **SMTP Wachtwoord**: Je wachtwoord of app wachtwoord
- **Gebruik SSL/TLS**: Vink aan voor poort 465, uit voor poort 587

## 🔧 Populaire SMTP Providers

### Gmail
```
Host: smtp.gmail.com
Port: 587
Secure: false
Username: your-email@gmail.com
Password: App Password (niet je normale wachtwoord)
```

**App Password instellen:**
1. Ga naar [Google Account Security](https://myaccount.google.com/security)
2. Schakel 2-Step Verification in
3. Ga naar "App passwords"
4. Genereer een nieuwe app password voor "Mail"
5. Gebruik dit wachtwoord in de SMTP configuratie

### Outlook/Hotmail
```
Host: smtp-mail.outlook.com
Port: 587
Secure: false
Username: your-email@outlook.com
Password: Je normale Outlook wachtwoord
```

### Yahoo
```
Host: smtp.mail.yahoo.com
Port: 587
Secure: false
Username: your-email@yahoo.com
Password: App Password (niet je normale wachtwoord)
```

### ProtonMail
```
Host: 127.0.0.1
Port: 1025
Secure: false
Username: test@example.com
Password: test
```
*Voor development/testing doeleinden*

## 🧪 Testen van de Configuratie

### Via Admin Interface
1. Vul alle SMTP velden in
2. Klik op "Test SMTP Verbinding"
3. Controleer je inbox voor een test e-mail

### Via Script
```bash
# Update de configuratie in scripts/example-smtp-config.js
node scripts/example-smtp-config.js
```

## 📝 E-mail Templates

Het platform ondersteunt de volgende e-mail templates:

### 1. Welkomstmail
- **Trigger**: Na registratie
- **Variabelen**: `[Naam]`
- **Bewerken**: Via admin interface

### 2. Wachtwoord Reset
- **Trigger**: Wachtwoord reset aanvraag
- **Variabelen**: `[Naam]`, `[RESET_LINK]`
- **Bewerken**: Via admin interface

### 3. Wekelijkse Herinnering
- **Trigger**: Wekelijkse campagne
- **Variabelen**: `[Naam]`
- **Bewerken**: Via admin interface

## 🚀 E-mail Service API

### Initialisatie
```typescript
import emailService from '@/lib/email-service';

// Initialize the service
await emailService.initialize();
```

### E-mails Verzenden
```typescript
// Welkomstmail
await emailService.sendWelcomeEmail('user@example.com', 'John Doe');

// Wachtwoord reset
await emailService.sendPasswordResetEmail('user@example.com', 'John Doe', 'https://reset-link.com');

// Wekelijkse herinnering
await emailService.sendWeeklyReminderEmail('user@example.com', 'John Doe');

// Custom e-mail
await emailService.sendCustomEmail('user@example.com', 'Onderwerp', '<p>Inhoud</p>');
```

## 🔒 Beveiliging

### Environment Variables
Voeg de volgende variabelen toe aan je `.env.local`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Best Practices
1. **Gebruik App Passwords** voor Gmail/Yahoo accounts met 2FA
2. **Beperk toegang** tot SMTP credentials
3. **Monitor e-mail logs** voor verdachte activiteit
4. **Gebruik rate limiting** om spam te voorkomen

## 🐛 Troubleshooting

### Veelvoorkomende Fouten

#### "Invalid login"
- **Oorzaak**: Verkeerd wachtwoord of gebruikersnaam
- **Oplossing**: Controleer credentials, gebruik App Password voor Gmail

#### "ECONNREFUSED"
- **Oorzaak**: Kan geen verbinding maken met SMTP server
- **Oplossing**: Controleer host en port, firewall instellingen

#### "ENOTFOUND"
- **Oorzaak**: SMTP host niet gevonden
- **Oplossing**: Controleer hostnaam spelling

#### "ETIMEDOUT"
- **Oorzaak**: Timeout bij verbinden
- **Oplossing**: Controleer internetverbinding, probeer andere port

### Debug Mode
```typescript
// Enable debug logging
const transporter = nodemailer.createTransporter({
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  auth: {
    user: smtpConfig.username,
    pass: smtpConfig.password,
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});
```

## 📊 Monitoring

### E-mail Logs
Het platform logt alle verzonden e-mails in de database:
- Ontvanger
- Template gebruikt
- Onderwerp
- Verzendtijd
- Status

### Dashboard Metrics
- E-mails verzonden vandaag/maand
- Bounce rate
- Open rate (indien beschikbaar)
- Click rate (indien beschikbaar)

## 🎯 Pre-Launch Campagne

### Voorbereiding
1. **Configureer SMTP** met betrouwbare provider
2. **Test alle templates** met verschillende e-mailclients
3. **Stel rate limiting in** om spam filters te vermijden
4. **Bereid e-mail lijst voor** met opt-in subscribers

### Campagne Types
1. **Welkomstserie** - 3-5 e-mails voor nieuwe gebruikers
2. **Wekelijkse updates** - Social proof en motivatie
3. **Speciale aanbiedingen** - Pre-launch exclusives
4. **Community updates** - Forum en groep activiteiten

### Best Practices
- **Personaliseer** met gebruikersnaam
- **Gebruik duidelijke call-to-actions**
- **Test op verschillende devices**
- **Monitor deliverability**
- **Respecteer unsubscribe requests**

## 📞 Support

Voor vragen over SMTP configuratie:
1. Controleer dit document
2. Test met het voorbeeld script
3. Raadpleeg de admin interface logs
4. Neem contact op met het development team