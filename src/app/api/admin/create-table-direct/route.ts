import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating prelaunch_packages table directly...');
    
    // Try to create table using raw SQL
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

    // Try different methods to execute SQL
    console.log('📝 Attempting to create table...');
    
    // Method 1: Try using rpc with exec_sql
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { 
        sql_query: createTableSQL 
      });
      
      if (rpcError) {
        console.log('❌ RPC exec_sql failed:', rpcError);
        throw rpcError;
      }
      
      console.log('✅ Table created via RPC exec_sql');
    } catch (rpcError) {
      console.log('⚠️ RPC exec_sql not available, trying alternative...');
      
      // Method 2: Try using a custom RPC function
      try {
        const { data: customData, error: customError } = await supabase.rpc('create_prelaunch_table');
        
        if (customError) {
          console.log('❌ Custom RPC failed:', customError);
          throw customError;
        }
        
        console.log('✅ Table created via custom RPC');
      } catch (customError) {
        console.log('⚠️ Custom RPC not available');
        
        // Method 3: Return instructions for manual creation
        return NextResponse.json({
          success: false,
          message: 'Automatic table creation failed. Please create the table manually.',
          instructions: {
            step1: 'Go to your Supabase dashboard',
            step2: 'Navigate to SQL Editor',
            step3: 'Run the following SQL:',
            sql: createTableSQL,
            step4: 'Then run this API again to test the insert'
          },
          error: customError
        }, { status: 500 });
      }
    }

    // Test if table was created successfully
    console.log('🔍 Testing table creation...');
    const { data: testData, error: testError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Table test failed:', testError);
      return NextResponse.json({ 
        error: 'Table creation failed or table is not accessible',
        details: testError 
      }, { status: 500 });
    }

    console.log('✅ Table created and accessible successfully');

    return NextResponse.json({
      success: true,
      message: 'Prelaunch packages table created successfully',
      testResult: testData
    });

  } catch (error) {
    console.error('❌ Table creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
