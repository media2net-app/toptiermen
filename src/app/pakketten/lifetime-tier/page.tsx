'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaArrowRight, FaUsers, FaDumbbell, FaBrain, FaChartLine, FaCrown, FaStar, FaGift, FaBook, FaTools, FaComments, FaBullseye, FaTrophy, FaBookOpen, FaUtensils, FaDumbbell as FaDumbbellIcon, FaInfinity, FaClock } from 'react-icons/fa';
import { PlayIcon } from '@heroicons/react/24/outline';
import CheckoutSection from '@/components/CheckoutSection';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);

  const handlePlay = () => {
    setIsLoading(true);
    setIsPlaying(true);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    
    console.error('Video error:', {
      code: error?.code,
      message: error?.message,
      src: currentSrc,
      retryCount
    });
    
    if (retryCount < 2) {
      // Try alternative video sources
      const alternatives = [
        '/platform-preview.mp4',
        '/welkom-v2.MP4',
        '/welkom.MP4'
      ];
      
      const nextSrc = alternatives[retryCount + 1];
      if (nextSrc) {
        console.log('Trying alternative video:', nextSrc);
        setCurrentSrc(nextSrc);
        setRetryCount(prev => prev + 1);
        setIsLoading(false);
        return;
      }
    }
    
    setHasError(true);
    setIsLoading(false);
    setIsPlaying(false);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Video niet beschikbaar</h3>
          <p className="text-[#D1D5DB] mb-4">
            Er is een probleem met het laden van de video. Probeer de pagina te verversen.
          </p>
          <button 
            onClick={() => {
              setHasError(false);
              setIsLoading(false);
              setIsPlaying(false);
              setRetryCount(0);
              setCurrentSrc(src);
            }}
            className="px-6 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      {!isPlaying && (
        <div className="relative cursor-pointer" onClick={handlePlay}>
          <img 
            src={poster} 
            alt="Video Preview" 
            className="w-full h-auto rounded-xl shadow-2xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/video-placeholder.svg';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-xl group-hover:bg-opacity-40 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <PlayIcon className="w-8 h-8 text-white ml-1" />
              )}
            </div>
          </div>
        </div>
      )}
      
      {isPlaying && (
        <video
          controls
          autoPlay
          playsInline
          muted
          className="w-full h-auto rounded-xl shadow-2xl"
          poster={poster}
          preload="metadata"
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoLoad}
        >
          <source src={currentSrc} type="video/mp4" />
          Je browser ondersteunt het video element niet.
        </video>
      )}
    </div>
  );
}

export default function LifetimeTierPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Format price with comma as decimal separator
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace('.', ',');
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown timer effect
  useEffect(() => {
    const launchDate = new Date('2025-09-10T20:00:00').getTime(); // 10 september 20:00
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        // Timer expired - platform is live
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToCheckout = () => {
    document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const packageData = {
    id: 'lifetime',
    name: 'Lifetime Tier',
    description: 'Lifetime toegang tot alle content',
    originalMonthlyPrice: 1995, // Originele eenmalige betaling
    originalYearlyPrice: 1995, // Originele eenmalige betaling
    monthlyPrice: 1995, // Prijs na normale prijzen voor weergave (€1995 * 0.5)
    yearlyPrice: 1995, // Prijs na normale prijzen voor weergave (€1995 * 0.5)
    features: [
      'Alles uit Premium',
      'Levenslang'
    ],
    badge: 'Best Value'
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
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A2313] to-[#232D1A]">
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

      {/* Countdown Timer Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-[#8BAE5A]/20 border border-[#8BAE5A]/30 rounded-full text-[#8BAE5A] text-sm font-medium mb-6">
              <FaClock className="w-4 h-4 mr-2" />
              🔥PRELAUNCH ACTIE⚡
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 text-white leading-tight">
              Platform Launch <span className="text-[#8BAE5A]">10 September</span>
            </h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
              <div className="bg-[#181F17] rounded-xl p-2 sm:p-3 border border-[#3A4D23]">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#B6C948]">{timeLeft.days}</div>
                <div className="text-xs sm:text-sm text-[#8BAE5A] uppercase tracking-wide">Dagen</div>
              </div>
              <div className="bg-[#181F17] rounded-xl p-2 sm:p-3 border border-[#3A4D23]">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#B6C948]">{timeLeft.hours}</div>
                <div className="text-xs sm:text-sm text-[#8BAE5A] uppercase tracking-wide">Uren</div>
              </div>
              <div className="bg-[#181F17] rounded-xl p-2 sm:p-3 border border-[#3A4D23]">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#B6C948]">{timeLeft.minutes}</div>
                <div className="text-xs sm:text-sm text-[#8BAE5A] uppercase tracking-wide">Minuten</div>
              </div>
              <div className="bg-[#181F17] rounded-xl p-2 sm:p-3 border border-[#3A4D23]">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#B6C948]">{timeLeft.seconds}</div>
                <div className="text-xs sm:text-sm text-[#8BAE5A] uppercase tracking-wide">Seconden</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#B6C948]/10 border border-[#8BAE5A]/20 rounded-xl p-6 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                NORMALE PRIJZEN - Beperkte tijd!
              </h2>
              <p className="text-[#8BAE5A] font-medium">
                Exclusieve prelaunch aanbieding
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full text-center">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-[#8BAE5A]/20 border border-[#8BAE5A]/30 rounded-full text-[#8BAE5A] text-sm font-medium mb-8">
              <FaStar className="w-4 h-4 mr-2" />
              {packageData.badge || 'Premium'}
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white">
                <span className="block truncate">{packageData.name.toUpperCase()}</span>
                <div className="flex items-center justify-center space-x-3 mt-2">
                  <span className="text-gray-400 line-through text-lg sm:text-xl md:text-2xl lg:text-3xl">
                    €{formatPrice(packageData.originalMonthlyPrice)}
                  </span>
                  <span className="text-[#8BAE5A] text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                    €{formatPrice(packageData.monthlyPrice)}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-medium">
                    🔥 NORMALE PRIJZEN
                  </span>
                </div>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[#D1D5DB] mb-8 max-w-3xl mx-auto px-4">
              {packageData.description}
            </p>

            {/* Select Package Button */}
            <button
              onClick={scrollToCheckout}
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white rounded-lg font-semibold text-base sm:text-lg hover:opacity-90 transition-all duration-300 touch-manipulation"
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

            {/* Sneak Preview Video */}
            <div className="bg-gradient-to-r from-[#181F17] to-[#1A1F2E] border border-[#3A4D23] rounded-xl p-6 mb-16">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 text-center">
                🎬 Sneak Preview - Wat krijg je?
              </h3>
              <VideoPlayer 
                src="/platform-preview.mp4"
                poster="/platform-preview.png"
              />
              <div className="mt-4 text-center">
                <p className="text-[#8BAE5A] text-sm">
                  Bekijk wat je krijgt met je Top Tier Men lidmaatschap
                </p>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#B6C948]/10 border border-[#8BAE5A]/20 rounded-2xl p-8 text-center mb-16">
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-4 mb-2">
                  <span className="text-lg text-gray-400 line-through">
                    €{formatPrice(packageData.originalMonthlyPrice)}
                  </span>
                  <span className="text-2xl font-bold text-white">
                    €{formatPrice(packageData.monthlyPrice)} eenmalig
                  </span>
                </div>
                <div className="inline-flex items-center px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-medium">
                  🔥 NORMALE PRIJZEN
                </div>
              </div>
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
        originalMonthlyPrice={packageData.originalMonthlyPrice}
        originalYearlyPrice={packageData.originalYearlyPrice}
        features={packageData.features}
        onPackageChange={() => {}} // No package change for lifetime only
        availablePackages={[packageData]}
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