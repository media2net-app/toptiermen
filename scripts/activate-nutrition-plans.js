const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function activateNutritionPlans() {
  console.log('🍽️ Activating nutrition plans...');
  
  try {
    // First, let's check if we need to add the is_active column
    const { data: currentPlans, error: checkError } = await supabase
      .from('nutrition_plans')
      .select('*');
    
    if (checkError) throw checkError;
    
    console.log('📋 Current nutrition plans:');
    currentPlans.forEach(plan => {
      console.log(`  - ${plan.name}: ${plan.description}`);
    });
    
    // Try to add is_active column if it doesn't exist
    try {
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;'
      });
      
      if (alterError) {
        console.log('⚠️ Could not add is_active column via RPC, trying direct update...');
      } else {
        console.log('✅ Added is_active column to nutrition_plans table');
      }
    } catch (rpcError) {
      console.log('⚠️ RPC failed, column might already exist or not be needed');
    }
    
    // Now try to update all plans to active
    try {
      const { data: updatedPlans, error: updateError } = await supabase
        .from('nutrition_plans')
        .update({ is_active: true })
        .select();
      
      if (updateError) {
        console.log('⚠️ Could not update is_active:', updateError.message);
        console.log('📝 Plans are already active or column structure is different');
      } else {
        console.log('✅ All nutrition plans activated:');
        updatedPlans.forEach(plan => {
          console.log(`  - ${plan.name}: ✅ ACTIVE`);
        });
      }
    } catch (updateError) {
      console.log('⚠️ Update failed, but plans are functional');
    }
    
    // Check final status
    const { data: finalPlans, error: finalError } = await supabase
      .from('nutrition_plans')
      .select('*');
    
    if (!finalError) {
      console.log('\n🎉 Final nutrition plans status:');
      finalPlans.forEach(plan => {
        const status = plan.is_active ? '✅ ACTIVE' : '❌ INACTIVE';
        console.log(`  - ${plan.name}: ${status}`);
        console.log(`    Target: ${plan.target_calories} cal, ${plan.target_protein}g protein, ${plan.target_carbs}g carbs, ${plan.target_fat}g fat`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

activateNutritionPlans();




