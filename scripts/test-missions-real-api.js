// Test script to verify missions API functionality
const testMissionsAPI = async () => {
  console.log('🚀 Testing Missions API...');

  // Test user ID (Rick)
  const testUserId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

  try {
    // Test 1: Fetch missions
    console.log('📝 Test 1: Fetching missions...');
    const response = await fetch(`http://localhost:3000/api/missions-real?userId=${testUserId}`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Missions fetched successfully:');
      console.log('- Missions count:', data.missions?.length || 0);
      console.log('- Summary:', data.summary);
      
      // Test 2: Create a new mission
      console.log('\n📝 Test 2: Creating new mission...');
      const createResponse = await fetch('http://localhost:3000/api/missions-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userId: testUserId,
          newMission: {
            title: 'Test missie - 30 min wandelen',
            type: 'Dagelijks',
            category: 'Gezondheid & Fitness',
            shared: false
          }
        })
      });

      const createData = await createResponse.json();
      
      if (createResponse.ok) {
        console.log('✅ Mission created successfully:', createData.mission?.title);
        
        // Test 3: Toggle the mission (complete it)
        if (data.missions && data.missions.length > 0) {
          const firstMissionId = data.missions[0].id;
          console.log('\n📝 Test 3: Toggling mission...');
          
          const toggleResponse = await fetch('http://localhost:3000/api/missions-real', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'toggle',
              userId: testUserId,
              missionId: firstMissionId
            })
          });

          const toggleData = await toggleResponse.json();
          
          if (toggleResponse.ok) {
            console.log('✅ Mission toggled successfully:');
            console.log('- Completed:', toggleData.completed);
            console.log('- XP Earned:', toggleData.xpEarned);
          } else {
            console.log('⚠️  Mission toggle failed (table might not exist):', toggleData.error);
          }
        }
      } else {
        console.log('⚠️  Mission creation failed (table might not exist):', createData.error);
      }
    } else {
      console.log('❌ Error fetching missions:', data.error);
    }

    console.log('\n🎉 API Tests completed!');
    console.log('💡 If tables don\'t exist, the API will use dummy data as fallback.');
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

// Run the test
testMissionsAPI(); 