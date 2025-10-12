# 📊 COMPLETE ANALYSE: TRAININGSSCHEMA SYSTEEM

**Datum:** 12 oktober 2025  
**Geanalyseerd door:** AI Assistant  
**Voor:** chiel@media2net.nl

---

## 🎯 GEWENST GEDRAG (Door gebruiker gespecificeerd)

### Toegangscontrole
- ✅ Trainingsschemas zijn **ALLEEN** voor Premium/Lifetime users
- ❌ Basic users hebben GEEN toegang

### Schema Unlock Logic
1. **Schema 1** - Altijd beschikbaar na selectie trainingsprofiel
2. **Schema 2** - Unlocks NA voltooien Schema 1 (8 weken)
3. **Schema 3** - Unlocks NA voltooien Schema 2 (8 weken)

### Reset Logic bij Profiel Wijziging
Als gebruiker zijn **trainingsdagen** OF **trainingsdoel** wijzigt:
- ❌ DELETE huidige schema
- ❌ DELETE alle progressie
- ❌ DELETE week completions
- ❌ DELETE schema periods
- ✅ Start OPNIEUW bij Schema 1

---

## 🔍 HUIDIGE IMPLEMENTATIE ANALYSE

### 1. Toegangscontrole ✅
**Status:** CORRECT GEÏMPLEMENTEERD

```typescript
// src/app/dashboard/trainingsschemas/page.tsx:140
const { hasAccess, loading: subscriptionLoading } = useSubscription();

// Line 2636-2647: Correct access check
if (!hasAccess && !isAdmin && !debugSimulateBasic) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <UpgradeModal
        isOpen={true}
        onClose={() => router.push('/dashboard')}
        feature="trainingsschemas"
      />
    </div>
  );
}
```

✅ **Werkt correct** - Basic users zien een upgrade modal

---

### 2. Schema Unlock Logic 🟡
**Status:** DEELS CORRECT, ENKELE PROBLEMEN

#### A. Unlock Check Logica
**Locatie:** `src/app/api/user/schema-progress/route.ts`

```typescript
// Lines 100-128: Unlock logic based on completed weeks
const schema1Progress = progressData.find((p: any) => {
  const ts: any = (p as any).training_schemas || schemaMap[p.schema_id];
  return ts && ts.schema_nummer === 1;
});

if (schema1Progress) {
  const totalDays1 = (schema1Progress.total_days ?? schema1Progress.completed_days ?? 0);
  const weeksCompleted = schema1Progress.completed_at ? 8 : Math.floor(totalDays1 / freq);
  
  if (weeksCompleted >= 8) {
    unlockedSchemas[2] = true;
    
    // Check Schema 2
    const schema2Progress = progressData.find(...)
    if (schema2Progress) {
      const schema2WeeksCompleted = schema2Progress.completed_at ? 8 : Math.floor(totalDays2 / freq);
      if (schema2WeeksCompleted >= 8) {
        unlockedSchemas[3] = true;
      }
    }
  }
}
```

✅ **Logica is correct:** 
- Schema 2 unlocks na 8 weken Schema 1
- Schema 3 unlocks na 8 weken Schema 2

#### B. Schema Completion API
**Locatie:** `src/app/api/schema-completion/route.ts`

```typescript
// Lines 88-156: When Schema 1 is completed
if (schemaData.schema_nummer === 1) {
  // Find Schema 2
  const { data: schema2Data } = await supabaseAdmin
    .from('training_schemas')
    .select('id, name')
    .eq('training_goal', /* current goal */)
    .eq('equipment_type', /* current equipment */)
    .eq('schema_nummer', 2)
    .single();

  // Create progress entry for Schema 2
  await supabaseAdmin.from('user_training_schema_progress').insert({
    user_id: userId,
    schema_id: schema2Data.id,
    current_day: 1,
    total_days_completed: 0,
    started_at: new Date().toISOString(),
  });

  // Auto-select Schema 2
  await supabaseAdmin.from('profiles').update({ 
    selected_schema_id: schema2Data.id 
  }).eq('id', userId);
}
```

✅ **Automatisch unlock werkt**
⚠️ **PROBLEEM:** Auto-selecteert het nieuwe schema (kan verwarrend zijn)

---

### 3. Reset Logic bij Profiel Wijziging ✅
**Status:** CORRECT GEÏMPLEMENTEERD

**Locatie:** `src/app/api/training-profile/route.ts`

```typescript
// Lines 105-146: ALWAYS reset when profile exists
if (existingProfile) {
  console.log('🔄 Training profile is being updated - resetting all training data');
  
  if (profileData?.id) {
    // ✅ Delete all schema periods
    await supabase.from('user_schema_periods').delete().eq('user_id', profileData.id);
    
    // ✅ Delete all training day progress
    await supabase.from('user_training_day_progress').delete().eq('user_id', profileData.id);
    
    // ✅ Delete legacy training progress
    await supabase.from('user_training_progress').delete().eq('user_id', profileData.id);
    
    // ✅ Delete week completions
    await supabase.from('user_week_completions').delete().eq('user_id', profileData.id);
    
    console.log('✅ Training data reset complete');
  }
}
```

✅ **WERKT PERFECT**
- Alle data wordt gewist bij profiel wijziging
- Gebruiker start opnieuw bij Schema 1

⚠️ **PROBLEEM:** Mist één tabel: `user_training_schema_progress`

---

### 4. Frontend Warning Modal 🟡
**Status:** DEELS CORRECT

**Locatie:** `src/app/dashboard/trainingsschemas/page.tsx`

```typescript
// Lines 1242-1252: Shows warning when profile changes
if (currentSchemaPeriod && 
    currentSchemaPeriod.status === 'active' &&
    currentSchemaPeriod.start_date && 
    currentSchemaPeriod.end_date && 
    currentSchemaPeriod.training_schemas?.name &&
    hasChanged) {
  setShowWarningModal(true);
  return;
}
```

✅ **Warning wordt getoond**
✅ **Gebruiker moet bevestigen**

---

## ❌ GEVONDEN PROBLEMEN

### PROBLEEM 1: Incomplete Reset Logic
**Locatie:** `src/app/api/training-profile/route.ts` (Lines 105-146)

**Huidige Code:**
```typescript
// Deletes:
- user_schema_periods ✅
- user_training_day_progress ✅
- user_training_progress ✅
- user_week_completions ✅

// MIST:
- user_training_schema_progress ❌ <-- KRITIEK!
```

**Impact:**
- Unlock status blijft behouden na reset
- Gebruiker ziet nog steeds Schema 2/3 als unlocked
- Data inconsistentie

**Oplossing:**
```typescript
// Add this deletion
await supabase
  .from('user_training_schema_progress')
  .delete()
  .eq('user_id', profileData.id);
```

---

### PROBLEEM 2: Warning Modal Tekst Onduidelijk
**Locatie:** `src/components/SchemaChangeWarningModal.tsx`

**Huidige Situatie:**
- Warning modal toont algemene tekst
- Niet specifiek genoeg over wat er gebeurt

**Gewenste Tekst:**
```
⚠️ WAARSCHUWING: Trainingsprofiel Wijzigen

Je staat op het punt je trainingsprofiel te wijzigen van:
  • 4 dagen per week → 5 dagen per week
  • Kracht/Uithouding → Spiermassa

Dit zal het volgende doen:
  ❌ Je huidige schema wordt verwijderd
  ❌ Al je trainingsprogressie wordt gewist
  ❌ Je unlock status wordt gereset
  ✅ Je begint opnieuw met Schema 1

Ben je zeker dat je wilt doorgaan?
```

---

### PROBLEEM 3: Geen Visuele Feedback op Reset
**Impact:**
- Gebruiker ziet niet direct dat alles gereset is
- Kan verwarring veroorzaken

**Oplossing:**
- Toast notification: "✅ Trainingsprofiel gereset. Je kunt nu Schema 1 selecteren!"
- Scroll naar beschikbare schemas sectie

---

### PROBLEEM 4: Profile Check Inconsistent
**Locatie:** `src/app/api/training-profile/route.ts` (Line 106)

**Probleem:**
```typescript
if (existingProfile) {
  // ALWAYS reset
}
```

Dit reset ALTIJD, zelfs als de waarden hetzelfde zijn!

**Betere Check:**
```typescript
const hasChanged = 
  existingProfile.training_goal !== training_goal ||
  existingProfile.training_frequency !== training_frequency ||
  existingProfile.equipment_type !== equipment_type;

if (existingProfile && hasChanged) {
  console.log('🔄 Profile changed, resetting all data');
  // Reset logic
}
```

---

## 📊 TABELLEN OVERZICHT

### Progressie Tabellen
1. **`user_training_schema_progress`** ⭐ HOOFDTABEL
   - Tracks welke schemas unlocked/completed zijn
   - Bevat completed_days, current_day
   - **MOET GERESET** bij profiel wijziging

2. **`user_schema_periods`**
   - Tracks actieve schema periodes (8 weken)
   - Status: active/completed/paused
   - ✅ Wordt al gereset

3. **`user_training_day_progress`**
   - Tracks individuele training dagen
   - ✅ Wordt al gereset

4. **`user_week_completions`**
   - Tracks voltooide weken
   - ✅ Wordt al gereset

5. **`user_training_progress`** (Legacy)
   - Oude tabel
   - ✅ Wordt al gereset

---

## ✅ WERKENDE DELEN

### 1. Toegangscontrole
- ✅ Premium/Lifetime check werkt perfect
- ✅ Basic users zien upgrade modal

### 2. Schema Unlock na Completion
- ✅ Logica is correct (8 weken check)
- ✅ Auto-unlock van Schema 2 na Schema 1
- ✅ Auto-unlock van Schema 3 na Schema 2

### 3. Warning Modal
- ✅ Wordt getoond bij profiel wijziging
- ✅ Checkt of er een actief schema is
- ✅ Gebruiker moet bevestigen

### 4. Meeste Reset Logic
- ✅ 4 van 5 tabellen worden gereset
- ✅ Schema periods worden verwijderd
- ✅ Week completions worden gewist

---

## 🔧 PRIORITEITEN VOOR FIX

### 🔴 KRITIEK - Fix Nu
1. **Add `user_training_schema_progress` deletion**
   - Zonder dit blijven unlocks behouden
   - Gebruiker ziet verkeerde schemas

### 🟡 BELANGRIJK - Fix Binnenkort
2. **Betere warning modal tekst**
   - Duidelijker maken wat er gebeurt
   - Toon voor/na vergelijking

3. **Check if profile actually changed**
   - Voorkom onnodige resets
   - Betere UX

### 🟢 NICE TO HAVE
4. **Visuele feedback na reset**
   - Toast notifications
   - Auto-scroll naar Schema 1

---

## 📝 AANBEVOLEN FIXES

### Fix 1: Complete Reset Logic
```typescript
// In src/app/api/training-profile/route.ts
if (profileData?.id) {
  // Existing deletions...
  
  // ADD THIS:
  await supabase
    .from('user_training_schema_progress')
    .delete()
    .eq('user_id', profileData.id);
  
  console.log('✅ All training data including unlock status reset');
}
```

### Fix 2: Smart Profile Change Check
```typescript
// Check if values actually changed
const hasChanged = 
  existingProfile.training_goal !== training_goal ||
  existingProfile.training_frequency !== training_frequency ||
  existingProfile.equipment_type !== equipment_type;

if (existingProfile && hasChanged) {
  // Only reset if something changed
  console.log('🔄 Profile changed from', existingProfile, 'to', {
    training_goal, training_frequency, equipment_type
  });
  // ... reset logic
} else if (existingProfile && !hasChanged) {
  console.log('✅ Profile unchanged, skipping reset');
  return NextResponse.json({ 
    success: true, 
    message: 'Profile already up to date, no reset needed' 
  });
}
```

### Fix 3: Better Response Messages
```typescript
// Return clear message about what happened
return NextResponse.json({ 
  success: true, 
  message: 'Training profile updated and all progress reset',
  resetPerformed: true,
  deletedRecords: {
    schema_periods: periodCount,
    day_progress: dayCount,
    week_completions: weekCount,
    schema_progress: schemaProgressCount
  }
});
```

---

## 🎯 CONCLUSIE

### Het Systeem Werkt Grotendeels Correct! ✅

**Goed:**
- ✅ Toegangscontrole perfect
- ✅ Unlock logic is solide
- ✅ Reset wordt getriggerd op juiste moment
- ✅ 80% van data wordt correct gereset

**Moet Gefixed:**
- ❌ `user_training_schema_progress` wordt niet gereset
- ⚠️ Warning modal kan duidelijker
- ⚠️ Reset gebeurt ook als profiel niet veranderd is

**Impact van Fixes:**
- 🔴 Fix 1 (schema progress deletion): **KRITIEK** - 15 minuten werk
- 🟡 Fix 2 (change check): BELANGRIJK - 10 minuten werk
- 🟢 Fix 3 (UX improvements): Nice to have - 30 minuten werk

**Totale Werk:** ~1 uur voor complete fix

---

## 📌 NEXT STEPS

1. ✅ Implementeer Fix 1 (schema progress deletion)
2. ✅ Implementeer Fix 2 (change detection)
3. ✅ Test met echte gebruiker (Chiel)
4. ✅ Verifieer dat unlock status correct reset
5. 🟡 Overweeg Fix 3 (UX improvements) later


