const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTodoTables() {
  try {
    console.log('🚀 Creating todo tables directly...');
    
    // Create todo_tasks table
    console.log('📝 Creating todo_tasks table...');
    const { error: tasksError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });
    
    if (tasksError) {
      console.error('❌ Error creating todo_tasks table:', tasksError);
    } else {
      console.log('✅ todo_tasks table created');
    }
    
    // Create todo_subtasks table
    console.log('📝 Creating todo_subtasks table...');
    const { error: subtasksError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });
    
    if (subtasksError) {
      console.error('❌ Error creating todo_subtasks table:', subtasksError);
    } else {
      console.log('✅ todo_subtasks table created');
    }
    
    // Create todo_milestones table
    console.log('📝 Creating todo_milestones table...');
    const { error: milestonesError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });
    
    if (milestonesError) {
      console.error('❌ Error creating todo_milestones table:', milestonesError);
    } else {
      console.log('✅ todo_milestones table created');
    }
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO todo_tasks (id, title, description, category, priority, estimated_hours, actual_hours, status, assigned_to, due_date, start_date, completion_date, dependencies, tags, progress_percentage) VALUES
        ('11111111-1111-1111-1111-111111111111', 'Boekenkamer Frontend Database Integratie', 'Frontend pagina voor boekenkamer migreren van mock data naar echte database data uit books, book_categories en book_reviews tabellen', 'frontend', 'high', 16, 0, 'pending', 'Frontend Team', '2025-08-12', '2025-07-28', NULL, ARRAY['database', 'frontend', 'books'], 0),
        ('22222222-2222-2222-2222-222222222222', 'Mijn Missies Volledige Database Integratie', 'Volledige database integratie voor user_missions tabel met real-time progress tracking en achievement notifications', 'frontend', 'high', 8, 0, 'pending', 'Frontend Team', '2025-08-12', '2025-07-30', NULL, ARRAY['missions', 'database', 'progress'], 0),
        ('33333333-3333-3333-3333-333333333333', 'Challenges Database Schema Design', 'Database tabellen aanmaken voor challenges, user_challenges en challenge_categories met RLS policies en indexes', 'database', 'high', 12, 0, 'pending', 'Backend Team', '2025-08-15', '2025-08-01', NULL, ARRAY['challenges', 'database', 'schema'], 0)
        ON CONFLICT (id) DO NOTHING;
      `
    });
    
    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError);
    } else {
      console.log('✅ Sample data inserted');
    }
    
    console.log('🎉 Todo tables creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating todo tables:', error);
  }
}

createTodoTables(); 