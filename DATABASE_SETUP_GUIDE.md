# Database Setup Guide voor Top Tier Men

## 🚀 Snelle Start

### 1. Environment Variables Instellen

Zorg dat je `.env.local` bestand deze variabelen bevat:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Automatische Setup Uitvoeren

```bash
node scripts/auto-setup.js
```

Dit script zal automatisch:
- ✅ Database connectie testen
- ✅ exec_sql functie aanmaken
- ✅ Storage bucket voor workout videos fixen
- ✅ Sessie timeout verlenging instellen
- ✅ Prelaunch emails tabel aanmaken

## 🛠️ Database CLI Tool

Na de setup kun je de database CLI gebruiken:

```bash
# Help tonen
node scripts/db-cli.js help

# Database connectie testen
node scripts/db-cli.js test

# Alle tabellen tonen
node scripts/db-cli.js list-tables

# Tabel structuur bekijken
node scripts/db-cli.js describe users

# SQL bestand uitvoeren
node scripts/db-cli.js execute setup_workout_videos_bucket_simple.sql

# Specifieke setup commando's
node scripts/db-cli.js setup-workout-videos
node scripts/db-cli.js setup-session-timeout
node scripts/db-cli.js setup-prelaunch
node scripts/db-cli.js fix-storage-bucket
```

## 🔧 Handmatige Setup (Als automatische setup faalt)

### Stap 1: exec_sql Functie Aanmaken

Voer dit SQL uit in je Supabase SQL Editor:

```sql
-- Kopieer de inhoud van create_exec_sql_function.sql
```

### Stap 2: Storage Bucket Aanmaken

```bash
node scripts/db-cli.js setup-workout-videos
```

### Stap 3: Sessie Timeout Instellen

```bash
node scripts/db-cli.js setup-session-timeout
```

### Stap 4: Prelaunch Emails

```bash
node scripts/db-cli.js setup-prelaunch
```

## 📋 Beschikbare Scripts

### Database Executor (`scripts/db-executor.js`)
- **executeSQL(sql)** - Voer enkele SQL statement uit
- **executeSQLFile(filePath)** - Voer SQL bestand uit
- **testConnection()** - Test database connectie
- **listTables()** - Toon alle tabellen
- **describeTable(tableName)** - Toon tabel structuur
- **backupTable(tableName)** - Maak backup van tabel

### Database CLI (`scripts/db-cli.js`)
- **test** - Test database connectie
- **list-tables** - Toon alle tabellen
- **describe <table>** - Toon tabel structuur
- **execute <file.sql>** - Voer SQL bestand uit
- **setup-workout-videos** - Setup workout videos storage
- **setup-session-timeout** - Setup sessie timeout
- **setup-prelaunch** - Setup prelaunch emails
- **fix-storage-bucket** - Fix storage bucket problemen

### Auto Setup (`scripts/auto-setup.js`)
- Volledige automatische setup van alle componenten
- Stap-voor-stap verificatie
- Foutafhandeling en herstel

## 🔍 Troubleshooting

### Probleem: "exec_sql function not available"
**Oplossing:**
```bash
# Voer dit SQL uit in Supabase SQL Editor
# Kopieer de inhoud van create_exec_sql_function.sql
```

### Probleem: "Storage bucket 'workout-videos' bestaat niet"
**Oplossing:**
```bash
node scripts/db-cli.js fix-storage-bucket
```

### Probleem: "Unauthorized" errors
**Oplossing:**
1. Controleer `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
2. Zorg dat de service role key correct is
3. Test connectie: `node scripts/db-cli.js test`

### Probleem: "Connection failed"
**Oplossing:**
1. Controleer `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
2. Controleer `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
3. Zorg dat je Supabase project actief is

## 📊 Voorbeelden

### SQL Bestand Uitvoeren
```bash
node scripts/db-cli.js execute setup_workout_videos_bucket_simple.sql
```

### Meerdere SQL Bestanden Uitvoeren
```bash
node scripts/db-cli.js execute-multiple .
```

### Tabel Backup Maken
```bash
node scripts/db-cli.js backup users
```

### Database Status Controleren
```bash
node scripts/db-cli.js test
node scripts/db-cli.js list-tables
```

## 🎯 Veelgebruikte Commando's

```bash
# Volledige setup
node scripts/auto-setup.js

# Alleen storage bucket fixen
node scripts/db-cli.js fix-storage-bucket

# Alleen sessie timeout
node scripts/db-cli.js setup-session-timeout

# Database status
node scripts/db-cli.js test
node scripts/db-cli.js list-tables

# SQL uitvoeren
node scripts/db-cli.js execute mijn_script.sql
```

## 🔐 Veiligheid

- ✅ Service role key alleen in development
- ✅ Geen admin keys in production
- ✅ Environment variables gebruiken
- ✅ Geen directe database toegang delen

## 📞 Support

Als je problemen hebt:
1. Controleer de troubleshooting sectie
2. Test database connectie: `node scripts/db-cli.js test`
3. Controleer environment variables
4. Voer automatische setup uit: `node scripts/auto-setup.js` 