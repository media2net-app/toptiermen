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

async function createTable() {
  try {
    console.log('🚀 Aanmaken van nutrition_plans tabel...');
    
    // Create table using raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS nutrition_plans (
        id SERIAL PRIMARY KEY,
        plan_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        subtitle TEXT,
        description TEXT,
        icon VARCHAR(10),
        color VARCHAR(100),
        meals JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log('📝 Uitvoeren CREATE TABLE statement...');
    
    // Try to execute via RPC first
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (rpcError) {
      console.log('⚠️  RPC niet beschikbaar, probeer via directe insert...');
      
      // Try to create table by inserting a dummy record and catching the error
      const { error: insertError } = await supabase
        .from('nutrition_plans')
        .insert({
          plan_id: 'test',
          name: 'Test Plan',
          subtitle: 'Test',
          description: 'Test',
          icon: '🧪',
          color: 'test',
          meals: [],
          is_active: true
        });
      
      if (insertError && insertError.message.includes('relation "nutrition_plans" does not exist')) {
        console.log('❌ Tabel bestaat nog niet. Je moet de tabel handmatig aanmaken in Supabase Dashboard.');
        console.log('📋 Ga naar: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql');
        console.log('📋 Voer dit SQL script uit:');
        console.log('');
        console.log(createTableSQL);
        console.log('');
        console.log('📋 En voeg daarna de indexes toe:');
        console.log('');
        console.log(`
          CREATE INDEX IF NOT EXISTS idx_nutrition_plans_plan_id ON nutrition_plans(plan_id);
          CREATE INDEX IF NOT EXISTS idx_nutrition_plans_active ON nutrition_plans(is_active);
        `);
        console.log('');
        console.log('📋 En voeg RLS policies toe:');
        console.log('');
        console.log(`
          ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Allow authenticated users to read active nutrition plans" ON nutrition_plans
            FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
          
          CREATE POLICY "Allow admins to manage nutrition plans" ON nutrition_plans
            FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');
        `);
        return;
      }
    }
    
    console.log('✅ Tabel succesvol aangemaakt!');
    
    // Try to insert test data
    console.log('📝 Invoegen van test data...');
    const { data, error } = await supabase
      .from('nutrition_plans')
      .insert({
        plan_id: 'test',
        name: 'Test Plan',
        subtitle: 'Test',
        description: 'Test',
        icon: '🧪',
        color: 'test',
        meals: [],
        is_active: true
      })
      .select();
    
    if (error) {
      console.error('❌ Fout bij test insert:', error);
    } else {
      console.log('✅ Test data succesvol ingevoegd!');
      
      // Clean up test data
      await supabase
        .from('nutrition_plans')
        .delete()
        .eq('plan_id', 'test');
      
      console.log('🧹 Test data opgeruimd');
    }
    
    console.log('🎉 Tabel setup voltooid!');
    console.log('📋 Je kunt nu het migratie script uitvoeren: node scripts/run-nutrition-plans-migration.js');
    
  } catch (error) {
    console.error('❌ Fout tijdens tabel creatie:', error);
  }
}

createTable();
