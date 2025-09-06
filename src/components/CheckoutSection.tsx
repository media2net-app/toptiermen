'use client';

import { useState } from 'react';
import { FaCheck, FaCreditCard, FaShieldAlt, FaUndo, FaRocket } from 'react-icons/fa';

interface CheckoutSectionProps {
  packageData: {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    badge?: string;
  };
}

export default function CheckoutSection({ packageData }: CheckoutSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  const isLifetime = packageData.id === 'lifetime';
  const yearlyDiscount = Math.round((packageData.monthlyPrice * 12 - packageData.yearlyPrice) / (packageData.monthlyPrice * 12) * 100);
  const currentPrice = billingPeriod === 'yearly' ? packageData.yearlyPrice : packageData.monthlyPrice;
  const originalPrice = billingPeriod === 'yearly' ? packageData.monthlyPrice * 12 : packageData.monthlyPrice;
  const savings = originalPrice - currentPrice;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/payments/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: packageData.id,
          billingPeriod: billingPeriod,
          amount: currentPrice,
          description: `${packageData.name} - ${billingPeriod === 'yearly' ? 'Jaarlijks' : 'Maandelijks'}`
        }),
      });

      const data = await response.json();
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Er is een fout opgetreden bij het verwerken van je betaling. Probeer het opnieuw.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#0F1419] via-[#1A2313] to-[#232D1A]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Klaar om je transformatie te starten?
          </h2>
          <p className="text-xl text-[#8BAE5A] max-w-3xl mx-auto">
            Sluit je aan bij duizenden mannen die al hun leven hebben getransformeerd met Top Tier Men
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Package Details */}
          <div className="space-y-8">
            <div className="bg-[#1A2313] rounded-2xl p-8 border border-[#3A4D23]/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-xl flex items-center justify-center">
                  <FaCreditCard className="w-6 h-6 text-[#181F17]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{packageData.name}</h3>
                  <p className="text-[#8BAE5A]">{packageData.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {packageData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <FaCheck className="w-5 h-5 text-[#8BAE5A] flex-shrink-0" />
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-[#1A2313] rounded-2xl p-8 border border-[#3A4D23]/30">
              <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <FaShieldAlt className="w-6 h-6 text-[#8BAE5A]" />
                Veilig betalen
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaCheck className="w-5 h-5 text-[#8BAE5A] flex-shrink-0" />
                  <span className="text-white">SSL beveiligde betaling</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheck className="w-5 h-5 text-[#8BAE5A] flex-shrink-0" />
                  <span className="text-white">Mollie betalingsbeveiliging</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheck className="w-5 h-5 text-[#8BAE5A] flex-shrink-0" />
                  <span className="text-white">30-dagen geld-terug garantie</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheck className="w-5 h-5 text-[#8BAE5A] flex-shrink-0" />
                  <span className="text-white">Directe activering</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-[#1A2313] rounded-2xl p-8 border border-[#3A4D23]/30 sticky top-8">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Kies je betalingsperiode</h3>

            {!isLifetime && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Monthly Option */}
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    billingPeriod === 'monthly'
                      ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                      : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">€{packageData.monthlyPrice}</div>
                    <div className="text-[#8BAE5A] mb-2">per maand</div>
                    <div className="text-sm text-[#8BAE5A]/70">Minimaal 6 maanden</div>
                  </div>
                </button>

                {/* Yearly Option */}
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`p-6 rounded-xl border-2 transition-all relative ${
                    billingPeriod === 'yearly'
                      ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                      : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                  }`}
                >
                  <div className="absolute -top-2 -right-2 bg-[#8BAE5A] text-[#181F17] text-xs font-bold px-2 py-1 rounded-full">
                    -{yearlyDiscount}%
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">€{packageData.yearlyPrice}</div>
                    <div className="text-[#8BAE5A] mb-2">per jaar</div>
                    <div className="text-sm text-[#8BAE5A]/70">Populair - Bespaar €{savings}</div>
                  </div>
                </button>
              </div>
            )}

            {/* Price Overview */}
            <div className="bg-[#232D1A] rounded-xl p-6 mb-8">
              <h4 className="text-lg font-semibold text-white mb-4">Prijs overzicht</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#8BAE5A]">
                    {packageData.name} - {billingPeriod === 'yearly' ? '1 jaar' : '6 maanden'}
                  </span>
                  <span className="text-white font-semibold">€{currentPrice}</span>
                </div>
                {billingPeriod === 'yearly' && savings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Jaarlijkse korting</span>
                    <span className="text-[#8BAE5A]">-€{savings}</span>
                  </div>
                )}
                <div className="border-t border-[#3A4D23] pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold text-lg">Totaal</span>
                    <span className="text-white font-bold text-xl">€{currentPrice}</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <div className="text-sm text-[#8BAE5A] mt-1">
                      €{packageData.yearlyPrice} per jaar (€{Math.round(packageData.yearlyPrice / 12)} per maand)
                    </div>
                  )}
                  {billingPeriod === 'monthly' && (
                    <div className="text-sm text-[#8BAE5A] mt-1">
                      €{packageData.monthlyPrice} per maand (minimaal 6 maanden)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold py-4 px-8 rounded-xl hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-300 flex items-center justify-center gap-3 text-lg hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#181F17]"></div>
                  Bezig met verwerken...
                </>
              ) : (
                <>
                  <FaRocket className="w-5 h-5" />
                  {isLifetime ? 'Word Lifetime Founder' : 'Start je transformatie'}
                </>
              )}
            </button>

            <p className="text-center text-sm text-[#8BAE5A]/70 mt-4">
              Je wordt doorgestuurd naar een beveiligde betalingspagina
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
