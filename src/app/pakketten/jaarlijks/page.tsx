'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaArrowRight, FaStar, FaUsers, FaDumbbell, FaBrain, FaChartLine, FaGift, FaCrown } from 'react-icons/fa';
import CheckoutModal from '@/components/CheckoutModal';

export default function JaarlijksPakketPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const packageData = {
    id: 'yearly',
    name: 'Jaarlijks Pakket',
    description: '10% korting en exclusieve bonussen voor jaarlijkse leden',
    monthlyPrice: 47,
    yearlyPrice: 508, // 10% korting
    features: [
      'Alles van het maandelijkse pakket',
      '10% korting op totaalbedrag',
      'Exclusieve bonus masterclasses',
      'VIP community events',
      'Priority coaching calls',
      'Jaarlijkse progressie planning',
      'Exclusieve content modules',
      'Directe toegang tot experts',
      'Jaarlijkse Brotherhood retreat',
      'Lifetime toegang tot bonus content'
    ],
    badge: 'Populair'
  };

  const benefits = [
    {
      icon: FaStar,
      title: '10% Korting',
      description: 'Bespaar €56 per jaar ten opzichte van maandelijks betalen'
    },
    {
      icon: FaGift,
      title: 'Exclusieve Bonussen',
      description: 'Extra content en masterclasses alleen voor jaarlijkse leden'
    },
    {
      icon: FaUsers,
      title: 'VIP Community Access',
      description: 'Toegang tot exclusieve jaarlijkse events en meetups'
    },
    {
      icon: FaCrown,
      title: 'Priority Support',
      description: 'Voorrang bij coaching calls en persoonlijke begeleiding'
    },
    {
      icon: FaChartLine,
      title: 'Jaarlijkse Planning',
      description: 'Complete jaarplanning voor optimale resultaten'
    }
  ];

  const features = [
    'Alles van het maandelijkse pakket',
    '10% korting op totaalbedrag',
    'Exclusieve bonus masterclasses',
    'VIP community events',
    'Priority coaching calls',
    'Jaarlijkse progressie planning',
    'Exclusieve content modules',
    'Directe toegang tot experts',
    'Jaarlijkse Brotherhood retreat',
    'Lifetime toegang tot bonus content'
  ];

  const savings = [
    { label: 'Maandelijks (12x €47)', amount: '€564' },
    { label: 'Jaarlijks met korting', amount: '€508' },
    { label: 'Je bespaart', amount: '€56', highlight: true }
  ];

  const testimonials = [
    {
      name: 'Alex R.',
      role: 'CEO',
      text: 'De jaarlijkse investering was de beste beslissing. De bonus content en events maken het verschil.',
      savings: '€56'
    },
    {
      name: 'Mike T.',
      role: 'Consultant',
      text: 'Na een jaar ben ik een compleet andere man. De 10% korting was een mooie bonus.',
      savings: '€56'
    },
    {
      name: 'Chris L.',
      role: 'Entrepreneur',
      text: 'De jaarlijkse planning en VIP events zijn onbetaalbaar. Zeker de investering waard.',
      savings: '€56'
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
              <FaStar className="mr-2" />
              Meest gekozen - 10% korting
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Jaarlijks pakket met <span className="text-[#B6C948]">10% korting</span><br />
              + exclusieve bonussen
            </h1>
            
            <p className="text-xl text-[#B6C948] mb-8 max-w-3xl mx-auto">
              De slimste keuze voor serieuze mannen. Bespaar €56 per jaar en krijg toegang tot 
              exclusieve content en events die alleen voor jaarlijkse leden beschikbaar zijn.
            </p>

            <div className="bg-[#232D1A] rounded-xl p-8 border border-[#B6C948] mb-12 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {savings.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-2xl font-bold ${item.highlight ? 'text-[#B6C948]' : 'text-white'}`}>
                      {item.amount}
                    </div>
                    <div className="text-[#8BAE5A] text-sm">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative px-12 py-4 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold text-lg rounded-xl shadow-2xl hover:shadow-[#B6C948]/25 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center">
                Start met jaarlijks pakket
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
              Waarom jaarlijks kiezen?
            </h2>
            <p className="text-[#B6C948] text-lg max-w-3xl mx-auto">
              Meer dan alleen korting. Jaarlijkse leden krijgen exclusieve toegang tot content, 
              events en support die het verschil maken.
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
              Wat krijg je met jaarlijks?
            </h2>
            <p className="text-[#B6C948] text-lg">
              Alles van maandelijks + exclusieve bonussen
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

      {/* Savings Calculator */}
      <div className="py-20 bg-[#181F17]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Bespaar €56 per jaar
            </h2>
            <p className="text-[#B6C948] text-lg">
              Zie precies hoeveel je bespaart
            </p>
          </div>

          <div className="bg-[#232D1A] rounded-xl p-8 border border-[#B6C948]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Maandelijks betalen</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">12 × €47</span>
                    <span className="text-white font-semibold">€564</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Bonus content</span>
                    <span className="text-[#8BAE5A]">Nee</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">VIP events</span>
                    <span className="text-[#8BAE5A]">Nee</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Jaarlijks betalen</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Jaarlijks tarief</span>
                    <span className="text-white font-semibold">€508</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Bonus content</span>
                    <span className="text-[#B6C948]">✓ Inbegrepen</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">VIP events</span>
                    <span className="text-[#B6C948]">✓ Inbegrepen</span>
                  </div>
                  <div className="border-t border-[#3A4D23] pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-[#B6C948] font-bold">Je bespaart</span>
                      <span className="text-[#B6C948] font-bold text-xl">€56</span>
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
              Mannen die jaarlijks kozen
            </h2>
            <p className="text-[#B6C948] text-lg">
              Lees hun ervaringen en zie waarom jaarlijks de beste keuze is
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
            Klaar om €56 te besparen?
          </h2>
          <p className="text-[#B6C948] text-lg mb-8">
            Start vandaag nog met het jaarlijkse pakket en krijg toegang tot exclusieve content
          </p>
          
          <div className="bg-[#232D1A] rounded-xl p-8 border border-[#B6C948] mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-left mb-4 sm:mb-0">
                <div className="text-2xl font-bold text-white">Jaarlijks pakket</div>
                <div className="text-[#8BAE5A]">€508 per jaar (€42 per maand) - Bespaar €56</div>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="px-8 py-3 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Start nu
              </button>
            </div>
          </div>

          <p className="text-[#8BAE5A] text-sm">
            * Jaarlijks pakket met 10% korting. Na 12 maanden automatisch verlengd tenzij opgezegd.
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        package={packageData}
        onPaymentSuccess={(paymentData) => {
          console.log('Payment successful:', paymentData);
          setShowCheckout(false);
        }}
      />
    </div>
  );
}
