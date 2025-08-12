require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Creating todo_tasks table...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTodoTable() {
  try {
    console.log('🔍 Testing database connection...');
    
    // First, try to query the table to see if it exists
    const { data: existingTasks, error: queryError } = await supabase
      .from('todo_tasks')
      .select('count')
      .limit(1);

    if (queryError) {
      console.log('⚠️ Table does not exist, creating it...');
      
      // Create the table by inserting a test record (this will create the table if it doesn't exist)
      const { data: newTask, error: insertError } = await supabase
        .from('todo_tasks')
        .insert([{
          title: 'Test Task',
          description: 'This is a test task to create the table',
          category: 'testing',
          priority: 'low',
          estimated_hours: 1,
          status: 'pending',
          assigned_to: 'Admin',
          due_date: '2025-12-31',
          start_date: '2025-01-01',
          progress_percentage: 0
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
      console.log('✅ Test task inserted:', newTask.id);
      
      // Now delete the test task
      const { error: deleteError } = await supabase
        .from('todo_tasks')
        .delete()
        .eq('id', newTask.id);

      if (deleteError) {
        console.log('⚠️ Could not delete test task:', deleteError.message);
      } else {
        console.log('✅ Test task cleaned up');
      }
    } else {
      console.log('✅ todo_tasks table already exists');
    }

    // Test the connection by counting tasks
    const { count, error: countError } = await supabase
      .from('todo_tasks')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting tasks:', countError);
    } else {
      console.log(`✅ Database connection working. Found ${count} tasks.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTodoTable(); 