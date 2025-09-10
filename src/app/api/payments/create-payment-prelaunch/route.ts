import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPayment } from '@/lib/mollie';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Package pricing configuration - these are the FINAL prices that customers pay (already discounted)
const PACKAGE_PRICING = {
  'basic': {
    name: 'Basic Tier',
    monthlyPrice: 24.50, // 6 months - prelaunch price (€49 * 0.5)
    yearlyPrice: 22.00,  // 12 months - prelaunch price (€44 * 0.5)
    lifetimePrice: null // Not applicable
  },
  'premium': {
    name: 'Premium Tier', 
    monthlyPrice: 39.50, // 6 months - prelaunch price (€79 * 0.5)
    yearlyPrice: 35.50,  // 12 months - prelaunch price (€71 * 0.5)
    lifetimePrice: null // Not applicable
  },
  'lifetime': {
    name: 'Lifetime Access',
    monthlyPrice: 997.50, // One-time payment - prelaunch price (€1995 * 0.5)
    yearlyPrice: 997.50,  // One-time payment - prelaunch price (€1995 * 0.5)
    lifetimePrice: 997.50 // One-time payment - prelaunch price (€1995 * 0.5)
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      packageId, 
      billingPeriod, 
      paymentFrequency, 
      customerName, 
      customerEmail 
    } = body;

    console.log('💳 Creating prelaunch Mollie payment:', { 
      packageId, 
      billingPeriod, 
      paymentFrequency, 
      customerName, 
      customerEmail 
    });

    // Validate required fields
    if (!packageId || !billingPeriod || !paymentFrequency || !customerName || !customerEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields: packageId, billingPeriod, paymentFrequency, customerName, customerEmail' 
      }, { status: 400 });
    }

    // Get package pricing
    const packageInfo = PACKAGE_PRICING[packageId as keyof typeof PACKAGE_PRICING];
    if (!packageInfo) {
      return NextResponse.json({ 
        error: `Invalid package ID: ${packageId}` 
      }, { status: 400 });
    }

    // Calculate pricing based on package and billing period
    let finalPrice: number;
    let periodDescription: string;
    let paymentDescription: string;

    if (packageId === 'lifetime') {
      // Lifetime package - always one-time payment
      finalPrice = packageInfo.lifetimePrice!;
      periodDescription = 'Levenslang';
      paymentDescription = `${packageInfo.name} - Levenslang - Eenmalig - Prelaunch Prijs`;
    } else {
      // Basic or Premium packages
      if (billingPeriod === '6months') {
        if (paymentFrequency === 'monthly') {
          finalPrice = packageInfo.monthlyPrice;
          periodDescription = '6 maanden (maandelijks)';
          paymentDescription = `${packageInfo.name} - 6 maanden - Maandelijks - Prelaunch Prijs`;
        } else { // once
          finalPrice = packageInfo.monthlyPrice * 6;
          periodDescription = '6 maanden (eenmalig)';
          paymentDescription = `${packageInfo.name} - 6 maanden - Eenmalig - Prelaunch Prijs`;
        }
      } else { // 12months
        if (paymentFrequency === 'monthly') {
          finalPrice = packageInfo.yearlyPrice;
          periodDescription = '12 maanden (maandelijks)';
          paymentDescription = `${packageInfo.name} - 12 maanden - Maandelijks - Prelaunch Prijs`;
        } else { // once
          finalPrice = packageInfo.yearlyPrice * 12;
          periodDescription = '12 maanden (eenmalig)';
          paymentDescription = `${packageInfo.name} - 12 maanden - Eenmalig - Prelaunch Prijs`;
        }
      }
    }

    console.log('💰 Pricing calculation:', {
      packageId,
      finalPrice,
      periodDescription,
      paymentDescription
    });

    // Create payment using Mollie library
    const payment = await createPayment({
      amount: finalPrice,
      currency: 'EUR',
      description: paymentDescription,
      redirectUrl: `https://platform.toptiermen.eu/payment/success?package=${packageId}&period=${billingPeriod}&frequency=${paymentFrequency}`,
      webhookUrl: `https://platform.toptiermen.eu/api/payments/webhook`,
      metadata: {
        packageId,
        packageName: packageInfo.name,
        billingPeriod,
        paymentFrequency,
        finalPrice,
        customerName,
        customerEmail,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Mollie payment created:', payment.id);

    // Store payment in database
    const { error: dbError } = await supabase
      .from('prelaunch_packages')
      .insert({
        mollie_payment_id: payment.id,
        package_id: packageId,
        package_name: packageInfo.name,
        payment_period: `${billingPeriod}_${paymentFrequency}`,
        original_price: finalPrice, // This is now the final price customers pay
        discounted_price: finalPrice, // Same as original since it's already discounted
        discount_percentage: 50,
        payment_method: paymentFrequency,
        full_name: customerName,
        email: customerEmail,
        payment_status: 'pending',
        is_test_payment: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      console.error('Failed to save payment data to database');
      // Don't fail the request if database insert fails
    } else {
      console.log('✅ Payment data saved to database successfully');
    }

    return NextResponse.json({
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl(),
      status: payment.status,
      packageInfo: {
        name: packageInfo.name,
        finalPrice,
        periodDescription,
        paymentDescription
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
