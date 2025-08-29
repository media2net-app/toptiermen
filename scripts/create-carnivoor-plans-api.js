// Script to create Carnivoor nutrition plans via API
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api/admin/nutrition-plans';

const carnivoorPlans = [
  {
    name: 'Carnivoor - Droogtrainen',
    description: 'Carnivoor dieet geoptimaliseerd voor vetverlies met behoud van spiermassa. Focus op hoge eiwitinname en lage koolhydraten.',
    target_calories: 1870,
    target_protein: 198,
    target_carbs: 154,
    target_fat: 66,
    duration_weeks: 12,
    difficulty: 'intermediate',
    goal: 'Droogtrainen',
    is_featured: true,
    is_public: true
  },
  {
    name: 'Carnivoor - Onderhoud',
    description: 'Carnivoor dieet voor behoud van huidige lichaamscompositie. Gebalanceerde macro-verdeling binnen carnivoor kader.',
    target_calories: 2200,
    target_protein: 165,
    target_carbs: 220,
    target_fat: 73,
    duration_weeks: 12,
    difficulty: 'beginner',
    goal: 'Onderhoud',
    is_featured: true,
    is_public: true
  },
  {
    name: 'Carnivoor - Spiermassa',
    description: 'Carnivoor dieet geoptimaliseerd voor spiergroei en krachttoename. Verhoogde calorie- en eiwitinname.',
    target_calories: 2530,
    target_protein: 215,
    target_carbs: 264,
    target_fat: 80,
    duration_weeks: 12,
    difficulty: 'intermediate',
    goal: 'Spiermassa',
    is_featured: true,
    is_public: true
  }
];

async function createCarnivoorPlans() {
  console.log('🔄 Creating Carnivoor nutrition plans via API...');
  
  let createdCount = 0;
  let errorCount = 0;
  
  for (const plan of carnivoorPlans) {
    try {
      console.log(`📝 Creating ${plan.name}...`);
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error(`❌ Error creating ${plan.name}:`, data.error);
        errorCount++;
      } else {
        console.log(`✅ Created ${plan.name}: ${plan.target_calories} cal, ${plan.target_protein}g protein`);
        createdCount++;
      }
    } catch (error) {
      console.error(`❌ Exception creating ${plan.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Creation Summary:');
  console.log(`✅ Successfully created: ${createdCount} plans`);
  console.log(`❌ Errors: ${errorCount} plans`);
  
  if (createdCount > 0) {
    console.log('\n🎉 Carnivoor nutrition plans have been created!');
    console.log('Refresh the voedingsplannen page to see the new plans.');
  }
}

// Run the creation
createCarnivoorPlans()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
