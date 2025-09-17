# Voedingsplannen V2 - HUIDIG WERKENDE VERSIE

## ⚠️ BELANGRIJK: Dit is de meest recente werkende versie!

**Datum:** 17 september 2025  
**Status:** ✅ Volledig functioneel  
**Backup bestand:** `page.tsx.HUIDIG_WERKEND`

## 🎯 Wat zit er in deze versie?

### 1. **Profiel Balk (User Profile Form)**
- ✅ Gewicht, lengte, leeftijd, geslacht invoervelden
- ✅ Activiteitsniveau (Zittend, Matig, Lopend) met multipliers
- ✅ Fitness doel (Droogtrainen, Onderhoud, Spiermassa) met calorie aanpassingen
- ✅ Bewerk Profiel knop om formulier te tonen/verbergen
- ✅ Opslaan functionaliteit via API call naar `/api/nutrition-profile`
- ✅ Form validatie en error handling

### 2. **Uitgebreide Card Data**
- ✅ Target Calorieën vs Jouw Calorieën vergelijking
- ✅ Gedetailleerde macro breakdown (Eiwit, Koolhydraten, Vet)
- ✅ Goal badges voor elk plan
- ✅ Verbeterde styling met hover effecten
- ✅ Personalized targets berekening per plan

### 3. **Personalized Targets Berekenen**
- ✅ BMR berekening met Mifflin-St Jeor vergelijking
- ✅ TDEE berekening met activiteitsniveau multipliers
- ✅ Goal aanpassingen (-500 kcal voor droogtrainen, +400 kcal voor spiermassa)
- ✅ Macro percentages (25% eiwit, 45% koolhydraten, 30% vet)

### 4. **Verbeterde UX**
- ✅ Animateerde formulier met smooth transitions
- ✅ Form validatie met required fields
- ✅ Error handling voor API calls
- ✅ Consistente styling met de rest van de applicatie

## 🔧 Belangrijke Functies

### `saveUserProfile(profile: UserProfile)`
- Slaat gebruikersprofiel op via API
- Error handling en success feedback
- Sluit formulier na succesvol opslaan

### `calculatePersonalizedTargets(plan: NutritionPlan)`
- Berekent BMR/TDEE gebaseerd op gebruikersprofiel
- Past goal aanpassingen toe
- Berekent macro targets met percentages

### Profiel Formulier
- Volledig functioneel formulier met alle velden
- Real-time validatie
- Smooth animaties

## 🚨 Wat NIET te doen

- ❌ **NOOIT** de overview pagina sectie verwijderen
- ❌ **NOOIT** de profiel balk weghalen
- ❌ **NOOIT** de uitgebreide card data vereenvoudigen
- ❌ **NOOIT** de personalized targets berekening verwijderen

## 📝 Als er problemen zijn

1. **Controleer eerst** of de profiel balk zichtbaar is
2. **Controleer** of de cards uitgebreide data tonen (target vs personalized calories)
3. **Controleer** of de personalized targets berekening werkt
4. **Als iets ontbreekt**, herstel vanuit deze backup

## 🔄 Herstel Procedure

```bash
# Als de pagina kapot is, herstel vanuit backup:
cp src/app/dashboard/voedingsplannen-v2/page.tsx.HUIDIG_WERKEND src/app/dashboard/voedingsplannen-v2/page.tsx

# Controleer of alles werkt:
npm run dev
```

## 📊 Test Checklist

- [ ] Profiel balk is zichtbaar
- [ ] Bewerk Profiel knop werkt
- [ ] Formulier kan worden ingevuld en opgeslagen
- [ ] Cards tonen target vs personalized calories
- [ ] Macro breakdown is zichtbaar
- [ ] Personalized targets worden correct berekend
- [ ] Hover effecten werken
- [ ] Geen console errors

## 🎯 Laatste Wijzigingen

- **17 sep 2025**: Volledige herstel van profiel balk en uitgebreide cards
- **17 sep 2025**: Toegevoegd personalized targets berekening
- **17 sep 2025**: Verbeterde UX met animaties en validatie
- **17 sep 2025**: Error handling en API integratie

---

**⚠️ ONTHOUD: Deze versie bevat ALLE benodigde functionaliteit. Verwijder NOOIT de profiel balk of uitgebreide card data!**
