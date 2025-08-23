'use client';
import { useState, useEffect } from 'react';
import { 
  CheckIcon, 
  StarIcon, 
  UserGroupIcon, 
  TrophyIcon, 
  FireIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  PlayIcon,
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  HeartIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'academy' | 'community' | 'coaching' | 'tools';
}

interface PricingTier {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  features: string[];
  popular?: boolean;
  cta: string;
  badge?: string;
}

export default function ProductPage() {
  const [activeTab, setActiveTab] = useState('features');
  const [selectedPricing, setSelectedPricing] = useState('monthly');
  const [abTestVariant, setAbTestVariant] = useState<'A' | 'B'>('A');

  // A/B Test variant assignment
  useEffect(() => {
    const variant = Math.random() > 0.5 ? 'A' : 'B';
    setAbTestVariant(variant);
    console.log(`🎯 A/B Test Variant: ${variant}`);
  }, []);

  const features: Feature[] = [
    {
      id: 'academy',
      title: 'Academy Modules',
      description: 'Volledige training modules over discipline, mindset, business en meer',
      icon: BookOpenIcon,
      category: 'academy'
    },
    {
      id: 'brotherhood',
      title: 'Brotherhood Community',
      description: 'Exclusieve community van gelijkgestemde mannen',
      icon: UserGroupIcon,
      category: 'community'
    },
    {
      id: 'coaching',
      title: '1-op-1 Coaching',
      description: 'Persoonlijke coaching sessies met experts',
      icon: UsersIcon,
      category: 'coaching'
    },
    {
      id: 'tracking',
      title: 'Progress Tracking',
      description: 'Geavanceerde tools om je voortgang bij te houden',
      icon: ChartBarIcon,
      category: 'tools'
    },
    {
      id: 'challenges',
      title: 'Daily Challenges',
      description: 'Dagelijkse uitdagingen om je te motiveren',
      icon: FireIcon,
      category: 'academy'
    },
    {
      id: 'nutrition',
      title: 'Voedingsplannen',
      description: 'Persoonlijke voedingsplannen op maat',
      icon: HeartIcon,
      category: 'tools'
    }
  ];

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Mark van der Berg',
      role: 'Ondernemer',
      company: 'TechStart BV',
      content: 'Toptiermen heeft mijn leven compleet veranderd. De discipline die ik heb geleerd heeft me geholpen mijn bedrijf naar het volgende niveau te tillen.',
      rating: 5,
      avatar: '/images/testimonials/mark.jpg'
    },
    {
      id: '2',
      name: 'Thomas Jansen',
      role: 'Fitness Coach',
      company: 'PowerGym',
      content: 'De academy modules zijn van ongelooflijke kwaliteit. Ik gebruik de technieken nu ook in mijn eigen coaching praktijk.',
      rating: 5,
      avatar: '/images/testimonials/thomas.jpg'
    },
    {
      id: '3',
      name: 'Alex de Vries',
      role: 'Software Developer',
      company: 'CodeCraft',
      content: 'De brotherhood community is geweldig. Ik heb connecties gemaakt die me hebben geholpen in mijn carrière.',
      rating: 5,
      avatar: '/images/testimonials/alex.jpg'
    }
  ];

  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: selectedPricing === 'monthly' ? 49 : 490,
      originalPrice: selectedPricing === 'monthly' ? 69 : 690,
      period: selectedPricing === 'monthly' ? 'per maand' : 'per jaar',
      features: [
        'Toegang tot 3 academy modules',
        'Basis community toegang',
        'Progress tracking',
        'Email support',
        'Mobiele app toegang'
      ],
      cta: 'Start Gratis Trial',
      badge: 'Populair'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: selectedPricing === 'monthly' ? 99 : 990,
      originalPrice: selectedPricing === 'monthly' ? 129 : 1290,
      period: selectedPricing === 'monthly' ? 'per maand' : 'per jaar',
      features: [
        'Toegang tot alle academy modules',
        'Volledige brotherhood community',
        '1-op-1 coaching sessies',
        'Persoonlijke voedingsplannen',
        'Priority support',
        'Exclusieve events'
      ],
      popular: true,
      cta: 'Start Gratis Trial'
    },
    {
      id: 'elite',
      name: 'Elite',
      price: selectedPricing === 'monthly' ? 199 : 1990,
      originalPrice: selectedPricing === 'monthly' ? 249 : 2490,
      period: selectedPricing === 'monthly' ? 'per maand' : 'per jaar',
      features: [
        'Alles uit Pro plan',
        'Dagelijkse coaching calls',
        'Persoonlijke mentor',
        'Custom voedingsplannen',
        '24/7 support',
        'Exclusieve masterminds',
        'Lifetime toegang'
      ],
      cta: 'Contact Sales'
    }
  ];

  const handlePricingToggle = () => {
    setSelectedPricing(selectedPricing === 'monthly' ? 'yearly' : 'monthly');
  };

  const handleCTAClick = async (tier: PricingTier) => {
    // Track conversion for A/B testing
    console.log(`🎯 CTA Clicked: ${tier.name} - Variant ${abTestVariant}`);
    
    try {
      // Send A/B test event to API
      await fetch('/api/ab-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variant: abTestVariant,
          event: 'cta_click',
          page: 'product',
          element: tier.name,
          sessionId: Math.random().toString(36).substring(2),
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error tracking A/B test event:', error);
    }
    
    if (tier.id === 'elite') {
      // Redirect to contact form
      window.location.href = '/contact';
    } else {
      // Redirect to registration with plan selection
      window.location.href = `/prelaunch?plan=${tier.id}&period=${selectedPricing}`;
    }
  };

  const handleFeatureClick = async (feature: Feature) => {
    console.log(`🎯 Feature Clicked: ${feature.title} - Variant ${abTestVariant}`);
    
    try {
      // Send A/B test event to API
      await fetch('/api/ab-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variant: abTestVariant,
          event: 'feature_click',
          page: 'product',
          element: feature.title,
          sessionId: Math.random().toString(36).substring(2),
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error tracking A/B test event:', error);
    }
    
    setActiveTab('features');
    // Scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] via-[#1A2F1A] to-[#0A0F0A]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8BAE5A]/20 to-[#B6C948]/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {abTestVariant === 'A' ? (
                <>
                  Word de <span className="text-[#8BAE5A]">Beste Versie</span><br />
                  van Jezelf
                </>
              ) : (
                <>
                  Transformeer je <span className="text-[#8BAE5A]">Leven</span><br />
                  in 90 Dagen
                </>
              )}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {abTestVariant === 'A' 
                ? 'Ontdek het complete platform voor mannen die hun potentieel willen maximaliseren. Academy, community, coaching en tools in één.'
                : 'Het ultieme platform voor mannen die klaar zijn voor verandering. Bewezen methoden, expert coaching en een community van winners.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleCTAClick(pricingTiers[1])} // Pro plan
                className="bg-[#8BAE5A] hover:bg-[#B6C948] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Start Gratis Trial
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className="border-2 border-[#8BAE5A] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <PlayIcon className="w-5 h-5" />
                Bekijk Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#181F17]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#8BAE5A] mb-2">500+</div>
              <div className="text-gray-400">Actieve Leden</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#8BAE5A] mb-2">50+</div>
              <div className="text-gray-400">Academy Modules</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#8BAE5A] mb-2">95%</div>
              <div className="text-gray-400">Succes Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#8BAE5A] mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Alles wat je nodig hebt om te excelleren
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Een complete oplossing die alle aspecten van je ontwikkeling dekt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 hover:border-[#8BAE5A] transition-all duration-300 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#B6C948] transition-colors">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#181F17]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Wat onze leden zeggen
            </h2>
            <p className="text-xl text-gray-300">
              Echte resultaten van echte mannen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-[#8BAE5A]">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#8BAE5A] rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role} bij {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Kies je plan
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start vandaag nog met je transformatie
            </p>
            
            {/* Pricing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-lg ${selectedPricing === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                Maandelijks
              </span>
              <button
                onClick={handlePricingToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  selectedPricing === 'yearly' ? 'bg-[#8BAE5A]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    selectedPricing === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg ${selectedPricing === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
                Jaarlijks
                <span className="ml-2 text-[#8BAE5A] text-sm">(2 maanden gratis)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative bg-[#181F17] border rounded-xl p-8 ${
                  tier.popular 
                    ? 'border-[#8BAE5A] shadow-lg shadow-[#8BAE5A]/20' 
                    : 'border-[#3A4D23]'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#8BAE5A] text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Meest Populair
                    </span>
                  </div>
                )}
                
                {tier.badge && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-[#B6C948] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">€{tier.price}</span>
                    {tier.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">€{tier.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-gray-400">{tier.period}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckIcon className="w-5 h-5 text-[#8BAE5A] flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCTAClick(tier)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    tier.popular
                      ? 'bg-[#8BAE5A] hover:bg-[#B6C948] text-white'
                      : 'border-2 border-[#8BAE5A] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-white'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#8BAE5A]/20 to-[#B6C948]/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start vandaag nog met je 7-dagen gratis trial. Geen verplichtingen, direct toegang.
          </p>
          <button
            onClick={() => handleCTAClick(pricingTiers[1])}
            className="bg-[#8BAE5A] hover:bg-[#B6C948] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            Start Gratis Trial
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
} 