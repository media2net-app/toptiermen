// Test script to verify simple missions API functionality
const testSimpleMissionsAPI = async () => {
  console.log('🚀 Testing Simple Missions API...');

  // Test user ID (Rick)
  const testUserId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

  try {
    // Test 1: Fetch missions
    console.log('📝 Test 1: Fetching missions...');
    const response = await fetch(`http://localhost:3001/api/missions-simple?userId=${testUserId}`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Missions fetched successfully:');
      console.log('- Missions count:', data.missions?.length || 0);
      console.log('- Summary:', data.summary);
      console.log('- First mission XP:', data.missions?.[0]?.xp_reward);
      
      // Test 2: Toggle a mission (complete it)
      if (data.missions && data.missions.length > 0) {
        const firstMissionId = data.missions[0].id;
        console.log('\n📝 Test 2: Toggling mission...');
        
        const toggleResponse = await fetch('http://localhost:3001/api/missions-simple', {
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
          console.log('- Message:', toggleData.message);
        } else {
          console.log('❌ Mission toggle failed:', toggleData.error);
        }
      }

      // Test 3: Create a new mission
      console.log('\n📝 Test 3: Creating new mission...');
      const createResponse = await fetch('http://localhost:3001/api/missions-simple', {
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
        console.log('✅ Mission created successfully:');
        console.log('- Title:', createData.mission?.title);
        console.log('- XP Reward:', createData.mission?.xp_reward);
      } else {
        console.log('❌ Mission creation failed:', createData.error);
      }
    } else {
      console.log('❌ Error fetching missions:', data.error);
    }

    console.log('\n🎉 Simple API Tests completed!');
    console.log('💡 This API uses dummy data with real XP earning functionality!');
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

// Run the test
testSimpleMissionsAPI(); 