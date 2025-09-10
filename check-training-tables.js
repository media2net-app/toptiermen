const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTrainingTables() {
  console.log('🔍 Checking training-related tables...');
  
  // Check what tables exist
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .ilike('table_name', '%training%');
    
  if (error) {
    console.error('❌ Error fetching tables:', error);
    return;
  }
  
  console.log('📊 Training-related tables:');
  tables.forEach(table => {
    console.log(`   - ${table.table_name}`);
  });
  
  // Try to find exercises in different possible tables
  const possibleTables = ['exercises', 'training_exercises', 'workout_exercises', 'exercise_sets'];
  
  for (const tableName of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (!error && data) {
        console.log(`\n✅ Found table: ${tableName}`);
        console.log(`   Columns: ${Object.keys(data[0] || {}).join(', ')}`);
      }
    } catch (e) {
      // Table doesn't exist, continue
    }
  }
}

checkTrainingTables().catch(console.error);
