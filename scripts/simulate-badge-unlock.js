const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simulateBadgeUnlock() {
  try {
    console.log('🎭 Simulating Badge Unlock for UI Testing...\n');

    // Get the Academy Master badge data
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('id', 16)
      .single();

    if (badgeError) {
      console.error('❌ Error fetching badge:', badgeError);
      return;
    }

    console.log('✅ Academy Master badge found:');
    console.log(`   Title: ${badge.title}`);
    console.log(`   Description: ${badge.description}`);
    console.log(`   Icon: ${badge.icon_name}`);

    // Create the badge data that would be stored in localStorage
    const badgeData = {
      name: badge.title,
      icon: badge.icon_name,
      description: badge.description
    };

    console.log('\n📋 Badge data for localStorage:');
    console.log(JSON.stringify(badgeData, null, 2));

    console.log('\n🎯 INSTRUCTIONS FOR TESTING:');
    console.log('1. Open your browser console (F12)');
    console.log('2. Run this command:');
    console.log(`   localStorage.setItem('academyBadgeUnlock', '${JSON.stringify(badgeData)}');`);
    console.log('3. Go to: http://localhost:3000/dashboard/academy');
    console.log('4. The badge unlock modal should appear!');
    console.log('\n💡 Or manually set the localStorage data and refresh the page.');

    console.log('\n🔧 Alternative: Add this to your browser console:');
    console.log(`
// Set the badge data
localStorage.setItem('academyBadgeUnlock', '${JSON.stringify(badgeData)}');

// Trigger a page reload to show the modal
window.location.reload();
    `);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

simulateBadgeUnlock();
