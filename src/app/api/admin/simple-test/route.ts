import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing simple insert...');
    
    // First, let's check if the table exists by trying to select from it
    console.log('🔍 Checking if table exists...');
    const { data: checkData, error: checkError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Table check error:', checkError);
      return NextResponse.json({ 
        error: 'Table does not exist or is not accessible',
        details: checkError 
      }, { status: 500 });
    }

    console.log('✅ Table exists, attempting insert...');

    const testData = {
      full_name: 'Test User',
      email: 'test@example.com',
      package_id: 'basic-tier',
      package_name: 'Basic Tier',
      payment_period: '6months_monthly',
      original_price: 49.00,
      discounted_price: 24.50,
      discount_percentage: 50,
      payment_method: 'monthly',
      mollie_payment_id: 'test_123456',
      payment_status: 'paid',
      is_test_payment: true
    };

    console.log('📝 Inserting test data:', testData);

    const { data, error } = await supabase
      .from('prelaunch_packages')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      return NextResponse.json({ 
        error: 'Failed to insert test data',
        details: error 
      }, { status: 500 });
    }

    console.log('✅ Test data inserted successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Test data inserted successfully',
      data: data
    });

  } catch (error) {
    console.error('❌ Test insert error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
