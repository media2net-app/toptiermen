require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 ADDING MACRO PERCENTAGE COLUMNS');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMacroPercentageColumns() {
  try {
    console.log('📋 STEP 1: Adding macro percentage columns to nutrition_plans');
    console.log('----------------------------------------');
    
    // Add macro percentage columns to nutrition_plans table
    const alterPlansTable = `
      ALTER TABLE nutrition_plans 
      ADD COLUMN IF NOT EXISTS protein_percentage INTEGER,
      ADD COLUMN IF NOT EXISTS carbs_percentage INTEGER,
      ADD COLUMN IF NOT EXISTS fat_percentage INTEGER;
    `;
    
    const { error: alterError } = await supabase.rpc('exec_sql', { sql: alterPlansTable });
    if (alterError) {
      console.log('❌ Error adding macro percentage columns:', alterError);
      console.log('ℹ️  Trying alternative approach...');
      
      // Alternative approach: try to update existing records to see if columns exist
      const { data: testData, error: testError } = await supabase
        .from('nutrition_plans')
        .select('protein_percentage, carbs_percentage, fat_percentage')
        .limit(1);
      
      if (testError) {
        console.log('❌ Columns do not exist, manual SQL execution required');
        console.log('📝 Please run the following SQL in Supabase Dashboard > SQL Editor:');
        console.log('');
        console.log('ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS protein_percentage INTEGER;');
        console.log('ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS carbs_percentage INTEGER;');
        console.log('ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS fat_percentage INTEGER;');
        console.log('');
        return;
      } else {
        console.log('✅ Macro percentage columns already exist');
      }
    } else {
      console.log('✅ Added macro percentage columns to nutrition_plans table');
    }
    
    console.log('\n📋 STEP 2: Updating existing records with calculated percentages');
    console.log('----------------------------------------');
    
    // Update existing records with calculated percentages
    const updatePercentages = `
      UPDATE nutrition_plans 
      SET 
        protein_percentage = CASE 
          WHEN target_calories > 0 AND target_protein > 0 
          THEN ROUND((target_protein * 4.0 / target_calories) * 100)
          ELSE NULL 
        END,
        carbs_percentage = CASE 
          WHEN target_calories > 0 AND target_carbs > 0 
          THEN ROUND((target_carbs * 4.0 / target_calories) * 100)
          ELSE NULL 
        END,
        fat_percentage = CASE 
          WHEN target_calories > 0 AND target_fat > 0 
          THEN ROUND((target_fat * 9.0 / target_calories) * 100)
          ELSE NULL 
        END
      WHERE target_calories IS NOT NULL 
        AND target_protein IS NOT NULL 
        AND target_carbs IS NOT NULL 
        AND target_fat IS NOT NULL;
    `;
    
    const { error: updateError } = await supabase.rpc('exec_sql', { sql: updatePercentages });
    if (updateError) {
      console.log('❌ Error updating percentages:', updateError);
      console.log('ℹ️  Manual update required');
    } else {
      console.log('✅ Updated existing records with calculated percentages');
    }
    
    console.log('\n📋 STEP 3: Verifying the changes');
    console.log('----------------------------------------');
    
    // Verify the changes
    const { data: plans, error: verifyError } = await supabase
      .from('nutrition_plans')
      .select(`
        plan_id,
        name,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        protein_percentage,
        carbs_percentage,
        fat_percentage
      `)
      .not('target_calories', 'is', null)
      .limit(5);
    
    if (verifyError) {
      console.log('❌ Error verifying changes:', verifyError);
    } else {
      console.log('✅ Verification successful. Sample data:');
      plans.forEach(plan => {
        const totalPercentage = (plan.protein_percentage || 0) + (plan.carbs_percentage || 0) + (plan.fat_percentage || 0);
        console.log(`📊 ${plan.name}:`);
        console.log(`   Calories: ${plan.target_calories}`);
        console.log(`   Protein: ${plan.target_protein}g (${plan.protein_percentage}%)`);
        console.log(`   Carbs: ${plan.target_carbs}g (${plan.carbs_percentage}%)`);
        console.log(`   Fat: ${plan.target_fat}g (${plan.fat_percentage}%)`);
        console.log(`   Total: ${totalPercentage}%`);
        console.log('');
      });
    }
    
    console.log('🎉 Macro percentage columns setup completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addMacroPercentageColumns();
