'use client';
import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon,
  CreditCardIcon,
  CalendarIcon,
  TagIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Package {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  badge?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
  onPaymentSuccess?: (paymentData: any) => void;
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  package: selectedPackage,
  onPaymentSuccess 
}: CheckoutModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'overview' | 'payment'>('overview');

  // Calculate pricing
  const monthlyPrice = selectedPackage.monthlyPrice;
  const yearlyPrice = selectedPackage.yearlyPrice;
  const isLifetime = selectedPackage.id === 'lifetime';
  
  const yearlyDiscount = isLifetime ? 0 : Math.round((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100);
  
  const currentPrice = isLifetime ? monthlyPrice : (billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice);
  const originalPrice = isLifetime ? monthlyPrice : (billingPeriod === 'monthly' ? monthlyPrice * 6 : monthlyPrice * 12);
  const savings = originalPrice - currentPrice;

  const handlePayment = async () => {
    setIsProcessing(true);
    setStep('payment');
    
    try {
      // Create payment intent with Mollie
      const response = await fetch('/api/payments/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          billingPeriod,
          amount: currentPrice,
          description: `${selectedPackage.name} - ${billingPeriod === 'monthly' ? '6 maanden' : '1 jaar'}`
        }),
      });

      const paymentData = await response.json();
      
      if (paymentData.checkoutUrl) {
        // Redirect to Mollie checkout
        window.location.href = paymentData.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Er is een fout opgetreden bij het verwerken van de betaling. Probeer het opnieuw.');
      setIsProcessing(false);
      setStep('overview');
    }
  };

  const handleBackToOverview = () => {
    setStep('overview');
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#232D1A] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-xl flex items-center justify-center">
              <CreditCardIcon className="w-6 h-6 text-[#181F17]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Checkout</h2>
              <p className="text-[#8BAE5A] mt-1">{selectedPackage.name} Pakket</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#3A4D23] rounded-lg flex items-center justify-center hover:bg-[#4A5D33] transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-[#8BAE5A]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 'overview' && (
            <div className="space-y-6">
              {/* Package Overview */}
              <div className="bg-[#1A2313] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{selectedPackage.name}</h3>
                  {selectedPackage.badge && (
                    <span className="bg-[#8BAE5A] text-[#181F17] px-3 py-1 rounded-full text-sm font-medium">
                      {selectedPackage.badge}
                    </span>
                  )}
                </div>
                <p className="text-[#8BAE5A] mb-4">{selectedPackage.description}</p>
                
                {/* Features */}
                <div className="space-y-2">
                  {selectedPackage.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-[#8BAE5A]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Period Selection */}
              {!isLifetime && (
                <div className="bg-[#1A2313] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Kies je betalingsperiode</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Monthly Option */}
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      billingPeriod === 'monthly'
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">€{monthlyPrice}</div>
                      <div className="text-[#8BAE5A] text-sm">per maand</div>
                      <div className="text-gray-400 text-xs mt-1">Minimaal 6 maanden</div>
                    </div>
                  </button>

                  {/* Yearly Option */}
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`p-4 rounded-lg border-2 transition-all relative ${
                      billingPeriod === 'yearly'
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="absolute -top-2 -right-2 bg-[#B6C948] text-[#181F17] px-2 py-1 rounded-full text-xs font-bold">
                      -{yearlyDiscount}%
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">€{yearlyPrice}</div>
                      <div className="text-[#8BAE5A] text-sm">per jaar</div>
                      <div className="text-green-400 text-xs mt-1">Populair - Bespaar €{savings}</div>
                    </div>
                  </button>
                </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-[#1A2313] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Prijs overzicht</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8BAE5A]">
                      {selectedPackage.name} - {isLifetime ? 'Levenslang' : (billingPeriod === 'monthly' ? '6 maanden' : '1 jaar')}
                    </span>
                    <span className="text-white font-medium">
                      €{currentPrice}
                    </span>
                  </div>
                  
                  {!isLifetime && billingPeriod === 'yearly' && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-400">Jaarlijkse korting</span>
                      <span className="text-green-400 font-medium">-€{savings}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-[#3A4D23] pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Totaal</span>
                      <span className="text-[#B6C948] text-xl font-bold">
                        €{currentPrice}
                      </span>
                    </div>
                    <div className="text-[#8BAE5A] text-sm mt-1">
                      {isLifetime 
                        ? 'Eénmalige betaling - Levenslang toegang'
                        : billingPeriod === 'monthly' 
                          ? `€${monthlyPrice} per maand voor 6 maanden`
                          : `€${yearlyPrice} per jaar (€${Math.round(yearlyPrice / 12)} per maand)`
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Guarantees */}
              <div className="bg-[#1A2313] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Veilig betalen</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#8BAE5A]">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    SSL beveiligde betaling
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    30-dagen geld-terug garantie
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    Mollie betalingsbeveiliging
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    Directe activering
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A]"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Betaling wordt voorbereid...</h3>
              <p className="text-[#8BAE5A] mb-6">
                Je wordt doorgestuurd naar de beveiligde betalingspagina van Mollie.
              </p>
              <button
                onClick={handleBackToOverview}
                className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
              >
                Terug naar overzicht
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'overview' && (
          <div className="p-6 border-t border-[#3A4D23]/40">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors font-medium"
              >
                Annuleren
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] rounded-lg hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
                    Verwerken...
                  </>
                ) : (
                  <>
                    Afrekenen
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
