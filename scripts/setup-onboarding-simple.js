const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupOnboarding() {
  try {
    console.log('🏗️ Setting up onboarding system...');
    
    // Create the table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS onboarding_status (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
        welcome_video_watched BOOLEAN DEFAULT FALSE,
        step_1_completed BOOLEAN DEFAULT FALSE,
        step_2_completed BOOLEAN DEFAULT FALSE,
        step_3_completed BOOLEAN DEFAULT FALSE,
        step_4_completed BOOLEAN DEFAULT FALSE,
        step_5_completed BOOLEAN DEFAULT FALSE,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        current_step INTEGER DEFAULT 1,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log('📝 Creating onboarding_status table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql_query: createTableSQL
    });
    
    if (tableError) {
      console.log('❌ Table creation error:', tableError.message);
    } else {
      console.log('✅ Table created successfully');
    }
    
    // Enable RLS
    console.log('🔒 Enabling RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('❌ RLS error:', rlsError.message);
    } else {
      console.log('✅ RLS enabled');
    }
    
    // Get all users
    console.log('👥 Getting all users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Users fetch error:', usersError.message);
      return;
    }
    
    console.log(`📊 Found ${users.users.length} users`);
    
    // Create onboarding status for each user
    for (const user of users.users) {
      const isRob = user.id === '14d7c55b-4ccd-453f-b79f-403f306f1efb';
      
      const onboardingData = {
        user_id: user.id,
        welcome_video_watched: !isRob, // Rob needs to watch it
        step_1_completed: !isRob,
        step_2_completed: !isRob,
        step_3_completed: !isRob,
        step_4_completed: !isRob,
        step_5_completed: !isRob,
        onboarding_completed: !isRob,
        current_step: isRob ? 1 : 6,
        completed_at: isRob ? null : new Date().toISOString()
      };
      
      console.log(`\n👤 Setting up onboarding for ${user.email} (${isRob ? 'NEW USER' : 'EXISTING USER'})...`);
      
      const { error: insertError } = await supabase
        .from('onboarding_status')
        .upsert(onboardingData, { onConflict: 'user_id' });
      
      if (insertError) {
        console.log(`❌ Error for ${user.email}:`, insertError.message);
      } else {
        console.log(`✅ Onboarding status set for ${user.email}`);
      }
    }
    
    console.log('\n🎉 Onboarding setup completed!');
    
    // Verify the setup
    const { data: allStatuses, error: verifyError } = await supabase
      .from('onboarding_status')
      .select('*');
    
    if (verifyError) {
      console.log('❌ Verification error:', verifyError.message);
    } else {
      console.log(`\n📊 Verification: ${allStatuses.length} onboarding statuses created`);
      
      allStatuses.forEach(status => {
        const isRob = status.user_id === '14d7c55b-4ccd-453f-b79f-403f306f1efb';
        console.log(`   ${isRob ? '🆕' : '👤'} User ${status.user_id}: ${status.onboarding_completed ? 'Completed' : 'Needs onboarding'} (Step ${status.current_step})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error setting up onboarding:', error);
  }
}

setupOnboarding(); 