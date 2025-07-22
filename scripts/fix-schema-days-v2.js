const { executeSQL } = require('./db-admin');
const fs = require('fs');
const path = require('path');

async function fixSchemaDaysV2() {
  try {
    console.log('🔧 Starting schema days fix (Version 2)...');
    
    // Lees het nieuwe SQL bestand
    const sqlFilePath = path.join(__dirname, '..', 'fix_schema_days_v2.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL file loaded, executing...');
    
    // Voer de SQL uit
    const result = await executeSQL(sql);
    
    console.log('✅ Schema days fix completed!');
    console.log('📊 Result:', result);
    
    // Test de resultaten
    console.log('🔍 Verifying results...');
    const { data, error } = await supabase
      .from('training_schemas')
      .select(`
        name,
        training_schema_days (
          id
        )
      `)
      .eq('status', 'published')
      .order('name');
    
    if (error) throw error;
    
    console.log('📋 Final schema verification results:');
    data.forEach(schema => {
      const dayCount = schema.training_schema_days ? schema.training_schema_days.length : 0;
      console.log(`${schema.name}: ${dayCount} days`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing schema days:', error);
  }
}

// Voer het script uit als het direct wordt aangeroepen
if (require.main === module) {
  fixSchemaDaysV2();
}

module.exports = { fixSchemaDaysV2 }; 