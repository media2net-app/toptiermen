'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaArrowRight, FaInfinity, FaUsers, FaDumbbell, FaBrain, FaChartLine, FaCrown, FaStar, FaGift } from 'react-icons/fa';

export default function LifetimePakketPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const benefits = [
    {
      icon: FaInfinity,
      title: 'Levenslang Toegang',
      description: 'Eénmalige betaling, levenslang toegang tot alle content en updates'
    },
    {
      icon: FaCrown,
      title: 'VIP Status',
      description: 'Exclusieve VIP status met voorrang bij alle events en coaching'
    },
    {
      icon: FaGift,
      title: 'Alle Bonussen',
      description: 'Toegang tot alle huidige en toekomstige bonus content'
    },
    {
      icon: FaStar,
      title: 'Founder Status',
      description: 'Word een founder van de Brotherhood met speciale privileges'
    },
    {
      icon: FaUsers,
      title: 'Exclusieve Community',
      description: 'Toegang tot de meest exclusieve community voor lifetime leden'
    }
  ];

  const features = [
    'Levenslang toegang tot alle content',
    'Alle toekomstige updates en modules',
    'Exclusieve VIP community access',
    'Voorrang bij alle events en meetups',
    'Directe toegang tot alle experts',
    'Lifetime coaching support',
    'Exclusieve founder events',
    'Alle bonus content (huidig + toekomstig)',
    'Speciale founder badges en status',
    'Lifetime toegang tot alle platforms'
  ];

  const valueComparison = [
    { label: 'Jaarlijks (10 jaar)', amount: '€5.080' },
    { label: 'Maandelijks (10 jaar)', amount: '€5.640' },
    { label: 'Lifetime (10 jaar)', amount: '€1.997' },
    { label: 'Je bespaart (10 jaar)', amount: '€3.643', highlight: true }
  ];

  const testimonials = [
    {
      name: 'Robert M.',
      role: 'Founder',
      text: 'De beste investering die ik ooit heb gedaan. Na 3 jaar heb ik al €1.500 bespaard en krijg nog steeds nieuwe content.',
      savings: '€1.500+'
    },
    {
      name: 'James K.',
      role: 'CEO',
      text: 'Lifetime member sinds dag 1. De exclusieve community en founder status maken het verschil.',
      savings: '€2.000+'
    },
    {
      name: 'Michael P.',
      role: 'Entrepreneur',
      text: 'Eénmalige betaling, levenslang toegang. Geen zorgen meer over maandelijkse kosten.',
      savings: '€1.800+'
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
              <FaInfinity className="mr-2" />
              Eénmalige betaling - Levenslang toegang
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              <span className="text-[#B6C948]">Lifetime</span> Brotherhood<br />
              Founder Status
            </h1>
            
            <p className="text-xl text-[#B6C948] mb-8 max-w-3xl mx-auto">
              De ultieme investering voor serieuze mannen. Eénmalige betaling van €1.997 
              voor levenslang toegang tot alle content, updates en exclusieve founder privileges.
            </p>

            <div className="bg-[#232D1A] rounded-xl p-8 border border-[#B6C948] mb-12 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-black text-[#B6C948] mb-2">€1.997</div>
                  <div className="text-[#8BAE5A]">Eénmalige betaling</div>
                  <div className="text-[#B6C948] text-sm mt-2">Levenslang toegang</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">Bespaar €3.643</div>
                  <div className="text-[#8BAE5A]">in 10 jaar tijd</div>
                  <div className="text-[#B6C948] text-sm mt-2">t.o.v. jaarlijks betalen</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/prelaunch')}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative px-12 py-4 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold text-lg rounded-xl shadow-2xl hover:shadow-[#B6C948]/25 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center">
                Word Lifetime Founder
                <FaArrowRight className={`ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-[#181F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Waarom Lifetime kiezen?
            </h2>
            <p className="text-[#B6C948] text-lg max-w-3xl mx-auto">
              De ultieme investering voor mannen die weten dat persoonlijke ontwikkeling 
              een levenslange reis is. Geen zorgen meer over maandelijkse kosten.
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
              Wat krijg je met Lifetime?
            </h2>
            <p className="text-[#B6C948] text-lg">
              Alles wat er is en alles wat er komt - voor altijd
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

      {/* Value Calculator */}
      <div className="py-20 bg-[#181F17]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Bespaar €3.643 in 10 jaar
            </h2>
            <p className="text-[#B6C948] text-lg">
              Zie de echte waarde van lifetime membership
            </p>
          </div>

          <div className="bg-[#232D1A] rounded-xl p-8 border border-[#B6C948]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Andere opties (10 jaar)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Jaarlijks (10x €508)</span>
                    <span className="text-white font-semibold">€5.080</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Maandelijks (120x €47)</span>
                    <span className="text-white font-semibold">€5.640</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Toekomstige updates</span>
                    <span className="text-[#8BAE5A]">Extra kosten</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Lifetime (10 jaar)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Eénmalige betaling</span>
                    <span className="text-white font-semibold">€1.997</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Toekomstige updates</span>
                    <span className="text-[#B6C948]">✓ Inbegrepen</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">VIP status</span>
                    <span className="text-[#B6C948]">✓ Inbegrepen</span>
                  </div>
                  <div className="border-t border-[#3A4D23] pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-[#B6C948] font-bold">Je bespaart</span>
                      <span className="text-[#B6C948] font-bold text-xl">€3.643</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-[#232D1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Lifetime Founders
            </h2>
            <p className="text-[#B6C948] text-lg">
              Mannen die de ultieme investering maakten
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#B6C948] rounded-full flex items-center justify-center text-[#181F17] font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-[#8BAE5A] text-sm">{testimonial.role}</div>
                    <div className="text-[#B6C948] text-sm">Bespaarde {testimonial.savings}</div>
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
            Klaar om Lifetime Founder te worden?
          </h2>
          <p className="text-[#B6C948] text-lg mb-8">
            Eénmalige investering, levenslang toegang tot alle content en exclusieve privileges
          </p>
          
          <div className="bg-[#232D1A] rounded-xl p-8 border border-[#B6C948] mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-left mb-4 sm:mb-0">
                <div className="text-2xl font-bold text-white">Lifetime Founder</div>
                <div className="text-[#8BAE5A]">€1.997 eenmalig - Levenslang toegang</div>
                <div className="text-[#B6C948] text-sm">Bespaar €3.643 in 10 jaar</div>
              </div>
              <button
                onClick={() => router.push('/prelaunch')}
                className="px-8 py-3 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Word Founder
              </button>
            </div>
          </div>

          <p className="text-[#8BAE5A] text-sm">
            * Eénmalige betaling van €1.997. Levenslang toegang tot alle content en toekomstige updates.
          </p>
        </div>
      </div>
    </div>
  );
}
