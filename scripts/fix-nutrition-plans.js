require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 FIXING NUTRITION PLANS');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixNutritionPlans() {
  try {
    console.log('📋 STEP 1: Removing all existing plans');
    console.log('----------------------------------------');
    
    // Delete all existing plans
    const { error: deleteError } = await supabase
      .from('nutrition_plans')
      .delete()
      .not('id', 'is', null); // Delete all records
    
    if (deleteError) {
      console.error('❌ Error deleting existing plans:', deleteError.message);
      return;
    } else {
      console.log('✅ Deleted all existing nutrition plans');
    }
    
    console.log('\n📋 STEP 2: Inserting correct nutrition plans');
    console.log('----------------------------------------');
    
    // Insert the correct nutrition plans
    const nutritionPlans = [
      {
        name: 'Carnivoor',
        description: 'Volledig carnivoor dieet met orgaanvlees, vlees, vis en eieren. Voor maximale eenvoud en het elimineren van potentiële triggers.',
        target_calories: 2500,
        target_protein: 200,
        target_carbs: 0,
        target_fat: 180,
        duration_weeks: 12,
        is_featured: true,
        is_public: true
      },
      {
        name: 'Maatwerk Voedingsplan',
        description: 'Persoonlijk voedingsplan op maat gemaakt voor jouw specifieke doelen, voorkeuren en levensstijl.',
        target_calories: 2000,
        target_protein: 150,
        target_carbs: 200,
        target_fat: 70,
        duration_weeks: 8,
        is_featured: true,
        is_public: true
      }
    ];
    
    // Insert plans
    for (const plan of nutritionPlans) {
      const { error: insertError } = await supabase
        .from('nutrition_plans')
        .insert(plan);
      
      if (insertError) {
        console.error(`❌ Error inserting plan ${plan.name}:`, insertError.message);
      } else {
        console.log(`✅ Inserted plan: ${plan.name}`);
      }
    }
    
    console.log('\n📋 STEP 3: Verifying database setup');
    console.log('----------------------------------------');
    
    // Check if plans were inserted successfully
    const { data: plans, error: plansCheckError } = await supabase
      .from('nutrition_plans')
      .select('*');
    
    if (plansCheckError) {
      console.error('❌ Error checking nutrition_plans:', plansCheckError.message);
    } else {
      console.log(`✅ nutrition_plans table has ${plans.length} plans`);
      plans.forEach(plan => {
        console.log(`   - ${plan.name} (${plan.goal})`);
      });
    }
    
    console.log('\n🎯 NUTRITION PLANS FIXED!');
    console.log('----------------------------------------');
    console.log('✅ nutrition_plans table now has exactly 2 plans');
    console.log('');
    console.log('📋 Available plans:');
    console.log('   1. Carnivoor - Volledig carnivoor dieet');
    console.log('   2. Maatwerk Voedingsplan - Persoonlijk op maat');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Refresh the admin dashboard');
    console.log('2. Check if plans are now correct (should show 2 plans)');
    console.log('3. Test the frontend integration');
    
  } catch (error) {
    console.error('❌ Error fixing nutrition plans:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting nutrition plans fix...');
    console.log('');
    
    await fixNutritionPlans();
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

main();
