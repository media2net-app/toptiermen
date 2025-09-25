const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAcademyTables() {
  try {
    console.log('🔧 Creating Academy completion tables...');
    
    // Create academy_lesson_completions table
    const { error: lessonCompletionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS academy_lesson_completions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          lesson_id UUID NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          score INTEGER DEFAULT 0,
          time_spent INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, lesson_id)
        );
      `
    });
    
    if (lessonCompletionsError) {
      console.error('❌ Error creating academy_lesson_completions:', lessonCompletionsError.message);
    } else {
      console.log('✅ Created academy_lesson_completions table');
    }
    
    // Create academy_module_completions table
    const { error: moduleCompletionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS academy_module_completions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          module_id UUID NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          total_lessons INTEGER DEFAULT 0,
          completed_lessons INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, module_id)
        );
      `
    });
    
    if (moduleCompletionsError) {
      console.error('❌ Error creating academy_module_completions:', moduleCompletionsError.message);
    } else {
      console.log('✅ Created academy_module_completions table');
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE academy_lesson_completions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE academy_module_completions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own lesson completions" ON academy_lesson_completions
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own lesson completions" ON academy_lesson_completions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can view their own module completions" ON academy_module_completions
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own module completions" ON academy_module_completions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });
    
    if (rlsError) {
      console.error('❌ Error setting up RLS:', rlsError.message);
    } else {
      console.log('✅ Set up RLS policies');
    }
    
    console.log('🎉 Academy tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating Academy tables:', error);
  }
}

createAcademyTables();
