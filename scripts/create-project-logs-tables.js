const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createProjectLogsTables() {
  console.log('🚀 Creating project logs tables...');

  try {
    // Create project_logs table
    const { error: logsError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (logsError) {
      console.error('❌ Error creating project_logs table:', logsError);
    } else {
      console.log('✅ project_logs table created');
    }

    // Create project_milestones table
    const { error: milestonesError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (milestonesError) {
      console.error('❌ Error creating project_milestones table:', milestonesError);
    } else {
      console.log('✅ project_milestones table created');
    }

    // Create project_statistics table
    const { error: statsError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (statsError) {
      console.error('❌ Error creating project_statistics table:', statsError);
    } else {
      console.log('✅ project_statistics table created');
    }

    // Insert sample data
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (insertError) {
      console.error('❌ Error inserting sample project logs:', insertError);
    } else {
      console.log('✅ Sample project logs inserted');
    }

    // Insert milestones
    const { error: milestonesInsertError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO project_milestones (title, description, target_date, completed_date, status, priority, total_hours_estimated, total_hours_actual) VALUES
        ('Phase 1: Admin Dashboard Database Integration', 'Complete integration of all admin dashboard pages with database, eliminating mock data', '2024-01-20', '2024-01-20', 'completed', 'high', 15.0, 21.0),
        ('Phase 2: User Dashboard Database Integration', 'Integrate user-facing pages with database and implement real-time data', '2024-01-25', NULL, 'planned', 'high', 20.0, NULL),
        ('Phase 3: Performance Optimization', 'Implement caching, optimize queries, and improve overall platform performance', '2024-01-30', NULL, 'planned', 'medium', 12.0, NULL),
        ('Phase 4: Advanced Features', 'Implement real-time notifications, advanced analytics, and machine learning features', '2024-02-05', NULL, 'planned', 'medium', 25.0, NULL),
        ('MVP Launch', 'Complete minimum viable product ready for beta testing', '2024-02-10', NULL, 'planned', 'critical', 50.0, NULL)
        ON CONFLICT DO NOTHING;
      `
    });

    if (milestonesInsertError) {
      console.error('❌ Error inserting milestones:', milestonesInsertError);
    } else {
      console.log('✅ Milestones inserted');
    }

    // Insert statistics
    const { error: statsInsertError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO project_statistics (date, total_hours_spent, features_completed, bugs_fixed, improvements_made, lines_of_code_added, database_tables_created, api_endpoints_created, ui_components_created) VALUES
        ('2024-01-15', 14.5, 2, 0, 0, 1500, 8, 5, 12),
        ('2024-01-16', 12.5, 2, 1, 0, 1200, 6, 8, 8),
        ('2024-01-17', 17.0, 2, 0, 1, 2000, 10, 12, 15),
        ('2024-01-18', 17.5, 2, 2, 0, 1800, 8, 10, 12),
        ('2024-01-19', 14.5, 2, 1, 1, 1600, 6, 8, 10),
        ('2024-01-20', 21.0, 3, 0, 2, 2200, 4, 6, 8)
        ON CONFLICT (date) DO NOTHING;
      `
    });

    if (statsInsertError) {
      console.error('❌ Error inserting statistics:', statsInsertError);
    } else {
      console.log('✅ Statistics inserted');
    }

    console.log('🎉 Project logs tables setup completed!');

  } catch (error) {
    console.error('❌ Error creating project logs tables:', error);
  }
}

createProjectLogsTables(); 