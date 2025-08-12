# Todo Database Setup - Probleem Oplossing

## 🚨 Probleem
Het opslaan van taken bij `/dashboard-admin/taken` geeft een foutmelding omdat de `todo_tasks` database tabel niet bestaat.

## ✅ Oplossing

### Stap 1: Ga naar Supabase Dashboard
1. Open: https://wkjvstuttbeyqzyjayxj.supabase.co
2. Log in met je admin credentials
3. Ga naar **SQL Editor** in het linker menu

### Stap 2: Voer SQL Script Uit
Kopieer en plak de volgende SQL code in de SQL Editor:

```sql
-- Create todo_tasks table
CREATE TABLE IF NOT EXISTS todo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    assigned_to VARCHAR(100) NOT NULL,
    due_date DATE,
    start_date DATE,
    completion_date DATE,
    dependencies TEXT[],
    tags TEXT[],
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todo_tasks_status ON todo_tasks(status);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_priority ON todo_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_category ON todo_tasks(category);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_assigned_to ON todo_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_due_date ON todo_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_created_at ON todo_tasks(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Allow all operations for todo_tasks" ON todo_tasks
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON todo_tasks TO authenticated;
GRANT ALL ON todo_tasks TO service_role;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_todo_tasks_updated_at BEFORE UPDATE ON todo_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO todo_tasks (title, description, category, priority, estimated_hours, status, assigned_to, due_date, start_date, progress_percentage) VALUES
('Sample Task voor Chiel', 'Dit is een sample taak om te testen of de database werkt.', 'development', 'medium', 2, 'pending', 'Chiel', '2025-12-31', '2025-01-01', 0),
('Test Zoekfunctie', 'Test taak om te controleren of de zoekfunctie werkt.', 'testing', 'low', 1, 'in_progress', 'Chiel', '2025-12-31', '2025-01-01', 50),
('Database Integratie Test', 'Test of de database integratie werkt voor taken beheer.', 'database', 'high', 4, 'pending', 'Chiel', '2025-12-31', '2025-01-01', 0);
```

### Stap 3: Klik op "Run"
Klik op de **Run** knop om het script uit te voeren.

### Stap 4: Verifieer
1. Ga naar **Table Editor** in het linker menu
2. Zoek naar de `todo_tasks` tabel
3. Controleer of de tabel bestaat en sample data bevat

## 🧪 Test het Systeem

### Test 1: Taken Laden
1. Ga naar `/dashboard-admin/taken`
2. Controleer of taken worden geladen (in plaats van hardcoded data)
3. Je zou nu "Source: database" moeten zien in de console logs

### Test 2: Nieuwe Taak Aanmaken
1. Klik op "Nieuwe Taak"
2. Vul alle velden in:
   - **Titel**: "Test Taak Database"
   - **Beschrijving**: "Test of de database werkt"
   - **Toegewezen aan**: "Chiel"
   - **Prioriteit**: "Medium"
   - **Status**: "Pending"
   - **Deadline**: Kies een datum
   - **Geschatte uren**: 2
   - **Categorie**: "Development"
3. Klik op "Taak Toevoegen"
4. De taak zou succesvol moeten worden opgeslagen

### Test 3: Zoekfunctie
1. Gebruik de zoekbalk om te zoeken naar "Test"
2. De zoekfunctie zou nu moeten werken met echte database data

## 🔧 Wat er is Verbeterd

### API Route (`/api/admin/todo-tasks`)
- ✅ Betere foutmeldingen voor ontbrekende database tabel
- ✅ Validatie van verplichte velden
- ✅ Specifieke error handling voor database problemen

### Frontend (`/dashboard-admin/taken`)
- ✅ Betere foutmeldingen voor gebruikers
- ✅ Specifieke handling van database tabel errors
- ✅ Verbeterde logging voor debugging

### Database Schema
- ✅ Volledige `todo_tasks` tabel met alle benodigde velden
- ✅ Indexes voor betere performance
- ✅ RLS policies voor security
- ✅ Triggers voor automatische `updated_at` updates
- ✅ Sample data voor testing

## 🚀 Resultaat

Na het uitvoeren van deze stappen:
- ✅ Taken kunnen worden opgeslagen in de database
- ✅ Zoekfunctie werkt met echte data
- ✅ Teller "Open taken Chiel" wordt correct bijgewerkt
- ✅ Alle CRUD operaties (Create, Read, Update, Delete) werken
- ✅ Systeem is volledig database-driven

## 📞 Support

Als je problemen ondervindt:
1. Controleer de browser console voor error logs
2. Controleer de Supabase logs in het dashboard
3. Zorg ervoor dat alle SQL statements succesvol zijn uitgevoerd 