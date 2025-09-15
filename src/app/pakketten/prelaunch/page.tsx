'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaArrowRight, FaUsers, FaDumbbell, FaBrain, FaChartLine, FaCrown, FaStar, FaGift, FaBook, FaTools, FaComments, FaBullseye, FaTrophy, FaBookOpen, FaUtensils, FaDumbbell as FaDumbbellIcon, FaInfinity } from 'react-icons/fa';

export default function PrelaunchPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState('basic-tier');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedPayment, setSelectedPayment] = useState('monthly');

  const scrollToCheckout = () => {
    document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const packages = {
    'basic-tier': {
      id: 'basic-tier',
      name: 'Basic Tier',
      description: 'Toegang tot alle basis content en community features',
      monthlyPrice: 49,
      yearlyPrice: 44, // 10% korting
      features: [
        'TTM Academy',
        'Financiële tools & gidsen',
        'TTM Brotherhood',
        'Mind-focus tools & gidsen',
        'Challenges',
        'Boekenkamer',
        'Q&A iedere twee weken'
      ],
      badge: 'Populair',
      color: 'from-blue-500 to-blue-600'
    },
    'premium-tier': {
      id: 'premium-tier',
      name: 'Premium Tier',
      description: 'Alles uit Basic + Custom voedingsplannen en trainingsplannen',
      monthlyPrice: 79,
      yearlyPrice: 79,
      features: [
        'Alles uit Basic',
        'Custom voedingsplannen',
        'Custom trainingsplannen'
      ],
      badge: 'Meest Populair',
      color: 'from-purple-500 to-purple-600'
    },
    'lifetime-tier': {
      id: 'lifetime-tier',
      name: 'Lifetime Tier',
      description: 'Eénmalige betaling, levenslang toegang tot alle content en updates',
      monthlyPrice: 1995,
      yearlyPrice: 1995,
      features: [
        'Alles uit Premium',
        'Levenslang'
      ],
      badge: 'Exclusief',
      color: 'from-yellow-500 to-yellow-600'
    }
  };

  const getCurrentPrice = () => {
    const pkg = packages[selectedPackage as keyof typeof packages];
    if (selectedPackage === 'lifetime-tier') {
      return pkg.monthlyPrice;
    }
    return selectedPeriod === '12months' ? pkg.yearlyPrice : pkg.monthlyPrice;
  };

  const getPackageDescription = () => {
    const pkg = packages[selectedPackage as keyof typeof packages];
    if (selectedPackage === 'lifetime-tier') {
      return 'Levenslang toegang tot alle content';
    }
    if (selectedPeriod === '12months') {
      return '12 maanden toegang';
    }
    return '6 maanden toegang';
  };

  const handlePayment = async () => {
    try {
      console.log('💳 Creating real Mollie payment...');
      
      const response = await fetch('/api/payments/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage,
          billingPeriod: selectedPeriod,
          paymentFrequency: selectedPayment === 'yearly' ? 'once' : 'monthly',
          amount: 1, // Test payment
          description: `${packages[selectedPackage as keyof typeof packages].name} - ${getPackageDescription()} - 50% Prelaunch Korting`
        }),
      });

      const data = await response.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received from Mollie');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Er is een fout opgetreden bij het verwerken van je betaling:\n\n${error.message}\n\nControleer of de Mollie API key is geconfigureerd.`);
    }
  };

  return (
    <div className="prelaunch-page min-h-screen">
      {/* Header */}
      <header className="relative z-10">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-20 py-4 sm:py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo_white-full.svg" 
                alt="Top Tier Men Logo" 
                className="h-8 sm:h-12 md:h-16 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full text-center">
          <div className="max-w-7xl mx-auto">
            {/* Prelaunch Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 border border-orange-400 rounded-full text-white text-lg font-bold mb-8 animate-pulse">
              🔥 50% PRELAUNCH KORTING 🔥
            </div>

            {/* Title */}
            <h1 className="prelaunch-title">
              <span>KIES JE PAKKET</span>
              <span className="block text-[#8BAE5A]">50% KORTING TOT 10 SEPTEMBER</span>
            </h1>

            {/* Subtitle */}
            <p className="prelaunch-subtitle">
              Beperkte tijd: 50% korting op alle pakketten tijdens de prelaunch periode
            </p>
          </div>
        </div>
      </section>

      {/* Package Selection */}
      <section className="py-8 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {Object.entries(packages).map(([key, pkg]) => (
              <div
                key={key}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedPackage === key
                    ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 shadow-2xl shadow-[#8BAE5A]/20'
                    : 'border-[#3A4D23] bg-[#1A2E0F] hover:border-[#8BAE5A]/50'
                }`}
                onClick={() => setSelectedPackage(key)}
              >
                {/* Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${pkg.color}`}>
                    {pkg.badge}
                  </div>
                </div>

                {/* Package Info */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-[#B6C948] text-sm mb-4">{pkg.description}</p>
                  
                  {/* Price Display */}
                  {key === 'lifetime-tier' ? (
                    <div className="text-3xl font-bold text-[#8BAE5A]">
                      €{pkg.monthlyPrice},-
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-[#8BAE5A]">
                        €{selectedPeriod === '12months' ? pkg.yearlyPrice : pkg.monthlyPrice},-
                      </div>
                      {selectedPeriod === '12months' && (
                        <div className="text-sm text-green-400">
                          €{pkg.monthlyPrice} normaal - 10% korting!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-[#B6C948] text-sm">
                      <FaCheck className="w-4 h-4 mr-3 text-[#8BAE5A] flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedPackage === key
                      ? 'bg-[#8BAE5A] text-white'
                      : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-white'
                  }`}
                >
                  {selectedPackage === key ? 'Geselecteerd' : 'Selecteer'}
                </button>
              </div>
            ))}
          </div>

          {/* Period Selection (only for Basic and Premium) */}
          {selectedPackage !== 'lifetime-tier' && (
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-bold text-white text-center mb-6">Kies je periode</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedPeriod('6months')}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedPeriod === '6months'
                      ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 text-white'
                      : 'border-[#3A4D23] bg-[#1A2E0F] text-[#B6C948] hover:border-[#8BAE5A]/50'
                  }`}
                >
                  <div className="font-semibold">6 Maanden</div>
                  <div className="text-sm opacity-75">Minimaal 6 maanden</div>
                </button>
                <button
                  onClick={() => setSelectedPeriod('12months')}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 relative ${
                    selectedPeriod === '12months'
                      ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 text-white'
                      : 'border-[#3A4D23] bg-[#1A2E0F] text-[#B6C948] hover:border-[#8BAE5A]/50'
                  }`}
                >
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    10% korting
                  </div>
                  <div className="font-semibold">12 Maanden</div>
                  <div className="text-sm opacity-75">Populair</div>
                </button>
              </div>
            </div>
          )}

          {/* Payment Selection (only for Basic and Premium) */}
          {selectedPackage !== 'lifetime-tier' && (
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-bold text-white text-center mb-6">Betaalwijze</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedPayment('monthly')}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedPayment === 'monthly'
                      ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 text-white'
                      : 'border-[#3A4D23] bg-[#1A2E0F] text-[#B6C948] hover:border-[#8BAE5A]/50'
                  }`}
                >
                  <div className="font-semibold">Maandelijks</div>
                  <div className="text-sm opacity-75">€{getCurrentPrice()}/maand</div>
                </button>
                <button
                  onClick={() => setSelectedPayment('yearly')}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedPayment === 'yearly'
                      ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 text-white'
                      : 'border-[#3A4D23] bg-[#1A2E0F] text-[#B6C948] hover:border-[#8BAE5A]/50'
                  }`}
                >
                  <div className="font-semibold">Eenmalig</div>
                  <div className="text-sm opacity-75">€{getCurrentPrice() * (selectedPeriod === '12months' ? 12 : 6)} totaal</div>
                </button>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={scrollToCheckout}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Ga naar Checkout - 50% Korting
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section id="checkout-section" className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Klaar om je transformatie te starten?
              </h2>
              <p className="text-lg text-[#D1D5DB] max-w-3xl mx-auto">
                Sluit je aan bij de brotherhood en wordt een Top Tier Men
              </p>
            </div>

            {/* Package Cards Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {Object.entries(packages).map(([key, pkg]) => (
                <div
                  key={key}
                  className={`relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                    selectedPackage === key
                      ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 shadow-2xl shadow-[#8BAE5A]/20'
                      : 'border-white/10'
                  }`}
                  onClick={() => setSelectedPackage(key)}
                >
                  {/* Badge */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${pkg.color}`}>
                      {pkg.badge}
                    </div>
                  </div>

                  {/* Package Info */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-[#B6C948] text-sm mb-4">{pkg.description}</p>
                    
                    {/* Price Display */}
                    {key === 'lifetime-tier' ? (
                      <div className="text-3xl font-bold text-[#8BAE5A]">
                        €{pkg.monthlyPrice},-
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-[#8BAE5A]">
                          €{selectedPeriod === '12months' ? pkg.yearlyPrice : pkg.monthlyPrice},-
                        </div>
                        {selectedPeriod === '12months' && (
                          <div className="text-sm text-green-400">
                            €{pkg.monthlyPrice} normaal - 10% korting!
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-[#B6C948] text-sm">
                        <FaCheck className="w-4 h-4 mr-3 text-[#8BAE5A] flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      selectedPackage === key
                        ? 'bg-[#8BAE5A] text-white'
                        : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-white'
                    }`}
                  >
                    {selectedPackage === key ? 'Geselecteerd' : 'Selecteer'}
                  </button>
                </div>
              ))}
            </div>

            {/* Period Selection (only for Basic and Premium) */}
            {selectedPackage !== 'lifetime-tier' && (
              <div className="max-w-2xl mx-auto mb-8">
                <h3 className="text-xl font-bold text-white text-center mb-6">Kies je periode</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedPeriod('6months')}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedPeriod === '6months'
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 text-white'
                        : 'border-[#3A4D23] bg-[#1A2E0F] text-[#B6C948] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="font-semibold">6 Maanden</div>
                    <div className="text-sm opacity-75">Minimaal 6 maanden</div>
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('12months')}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 relative ${
                      selectedPeriod === '12months'
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 text-white'
                        : 'border-[#3A4D23] bg-[#1A2E0F] text-[#B6C948] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      10% korting
                    </div>
                    <div className="font-semibold">12 Maanden</div>
                    <div className="text-sm opacity-75">Populair</div>
                  </button>
                </div>
              </div>
            )}

            {/* Payment Selection (only for Basic and Premium) */}
            {selectedPackage !== 'lifetime-tier' && (
              <div className="max-w-2xl mx-auto mb-8">
                <h3 className="text-xl font-bold text-white text-center mb-6">Betaalwijze</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedPayment('monthly')}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedPayment === 'monthly'
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 text-white'
                        : 'border-[#3A4D23] bg-[#1A2E0F] text-[#B6C948] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="font-semibold">Maandelijks</div>
                    <div className="text-sm opacity-75">€{getCurrentPrice()}/maand</div>
                  </button>
                  <button
                    onClick={() => setSelectedPayment('yearly')}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedPayment === 'yearly'
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 text-white'
                        : 'border-[#3A4D23] bg-[#1A2E0F] text-[#B6C948] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="font-semibold">Eenmalig</div>
                    <div className="text-sm opacity-75">€{getCurrentPrice() * (selectedPeriod === '12months' ? 12 : 6)} totaal</div>
                  </button>
                </div>
              </div>
            )}

            {/* Price Overview */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Prijs overzicht</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">
                      {packages[selectedPackage as keyof typeof packages].name} - {getPackageDescription()}
                    </span>
                    <span className="text-white font-semibold">€{getCurrentPrice()}</span>
                  </div>
                  
                  {/* 50% Prelaunch Discount */}
                  <div className="relative bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/50 rounded-lg p-4 mb-4 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg animate-ping"></div>
                    <div className="relative flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400 font-bold">🔥 TEST BETALING</span>
                      </div>
                      <span className="text-orange-400 font-bold">-€{getCurrentPrice() - 1}</span>
                    </div>
                    <div className="text-xs text-orange-300 mt-1">
                      ⚡ Test betaling van €1 voor echte Mollie test!
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">Totaal</span>
                    <span className="text-[#8BAE5A]">€1</span>
                  </div>
                  <div className="text-sm text-[#8BAE5A]/70 text-center">
                    Test betaling van €1 voor echte Mollie test
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={handlePayment}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity animate-pulse"
              >
                🔥 Test Betaling €1 - Echte Mollie Test!
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
