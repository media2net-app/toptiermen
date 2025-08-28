require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 CHECKING NUTRITION CONSTRAINTS');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNutritionConstraints() {
  try {
    console.log('📋 STEP 1: Checking table constraints');
    console.log('----------------------------------------');
    
    // Try different difficulty values to see what's allowed
    const difficultyValues = ['Easy', 'Medium', 'Hard', 'easy', 'medium', 'hard', 'EASY', 'MEDIUM', 'HARD'];
    
    for (const difficulty of difficultyValues) {
      try {
        const testRecord = {
          name: `Test Plan ${difficulty}`,
          description: 'Test description',
          target_calories: 2000,
          target_protein: 150,
          target_carbs: 200,
          target_fat: 70,
          duration_weeks: 8,
          difficulty: difficulty,
          goal: 'weight_loss',
          is_featured: true,
          is_public: true
        };
        
        const { error: insertError } = await supabase
          .from('nutrition_plans')
          .insert(testRecord);
        
        if (!insertError) {
          console.log(`✅ Difficulty value "${difficulty}" is valid`);
          // Clean up test record
          await supabase.from('nutrition_plans').delete().eq('name', `Test Plan ${difficulty}`);
          break;
        } else {
          console.log(`❌ Difficulty value "${difficulty}" is invalid: ${insertError.message}`);
        }
      } catch (e) {
        console.log(`❌ Difficulty value "${difficulty}" failed: ${e.message}`);
      }
    }
    
    console.log('\n📋 STEP 2: Checking goal constraints');
    console.log('----------------------------------------');
    
    // Try different goal values
    const goalValues = ['weight_loss', 'muscle_gain', 'maintenance', 'custom', 'WEIGHT_LOSS', 'MUSCLE_GAIN'];
    
    for (const goal of goalValues) {
      try {
        const testRecord = {
          name: `Test Goal ${goal}`,
          description: 'Test description',
          target_calories: 2000,
          target_protein: 150,
          target_carbs: 200,
          target_fat: 70,
          duration_weeks: 8,
          difficulty: 'Easy',
          goal: goal,
          is_featured: true,
          is_public: true
        };
        
        const { error: insertError } = await supabase
          .from('nutrition_plans')
          .insert(testRecord);
        
        if (!insertError) {
          console.log(`✅ Goal value "${goal}" is valid`);
          // Clean up test record
          await supabase.from('nutrition_plans').delete().eq('name', `Test Goal ${goal}`);
          break;
        } else {
          console.log(`❌ Goal value "${goal}" is invalid: ${insertError.message}`);
        }
      } catch (e) {
        console.log(`❌ Goal value "${goal}" failed: ${e.message}`);
      }
    }
    
    console.log('\n📋 STEP 3: Checking existing data structure');
    console.log('----------------------------------------');
    
    // Check if there are any existing plans to see the structure
    const { data: existingPlans, error: existingError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .limit(5);
    
    if (existingError) {
      console.error('❌ Error checking existing plans:', existingError.message);
    } else if (existingPlans && existingPlans.length > 0) {
      console.log('✅ Found existing plans, checking structure:');
      const sample = existingPlans[0];
      Object.keys(sample).forEach(key => {
        console.log(`   - ${key}: ${sample[key]} (${typeof sample[key]})`);
      });
    } else {
      console.log('ℹ️  No existing plans found');
    }
    
  } catch (error) {
    console.error('❌ Error checking nutrition constraints:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting nutrition constraints check...');
    console.log('');
    
    await checkNutritionConstraints();
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

main();
