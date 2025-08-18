const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL of Service Role Key niet gevonden in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingColumns() {
  try {
    console.log('🚀 Toevoegen van ontbrekende kolommen aan nutrition_plans tabel...');
    
    // Check if table exists
    console.log('🔍 Controleren van tabel...');
    
    const { data: testData, error: testError } = await supabase
      .from('nutrition_plans')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Tabel nutrition_plans bestaat niet:', testError);
      return;
    }
    
    console.log('✅ Tabel bestaat! Nu kolommen toevoegen...');
    
    // Try to add missing columns one by one
    const missingColumns = [
      { name: 'color', type: 'VARCHAR(100)' },
      { name: 'is_active', type: 'BOOLEAN DEFAULT true' },
      { name: 'subtitle', type: 'TEXT' },
      { name: 'description', type: 'TEXT' },
      { name: 'icon', type: 'VARCHAR(10)' },
      { name: 'meals', type: 'JSONB' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' }
    ];
    
    for (const column of missingColumns) {
      console.log(`📝 Toevoegen kolom: ${column.name}`);
      
      try {
        // Try to insert a test record with the new column to see if it exists
        const testRecord = {
          plan_id: `test-${column.name}`,
          name: `Test ${column.name}`,
          [column.name]: column.name === 'is_active' ? true : 
                        column.name === 'meals' ? [] : 
                        column.name === 'created_at' || column.name === 'updated_at' ? new Date().toISOString() :
                        'test'
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('nutrition_plans')
          .insert(testRecord)
          .select();
        
        if (insertError) {
          if (insertError.message.includes(`Could not find the '${column.name}' column`)) {
            console.log(`⚠️  Kolom ${column.name} bestaat nog niet. Handmatige toevoeging vereist.`);
            console.log(`📋 Voer dit uit in Supabase SQL Editor:`);
            console.log(`ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`);
          } else {
            console.error(`❌ Fout bij testen kolom ${column.name}:`, insertError);
          }
        } else {
          console.log(`✅ Kolom ${column.name} bestaat al`);
          
          // Clean up test record
          await supabase
            .from('nutrition_plans')
            .delete()
            .eq('plan_id', `test-${column.name}`);
        }
      } catch (error) {
        console.error(`❌ Fout bij testen kolom ${column.name}:`, error);
      }
    }
    
    console.log('🎉 Kolom check voltooid!');
    console.log('📋 Als er kolommen ontbreken, voer de ALTER TABLE statements handmatig uit in Supabase SQL Editor.');
    console.log('📋 Daarna kun je de plannen invoegen met: node scripts/simple-insert.js');
    
  } catch (error) {
    console.error('❌ Fout tijdens kolom check:', error);
  }
}

addMissingColumns(); 