'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './prelaunch.css';
import { 
  CheckCircleIcon,
  StarIcon,
  FireIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrophyIcon,
  ArrowRightIcon,
  PlayIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { trackEmailSignup } from '@/lib/facebook-pixel';

// Facebook SDK TypeScript declarations
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function PreLaunchPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [utmData, setUtmData] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: ''
  });

  const handleEmailFocus = () => {
    // Track when user focuses on email field
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: 'Email Input Field',
        content_category: 'Form Interaction'
      });
    }
  };

  // Initialize Facebook SDK and get UTM parameters
  useEffect(() => {
    // Get UTM parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_content: urlParams.get('utm_content') || '',
      utm_term: urlParams.get('utm_term') || ''
    };
    setUtmData(utmParams);

    // Log UTM data for debugging
    if (Object.values(utmParams).some(val => val)) {
      console.log('🎯 UTM Parameters detected:', utmParams);
    }

    // Load Facebook SDK
    const loadFacebookSDK = () => {
      if (window.FB) return; // Already loaded
      
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: '1063013326038261',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        
        window.FB.AppEvents.logPageView();
      };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        if (fjs.parentNode) {
          fjs.parentNode.insertBefore(js, fjs);
        }
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();
    
    // Track page view for prelaunch page with UTM data
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: 'Prelaunch Page',
        content_category: 'Landing Page',
        content_type: 'page',
        ...utmParams
      });
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const launchDate = new Date('2025-09-10T00:00:00').getTime();
    
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
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Vul je naam in');
      return;
    }
    if (!email) {
      setError('Vul je email adres in');
      return;
    }

    // Track form submission attempt
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: 'Email Signup Form',
        content_category: 'Form Submission'
      });
    }

    setIsSubmitting(true);
    setError('');
    setAlreadyExists(false);

    try {
      const response = await fetch('/api/prelaunch-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          email,
          utm_source: utmData.utm_source,
          utm_medium: utmData.utm_medium,
          utm_campaign: utmData.utm_campaign,
          utm_content: utmData.utm_content,
          utm_term: utmData.utm_term
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        // Track email signup with Facebook Pixel
        trackEmailSignup();
        
        // Additional tracking for better conversion optimization
        if (typeof window !== 'undefined' && window.fbq) {
          // Track the registration event with more details
          window.fbq('track', 'CompleteRegistration', {
            content_name: 'Prelaunch Email Signup',
            content_category: 'Lead Generation',
            value: 1.00,
            currency: 'EUR',
            content_type: 'form',
            status: 'success'
          });
          
          // Also track as a lead event
          window.fbq('track', 'Lead', {
            content_name: 'Prelaunch Waitlist',
            value: 1.00,
            currency: 'EUR'
          });
        }
      } else if (result.alreadyExists) {
        setAlreadyExists(true);
        setError(result.message);
      } else {
        setError(result.error || 'Er is iets misgegaan. Probeer het opnieuw.');
      }
    } catch (error) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: UserGroupIcon,
      title: "Brotherhood community",
      description: "Sluit je aan bij een exclusieve community van mannen die streven naar excellentie in alle aspecten van het leven."
    },
    {
      icon: ChartBarIcon,
      title: "Persoonlijke groei",
      description: "Stap-voor-stap programma's voor fitness, mindset, business en persoonlijke ontwikkeling."
    },
    {
      icon: TrophyIcon,
      title: "Achievement system",
      description: "Verdien badges en rangen door je doelen te behalen en jezelf te overtreffen."
    },
    {
      icon: FireIcon,
      title: "Daily challenges",
      description: "Dagelijkse uitdagingen die je motiveren om consistent te blijven en je grenzen te verleggen."
    }
  ];

  const benefits = [
    "Exclusieve toegang tot premium content",
    "Community van gelijkgestemde mannen",
    "Stap-voor-stap actieplannen",
    "Accountability partners",
    "Lifetime toegang tot alle updates"
  ];

  const platformFeatures = [
    {
      category: "Fitness & Training",
      features: [
        "Persoonlijke trainingsschema's",
        "Video-oefeningen en tutorials",
        "Voortgang tracking",
        "Voedingsplannen en recepten",
        "Workout logging"
      ]
    },
    {
      category: "Mindset & Focus",
      features: [
        "Meditatie en mindfulness oefeningen",
        "Productiviteit tools",
        "Goal setting en tracking",
        "Habit building system",
        "Stress management technieken"
      ]
    },
    {
      category: "Community & Networking",
      features: [
        "Brotherhood forum",
        "Event organisatie",
        "Mentorship programma",
        "Accountability groups",
        "Networking events"
      ]
    },
    {
      category: "Business & Finance",
      features: [
        "Business coaching content",
        "Financiële planning tools",
        "Investment strategieën",
        "Entrepreneurship guides",
        "Side hustle ideeën"
      ]
    },
    {
      category: "Gamification",
      features: [
        "Achievement badges",
        "Level system",
        "Daily challenges",
        "Leaderboards",
        "Reward system"
      ]
    },
    {
      category: "Content & Learning",
      features: [
        "Video academy",
        "E-books en guides",
        "Podcast episodes",
        "Expert interviews",
        "Case studies"
      ]
    }
  ];

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

      {/* Countdown Timer Section */}
      <section className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
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
          </motion.div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="prelaunch-hero relative py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full">
          <div className="w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4 sm:space-y-6 md:space-y-8"
            >
              <div>
                <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-[#8BAE5A]/10 border border-[#8BAE5A]/30 rounded-full text-[#8BAE5A] text-xs sm:text-sm font-medium mb-4 sm:mb-6 md:mb-8">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Lancering: 10 september 2025
                </div>
                
                <h1>
                  <span>MANNEN TERUG NAAR HUN</span>
                  <span className="block text-[#8BAE5A]">ESSENTIE</span>
                </h1>
                
                <div className="prelaunch-story-box">
                  <p>
                    In een maatschappij waar mannelijkheid vaak verkeerd wordt begrepen of zelfs onderdrukt, zie ik hoe zowel jonge als oudere mannen worstelen met hun identiteit en doel. Wat ik vooral heb gemerkt, is dat de laatste jaren de mentaliteit, vooral bij de jongere generatie, sterk verzwakt is en dat oudere mannen de weg terug naar hun essentie niet meer vinden. Doelstellingen worden niet meer behaald, passie en discipline lijken ver te zoeken.
                  </p>
                </div>

                <div className="prelaunch-feature-block">
                  <h3>WAT BETEKENT DIT VOOR <span className="text-[#8BAE5A]">JOU?</span></h3>
                  <p>
                    Het betekent dat je de regie terugpakt over je eigen kracht en focus. Door gerichte coaching en oefeningen kom je weer in contact met je authentieke zelf. Zo leg je een onbreekbare basis voor succes in werk, relaties én persoonlijke groei.
                  </p>
                </div>


              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mijn Verhaal Section */}
      <section className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <div className="prelaunch-story-image mb-8">
                  <img 
                    src="/prelaunch/rick.jpg" 
                    alt="Rick Cuijpers - Top Tier Men" 
                    className="w-full max-w-md mx-auto h-auto rounded-lg shadow-lg"
                  />
                </div>
                <h1>
                  <span>MIJN</span>
                  <span className="block">VERHAAL</span>
                </h1>
                <div className="prelaunch-story-box">
                  <p>
                    Mijn naam is Rick Cuijpers. Op mijn zeventiende werd ik marinier en op mijn achttiende werd ik uitgezonden naar Irak. 
                    In mijn acht jaar bij het Korps Mariniers volgden meerdere missies, waaronder naar Uruzgan en andere delen van Afghanistan. 
                    Ik doorstond zware trainingen in extreme omgevingen. Deze uitdagingen vormden mij tot de man die ik nu ben. 
                    Gedisciplineerd, gemotiveerd en vastberadenheid. Ik ga door waar anderen stoppen.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="prelaunch-story-image">
                <img 
                  src="/leger-blur.jpg" 
                  alt="Rick Cuijpers - Korps Mariniers" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Word De Beste Versie Van Jezelf Section */}
      <section className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h1>
              <span>WORD DE BESTE VERSIE VAN</span>
              <span className="block">JEZELF</span>
            </h1>
            
            <p>
              Sluit je aan bij de exclusieve <strong>Top Tier Men</strong> community. 
              Een platform waar mannen samen groeien, excelleren en hun volledige potentieel bereiken.
            </p>

            {/* CTA Button */}
            <div className="mb-6 sm:mb-8 md:mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="prelaunch-btn-primary inline-flex items-center"
                onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <StarIcon className="w-6 h-6 mr-2" />
                Schrijf je in voor de wachtlijst
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Kracht Begint Section */}
      <section className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h1>
                  <span className="text-[#8BAE5A]">KRACHT BEGINT</span>
                  <span className="block text-white">WAAR TWIJFELS</span>
                  <span className="block text-white">STOPPEN</span>
                </h1>
                <div className="prelaunch-story-box">
                  <p>
                    Fysiek sterker, mentaal onbreekbaar en financieel onafhankelijk. 
                    Met mijn mariniersdiscipline word jij een Top Tier Men.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="prelaunch-story-image">
                <img 
                  src="/rick-01.jpg" 
                  alt="Rick Cuijpers - Kracht en Discipline" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Waarom Top Tier Men Section */}
      <section className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20 relative overflow-hidden">
        {/* Background pattern */}
        <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
        
        <div className="w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="prelaunch-story-image">
                <img 
                  src="/prelaunch/waaromtoptier.jpg" 
                  alt="Waarom Top Tier Men" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              
              <h2>
                <span>WAAROM TOP TIER</span>
                <span className="block">MEN?</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="prelaunch-story-box">
                <p>
                  Top Tier Men is ontstaan uit mijn eigen zoektocht naar echte groei in kracht, focus en financiële onafhankelijkheid. 
                  Ik zette mijn persoonlijke ervaringen om in een gestructureerd plan met krachtige workouts, mentale routines en slimme investeringsstappen. 
                  Zo begeleid ik jou, geworteld in bewijs, versterkt door een hechte community naar jouw Top Tier-versie.
                </p>
              </div>
              
              <div className="prelaunch-feature-block">
                <h3>VOLLEDIGE FOCUS</h3>
                <p>Jouw gepersonaliseerde blueprint voor body, mind en financiën. Geen ruis, geen gedoe.</p>
              </div>
              
              <div className="prelaunch-feature-block">
                <h3>MEETBARE VOORUITGANG</h3>
                <p>Heldere doelstellingen én inzicht in elke stap. Volg je groei met concrete milestones.</p>
              </div>
              
              <div className="prelaunch-feature-block">
                <h3>COMMUNITY GELEID DOOR AMBITIE</h3>
                <p>Mannen met dezelfde drive, die elkaar scherp houden, eerlijk feedback geven en samen successen vieren.</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="prelaunch-btn-primary inline-flex items-center"
                onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <ArrowRightIcon className="w-5 h-5 mr-2" />
                Start jouw TopTier-reis
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2>
              <span>WAT IS TOP TIER</span>
              <span className="block">MEN?</span>
            </h2>
            <p>
              Een revolutionair platform dat mannen helpt om hun volledige potentieel te bereiken 
              door middel van community, coaching en systematische groei.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 sm:w-12 sm:h-12 text-[#8BAE5A] mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2>
              <span>WAT KUN JE</span>
              <span className="block">VERWACHTEN?</span>
            </h2>
            <p>
              Een complete transformatie van je leven met bewezen methoden en een ondersteunende community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="space-y-6 sm:space-y-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center space-x-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <CheckCircleIcon className="w-8 h-8 text-[#8BAE5A] flex-shrink-0" />
                  <span className="text-xl text-white font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2>
              <span>ALLE PLATFORM</span>
              <span className="block">FUNCTIES</span>
            </h2>
            <p>
              Ontdek alle tools en functies die je helpen om je volledige potentieel te bereiken.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-[#8BAE5A] mb-4 border-b border-[#8BAE5A]/30 pb-2">
                  {category.category}
                </h3>
                <ul className="space-y-3">
                  {category.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: (categoryIndex * 0.1) + (featureIndex * 0.05) }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-[#8BAE5A] rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="signup" className="prelaunch-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
                          <div className="inline-flex items-center px-4 py-2 bg-[#8BAE5A]/20 border border-[#8BAE5A]/30 rounded-full text-[#8BAE5A] text-sm font-medium mb-8">
              <FireIcon className="w-4 h-4 mr-2" />
              Exclusieve wachtlijst
            </div>

            <h2>
              <span>WEES ER BIJ VANAF</span>
              <span className="block">DAG 1</span>
            </h2>
            
            <p>
              Door je te registreren kom je op de wachtlijst te staan voor de lancering op 10 september 2025. 
              Je zit nergens aan vast en kunt je altijd uitschrijven. In de dagen voor de lancering ontvang je meer informatie over het platform en een exclusief aanbod voor de eerste 100 mannen die Top Tier Men joinen.
            </p>

            {!isSubmitted ? (
              <motion.form
                onSubmit={handleSubmit}
                className="max-w-md mx-auto space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-center mb-4">
                  <p className="text-sm font-bold text-gray-300">
                    <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                    Geen verplichting - je kunt je altijd uitschrijven
                  </p>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Vul je naam in"
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={handleEmailFocus}
                    placeholder="Vul je email adres in"
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
                    required
                  />
                  {error && (
                    <div className={`mt-2 p-3 rounded-lg flex items-center space-x-2 ${
                      alreadyExists 
                        ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' 
                        : 'bg-red-500/20 border border-red-500/50 text-red-400'
                    }`}>
                      {alreadyExists ? (
                        <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verwerken...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <ShieldCheckIcon className="w-5 h-5 mr-2" />
                      Schrijf je in voor de wachtlijst
                    </div>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#8BAE5A]/20 border border-[#8BAE5A]/30 rounded-xl p-8"
              >
                <CheckCircleIcon className="w-16 h-16 text-[#8BAE5A] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Je bent ingeschreven!</h3>
                <p className="text-gray-300">
                  Bedankt voor je interesse! Je staat nu op de wachtlijst en zit nergens aan vast. 
                  Je ontvangt in de dagen voor de lancering meer informatie over het platform en een exclusief aanbod voor de eerste 100 mannen die Top Tier Men joinen.
                </p>
              </motion.div>
            )}

            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                Veilig & Privé
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                Geen Spam
              </div>
              <div className="flex items-center">
                <StarIcon className="w-4 h-4 mr-2" />
                Eerste Gebruikers
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-20 border-t border-white/10">
        <div className="w-full text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/logo_white-full.svg" 
              alt="Top Tier Men Logo" 
              className="h-8 sm:h-10 w-auto"
            />
          </div>
          <p className="text-gray-400">
            © 2025 Top Tier Men. Alle rechten voorbehouden.
          </p>
        </div>
      </footer>
    </div>
  );
}
