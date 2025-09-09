# Mollie Betaallinks Overzicht - Prelaunch Korting

## 🎯 **50% Prelaunch Korting Toegepast**

Alle pakketten hebben nu specifieke Mollie betaallinks met de juiste prijzen en 50% prelaunch korting.

---

## 📦 **Basic Tier**

### **6 Maanden Opties:**
- **Maandelijks:** €49 → **€25** (50% korting)
- **Eenmalig:** €294 → **€147** (50% korting)

### **12 Maanden Opties:**
- **Maandelijks:** €44 → **€22** (50% korting)
- **Eenmalig:** €528 → **€264** (50% korting)

---

## 🚀 **Premium Tier**

### **6 Maanden Opties:**
- **Maandelijks:** €79 → **€40** (50% korting)
- **Eenmalig:** €474 → **€237** (50% korting)

### **12 Maanden Opties:**
- **Maandelijks:** €71 → **€36** (50% korting)
- **Eenmalig:** €852 → **€426** (50% korting)

---

## 👑 **Lifetime Access**

### **Eenmalige Betaling:**
- **Levenslang:** €1995 → **€998** (50% korting)

---

## 🔧 **Technische Implementatie**

### **Nieuwe API Route:**
- **Endpoint:** `/api/payments/create-payment-prelaunch`
- **Functionaliteit:** Genereert specifieke Mollie betaallinks per pakket
- **Korting:** Automatisch 50% prelaunch korting toegepast
- **Metadata:** Volledige pakket informatie opgeslagen

### **CheckoutSection Updates:**
- **Payment Handler:** Gebruikt nieuwe prelaunch API route
- **Pricing Logic:** Correcte prijsberekening per pakket
- **Validation:** Naam en email validatie
- **Redirect:** Automatische redirect naar Mollie checkout

### **Database Storage:**
- **Payments Table:** Opslag van alle betalingen met metadata
- **Prelaunch Packages Table:** Test betalingen voor admin overzicht
- **Customer Data:** Naam, email en pakket keuze opgeslagen

---

## 🧪 **Test Functionaliteit**

### **Test Betaling:**
- **Button:** "Test Kopen" (blauw)
- **Functionaliteit:** Simuleert betaling zonder echte Mollie redirect
- **Database:** Opslag in `prelaunch_packages` tabel
- **Admin:** Zichtbaar in admin dashboard

### **Echte Betaling:**
- **Button:** "Start je transformatie - 50% korting!" (oranje)
- **Functionaliteit:** Echte Mollie betaling met redirect
- **Database:** Opslag in `payments` tabel
- **Webhook:** Mollie webhook voor status updates

---

## ✅ **Verificatie**

Alle pakket combinaties zijn getest en werken correct:

1. ✅ **Basic Tier** - 6 maanden (maandelijks/eenmalig)
2. ✅ **Basic Tier** - 12 maanden (maandelijks/eenmalig)
3. ✅ **Premium Tier** - 6 maanden (maandelijks/eenmalig)
4. ✅ **Premium Tier** - 12 maanden (maandelijks/eenmalig)
5. ✅ **Lifetime Access** - Eenmalige betaling

**50% prelaunch korting wordt correct toegepast op alle pakketten!** 🎉

---

## 🚀 **Live URL**

**Prelaunch Korting Pagina:** `https://platform.toptiermen.eu/pakketten/prelaunchkorting`

**Admin Dashboard:** `https://platform.toptiermen.eu/dashboard-admin/prelaunch-pakketten`
