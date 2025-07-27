-- Create todo tables for planning and task management
-- This will be used for the admin dashboard planning & todo functionality

-- Main todo tasks table
CREATE TABLE IF NOT EXISTS todo_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'api', 'testing', 'deployment', 'documentation', 'ui', 'integration', 'optimization')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimated_hours DECIMAL(4,2) NOT NULL,
  actual_hours DECIMAL(4,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  assigned_to VARCHAR(100) NOT NULL,
  due_date DATE NOT NULL,
  start_date DATE NOT NULL,
  completion_date DATE,
  dependencies TEXT[],
  tags TEXT[],
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subtasks table for breaking down main tasks
CREATE TABLE IF NOT EXISTS todo_subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES todo_tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_hours DECIMAL(4,2) NOT NULL,
  actual_hours DECIMAL(4,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  assigned_to VARCHAR(100),
  due_date DATE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Todo milestones table
CREATE TABLE IF NOT EXISTS todo_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  target_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Todo statistics table for daily tracking
CREATE TABLE IF NOT EXISTS todo_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  in_progress_tasks INTEGER DEFAULT 0,
  blocked_tasks INTEGER DEFAULT 0,
  total_estimated_hours DECIMAL(6,2) DEFAULT 0,
  total_actual_hours DECIMAL(6,2) DEFAULT 0,
  average_completion_time DECIMAL(4,2) DEFAULT 0,
  tasks_by_priority JSONB,
  tasks_by_category JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todo_tasks_status ON todo_tasks(status);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_priority ON todo_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_category ON todo_tasks(category);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_due_date ON todo_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_assigned_to ON todo_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_todo_subtasks_task_id ON todo_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_todo_subtasks_status ON todo_subtasks(status);
CREATE INDEX IF NOT EXISTS idx_todo_milestones_status ON todo_milestones(status);
CREATE INDEX IF NOT EXISTS idx_todo_milestones_target_date ON todo_milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_todo_statistics_date ON todo_statistics(date);

-- Create RLS policies
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_statistics ENABLE ROW LEVEL SECURITY;

-- RLS policies for todo_tasks
CREATE POLICY "Enable read access for all users" ON todo_tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON todo_tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON todo_tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON todo_tasks FOR DELETE USING (auth.role() = 'authenticated');

-- RLS policies for todo_subtasks
CREATE POLICY "Enable read access for all users" ON todo_subtasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON todo_subtasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON todo_subtasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON todo_subtasks FOR DELETE USING (auth.role() = 'authenticated');

-- RLS policies for todo_milestones
CREATE POLICY "Enable read access for all users" ON todo_milestones FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON todo_milestones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON todo_milestones FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON todo_milestones FOR DELETE USING (auth.role() = 'authenticated');

-- RLS policies for todo_statistics
CREATE POLICY "Enable read access for all users" ON todo_statistics FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON todo_statistics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON todo_statistics FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON todo_statistics FOR DELETE USING (auth.role() = 'authenticated');

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todo_tasks_updated_at BEFORE UPDATE ON todo_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todo_subtasks_updated_at BEFORE UPDATE ON todo_subtasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todo_milestones_updated_at BEFORE UPDATE ON todo_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for todo_tasks
INSERT INTO todo_tasks (id, title, description, category, priority, estimated_hours, actual_hours, status, assigned_to, due_date, start_date, completion_date, dependencies, tags, progress_percentage) VALUES
('11111111-1111-1111-1111-111111111111', 'Boekenkamer Frontend Database Integratie', 'Frontend pagina voor boekenkamer migreren van mock data naar echte database data uit books, book_categories en book_reviews tabellen', 'frontend', 'high', 16, 0, 'pending', 'Frontend Team', '2025-08-12', '2025-07-28', NULL, ARRAY[]::TEXT[], ARRAY['database', 'frontend', 'books'], 0),
('22222222-2222-2222-2222-222222222222', 'Mijn Missies Volledige Database Integratie', 'Volledige database integratie voor user_missions tabel met real-time progress tracking en achievement notifications', 'frontend', 'high', 8, 0, 'pending', 'Frontend Team', '2025-08-12', '2025-07-30', NULL, ARRAY[]::TEXT[], ARRAY['missions', 'database', 'progress'], 0),
('33333333-3333-3333-3333-333333333333', 'Challenges Database Schema Design', 'Database tabellen aanmaken voor challenges, user_challenges en challenge_categories met RLS policies en indexes', 'database', 'high', 12, 0, 'pending', 'Backend Team', '2025-08-15', '2025-08-01', NULL, ARRAY[]::TEXT[], ARRAY['challenges', 'database', 'schema'], 0),
('44444444-4444-4444-4444-444444444444', 'Challenges API Routes', 'API routes maken voor challenges systeem: /api/challenges, /api/user-challenges, /api/challenge-categories', 'api', 'high', 16, 0, 'pending', 'Backend Team', '2025-08-17', '2025-08-03', NULL, ARRAY['33333333-3333-3333-3333-333333333333'], ARRAY['api', 'challenges', 'endpoints'], 0),
('55555555-5555-5555-5555-555555555555', 'Challenges Frontend Implementatie', 'Frontend pagina voor challenges systeem met challenge creation, progress tracking en leaderboards', 'frontend', 'high', 20, 0, 'pending', 'Frontend Team', '2025-08-20', '2025-08-05', NULL, ARRAY['33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'], ARRAY['frontend', 'challenges', 'ui'], 0),
('66666666-6666-6666-6666-666666666666', 'Voedingsplannen Database Schema', 'Database tabellen aanmaken voor nutrition_ingredients, nutrition_recipes, nutrition_plans en nutrition_educational_hubs', 'database', 'medium', 16, 0, 'pending', 'Backend Team', '2025-08-25', '2025-08-10', NULL, ARRAY[]::TEXT[], ARRAY['nutrition', 'database', 'schema'], 0),
('77777777-7777-7777-7777-777777777777', 'Mind & Focus Database Schema', 'Database tabellen aanmaken voor meditations, breathing_exercises, gratitude_journals en focus_sessions', 'database', 'medium', 12, 0, 'pending', 'Backend Team', '2025-08-25', '2025-08-12', NULL, ARRAY[]::TEXT[], ARRAY['mind', 'focus', 'database'], 0),
('88888888-8888-8888-8888-888888888888', 'Voedingsplannen & Mind & Focus API', 'API routes maken voor voeding en mind & focus features', 'api', 'medium', 20, 0, 'pending', 'Backend Team', '2025-08-27', '2025-08-15', NULL, ARRAY['66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777'], ARRAY['api', 'nutrition', 'mind'], 0),
('99999999-9999-9999-9999-999999999999', 'Voedingsplannen Frontend', 'Frontend implementatie voor voedingsplannen met recipe database en meal planning', 'frontend', 'medium', 24, 0, 'pending', 'Frontend Team', '2025-08-30', '2025-08-18', NULL, ARRAY['66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888'], ARRAY['frontend', 'nutrition', 'recipes'], 0),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mind & Focus Frontend', 'Frontend implementatie voor mind & focus features met meditation library en tracking', 'frontend', 'medium', 20, 0, 'pending', 'Frontend Team', '2025-08-30', '2025-08-20', NULL, ARRAY['77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888'], ARRAY['frontend', 'mind', 'meditation'], 0),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Finance & Business Database Schema', 'Database tabellen aanmaken voor financial_goals, investment_portfolios, cashflow_tracking en business_ideas', 'database', 'low', 16, 0, 'pending', 'Backend Team', '2025-09-05', '2025-08-25', NULL, ARRAY[]::TEXT[], ARRAY['finance', 'business', 'database'], 0),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Social Feed Database Schema', 'Database tabellen aanmaken voor social_posts, social_comments en social_likes', 'database', 'low', 12, 0, 'pending', 'Backend Team', '2025-09-10', '2025-08-28', NULL, ARRAY[]::TEXT[], ARRAY['social', 'feed', 'database'], 0),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Evenementen Database Schema', 'Database tabellen aanmaken voor events, event_participants en event_categories', 'database', 'low', 12, 0, 'pending', 'Backend Team', '2025-09-15', '2025-09-01', NULL, ARRAY[]::TEXT[], ARRAY['events', 'database', 'participants'], 0),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Performance Optimalisatie', 'Uitgebreide performance testing en optimalisatie van alle features', 'optimization', 'high', 20, 0, 'pending', 'Full Stack Team', '2025-08-30', '2025-08-10', NULL, ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'], ARRAY['performance', 'testing', 'optimization'], 0),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Comprehensive Testing', 'Uitgebreide testing van alle features inclusief unit tests, integration tests en user acceptance testing', 'testing', 'high', 20, 0, 'pending', 'QA Team', '2025-08-30', '2025-08-15', NULL, ARRAY['eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'], ARRAY['testing', 'qa', 'validation'], 0),
('11111111-1111-1111-1111-111111111112', 'Gebruikersregistratie & Onboarding Flow', 'Verbeterde registratie flow met email verificatie, profiel setup en onboarding wizard', 'frontend', 'critical', 20, 0, 'pending', 'Frontend Team', '2025-08-18', '2025-08-01', NULL, ARRAY[]::TEXT[], ARRAY['registration', 'onboarding', 'email-verification'], 0),
('22222222-2222-2222-2222-222222222223', 'Payment Wall & Abonnement Systeem', 'Stripe integratie voor membership abonnementen met payment wall en subscription management', 'backend', 'critical', 32, 0, 'pending', 'Backend Team', '2025-08-20', '2025-08-05', NULL, ARRAY['11111111-1111-1111-1111-111111111112'], ARRAY['stripe', 'payments', 'subscriptions'], 0),
('33333333-3333-3333-3333-333333333334', 'Email Flow & Notificaties', 'Comprehensive email systeem met welkom emails, onboarding reminders, en platform updates', 'backend', 'high', 16, 0, 'pending', 'Backend Team', '2025-08-22', '2025-08-10', NULL, ARRAY['11111111-1111-1111-1111-111111111112'], ARRAY['email', 'notifications', 'automation'], 0),
('44444444-4444-4444-4444-444444444445', 'Google Analytics & Tracking', 'Google Analytics 4 setup met custom events, conversion tracking en user journey analytics', 'integration', 'high', 12, 0, 'pending', 'Full Stack Team', '2025-08-22', '2025-08-15', NULL, ARRAY['11111111-1111-1111-1111-111111111112'], ARRAY['analytics', 'tracking', 'conversions'], 0),
('55555555-5555-5555-5555-555555555556', 'Final Testing & Launch Preparation', 'Uitgebreide testing, bug fixes en finale voorbereidingen voor platform launch', 'testing', 'critical', 40, 0, 'pending', 'Full Stack Team', '2025-08-25', '2025-08-18', NULL, ARRAY['ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333334', '44444444-4444-4444-4444-444444444445'], ARRAY['testing', 'bugfixes', 'launch-prep'], 0);

-- Insert sample subtasks for the first few main tasks
INSERT INTO todo_subtasks (task_id, title, description, estimated_hours, actual_hours, status, assigned_to, due_date, priority, order_index) VALUES
-- Subtasks for Boekenkamer Frontend Database Integratie
('11111111-1111-1111-1111-111111111111', 'Database Schema Analyse', 'Analyseren van bestaande books, book_categories en book_reviews tabellen', 2, 0, 'pending', 'Frontend Team', '2025-08-05', 'high', 1),
('11111111-1111-1111-1111-111111111111', 'API Routes Implementatie', 'Maken van API routes voor boekenkamer data fetching', 4, 0, 'pending', 'Frontend Team', '2025-08-07', 'high', 2),
('11111111-1111-1111-1111-111111111111', 'Frontend Componenten Migratie', 'Migreren van mock data naar echte database data in React componenten', 6, 0, 'pending', 'Frontend Team', '2025-08-10', 'high', 3),
('11111111-1111-1111-1111-111111111111', 'Error Handling & Loading States', 'Implementeren van proper error handling en loading states', 2, 0, 'pending', 'Frontend Team', '2025-08-11', 'medium', 4),
('11111111-1111-1111-1111-111111111111', 'Testing & Validatie', 'Testing van alle boekenkamer functionaliteiten', 2, 0, 'pending', 'Frontend Team', '2025-08-12', 'medium', 5),

-- Subtasks for Mijn Missies Volledige Database Integratie
('22222222-2222-2222-2222-222222222222', 'User Missions API Routes', 'Maken van API routes voor user_missions tabel', 2, 0, 'pending', 'Frontend Team', '2025-08-05', 'high', 1),
('22222222-2222-2222-2222-222222222222', 'Progress Tracking Implementatie', 'Implementeren van real-time progress tracking', 3, 0, 'pending', 'Frontend Team', '2025-08-08', 'high', 2),
('22222222-2222-2222-2222-222222222222', 'Achievement Notifications', 'Systeem voor achievement notifications en badges', 2, 0, 'pending', 'Frontend Team', '2025-08-10', 'medium', 3),
('22222222-2222-2222-2222-222222222222', 'UI/UX Verbeteringen', 'Verbeteren van de missies interface en user experience', 1, 0, 'pending', 'Frontend Team', '2025-08-12', 'low', 4),

-- Subtasks for Challenges Database Schema Design
('33333333-3333-3333-3333-333333333333', 'Challenges Tabel Design', 'Design van challenges tabel met alle benodigde velden', 3, 0, 'pending', 'Backend Team', '2025-08-03', 'high', 1),
('33333333-3333-3333-3333-333333333333', 'User Challenges Tabel Design', 'Design van user_challenges tabel voor progress tracking', 3, 0, 'pending', 'Backend Team', '2025-08-05', 'high', 2),
('33333333-3333-3333-3333-333333333333', 'Challenge Categories Tabel Design', 'Design van challenge_categories tabel', 2, 0, 'pending', 'Backend Team', '2025-08-07', 'medium', 3),
('33333333-3333-3333-3333-333333333333', 'RLS Policies Implementatie', 'Implementeren van Row Level Security policies', 2, 0, 'pending', 'Backend Team', '2025-08-09', 'high', 4),
('33333333-3333-3333-3333-333333333333', 'Indexes & Performance Optimalisatie', 'Aanmaken van database indexes voor performance', 2, 0, 'pending', 'Backend Team', '2025-08-11', 'medium', 5),

-- Subtasks for Payment Wall & Abonnement Systeem
('22222222-2222-2222-2222-222222222223', 'Stripe Account Setup', 'Setup van Stripe account en configuratie', 2, 0, 'pending', 'Backend Team', '2025-08-06', 'critical', 1),
('22222222-2222-2222-2222-222222222223', 'Payment Intent API', 'Implementeren van Stripe Payment Intent API', 6, 0, 'pending', 'Backend Team', '2025-08-10', 'critical', 2),
('22222222-2222-2222-2222-222222222223', 'Subscription Management', 'Implementeren van subscription creation en management', 8, 0, 'pending', 'Backend Team', '2025-08-14', 'critical', 3),
('22222222-2222-2222-2222-222222222223', 'Payment Wall UI', 'Frontend payment wall met abonnement opties', 8, 0, 'pending', 'Backend Team', '2025-08-17', 'high', 4),
('22222222-2222-2222-2222-222222222223', 'Webhook Handling', 'Implementeren van Stripe webhook handling', 4, 0, 'pending', 'Backend Team', '2025-08-19', 'high', 5),
('22222222-2222-2222-2222-222222222223', 'Invoice Generation', 'Systeem voor automatische factuur generatie', 4, 0, 'pending', 'Backend Team', '2025-08-20', 'medium', 6);

-- Insert sample milestones
INSERT INTO todo_milestones (id, title, description, target_date, status, priority, total_tasks, completed_tasks, progress_percentage, tags) VALUES
('11111111-1111-1111-1111-111111111113', 'Frontend Database Integratie', 'Alle frontend pagina''s migreren van mock data naar echte database data', '2025-08-12', 'in_progress', 'high', 2, 0, 0, ARRAY['frontend', 'database', 'integration']),
('22222222-2222-2222-2222-222222222224', 'Challenges & Gamification Systeem', 'Volledig challenges systeem met leaderboards en achievement tracking', '2025-08-20', 'planned', 'high', 3, 0, 0, ARRAY['challenges', 'gamification', 'leaderboards']),
('33333333-3333-3333-3333-333333333335', 'Voedingsplannen & Mind & Focus', 'Database integratie voor voeding, meditatie en focus features', '2025-08-30', 'planned', 'medium', 5, 0, 0, ARRAY['nutrition', 'mind', 'focus', 'meditation']),
('44444444-4444-4444-4444-444444444446', 'Finance & Business Tools', 'Financiële calculators en business planning tools met database', '2025-09-05', 'planned', 'low', 1, 0, 0, ARRAY['finance', 'business', 'calculators']),
('55555555-5555-5555-5555-555555555557', 'Social Feed & Evenementen', 'Real-time social feed en evenementen management systeem', '2025-09-15', 'planned', 'low', 2, 0, 0, ARRAY['social-feed', 'events', 'real-time']),
('66666666-6666-6666-6666-666666666667', 'Performance Optimalisatie & Testing', 'Uitgebreide testing, performance optimalisatie en bug fixes', '2025-08-30', 'planned', 'high', 2, 0, 0, ARRAY['performance', 'testing', 'optimization']),
('77777777-7777-7777-7777-777777777778', 'Gebruikersregistratie & Payment Systeem', 'Registratie flow, payment wall en abonnement management', '2025-08-20', 'planned', 'critical', 2, 0, 0, ARRAY['registration', 'payments', 'subscriptions']),
('88888888-8888-8888-8888-888888888889', 'Email & Analytics Integratie', 'Email flow, notificaties en Google Analytics tracking', '2025-08-22', 'planned', 'high', 2, 0, 0, ARRAY['email', 'analytics', 'tracking']),
('99999999-9999-9999-9999-999999999990', 'Platform Launch - September 2025', 'Finale testing, optimalisatie en platform launch', '2025-09-01', 'in_progress', 'critical', 1, 0, 25, ARRAY['launch', 'testing', 'optimization']);

-- Insert sample statistics
INSERT INTO todo_statistics (date, total_tasks, completed_tasks, pending_tasks, in_progress_tasks, blocked_tasks, total_estimated_hours, total_actual_hours, average_completion_time, tasks_by_priority, tasks_by_category) VALUES
('2025-07-27', 20, 0, 20, 0, 0, 336, 0, 0, 
  '{"critical": 3, "high": 10, "medium": 5, "low": 2}'::jsonb,
  '{"frontend": 6, "backend": 2, "database": 6, "api": 2, "testing": 2, "deployment": 0, "documentation": 0, "ui": 0, "integration": 1, "optimization": 1}'::jsonb);

-- Show verification
SELECT 'Todo tables created successfully!' as status;
SELECT COUNT(*) as total_tasks FROM todo_tasks;
SELECT COUNT(*) as total_subtasks FROM todo_subtasks;
SELECT COUNT(*) as total_milestones FROM todo_milestones;
SELECT COUNT(*) as total_statistics FROM todo_statistics; 