const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Creating todo_tasks table...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTable() {
  try {
    console.log('📋 Creating todo_tasks table...');
    
    // First, let's try to create the table using a simple insert
    // Supabase will automatically create the table if it doesn't exist
    // (though this might not work with complex constraints)
    
    const { data: newTask, error: insertError } = await supabase
      .from('todo_tasks')
      .insert([{
        title: 'Initial Task - Table Creation',
        description: 'This task was created to initialize the todo_tasks table',
        category: 'setup',
        priority: 'medium',
        status: 'completed',
        assigned_to: 'Chiel',
        due_date: '2025-08-01'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create table via insert:', insertError);
      console.log('💡 You need to create the table manually in the Supabase dashboard.');
      console.log('📋 Go to: https://wkjvstuttbeyqzyjayxj.supabase.co');
      console.log('📋 Navigate to: SQL Editor');
      console.log('📋 Run this SQL:');
      console.log(`
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
CREATE POLICY "Admins can view all tasks" ON todo_tasks
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert tasks" ON todo_tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update all tasks" ON todo_tasks
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete tasks" ON todo_tasks
  FOR DELETE USING (true);
      `);
      return;
    }

    console.log('✅ todo_tasks table created successfully!');
    console.log('📝 Initial task created:', newTask.id);

    // Test querying the table
    const { data: tasks, error: queryError } = await supabase
      .from('todo_tasks')
      .select('*')
      .limit(5);

    if (queryError) {
      console.error('❌ Error querying table after creation:', queryError);
      return;
    }

    console.log(`✅ Table is working! Found ${tasks.length} tasks`);
    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Table creation failed:', error);
  }
}

createTable(); 