const { executeSQL } = require('./db-admin');

async function checkSchemaDays() {
  try {
    console.log('🔍 Checking current schema days...');
    
    const result = await executeSQL(`
      SELECT 
        ts.name,
        COUNT(tsd.id) as total_days
      FROM training_schemas ts
      LEFT JOIN training_schema_days tsd ON ts.id = tsd.schema_id
      WHERE ts.status = 'published'
      GROUP BY ts.id, ts.name
      ORDER BY ts.name;
    `);
    
    console.log('📊 Current schema days status:');
    console.table(result);
    
  } catch (error) {
    console.error('❌ Error checking schema days:', error);
  }
}

checkSchemaDays(); 