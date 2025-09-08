import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
let stripeInstance: Stripe | null = null;

export const getStripeServer = () => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }
  return stripeInstance;
};

// For backward compatibility - only initialize if not in build
export const stripe = process.env.STRIPE_SECRET_KEY ? getStripeServer() : {} as Stripe;

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  'basic-tier': {
    id: 'price_basic_tier',
    name: 'Basic Tier',
    price: 4900, // €49.00 in cents
    interval: 'month',
    description: 'Minimaal 6 maanden vereist'
  },
  'premium-tier': {
    id: 'price_premium_tier',
    name: 'Premium Tier',
    price: 7900, // €79.00 in cents
    interval: 'month',
    description: 'Minimaal 6 maanden vereist'
  },
  'lifetime-tier': {
    id: 'price_lifetime_tier',
    name: 'Lifetime Tier',
    price: 199500, // €1995.00 in cents
    interval: 'one-time',
    description: 'Eénmalige betaling, levenslang toegang'
  }
};

// Payment methods configuration
export const PAYMENT_METHODS = {
  ideal: {
    name: 'iDEAL',
    description: 'Direct betalen via je bank',
    icon: '🏦'
  },
  card: {
    name: 'Credit Card',
    description: 'Visa, Mastercard, American Express',
    icon: '💳'
  },
  sepa_debit: {
    name: 'SEPA Direct Debit',
    description: 'Automatische incasso',
    icon: '📋'
  }
};

// Webhook events to handle
export const WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed'
]; 