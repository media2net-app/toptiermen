'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PlatformLanceringPage() {
  const [isLaunching, setIsLaunching] = useState(false);
  const router = useRouter();

  const handleLaunch = async () => {
    setIsLaunching(true);
    
    // Test notificatie
    toast.success('🚀 Platform wordt gelanceerd! Welkom bij Top Tier Men!', {
      duration: 3000,
      position: 'top-center',
    });

    // Simuleer een korte delay voor de lancering
    setTimeout(() => {
      // Redirect naar het dashboard
      router.push('/dashboard');
    }, 2000);
  };

  return (
    <div className="sneakpreview-page min-h-screen">
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
      <section className="sneakpreview-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full text-center">
          <div className="max-w-6xl mx-auto">
            {/* Launch Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-[#8BAE5A]/20 border border-[#8BAE5A]/30 rounded-full text-[#8BAE5A] text-sm font-medium mb-8">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              Officiële Lancering
            </div>

            {/* Title */}
            <h1 className="sneakpreview-title">
              <span>PLATFORM</span>
              <span className="block text-[#8BAE5A]">GELANCEERD</span>
            </h1>

            {/* Subtitle */}
            <p className="sneakpreview-subtitle">
              Het moment is daar! Het <span className="text-[#8BAE5A] font-semibold">Top Tier Men platform</span> is nu live. 
              Klik op de knop hieronder om je reis naar het volgende niveau te beginnen.
            </p>

            {/* Launch Button */}
            <div className="mb-16">
              <button
                onClick={handleLaunch}
                disabled={isLaunching}
                className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-2xl shadow-2xl hover:shadow-[#8BAE5A]/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLaunching ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Lanceren...
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 mr-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    START JE REIS
                    <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Overview */}
      <section className="sneakpreview-section py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Wat je nu kunt doen
              </h2>
              <p className="text-lg text-[#D1D5DB] max-w-3xl mx-auto">
                Alle platform functies zijn nu beschikbaar om je te helpen je volledige potentieel te bereiken
              </p>
            </div>

            {/* Main Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Academy</h3>
                <p className="text-[#D1D5DB] mb-4">Complete trainings voor persoonlijke ontwikkeling</p>
                <ul className="text-sm text-[#8BAE5A] space-y-1">
                  <li>• Video academy modules</li>
                  <li>• Expert interviews</li>
                  <li>• E-books en guides</li>
                  <li>• Case studies</li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Voedingsplannen</h3>
                <p className="text-[#D1D5DB] mb-4">Gepersonaliseerde voeding voor jouw doelen</p>
                <ul className="text-sm text-[#8BAE5A] space-y-1">
                  <li>• Persoonlijke plannen</li>
                  <li>• Macro berekeningen</li>
                  <li>• Recepten database</li>
                  <li>• Voortgang tracking</li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Fitness & Training</h3>
                <p className="text-[#D1D5DB] mb-4">Complete workout systemen</p>
                <ul className="text-sm text-[#8BAE5A] space-y-1">
                  <li>• Trainingsschema's</li>
                  <li>• Video oefeningen</li>
                  <li>• Workout logging</li>
                  <li>• Progressie tracking</li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Mindset & Focus</h3>
                <p className="text-[#D1D5DB] mb-4">Mentale kracht ontwikkeling</p>
                <ul className="text-sm text-[#8BAE5A] space-y-1">
                  <li>• Meditatie oefeningen</li>
                  <li>• Goal setting tools</li>
                  <li>• Habit building</li>
                  <li>• Productiviteit systemen</li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Brotherhood</h3>
                <p className="text-[#D1D5DB] mb-4">Exclusieve community</p>
                <ul className="text-sm text-[#8BAE5A] space-y-1">
                  <li>• Brotherhood forum</li>
                  <li>• Accountability groups</li>
                  <li>• Mentorship programma</li>
                  <li>• Networking events</li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Business & Finance</h3>
                <p className="text-[#D1D5DB] mb-4">Financiële groei strategieën</p>
                <ul className="text-sm text-[#8BAE5A] space-y-1">
                  <li>• Business coaching</li>
                  <li>• Investment strategieën</li>
                  <li>• Financiële planning</li>
                  <li>• Side hustle guides</li>
                </ul>
              </div>
            </div>

            {/* Gamification Section */}
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#B6C948]/10 border border-[#8BAE5A]/20 rounded-2xl p-8 mb-16">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  🎯 Gamification & Motivatie
                </h3>
                <p className="text-[#D1D5DB]">
                  Blijf gemotiveerd met ons unieke achievement systeem
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Achievement Badges</h4>
                  <p className="text-sm text-[#D1D5DB]">Verdien badges door doelen te behalen</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Level System</h4>
                  <p className="text-sm text-[#D1D5DB]">Klim op in rang binnen de community</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎖️</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Daily Challenges</h4>
                  <p className="text-sm text-[#D1D5DB]">Dagelijkse uitdagingen voor groei</p>
                </div>
              </div>
            </div>

            {/* Platform Live */}
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#B6C948]/10 border border-[#8BAE5A]/20 rounded-2xl p-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Platform is Live! 🚀
              </h2>
              <p className="text-lg text-[#D1D5DB] mb-6">
                Het volledige Top Tier Men platform is nu beschikbaar. 
                <span className="text-[#8BAE5A] font-semibold">Klik op de knop hierboven om te beginnen!</span>
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white rounded-lg font-medium">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                Platform is actief
              </div>
            </div>
          </div>
        </div>
      </section>

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
            © 2025 Top Tier Men. Officieel gelanceerd platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
