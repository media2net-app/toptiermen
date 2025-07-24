const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingColumns() {
  console.log('🔧 Adding Missing Columns to user_missions...\n');

  try {
    // Add frequency_type column
    console.log('📝 Adding frequency_type column...');
    const { error: freqError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          ALTER TABLE user_missions 
          ADD COLUMN IF NOT EXISTS frequency_type VARCHAR(20) DEFAULT 'daily';
        `
      });

    if (freqError) {
      console.error('❌ Error adding frequency_type:', freqError);
    } else {
      console.log('✅ frequency_type column added');
    }

    // Add xp_reward column
    console.log('📝 Adding xp_reward column...');
    const { error: xpError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          ALTER TABLE user_missions 
          ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 15;
        `
      });

    if (xpError) {
      console.error('❌ Error adding xp_reward:', xpError);
    } else {
      console.log('✅ xp_reward column added');
    }

    // Update existing missions with default values
    console.log('📝 Updating existing missions with default values...');
    const { error: updateError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          UPDATE user_missions 
          SET 
            frequency_type = 'daily',
            xp_reward = 15
          WHERE frequency_type IS NULL OR xp_reward IS NULL;
        `
      });

    if (updateError) {
      console.error('❌ Error updating missions:', updateError);
    } else {
      console.log('✅ Existing missions updated with default values');
    }

    console.log('\n🎉 Missing columns added successfully!');

    // Verify the changes
    console.log('\n📋 Verifying changes...');
    const { data: userMissions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .limit(3);

    if (missionsError) {
      console.error('❌ Error getting missions:', missionsError);
      return;
    }

    console.log(`📊 Sample missions:\n`);
    
    userMissions.forEach((mission, index) => {
      console.log(`${index + 1}. "${mission.title}"`);
      console.log(`   Type: ${mission.frequency_type}`);
      console.log(`   XP Reward: ${mission.xp_reward}`);
      console.log(`   Status: ${mission.status}`);
      console.log(`   Last Completion: ${mission.last_completion_date}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addMissingColumns(); 