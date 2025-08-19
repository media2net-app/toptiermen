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
  monthly: {
    id: 'monthly',
    name: 'Maandelijkse Membership',
    price: 29.99,
    currency: 'EUR',
    interval: 'month',
    description: 'Volledige toegang tot het Top Tier Men platform'
  },
  yearly: {
    id: 'yearly',
    name: 'Jaarlijkse Membership',
    price: 299.99,
    currency: 'EUR',
    interval: 'year',
    description: 'Volledige toegang tot het Top Tier Men platform (2 maanden gratis)'
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime Membership',
    price: 999.99,
    currency: 'EUR',
    interval: 'once',
    description: 'Lifetime toegang tot het Top Tier Men platform'
  }
};

// Payment methods
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
  
  const payment = await mollieClient.payments.create({
    amount: {
      currency: data.currency,
      value: data.amount.toFixed(2)
    },
    description: data.description,
    redirectUrl: data.redirectUrl,
    webhookUrl: data.webhookUrl,
    metadata: data.metadata,
    methods: PAYMENT_METHODS
  });
  
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
  return payment.isPaid();
};

// Check if payment is pending
export const isPaymentPending = (payment: Payment) => {
  return payment.isPending();
};

// Check if payment is failed
export const isPaymentFailed = (payment: Payment) => {
  return payment.isFailed();
};

// Check if payment is expired
export const isPaymentExpired = (payment: Payment) => {
  return payment.isExpired();
};

// Get payment status text
export const getPaymentStatusText = (payment: Payment) => {
  if (payment.isPaid()) return 'Betaald';
  if (payment.isPending()) return 'In behandeling';
  if (payment.isFailed()) return 'Mislukt';
  if (payment.isExpired()) return 'Verlopen';
  if (payment.isCanceled()) return 'Geannuleerd';
  return 'Onbekend';
};

// Get payment status color
export const getPaymentStatusColor = (payment: Payment) => {
  if (payment.isPaid()) return 'green';
  if (payment.isPending()) return 'yellow';
  if (payment.isFailed()) return 'red';
  if (payment.isExpired()) return 'gray';
  if (payment.isCanceled()) return 'gray';
  return 'gray';
};

export type { Payment };
