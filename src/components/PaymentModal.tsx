'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { SUBSCRIPTION_PLANS, PAYMENT_METHODS } from '@/lib/stripe';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  isOpen: boolean;
  planId: string;
  onSuccess: () => void;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
}

function PaymentForm({ planId, onSuccess, user }: { 
  planId: string; 
  onSuccess: () => void; 
  user: { id: string; email: string; full_name: string; }
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setIsLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setPaymentStatus('failed');
    } else {
      setPaymentStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }

    setIsLoading(false);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Betaling Succesvol!</h3>
        <p className="text-[#B6C948]">Je abonnement is actief. Je wordt doorgestuurd naar je dashboard.</p>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="text-center">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Betaling Mislukt</h3>
        <p className="text-[#B6C948] mb-4">{error}</p>
        <button
          onClick={() => setPaymentStatus('pending')}
          className="px-6 py-2 bg-[#B6C948] text-[#181F17] rounded-lg hover:bg-[#8BAE5A] transition-colors"
        >
          Opnieuw Proberen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
        <h4 className="text-white font-semibold mb-2">Geselecteerd Plan</h4>
        <div className="flex justify-between items-center">
          <span className="text-[#B6C948]">{plan.name}</span>
          <span className="text-white font-bold">€{(plan.price / 100).toFixed(2)}</span>
        </div>
        <p className="text-[#8BAE5A] text-sm mt-1">{plan.description}</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-white font-semibold">Betaalmethode</h4>
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['ideal', 'card', 'sepa_debit'],
          }}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full py-3 px-4 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-semibold rounded-xl hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#181F17] mr-2"></div>
            Verwerken...
          </div>
        ) : (
          `Betaal €${(plan.price / 100).toFixed(2)}`
        )}
      </button>

      <div className="text-center">
        <p className="text-[#8BAE5A] text-xs">
          Je betaling wordt veilig verwerkt door Stripe. 
          <br />
          Je kunt je abonnement op elk moment opzeggen.
        </p>
      </div>
    </form>
  );
}

export default function PaymentModal({ isOpen, planId, onSuccess, onClose, user }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];

  useEffect(() => {
    if (isOpen && planId) {
      createPaymentIntent();
    }
  }, [isOpen, planId]);

  const createPaymentIntent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id,
          email: user.email,
          name: user.full_name,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">Betaling</h2>
          <button
            onClick={onClose}
            className="text-[#B6C948] hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
            <p className="text-[#B6C948]">Betaling voorbereiden...</p>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm 
              planId={planId} 
              onSuccess={onSuccess} 
              user={user}
            />
          </Elements>
        ) : (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-[#B6C948]">Er is een fout opgetreden bij het voorbereiden van de betaling.</p>
            <button
              onClick={createPaymentIntent}
              className="mt-4 px-4 py-2 bg-[#B6C948] text-[#181F17] rounded-lg hover:bg-[#8BAE5A] transition-colors"
            >
              Opnieuw Proberen
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 