#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNutritionPlans() {
  try {
    console.log('🔍 Checking existing nutrition plans in database...');
    
    const { data: plans, error } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name, meals')
      .order('plan_id');

    if (error) {
      console.error('❌ Error fetching plans:', error);
      return;
    }

    console.log(`\n📊 Found ${plans.length} nutrition plans in database:`);
    console.log('=====================================');
    
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. Plan ID: ${plan.plan_id}`);
      console.log(`   Name: ${plan.name}`);
      console.log(`   Has meals data: ${plan.meals ? '✅' : '❌'}`);
      
      if (plan.meals && plan.meals.weekly_plan) {
        const weekPlan = plan.meals.weekly_plan;
        const sampleDay = Object.keys(weekPlan)[0];
        
        if (sampleDay && weekPlan[sampleDay]) {
          const mealTypes = Object.keys(weekPlan[sampleDay]).filter(key => key !== 'dailyTotals');
          console.log(`   Current meal structure: [${mealTypes.join(', ')}]`);
          console.log(`   Meal count: ${mealTypes.length}`);
          
          if (mealTypes.includes('ochtend_snack') && mealTypes.includes('lunch_snack') && mealTypes.includes('avond_snack')) {
            console.log(`   Status: ✅ Already has 6-meal structure`);
          } else {
            console.log(`   Status: ⚠️  Needs 6-meal structure update`);
          }
        }
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkNutritionPlans();
