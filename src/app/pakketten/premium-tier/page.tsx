'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaArrowRight, FaUsers, FaDumbbell, FaBrain, FaChartLine, FaCrown, FaStar, FaGift, FaBook, FaTools, FaComments, FaTarget, FaTrophy, FaBookOpen, FaUtensils, FaDumbbell as FaDumbbellIcon } from 'react-icons/fa';
import CheckoutSection from '@/components/CheckoutSection';

export default function PremiumTierPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const scrollToCheckout = () => {
    document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const packageData = {
    id: 'premium-tier',
    name: 'Premium Tier',
    description: 'Alles uit Basic + Custom voedingsplannen en trainingsplannen',
    monthlyPrice: 79,
    yearlyPrice: 79, // Same price for premium tier
    features: [
      'Alles uit Basic',
      'Custom voedingsplannen',
      'Custom trainingsplannen'
    ],
    badge: 'Meest Populair'
  };

  const basicFeatures = [
    'TTM Academy',
    'Financiële tools & gidsen',
    'TTM Brotherhood',
    'Mind-focus tools & gidsen',
    'Challenges',
    'Boekenkamer',
    'Q&A iedere twee weken'
  ];

  const premiumFeatures = [
    {
      icon: FaUtensils,
      title: 'Custom Voedingsplannen',
      description: 'Persoonlijke voedingsplannen op maat gemaakt voor jouw doelen, lichaamstype en levensstijl'
    },
    {
      icon: FaDumbbellIcon,
      title: 'Custom Trainingsplannen',
      description: 'Gepersonaliseerde trainingsschema\'s aangepast aan jouw niveau, beschikbare tijd en doelen'
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
              <FaCrown className="w-4 h-4 mr-2" />
              {packageData.badge}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="block">PREMIUM TIER</span>
              <span className="block text-[#8BAE5A]">€{packageData.monthlyPrice},- /maand</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-[#D1D5DB] mb-8 max-w-3xl mx-auto">
              {packageData.description}
            </p>

            {/* CTA Button */}
            <button
              onClick={scrollToCheckout}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Plan gesprek
              <FaArrowRight className="ml-2" />
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

            {/* Basic Features */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">Alles uit Basic Tier:</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {basicFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Features */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">Plus Premium Features:</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                    <p className="text-[#D1D5DB]">{feature.description}</p>
                  </div>
                ))}
              </div>
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
                €{packageData.monthlyPrice},- per maand
              </h3>
              <p className="text-[#D1D5DB] mb-4">
                (minimaal 6 maanden)
              </p>
              <p className="text-sm text-[#8BAE5A]">
                Alles uit Basic + Custom voedingsplannen en trainingsplannen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <CheckoutSection packageData={packageData} />

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