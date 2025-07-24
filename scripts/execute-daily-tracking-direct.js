const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeDailyTrackingSQL() {
  console.log('🚀 Executing Daily Mission Tracking SQL directly...\n');

  try {
    // Add last_completion_date column
    console.log('📝 Adding last_completion_date column...');
    const { error: alterError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          ALTER TABLE user_missions 
          ADD COLUMN IF NOT EXISTS last_completion_date DATE;
        `
      });

    if (alterError) {
      console.error('❌ Error adding column:', alterError);
      return;
    }
    console.log('✅ Column added successfully');

    // Add index
    console.log('📝 Creating index...');
    const { error: indexError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          CREATE INDEX IF NOT EXISTS idx_user_missions_completion_date 
          ON user_missions(user_id, last_completion_date);
        `
      });

    if (indexError) {
      console.error('❌ Error creating index:', indexError);
    } else {
      console.log('✅ Index created successfully');
    }

    // Update existing completed missions
    console.log('📝 Updating existing completed missions...');
    const { error: updateError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          UPDATE user_missions 
          SET last_completion_date = CURRENT_DATE 
          WHERE status = 'completed' AND last_completion_date IS NULL;
        `
      });

    if (updateError) {
      console.error('❌ Error updating existing missions:', updateError);
    } else {
      console.log('✅ Existing missions updated successfully');
    }

    // Add comment
    console.log('📝 Adding column comment...');
    const { error: commentError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          COMMENT ON COLUMN user_missions.last_completion_date IS 
          'Date when the mission was last completed (for daily missions, this tracks daily completion)';
        `
      });

    if (commentError) {
      console.error('❌ Error adding comment:', commentError);
    } else {
      console.log('✅ Comment added successfully');
    }

    console.log('\n🎉 Daily Mission Tracking setup completed successfully!');
    console.log('✅ The user_missions table now supports daily tracking');
    console.log('🔄 Page refresh will maintain completed status for today');
    console.log('📅 New day will reset daily missions to "Te Doen"');

  } catch (error) {
    console.error('❌ Error executing SQL:', error);
  }
}

executeDailyTrackingSQL(); 