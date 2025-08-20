# Advertenties Bucket RLS Policies Fix

## 🔧 **Probleem**
De video's in de `advertenties` bucket zijn niet zichtbaar via de anon key, terwijl ze wel in het Supabase Dashboard zichtbaar zijn.

## ✅ **Oplossing**

### **Stap 1: Voer SQL Script Uit**
1. Ga naar je **Supabase Dashboard**
2. Ga naar **SQL Editor**
3. Voer het script `scripts/fix-advertenties-rls-policies.sql` uit
4. Dit maakt de juiste RLS policies aan voor anonieme toegang

### **Stap 2: Controleer de Policies**
Na het uitvoeren van het script zou je deze policies moeten zien:

- **Public read access for advertenties** - Anonieme gebruikers kunnen video's lezen
- **Authenticated users can upload advertenties** - Ingelogde gebruikers kunnen uploaden
- **Users can update their own advertenties** - Ingelogde gebruikers kunnen updaten
- **Users can delete their own advertenties** - Ingelogde gebruikers kunnen verwijderen

### **Stap 3: Test de Fix**
Na het uitvoeren van het SQL script:

```bash
# Test directe toegang
node scripts/test-advertenties-direct.js

# Test via API
curl -s "http://localhost:6001/api/list-advertentie-videos" | jq .

# Test via pagina
curl -s "http://localhost:6001/dashboard-marketing/advertentie-materiaal"
```

### **Stap 4: Verificatie**
De test zou nu moeten tonen:
- ✅ 11 video's gevonden in de bucket
- ✅ Public URLs gegenereerd
- ✅ Video's zichtbaar op de pagina

## 🔍 **Wat het Script Doet**

1. **Controleert huidige policies** - Ziet welke policies er al zijn
2. **Verwijdert oude policies** - Maakt schone lei
3. **Maakt nieuwe policies** - Voor anonieme leestoegang
4. **Verifieert bucket** - Controleert of bucket bestaat en public is
5. **Test toegang** - Probeert bestanden op te halen

## ⚠️ **Belangrijk**

- **Anonieme toegang** is nodig voor het ophalen van video's
- **Authenticated toegang** is nodig voor upload/update/delete
- **Bucket moet public zijn** (wat het al is)

## 🎯 **Verwacht Resultaat**

Na deze fix zou je moeten zien:
- 11 video's in de advertentie-materiaal pagina
- Video's kunnen worden afgespeeld
- Upload functionaliteit werkt
- Geen database errors meer

**Voer het SQL script uit en test dan opnieuw!** 🚀
