import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event;

  try {
    const stripe = getStripeServer();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const { user_id, plan_id, plan_name } = paymentIntent.metadata;
  
  // Update user subscription status
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_plan: plan_id,
      subscription_start_date: new Date().toISOString(),
      payment_status: 'paid',
    })
    .eq('id', user_id);

  console.log(`Payment succeeded for user ${user_id}, plan: ${plan_name}`);
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const { user_id } = paymentIntent.metadata;
  
  // Update user payment status
  await supabaseAdmin
    .from('profiles')
    .update({
      payment_status: 'failed',
      subscription_status: 'inactive',
    })
    .eq('id', user_id);

  console.log(`Payment failed for user ${user_id}`);
}

async function handleSubscriptionCreated(subscription: any) {
  const { user_id } = subscription.metadata;
  
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'active',
      stripe_subscription_id: subscription.id,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', user_id);

  console.log(`Subscription created for user ${user_id}`);
}

async function handleSubscriptionUpdated(subscription: any) {
  const { user_id } = subscription.metadata;
  
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', user_id);

  console.log(`Subscription updated for user ${user_id}, status: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: any) {
  const { user_id } = subscription.metadata;
  
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      subscription_end_date: new Date().toISOString(),
    })
    .eq('id', user_id);

  console.log(`Subscription cancelled for user ${user_id}`);
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const { user_id } = invoice.metadata;
  
  await supabaseAdmin
    .from('profiles')
    .update({
      payment_status: 'paid',
      last_payment_date: new Date().toISOString(),
    })
    .eq('id', user_id);

  console.log(`Invoice payment succeeded for user ${user_id}`);
}

async function handleInvoicePaymentFailed(invoice: any) {
  const { user_id } = invoice.metadata;
  
  await supabaseAdmin
    .from('profiles')
    .update({
      payment_status: 'failed',
      subscription_status: 'past_due',
    })
    .eq('id', user_id);

  console.log(`Invoice payment failed for user ${user_id}`);
} 