const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixOnboardingStatus() {
  console.log('\n🔧 ====== FIX ONBOARDING STATUS ======\n');

  try {
    // 1. Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name');

    if (profilesError) throw profilesError;
    console.log(`Found ${profiles.length} users\n`);

    // 2. First, check what columns exist in onboarding_status
    console.log('Checking existing onboarding_status table structure...');
    const { data: existingStatuses, error: checkError } = await supabase
      .from('onboarding_status')
      .select('*')
      .limit(1);

    if (checkError) {
      console.log('Error checking table:', checkError.message);
    } else if (existingStatuses && existingStatuses.length > 0) {
      console.log('Existing columns:', Object.keys(existingStatuses[0]).join(', '));
    }
    console.log('');

    // 3. Delete all existing onboarding status (clean slate)
    console.log('Deleting all existing onboarding statuses...');
    const { error: deleteError } = await supabase
      .from('onboarding_status')
      .delete()
      .in('user_id', profiles.map(p => p.id));

    if (deleteError) {
      console.log('Warning:', deleteError.message);
    } else {
      console.log('✓ Deleted existing statuses\n');
    }

    // 4. Create new onboarding status for each user with ONLY existing columns
    console.log('Creating new onboarding status records...');
    let successCount = 0;
    let errorCount = 0;

    for (const user of profiles) {
      // Try with minimal fields that definitely exist
      const { error } = await supabase
        .from('onboarding_status')
        .insert({
          user_id: user.id,
          onboarding_completed: false,
          current_step: 1,
          welcome_video_watched: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.log(`  ✗ ${user.email}: ${error.message}`);
        errorCount++;
      } else {
        successCount++;
      }
    }

    console.log(`\n✓ Created ${successCount} onboarding status records`);
    if (errorCount > 0) {
      console.log(`✗ ${errorCount} errors`);
    }

    // 5. Verify
    console.log('\nVerifying...');
    const { data: verifyStatuses, error: verifyError } = await supabase
      .from('onboarding_status')
      .select('user_id, current_step, onboarding_completed')
      .in('user_id', profiles.map(p => p.id));

    if (verifyError) {
      console.log('Verification error:', verifyError.message);
    } else {
      const atStep1 = verifyStatuses.filter(s => s.current_step === 1 && !s.onboarding_completed);
      console.log(`✓ ${atStep1.length} users are at step 1 and not completed`);
      
      if (atStep1.length !== profiles.length) {
        console.log(`⚠️  ${profiles.length - atStep1.length} users not properly set`);
      }
    }

    console.log('\n✅ Done!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

fixOnboardingStatus();

