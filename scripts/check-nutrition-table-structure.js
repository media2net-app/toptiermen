require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 CHECKING NUTRITION TABLE STRUCTURE');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNutritionTableStructure() {
  try {
    console.log('📋 STEP 1: Checking nutrition_plans table structure');
    console.log('----------------------------------------');
    
    // Check table structure using information_schema
    const checkStructureSQL = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'nutrition_plans' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const { data: columns, error: structureError } = await supabase.rpc('exec_sql', { sql: checkStructureSQL });
    
    if (structureError) {
      console.log('❌ Could not check table structure via RPC, trying direct query...');
      
      // Try to get table info using a simple select
      const { data: sampleData, error: sampleError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Error accessing nutrition_plans table:', sampleError.message);
        return;
      }
      
      console.log('✅ nutrition_plans table exists');
      console.log('📋 Sample data structure:');
      if (sampleData && sampleData.length > 0) {
        const sample = sampleData[0];
        Object.keys(sample).forEach(key => {
          console.log(`   - ${key}: ${typeof sample[key]} (${sample[key]})`);
        });
      } else {
        console.log('   - Table is empty');
      }
    } else {
      console.log('✅ nutrition_plans table structure:');
      columns.forEach(column => {
        console.log(`   - ${column.column_name}: ${column.data_type} (nullable: ${column.is_nullable})`);
      });
    }
    
    console.log('\n📋 STEP 2: Checking if table needs to be recreated');
    console.log('----------------------------------------');
    
    // Check if we need to add missing columns
    const { data: existingData, error: dataError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .limit(5);
    
    if (dataError) {
      console.error('❌ Error checking existing data:', dataError.message);
    } else {
      console.log(`✅ Found ${existingData.length} existing records in nutrition_plans`);
      if (existingData.length > 0) {
        console.log('📋 Existing data sample:');
        console.log(JSON.stringify(existingData[0], null, 2));
      }
    }
    
    console.log('\n📋 STEP 3: Recommendations');
    console.log('----------------------------------------');
    
    console.log('🎯 Based on the analysis:');
    console.log('');
    console.log('1. The nutrition_plans table exists but may have wrong structure');
    console.log('2. We need to either:');
    console.log('   a) Add missing columns to existing table');
    console.log('   b) Drop and recreate the table with correct structure');
    console.log('   c) Use the existing structure and adapt our data');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Check the actual table structure above');
    console.log('2. Decide on the best approach');
    console.log('3. Execute the appropriate fix');
    
  } catch (error) {
    console.error('❌ Error checking nutrition table structure:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting nutrition table structure check...');
    console.log('');
    
    await checkNutritionTableStructure();
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

main();
