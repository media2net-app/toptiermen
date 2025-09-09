import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing direct database insert...');

    const testData = {
      full_name: 'Test Direct Insert',
      email: 'test@direct.com',
      package_id: 'basic',
      package_name: 'Basic Tier',
      payment_period: '6months_once',
      original_price: 294,
      discounted_price: 147,
      discount_percentage: 50,
      payment_method: 'once',
      mollie_payment_id: 'test_direct_insert',
      payment_status: 'pending',
      is_test_payment: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('prelaunch_packages')
      .insert(testData)
      .select();

    if (error) {
      console.error('❌ Database insert error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      });
    }

    console.log('✅ Database insert successful:', data);
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('❌ Test insert error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}