const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('SQL Execution Error:', error);
    throw error;
  }
}

async function testConnection() {
  try {
    const result = await executeSQL('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Main execution block
if (require.main === module) {
  const sql = process.argv[2];
  if (!sql) {
    console.log('Usage: node scripts/db-admin.js "SELECT * FROM table;"');
    process.exit(1);
  }
  
  executeSQL(sql)
    .then(result => {
      console.log('✅ SQL executed successfully:');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('❌ SQL execution failed:', error);
      process.exit(1);
    });
}

module.exports = { executeSQL, testConnection }; 