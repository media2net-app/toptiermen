-- Create project logs table
CREATE TABLE IF NOT EXISTS project_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('feature', 'bugfix', 'improvement', 'database', 'ui', 'api', 'testing', 'deployment', 'planning', 'research')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  hours_spent DECIMAL(4,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'blocked', 'cancelled')),
  tags TEXT[],
  related_files TEXT[],
  screenshots TEXT[],
  before_after_comparison JSONB,
  impact_score INTEGER DEFAULT 3 CHECK (impact_score BETWEEN 1 AND 5),
  complexity_score INTEGER DEFAULT 3 CHECK (complexity_score BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  total_hours_estimated DECIMAL(6,2),
  total_hours_actual DECIMAL(6,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project statistics table
CREATE TABLE IF NOT EXISTS project_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_hours_spent DECIMAL(6,2) DEFAULT 0,
  features_completed INTEGER DEFAULT 0,
  bugs_fixed INTEGER DEFAULT 0,
  improvements_made INTEGER DEFAULT 0,
  lines_of_code_added INTEGER DEFAULT 0,
  lines_of_code_removed INTEGER DEFAULT 0,
  database_tables_created INTEGER DEFAULT 0,
  api_endpoints_created INTEGER DEFAULT 0,
  ui_components_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_logs_date ON project_logs(date);
CREATE INDEX IF NOT EXISTS idx_project_logs_category ON project_logs(category);
CREATE INDEX IF NOT EXISTS idx_project_logs_status ON project_logs(status);
CREATE INDEX IF NOT EXISTS idx_project_logs_priority ON project_logs(priority);
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_project_statistics_date ON project_statistics(date);

-- Enable Row Level Security
ALTER TABLE project_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Project logs admin all" ON project_logs FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Project logs public read" ON project_logs FOR SELECT USING (true);
CREATE POLICY "Project milestones admin all" ON project_milestones FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Project milestones public read" ON project_milestones FOR SELECT USING (true);
CREATE POLICY "Project statistics admin all" ON project_statistics FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Project statistics public read" ON project_statistics FOR SELECT USING (true);

-- Insert sample project logs (based on our actual development)
INSERT INTO project_logs (date, day_number, title, description, category, priority, hours_spent, status, tags, impact_score, complexity_score) VALUES
('2024-01-15', 1, 'Project Setup & Database Integration', 'Initial project setup with Next.js, Supabase integration, and basic database schema creation. Set up authentication system and admin dashboard structure.', 'feature', 'high', 8.5, 'completed', ARRAY['setup', 'database', 'authentication'], 5, 4),
('2024-01-15', 1, 'Admin Dashboard Foundation', 'Created admin dashboard layout with sidebar navigation, user management, and basic CRUD operations for core entities.', 'ui', 'high', 6.0, 'completed', ARRAY['admin', 'dashboard', 'ui'], 4, 3),
('2024-01-16', 2, 'User Authentication System', 'Implemented complete user authentication system with login, registration, password reset, and role-based access control.', 'feature', 'critical', 7.0, 'completed', ARRAY['auth', 'security', 'roles'], 5, 4),
('2024-01-16', 2, 'Database Schema Design', 'Designed comprehensive database schema for users, profiles, training modules, nutrition plans, and community features.', 'database', 'high', 5.5, 'completed', ARRAY['database', 'schema', 'design'], 5, 4),
('2024-01-17', 3, 'Training Center Module', 'Built complete training center with workout schemas, exercise management, and progress tracking system.', 'feature', 'high', 9.0, 'completed', ARRAY['training', 'workouts', 'exercises'], 5, 4),
('2024-01-17', 3, 'Nutrition Plans System', 'Created nutrition management system with ingredients, recipes, meal plans, and calorie tracking.', 'feature', 'high', 8.0, 'completed', ARRAY['nutrition', 'meals', 'tracking'], 4, 4),
('2024-01-18', 4, 'Academy Learning Platform', 'Developed academy system with modules, lessons, progress tracking, and educational content management.', 'feature', 'high', 10.0, 'completed', ARRAY['academy', 'learning', 'education'], 5, 5),
('2024-01-18', 4, 'Community Features', 'Implemented community features including forums, social feed, and user interactions.', 'feature', 'medium', 7.5, 'completed', ARRAY['community', 'forum', 'social'], 4, 4),
('2024-01-19', 5, 'Gamification System', 'Built gamification system with badges, ranks, XP tracking, and achievement system.', 'feature', 'medium', 8.0, 'completed', ARRAY['gamification', 'badges', 'achievements'], 4, 4),
('2024-01-19', 5, 'Event Management', 'Created event management system for community events, registrations, and notifications.', 'feature', 'medium', 6.5, 'completed', ARRAY['events', 'management', 'notifications'], 3, 3),
('2024-01-20', 6, 'Admin Dashboard Database Integration', 'Completed Phase 1: Integrated all admin dashboard pages with database, replacing mock data with live data.', 'improvement', 'high', 12.0, 'completed', ARRAY['admin', 'database', 'integration'], 5, 4),
('2024-01-20', 6, 'Social Feed Database Integration', 'Created social feed tables and API routes, integrated with admin dashboard for content moderation.', 'database', 'medium', 4.0, 'completed', ARRAY['social', 'feed', 'moderation'], 3, 3),
('2024-01-20', 6, 'Platform Settings System', 'Built comprehensive platform settings system with database storage and admin interface.', 'feature', 'medium', 5.0, 'completed', ARRAY['settings', 'configuration', 'admin'], 4, 3)
ON CONFLICT DO NOTHING;

-- Insert project milestones
INSERT INTO project_milestones (title, description, target_date, completed_date, status, priority, total_hours_estimated, total_hours_actual) VALUES
('Phase 1: Admin Dashboard Database Integration', 'Complete integration of all admin dashboard pages with database, eliminating mock data', '2024-01-20', '2024-01-20', 'completed', 'high', 15.0, 21.0),
('Phase 2: User Dashboard Database Integration', 'Integrate user-facing pages with database and implement real-time data', '2024-01-25', NULL, 'planned', 'high', 20.0, NULL),
('Phase 3: Performance Optimization', 'Implement caching, optimize queries, and improve overall platform performance', '2024-01-30', NULL, 'planned', 'medium', 12.0, NULL),
('Phase 4: Advanced Features', 'Implement real-time notifications, advanced analytics, and machine learning features', '2024-02-05', NULL, 'planned', 'medium', 25.0, NULL),
('MVP Launch', 'Complete minimum viable product ready for beta testing', '2024-02-10', NULL, 'planned', 'critical', 50.0, NULL)
ON CONFLICT DO NOTHING;

-- Insert daily statistics
INSERT INTO project_statistics (date, total_hours_spent, features_completed, bugs_fixed, improvements_made, lines_of_code_added, database_tables_created, api_endpoints_created, ui_components_created) VALUES
('2024-01-15', 14.5, 2, 0, 0, 1500, 8, 5, 12),
('2024-01-16', 12.5, 2, 1, 0, 1200, 6, 8, 8),
('2024-01-17', 17.0, 2, 0, 1, 2000, 10, 12, 15),
('2024-01-18', 17.5, 2, 2, 0, 1800, 8, 10, 12),
('2024-01-19', 14.5, 2, 1, 1, 1600, 6, 8, 10),
('2024-01-20', 21.0, 3, 0, 2, 2200, 4, 6, 8)
ON CONFLICT (date) DO NOTHING;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_project_logs_updated_at BEFORE UPDATE ON project_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON project_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_statistics_updated_at BEFORE UPDATE ON project_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON project_logs TO authenticated;
GRANT ALL ON project_milestones TO authenticated;
GRANT ALL ON project_statistics TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 