# Database Toegang Setup voor AI Assistant

## 🔐 Optie 1: Supabase Service Role Key (Aanbevolen)

### Stap 1: Service Role Key Ophalen
1. Ga naar je Supabase Dashboard
2. Klik op je project
3. Ga naar **Settings** → **API**
4. Kopieer de **service_role** key (NIET de anon key!)

### Stap 2: Environment Variable Toevoegen
Voeg deze regel toe aan je `.env.local` bestand:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Stap 3: Database Client Script Maken
Maak een nieuw bestand: `scripts/db-admin.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('SQL Execution Error:', error);
    throw error;
  }
}

module.exports = { executeSQL };
```

### Stap 4: SQL Execution Function
Voeg deze functie toe aan je Supabase database:

```sql
-- Maak een functie voor SQL uitvoering (alleen voor development!)
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Voer de SQL uit
  EXECUTE sql_query;
  RETURN json_build_object('success', true, 'message', 'SQL executed successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Geef rechten aan de service role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
```

## 🔐 Optie 2: Directe Database Connection (Geavanceerd)

### Vereisten:
- PostgreSQL client tools geïnstalleerd
- Database connection string
- SSL certificaten

### Stap 1: Connection String
Van je Supabase Dashboard:
- **Settings** → **Database**
- Kopieer de **Connection string** (URI)

### Stap 2: Environment Variable
```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

## 🔐 Optie 3: Supabase CLI (Minst Invasief)

### Stap 1: Supabase CLI Installeren
```bash
npm install -g supabase
```

### Stap 2: Login
```bash
supabase login
```

### Stap 3: Project Linken
```bash
supabase link --project-ref [your-project-ref]
```

### Stap 4: SQL Uitvoeren
```bash
supabase db reset --linked
# of
supabase db push
```

## 🛡️ Veiligheidsaanbevelingen

### ✅ Wat WEL te doen:
- Gebruik alleen service role keys in development
- Beperk de rechten van de service role
- Gebruik environment variables
- Test altijd eerst op een development database

### ❌ Wat NIET te doen:
- Deel nooit je service role key publiekelijk
- Gebruik geen admin keys in production
- Voer geen onbekende SQL uit zonder review
- Geef geen directe database toegang aan externe partijen

## 🚀 Aanbevolen Workflow

1. **Development**: Gebruik service role key met beperkte rechten
2. **Testing**: Test alle SQL scripts lokaal eerst
3. **Production**: Gebruik alleen goedgekeurde migrations
4. **Backup**: Maak altijd backups voor grote wijzigingen

## 📋 Voorbeeld Gebruik

```javascript
// scripts/fix-schema-days.js
const { executeSQL } = require('./db-admin');
const fs = require('fs');

async function fixSchemaDays() {
  try {
    const sql = fs.readFileSync('fix_schema_days.sql', 'utf8');
    const result = await executeSQL(sql);
    console.log('Schema days fixed:', result);
  } catch (error) {
    console.error('Error fixing schema days:', error);
  }
}

fixSchemaDays();
```

## 🔧 Troubleshooting

### Veelvoorkomende Problemen:
1. **Permission Denied**: Controleer service role rechten
2. **Connection Failed**: Controleer URL en key
3. **SSL Error**: Voeg SSL configuratie toe
4. **Timeout**: Verhoog timeout waarden

### Debug Commands:
```bash
# Test connection
node -e "require('./scripts/db-admin').executeSQL('SELECT 1')"

# Check environment
echo $SUPABASE_SERVICE_ROLE_KEY

# Test Supabase CLI
supabase status
``` 