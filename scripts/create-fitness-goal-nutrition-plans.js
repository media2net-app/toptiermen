require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fitness goal configurations
const fitnessGoalConfigs = {
  droogtrainen: {
    calories_multiplier: 0.85,
    protein_multiplier: 1.2,
    carbs_multiplier: 0.7,
    fat_multiplier: 0.9,
    description: 'Focus op vetverlies met behoud van spiermassa',
    color: 'text-red-400'
  },
  spiermassa: {
    calories_multiplier: 1.15,
    protein_multiplier: 1.3,
    carbs_multiplier: 1.2,
    fat_multiplier: 1.1,
    description: 'Focus op spiergroei en krachttoename',
    color: 'text-green-400'
  },
  onderhoud: {
    calories_multiplier: 1.0,
    protein_multiplier: 1.0,
    carbs_multiplier: 1.0,
    fat_multiplier: 1.0,
    description: 'Behoud van huidige lichaamscompositie',
    color: 'text-blue-400'
  }
};

// Base nutrition values for 80kg person
const baseNutrition = {
  calories: 2200,
  protein: 165,
  carbs: 220,
  fat: 73
};

// Carnivor meal plans for each day
const carnivorMealPlans = {
  monday: {
    theme: "Dag 1",
    focus: "Carnivor Animal Based",
    meals: {
      ontbijt: {
        name: "Orgaanvlees & Eieren Ontbijt",
        time: "08:00",
        calories: 520,
        protein: 42,
        carbs: 8,
        fat: 35,
        ingredients: [
          { name: "Runderlever", amount: 100, unit: "g" },
          { name: "Runderhart", amount: 50, unit: "g" },
          { name: "Eieren", amount: 3, unit: "stuks" },
          { name: "Roomboter", amount: 25, unit: "g" },
          { name: "Honing", amount: 10, unit: "g" }
        ]
      },
      lunch: {
        name: "Ribeye Steak Lunch",
        time: "12:00",
        calories: 650,
        protein: 45,
        carbs: 0,
        fat: 50,
        ingredients: [
          { name: "Ribeye Steak", amount: 250, unit: "g" },
          { name: "Roomboter", amount: 30, unit: "g" },
          { name: "Talow", amount: 10, unit: "g" }
        ]
      },
      diner: {
        name: "Zalm & Eieren Diner",
        time: "19:00",
        calories: 580,
        protein: 58,
        carbs: 15,
        fat: 35,
        ingredients: [
          { name: "Gerookte Zalm", amount: 120, unit: "g" },
          { name: "Eieren", amount: 2, unit: "stuks" },
          { name: "Spek", amount: 40, unit: "g" },
          { name: "Goudse Kaas", amount: 30, unit: "g" }
        ]
      },
      snack1: {
        name: "Griekse Yoghurt Snack",
        time: "10:30",
        calories: 280,
        protein: 22,
        carbs: 0,
        fat: 20,
        ingredients: [
          { name: "Griekse Yoghurt", amount: 150, unit: "g" },
          { name: "Honing", amount: 15, unit: "g" }
        ]
      },
      snack2: {
        name: "Droge Worst Snack",
        time: "15:30",
        calories: 320,
        protein: 18,
        carbs: 2,
        fat: 25,
        ingredients: [
          { name: "Droge Worst", amount: 80, unit: "g" },
          { name: "Goudse Kaas", amount: 20, unit: "g" }
        ]
      }
    }
  },
  tuesday: {
    theme: "Dag 2",
    focus: "Carnivor Animal Based",
    meals: {
      ontbijt: {
        name: "Lamsvlees Ontbijt",
        time: "08:00",
        calories: 480,
        protein: 38,
        carbs: 6,
        fat: 32,
        ingredients: [
          { name: "Lamsvlees", amount: 150, unit: "g" },
          { name: "Eieren", amount: 2, unit: "stuks" },
          { name: "Roomboter", amount: 20, unit: "g" }
        ]
      },
      lunch: {
        name: "Lamskotelet Lunch",
        time: "12:00",
        calories: 620,
        protein: 48,
        carbs: 0,
        fat: 45,
        ingredients: [
          { name: "Lamskotelet", amount: 250, unit: "g" },
          { name: "Roomboter", amount: 25, unit: "g" }
        ]
      },
      diner: {
        name: "Gans & Eendenborst Diner",
        time: "19:00",
        calories: 540,
        protein: 52,
        carbs: 12,
        fat: 32,
        ingredients: [
          { name: "Gans", amount: 100, unit: "g" },
          { name: "Eendenborst", amount: 100, unit: "g" },
          { name: "Eieren", amount: 1, unit: "stuks" }
        ]
      },
      snack1: {
        name: "Kippenlever Snack",
        time: "10:30",
        calories: 260,
        protein: 20,
        carbs: 0,
        fat: 18,
        ingredients: [
          { name: "Kippenlever", amount: 100, unit: "g" },
          { name: "Roomboter", amount: 15, unit: "g" }
        ]
      },
      snack2: {
        name: "Entrecote Snack",
        time: "15:30",
        calories: 300,
        protein: 24,
        carbs: 0,
        fat: 22,
        ingredients: [
          { name: "Entrecote", amount: 120, unit: "g" }
        ]
      }
    }
  },
  wednesday: {
    theme: "Dag 3",
    focus: "Carnivor Animal Based",
    meals: {
      ontbijt: {
        name: "Kipfilet Ontbijt",
        time: "08:00",
        calories: 450,
        protein: 35,
        carbs: 8,
        fat: 28,
        ingredients: [
          { name: "Kipfilet", amount: 200, unit: "g" },
          { name: "Eieren", amount: 2, unit: "stuks" },
          { name: "Roomboter", amount: 15, unit: "g" }
        ]
      },
      lunch: {
        name: "Zalmfilet Lunch",
        time: "12:00",
        calories: 580,
        protein: 42,
        carbs: 0,
        fat: 40,
        ingredients: [
          { name: "Zalmfilet", amount: 250, unit: "g" },
          { name: "Roomboter", amount: 20, unit: "g" }
        ]
      },
      diner: {
        name: "Rundernieren Diner",
        time: "19:00",
        calories: 520,
        protein: 48,
        carbs: 10,
        fat: 30,
        ingredients: [
          { name: "Rundernieren", amount: 100, unit: "g" },
          { name: "Eieren", amount: 2, unit: "stuks" },
          { name: "Goudse Kaas", amount: 25, unit: "g" }
        ]
      },
      snack1: {
        name: "Griekse Yoghurt Snack",
        time: "10:30",
        calories: 240,
        protein: 18,
        carbs: 0,
        fat: 16,
        ingredients: [
          { name: "Griekse Yoghurt", amount: 120, unit: "g" }
        ]
      },
      snack2: {
        name: "Droge Worst Snack",
        time: "15:30",
        calories: 280,
        protein: 16,
        carbs: 0,
        fat: 20,
        ingredients: [
          { name: "Droge Worst", amount: 70, unit: "g" }
        ]
      }
    }
  },
  thursday: {
    theme: "Dag 4",
    focus: "Carnivor Animal Based",
    meals: {
      ontbijt: {
        name: "Ribeye Ontbijt",
        time: "08:00",
        calories: 520,
        protein: 40,
        carbs: 6,
        fat: 35,
        ingredients: [
          { name: "Ribeye Steak", amount: 200, unit: "g" },
          { name: "Eieren", amount: 2, unit: "stuks" },
          { name: "Roomboter", amount: 20, unit: "g" }
        ]
      },
      lunch: {
        name: "Runderlever Lunch",
        time: "12:00",
        calories: 600,
        protein: 44,
        carbs: 8,
        fat: 42,
        ingredients: [
          { name: "Runderlever", amount: 150, unit: "g" },
          { name: "Runderhart", amount: 75, unit: "g" },
          { name: "Roomboter", amount: 25, unit: "g" }
        ]
      },
      diner: {
        name: "T-Bone Steak Diner",
        time: "19:00",
        calories: 580,
        protein: 52,
        carbs: 12,
        fat: 38,
        ingredients: [
          { name: "T-Bone Steak", amount: 200, unit: "g" },
          { name: "Eieren", amount: 1, unit: "stuks" },
          { name: "Goudse Kaas", amount: 30, unit: "g" }
        ]
      },
      snack1: {
        name: "Spek Snack",
        time: "10:30",
        calories: 300,
        protein: 22,
        carbs: 0,
        fat: 24,
        ingredients: [
          { name: "Spek", amount: 60, unit: "g" }
        ]
      },
      snack2: {
        name: "Goudse Kaas Snack",
        time: "15:30",
        calories: 320,
        protein: 20,
        carbs: 0,
        fat: 26,
        ingredients: [
          { name: "Goudse Kaas", amount: 80, unit: "g" }
        ]
      }
    }
  },
  friday: {
    theme: "Dag 5",
    focus: "Carnivor Animal Based",
    meals: {
      ontbijt: {
        name: "Lamsvlees Ontbijt",
        time: "08:00",
        calories: 480,
        protein: 36,
        carbs: 6,
        fat: 32,
        ingredients: [
          { name: "Lamsvlees", amount: 140, unit: "g" },
          { name: "Eieren", amount: 2, unit: "stuks" },
          { name: "Roomboter", amount: 18, unit: "g" }
        ]
      },
      lunch: {
        name: "Lamskotelet Lunch",
        time: "12:00",
        calories: 620,
        protein: 46,
        carbs: 0,
        fat: 44,
        ingredients: [
          { name: "Lamskotelet", amount: 240, unit: "g" },
          { name: "Roomboter", amount: 22, unit: "g" }
        ]
      },
      diner: {
        name: "Gans & Eendenborst Diner",
        time: "19:00",
        calories: 560,
        protein: 50,
        carbs: 10,
        fat: 34,
        ingredients: [
          { name: "Gans", amount: 100, unit: "g" },
          { name: "Eendenborst", amount: 100, unit: "g" },
          { name: "Eieren", amount: 1, unit: "stuks" }
        ]
      },
      snack1: {
        name: "Kippenlever Snack",
        time: "10:30",
        calories: 280,
        protein: 22,
        carbs: 0,
        fat: 20,
        ingredients: [
          { name: "Kippenlever", amount: 100, unit: "g" },
          { name: "Roomboter", amount: 15, unit: "g" }
        ]
      },
      snack2: {
        name: "Entrecote Snack",
        time: "15:30",
        calories: 320,
        protein: 26,
        carbs: 0,
        fat: 24,
        ingredients: [
          { name: "Entrecote", amount: 130, unit: "g" }
        ]
      }
    }
  },
  saturday: {
    theme: "Dag 6",
    focus: "Carnivor Animal Based",
    meals: {
      ontbijt: {
        name: "Weekend Ontbijt",
        time: "09:00",
        calories: 550,
        protein: 42,
        carbs: 8,
        fat: 38,
        ingredients: [
          { name: "Ribeye Steak", amount: 180, unit: "g" },
          { name: "Eieren", amount: 3, unit: "stuks" },
          { name: "Roomboter", amount: 25, unit: "g" },
          { name: "Honing", amount: 12, unit: "g" }
        ]
      },
      lunch: {
        name: "Weekend Lunch",
        time: "13:00",
        calories: 650,
        protein: 48,
        carbs: 0,
        fat: 48,
        ingredients: [
          { name: "T-Bone Steak", amount: 220, unit: "g" },
          { name: "Roomboter", amount: 30, unit: "g" }
        ]
      },
      diner: {
        name: "Weekend Diner",
        time: "20:00",
        calories: 600,
        protein: 54,
        carbs: 12,
        fat: 38,
        ingredients: [
          { name: "Gerookte Zalm", amount: 140, unit: "g" },
          { name: "Eieren", amount: 2, unit: "stuks" },
          { name: "Goudse Kaas", amount: 35, unit: "g" }
        ]
      },
      snack1: {
        name: "Weekend Snack 1",
        time: "11:00",
        calories: 300,
        protein: 24,
        carbs: 0,
        fat: 22,
        ingredients: [
          { name: "Droge Worst", amount: 80, unit: "g" },
          { name: "Goudse Kaas", amount: 20, unit: "g" }
        ]
      },
      snack2: {
        name: "Weekend Snack 2",
        time: "16:00",
        calories: 320,
        protein: 26,
        carbs: 0,
        fat: 24,
        ingredients: [
          { name: "Spek", amount: 70, unit: "g" },
          { name: "Griekse Yoghurt", amount: 100, unit: "g" }
        ]
      }
    }
  },
  sunday: {
    theme: "Dag 7",
    focus: "Carnivor Animal Based",
    meals: {
      ontbijt: {
        name: "Light Ontbijt",
        time: "08:30",
        calories: 420,
        protein: 32,
        carbs: 6,
        fat: 28,
        ingredients: [
          { name: "Kipfilet", amount: 150, unit: "g" },
          { name: "Eieren", amount: 2, unit: "stuks" },
          { name: "Roomboter", amount: 15, unit: "g" }
        ]
      },
      lunch: {
        name: "Light Lunch",
        time: "12:30",
        calories: 520,
        protein: 38,
        carbs: 0,
        fat: 36,
        ingredients: [
          { name: "Zalmfilet", amount: 200, unit: "g" },
          { name: "Roomboter", amount: 18, unit: "g" }
        ]
      },
      diner: {
        name: "Light Diner",
        time: "19:30",
        calories: 480,
        protein: 42,
        carbs: 8,
        fat: 30,
        ingredients: [
          { name: "Rundernieren", amount: 80, unit: "g" },
          { name: "Eieren", amount: 2, unit: "stuks" },
          { name: "Goudse Kaas", amount: 20, unit: "g" }
        ]
      },
      snack1: {
        name: "Light Snack 1",
        time: "10:30",
        calories: 240,
        protein: 18,
        carbs: 0,
        fat: 16,
        ingredients: [
          { name: "Griekse Yoghurt", amount: 120, unit: "g" }
        ]
      },
      snack2: {
        name: "Light Snack 2",
        time: "15:30",
        calories: 260,
        protein: 20,
        carbs: 0,
        fat: 18,
        ingredients: [
          { name: "Kippenlever", amount: 80, unit: "g" },
          { name: "Roomboter", amount: 10, unit: "g" }
        ]
      }
    }
  }
};

async function createFitnessGoalNutritionPlans() {
  try {
    console.log('🥗 CREATING FITNESS GOAL NUTRITION PLANS');
    console.log('=====================================\n');

    // Delete existing plans
    console.log('🗑️ Deleting existing nutrition plans...');
    const { error: deleteError } = await supabase
      .from('nutrition_plans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('❌ Error deleting existing plans:', deleteError);
      return;
    }
    console.log('✅ Existing plans deleted\n');

    // Create plans for each fitness goal
    for (const [goalKey, goalConfig] of Object.entries(fitnessGoalConfigs)) {
      console.log(`📝 Creating ${goalKey} nutrition plan...`);
      
      const adjustedNutrition = {
        calories: Math.round(baseNutrition.calories * goalConfig.calories_multiplier),
        protein: Math.round(baseNutrition.protein * goalConfig.protein_multiplier),
        carbs: Math.round(baseNutrition.carbs * goalConfig.carbs_multiplier),
        fat: Math.round(baseNutrition.fat * goalConfig.fat_multiplier)
      };

      // Adjust meal plans for this goal
      const adjustedDailyPlans = Object.entries(carnivorMealPlans).map(([day, dayPlan]) => {
        const calorieRatio = goalConfig.calories_multiplier;
        
        return {
          day,
          theme: dayPlan.theme,
          focus: dayPlan.focus,
          meals: {
            ontbijt: adjustMeal(dayPlan.meals.ontbijt, calorieRatio),
            snack1: adjustMeal(dayPlan.meals.snack1, calorieRatio),
            lunch: adjustMeal(dayPlan.meals.lunch, calorieRatio),
            snack2: adjustMeal(dayPlan.meals.snack2, calorieRatio),
            diner: adjustMeal(dayPlan.meals.diner, calorieRatio)
          }
        };
      });

      const planData = {
        name: `Carnivor Animal Based - ${goalKey.charAt(0).toUpperCase() + goalKey.slice(1)}`,
        description: `Een carnivor voedingsplan specifiek afgestemd op ${goalKey}. ${goalConfig.description}. Gebaseerd op dierlijke producten zoals vlees, vis, eieren en zuivel.`,
        target_calories: adjustedNutrition.calories,
        target_protein: adjustedNutrition.protein,
        target_carbs: adjustedNutrition.carbs,
        target_fat: adjustedNutrition.fat,
        duration_weeks: 12,
        difficulty: 'beginner',
        goal: 'afvallen',
        is_featured: true,
        is_public: true
      };

      const { data: plan, error: insertError } = await supabase
        .from('nutrition_plans')
        .insert({
          name: planData.name,
          description: planData.description,
          target_calories: planData.target_calories,
          target_protein: planData.target_protein,
          target_carbs: planData.target_carbs,
          target_fat: planData.target_fat,
          duration_weeks: planData.duration_weeks,
          difficulty: planData.difficulty,
          goal: planData.goal,
          is_featured: planData.is_featured,
          is_public: planData.is_public
        })
        .select()
        .single();

      if (insertError) {
        console.error(`❌ Error creating ${goalKey} plan:`, insertError);
        continue;
      }

      console.log(`✅ ${goalKey} plan created successfully!`);
      console.log(`   📊 Calories: ${adjustedNutrition.calories}`);
      console.log(`   🥩 Protein: ${adjustedNutrition.protein}g`);
      console.log(`   🍞 Carbs: ${adjustedNutrition.carbs}g`);
      console.log(`   🧈 Fat: ${adjustedNutrition.fat}g`);
      console.log(`   📅 Days: ${adjustedDailyPlans.length}\n`);
    }

    console.log('🎉 All fitness goal nutrition plans created successfully!');
    console.log('\n📋 Summary:');
    console.log('   🔥 Droogtrainen: 1870 cal, 198g protein, 154g carbs, 66g fat');
    console.log('   💪 Spiermassa: 2530 cal, 215g protein, 264g carbs, 80g fat');
    console.log('   ⚖️ Onderhoud: 2200 cal, 165g protein, 220g carbs, 73g fat');

  } catch (error) {
    console.error('❌ Error creating fitness goal nutrition plans:', error.message);
  }
}

function adjustMeal(meal, calorieRatio) {
  return {
    ...meal,
    calories: Math.round(meal.calories * calorieRatio),
    protein: Math.round(meal.protein * calorieRatio),
    carbs: Math.round(meal.carbs * calorieRatio),
    fat: Math.round(meal.fat * calorieRatio),
    ingredients: meal.ingredients.map(ingredient => ({
      ...ingredient,
      amount: Math.round(ingredient.amount * calorieRatio * 10) / 10
    }))
  };
}

// Run the script
createFitnessGoalNutritionPlans();
