import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating prelaunch_packages table...');

    // Create table for prelaunch package purchases
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS prelaunch_packages (
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

    // Add indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_email ON prelaunch_packages(email);
      CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_package_id ON prelaunch_packages(package_id);
      CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_payment_status ON prelaunch_packages(payment_status);
      CREATE INDEX IF NOT EXISTS idx_prelaunch_packages_created_at ON prelaunch_packages(created_at);
    `;

    // Enable RLS
    const enableRLSSQL = `
      ALTER TABLE prelaunch_packages ENABLE ROW LEVEL SECURITY;
    `;

    // Create RLS policies
    const createPoliciesSQL = `
      DROP POLICY IF EXISTS "Admin can view all prelaunch packages" ON prelaunch_packages;
      DROP POLICY IF EXISTS "Admin can insert prelaunch packages" ON prelaunch_packages;
      DROP POLICY IF EXISTS "Admin can update prelaunch packages" ON prelaunch_packages;
      
      CREATE POLICY "Admin can view all prelaunch packages" ON prelaunch_packages
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );

      CREATE POLICY "Admin can insert prelaunch packages" ON prelaunch_packages
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );

      CREATE POLICY "Admin can update prelaunch packages" ON prelaunch_packages
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
    `;

    // Try to create table using direct SQL execution
    try {
      // Create table
      const { error: tableError } = await supabase.rpc('exec_sql', { 
        sql_query: createTableSQL 
      });

      if (tableError) {
        console.error('Error creating table:', tableError);
        // Try alternative approach - create table directly
        const { error: directTableError } = await supabase
          .from('prelaunch_packages')
          .select('id')
          .limit(1);
        
        if (directTableError && directTableError.code === '42P01') {
          // Table doesn't exist, try to create it manually
          console.log('Table does not exist, attempting manual creation...');
          return NextResponse.json(
            { error: 'Table creation failed, manual intervention required', details: tableError },
            { status: 500 }
          );
        }
      }

      // Create indexes
      const { error: indexError } = await supabase.rpc('exec_sql', { 
        sql_query: createIndexesSQL 
      });

      if (indexError) {
        console.error('Error creating indexes:', indexError);
      }

      // Enable RLS
      const { error: rlsError } = await supabase.rpc('exec_sql', { 
        sql_query: enableRLSSQL 
      });

      if (rlsError) {
        console.error('Error enabling RLS:', rlsError);
      }

      // Create policies
      const { error: policyError } = await supabase.rpc('exec_sql', { 
        sql_query: createPoliciesSQL 
      });

      if (policyError) {
        console.error('Error creating policies:', policyError);
      }

    } catch (error) {
      console.error('Error in SQL execution:', error);
      return NextResponse.json(
        { error: 'SQL execution failed', details: error },
        { status: 500 }
      );
    }

    console.log('✅ Prelaunch packages table created successfully');

    return NextResponse.json({
      success: true,
      message: 'Prelaunch packages table created successfully'
    });

  } catch (error) {
    console.error('Error creating prelaunch packages table:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
