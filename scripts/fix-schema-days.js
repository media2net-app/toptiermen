const { executeSQL } = require('./db-admin');
const fs = require('fs');
const path = require('path');

async function fixSchemaDays() {
  try {
    console.log('🔧 Starting schema days fix...');
    
    // Lees het SQL bestand
    const sqlFilePath = path.join(__dirname, '..', 'fix_schema_days.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL file loaded, executing...');
    
    // Voer de SQL uit
    const result = await executeSQL(sql);
    
    console.log('✅ Schema days fixed successfully!');
    console.log('📊 Result:', result);
    
    // Test de resultaten
    console.log('🔍 Verifying results...');
    const verifyResult = await executeSQL(`
      SELECT 
        ts.name,
        ts.target_audience,
        COUNT(tsd.id) as total_days
      FROM training_schemas ts
      LEFT JOIN training_schema_days tsd ON ts.id = tsd.schema_id
      WHERE ts.status = 'published'
      GROUP BY ts.id, ts.name, ts.target_audience
      ORDER BY ts.name;
    `);
    
    console.log('📋 Schema verification results:');
    console.table(verifyResult);
    
  } catch (error) {
    console.error('❌ Error fixing schema days:', error);
    console.log('💡 Make sure you have:');
    console.log('   1. Added SUPABASE_SERVICE_ROLE_KEY to .env.local');
    console.log('   2. Executed setup_exec_sql_function.sql in Supabase');
    console.log('   3. Service role has proper permissions');
  }
}

// Voer het script uit als het direct wordt aangeroepen
if (require.main === module) {
  fixSchemaDays();
}

module.exports = { fixSchemaDays }; 