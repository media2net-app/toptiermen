import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MOLLIE_API_KEY = process.env.MOLLIE_LIVE_KEY || process.env.MOLLIE_TEST_KEY || process.env.MOLLIE_API_KEY;
const MOLLIE_API_URL = 'https://api.mollie.com/v2';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting Mollie sales sync...');
    
    if (!MOLLIE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Mollie API key not configured'
      }, { status: 500 });
    }

    // Get recent payments from Mollie (last 50)
    const mollieResponse = await fetch(`${MOLLIE_API_URL}/payments?limit=50`, {
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!mollieResponse.ok) {
      const errorText = await mollieResponse.text();
      console.error('❌ Mollie API error:', mollieResponse.status, errorText);
      return NextResponse.json({
        success: false,
        error: `Mollie API error: ${mollieResponse.status}`,
        details: errorText
      });
    }

    const mollieData = await mollieResponse.json();
    const payments = mollieData._embedded?.payments || [];
    
    console.log(`📊 Found ${payments.length} recent payments from Mollie`);

    // Get existing packages from database
    const { data: existingPackages, error: dbError } = await supabase
      .from('prelaunch_packages')
      .select('mollie_payment_id');

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: dbError
      });
    }

    const existingPaymentIds = new Set(existingPackages?.map(p => p.mollie_payment_id) || []);
    console.log(`📊 Found ${existingPaymentIds.size} existing packages in database`);

    // Filter for new payments that might be prelaunch packages
    const newPayments = payments.filter(payment => {
      // Only process payments that:
      // 1. Are not already in our database
      // 2. Have amounts that match our package prices
      // 3. Are not older than 7 days (to avoid processing very old payments)
      
      const isNew = !existingPaymentIds.has(payment.id);
      const isRecent = new Date(payment.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Check if amount matches our package prices
      const amount = parseFloat(payment.amount.value);
      const isPrelaunchAmount = [
        39.50, 79.00, 426.00, 852.00, 997.50, 1995.00, // Common prelaunch amounts
        19.75, 39.50, 213.00, 426.00, 498.75, 997.50   // 50% discount amounts
      ].includes(amount);
      
      return isNew && isRecent && isPrelaunchAmount;
    });

    console.log(`🆕 Found ${newPayments.length} potential new prelaunch packages`);

    const newPackages = [];
    const errors = [];

    for (const payment of newPayments) {
      try {
        console.log(`🔍 Processing payment ${payment.id}: €${payment.amount.value}`);
        
        // Determine package type based on amount
        let packageId = 'unknown';
        let packageName = 'Unknown Package';
        let paymentPeriod = 'unknown';
        let originalPrice = parseFloat(payment.amount.value);
        let discountedPrice = parseFloat(payment.amount.value);
        let discountPercentage = 0;

        // Map amounts to package types
        const amount = parseFloat(payment.amount.value);
        
        if (amount === 39.50 || amount === 19.75) {
          packageId = 'basic';
          packageName = 'Basic Tier';
          paymentPeriod = '6months_monthly';
          originalPrice = amount === 19.75 ? 39.50 : 39.50;
          discountPercentage = amount === 19.75 ? 50 : 0;
        } else if (amount === 79.00 || amount === 39.50) {
          packageId = 'premium';
          packageName = 'Premium Tier';
          paymentPeriod = '6months_monthly';
          originalPrice = amount === 39.50 ? 79.00 : 79.00;
          discountPercentage = amount === 39.50 ? 50 : 0;
        } else if (amount === 426.00 || amount === 213.00) {
          packageId = 'premium';
          packageName = 'Premium Tier';
          paymentPeriod = '12months_monthly';
          originalPrice = amount === 213.00 ? 426.00 : 426.00;
          discountPercentage = amount === 213.00 ? 50 : 0;
        } else if (amount === 852.00 || amount === 426.00) {
          packageId = 'premium';
          packageName = 'Premium Tier';
          paymentPeriod = '12months_yearly';
          originalPrice = amount === 426.00 ? 852.00 : 852.00;
          discountPercentage = amount === 426.00 ? 50 : 0;
        } else if (amount === 997.50 || amount === 498.75) {
          packageId = 'lifetime';
          packageName = 'Lifetime Access';
          paymentPeriod = '12months_monthly';
          originalPrice = amount === 498.75 ? 997.50 : 997.50;
          discountPercentage = amount === 498.75 ? 50 : 0;
        } else if (amount === 1995.00 || amount === 997.50) {
          packageId = 'lifetime';
          packageName = 'Lifetime Access';
          paymentPeriod = '12months_yearly';
          originalPrice = amount === 997.50 ? 1995.00 : 1995.00;
          discountPercentage = amount === 997.50 ? 50 : 0;
        }

        // Determine payment status
        let paymentStatus = 'pending';
        switch (payment.status) {
          case 'paid':
            paymentStatus = 'paid';
            break;
          case 'failed':
          case 'canceled':
            paymentStatus = 'failed';
            break;
          case 'expired':
            paymentStatus = 'expired';
            break;
          default:
            paymentStatus = 'pending';
        }

        // Check if this is a test payment
        const isTestPayment = payment.mode === 'test' || payment.id.startsWith('test_');

        // Extract customer info from payment
        const customerEmail = payment.customerId ? 
          await getCustomerEmail(payment.customerId) : 
          payment.metadata?.email || 'unknown@example.com';
        
        const customerName = payment.metadata?.name || 
          payment.description?.split(' - ')[0] || 
          'Unknown Customer';

        const newPackage = {
          full_name: customerName,
          email: customerEmail,
          package_id: packageId,
          package_name: packageName,
          payment_period: paymentPeriod,
          original_price: originalPrice,
          discounted_price: discountedPrice,
          discount_percentage: discountPercentage,
          payment_method: payment.method || 'unknown',
          mollie_payment_id: payment.id,
          payment_status: paymentStatus,
          is_test_payment: isTestPayment,
          created_at: payment.createdAt,
          updated_at: payment.paidAt || payment.createdAt
        };

        // Insert into database
        const { data: insertedPackage, error: insertError } = await supabase
          .from('prelaunch_packages')
          .insert([newPackage])
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Error inserting package ${payment.id}:`, insertError);
          errors.push({
            paymentId: payment.id,
            error: insertError.message
          });
        } else {
          console.log(`✅ Successfully added package ${payment.id}: ${customerName}`);
          newPackages.push(insertedPackage);
        }

      } catch (error) {
        console.error(`❌ Error processing payment ${payment.id}:`, error);
        errors.push({
          paymentId: payment.id,
          error: error.message
        });
      }
    }

    console.log(`✅ Sync completed: ${newPackages.length} new packages added, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      newPackages: newPackages.length,
      errors: errors.length,
      packages: newPackages,
      errorDetails: errors,
      summary: {
        totalMolliePayments: payments.length,
        existingInDatabase: existingPaymentIds.size,
        potentialNew: newPayments.length,
        successfullyAdded: newPackages.length,
        failedToAdd: errors.length
      }
    });

  } catch (error) {
    console.error('❌ Sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Sync failed',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to get customer email from Mollie
async function getCustomerEmail(customerId: string): Promise<string> {
  try {
    const customerResponse = await fetch(`${MOLLIE_API_URL}/customers/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (customerResponse.ok) {
      const customer = await customerResponse.json();
      return customer.email || 'unknown@example.com';
    }
  } catch (error) {
    console.error('Error fetching customer email:', error);
  }
  
  return 'unknown@example.com';
}
