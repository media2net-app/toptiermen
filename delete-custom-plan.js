require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteCustomPlan() {
  console.log('🗑️ Deleting custom plan for user...');
  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
  const planId = 'voedingsplan-droogtrainen';

  const { data, error } = await supabase
    .from('user_nutrition_plans')
    .delete()
    .eq('user_id', userId)
    .eq('plan_type', planId)
    .select();

  if (error) {
    console.error('❌ Error deleting custom plan:', error);
    return;
  }

  console.log('✅ Custom plan deleted successfully:', data);
}

deleteCustomPlan();
