'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { SUBSCRIPTION_PLANS } from '@/lib/mollie';

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

export default function PaymentModal({ isOpen, planId, onSuccess, onClose, user }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];

  const handlePayment = async () => {
    if (!plan) {
      setError('Plan niet gevonden');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/mollie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name,
          amount: plan.price,
          description: `${plan.name} - ${user.full_name}`,
        }),
      });

      const data = await response.json();

      if (data.paymentUrl) {
        // Redirect to Mollie payment page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || 'Geen betalings-URL ontvangen');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Er is een fout opgetreden bij het verwerken van je betaling');
      setPaymentStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Betaling</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Plan Details */}
          {plan && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{plan.description}</span>
                <span className="text-2xl font-bold text-[#8BAE5A]">€{plan.price}</span>
              </div>
            </div>
          )}

          {/* Payment Status */}
          {paymentStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-800">Betaling succesvol!</h4>
                  <p className="text-green-600 text-sm">Je account is geactiveerd</p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                <div>
                  <h4 className="font-semibold text-red-800">Betaling mislukt</h4>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && paymentStatus !== 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Payment Methods Info */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Beschikbare betaalmethoden:</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BanknotesIcon className="w-4 h-4" />
                <span>iDEAL</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CreditCardIcon className="w-4 h-4" />
                <span>Creditcard</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BanknotesIcon className="w-4 h-4" />
                <span>PayPal</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BanknotesIcon className="w-4 h-4" />
                <span>Bancontact</span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isLoading || paymentStatus === 'success'}
            className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white font-semibold py-3 px-6 rounded-xl hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Bezig met verwerken...</span>
              </>
            ) : paymentStatus === 'success' ? (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span>Betaling voltooid</span>
              </>
            ) : (
              <>
                <CreditCardIcon className="w-5 h-5" />
                <span>Betalen met Mollie</span>
              </>
            )}
          </button>

          {/* Security Notice */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Je wordt doorgestuurd naar een beveiligde betalingspagina van Mollie
          </p>
        </div>
      </div>
    </div>
  );
}