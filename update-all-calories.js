// Script to update all nutrition plans to correct calorie targets
const http = require('http');

async function updateAllCalories() {
  console.log('🔄 Updating all nutrition plans to correct calorie targets...');
  console.log('📊 Target: Droogtrainen 2500 kcal, Onderhoud 2860 kcal, Spiermassa 3260 kcal');
  
  try {
    // First, get the current plans to get their IDs
    console.log('📋 Fetching current nutrition plans...');
    const plansResponse = await fetch('http://localhost:3000/api/admin/nutrition-plans');
    const plansData = await plansResponse.json();
    
    const plans = plansData.plans;
    console.log(`Found ${plans.length} nutrition plans`);
    
    // Update each plan based on its goal
    for (const plan of plans) {
      let updateData;
      
      if (plan.name.includes('Droogtrainen')) {
        // All Droogtrainen plans: 2500 kcal
        updateData = {
          id: plan.id,
          name: plan.name,
          target_calories: 2500,
          target_protein: plan.target_protein,
          target_carbs: plan.target_carbs,
          target_fat: plan.target_fat
        };
      } else if (plan.name.includes('Onderhoud')) {
        // All Onderhoud plans: 2860 kcal
        updateData = {
          id: plan.id,
          name: plan.name,
          target_calories: 2860,
          target_protein: plan.target_protein,
          target_carbs: plan.target_carbs,
          target_fat: plan.target_fat
        };
      } else if (plan.name.includes('Spiermassa')) {
        // All Spiermassa plans: 3260 kcal
        updateData = {
          id: plan.id,
          name: plan.name,
          target_calories: 3260,
          target_protein: plan.target_protein,
          target_carbs: plan.target_carbs,
          target_fat: plan.target_fat
        };
      } else {
        console.log(`⏭️  Skipping ${plan.name} (unknown goal)`);
        continue;
      }
      
      // Only update if calories need to change
      if (updateData.target_calories !== plan.target_calories) {
        console.log(`\n📝 Updating ${plan.name}...`);
        console.log(`   From: ${plan.target_calories} kcal → To: ${updateData.target_calories} kcal`);
        
        const response = await fetch('http://localhost:3000/api/admin/nutrition-plans', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          console.log(`✅ Updated ${plan.name} to ${updateData.target_calories} kcal`);
        } else {
          console.error(`❌ Error updating ${plan.name}:`, await response.text());
        }
      } else {
        console.log(`✅ ${plan.name} already has correct calories: ${plan.target_calories} kcal`);
      }
    }
    
    console.log('\n🎯 Calorie update completed!');
    console.log('📊 All plans now have correct calorie targets');
    
  } catch (error) {
    console.error('❌ Error updating calories:', error);
  }
}

updateAllCalories();
