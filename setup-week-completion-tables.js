const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupWeekCompletionTables() {
  try {
    console.log('🔧 Setting up week completion tables...');

    // Create user_week_completions table
    console.log('📅 Creating user_week_completions table...');
    const { error: weekCompletionsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create user_week_completions table for tracking completed weeks
        CREATE TABLE IF NOT EXISTS user_week_completions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
          week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
          completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
          completed_days JSONB NOT NULL, -- Array of completed day objects
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- Ensure one completion per user per schema per week
          UNIQUE(user_id, schema_id, week_number)
        );
      `
    });

    if (weekCompletionsError) {
      console.error('❌ Error creating user_week_completions table:', weekCompletionsError);
    } else {
      console.log('✅ user_week_completions table created successfully');
    }

    // Create indexes for user_week_completions
    console.log('📊 Creating indexes for user_week_completions...');
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_user_week_completions_user_id ON user_week_completions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_week_completions_schema_id ON user_week_completions(schema_id);
        CREATE INDEX IF NOT EXISTS idx_user_week_completions_week_number ON user_week_completions(week_number);
        CREATE INDEX IF NOT EXISTS idx_user_week_completions_completed_at ON user_week_completions(completed_at);
      `
    });

    if (indexesError) {
      console.error('❌ Error creating indexes:', indexesError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Create user_week_completion_modal_views table
    console.log('📋 Creating user_week_completion_modal_views table...');
    const { error: modalViewsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create user_week_completion_modal_views table for tracking modal views
        CREATE TABLE IF NOT EXISTS user_week_completion_modal_views (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
          week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
          modal_shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          modal_closed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- Ensure one modal view record per user per schema per week
          UNIQUE(user_id, schema_id, week_number)
        );
      `
    });

    if (modalViewsError) {
      console.error('❌ Error creating user_week_completion_modal_views table:', modalViewsError);
    } else {
      console.log('✅ user_week_completion_modal_views table created successfully');
    }

    // Create indexes for modal views
    console.log('📊 Creating indexes for modal views...');
    const { error: modalIndexesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_user_week_completion_modal_views_user_id ON user_week_completion_modal_views(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_week_completion_modal_views_schema_id ON user_week_completion_modal_views(schema_id);
        CREATE INDEX IF NOT EXISTS idx_user_week_completion_modal_views_week_number ON user_week_completion_modal_views(week_number);
      `
    });

    if (modalIndexesError) {
      console.error('❌ Error creating modal indexes:', modalIndexesError);
    } else {
      console.log('✅ Modal indexes created successfully');
    }

    // Enable RLS and create policies
    console.log('🔒 Setting up RLS policies...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable Row Level Security (RLS)
        ALTER TABLE user_week_completions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_week_completion_modal_views ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies for user_week_completions
        DROP POLICY IF EXISTS "Users can view own week completions" ON user_week_completions;
        CREATE POLICY "Users can view own week completions" ON user_week_completions
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can create own week completions" ON user_week_completions;
        CREATE POLICY "Users can create own week completions" ON user_week_completions
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own week completions" ON user_week_completions;
        CREATE POLICY "Users can update own week completions" ON user_week_completions
          FOR UPDATE USING (auth.uid() = user_id);

        -- Create RLS policies for user_week_completion_modal_views
        DROP POLICY IF EXISTS "Users can view own modal views" ON user_week_completion_modal_views;
        CREATE POLICY "Users can view own modal views" ON user_week_completion_modal_views
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can create own modal views" ON user_week_completion_modal_views;
        CREATE POLICY "Users can create own modal views" ON user_week_completion_modal_views
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own modal views" ON user_week_completion_modal_views;
        CREATE POLICY "Users can update own modal views" ON user_week_completion_modal_views
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    if (rlsError) {
      console.error('❌ Error setting up RLS policies:', rlsError);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    console.log('🎉 Week completion tables setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up week completion tables:', error);
  }
}

setupWeekCompletionTables();
