'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaArrowRight, FaUsers, FaDumbbell, FaBrain, FaChartLine, FaCrown, FaStar, FaGift, FaBook, FaTools, FaComments, FaBullseye, FaTrophy, FaBookOpen } from 'react-icons/fa';
import CheckoutSection from '@/components/CheckoutSection';

export default function BasicTierPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const scrollToCheckout = () => {
    document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const packageData = {
    id: 'basic-tier',
    name: 'Basic Tier',
    description: 'Toegang tot alle basis content en community features',
    monthlyPrice: 49,
    yearlyPrice: 49, // Same price for basic tier
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
  };

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
              {packageData.badge}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="block">BASIC TIER</span>
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
                €{packageData.monthlyPrice},- per maand
              </h3>
              <p className="text-[#D1D5DB] mb-4">
                (minimaal 6 maanden)
              </p>
              <p className="text-sm text-[#8BAE5A]">
                Toegang tot alle basis content en community features
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