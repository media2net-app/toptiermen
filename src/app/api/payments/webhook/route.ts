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
    const body = await request.json();
    const { id: paymentId } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID provided' }, { status: 400 });
    }

    console.log('🔔 Webhook received for payment:', paymentId);

    // Fetch payment details from Mollie
    const mollieResponse = await fetch(`${MOLLIE_API_URL}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`,
      },
    });

    if (!mollieResponse.ok) {
      console.error('Failed to fetch payment from Mollie');
      return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
    }

    const payment = await mollieResponse.json();
    console.log('💳 Payment status:', payment.status);

    // Check if this is a prelaunch package payment
    const { data: prelaunchPackage } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .eq('mollie_payment_id', paymentId)
      .single();

    if (prelaunchPackage) {
      console.log('📦 Found prelaunch package:', prelaunchPackage.email);
      
      // Update prelaunch package status
      const { error: updateError } = await supabase
        .from('prelaunch_packages')
        .update({
          payment_status: payment.status,
          updated_at: new Date().toISOString()
        })
        .eq('mollie_payment_id', paymentId);

      if (updateError) {
        console.error('Prelaunch package update error:', updateError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // If payment is successful, create user account
      if (payment.status === 'paid') {
        console.log('✅ Payment successful, creating user account for:', prelaunchPackage.email);
        await createUserFromPrelaunchPackage(prelaunchPackage);
      }
    } else {
      // Handle regular payments table
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: payment.status,
          updated_at: new Date().toISOString()
        })
        .eq('mollie_payment_id', paymentId);

      if (updateError) {
        console.error('Database update error:', updateError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // If payment is successful, activate user subscription
      if (payment.status === 'paid') {
        const { data: paymentRecord } = await supabase
          .from('payments')
          .select('*')
          .eq('mollie_payment_id', paymentId)
          .single();

        if (paymentRecord) {
          // Activate user subscription
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: paymentRecord.user_id,
              package_id: paymentRecord.package_id,
              billing_period: paymentRecord.billing_period,
              status: 'active',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + (paymentRecord.billing_period === 'yearly' ? 365 : 180) * 24 * 60 * 60 * 1000).toISOString(),
              payment_id: paymentRecord.id
            });

          if (subscriptionError) {
            console.error('Subscription creation error:', subscriptionError);
          }
        }
      }
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Function to create user account from prelaunch package
async function createUserFromPrelaunchPackage(prelaunchPackage: any) {
  try {
    console.log('👤 Creating user account for:', prelaunchPackage.email);

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    const userExists = existingUsers?.users?.find((user: any) => user.email === prelaunchPackage.email);
    
    if (userExists) {
      console.log('👤 User already exists:', prelaunchPackage.email);
      return;
    }

    // Create user account
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: prelaunchPackage.email,
      email_confirm: true,
      user_metadata: {
        full_name: prelaunchPackage.full_name,
        package_id: prelaunchPackage.package_id,
        package_name: prelaunchPackage.package_name,
        payment_period: prelaunchPackage.payment_period,
        prelaunch_customer: true
      }
    });

    if (createError) {
      console.error('❌ Error creating user:', createError);
      return;
    }

    console.log('✅ User created successfully:', newUser.user?.id);

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user!.id,
        email: prelaunchPackage.email,
        full_name: prelaunchPackage.full_name,
        username: prelaunchPackage.email.split('@')[0],
        rank: 'Beginner',
        status: 'active',
        subscription_tier: prelaunchPackage.package_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
    } else {
      console.log('✅ Profile created successfully');
    }

    // Create subscription record
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: newUser.user!.id,
        package_id: prelaunchPackage.package_id,
        billing_period: prelaunchPackage.payment_period,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + (prelaunchPackage.payment_period.includes('yearly') ? 365 : 180) * 24 * 60 * 60 * 1000).toISOString(),
        payment_id: prelaunchPackage.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (subscriptionError) {
      console.error('❌ Error creating subscription:', subscriptionError);
    } else {
      console.log('✅ Subscription created successfully');
    }

  } catch (error) {
    console.error('❌ Error in createUserFromPrelaunchPackage:', error);
  }
}
