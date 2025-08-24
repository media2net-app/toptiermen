require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateBadgeDefaultImage() {
  try {
    console.log('🏆 Setting badge-no-excuses.png as default image for all badges...\n');

    // 1. Add image_url column to badges table if it doesn't exist
    console.log('1️⃣ Adding image_url column to badges table...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE badges 
        ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) DEFAULT '/badge-no-excuses.png';
      `
    });

    if (alterError) {
      console.error('❌ Error adding image_url column:', alterError);
      return;
    }

    console.log('✅ image_url column added successfully');

    // 2. Update all existing badges to use the default image
    console.log('2️⃣ Updating existing badges to use default image...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql_query: `
        UPDATE badges 
        SET image_url = '/badge-no-excuses.png' 
        WHERE image_url IS NULL OR image_url = '';
      `
    });

    if (updateError) {
      console.error('❌ Error updating badges:', updateError);
      return;
    }

    console.log('✅ Badges updated successfully');

    // 3. Verify the changes
    console.log('3️⃣ Verifying changes...');
    const { data: badges, error: selectError } = await supabase
      .from('badges')
      .select('id, title, icon_name, image_url, rarity_level')
      .order('id');

    if (selectError) {
      console.error('❌ Error fetching badges:', selectError);
      return;
    }

    console.log('📊 Badge Update Results:');
    console.log('=====================================');
    console.log(`Total badges: ${badges.length}`);
    
    const badgesWithDefaultImage = badges.filter(badge => badge.image_url === '/badge-no-excuses.png');
    console.log(`Badges with default image: ${badgesWithDefaultImage.length}`);
    
    if (badges.length > 0) {
      console.log('\n🏆 Sample badges:');
      badges.slice(0, 5).forEach((badge, index) => {
        console.log(`${index + 1}. ${badge.title} (${badge.rarity_level})`);
        console.log(`   Icon: ${badge.icon_name}`);
        console.log(`   Image: ${badge.image_url}`);
        console.log('');
      });
    }

    console.log('✅ Badge default image update completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
updateBadgeDefaultImage();
