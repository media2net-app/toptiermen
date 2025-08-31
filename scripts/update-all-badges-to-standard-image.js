const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateAllBadgesToStandardImage() {
  console.log('🔄 Updating all badges to use standard badge image...\n');

  try {
    // 1. Get all badges
    console.log('1️⃣ Fetching all badges...');
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('id, title, icon_name, image_url')
      .order('id');

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
      return;
    }

    console.log(`✅ Found ${badges.length} badges`);

    // 2. Update each badge to use standard image
    console.log('\n2️⃣ Updating badges to use standard badge image...');
    let updatedCount = 0;
    let skippedCount = 0;

    for (const badge of badges) {
      console.log(`   Processing: ${badge.title}`);
      
      // Check if badge already has standard image
      if (badge.image_url === '/badge-no-excuses.png') {
        console.log(`   ⏭️  Skipped: Already has standard image`);
        skippedCount++;
        continue;
      }

      // Update badge
      const { error: updateError } = await supabase
        .from('badges')
        .update({
          icon_name: '', // Empty string instead of icon
          image_url: '/badge-no-excuses.png' // Use standard badge image
        })
        .eq('id', badge.id);

      if (updateError) {
        console.error(`   ❌ Error updating ${badge.title}:`, updateError);
      } else {
        console.log(`   ✅ Updated: ${badge.title}`);
        updatedCount++;
      }
    }

    // 3. Verify all badges
    console.log('\n3️⃣ Verifying all badges...');
    const { data: verifyBadges, error: verifyError } = await supabase
      .from('badges')
      .select('id, title, icon_name, image_url')
      .order('id');

    if (verifyError) {
      console.error('❌ Error verifying badges:', verifyError);
      return;
    }

    console.log('\n📊 UPDATE SUMMARY:');
    console.log('================================');
    console.log(`   Total badges: ${badges.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped (already standard): ${skippedCount}`);
    console.log(`   Failed: ${badges.length - updatedCount - skippedCount}`);

    console.log('\n🏆 VERIFICATION RESULTS:');
    console.log('================================');
    verifyBadges.forEach((badge, index) => {
      const status = badge.image_url === '/badge-no-excuses.png' ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${badge.title}`);
      console.log(`      Image: ${badge.image_url || 'null'}`);
      console.log(`      Icon: ${badge.icon_name || 'null'}`);
    });

    console.log('\n🎉 All badges now use standard badge image!');
    console.log('   All badges will display the standard badge design.');

  } catch (error) {
    console.error('❌ Error in update:', error);
  }
}

updateAllBadgesToStandardImage();
