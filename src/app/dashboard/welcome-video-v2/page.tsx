'use client';

import { useState, useEffect, useRef } from 'react';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useRouter } from 'next/navigation';
import { PlayIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function WelcomeVideoV2Page() {
  const { currentStep, completeStep, isLoading } = useOnboardingV2();
  const router = useRouter();
  const [videoWatched, setVideoWatched] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize video when component mounts
  useEffect(() => {
    if (videoRef.current) {
      console.log('🎥 Initializing video element');
      videoRef.current.load();
    }
  }, []);

  // Redirect if not on welcome video step
  useEffect(() => {
    if (!isLoading && currentStep !== 0) {
      if (currentStep === 1) {
        router.push('/dashboard/profiel');
      } else if (currentStep === 2) {
        router.push('/dashboard/mijn-challenges');
      } else if (currentStep === 3) {
        router.push('/dashboard/trainingsschemas');
      } else if (currentStep === 4) {
        router.push('/dashboard/voedingsplannen-v2');
      } else if (currentStep === 5) {
        router.push('/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden');
      } else {
        router.push('/dashboard');
      }
    }
  }, [currentStep, isLoading, router]);

  const handleVideoEnd = () => {
    setVideoWatched(true);
    setShowOverlay(false);
  };

  const handlePlay = () => {
    setShowOverlay(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleVideoLoad = () => {
    console.log('✅ Video loaded successfully');
    setVideoLoading(false);
    setVideoError(false);
  };

  const handleVideoError = (e: any) => {
    console.error('❌ Video loading error:', e);
    setVideoLoading(false);
    setVideoError(true);
  };

  const handleVideoCanPlay = () => {
    console.log('🎬 Video can play');
    setVideoLoading(false);
    setVideoReady(true);
  };

  const handleComplete = async () => {
    const success = await completeStep(0);
    if (success) {
      router.push('/dashboard/profiel');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-white">Laden...</p>
        </div>
      </div>
    );
  }

  if (currentStep !== 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Welkom bij Top Tier Men!</h1>
          <p className="text-xl text-gray-300 mb-2">
            Bekijk deze korte introductievideo om te leren hoe je het meeste uit het platform kunt halen.
          </p>
          <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <span className="text-yellow-400 text-2xl mr-2">⚠️</span>
              <span className="text-yellow-400 font-semibold">Belangrijke instructie</span>
            </div>
            <p className="text-yellow-200 text-sm">
              Je moet eerst de welkomstvideo volledig bekijken voordat je naar de volgende stap kunt gaan. 
              De knop wordt pas beschikbaar nadat de video is afgespeeld.
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-96 object-cover"
              onEnded={handleVideoEnd}
              onLoadedData={handleVideoLoad}
              onCanPlay={handleVideoCanPlay}
              onError={handleVideoError}
              preload="auto"
              controls={false}
              playsInline
            >
              <source src="/videos/welcome-video.mp4" type="video/mp4" />
              Je browser ondersteunt geen video element.
            </video>
            
            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                  <p className="text-white">Video laden...</p>
                </div>
              </div>
            )}
            
            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-center">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <p className="text-white mb-4">Video kon niet geladen worden</p>
                  <p className="text-gray-300 text-sm mb-4">Controleer of het bestand bestaat: /videos/welcome-video.mp4</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setVideoError(false);
                        setVideoLoading(true);
                        if (videoRef.current) {
                          videoRef.current.load();
                        }
                      }}
                      className="bg-[#8BAE5A] hover:bg-[#7A9E4A] text-white px-4 py-2 rounded-lg transition-colors mr-2"
                    >
                      Opnieuw proberen
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Pagina herladen
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {showOverlay && !videoLoading && !videoError && videoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <button
                  onClick={handlePlay}
                  className="bg-[#8BAE5A] hover:bg-[#7A9E4A] text-white p-6 rounded-full transition-colors shadow-lg"
                >
                  <PlayIcon className="w-12 h-12" />
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-white text-sm">Klik om video af te spelen</span>
              </div>
              <div className="text-white text-sm">
                0:00 / 1:00
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-[#8BAE5A] h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-[#8BAE5A] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.794a1 1 0 011.617.794zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="text-white hover:text-[#8BAE5A] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <button className="text-white hover:text-[#8BAE5A] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          {videoWatched ? (
            <button
              onClick={handleComplete}
              className="bg-[#8BAE5A] hover:bg-[#7A9E4A] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg flex items-center mx-auto"
            >
              <CheckIcon className="w-6 h-6 mr-2" />
              Volgende →
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-600 text-gray-400 px-8 py-4 rounded-lg font-semibold text-lg cursor-not-allowed"
            >
              Bekijk eerst de video
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
