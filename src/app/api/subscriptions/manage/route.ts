import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user subscription data
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscription: null, // Mollie doesn't have traditional subscriptions
      customer: null,
      user: {
        subscription_status: user.subscription_status,
        subscription_plan: user.subscription_plan,
        subscription_start_date: user.subscription_start_date,
        subscription_end_date: user.subscription_end_date,
        payment_status: user.payment_status,
        mollie_customer_id: user.mollie_customer_id,
      },
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, subscriptionId } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'cancel':
        // For Mollie, we just update the user status
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_end_date: new Date().toISOString(),
          })
          .eq('id', userId);

        return NextResponse.json({
          message: 'Subscription cancelled successfully',
        });

      case 'reactivate':
        // For Mollie, we reactivate by updating status
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_end_date: null,
          })
          .eq('id', userId);

        return NextResponse.json({
          message: 'Subscription reactivated successfully',
        });

      case 'update_payment_method':
        // For Mollie, we redirect to a new payment flow
        return NextResponse.json({
          message: 'Redirect to payment method update',
          redirectUrl: `/dashboard/instellingen?action=update_payment`,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}