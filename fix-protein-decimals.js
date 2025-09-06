require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixProteinDecimals() {
  console.log('🔧 Fixing protein decimal values...');
  console.log('');

  try {
    // Get all plans and round protein values
    const { data: plans, error: fetchError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching plans:', fetchError);
      return;
    }

    for (const plan of plans || []) {
      if (plan.meals?.target_protein) {
        const roundedProtein = Math.round(plan.meals.target_protein);
        
        const updatedMeals = {
          ...plan.meals,
          target_protein: roundedProtein
        };

        const { error: updateError } = await supabase
          .from('nutrition_plans')
          .update({
            meals: updatedMeals,
            updated_at: new Date().toISOString()
          })
          .eq('plan_id', plan.plan_id);

        if (updateError) {
          console.error(`❌ Error updating ${plan.name}:`, updateError);
        } else {
          console.log(`✅ ${plan.name}: ${plan.meals.target_protein}g → ${roundedProtein}g protein`);
        }
      }
    }

    console.log('');
    console.log('🎉 All protein values rounded to whole numbers!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixProteinDecimals();
