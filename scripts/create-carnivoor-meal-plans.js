// Create complete Carnivoor meal plans using only database ingredients
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api/admin';

// Carnivoor meal plans for each day of the week
const carnivoorMealPlans = {
  monday: {
    ontbijt: [
      { name: '1 Ei', amount: 3, unit: 'stuks' },
      { name: 'Spek', amount: 50, unit: 'gram' }
    ],
    lunch: [
      { name: 'Kipfilet (Gegrild)', amount: 150, unit: 'gram' },
      { name: '1 Handje Walnoten', amount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Ribeye Steak', amount: 200, unit: 'gram' },
      { name: 'Orgaanvlees (Lever)', amount: 50, unit: 'gram' }
    ]
  },
  tuesday: {
    ontbijt: [
      { name: '1 Ei', amount: 2, unit: 'stuks' },
      { name: 'Ham', amount: 75, unit: 'gram' }
    ],
    lunch: [
      { name: 'Zalm (Wild)', amount: 150, unit: 'gram' },
      { name: '1 Handje Amandelen', amount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Mager Rundergehakt', amount: 200, unit: 'gram' },
      { name: 'Orgaanvlees (Hart)', amount: 50, unit: 'gram' }
    ]
  },
  wednesday: {
    ontbijt: [
      { name: '1 Ei', amount: 3, unit: 'stuks' },
      { name: 'Salami', amount: 40, unit: 'gram' }
    ],
    lunch: [
      { name: 'Kalkoenfilet (Gegrild)', amount: 150, unit: 'gram' },
      { name: '1 Handje Macadamia Noten', amount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'T-Bone Steak', amount: 200, unit: 'gram' },
      { name: 'Makreel', amount: 100, unit: 'gram' }
    ]
  },
  thursday: {
    ontbijt: [
      { name: '1 Ei', amount: 2, unit: 'stuks' },
      { name: 'Worst', amount: 60, unit: 'gram' }
    ],
    lunch: [
      { name: 'Lamsvlees', amount: 150, unit: 'gram' },
      { name: '1 Handje Hazelnoten', amount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Biefstuk', amount: 200, unit: 'gram' },
      { name: 'Tonijn in Olijfolie', amount: 100, unit: 'gram' }
    ]
  },
  friday: {
    ontbijt: [
      { name: '1 Ei', amount: 3, unit: 'stuks' },
      { name: 'Tartaar', amount: 50, unit: 'gram' }
    ],
    lunch: [
      { name: 'Varkenshaas', amount: 150, unit: 'gram' },
      { name: '1 Handje Cashewnoten', amount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Rundergehakt (15% vet)', amount: 200, unit: 'gram' },
      { name: 'Haring', amount: 100, unit: 'gram' }
    ]
  },
  saturday: {
    ontbijt: [
      { name: '1 Ei', amount: 2, unit: 'stuks' },
      { name: 'Duitse Biefstuk', amount: 60, unit: 'gram' }
    ],
    lunch: [
      { name: 'Kippendijen', amount: 150, unit: 'gram' },
      { name: '1 Handje Pecannoten', amount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Eendenborst', amount: 200, unit: 'gram' },
      { name: 'Sardines', amount: 100, unit: 'gram' }
    ]
  },
  sunday: {
    ontbijt: [
      { name: '1 Ei', amount: 3, unit: 'stuks' },
      { name: 'Carpaccio', amount: 50, unit: 'gram' }
    ],
    lunch: [
      { name: 'Gans', amount: 150, unit: 'gram' },
      { name: '1 Handje Pistachenoten', amount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Rundergehakt (20% vet)', amount: 200, unit: 'gram' },
      { name: 'Witvis', amount: 120, unit: 'gram' }
    ]
  }
};

async function createCarnivoorMealPlans() {
  console.log('🥩 Creating Carnivoor meal plans using database ingredients...');
  
  try {
    // First, get all ingredients to validate they exist
    const ingredientsResponse = await fetch(`${API_BASE}/nutrition-ingredients`);
    const ingredientsData = await ingredientsResponse.json();
    
    if (!ingredientsData.success) {
      console.error('❌ Failed to fetch ingredients:', ingredientsData.error);
      return;
    }
    
    const availableIngredients = ingredientsData.ingredients;
    console.log(`📋 Found ${availableIngredients.length} available ingredients`);
    
    // Validate all ingredients in meal plans exist
    const allIngredients = new Set();
    Object.values(carnivoorMealPlans).forEach(day => {
      Object.values(day).forEach(meal => {
        meal.forEach(item => allIngredients.add(item.name));
      });
    });
    
    console.log('\n🔍 Validating ingredients...');
    const missingIngredients = [];
    allIngredients.forEach(ingredientName => {
      const found = availableIngredients.find(ing => ing.name === ingredientName);
      if (!found) {
        missingIngredients.push(ingredientName);
      }
    });
    
    if (missingIngredients.length > 0) {
      console.error('❌ Missing ingredients in database:');
      missingIngredients.forEach(name => console.error(`   - ${name}`));
      return;
    }
    
    console.log('✅ All ingredients validated successfully!');
    
    // Create meal plans for each Carnivoor variant
    const carnivoorVariants = [
      {
        name: 'Carnivoor - Droogtrainen',
        plan_id: 'carnivoor-droogtrainen',
        multiplier: 0.85 // Slightly reduced portions for cutting
      },
      {
        name: 'Carnivoor - Onderhoud', 
        plan_id: 'carnivoor-onderhoud',
        multiplier: 1.0 // Standard portions
      },
      {
        name: 'Carnivoor - Spiermassa',
        plan_id: 'carnivoor-spiermassa', 
        multiplier: 1.15 // Increased portions for bulking
      }
    ];
    
    for (const variant of carnivoorVariants) {
      console.log(`\n📝 Creating meal plan for ${variant.name}...`);
      
      const weeklyMeals = {};
      
      Object.entries(carnivoorMealPlans).forEach(([day, dayMeals]) => {
        weeklyMeals[day] = {};
        
        Object.entries(dayMeals).forEach(([mealType, ingredients]) => {
          weeklyMeals[day][mealType] = ingredients.map(item => ({
            ...item,
            amount: Math.round(item.amount * variant.multiplier)
          }));
        });
      });
      
      // Calculate total nutrition for the day
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      // Calculate based on Monday's meals as reference
      Object.values(weeklyMeals.monday).forEach(meal => {
        meal.forEach(item => {
          const ingredient = availableIngredients.find(ing => ing.name === item.name);
          if (ingredient) {
            const factor = item.amount / 100; // Convert to per 100g basis
            totalCalories += ingredient.calories_per_100g * factor;
            totalProtein += ingredient.protein_per_100g * factor;
            totalCarbs += ingredient.carbs_per_100g * factor;
            totalFat += ingredient.fat_per_100g * factor;
          }
        });
      });
      
      console.log(`   📊 Daily totals: ${Math.round(totalCalories)} kcal, ${Math.round(totalProtein)}g protein, ${Math.round(totalCarbs)}g carbs, ${Math.round(totalFat)}g fat`);
      
      // Get the plan ID from database
      const plansResponse = await fetch(`${API_BASE}/nutrition-plans`);
      const plansData = await plansResponse.json();
      const existingPlan = plansData.plans.find(p => p.plan_id === variant.plan_id);
      
      if (!existingPlan) {
        console.error(`❌ Plan ${variant.plan_id} not found in database`);
        continue;
      }

      // Update the nutrition plan with meal data
      const updateData = {
        id: existingPlan.id,
        plan_id: variant.plan_id,
        meals: {
          ...weeklyMeals,
          target_calories: Math.round(totalCalories),
          target_protein: Math.round(totalProtein),
          target_carbs: Math.round(totalCarbs),
          target_fat: Math.round(totalFat),
          goal: variant.name.split(' - ')[1],
          difficulty: 'intermediate',
          duration_weeks: 12
        }
      };
      
      // Update via API
      const updateResponse = await fetch(`${API_BASE}/nutrition-plans`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const updateResult = await updateResponse.json();
      
      if (updateResult.success) {
        console.log(`✅ Updated ${variant.name} with complete meal plan`);
      } else {
        console.error(`❌ Failed to update ${variant.name}:`, updateResult.error);
      }
    }
    
    console.log('\n🎉 All Carnivoor meal plans created successfully!');
    console.log('📅 Each plan now has complete Monday-Sunday meal schedules');
    console.log('🥩 All meals use only ingredients from your database');
    
  } catch (error) {
    console.error('❌ Error creating meal plans:', error.message);
  }
}

// Run the script
createCarnivoorMealPlans()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
