const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateRickAvatar() {
  console.log('🖼️ Updating Rick\'s profile picture...\n');

  try {
    // Rick's user ID
    const rickUserId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    
    // New avatar URL - using the local image
    const newAvatarUrl = '/rick-profile.jpg';
    
    console.log(`👤 Updating avatar for user ${rickUserId}...`);
    console.log(`🖼️ New avatar URL: ${newAvatarUrl}`);

    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', rickUserId)
      .select();

    if (error) {
      console.error('❌ Error updating Rick\'s avatar:', error);
      return;
    }

    console.log('✅ Rick\'s avatar updated successfully!');
    console.log('📋 Updated profile data:', data);

    // Test the API to see the updated avatar
    console.log('\n🌐 Testing API to verify update...');
    const response = await fetch('http://localhost:3000/api/members-data');
    if (response.ok) {
      const data = await response.json();
      const rick = data.members?.find(m => m.id === rickUserId);
      if (rick) {
        console.log(`✅ Rick's new avatar URL: ${rick.avatar_url}`);
      } else {
        console.log('❌ Rick not found in API response');
      }
    } else {
      console.error('❌ API request failed:', response.status);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateRickAvatar(); 