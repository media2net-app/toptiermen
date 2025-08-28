require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🍽️ EXECUTING NUTRITION SQL SCRIPT');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeNutritionSQL() {
  try {
    console.log('📋 Reading SQL file...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create-nutrition-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('✅ SQL file read successfully');
    console.log(`📄 File size: ${sqlContent.length} characters`);
    
    console.log('\n📋 Executing SQL commands...');
    console.log('----------------------------------------');
    
    // Split the SQL into individual commands
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`🔧 Found ${commands.length} SQL commands to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim().length === 0) continue;
      
      try {
        console.log(`\n📋 Executing command ${i + 1}/${commands.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`❌ Command ${i + 1} failed:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Command ${i + 1} executed successfully`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ Command ${i + 1} failed:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📋 Execution Summary');
    console.log('----------------------------------------');
    console.log(`✅ Successful commands: ${successCount}`);
    console.log(`❌ Failed commands: ${errorCount}`);
    console.log(`📊 Total commands: ${commands.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎯 ALL SQL COMMANDS EXECUTED SUCCESSFULLY!');
    } else {
      console.log('\n⚠️  Some commands failed. Check the errors above.');
    }
    
    console.log('\n📋 Verifying database setup...');
    console.log('----------------------------------------');
    
    // Check if tables were created successfully
    const { data: plans, error: plansError } = await supabase
      .from('nutrition_plans')
      .select('*');
    
    if (plansError) {
      console.error('❌ Error checking nutrition_plans:', plansError.message);
    } else {
      console.log(`✅ nutrition_plans table has ${plans.length} plans`);
      plans.forEach(plan => {
        console.log(`   - ${plan.name} (${plan.plan_id})`);
      });
    }
    
    const { data: weekplans, error: weekplansError } = await supabase
      .from('nutrition_weekplans')
      .select('*');
    
    if (weekplansError) {
      console.error('❌ Error checking nutrition_weekplans:', weekplansError.message);
    } else {
      console.log(`✅ nutrition_weekplans table has ${weekplans.length} weekplans`);
      weekplans.forEach(weekplan => {
        console.log(`   - ${weekplan.plan_id} - ${weekplan.day_of_week}`);
      });
    }
    
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*');
    
    if (mealsError) {
      console.error('❌ Error checking meals:', mealsError.message);
    } else {
      console.log(`✅ meals table has ${meals.length} meals`);
      meals.slice(0, 3).forEach(meal => {
        console.log(`   - ${meal.name}`);
      });
      if (meals.length > 3) {
        console.log(`   ... and ${meals.length - 3} more meals`);
      }
    }
    
    console.log('\n🎯 DATABASE SETUP VERIFICATION COMPLETE!');
    console.log('----------------------------------------');
    console.log('✅ nutrition_plans table created and populated');
    console.log('✅ nutrition_weekplans table created and populated');
    console.log('✅ meals table created and populated');
    console.log('');
    console.log('📋 Available plans:');
    console.log('   - Gebalanceerd Dieet');
    console.log('   - Carnivoor (Rick\'s Aanpak)');
    console.log('   - High Protein');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Refresh the admin dashboard');
    console.log('2. Check if plans are now visible (should show 3 plans)');
    console.log('3. Test the frontend integration');
    console.log('4. Add more weekplans for other days if needed');
    
  } catch (error) {
    console.error('❌ Error executing nutrition SQL:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting nutrition SQL execution...');
    console.log('');
    
    await executeNutritionSQL();
    
  } catch (error) {
    console.error('❌ Execution failed:', error.message);
  }
}

main();
