# 🚨 QUICK FIX: Todo Database Error

## Het Probleem
Je krijgt de foutmelding: `"Fout bij het toevoegen van taak: Failed to create task: TypeError: Cannot read properties of undefined (reading 'includes')"`

**Oorzaak:** De `todo_tasks` database tabel bestaat niet in Supabase.

## ✅ Snelle Oplossing (2 minuten)

### Stap 1: Ga naar Supabase
1. Open: https://wkjvstuttbeyqzyjayxj.supabase.co
2. Log in
3. Klik op **SQL Editor** in het linker menu

### Stap 2: Voer deze SQL uit
Kopieer en plak deze code in de SQL Editor:

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_todo_tasks_status ON todo_tasks(status);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_priority ON todo_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_category ON todo_tasks(category);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_assigned_to ON todo_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_due_date ON todo_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_created_at ON todo_tasks(created_at);

-- Enable RLS
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for todo_tasks" ON todo_tasks
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON todo_tasks TO authenticated;
GRANT ALL ON todo_tasks TO service_role;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

### Stap 4: Test het
1. Ga naar `/dashboard-admin/taken`
2. Probeer een nieuwe taak aan te maken
3. Het zou nu moeten werken! ✅

## 🧪 Verificatie
Run dit commando om te controleren of alles werkt:

```bash
node scripts/test-todo-database.js
```

Je zou moeten zien: `✅ All database tests completed!`

## 🎯 Resultaat
Na deze fix:
- ✅ Taken kunnen worden opgeslagen
- ✅ Zoekfunctie werkt
- ✅ Teller wordt correct bijgewerkt
- ✅ Geen TypeError meer

**Het probleem is opgelost in 2 minuten!** 🚀 