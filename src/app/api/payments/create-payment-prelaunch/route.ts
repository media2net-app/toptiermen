import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPayment } from '@/lib/mollie';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Package pricing configuration - ORIGINAL FULL PRICES (before any discounts)
const PACKAGE_PRICING = {
  'basic': {
    name: 'Basic Tier',
    monthlyPrice: 49, // 6 months - per month
    yearlyPrice: 44,  // 12 months - per month (10% yearly discount)
    lifetimePrice: null // Not applicable
  },
  'premium': {
    name: 'Premium Tier', 
    monthlyPrice: 79, // 6 months - per month
    yearlyPrice: 71,  // 12 months - per month (10% yearly discount)
    lifetimePrice: null // Not applicable
  },
  'lifetime': {
    name: 'Lifetime Access',
    monthlyPrice: null, // Not applicable
    yearlyPrice: null,  // Not applicable
    lifetimePrice: 1995 // One-time payment - full price
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
      customerEmail,
      discountCode 
    } = body;

    console.log('💳 Creating prelaunch Mollie payment:', { 
      packageId, 
      billingPeriod, 
      paymentFrequency, 
      customerName, 
      customerEmail,
      discountCode 
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

    // Check discount code
    const isDiscountValid = discountCode && discountCode.toUpperCase() === 'TTMPRELAUNCH50';
    const discountMultiplier = isDiscountValid ? 0.5 : 1;
    const discountPercentage = isDiscountValid ? 50 : 0;

    // Calculate pricing based on package and billing period
    let basePrice: number;
    let finalPrice: number;
    let periodDescription: string;
    let paymentDescription: string;

    if (packageId === 'lifetime') {
      // Lifetime package - always one-time payment
      if (!packageInfo.lifetimePrice) {
        return NextResponse.json({ 
          error: `Lifetime price not available for package: ${packageId}` 
        }, { status: 400 });
      }
      basePrice = packageInfo.lifetimePrice;
      finalPrice = basePrice * discountMultiplier;
      periodDescription = 'Levenslang';
      paymentDescription = `${packageInfo.name} - Levenslang - Eenmalig${isDiscountValid ? ' - TTMPrelaunch50' : ' - Prelaunch Prijs'}`;
    } else {
      // Basic or Premium packages
      if (billingPeriod === '6months') {
        if (!packageInfo.monthlyPrice) {
          return NextResponse.json({ 
            error: `Monthly price not available for package: ${packageId}` 
          }, { status: 400 });
        }
        if (paymentFrequency === 'monthly') {
          basePrice = packageInfo.monthlyPrice;
          finalPrice = basePrice * discountMultiplier;
          periodDescription = '6 maanden (maandelijks)';
          paymentDescription = `${packageInfo.name} - 6 maanden - Maandelijks${isDiscountValid ? ' - TTMPrelaunch50' : ' - Prelaunch Prijs'}`;
        } else { // once
          basePrice = packageInfo.monthlyPrice * 6;
          finalPrice = basePrice * discountMultiplier;
          periodDescription = '6 maanden (eenmalig)';
          paymentDescription = `${packageInfo.name} - 6 maanden - Eenmalig${isDiscountValid ? ' - TTMPrelaunch50' : ' - Prelaunch Prijs'}`;
        }
      } else { // 12months
        if (!packageInfo.yearlyPrice) {
          return NextResponse.json({ 
            error: `Yearly price not available for package: ${packageId}` 
          }, { status: 400 });
        }
        if (paymentFrequency === 'monthly') {
          basePrice = packageInfo.yearlyPrice;
          finalPrice = basePrice * discountMultiplier;
          periodDescription = '12 maanden (maandelijks)';
          paymentDescription = `${packageInfo.name} - 12 maanden - Maandelijks${isDiscountValid ? ' - TTMPrelaunch50' : ' - Prelaunch Prijs'}`;
        } else { // once
          basePrice = packageInfo.yearlyPrice * 12;
          finalPrice = basePrice * discountMultiplier;
          periodDescription = '12 maanden (eenmalig)';
          paymentDescription = `${packageInfo.name} - 12 maanden - Eenmalig${isDiscountValid ? ' - TTMPrelaunch50' : ' - Prelaunch Prijs'}`;
        }
      }
    }

    console.log('💰 Pricing calculation:', {
      packageId,
      basePrice,
      finalPrice,
      discountCode,
      discountPercentage,
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
        basePrice,
        finalPrice,
        discountCode: discountCode || null,
        discountPercentage,
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
        original_price: basePrice, // Original price before discount
        discounted_price: finalPrice, // Final price after discount
        discount_percentage: discountPercentage,
        discount_code: discountCode || null,
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
        basePrice,
        finalPrice,
        discountApplied: isDiscountValid,
        discountPercentage,
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
