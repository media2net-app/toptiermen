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

    // Test if tables already exist
    console.log('🔍 Checking if tables already exist...');
    
    // Check user_week_completions table
    const { data: weekCompletionsCheck, error: weekCompletionsCheckError } = await supabase
      .from('user_week_completions')
      .select('id')
      .limit(1);

    if (weekCompletionsCheckError && weekCompletionsCheckError.code === 'PGRST116') {
      console.log('📅 user_week_completions table does not exist, creating...');
      
      // We need to create the table via SQL editor in Supabase dashboard
      console.log('⚠️  Manual setup required:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Run the SQL from create-week-completion-table.sql');
      console.log('3. Run the SQL from create-week-completion-modal-views.sql');
      console.log('');
      console.log('Or run these commands in your database:');
      console.log('');
      console.log('-- Create user_week_completions table');
      console.log('CREATE TABLE IF NOT EXISTS user_week_completions (');
      console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
      console.log('  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,');
      console.log('  schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,');
      console.log('  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),');
      console.log('  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,');
      console.log('  completed_days JSONB NOT NULL,');
      console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  UNIQUE(user_id, schema_id, week_number)');
      console.log(');');
      console.log('');
      console.log('-- Create user_week_completion_modal_views table');
      console.log('CREATE TABLE IF NOT EXISTS user_week_completion_modal_views (');
      console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
      console.log('  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,');
      console.log('  schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,');
      console.log('  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),');
      console.log('  modal_shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  modal_closed_at TIMESTAMP WITH TIME ZONE,');
      console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  UNIQUE(user_id, schema_id, week_number)');
      console.log(');');
      
    } else if (weekCompletionsCheckError) {
      console.error('❌ Error checking user_week_completions table:', weekCompletionsCheckError);
    } else {
      console.log('✅ user_week_completions table already exists');
    }

    // Check user_week_completion_modal_views table
    const { data: modalViewsCheck, error: modalViewsCheckError } = await supabase
      .from('user_week_completion_modal_views')
      .select('id')
      .limit(1);

    if (modalViewsCheckError && modalViewsCheckError.code === 'PGRST116') {
      console.log('📋 user_week_completion_modal_views table does not exist');
    } else if (modalViewsCheckError) {
      console.error('❌ Error checking user_week_completion_modal_views table:', modalViewsCheckError);
    } else {
      console.log('✅ user_week_completion_modal_views table already exists');
    }

    console.log('');
    console.log('🔧 To fix the week progression issue:');
    console.log('1. Create the missing tables using the SQL scripts');
    console.log('2. The week progression should work correctly after that');
    console.log('');
    console.log('The issue is that the week completion tracking tables don\'t exist,');
    console.log('so the system can\'t remember which weeks have been completed.');

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

setupWeekCompletionTables();
