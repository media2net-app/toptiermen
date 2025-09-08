import { createMollieClient, Payment } from '@mollie/api-client';

// Server-side Mollie instance
let mollieInstance: any = null;

export const getMollieServer = () => {
  if (!mollieInstance) {
    const apiKey = process.env.MOLLIE_LIVE_KEY || process.env.MOLLIE_TEST_KEY;
    
    if (!apiKey) {
      throw new Error('MOLLIE_LIVE_KEY or MOLLIE_TEST_KEY is not configured');
    }
    
    mollieInstance = createMollieClient({ apiKey });
  }
  
  return mollieInstance;
};

// Export singleton instance
export const mollie = process.env.MOLLIE_LIVE_KEY || process.env.MOLLIE_TEST_KEY 
  ? getMollieServer() 
  : null;

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  'basic-tier': {
    id: 'basic-tier',
    name: 'Basic Tier',
    price: 49.00,
    currency: 'EUR',
    interval: 'month',
    description: 'Minimaal 6 maanden vereist'
  },
  'premium-tier': {
    id: 'premium-tier',
    name: 'Premium Tier',
    price: 79.00,
    currency: 'EUR',
    interval: 'month',
    description: 'Minimaal 6 maanden vereist'
  },
  'lifetime-tier': {
    id: 'lifetime-tier',
    name: 'Lifetime Tier',
    price: 1995.00,
    currency: 'EUR',
    interval: 'once',
    description: 'Eénmalige betaling, levenslang toegang'
  }
};

// Payment methods (for reference - Mollie shows all available methods automatically)
export const PAYMENT_METHODS = [
  'ideal',
  'creditcard',
  'paypal',
  'sofort',
  'bancontact',
  'banktransfer'
];

// Create a payment
export const createPayment = async (data: {
  amount: number;
  currency: string;
  description: string;
  redirectUrl: string;
  webhookUrl?: string;
  metadata?: any;
}) => {
  const mollieClient = getMollieServer();
  
  const paymentData: any = {
    amount: {
      currency: data.currency,
      value: data.amount.toFixed(2)
    },
    description: data.description,
    redirectUrl: data.redirectUrl,
    metadata: data.metadata
  };

  // Only add webhook URL in production
  if (process.env.NODE_ENV === 'production' && data.webhookUrl) {
    paymentData.webhookUrl = data.webhookUrl;
  }

  const payment = await mollieClient.payments.create(paymentData);
  
  return payment;
};

// Get payment status
export const getPayment = async (paymentId: string) => {
  const mollieClient = getMollieServer();
  return await mollieClient.payments.get(paymentId);
};

// Cancel payment
export const cancelPayment = async (paymentId: string) => {
  const mollieClient = getMollieServer();
  return await mollieClient.payments.cancel(paymentId);
};

// Refund payment
export const refundPayment = async (paymentId: string, amount?: number) => {
  const mollieClient = getMollieServer();
  
  const refundData: any = {};
  if (amount) {
    refundData.amount = {
      currency: 'EUR',
      value: amount.toFixed(2)
    };
  }
  
  return await mollieClient.payments_refunds.create(paymentId, refundData);
};

// Get available payment methods
export const getPaymentMethods = async () => {
  const mollieClient = getMollieServer();
  return await mollieClient.methods.list();
};

// Check if payment is paid
export const isPaymentPaid = (payment: Payment) => {
  return payment.status === 'paid';
};

// Check if payment is pending
export const isPaymentPending = (payment: Payment) => {
  return payment.status === 'pending';
};

// Check if payment is failed
export const isPaymentFailed = (payment: Payment) => {
  return payment.status === 'failed';
};

// Check if payment is expired
export const isPaymentExpired = (payment: Payment) => {
  return payment.status === 'expired';
};

// Get payment status text
export const getPaymentStatusText = (payment: Payment) => {
  if (payment.status === 'paid') return 'Betaald';
  if (payment.status === 'pending') return 'In behandeling';
  if (payment.status === 'failed') return 'Mislukt';
  if (payment.status === 'expired') return 'Verlopen';
  if (payment.status === 'canceled') return 'Geannuleerd';
  return 'Onbekend';
};

// Get payment status color
export const getPaymentStatusColor = (payment: Payment) => {
  if (payment.status === 'paid') return 'green';
  if (payment.status === 'pending') return 'yellow';
  if (payment.status === 'failed') return 'red';
  if (payment.status === 'expired') return 'gray';
  if (payment.status === 'canceled') return 'gray';
  return 'gray';
};

export type { Payment };
