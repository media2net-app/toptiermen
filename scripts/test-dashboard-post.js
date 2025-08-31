const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDashboardPost() {
  console.log('🧪 Testing Dashboard POST Request...\n');

  try {
    const rickUserId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';

    // Test POST request (what the dashboard actually uses)
    console.log('1️⃣ Testing POST request to /api/dashboard-stats...');
    
    const startTime = Date.now();
    try {
      const response = await fetch('http://localhost:3000/api/dashboard-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          userId: rickUserId
        })
      });

      const loadTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ POST request successful: ${loadTime}ms`);
        console.log(`   Has stats: ${!!data.stats}`);
        console.log(`   Has userBadges: ${!!data.userBadges}`);
        
        if (data.stats) {
          console.log('   📊 Stats breakdown:');
          console.log(`      - Missions: ${data.stats.missions ? 'Available' : 'Missing'}`);
          console.log(`      - Training: ${data.stats.training ? 'Available' : 'Missing'}`);
          console.log(`      - Finance: ${data.stats.finance ? 'Available' : 'Missing'}`);
          console.log(`      - Brotherhood: ${data.stats.brotherhood ? 'Available' : 'Missing'}`);
          console.log(`      - Academy: ${data.stats.academy ? 'Available' : 'Missing'}`);
          console.log(`      - XP: ${data.stats.xp ? 'Available' : 'Missing'}`);
        }
        
        if (data.userBadges) {
          console.log(`   🏆 User badges: ${data.userBadges.length} badges`);
        }
      } else {
        console.error(`❌ POST request failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`Error details: ${errorText}`);
      }
    } catch (error) {
      console.error(`❌ POST request error: ${error.message}`);
    }

    // Test GET request for comparison
    console.log('\n2️⃣ Testing GET request to /api/dashboard-stats...');
    
    try {
      const getResponse = await fetch(`http://localhost:3000/api/dashboard-stats?userId=${rickUserId}`);
      
      if (getResponse.ok) {
        const getData = await getResponse.json();
        console.log(`✅ GET request successful`);
        console.log(`   Has stats: ${!!getData.stats}`);
        console.log(`   Has userBadges: ${!!getData.userBadges}`);
      } else {
        console.log(`⚠️ GET request status: ${getResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ GET request error: ${error.message}`);
    }

    // Test dashboard page loading
    console.log('\n3️⃣ Testing dashboard page loading...');
    
    try {
      const pageResponse = await fetch('http://localhost:3000/dashboard');
      
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        
        // Check for loading indicators
        const hasLoadingSpinner = html.includes('animate-spin');
        const hasLoadingText = html.includes('Platform laden');
        const hasDashboardContent = html.includes('dashboard') || html.includes('Dashboard');
        
        console.log('   📊 Page content analysis:');
        console.log(`      - Loading spinner: ${hasLoadingSpinner ? 'Found' : 'Not found'}`);
        console.log(`      - Loading text: ${hasLoadingText ? 'Found' : 'Not found'}`);
        console.log(`      - Dashboard content: ${hasDashboardContent ? 'Found' : 'Not found'}`);
        
        if (hasLoadingText && !hasDashboardContent) {
          console.log('   ⚠️ Page stuck in loading state!');
        } else if (hasDashboardContent) {
          console.log('   ✅ Dashboard content found');
        }
      } else {
        console.log(`⚠️ Dashboard page status: ${pageResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Dashboard page error: ${error.message}`);
    }

    console.log('\n🎯 Dashboard POST Test Summary:');
    console.log('   ✅ POST request tested');
    console.log('   ✅ GET request compared');
    console.log('   ✅ Page loading checked');
    
  } catch (error) {
    console.error('❌ Error testing dashboard POST:', error);
  }
}

testDashboardPost();
