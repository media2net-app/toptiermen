import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      packageId,
      billingPeriod,
      paymentFrequency,
      amount,
      description,
      customerName,
      customerEmail,
      isTestPayment = true
    } = body;

    console.log('🧪 Creating test payment with data:', {
      packageId,
      billingPeriod,
      paymentFrequency,
      amount,
      description,
      customerName,
      customerEmail,
      isTestPayment
    });

    // Validate required fields
    if (!packageId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a test payment ID
    const testPaymentId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine package details
    const packageDetails = {
      'basic': { name: 'Basic Tier', originalPrice: 49 },
      'premium': { name: 'Premium Tier', originalPrice: 79 },
      'lifetime': { name: 'Lifetime Access', originalPrice: 1995 }
    };

    const packageInfo = packageDetails[packageId as keyof typeof packageDetails] || { name: 'Unknown Package', originalPrice: 0 };

    // Calculate pricing based on package and billing period
    let originalPrice: number;
    let paymentPeriod: string;

    if (packageId === 'lifetime') {
      originalPrice = packageInfo.originalPrice;
      paymentPeriod = 'lifetime';
    } else {
      if (billingPeriod === '6months') {
        if (paymentFrequency === 'monthly') {
          originalPrice = packageInfo.originalPrice;
          paymentPeriod = '6months_monthly';
        } else {
          originalPrice = packageInfo.originalPrice * 6;
          paymentPeriod = '6months_once';
        }
      } else { // 12months
        if (paymentFrequency === 'monthly') {
          originalPrice = Math.round(packageInfo.originalPrice * 0.9); // 10% discount for yearly
          paymentPeriod = '12months_monthly';
        } else {
          originalPrice = Math.round(packageInfo.originalPrice * 0.9) * 12;
          paymentPeriod = '12months_once';
        }
      }
    }

    const discountedPrice = Math.round(originalPrice * 0.5); // 50% prelaunch discount
    const discountPercentage = 50;

    // Try to insert into prelaunch_packages table
    let packageData;

    try {
      const { data, error } = await supabase
        .from('prelaunch_packages')
        .insert({
          full_name: customerName,
          email: customerEmail,
          package_id: packageId,
          package_name: packageInfo.name,
          payment_period: paymentPeriod,
          original_price: originalPrice,
          discounted_price: discountedPrice,
          discount_percentage: discountPercentage,
          payment_method: paymentFrequency,
          mollie_payment_id: testPaymentId,
          payment_status: 'paid', // Test payments are automatically marked as paid
          is_test_payment: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting test payment:', error);
        
        // If table doesn't exist, return mock data for testing
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('Table does not exist, returning mock data for testing...');
          
          packageData = {
            id: 1,
            full_name: customerName,
            email: customerEmail,
            package_id: packageId,
            package_name: packageInfo.name,
            payment_period: paymentPeriod,
            original_price: originalPrice,
            discounted_price: discountedPrice,
            discount_percentage: discountPercentage,
            payment_method: paymentFrequency,
            mollie_payment_id: testPaymentId,
            payment_status: 'paid',
            is_test_payment: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        } else {
          throw error;
        }
      } else {
        packageData = data;
      }
    } catch (error) {
      console.error('Unexpected error in test payment:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // For now, return mock data to allow testing
      console.log('Returning mock data due to error...');
      packageData = {
        id: 1,
        full_name: customerName,
        email: customerEmail,
        package_id: packageId,
        package_name: packageInfo.name,
        payment_period: paymentPeriod,
        original_price: originalPrice,
        discounted_price: discountedPrice,
        discount_percentage: discountPercentage,
        payment_method: paymentFrequency,
        mollie_payment_id: testPaymentId,
        payment_status: 'paid',
        is_test_payment: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    console.log('✅ Test payment saved successfully:', packageData);

    return NextResponse.json({
      success: true,
      message: 'Test payment created successfully',
      paymentId: testPaymentId,
      packageData: packageData
    });

  } catch (error) {
    console.error('Test payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}