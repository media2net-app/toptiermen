// Direct Supabase connection for running SQL scripts
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to run SQL queries directly
async function runSQL(query, description = 'SQL Query') {
  console.log(`🔄 Running: ${description}`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    
    if (error) {
      console.error(`❌ Error in ${description}:`, error);
      return { success: false, error };
    }
    
    console.log(`✅ ${description} completed successfully`);
    return { success: true, data };
  } catch (err) {
    console.error(`❌ Exception in ${description}:`, err);
    return { success: false, error: err.message };
  }
}

// Function to update nutrition plan meals directly in database
async function updateNutritionPlanMeals() {
  console.log('🥩 Updating nutrition plan meals in database...');
  
  // First, check current meal data structure
  const checkQuery = `
    SELECT id, plan_id, name, meals 
    FROM nutrition_plans 
    WHERE plan_id LIKE 'carnivoor%'
    ORDER BY plan_id;
  `;
  
  const checkResult = await runSQL(checkQuery, 'Check current nutrition plans');
  
  if (!checkResult.success) {
    console.error('❌ Failed to check nutrition plans');
    return;
  }
  
  console.log('📋 Current nutrition plans:', checkResult.data);
  
  // Update each plan with proper meal structure
  const carnivoorPlans = [
    {
      plan_id: 'carnivoor-droogtrainen',
      meals: {
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
        },
        target_calories: 1870,
        target_protein: 198,
        target_carbs: 154,
        target_fat: 66,
        goal: 'Droogtrainen',
        difficulty: 'intermediate',
        duration_weeks: 12
      }
    }
  ];
  
  // Update each plan
  for (const plan of carnivoorPlans) {
    const updateQuery = `
      UPDATE nutrition_plans 
      SET meals = '${JSON.stringify(plan.meals)}'::jsonb,
          updated_at = NOW()
      WHERE plan_id = '${plan.plan_id}';
    `;
    
    const result = await runSQL(updateQuery, `Update ${plan.plan_id} meals`);
    
    if (result.success) {
      console.log(`✅ Updated ${plan.plan_id} with database meal data`);
    }
  }
  
  console.log('🎉 All nutrition plans updated with database ingredients!');
}

// Export functions for use in other scripts
module.exports = {
  supabase,
  runSQL,
  updateNutritionPlanMeals
};

// Run if called directly
if (require.main === module) {
  updateNutritionPlanMeals()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}
