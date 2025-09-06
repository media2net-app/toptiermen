'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaArrowRight, FaClock, FaUsers, FaDumbbell, FaBrain, FaChartLine } from 'react-icons/fa';
import CheckoutSection from '@/components/CheckoutSection';

export default function MaandelijksPakketPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const scrollToCheckout = () => {
    document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const packageData = {
    id: 'monthly',
    name: 'Maandelijks Pakket',
    description: 'Minimaal 6 maanden commitment voor echte transformatie',
    monthlyPrice: 47,
    yearlyPrice: 508, // 10% korting
    features: [
      'Toegang tot alle content modules',
      'Live training sessies',
      'Exclusieve Brotherhood community',
      'Persoonlijke coaching calls',
      'Voedingsplannen op maat',
      'Mindset & discipline training',
      'Financiële educatie',
      'Business & carrière coaching',
      '24/7 community support',
      'Maandelijkse progressie reviews'
    ],
    badge: 'Populair'
  };

  const benefits = [
    {
      icon: FaClock,
      title: '6 Maanden Commitment',
      description: 'Minimaal 6 maanden vereist om tot een Top Tier Men te groeien'
    },
    {
      icon: FaUsers,
      title: 'Exclusieve Community',
      description: 'Connect met gelijkgestemde mannen die ook naar het volgende level willen'
    },
    {
      icon: FaDumbbell,
      title: 'Complete Workout Programma',
      description: 'Van beginner tot gevorderde - alle niveaus gedekt'
    },
    {
      icon: FaBrain,
      title: 'Mentale Training',
      description: 'Mindset, discipline en focus training voor echte resultaten'
    },
    {
      icon: FaChartLine,
      title: 'Persoonlijke Groei',
      description: 'Track je progressie en zie je transformatie in real-time'
    }
  ];

  const features = [
    'Toegang tot alle content modules',
    'Live training sessies',
    'Exclusieve Brotherhood community',
    'Persoonlijke coaching calls',
    'Voedingsplannen op maat',
    'Mindset & discipline training',
    'Financiële educatie',
    'Business & carrière coaching',
    '24/7 community support',
    'Maandelijkse progressie reviews'
  ];

  const testimonials = [
    {
      name: 'Mark V.',
      role: 'Ondernemer',
      text: 'Na 6 maanden ben ik een compleet andere man. De discipline die ik hier heb geleerd heeft mijn business naar het volgende level gebracht.',
      months: 8
    },
    {
      name: 'Thomas K.',
      role: 'Manager',
      text: 'De 6-maanden commitment was precies wat ik nodig had. Nu kan ik niet meer zonder deze routine.',
      months: 12
    },
    {
      name: 'David L.',
      role: 'Personal Trainer',
      text: 'Zelfs als trainer heb ik hier zoveel geleerd. De community en support zijn onbetaalbaar.',
      months: 6
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181F17] via-[#232D1A] to-[#181F17]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#B6C948]/20 to-[#8BAE5A]/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#B6C948]/10 border border-[#B6C948]/30 text-[#B6C948] text-sm font-medium mb-8">
              <FaClock className="mr-2" />
              Minimaal 6 maanden commitment
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Word een <span className="text-[#B6C948]">Top Tier Man</span><br />
              in 6 maanden
            </h1>
            
            <p className="text-xl text-[#B6C948] mb-8 max-w-3xl mx-auto">
              Echte transformatie kost tijd. Daarom vereisen we een minimum van 6 maanden commitment. 
              Want we weten: de mannen die blijven, worden de mannen die winnen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="text-center">
                <div className="text-4xl font-black text-[#B6C948]">€47</div>
                <div className="text-[#8BAE5A]">per maand</div>
              </div>
              <div className="text-[#8BAE5A] text-2xl">×</div>
              <div className="text-center">
                <div className="text-4xl font-black text-[#B6C948]">6 maanden</div>
                <div className="text-[#8BAE5A]">minimum</div>
              </div>
              <div className="text-[#8BAE5A] text-2xl">=</div>
              <div className="text-center">
                <div className="text-4xl font-black text-[#B6C948]">€282</div>
                <div className="text-[#8BAE5A]">totaal</div>
              </div>
            </div>

            <button
              onClick={scrollToCheckout}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative px-12 py-4 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold text-lg rounded-xl shadow-2xl hover:shadow-[#B6C948]/25 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center">
                Start je 6-maanden reis
                <FaArrowRight className={`ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Why 6 Months Section */}
      <div className="py-20 bg-[#181F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Waarom 6 maanden minimum?
            </h2>
            <p className="text-[#B6C948] text-lg max-w-3xl mx-auto">
              Echte transformatie is geen sprint, het is een marathon. We hebben duizenden mannen gevolgd 
              en één ding is duidelijk: de mannen die minimaal 6 maanden blijven, zien echte resultaten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23] hover:border-[#B6C948] transition-colors duration-300">
                <div className="w-12 h-12 bg-[#B6C948] rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-[#181F17]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-[#8BAE5A]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-[#232D1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Wat krijg je in 6 maanden?
            </h2>
            <p className="text-[#B6C948] text-lg">
              Een complete transformatie van lichaam, geest en leven
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <FaCheck className="w-5 h-5 text-[#B6C948] flex-shrink-0" />
                <span className="text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-[#181F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Mannen die de 6-maanden uitdaging aangingen
            </h2>
            <p className="text-[#B6C948] text-lg">
              Lees hun verhalen en zie wat mogelijk is
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#B6C948] rounded-full flex items-center justify-center text-[#181F17] font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-[#8BAE5A] text-sm">{testimonial.role}</div>
                    <div className="text-[#B6C948] text-sm">{testimonial.months} maanden lid</div>
                  </div>
                </div>
                <p className="text-[#8BAE5A] italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-[#B6C948]/10 to-[#8BAE5A]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Klaar om de 6-maanden uitdaging aan te gaan?
          </h2>
          <p className="text-[#B6C948] text-lg mb-8">
            Word onderdeel van de Brotherhood en transformeer in een Top Tier Man
          </p>
          
          <div className="bg-[#232D1A] rounded-xl p-8 border border-[#B6C948] mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-left mb-4 sm:mb-0">
                <div className="text-2xl font-bold text-white">6-maanden pakket</div>
                <div className="text-[#8BAE5A]">€47 per maand × 6 maanden = €282 totaal</div>
              </div>
              <button
                onClick={scrollToCheckout}
                className="px-8 py-3 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Start nu
              </button>
            </div>
          </div>

          <p className="text-[#8BAE5A] text-sm">
            * 6 maanden minimum commitment vereist. Na 6 maanden kun je maandelijks verlengen.
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      <div id="checkout-section">
        <CheckoutSection packageData={packageData} />
      </div>
    </div>
  );
}
