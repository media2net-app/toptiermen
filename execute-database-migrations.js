const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filename) {
  try {
    console.log(`📄 Reading ${filename}...`);
    const fs = require('fs');
    const path = require('path');
    const sqlContent = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    
    console.log(`🔧 Executing ${filename}...`);
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error(`❌ Error executing ${filename}:`, error);
      return false;
    }
    
    console.log(`✅ Successfully executed ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error reading/executing ${filename}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migration...');
  console.log('📊 Migrating all dummy data to 100% database-driven system');
  
  const migrations = [
    'brotherhood-schema.sql',
    'producten-schema.sql', 
    'workout-schema.sql',
    'mind-focus-schema.sql'
  ];
  
  let successCount = 0;
  let totalCount = migrations.length;
  
  for (const migration of migrations) {
    const success = await executeSQLFile(migration);
    if (success) {
      successCount++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Migration Summary:');
  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('🎉 All database migrations completed successfully!');
    console.log('🔧 Frontend is now 100% database-driven');
    console.log('📋 Next steps:');
    console.log('  1. Test all API endpoints');
    console.log('  2. Verify frontend functionality');
    console.log('  3. Add sample data if needed');
  } else {
    console.log('⚠️ Some migrations failed. Check the errors above.');
  }
}

main().catch(console.error);
