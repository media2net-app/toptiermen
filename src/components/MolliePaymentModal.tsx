'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { SUBSCRIPTION_PLANS } from '@/lib/mollie';

interface MolliePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
}

export default function MolliePaymentModal({ 
  isOpen, 
  onClose, 
  userId, 
  userEmail 
}: MolliePaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setError('');
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/mollie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-payment',
          data: {
            planId: selectedPlan,
            userId,
            email: userEmail
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setCheckoutUrl(result.checkoutUrl);
        // Redirect to Mollie checkout
        window.location.href = result.checkoutUrl;
      } else {
        setError(result.error || 'Er is iets misgegaan bij het aanmaken van de betaling');
      }
    } catch (error) {
      setError('Er is iets misgegaan bij het verbinden met de betaalprovider');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlanData = SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl mx-4 bg-[#0F1419] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Membership Aanmelden</h2>
                  <p className="text-sm text-gray-400">Kies je abonnement en betaal veilig</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Plan Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Kies je abonnement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => (
                    <div
                      key={planId}
                      onClick={() => handlePlanSelect(planId)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPlan === planId
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div className="text-center">
                        <h4 className="font-semibold text-white mb-2">{plan.name}</h4>
                        <div className="text-2xl font-bold text-[#8BAE5A] mb-2">
                          €{plan.price}
                        </div>
                        <div className="text-sm text-gray-400 mb-3">
                          {plan.interval === 'month' && 'per maand'}
                          {plan.interval === 'year' && 'per jaar'}
                          {plan.interval === 'once' && 'eenmalig'}
                        </div>
                        <p className="text-xs text-gray-300">{plan.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Plan Summary */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{selectedPlanData.name}</h4>
                    <p className="text-sm text-gray-400">{selectedPlanData.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#8BAE5A]">
                      €{selectedPlanData.price}
                    </div>
                    <div className="text-sm text-gray-400">
                      {selectedPlanData.interval === 'month' && 'per maand'}
                      {selectedPlanData.interval === 'year' && 'per jaar'}
                      {selectedPlanData.interval === 'once' && 'eenmalig'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Betaling voorbereiden...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CreditCardIcon className="w-5 h-5 mr-2" />
                    Veilig betalen met Mollie
                  </div>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center text-sm text-gray-400">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                  Je betaling wordt veilig verwerkt door Mollie.
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ondersteunde betaalmethoden: iDEAL, Creditcard, PayPal, SOFORT, Bancontact, Banktransfer
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
