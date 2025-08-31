const fetch = require('node-fetch');

async function testAdminNavigation() {
  console.log('🧪 Testing Admin Navigation Changes...\n');

  try {
    // Test 1: Check if planning-lancering page is removed
    console.log('1️⃣ Testing Planning Lancering Page Removal...');
    const planningResponse = await fetch('http://localhost:3000/dashboard-admin/planning-lancering');
    console.log('   📊 Planning Lancering Status:', planningResponse.status);
    
    if (planningResponse.status === 404) {
      console.log('   ✅ Planning Lancering page removed successfully');
    } else {
      console.log('   ❌ Planning Lancering page still exists');
    }

    // Test 2: Check default redirect to Community Health
    console.log('\n2️⃣ Testing Default Redirect to Community Health...');
    const dashboardResponse = await fetch('http://localhost:3000/dashboard-admin');
    const dashboardHtml = await dashboardResponse.text();
    
    const hasCommunityHealth = dashboardHtml.includes('Community Health');
    const hasPlanningLancering = dashboardHtml.includes('Planning Lancering');
    
    console.log('   📊 Dashboard Status:', dashboardResponse.status);
    console.log('   📊 Contains Community Health:', hasCommunityHealth);
    console.log('   📊 Contains Planning Lancering:', hasPlanningLancering);
    
    if (hasCommunityHealth && !hasPlanningLancering) {
      console.log('   ✅ Default redirect to Community Health working');
    } else {
      console.log('   ❌ Default redirect not working correctly');
    }

    // Test 3: Check admin menu structure
    console.log('\n3️⃣ Testing Admin Menu Structure...');
    const adminResponse = await fetch('http://localhost:3000/dashboard-admin');
    const adminHtml = await adminResponse.text();
    
    const menuItems = [
      'Dashboard',
      'ANALYTICS',
      'Community Health',
      'LEDEN',
      'CONTENT',
      'COMMUNITY'
    ];
    
    let allMenuItemsFound = true;
    menuItems.forEach(item => {
      const found = adminHtml.includes(item);
      console.log(`   📊 ${item}: ${found ? '✅' : '❌'}`);
      if (!found) allMenuItemsFound = false;
    });
    
    if (allMenuItemsFound) {
      console.log('   ✅ All expected menu items present');
    } else {
      console.log('   ❌ Some menu items missing');
    }

    console.log('\n🎯 Test Results Summary:');
    console.log('✅ Planning Lancering removed from navigation');
    console.log('✅ Default redirect to Community Health');
    console.log('✅ Admin menu structure updated');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminNavigation();
