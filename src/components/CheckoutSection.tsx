'use client';

import { useState } from 'react';
import { FaCheck, FaCreditCard, FaShieldAlt, FaUndo, FaRocket } from 'react-icons/fa';

interface CheckoutSectionProps {
  packageId: string;
  packageName: string;
  packageDescription: string;
  monthlyPrice: number;
  yearlyPrice: number;
  originalMonthlyPrice?: number;
  originalYearlyPrice?: number;
  features?: string[];
  selectedPeriod?: '6months' | '12months';
  selectedPayment?: 'monthly' | 'yearly';
  onPackageChange?: (packageId: string) => void;
  availablePackages?: Array<{
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
  }>;
}

export default function CheckoutSection({ 
  packageId, 
  packageName, 
  packageDescription, 
  monthlyPrice, 
  yearlyPrice, 
  originalMonthlyPrice,
  originalYearlyPrice,
  features = [],
  selectedPeriod = '12months',
  selectedPayment = 'monthly',
  onPackageChange,
  availablePackages = []
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
  const finalPrice = currentPrice; // Mollie prijzen zijn al de juiste prelaunch prijzen

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
      console.log('💳 Creating prelaunch Mollie payment...');
      
      const response = await fetch('/api/payments/create-payment-prelaunch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: packageId,
          billingPeriod: billingPeriod,
          paymentFrequency: paymentFrequency,
          customerName: formData.name,
          customerEmail: formData.email
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Payment creation failed');
      }
      
      if (data.checkoutUrl) {
        console.log('✅ Prelaunch Mollie payment created:', data.checkoutUrl);
        console.log('💰 Package info:', data.packageInfo);
        console.log('🔄 Redirecting to Mollie checkout...');
        
        // Redirect to Mollie checkout
        window.location.href = data.checkoutUrl;
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

            {/* Gekozen Pakket Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Gekozen pakket</h3>
              <div className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]/30">
                <div className="flex items-center justify-between">
                  {/* Left Arrow */}
                  <button
                    onClick={() => {
                      if (availablePackages.length > 0 && onPackageChange) {
                        const currentIndex = availablePackages.findIndex(pkg => pkg.id === packageId);
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : availablePackages.length - 1;
                        onPackageChange(availablePackages[prevIndex].id);
                      }
                    }}
                    className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full transition-all duration-300 touch-manipulation flex-shrink-0"
                    title="Vorige pakket"
                  >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-[#8BAE5A] transition-colors" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path>
                    </svg>
                  </button>

                  {/* Package Info */}
                  <div className="text-center flex-1 mx-3 sm:mx-6 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-2 truncate">{packageName}</h4>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm mb-3 line-clamp-2">{packageDescription}</p>
                    <div className="flex items-center justify-center space-x-4">
                      <span className="text-xs sm:text-sm text-[#8BAE5A] font-medium">
                        {availablePackages.length > 0 && availablePackages.findIndex(pkg => pkg.id === packageId) + 1} van {availablePackages.length}
                      </span>
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={() => {
                      if (availablePackages.length > 0 && onPackageChange) {
                        const currentIndex = availablePackages.findIndex(pkg => pkg.id === packageId);
                        const nextIndex = currentIndex < availablePackages.length - 1 ? currentIndex + 1 : 0;
                        onPackageChange(availablePackages[nextIndex].id);
                      }
                    }}
                    className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full transition-all duration-300 touch-manipulation flex-shrink-0"
                    title="Volgende pakket"
                  >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-[#8BAE5A] transition-colors" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-8 text-center">Kies je betalingsperiode</h3>

            {!isLifetime && (
              <div className="space-y-6">
                {/* Period Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 6 Months Option */}
                  <button
                    onClick={() => setBillingPeriod('6months')}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all touch-manipulation ${
                      billingPeriod === '6months'
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-white mb-2">€{originalMonthlyPrice || monthlyPrice}</div>
                      <div className="text-[#8BAE5A] mb-2 text-sm sm:text-base">6 maanden</div>
                      <div className="text-xs sm:text-sm text-[#8BAE5A]/70">€{(originalMonthlyPrice || monthlyPrice) * 6} totaal</div>
                    </div>
                  </button>

                  {/* 12 Months Option */}
                  <button
                    onClick={() => {
                      setBillingPeriod('12months');
                      setPaymentFrequency('once'); // Auto-select "In één keer" for yearly
                    }}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all relative touch-manipulation ${
                      billingPeriod === '12months'
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="absolute -top-2 -right-2 bg-[#8BAE5A] text-[#181F17] text-xs font-bold px-2 py-1 rounded-full">
                      -10%
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-white mb-2">€{originalYearlyPrice || yearlyPrice}</div>
                      <div className="text-[#8BAE5A] mb-2 text-sm sm:text-base">12 maanden</div>
                      <div className="text-xs sm:text-sm text-[#8BAE5A]/70">Populair - €{(originalYearlyPrice || yearlyPrice) * 12} totaal</div>
                    </div>
                  </button>
                </div>

                {/* Payment Frequency Selection */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white text-center">Kies je betalingswijze</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Monthly Payment - Only available for 6 months */}
                    <button
                      onClick={() => setPaymentFrequency('monthly')}
                      disabled={billingPeriod === '12months'}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all touch-manipulation ${
                        paymentFrequency === 'monthly' && billingPeriod !== '12months'
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                          : billingPeriod === '12months'
                          ? 'border-[#3A4D23]/30 bg-[#3A4D23]/10 opacity-50 cursor-not-allowed'
                          : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-white mb-1">Maandelijks</div>
                        <div className="text-xs sm:text-sm text-[#8BAE5A]">
                          {billingPeriod === '12months' ? 'Niet beschikbaar' : `€${pricing.monthlyPrice} per maand`}
                        </div>
                      </div>
                    </button>

                    {/* One-time Payment */}
                    <button
                      onClick={() => setPaymentFrequency('once')}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all touch-manipulation ${
                        paymentFrequency === 'once'
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                          : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-white mb-1">In één keer</div>
                        <div className="text-xs sm:text-sm text-[#8BAE5A]">€{pricing.monthlyPrice * (billingPeriod === '6months' ? 6 : 12)} totaal</div>
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
                  <div className="flex items-center space-x-2">
                    {originalMonthlyPrice && (
                      <span className="text-gray-400 line-through text-sm">€{originalMonthlyPrice}</span>
                    )}
                    <span className="text-white font-semibold">€{pricing.periodPrice}</span>
                  </div>
                </div>
                {originalMonthlyPrice && (
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Normale prijs ({pricing.period})</span>
                    <span className="text-gray-400 line-through">€{originalMonthlyPrice * (billingPeriod === '6months' ? 6 : 12)}</span>
                  </div>
                )}
                {originalMonthlyPrice && (
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Prelaunch prijs ({pricing.period})</span>
                    <span className="text-white font-semibold">€{pricing.periodPrice * (billingPeriod === '6months' ? 6 : 12)}</span>
                  </div>
                )}
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
                    <span className="text-orange-400 font-bold text-xl">-€{originalMonthlyPrice ? Math.round((originalMonthlyPrice * (billingPeriod === '6months' ? 6 : 12)) - (pricing.periodPrice * (billingPeriod === '6months' ? 6 : 12))) : Math.round(currentPrice)}</span>
                  </div>
                  <div className="relative mt-2">
                    <span className="text-orange-300 text-sm">⚡ Exclusieve prelaunch korting - beperkte tijd!</span>
                  </div>
                </div>
                <div className="border-t border-[#3A4D23] pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold text-lg">Totaal</span>
                    <span className="text-white font-bold text-xl">€{pricing.periodPrice * (billingPeriod === '6months' ? 6 : 12)}</span>
                  </div>
                  <div className="text-sm text-[#8BAE5A]/70 mt-2">
                    Prelaunch prijs (50% korting al toegepast)
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
