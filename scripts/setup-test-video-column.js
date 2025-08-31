const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupTestVideoColumn() {
  console.log('🔧 Setting up test video column...\n');

  try {
    // Check if column already exists
    console.log('📋 STEP 1: Checking if test_video_watched column exists');
    console.log('----------------------------------------');
    
    try {
      const { data: columns, error: columnsError } = await supabase
        .from('onboarding_status')
        .select('test_video_watched')
        .limit(1);

      if (columnsError && columnsError.message.includes('test_video_watched')) {
        console.log('❌ test_video_watched column does not exist');
        console.log('📊 Error:', columnsError.message);
      } else {
        console.log('✅ test_video_watched column already exists');
        return;
      }
    } catch (error) {
      console.log('❌ Column check failed:', error.message);
    }

    // Add the column manually
    console.log('\n📋 STEP 2: Adding test_video_watched column');
    console.log('----------------------------------------');
    
    try {
      const { error: alterError } = await supabase
        .rpc('exec_sql', { 
          sql: `
            ALTER TABLE onboarding_status 
            ADD COLUMN IF NOT EXISTS test_video_watched BOOLEAN DEFAULT FALSE;
          `
        });

      if (alterError) {
        console.log('❌ Failed to add column via RPC:', alterError.message);
        console.log('📋 Please run this SQL manually in Supabase:');
        console.log(`
ALTER TABLE onboarding_status 
ADD COLUMN IF NOT EXISTS test_video_watched BOOLEAN DEFAULT FALSE;

UPDATE onboarding_status 
SET test_video_watched = FALSE 
WHERE test_video_watched IS NULL;
        `);
        return;
      }

      console.log('✅ Column added successfully');
    } catch (error) {
      console.log('❌ RPC failed:', error.message);
      console.log('📋 Please run this SQL manually in Supabase:');
      console.log(`
ALTER TABLE onboarding_status 
ADD COLUMN IF NOT EXISTS test_video_watched BOOLEAN DEFAULT FALSE;

UPDATE onboarding_status 
SET test_video_watched = FALSE 
WHERE test_video_watched IS NULL;
      `);
      return;
    }

    // Verify the column was added
    console.log('\n📋 STEP 3: Verifying column was added');
    console.log('----------------------------------------');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('onboarding_status')
        .select('test_video_watched')
        .limit(1);

      if (testError) {
        console.log('❌ Verification failed:', testError.message);
      } else {
        console.log('✅ Column verification successful');
        console.log('📊 Sample data:', testData);
      }
    } catch (error) {
      console.log('❌ Verification failed:', error.message);
    }

    console.log('\n🎉 Test video column setup completed!');

  } catch (error) {
    console.error('❌ Error during setup:', error);
  }
}

setupTestVideoColumn();
