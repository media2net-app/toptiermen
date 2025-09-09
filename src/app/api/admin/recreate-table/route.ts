import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Recreating prelaunch_packages table...');
    
    // Drop table if exists
    const dropSQL = `DROP TABLE IF EXISTS prelaunch_packages;`;
    
    // Create table with correct structure
    const createSQL = `
      CREATE TABLE prelaunch_packages (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        package_id VARCHAR(50) NOT NULL,
        package_name VARCHAR(255) NOT NULL,
        payment_period VARCHAR(50) NOT NULL,
        original_price DECIMAL(10,2) NOT NULL,
        discounted_price DECIMAL(10,2) NOT NULL,
        discount_percentage INTEGER DEFAULT 50,
        payment_method VARCHAR(50) NOT NULL,
        mollie_payment_id VARCHAR(255),
        payment_status VARCHAR(50) DEFAULT 'pending',
        is_test_payment BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create indexes
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_email ON prelaunch_packages(email);
      CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_package_id ON prelaunch_packages(package_id);
      CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_payment_status ON prelaunch_packages(payment_status);
      CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_created_at ON prelaunch_packages(created_at);
    `;

    // Enable RLS
    const rlsSQL = `
      ALTER TABLE prelaunch_packages ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Enable read access for authenticated users" ON prelaunch_packages
        FOR SELECT USING (auth.role() = 'authenticated');
        
      CREATE POLICY "Enable insert access for authenticated users" ON prelaunch_packages
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
      CREATE POLICY "Enable update access for authenticated users" ON prelaunch_packages
        FOR UPDATE USING (auth.role() = 'authenticated');
    `;

    // Execute SQL commands
    console.log('🗑️ Dropping existing table...');
    await supabase.rpc('exec_sql', { sql_query: dropSQL });
    
    console.log('🏗️ Creating new table...');
    await supabase.rpc('exec_sql', { sql_query: createSQL });
    
    console.log('📊 Creating indexes...');
    await supabase.rpc('exec_sql', { sql_query: indexSQL });
    
    console.log('🔒 Setting up RLS...');
    await supabase.rpc('exec_sql', { sql_query: rlsSQL });

    console.log('✅ Table recreated successfully');

    return NextResponse.json({
      success: true,
      message: 'Prelaunch packages table recreated successfully'
    });

  } catch (error) {
    console.error('❌ Table recreation error:', error);
    return NextResponse.json({ 
      error: 'Failed to recreate table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
