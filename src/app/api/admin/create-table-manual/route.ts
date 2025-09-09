import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating prelaunch_packages table manually...');

    // Create table with a simple approach
    const createTableQuery = `
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

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: createTableQuery 
    });

    if (error) {
      console.error('Error creating table:', error);
      return NextResponse.json(
        { error: 'Failed to create table', details: error },
        { status: 500 }
      );
    }

    console.log('✅ Table created successfully');

    // Test the table by trying to insert a test record
    const { data: testData, error: testError } = await supabase
      .from('prelaunch_packages')
      .insert({
        full_name: 'Test User',
        email: 'test@example.com',
        package_id: 'test',
        package_name: 'Test Package',
        payment_period: 'monthly',
        original_price: 100,
        discounted_price: 50,
        discount_percentage: 50,
        payment_method: 'monthly',
        mollie_payment_id: 'test_payment_123',
        payment_status: 'paid',
        is_test_payment: true
      })
      .select()
      .single();

    if (testError) {
      console.error('Error testing table:', testError);
      return NextResponse.json(
        { error: 'Table created but test insert failed', details: testError },
        { status: 500 }
      );
    }

    // Clean up test record
    await supabase
      .from('prelaunch_packages')
      .delete()
      .eq('id', testData.id);

    return NextResponse.json({
      success: true,
      message: 'Prelaunch packages table created and tested successfully',
      testData: testData
    });

  } catch (error) {
    console.error('Error creating table manually:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
