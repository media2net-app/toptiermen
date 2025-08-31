const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBadgesTableStructure() {
  console.log('🔍 Checking Badges Table Structure...\n');

  try {
    // 1. Get a sample badge to see the structure
    console.log('1️⃣ Getting sample badge to check structure...');
    const { data: sampleBadge, error: sampleError } = await supabase
      .from('badges')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('❌ Error fetching sample badge:', sampleError);
      return;
    }

    console.log('✅ Sample badge found:');
    console.log(`   Title: ${sampleBadge.title}`);
    console.log(`   Description: ${sampleBadge.description}`);
    console.log(`   Icon: ${sampleBadge.icon_name}`);
    console.log(`   Rarity: ${sampleBadge.rarity_level}`);
    console.log(`   XP Reward: ${sampleBadge.xp_reward}`);

    // 2. Show all columns
    console.log('\n2️⃣ Available columns in badges table:');
    const columns = Object.keys(sampleBadge);
    columns.forEach((column, index) => {
      console.log(`   ${index + 1}. ${column}: ${typeof sampleBadge[column]} (${sampleBadge[column]})`);
    });

    // 3. Check existing badges
    console.log('\n3️⃣ Existing badges:');
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('id, title, icon_name, rarity_level, xp_reward')
      .order('id');

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
      return;
    }

    console.log(`✅ Found ${allBadges?.length || 0} existing badges:`);
    allBadges?.forEach((badge, index) => {
      console.log(`   ${index + 1}. ${badge.title} ${badge.icon_name} (${badge.rarity_level}) - ${badge.xp_reward} XP`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBadgesTableStructure();
