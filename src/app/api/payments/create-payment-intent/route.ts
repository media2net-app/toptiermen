import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, email, name } = await request.json();

    // Validate plan
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: {
          user_id: userId,
        },
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price,
      currency: 'eur',
      customer: customer.id,
      metadata: {
        user_id: userId,
        plan_id: planId,
        plan_name: plan.name,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      payment_method_types: ['card', 'ideal', 'sepa_debit'],
    });

    // Update user with Stripe customer ID
    await supabaseAdmin
      .from('users')
      .update({ 
        stripe_customer_id: customer.id,
        selected_plan: planId 
      })
      .eq('id', userId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 