'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaArrowRight, FaUsers, FaDumbbell, FaBrain, FaChartLine, FaCrown, FaStar, FaGift, FaBook, FaTools, FaComments, FaBullseye, FaTrophy, FaBookOpen, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CheckoutSection from '@/components/CheckoutSection';

export default function BasicTierPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedTier, setSelectedTier] = useState('basic');
  
  const scrollToCheckout = () => {
    document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectTier = (tier: string) => {
    setSelectedTier(tier);
  };

  const navigateLeft = () => {
    if (selectedTier === 'basic') {
      setSelectedTier('lifetime');
    } else if (selectedTier === 'premium') {
      setSelectedTier('basic');
    } else if (selectedTier === 'lifetime') {
      setSelectedTier('premium');
    }
  };

  const navigateRight = () => {
    if (selectedTier === 'basic') {
      setSelectedTier('premium');
    } else if (selectedTier === 'premium') {
      setSelectedTier('lifetime');
    } else if (selectedTier === 'lifetime') {
      setSelectedTier('basic');
    }
  };

  const allPackages = {
    basic: {
      id: 'basic',
      name: 'Basic Tier',
      description: 'Toegang tot alle basis content en community features',
      monthlyPrice: 49, // 6 maanden prijs
      yearlyPrice: 44, // 12 maanden prijs (10% korting)
      features: [
        'TTM Academy',
        'Financiële tools & gidsen',
        'TTM Brotherhood',
        'Mind-focus tools & gidsen',
        'Challenges',
        'Boekenkamer',
        'Q&A iedere twee weken'
      ],
      badge: 'Populair'
    },
    premium: {
      id: 'premium',
      name: 'Premium Tier',
      description: 'Alles van Basic + custom plannen',
      monthlyPrice: 79, // 6 maanden prijs
      yearlyPrice: 71, // 12 maanden prijs (10% korting)
      features: [
        'Alles uit Basic',
        'Custom voedingsplannen',
        'Custom trainingsplannen'
      ],
      badge: 'Meest gekozen'
    },
    lifetime: {
      id: 'lifetime',
      name: 'Lifetime Tier',
      description: 'Lifetime toegang tot alle content',
      monthlyPrice: 1995, // Eenmalige betaling
      yearlyPrice: 1995, // Eenmalige betaling
      features: [
        'Alles uit Premium',
        'Levenslang'
      ],
      badge: 'Best Value'
    }
  };

  const packageData = allPackages[selectedTier as keyof typeof allPackages] || allPackages.basic;

  const benefits = [
    {
      icon: FaBook,
      title: 'TTM Academy',
      description: 'Complete trainings voor persoonlijke ontwikkeling met video modules, expert interviews en e-books'
    },
    {
      icon: FaTools,
      title: 'Financiële Tools',
      description: 'Business coaching, investment strategieën en financiële planning tools'
    },
    {
      icon: FaUsers,
      title: 'TTM Brotherhood',
      description: 'Exclusieve community met forum, accountability groups en mentorship programma'
    },
    {
      icon: FaBrain,
      title: 'Mind-Focus Tools',
      description: 'Meditatie oefeningen, goal setting tools en productiviteit systemen'
    },
    {
      icon: FaBullseye,
      title: 'Challenges',
      description: 'Dagelijkse uitdagingen en achievement badges voor motivatie'
    },
    {
      icon: FaBookOpen,
      title: 'Boekenkamer',
      description: 'Toegang tot uitgebreide bibliotheek met e-books en guides'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A1F2E] to-[#0F1419]">
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
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full text-center">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-[#8BAE5A]/20 border border-[#8BAE5A]/30 rounded-full text-[#8BAE5A] text-sm font-medium mb-8">
              <FaStar className="w-4 h-4 mr-2" />
              {packageData.badge || 'Premium'}
            </div>

            {/* Title with Navigation */}
            <div className="flex items-center justify-center space-x-8 mb-6">
              {/* Left Arrow */}
              <button
                onClick={navigateLeft}
                className="group flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full transition-all duration-300"
                title="Vorige tier"
              >
                <FaChevronLeft className="w-5 h-5 text-white group-hover:text-[#8BAE5A] transition-colors" />
              </button>

              {/* Title */}
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white">
                  <span className="block">{packageData.name.toUpperCase()}</span>
                  <span className="block text-[#8BAE5A]">
                    €{packageData.monthlyPrice},-
                  </span>
                </h1>
              </div>

              {/* Right Arrow */}
              <button
                onClick={navigateRight}
                className="group flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full transition-all duration-300"
                title="Volgende tier"
              >
                <FaChevronRight className="w-5 h-5 text-white group-hover:text-[#8BAE5A] transition-colors" />
              </button>
            </div>

            {/* Tier Navigation Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <span className="text-sm text-[#8BAE5A] font-medium">Lifetime</span>
              <div className="flex space-x-2">
                <div className={`w-2 h-2 rounded-full ${selectedTier === 'lifetime' ? 'bg-[#8BAE5A]' : 'bg-[#8BAE5A]/30'}`}></div>
                <div className={`w-2 h-2 rounded-full ${selectedTier === 'basic' ? 'bg-[#8BAE5A]' : 'bg-[#8BAE5A]/30'}`}></div>
                <div className={`w-2 h-2 rounded-full ${selectedTier === 'premium' ? 'bg-[#8BAE5A]' : 'bg-[#8BAE5A]/30'}`}></div>
              </div>
              <span className="text-sm text-[#8BAE5A] font-medium">Premium</span>
            </div>

            {/* Subtitle */}
            <p className="text-xl text-[#D1D5DB] mb-8 max-w-3xl mx-auto">
              {packageData.description}
            </p>

            {/* Select Package Button */}
            <button
              onClick={scrollToCheckout}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-all duration-300"
            >
              Kies {packageData.name}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Toegang tot:
              </h2>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-[#D1D5DB]">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-16">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Wat je krijgt:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {packageData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#B6C948]/10 border border-[#8BAE5A]/20 rounded-2xl p-8 text-center mb-16">
              <h3 className="text-2xl font-bold text-white mb-4">
                {selectedTier === 'lifetime' 
                  ? `€${packageData.monthlyPrice},- eenmalig`
                  : `€${packageData.monthlyPrice},- per maand`
                }
              </h3>
              {selectedTier !== 'lifetime' && (
                <p className="text-[#D1D5DB] mb-4">
                  (minimaal 6 maanden)
                </p>
              )}
              <p className="text-sm text-[#8BAE5A]">
                {packageData.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <CheckoutSection 
        packageId={packageData.id}
        packageName={packageData.name}
        packageDescription={packageData.description}
        monthlyPrice={packageData.monthlyPrice}
        yearlyPrice={packageData.yearlyPrice}
        features={packageData.features}
        onPackageChange={selectTier}
        availablePackages={Object.values(allPackages)}
      />

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 md:px-12 lg:px-20 border-t border-white/10">
        <div className="w-full text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/logo_white-full.svg" 
              alt="Top Tier Men Logo" 
              className="h-8 sm:h-10 w-auto"
            />
          </div>
          <p className="text-[#D1D5DB]">
            © 2025 Top Tier Men. Alle rechten voorbehouden.
          </p>
        </div>
      </footer>
    </div>
  );
}