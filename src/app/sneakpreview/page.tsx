'use client';

import { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/outline';

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
        '/welkom-v2.MP4',
        '/welkom.MP4',
        '/testgebruikers-v2.mp4'
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

export default function SneakPreviewPage() {
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
            {/* Exclusive Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-[#8BAE5A]/20 border border-[#8BAE5A]/30 rounded-full text-[#8BAE5A] text-sm font-medium mb-8">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Exclusieve Pre-Launch Preview
            </div>

            {/* Title */}
            <h1 className="sneakpreview-title">
              <span>SNEAK PREVIEW</span>
              <span className="block text-[#8BAE5A]">TOP TIER MEN</span>
            </h1>

            {/* Subtitle */}
            <p className="sneakpreview-subtitle">
              Je behoort tot een <span className="text-[#8BAE5A] font-semibold">selectieve groep</span> van pre-launch leden. 
              Krijg als eerste een exclusieve blik achter de schermen van het Top Tier Men platform.
            </p>

            {/* Video Section */}
            <div className="mb-16">
              <VideoPlayer 
                src="/welkom-v2.MP4"
                poster="/platform-preview.png"
              />
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
                Wat je in de video ziet
              </h2>
              <p className="text-lg text-[#D1D5DB] max-w-3xl mx-auto">
                Een complete kijk op alle platform functies die je helpen om je volledige potentieel te bereiken
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

            {/* Coming Soon */}
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#B6C948]/10 border border-[#8BAE5A]/20 rounded-2xl p-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Binnenkort Beschikbaar
              </h2>
              <p className="text-lg text-[#D1D5DB] mb-6">
                Het volledige Top Tier Men platform wordt gelanceerd op <span className="text-[#8BAE5A] font-semibold">10 september 2025</span>
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white rounded-lg font-medium">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Je staat op de VIP lijst
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
            © 2025 Top Tier Men. Exclusieve toegang voor pre-launch leden.
          </p>
        </div>
      </footer>
    </div>
  );
}