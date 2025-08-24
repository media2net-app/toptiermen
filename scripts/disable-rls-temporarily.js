const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key to bypass RLS
);

async function disableRLSTemporarily() {
  try {
    console.log('🔧 Temporarily disabling RLS on user_badges table...');

    // Disable RLS on user_badges table
    const { error: disableError } = await supabase.rpc('disable_rls', {
      table_name: 'user_badges'
    });

    if (disableError) {
      console.log('⚠️ Could not disable RLS via RPC, trying direct SQL...');
      
      // Try direct SQL approach
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE user_badges DISABLE ROW LEVEL SECURITY;'
      });

      if (sqlError) {
        console.error('❌ Error disabling RLS:', sqlError);
        console.log('💡 You may need to disable RLS manually in Supabase dashboard');
        return;
      }
    }

    console.log('✅ RLS disabled on user_badges table');

    // Now add badges to Chiel
    console.log('\n🔍 Adding test badges to user "Chiel"...');

    // Find Chiel's user ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('full_name', '%Chiel%')
      .single();

    if (userError) {
      console.error('❌ Error finding user Chiel:', userError);
      return;
    }

    console.log('✅ Found user:', userData);

    // Get some badges to assign
    const { data: badgesData, error: badgesError } = await supabase
      .from('badges')
      .select('id, title, icon_name, rarity_level')
      .limit(5);

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
      return;
    }

    console.log(`✅ Found ${badgesData.length} badges to assign`);

    // Add badges to Chiel
    const userBadgesToInsert = badgesData.map(badge => ({
      user_id: userData.id,
      badge_id: badge.id,
      status: 'unlocked',
      unlocked_at: new Date().toISOString()
    }));

    console.log('\n🏆 Adding badges to Chiel:');
    badgesData.forEach((badge, index) => {
      console.log(`${index + 1}. ${badge.title} (${badge.rarity_level})`);
    });

    const { data: insertedData, error: insertError } = await supabase
      .from('user_badges')
      .insert(userBadgesToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting user badges:', insertError);
      return;
    }

    console.log('\n✅ Successfully added badges to Chiel!');
    console.log(`Added ${insertedData.length} badges`);

    // Re-enable RLS
    console.log('\n🔧 Re-enabling RLS on user_badges table...');
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;'
    });

    if (enableError) {
      console.error('❌ Error re-enabling RLS:', enableError);
    } else {
      console.log('✅ RLS re-enabled on user_badges table');
    }

    // Verify the badges were added
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        status,
        badges (
          title,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', userData.id);

    if (verifyError) {
      console.error('❌ Error verifying badges:', verifyError);
      return;
    }

    console.log('\n📊 Verification - Chiel now has:');
    console.log(`Total badges: ${verifyData?.length || 0}`);

    if (verifyData && verifyData.length > 0) {
      verifyData.forEach((userBadge, index) => {
        console.log(`\n${index + 1}. ${userBadge.badges.title}`);
        console.log(`   Icon: ${userBadge.badges.icon_name}`);
        console.log(`   Rarity: ${userBadge.badges.rarity_level}`);
        console.log(`   XP: ${userBadge.badges.xp_reward}`);
        console.log(`   Unlocked: ${userBadge.unlocked_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

disableRLSTemporarily();
