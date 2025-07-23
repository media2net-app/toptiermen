const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function populateXPDataServiceRole() {
  console.log('🚀 Populating XP and Badges Data (Service Role)...\n');

  try {
    // Get all profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`📊 Found ${profilesData.length} profiles to process`);

    // Get ranks data
    const { data: ranksData, error: ranksError } = await supabase
      .from('ranks')
      .select('*')
      .order('rank_order');

    if (ranksError) {
      console.error('❌ Error fetching ranks:', ranksError);
      return;
    }

    // Define XP and badge data for each user
    const userData = {
      '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c': { // Rick
        xp: 4200,
        rankId: 3, // Disciplined
        badges: [1, 2, 3, 4, 5] // 5 badges
      },
      '061e43d5-c89a-42bb-8a4c-04be2ce99a7e': { // Chiel
        xp: 2500,
        rankId: 3, // Disciplined
        badges: [] // 0 badges
      },
      '550e8400-e29b-41d4-a716-446655440001': { // Daniel
        xp: 18750,
        rankId: 5, // Alpha
        badges: [1, 2, 3, 4, 5, 6] // 6 badges
      },
      '550e8400-e29b-41d4-a716-446655440002': { // Rico
        xp: 16500,
        rankId: 5, // Alpha
        badges: [1, 2, 3, 4, 5] // 5 badges
      },
      '550e8400-e29b-41d4-a716-446655440003': { // Sem
        xp: 14200,
        rankId: 4, // Warrior
        badges: [1, 2, 3, 4] // 4 badges
      },
      '550e8400-e29b-41d4-a716-446655440004': { // Marco
        xp: 12800,
        rankId: 4, // Warrior
        badges: [1, 2, 3] // 3 badges
      }
    };

    // Clear existing data
    console.log('🧹 Clearing existing XP and badge data...');
    await supabase.from('user_badges').delete().neq('id', 0);
    await supabase.from('user_xp').delete().neq('id', 0);
    await supabase.from('xp_transactions').delete().neq('id', 0);

    // Insert XP data for each user
    console.log('⚡ Inserting XP data...');
    for (const [userId, data] of Object.entries(userData)) {
      const { error: xpError } = await supabase
        .from('user_xp')
        .insert({
          user_id: userId,
          total_xp: data.xp,
          current_rank_id: data.rankId,
          rank_achieved_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (xpError) {
        console.error(`❌ Error inserting XP for user ${userId}:`, xpError);
      } else {
        console.log(`✅ XP data inserted for user ${userId}: ${data.xp} XP, Rank ${data.rankId}`);
      }
    }

    // Insert badge data for each user
    console.log('🏅 Inserting badge data...');
    for (const [userId, data] of Object.entries(userData)) {
      for (const badgeId of data.badges) {
        const { error: badgeError } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badgeId,
            status: 'unlocked',
            unlocked_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (badgeError) {
          console.error(`❌ Error inserting badge ${badgeId} for user ${userId}:`, badgeError);
        }
      }
      console.log(`✅ ${data.badges.length} badges inserted for user ${userId}`);
    }

    // Insert XP transaction history
    console.log('📝 Inserting XP transaction history...');
    for (const [userId, data] of Object.entries(userData)) {
      if (data.xp > 0) {
        const { error: transactionError } = await supabase
          .from('xp_transactions')
          .insert({
            user_id: userId,
            xp_amount: data.xp,
            source_type: 'initial_setup',
            source_id: null,
            description: 'Initial XP setup',
            created_at: new Date().toISOString()
          });

        if (transactionError) {
          console.error(`❌ Error inserting XP transaction for user ${userId}:`, transactionError);
        } else {
          console.log(`✅ XP transaction inserted for user ${userId}: ${data.xp} XP`);
        }
      }
    }

    console.log('\n✅ XP and Badges data population complete!');
    console.log('\n📊 Summary:');
    for (const [userId, data] of Object.entries(userData)) {
      const profile = profilesData.find(p => p.id === userId);
      const rank = ranksData.find(r => r.id === data.rankId);
      const displayName = profile?.display_name || profile?.full_name || 'Unknown';
      console.log(`   ${displayName}: ${data.xp} XP, ${rank?.name || 'Unknown'}, ${data.badges.length} badges`);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

populateXPDataServiceRole(); 