const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateFirst100BadgeImage() {
  console.log('🔄 Updating First 100 badge to use standard badge image...\n');

  try {
    // 1. Find the First 100 badge
    console.log('1️⃣ Finding First 100 badge...');
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('id, title, icon_name, image_url')
      .eq('title', 'First 100 - Leden van het Eerste Uur')
      .single();

    if (badgeError || !badge) {
      console.error('❌ Error finding First 100 badge:', badgeError);
      return;
    }

    console.log(`✅ Found badge: ${badge.title} (ID: ${badge.id})`);
    console.log(`   Current icon_name: ${badge.icon_name}`);
    console.log(`   Current image_url: ${badge.image_url}`);

    // 2. Update the badge to use standard badge image
    console.log('\n2️⃣ Updating badge to use standard badge image...');
    const { data: updatedBadge, error: updateError } = await supabase
      .from('badges')
      .update({
        icon_name: '', // Empty string instead of null
        image_url: '/badge-no-excuses.png' // Use standard badge image
      })
      .eq('id', badge.id)
      .select('id, title, icon_name, image_url')
      .single();

    if (updateError) {
      console.error('❌ Error updating badge:', updateError);
      return;
    }

    console.log('✅ Badge updated successfully!');
    console.log(`   New icon_name: ${updatedBadge.icon_name}`);
    console.log(`   New image_url: ${updatedBadge.image_url}`);

    // 3. Verify the update
    console.log('\n3️⃣ Verifying update...');
    const { data: verifyBadge, error: verifyError } = await supabase
      .from('badges')
      .select('id, title, icon_name, image_url')
      .eq('id', badge.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('✅ Verification successful:');
    console.log(`   Badge: ${verifyBadge.title}`);
    console.log(`   Icon: ${verifyBadge.icon_name || 'null'}`);
    console.log(`   Image: ${verifyBadge.image_url}`);

    console.log('\n🎉 First 100 badge now uses standard badge image!');
    console.log('   The badge will now display the standard badge design instead of the star icon.');

  } catch (error) {
    console.error('❌ Error in update:', error);
  }
}

updateFirst100BadgeImage();
