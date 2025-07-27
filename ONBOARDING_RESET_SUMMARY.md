# Onboarding Reset Functionaliteit - Volledige Implementatie

## Overzicht
De onboarding reset functie is volledig uitgebreid om alle gebruikersdata te wissen en de gebruiker terug te zetten naar stap 0. Dit zorgt ervoor dat een gebruiker de volledige onboarding opnieuw kan doorlopen.

## Wat wordt gereset

### 1. Onboarding Status
- **Tabel**: `onboarding_status`
- **Actie**: Reset naar stap 0
- **Velden**: Alle stappen op `false`, `current_step` naar 0, `onboarding_completed` naar `false`

### 2. Missies & Voortgang
- **Tabel**: `user_missions` - Alle gebruikersmissies
- **Tabel**: `user_mission_logs` - Missie voortgang logs
- **Bestand**: `data/missions.json` - File-based missies
- **Actie**: Volledige verwijdering

### 3. Training & Workouts
- **Tabel**: `user_training_progress` - Training voortgang
- **Tabel**: `user_training_schema_progress` - Schema voortgang
- **Tabel**: `user_training_day_progress` - Dag voortgang
- **Tabel**: `workout_sessions` - Workout sessies
- **Tabel**: `workout_exercises` - Workout oefeningen
- **Actie**: Volledige verwijdering

### 4. Voeding & Voedingsplannen
- **Tabel**: `user_nutrition_plans` - Persoonlijke voedingsplannen
- **Tabel**: `user_meal_customizations` - Maaltijd aanpassingen
- **Tabel**: `user_nutrition_progress` - Voedings voortgang
- **Actie**: Volledige verwijdering

### 5. Challenges & Streaks
- **Tabel**: `user_challenges` - Gebruikerschallenges
- **Tabel**: `challenge_logs` - Challenge logs
- **Tabel**: `user_daily_streaks` - Dagelijkse streaks
- **Actie**: Volledige verwijdering

### 6. XP & Achievements
- **Tabel**: `user_xp` - XP transacties
- **Tabel**: `user_achievements` - Prestaties
- **Tabel**: `user_badges` - Badges
- **Actie**: Volledige verwijdering

### 7. Voortgang Tracking
- **Tabel**: `user_daily_progress` - Dagelijkse voortgang
- **Tabel**: `user_weekly_stats` - Wekelijkse statistieken
- **Actie**: Volledige verwijdering

### 8. Doelen & Gewoontes
- **Tabel**: `user_goals` - Gebruikersdoelen
- **Tabel**: `user_habits` - Gebruikersgewoontes
- **Tabel**: `user_habit_logs` - Gewoonte logs
- **Actie**: Volledige verwijdering

### 9. Forum & Social
- **Tabel**: `forum_posts` - Forum posts (alleen introductions)
- **Tabel**: `user_presence` - Gebruikers aanwezigheid
- **Actie**: Volledige verwijdering

### 10. Voorkeuren & Profiel
- **Tabel**: `user_preferences` - Gebruikersvoorkeuren
- **Tabel**: `profiles` - Profiel data (reset naar null)
- **Tabel**: `users` - Gebruikersstatistieken (reset naar 0)
- **Actie**: Reset naar initiële waarden

### 11. Oude Tabellen
- **Tabel**: `user_onboarding_status` - Oude onboarding tabel
- **Actie**: Volledige verwijdering

## API Endpoint

### POST `/api/admin/reset-onboarding`
```typescript
// Request
{
  userId: string
}

// Response
{
  success: boolean,
  message: string
}
```

## Admin Interface

### Ledenbeheer Pagina
- **Locatie**: `/dashboard-admin/ledenbeheer`
- **Functie**: Volledige reset knop in edit modal
- **Bevestiging**: Uitgebreide waarschuwing met alle data die wordt gewist
- **Feedback**: Success/error messages

### Dropdown Menu
- **Locatie**: Ledenlijst dropdown
- **Functie**: Snelle reset optie
- **Bevestiging**: Zelfde uitgebreide waarschuwing

## Bevestigingsbericht
```
⚠️ VOLLEDIGE RESET: Weet je zeker dat je gebruiker [NAAM] volledig wilt resetten?

Dit zal ALLE data wissen:
• Onboarding voortgang (stap 0)
• Missies (database + bestanden)
• Training schemas & voortgang
• Voedingsplannen & voortgang
• Challenges & streaks
• XP punten & achievements
• Forum posts
• Voorkeuren
• Badges & rangen
• Dagelijkse/weekelijkse voortgang
• Doelen & gewoontes
• Workout sessies
• Gebruikersstatistieken

De gebruiker start weer vanaf stap 0 en kan de volledige onboarding opnieuw doorlopen.
```

## Test Script

### `scripts/test-onboarding-reset.js`
- **Doel**: Testen van de reset functionaliteit
- **Functie**: Controleert alle tabellen voor en na reset
- **Output**: Gedetailleerd rapport van gewiste data
- **Gebruik**: `node scripts/test-onboarding-reset.js`

## Veiligheidsmaatregelen

1. **Service Role Key**: Alleen admins kunnen de reset uitvoeren
2. **Bevestiging**: Dubbele bevestiging vereist
3. **Error Handling**: Uitgebreide error handling voor alle tabellen
4. **Logging**: Gedetailleerde logging van alle acties
5. **Rollback**: Geen automatische rollback (handmatig herstel nodig)

## Resultaat

Na een volledige reset:
- ✅ Gebruiker start vanaf onboarding stap 0
- ✅ Alle voortgang is gewist
- ✅ Alle persoonlijke data is verwijderd
- ✅ Gebruiker kan volledige onboarding opnieuw doorlopen
- ✅ Geen resterende data van eerdere sessies

## Gebruik

1. Ga naar Admin Dashboard → Ledenbeheer
2. Klik op "Bewerk Gegevens" bij een gebruiker
3. Klik op "VOLLEDIGE RESET" knop
4. Bevestig de waarschuwing
5. Gebruiker wordt volledig gereset

**Let op**: Deze actie is onomkeerbaar. Zorg ervoor dat je de juiste gebruiker selecteert. 