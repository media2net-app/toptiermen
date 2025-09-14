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
    console.log('🔄 Starting email update for existing packages...');
    
    if (!MOLLIE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Mollie API key not configured'
      }, { status: 500 });
    }

    // Get all packages with unknown emails
    const { data: packages, error: dbError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .eq('email', 'unknown@example.com')
      .not('mollie_payment_id', 'is', null);

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: dbError
      });
    }

    console.log(`📊 Found ${packages?.length || 0} packages with unknown emails`);

    if (!packages || packages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No packages with unknown emails found',
        updated: 0
      });
    }

    const updatedPackages = [];
    const errors = [];

    for (const packageData of packages) {
      try {
        console.log(`🔍 Updating email for package ${packageData.mollie_payment_id}...`);
        
        // Get payment details from Mollie
        const mollieResponse = await fetch(`${MOLLIE_API_URL}/payments/${packageData.mollie_payment_id}`, {
          headers: {
            'Authorization': `Bearer ${MOLLIE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!mollieResponse.ok) {
          console.error(`❌ Mollie API error for ${packageData.mollie_payment_id}:`, mollieResponse.status);
          errors.push({
            packageId: packageData.id,
            mollieId: packageData.mollie_payment_id,
            error: `Mollie API error: ${mollieResponse.status}`
          });
          continue;
        }

        const payment = await mollieResponse.json();
        
        // Extract customer info from payment metadata
        const customerEmail = payment.metadata?.customerEmail || 
          payment.metadata?.email || 
          (payment.customerId ? await getCustomerEmail(payment.customerId) : null);
        
        const customerName = payment.metadata?.customerName || 
          payment.metadata?.name || 
          payment.description?.split(' - ')[0] || 
          null;

        if (!customerEmail || customerEmail === 'unknown@example.com') {
          console.log(`ℹ️ No valid email found for ${packageData.mollie_payment_id}`);
          errors.push({
            packageId: packageData.id,
            mollieId: packageData.mollie_payment_id,
            error: 'No valid email found in Mollie data'
          });
          continue;
        }

        // Update package with correct email and name
        const updateData: any = {
          email: customerEmail,
          updated_at: new Date().toISOString()
        };

        if (customerName && customerName !== 'Unknown Customer') {
          updateData.full_name = customerName;
        }

        const { error: updateError } = await supabase
          .from('prelaunch_packages')
          .update(updateData)
          .eq('id', packageData.id);

        if (updateError) {
          console.error(`❌ Error updating package ${packageData.id}:`, updateError);
          errors.push({
            packageId: packageData.id,
            mollieId: packageData.mollie_payment_id,
            error: updateError.message
          });
        } else {
          console.log(`✅ Successfully updated package ${packageData.id}: ${customerEmail}`);
          updatedPackages.push({
            id: packageData.id,
            mollieId: packageData.mollie_payment_id,
            oldEmail: 'unknown@example.com',
            newEmail: customerEmail,
            newName: customerName
          });
        }

      } catch (error) {
        console.error(`❌ Error processing package ${packageData.id}:`, error);
        errors.push({
          packageId: packageData.id,
          mollieId: packageData.mollie_payment_id,
          error: error.message
        });
      }
    }

    console.log(`✅ Email update completed: ${updatedPackages.length} updated, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      updated: updatedPackages.length,
      errors: errors.length,
      packages: updatedPackages,
      errorDetails: errors,
      summary: {
        totalPackages: packages.length,
        successfullyUpdated: updatedPackages.length,
        failedToUpdate: errors.length
      }
    });

  } catch (error) {
    console.error('❌ Email update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Email update failed',
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
