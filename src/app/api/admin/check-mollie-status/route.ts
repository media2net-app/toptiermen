import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { packageId } = await request.json();
    
    if (!packageId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Package ID is required' 
      });
    }

    console.log(`🔍 Checking Mollie status for package ID: ${packageId}`);

    // Get the package from database
    const { data: packageData, error: fetchError } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (fetchError || !packageData) {
      console.error('❌ Package not found:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: 'Package not found' 
      });
    }

    const molliePaymentId = packageData.mollie_payment_id;
    console.log(`📋 Package found: ${packageData.full_name} - Mollie ID: ${molliePaymentId}`);

    // Check Mollie payment status
    const mollieApiKey = process.env.MOLLIE_LIVE_KEY || process.env.MOLLIE_TEST_KEY;
    if (!mollieApiKey) {
      console.error('❌ Mollie API key not found');
      return NextResponse.json({ 
        success: false, 
        error: 'Mollie API key not configured' 
      });
    }

    const mollieResponse = await fetch(`https://api.mollie.com/v2/payments/${molliePaymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!mollieResponse.ok) {
      const errorText = await mollieResponse.text();
      console.error('❌ Mollie API error:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Mollie API error: ${mollieResponse.status}`,
        details: errorText
      });
    }

    const mollieData = await mollieResponse.json();
    console.log('✅ Mollie response:', mollieData);

    // Map Mollie status to our status
    let newStatus = 'pending';
    switch (mollieData.status) {
      case 'paid':
        newStatus = 'paid';
        break;
      case 'failed':
      case 'canceled':
        newStatus = 'failed';
        break;
      case 'expired':
        newStatus = 'expired';
        break;
      default:
        newStatus = 'pending';
    }

    // Update database if status changed
    if (newStatus !== packageData.payment_status) {
      console.log(`🔄 Updating status from ${packageData.payment_status} to ${newStatus}`);
      
      const { error: updateError } = await supabase
        .from('prelaunch_packages')
        .update({ 
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', packageId);

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to update database',
          details: updateError
        });
      }

      console.log('✅ Database updated successfully');
    } else {
      console.log('ℹ️ Status unchanged, no database update needed');
    }

    return NextResponse.json({
      success: true,
      packageId: packageId,
      mollieStatus: mollieData.status,
      ourStatus: newStatus,
      statusChanged: newStatus !== packageData.payment_status,
      mollieData: {
        id: mollieData.id,
        status: mollieData.status,
        amount: mollieData.amount,
        description: mollieData.description,
        createdAt: mollieData.createdAt,
        paidAt: mollieData.paidAt
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error',
      details: error 
    });
  }
}
