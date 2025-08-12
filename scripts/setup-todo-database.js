const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTodoDatabase() {
  try {
    console.log('🔧 Setting up todo_tasks database...');
    
    // SQL to create the table
    const createTableSQL = `
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
    `;

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('❌ Error creating table:', error);
      console.log('💡 You may need to run this manually in the Supabase SQL Editor');
      return;
    }

    console.log('✅ Table created successfully');

    // Insert sample data
    const sampleData = [
      {
        id: 'sample-task-001',
        title: 'Sample Task voor Chiel',
        description: 'Dit is een sample taak om te testen of de database werkt.',
        category: 'development',
        priority: 'medium',
        estimated_hours: 2,
        status: 'pending',
        assigned_to: 'Chiel',
        due_date: '2025-12-31',
        start_date: '2025-01-01',
        progress_percentage: 0
      },
      {
        id: 'sample-task-002',
        title: 'Test Zoekfunctie',
        description: 'Test taak om te controleren of de zoekfunctie werkt.',
        category: 'testing',
        priority: 'low',
        estimated_hours: 1,
        status: 'in_progress',
        assigned_to: 'Chiel',
        due_date: '2025-12-31',
        start_date: '2025-01-01',
        progress_percentage: 50
      },
      {
        id: 'sample-task-003',
        title: 'Database Integratie Test',
        description: 'Test of de database integratie werkt voor taken beheer.',
        category: 'database',
        priority: 'high',
        estimated_hours: 4,
        status: 'pending',
        assigned_to: 'Chiel',
        due_date: '2025-12-31',
        start_date: '2025-01-01',
        progress_percentage: 0
      }
    ];

    const { data: insertData, error: insertError } = await supabase
      .from('todo_tasks')
      .insert(sampleData);

    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError);
    } else {
      console.log('✅ Sample data inserted successfully');
    }

    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('todo_tasks')
      .select('*')
      .limit(5);

    if (testError) {
      console.error('❌ Error testing table:', testError);
    } else {
      console.log(`✅ Table test successful: ${testData.length} tasks found`);
      console.log('🎉 Todo database setup complete!');
    }

  } catch (error) {
    console.error('❌ Error setting up todo database:', error);
    console.log('💡 You may need to run the SQL manually in the Supabase dashboard');
  }
}

setupTodoDatabase(); 