// Script to update carnivoor macros via API
const http = require('http');

async function updateCarnivoorMacros() {
  console.log('🔄 Updating Carnivoor macro percentages to 35% protein, 5% carbs, 60% fat...');
  
  try {
    // First, get the current plans to get their IDs
    console.log('📋 Fetching current carnivoor plans...');
    const plansResponse = await fetch('http://localhost:3000/api/admin/nutrition-plans');
    const plansData = await plansResponse.json();
    
    const carnivoorPlans = plansData.plans.filter(plan => plan.name.includes('Carnivoor'));
    console.log(`Found ${carnivoorPlans.length} carnivoor plans`);
    
    for (const plan of carnivoorPlans) {
      console.log(`- ${plan.name} (ID: ${plan.id})`);
    }
    // Update each carnivoor plan
    for (const plan of carnivoorPlans) {
      let updateData;
      
      if (plan.name === 'Carnivoor - Onderhoud') {
        updateData = {
          id: plan.id,
          name: 'Carnivoor - Onderhoud',
          target_calories: 2860,
          target_protein: 250, // 35% van 2860 kcal (2860 * 0.35 / 4)
          target_carbs: 36,    // 5% van 2860 kcal (2860 * 0.05 / 4)
          target_fat: 191      // 60% van 2860 kcal (2860 * 0.60 / 9)
        };
      } else if (plan.name === 'Carnivoor - Droogtrainen') {
        updateData = {
          id: plan.id,
          name: 'Carnivoor - Droogtrainen',
          target_calories: 2360,
          target_protein: 207, // 35% van 2360 kcal (2360 * 0.35 / 4)
          target_carbs: 30,    // 5% van 2360 kcal (2360 * 0.05 / 4)
          target_fat: 157      // 60% van 2360 kcal (2360 * 0.60 / 9)
        };
      } else {
        // Skip Carnivoor - Spiermassa (keep 45/5/50)
        console.log(`⏭️  Skipping ${plan.name} (keeping 45/5/50 percentages)`);
        continue;
      }
      
      console.log(`\n📝 Updating ${plan.name}...`);
      const response = await fetch('http://localhost:3000/api/admin/nutrition-plans', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        console.log(`✅ Updated ${plan.name}`);
        console.log(`   Protein: ${updateData.target_protein}g (35%)`);
        console.log(`   Carbs: ${updateData.target_carbs}g (5%)`);
        console.log(`   Fat: ${updateData.target_fat}g (60%)`);
      } else {
        console.error(`❌ Error updating ${plan.name}:`, await response.text());
      }
    }
    
    console.log('\n🎯 Carnivoor macro update completed!');
    console.log('📊 New percentages: 35% protein, 5% carbs, 60% fat');
    
  } catch (error) {
    console.error('❌ Error updating carnivoor macros:', error);
  }
}

updateCarnivoorMacros();
