-- Create todo_tasks table manually in Supabase
-- Run this in the Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create todo_tasks table
CREATE TABLE IF NOT EXISTS todo_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create policies for admin access (allow all operations for now)
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

-- Insert some sample data
INSERT INTO todo_tasks (id, title, description, category, priority, estimated_hours, status, assigned_to, due_date, start_date, progress_percentage, created_at) VALUES
('test-users-001', 'Test Gebruikers Admin Pagina Maken', 'Maak een nieuwe admin pagina voor test gebruikers beheer onder het LEDEN menu. Pagina moet test gebruikers tonen die vanaf 22 Augustus het platform gaan testen.', 'development', 'high', 4, 'completed', 'Chiel', '2024-08-20', '2024-08-20', 100, '2024-08-20T10:00:00Z'),
('test-users-002', 'Test Gebruiker Feedback Component Ontwikkelen', 'Ontwikkel een TestUserFeedback component met floating action buttons rechts in het midden van het scherm. Component moet Bug/Verbetering melden knop hebben en element markering functionaliteit.', 'development', 'high', 6, 'completed', 'Chiel', '2024-08-20', '2024-08-20', 100, '2024-08-20T11:00:00Z'),
('test-users-003', 'Element Markering Systeem Implementeren', 'Implementeer een systeem waarbij test gebruikers elementen kunnen markeren met een rode highlight. Systeem moet op freeze gaan tijdens markering en automatisch element selectors genereren.', 'development', 'high', 5, 'completed', 'Chiel', '2024-08-20', '2024-08-20', 100, '2024-08-20T12:00:00Z'),
('test-users-004', 'Test Gebruiker Detectie Hook Maken', 'Maak een useTestUser hook die automatisch detecteert of een gebruiker een test gebruiker is op basis van user.role === test. Hook moet geïntegreerd worden in dashboard layout.', 'development', 'medium', 2, 'completed', 'Chiel', '2024-08-20', '2024-08-20', 100, '2024-08-20T13:00:00Z'),
('test-users-005', 'Database Schema voor Test Gebruikers', 'Maak database tabellen voor test_users en test_notes. Tabellen moeten alle benodigde velden bevatten voor test gebruiker beheer en feedback notities.', 'database', 'high', 3, 'completed', 'Chiel', '2024-08-20', '2024-08-20', 100, '2024-08-20T14:00:00Z'),
('sample-task-001', 'Sample Task voor Chiel', 'Dit is een sample taak om te testen of de database werkt.', 'development', 'medium', 2, 'pending', 'Chiel', '2025-12-31', '2025-01-01', 0, NOW()),
('sample-task-002', 'Test Zoekfunctie', 'Test taak om te controleren of de zoekfunctie werkt.', 'testing', 'low', 1, 'in_progress', 'Chiel', '2025-12-31', '2025-01-01', 50, NOW()),
('sample-task-003', 'Database Integratie Test', 'Test of de database integratie werkt voor taken beheer.', 'database', 'high', 4, 'pending', 'Chiel', '2025-12-31', '2025-01-01', 0, NOW()),
('sample-task-004', 'Frontend Bug Fix', 'Fix de bug in de taken pagina waar taken niet correct worden getoond.', 'frontend', 'critical', 3, 'in_progress', 'Chiel', '2025-12-31', '2025-01-01', 75, NOW()),
('sample-task-005', 'API Endpoint Test', 'Test alle API endpoints voor taken beheer.', 'api', 'medium', 2, 'pending', 'Chiel', '2025-12-31', '2025-01-01', 0, NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify the table was created
SELECT COUNT(*) as task_count FROM todo_tasks; 