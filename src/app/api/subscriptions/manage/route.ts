import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
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
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.stripe_customer_id) {
      return NextResponse.json({
        subscription: null,
        customer: null,
      });
    }

    // Get Stripe customer and subscription data
    const stripe = getStripeServer();
    const customer = await stripe.customers.retrieve(user.stripe_customer_id);
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
    });

    return NextResponse.json({
      subscription: subscriptions.data[0] || null,
      customer,
      user: {
        subscription_status: user.subscription_status,
        subscription_plan: user.subscription_plan,
        subscription_start_date: user.subscription_start_date,
        subscription_end_date: user.subscription_end_date,
        payment_status: user.payment_status,
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

    // Initialize Stripe
    const stripe = getStripeServer();

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
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
        if (!subscriptionId) {
          return NextResponse.json(
            { error: 'Subscription ID is required for cancellation' },
            { status: 400 }
          );
        }

        // Cancel subscription at period end
        const cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        }) as any;

        // Update user status
        await supabaseAdmin
          .from('users')
          .update({
            subscription_status: 'cancelling',
            subscription_end_date: new Date(cancelledSubscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', userId);

        return NextResponse.json({
          message: 'Subscription cancelled successfully',
          subscription: cancelledSubscription,
        });

      case 'reactivate':
        if (!subscriptionId) {
          return NextResponse.json(
            { error: 'Subscription ID is required for reactivation' },
            { status: 400 }
          );
        }

        // Reactivate subscription
        const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        });

        // Update user status
        await supabaseAdmin
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_end_date: null,
          })
          .eq('id', userId);

        return NextResponse.json({
          message: 'Subscription reactivated successfully',
          subscription: reactivatedSubscription,
        });

      case 'update_payment_method':
        // Create a setup intent for updating payment method
        const setupIntent = await stripe.setupIntents.create({
          customer: user.stripe_customer_id,
          payment_method_types: ['card', 'ideal', 'sepa_debit'],
        });

        return NextResponse.json({
          clientSecret: setupIntent.client_secret,
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