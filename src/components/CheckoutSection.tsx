'use client';

import { useState } from 'react';
import { FaCheck, FaCreditCard, FaShieldAlt, FaUndo, FaRocket } from 'react-icons/fa';

interface CheckoutSectionProps {
  packageId: string;
  packageName: string;
  packageDescription: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features?: string[];
  selectedPeriod?: '6months' | '12months';
  selectedPayment?: 'monthly' | 'yearly';
}

export default function CheckoutSection({ 
  packageId, 
  packageName, 
  packageDescription, 
  monthlyPrice, 
  yearlyPrice, 
  features = [],
  selectedPeriod = '12months',
  selectedPayment = 'monthly'
}: CheckoutSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<'6months' | '12months'>(selectedPeriod);
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'once'>(selectedPayment === 'yearly' ? 'once' : 'monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const isLifetime = packageId === 'lifetime';
  
  // Calculate pricing based on new structure
  const getPricing = () => {
    if (isLifetime) {
      return {
        periodPrice: monthlyPrice,
        totalPrice: monthlyPrice,
        monthlyPrice: monthlyPrice,
        period: 'Levenslang',
        discount: 0
      };
    }
    
    if (billingPeriod === '6months') {
      return {
        periodPrice: monthlyPrice, // €49
        totalPrice: monthlyPrice * 6, // €294
        monthlyPrice: monthlyPrice, // €49
        period: '6 maanden',
        discount: 0
      };
    } else { // 12months
      return {
        periodPrice: yearlyPrice, // €44
        totalPrice: yearlyPrice * 12, // €528
        monthlyPrice: yearlyPrice, // €44
        period: '12 maanden',
        discount: 10
      };
    }
  };

  const pricing = getPricing();
  const currentPrice = paymentFrequency === 'once' ? pricing.totalPrice : pricing.monthlyPrice;
  const finalPrice = Math.round(currentPrice * 0.5); // 50% prelaunch korting

  const handlePayment = async () => {
    // Validate form data
    if (!formData.name.trim()) {
      alert('Vul je volledige naam in');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('Vul je e-mailadres in');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Vul een geldig e-mailadres in');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('💳 Creating real Mollie payment...');
      
      const response = await fetch('/api/payments/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: packageId,
          billingPeriod: billingPeriod,
          paymentFrequency: paymentFrequency,
          amount: finalPrice,
          description: `${packageName} - ${pricing.period} - ${paymentFrequency === 'once' ? 'Eenmalig' : 'Maandelijks'} - 50% Prelaunch Korting`,
          customerName: formData.name,
          customerEmail: formData.email
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Payment creation failed');
      }
      
      if (data.checkoutUrl || data.paymentUrl) {
        const paymentUrl = data.checkoutUrl || data.paymentUrl;
        console.log('✅ Real Mollie payment created:', paymentUrl);
        console.log('🔄 Redirecting to Mollie checkout...');
        
        // Always redirect to real Mollie checkout
        window.location.href = paymentUrl;
      } else {
        throw new Error('No payment URL received from Mollie');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Er is een fout opgetreden bij het verwerken van je betaling:\n\n${error.message}\n\nControleer of de Mollie API key is geconfigureerd.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="checkout-section" className="py-20 bg-gradient-to-br from-[#0F1419] via-[#1A2313] to-[#232D1A]">
      <div className="max-w-7xl mx-auto px-6">
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
                  <h3 className="text-2xl font-bold text-white">{packageName}</h3>
                  <p className="text-[#8BAE5A]">{packageDescription}</p>
                </div>
              </div>

              <div className="space-y-4">
                {features.map((feature, index) => (
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
            {/* Prelaunch Banner */}
            <div className="relative bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg p-4 mb-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-500/20 animate-pulse"></div>
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-orange-400/10 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-orange-500/10 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              <div className="relative text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-2xl">🔥</span>
                  <span className="text-white font-bold text-xl">PRELAUNCH ACTIE</span>
                  <span className="text-2xl">⚡</span>
                </div>
                <p className="text-orange-100 text-lg font-semibold">50% PRELAUNCH KORTING - Beperkte tijd!</p>
                <p className="text-orange-200 text-sm mt-1">Exclusieve prelaunch aanbieding</p>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Vul je gegevens in</h3>

            {/* Name and Email Form */}
            <div className="space-y-6 mb-8">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Volledige naam
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white placeholder-[#8BAE5A]/50 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
                  placeholder="Je volledige naam"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  E-mailadres
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white placeholder-[#8BAE5A]/50 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
                  placeholder="je@email.com"
                  required
                />
                <p className="text-sm text-[#8BAE5A]/70 mt-2">
                  Dit is het email waar je je login gegevens voor het platform op ontvangt
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-8 text-center">Kies je betalingsperiode</h3>

            {!isLifetime && (
              <div className="space-y-6">
                {/* Period Selection */}
                <div className="grid grid-cols-2 gap-4">
                  {/* 6 Months Option */}
                  <button
                    onClick={() => setBillingPeriod('6months')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      billingPeriod === '6months'
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">€{monthlyPrice}</div>
                      <div className="text-[#8BAE5A] mb-2">6 maanden</div>
                      <div className="text-sm text-[#8BAE5A]/70">€{monthlyPrice * 6} totaal</div>
                    </div>
                  </button>

                  {/* 12 Months Option */}
                  <button
                    onClick={() => setBillingPeriod('12months')}
                    className={`p-6 rounded-xl border-2 transition-all relative ${
                      billingPeriod === '12months'
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="absolute -top-2 -right-2 bg-[#8BAE5A] text-[#181F17] text-xs font-bold px-2 py-1 rounded-full">
                      -10%
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">€{yearlyPrice}</div>
                      <div className="text-[#8BAE5A] mb-2">12 maanden</div>
                      <div className="text-sm text-[#8BAE5A]/70">Populair - €{yearlyPrice * 12} totaal</div>
                    </div>
                  </button>
                </div>

                {/* Payment Frequency Selection */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white text-center">Kies je betalingswijze</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Monthly Payment */}
                    <button
                      onClick={() => setPaymentFrequency('monthly')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentFrequency === 'monthly'
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                          : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-white mb-1">Maandelijks</div>
                        <div className="text-sm text-[#8BAE5A]">€{pricing.monthlyPrice} per maand</div>
                      </div>
                    </button>

                    {/* One-time Payment */}
                    <button
                      onClick={() => setPaymentFrequency('once')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentFrequency === 'once'
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                          : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-white mb-1">In één keer</div>
                        <div className="text-sm text-[#8BAE5A]">€{pricing.totalPrice} totaal</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Price Overview */}
            <div className="bg-[#232D1A] rounded-xl p-6 mb-8">
              <h4 className="text-lg font-semibold text-white mb-4">Prijs overzicht</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#8BAE5A]">
                    {packageName} - {pricing.period}
                  </span>
                  <span className="text-white font-semibold">€{pricing.periodPrice}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Korting ({pricing.discount}%)</span>
                    <span className="text-[#8BAE5A]">-€{Math.round((monthlyPrice - yearlyPrice) * 12)}</span>
                  </div>
                )}
                <div className="relative bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/50 rounded-lg p-4 mb-4 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg animate-ping"></div>
                  <div className="relative flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-orange-400 font-bold text-lg">🔥 50% PRELAUNCH KORTING</span>
                    </div>
                    <span className="text-orange-400 font-bold text-xl">-€{Math.round(currentPrice * 0.5)}</span>
                  </div>
                  <div className="relative mt-2">
                    <span className="text-orange-300 text-sm">⚡ Exclusieve prelaunch korting - beperkte tijd!</span>
                  </div>
                </div>
                <div className="border-t border-[#3A4D23] pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold text-lg">Totaal</span>
                    <span className="text-white font-bold text-xl">€{Math.round(currentPrice * 0.5)}</span>
                  </div>
                  <div className="text-sm text-[#8BAE5A]/70 mt-2">
                    50% prelaunch korting toegepast
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || !formData.name.trim() || !formData.email.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-8 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-3 text-lg hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-500/20 animate-pulse"></div>
              <div className="relative flex items-center justify-center gap-3">
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Bezig met verwerken...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🔥</span>
                    {isLifetime ? 'Word Lifetime Founder' : 'Start je transformatie - 50% korting!'}
                  </>
                )}
              </div>
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
