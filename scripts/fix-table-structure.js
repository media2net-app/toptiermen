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

async function fixTableStructure() {
  try {
    console.log('🚀 Aanpassen van tabel structuur...');
    
    // First, let's check what columns exist
    console.log('🔍 Controleren van bestaande kolommen...');
    
    const { data: testData, error: testError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Fout bij controleren tabel:', testError);
      return;
    }
    
    console.log('✅ Tabel bestaat en is toegankelijk');
    
    // Try to add missing columns
    console.log('📝 Toevoegen van ontbrekende kolommen...');
    
    // Try to add color column
    try {
      const { error: colorError } = await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS color VARCHAR(100);' 
      });
      
      if (colorError) {
        console.log('⚠️  Kon color kolom niet toevoegen via RPC. Handmatige toevoeging vereist.');
        console.log('📋 Voer dit uit in Supabase SQL Editor:');
        console.log('ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS color VARCHAR(100);');
      } else {
        console.log('✅ Color kolom toegevoegd');
      }
    } catch (error) {
      console.log('⚠️  Kon color kolom niet toevoegen. Handmatige toevoeging vereist.');
    }
    
    // Try to add is_active column
    try {
      const { error: activeError } = await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;' 
      });
      
      if (activeError) {
        console.log('⚠️  Kon is_active kolom niet toevoegen via RPC. Handmatige toevoeging vereist.');
        console.log('📋 Voer dit uit in Supabase SQL Editor:');
        console.log('ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;');
      } else {
        console.log('✅ is_active kolom toegevoegd');
      }
    } catch (error) {
      console.log('⚠️  Kon is_active kolom niet toevoegen. Handmatige toevoeging vereist.');
    }
    
    // Try to add other missing columns
    const missingColumns = [
      { name: 'subtitle', type: 'TEXT' },
      { name: 'description', type: 'TEXT' },
      { name: 'icon', type: 'VARCHAR(10)' },
      { name: 'meals', type: 'JSONB' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' }
    ];
    
    for (const column of missingColumns) {
      try {
        const { error: columnError } = await supabase.rpc('exec_sql', { 
          sql: `ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};` 
        });
        
        if (columnError) {
          console.log(`⚠️  Kon ${column.name} kolom niet toevoegen. Handmatige toevoeging vereist.`);
          console.log(`📋 Voer dit uit: ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`);
        } else {
          console.log(`✅ ${column.name} kolom toegevoegd`);
        }
      } catch (error) {
        console.log(`⚠️  Kon ${column.name} kolom niet toevoegen. Handmatige toevoeging vereist.`);
      }
    }
    
    // Try to add indexes
    try {
      const { error: indexError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE INDEX IF NOT EXISTS idx_nutrition_plans_plan_id ON nutrition_plans(plan_id);
          CREATE INDEX IF NOT EXISTS idx_nutrition_plans_active ON nutrition_plans(is_active);
        ` 
      });
      
      if (indexError) {
        console.log('⚠️  Kon indexes niet toevoegen. Handmatige toevoeging vereist.');
        console.log('📋 Voer dit uit:');
        console.log('CREATE INDEX IF NOT EXISTS idx_nutrition_plans_plan_id ON nutrition_plans(plan_id);');
        console.log('CREATE INDEX IF NOT EXISTS idx_nutrition_plans_active ON nutrition_plans(is_active);');
      } else {
        console.log('✅ Indexes toegevoegd');
      }
    } catch (error) {
      console.log('⚠️  Kon indexes niet toevoegen. Handmatige toevoeging vereist.');
    }
    
    // Try to enable RLS and add policies
    try {
      const { error: rlsError } = await supabase.rpc('exec_sql', { 
        sql: `
          ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Allow authenticated users to read active nutrition plans" ON nutrition_plans;
          CREATE POLICY "Allow authenticated users to read active nutrition plans" ON nutrition_plans
            FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
          
          DROP POLICY IF EXISTS "Allow admins to manage nutrition plans" ON nutrition_plans;
          CREATE POLICY "Allow admins to manage nutrition plans" ON nutrition_plans
            FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');
        ` 
      });
      
      if (rlsError) {
        console.log('⚠️  Kon RLS policies niet toevoegen. Handmatige toevoeging vereist.');
        console.log('📋 Voer dit uit:');
        console.log(`
          ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Allow authenticated users to read active nutrition plans" ON nutrition_plans;
          CREATE POLICY "Allow authenticated users to read active nutrition plans" ON nutrition_plans
            FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
          
          DROP POLICY IF EXISTS "Allow admins to manage nutrition plans" ON nutrition_plans;
          CREATE POLICY "Allow admins to manage nutrition plans" ON nutrition_plans
            FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');
        `);
      } else {
        console.log('✅ RLS policies toegevoegd');
      }
    } catch (error) {
      console.log('⚠️  Kon RLS policies niet toevoegen. Handmatige toevoeging vereist.');
    }
    
    console.log('🎉 Tabel structuur aangepast!');
    console.log('📋 Als er handmatige stappen nodig zijn, voer ze uit in Supabase SQL Editor.');
    console.log('📋 Voer daarna dit script opnieuw uit: node scripts/simple-insert.js');
    
  } catch (error) {
    console.error('❌ Fout tijdens tabel aanpassing:', error);
  }
}

fixTableStructure();
