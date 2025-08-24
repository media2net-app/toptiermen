const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeAcademyBadge() {
  try {
    console.log('🔍 Removing Academy Master badge for testing...\n');

    // Find user "Chiel"
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('full_name', '%Chiel%')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.error('❌ User "Chiel" not found:', usersError);
      return;
    }

    const chiel = users[0];
    console.log(`👤 User: ${chiel.full_name} (ID: ${chiel.id})`);

    // Find the Academy Master badge entry
    const { data: badgeEntry, error: badgeError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        badges!inner(
          id,
          title,
          description
        )
      `)
      .eq('user_id', chiel.id)
      .eq('badges.title', 'Academy Master')
      .single();

    if (badgeError && badgeError.code !== 'PGRST116') {
      console.error('❌ Error finding badge entry:', badgeError);
      return;
    }

    if (!badgeEntry) {
      console.log('ℹ️ User does not have Academy Master badge');
      return;
    }

    console.log(`🎖️ Found Academy Master badge entry:`);
    console.log(`   Badge: ${badgeEntry.badges.title}`);
    console.log(`   Unlocked at: ${badgeEntry.unlocked_at}`);

    // Remove the badge
    const { error: deleteError } = await supabase
      .from('user_badges')
      .delete()
      .eq('id', badgeEntry.id);

    if (deleteError) {
      console.error('❌ Error removing badge:', deleteError);
      return;
    }

    console.log('✅ Successfully removed Academy Master badge!');
    console.log('\n🎯 Ready for testing!');
    console.log('💡 Now complete any lesson to test the badge unlock again!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removeAcademyBadge();
