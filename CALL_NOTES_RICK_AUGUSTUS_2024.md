# 📞 Call Notities - Rick Cuijpers - Augustus 2024

## 🎯 Overzicht
Dit document bevat alle taken en aantekeningen van de laatste call met Rick, georganiseerd per prioriteit en status.

---

## 🔥 CRITICAL PRIORITY (Moet eerst afgerond worden)

### 1. Academy Video Content Upload - Rick's Taak
**Status:** ⏳ Niet gestart  
**Deadline:** 15 augustus  
**Toegewezen aan:** Rick  
**Impact:** Kritiek voor academy functionaliteit

**Context:** 
- Academy video bucket was per ongeluk geleegd tijdens storage migratie
- Technische upload functionaliteit is volledig operationeel
- Rick moet alle video content opnieuw uploaden

**Taken:**
- [ ] Backup van originele video bestanden maken
- [ ] Video's uploaden naar academy-videos bucket
- [ ] Metadata en beschrijvingen toevoegen
- [ ] Video kwaliteit controleren
- [ ] Links in academy sectie updaten

**Notities:** ⚠️ KRITIEK - Bucket was per ongeluk geleegd tijdens S3 → Vercel Blob → Supabase migratie

---

## ⚡ HIGH PRIORITY (Belangrijk voor lancering)

### 2. Video Upload bij Workout - Examen Onderdeel Academy
**Status:** ⏳ Niet gestart  
**Deadline:** 20 augustus  
**Toegewezen aan:** Development  
**Impact:** Nieuwe feature voor academy examens

**Context:** Video upload functionaliteit toevoegen aan workout sessies als examen onderdeel

**Taken:**
- [ ] Video upload component integreren in workout sessies
- [ ] Examen validatie voor video uploads
- [ ] Progress tracking voor video uploads
- [ ] Feedback systeem voor geüploade video's
- [ ] Academy integratie voor video beoordeling

### 3. Automatisch Uitloggen Uitzetten
**Status:** ⏳ Niet gestart  
**Deadline:** 10 augustus  
**Toegewezen aan:** Development  
**Impact:** Verbeterde user experience

**Context:** Automatische logout functionaliteit uitschakelen voor betere user experience

**Taken:**
- [ ] Session timeout configuratie aanpassen
- [ ] Auto-refresh token implementatie
- [ ] Remember me functionaliteit
- [ ] Session persistence verbeteren
- [ ] User preference voor session lengte

### 4. Voedingswaarden Nalopen - Macros Kloppen Niet
**Status:** ⏳ Niet gestart  
**Deadline:** 30 augustus  
**Toegewezen aan:** Content/Development  
**Impact:** KRITIEK - Data kwaliteit

**Context:** Voedingswaarden en macro's controleren en corrigeren per gerecht

**Taken:**
- [ ] Database audit van voedingswaarden
- [ ] Macro berekeningen controleren
- [ ] Recipe data validatie
- [ ] Nutritional database updates
- [ ] User feedback systeem voor incorrecte data

**Notities:** KRITIEK - Voedingswaarden en macro's zijn incorrect - volledige audit nodig

---

## 📝 MEDIUM PRIORITY (Belangrijk voor functionaliteit)

### 5. Tekst Samenvattend van Video - AI Implementatie
**Status:** ⏳ Niet gestart  
**Deadline:** 25 augustus  
**Toegewezen aan:** Development  
**Impact:** AI-powered feature

**Context:** Automatische tekst generatie van video content voor samenvattingen

**Taken:**
- [ ] AI video transcriptie implementeren
- [ ] Automatische samenvatting generatie
- [ ] Key points extractie uit video's
- [ ] Database opslag voor video metadata
- [ ] UI voor video samenvattingen

### 6. Volgorde Aanpassen - Voedingsplannen
**Status:** ⏳ Niet gestart  
**Deadline:** 20 augustus  
**Toegewezen aan:** Development  
**Impact:** Verbeterde UX

**Context:** Volgorde van voedingsplannen en maaltijden aanpassen voor betere UX

**Taken:**
- [ ] Meal order management systeem
- [ ] Drag & drop functionaliteit voor maaltijden
- [ ] Order persistence in database
- [ ] UI verbeteringen voor volgorde aanpassing
- [ ] Mobile responsive drag & drop

### 7. Max 6 Maaltijden - Voedingsplannen Limiet
**Status:** ⏳ Niet gestart  
**Deadline:** 18 augustus  
**Toegewezen aan:** Development  
**Impact:** Optimalisatie voedingsplanning

**Context:** Maximum van 6 maaltijden per dag implementeren in voedingsplannen

**Taken:**
- [ ] Maaltijd limiet validatie toevoegen
- [ ] UI feedback voor maximum bereikt
- [ ] Database constraints voor maaltijd limiet
- [ ] Error handling voor te veel maaltijden
- [ ] User guidance voor optimale maaltijd verdeling

### 8. Fotos in Algemene Database - Image Storage
**Status:** ⏳ Niet gestart  
**Deadline:** 25 augustus  
**Toegewezen aan:** Development  
**Impact:** Betere organisatie

**Context:** Foto's verplaatsen naar algemene database storage voor betere organisatie

**Taken:**
- [ ] Algemene image storage bucket setup
- [ ] Image upload component migratie
- [ ] Database schema voor image metadata
- [ ] Image management interface
- [ ] Legacy image migratie script

### 9. Meetpunt Test - Voedingsplanning Validatie
**Status:** ⏳ Niet gestart  
**Deadline:** 28 augustus  
**Toegewezen aan:** Development  
**Impact:** Progressie tracking

**Context:** Test implementatie voor meetpunten en progressie tracking

**Taken:**
- [ ] Meetpunt tracking systeem
- [ ] Progressie visualisatie
- [ ] Data export functionaliteit
- [ ] Goal setting interface
- [ ] Progressie rapporten

---

## 🔧 LOW PRIORITY (Nice-to-have features)

### 10. Niveau Weg bij Trainingsschema
**Status:** ⏳ Niet gestart  
**Deadline:** 15 augustus  
**Toegewezen aan:** Development  
**Impact:** UI cleanup

**Context:** Niveau/difficulty indicator verwijderen uit trainingsschema interface

**Taken:**
- [ ] Difficulty field verwijderen uit schema builder
- [ ] UI aanpassingen voor schema weergave
- [ ] Database schema updates indien nodig
- [ ] Admin interface aanpassingen
- [ ] Testing van gewijzigde functionaliteit

### 11. Ontbijt Snack - Voedingsplannen Toevoegen
**Status:** ⏳ Niet gestart  
**Deadline:** 22 augustus  
**Toegewezen aan:** Development  
**Impact:** Flexibele voedingsplanning

**Context:** Ontbijt snack optie toevoegen aan voedingsplannen systeem

**Taken:**
- [ ] Ontbijt snack meal type toevoegen
- [ ] UI aanpassingen voor ontbijt snack
- [ ] Database schema updates
- [ ] Recipe library uitbreiding
- [ ] Nutritional guidance voor ontbijt snacks

### 12. Aanbevolen Supplementen - Visolie Omega 3
**Status:** ⏳ Niet gestart  
**Deadline:** 5 september  
**Toegewezen aan:** Content/Development  
**Impact:** Nieuwe feature

**Context:** Supplement aanbevelingen toevoegen aan voedingsplannen

**Taken:**
- [ ] Supplement database opzetten
- [ ] Visolie Omega 3 aanbevelingen
- [ ] Elektrolyten supplementen
- [ ] Personalized supplement advies
- [ ] Supplement integratie in voedingsplannen

---

## 🎯 AANBEVOLEN SUPPLEMENTEN

### Visolie Omega 3
- **Doel:** Ontstekingsremmend, hartgezondheid, hersenfunctie
- **Dosering:** 1-3 gram per dag
- **Timing:** Met maaltijd voor betere absorptie
- **Kwaliteit:** EPA/DHA ratio van 2:1 of 3:2

### Elektrolyten
- **Doel:** Hydratatie, spierfunctie, herstel
- **Componenten:** Natrium, kalium, magnesium, calcium
- **Dosering:** Voor, tijdens en na training
- **Formulering:** Poeder of tablet voor gemak

---

## 📋 ACTIE PLAN

### Week 1 (5-11 augustus)
1. **Rick:** Academy video content upload starten
2. **Development:** Automatisch uitloggen uitzetten
3. **Development:** Niveau weg bij trainingsschema (low priority)

### Week 2 (12-18 augustus)
1. **Rick:** Academy video content afronden
2. **Development:** Max 6 maaltijden implementeren
3. **Development:** Video upload bij workout starten

### Week 3 (19-25 augustus)
1. **Development:** Video upload bij workout afronden
2. **Development:** Volgorde aanpassen voedingsplannen
3. **Development:** Tekst samenvattend van video starten

### Week 4 (26 augustus - 1 september)
1. **Development:** Fotos in algemene database
2. **Content/Development:** Voedingswaarden nalopen
3. **Development:** Meetpunt test implementeren

### Week 5 (2-8 september)
1. **Content/Development:** Aanbevolen supplementen
2. **Development:** Ontbijt snack toevoegen
3. **Testing:** Alle features testen

---

## ❓ VRAGEN VOOR RICK

### Context Nodig:
1. **Video Upload bij Workout:** 
   - Welke specifieke workout sessies moeten video upload hebben?
   - Wat is het examen format voor video beoordeling?
   - Zijn er specifieke video kwaliteit vereisten?

2. **Voedingswaarden Audit:**
   - Welke specifieke gerechten hebben incorrecte macro's?
   - Zijn er voorbeelden van wat er fout gaat?
   - Welke voedingsdatabase wordt gebruikt als referentie?

3. **Meetpunt Test:**
   - Welke meetpunten moeten getrackt worden?
   - Hoe vaak moeten meetpunten gemeten worden?
   - Welke progressie metrics zijn belangrijk?

4. **Supplement Aanbevelingen:**
   - Zijn er specifieke supplement merken die aanbevolen moeten worden?
   - Moeten supplementen gekoppeld worden aan specifieke doelen?
   - Zijn er contra-indicaties die vermeld moeten worden?

### Technische Vragen:
1. **Session Management:**
   - Hoe lang moeten sessies duren?
   - Moeten gebruikers kunnen kiezen tussen verschillende session lengtes?
   - Zijn er security concerns met langere sessies?

2. **Image Storage:**
   - Welke specifieke image types moeten ondersteund worden?
   - Zijn er size limits voor verschillende image types?
   - Moet er image compression/optimization zijn?

3. **AI Video Samenvatting:**
   - Welke AI service moet gebruikt worden?
   - Wat is de gewenste lengte van samenvattingen?
   - Moeten samenvattingen in meerdere talen beschikbaar zijn?

---

## 📊 PROGRESS TRACKING

### Completed Tasks ✅
- [x] Academy Video Upload Systeem - TECHNISCH
- [x] MacOS-style screenshot tool
- [x] Test gebruiker systeem
- [x] Database constraint issues opgelost
- [x] Pre-launch email management systeem

### In Progress Tasks ⚠️
- [ ] Content & Copywriting
- [ ] Payment Integration

### Not Started Tasks ⏳
- [ ] Academy Video Content Upload (Rick)
- [ ] Video Upload bij Workout
- [ ] Automatisch Uitloggen Uitzetten
- [ ] Voedingswaarden Nalopen
- [ ] Alle andere taken...

---

## 🎯 SUCCES CRITERIA

### Voor Lancering:
1. ✅ Alle critical tasks afgerond
2. ✅ Academy video content beschikbaar
3. ✅ Voedingswaarden gecorrigeerd
4. ✅ Video upload functionaliteit werkend
5. ✅ Session management geoptimaliseerd

### Post-Launch:
1. ✅ User feedback verzameld
2. ✅ Performance monitoring actief
3. ✅ Supplement aanbevelingen geïmplementeerd
4. ✅ Meetpunt tracking operationeel
5. ✅ AI video samenvattingen werkend

---

*Laatste update: Augustus 2024*  
*Document opgesteld door: AI Assistant*  
*Status: Actief - In gebruik voor project management* 