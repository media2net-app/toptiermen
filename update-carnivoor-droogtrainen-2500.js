// Script to update Carnivoor - Droogtrainen to 2500 kcal with correct macros
const http = require('http');

async function updateCarnivoorDroogtrainen() {
  console.log('🔄 Updating Carnivoor - Droogtrainen to 2500 kcal with 35/5/60 macros...');
  
  try {
    // First, get the current plan to get its ID
    console.log('📋 Fetching current carnivoor plans...');
    const plansResponse = await fetch('http://localhost:3000/api/admin/nutrition-plans');
    const plansData = await plansResponse.json();
    
    const carnivoorDroogtrainen = plansData.plans.find(plan => plan.name === 'Carnivoor - Droogtrainen');
    
    if (!carnivoorDroogtrainen) {
      console.error('❌ Carnivoor - Droogtrainen plan not found');
      return;
    }
    
    console.log(`Found plan: ${carnivoorDroogtrainen.name} (ID: ${carnivoorDroogtrainen.id})`);
    
    // Update with 2500 kcal and 35/5/60 macros
    const updateData = {
      id: carnivoorDroogtrainen.id,
      name: 'Carnivoor - Droogtrainen',
      target_calories: 2500,
      target_protein: 219, // 35% van 2500 kcal (2500 * 0.35 / 4)
      target_carbs: 31,    // 5% van 2500 kcal (2500 * 0.05 / 4)
      target_fat: 167      // 60% van 2500 kcal (2500 * 0.60 / 9)
    };
    
    console.log(`\n📝 Updating ${carnivoorDroogtrainen.name}...`);
    console.log(`   Calories: ${carnivoorDroogtrainen.target_calories} → ${updateData.target_calories}`);
    console.log(`   Protein: ${carnivoorDroogtrainen.target_protein} → ${updateData.target_protein}g (35%)`);
    console.log(`   Carbs: ${carnivoorDroogtrainen.target_carbs} → ${updateData.target_carbs}g (5%)`);
    console.log(`   Fat: ${carnivoorDroogtrainen.target_fat} → ${updateData.target_fat}g (60%)`);
    
    const response = await fetch('http://localhost:3000/api/admin/nutrition-plans', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.ok) {
      console.log(`✅ Updated ${carnivoorDroogtrainen.name} successfully!`);
      console.log('🎯 New values: 2500 kcal, 35% protein, 5% carbs, 60% fat');
    } else {
      console.error(`❌ Error updating ${carnivoorDroogtrainen.name}:`, await response.text());
    }
    
  } catch (error) {
    console.error('❌ Error updating carnivoor droogtrainen:', error);
  }
}

updateCarnivoorDroogtrainen();
