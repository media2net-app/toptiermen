const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAPIResponse() {
  console.log('🔍 Debugging Full API Response...\n');

  try {
    // 1. Find Chiel's user ID
    console.log('1️⃣ Finding Chiel...');
    const { data: chiel, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (userError) {
      console.error('❌ Error finding Chiel:', userError);
      return;
    }

    console.log(`✅ Found Chiel: ${chiel.full_name} (${chiel.id})`);

    // 2. Test the API endpoint and get full response
    console.log('\n2️⃣ Testing API endpoint...');
    
    // Wait a bit for the server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const apiResponse = await fetch(`http://localhost:3000/api/dashboard-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: chiel.id
      })
    });

    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('✅ API Response received');
      console.log('   Full response structure:');
      console.log('   - stats:', Object.keys(apiData.stats || {}));
      console.log('   - userBadges:', typeof apiData.userBadges, Array.isArray(apiData.userBadges) ? apiData.userBadges.length : 'not array');
      
      console.log('\n   Detailed response:');
      console.log('   =================================');
      
      if (apiData.stats) {
        console.log('   📊 Stats object:');
        Object.keys(apiData.stats).forEach(key => {
          const value = apiData.stats[key];
          if (Array.isArray(value)) {
            console.log(`     ${key}: Array with ${value.length} items`);
          } else if (typeof value === 'object') {
            console.log(`     ${key}: Object with keys: ${Object.keys(value || {}).join(', ')}`);
          } else {
            console.log(`     ${key}: ${value}`);
          }
        });
      }
      
      if (apiData.userBadges) {
        console.log('\n   🏆 UserBadges:');
        if (Array.isArray(apiData.userBadges)) {
          console.log(`     Array with ${apiData.userBadges.length} badges`);
          apiData.userBadges.forEach((badge, index) => {
            console.log(`     ${index + 1}. ${badge.title} (${badge.rarity_level})`);
          });
        } else {
          console.log('     Not an array:', typeof apiData.userBadges);
          console.log('     Value:', apiData.userBadges);
        }
      } else {
        console.log('\n   🏆 UserBadges: undefined or null');
      }
      
      // 3. Check if badges are in stats instead
      console.log('\n3️⃣ Checking if badges are in stats...');
      if (apiData.stats?.badges) {
        console.log('   ✅ Found badges in stats object:');
        if (Array.isArray(apiData.stats.badges)) {
          console.log(`     Array with ${apiData.stats.badges.length} badges`);
          apiData.stats.badges.forEach((badge, index) => {
            console.log(`     ${index + 1}. ${badge.title} (${badge.rarity_level})`);
          });
        } else {
          console.log('     Not an array:', typeof apiData.stats.badges);
        }
      } else {
        console.log('   ❌ No badges found in stats object');
      }

    } else {
      console.error('❌ API Error:', apiResponse.status, apiResponse.statusText);
      const errorText = await apiResponse.text();
      console.error('   Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugAPIResponse();
